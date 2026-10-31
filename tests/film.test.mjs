// The film route may only serve picture and list files from the film/ folder of our storage.
import test from 'node:test';
import assert from 'node:assert/strict';
import { serveFilm } from '../worker/film.mjs';

function fakeBucket(keys) {
  const asked = [];
  return {
    asked,
    get: async (key) => {
      asked.push(key);
      return keys.includes(key) ? { body: 'bytes', httpEtag: '"e1"' } : null;
    },
  };
}
const get = (path, env, init) => serveFilm(new Request('https://anchoredgraceinnovation.com' + path, init), env, { 'X-Content-Type-Options': 'nosniff' });

test('film pictures are served with a long cache and the right type', async () => {
  const env = { MEDIA: fakeBucket(['film/v1/wide/0001.webp', 'film/manifest.json']) };
  const pic = await get('/film/v1/wide/0001.webp', env);
  assert.equal(pic.status, 200);
  assert.equal(pic.headers.get('content-type'), 'image/webp');
  assert.match(pic.headers.get('cache-control'), /immutable/);
  assert.equal(pic.headers.get('x-content-type-options'), 'nosniff');
  const list = await get('/film/manifest.json', env);
  assert.equal(list.status, 200);
  assert.match(list.headers.get('cache-control'), /must-revalidate/);
  const again = await get('/film/v1/wide/0001.webp', env, { headers: { 'if-none-match': '"e1"' } });
  assert.equal(again.status, 304);
});

test('nothing outside film/, and no other file types, can be read', async () => {
  const env = { MEDIA: fakeBucket(['agibnb/index.html']) };
  for (const p of ['/film/../agibnb/index.html', '/film/%2e%2e/agibnb/index.html', '/film//agibnb/index.html', '/film/x.html', '/film/x.js', '/film/v1/', '/film/a b.webp']) {
    const res = await get(p, env);
    assert.equal(res.status, 404, p);
  }
  assert.ok(env.MEDIA.asked.every((k) => k.startsWith('film/')), JSON.stringify(env.MEDIA.asked));
  assert.ok(!env.MEDIA.asked.some((k) => k.includes('agibnb')));
});

test('only GET and HEAD, and a missing storage link is a plain 404', async () => {
  assert.equal((await get('/film/manifest.json', { MEDIA: fakeBucket([]) }, { method: 'POST' })).status, 405);
  assert.equal((await get('/film/manifest.json', {})).status, 404);
});
