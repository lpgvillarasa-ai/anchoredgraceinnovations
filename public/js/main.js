(() => {
  // Anything already on screen when this script runs shows at once, with no
  // animation (.instant). Done before .js is added, so nothing visible blinks out.
  const inView = (el) => {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
  };
  const showNow = (el) => el.classList.add('in', 'instant');
  document.querySelectorAll('[data-reveal]').forEach((el) => { if (inView(el)) showNow(el); });

  // Marks that JS is available; [data-reveal] elements are only hidden under .js
  document.documentElement.classList.add('js');

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasIO = 'IntersectionObserver' in window;

  // Hero headline word-mask rise — must run BEFORE the reveal observer registers.
  // Words stay real text nodes (whitespace preserved) so selection, copy and
  // screen readers are unaffected. data-reveal is stripped so agiUp can't double-fire.
  // Skipped when the headline is already on screen (the usual case, since this script
  // now starts after the page is shown): re-animating visible text makes it blink out.
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle && !REDUCED && !heroTitle.classList.contains('instant')) {
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

  // Scroll reveal: a short entrance (0.35s) that starts when about 10% of an
  // element shows, a little before it reaches the screen.
  const reveals = document.querySelectorAll('[data-reveal]');
  if (hasIO) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px 10% 0px' });
    reveals.forEach((el) => { if (!el.classList.contains('in')) io.observe(el); });

    // Menu jumps: the section you jump to (and anything on screen when you land)
    // shows at once, so it never looks empty while it would still be fading in.
    const revealSection = (hash) => {
      const id = decodeURIComponent((hash || '').replace(/^#/, ''));
      const target = id && document.getElementById(id);
      if (!target) return;
      const group = target.matches('[data-reveal]') ? [target] : [];
      group.concat(Array.from(target.querySelectorAll('[data-reveal]'))).forEach((el) => {
        if (!el.classList.contains('in')) { showNow(el); io.unobserve(el); }
      });
    };
    document.addEventListener('click', (e) => {
      const a = e.target instanceof Element && e.target.closest('a[href*="#"]');
      if (!a || a.origin !== location.origin || a.pathname !== location.pathname) return;
      revealSection(a.hash);
    });
    window.addEventListener('hashchange', () => revealSection(location.hash));
    if (location.hash) revealSection(location.hash);

    // Failsafe: if the observer misfires, show whatever is on screen.
    setTimeout(() => {
      reveals.forEach((el) => {
        if (!el.classList.contains('in') && inView(el)) { el.classList.add('in'); io.unobserve(el); }
      });
    }, 1200);
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
    (nav.querySelector('.nav-inner') || nav).appendChild(progress);
    // Dark glass while the header floats over a dark section.
    const darkZones = document.querySelectorAll('[data-nav-dark]');
    let scrollQueued = false;
    // All measuring happens first, then all changes: measuring after a change would
    // force the browser to lay the page out again on every scroll step.
    let lastProgress = '';
    const onScrollFrame = () => {
      scrollQueued = false;
      const y = window.scrollY || 0;
      const probe = 40;
      let onDark = false;
      darkZones.forEach((z) => {
        if (onDark || z.hidden) return;
        const r = z.getBoundingClientRect();
        if (r.top <= probe && r.bottom >= probe) onDark = true;
      });
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      nav.classList.toggle('scrolled', y > 24);
      nav.classList.toggle('on-dark', onDark);
      const at = Math.min(1, y / max).toFixed(3);
      if (at !== lastProgress) { lastProgress = at; progress.style.transform = 'scaleX(' + at + ')'; }
    };
    const queue = () => {
      if (!scrollQueued) {
        scrollQueued = true;
        requestAnimationFrame(onScrollFrame);
      }
    };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    onScrollFrame();
  }

  // Email links: the address is put together here, not written in the page, so
  // the simple robots that collect addresses for spam mostly miss it.
  document.querySelectorAll('[data-email]').forEach((link) => {
    const [user, domain] = (link.dataset.email || '').split('|');
    if (!user || !domain || !/^[a-z0-9.-]+$/i.test(domain) || !/^[a-z0-9._+-]+$/i.test(user)) return;
    const address = user + '@' + domain;
    link.href = 'mailto:' + address;
    if (link.classList.contains('contact-email')) link.textContent = address;
  });

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
      ['services', 'work', 'talent', 'process', 'pricing'].forEach((id) => {
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
