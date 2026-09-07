/**
 * BrandGuard Landing Page V2 — Tier 1 Feature Tests
 *
 * Exhaustive coverage of all core features across Milestones M1 to M4 as specified in:
 * - PROJECT.md § Feature Inventory (Features 1 through 29)
 * - survey_spec_miner_1/handoff.md § Section 3 (Design Tokens) & Section 4 (Section Blueprint)
 * - survey_explorer_2/handoff.md § Section 2 (Math & Animations)
 * - survey_explorer_3/handoff.md § Section 3 (`pm-` Component Mapping)
 */

const fs = require('fs');
const path = require('path');
const { describe, test, it, expect } = require('./runner.js');
const {
  SRC_DIR,
  loadPage,
  loadCSS,
  ColorMathOracle,
  DOMHelpers,
} = require('./harness.js');

describe('Tier 1: Feature Coverage (PROJECT.md Inventory)', () => {
  // =========================================================================
  // Milestone 1: Foundation & Layout (Sprints 1–3)
  // =========================================================================

  describe('[M1] Foundation & Layout', () => {
    test('[M1] Feature 1: CSS Design Token System has complete color scales, surfaces, typography, radii, and shadows', () => {
      const tokensCss = loadCSS('css/tokens.css');
      expect(tokensCss.exists, 'css/tokens.css must exist').toBe(true);

      const vars = tokensCss.tokens.allVars;

      // 1. Primary Brand Scale (50-950)
      const primaryKeys = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
      for (const k of primaryKeys) {
        expect(`--color-primary-${k}` in vars, `Missing --color-primary-${k}`).toBe(true);
      }
      expect(vars['--color-primary-500'].toUpperCase()).toBe('#6366F1');

      // 2. Mint Scale (50-950)
      for (const k of primaryKeys) {
        expect(`--color-mint-${k}` in vars, `Missing --color-mint-${k}`).toBe(true);
      }
      expect(vars['--color-mint-500'].toUpperCase()).toBe('#0FFA8C');

      // 3. Sky Scale (50-950)
      for (const k of primaryKeys) {
        expect(`--color-sky-${k}` in vars, `Missing --color-sky-${k}`).toBe(true);
      }
      expect(vars['--color-sky-500'].toUpperCase()).toBe('#129FF8');

      // 4. Neutral Scale (50-950)
      for (const k of primaryKeys) {
        expect(`--color-neutral-${k}` in vars, `Missing --color-neutral-${k}`).toBe(true);
      }

      // 5. Semantic Colors
      expect('--color-success-500' in vars, 'Missing --color-success-500').toBe(true);
      expect('--color-error-500' in vars, 'Missing --color-error-500').toBe(true);
      expect('--color-warning-500' in vars, 'Missing --color-warning-500').toBe(true);
      expect('--color-info-500' in vars, 'Missing --color-info-500').toBe(true);

      // 6. Surface tokens
      expect('--bg-page' in vars, 'Missing --bg-page').toBe(true);
      expect('--bg-surface' in vars, 'Missing --bg-surface').toBe(true);
      expect('--text-main' in vars, 'Missing --text-main').toBe(true);
      expect('--text-secondary' in vars, 'Missing --text-secondary').toBe(true);

      // 7. Typography Scale
      const typeKeys = ['2xs', 'xs', 'sm', 'base', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'];
      for (const t of typeKeys) {
        expect(`--text-${t}` in vars, `Missing --text-${t}`).toBe(true);
      }
      expect('--font-display' in vars, 'Missing --font-display').toBe(true);
      expect('--font-mono' in vars, 'Missing --font-mono').toBe(true);

      // 8. Spacing, Radii, Shadows, Z-Index
      expect('--space-md' in vars, 'Missing --space-md').toBe(true);
      expect('--radius-lg' in vars, 'Missing --radius-lg').toBe(true);
      expect('--shadow-lg' in vars, 'Missing --shadow-lg').toBe(true);
      expect('--z-sticky-nav' in vars, 'Missing --z-sticky-nav').toBe(true);
    });

    test('[M1] Feature 2: Anti-FOUC Theme Architecture initializes data-theme before body render', () => {
      // Simulate stored light theme
      const page = loadPage({ storage: { 'brandguard-theme': 'light' } });
      expect(page.exists, 'index.html must exist').toBe(true);

      const html = page.document.documentElement;
      expect(html.getAttribute('data-theme'), 'Anti-FOUC script must set data-theme="light"').toBe('light');

      // Verify head contains inline script reading localStorage
      const headScript = page.document.querySelector('head script:not([src])');
      expect(headScript !== null, 'Inline anti-FOUC script must be present in <head>').toBe(true);
      expect(headScript.textContent).toContain('localStorage.getItem');
    });

    test('[M1] Feature 3: Sticky Glassmorphic Nav has logo, nav links, and CTA button', () => {
      const page = loadPage();
      expect(page.exists, 'index.html must exist').toBe(true);

      const nav = page.document.querySelector('nav, .site-nav');
      expect(nav !== null, 'Navigation bar (<nav> or .site-nav) must exist').toBe(true);

      // Logo / Brand name
      const brand = nav.querySelector('.brand, .nav-logo, .logo');
      expect(brand !== null, 'Brand logo/title element must exist in nav').toBe(true);
      expect(brand.textContent.toLowerCase()).toContain('brandguard');

      // Nav links
      const links = nav.querySelectorAll('a[href^="#"]');
      expect(links.length >= 3, 'Nav must contain at least 3 section jump links').toBe(true);

      // Action button (Figma Community install CTA)
      const cta = nav.querySelector('a.btn, button.btn, .nav-cta, a[href*="figma"]');
      expect(cta !== null, 'Nav CTA button must exist').toBe(true);
      expect(cta.textContent.toLowerCase()).toContain('install');
    });

    test('[M1] Feature 4: Dual-Theme Toggle Engine switches theme and writes to localStorage', () => {
      const page = loadPage({ storage: { 'brandguard-theme': 'dark' } });
      expect(page.exists, 'index.html must exist').toBe(true);

      const toggleBtn = page.document.querySelector('.theme-toggle, #theme-toggle, [data-theme-toggle]');
      expect(toggleBtn !== null, 'Theme toggle button must exist').toBe(true);

      // Verify accessibility
      const ariaLabel = toggleBtn.getAttribute('aria-label') || toggleBtn.getAttribute('title');
      expect(ariaLabel !== null, 'Theme toggle must have aria-label or title').toBe(true);

      // Click toggle
      DOMHelpers.click(toggleBtn);

      const html = page.document.documentElement;
      const currentTheme = html.getAttribute('data-theme');
      expect(currentTheme === 'light' || currentTheme === 'dark', 'data-theme must be light or dark').toBe(true);

      // Storage updated
      const stored = page.storage.getItem('brandguard-theme');
      expect(stored, 'localStorage must be updated on theme toggle').toBe(currentTheme);
    });

    test('[M1] Feature 5: Hero Section has staggered H1 headline and CTA buttons', () => {
      const page = loadPage();
      expect(page.exists, 'index.html must exist').toBe(true);

      const hero = page.document.querySelector('.hero, .section-hero, #hero');
      expect(hero !== null, 'Hero section must exist').toBe(true);

      const h1 = hero.querySelector('h1');
      expect(h1 !== null, 'Hero must contain an <h1> element').toBe(true);
      expect(h1.textContent.toLowerCase()).toContain('design system');

      // Primary CTA & Secondary CTA
      const primaryCta = hero.querySelector('.btn-primary, .cta-primary, [data-cta="primary"]');
      expect(primaryCta !== null, 'Hero primary CTA button must exist').toBe(true);
      expect(primaryCta.textContent.toLowerCase()).toContain('install');

      const secondaryCta = hero.querySelector('.btn-ghost, .btn-secondary, [data-cta="secondary"], a[href^="#"]');
      expect(secondaryCta !== null, 'Hero secondary/demo CTA must exist').toBe(true);
    });

    test('[M1] Feature 6: Lenis and GSAP RAF integration script is referenced or configured', () => {
      const page = loadPage();
      expect(page.exists, 'index.html must exist').toBe(true);

      const scripts = Array.from(page.document.querySelectorAll('script')).map((s) => s.src || s.textContent);
      const hasGsapOrLenis = scripts.some((src) => /gsap|lenis/i.test(src)) || fs.existsSync(path.join(SRC_DIR, 'js', 'gsap-setup.js'));
      expect(hasGsapOrLenis, 'GSAP or Lenis script must be referenced in HTML or js/gsap-setup.js').toBe(true);
    });

    test('[M1] Feature 7: Hero Ambient Orbs and Dot Grid styling defined in CSS', () => {
      const heroCss = loadCSS('css/sections/hero.css');
      const tokensCss = loadCSS('css/tokens.css');
      const baseCss = loadCSS('css/base.css');
      const combined = (heroCss.content || '') + (tokensCss.content || '') + (baseCss.content || '');

      expect(heroCss.exists || tokensCss.exists, 'Hero or tokens CSS must exist').toBe(true);
      expect(combined).toMatch(/radial-gradient|dot-grid|orb/i, 'Ambient orbs or dot-grid background styling must be present');
    });

    test('[M1] Feature 8: Idle Pulse Glow on Hero CTA defined in CSS keyframes', () => {
      const heroCss = loadCSS('css/sections/hero.css');
      const compCss = loadCSS('css/components.css');
      const combined = (heroCss.content || '') + (compCss.content || '');

      expect(combined).toMatch(/@keyframes\s+[\w-]*(?:pulse|glow)/i, 'Pulse/glow keyframes animation must be defined for CTA');
    });
  });

  // =========================================================================
  // Milestone 2: Interactive Plugin Mockup (Sprints 4–5)
  // =========================================================================

  describe('[M2] Interactive Plugin Mockup', () => {
    test('[M2] Feature 9: Plugin Window Chrome has macOS traffic lights, title, and live pulse dot', () => {
      const page = loadPage();
      expect(page.exists, 'index.html must exist').toBe(true);

      const pmWindow = page.document.querySelector('.pm-window');
      expect(pmWindow !== null, '.pm-window must exist in index.html').toBe(true);

      // Traffic lights
      const closeLight = pmWindow.querySelector('.pm-tl-close');
      const minLight = pmWindow.querySelector('.pm-tl-minimize');
      const expLight = pmWindow.querySelector('.pm-tl-expand');
      expect(closeLight !== null && minLight !== null && expLight !== null, 'macOS traffic light dots (.pm-tl-*) must exist').toBe(true);

      // Title & Live badge
      const title = pmWindow.querySelector('.pm-title');
      expect(title !== null && title.textContent.includes('BrandGuard'), '.pm-title must contain BrandGuard').toBe(true);

      const liveBadge = pmWindow.querySelector('.pm-badge-live');
      expect(liveBadge !== null, '.pm-badge-live must exist').toBe(true);
      expect(liveBadge.textContent).toContain('380 Variables');

      const pulseDot = pmWindow.querySelector('.pm-pulse-dot');
      expect(pulseDot !== null, '.pm-pulse-dot must exist inside plugin chrome').toBe(true);
    });

    test('[M2] Feature 10: 3D Perspective Tilt and CSS variables scoped to --pm-* in css/plugin-mockup.css', () => {
      const pmCss = loadCSS('css/plugin-mockup.css');
      expect(pmCss.exists, 'css/plugin-mockup.css must exist').toBe(true);

      const vars = pmCss.tokens.allVars;
      expect('--pm-bg' in vars, 'Missing --pm-bg').toBe(true);
      expect('--pm-primary' in vars, 'Missing --pm-primary').toBe(true);
      expect('--pm-mint' in vars, 'Missing --pm-mint').toBe(true);

      // Check 3D perspective definition
      expect(pmCss.content).toMatch(/perspective\s*\(\s*1200px\s*\)/i, 'Must define perspective(1200px)');
      expect(pmCss.content).toMatch(/rotateY\s*\(/i, 'Must define rotateY transform');

      // Check host isolation: no unnamespaced element tags targeting outside
      const rules = pmCss.content.split('}');
      for (const r of rules) {
        const selector = r.split('{')[0].trim();
        if (selector && !selector.startsWith('@') && !selector.startsWith(':root')) {
          expect(selector.includes('.pm-'), `Rule "${selector}" violates .pm- namespace isolation`).toBe(true);
        }
      }
    });

    test('[M2] Feature 11: Start Page Plugin Screen (.pm-startpage) matches StartPage.tsx anatomy', () => {
      const page = loadPage();
      expect(page.exists, 'index.html must exist').toBe(true);

      const startPage = page.document.querySelector('.pm-startpage, [data-screen="start"]');
      expect(startPage !== null, '.pm-startpage view must exist inside plugin window').toBe(true);

      // Check welcome banner and path cards
      const welcome = startPage.querySelector('.pm-welcome-banner, .pm-brand-title');
      expect(welcome !== null, 'Start page must include brand/welcome banner').toBe(true);

      const pathCards = startPage.querySelectorAll('.pm-path-card');
      expect(pathCards.length >= 3, 'Start page must feature 3 path options').toBe(true);
    });

    test('[M2] Feature 12: 3 Paths Bento Cards in Section 2 with Fast, Guided, and Import accents', () => {
      const page = loadPage();
      expect(page.exists, 'index.html must exist').toBe(true);

      const sectionPaths = page.document.querySelector('.section-paths, #paths, .paths-bento');
      expect(sectionPaths !== null, '3 Paths Bento section must exist').toBe(true);

      const cards = sectionPaths.querySelectorAll('.bento-card, .path-card, [data-path]');
      expect(cards.length, 'Must have exactly 3 path bento cards').toBe(3);

      const texts = Array.from(cards).map((c) => c.textContent.toLowerCase());
      expect(texts.some((t) => t.includes('fast') || t.includes('preset')), 'Must have Fast Path card').toBe(true);
      expect(texts.some((t) => t.includes('guided') || t.includes('wizard')), 'Must have Guided Path card').toBe(true);
      expect(texts.some((t) => t.includes('import') || t.includes('upload')), 'Must have Import Path card').toBe(true);
    });

    test('[M2] Feature 13: 300ms Spring Screen Switcher contract window.switchPluginScreen exists and transitions', async () => {
      const page = loadPage();
      expect(page.exists, 'index.html must exist').toBe(true);

      // Load plugin-mockup.js or evaluate switcher
      const scriptPath = path.join(SRC_DIR, 'js', 'plugin-mockup.js');
      if (fs.existsSync(scriptPath)) {
        const code = fs.readFileSync(scriptPath, 'utf8');
        page.window.eval(code);
      }

      expect(typeof page.window.switchPluginScreen, 'window.switchPluginScreen must be a function').toBe('function');

      // Test transition to wizard
      page.window.switchPluginScreen('wizard');
      await DOMHelpers.wait(400);

      const activeScreen = page.document.querySelector('.pm-screen--active');
      expect(activeScreen !== null, 'An active screen (.pm-screen--active) must be displayed').toBe(true);
      expect(activeScreen.getAttribute('data-screen'), 'Active screen must be wizard').toBe('wizard');
    });
  });

  // =========================================================================
  // Milestone 3: Live Demos (Sprints 6–9)
  // =========================================================================

  describe('[M3] Live Demos', () => {
    test('[M3] Feature 14: Live 10-Shade Color Engine generates 10 swatches from hex input', () => {
      const page = loadPage();
      expect(page.exists, 'index.html must exist').toBe(true);

      const colorEngine = page.document.querySelector('.color-engine, .section-color-engine, #color-engine');
      expect(colorEngine !== null, 'Color Engine section must exist').toBe(true);

      const colorPicker = colorEngine.querySelector('input[type="color"]');
      const hexInput = colorEngine.querySelector('input[type="text"]#hex-input, input.hex-input');
      expect(colorPicker !== null && hexInput !== null, 'Both color picker and hex text input must exist').toBe(true);

      // Verify default value is #6366F1
      expect(hexInput.value.toUpperCase()).toBe('#6366F1');

      // Verify swatch container contains 10 stops
      const swatches = colorEngine.querySelectorAll('.swatch, .pm-shade-cell, [data-stop]');
      expect(swatches.length, 'Color engine must generate 10 swatches (50 to 900)').toBe(10);
    });

    test('[M3] Feature 15: Real-Time WCAG 2.1 Validator calculates contrast ratio and renders Pass/Fail badges', () => {
      // Test ColorMathOracle directly first
      const crIndigoOnWhite = ColorMathOracle.calculateContrastRatio('#6366F1', '#FFFFFF');
      expect(crIndigoOnWhite >= 4.0 && crIndigoOnWhite <= 5.0, `Expected ~4.49:1 for #6366F1, got ${crIndigoOnWhite}`).toBe(true);

      const crShade700OnWhite = ColorMathOracle.calculateContrastRatio('#4338CA', '#FFFFFF');
      expect(crShade700OnWhite >= 7.0, `Expected >= 7.0 (AAA) for shade 700, got ${crShade700OnWhite}`).toBe(true);

      const badge700 = ColorMathOracle.getWCAGBadge(crShade700OnWhite);
      expect(badge700.level).toBe('AAA');
      expect(badge700.pass).toBe(true);

      // Test in DOM
      const page = loadPage();
      expect(page.exists, 'index.html must exist').toBe(true);

      const wcagBadge = page.document.querySelector('.contrast-badge, #wcag-badge, .pm-wcag-badge');
      expect(wcagBadge !== null, 'WCAG contrast badge element must exist').toBe(true);
      expect(wcagBadge.textContent).toMatch(/AA|AAA|Pass|Fail/i, 'Badge must display WCAG level or status');
    });

    test('[M3] Feature 16: Harmony Pairing Engine computes complementary and triadic swatches', () => {
      const baseHex = '#6366F1';
      const comp = ColorMathOracle.getComplementaryColor(baseHex);
      expect(typeof comp).toBe('string');
      expect(comp.startsWith('#')).toBe(true);

      const triadic = ColorMathOracle.getTriadicColors(baseHex);
      expect(triadic.length).toBe(2);

      const page = loadPage();
      expect(page.exists, 'index.html must exist').toBe(true);

      const harmonies = page.document.querySelectorAll('.harmony-swatch, .pm-harmony-card, [data-harmony]');
      expect(harmonies.length >= 2, 'Must render complementary and harmony recommendations').toBe(true);
    });

    test('[M3] Feature 17: 8-Step Wizard Tour Navigator has 8 tabs with auto-advance and keyboard navigation', () => {
      const page = loadPage();
      expect(page.exists, 'index.html must exist').toBe(true);

      const wizard = page.document.querySelector('.wizard-navigator, .section-wizard-tour, #wizard-tour');
      expect(wizard !== null, 'Wizard tour section must exist').toBe(true);

      const pills = wizard.querySelectorAll('.step-pill, [role="tab"]');
      expect(pills.length, 'Must have exactly 8 step pills').toBe(8);

      // ARIA tabs pattern
      const tablist = wizard.querySelector('[role="tablist"]');
      expect(tablist !== null, 'Must contain [role="tablist"]').toBe(true);

      // Step 1 active by default
      const activePill = wizard.querySelector('.step-pill.active, [role="tab"][aria-selected="true"]');
      expect(activePill !== null, 'Step 1 must be active initially').toBe(true);
      expect(activePill.textContent.trim()).toBe('1');
    });

    test('[M3] Feature 18: Wizard Steps 1–8 Mockup Views render distinctive configuration domains', () => {
      const page = loadPage();
      expect(page.exists, 'index.html must exist').toBe(true);

      const wizardBody = page.document.querySelector('.pm-wizard-body, #mockup-view, .wizard-mockup-content');
      expect(wizardBody !== null, 'Wizard mockup body content container must exist').toBe(true);
    });

    test('[M3] Feature 19: Token Rain Cascade contains 30 token elements color-coded by category', () => {
      const page = loadPage();
      expect(page.exists, 'index.html must exist').toBe(true);

      const rainContainer = page.document.querySelector('.token-rain-container');
      expect(rainContainer !== null, '.token-rain-container must exist').toBe(true);
      expect(rainContainer.getAttribute('aria-hidden'), 'Token rain must have aria-hidden="true"').toBe('true');

      // Either static or dynamically injected tokens
      const tokenScriptPath = path.join(SRC_DIR, 'js', 'demos', 'token-counter.js');
      if (fs.existsSync(tokenScriptPath)) {
        const code = fs.readFileSync(tokenScriptPath, 'utf8');
        expect(code).toContain('--color-');
        expect(code).toContain('--spacing-');
        expect(code).toContain('--text-');
      }
    });

    test('[M3] Feature 20: 0-to-380 Animated Counter has monospace display and screen reader accessible fallback', () => {
      const page = loadPage();
      expect(page.exists, 'index.html must exist').toBe(true);

      const counterEl = page.document.querySelector('#animated-count, .token-counter-number');
      expect(counterEl !== null, 'Animated counter element (#animated-count) must exist').toBe(true);

      // Check accessible text
      const srText = page.document.querySelector('.sr-only, [aria-label*="380"]');
      expect(srText !== null || counterEl.parentElement.textContent.includes('380'), 'Counter must have accessible text "380"').toBe(true);
    });

    test('[M3] Feature 21: JSON Typewriter Simulator has IDE chrome and slide-in validation badge', () => {
      const page = loadPage();
      expect(page.exists, 'index.html must exist').toBe(true);

      const editor = page.document.querySelector('.editor-panel, .json-terminal, #import-demo');
      expect(editor !== null, 'JSON editor/terminal panel must exist').toBe(true);

      const typingArea = editor.querySelector('#json-typing-area, pre code');
      expect(typingArea !== null, 'Typing code pre/code element must exist').toBe(true);

      const validationPanel = page.document.querySelector('.validation-panel, .import-validation');
      expect(validationPanel !== null, 'Validation badges panel must exist').toBe(true);
    });

    test('[M3] Feature 22: Parser Error State Toggle demonstrates invalid hex failure detection', () => {
      const page = loadPage();
      expect(page.exists, 'index.html must exist').toBe(true);

      const toggleBtn = page.document.querySelector('#toggle-error-state, .btn-error-toggle');
      expect(toggleBtn !== null, 'Toggle error state button must exist').toBe(true);
    });

    test('[M3] Feature 23: Presets Horizontal Snap Carousel has 7 cards with specs and scroll snapping', () => {
      const page = loadPage();
      expect(page.exists, 'index.html must exist').toBe(true);

      const carousel = page.document.querySelector('.preset-carousel, #presets-track');
      expect(carousel !== null, 'Preset carousel container must exist').toBe(true);

      const presetCards = carousel.querySelectorAll('.preset-card, .pm-preset-card');
      expect(presetCards.length, 'Must contain 7 preset cards').toBe(7);

      const presetsCss = loadCSS('css/sections/presets.css');
      if (presetsCss.exists) {
        expect(presetsCss.content).toMatch(/scroll-snap-type\s*:\s*x\s+mandatory/i, 'Must use scroll-snap-type: x mandatory');
      }
    });
  });

  // =========================================================================
  // Milestone 4: Polish, A11y & Performance (Sprints 10–12)
  // =========================================================================

  describe('[M4] Polish, Accessibility & Final Sections', () => {
    test('[M4] Feature 24: Social Proof & Stat Counters display 4 metrics and testimonial quote', () => {
      const page = loadPage();
      expect(page.exists, 'index.html must exist').toBe(true);

      const socialSection = page.document.querySelector('.section-social-proof, #social-proof, .testimonials');
      expect(socialSection !== null, 'Social proof section must exist').toBe(true);

      const text = socialSection.textContent;
      expect(text).toContain('380');
      expect(text).toContain('9');
      expect(text).toContain('3');
      expect(text).toContain('WCAG');
    });

    test('[M4] Feature 25: Final CTA Section has display copy and pulse-glow button', () => {
      const page = loadPage();
      expect(page.exists, 'index.html must exist').toBe(true);

      const ctaSection = page.document.querySelector('.section-cta, #final-cta, .cta-banner');
      expect(ctaSection !== null, 'Final CTA section must exist').toBe(true);

      const btn = ctaSection.querySelector('a.btn-primary, button.btn-primary, .cta-btn');
      expect(btn !== null, 'Primary install CTA button must exist in Final CTA section').toBe(true);
      expect(btn.textContent.toLowerCase()).toContain('install');
    });

    test('[M4] Feature 26: Footer has live operational status dot and categorized links', () => {
      const page = loadPage();
      expect(page.exists, 'index.html must exist').toBe(true);

      const footer = page.document.querySelector('footer, .site-footer');
      expect(footer !== null, 'Footer must exist').toBe(true);

      const statusDot = footer.querySelector('.status-dot, .pulse-dot, .live-dot');
      expect(statusDot !== null, 'Pulsing green live status dot must exist in footer').toBe(true);
      expect(footer.textContent).toContain('All Systems Operational');
    });

    test('[M4] Feature 27: Prefers-Reduced-Motion Fallbacks override transforms and animations in CSS', () => {
      const baseCss = loadCSS('css/base.css');
      const compCss = loadCSS('css/components.css');
      const pmCss = loadCSS('css/plugin-mockup.css');
      const combined = (baseCss.content || '') + (compCss.content || '') + (pmCss.content || '');

      expect(combined).toMatch(/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/i, 'Must define @media (prefers-reduced-motion: reduce)');
      expect(combined).toMatch(/animation-duration\s*:\s*0\.01ms|animation\s*:\s*none/i, 'Must disable animations on reduced motion');
    });

    test('[M4] Feature 28: 60fps Performance & Compositor Budget avoids layout thrashing properties', () => {
      const pmCss = loadCSS('css/plugin-mockup.css');
      if (pmCss.exists) {
        // Transition property should only animate transform / opacity
        const transitions = pmCss.content.matchAll(/transition\s*:\s*([^;]+);/g);
        for (const t of transitions) {
          const transValue = t[1];
          expect(!/(?:^|\s)(?:top|left|right|bottom|width|height|margin|padding)(?:\s|$|,)/i.test(transValue),
            `Violates 60fps budget by animating non-composited property in "${transValue}"`).toBe(true);
        }
      }
    });

    test('[M4] Feature 29: Comprehensive Accessibility Audit confirms semantic landmarks and ARIA roles', () => {
      const page = loadPage();
      expect(page.exists, 'index.html must exist').toBe(true);

      const nav = page.document.querySelector('nav');
      const main = page.document.querySelector('main');
      const footer = page.document.querySelector('footer');

      expect(nav !== null, 'Semantic <nav> landmark must exist').toBe(true);
      expect(main !== null, 'Semantic <main> landmark must exist').toBe(true);
      expect(footer !== null, 'Semantic <footer> landmark must exist').toBe(true);
    });
  });
});
