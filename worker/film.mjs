// Serves the homepage film's pictures from our own storage (Cloudflare R2,
// bucket agi-website-media, folder film/). Only picture and list files, only
// from that folder. Picture folders are versioned (film/v1/...), so pictures can
// be cached for a year; the list (manifest.json) is always checked fresh.
const TYPES = { webp: 'image/webp', jpg: 'image/jpeg', json: 'application/json; charset=utf-8' };

export async function serveFilm(request, env, baseHeaders) {
  const headers = new Headers(baseHeaders);
  const notFound = () => {
    headers.set('Content-Type', 'text/plain; charset=utf-8');
    headers.set('Cache-Control', 'no-store');
    return new Response('Not found', { status: 404, headers });
  };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    headers.set('Allow', 'GET, HEAD');
    return new Response('Method not allowed', { status: 405, headers });
  }
  const path = new URL(request.url).pathname;
  if (!env.MEDIA || !/^\/film\/[A-Za-z0-9_\-/]+\.[a-z0-9]+$/.test(path) || path.includes('//')) return notFound();
  const type = TYPES[path.split('.').pop()];
  if (!type) return notFound();
  const obj = await env.MEDIA.get(path.slice(1));
  if (!obj) return notFound();
  headers.set('Content-Type', type);
  headers.set('ETag', obj.httpEtag);
  headers.set('Cache-Control', path === '/film/manifest.json' ? 'public, max-age=0, must-revalidate' : 'public, max-age=31536000, immutable');
  if (request.headers.get('if-none-match') === obj.httpEtag) return new Response(null, { status: 304, headers });
  return new Response(request.method === 'HEAD' ? null : obj.body, { headers });
}
