# BrandGuard Figma Plugin - Design Language

## CSS Custom Properties
Extracted from `tailwind.config.js` to form the core styling foundation.

```css
:root {
  /* Primary (Indigo) */
  --color-primary-50: #EEF2FF;
  --color-primary-100: #E0E7FF;
  --color-primary-500: #6366F1;
  --color-primary-600: #4F46E5;
  --color-primary-900: #312E81;

  /* Secondary (Mint) */
  --color-mint-50: #ECFDF5;
  --color-mint-500: #10B981;
  --color-mint-900: #064E3B;

  /* Accent (Sky) */
  --color-sky-50: #F0F9FF;
  --color-sky-500: #0EA5E9;
  --color-sky-900: #0C4A6E;

  /* Neutral */
  --color-neutral-50: #F9FAFB;
  --color-neutral-900: #111827;
  --color-neutral-950: #030712;
}
```

## Surface System (Dark/Light)
The surface system uses ambient gradients to create a sense of depth and focus.

```css
/* Light Mode */
:root {
  --bg-surface: var(--color-neutral-50);
  --bg-surface-elevated: #FFFFFF;
  --text-main: var(--color-neutral-900);
  --ambient-glow: radial-gradient(circle at top right, rgba(99, 102, 241, 0.1), transparent 40%);
}

/* Dark Mode */
.dark {
  --bg-surface: var(--color-neutral-950);
  --bg-surface-elevated: var(--color-neutral-900);
  --text-main: var(--color-neutral-50);
  --ambient-glow: radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent 50%);
}
```

## Typography Scale
- **Display/Headings**: Plus Jakarta Sans (Weight: 600-800, tight tracking)
- **Body**: Plus Jakarta Sans (Weight: 400-500, normal tracking)
- **Code/Tokens**: JetBrains Mono (Weight: 400, for variables and snippets)

```css
:root {
  --font-display: 'Plus Jakarta Sans', sans-serif;
  --font-body: 'Plus Jakarta Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-4xl: 2.25rem;
  --text-6xl: 3.75rem;
}
```

## Spacing & Radius & Shadows
```css
:root {
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-8: 2rem;
  --space-16: 4rem;

  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;

  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-glow: 0 0 20px rgba(99, 102, 241, 0.3);
}
```

## Motion System
```css
:root {
  /* Durations */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;

  /* Easings */
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  --ease-emit: cubic-bezier(0.2, 1, 0.2, 1);
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
}
```
**Motion Principles:**
1. **Snappy but fluid**: Fast entry, smooth settle (Spring).
2. **Directional context**: Elements slide from where they originate.
3. **Micro-interactions**: Buttons scale down slightly on click (`transform: scale(0.98)`).

## GSAP + Lenis Configuration
Smooth scrolling and scroll-triggered animations.

```javascript
import Lenis from '@studio-freight/lenis'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true
})

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)
```

## The Bento Visual Language
Pattern for creating micro-bento layouts.

```css
.bento-outer {
  background: var(--bg-surface-elevated);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-sm);
}

.bento-inner {
  background: rgba(0, 0, 0, 0.02);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}
```
*Card Anatomy Diagram*: Outer container (padding, subtle border, large radius) > Inner container (tighter radius, offset background) > Content (Icons, text).

## Visual Signature Elements
- **Ambient Orbs**: Blurred, absolutely positioned radial gradients.
- **Specular Highlights**: 1px top borders on cards with a linear-gradient to simulate light catching the edge.
- **Dot Grid Background**: SVG pattern background `radial-gradient(circle, #ccc 1px, transparent 1px)`.
- **Token Rain**: CSS animation mapping strings cascading downwards `transform: translateY(100vh)`.
- **Plugin Window Shadow**: A deep, multi-layered shadow to elevate the plugin UI mockup off the page.
