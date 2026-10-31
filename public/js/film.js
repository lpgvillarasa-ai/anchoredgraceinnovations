// The homepage film: a short film that plays forwards and backwards as you scroll.
// It is a stack of still pictures drawn on a canvas, so it can follow the scroll
// exactly (a normal video cannot). The film stays hidden until its pictures exist
// (/film/manifest.json), loads only when the visitor gets near it, uses smaller
// pictures on phones, and shows one still picture to people who turn motion off.
(function () {
  'use strict';
  var section = document.querySelector('[data-film]');
  if (!section || !window.fetch) return;

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canvas = section.querySelector('.film-canvas');
  var ctx = canvas.getContext('2d');
  var fill = section.querySelector('.film-progress-fill');
  var chapters = Array.prototype.map.call(section.querySelectorAll('.film-chapter'), function (el, i, all) {
    return { el: el, from: parseFloat(el.dataset.from), to: parseFloat(el.dataset.to), first: i === 0, last: i === all.length - 1 };
  });

  var set = null;        // the picture set in use (wide for computers, tall for phones)
  var frames = [];       // one Image per picture, filled in as they load
  var shown = -1;        // the picture currently on the canvas
  var inView = false;
  var queued = false;

  // Only pictures from our own /film/ folder, in a format we expect.
  function validSet(s) {
    return s && typeof s.path === 'string' && /^\/film\/[\w\/-]+\/$/.test(s.path) &&
      (s.ext === 'webp' || s.ext === 'jpg') && Number.isInteger(s.count) && s.count >= 2 && s.count <= 400;
  }
  function frameUrl(i) {
    var n = String(i + 1);
    while (n.length < 4) n = '0' + n;
    return set.path + n + '.' + set.ext;
  }

  function pickSet(m) {
    // Phones get the upright set. Large or high-resolution screens get the extra-sharp
    // set (hd), unless the visitor has turned on data saver; everything else the wide set.
    var tall = window.innerWidth <= 720 && window.innerWidth / window.innerHeight < 0.9;
    if (tall && validSet(m.sets.tall)) return m.sets.tall;
    var saveData = navigator.connection && navigator.connection.saveData;
    var screenPx = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
    if (!saveData && screenPx > 2000 && validSet(m.sets.hd)) return m.sets.hd;
    return validSet(m.sets.wide) ? m.sets.wide : null;
  }

  // ---------- Drawing ----------
  function sizeCanvas() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.round(canvas.clientWidth * dpr);
    var h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      shown = -1;
    }
  }
  function draw(i) {
    var img = frames[i];
    if (!img || !img.complete || !img.naturalWidth || i === shown) return;
    var cw = canvas.width, ch = canvas.height;
    var s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    var w = img.naturalWidth * s, h = img.naturalHeight * s;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    shown = i;
  }
  // The nearest picture that has arrived, so scrolling early never shows a gap.
  function nearestLoaded(i) {
    for (var d = 0; d < set.count; d++) {
      if (frames[i - d] && frames[i - d].ready) return i - d;
      if (frames[i + d] && frames[i + d].ready) return i + d;
    }
    return -1;
  }

  // ---------- Scroll ----------
  function progress() {
    var rect = section.getBoundingClientRect();
    var total = section.offsetHeight - window.innerHeight;
    if (total <= 0) return 0;
    return Math.min(1, Math.max(0, -rect.top / total));
  }
  function update() {
    queued = false;
    var p = progress();
    var at = nearestLoaded(Math.round(p * (set.count - 1)));
    if (at >= 0) draw(at);
    if (fill) fill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    chapters.forEach(function (c) {
      // Each chapter fades in at the start of its stretch and out at the end.
      // The first is already showing as the film arrives; the last stays to the end.
      var t = (p - c.from) / (c.to - c.from);
      var fadeIn = c.first ? 1 : t / 0.18;
      var fadeOut = c.last ? 1 : (1 - t) / 0.18;
      var o = t < 0 && !c.first ? 0 : t > 1 && !c.last ? 0 : Math.max(0, Math.min(1, fadeIn, fadeOut));
      c.el.style.opacity = o.toFixed(3);
      c.el.style.transform = 'translateY(' + ((1 - o) * 18).toFixed(1) + 'px)';
      c.el.setAttribute('aria-hidden', o < 0.05 ? 'true' : 'false');
    });
  }
  function requestUpdate() {
    if (!queued && inView) {
      queued = true;
      window.requestAnimationFrame(update);
    }
  }

  // ---------- Loading ----------
  function load(i) {
    if (frames[i]) return Promise.resolve();
    var img = new Image();
    img.decoding = 'async';
    frames[i] = img;
    return new Promise(function (resolve) {
      img.onload = function () {
        (img.decode ? img.decode() : Promise.resolve()).catch(function () {}).then(function () {
          img.ready = true;
          requestUpdate();
          resolve();
        });
      };
      img.onerror = function () { resolve(); };
      img.src = frameUrl(i);
    });
  }
  // Loads every 16th picture first, then fills the gaps, a few at a time.
  function loadAll() {
    var order = [];
    var seen = {};
    [16, 8, 4, 2, 1].forEach(function (step) {
      for (var i = 0; i < set.count; i += step) if (!seen[i]) { seen[i] = 1; order.push(i); }
    });
    if (!seen[set.count - 1]) order.push(set.count - 1);
    var next = 0;
    function worker() {
      if (next >= order.length) return Promise.resolve();
      return load(order[next++]).then(worker);
    }
    for (var k = 0; k < 6; k++) worker();
  }

  // ---------- Start ----------
  function start(m) {
    set = pickSet(m);
    if (!set) return;
    section.hidden = false;
    if (REDUCED) section.classList.add('is-still');
    sizeCanvas();

    load(0).then(function () {
      sizeCanvas();
      draw(0);
    });
    if (REDUCED) return;

    section.classList.add('is-live');
    // The rest of the film loads only after the page itself has finished loading,
    // and only once the visitor is within about a screen of it.
    var started = false;
    var pageLoaded = document.readyState === 'complete';
    function maybeLoad() {
      if (inView && pageLoaded && !started) { started = true; loadAll(); }
    }
    if (!pageLoaded) window.addEventListener('load', function () { pageLoaded = true; maybeLoad(); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.target === section) inView = e.isIntersecting;
      });
      maybeLoad();
      requestUpdate();
    }, { rootMargin: '100% 0px 100% 0px' });
    io.observe(section);

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', function () { sizeCanvas(); requestUpdate(); });
    update();
  }

  fetch('/film/manifest.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (m) { if (m && m.sets) start(m); })
    .catch(function () { /* no film yet: the section stays hidden */ });
})();
