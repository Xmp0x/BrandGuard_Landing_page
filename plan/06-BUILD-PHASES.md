# Phase 6 — Build Phases (Sprint Breakdown)

> This document translates the plan into an ordered execution sequence for the developer (Opencode). Each sprint is one focused session.

---

## Pre-Build Checklist

Before writing a single line of HTML:

- [ ] Read all plan files (00 through 05)
- [ ] Understand the plugin UI source (src/ui/pages/*.tsx and src/ui/components/*)
- [ ] Check logo assets: src/assets/BrandGuardLogo.tsx, logo/ folder
- [ ] Confirm font loading strategy (Google Fonts vs self-hosted)
- [ ] Set up folder structure: Landing_Page/src/

---

## Sprint 1 — Foundation (CSS Tokens + Base)

**Goal:** Every CSS variable and base style, nothing visual yet.

**Files to create:**
```
Landing_Page/src/
  css/
    tokens.css       <- All :root { --var } from plan/01-DESIGN-LANGUAGE.md
    base.css         <- CSS reset + body + font imports + dot grid bg
    layout.css       <- Container, section, grid system
    components.css   <- Button, badge, pill, stat card
  index.html         <- Shell: head + empty body sections
```

**Deliverable:** Open index.html — see dark page with dot grid, correct font loaded.

**Token Checklist:**
- [ ] All color tokens (primary, mint, sky, neutral, semantic)
- [ ] Surface system (dark + light)
- [ ] Typography scale
- [ ] Spacing tokens
- [ ] Border radius tokens
- [ ] Shadow + glow tokens
- [ ] Motion tokens (duration + easing)
- [ ] pm- namespace tokens (plugin mockup)

---

## Sprint 2 — Navigation

**Goal:** Sticky nav with logo + theme toggle that works.

**Files:**
```
Landing_Page/src/
  css/sections/nav.css
  js/demos/theme-toggle.js
```

**Nav Structure:**
```html
<nav class="site-nav" role="navigation">
  <div class="nav-inner">
    <a href="#" class="nav-logo" aria-label="BrandGuard home">
      [logo] BrandGuard
    </a>
    <div class="nav-links">
      <a href="#features">Features</a>
      <a href="#demo">Demo</a>
      <a href="#presets">Presets</a>
    </div>
    <div class="nav-actions">
      <button class="btn-theme-toggle" aria-label="Toggle dark mode">
        <!-- sun/moon SVG -->
      </button>
      <a href="#" class="btn-primary btn-sm">Install Free</a>
    </div>
  </div>
</nav>
```

**Deliverable:** Sticky nav, theme toggle switches dark/light mode.

---

## Sprint 3 — Hero Section

**Goal:** Full hero with layout, copy, animated headline. NO plugin window yet.

**Files:**
```
Landing_Page/src/
  css/sections/hero.css
  js/sections/hero-anim.js
  js/gsap-setup.js         <- Initialize GSAP + Lenis here
```

**Build Order:**
1. Install GSAP via CDN: `<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js">`
2. Install ScrollTrigger: same CDN
3. Install Lenis: `<script src="https://cdn.jsdelivr.net/gh/darkroomengineering/lenis@2/bundled/lenis.min.js">`
4. Hero HTML structure (two columns)
5. Hero CSS (grid, amb orbs, scroll indicator)
6. GSAP entrance: headline words stagger in (SplitText or manual spans)
7. Lenis smooth scroll init

**Hero entrance GSAP timeline:**
```js
const heroTl = gsap.timeline({ delay: 0.3 });
heroTl
  .from(".hero-badge", { y: 20, opacity: 0, duration: 0.5, ease: "power3.out" })
  .from(".hero-headline .word", { 
    y: 40, opacity: 0, duration: 0.7, stagger: 0.08, ease: "power3.out"
  }, "-=0.3")
  .from(".hero-subtext", { y: 20, opacity: 0, duration: 0.5, ease: "power3.out" }, "-=0.3")
  .from(".hero-ctas", { y: 20, opacity: 0, duration: 0.5, ease: "power3.out" }, "-=0.2")
  .from(".hero-stats", { y: 20, opacity: 0, duration: 0.5, ease: "power3.out" }, "-=0.2");
```

**Deliverable:** Hero section renders with smooth entrance animation.

---

## Sprint 4 — Plugin Window CSS Component

**Goal:** The pixel-perfect plugin window CSS component (all screens).

**Files:**
```
Landing_Page/src/
  css/plugin-mockup.css    <- Window chrome + all pm- styles
  js/plugin-mockup.js      <- Screen switching logic
```

**Build Order:**
1. Plugin window chrome (title bar, traffic lights, content area)
2. CSS for pm- namespace (all variables from plan/05)
3. Start Page screen HTML (pm-startpage)
4. Apply 3D tilt transform
5. Add to hero section layout
6. Test hover state (reduced tilt on hover)

**Deliverable:** Plugin window renders in hero section with correct 3D tilt.

---

## Sprint 5 — Path Cards Section + Demo

**Goal:** 3 interactive path cards + plugin window responds to clicks.

**Files:**
```
Landing_Page/src/
  css/sections/demo-paths.css
  js/sections/path-cards.js
```

**Build Order:**
1. Section HTML: 3 bento cards side by side
2. CSS: bento-outer/bento-inner pattern per plan/01
3. Card hover animations (translateY + glow)
4. Screen 2 HTML: wizard page 1 (for Guided Path)
5. Screen 3 HTML: preset selector (for Fast Path)
6. Screen 4 HTML: file upload (for Import Path)
7. JS: click handler → showScreen() function from plan/05
8. ScrollTrigger: cards stagger in from bottom

**Deliverable:** Click cards, plugin window switches screens smoothly.

---

## Sprint 6 — Live Color Engine Demo

**Goal:** Fully functional color picker → 10-shade scale live update.

**Files:**
```
Landing_Page/src/
  css/sections/color-engine.css
  js/demos/color-picker.js
```

**Algorithm (from plan/03):**
```js
function generateShadeScale(hex) {
  const hsl = hexToHSL(hex);
  const stops = [50,100,200,300,400,500,600,700,800,900];
  const lightnesses = [96, 91, 80, 68, 55, 45, 36, 27, 18, 10];
  return stops.map((stop, i) => ({
    stop,
    hex: hslToHex(hsl.h, Math.min(hsl.s * 0.9, 95), lightnesses[i])
  }));
}
```

**Deliverable:** Move color picker, watch swatches update live + WCAG badge.

---

## Sprint 7 — Wizard Tour Section

**Goal:** 8-step wizard navigator with auto-advance.

**Files:**
```
Landing_Page/src/
  css/sections/wizard-tour.css
  js/demos/wizard-tabs.js
```

**Build Order:**
1. Section HTML: step pills (8 buttons) + plugin window (right)
2. Wizard screen variants HTML (steps 1–8, simplified)
3. JS: state machine + auto-advance timer (3s)
4. Callout card per step
5. ScrollTrigger: pins section while steps cycle, then releases

**Deliverable:** Wizard auto-advances through all 8 steps, cards update.

---

## Sprint 8 — Token Rain Animation

**Goal:** The 380-token cascade animation section.

**Files:**
```
Landing_Page/src/
  css/sections/token-output.css
  js/demos/token-counter.js
```

**Build Order:**
1. Dark section background
2. Token rain: 30 div elements, CSS animation keyframes (fall downward)
3. Random positioning: each token gets random left% and animation-delay
4. Color coding: token type prefix determines color class
5. Counter: 0→380 GSAP animation triggered by ScrollTrigger
6. Figma logo icon at bottom (SVG)
7. Stat badges: color 120, typography 45, spacing 24, etc.

**Deliverable:** Tokens rain down and counter animates on scroll.

---

## Sprint 9 — Import Demo + Presets Carousel

**Goal:** JSON typewriter demo + 7-preset horizontal carousel.

**Files:**
```
Landing_Page/src/
  css/sections/import-demo.css
  css/sections/presets.css
  js/demos/wizard-tabs.js    <- extend for presets
```

**Deliverable:** Import demo types in, presets carousel scrolls smoothly.

---

## Sprint 10 — Social Proof + CTA + Footer

**Goal:** Complete the page.

**Files:**
```
Landing_Page/src/
  css/sections/social-proof.css
  css/sections/cta.css
  css/sections/footer.css
```

**Deliverable:** Full page renders top to bottom.

---

## Sprint 11 — Polish Pass

**Goal:** Make it feel award-winning.

**Checklist:**
- [ ] All ScrollTrigger animations tuned (timing, stagger, ease)
- [ ] Hover states feel responsive (150ms spring)
- [ ] Dark/light mode: every element tested in both
- [ ] Responsive: tested at 320px, 768px, 1024px, 1440px
- [ ] No janky scroll moments (Lenis working everywhere)
- [ ] prefers-reduced-motion tested
- [ ] Keyboard navigation through all interactive demos
- [ ] Open Graph image created (og-image.png)
- [ ] Page title + meta description
- [ ] Favicon

---

## Sprint 12 — Performance Optimization

**Goal:** Lighthouse 95+

**Checklist:**
- [ ] Font preconnect + display=swap
- [ ] GSAP loaded async / defer
- [ ] Images optimized (if any screenshots)
- [ ] CSS purged (no unused rules)
- [ ] `content-visibility: auto` on offscreen sections
- [ ] No CLS — all images/elements have reserved dimensions
- [ ] First paint < 1s (measure with Lighthouse)

---

## File Creation Order Summary

```
Sprint 1:  tokens.css, base.css, layout.css, components.css, index.html
Sprint 2:  nav.css, theme-toggle.js
Sprint 3:  hero.css, hero-anim.js, gsap-setup.js
Sprint 4:  plugin-mockup.css, plugin-mockup.js
Sprint 5:  demo-paths.css, path-cards.js
Sprint 6:  color-engine.css, color-picker.js
Sprint 7:  wizard-tour.css, wizard-tabs.js
Sprint 8:  token-output.css, token-counter.js
Sprint 9:  import-demo.css, presets.css
Sprint 10: social-proof.css, cta.css, footer.css
Sprint 11: Polish
Sprint 12: Performance
```

---

## Definition of Done

The landing page is complete when:
1. All 10 sections render correctly in dark mode
2. All 10 sections render correctly in light mode
3. All interactive demos work (color picker, wizard, path switcher, token counter)
4. Lighthouse Performance >= 95
5. Lighthouse Accessibility >= 95
6. No console errors
7. Looks nothing like an AI-generated page
8. Plugin window mockup is pixel-accurate to the real plugin
9. Opens correctly in Chrome, Firefox, and Safari
