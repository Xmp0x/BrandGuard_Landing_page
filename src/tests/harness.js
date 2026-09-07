/**
 * BrandGuard Landing Page V2 — Test Harness
 *
 * Provides a DOM parsing environment via JSDOM, CSS token extraction,
 * event simulation, fake storage, media query mocking, and authoritative
 * mathematical verification oracles (WCAG 2.1 relative luminance, HSL, scale math).
 */

const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

// Authoritative Target Directories
const SRC_DIR = path.resolve(__dirname, '..');
const CSS_DIR = path.join(SRC_DIR, 'css');
const JS_DIR = path.join(SRC_DIR, 'js');
const INDEX_HTML_PATH = path.join(SRC_DIR, 'index.html');

/**
 * ============================================================================
 * Mathematical Verification Oracle
 * Authoritative algorithms derived from src/utils/colorUtils.ts and WCAG 2.1
 * ============================================================================
 */
const ColorMathOracle = {
  /**
   * Convert Hex to RGB { r, g, b } (0-255)
   */
  hexToRGB(hex) {
    if (!hex || typeof hex !== 'string') {
      throw new Error(`Invalid hex input: ${hex}`);
    }
    let cleanHex = hex.trim().replace(/^#/, '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map((c) => c + c).join('');
    }
    if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
      throw new Error(`Invalid 6-character hex color: "${hex}"`);
    }
    return {
      r: parseInt(cleanHex.substring(0, 2), 16),
      g: parseInt(cleanHex.substring(2, 4), 16),
      b: parseInt(cleanHex.substring(4, 6), 16),
    };
  },

  /**
   * Convert RGB (0-255) to HSL { h, s, l } (h: 0-360, s: 0-100, l: 0-100)
   */
  rgbToHSL(r, g, b) {
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const delta = max - min;

    let l = (max + min) / 2;
    let s = 0;
    let h = 0;

    if (delta !== 0) {
      s = delta / (1 - Math.abs(2 * l - 1));
      switch (max) {
        case rNorm:
          h = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) * 60;
          break;
        case gNorm:
          h = ((bNorm - rNorm) / delta + 2) * 60;
          break;
        case bNorm:
          h = ((rNorm - gNorm) / delta + 4) * 60;
          break;
      }
    }

    return {
      h: Math.round(h) % 360,
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  },

  /**
   * Convert HSL (h: 0-360, s: 0-100, l: 0-100) to Hex "#RRGGBB"
   */
  hslToHex(h, s, l) {
    h = ((h % 360) + 360) % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let rPrime = 0, gPrime = 0, bPrime = 0;
    if (h < 60) { rPrime = c; gPrime = x; bPrime = 0; }
    else if (h < 120) { rPrime = x; gPrime = c; bPrime = 0; }
    else if (h < 180) { rPrime = 0; gPrime = c; bPrime = x; }
    else if (h < 240) { rPrime = 0; gPrime = x; bPrime = c; }
    else if (h < 320) { rPrime = x; gPrime = 0; bPrime = c; }
    else { rPrime = c; gPrime = 0; bPrime = x; }

    const r = Math.round((rPrime + m) * 255);
    const g = Math.round((gPrime + m) * 255);
    const b = Math.round((bPrime + m) * 255);

    const toHex = (n) => n.toString(16).padStart(2, '0').toUpperCase();
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  },

  /**
   * Calculate WCAG 2.1 relative luminance for RGB (0-255)
   * Formula: L = 0.2126 * Rlin + 0.7152 * Glin + 0.0722 * Blin
   */
  calculateLuminance(r, g, b) {
    const sRGB = [r, g, b].map((val) => {
      const v = val / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  },

  /**
   * Calculate WCAG 2.1 Contrast Ratio between two hex colors:
   * CR = (L1 + 0.05) / (L2 + 0.05) where L1 >= L2
   */
  calculateContrastRatio(hex1, hex2) {
    const rgb1 = this.hexToRGB(hex1);
    const rgb2 = this.hexToRGB(hex2);
    const L1 = this.calculateLuminance(rgb1.r, rgb1.g, rgb1.b);
    const L2 = this.calculateLuminance(rgb2.r, rgb2.g, rgb2.b);

    const lighter = Math.max(L1, L2);
    const darker = Math.min(L1, L2);
    const ratio = (lighter + 0.05) / (darker + 0.05);
    return Math.round(ratio * 100) / 100;
  },

  /**
   * Determine WCAG Badge details for a given contrast ratio
   */
  getWCAGBadge(contrastRatio) {
    if (contrastRatio >= 7.0) {
      return { label: 'AAA Pass', level: 'AAA', pass: true };
    }
    if (contrastRatio >= 4.5) {
      return { label: 'AA Pass', level: 'AA', pass: true };
    }
    if (contrastRatio >= 3.0) {
      return { label: 'AA Large Only', level: 'AA Large', pass: false };
    }
    return { label: 'Fail', level: 'Fail', pass: false };
  },

  /**
   * Generate 10-shade calibrated scale (50-900) from any base hex
   * Based on BrandGuard design curve (from survey_explorer_2 and colorUtils.ts)
   */
  generate10ShadeScale(baseHex) {
    const rgb = this.hexToRGB(baseHex);
    const hsl = this.rgbToHSL(rgb.r, rgb.g, rgb.b);

    const stops = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
    const lightnessMap = {
      50: 97,
      100: 94,
      200: 87,
      300: 77,
      400: 65,
      500: hsl.l, // Base color anchor
      600: Math.round(hsl.l * 0.8),
      700: Math.round(hsl.l * 0.65),
      800: Math.round(hsl.l * 0.48),
      900: Math.round(hsl.l * 0.32),
    };

    const scale = stops.map((stop) => {
      let targetL = lightnessMap[stop];
      targetL = Math.max(5, Math.min(98, targetL)); // clamp extremes

      let targetS = hsl.s;
      if (stop === 50) targetS = Math.min(35, hsl.s * 0.35);
      else if (stop === 100) targetS = Math.min(50, hsl.s * 0.5);
      else if (stop === 200) targetS = Math.min(70, hsl.s * 0.7);
      else if (stop === 300) targetS = Math.min(85, hsl.s * 0.85);
      else if (stop >= 600) targetS = Math.min(100, hsl.s * 1.05);

      const hex = this.hslToHex(hsl.h, targetS, targetL);
      return {
        stop,
        hex,
        isBase: stop === 500,
        lightness: targetL,
      };
    });

    return scale;
  },

  /**
   * Compute complementary color (180 degree hue shift)
   */
  getComplementaryColor(hex) {
    const rgb = this.hexToRGB(hex);
    const hsl = this.rgbToHSL(rgb.r, rgb.g, rgb.b);
    const compHue = (hsl.h + 180) % 360;
    return this.hslToHex(compHue, hsl.s, hsl.l);
  },

  /**
   * Compute triadic colors (+120 and +240 degree hue shifts)
   */
  getTriadicColors(hex) {
    const rgb = this.hexToRGB(hex);
    const hsl = this.rgbToHSL(rgb.r, rgb.g, rgb.b);
    return [
      this.hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
      this.hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
    ];
  },
};

/**
 * ============================================================================
 * CSS Token and Rule Parser
 * ============================================================================
 */
function parseCssCustomProperties(cssContent) {
  const tokens = {};
  const rootMatches = cssContent.match(/:(?:root|\[data-theme=["']?[^"']+["']?\]|\.pm-window)[^{]*\{([^}]+)\}/g) || [];

  for (const block of rootMatches) {
    const selectorMatch = block.match(/^([^{]+)\{/);
    const selector = selectorMatch ? selectorMatch[1].trim() : ':root';
    tokens[selector] = tokens[selector] || {};

    const varMatches = block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g);
    for (const match of varMatches) {
      const varName = match[1].trim();
      const varValue = match[2].trim();
      tokens[selector][varName] = varValue;
    }
  }

  // Also collect all variables across the entire file
  const allVars = {};
  const globalMatches = cssContent.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g);
  for (const match of globalMatches) {
    allVars[match[1].trim()] = match[2].trim();
  }

  return { bySelector: tokens, allVars };
}

/**
 * Load a CSS file from the landing page workspace
 */
function loadCSS(relPath) {
  const fullPath = path.resolve(SRC_DIR, relPath);
  if (!fs.existsSync(fullPath)) {
    return {
      exists: false,
      fullPath,
      content: '',
      tokens: { bySelector: {}, allVars: {} },
      error: `CSS file does not exist at ${fullPath}`,
    };
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const tokens = parseCssCustomProperties(content);

  return {
    exists: true,
    fullPath,
    content,
    tokens,
    error: null,
  };
}

/**
 * ============================================================================
 * JSDOM Environment & Page Loader
 * ============================================================================
 */
function loadPage(options = {}) {
  const initialStorage = options.storage || { 'brandguard-theme': 'dark' };
  const viewportWidth = options.viewportWidth || 1440;
  const viewportHeight = options.viewportHeight || 900;
  const reducedMotion = options.reducedMotion || false;
  const preferredColorScheme = options.colorScheme || 'dark';

  if (!fs.existsSync(INDEX_HTML_PATH)) {
    return {
      exists: false,
      path: INDEX_HTML_PATH,
      error: `index.html does not exist at ${INDEX_HTML_PATH}`,
      dom: null,
      window: null,
      document: null,
    };
  }

  const htmlContent = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
  const virtualConsole = new VirtualConsole();
  const consoleErrors = [];
  virtualConsole.on('error', (err) => consoleErrors.push(err));

  const dom = new JSDOM(htmlContent, {
    url: 'http://localhost:3000/',
    runScripts: 'dangerously',
    resources: 'usable',
    virtualConsole,
  });

  const { window } = dom;
  const { document } = window;

  // Emulate localStorage
  const store = { ...initialStorage };
  let throwOnSet = false;

  const storageMock = {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, val) => {
      if (throwOnSet) {
        const err = new Error('QuotaExceededError');
        err.name = 'QuotaExceededError';
        throw err;
      }
      store[key] = String(val);
    },
    removeItem: (key) => delete store[key],
    clear: () => Object.keys(store).forEach((k) => delete store[k]),
    get length() { return Object.keys(store).length; },
    key: (i) => Object.keys(store)[i] || null,
    _getStore: () => store,
    _setThrowOnSet: (val) => { throwOnSet = Boolean(val); },
  };

  Object.defineProperty(window, 'localStorage', {
    value: storageMock,
    writable: true,
  });

  // Emulate window dimensions
  Object.defineProperty(window, 'innerWidth', { value: viewportWidth, writable: true });
  Object.defineProperty(window, 'innerHeight', { value: viewportHeight, writable: true });

  // Emulate matchMedia
  window.matchMedia = (query) => {
    let matches = false;
    if (query.includes('prefers-reduced-motion: reduce')) {
      matches = reducedMotion;
    } else if (query.includes('prefers-color-scheme: light')) {
      matches = preferredColorScheme === 'light';
    } else if (query.includes('prefers-color-scheme: dark')) {
      matches = preferredColorScheme === 'dark';
    } else if (query.includes('max-width: 768px')) {
      matches = viewportWidth <= 768;
    } else if (query.includes('max-width: 1024px')) {
      matches = viewportWidth <= 1024;
    } else if (query.includes('min-width: 1024px')) {
      matches = viewportWidth >= 1024;
    }
    return {
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    };
  };

  // Emulate navigator.clipboard
  let clipboardBuffer = '';
  Object.defineProperty(window.navigator, 'clipboard', {
    value: {
      writeText: async (text) => {
        clipboardBuffer = String(text);
        return Promise.resolve();
      },
      readText: async () => Promise.resolve(clipboardBuffer),
    },
    configurable: true,
  });

  // Emulate requestAnimationFrame & cancelAnimationFrame
  let rafId = 0;
  window.requestAnimationFrame = (cb) => {
    rafId++;
    setTimeout(() => cb(Date.now()), 16);
    return rafId;
  };
  window.cancelAnimationFrame = (id) => clearTimeout(id);

  // Execute synchronous head scripts (e.g. Anti-FOUC theme setter)
  const headScripts = document.querySelectorAll('head script:not([src])');
  for (const script of headScripts) {
    try {
      window.eval(script.textContent);
    } catch (e) {
      // Ignored if syntax unsupported
    }
  }

  return {
    exists: true,
    path: INDEX_HTML_PATH,
    dom,
    window,
    document,
    storage: storageMock,
    consoleErrors,
    getClipboard: () => clipboardBuffer,
    setViewport(w, h) {
      window.innerWidth = w;
      window.innerHeight = h;
    },
    setReducedMotion(val) {
      reducedMotion = Boolean(val);
    },
  };
}

/**
 * ============================================================================
 * DOM Interaction Helpers
 * ============================================================================
 */
const DOMHelpers = {
  click(element) {
    if (!element) throw new Error('Cannot click null or undefined element');
    const evt = element.ownerDocument.createEvent('HTMLEvents');
    evt.initEvent('click', true, true);
    element.dispatchEvent(evt);
  },

  input(element, value) {
    if (!element) throw new Error('Cannot set input on null or undefined element');
    element.value = value;
    const evt = element.ownerDocument.createEvent('HTMLEvents');
    evt.initEvent('input', true, true);
    element.dispatchEvent(evt);
  },

  change(element, value) {
    if (!element) throw new Error('Cannot set change on null or undefined element');
    element.value = value;
    const evt = element.ownerDocument.createEvent('HTMLEvents');
    evt.initEvent('change', true, true);
    element.dispatchEvent(evt);
  },

  keydown(element, key, code = null) {
    if (!element) throw new Error('Cannot dispatch keydown on null or undefined element');
    const evt = new element.ownerDocument.defaultView.KeyboardEvent('keydown', {
      key,
      code: code || key,
      bubbles: true,
      cancelable: true,
    });
    element.dispatchEvent(evt);
  },

  mouseEnter(element) {
    if (!element) throw new Error('Cannot mouseEnter null or undefined element');
    const evt = element.ownerDocument.createEvent('HTMLEvents');
    evt.initEvent('mouseenter', true, true);
    element.dispatchEvent(evt);
  },

  mouseLeave(element) {
    if (!element) throw new Error('Cannot mouseLeave null or undefined element');
    const evt = element.ownerDocument.createEvent('HTMLEvents');
    evt.initEvent('mouseleave', true, true);
    element.dispatchEvent(evt);
  },

  mouseMove(element, pageX, pageY) {
    if (!element) throw new Error('Cannot mouseMove null or undefined element');
    const evt = new element.ownerDocument.defaultView.MouseEvent('mousemove', {
      clientX: pageX,
      clientY: pageY,
      pageX,
      pageY,
      bubbles: true,
      cancelable: true,
    });
    element.dispatchEvent(evt);
  },

  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
};

module.exports = {
  SRC_DIR,
  CSS_DIR,
  JS_DIR,
  INDEX_HTML_PATH,
  ColorMathOracle,
  parseCssCustomProperties,
  loadCSS,
  loadPage,
  DOMHelpers,
};
