/* ============================================================
   BrandGuard Landing Page — GSAP & Lenis Setup
   File: js/gsap-setup.js
   Sprint: 3 (Hero Section, GSAP Stagger Entrance & Lenis)
   Module: ES Module
   ============================================================ */

let lenisInstance = null;
let gsapMatchMediaInstance = null;
let isInitialized = false;

/**
 * Checks if the user prefers reduced motion.
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  return typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Returns the active Lenis smooth scroll instance.
 * @returns {object|null}
 */
export function getLenis() {
  return lenisInstance;
}

/**
 * Returns the active GSAP matchMedia instance.
 * @returns {object|null}
 */
export function getMatchMedia() {
  return gsapMatchMediaInstance;
}

/**
 * Smoothly scrolls to a target selector or element.
 * Respects Lenis when active, falls back to native window.scrollTo.
 * @param {string|HTMLElement} target - CSS selector or element
 * @param {object} [options] - Optional config (offset, duration)
 */
export function scrollToTarget(target, options = {}) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;

  if (lenisInstance && !prefersReducedMotion()) {
    lenisInstance.scrollTo(element, {
      offset: options.offset ?? -70,
      duration: options.duration ?? 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });
  } else {
    const targetY = element.getBoundingClientRect().top + window.scrollY + (options.offset ?? -70);
    window.scrollTo({
      top: targetY,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth'
    });
  }
}

/**
 * Initializes Lenis Smooth Scrolling and bridges it with GSAP ScrollTrigger ticker.
 * Configures lagSmoothing(0) and sets up gsap.matchMedia for responsive motion.
 * @returns {{ lenis: object|null, mm: object|null, isReducedMotion: boolean }}
 */
export function initGSAPAndLenis() {
  if (isInitialized) {
    return { lenis: lenisInstance, mm: gsapMatchMediaInstance, isReducedMotion: prefersReducedMotion() };
  }

  const isReduced = prefersReducedMotion();

  // ── 1. Check GSAP & ScrollTrigger Availability ──────────────
  if (typeof window === 'undefined' || typeof window.gsap === 'undefined') {
    console.warn('[GSAP Setup] GSAP core library is not loaded on window. Ensure CDN script tag is included in index.html.');
    return { lenis: null, mm: null, isReducedMotion: isReduced };
  }

  const { gsap } = window;

  if (typeof window.ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(window.ScrollTrigger);
  } else {
    console.warn('[GSAP Setup] ScrollTrigger plugin is not loaded on window.');
  }

  // ── 2. Initialize Lenis Smooth Scroll ────────────────────────
  if (typeof window.Lenis !== 'undefined') {
    try {
      lenisInstance = new window.Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: !isReduced,
        mouseMultiplier: 1,
        smoothTouch: false, // Preserve native mobile swipe and momentum
        touchMultiplier: 2,
        infinite: false
      });

      // Expose globally for debugging and accessibility controls
      window.__lenis = lenisInstance;

      // ── 3. Connect Lenis to GSAP ScrollTrigger Ticker ───────
      if (typeof window.ScrollTrigger !== 'undefined') {
        lenisInstance.on('scroll', window.ScrollTrigger.update);
      }

      // Drive Lenis strictly through GSAP ticker for 60fps frame sync
      gsap.ticker.add((time) => {
        lenisInstance.raf(time * 1000);
      });

      // lagSmoothing(0) prevents jumpy visual catch-up desync
      gsap.ticker.lagSmoothing(0);

    } catch (err) {
      console.error('[GSAP Setup] Failed to initialize Lenis smooth scrolling:', err);
      lenisInstance = null;
    }
  } else {
    console.warn('[GSAP Setup] Lenis library is not loaded on window. Smooth scrolling disabled.');
  }

  // ── 4. Set up gsap.matchMedia for Accessibility ─────────────
  if (typeof gsap.matchMedia === 'function') {
    gsapMatchMediaInstance = gsap.matchMedia();
  }

  // ── 5. Listen for OS reduced-motion changes at runtime ──────
  if (window.matchMedia) {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e) => {
      if (lenisInstance) {
        if (e.matches) {
          lenisInstance.stop();
        } else {
          lenisInstance.start();
        }
      }
    };
    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', handleMotionChange);
    } else if (motionQuery.addListener) {
      motionQuery.addListener(handleMotionChange);
    }
  }

  isInitialized = true;
  return {
    lenis: lenisInstance,
    mm: gsapMatchMediaInstance,
    isReducedMotion: isReduced
  };
}
