/* ============================================================
   BrandGuard Landing Page — Sprint 9 Import Demo
   File: js/demos/import-demo.js
   ============================================================ */

export function initImportDemo() {
  const typingArea = document.getElementById('json-typing-area');
  const toggleBtn = document.getElementById('toggle-error-state');
  const validationPanel = document.getElementById('validation-panel');
  if (!typingArea) return;

  const validJson = `{
  "version": "1.2",
  "theme": "dark",
  "colors": {
    "primary": "#6366F1",
    "secondary": "#0FFA8C"
  }
}`;

  const invalidJson = `{
  "version": "1.2",
  "theme": "dark",
  "colors": {
    "primary": "#6366F1",
    "secondary": "red-500" // Invalid HEX
  }
}`;

  let isErrorMode = false;
  let typingTimeout;

  function typeString(str, cb) {
    typingArea.textContent = '';
    validationPanel.innerHTML = '';
    let i = 0;
    function typeChar() {
      if (i < str.length) {
        typingArea.textContent += str.charAt(i);
        i++;
        typingTimeout = setTimeout(typeChar, 30);
      } else {
        cb();
      }
    }
    typeChar();
  }

  function showValidation() {
    validationPanel.innerHTML = '';
    const badge = document.createElement('div');
    badge.style.padding = '8px 16px';
    badge.style.borderRadius = '6px';
    badge.style.fontSize = '12px';
    badge.style.fontWeight = 'bold';
    badge.style.transition = 'all 0.3s ease';
    badge.style.transform = 'translateX(20px)';
    badge.style.opacity = '0';

    if (isErrorMode) {
      badge.style.background = 'rgba(255, 95, 87, 0.2)';
      badge.style.color = '#FF5F57';
      badge.textContent = '❌ Validation Failed: Invalid HEX';
    } else {
      badge.style.background = 'rgba(15, 250, 140, 0.2)';
      badge.style.color = '#0FFA8C';
      badge.textContent = '✅ Parsed 380 Variables';
    }
    
    validationPanel.appendChild(badge);
    
    // Animate in
    setTimeout(() => {
      badge.style.transform = 'translateX(0)';
      badge.style.opacity = '1';
    }, 100);
  }

  function startDemo() {
    clearTimeout(typingTimeout);
    typeString(isErrorMode ? invalidJson : validJson, () => {
      setTimeout(showValidation, 300);
    });
  }

  // Observer to start when visible
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      startDemo();
      observer.disconnect();
    }
  }, { threshold: 0.5 });
  observer.observe(typingArea);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      isErrorMode = !isErrorMode;
      toggleBtn.textContent = isErrorMode ? 'Show Valid State' : 'Show Error State Validation';
      startDemo();
    });
  }
}
