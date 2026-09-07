/* ============================================================
   BrandGuard Landing Page — Sprint 5 Path Switcher Logic
   File: js/sections/path-switcher.js
   ============================================================ */

export function initPathCards() {
  const cards = document.querySelectorAll('.paths-cards .path-card');
  if (cards.length === 0) return;

  let isAnimating = false;

  cards.forEach(card => {
    card.addEventListener('click', () => {
      if (isAnimating || card.classList.contains('active')) return;

      const targetPath = card.getAttribute('data-path');
      
      // Update UI state
      cards.forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      card.classList.add('active');
      card.setAttribute('aria-pressed', 'true');

      switchScreen(targetPath);
    });
  });

  function switchScreen(targetPath) {
    const screens = document.querySelectorAll('#paths-mockup-view .pm-screen');
    const currentScreen = document.querySelector('#paths-mockup-view .pm-screen.pm-screen--active');
    const targetScreen = document.getElementById(`screen-${targetPath}`);

    if (!targetScreen || currentScreen === targetScreen) return;

    isAnimating = true;

    // Transition using standard JS/CSS or GSAP if available
    if (window.gsap) {
      window.gsap.to(currentScreen, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          currentScreen.style.display = 'none';
          currentScreen.classList.remove('pm-screen--active');
          
          targetScreen.style.display = 'block';
          targetScreen.classList.add('pm-screen--active');
          
          window.gsap.fromTo(targetScreen, 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.5)', onComplete: () => { isAnimating = false; } }
          );
        }
      });
    } else {
      // Fallback
      currentScreen.style.display = 'none';
      currentScreen.classList.remove('pm-screen--active');
      targetScreen.style.display = 'block';
      targetScreen.classList.add('pm-screen--active');
      targetScreen.style.opacity = '1';
      targetScreen.style.transform = 'translateY(0)';
      isAnimating = false;
    }
  }
}
