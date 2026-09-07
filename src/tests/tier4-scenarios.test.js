/**
 * BrandGuard Landing Page V2 — Tier 4 Real-World User Scenarios
 *
 * Simulates complete end-to-end user journeys through the landing page:
 * - Scenario 1: Complete Product Walkthrough (Nav -> Hero -> 3 Paths -> Color Engine -> Wizard Tour -> Token Rain -> Import Demo -> Presets -> CTA)
 * - Scenario 2: Theme Persistence & Anti-FOUC Page Reload Journey
 * - Scenario 3: Heavy Interaction & Adversarial Stress Journey
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

describe('Tier 4: Real-World User Journeys & Scenarios', () => {
  test('[M5] Scenario 1: Full Page Exploration and Product Discovery Journey', async () => {
    const page = loadPage({ viewportWidth: 1440, viewportHeight: 900 });
    expect(page.exists, 'index.html must exist').toBe(true);

    // 1. User arrives at page in default dark theme
    const html = page.document.documentElement;
    expect(html.getAttribute('data-theme') || 'dark').toBe('dark');

    // 2. User inspects sticky navigation
    const nav = page.document.querySelector('nav, .site-nav');
    expect(nav !== null, 'Navigation bar must exist').toBe(true);

    // 3. User views Hero section and plugin mockup
    const heroH1 = page.document.querySelector('.hero h1, .section-hero h1, h1');
    expect(heroH1 !== null, 'Hero H1 must exist').toBe(true);

    const pmWindow = page.document.querySelector('.pm-window');
    expect(pmWindow !== null, 'Plugin window must exist').toBe(true);

    // 4. User explores all 3 Paths bento cards in succession
    const pathCards = page.document.querySelectorAll('.pm-path-card, .bento-card, [data-path]');
    expect(pathCards.length >= 3, 'Path bento cards must exist').toBe(true);
    for (const card of pathCards) {
      DOMHelpers.click(card);
      await DOMHelpers.wait(100);
    }

    // 5. User customizes Color Engine with #8B5CF6 (Royal Purple)
    const hexInput = page.document.querySelector('#hex-input');
    expect(hexInput !== null, '#hex-input must exist').toBe(true);
    DOMHelpers.input(hexInput, '#8B5CF6');
    DOMHelpers.change(hexInput, '#8B5CF6');

    // Verify mathematical oracle output for #8B5CF6
    const purpleScale = ColorMathOracle.generate10ShadeScale('#8B5CF6');
    expect(purpleScale.length).toBe(10);
    const crPurple = ColorMathOracle.calculateContrastRatio('#8B5CF6', '#FFFFFF');
    expect(crPurple >= 3.0, 'Purple contrast against white should be >= 3.0').toBe(true);

    // 6. User steps through Wizard Tour
    const stepPills = page.document.querySelectorAll('.step-pill, [role="tab"]');
    expect(stepPills.length >= 8, 'Step pills must exist').toBe(true);
    // Click step 3 (Spacing)
    DOMHelpers.click(stepPills[2]);
    await DOMHelpers.wait(50);
    // Click step 5 (Radius)
    DOMHelpers.click(stepPills[4]);
    await DOMHelpers.wait(50);

    // 7. User reaches Final CTA
    const installBtn = page.document.querySelector('.section-cta a.btn-primary, #final-cta a.btn, a[href*="figma"]');
    expect(installBtn !== null, 'Final install CTA button must exist').toBe(true);

    // 8. Verify no uncaught console errors occurred during exploration
    expect(page.consoleErrors.length).toBe(0);
  });

  test('[M1] Scenario 2: Theme Persistence & Anti-FOUC Reload Journey', () => {
    // Stage 1: User visits page for first time (defaults to dark)
    const page1 = loadPage({ storage: {} });
    expect(page1.exists, 'index.html must exist').toBe(true);

    const toggleBtn1 = page1.document.querySelector('.theme-toggle, #theme-toggle');
    expect(toggleBtn1 !== null, 'Theme toggle must exist').toBe(true);

    // User switches to Light theme
    DOMHelpers.click(toggleBtn1);

    // Verify theme switched and recorded to storage
    const currentTheme = page1.document.documentElement.getAttribute('data-theme');
    expect(currentTheme).toBe('light');
    expect(page1.storage.getItem('brandguard-theme')).toBe('light');

    // Stage 2: User refreshes / reloads the page
    // New page load with persisted localStorage
    const page2 = loadPage({ storage: { 'brandguard-theme': 'light' } });
    const html2 = page2.document.documentElement;

    // Anti-FOUC script must immediately set data-theme="light"
    expect(html2.getAttribute('data-theme')).toBe('light');

    // User toggles back to Dark theme
    const toggleBtn2 = page2.document.querySelector('.theme-toggle, #theme-toggle');
    expect(toggleBtn2 !== null, 'Theme toggle must exist on reload').toBe(true);
    DOMHelpers.click(toggleBtn2);
    expect(page2.document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(page2.storage.getItem('brandguard-theme')).toBe('dark');
  });

  test('[M5] Scenario 3: Comprehensive Stress & Error Recovery Journey', async () => {
    const page = loadPage();
    expect(page.exists, 'index.html must exist').toBe(true);

    // 1. Rapid invalid hex entries in Color Engine
    const hexInput = page.document.querySelector('#hex-input');
    if (hexInput) {
      const inputs = ['#123', '#XYZ999', 'not-a-color', '###', '#000000', '#FFFFFF', '#6366F1'];
      for (const val of inputs) {
        DOMHelpers.input(hexInput, val);
        DOMHelpers.change(hexInput, val);
      }
    }

    // 2. Rapid wizard stepping (1 to 8 in quick succession)
    const pills = page.document.querySelectorAll('.step-pill, [role="tab"]');
    for (const pill of pills) {
      DOMHelpers.click(pill);
    }
    await DOMHelpers.wait(200);

    // 3. Toggle JSON error state on and off
    const errorToggle = page.document.querySelector('#toggle-error-state, .btn-error-toggle');
    if (errorToggle) {
      DOMHelpers.click(errorToggle);
      await DOMHelpers.wait(50);
      DOMHelpers.click(errorToggle);
      await DOMHelpers.wait(50);
    }

    // Verify zero fatal browser exceptions
    expect(page.consoleErrors.length).toBe(0);
  });
});
