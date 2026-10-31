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
  // Opaque canvas (the film fills it edge to edge): cheaper for the browser to show.
  var ctx = canvas.getContext('2d', { alpha: false });
  var fill = section.querySelector('.film-progress-fill');
  var chapters = Array.prototype.map.call(section.querySelectorAll('.film-chapter'), function (el, i, all) {
    return { el: el, from: parseFloat(el.dataset.from), to: parseFloat(el.dataset.to), first: i === 0, last: i === all.length - 1 };
  });

  var set = null;        // the picture set in use (wide for computers, tall for phones)
  var frames = [];       // one entry per picture: its compressed file, once fetched
  var shown = -1;        // the picture currently on the canvas
  var inView = false;
  var queued = false;

  // Pictures near the current one, already unpacked and sized to the screen.
  // Unpacking a compressed picture is slow; doing it ahead of time, off the main
  // work, is what keeps scrolling smooth. Only a few are kept, to save memory.
  var bitmaps = {};
  var making = {};
  var near = 2;
  var target = 0;
  var canBitmap = typeof window.createImageBitmap === 'function';

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
      dropBitmaps(function () { return true; });
      setBudget(w * h * 4);
    }
  }
  // About 96 MB of unpacked pictures at most: more nearby on phones, fewer on big screens.
  function setBudget(bytesEach) {
    near = Math.max(2, Math.min(8, Math.floor(96e6 / bytesEach / 2.5)));
  }
  function dropBitmaps(test) {
    Object.keys(bitmaps).forEach(function (k) { if (test(+k)) { bitmaps[k].close(); delete bitmaps[k]; } });
  }
  function cover(w, h) {
    var s = Math.max(canvas.width / w, canvas.height / h);
    return { w: Math.round(w * s), h: Math.round(h * s) };
  }
  // Unpacks picture i in the background, already sized to the screen.
  function makeBitmap(i) {
    var f = frames[i];
    if (!canBitmap || i < 0 || i >= set.count || !f || !f.ready || bitmaps[i] || making[i]) return;
    var size = cover(set.w || 1080, set.h || 1920);
    var forCanvas = canvas.width + 'x' + canvas.height;
    making[i] = true;
    window.createImageBitmap(f.blob, { resizeWidth: size.w, resizeHeight: size.h, resizeQuality: 'medium' }).then(function (bm) {
      making[i] = false;
      if (forCanvas !== canvas.width + 'x' + canvas.height || Math.abs(i - target) > near + 2) { bm.close(); return; }
      // A browser that ignores the size request gives full-size copies: keep fewer of them.
      if (bm.width > size.w + 2) setBudget(bm.width * bm.height * 4);
      bitmaps[i] = bm;
      if (shown < 0 || REDUCED) draw(i); else requestUpdate();
    }).catch(function () {
      making[i] = false;
      canBitmap = false; // fall back to plain pictures
      requestUpdate();
    });
  }
  function keepNear(i) {
    dropBitmaps(function (k) { return Math.abs(k - i) > near + 2; });
    for (var d = 0; d <= near; d++) { makeBitmap(i + d); makeBitmap(i - d); }
  }
  function draw(i) {
    if (i === shown) return;
    var cw = canvas.width, ch = canvas.height;
    var bm = bitmaps[i];
    if (bm) {
      var fit = bm.width === cover(bm.width, bm.height).w ? bm : null;
      if (fit) ctx.drawImage(bm, (cw - bm.width) / 2, (ch - bm.height) / 2);
      else { var sz = cover(bm.width, bm.height); ctx.drawImage(bm, (cw - sz.w) / 2, (ch - sz.h) / 2, sz.w, sz.h); }
      shown = i;
      return;
    }
    var img = imgOf(i);
    if (!img || !img.complete || !img.naturalWidth) return;
    var size = cover(img.naturalWidth, img.naturalHeight);
    ctx.drawImage(img, (cw - size.w) / 2, (ch - size.h) / 2, size.w, size.h);
    shown = i;
  }
  // Plain picture, only for browsers that cannot unpack pictures in the background.
  function imgOf(i) {
    var f = frames[i];
    if (canBitmap || !f || !f.ready) return null;
    if (!f.img) {
      f.img = new Image();
      f.img.onload = requestUpdate;
      f.img.src = f.blob ? URL.createObjectURL(f.blob) : frameUrl(i);
    }
    return f.img;
  }
  // The nearest picture ready to show, so scrolling early never shows a gap.
  function nearestLoaded(i) {
    for (var d = 0; d < set.count; d++) {
      if (canBitmap) {
        if (bitmaps[i - d]) return i - d;
        if (bitmaps[i + d]) return i + d;
        if (d > near + 2) return -1;
      } else {
        if (frames[i - d] && frames[i - d].ready) return i - d;
        if (frames[i + d] && frames[i + d].ready) return i + d;
      }
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
    target = Math.round(p * (set.count - 1));
    keepNear(target);
    var at = nearestLoaded(target);
    if (at >= 0) draw(at);
    var fillAt = p.toFixed(3);
    if (fill && fill.dataset.at !== fillAt) { fill.dataset.at = fillAt; fill.style.transform = 'scaleX(' + fillAt + ')'; }
    chapters.forEach(function (c) {
      // Each chapter fades in at the start of its stretch and out at the end.
      // The first is already showing as the film arrives; the last stays to the end.
      var t = (p - c.from) / (c.to - c.from);
      var fadeIn = c.first ? 1 : t / 0.18;
      var fadeOut = c.last ? 1 : (1 - t) / 0.18;
      var o = t < 0 && !c.first ? 0 : t > 1 && !c.last ? 0 : Math.max(0, Math.min(1, fadeIn, fadeOut));
      // Only touch the page when something visibly changed (most scroll steps change nothing here).
      var key = o.toFixed(2);
      if (key === c.shownAt) return;
      c.shownAt = key;
      c.el.style.opacity = key;
      c.el.style.transform = o >= 1 ? 'none' : 'translateY(' + ((1 - o) * 18).toFixed(1) + 'px)';
      var hidden = o < 0.05 ? 'true' : 'false';
      if (c.hidden !== hidden) { c.hidden = hidden; c.el.setAttribute('aria-hidden', hidden); }
    });
  }
  function requestUpdate() {
    if (!queued && inView) {
      queued = true;
      window.requestAnimationFrame(update);
    }
  }

  // ---------- Loading ----------
  // Each picture is fetched as a file and kept compressed (small); it is only
  // unpacked when the viewer gets near it.
  function load(i) {
    if (frames[i]) return frames[i].done;
    var f = frames[i] = { ready: false };
    f.done = window.fetch(frameUrl(i))
      .then(function (r) { return r.ok ? r.blob() : null; })
      .then(function (blob) {
        if (!blob) return;
        f.blob = blob;
        f.ready = true;
        requestUpdate();
      })
      .catch(function () {});
    return f.done;
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
      if (canBitmap) makeBitmap(0); else draw(0);
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
