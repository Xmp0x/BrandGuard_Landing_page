/**
 * BrandGuard Landing Page V2 — Milestone 1 Empirical Animation & Performance Challenge
 * File: tests/empirical-m1-animation-challenge.js
 *
 * Adversarially tests:
 * 1. Compositor-Only Animation Budget:
 *    - Validates that CSS keyframes (ctaIdlePulse, dotPulse/pulseDot/badgeDotPing, floatOrb*, chevronBounce)
 *      animate ONLY compositor properties ('transform', 'opacity').
 *    - Catches any repaint-inducing properties like 'box-shadow', 'filter', 'width', 'margin', etc.
 * 2. GSAP and Lenis Synchronization:
 *    - Validates that gsap-setup.js attaches Lenis to gsap.ticker via RAF loop.
 *    - Validates that gsap.ticker.lagSmoothing(0) is strictly called.
 *    - Validates RAF time unit scaling (seconds -> milliseconds).
 *    - Validates ScrollTrigger event bridging and runtime media query listener.
 * 3. Reduced Motion Overrides:
 *    - Validates prefers-reduced-motion: reduce sets transition-duration to 0.01ms / none in CSS.
 *    - Validates GSAP matchMedia sets all hero elements statically without animation.
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const SRC_DIR = path.resolve(__dirname, '..');
const CSS_DIR = path.join(SRC_DIR, 'css');
const JS_DIR = path.join(SRC_DIR, 'js');

// ANSI Colors
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
};

// Test results tracker
const testResults = [];

function recordTest(suite, name, passed, details = {}) {
  testResults.push({ suite, name, passed, details });
  const icon = passed ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
  console.log(`  ${icon} [${suite}] ${name}`);
  if (!passed && details.error) {
    console.log(`     ${colors.red}Error: ${details.error}${colors.reset}`);
  }
  if (details.info) {
    console.log(`     ${colors.dim}${details.info}${colors.reset}`);
  }
}

// Helper: load CSS content
function getAllCSS() {
  const files = ['tokens.css', 'base.css', 'layout.css', 'components.css', 'sections/nav.css', 'sections/hero.css'];
  let combined = '';
  const fileContents = {};
  for (const f of files) {
    const fullPath = path.join(CSS_DIR, f);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      combined += `\n/* --- ${f} --- */\n` + content;
      fileContents[f] = content;
    }
  }
  return { combined, fileContents };
}

/**
 * CSS Keyframe Parser
 * Extracts all keyframe blocks and the set of animated properties inside them.
 */
function parseKeyframes(cssContent) {
  const keyframes = {};
  // Regex to match @keyframes <name> { ... }
  // Handles balanced braces
  const kfRegex = /@keyframes\s+([a-zA-Z0-9_-]+)\s*\{/g;
  let match;

  while ((match = kfRegex.exec(cssContent)) !== null) {
    const name = match[1];
    let depth = 1;
    let index = kfRegex.lastIndex;
    const startIndex = index;

    while (depth > 0 && index < cssContent.length) {
      if (cssContent[index] === '{') depth++;
      else if (cssContent[index] === '}') depth--;
      index++;
    }

    const body = cssContent.slice(startIndex, index - 1);
    
    // Extract properties declared inside keyframe stops
    // e.g. 0% { transform: ...; opacity: ...; }
    const properties = new Set();
    const propRegex = /([a-zA-Z0-9_-]+)\s*:[^;]+;/g;
    let propMatch;
    while ((propMatch = propRegex.exec(body)) !== null) {
      const prop = propMatch[1].trim().toLowerCase();
      // Exclude keyframe percentages/labels if any matched
      if (prop !== 'from' && prop !== 'to' && !prop.endsWith('%')) {
        properties.add(prop);
      }
    }

    keyframes[name] = {
      name,
      body: body.trim(),
      properties: Array.from(properties),
    };
  }

  return keyframes;
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1: Compositor-Only Animation Budget
// ─────────────────────────────────────────────────────────────────────────────
function runCompositorBudgetTests() {
  console.log(`\n${colors.cyan}${colors.bold}▶ Suite 1: Compositor-Only Animation Budget${colors.reset}`);
  const { combined, fileContents } = getAllCSS();
  const keyframes = parseKeyframes(combined);

  const COMPOSITOR_ONLY_PROPERTIES = new Set([
    'transform',
    'opacity',
    'translate',
    'scale',
    'rotate',
    'will-change',
    'transform-origin'
  ]);

  // 1.1: ctaIdlePulse
  const ctaKf = keyframes['ctaIdlePulse'];
  if (!ctaKf) {
    recordTest('Compositor', 'ctaIdlePulse keyframe exists', false, {
      error: '@keyframes ctaIdlePulse is not defined in any CSS file.'
    });
  } else {
    recordTest('Compositor', 'ctaIdlePulse keyframe exists', true, {
      info: `Found in hero.css with properties: [${ctaKf.properties.join(', ')}]`
    });

    const nonCompositor = ctaKf.properties.filter((p) => !COMPOSITOR_ONLY_PROPERTIES.has(p));
    const isCompositorOnly = nonCompositor.length === 0;

    recordTest(
      'Compositor',
      'ctaIdlePulse animates ONLY transform and opacity (no repaint properties)',
      isCompositorOnly,
      {
        error: isCompositorOnly ? null : `Violates compositor budget! Animates non-compositor properties: [${nonCompositor.join(', ')}]. 'box-shadow' triggers repaint on every frame at 60fps.`,
        info: `Properties animated: ${JSON.stringify(ctaKf.properties)}`
      }
    );
  }

  // 1.2: dotPulse (check exact name or aliases pulseDot / badgeDotPing)
  const dotPulseKf = keyframes['dotPulse'];
  const pulseDotKf = keyframes['pulseDot'];
  const badgeDotPingKf = keyframes['badgeDotPing'];

  if (dotPulseKf) {
    const nonCompositor = dotPulseKf.properties.filter((p) => !COMPOSITOR_ONLY_PROPERTIES.has(p));
    recordTest(
      'Compositor',
      'dotPulse animates ONLY transform and opacity',
      nonCompositor.length === 0,
      {
        error: nonCompositor.length ? `Animates non-compositor: ${nonCompositor.join(', ')}` : null,
        info: `Properties: ${JSON.stringify(dotPulseKf.properties)}`
      }
    );
  } else {
    // Check if alias pulseDot or badgeDotPing exists
    const aliasFound = pulseDotKf || badgeDotPingKf;
    recordTest(
      'Compositor',
      "dotPulse keyframe existence (exact name '@keyframes dotPulse')",
      false,
      {
        error: "Keyframe '@keyframes dotPulse' not found! Found aliases: " +
          (pulseDotKf ? "'pulseDot' (components.css) " : '') +
          (badgeDotPingKf ? "'badgeDotPing' (hero.css)" : ''),
        info: 'Spec references dotPulse, implementation used pulseDot / badgeDotPing.'
      }
    );

    // Audit the alias keyframes anyway
    if (pulseDotKf) {
      const nonComp = pulseDotKf.properties.filter((p) => !COMPOSITOR_ONLY_PROPERTIES.has(p));
      recordTest(
        'Compositor',
        'pulseDot (alias) animates ONLY transform and opacity',
        nonComp.length === 0,
        {
          error: nonComp.length ? `Animates non-compositor: ${nonComp.join(', ')}` : null,
          info: `Properties: ${JSON.stringify(pulseDotKf.properties)}`
        }
      );
    }
    if (badgeDotPingKf) {
      const nonComp = badgeDotPingKf.properties.filter((p) => !COMPOSITOR_ONLY_PROPERTIES.has(p));
      recordTest(
        'Compositor',
        'badgeDotPing (alias) animates ONLY transform and opacity',
        nonComp.length === 0,
        {
          error: nonComp.length ? `Animates non-compositor: ${nonComp.join(', ')}` : null,
          info: `Properties: ${JSON.stringify(badgeDotPingKf.properties)}`
        }
      );
    }
  }

  // 1.3: floatOrb (or floatOrbPrimary / floatOrbMint)
  const floatOrbKf = keyframes['floatOrb'];
  const floatOrbPrimaryKf = keyframes['floatOrbPrimary'];
  const floatOrbMintKf = keyframes['floatOrbMint'];

  if (floatOrbKf) {
    const nonComp = floatOrbKf.properties.filter((p) => !COMPOSITOR_ONLY_PROPERTIES.has(p));
    recordTest(
      'Compositor',
      'floatOrb animates ONLY transform and opacity',
      nonComp.length === 0,
      { info: `Properties: ${JSON.stringify(floatOrbKf.properties)}` }
    );
  } else if (floatOrbPrimaryKf || floatOrbMintKf) {
    const p1NonComp = (floatOrbPrimaryKf ? floatOrbPrimaryKf.properties : []).filter((p) => !COMPOSITOR_ONLY_PROPERTIES.has(p));
    const p2NonComp = (floatOrbMintKf ? floatOrbMintKf.properties : []).filter((p) => !COMPOSITOR_ONLY_PROPERTIES.has(p));
    const allComp = p1NonComp.length === 0 && p2NonComp.length === 0;

    recordTest(
      'Compositor',
      'floatOrbPrimary & floatOrbMint animate ONLY transform and opacity',
      allComp,
      {
        error: allComp ? null : `Non-compositor in floatOrb: ${[...p1NonComp, ...p2NonComp].join(', ')}`,
        info: `Primary props: [${floatOrbPrimaryKf?.properties.join(', ')}], Mint props: [${floatOrbMintKf?.properties.join(', ')}]`
      }
    );
  } else {
    recordTest('Compositor', 'floatOrb keyframe exists', false, {
      error: 'Neither floatOrb nor floatOrbPrimary/floatOrbMint found in CSS.'
    });
  }

  // 1.4: chevronBounce
  const chevronKf = keyframes['chevronBounce'];
  if (!chevronKf) {
    recordTest('Compositor', 'chevronBounce keyframe exists', false, {
      error: 'chevronBounce keyframe not found in CSS.'
    });
  } else {
    const nonComp = chevronKf.properties.filter((p) => !COMPOSITOR_ONLY_PROPERTIES.has(p));
    recordTest(
      'Compositor',
      'chevronBounce animates ONLY transform and opacity',
      nonComp.length === 0,
      {
        error: nonComp.length ? `Non-compositor in chevronBounce: ${nonComp.join(', ')}` : null,
        info: `Properties: ${JSON.stringify(chevronKf.properties)}`
      }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 2: GSAP and Lenis Synchronization
// ─────────────────────────────────────────────────────────────────────────────
async function runGsapLenisSyncTests() {
  console.log(`\n${colors.cyan}${colors.bold}▶ Suite 2: GSAP and Lenis Synchronization${colors.reset}`);

  const gsapSetupPath = path.join(JS_DIR, 'gsap-setup.js');
  if (!fs.existsSync(gsapSetupPath)) {
    recordTest('Sync', 'gsap-setup.js file exists', false, { error: 'Missing js/gsap-setup.js' });
    return;
  }
  recordTest('Sync', 'gsap-setup.js file exists', true);

  // Static code inspection for critical synchronization calls
  const fileContent = fs.readFileSync(gsapSetupPath, 'utf8');

  // Verify ticker.add
  const hasTickerAdd = /gsap\.ticker\.add\s*\(/i.test(fileContent);
  recordTest(
    'Sync',
    'gsap-setup.js binds Lenis RAF to gsap.ticker via gsap.ticker.add(...)',
    hasTickerAdd,
    { error: hasTickerAdd ? null : 'gsap.ticker.add(...) not found in gsap-setup.js' }
  );

  // Verify lagSmoothing(0)
  const hasLagSmoothingZero = /gsap\.ticker\.lagSmoothing\s*\(\s*0\s*\)/i.test(fileContent);
  recordTest(
    'Sync',
    'gsap-setup.js disables lagSmoothing via gsap.ticker.lagSmoothing(0)',
    hasLagSmoothingZero,
    { error: hasLagSmoothingZero ? null : 'gsap.ticker.lagSmoothing(0) not found in gsap-setup.js' }
  );

  // Dynamic execution test in mock environment
  try {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost:3000/',
      runScripts: 'dangerously',
    });

    const win = dom.window;

    // Track mock calls
    const tickerCallbacks = [];
    let lagSmoothingArg = null;
    let scrollTriggerRegistered = false;
    let lenisRafArg = null;
    let lenisScrollCallback = null;
    let lenisStarted = false;
    let lenisStopped = false;

    // Mock GSAP
    win.gsap = {
      registerPlugin: (plugin) => {
        if (plugin === win.ScrollTrigger) scrollTriggerRegistered = true;
      },
      ticker: {
        add: (fn) => {
          tickerCallbacks.push(fn);
        },
        lagSmoothing: (val) => {
          lagSmoothingArg = val;
        },
      },
      matchMedia: () => ({
        add: () => {},
      }),
      set: () => {},
      timeline: () => ({
        fromTo: function() { return this; },
        kill: () => {},
      }),
    };

    // Mock ScrollTrigger
    win.ScrollTrigger = {
      update: () => {},
    };

    // Mock Lenis class
    class MockLenis {
      constructor(config) {
        this.config = config;
        this.isSmooth = config.smooth;
      }
      on(event, cb) {
        if (event === 'scroll') lenisScrollCallback = cb;
      }
      raf(time) {
        lenisRafArg = time;
      }
      start() {
        lenisStarted = true;
      }
      stop() {
        lenisStopped = true;
      }
    }
    win.Lenis = MockLenis;

    // Mock matchMedia
    let mediaChangeCallback = null;
    win.matchMedia = (query) => ({
      matches: false,
      media: query,
      addEventListener: (type, cb) => {
        if (type === 'change') mediaChangeCallback = cb;
      },
      addListener: (cb) => { mediaChangeCallback = cb; },
      removeEventListener: () => {},
    });

    // Provide globals to VM execution
    global.window = win;
    global.document = win.document;
    global.Node = win.Node;

    // Dynamically import gsap-setup.js
    const gsapSetupModule = await import(`file://${gsapSetupPath}?t=${Date.now()}`);

    const result = gsapSetupModule.initGSAPAndLenis();

    // Verify ticker attachment
    const tickerAttached = tickerCallbacks.length > 0;
    recordTest(
      'Sync',
      'initGSAPAndLenis() dynamically registers ticker callback with gsap.ticker.add',
      tickerAttached,
      { info: `Ticker callbacks count: ${tickerCallbacks.length}` }
    );

    // Verify lagSmoothing(0) call
    const lagSmoothingPassed = lagSmoothingArg === 0;
    recordTest(
      'Sync',
      'initGSAPAndLenis() explicitly called gsap.ticker.lagSmoothing(0)',
      lagSmoothingPassed,
      {
        error: lagSmoothingPassed ? null : `Expected lagSmoothing(0) but received: ${lagSmoothingArg}`,
        info: `lagSmoothing argument: ${lagSmoothingArg}`
      }
    );

    // Verify RAF timing synchronization (GSAP time in seconds * 1000 = ms for Lenis)
    if (tickerCallbacks.length > 0) {
      const tickerFn = tickerCallbacks[0];
      const testTimeSec = 0.01667; // ~16.67ms (60fps delta)
      tickerFn(testTimeSec);
      const expectedMs = Math.round(testTimeSec * 1000);
      const actualMs = Math.round(lenisRafArg);

      recordTest(
        'Sync',
        'Ticker RAF conversion converts seconds to milliseconds (time * 1000)',
        actualMs === expectedMs,
        {
          error: actualMs === expectedMs ? null : `Expected ~${expectedMs}ms passed to Lenis.raf, got: ${actualMs}`,
          info: `Input time: ${testTimeSec}s -> lenis.raf received: ${actualMs}ms`
        }
      );
    }

    // Verify ScrollTrigger.update connected to Lenis scroll event
    const scrollTriggerHooked = lenisScrollCallback === win.ScrollTrigger.update;
    recordTest(
      'Sync',
      'Lenis scroll event is bridged to window.ScrollTrigger.update',
      scrollTriggerHooked,
      { error: scrollTriggerHooked ? null : 'ScrollTrigger.update was not passed to lenis.on("scroll")' }
    );

    // Verify global exposure
    recordTest(
      'Sync',
      'Lenis instance is globally exposed on window.__lenis for debugging/audits',
      win.__lenis !== undefined && win.__lenis !== null,
      { info: `window.__lenis is ${typeof win.__lenis}` }
    );

    // Verify runtime reduced-motion listener
    if (mediaChangeCallback) {
      mediaChangeCallback({ matches: true });
      recordTest(
        'Sync',
        'Runtime OS prefers-reduced-motion change:true stops Lenis smooth scroll',
        lenisStopped,
        { info: `lenisStopped = ${lenisStopped}` }
      );
    }

  } catch (err) {
    recordTest('Sync', 'Dynamic execution of initGSAPAndLenis()', false, { error: err.message });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 3: Reduced Motion Overrides
// ─────────────────────────────────────────────────────────────────────────────
async function runReducedMotionTests() {
  console.log(`\n${colors.cyan}${colors.bold}▶ Suite 3: Reduced Motion Overrides${colors.reset}`);

  const { combined, fileContents } = getAllCSS();

  // 3.1: CSS prefers-reduced-motion media query
  const reducedMotionQueryRegex = /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)\s*\{([^]*?)\}\s*\}/g;
  let matches = [];
  let m;
  while ((m = reducedMotionQueryRegex.exec(combined)) !== null) {
    matches.push(m[1]);
  }

  recordTest(
    'A11y',
    '@media (prefers-reduced-motion: reduce) defined in CSS',
    matches.length > 0,
    { info: `Found ${matches.length} reduced-motion block(s) across CSS files` }
  );

  // 3.2: Universal transition-duration and animation-duration override (0.01ms / none)
  const baseContent = fileContents['base.css'] || '';
  const heroContent = fileContents['sections/hero.css'] || '';

  const hasZeroOrInstantDuration =
    /transition-duration\s*:\s*0\.01ms\s*!important/i.test(baseContent) ||
    /transition\s*:\s*none\s*!important/i.test(heroContent);

  recordTest(
    'A11y',
    'prefers-reduced-motion sets transition-duration to 0.01ms / none',
    hasZeroOrInstantDuration,
    {
      error: hasZeroOrInstantDuration ? null : 'Neither transition-duration: 0.01ms !important nor transition: none !important found in reduced motion CSS',
      info: 'Checked base.css (* rule) and hero.css'
    }
  );

  const hasZeroOrInstantAnimation =
    /animation-duration\s*:\s*0\.01ms\s*!important/i.test(baseContent) ||
    /animation\s*:\s*none\s*!important/i.test(heroContent);

  recordTest(
    'A11y',
    'prefers-reduced-motion disables CSS keyframe animations (animation-duration: 0.01ms / animation: none)',
    hasZeroOrInstantAnimation,
    { info: 'Checked base.css and hero.css' }
  );

  // 3.3: Specific hero elements neutralized in hero.css
  const requiredNeutralizedSelectors = [
    '.hero-headline .word',
    '.hero-badge',
    '.hero-subtext',
    '.hero-ctas',
    '.hero-stats',
    '.hero-visual',
    '.hero-scroll-indicator'
  ];

  const missingSelectors = requiredNeutralizedSelectors.filter((sel) => !heroContent.includes(sel));
  recordTest(
    'A11y',
    'hero.css explicitly neutralizes all animated hero components in reduced motion',
    missingSelectors.length === 0,
    {
      error: missingSelectors.length ? `Missing selectors in hero reduced motion: ${missingSelectors.join(', ')}` : null,
      info: `Verified selectors: ${requiredNeutralizedSelectors.join(', ')}`
    }
  );

  // 3.4: GSAP matchMedia static setter test in hero-anim.js
  const heroAnimPath = path.join(JS_DIR, 'sections', 'hero-anim.js');
  if (!fs.existsSync(heroAnimPath)) {
    recordTest('A11y', 'hero-anim.js exists for GSAP matchMedia audit', false, { error: 'hero-anim.js missing' });
    return;
  }

  const heroAnimContent = fs.readFileSync(heroAnimPath, 'utf8');

  // Verify matchMediaInstance.add('(prefers-reduced-motion: reduce)') exists
  const hasGsapReducedMotionQuery = /matchMediaInstance\.add\s*\(\s*['"]\(prefers-reduced-motion:\s*reduce\)['"]/i.test(heroAnimContent);
  recordTest(
    'A11y',
    "hero-anim.js registers GSAP matchMedia query for '(prefers-reduced-motion: reduce)'",
    hasGsapReducedMotionQuery,
    { error: hasGsapReducedMotionQuery ? null : 'matchMediaInstance.add("(prefers-reduced-motion: reduce)") not found' }
  );

  // Dynamic evaluation of hero-anim.js with prefers-reduced-motion: reduce
  try {
    const html = fs.readFileSync(path.join(SRC_DIR, 'index.html'), 'utf8');
    const dom = new JSDOM(html, {
      url: 'http://localhost:3000/',
      runScripts: 'dangerously',
    });
    const win = dom.window;

    let gsapSetTargets = null;
    let gsapSetProps = null;
    const matchMediaCallbacks = {};

    // Mock GSAP
    win.gsap = {
      registerPlugin: () => {},
      ticker: { add: () => {}, lagSmoothing: () => {} },
      matchMedia: () => ({
        add: (query, cb) => {
          matchMediaCallbacks[query] = cb;
          // Immediately simulate matchMedia resolution for reduce
          if (query.includes('prefers-reduced-motion: reduce')) {
            cb();
          }
        },
      }),
      set: (targets, props) => {
        gsapSetTargets = targets;
        gsapSetProps = props;
      },
      timeline: () => ({
        fromTo: function() { return this; },
        kill: () => {},
      }),
    };

    win.matchMedia = (q) => ({
      matches: q.includes('prefers-reduced-motion: reduce'),
      media: q,
      addEventListener: () => {},
      addListener: () => {},
      removeEventListener: () => {},
    });

    global.window = win;
    global.document = win.document;
    global.Node = win.Node;

    const heroAnimModule = await import(`file://${heroAnimPath}?t=${Date.now()}`);
    heroAnimModule.initHeroAnimation();

    const gsapSetCalled = gsapSetTargets !== null && gsapSetProps !== null;
    recordTest(
      'A11y',
      'GSAP matchMedia executes gsap.set() statically when prefers-reduced-motion matches',
      gsapSetCalled,
      { info: `gsap.set called with props: ${JSON.stringify(gsapSetProps)}` }
    );

    if (gsapSetCalled) {
      const setsStaticOpacity = gsapSetProps.opacity === 1;
      const clearsTransform = gsapSetProps.clearProps === 'transform' || gsapSetProps.transform === 'none';
      const resetsCoordinates = gsapSetProps.y === 0 && gsapSetProps.x === 0;

      recordTest(
        'A11y',
        'gsap.set() establishes static state (opacity: 1, coordinates: 0, clearProps transform)',
        setsStaticOpacity && clearsTransform && resetsCoordinates,
        {
          error: (setsStaticOpacity && clearsTransform && resetsCoordinates) ? null : `Props did not fully reset state: ${JSON.stringify(gsapSetProps)}`,
          info: `Props: opacity=${gsapSetProps.opacity}, y=${gsapSetProps.y}, scale=${gsapSetProps.scale}, clearProps=${gsapSetProps.clearProps}`
        }
      );
    }

  } catch (err) {
    recordTest('A11y', 'Dynamic execution of initHeroAnimation() with reduced motion', false, { error: err.message });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Master Runner & Verdict Generator
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${colors.bold}${colors.cyan}================================================================${colors.reset}`);
  console.log(`${colors.bold} BrandGuard Landing Page V2 — Milestone 1 Empirical Challenge${colors.reset}`);
  console.log(`${colors.dim} Target: ${SRC_DIR}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}`);

  runCompositorBudgetTests();
  await runGsapLenisSyncTests();
  await runReducedMotionTests();

  const total = testResults.length;
  const passed = testResults.filter((r) => r.passed).length;
  const failed = testResults.filter((r) => !r.passed).length;

  console.log(`\n${colors.cyan}────────────────────────────────────────────────────────────────${colors.reset}`);
  console.log(` Summary of Empirical Challenge Tests:`);
  console.log(` Total Assertions: ${total}`);
  console.log(` Passed:           ${colors.green}${passed}${colors.reset}`);
  console.log(` Failed:           ${failed > 0 ? colors.red + failed : colors.green + '0'}${colors.reset}`);
  console.log(`${colors.cyan}────────────────────────────────────────────────────────────────${colors.reset}`);

  // Print failure diagnostic breakdown
  const failures = testResults.filter((r) => !r.passed);
  if (failures.length > 0) {
    console.log(`\n${colors.bold}${colors.red}Failures Identified During Empirical Challenge:${colors.reset}`);
    failures.forEach((f, idx) => {
      console.log(`  ${idx + 1}. [${f.suite}] ${f.name}`);
      if (f.details.error) console.log(`     ${colors.yellow}Issue: ${f.details.error}${colors.reset}`);
      if (f.details.info) console.log(`     ${colors.dim}Detail: ${f.details.info}${colors.reset}`);
    });
  }

  // Verdict
  console.log(`\n${colors.bold}${colors.cyan}================================================================${colors.reset}`);
  if (failed === 0) {
    console.log(`${colors.bgGreen}${colors.bold}${colors.white} VERDICT: APPROVE ${colors.reset}`);
    console.log(`All animation and performance mechanics meet strict budget constraints.`);
  } else {
    console.log(`${colors.bgRed}${colors.bold}${colors.white} VERDICT: REQUEST_CHANGES ${colors.reset}`);
    console.log(`${colors.red}${colors.bold}${failed} issue(s) detected. Corrective actions required before Milestone 1 sign-off.${colors.reset}`);
  }
  console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}\n`);

  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('Fatal challenge runner error:', err);
  process.exit(1);
});
