// The homepage contact form ("Not ready for a call? Leave a note."): POST /api/contact.
// Notes are saved with the estimate chat's enquiries, so Lee reads them on /admin/leads;
// nothing is emailed or sent anywhere else. Only our own page may send it, a hidden
// "website" field catches simple bots, and the store limits how many notes come in.
const MAX_BODY = 4000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
}
function clean(v, max) {
  return typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '').trim().slice(0, max) : '';
}
async function ipHashOf(request, env) {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${env.IP_SALT || 'agi'}|${ip}`));
  return [...new Uint8Array(digest)].slice(0, 16).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function handleContact(request, env) {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
  const url = new URL(request.url);
  if (request.headers.get('origin') !== url.origin) return json({ error: 'Not allowed.' }, 403);
  if (!(request.headers.get('content-type') || '').startsWith('application/json')) return json({ error: 'Send JSON.' }, 415);
  const text = await request.text();
  if (text.length > MAX_BODY) return json({ error: 'That note is too long.' }, 413);
  let body;
  try { body = JSON.parse(text); } catch { return json({ error: 'Bad request.' }, 400); }
  if (!body || typeof body !== 'object') return json({ error: 'Bad request.' }, 400);

  // Bots fill in every field, including the hidden one. Pretend it worked, keep nothing.
  if (clean(body.website, 200)) return json({ ok: true });

  const name = clean(body.name, 80);
  const email = clean(body.email, 120).toLowerCase();
  const note = clean(body.note, 1000);
  if (!name) return json({ error: 'Please enter your name.', field: 'name' }, 400);
  if (!EMAIL.test(email)) return json({ error: 'Please enter a valid email address.', field: 'email' }, 400);
  if (note.length < 10) return json({ error: 'Please tell us a little about what you want to build (at least 10 characters).', field: 'note' }, 400);

  const store = env.ESTIMATOR.get(env.ESTIMATOR.idFromName('main'));
  const out = await store.saveNote({ ipHash: await ipHashOf(request, env), name, email, note });
  if (!out.ok) {
    return json({ error: out.reason === 'ip_daily' ? 'Thanks, we already have your notes for today. Please book a call or email us instead.' : 'Sorry, we could not save your note just now. Please email us instead.' }, out.reason === 'ip_daily' ? 429 : 503);
  }
  return json({ ok: true });
}
