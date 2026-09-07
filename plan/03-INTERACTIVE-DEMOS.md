# Interactive Demos Plan

## Demo 1: Live Color Engine (Section 3)

### 1. JavaScript Logic
- **Color computation**: Listen to the `input` event on the color picker.
- **Algorithm**: Convert HEX to HSL. For the base shade-500, use the input HSL. To generate the 10-shade scale (50-900), interpolate the lightness from 95% (shade 50) down to 10% (shade 900) in steps. Adjust saturation slightly for darker shades to prevent muddiness.
- **Complementary color**: Shift the hue of the base color by 150-210 degrees and map to a secondary shade scale.
- **WCAG contrast badge**: Calculate the relative luminance `L` for shade-700 and white (`#FFFFFF`). Formula: `(L1 + 0.05) / (L2 + 0.05)`. If ratio >= 4.5, badge displays "AA Pass".
- **Debounce**: Wrap the color calculation function in a debounce utility set to 16ms to ensure smooth updates without locking the main thread.
- **Default color**: Initialize with `#6366F1`.

### 2. HTML Structure
```html
<div class="color-engine">
  <div class="controls">
    <input type="color" id="base-color" value="#6366F1" />
    <input type="text" id="hex-input" value="#6366F1" maxlength="7" />
  </div>
  <div class="palette-display" id="swatch-container">
    <!-- 10 swatch divs injected via JS -->
  </div>
  <div class="contrast-badge" id="wcag-badge">AA Pass</div>
</div>
```

### 3. CSS Requirements
- `input[type="color"]`: Reset default browser styling, circular appearance.
- `.swatch-container`: CSS Grid with `grid-template-columns: repeat(10, 1fr)`.
- `.swatch`: Aspect ratio 1/1, rounded corners, `transition: background-color 0.2s ease`.
- `.contrast-badge`: Inline-flex, rounded pill, font-weight 600, dynamic color classes (pass/fail).

### 4. Accessibility Considerations
- Inputs need associated `<label>` elements (can be visually hidden).
- Color contrast badge provides explicit text feedback, not just color coding.
- Provide aria-live regions for dynamic swatch announcements.

### 5. Edge Cases
- Invalid hex text input: Fallback to previous valid color.
- Extreme lightness input (e.g., pure white/black): Algorithm must clamp shade lightness values (e.g., shade 900 cannot go below 0% lightness, shade 50 cannot exceed 100%).

---

## Demo 2: Wizard Step Navigator (Section 4)

### 1. JavaScript Logic
- **State machine**: Variable `currentStep` tracked (1 to 8).
- **Auto-advance**: `setInterval` every 3000ms. Cleared on hover or click of the step navigator, and restarted on mouseleave.
- **Content Map**:
  - Step 1: Branding defaults setup (colors, fonts).
  - Step 2: Semantic color assignment.
  - Step 3: Typography scale configuration.
  - Step 4: Spacing and grid variables.
  - Step 5: Border radius and effects.
  - Step 6: Component mapping.
  - Step 7: Export settings.
  - Step 8: Sync to Figma variables.
- **Keyboard navigation**: Add `keydown` listener for `ArrowRight` (next) and `ArrowLeft` (prev).

### 2. HTML Structure
```html
<div class="wizard-navigator">
  <div class="step-pills" role="tablist">
    <button class="step-pill active" role="tab" aria-selected="true">1</button>
    <button class="step-pill" role="tab" aria-selected="false">2</button>
    <!-- ... -->
  </div>
  <div class="plugin-mockup">
    <div class="mockup-content" id="mockup-view">
      <!-- Dynamic step content -->
    </div>
  </div>
</div>
```

### 3. CSS Requirements
- `.step-pill`: Circular button. `.active` state has filled primary background (`#6366F1`) and white text. Inactive has outlined border.
- `.mockup-content`: Absolute positioning within `.plugin-mockup`.
- **Transitions**: Crossfade between screens using `opacity` and `transform` with a 300ms spring timing function (`cubic-bezier(0.175, 0.885, 0.32, 1.275)`).
- **Progress animation**: Linear gradient background on step pills filling from left to right, matching the 3000ms timer.

### 4. Accessibility Considerations
- Implement standard ARIA tabs pattern (`role="tablist"`, `role="tab"`, `role="tabpanel"`).
- Keyboard support (arrow keys) built-in.
- Focus visible styles for tab navigation.

### 5. Edge Cases
- Rapid clicking on tabs: Ensure transitions don't overlap or break (use a lock or GSAP overwrite).

---

## Demo 3: Path Card Switcher (Section 2)

### 1. JavaScript Logic
- **State machine**: `activeCard` variable storing one of `['fast', 'guided', 'import']`.
- **Click handler**: On card click, update `activeCard`. Trigger an animation timeline to swap the content inside the adjacent plugin window mockup.
- **Path mapping**:
  - Fast Path → `PresetSelector` UI
  - Guided Path → `WizardFlow` page 1 UI
  - Import Path → `FileUploadFlow` UI

### 2. HTML Structure
```html
<div class="path-switcher">
  <div class="cards-list">
    <button class="path-card active" data-path="fast">Fast Path</button>
    <button class="path-card" data-path="guided">Guided Path</button>
    <button class="path-card" data-path="import">Import Path</button>
  </div>
  <div class="plugin-window-preview" aria-live="polite">
    <!-- View changes here -->
  </div>
</div>
```

### 3. CSS Requirements
- `.path-card`: Interactive hover states. `.active` gets a subtle inner glow or primary border.
- **Transition**: Plugin window content old state fades out (`opacity: 0`) and slides up (`translateY: -20px`). New state starts at `translateY: 20px`, `opacity: 0`, sliding to `0` over 400ms.

### 4. Accessibility Considerations
- Use `aria-pressed` or `aria-selected` depending on the role (toggle or tabs).
- Provide `aria-live="polite"` on the preview window to announce the selected path content.

### 5. Edge Cases
- Fast successive clicks: Ignore clicks if a transition is currently in progress.

---

## Demo 4: Token Counter (Section 5)

### 1. JavaScript Logic
- **Animated counter**: Use a custom `requestAnimationFrame` loop or GSAP to interpolate from 0 to 380 over 2000ms. Easing: `easeOutCubic`.
- **Token rain**: Initialize 30 token string objects with random `left` percentages and varied durations (2000ms to 5000ms).
- **Tokens list**: `--color-primary-500`, `--spacing-md`, `--text-xl-bold`, `--radius-lg`, `--shadow-sm`, `--color-neutral-900`, `--z-index-modal`, `--border-default`, `--opacity-hover`, `--color-success-bg`, `--font-mono`, `--spacing-4xl`, etc.
- **Loop**: When a token finishes falling, reset its Y position to top and randomize its X and duration again.

### 2. HTML Structure
```html
<div class="token-counter-section">
  <div class="counter-display">
    <span id="animated-count">0</span>+ Variables
  </div>
  <div class="token-rain-container" aria-hidden="true">
    <!-- JS injected token divs -->
  </div>
</div>
```

### 3. CSS Requirements
- `.token-rain-container`: `position: absolute; overflow: hidden; inset: 0;`
- `.token`: `position: absolute;` uses `transform: translateY(...)` for falling.
- **Color coding**:
  - Color tokens (`--color-*`): Indigo text.
  - Spacing tokens (`--spacing-*`): Mint text.
  - Typography tokens (`--font-*`, `--text-*`): Sky blue text.

### 4. Accessibility Considerations
- Hide the rain animation from screen readers with `aria-hidden="true"`.
- Ensure the counter reads as "380+ Variables" directly to AT (potentially visually hidden static text + aria-hidden on animated span).

### 5. Edge Cases
- Tab inactive: Stop the `requestAnimationFrame` loop or rely on CSS animations (which pause automatically) to save CPU/battery.

---

## Demo 5: Import Parser Demo (Section 6)

### 1. JavaScript Logic
- **Typewriter effect**: Iterate through characters of the demo JSON string, adding one every 50ms.
- **Validation delay**: Once complete, wait 500ms before running the "parse" simulation.
- **Demo JSON**:
  ```json
  {
    "version": "1.2",
    "theme": "dark",
    "colors": {
      "primary": "#6366F1",
      "secondary": "#0FFA8C",
      "error": "red-500"
    },
    "spacing": {
      "base": "16px",
      "large": "32px"
    },
    "typography": {
      "heading": "Plus Jakarta Sans"
    }
  }
  ```
  *(Error state demo makes "error": "red-500" trigger validation failure for invalid hex)*
- **Toggle**: Switch between a clean JSON and one with an error to show robust parsing.

### 2. HTML Structure
```html
<div class="import-demo">
  <div class="editor-panel">
    <pre><code id="json-typing-area"></code></pre>
  </div>
  <div class="validation-panel">
    <!-- Slide-in badges here -->
  </div>
  <button id="toggle-error-state">Show Error State</button>
</div>
```

### 3. CSS Requirements
- `.editor-panel`: Styled like a dark mode code editor (monokai or one-dark theme).
- `.validation-badge`: Starts `transform: translateX(20px); opacity: 0;`. Slides in to `0` with a green checkmark or red X.

### 4. Accessibility Considerations
- Avoid rapid screen reader updates from the typewriter effect.
- Validation state should be announced via a live region.

### 5. Edge Cases
- User clicks "Show Error State" while typewriter is active: Reset the typing animation cleanly and start over.

---

## Demo 6: Theme Toggle (Global)

### 1. JavaScript Logic
- **Toggle behavior**: Listen for click on the toggle button. Check `localStorage.getItem('theme')`.
- Apply `data-theme` attribute to `document.documentElement` (`<html>`).
- Save the new preference to `localStorage`.
- Default to `dark` on first visit.

### 2. HTML Structure
```html
<button class="theme-toggle" aria-label="Toggle theme">
  <svg class="sun-icon">...</svg>
  <svg class="moon-icon">...</svg>
</button>
```

### 3. CSS Requirements
- Global variables mapped via attribute selector:
  ```css
  :root { /* Dark mode defaults */
    --bg-base: #0F172A;
    --text-main: #F8FAFC;
  }
  :root[data-theme="light"] {
    --bg-base: #FFFFFF;
    --text-main: #0F172A;
  }
  ```
- **Transition**: `body { transition: background-color 0.3s ease, color 0.3s ease; }`

### 4. Accessibility Considerations
- Use `aria-pressed` or explicit `aria-label` ("Switch to light mode" / "Switch to dark mode") for the button.

### 5. Edge Cases
- Flash of unstyled content (FOUC): Must load a blocking script in `<head>` to read `localStorage` and set the data attribute before the body renders.

---

## Demo 7: Preset Carousel (Section 7)

### 1. JavaScript Logic
- **Drag support**: Listen to `pointerdown`, `pointermove`, `pointerup` to apply horizontal scroll to the container.
- **Keyboard navigation**: Listen to arrow keys on container focus to snap to the next/prev card.
- **Scroll sync**: Intersection Observer on cards to update the active dot paginator below.

### 2. HTML Structure
```html
<div class="carousel-section">
  <div class="preset-carousel" tabindex="0">
    <div class="preset-card">...</div>
  </div>
  <div class="carousel-indicators">
    <button class="dot active" data-index="0" aria-label="Go to slide 1"></button>
    <!-- ... -->
  </div>
</div>
```

### 3. CSS Requirements
- `.preset-carousel`: `display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth;`
- `.preset-card`: `flex: 0 0 320px; scroll-snap-align: center;`
- Hide scrollbar (`::-webkit-scrollbar { display: none; }`).

### 4. Accessibility Considerations
- Provide visible focus for the carousel container and internal buttons.
- Arrow key support for native scrollable regions is built into browsers.

### 5. Edge Cases
- Mouse drag conflicting with native click events (prevent default on drag).
- **Preset Data**:
  1. Default: Indigo + Mint
  2. Sunset: Rose + Orange
  3. Forest: Emerald + Lime
  4. Ocean: Cyan + Blue
  5. Royal: Purple + Gold
  6. Monochrome: Zinc + Slate
  7. High Contrast: Black + Yellow
