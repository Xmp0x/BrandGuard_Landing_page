/* ============================================================
   BrandGuard Landing Page — Sprint 8 Token Counter
   File: js/demos/token-counter.js
   ============================================================ */

export function initTokenCounter() {
  const counter = document.getElementById('animated-count');
  const rainContainer = document.getElementById('token-rain');
  if (!counter || !rainContainer) return;

  const target = 380;
  let current = 0;
  
  // Simple easing counter
  const animateCount = () => {
    current += 5;
    if (current > target) current = target;
    counter.textContent = current;
    if (current < target) {
      requestAnimationFrame(animateCount);
    }
  };

  // Intersection observer to start when visible
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      requestAnimationFrame(animateCount);
      createRain();
      observer.disconnect();
    }
  }, { threshold: 0.5 });
  observer.observe(counter);

  function createRain() {
    const tokens = [
      '--color-primary-500', '--spacing-md', '--text-xl-bold', 
      '--radius-lg', '--shadow-sm', '--color-neutral-900', 
      '--z-index-modal', '--border-default', '--opacity-hover', 
      '--color-success-bg', '--font-mono', '--spacing-4xl'
    ];

    for (let i = 0; i < 20; i++) {
      const el = document.createElement('div');
      el.textContent = tokens[Math.floor(Math.random() * tokens.length)];
      el.style.position = 'absolute';
      el.style.left = Math.random() * 100 + '%';
      el.style.top = '-20px';
      el.style.fontSize = '12px';
      el.style.fontFamily = 'monospace';
      el.style.opacity = Math.random() * 0.5 + 0.1;
      
      if (el.textContent.includes('color')) el.style.color = '#6366F1';
      else if (el.textContent.includes('spacing')) el.style.color = '#0FFA8C';
      else el.style.color = '#38BDF8';

      rainContainer.appendChild(el);

      const duration = Math.random() * 3 + 2;
      const delay = Math.random() * 2;

      el.animate([
        { transform: 'translateY(0)' },
        { transform: 'translateY(350px)' }
      ], {
        duration: duration * 1000,
        delay: delay * 1000,
        iterations: Infinity
      });
    }
  }
}
