// The estimate assistant's server side: /api/estimate/* and the leads page.
// Every message passes the same gates before any AI call: same-site request,
// a valid chat started behind Cloudflare's human check, size limits, per-visitor
// and site-wide daily limits. Prices come only from pricebook.mjs.
import Anthropic from '@anthropic-ai/sdk';
import { estimate, PRICE_BOOK_VERSION } from './pricebook.mjs';
import { SYSTEM_PROMPT, ESTIMATE_TOOL, GREETING } from './prompt.mjs';

// Shown in the chat before the first message; the server refuses to start a chat until it is accepted.
export const AI_NOTICE = 'This chat is answered by an AI service (Anthropic). Please don\u2019t share names, emails, phone numbers or other personal details here. Use the form under your estimate to reach Lee.';

const DEFAULT_MODEL = 'claude-opus-5-5';
const CALENDLY = 'https://calendly.com/lpg-villarasa/30min';
const MAX_BODY = 4096;
const FALLBACK_MODELS = /^claude-(opus-5-5|opus-5|fable-5-1|sonnet-5-5)$/;

export function limitsFrom(env) {
  const n = (v, d) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : d);
  return {
    sessionsPerDay: n(env.ESTIMATOR_SESSIONS_PER_DAY, 150),
    sessionsPerIpPerDay: n(env.ESTIMATOR_SESSIONS_PER_IP_PER_DAY, 3),
    turnsPerSession: n(env.ESTIMATOR_TURNS_PER_SESSION, 12),
    messagesPerIpPerMinute: n(env.ESTIMATOR_MESSAGES_PER_IP_PER_MINUTE, 6),
    messagesPerDay: n(env.ESTIMATOR_MESSAGES_PER_DAY, 1500),
    maxChars: n(env.ESTIMATOR_MAX_CHARS, 800),
  };
}

const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra },
});

const SORRY = {
  ip_daily: 'You have reached today\'s limit for the estimate assistant. Please book a free call and Lee will help you directly.',
  busy: 'The estimate assistant is very busy today. Please book a free call and Lee will give you a price directly.',
  turns: 'This chat has reached its length limit. Leave your email below or book a free call to continue with Lee.',
  slow_down: 'Please wait a moment before sending another message.',
  no_session: 'This chat has ended. Please start a new one.',
  expired: 'This chat timed out. Please start a new one.',
  one_at_a_time: 'Please wait for the answer to your last message.',
  ai_down: 'Sorry, the assistant could not answer just now. Please try again in a minute, or book a free call.',
};

export function enabled(env) {
  return Boolean(env.ANTHROPIC_API_KEY && env.TURNSTILE_SECRET && env.TURNSTILE_SITE_KEY && env.ESTIMATE_ASSISTANT !== 'off');
}

async function ipHashOf(request, env) {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const data = new TextEncoder().encode(`${env.IP_SALT || 'agi'}|${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].slice(0, 16).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function readJson(request) {
  const url = new URL(request.url);
  const origin = request.headers.get('origin');
  if (!origin || origin !== url.origin) throw json({ error: 'Not allowed.' }, 403);
  if (!(request.headers.get('content-type') || '').startsWith('application/json')) throw json({ error: 'Send JSON.' }, 415);
  const text = await request.text();
  if (text.length > MAX_BODY) throw json({ error: 'Too long.' }, 413);
  try { return JSON.parse(text); } catch { throw json({ error: 'Bad request.' }, 400); }
}

export async function verifyTurnstile(token, request, env) {
  if (typeof token !== 'string' || token.length < 10 || token.length > 4096) return false;
  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET);
  form.append('response', token);
  const ip = request.headers.get('cf-connecting-ip');
  if (ip) form.append('remoteip', ip);
  // TURNSTILE_VERIFY_URL is only set in local tests; production uses Cloudflare's address.
  const res = await fetch(env.TURNSTILE_VERIFY_URL || 'https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
  const out = await res.json().catch(() => ({}));
  return out.success === true;
}

// Personal details never reach the AI provider: emails and phone numbers are
// removed on the server before a message is stored or sent. Contact details
// belong in the enquiry form, which never goes to the AI.
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
// Phone or card numbers: 10+ digits written in one run or in small groups
// ("0917 123 4567", "+1 (555) 123-4567"). Prices like "150000 - 300000" or "₱150,000" are left alone.
const GROUPED_RE = /(?<![\d,])\+?\(?\d{1,4}\)?(?:[\s.-]\(?\d{2,4}\)?){2,5}(?![\d,])/g;
const RUN_RE = /(?<![\d,])\+?\d{10,19}(?![\d,])/g;
const digitCount = (s) => (s.match(/\d/g) || []).length;
export function redactPersonal(text) {
  const out = text
    .replace(EMAIL_RE, '[email removed]')
    .replace(GROUPED_RE, (m) => (digitCount(m) >= 10 ? '[number removed]' : m))
    .replace(RUN_RE, '[number removed]');
  return { text: out, changed: out !== text };
}

// Every amount of money in a reply must come from the price book tool's results
// in this chat (or the public "from $1,199" staffing price). Anything else is
// never shown to the visitor.
const MONEY_RE = /(?:₱|PHP\s?|USD\s?|\$|P(?=\d))\s?(\d[\d,]*(?:\.\d+)?)\s?(k|K)?|(\d[\d,]*(?:\.\d+)?)\s?(k|K)?\s?(?:pesos?|php|usd|dollars?)\b/gi;
function amounts(text) {
  const found = [];
  for (const m of String(text).matchAll(MONEY_RE)) {
    const raw = m[1] || m[3];
    let n = Number(raw.replace(/,/g, ''));
    if (m[2] || m[4]) n *= 1000;
    if (Number.isFinite(n)) found.push(Math.round(n));
  }
  return found;
}
export function allowedAmounts(messages) {
  const allowed = new Set([1199]);
  for (const m of messages) {
    if (m.role !== 'user' || !Array.isArray(m.content)) continue;
    for (const b of m.content) {
      if (b.type === 'tool_result' && !b.is_error && typeof b.content === 'string') {
        for (const n of b.content.match(/\d[\d,]*/g) || []) allowed.add(Number(n.replace(/,/g, '')));
      }
    }
  }
  return allowed;
}
export function priceSafe(reply, messages) {
  const allowed = allowedAmounts(messages);
  return amounts(reply).every((n) => allowed.has(n));
}

export function makeClient(env) {
  // ANTHROPIC_BASE_URL is only set in local tests (a stand-in AI); never in production.
  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, baseURL: env.ANTHROPIC_BASE_URL || undefined, maxRetries: 1, timeout: 45_000 });
}

function textOf(content) {
  return content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
}

// One visitor message: up to a few AI calls when it uses the estimate tool.
export async function runTurn(client, env, history) {
  const model = env.ESTIMATOR_MODEL || DEFAULT_MODEL;
  const added = [];
  let lastEstimate = null;
  let summary = null;
  for (let i = 0; i < 4; i++) {
    const params = {
      model,
      max_tokens: 4000,
      system: [{ type: 'text', text: SYSTEM_PROMPT }],
      tools: [ESTIMATE_TOOL],
      messages: [...history, ...added],
      output_config: { effort: 'low' },
      cache_control: { type: 'ephemeral' },
    };
    if (FALLBACK_MODELS.test(model)) {
      params.betas = ['server-side-fallback-2026-07-01'];
      params.fallbacks = 'default';
    }
    const response = await client.beta.messages.create(params);
    if (response.stop_reason === 'refusal') return { refused: true };
    added.push({ role: 'assistant', content: response.content });

    if (response.stop_reason === 'pause_turn') continue;
    if (response.stop_reason !== 'tool_use') {
      let reply = textOf(response.content);
      if (!priceSafe(reply, [...history, ...added])) {
        reply = lastEstimate
          ? 'Your estimate is in the card below, straight from our price book. Lee confirms the final price on a free discovery call.'
          : 'I can only quote prices from our price book. Tell me a little more about what you need and I will work out an estimate.';
      }
      return { reply, added, estimate: lastEstimate, summary };
    }
    const results = [];
    for (const block of response.content) {
      if (block.type !== 'tool_use') continue;
      if (block.name !== 'prepare_estimate') {
        results.push({ type: 'tool_result', tool_use_id: block.id, content: 'Unknown tool.', is_error: true });
        continue;
      }
      const input = block.input || {};
      const priced = estimate({ client_region: input.client_region, items: input.items });
      if (priced.ok) { lastEstimate = priced; summary = String(input.project_summary || '').slice(0, 300); }
      results.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(priced), is_error: !priced.ok });
    }
    added.push({ role: 'user', content: results });
  }
  return { reply: 'Here is what I have so far. Please book a free call and Lee will confirm the details.', added, estimate: lastEstimate, summary };
}

function cleanText(v, max) {
  return typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '').trim().slice(0, max) : '';
}

function calendlyUrl(name, email, summary, est) {
  const u = new URL(CALENDLY);
  if (name) u.searchParams.set('name', name);
  if (email) u.searchParams.set('email', email);
  const parts = [summary, est && est.one_time ? `One-time: ${est.one_time}` : '', est && est.monthly ? `Monthly: ${est.monthly}` : ''].filter(Boolean);
  if (parts.length) u.searchParams.set('a1', `From the website estimate: ${parts.join(' | ')}`.slice(0, 480));
  return u.href;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function safeEqual(a, b) {
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] || 0) ^ (y[i] || 0);
  return diff === 0;
}

async function leadsPage(request, env, store) {
  const auth = request.headers.get('authorization') || '';
  const given = auth.startsWith('Basic ') ? atob(auth.slice(6)).split(':').slice(1).join(':') : '';
  if (!env.ADMIN_PASSWORD || !safeEqual(given, env.ADMIN_PASSWORD)) {
    return new Response('Sign in to see enquiries.', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="AGI enquiries"', 'Cache-Control': 'no-store' } });
  }
  const rows = await store.listLeads();
  const body = rows.map((r) => {
    let est = '';
    try { const e = JSON.parse(r.estimate || 'null'); if (e) est = [e.one_time && `One-time ${e.one_time}`, e.monthly && `Monthly ${e.monthly}`].filter(Boolean).join('<br>'); } catch {}
    return `<tr><td>${escapeHtml(new Date(r.created).toISOString().slice(0, 16).replace('T', ' '))}</td><td>${escapeHtml(r.name)}</td><td><a href="mailto:${escapeHtml(r.email)}">${escapeHtml(r.email)}</a></td><td>${escapeHtml(r.business)}</td><td>${escapeHtml(r.summary)}</td><td>${est}</td><td>${escapeHtml(r.note)}</td></tr>`;
  }).join('');
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Website enquiries</title>
<style>body{font:15px/1.5 system-ui,sans-serif;margin:24px;color:#0B0E13;background:#F4F1EB}table{border-collapse:collapse;width:100%;background:#fff}th,td{border:1px solid #ddd;padding:8px;vertical-align:top;text-align:left}th{background:#ECE8E0}.wrap{overflow-x:auto}</style>
<h1>Website enquiries</h1><p>${rows.length} newest first. Price book: ${escapeHtml(PRICE_BOOK_VERSION)}.</p>
<div class="wrap"><table><tr><th>When (UTC)</th><th>Name</th><th>Email</th><th>Business</th><th>Project</th><th>Estimate</th><th>Note</th></tr>${body || '<tr><td colspan="7">No enquiries yet.</td></tr>'}</table></div>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'" } });
}

// deps lets the tests swap in a fake AI and a fake human check.
export async function handleEstimator(request, env, deps = {}) {
  const url = new URL(request.url);
  const store = env.ESTIMATOR.get(env.ESTIMATOR.idFromName('main'));
  const client = deps.client || (enabled(env) ? makeClient(env) : null);
  const checkHuman = deps.verifyTurnstile || verifyTurnstile;

  if (url.pathname === '/admin/leads' && request.method === 'GET') return leadsPage(request, env, store);

  if (url.pathname === '/api/estimate/config' && request.method === 'GET') {
    return json(enabled(env) ? { enabled: true, siteKey: env.TURNSTILE_SITE_KEY, greeting: GREETING, notice: AI_NOTICE } : { enabled: false });
  }
  if (request.method !== 'POST') return json({ error: 'Not found.' }, 404);
  if (!enabled(env)) return json({ error: 'The estimate assistant is not switched on.' }, 503);

  let body;
  try { body = await readJson(request); } catch (r) { if (r instanceof Response) return r; throw r; }
  const limits = limitsFrom(env);
  const ipHash = await ipHashOf(request, env);

  if (url.pathname === '/api/estimate/start') {
    // The visitor must accept the AI notice before a chat can start.
    if (body.aiNotice !== true) return json({ error: 'Please read the note about AI and tap OK first.', reason: 'notice' }, 400);
    if (!(await checkHuman(body.token, request, env))) return json({ error: 'Please complete the quick human check and try again.' }, 403);
    const out = await store.startSession({ ipHash, limits });
    if (!out.ok) return json({ error: SORRY[out.reason] || SORRY.busy, reason: out.reason }, 429);
    return json({ sessionId: out.sessionId, greeting: GREETING, turnsLeft: limits.turnsPerSession });
  }

  if (url.pathname === '/api/estimate/message') {
    const sessionId = cleanText(body.sessionId, 64);
    const text = cleanText(body.text, limits.maxChars + 1);
    if (!sessionId || !text) return json({ error: 'Type a message first.' }, 400);
    if (text.length > limits.maxChars) return json({ error: `Please keep messages under ${limits.maxChars} characters.` }, 400);
    const clean = redactPersonal(text);
    const turn = await store.beginTurn({ sessionId, ipHash, text: clean.text, limits });
    if (!turn.ok) return json({ error: SORRY[turn.reason] || SORRY.busy, reason: turn.reason }, ['slow_down', 'one_at_a_time'].includes(turn.reason) ? 429 : 409);
    let result;
    try {
      result = await runTurn(client, env, turn.history);
    } catch (err) {
      await store.undoTurn(sessionId, turn.seq);
      const status = err instanceof Anthropic.APIError ? err.status : 'network';
      console.log(`estimator: AI call failed (${status})`); // status only, never the visitor's text
      return json({ error: SORRY.ai_down, reason: 'ai_down' }, 503);
    }
    if (result.refused) {
      await store.undoTurn(sessionId, turn.seq);
      return json({ reply: 'I can only help with Anchored Grace services and estimates. What would you like to build?', turnsLeft: turn.turnsLeft + 1 });
    }
    await store.finishTurn(sessionId, turn.seq, result.added);
    if (result.estimate) await store.setEstimate(sessionId, result.estimate, result.summary);
    return json({ reply: result.reply, estimate: result.estimate, turnsLeft: turn.turnsLeft, redacted: clean.changed });
  }

  if (url.pathname === '/api/estimate/lead') {
    const sessionId = cleanText(body.sessionId, 64);
    const name = cleanText(body.name, 80);
    const email = cleanText(body.email, 120).toLowerCase();
    const business = cleanText(body.business, 120);
    const note = cleanText(body.note, 500);
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json({ error: 'Please enter your name and a valid email.' }, 400);
    if (body.consent !== true) return json({ error: 'Please tick the box so we may contact you.' }, 400);
    const out = await store.saveLead({ sessionId, ipHash, name, email, business, note });
    if (!out.ok) return json({ error: SORRY[out.reason] || SORRY.busy }, out.reason === 'ip_daily' ? 429 : 409);
    return json({ ok: true, calendlyUrl: calendlyUrl(name, email, out.summary, out.estimate) });
  }

  return json({ error: 'Not found.' }, 404);
}
