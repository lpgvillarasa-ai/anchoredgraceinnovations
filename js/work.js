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
      });
    });
  }

  var videos = (window.AGI_VIDEOS || []).filter(function (v) { return v && v.src; });
  var vSection = document.querySelector('[data-videos]');
  var vGrid = document.querySelector('[data-video-grid]');
  if (vSection && vGrid && videos.length) {
    videos.forEach(function (v) {
      var f = el('figure', 'video-card');
      var vid = el('video');
      vid.src = v.src;
      if (v.poster) vid.poster = v.poster;
      vid.controls = true;
      vid.preload = 'none';
      vid.playsInline = true;
      vid.setAttribute('controlsList', 'nodownload');
      f.appendChild(vid);
      var cap = el('figcaption');
      cap.appendChild(el('strong', null, v.title || ''));
      if (v.note) cap.appendChild(el('span', null, v.note));
      f.appendChild(cap);
      vGrid.appendChild(f);
    });
    vSection.hidden = false;
  }
})();
