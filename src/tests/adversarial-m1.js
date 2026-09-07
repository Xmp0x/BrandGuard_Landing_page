/**
 * ============================================================================
 * BrandGuard Landing Page V2 — Milestone 1 Adversarial Stress Test Harness
 * Author: m1_challenger_1_2 (Empirical Challenger)
 * ============================================================================
 * Objectives:
 * 1. Responsive boundaries (320px, 768px, 1024px, 1440px):
 *    - Verify horizontal scrollWidth <= clientWidth (no horizontal overflow).
 *    - Identify exact overflowing DOM elements if any overflow occurs.
 *    - Verify hamburger menu appearance and open/close interaction on <= 768px.
 *    - Verify hamburger menu hidden on >= 1024px.
 * 2. Theme toggle stress:
 *    - Single click behavior in live browser (detecting duplicate listeners).
 *    - Rapid clicking (100 toggles in 100ms) to ensure state synchronization.
 *    - LocalStorage QuotaExceededError & SecurityError injection resilience.
 * 3. Runner verification:
 *    - Execute node tests/runner.js --milestone=M1.
 * ============================================================================
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const { JSDOM } = require('jsdom');

const SRC_DIR = path.resolve(__dirname, '..');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 54321;
const CDP_PORT = 9224;

// Simple static server
function createServer() {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.woff2': 'font/woff2',
  };

  return http.createServer((req, res) => {
    let cleanUrl = req.url.split('?')[0];
    if (cleanUrl === '/') cleanUrl = '/index.html';
    const filePath = path.join(SRC_DIR, cleanUrl);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('404 Not Found');
    }
  });
}

// Minimal CDP WebSocket Client using Node 24 native WebSocket
class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.pending = new Map();
    this.eventListeners = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) {
            reject(new Error(msg.error.message || JSON.stringify(msg.error)));
          } else {
            resolve(msg.result);
          }
        }
        if (msg.method && this.eventListeners.has(msg.method)) {
          const listeners = this.eventListeners.get(msg.method);
          listeners.forEach((fn) => fn(msg.params));
        }
      };
    });
  }

  on(event, fn) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(fn);
  }

  send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result ? res.result.value : undefined;
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Sleep helper
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runAdversarialSuite() {
  console.log('================================================================');
  console.log(' BrandGuard M1 Empirical Adversarial Stress Test Suite');
  console.log('================================================================\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: [],
  };

  function logPass(name, detail = '') {
    results.passed++;
    results.tests.push({ name, status: 'PASS', detail });
    console.log(`  [PASS] ${name}${detail ? ` -> ${detail}` : ''}`);
  }

  function logFail(name, reason) {
    results.failed++;
    results.tests.push({ name, status: 'FAIL', reason });
    console.log(`  [FAIL] ${name} -> ${reason}`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 1: JSDOM STRESS TESTS (RAPID CLICKING & STORAGE ERROR SIMULATION)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('--- PHASE 1: JSDOM THEME STRESS & ERROR INJECTION ---');

  // Test 1.1: Rapid clicking (100 toggles in 100ms) with inline script only
  try {
    const htmlContent = fs.readFileSync(path.join(SRC_DIR, 'index.html'), 'utf8');
    const dom = new JSDOM(htmlContent, {
      url: 'http://localhost/',
      runScripts: 'dangerously',
    });
    const { window } = dom;
    const { document } = window;
    const btn = document.querySelector('#theme-toggle');

    const startTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const numClicks = 100;
    const startTime = Date.now();

    for (let i = 0; i < numClicks; i++) {
      btn.click();
    }
    const duration = Date.now() - startTime;

    const finalTheme = document.documentElement.getAttribute('data-theme');
    const finalStored = window.localStorage.getItem('brandguard-theme');
    const ariaPressed = btn.getAttribute('aria-pressed');

    // 100 clicks is even, so finalTheme should match startTheme
    if (finalTheme === startTheme && finalStored === startTheme) {
      logPass(
        'Theme Toggle: Rapid clicking (100 toggles) maintains parity and state consistency',
        `Executed in ${duration}ms, theme: ${finalTheme}, stored: ${finalStored}`
      );
    } else {
      logFail(
        'Theme Toggle: Rapid clicking (100 toggles) desynchronized state',
        `Expected ${startTheme}, got data-theme="${finalTheme}", stored="${finalStored}"`
      );
    }

    // Verify aria-pressed sync
    const expectedPressed = finalTheme === 'dark' ? 'false' : 'true';
    if (ariaPressed === expectedPressed) {
      logPass('Theme Toggle: Rapid clicking preserves aria-pressed parity', `aria-pressed="${ariaPressed}"`);
    } else {
      logFail('Theme Toggle: aria-pressed desynchronized', `Expected "${expectedPressed}", got "${ariaPressed}"`);
    }
  } catch (err) {
    logFail('Theme Toggle: Rapid clicking crashed', err.message);
  }

  // Test 1.2: LocalStorage QuotaExceededError handling
  try {
    const htmlContent = fs.readFileSync(path.join(SRC_DIR, 'index.html'), 'utf8');
    const dom = new JSDOM(htmlContent, {
      url: 'http://localhost/',
      runScripts: 'dangerously',
    });
    const { window } = dom;
    const { document } = window;

    // Override setItem to throw QuotaExceededError
    window.localStorage.setItem = () => {
      const err = new Error('The quota has been exceeded.');
      err.name = 'QuotaExceededError';
      throw err;
    };

    const btn = document.querySelector('#theme-toggle');
    const initialTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const expectedTheme = initialTheme === 'dark' ? 'light' : 'dark';

    let threw = false;
    try {
      btn.click();
    } catch (e) {
      threw = true;
    }

    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (!threw && currentTheme === expectedTheme) {
      logPass(
        'Theme Toggle: QuotaExceededError handled gracefully',
        `DOM updated to "${currentTheme}" without throwing`
      );
    } else {
      logFail(
        'Theme Toggle: QuotaExceededError failed',
        `threw=${threw}, data-theme="${currentTheme}" (expected "${expectedTheme}")`
      );
    }
  } catch (err) {
    logFail('Theme Toggle: QuotaExceededError test crashed', err.message);
  }

  // Test 1.3: LocalStorage SecurityError handling (restricted iframe / disabled cookies)
  try {
    const htmlContent = fs.readFileSync(path.join(SRC_DIR, 'index.html'), 'utf8');
    const dom = new JSDOM(htmlContent, {
      url: 'http://localhost/',
      runScripts: 'dangerously',
    });
    const { window } = dom;
    const { document } = window;

    // Override setItem to throw SecurityError
    window.localStorage.setItem = () => {
      const err = new Error('The operation is insecure.');
      err.name = 'SecurityError';
      throw err;
    };

    const btn = document.querySelector('#theme-toggle');
    const initialTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const expectedTheme = initialTheme === 'dark' ? 'light' : 'dark';

    let threw = false;
    try {
      btn.click();
    } catch (e) {
      threw = true;
    }

    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (!threw && currentTheme === expectedTheme) {
      logPass(
        'Theme Toggle: SecurityError handled gracefully on write',
        `DOM updated to "${currentTheme}" without throwing`
      );
    } else {
      logFail(
        'Theme Toggle: SecurityError write test failed',
        `threw=${threw}, data-theme="${currentTheme}"`
      );
    }
  } catch (err) {
    logFail('Theme Toggle: SecurityError write test crashed', err.message);
  }

  // Test 1.4: LocalStorage SecurityError on read (initial load)
  try {
    const htmlContent = fs.readFileSync(path.join(SRC_DIR, 'index.html'), 'utf8');
    const dom = new JSDOM(htmlContent, {
      url: 'http://localhost/',
      beforeParse(win) {
        Object.defineProperty(win, 'localStorage', {
          get() {
            return {
              getItem() {
                const err = new Error('Access denied');
                err.name = 'SecurityError';
                throw err;
              },
              setItem() {
                const err = new Error('Access denied');
                err.name = 'SecurityError';
                throw err;
              },
            };
          },
        });
      },
      runScripts: 'dangerously',
    });

    const theme = dom.window.document.documentElement.getAttribute('data-theme');
    if (theme === 'dark' || theme === 'light') {
      logPass(
        'Anti-FOUC Engine: SecurityError on storage read falls back to default safely',
        `Default data-theme="${theme}"`
      );
    } else {
      logFail('Anti-FOUC Engine: SecurityError fallback failed', `data-theme is "${theme}"`);
    }
  } catch (err) {
    logFail('Anti-FOUC Engine: SecurityError read crashed', err.message);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 2: REAL HEADLESS CHROME EMPIRICAL VERIFICATION
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- PHASE 2: REAL HEADLESS CHROME EMPIRICAL TESTING ---');

  const server = createServer();
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`  [Server] Static server running on http://127.0.0.1:${PORT}`);

  const targetUrl = `http://127.0.0.1:${PORT}/index.html`;

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--hide-scrollbars',
    targetUrl,
  ]);

  await sleep(1500);

  let cdp = null;
  try {
    const versionRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const tabs = await versionRes.json();
    const pageTab = tabs.find((t) => t.type === 'page') || tabs[0];
    console.log(`  [Chrome] Target tab: ${pageTab.title} (${pageTab.url})`);

    const wsUrl = pageTab.webSocketDebuggerUrl;
    cdp = new CDPClient(wsUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');
    await cdp.send('CSS.enable');

    // Wait for document to be ready
    let isReady = false;
    for (let i = 0; i < 20; i++) {
      const readyState = await cdp.evaluate('document.readyState');
      const hasNav = await cdp.evaluate('!!document.querySelector("#site-nav")');
      console.log(`    [Chrome Poll ${i}] readyState:`, readyState, 'hasNav:', hasNav);
      if ((readyState === 'interactive' || readyState === 'complete') && hasNav) {
        isReady = true;
        break;
      }
      await sleep(300);
    }

    if (!isReady) {
      throw new Error('Page failed to reach readyState interactive/complete with #site-nav in Chrome');
    }

    console.log('  [Chrome] Page loaded and interactive.');
    await sleep(500); // Allow Lenis and any async ES modules to settle

    // ────────────────────────────────────────────────────────────────────────
    // TEST 2.1: LIVE THEME TOGGLE CLICK IN REAL BROWSER (DUPLICATE LISTENER INVESTIGATION)
    // ────────────────────────────────────────────────────────────────────────
    const themeBeforeClick = await cdp.evaluate(`document.documentElement.getAttribute('data-theme')`);
    console.log(`  [Chrome Theme Test] Theme before click: "${themeBeforeClick}"`);

    // Click theme toggle button once in real browser
    await cdp.evaluate(`document.querySelector('#theme-toggle').click()`);
    await sleep(150);

    const themeAfterClick = await cdp.evaluate(`document.documentElement.getAttribute('data-theme')`);
    console.log(`  [Chrome Theme Test] Theme after 1 click: "${themeAfterClick}"`);

    const expectedToggleTheme = themeBeforeClick === 'dark' ? 'light' : 'dark';
    if (themeAfterClick === expectedToggleTheme) {
      logPass(
        'Chrome Live: Single theme toggle click changes theme successfully',
        `"${themeBeforeClick}" -> "${themeAfterClick}"`
      );
    } else {
      logFail(
        'Chrome Live: Single theme toggle click failed to change theme (DUPLICATE LISTENER BUG)',
        `Theme started as "${themeBeforeClick}" and remained "${themeAfterClick}" after click because duplicate listeners in inline head script and theme-toggle.js both executed and cancelled each other out!`
      );
    }

    // ────────────────────────────────────────────────────────────────────────
    // TEST 2.2: RESPONSIVE BOUNDARIES (320px, 768px, 1024px, 1440px)
    // ────────────────────────────────────────────────────────────────────────
    const viewports = [
      { width: 320, height: 600, label: '320px (Mobile Compact)' },
      { width: 768, height: 1024, label: '768px (Tablet Portrait / Mobile Max)' },
      { width: 1024, height: 768, label: '1024px (Tablet Landscape / Desktop)' },
      { width: 1440, height: 900, label: '1440px (Wide Desktop)' },
    ];

    for (const vp of viewports) {
      // Set device metrics
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.width <= 768,
      });
      await sleep(400); // Wait for CSS reflow and media queries

      // Check horizontal overflow: scrollWidth <= clientWidth
      const overflowInfo = await cdp.evaluate(`
        (() => {
          const scrollWidth = document.documentElement.scrollWidth;
          const clientWidth = document.documentElement.clientWidth;
          const bodyScrollWidth = document.body.scrollWidth;
          const overflowingElements = [];

          if (scrollWidth > clientWidth) {
            const all = document.querySelectorAll('*');
            for (const el of all) {
              const rect = el.getBoundingClientRect();
              if (rect.right > clientWidth + 1) {
                overflowingElements.push({
                  tag: el.tagName.toLowerCase(),
                  id: el.id || null,
                  className: el.className ? String(el.className) : null,
                  right: Math.round(rect.right),
                  width: Math.round(rect.width),
                  clientWidth: clientWidth
                });
              }
            }
          }

          return {
            scrollWidth,
            clientWidth,
            bodyScrollWidth,
            hasOverflow: scrollWidth > clientWidth,
            overflowingElements: overflowingElements.slice(0, 5)
          };
        })()
      `);

      if (!overflowInfo.hasOverflow) {
        logPass(
          `Responsive Boundary [${vp.label}]: No horizontal overflow`,
          `scrollWidth (${overflowInfo.scrollWidth}px) <= clientWidth (${overflowInfo.clientWidth}px)`
        );
      } else {
        logFail(
          `Responsive Boundary [${vp.label}]: Horizontal overflow detected!`,
          `scrollWidth (${overflowInfo.scrollWidth}px) > clientWidth (${overflowInfo.clientWidth}px). Overflowing: ${JSON.stringify(overflowInfo.overflowingElements)}`
        );
      }

      // Check Navigation & Hamburger Menu Visibility
      const navInfo = await cdp.evaluate(`
        (() => {
          const toggleBtn = document.querySelector('#mobile-nav-toggle');
          const desktopLinks = document.querySelector('.nav-links');
          const mobileMenu = document.querySelector('#mobile-nav-menu');

          const btnStyle = toggleBtn ? window.getComputedStyle(toggleBtn) : null;
          const linksStyle = desktopLinks ? window.getComputedStyle(desktopLinks) : null;

          return {
            hasToggleBtn: !!toggleBtn,
            toggleDisplay: btnStyle ? btnStyle.display : 'none',
            toggleVisible: btnStyle ? btnStyle.display !== 'none' && btnStyle.visibility !== 'hidden' : false,
            desktopLinksVisible: linksStyle ? linksStyle.display !== 'none' : false,
            menuOpen: mobileMenu ? mobileMenu.classList.contains('is-open') : false,
            menuAriaHidden: mobileMenu ? mobileMenu.getAttribute('aria-hidden') : null
          };
        })()
      `);

      if (vp.width <= 768) {
        // Hamburger toggle must be visible on <= 768px
        if (navInfo.toggleVisible) {
          logPass(
            `Navigation [${vp.label}]: Hamburger menu button appears on <= 768px`,
            `display: ${navInfo.toggleDisplay}`
          );
        } else {
          logFail(
            `Navigation [${vp.label}]: Hamburger menu button is missing or hidden`,
            `display: ${navInfo.toggleDisplay}`
          );
        }

        // Desktop nav links should be hidden on <= 768px
        if (!navInfo.desktopLinksVisible) {
          logPass(`Navigation [${vp.label}]: Desktop nav links hidden on <= 768px`);
        } else {
          logFail(`Navigation [${vp.label}]: Desktop nav links still visible on <= 768px`);
        }

        // Test Hamburger Menu Interactivity
        const clickResult = await cdp.evaluate(`
          (() => {
            const toggle = document.querySelector('#mobile-nav-toggle');
            const menu = document.querySelector('#mobile-nav-menu');
            if (!toggle || !menu) return { error: 'elements missing' };

            // Click to open
            toggle.click();
            const openClasses = menu.className;
            const openAria = toggle.getAttribute('aria-expanded');
            const openHidden = menu.getAttribute('aria-hidden');

            // Click to close
            toggle.click();
            const closeClasses = menu.className;
            const closeAria = toggle.getAttribute('aria-expanded');
            const closeHidden = menu.getAttribute('aria-hidden');

            return {
              opened: openClasses.includes('is-open') && openAria === 'true' && openHidden === 'false',
              closed: !closeClasses.includes('is-open') && closeAria === 'false' && closeHidden === 'true',
              openAria,
              openHidden,
              closeAria,
              closeHidden
            };
          })()
        `);

        if (clickResult.opened && clickResult.closed) {
          logPass(
            `Navigation [${vp.label}]: Hamburger menu opens and closes on click`,
            `open: aria-expanded="${clickResult.openAria}", close: aria-expanded="${clickResult.closeAria}"`
          );
        } else {
          logFail(
            `Navigation [${vp.label}]: Hamburger menu interaction failed`,
            JSON.stringify(clickResult)
          );
        }
      } else {
        // >= 1024px: Hamburger toggle must be hidden, desktop links must be visible
        if (!navInfo.toggleVisible) {
          logPass(`Navigation [${vp.label}]: Hamburger menu button hidden on >= 1024px`);
        } else {
          logFail(
            `Navigation [${vp.label}]: Hamburger menu button visible on >= 1024px`,
            `display: ${navInfo.toggleDisplay}`
          );
        }

        if (navInfo.desktopLinksVisible) {
          logPass(`Navigation [${vp.label}]: Desktop nav links visible on >= 1024px`);
        } else {
          logFail(`Navigation [${vp.label}]: Desktop nav links hidden on >= 1024px`);
        }
      }
    }
  } catch (err) {
    logFail('Chrome CDP Execution error', err.stack || err.message);
  } finally {
    if (cdp) cdp.close();
    chromeProc.kill();
    server.close();
    console.log('  [Teardown] Chrome and static server shut down successfully.');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 3: VERIFY ALL 10 M1 TESTS IN RUNNER
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- PHASE 3: M1 RUNNER SUITE VERIFICATION ---');
  let runnerPassed = false;
  let runnerOutput = '';
  try {
    runnerOutput = execSync('node tests/runner.js --milestone=M1', {
      cwd: SRC_DIR,
      encoding: 'utf8',
    });
    console.log(runnerOutput);
    runnerPassed = runnerOutput.includes('ALL 10 TESTS PASSED');
    if (runnerPassed) {
      logPass('Runner: All 10 M1 tests passed in node tests/runner.js --milestone=M1');
    } else {
      logFail('Runner: M1 tests failed or incomplete', runnerOutput);
    }
  } catch (err) {
    runnerOutput = err.stdout || err.message;
    console.error(runnerOutput);
    logFail('Runner: node tests/runner.js --milestone=M1 threw an error', runnerOutput);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // FINAL SUMMARY & VERDICT
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n================================================================');
  console.log(` Adversarial Stress Test Results: ${results.passed} PASS / ${results.failed} FAIL`);
  console.log('================================================================');

  const verdict = results.failed === 0 ? 'APPROVE' : 'REQUEST_CHANGES';
  console.log(`\nVERDICT: ${verdict}\n`);

  return {
    verdict,
    results,
    runnerOutput,
  };
}

if (require.main === module) {
  runAdversarialSuite()
    .then((res) => {
      process.exit(res.verdict === 'APPROVE' ? 0 : 1);
    })
    .catch((err) => {
      console.error('Fatal test runner error:', err);
      process.exit(1);
    });
}

module.exports = { runAdversarialSuite };
