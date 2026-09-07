# Test Infrastructure & Architecture: BrandGuard Landing Page V2

**Document Version:** 1.0.0  
**Target Workspace:** `Landing_Page/landing_page_V2/src/`  
**Test Suite Path:** `Landing_Page/landing_page_V2/src/tests/`  
**Author:** `e2e_test_writer_2` (`teamwork_preview_test_writer`)  
**Date:** 2026-09-05  

---

## 1. Executive Summary & Mission

The BrandGuard Landing Page V2 testing track provides an **opaque-box E2E automated test suite** covering all 29 core features, boundary conditions, cross-feature pairwise integrations, and real-world user scenarios defined in `PROJECT.md`, `ORIGINAL_REQUEST.md`, and the survey phase handoffs.

The testing infrastructure is built with **zero external framework dependencies** (pure Node.js + JSDOM), ensuring deterministic, fast, headless execution locally and in CI/CD pipelines without requiring browser drivers, Webpack watchers, or heavy servers.

---

## 2. Directory Structure

```
Landing_Page/landing_page_V2/src/
├── TEST_INFRA.md                   # This document: architecture & test infrastructure
├── TEST_READY.md                   # Test suite readiness sign-off & test inventory
├── package.json                    # npm test scripts
├── tests/
│   ├── runner.js                   # Self-contained CLI test runner & assertion framework
│   ├── harness.js                  # JSDOM environment, CSS token parser & math oracle
│   ├── tier1-features.test.js      # Tier 1: 29 core features across M1-M4
│   ├── tier2-boundary.test.js      # Tier 2: 12 boundary & edge cases
│   ├── tier3-pairwise.test.js      # Tier 3: 6 cross-feature interaction suites
│   ├── tier4-scenarios.test.js     # Tier 4: 3 real-world user journeys
│   └── e2e/
│       └── harness.js              # Re-export proxy for alternative path resolution
```

---

## 3. Test Runner Architecture (`tests/runner.js`)

`tests/runner.js` provides an expressive testing DSL compatible with standard Jest/Mocha conventions while remaining 100% self-contained:

### 3.1 Syntax & API
- **Suites & Tests**: `describe(suiteName, fn)`, `test(testName, fn, options)`, `it(testName, fn)`
- **Hooks**: `beforeEach(fn)`, `afterEach(fn)`, `beforeAll(fn)`, `afterAll(fn)`
- **Async Execution**: Full native `async () => { ... }` / `Promise` resolution.
- **Assertion Library (`expect(actual, message?)`)**:
  - `.toBe(expected, message?)` — Strict equality (`===`)
  - `.toEqual(expected, message?)` — Deep JSON equality
  - `.toBeCloseTo(expected, precision, message?)` — Floating-point tolerance
  - `.toBeTruthy(message?)` / `.toBeFalsy(message?)`
  - `.toBeNull(message?)` / `.toBeDefined(message?)`
  - `.toContain(substringOrItem, message?)` — Strings, arrays, or object keys
  - `.toMatch(regex, message?)` — Regular expression matching
  - `.toThrow(expectedSubstr?)` — Exception assertions
  - `.toHaveProperty(prop, value?, message?)`
  - `.not.*` — Inverted assertions across all matchers

### 3.2 Automated Tagging & Filtering
Tests automatically inherit their **Milestone** (`[M1]` through `[M5]`) and **Tier** (`Tier 1` through `Tier 4`) from suite names or test names. The runner supports targeted CLI execution:

```bash
# Execute entire test suite (50 tests across all 4 tiers)
node tests/runner.js

# Or via npm
npm test

# Target a specific test tier
node tests/runner.js --tier=1    # Tier 1: Features only
node tests/runner.js --tier=2    # Tier 2: Boundaries only
node tests/runner.js --tier=3    # Tier 3: Pairwise only
node tests/runner.js --tier=4    # Tier 4: Scenarios only

# Target a specific milestone
node tests/runner.js --milestone=M1   # Foundation & Layout
node tests/runner.js --milestone=M2   # Plugin Mockup
node tests/runner.js --milestone=M3   # Live Demos
node tests/runner.js --milestone=M4   # Polish, A11y & Performance

# Filter by keyword
node tests/runner.js --filter=color
node tests/runner.js --filter=theme

# Detailed stack traces
node tests/runner.js --verbose
```

### 3.3 Exit Codes
- **Exit Code 0**: All executed tests passed.
- **Exit Code 1**: One or more tests failed.

---

## 4. Test Harness & Oracles (`tests/harness.js`)

`tests/harness.js` acts as the bridge between raw workspace files and automated assertions.

### 4.1 Authoritative Mathematical Oracle (`ColorMathOracle`)
Directly implements the mathematical formulas from `src/utils/colorUtils.ts` and `PROJECT.md § Interface Contracts`:

1. **Hex ↔ RGB ↔ HSL Conversion**:
   - Handles standard `#RRGGBB`, `#RGB` shorthand, and case normalization.
   - Normalized RGB channels ($r_N = R/255, g_N = G/255, b_N = B/255$).
   - Exact HSL conversions with clamped lightness and saturation bounds.
2. **WCAG 2.1 Relative Luminance ($L$)**:
   $$V = \frac{C}{255}, \quad C_{\text{linear}} = \begin{cases} \frac{V}{12.92} & V \le 0.03928 \\ \left(\frac{V + 0.055}{1.055}\right)^{2.4} & V > 0.03928 \end{cases}$$
   $$L = 0.2126 \times R_{\text{linear}} + 0.7152 \times G_{\text{linear}} + 0.0722 \times B_{\text{linear}}$$
3. **Contrast Ratio (CR)**:
   $$\text{CR} = \frac{\max(L_1, L_2) + 0.05}{\min(L_1, L_2) + 0.05}$$
4. **WCAG Badge Evaluation**:
   - $\text{CR} \ge 7.0:1 \implies$ `AAA Pass`
   - $\text{CR} \ge 4.5:1 \implies$ `AA Pass`
   - $\text{CR} \ge 3.0:1 \implies$ `AA Large Only`
   - $\text{CR} < 3.0:1 \implies$ `Fail`
5. **10-Shade Calibrated Scale Generator**:
   - Stops: `[50, 100, 200, 300, 400, 500, 600, 700, 800, 900]`
   - Lightness target mapping: $50 \to 97\%$, $100 \to 94\%$, $200 \to 87\%$, $300 \to 77\%$, $400 \to 65\%$, $500 \to L_{\text{base}}$, $600 \to 42\%$, $700 \to 34\%$, $800 \to 25\%$, $900 \to 17\%$.
   - Clamped extremes preventing white washout and black crushing.

### 4.2 DOM Environment & Emulation (`loadPage`)
- Evaluates `index.html` within a fresh JSDOM instance.
- **`localStorage` Emulation**: Read/write tracking, persistent stores across reloads, and configurable `QuotaExceededError` simulation.
- **`matchMedia` Emulation**:
  - `(prefers-color-scheme: dark)` / `(prefers-color-scheme: light)`
  - `(prefers-reduced-motion: reduce)`
  - Responsive breakpoints: `(max-width: 768px)`, `(max-width: 1024px)`, `(min-width: 1024px)`
- **`navigator.clipboard`**: In-memory async clipboard buffer supporting `.writeText()` and `.readText()`.
- **`requestAnimationFrame`**: Emulated timer loops for smooth interaction testing.
- **Head Script Execution**: Automatically evaluates synchronous inline scripts in `<head>` (verifying anti-FOUC theme application before body renders).

### 4.3 CSS Token & Isolation Parser (`loadCSS`)
- Reads and parses custom properties across `:root`, `[data-theme="dark"]`, `[data-theme="light"]`, and `.pm-window`.
- Verifies `--pm-*` scoping and host isolation: asserts that styles in `css/plugin-mockup.css` do NOT target unscoped host elements.
- Inspects transition rules to verify hardware-accelerated 60fps compliance (only `transform` and `opacity`).

### 4.4 DOM Interaction Helpers (`DOMHelpers`)
- `click(element)`
- `input(element, value)`
- `change(element, value)`
- `keydown(element, key, code)`
- `mouseEnter(element)`
- `mouseLeave(element)`
- `mouseMove(element, pageX, pageY)`
- `wait(ms)`

---

## 5. Progressive Testability & Milestone Verification Protocol

In accordance with the progressive testability protocol:
1. **Initial Baseline**: Before any milestone code is created, pure mathematical oracle tests pass (11 tests), while tests for unimplemented DOM and CSS files fail with descriptive errors indicating exactly which files or elements are missing.
2. **Milestone 1 Completion**:
   - `css/tokens.css`, `css/base.css`, `css/layout.css`, `css/components.css`, `index.html` scaffolding, `theme-toggle.js`, `hero-anim.js`.
   - Run: `node tests/runner.js --milestone=M1`
   - Target: 10/10 M1 tests PASS.
3. **Milestone 2 Completion**:
   - `css/plugin-mockup.css`, `css/sections/demo-paths.css`, `js/plugin-mockup.js`, `js/sections/path-cards.js`.
   - Run: `node tests/runner.js --milestone=M2`
   - Target: 8/8 M2 tests PASS.
4. **Milestone 3 Completion**:
   - Live demos: Color Engine, 8-Step Wizard, Token Rain, JSON Typewriter, Presets Carousel.
   - Run: `node tests/runner.js --milestone=M3`
   - Target: 21/21 M3 tests PASS.
5. **Milestone 4 Completion**:
   - Social proof, Final CTA, Footer, reduced motion, responsive tuning, accessibility.
   - Run: `node tests/runner.js --milestone=M4`
   - Target: 9/9 M4 tests PASS.
6. **Milestone 5 (Final Verification)**:
   - Full suite execution: `node tests/runner.js`
   - Target: 50/50 tests (100%) PASS across all 4 tiers.

---

## 6. Diagnostic Failure Messages Reference

When an implementation agent fails a test, the runner provides explicit, actionable messages:
- `css/tokens.css must exist` $\implies$ Token file missing or misplaced.
- `Missing --color-primary-500` $\implies$ CSS variable omitted from `:root`.
- `index.html must exist` $\implies$ Landing page HTML file not yet created.
- `Anti-FOUC script must set data-theme="light"` $\implies$ Synchronous head script not reading localStorage.
- `macOS traffic light dots (.pm-tl-*) must exist` $\implies$ Plugin window header missing window chrome buttons.
- `Color engine must generate 10 swatches (50 to 900)` $\implies$ Swatch grid count mismatch.
- `Violates 60fps budget by animating non-composited property` $\implies$ CSS transition contains `top`, `left`, `width`, or `margin`.
