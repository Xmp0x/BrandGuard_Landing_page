# Animation System Plan

## Lenis Smooth Scroll Setup

### Configuration
```javascript
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
});
```

### GSAP RAF Loop Integration
```javascript
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);
```

### Performance Considerations
- Use `will-change: transform` only on heavy scrolling elements.
- Keep `smoothTouch: false` to allow native mobile scrolling behavior (better UX and performance).

---

## GSAP ScrollTrigger System

### Hero Section
- **Element Animated**: Headline words, plugin window preview.
- **From/To**: Headline words (`y: 40`, `opacity: 0` to `y: 0`, `opacity: 1`). Plugin window (`x: 100`, `opacity: 0` to `x: 0`, `opacity: 1`).
- **Trigger**: Plays on load (no ScrollTrigger for entrance).
- **Stagger**: Words stagger by `0.05s`.

### Paths Section
- **Element Animated**: 3 Path Cards.
- **From/To**: `y: 50`, `opacity: 0` to `y: 0`, `opacity: 1`.
- **Trigger**: Start `top 80%`, End `bottom 20%`.
- **Stagger**: `0.1s` between cards.

### Color Engine
- **Element Animated**: Left text panel, Right interactive panel.
- **From/To**: Left panel (`x: -50`, `opacity: 0` to `0`, `1`). Right panel (`x: 50`, `opacity: 0` to `0`, `1`).
- **Trigger**: Start `top 75%`.

### Wizard Tour
- **Element Animated**: Step pills, Plugin Window Pinning.
- **From/To**: Step pills stagger scale up from `0.8` to `1`.
- **Trigger**: Window pins `top top` to `bottom bottom` of the section to allow scrolling through steps.

### Token Rain
- **Element Animated**: Token DOM nodes.
- **Trigger**: Rain animation timeline starts on `top 90%` and pauses on `bottom 0%` (off-screen) to save CPU.

### Import Demo
- **Element Animated**: Typewriter effect start.
- **Trigger**: Starts when section reaches `top 70%`.

### Social Proof
- **Element Animated**: Stat numbers (0 to value).
- **Trigger**: Start `top 85%`.

### CTA
- **Element Animated**: Headline, CTA button.
- **From/To**: `scale: 0.9`, `opacity: 0` to `scale: 1`, `opacity: 1`.
- **Trigger**: Start `top 80%`.

---

## Scroll-Driven Animations (CSS Native)

Using `animation-timeline: scroll()` for performance where complex timeline sequencing isn't needed:

1. **Hero Parallax**:
   ```css
   .hero-plugin-window {
     animation: parallax linear;
     animation-timeline: scroll(root);
   }
   @keyframes parallax {
     to { transform: translateY(-40%); }
   }
   ```
2. **Ambient Background Orbs**: Moving slowly based on root scroll position.
3. **Reading Progress Bar**: Fixed element at the top of the viewport mapping width `0%` to `100%` tied to `scroll(root)`.

---

## Micro-interaction System

- **Button Hover**: `transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);` with `transition: all 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`.
- **Card Hover**: `transform: translateY(-4px); border-color: var(--color-primary); box-shadow: 0 0 20px rgba(99, 102, 241, 0.15);` with `transition: all 200ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`.
- **Plugin Window Hover**: 
  - CSS: `transform: perspective(1000px) rotateX(2deg) rotateY(-2deg);` (200ms transition).
- **Swatch Hover**: `transform: scale(1.05);` + tooltip opacity transition.
- **CTA Button Idle**:
  ```css
  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
    50% { box-shadow: 0 0 0 10px rgba(99,102,241,0); }
  }
  .cta-button { animation: pulseGlow 3s infinite; }
  ```

---

## GSAP Timeline Code Stubs

### 1. Hero Entrance Timeline
```javascript
const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
heroTl.fromTo('.hero-title .word', 
  { y: 40, opacity: 0 }, 
  { y: 0, opacity: 1, stagger: 0.05, duration: 0.8 }
)
.fromTo('.hero-plugin-window', 
  { x: 100, opacity: 0 }, 
  { x: 0, opacity: 1, duration: 1 }, 
  "-=0.5"
);
```

### 2. Section Entrance ScrollTrigger Template
```javascript
gsap.fromTo('.section-content', 
  { y: 50, opacity: 0 },
  { 
    y: 0, 
    opacity: 1, 
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.section',
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    }
  }
);
```

### 3. Stagger Children Entrance
```javascript
gsap.from('.path-card', {
  y: 40,
  opacity: 0,
  stagger: 0.1,
  duration: 0.6,
  ease: 'back.out(1.7)',
  scrollTrigger: {
    trigger: '.cards-list',
    start: 'top 85%'
  }
});
```

### 4. Token Rain Animation Loop
```javascript
gsap.utils.toArray('.token').forEach(token => {
  const duration = gsap.utils.random(2, 5);
  gsap.fromTo(token,
    { y: '-10vh' },
    {
      y: '110vh',
      duration: duration,
      ease: 'none',
      repeat: -1,
      delay: gsap.utils.random(0, 3)
    }
  );
});
```

### 5. Plugin Window 3D Parallax
```javascript
document.addEventListener('mousemove', (e) => {
  const { innerWidth, innerHeight } = window;
  const xAxis = (innerWidth / 2 - e.pageX) / 25;
  const yAxis = (innerHeight / 2 - e.pageY) / 25;
  
  gsap.to('.hero-plugin-window', {
    rotateY: xAxis,
    rotateX: yAxis,
    duration: 0.5,
    ease: 'power1.out'
  });
});
```

---

## Performance Budget

- **Target**: 60fps locked on mid-range devices.
- **Rules**: 
  - ONLY animate `transform` and `opacity` properties using GSAP/CSS.
  - Avoid animating `width`, `height`, `margin`, or `top`/`left` directly to prevent layout thrashing.
- **will-change**: Apply `will-change: transform` dynamically only while an element is actively animating, remove it after completion to save memory.
- **Canvas Fallback**: If token count exceeds 50, migrate the token rain from DOM nodes to an HTML5 Canvas implementation to maintain frame rate.

---

## Reduced Motion Strategy

- **Media Query**: `@media (prefers-reduced-motion: reduce) { ... }`
- **Fallback Styles**: Disable translations, keep fades only.
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```
- **GSAP matchMedia**:
  ```javascript
  let mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Standard animations here
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    // Only simple opacity fades, no x/y transforms
    gsap.fromTo('.element', { opacity: 0 }, { opacity: 1 });
  });
  ```
