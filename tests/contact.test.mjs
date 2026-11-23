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

test('a mobile number is optional; texting consent is saved only as a real yes, with its wording', async () => {
  const { env, saved } = setup();
  // no number, no consent: as before
  assert.equal((await handleContact(post(good), env)).status, 200);
  assert.equal(saved[0].phone, '');
  assert.equal(saved[0].smsConsent, false);
  // a number and a ticked box, with the wording version
  const res = await handleContact(post({ ...good, phone: '+1 (555) 123-4567', smsConsent: true, smsConsentVersion: '2026-11-05' }), env);
  assert.equal(res.status, 200);
  assert.equal(saved[1].phone, '+15551234567');
  assert.equal(saved[1].smsConsent, true);
  assert.equal(saved[1].consentVersion, '2026-11-05');
  // a number without the box: kept, but no consent
  await handleContact(post({ ...good, phone: '0917 123 4567' }), env);
  assert.equal(saved[2].phone, '09171234567');
  assert.equal(saved[2].smsConsent, false);
  // anything but a real true is not consent
  await handleContact(post({ ...good, phone: '+15551234567', smsConsent: 'true', smsConsentVersion: '2026-11-05' }), env);
  assert.equal(saved[3].smsConsent, false);
  assert.equal(saved[3].consentVersion, '');
});

test('a bad number, a ticked box without a number, or unknown wording is refused', async () => {
  const { env, saved } = setup();
  for (const [body, field] of [
    [{ ...good, phone: '12ab' }, 'phone'],
    [{ ...good, phone: '+1 555 12' }, 'phone'],
    [{ ...good, smsConsent: true, smsConsentVersion: '2026-11-05' }, 'phone'],
  ]) {
    const res = await handleContact(post(body), env);
    assert.equal(res.status, 400);
    assert.equal((await res.json()).field, field);
  }
  const res = await handleContact(post({ ...good, phone: '+15551234567', smsConsent: true, smsConsentVersion: 'made-up' }), env);
  assert.equal(res.status, 400);
  assert.equal(saved.length, 0);
});
