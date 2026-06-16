/* ════════════════════════════════════════════════════════
   FARWIN BEAUTY — app.js
   Features:
     1. Navbar scroll effect
     2. Mobile hamburger menu
     3. Scroll reveal animations (IntersectionObserver)
     4. Collections tab switcher
     5. Scent Finder Quiz
     6. Partner Commission Calculator
     7. Partner lead form submission (Cloudflare mock)
     8. Newsletter input
   ════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── 1. NAVBAR SCROLL EFFECT ─── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  /* ─── 2. MOBILE HAMBURGER MENU ─── */
  const hamburgerBtn   = document.getElementById('hamburger-btn');
  const mobileOverlay  = document.getElementById('mobile-nav-overlay');
  const mobileClose    = document.getElementById('mobile-nav-close');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openMobileNav() {
    mobileOverlay.classList.add('open');
    hamburgerBtn.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileNav() {
    mobileOverlay.classList.remove('open');
    hamburgerBtn.classList.remove('active');
    document.body.style.overflow = '';
  }

  hamburgerBtn.addEventListener('click', openMobileNav);
  mobileClose.addEventListener('click', closeMobileNav);
  mobileNavLinks.forEach(link => link.addEventListener('click', closeMobileNav));

  /* ─── 3. SCROLL REVEAL ─── */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings slightly
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 60);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ─── 4. COLLECTIONS TAB SWITCHER ─── */
  const tabBtns    = document.querySelectorAll('.tab-btn');
  const panels     = document.querySelectorAll('.collections-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      // Update buttons
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Update panels
      panels.forEach(panel => {
        if (panel.id === `panel-${target}`) {
          panel.classList.remove('hidden');
        } else {
          panel.classList.add('hidden');
        }
      });
    });
  });

  /* ─── 5. SCENT FINDER QUIZ ─── */
  const quizSteps = document.querySelectorAll('.quiz-step');
  const answers   = {};

  // Collection recommendation logic
  function getRecommendation() {
    const { q1, q2, q3 } = answers;

    // Disney x Farwin: playful + sweet/floral OR always wearing
    if (q1 === 'playful' || q3 === 'sweet') {
      return {
        name: 'Farwin × Disney',
        desc: 'Keajaiban Disney dalam botol mewah — ceria, manis, dan mempesona. Sempurna untuk anda yang suka bersinar.',
        icon: '✨',
        tab: 'disney'
      };
    }
    // Limited: bold + evening + woody
    if (q1 === 'bold' || (q2 === 'evening' && q3 === 'woody')) {
      return {
        name: 'Farwin Limited',
        desc: 'Edisi terhad untuk jiwa yang berani. Wangian dalam, misteri, dan berkuasa — hanya untuk yang istimewa.',
        icon: '🔥',
        tab: 'limited'
      };
    }
    // Timeless: default / classic
    return {
      name: 'Farwin Timeless',
      desc: 'Wangian abadi untuk jiwa yang elegan. Klasik, halus, dan selalu relevan dalam setiap majlis.',
      icon: '🕊️',
      tab: 'timeless'
    };
  }

  function showQuizStep(stepId) {
    quizSteps.forEach(step => step.classList.remove('active'));
    const target = document.getElementById(stepId);
    if (target) target.classList.add('active');
  }

  // Attach quiz option click handlers
  document.querySelectorAll('.quiz-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const step = parseInt(btn.dataset.step);
      const val  = btn.dataset.val;
      answers[`q${step}`] = val;

      if (step < 3) {
        showQuizStep(`quiz-step-${step + 1}`);
      } else {
        // Show result
        const rec = getRecommendation();
        document.getElementById('result-icon').textContent       = rec.icon;
        document.getElementById('result-collection').textContent = rec.name;
        document.getElementById('result-desc').textContent       = rec.desc;

        // Make "Lihat Koleksi" button jump to correct collection tab
        const exploreBtn = document.getElementById('result-explore-btn');
        exploreBtn.addEventListener('click', (e) => {
          e.preventDefault();
          // Activate matching tab
          const matchingTab = document.getElementById(`tab-${rec.tab}`);
          if (matchingTab) matchingTab.click();
          document.getElementById('collections').scrollIntoView({ behavior: 'smooth' });
        }, { once: true });

        showQuizStep('quiz-result');
      }
    });
  });

  // Restart quiz
  document.getElementById('quiz-restart-btn').addEventListener('click', () => {
    Object.keys(answers).forEach(k => delete answers[k]);
    showQuizStep('quiz-step-1');
  });

  /* ─── 6. COMMISSION CALCULATOR ─── */
  const COMMISSION_RATE = 0.25;
  const BONUS_THRESHOLD = 100; // bottles
  const BONUS_RATE      = 0.05;

  const sliderBottles  = document.getElementById('calc-bottles');
  const sliderPrice    = document.getElementById('calc-price');
  const bottlesDisplay = document.getElementById('calc-bottles-display');
  const priceDisplay   = document.getElementById('calc-price-display');
  const revenueVal     = document.getElementById('res-revenue-val');
  const commissionVal  = document.getElementById('res-commission-val');
  const totalVal       = document.getElementById('res-total-val');

  function formatRM(amount) {
    return 'RM ' + amount.toLocaleString('ms-MY', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  function updateCalculator() {
    const bottles  = parseInt(sliderBottles.value);
    const price    = parseInt(sliderPrice.value);
    const revenue  = bottles * price;
    let commission = revenue * COMMISSION_RATE;
    let bonus      = 0;

    if (bottles >= BONUS_THRESHOLD) {
      bonus = revenue * BONUS_RATE;
    }

    const total = commission + bonus;

    bottlesDisplay.textContent = `${bottles} botol`;
    priceDisplay.textContent   = `RM ${price}`;
    revenueVal.textContent     = formatRM(revenue);
    commissionVal.textContent  = formatRM(commission) + (bonus > 0 ? ` + Bonus ${formatRM(bonus)}` : '');
    totalVal.textContent       = formatRM(total);
  }

  sliderBottles.addEventListener('input', updateCalculator);
  sliderPrice.addEventListener('input', updateCalculator);
  updateCalculator(); // init

  /* ─── 7. PARTNER LEAD FORM ─── */
  const partnerForm   = document.getElementById('partner-signup-form');
  const submitBtn     = document.getElementById('form-submit-btn');
  const submitText    = document.getElementById('btn-submit-text');
  const submitLoading = document.getElementById('btn-submit-loading');
  const successMsg    = document.getElementById('form-success-msg');
  const errorMsg      = document.getElementById('form-error-msg');

  partnerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name  = document.getElementById('form-name').value.trim();
    const phone = document.getElementById('form-phone').value.trim();
    const email = document.getElementById('form-email').value.trim();

    // Basic validation
    if (!name || !phone || !email) {
      errorMsg.classList.remove('hidden');
      successMsg.classList.add('hidden');
      setTimeout(() => errorMsg.classList.add('hidden'), 4000);
      return;
    }

    // Show loading state
    submitText.classList.add('hidden');
    submitLoading.classList.remove('hidden');
    submitBtn.disabled = true;
    errorMsg.classList.add('hidden');

    const payload = {
      name,
      phone,
      email,
      state:   document.getElementById('form-state').value,
      message: document.getElementById('form-message').value.trim()
    };

    try {
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        successMsg.classList.remove('hidden');
        partnerForm.reset();
      } else {
        throw new Error('Server error');
      }
    } catch {
      // Graceful fallback: show success anyway for demo
      successMsg.classList.remove('hidden');
      partnerForm.reset();
    } finally {
      submitText.classList.remove('hidden');
      submitLoading.classList.add('hidden');
      submitBtn.disabled = false;
    }
  });

  /* ─── 8. NEWSLETTER ─── */
  const newsletterBtn   = document.getElementById('newsletter-submit-btn');
  const newsletterInput = document.getElementById('newsletter-email');

  newsletterBtn.addEventListener('click', () => {
    const email = newsletterInput.value.trim();
    if (!email || !email.includes('@')) {
      newsletterInput.style.borderColor = 'rgba(220,50,50,0.6)';
      setTimeout(() => { newsletterInput.style.borderColor = ''; }, 2000);
      return;
    }
    newsletterInput.value = '';
    newsletterBtn.textContent = '✓';
    newsletterBtn.style.background = 'rgba(212,175,55,0.5)';
    setTimeout(() => {
      newsletterBtn.textContent = '→';
      newsletterBtn.style.background = '';
    }, 3000);
  });

  /* ─── Smooth scroll for all anchor links ─── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

})();
