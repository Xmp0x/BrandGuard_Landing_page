/* ============================================================
   BrandGuard Landing Page — Sprint 7 Wizard Tour Logic
   File: js/demos/wizard-tabs.js
   ============================================================ */

const stepsData = [
  { title: "Step 1: Colors", desc: "10-shade scale • Complementary pairing • WCAG AA checked", ui: "1/8 Colors" },
  { title: "Step 2: Typography", desc: "Modular scale • Base sizes • Font pairings", ui: "2/8 Typography" },
  { title: "Step 3: Spacing", desc: "4pt grid system • Responsive gaps • Padding variables", ui: "3/8 Spacing" },
  { title: "Step 4: Sizing", desc: "Component heights • Icon sizes • Viewport bounds", ui: "4/8 Sizing" },
  { title: "Step 5: Radius", desc: "Corner rounding • Nested radiuses • Squircle support", ui: "5/8 Radius" },
  { title: "Step 6: Shadows", desc: "Elevation levels • Ambient light • Umbra/Penumbra", ui: "6/8 Shadows" },
  { title: "Step 7: Transitions", desc: "Easing curves • Duration tokens • Stagger delays", ui: "7/8 Transitions" },
  { title: "Step 8: Z-Index", desc: "Layer stacking • Modals & Tooltips • Context isolation", ui: "8/8 Z-Index" }
];

export function initWizardTabs() {
  const pills = document.querySelectorAll('.wizard-navigator .step-pill');
  if (pills.length === 0) return;

  const titleEl = document.getElementById('wizard-step-title');
  const descEl = document.getElementById('wizard-step-desc');
  const mockupView = document.getElementById('wizard-mockup-view');
  
  let currentStep = 1;
  let autoAdvanceTimer = null;
  let isPaused = false;

  function updateStep(step) {
    currentStep = step;
    
    // Update pills
    pills.forEach(p => {
      p.classList.remove('active');
      p.setAttribute('aria-selected', 'false');
      if (parseInt(p.getAttribute('data-step')) === step) {
        p.classList.add('active');
        p.setAttribute('aria-selected', 'true');
      }
    });

    // Update text
    const data = stepsData[step - 1];
    if (titleEl) titleEl.textContent = data.title;
    if (descEl) descEl.textContent = data.desc;

    // Update Mockup UI (simulated crossfade)
    if (mockupView) {
      const activeScreen = mockupView.querySelector('.pm-screen');
      if (activeScreen) {
        // Fast fade simulation
        activeScreen.style.opacity = 0;
        setTimeout(() => {
          activeScreen.querySelector('.pm-brand-title').textContent = data.ui;
          activeScreen.style.opacity = 1;
        }, 150);
      }
    }
  }

  function startTimer() {
    if (isPaused) return;
    clearInterval(autoAdvanceTimer);
    autoAdvanceTimer = setInterval(() => {
      let nextStep = currentStep + 1;
      if (nextStep > 8) nextStep = 1;
      updateStep(nextStep);
    }, 3000);
  }

  function stopTimer() {
    clearInterval(autoAdvanceTimer);
  }

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const step = parseInt(pill.getAttribute('data-step'));
      isPaused = true; // Pause on manual interaction
      stopTimer();
      updateStep(step);
    });
  });

  // Resume on mouse leave of the whole navigator area
  const navArea = document.querySelector('.wizard-navigator');
  if (navArea) {
    navArea.addEventListener('mouseenter', stopTimer);
    navArea.addEventListener('mouseleave', () => {
      isPaused = false;
      startTimer();
    });
  }

  // Initial start
  startTimer();
}
