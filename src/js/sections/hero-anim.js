/* ============================================================
   BrandGuard Landing Page — Hero Entrance Animation
   File: js/sections/hero-anim.js
   Sprint: 3 (Hero Section, GSAP Stagger Entrance & Lenis)
   Module: ES Module
   ============================================================ */

import { scrollToTarget, getMatchMedia, prefersReducedMotion } from '../gsap-setup.js';

/**
 * Splits text within a headline element into individual `.word` span elements,
 * preserving `<br>` tags and spaces, so GSAP can animate them sequentially.
 * If `.word` spans already exist in HTML, this function leaves them intact.
 * @param {HTMLElement} headlineEl
 */
function ensureHeadlineWordSpans(headlineEl) {
  if (!headlineEl) return;
  const existingWords = headlineEl.querySelectorAll('.word');
  if (existingWords.length > 0) return;

  // Process child nodes to wrap words while preserving child elements (like <br> or gradient spans)
  const childNodes = Array.from(headlineEl.childNodes);
  headlineEl.innerHTML = '';

  childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      const tokens = text.split(/(\s+)/); // Keep whitespace tokens
      tokens.forEach((token) => {
        if (!token) return;
        if (/^\s+$/.test(token)) {
          headlineEl.appendChild(document.createTextNode(token));
        } else {
          const span = document.createElement('span');
          span.className = 'word';
          span.textContent = token;
          headlineEl.appendChild(span);
        }
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName.toLowerCase() === 'br') {
        headlineEl.appendChild(node);
      } else if (node.classList.contains('hero-headline-gradient')) {
        // Recursively split words inside gradient wrapper
        const innerText = node.textContent;
        node.innerHTML = '';
        const tokens = innerText.split(/(\s+)/);
        tokens.forEach((token) => {
          if (!token) return;
          if (/^\s+$/.test(token)) {
            node.appendChild(document.createTextNode(token));
          } else {
            const span = document.createElement('span');
            span.className = 'word';
            span.textContent = token;
            node.appendChild(span);
          }
        });
        headlineEl.appendChild(node);
      } else {
        headlineEl.appendChild(node);
      }
    }
  });
}

/**
 * Initializes the cinematic Hero entrance animation timeline.
 * Animates:
 * 1. .hero-badge
 * 2. .hero-headline .word (stagger: 0.08, duration: 0.7, ease: 'power3.out')
 * 3. .hero-subtext
 * 4. .hero-ctas
 * 5. .hero-stats (social proof micro-bar)
 * 6. .hero-visual (mockup container fade and scale-in; preserves CSS 3D perspective tilt on child .pm-window)
 * 7. .hero-scroll-indicator
 */
export function initHeroAnimation() {
  const heroSection = document.querySelector('#hero');
  if (!heroSection) return;

  const headline = heroSection.querySelector('.hero-headline');
  if (headline) {
    ensureHeadlineWordSpans(headline);
  }

  // Bind smooth click-to-scroll on scroll indicator
  const scrollIndicator = heroSection.querySelector('.hero-scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', (e) => {
      e.preventDefault();
      const targetHash = scrollIndicator.getAttribute('href') || '#paths';
      scrollToTarget(targetHash, { offset: -60 });
    });
  }

  // Bind smooth scroll on ghost demo button if targeting an anchor
  const demoBtn = heroSection.querySelector('.hero-cta-ghost, .cta-secondary');
  if (demoBtn && demoBtn.getAttribute('href')?.startsWith('#')) {
    demoBtn.addEventListener('click', (e) => {
      const targetHash = demoBtn.getAttribute('href');
      if (targetHash && targetHash !== '#') {
        e.preventDefault();
        scrollToTarget(targetHash, { offset: -60 });
      }
    });
  }

  // If GSAP is missing, ensure all elements are visible and exit gracefully
  if (typeof window === 'undefined' || typeof window.gsap === 'undefined') {
    const allAnimated = heroSection.querySelectorAll(
      '.hero-badge, .hero-headline .word, .hero-subtext, .hero-ctas, .hero-stats, .hero-visual, .hero-scroll-indicator'
    );
    allAnimated.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  const { gsap } = window;
  const matchMediaInstance = getMatchMedia() || (gsap.matchMedia ? gsap.matchMedia() : null);

  if (matchMediaInstance) {
    // ── Standard Motion Timeline ─────────────────────────────
    matchMediaInstance.add('(prefers-reduced-motion: no-preference)', () => {
      const heroTl = gsap.timeline({
        delay: 0.25,
        defaults: {
          ease: 'power3.out'
        }
      });

      // 1. Pill Badge
      heroTl.fromTo(
        '.hero-badge',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 }
      )
      // 2. Headline Words Stagger Entrance
      .fromTo(
        '.hero-headline .word',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out'
        },
        '-=0.3'
      )
      // 3. Subtext
      .fromTo(
        '.hero-subtext',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        '-=0.3'
      )
      // 4. CTAs
      .fromTo(
        '.hero-ctas',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        '-=0.2'
      )
      // 5. Social Proof Micro-Bar
      .fromTo(
        '.hero-stats',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        '-=0.2'
      )
      // 6. Hero Mockup Visual Container (preserves CSS 3D perspective tilt on child .pm-window)
      .fromTo(
        '.hero-visual',
        { opacity: 0, y: 35, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, clearProps: 'transform' },
        '-=0.4'
      )
      // 7. Scroll Chevron Indicator
      .fromTo(
        '.hero-scroll-indicator',
        { opacity: 0, y: 15 },
        { opacity: 0.8, y: 0, duration: 0.5 },
        '-=0.2'
      );

      return () => {
        heroTl.kill();
      };
    });

    // ── Reduced Motion Accessibility Fallback ────────────────
    matchMediaInstance.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set([
        '.hero-badge',
        '.hero-headline .word',
        '.hero-subtext',
        '.hero-ctas',
        '.hero-stats',
        '.hero-visual',
        '.pm-window',
        '.hero-plugin-window',
        '.hero-scroll-indicator'
      ], {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        clearProps: 'transform'
      });
    });

  } else {
    // Fallback if matchMedia is unavailable in older GSAP versions
    if (prefersReducedMotion()) {
      const els = heroSection.querySelectorAll(
        '.hero-badge, .hero-headline .word, .hero-subtext, .hero-ctas, .hero-stats, .hero-visual, .pm-window, .hero-plugin-window, .hero-scroll-indicator'
      );
      els.forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    } else {
      const heroTl = gsap.timeline({ delay: 0.25, defaults: { ease: 'power3.out' } });
      heroTl
        .fromTo('.hero-badge', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 })
        .fromTo('.hero-headline .word', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, '-=0.3')
        .fromTo('.hero-subtext', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.3')
        .fromTo('.hero-ctas', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.2')
        .fromTo('.hero-stats', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.2')
        .fromTo('.hero-visual', { opacity: 0, y: 35, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, clearProps: 'transform' }, '-=0.4')
        .fromTo('.hero-scroll-indicator', { opacity: 0, y: 15 }, { opacity: 0.8, y: 0, duration: 0.5 }, '-=0.2');
    }
  }
}
