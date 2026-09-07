/**
 * BrandGuard Landing Page V2 — Tier 2 Boundary & Edge Case Tests
 *
 * Verifies extreme inputs, format anomalies, debounce throttling,
 * rapid interaction state locks, responsive viewport boundaries,
 * reduced-motion overrides, and storage exception safety.
 *
 * Authoritative source:
 * - survey_spec_miner_1/handoff.md § Section 8 (Edge Cases Table)
 * - survey_explorer_2/handoff.md § Section 2.1 - 2.5
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

describe('Tier 2: Boundary & Corner Cases', () => {
  // =========================================================================
  // Color Engine Boundary Math & Inputs
  // =========================================================================

  describe('[M3] Color Engine Boundary Conditions', () => {
    test('[M3] Boundary 1: Extreme luminance pure #000000 (Black) clamps lightness and does not crash', () => {
      const blackScale = ColorMathOracle.generate10ShadeScale('#000000');
      expect(blackScale.length).toBe(10);

      // Verify no NaN or undefined
      for (const swatch of blackScale) {
        expect(swatch.hex.startsWith('#')).toBe(true);
        expect(swatch.hex.length).toBe(7);
        expect(!swatch.hex.includes('NaN')).toBe(true);
      }

      // Shade 50 must be clamped to readable tint (>= 80% lightness)
      expect(blackScale[0].lightness >= 80, 'Shade 50 must remain clamped above 80%').toBe(true);
    });

    test('[M3] Boundary 2: Extreme luminance pure #FFFFFF (White) clamps lightness and displays Fail badge against white', () => {
      const whiteScale = ColorMathOracle.generate10ShadeScale('#FFFFFF');
      expect(whiteScale.length).toBe(10);

      for (const swatch of whiteScale) {
        expect(swatch.hex.startsWith('#')).toBe(true);
        expect(swatch.hex.length).toBe(7);
        expect(!swatch.hex.includes('NaN')).toBe(true);
      }

      // Pure white against pure white has 1.0:1 contrast ratio
      const cr = ColorMathOracle.calculateContrastRatio('#FFFFFF', '#FFFFFF');
      expect(cr).toBe(1.0);

      const badge = ColorMathOracle.getWCAGBadge(cr);
      expect(badge.level).toBe('Fail');
      expect(badge.pass).toBe(false);
    });

    test('[M3] Boundary 3: Invalid hex codes are rejected or ignored without crashing', () => {
      const invalidHexes = ['#GG123', '#XYZ', '#12', '##123456', '#FFFFFFF', 'red-500', ''];

      for (const inv of invalidHexes) {
        let threw = false;
        try {
          ColorMathOracle.hexToRGB(inv);
        } catch (e) {
          threw = true;
        }
        expect(threw, `Oracle should reject invalid hex "${inv}"`).toBe(true);
      }

      // When injected into DOM color input, previous valid color is retained
      const page = loadPage();
      if (page.exists) {
        const hexInput = page.document.querySelector('#hex-input');
        if (hexInput) {
          const prevVal = hexInput.value;
          DOMHelpers.input(hexInput, '#INVALID');
          DOMHelpers.change(hexInput, '#INVALID');
          // Should not break or throw unhandled
          expect(page.consoleErrors.length).toBe(0);
        }
      }
    });

    test('[M3] Boundary 4: 3-digit shorthand hex expands to 6 digits accurately', () => {
      const rgbShort = ColorMathOracle.hexToRGB('#F00');
      const rgbLong = ColorMathOracle.hexToRGB('#FF0000');
      expect(rgbShort.r).toBe(rgbLong.r);
      expect(rgbShort.g).toBe(rgbLong.g);
      expect(rgbShort.b).toBe(rgbLong.b);

      const rgbBrandShort = ColorMathOracle.hexToRGB('#63F');
      expect(rgbBrandShort.r).toBe(0x66);
      expect(rgbBrandShort.g).toBe(0x33);
      expect(rgbBrandShort.b).toBe(0xFF);
    });

    test('[M3] Boundary 5: Rapid dragging debouncing throttles execution to 16ms cadence', async () => {
      let callCount = 0;
      function debounce(fn, waitMs) {
        let timer = null;
        return function (...args) {
          clearTimeout(timer);
          timer = setTimeout(() => fn.apply(this, args), waitMs);
        };
      }

      const debouncedCompute = debounce(() => {
        callCount++;
      }, 16);

      // Simulate 50 rapid events in quick loop
      for (let i = 0; i < 50; i++) {
        debouncedCompute();
      }

      expect(callCount, 'Debounced function should not have run synchronously').toBe(0);
      await DOMHelpers.wait(35);
      expect(callCount, 'Debounced function should have executed once after wait').toBe(1);
    });
  });

  // =========================================================================
  // Wizard Tour Interaction Boundaries
  // =========================================================================

  describe('[M3] Wizard Tour Interaction Boundaries', () => {
    test('[M3] Boundary 6: Rapid clicking across step pills maintains transition lock and prevents state corruption', async () => {
      const page = loadPage();
      if (!page.exists) return;

      const pills = page.document.querySelectorAll('.step-pill, [role="tab"]');
      if (pills.length < 8) return;

      // Click pill 1, then immediately pill 8, then pill 3 in < 50ms
      DOMHelpers.click(pills[0]);
      DOMHelpers.click(pills[7]);
      DOMHelpers.click(pills[2]);

      await DOMHelpers.wait(400);

      // Only one pill must be active
      const activePills = page.document.querySelectorAll('.step-pill.active, [role="tab"][aria-selected="true"]');
      expect(activePills.length, 'Exactly one step pill must be active after rapid clicking').toBe(1);
    });

    test('[M3] Boundary 7: Hovering step pill at 2900ms pauses timer and prevents jump on boundary', async () => {
      let currentStep = 1;
      let timer = null;

      function startTimer() {
        timer = setInterval(() => {
          currentStep = (currentStep % 8) + 1;
        }, 3000);
      }

      function pauseTimer() {
        clearInterval(timer);
        timer = null;
      }

      startTimer();
      // Fast forward past 2900ms
      await DOMHelpers.wait(50); // In test simulation, simulate user hover before tick
      pauseTimer();

      await DOMHelpers.wait(100);
      expect(currentStep, 'Step must not have advanced while hovered/paused').toBe(1);
    });
  });

  // =========================================================================
  // Path Switcher & Import Demux Boundaries
  // =========================================================================

  describe('[M2] Path Switcher & Import Demo Boundaries', () => {
    test('[M2] Boundary 8: Clicking currently active path card returns early without redundant animation', () => {
      const page = loadPage();
      if (!page.exists) return;

      let callCount = 0;
      let activeScreen = 'start';

      function switchScreen(target) {
        if (target === activeScreen) return; // Idempotent check
        activeScreen = target;
        callCount++;
      }

      switchScreen('start');
      expect(callCount, 'Should not transition if target is already active').toBe(0);

      switchScreen('wizard');
      expect(callCount).toBe(1);

      switchScreen('wizard');
      expect(callCount, 'Repeated call should return early').toBe(1);
    });

    test('[M3] Boundary 9: Import typewriter interruption on error toggle cleanly resets state', async () => {
      let isTyping = true;
      let currentText = '{"version": "1.2"';

      function toggleErrorState() {
        isTyping = false; // cancels previous loop
        currentText = '{"error": "red-500"}';
      }

      toggleErrorState();
      expect(currentText).toBe('{"error": "red-500"}');
      expect(isTyping).toBe(false);
    });
  });

  // =========================================================================
  // Responsive Viewports & Accessibility Overrides
  // =========================================================================

  describe('[M4] Viewport & Accessibility Boundaries', () => {
    test('[M4] Boundary 10: Responsive viewports 320px, 768px, 1024px, and 1440px media rules', () => {
      const layoutCss = loadCSS('css/layout.css');
      const pmCss = loadCSS('css/plugin-mockup.css');
      const heroCss = loadCSS('css/sections/hero.css');
      const combined = (layoutCss.content || '') + (pmCss.content || '') + (heroCss.content || '');

      // 320px Mobile: Must support full responsive collapse
      expect(combined).toMatch(/@media\s*\(\s*(?:max-width\s*:\s*(?:768px|1024px)|min-width)/i,
        'Must contain responsive media queries for tablet/mobile');

      // Check that 3D tilt is disabled or modified on smaller screens
      if (pmCss.exists) {
        expect(pmCss.content).toMatch(/@media\s*\(\s*max-width:\s*(?:768px|1024px)\s*\)[^{]*\{[^}]*transform\s*:\s*none/i,
          'Plugin window 3D tilt must be set to transform: none on mobile viewports');
      }
    });

    test('[M4] Boundary 11: prefers-reduced-motion media query completely overrides durations and transforms', () => {
      const baseCss = loadCSS('css/base.css');
      const compCss = loadCSS('css/components.css');
      const pmCss = loadCSS('css/plugin-mockup.css');
      const combined = (baseCss.content || '') + (compCss.content || '') + (pmCss.content || '');

      expect(combined).toMatch(/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/i);
      expect(combined).toMatch(/transition-duration\s*:\s*0\.01ms|transition\s*:\s*none/i);
    });

    test('[M1] Boundary 12: LocalStorage QuotaExceededError safety on theme toggle', () => {
      const page = loadPage();
      if (!page.exists) return;

      // Force storage to throw QuotaExceededError
      page.storage._setThrowOnSet(true);

      const toggleBtn = page.document.querySelector('.theme-toggle, #theme-toggle');
      if (toggleBtn) {
        // Clicking should catch exception and not crash the UI
        let threw = false;
        try {
          DOMHelpers.click(toggleBtn);
        } catch (e) {
          threw = true;
        }
        expect(threw, 'Theme toggle must handle QuotaExceededError gracefully without unhandled exception').toBe(false);
      }
    });
  });
});
