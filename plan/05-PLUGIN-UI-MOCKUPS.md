# Phase 5 — Plugin UI Mockups

> The most critical differentiator of this landing page: the plugin UI is rendered in REAL CSS/HTML, pixel-accurate to the actual plugin. Visitors will interact with it like the real thing.

---

## 5.1 Philosophy

The mockup is NOT a screenshot or video — it is a living HTML component that:
1. Uses the **same CSS classes** as the plugin (Tailwind-equivalent custom properties)
2. Renders the **same typography, colors, and spacing** as the real plugin
3. **Responds to user interaction** (click a path card, see the screen change)
4. Is wrapped in a **Figma window chrome** to establish context

---

## 5.2 Plugin Window Chrome Structure

```html
<div class="plugin-window" aria-label="BrandGuard Plugin Preview">
  <!-- Figma-style title bar -->
  <div class="plugin-titlebar">
    <div class="plugin-traffic-lights">
      <span class="tl-close"></span>
      <span class="tl-minimize"></span>
      <span class="tl-expand"></span>
    </div>
    <span class="plugin-title">BrandGuard</span>
    <div class="plugin-titlebar-right">
      <span class="plugin-badge-live">
        <span class="pulse-dot"></span>
        380 Variables
      </span>
    </div>
  </div>
  
  <!-- Plugin content area - swappable -->
  <div class="plugin-content" id="plugin-screen-container">
    <!-- Screen components injected here -->
  </div>
</div>
```

### Window CSS

```css
.plugin-window {
  width: 380px;
  min-height: 600px;
  background: #0F0F15;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.04),
    0 8px 32px rgba(0,0,0,0.6),
    0 32px 80px rgba(0,0,0,0.35),
    0 0 80px rgba(99,102,241,0.15);
  transform: perspective(1200px) rotateY(-6deg) rotateX(3deg);
  transform-style: preserve-3d;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  font-family: var(--font-display);
}

.plugin-window:hover {
  transform: perspective(1200px) rotateY(-3deg) rotateX(1.5deg);
}

/* Title bar */
.plugin-titlebar {
  height: 40px;
  background: #181820;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
}

.plugin-traffic-lights {
  display: flex;
  gap: 6px;
  align-items: center;
}

.plugin-traffic-lights span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.tl-close    { background: #FF5F57; }
.tl-minimize { background: #FEBC2E; }
.tl-expand   { background: #28C840; }

.plugin-title {
  flex: 1;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255,255,255,0.5);
  letter-spacing: 0.01em;
}

.plugin-badge-live {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 700;
  color: rgba(255,255,255,0.4);
  font-family: var(--font-mono);
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0FFA8C;
  animation: pulse 2s infinite;
  box-shadow: 0 0 6px #0FFA8C;
}

.plugin-content {
  height: 560px;
  overflow: hidden;
  position: relative;
}
```

---

## 5.3 Screen 1: Start Page Mockup

**Used in:** Hero section, Path switcher demo (default state)

```html
<div class="pm-screen pm-startpage" data-screen="start">
  <!-- Header -->
  <div class="pm-header">
    <div class="pm-logo-group">
      <div class="pm-logo-icon">
        <!-- SVG logo - gradient -->
      </div>
      <div>
        <div class="pm-brand-name">BrandGuard</div>
        <div class="pm-brand-sub">Design System & Variable Engine</div>
      </div>
    </div>
    <div class="pm-header-right">
      <div class="pm-pill-badge">
        <span class="pm-dot-mint"></span>
        <span>380 Variables</span>
      </div>
      <button class="pm-theme-btn" aria-label="Toggle theme">
        <!-- moon icon -->
      </button>
    </div>
  </div>

  <!-- Welcome banner -->
  <div class="pm-welcome-banner">
    <p class="pm-welcome-title">How do you want to create your design system?</p>
    <p class="pm-welcome-sub">Choose your preferred approach — all paths compile directly into native Figma variables.</p>
  </div>

  <!-- Path cards -->
  <div class="pm-path-cards">
    <!-- Fast Path Card -->
    <div class="pm-path-card pm-card-amber">
      <div class="pm-card-header">
        <div class="pm-card-icon pm-icon-amber">⚡</div>
        <div>
          <div class="pm-card-title">FAST PATH — Use a Preset</div>
          <div class="pm-card-sub">Pick a pre-built design system and customize it</div>
        </div>
        <span class="pm-time-badge pm-badge-amber">5–10 min</span>
      </div>
      <ul class="pm-bullets">
        <li>Choose from 7 crafted presets (Material 3, Apple HIG & more)</li>
        <li>Tune colors, typography, sizing, and elevation scales</li>
        <li>Live preview every token before compile</li>
      </ul>
      <div class="pm-card-footer">
        <span class="pm-cta-text">Browse Presets →</span>
        <div class="pm-cta-arrow">›</div>
      </div>
    </div>

    <!-- Guided Path Card -->
    <div class="pm-path-card pm-card-primary">
      <div class="pm-card-header">
        <div class="pm-card-icon pm-icon-primary">✦</div>
        <div>
          <div class="pm-card-title">GUIDED PATH — Step-by-Step Wizard</div>
          <div class="pm-card-sub">Answer 8 structured questions with real-time math</div>
        </div>
        <span class="pm-time-badge pm-badge-primary">15–20 min</span>
      </div>
      <ul class="pm-bullets">
        <li>Pick your brand color — 10-shade scale auto-generated</li>
        <li>Choose typography with live Google Fonts rendering</li>
        <li>Smart math generation for 12 spacing & 6 elevation levels</li>
      </ul>
      <div class="pm-card-footer">
        <span class="pm-cta-text">Start Wizard →</span>
        <div class="pm-cta-arrow">›</div>
      </div>
    </div>

    <!-- Import Path Card -->
    <div class="pm-path-card pm-card-mint">
      <div class="pm-card-header">
        <div class="pm-card-icon pm-icon-mint">↑</div>
        <div>
          <div class="pm-card-title">IMPORT PATH — Upload Specs</div>
          <div class="pm-card-sub">Upload Markdown brand brief or JSON tokens</div>
        </div>
        <span class="pm-time-badge pm-badge-mint">2–5 min</span>
      </div>
      <ul class="pm-bullets">
        <li>Upload .md briefs, .json tokens, or paste raw text</li>
        <li>Smart parser extracts colors, scales, fonts, and dimensions</li>
        <li>Full WCAG AA compliance validation before compilation</li>
      </ul>
      <div class="pm-card-footer">
        <span class="pm-cta-text">Upload Specs →</span>
        <div class="pm-cta-arrow">›</div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="pm-footer-text">
    All paths compile 380 tokens across 9 native Figma collections.
  </div>
</div>
```

---

## 5.4 Screen 2: Wizard Page 1 (Colors) Mockup

**Used in:** Guided Path demo, Wizard Tour section

Shows a simplified version of Page1Colors.tsx with:
- Step indicator: "Step 1 of 8 — Colors"
- Color role tabs: Primary | Secondary | Tertiary
- Selected color swatch (large, circular, shows the picked color)
- Hex input field
- Recent colors row (6 swatches)
- Color scale strip (10 shade swatches 50-900)
- WCAG badge: "4.5:1 ✓ WCAG AA"
- Back + Next buttons

```css
.pm-wizard-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.pm-step-indicator {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255,255,255,0.5);
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.pm-step-number {
  color: #6366F1;
}

.pm-color-swatch-large {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  border: 3px solid rgba(255,255,255,0.15);
  box-shadow: 0 0 20px rgba(99,102,241,0.4);
  transition: background-color 0.15s ease;
}

.pm-shade-strip {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 3px;
  border-radius: 10px;
  overflow: hidden;
}

.pm-shade-cell {
  height: 32px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 3px;
}

.pm-shade-label {
  font-size: 9px;
  font-family: var(--font-mono);
  font-weight: 700;
}
```

---

## 5.5 Screen 3: Preset Selector Mockup

**Used in:** Fast Path demo

Shows:
- Header: "Choose a Preset System" + "Step 1 of 2" badge
- Grid: 2×3 preset cards, each showing:
  - Color swatch strip
  - Preset name (bold)
  - Font name
  - Variable count badge
- Selected preset: highlighted ring
- Bottom: "Apply Preset →" button

---

## 5.6 Screen 4: File Upload Mockup

**Used in:** Import Path demo

Shows:
- Header: "Upload Your Brand Spec"
- Format pills: Markdown | JSON | Paste | Figma Link
- Drop zone: dashed border, upload icon, "Drop .md or .json file here" text
- "Or paste your JSON:" label + textarea mockup with code
- "Parse & Preview →" button

---

## 5.7 Screen 5: Preview Page Mockup

**Used in:** Token Output section, wizard completion demo

Shows:
- Header: "Preview & Customize" + "380 Variables" badge
- Tab bar: Colors | Typography | Spacing | Sizing | Radius | Shadows (8 tabs, scrollable)
- Tab 1 (Colors) content:
  - "Primary Color" label
  - Color scale strip with edit button
  - WCAG badge
  - "Edit Primary ⚙" button

---

## 5.8 Screen Transition System

```javascript
// Plugin screen transition
function showScreen(screenId) {
  const container = document.getElementById('plugin-screen-container');
  const current = container.querySelector('.pm-screen.active');
  const next = container.querySelector(`[data-screen="${screenId}"]`);
  
  if (current === next) return;
  
  // Exit current
  if (current) {
    current.style.transform = 'translateY(-8px)';
    current.style.opacity = '0';
    setTimeout(() => {
      current.classList.remove('active');
      current.style.transform = '';
      current.style.opacity = '';
    }, 250);
  }
  
  // Enter next
  setTimeout(() => {
    next.classList.add('active');
    next.style.transform = 'translateY(8px)';
    next.style.opacity = '0';
    requestAnimationFrame(() => {
      next.style.transition = 'transform 300ms cubic-bezier(0.16,1,0.3,1), opacity 300ms ease';
      next.style.transform = 'translateY(0)';
      next.style.opacity = '1';
    });
  }, 200);
}
```

---

## 5.9 Plugin Mockup CSS Design System

All plugin mockup CSS properties use a `pm-` prefix namespace:

```css
/* pm- namespace: plugin mockup */
:root {
  /* Surfaces */
  --pm-bg:         #0F0F15;
  --pm-raised:     #151D2A;
  --pm-card:       #1A2434;
  --pm-border:     rgba(255,255,255,0.07);
  --pm-border-hl:  rgba(99,102,241,0.5);
  
  /* Text */
  --pm-text-primary:   #FFFFFF;
  --pm-text-secondary: rgba(255,255,255,0.6);
  --pm-text-muted:     rgba(255,255,255,0.35);
  
  /* Primary */
  --pm-primary: #6366F1;
  --pm-primary-dim: rgba(99,102,241,0.15);
  
  /* Accent: Mint */
  --pm-mint: #0FFA8C;
  --pm-mint-dim: rgba(15,250,140,0.1);
  
  /* Accent: Amber */
  --pm-amber: #F59E0B;
  --pm-amber-dim: rgba(245,158,11,0.1);
  
  /* Radius */
  --pm-r-sm: 6px;
  --pm-r-md: 10px;
  --pm-r-lg: 14px;
  --pm-r-xl: 18px;
  
  /* Font sizes */
  --pm-text-xs:   10px;
  --pm-text-sm:   11px;
  --pm-text-base: 12px;
  --pm-text-md:   13px;
  --pm-text-lg:   14px;
}
```

---

## 5.10 Responsive Mockup Behavior

| Viewport | Plugin Window | Transform |
|----------|--------------|-----------|
| > 1280px | 380px wide, full 3D tilt | rotateY(-6deg) rotateX(3deg) |
| 1024–1280px | 340px wide, reduced tilt | rotateY(-3deg) rotateX(1.5deg) |
| 768–1024px | 300px wide, flat | no 3D transform |
| < 768px | Full width, in separate section | centered, no tilt |
