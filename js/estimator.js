/* The estimate assistant's chat window. Talks only to /api/estimate/* on this
   site. Every message is shown with textContent, never as HTML. The button only
   appears when the server says the assistant is switched on. */
(function () {
  'use strict';
  var CALENDLY = 'https://calendly.com/lpg-villarasa/30min';
  var STARTERS = [
    'I need a website for my business',
    'I need a custom app or system',
    'I want to add AI to my business',
    'I need admin staff for my US business',
  ];
  var state = { config: null, sessionId: null, starting: null, busy: false, lastEstimate: null, listening: false, agreed: false };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function post(path, data) {
    return fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j._status = r.status; return j; }); });
  }

  // ---------- Build the window ----------
  var launcher = el('button', 'est-launch');
  launcher.type = 'button';
  launcher.hidden = true;
  launcher.setAttribute('aria-haspopup', 'dialog');
  launcher.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 2c.6 3.6 1.9 4.9 5.5 5.5C13.9 8.1 12.6 9.4 12 13c-.6-3.6-1.9-4.9-5.5-5.5C10.1 6.9 11.4 5.6 12 2Z"/><path fill="currentColor" d="M18 13c.4 2 1 2.6 3 3-2 .4-2.6 1-3 3-.4-2-1-2.6-3-3 2-.4 2.6-1 3-3Z"/></svg>';
  launcher.appendChild(el('span', null, 'Get an estimate'));

  var panel = el('section', 'est-panel');
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Estimate assistant');
  var head = el('div', 'est-head');
  var titleWrap = el('div');
  titleWrap.appendChild(el('div', 'est-title', 'Estimate assistant'));
  titleWrap.appendChild(el('div', 'est-sub', 'AI · prices from our approved price book'));
  var close = el('button', 'est-close', '×');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close the estimate assistant');
  head.appendChild(titleWrap);
  head.appendChild(close);

  var log = el('div', 'est-log');
  log.setAttribute('aria-live', 'polite');
  var human = el('div', 'est-human');
  // The visitor taps OK on the AI notice before they can chat (the server checks it too).
  var agree = el('div', 'est-agree');
  var agreeText = el('p', 'est-agree-text');
  var agreeBtn = el('button', 'est-btn est-btn-gold', 'OK, start chatting');
  agreeBtn.type = 'button';
  agree.appendChild(agreeText);
  agree.appendChild(agreeBtn);
  var starters = el('div', 'est-starters');
  STARTERS.forEach(function (t) {
    var b = el('button', 'est-chip', t);
    b.type = 'button';
    b.addEventListener('click', function () { send(t); });
    starters.appendChild(b);
  });

  var form = el('form', 'est-form');
  var input = el('textarea', 'est-input');
  input.id = 'est-input';
  input.rows = 1;
  input.maxLength = 800;
  input.placeholder = 'Describe what you need…';
  input.setAttribute('aria-label', 'Your message');
  var mic = el('button', 'est-mic');
  mic.type = 'button';
  mic.setAttribute('aria-label', 'Speak instead of typing');
  mic.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
  var sendBtn = el('button', 'est-send', 'Send');
  sendBtn.type = 'submit';
  form.appendChild(input);
  form.appendChild(mic);
  form.appendChild(sendBtn);
  var foot = el('p', 'est-foot', 'Estimates are a guide; your final price is confirmed on a free call.');

  panel.appendChild(head);
  panel.appendChild(log);
  panel.appendChild(human);
  panel.appendChild(agree);
  panel.appendChild(starters);
  panel.appendChild(form);
  panel.appendChild(foot);
  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  // ---------- Chat ----------
  function bubble(who, text) {
    var b = el('div', 'est-msg est-' + who, text);
    log.appendChild(b);
    log.scrollTop = log.scrollHeight;
    return b;
  }
  function note(text) { bubble('note', text); }

  function estimateCard(e) {
    var card = el('div', 'est-card');
    card.appendChild(el('div', 'est-card-title', 'Your estimate'));
    var list = el('ul', 'est-lines');
    e.lines.forEach(function (l) {
      var li = el('li');
      li.appendChild(el('span', 'est-line-name', l.label));
      li.appendChild(el('span', 'est-line-range', l.range + (l.billing === 'month' ? ' a month' : '')));
      list.appendChild(li);
    });
    card.appendChild(list);
    if (e.one_time) card.appendChild(el('div', 'est-total', 'One-time: ' + e.one_time));
    if (e.monthly) card.appendChild(el('div', 'est-total', 'Monthly: ' + e.monthly));
    (e.notes || []).forEach(function (n) { card.appendChild(el('div', 'est-card-note', n)); });
    var actions = el('div', 'est-actions');
    var book = el('a', 'est-btn est-btn-gold', 'Book a free call');
    book.href = CALENDLY;
    book.target = '_blank';
    book.rel = 'noopener';
    var keep = el('button', 'est-btn', 'Send me this estimate');
    keep.type = 'button';
    keep.addEventListener('click', function () { keep.disabled = true; leadForm(actions, book); });
    actions.appendChild(book);
    actions.appendChild(keep);
    card.appendChild(actions);
    log.appendChild(card);
    log.scrollTop = log.scrollHeight;
  }

  function field(label, type, id, required, max) {
    var wrap = el('label', 'est-field');
    wrap.appendChild(el('span', null, label));
    var i = el('input');
    i.type = type; i.id = id; i.maxLength = max;
    if (required) i.required = true;
    wrap.appendChild(i);
    return { wrap: wrap, input: i };
  }

  function leadForm(actions, book) {
    var f = el('form', 'est-lead');
    var name = field('Your name', 'text', 'est-lead-name', true, 80);
    var email = field('Email', 'email', 'est-lead-email', true, 120);
    var biz = field('Business (optional)', 'text', 'est-lead-biz', false, 120);
    var consent = el('label', 'est-consent');
    var box = el('input');
    box.type = 'checkbox'; box.id = 'est-lead-consent'; box.required = true;
    consent.appendChild(box);
    consent.appendChild(el('span', null, 'You may email me about this project. We use your details only for that.'));
    var go = el('button', 'est-btn est-btn-gold', 'Send to Lee');
    go.type = 'submit';
    var msg = el('div', 'est-lead-msg');
    [name.wrap, email.wrap, biz.wrap, consent, go, msg].forEach(function (n) { f.appendChild(n); });
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      go.disabled = true;
      msg.textContent = 'Sending…';
      post('/api/estimate/lead', { sessionId: state.sessionId, name: name.input.value, email: email.input.value, business: biz.input.value, consent: box.checked })
        .then(function (r) {
          if (!r.ok) { msg.textContent = r.error || 'Could not send. Please try again.'; go.disabled = false; return; }
          f.replaceChildren(el('div', 'est-lead-done', 'Thank you! Lee has your estimate and will email you. Pick a time now if you like:'));
          book.href = r.calendlyUrl || CALENDLY;
          f.appendChild(book);
        })
        .catch(function () { msg.textContent = 'Could not send. Check your connection.'; go.disabled = false; });
    });
    actions.after(f);
    name.input.focus();
  }

  function setBusy(b) {
    state.busy = b;
    sendBtn.disabled = b;
    input.disabled = b;
    starters.querySelectorAll('button').forEach(function (x) { x.disabled = b; });
  }

  function ensureSession() {
    if (state.sessionId) return Promise.resolve(true);
    if (state.starting) return state.starting;
    state.starting = new Promise(function (resolve) {
      human.hidden = false;
      human.replaceChildren(el('div', 'est-human-note', 'Quick check that you are human…'));
      loadTurnstile().then(function () {
        var box = el('div');
        human.appendChild(box);
        window.turnstile.render(box, {
          sitekey: state.config.siteKey,
          appearance: 'interaction-only',
          callback: function (token) {
            post('/api/estimate/start', { token: token, aiNotice: state.agreed }).then(function (r) {
              human.hidden = true;
              human.replaceChildren();
              if (r.sessionId) { state.sessionId = r.sessionId; resolve(true); }
              else { note(r.error || 'Could not start the chat.'); resolve(false); }
              state.starting = null;
            });
          },
          'error-callback': function () { note('The human check could not load. Please refresh, or book a call instead.'); state.starting = null; resolve(false); },
        });
      }).catch(function () { note('The human check could not load. Please book a call instead.'); state.starting = null; resolve(false); });
    });
    return state.starting;
  }

  var turnstilePromise;
  function loadTurnstile() {
    if (window.turnstile) return Promise.resolve();
    if (turnstilePromise) return turnstilePromise;
    turnstilePromise = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true;
      s.onload = function () { resolve(); };
      s.onerror = reject;
      document.head.appendChild(s);
    });
    return turnstilePromise;
  }

  function send(text) {
    text = (text || '').trim();
    if (!text || state.busy || !state.agreed) return;
    starters.hidden = true;
    bubble('me', text);
    input.value = '';
    setBusy(true);
    var thinking = bubble('ai est-typing', 'Thinking…');
    ensureSession().then(function (ok) {
      if (!ok) { thinking.remove(); setBusy(false); return; }
      return post('/api/estimate/message', { sessionId: state.sessionId, text: text }).then(function (r) {
        thinking.remove();
        if (r.redacted) note('For your privacy, contact details were removed from your message. Use the form under your estimate to send them to Lee.');
        if (r.reply) bubble('ai', r.reply);
        if (r.estimate && r.estimate.ok) { state.lastEstimate = r.estimate; estimateCard(r.estimate); }
        if (!r.reply && r.error) note(r.error);
        if (r.reason === 'no_session' || r.reason === 'expired') state.sessionId = null;
        if (r.reason === 'turns' || r.turnsLeft === 0) { input.disabled = true; sendBtn.disabled = true; note('Book a free call to keep going with Lee.'); return; }
        setBusy(false);
        input.focus();
      });
    }).catch(function () { thinking.remove(); note('Connection problem. Please try again.'); setBusy(false); });
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); send(input.value); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input.value); }
  });

  // ---------- Tap to talk (speech turned into text by the visitor's browser) ----------
  var Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) { mic.hidden = true; }
  else {
    var rec = new Recognition();
    rec.interimResults = true;
    rec.lang = navigator.language || 'en-US';
    rec.onresult = function (e) {
      var t = '';
      for (var i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      input.value = t.slice(0, 800);
    };
    rec.onend = function () { state.listening = false; mic.classList.remove('is-on'); mic.setAttribute('aria-pressed', 'false'); };
    rec.onerror = function () { note('Voice input is not available here. Please type instead.'); };
    mic.setAttribute('aria-pressed', 'false');
    mic.addEventListener('click', function () {
      if (state.listening) { rec.stop(); return; }
      try { rec.start(); state.listening = true; mic.classList.add('is-on'); mic.setAttribute('aria-pressed', 'true'); } catch (err) { /* already running */ }
    });
  }

  // ---------- Open / close ----------
  function showAgreed(on) {
    agree.hidden = on;
    starters.hidden = !on || log.querySelector('.est-me') !== null;
    form.hidden = !on;
  }
  agreeBtn.addEventListener('click', function () {
    state.agreed = true;
    showAgreed(true);
    input.focus();
  });

  function open() {
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    if (!log.childElementCount) bubble('ai', state.config.greeting);
    showAgreed(state.agreed);
    (state.agreed ? input : agreeBtn).focus();
  }
  function shut() {
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
  }
  launcher.addEventListener('click', function () { panel.hidden ? open() : shut(); });
  close.addEventListener('click', shut);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) shut(); });
  document.querySelectorAll('[data-estimate-open]').forEach(function (b) {
    b.addEventListener('click', function (e) { if (state.config) { e.preventDefault(); open(); } });
  });

  fetch('/api/estimate/config').then(function (r) { return r.ok ? r.json() : null; }).then(function (c) {
    if (c && c.enabled) {
      state.config = c;
      agreeText.textContent = c.notice || 'This chat is answered by an AI service. Please don\u2019t share personal details here.';
      launcher.hidden = false;
      document.documentElement.classList.add('has-estimator');
    }
  }).catch(function () { /* assistant stays hidden */ });
})();
