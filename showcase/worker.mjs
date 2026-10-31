// Showcase front door (Cloudflare Worker "agi-showcase").
// Serves our concept and demo sites on our own subdomains, so visitors only ever
// see anchoredgraceinnovation.com, never the hosting company's address.
// To add a site: add a line here, then attach the subdomain to this Worker
// (Cloudflare: Workers > agi-showcase > Settings > Domains > Add custom domain).

// Sites stored in our own R2 bucket (binding MEDIA), served as single-page apps.
const R2_SITES = {
  'agibnb.anchoredgraceinnovation.com': { prefix: 'agibnb/' },
};

const SITES = {
  'gr86.anchoredgraceinnovation.com': 'toyotagr86.vercel.app',
  'redbull.anchoredgraceinnovation.com': 'redbull-ashen.vercel.app',
  'residences.anchoredgraceinnovation.com': 'agi-residences.netlify.app',
  'posdemo.anchoredgraceinnovation.com': 'agi-demo-pos.netlify.app',
};

// Text responses that may contain the hosting address get it swapped for ours.
const REWRITE_TYPES = /^(text\/|application\/(javascript|json|xml|manifest\+json)|image\/svg\+xml)/;
const MAX_REWRITE_BYTES = 5 * 1024 * 1024;

const SECURITY = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// Serves a built single-page app from R2: real files first, index.html for app routes.
async function serveR2(request, env, site, url) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });
  let path = decodeURIComponent(url.pathname);
  if (path.endsWith('/')) path += 'index.html';
  const isFile = /\.[a-z0-9]{2,8}$/i.test(path);
  let key = site.prefix + path.replace(/^\/+/, '');
  if (!isFile) key = site.prefix + 'index.html';

  const range = request.headers.get('range');
  let obj = await env.MEDIA.get(key, range ? { range: request.headers } : undefined);
  if (!obj && isFile) return new Response('Not found', { status: 404, headers: SECURITY });
  if (!obj) return new Response('Not found', { status: 404, headers: SECURITY });

  const headers = new Headers(SECURITY);
  obj.writeHttpMetadata(headers);
  headers.set('etag', obj.httpEtag);
  headers.set('accept-ranges', 'bytes');
  if (path.startsWith('/assets/')) headers.set('cache-control', 'public, max-age=31536000, immutable');
  else if (/\.(webmanifest)$|\/sw\.js$/.test(path) || !isFile) headers.set('cache-control', 'public, max-age=0, must-revalidate');
  else headers.set('cache-control', 'public, max-age=86400');
  if (path.startsWith('/admin')) headers.set('x-robots-tag', 'noindex');

  if (range && obj.range) {
    const { offset = 0, length = obj.size - offset } = obj.range;
    headers.set('content-range', `bytes ${offset}-${offset + length - 1}/${obj.size}`);
    headers.set('content-length', String(length));
    return new Response(request.method === 'HEAD' ? null : obj.body, { status: 206, headers });
  }
  headers.set('content-length', String(obj.size));
  return new Response(request.method === 'HEAD' ? null : obj.body, { headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const r2 = R2_SITES[url.hostname];
    if (r2) return serveR2(request, env, r2, url);
    const origin = SITES[url.hostname];
    if (!origin) return new Response('Not found', { status: 404 });

    const upstream = new URL(url.pathname + url.search, `https://${origin}`);
    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.set('x-forwarded-host', url.hostname);
    const res = await fetch(upstream, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'manual',
    });

    const out = new Headers(res.headers);
    const loc = out.get('location');
    if (loc) out.set('location', loc.split(`https://${origin}`).join(`https://${url.hostname}`));
    for (const h of ['x-vercel-id', 'x-vercel-cache', 'x-nf-request-id', 'server', 'x-robots-tag']) out.delete(h);
    out.set('x-served-by', 'Anchored Grace Innovations');

    const type = out.get('content-type') || '';
    const size = Number(out.get('content-length') || 0);
    if (request.method === 'GET' && REWRITE_TYPES.test(type) && size <= MAX_REWRITE_BYTES) {
      const text = await res.text();
      const swapped = text.split(`https://${origin}`).join(`https://${url.hostname}`).split(`//${origin}`).join(`//${url.hostname}`);
      out.delete('content-length');
      out.delete('content-encoding');
      return new Response(swapped, { status: res.status, headers: out });
    }
    return new Response(res.body, { status: res.status, headers: out });
  },
};
