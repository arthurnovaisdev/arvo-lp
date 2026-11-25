(() => {
  'use strict';
  const root = document.documentElement;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.querySelector('.motion-toggle');
  const ecosystem = document.querySelector('.ecosystem');
  const progress = document.querySelector('.reading-progress');
  let paused = preference.matches;
  let scrollFrame = 0;
  let pointerFrame = 0;

  function applyMotionPreference() {
    root.classList.toggle('motion-paused', paused);
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.disabled = preference.matches;
    const motionIcon = paused ? '<path d="m9 5 10 7-10 7z"/>' : '<path d="M8 5v14M16 5v14"/>';
    toggle.innerHTML = `${paused ? 'Ativar' : 'Pausar'} movimento <span aria-hidden="true"><svg class="icon icon-motion" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false">${motionIcon}</svg></span>`;
    if (preference.matches) toggle.textContent = 'Movimento reduzido';
    if (paused) {
      ecosystem.style.transform = '';
      document.getAnimations().forEach(animation => {
        if (!(animation instanceof CSSAnimation)) animation.finish();
      });
    }
  }
  toggle.addEventListener('click', () => {
    paused = !paused;
    applyMotionPreference();
  });
  preference.addEventListener('change', () => {
    paused = preference.matches;
    applyMotionPreference();
  });
  applyMotionPreference();

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (!paused) entry.target.animate([
          { opacity: 0, transform: 'translateY(28px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 750, easing: 'cubic-bezier(.2,.8,.2,1)' });
        observer.unobserve(entry.target);
      });
    }, { threshold: .13 });
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
    const loopObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('out-of-view', !entry.isIntersecting));
    });
    document.querySelectorAll('.service-visual,.ecosystem,.ticker,.contact-section').forEach(element => loopObserver.observe(element));
  }

  function updateProgress() {
    scrollFrame = 0;
    const distance = root.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${distance > 0 ? scrollY / distance : 0})`;
  }
  addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateProgress);
  }, { passive: true });
  addEventListener('resize', updateProgress);
  updateProgress();

  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    ecosystem.addEventListener('pointermove', event => {
      if (paused || pointerFrame) return;
      const x = event.clientX;
      const y = event.clientY;
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        if (paused) return;
        const bounds = ecosystem.getBoundingClientRect();
        const dx = (x - bounds.left) / bounds.width - .5;
        const dy = (y - bounds.top) / bounds.height - .5;
        ecosystem.style.transform = `perspective(900px) rotateX(${-dy * 7}deg) rotateY(${dx * 7}deg)`;
      });
    });
    ecosystem.addEventListener('pointerleave', () => { ecosystem.style.transform = ''; });
  }
})();
