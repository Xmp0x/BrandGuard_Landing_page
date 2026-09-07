/* ============================================================
   BrandGuard Landing Page — Sprint 6 Color Picker Logic
   File: js/demos/color-picker.js
   ============================================================ */

function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function getLuminance(hex) {
  let rgb = hex.replace('#', '').match(/.{2}/g).map(x => {
    let v = parseInt(x, 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

export function initColorPicker() {
  const colorInput = document.getElementById('base-color');
  const hexInput = document.getElementById('hex-input');
  const swatchContainer = document.getElementById('swatch-container');
  const badge = document.getElementById('wcag-badge');

  if (!colorInput || !swatchContainer) return;

  function renderPalette(hex) {
    swatchContainer.innerHTML = '';
    const [h, s, l] = hexToHsl(hex);
    
    // Simple lightness interpolation for 50-900 (10 stops)
    const lightnessStops = [95, 90, 80, 70, 60, l, 40, 30, 20, 10];
    
    let shade700Hex = '';

    lightnessStops.forEach((lightness, index) => {
      // Create swatch
      const swatchHex = hslToHex(h, s, lightness);
      const swatch = document.createElement('div');
      swatch.style.backgroundColor = swatchHex;
      swatch.style.aspectRatio = '1/1';
      swatch.style.borderRadius = '4px';
      swatch.title = `Shade ${index === 0 ? '50' : index * 100}: ${swatchHex}`;
      swatchContainer.appendChild(swatch);
      
      if (index === 7) shade700Hex = swatchHex; // 700 shade
    });

    // Calculate WCAG contrast of 700 shade vs white
    const lum1 = getLuminance('#FFFFFF');
    const lum2 = getLuminance(shade700Hex);
    const contrast = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
    
    if (contrast >= 4.5) {
      badge.textContent = 'AA Pass';
      badge.style.backgroundColor = 'rgba(15, 250, 140, 0.15)';
      badge.style.color = '#0FFA8C';
    } else {
      badge.textContent = 'AA Fail';
      badge.style.backgroundColor = 'rgba(255, 95, 87, 0.15)';
      badge.style.color = '#FF5F57';
    }
  }

  function handleColorChange(e) {
    const val = e.target.value;
    if (e.target.id === 'base-color') {
      hexInput.value = val.toUpperCase();
    } else if (e.target.id === 'hex-input' && /^#[0-9A-F]{6}$/i.test(val)) {
      colorInput.value = val;
    } else {
      return; // Invalid hex typing, ignore
    }
    renderPalette(colorInput.value);
  }

  colorInput.addEventListener('input', handleColorChange);
  hexInput.addEventListener('input', handleColorChange);

  // Initial render
  renderPalette(colorInput.value);
}
