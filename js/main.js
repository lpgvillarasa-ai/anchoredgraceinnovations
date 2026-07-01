(() => {
  // Marks that JS is available; [data-reveal] elements are only hidden under .js
  document.documentElement.classList.add('js');

  // Scroll reveal — elements above the fold intersect immediately and animate on load
  const reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
    // Ensure everything is visible even if the observer misfires
    setTimeout(() => reveals.forEach((el) => el.classList.add('in')), 2400);
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  // Glass nav condenses slightly once the page is scrolled
  const nav = document.querySelector('[data-nav]');
  const onScroll = () => {
    nav.classList.toggle('scrolled', (window.scrollY || 0) > 24);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const toggle = document.querySelector('[data-nav-toggle]');
  const menu = document.querySelector('[data-nav-menu]');
  const setMenu = (open) => {
    menu.classList.toggle('open', open);
    nav.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });

  // Copyright year
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
