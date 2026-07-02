(() => {
  // Marks that JS is available; [data-reveal] elements are only hidden under .js
  document.documentElement.classList.add('js');

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasIO = 'IntersectionObserver' in window;

  // Hero headline word-mask rise — must run BEFORE the reveal observer registers.
  // Words stay real text nodes (whitespace preserved) so selection, copy and
  // screen readers are unaffected. data-reveal is stripped so agiUp can't double-fire.
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle && !REDUCED) {
    const parts = heroTitle.textContent.split(/(\s+)/);
    heroTitle.textContent = '';
    let wordIndex = 0;
    parts.forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        heroTitle.appendChild(document.createTextNode(part));
        return;
      }
      const mask = document.createElement('span');
      mask.className = 'w';
      const inner = document.createElement('span');
      inner.className = 'wi';
      inner.style.setProperty('--wi', String(wordIndex++));
      inner.textContent = part;
      mask.appendChild(inner);
      heroTitle.appendChild(mask);
    });
    heroTitle.removeAttribute('data-reveal');
    heroTitle.style.removeProperty('--d');
  }

  // Scroll reveal — elements above the fold intersect immediately and animate on load
  const reveals = document.querySelectorAll('[data-reveal]');
  if (hasIO) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
    // Failsafe: if the observer misfires, force only elements currently in the
    // viewport. Off-screen elements stay observed so their reveal still plays
    // on scroll instead of firing invisibly at t=2.4s.
    setTimeout(() => {
      reveals.forEach((el) => {
        if (el.classList.contains('in')) return;
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          el.classList.add('in');
          io.unobserve(el);
        }
      });
    }, 2400);
    // Keyboard users: never leave focus inside a still-hidden reveal group
    document.addEventListener('focusin', (e) => {
      const host = e.target instanceof Element && e.target.closest('[data-reveal]');
      if (host && !host.classList.contains('in')) {
        host.classList.add('in');
        io.unobserve(host);
      }
    });
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  // Glass nav condense + scroll-progress hairline — one rAF-throttled pipeline
  const nav = document.querySelector('[data-nav]');
  if (nav) {
    const progress = document.createElement('div');
    progress.className = 'nav-progress';
    progress.setAttribute('aria-hidden', 'true');
    nav.appendChild(progress);
    let scrollQueued = false;
    const onScrollFrame = () => {
      scrollQueued = false;
      const y = window.scrollY || 0;
      nav.classList.toggle('scrolled', y > 24);
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      progress.style.transform = 'scaleX(' + Math.min(1, y / max) + ')';
    };
    window.addEventListener('scroll', () => {
      if (!scrollQueued) {
        scrollQueued = true;
        requestAnimationFrame(onScrollFrame);
      }
    }, { passive: true });
    onScrollFrame();
  }

  // Mobile menu
  const toggle = document.querySelector('[data-nav-toggle]');
  const menu = document.querySelector('[data-nav-menu]');
  if (toggle && menu) {
    const setMenu = (open) => {
      menu.classList.toggle('open', open);
      if (nav) nav.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenu(false));
    });
  }

  // Hero dashboard boot: progress fill + bar growth (CSS, keyed off .dash-live)
  // and a stat count-up. Targets are parsed from the markup so the HTML stays
  // the source of truth. Skipped entirely under reduced motion — the pre-boot
  // hidden states only exist inside a no-preference media query.
  const dashCard = document.querySelector('.dash-card');
  if (dashCard && !REDUCED) {
    const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
    const countUp = (targets, dur) => {
      const start = performance.now();
      const tick = (now) => {
        const p = easeOutExpo(Math.min(1, (now - start) / dur));
        targets.forEach((t) => {
          t.el.textContent = t.prefix + (t.value * p).toFixed(t.decimals) + t.suffix;
        });
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    let booted = false;
    const boot = () => {
      if (booted) return;
      booted = true;
      dashCard.classList.add('dash-live');
      const targets = [];
      dashCard.querySelectorAll('.dash-stat-value, .dash-chip').forEach((el) => {
        const m = el.textContent.trim().match(/^([^0-9]*)([\d.,]+)([\s\S]*)$/);
        if (!m) return;
        targets.push({
          el,
          prefix: m[1],
          value: parseFloat(m[2].replace(/,/g, '')),
          decimals: (m[2].split('.')[1] || '').length,
          suffix: m[3],
        });
      });
      countUp(targets, 1100);
    };
    if (hasIO) {
      const dashIO = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            dashIO.unobserve(entry.target);
            // Let the hero-visual's own reveal land before the card boots
            setTimeout(boot, 600);
          }
        });
      }, { threshold: 0.35 });
      dashIO.observe(dashCard);
      // Failsafe, mirroring the reveal failsafe above: only boot if the card
      // is meaningfully in view (same 35% bar as the observer) — otherwise the
      // observer boots it on scroll, so mobile users (where the card sits
      // below the fold) still get to see the boot sequence.
      setTimeout(() => {
        const r = dashCard.getBoundingClientRect();
        const visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
        if (r.height > 0 && visible / r.height >= 0.35) boot();
      }, 3000);
    } else {
      boot();
    }
  }

  // Trust-strip logo marquee — restores the designer's agiMarquee. The DOM is
  // only restructured when motion is allowed; otherwise the static row remains.
  const trustItems = document.querySelector('.trust-items');
  if (trustItems && !REDUCED) {
    const set = document.createElement('div');
    set.className = 'trust-set';
    while (trustItems.firstChild) set.appendChild(trustItems.firstChild);
    const clone = set.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    const track = document.createElement('div');
    track.className = 'trust-track';
    track.appendChild(set);
    track.appendChild(clone);
    trustItems.classList.add('marquee');
    trustItems.appendChild(track);
    // Pause the loop while the strip is off-screen
    if (hasIO) {
      const trustIO = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          trustItems.classList.toggle('is-offscreen', !entry.isIntersecting);
        });
      });
      trustIO.observe(trustItems);
    }
  }

  // Nav scroll-spy — the gold underline glides between links as sections
  // cross mid-viewport. #contact is the gold button and is excluded.
  if (hasIO) {
    const navAnchors = document.querySelectorAll('.nav-links > a:not(.btn)');
    if (navAnchors.length) {
      const spy = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navAnchors.forEach((a) => a.classList.remove('active'));
          const link = document.querySelector('.nav-links > a[href="#' + entry.target.id + '"]:not(.btn)');
          if (link) link.classList.add('active');
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      ['services', 'talent', 'process', 'pricing'].forEach((id) => {
        const section = document.getElementById(id);
        if (section) spy.observe(section);
      });
    }
  }

  // Magnetic pull on the three primary CTAs — desktop fine pointers only.
  // Moves an inner wrapper so it composes with the buttons' own hover lift.
  if (FINE && !REDUCED) {
    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
    document.querySelectorAll('.btn-dark.btn-lg, .btn-gold.btn-xl, .btn-gold.btn-nav').forEach((btn) => {
      const inner = document.createElement('span');
      inner.className = 'btn-inner';
      while (btn.firstChild) inner.appendChild(btn.firstChild);
      btn.appendChild(inner);
      let raf = 0;
      let rect = null;
      let targetX = 0, targetY = 0, x = 0, y = 0;
      const frame = () => {
        x += (targetX - x) * 0.14;
        y += (targetY - y) * 0.14;
        inner.style.transform = 'translate(' + x.toFixed(2) + 'px, ' + y.toFixed(2) + 'px)';
        raf = requestAnimationFrame(frame);
      };
      btn.addEventListener('pointerenter', () => {
        // Cache the rect once per hover — avoids a forced style recalc on
        // every pointermove while the rAF loop is writing transforms.
        rect = btn.getBoundingClientRect();
        inner.style.transition = 'none';
        inner.style.willChange = 'transform';
        if (!raf) raf = requestAnimationFrame(frame);
      });
      btn.addEventListener('pointermove', (e) => {
        const r = rect || (rect = btn.getBoundingClientRect());
        targetX = clamp((e.clientX - (r.left + r.width / 2)) * 0.18, -4, 4);
        targetY = clamp((e.clientY - (r.top + r.height / 2)) * 0.18, -3, 3);
      });
      btn.addEventListener('pointerleave', () => {
        cancelAnimationFrame(raf);
        raf = 0;
        rect = null;
        targetX = targetY = x = y = 0;
        inner.style.transition = 'transform .55s cubic-bezier(.22, 1, .36, 1)';
        inner.style.transform = 'translate(0px, 0px)';
        inner.addEventListener('transitionend', () => {
          inner.style.willChange = '';
        }, { once: true });
      });
    });
  }

  // Ambient glow/float loops pause while their section is off-screen —
  // extends the marquee's is-offscreen pattern to the other infinite loops.
  if (hasIO && !REDUCED) {
    const ambientIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-offscreen', !entry.isIntersecting);
      });
    });
    document.querySelectorAll('.hero, .mission, .ai-band, .contact').forEach((el) => ambientIO.observe(el));
  }

  // Copyright year
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
