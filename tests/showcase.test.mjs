// The showcase front door must only ever call the approved site for each subdomain.
import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../showcase/worker.mjs';

function withFakeFetch(run) {
  const calls = [];
  const real = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), headers: init.headers });
    return new Response('ok', { headers: { 'content-type': 'text/plain' } });
  };
  return run(calls).finally(() => { globalThis.fetch = real; });
}

test('a path starting with // cannot redirect the proxy to another site', () => withFakeFetch(async (calls) => {
  for (const path of ['//attacker.example/collect', '///attacker.example/x', '/\\attacker.example/x', '/%2F%2Fattacker.example/x']) {
    await worker.fetch(new Request(`https://gr86.anchoredgraceinnovation.com${path}`, { headers: { cookie: 'a=1' } }), {});
  }
  assert.equal(calls.length, 4);
  for (const c of calls) assert.equal(new URL(c.url).host, 'toyotagr86.vercel.app', c.url);
}));

test('ordinary paths and query strings still reach the approved site', () => withFakeFetch(async (calls) => {
  await worker.fetch(new Request('https://redbull.anchoredgraceinnovation.com/events/2026?x=1'), {});
  assert.equal(calls[0].url, 'https://redbull-ashen.vercel.app/events/2026?x=1');
}));

test('unknown subdomains are refused without calling anything', () => withFakeFetch(async (calls) => {
  const res = await worker.fetch(new Request('https://nope.anchoredgraceinnovation.com/'), {});
  assert.equal(res.status, 404);
  assert.equal(calls.length, 0);
}));
