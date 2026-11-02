/* Draws the project gallery and the video section from js/projects.js.
   Every value is added as plain text (textContent), never as HTML. */
(function () {
  'use strict';
  var GROUP_LABEL = { live: 'Client website', product: 'Our product', system: 'Private system' };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // Only https links are ever drawn. Icons above are fixed markup, never data.
  function safeUrl(u) {
    try { var p = new URL(u); return p.protocol === 'https:' ? p.href : null; } catch (e) { return null; }
  }

  function hostOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return ''; }
  }

  // The screenshot (or a lock badge) inside a small browser window.
  function frame(p, url) {
    var f = el('div', 'work-frame');
    var bar = el('div', 'work-chrome');
    bar.setAttribute('aria-hidden', 'true');
    bar.appendChild(el('i')); bar.appendChild(el('i')); bar.appendChild(el('i'));
    bar.appendChild(el('span', 'work-url', url ? hostOf(url) : (p.group === 'system' ? 'Private system' : 'Private preview')));
    f.appendChild(bar);
    var shot = el('div', 'work-shot');
    var img = p.img && /^media\/[\w\/.-]+$/.test(p.img) ? p.img : null;
    if (img) {
      var pic = el('img');
      pic.src = img;
      pic.alt = 'Screenshot of ' + p.name;
      pic.loading = 'lazy';
      pic.decoding = 'async';
      pic.width = 960; pic.height = 600;
      shot.appendChild(pic);
      if (!url) {
        // Private work: the screenshot has every name and number blurred out.
        shot.classList.add('is-private');
        shot.appendChild(el('span', 'work-private', 'Sample data only'));
      }
    } else {
      shot.classList.add('no-shot');
      var badge = el('div', 'work-lock');
      badge.setAttribute('aria-hidden', 'true');
      badge.innerHTML = p.group === 'system'
        ? '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>'
        : '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/></svg>';
      badge.appendChild(el('span', null, p.group === 'system' ? 'Private' : 'In private beta'));
      shot.appendChild(badge);
    }
    f.appendChild(shot);
    return f;
  }

  function ctaText(p, url) {
    return url ? 'Visit live site' : (p.group === 'system' ? 'Ask about it on a call' : 'Demo on a call');
  }

  function card(p, index) {
    var url = p.group !== 'system' && p.url ? safeUrl(p.url) : null;
    var c = el('article', 'work-card work-' + p.group);
    c.dataset.group = p.group;
    c.dataset.index = String(index);
    c.appendChild(frame(p, url));
    var body = el('div', 'work-body');
    var meta = el('div', 'work-meta');
    meta.appendChild(el('span', 'work-group', GROUP_LABEL[p.group] || ''));
    meta.appendChild(el('span', 'work-kind', p.kind));
    body.appendChild(meta);
    body.appendChild(el('h3', 'work-title', p.name));
    body.appendChild(el('p', 'work-line', p.line));
    var tags = el('div', 'work-tags');
    (p.tags || []).slice(0, 4).forEach(function (t) { tags.appendChild(el('span', 'work-tag', t)); });
    body.appendChild(tags);
    body.appendChild(el('span', 'work-cta', 'View project →'));
    c.appendChild(body);
    // One button over the whole card opens the large preview with what's inside.
    var hit = el('button', 'work-hit');
    hit.type = 'button';
    hit.setAttribute('aria-haspopup', 'dialog');
    hit.setAttribute('aria-label', 'Open ' + p.name);
    c.appendChild(hit);
    return c;
  }

  var grid = document.querySelector('[data-work-grid]');
  var list = (window.AGI_PROJECTS || []).filter(function (p) { return p.show; });
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (grid) {
    list.forEach(function (p, i) { grid.appendChild(card(p, i)); });
    var chips = document.querySelectorAll('[data-filter]');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var f = chip.dataset.filter;
        chips.forEach(function (x) {
          var on = x === chip;
          x.classList.toggle('is-on', on);
          x.setAttribute('aria-pressed', String(on));
        });
        grid.querySelectorAll('.work-card').forEach(function (c) {
          c.hidden = f !== 'all' && c.dataset.group !== f;
        });
        grid.scrollTo({ left: 0, behavior: 'instant' });
        updateRail();
      });
    });

    // ---------- Arrows and the gold progress line ----------
    var arrows = document.querySelector('[data-work-arrows]');
    var prev = document.querySelector('[data-work-prev]');
    var next = document.querySelector('[data-work-next]');
    var fill = document.querySelector('[data-work-track]');
    var queued = false;
    function updateRail() {
      queued = false;
      var max = grid.scrollWidth - grid.clientWidth;
      var canScroll = max > 4;
      if (arrows) arrows.hidden = !canScroll;
      if (prev) prev.disabled = grid.scrollLeft <= 4;
      if (next) next.disabled = grid.scrollLeft >= max - 4;
      if (fill) {
        var shown = grid.clientWidth / Math.max(grid.scrollWidth, 1);
        var at = canScroll ? grid.scrollLeft / max : 0;
        fill.style.transform = 'translateX(' + (at * (1 - shown) * 100).toFixed(2) + '%) scaleX(' + Math.min(1, shown).toFixed(3) + ')';
      }
      tilt();
    }
    function step(dir) {
      var first = grid.querySelector('.work-card:not([hidden])');
      var gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
      var per = first ? first.offsetWidth + gap : grid.clientWidth;
      var visible = Math.max(1, Math.floor((grid.clientWidth + gap) / per));
      grid.scrollBy({ left: dir * per * visible, behavior: 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });

    // ---------- 3D: cards angle toward the middle; the one you point at faces you ----------
    function tilt() {
      if (still) return;
      var gr = grid.getBoundingClientRect();
      var right = Math.min(gr.right, window.innerWidth);
      var focus = (gr.left + right) / 2;
      grid.querySelectorAll('.work-card:not([hidden])').forEach(function (c) {
        var r = c.getBoundingClientRect();
        if (r.right < -300 || r.left > window.innerWidth + 300) return;
        var d = (r.left + r.width / 2 - focus) / Math.max(r.width, 1);
        c.style.setProperty('--ry-auto', Math.max(-24, Math.min(24, -d * 9)).toFixed(2) + 'deg');
        c.style.setProperty('--tz-auto', (-Math.min(90, Math.abs(d) * 26)).toFixed(1) + 'px');
        c.style.setProperty('--op-auto', (1 - Math.min(0.3, Math.abs(d) * 0.08)).toFixed(3));
      });
    }
    function front(c, on) { if (!still) c.classList.toggle('is-front', on); }
    grid.addEventListener('pointerover', function (e) {
      var c = e.target.closest && e.target.closest('.work-card');
      if (c && e.pointerType === 'mouse' && !drag) front(c, true);
    });
    grid.addEventListener('pointerout', function (e) {
      var c = e.target.closest && e.target.closest('.work-card');
      if (c && !c.contains(e.relatedTarget)) front(c, false);
    });
    grid.addEventListener('focusin', function (e) { var c = e.target.closest('.work-card'); if (c) front(c, true); });
    grid.addEventListener('focusout', function (e) { var c = e.target.closest('.work-card'); if (c) front(c, false); });

    // ---------- Grab and fling with a mouse (touch already scrolls with momentum) ----------
    var drag = null;
    var justDragged = false;
    var glide = 0;
    function settle() {
      // Come to rest with a card's edge lined up at the start of the row.
      var cardsNow = Array.prototype.filter.call(grid.querySelectorAll('.work-card'), function (c) { return !c.hidden; });
      var gl = grid.getBoundingClientRect().left;
      var best = grid.scrollLeft, bestGap = Infinity;
      cardsNow.forEach(function (c) {
        var off = c.getBoundingClientRect().left - gl - 2;
        if (Math.abs(off) < bestGap) { bestGap = Math.abs(off); best = grid.scrollLeft + off; }
      });
      grid.classList.remove('is-dragging');
      grid.scrollTo({ left: Math.max(0, best), behavior: still ? 'auto' : 'smooth' });
    }
    grid.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      cancelAnimationFrame(glide);
      drag = { x: e.clientX, left: grid.scrollLeft, moved: false, v: 0, lx: e.clientX, lt: performance.now() };
    });
    window.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 6) {
        drag.moved = true;
        grid.classList.add('is-dragging');
        grid.querySelectorAll('.is-front').forEach(function (c) { c.classList.remove('is-front'); });
      }
      if (!drag.moved) return;
      grid.scrollLeft = drag.left - dx;
      var now = performance.now();
      drag.v = drag.v * 0.7 + ((e.clientX - drag.lx) / Math.max(1, now - drag.lt)) * 0.3;
      drag.lx = e.clientX; drag.lt = now;
    });
    window.addEventListener('pointerup', function () {
      if (!drag) return;
      var d = drag;
      drag = null;
      if (!d.moved) return;
      justDragged = true;
      setTimeout(function () { justDragged = false; }, 60);
      var v = -d.v * 16;
      if (still || Math.abs(v) < 1) { settle(); return; }
      (function run() {
        grid.scrollLeft += v;
        v *= 0.93;
        if (Math.abs(v) > 0.6) glide = requestAnimationFrame(run); else settle();
      })();
    });
    grid.addEventListener('dragstart', function (e) { e.preventDefault(); });

    // Arrow keys move between projects inside the row.
    grid.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var hits = Array.prototype.filter.call(grid.querySelectorAll('.work-card:not([hidden]) .work-hit'), Boolean);
      var at = hits.indexOf(document.activeElement);
      if (at < 0) return;
      e.preventDefault();
      var to = hits[Math.max(0, Math.min(hits.length - 1, at + (e.key === 'ArrowRight' ? 1 : -1)))];
      to.focus({ preventScroll: true });
      to.closest('.work-card').scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: still ? 'auto' : 'smooth' });
    });

    grid.addEventListener('scroll', function () {
      if (!queued) { queued = true; window.requestAnimationFrame(updateRail); }
    }, { passive: true });
    window.addEventListener('resize', updateRail);
    updateRail();

    // ---------- The large preview: the card lifts out into a window ----------
    var dialog = el('dialog', 'work-dialog');
    dialog.setAttribute('aria-labelledby', 'work-dialog-title');
    document.body.appendChild(dialog);
    function openPreview(c) {
      var p = list[Number(c.dataset.index)];
      if (!p || !dialog.showModal) return;
      var url = p.group !== 'system' && p.url ? safeUrl(p.url) : null;
      dialog.replaceChildren();
      var inner = el('div', 'work-dialog-inner');
      var close = el('button', 'work-dialog-close');
      close.type = 'button';
      close.setAttribute('aria-label', 'Close');
      close.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
      close.addEventListener('click', function () { dialog.close(); });
      var big = frame(p, url);
      var img = big.querySelector('img');
      if (img) img.loading = 'eager';
      var body = el('div', 'work-dialog-body');
      body.appendChild(el('div', 'work-dialog-kicker', (GROUP_LABEL[p.group] || '') + ' · ' + p.kind));
      var h = el('h3', 'work-dialog-title', p.name);
      h.id = 'work-dialog-title';
      body.appendChild(h);
      body.appendChild(el('p', 'work-dialog-line', p.line));
      var tags = el('div', 'work-tags');
      (p.tags || []).slice(0, 6).forEach(function (t) { tags.appendChild(el('span', 'work-tag', t)); });
      body.appendChild(tags);
      // What's inside: the project's main features, then how it connects to our other systems.
      if (p.features && p.features.length) {
        body.appendChild(el('div', 'work-dialog-subhead', 'What\u2019s inside'));
        var feats = el('ul', 'work-feature-list');
        p.features.slice(0, 6).forEach(function (f) { feats.appendChild(el('li', null, f)); });
        body.appendChild(feats);
      }
      if (p.connected) {
        var link = el('p', 'work-dialog-connected');
        link.appendChild(el('b', null, 'Connected'));
        link.appendChild(document.createTextNode(p.connected));
        body.appendChild(link);
      }
      var actions = el('div', 'work-dialog-actions');
      var story = /^\/work\/[a-z0-9-]+$/.test(p.story || '') ? p.story : null;
      if (story) {
        var read = el('a', 'btn btn-dark btn-lg work-dialog-go', 'Read the story ');
        read.appendChild(el('span', 'btn-arrow', '→')).setAttribute('aria-hidden', 'true');
        read.href = story;
        actions.appendChild(read);
      }
      var go = el('a', 'btn ' + (story ? 'btn-outline' : 'btn-dark') + ' btn-lg work-dialog-go', ctaText(p, url) + ' ');
      go.appendChild(el('span', 'btn-arrow', story ? '↗' : '→')).setAttribute('aria-hidden', 'true');
      go.href = url || 'https://calendly.com/lpg-villarasa/30min';
      go.target = '_blank';
      go.rel = 'noopener';
      actions.appendChild(go);
      body.appendChild(actions);
      if (!url) body.appendChild(el('p', 'work-dialog-note', p.group === 'system' ? 'A private client system. We never show real client data: this preview uses sample data only, with names and numbers blurred.' : 'We walk you through it on a short call.'));
      inner.appendChild(close);
      inner.appendChild(big);
      inner.appendChild(body);
      dialog.appendChild(inner);
      document.documentElement.classList.add('work-dialog-open');
      dialog.showModal();
      // The window grows out of the card you tapped.
      var from = c.querySelector('.work-frame').getBoundingClientRect();
      var to = big.getBoundingClientRect();
      if (!still && from.width && to.width && inner.animate) {
        var sx = from.width / to.width;
        var dx = from.left - to.left, dy = from.top - to.top;
        big.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ')', borderRadius: '12px' }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.16,1,.3,1)' });
        body.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: 140, easing: 'ease-out', fill: 'backwards' });
      }
      close.focus();
    }
    dialog.addEventListener('close', function () { document.documentElement.classList.remove('work-dialog-open'); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
    grid.addEventListener('click', function (e) {
      var hit = e.target.closest && e.target.closest('.work-hit');
      if (!hit) return;
      if (justDragged) { e.preventDefault(); return; }
      openPreview(hit.closest('.work-card'));
    });
  }

  // Marketing videos: each plays silently, on a loop, while it is on screen, and
  // pauses when it leaves (so only what you can see uses data). "Tap for sound"
  // turns sound on for that video only. With motion turned off, nothing plays by
  // itself: the normal controls appear instead.
  var videos = (window.AGI_VIDEOS || []).filter(function (v) { return v && /^\/reels\/[\w\/.-]+\.mp4$/.test(v.src); });
  var vSection = document.querySelector('[data-videos]');
  var vGrid = document.querySelector('[data-video-grid]');
  var stillOnly = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (vSection && vGrid && videos.length) {
    var players = [];
    videos.forEach(function (v) {
      var f = el('figure', 'video-card');
      var frame = el('div', 'video-frame');
      var vid = el('video');
      if (v.poster && /^\/reels\/[\w\/.-]+\.jpg$/.test(v.poster)) vid.poster = v.poster;
      vid.muted = true;
      vid.defaultMuted = true;
      vid.loop = true;
      vid.playsInline = true;
      vid.setAttribute('playsinline', '');
      vid.preload = 'none';
      vid.setAttribute('controlsList', 'nodownload');
      vid.setAttribute('aria-label', (v.title || 'Video') + ', ' + (v.note || ''));
      vid.dataset.src = v.src;
      frame.appendChild(vid);
      if (stillOnly) {
        vid.controls = true;
        vid.src = v.src;
      } else {
        var sound = el('button', 'video-sound', 'Tap for sound');
        sound.type = 'button';
        sound.setAttribute('aria-pressed', 'false');
        sound.addEventListener('click', function () {
          var on = vid.muted;
          players.forEach(function (p) { p.vid.muted = true; p.sound.textContent = 'Tap for sound'; p.sound.setAttribute('aria-pressed', 'false'); });
          vid.muted = !on;
          sound.textContent = on ? 'Sound on' : 'Tap for sound';
          sound.setAttribute('aria-pressed', String(on));
          if (on) vid.play().catch(function () {});
        });
        frame.appendChild(sound);
        players.push({ vid: vid, sound: sound });
      }
      f.appendChild(frame);
      var cap = el('figcaption');
      cap.appendChild(el('strong', null, v.title || ''));
      if (v.note) cap.appendChild(el('span', null, v.note));
      f.appendChild(cap);
      vGrid.appendChild(f);
    });
    vSection.hidden = false;
    if (!stillOnly && 'IntersectionObserver' in window) {
      var vio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var vid = e.target;
          if (e.isIntersecting) {
            if (!vid.src) { vid.src = vid.dataset.src; vid.preload = 'auto'; }
            vid.play().catch(function () {});
          } else if (vid.src) {
            vid.pause();
          }
        });
      }, { threshold: 0.5 });
      players.forEach(function (p) { vio.observe(p.vid); });
    }
  }
})();
