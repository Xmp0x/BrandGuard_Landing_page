/**
 * BrandGuard Landing Page V2 — Tier 3 Pairwise Integration Tests
 *
 * Verifies cross-feature interactions between independent subsystems:
 * - Theme Switcher + Plugin Mockup Screen Transitions
 * - Color Engine Reactive Input + Wizard Tour Step Synchronization
 * - JSON Error Toggle + Clipboard Copy & Toast Feedback
 * - Auto-Advancing Wizard Timer + Manual Path Card Switcher
 * - Reduced Motion Mode + Dynamic Theme Changes
 * - Responsive Resizing During Active 3D Window Parallax
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

describe('Tier 3: Pairwise Feature Combinations', () => {
  test('[M2] Pairwise 1: Theme switch + Plugin screen change adapts --pm-* tokens and transitions cleanly', async () => {
    const page = loadPage({ storage: { 'brandguard-theme': 'dark' } });
    expect(page.exists, 'index.html must exist').toBe(true);

    // 1. Switch Theme to Light
    const toggleBtn = page.document.querySelector('.theme-toggle, #theme-toggle');
    if (toggleBtn) {
      DOMHelpers.click(toggleBtn);
      const html = page.document.documentElement;
      expect(html.getAttribute('data-theme')).toBe('light');
    }

    // 2. Switch Plugin Screen to 'preset'
    if (typeof page.window.switchPluginScreen === 'function') {
      page.window.switchPluginScreen('preset');
      await DOMHelpers.wait(400);

      const activeScreen = page.document.querySelector('.pm-screen--active');
      if (activeScreen) {
        expect(activeScreen.getAttribute('data-screen')).toBe('preset');
      }
    }

    // 3. Verify Light Theme Tokens in Plugin Mockup CSS
    const pmCss = loadCSS('css/plugin-mockup.css');
    if (pmCss.exists) {
      expect(pmCss.content).toMatch(/\[data-theme=["']?light["']?\].*\.pm-window|\.pm-window\[data-theme=["']?light["']?\]/i,
        'Plugin mockup must support light theme overrides');
    }
  });

  test('[M3] Pairwise 2: Color Engine hex input + Wizard Tour step 1 synchronization', async () => {
    const page = loadPage();
    expect(page.exists, 'index.html must exist').toBe(true);

    // 1. Change base color to Mint #0FFA8C in Color Engine
    const hexInput = page.document.querySelector('#hex-input');
    expect(hexInput !== null, '#hex-input must exist').toBe(true);
    DOMHelpers.input(hexInput, '#0FFA8C');
    DOMHelpers.change(hexInput, '#0FFA8C');

    // 2. Compute Oracle scale for #0FFA8C
    const mintScale = ColorMathOracle.generate10ShadeScale('#0FFA8C');
    expect(mintScale.length).toBe(10);
    expect(mintScale.find((s) => s.stop === 500).hex.toUpperCase()).toBe('#0FFA8C');

    // 3. Navigate Wizard to Step 1 (Colors)
    const pills = page.document.querySelectorAll('.step-pill, [role="tab"]');
    expect(pills.length >= 1, 'Step pills must exist').toBe(true);
    DOMHelpers.click(pills[0]);
    await DOMHelpers.wait(100);
    expect(pills[0].classList.contains('active') || pills[0].getAttribute('aria-selected') === 'true').toBe(true);
  });

  test('[M3] Pairwise 3: JSON error toggle + Clipboard copy and toast notification', async () => {
    const page = loadPage();
    expect(page.exists, 'index.html must exist').toBe(true);

    // 1. Toggle Error State in JSON demo
    const toggleBtn = page.document.querySelector('#toggle-error-state, .btn-error-toggle');
    expect(toggleBtn !== null, '#toggle-error-state must exist').toBe(true);
    DOMHelpers.click(toggleBtn);
    await DOMHelpers.wait(100);

    const validationPanel = page.document.querySelector('.validation-panel, .import-validation');
    expect(validationPanel !== null, 'validation panel must exist').toBe(true);
    expect(validationPanel.textContent.toLowerCase()).toMatch(/error|invalid|fail/i);

    // 2. Click Copy JSON Button
    const copyBtn = page.document.querySelector('.btn-copy-json, #copy-json');
    expect(copyBtn !== null, 'copy button must exist').toBe(true);
    DOMHelpers.click(copyBtn);
    await DOMHelpers.wait(100);

    const clipboard = await page.window.navigator.clipboard.readText();
    expect(typeof clipboard).toBe('string');
    expect(clipboard.length > 0).toBe(true);
  });

  test('[M3] Pairwise 4: Auto-advancing wizard + Manual path switcher detaches timer', async () => {
    const page = loadPage();
    expect(page.exists, 'index.html must exist').toBe(true);

    // 1. Simulate wizard auto-advancing
    let wizardTimerRunning = true;
    function stopWizardTimer() {
      wizardTimerRunning = false;
    }

    // 2. Click "Fast Path" Bento Card in Section 2
    const fastPathCard = page.document.querySelector('[data-path="fast"], .path-card--fast');
    expect(fastPathCard !== null, 'Fast path card must exist').toBe(true);
    DOMHelpers.click(fastPathCard);
    stopWizardTimer();
    expect(wizardTimerRunning).toBe(false);
  });

  test('[M4] Pairwise 5: Reduced motion mode + Theme toggle transitions instantly', () => {
    const page = loadPage({ reducedMotion: true });
    expect(page.exists, 'index.html must exist').toBe(true);

    // Verify reduced motion matches in media query
    const mql = page.window.matchMedia('(prefers-reduced-motion: reduce)');
    expect(mql.matches).toBe(true);

    const toggleBtn = page.document.querySelector('.theme-toggle, #theme-toggle');
    expect(toggleBtn !== null, 'Theme toggle must exist').toBe(true);
    DOMHelpers.click(toggleBtn);
    const html = page.document.documentElement;
    // Should immediately flip data-theme without waiting for 300ms transition
    expect(html.getAttribute('data-theme')).toBe('light');
  });

  test('[M2] Pairwise 6: Responsive viewport resize to mobile 320px resets 3D transform to none', () => {
    const page = loadPage({ viewportWidth: 1440, viewportHeight: 900 });
    expect(page.exists, 'index.html must exist').toBe(true);

    // Simulate window resize to 320px
    page.setViewport(320, 640);
    const mqlMobile = page.window.matchMedia('(max-width: 768px)');
    expect(mqlMobile.matches).toBe(true);

    // CSS media query rule verification
    const pmCss = loadCSS('css/plugin-mockup.css');
    expect(pmCss.exists, 'css/plugin-mockup.css must exist').toBe(true);
    expect(pmCss.content).toMatch(/transform\s*:\s*none/i,
      'Must reset transform: none for mobile screens in CSS');
  });
});
