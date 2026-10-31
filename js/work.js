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

  function card(p) {
    var url = p.group !== 'system' && p.url ? safeUrl(p.url) : null;
    var c = el(url ? 'a' : 'article', 'work-card work-' + p.group);
    c.dataset.group = p.group;
    if (url) {
      c.href = url;
      c.target = '_blank';
      c.rel = 'noopener';
      c.setAttribute('aria-label', p.name + ', opens the live site in a new tab');
    }

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
        shot.appendChild(el('span', 'work-private', 'Private · details hidden'));
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
    c.appendChild(shot);

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
    body.appendChild(el('span', 'work-cta', url ? 'Visit live site →' : (p.group === 'system' ? 'Walkthrough on a call' : 'Demo on a call')));
    c.appendChild(body);
    return c;
  }

  var grid = document.querySelector('[data-work-grid]');
  var list = (window.AGI_PROJECTS || []).filter(function (p) { return p.show; });
  if (grid) {
    list.forEach(function (p) { grid.appendChild(card(p)); });
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

    // Sideways row: arrow buttons move one screen of cards; a gold line shows where you are.
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
    }
    function step(dir) {
      var card = grid.querySelector('.work-card:not([hidden])');
      var gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
      var per = card ? card.getBoundingClientRect().width + gap : grid.clientWidth;
      var visible = Math.max(1, Math.floor((grid.clientWidth + gap) / per));
      grid.scrollBy({ left: dir * per * visible, behavior: 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    grid.addEventListener('scroll', function () {
      if (!queued) { queued = true; window.requestAnimationFrame(updateRail); }
    }, { passive: true });
    window.addEventListener('resize', updateRail);
    updateRail();
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
