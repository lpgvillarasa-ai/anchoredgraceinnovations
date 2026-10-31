// Serves the site's large media from our own storage (Cloudflare R2, bucket
// agi-website-media): the homepage film's pictures (folder film/) and the
// marketing video samples (folder reels/). Only those folders, only picture,
// video and list files. Folders are versioned (film/v1/..., reels/v1/...), so
// files can be cached for a year; the film list (manifest.json) is always
// checked fresh. Videos support partial requests, which phones need to play them.
const TYPES = { webp: 'image/webp', jpg: 'image/jpeg', json: 'application/json; charset=utf-8', mp4: 'video/mp4' };
const PATH_OK = /^\/(film|reels)\/[A-Za-z0-9_\-/]+\.[a-z0-9]+$/;

export function isMediaPath(path) {
  return path.startsWith('/film/') || path.startsWith('/reels/');
}

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
  if (!env.MEDIA || !PATH_OK.test(path) || path.includes('//')) return notFound();
  const type = TYPES[path.split('.').pop()];
  if (!type) return notFound();

  const range = request.headers.get('range');
  const obj = await env.MEDIA.get(path.slice(1), range ? { range: request.headers } : undefined);
  if (!obj) return notFound();
  headers.set('Content-Type', type);
  headers.set('ETag', obj.httpEtag);
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Cache-Control', path === '/film/manifest.json' ? 'public, max-age=0, must-revalidate' : 'public, max-age=31536000, immutable');
  if (!range && request.headers.get('if-none-match') === obj.httpEtag) return new Response(null, { status: 304, headers });

  if (range && obj.range) {
    const r = obj.range;
    const offset = r.suffix != null ? obj.size - r.suffix : r.offset || 0;
    const length = r.suffix != null ? r.suffix : r.length ?? obj.size - offset;
    headers.set('Content-Range', `bytes ${offset}-${offset + length - 1}/${obj.size}`);
    headers.set('Content-Length', String(length));
    return new Response(request.method === 'HEAD' ? null : obj.body, { status: 206, headers });
  }
  if (obj.size != null) headers.set('Content-Length', String(obj.size));
  return new Response(request.method === 'HEAD' ? null : obj.body, { headers });
}
