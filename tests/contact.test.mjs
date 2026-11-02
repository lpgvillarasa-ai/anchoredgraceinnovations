import test from 'node:test';
import assert from 'node:assert/strict';
import { handleContact } from '../worker/contact.mjs';

const ORIGIN = 'https://anchoredgraceinnovation.com';
function setup(result = { ok: true }) {
  const saved = [];
  const store = { saveNote: async (n) => { saved.push(n); return result; } };
  const env = { IP_SALT: 'test', ESTIMATOR: { idFromName: () => 'id', get: () => store } };
  return { env, saved };
}
function post(body, headers = {}) {
  return new Request(`${ORIGIN}/api/contact`, {
    method: 'POST',
    headers: { origin: ORIGIN, 'content-type': 'application/json', 'cf-connecting-ip': '1.2.3.4', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}
const good = { name: 'Ana Cruz', email: 'Ana@Example.com', note: 'A booking website for my salon in Cebu.', website: '' };

test('a valid note is saved, with a fingerprint instead of the IP address', async () => {
  const { env, saved } = setup();
  const res = await handleContact(post(good), env);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal(saved.length, 1);
  assert.equal(saved[0].email, 'ana@example.com');
  assert.equal(saved[0].name, 'Ana Cruz');
  assert.match(saved[0].ipHash, /^[0-9a-f]{32}$/);
  assert.ok(!JSON.stringify(saved[0]).includes('1.2.3.4'));
});

test('the hidden field catches bots: looks fine to them, nothing is saved', async () => {
  const { env, saved } = setup();
  const res = await handleContact(post({ ...good, website: 'http://spam.example' }), env);
  assert.equal(res.status, 200);
  assert.equal(saved.length, 0);
});

test('missing name, bad email or a too-short note are refused with the field to fix', async () => {
  const { env, saved } = setup();
  for (const [body, field] of [[{ ...good, name: '  ' }, 'name'], [{ ...good, email: 'ana@' }, 'email'], [{ ...good, note: 'hi' }, 'note']]) {
    const res = await handleContact(post(body), env);
    assert.equal(res.status, 400);
    assert.equal((await res.json()).field, field);
  }
  assert.equal(saved.length, 0);
});

test('only our own page may send notes, as JSON, by POST', async () => {
  const { env, saved } = setup();
  assert.equal((await handleContact(post(good, { origin: 'https://evil.example' }), env)).status, 403);
  assert.equal((await handleContact(post(good, { 'content-type': 'text/plain' }), env)).status, 415);
  assert.equal((await handleContact(new Request(`${ORIGIN}/api/contact`), env)).status, 405);
  assert.equal((await handleContact(post('x'.repeat(5000)), env)).status, 413);
  assert.equal(saved.length, 0);
});

test('the daily limit is explained in plain words', async () => {
  const { env } = setup({ ok: false, reason: 'ip_daily' });
  const res = await handleContact(post(good), env);
  assert.equal(res.status, 429);
  assert.match((await res.json()).error, /already have your notes/);
});
