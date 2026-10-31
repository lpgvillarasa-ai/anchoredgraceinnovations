// Showcase front door (Cloudflare Worker "agi-showcase").
// Serves our concept and demo sites on our own subdomains, so visitors only ever
// see anchoredgraceinnovation.com, never the hosting company's address.
// To add a site: add a line here, then attach the subdomain to this Worker
// (Cloudflare: Workers > agi-showcase > Settings > Domains > Add custom domain).

const SITES = {
  'gr86.anchoredgraceinnovation.com': 'toyotagr86.vercel.app',
  'redbull.anchoredgraceinnovation.com': 'redbull-ashen.vercel.app',
  'residences.anchoredgraceinnovation.com': 'agi-residences.netlify.app',
  'posdemo.anchoredgraceinnovation.com': 'agi-demo-pos.netlify.app',
};

// Text responses that may contain the hosting address get it swapped for ours.
const REWRITE_TYPES = /^(text\/|application\/(javascript|json|xml|manifest\+json)|image\/svg\+xml)/;
const MAX_REWRITE_BYTES = 5 * 1024 * 1024;

export default {
  async fetch(request) {
    const url = new URL(request.url);
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
