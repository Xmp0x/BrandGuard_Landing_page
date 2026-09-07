// ============================================================
// BrandGuard Landing Page — Dual-Theme Toggle Engine & Nav Controller
// Sprint 2 Implementation
// ============================================================

const THEME_STORAGE_KEY = 'brandguard-theme';
const VALID_THEMES = ['dark', 'light'];

/**
 * Safely retrieve stored theme from localStorage with error trapping
 * Fallback to system preference (matchMedia), defaulting to dark
 * @returns {'dark' | 'light'}
 */
export function getSavedTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && VALID_THEMES.includes(stored)) {
      return stored;
    }
  } catch (err) {
    console.warn('[BrandGuard] localStorage read restricted:', err);
  }

  // Check system preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    return prefersLight ? 'light' : 'dark';
  }

  return 'dark'; // BrandGuard dark-first default
}

/**
 * Apply theme to document, update colorScheme, meta tags, button ARIA & icons
 * @param {'dark' | 'light'} theme
 * @param {boolean} persist - Whether to write to localStorage
 */
export function applyTheme(theme, persist = true) {
  if (!VALID_THEMES.includes(theme)) {
    theme = 'dark';
  }

  const root = document.documentElement;
  const isDark = theme === 'dark';

  // 1. Mutate data-theme on <html>
  root.setAttribute('data-theme', theme);

  // 2. Set native CSS color-scheme
  root.style.colorScheme = theme;

  // 3. Update meta tag if present
  const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
  if (metaColorScheme) {
    metaColorScheme.setAttribute('content', theme);
  }

  // 4. Safe localStorage persistence with error trapping (QuotaExceededError safety)
  if (persist) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (err) {
      console.warn('[BrandGuard] localStorage write failed (private browsing or quota):', err);
    }
  }

  // 5. Update all theme toggle buttons across the page (desktop & mobile)
  const buttons = document.querySelectorAll('.btn-theme-toggle, .theme-toggle, [data-theme-toggle]');
  buttons.forEach((btn) => {
    btn.setAttribute('aria-pressed', isDark ? 'false' : 'true');
    const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', label);
  });

  // 6. Broadcast event for other page components (interactive demos, canvas, plugin mockup)
  if (typeof window !== 'undefined' && typeof window.CustomEvent === 'function') {
    window.dispatchEvent(
      new CustomEvent('brandguard:themechange', {
        detail: { theme, isDark }
      })
    );
  }
}

/**
 * Toggle between 'dark' and 'light'
 */
export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || getSavedTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next, true);
  return next;
}

/**
 * Initialize Mobile Hamburger Navigation Menu Controller
 */
export function initMobileNav() {
  const toggleBtn = document.getElementById('mobile-nav-toggle');
  const mobileMenu = document.getElementById('mobile-nav-menu');
  if (!toggleBtn || !mobileMenu) return;

  const backdrop = mobileMenu.querySelector('.mobile-menu-backdrop');
  const links = mobileMenu.querySelectorAll('.mobile-nav-link, .mobile-cta');

  function openMenu() {
    toggleBtn.classList.add('is-active');
    toggleBtn.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.setAttribute('data-nav-open', 'true');
  }

  function closeMenu() {
    toggleBtn.classList.remove('is-active');
    toggleBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.removeAttribute('data-nav-open');
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = toggleBtn.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Dismiss on backdrop click
  if (backdrop) {
    backdrop.addEventListener('click', () => closeMenu());
  }

  // Dismiss on nav link click
  links.forEach((link) => {
    link.addEventListener('click', () => closeMenu());
  });

  // Dismiss on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggleBtn.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      toggleBtn.focus();
    }
  });

  // Close menu if viewport resizes above mobile breakpoint
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && toggleBtn.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    }
  });
}

/**
 * Initialize Header Scroll Shadow State
 */
export function initNavScrollState() {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;

  const updateScrollState = () => {
    if (window.scrollY > 20) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', updateScrollState, { passive: true });
  updateScrollState();
}

/**
 * Main Entry Point: Initialize Theme Toggle Engine & Listeners
 */
export function initThemeToggle() {
  // Flag that ES module theme engine is active to deactivate early inline delegator
  if (typeof window !== 'undefined') {
    window.__bgThemeModuleLoaded = true;
  }

  // 1. Sync current DOM theme with saved/detected theme
  const initialTheme = document.documentElement.getAttribute('data-theme') || getSavedTheme();
  applyTheme(initialTheme, false);

  // 2. Attach click handlers to all theme toggle buttons
  const buttons = document.querySelectorAll('.btn-theme-toggle, .theme-toggle, [data-theme-toggle]');
  buttons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleTheme();
    });
  });

  // 3. Multi-Tab Synchronization via 'storage' event
  window.addEventListener('storage', (event) => {
    if (event.key === THEME_STORAGE_KEY) {
      const newTheme = event.newValue;
      if (newTheme && VALID_THEMES.includes(newTheme)) {
        applyTheme(newTheme, false);
      }
    }
  });

  // 4. OS System Preference Change Listener
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e) => {
      // Only react if the user has NOT explicitly stored a manual override
      let hasManualOverride = false;
      try {
        hasManualOverride = !!localStorage.getItem(THEME_STORAGE_KEY);
      } catch (_) {}

      if (!hasManualOverride) {
        applyTheme(e.matches ? 'dark' : 'light', false);
      }
    };

    if (mql.addEventListener) {
      mql.addEventListener('change', handleSystemChange);
    } else if (mql.addListener) {
      mql.addListener(handleSystemChange);
    }
  }

  // 5. Initialize accompanying nav controllers
  initMobileNav();
  initNavScrollState();
}

export default initThemeToggle;
