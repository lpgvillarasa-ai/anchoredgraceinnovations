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

test('marketing videos are served from reels/, including partial requests for phones', async () => {
  const bytes = 'x'.repeat(1000);
  const bucket = {
    get: async (key, opts) => {
      if (key !== 'reels/v1/reveal.mp4') return null;
      if (opts && opts.range) return { body: bytes.slice(0, 100), httpEtag: '"v1"', size: 1000, range: { offset: 0, length: 100 } };
      return { body: bytes, httpEtag: '"v1"', size: 1000 };
    },
  };
  const env = { MEDIA: bucket };
  const full = await get('/reels/v1/reveal.mp4', env);
  assert.equal(full.status, 200);
  assert.equal(full.headers.get('content-type'), 'video/mp4');
  assert.equal(full.headers.get('accept-ranges'), 'bytes');
  const part = await get('/reels/v1/reveal.mp4', env, { headers: { range: 'bytes=0-99' } });
  assert.equal(part.status, 206);
  assert.equal(part.headers.get('content-range'), 'bytes 0-99/1000');
  assert.equal(part.headers.get('content-length'), '100');
  for (const p of ['/reels/../film/manifest.json', '/reels/v1/x.html', '/videos/v1/reveal.mp4']) {
    assert.equal((await get(p, env)).status, 404, p);
  }
});
