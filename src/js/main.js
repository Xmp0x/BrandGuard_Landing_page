/* ============================================================
   BrandGuard Landing Page — Main Application Entry Point
   File: js/main.js
   Sprint: 3 (Hero Section, GSAP Stagger Entrance & Lenis)
   Module: ES Module
   ============================================================ */

import { initGSAPAndLenis, getLenis, scrollToTarget } from './gsap-setup.js';
import { initHeroAnimation } from './sections/hero-anim.js';

/**
 * Safely imports and runs a module initializer with error isolation.
 * Prevents errors in one section from breaking the entire application.
 * @param {string} moduleName
 * @param {Function} initFn
 */
function safeInit(moduleName, initFn) {
  try {
    initFn();
  } catch (err) {
    console.error(`[App] Error initializing ${moduleName}:`, err);
  }
}

/**
 * Master Application Initialization
 */
async function initApp() {
  // ── 1. Initialize Lenis Smooth Scroll & GSAP Ticker Core ──
  const { lenis, mm, isReducedMotion } = initGSAPAndLenis();

  // ── 2. Initialize Sticky Navigation & Theme Toggle (Sprint 2) ──
  try {
    const themeModule = await import('./demos/theme-toggle.js').catch(() => null);
    if (themeModule && typeof themeModule.initThemeToggle === 'function') {
      safeInit('Theme Toggle', themeModule.initThemeToggle);
    }
  } catch (err) {
    console.warn('[App] Optional theme-toggle.js module not available yet:', err);
  }

  // ── 3. Initialize Hero Section Entrance Animation (Sprint 3) ──
  safeInit('Hero Animation', initHeroAnimation);

  // ── 4. Conditionally Load Downstream Sprints if Elements Exist ──
  // Path Cards Demo (Sprint 5)
  if (document.querySelector('.pm-window') || document.querySelector('.pm-card')) {
    import('./sections/path-cards.js')
      .then((m) => m.initPathCards && safeInit('Path Cards', m.initPathCards))
      .catch(() => {});
  }

  // Color Engine Demo (Sprint 6)
  if (document.querySelector('#color-engine') || document.querySelector('.color-picker-input')) {
    import('./demos/color-picker.js')
      .then((m) => m.initColorPicker && safeInit('Color Picker', m.initColorPicker))
      .catch(() => {});
  }

  // Wizard Tour Tabs (Sprint 7)
  if (document.querySelector('#wizard-tour') || document.querySelector('.wizard-step-pill')) {
    import('./demos/wizard-tabs.js')
      .then((m) => m.initWizardTabs && safeInit('Wizard Tabs', m.initWizardTabs))
      .catch(() => {});
  }

  // Token Output Counter (Sprint 8)
  if (document.querySelector('#tokens') || document.querySelector('.token-counter-section')) {
    import('./demos/token-counter.js')
      .then((m) => m.initTokenCounter && safeInit('Token Counter', m.initTokenCounter))
      .catch(() => {});
  }

  // Import Demo (Sprint 9)
  if (document.querySelector('#json-typing-area')) {
    import('./demos/import-demo.js')
      .then((m) => m.initImportDemo && safeInit('Import Demo', m.initImportDemo))
      .catch(() => {});
  }

  // ── 5. Global Smooth Scroll Anchor Delegation ─────────────
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest && e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const targetId = anchor.getAttribute('href');
    if (targetId && targetId !== '#' && targetId.length > 1) {
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        scrollToTarget(targetElement, { offset: -70 });
      }
    }
  });

  // Log ready state
  console.info(
    `%c BrandGuard %c Landing Page V2 Initialized %c`,
    'background:#4F46E5; color:white; font-weight:bold; border-radius:3px 0 0 3px; padding:2px 6px;',
    'background:#181820; color:#0FFA8C; font-weight:bold; border-radius:0 3px 3px 0; padding:2px 6px;',
    'background:transparent;'
  );
}

// ── DOM Ready Lifecycle Handling ──────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  // DOM already interactive
  initApp();
}

export { initApp, getLenis, scrollToTarget };
