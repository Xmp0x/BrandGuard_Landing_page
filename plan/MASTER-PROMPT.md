# MASTER PROMPT — BrandGuard Landing Page
## Guide for Opencode

---

> This prompt tells Opencode exactly how to build the BrandGuard landing page.
> Read every plan file in Landing_Page/plan/ before writing a single line of code.

---

## Context

You are building a **masterpiece landing page** for BrandGuard — a Figma plugin that generates complete design systems (380 native Figma variables) in minutes.

The landing page must:
1. **Look handcrafted**, not AI-generated. Every detail matters: 1px borders, specular highlights, spring easing, ambient orbs.
2. **Demo the plugin in real-time**. The plugin UI is re-created in CSS/HTML and is fully interactive.
3. **Use scroll as a storytelling device**. GSAP + ScrollTrigger + Lenis make scroll the primary interaction.
4. **Match the plugin design language exactly**. Same colors, fonts, spacing, and design philosophy.

---

## Pre-Flight: Read These Files First

Read in this order. Do NOT start coding until you have read all of them:

1. `Landing_Page/plan/00-OVERVIEW.md` — Master plan, tech stack, file structure
2. `Landing_Page/plan/01-DESIGN-LANGUAGE.md` — All CSS tokens, typography, shadows, motion system
3. `Landing_Page/plan/02-SECTION-BLUEPRINT.md` — Every section with exact copy and layout specs
4. `Landing_Page/plan/03-INTERACTIVE-DEMOS.md` — All 7 interactive demo specs
5. `Landing_Page/plan/04-ANIMATION-SYSTEM.md` — GSAP timelines, ScrollTrigger, Lenis
6. `Landing_Page/plan/05-PLUGIN-UI-MOCKUPS.md` — Plugin window CSS and screen recreations
7. `Landing_Page/plan/06-BUILD-PHASES.md` — Sprint-by-sprint execution order

Then read the actual plugin source for reference:
- `src/ui/pages/StartPage.tsx` — Start page UI (recreate this in CSS)
- `src/ui/pages/wizard/Page1Colors.tsx` — Color wizard (recreate step 1 in CSS)
- `src/ui/components/Badge.tsx` — Badge component pattern
- `src/tailwind.config.js` — Design tokens source of truth

---

## Build Order (Strict)

Follow the sprint order in `06-BUILD-PHASES.md`:

**Sprint 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12**

Do NOT skip ahead. Each sprint has a clear deliverable. Verify each deliverable before moving to the next sprint.

---

## Non-Negotiable Rules

### DO:
- Use CSS custom properties (`--var-name`) for EVERY value (no hardcoded values)
- Use `transform` and `opacity` only for animations (compositor thread)
- Add `prefers-reduced-motion` fallbacks for ALL GSAP animations
- Use `data-theme="dark"` on `<html>` for dark mode (default)
- Write semantic HTML (nav, main, section, article, h1–h6, button, a)
- Add `aria-label` to all icon buttons and decorative elements
- Use `em` and `rem` units for text, `px` only for borders
- Comment every major section in CSS and JS
- Use ES modules (`type="module"` on script tags)

### DO NOT:
- Do not use Tailwind CSS (this is not the plugin, this is a standalone page)
- Do not use React or any framework
- Do not import heavy libraries beyond GSAP + Lenis
- Do not use stock photos or AI-generated images
- Do not add motion that has no purpose
- Do not write inline styles in HTML (use CSS classes)
- Do not use `!important`
- Do not skip any section from `02-SECTION-BLUEPRINT.md`

---

## The Plugin Window Mockup — Most Important Component

The floating plugin window that appears in the Hero and interactive demos is the **centerpiece** of this landing page.

It must:
- Look exactly like the real BrandGuard plugin UI (cross-reference `StartPage.tsx`)
- Have macOS-style traffic lights (red/yellow/green dots)
- Have a Figma-style dark title bar with the plugin name
- Show the actual Start Page UI with all 3 path cards
- Apply a subtle 3D CSS perspective tilt: `perspective(1200px) rotateY(-6deg) rotateX(3deg)`
- Have a glow shadow that references the primary indigo color
- Switch between 5 screens smoothly (300ms spring transition) based on user interaction

All plugin mockup CSS uses the `pm-` prefix namespace (see `05-PLUGIN-UI-MOCKUPS.md`).

---

## Color Palette Reference

```
Primary:    #6366F1 (indigo)
Secondary:  #0FFA8C (mint)
Tertiary:   #129FF8 (sky)
Dark BG:    #0F0F15
Dark Card:  #1E1E2A
Dark Border: rgba(255,255,255,0.07)
Font:       "Plus Jakarta Sans", Inter, -apple-system, sans-serif
Mono Font:  "JetBrains Mono", "Cascadia Code", monospace
```

---

## Copy Reference (from Section Blueprint)

### Hero
- Badge: "Figma Plugin · Free · 380 Variables"
- H1: "Design Systems.\nBuilt in Minutes."
- Subtext: "Generate 380 native Figma variables — colors, typography, spacing, shadows, and more — in three distinct workflows. No tokens.json. No figma variables plugin bridge. Just variables."
- CTA 1: "Install Free — Figma Community" (primary button)
- CTA 2: "Watch Demo ↓" (ghost button)

### Section 2: Paths
- Headline: "Three ways to build your design system"
- Card 1: "FAST PATH" / "Use a Preset" / "5–10 min"
- Card 2: "GUIDED PATH" / "Step-by-Step Wizard" / "15–20 min"
- Card 3: "IMPORT PATH" / "Upload Specs" / "2–5 min"

### Section 3: Color Engine
- Headline: "Pick a color. Watch 380 variables generate."
- Subtext: "Real-time 10-shade scale generation with WCAG contrast validation. Complementary and tertiary colors auto-paired."

### Section 4: Wizard Tour
- Headline: "8 steps. Infinite precision."
- Subtext: "Each wizard page generates a mathematically perfect design scale — no guessing, no manual tweaking."

### Section 5: Token Output
- Headline: "380 tokens. 9 collections. One click."
- Subtext: "All tokens land directly in Figma as native variables — no plugins needed to consume them."

### Section 6: Import
- Headline: "Already have a brand brief? Import it."
- Subtext: "Upload a Markdown doc, paste JSON tokens, or link a Figma file. Our parser extracts everything."

### Section 7: Presets
- Headline: "Start with world-class presets"
- Subtext: "7 production-ready design systems, from Material 3 to Apple HIG. Customize any token before applying."

### Section 8: Social Proof
- Stats: "380 Variables" | "9 Collections" | "3 Paths" | "WCAG AA"
- Quote: "Finally, a Figma plugin that generates a complete, production-ready design system — not just a color palette."

### Section 9: CTA
- Headline: "Your design system is 3 minutes away."
- Sub: "Free forever. No account required. Works in any Figma plan."
- CTA: "Install on Figma — It's Free"

---

## Animation Timing Reference

| Element | Duration | Easing |
|---------|----------|--------|
| Hero headline words | 700ms stagger 80ms | power3.out |
| Section entrance | 600ms stagger 60ms | power2.out |
| Card hover lift | 150ms | cubic-bezier(0.16,1,0.3,1) |
| Plugin screen switch | 300ms | cubic-bezier(0.16,1,0.3,1) |
| Color swatch update | 150ms | ease |
| Token counter | 2000ms | easeOutCubic |
| Lenis duration | 1.2 | 1.001 - 2^(-10*t) |

---

## File Output Location

All landing page files go in:

```
e:\Xmp1X-Projects\figma_plugins\BrandGuard-V3\Landing_Page\src\
```

Main entry point: `Landing_Page\src\index.html`

---

## Verification Checklist

After completing each sprint, verify:

**Sprint 1 (Foundation)**
- [ ] Dark background visible
- [ ] Plus Jakarta Sans loaded (inspect computed styles)
- [ ] Dot grid pattern visible on background
- [ ] All CSS custom properties defined (inspect :root in devtools)

**Sprint 2 (Nav)**
- [ ] Nav is sticky on scroll
- [ ] Theme toggle switches dark ↔ light
- [ ] Theme persists on refresh (localStorage)
- [ ] Logo renders correctly

**Sprint 3 (Hero)**
- [ ] Headline animates in on page load
- [ ] Ambient orbs visible
- [ ] Two CTA buttons render
- [ ] Scroll indicator at bottom
- [ ] Lenis smooth scroll active (smooth deceleration)

**Sprint 4 (Plugin Window)**
- [ ] Plugin window renders in hero right column
- [ ] macOS traffic lights visible (red/yellow/green dots)
- [ ] 3D tilt applied
- [ ] Start Page UI visible inside window
- [ ] Hover state reduces tilt
- [ ] Glow shadow around window

**Sprint 5 (Path Cards)**
- [ ] 3 bento cards render with correct colors (amber/primary/mint)
- [ ] Hover: card lifts + border glows
- [ ] Click Fast Path → plugin shows Preset Selector screen
- [ ] Click Guided Path → plugin shows Wizard Colors screen
- [ ] Click Import Path → plugin shows File Upload screen
- [ ] Transitions are smooth (300ms spring)

**Sprint 6 (Color Demo)**
- [ ] Color picker renders
- [ ] Drag picker → swatches update in real time
- [ ] WCAG badge updates (pass/fail based on color)
- [ ] Complementary color badge appears

**Sprint 7 (Wizard Tour)**
- [ ] 8 step pills render
- [ ] Auto-advances every 3 seconds
- [ ] Plugin window changes per step
- [ ] Callout card updates per step
- [ ] Click a pill → jumps to that step

**Sprint 8 (Tokens)**
- [ ] Token strings rain downward
- [ ] Different colors by type
- [ ] Counter animates 0→380 on scroll entry
- [ ] Figma icon at bottom

**Sprints 9–10**
- [ ] Import demo types in correctly
- [ ] Presets carousel scrolls horizontally
- [ ] Social proof stats visible
- [ ] CTA section has glow + button
- [ ] Footer renders

**Final (Sprints 11–12)**
- [ ] prefers-reduced-motion disables all GSAP
- [ ] Lighthouse Performance >= 95
- [ ] No console errors
- [ ] Works on mobile (320px minimum)

---

## If You Get Stuck

1. Re-read the relevant plan file
2. Cross-reference the actual plugin source (src/ui/pages/)
3. The design source of truth is `tailwind.config.js` for tokens
4. For motion questions: follow `04-ANIMATION-SYSTEM.md` exactly
5. For plugin mockup questions: follow `05-PLUGIN-UI-MOCKUPS.md`

---

## Final Note

This landing page should make designers say "wait, this is a website?" when they see the plugin window demo. The bar is Squarespace, Linear, Vercel — but for a Figma plugin. Execute with that level of craft.
