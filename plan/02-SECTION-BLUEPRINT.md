# BrandGuard Figma Plugin - Section Blueprint

## SECTION 1: HERO
- **Layout grid spec**: 2 columns (1fr 1fr), gap 4rem, align items center.
- **Copy**:
  - Badge: "Figma Plugin"
  - H1: "Design Systems. Built in Minutes."
  - Subtext: "Generate over 380 native Figma variables, styles, and tokens with infinite precision. Fast, guided, or imported."
  - CTAs: `[Install Free — Figma Community]` (Primary), `[Watch Demo ↓]` (Secondary/Ghost).
- **Component inventory**: Badge, H1 Display, Body Text, Primary Button, Ghost Button, Plugin Window Mockup.
- **Dimensions**: min-height: 100svh, padding: top 6rem, bottom 4rem.
- **Visual elements**: Floating plugin window mockup (rotateY(-6deg) rotateX(3deg)). Ambient primary orb top-right, mint orb bottom-left. Animated token counter "380 Variables". Scroll indicator arrow at bottom center.
- **Interaction states**: CTA hover (glow, lift), Mockup hover (rotate to 0deg flat).
- **Responsive breakpoints**: Mobile: 1 column, mockup stacks below text, rotate reset to 0, height auto.

## SECTION 2: 3 PATHS — HOW IT WORKS
- **Layout grid spec**: 3 columns (1fr 1fr 1fr), gap 2rem, align top.
- **Copy**:
  - Headline: "Three ways to build your design system"
  - Card 1: ⚡ "FAST PATH" / "Use a Preset" / "5–10 min" / "Start with industry standards like Material or Apple HIG."
  - Card 2: ✦ "GUIDED PATH" / "Step-by-Step Wizard" / "15–20 min" / "Fine-tune every value with our intelligent wizard."
  - Card 3: ↑ "IMPORT PATH" / "Upload Specs" / "2–5 min" / "Bring your own JSON or Markdown tokens directly."
- **Component inventory**: Section Header, Bento Card x3, Plugin UI Interactive Canvas.
- **Dimensions**: padding-y: 8rem.
- **Visual elements**: Interactive state machine linking card clicks to the plugin mockup on the right.
- **Interaction states**: Card hover (border glow, slight lift), Card click (active state background, updates plugin mockup).
- **Responsive breakpoints**: Mobile: Stacked cards (1 column).

## SECTION 3: COLOR ENGINE DEMO (LIVE)
- **Layout grid spec**: 2 columns (auto 1fr), gap 4rem, align center.
- **Copy**:
  - Headline: "Pick a color. Watch 380 variables generate."
  - Badges: "Primary", "Secondary", "Tertiary", "WCAG AA".
- **Component inventory**: HTML Color Input swatch, Swatch Strip (50-900), Role Badges, Contrast Badge.
- **Dimensions**: padding-y: 6rem.
- **Visual elements**: Live updating color scale strip. Ambient mint glow tracing the color change.
- **Interaction states**: Dragging color picker re-renders swatches instantly.
- **Responsive breakpoints**: Mobile: Stacked, scale wraps or horizontal scrolls.

## SECTION 4: WIZARD TOUR
- **Layout grid spec**: 2 columns (30% 70%), gap 2rem, align start.
- **Copy**:
  - Headline: "8 steps. Infinite precision."
  - Steps: 1: Colors, 2: Typography, 3: Spacing, 4: Sizing, 5: Radius, 6: Shadows, 7: Transitions, 8: Z-Index.
  - Callout (Step 1 example): "10-shade scale • Complementary pairing • WCAG AA checked"
- **Component inventory**: Step Selector Pills, Plugin UI Mockup, Callout Card.
- **Dimensions**: padding-y: 8rem.
- **Visual elements**: Steps cycle automatically (3s interval).
- **Interaction states**: Click pill -> pause auto-cycle, switch mockup view.
- **Responsive breakpoints**: Mobile: Pills become horizontal scrolling row above the mockup.

## SECTION 5: TOKEN OUTPUT ANIMATION
- **Layout grid spec**: 1 column, center aligned.
- **Copy**:
  - Headline: "380 tokens. 9 collections. One click."
  - Badges: "Colors: 120", "Typography: 45", "Spacing: 24", "Shadows: 18", etc.
- **Component inventory**: Animated Counter, Token Strings, Stat Badges, Figma Logo Icon.
- **Dimensions**: padding-y: 10rem.
- **Visual elements**: Dark background. Typewriter/rain effect for token strings (`color/primary/500`, etc.) landing into Figma logo.
- **Interaction states**: Scroll-triggered animation entry.
- **Responsive breakpoints**: Mobile: Reduce token count shown, scale down typography.

## SECTION 6: IMPORT DEMO
- **Layout grid spec**: 2 columns (1fr 1fr), gap 2rem, align stretch.
- **Copy**:
  - Headline: "Already have a brand brief? Import it."
  - Badges: ".MD", ".JSON", "Paste".
- **Component inventory**: Code Editor Mockup, Live Preview Canvas, Format Badges, Status Indicators.
- **Dimensions**: padding-y: 6rem.
- **Visual elements**: Animated typing of JSON. Success checkmarks appearing. Error state validation demo.
- **Interaction states**: Click badge -> change input format.
- **Responsive breakpoints**: Mobile: Stacked, code editor on top.

## SECTION 7: PRESETS CAROUSEL
- **Layout grid spec**: Full bleed horizontal scrolling row.
- **Copy**:
  - Headline: "Start with world-class presets"
  - Cards: Material 3 (Google), Apple HIG, Fluent 2 (Microsoft), Ant Design, Tailwind, Bootstrap, Custom.
- **Component inventory**: Carousel Container, Preset Card.
- **Dimensions**: padding-y: 6rem.
- **Visual elements**: Swatch strip per preset.
- **Interaction states**: Hover -> card lift, color strip brightens. Click -> highlighted with primary ring glow.
- **Responsive breakpoints**: Mobile: Standard touch horizontal scroll with snap-points.

## SECTION 8: SOCIAL PROOF
- **Layout grid spec**: 1 column, center aligned.
- **Copy**:
  - Stats: "380 Variables" | "9 Collections" | "3 Paths" | "WCAG AA"
  - Quote: "Finally, a plugin that generates a real design system, not just colors." — Senior Product Designer
  - Figma Community Badge.
- **Component inventory**: Stat Bar, Testimonial Block, Figma Badge.
- **Dimensions**: padding-y: 4rem.
- **Visual elements**: Clean, minimalist typography.
- **Interaction states**: None.
- **Responsive breakpoints**: Mobile: Stats stack 2x2.

## SECTION 9: FINAL CTA
- **Layout grid spec**: 1 column, center aligned.
- **Copy**:
  - Headline: "Your design system is 3 minutes away."
  - Subtext: "Free forever. No account required. Works in any Figma plan."
  - Buttons: `[Install on Figma — It's Free]`, `[View on GitHub]`.
- **Component inventory**: H2 Display, Primary CTA, Secondary CTA.
- **Dimensions**: padding-y: 10rem.
- **Visual elements**: Full-width dark section. Large primary glow orb centered behind text.
- **Interaction states**: Button hovers.
- **Responsive breakpoints**: Mobile: Buttons stack full width.

## SECTION 10: FOOTER
- **Layout grid spec**: 2 columns (logo/tagline left, links right).
- **Copy**:
  - Links: GitHub, Figma Community, Documentation.
  - Badges: "Built with Calm UI + Micro-Bento", "© 2026 BrandGuard", "Version 3.0".
- **Component inventory**: Footer Links, Badges, Logo.
- **Dimensions**: padding: 2rem 0.
- **Visual elements**: Subtle top border.
- **Interaction states**: Link hover underlines.
- **Responsive breakpoints**: Mobile: 1 column, left aligned stack.
