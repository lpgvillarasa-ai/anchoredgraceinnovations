// Packs the whole site into one Cloudflare Worker script (no separate asset
// upload). Used when `npx wrangler deploy` cannot upload assets, e.g. from a
// sandbox whose proxy rewrites the upload pass. Run from the repo root:
//   node tools/bundle-worker.mjs > /path/to/worker.js
// Rules from _headers are applied by the bundled script, same as Cloudflare would.
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ignore = fs.readFileSync(path.join(root, '.assetsignore'), 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
};

const files = {};
(function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = path.relative(root, full);
    if (ignore.includes(name) || ignore.includes(rel) || name === '_headers' || name.startsWith('.')) continue;
    if (fs.statSync(full).isDirectory()) { walk(full); continue; }
    const type = TYPES[path.extname(name).toLowerCase()];
    if (!type) continue;
    files['/' + rel.split(path.sep).join('/')] = { type, b64: fs.readFileSync(full).toString('base64') };
  }
})(root);

// _headers: blocks of "path pattern" followed by indented "Name: value" lines.
const rules = [];
for (const line of fs.readFileSync(path.join(root, '_headers'), 'utf8').split('\n')) {
  if (!line.trim()) continue;
  if (!/^\s/.test(line)) rules.push({ pattern: line.trim(), headers: [] });
  else { const i = line.indexOf(':'); rules.at(-1).headers.push([line.slice(0, i).trim(), line.slice(i + 1).trim()]); }
}

process.stdout.write(`const FILES = ${JSON.stringify(files)};
const RULES = ${JSON.stringify(rules)};
const BIN = {};
function bytes(p) { return BIN[p] ||= Uint8Array.from(atob(FILES[p].b64), (c) => c.charCodeAt(0)); }
function matches(pattern, p) { return pattern.endsWith('*') ? p.startsWith(pattern.slice(0, -1)) : p === pattern; }
export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname.startsWith('www.')) {
      url.hostname = url.hostname.slice(4);
      return Response.redirect(url.toString(), 301);
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
    let p = decodeURIComponent(url.pathname);
    if (p.endsWith('/')) p += 'index.html';
    if (!FILES[p] && FILES[p + '.html']) p += '.html';
    const file = FILES[p];
    const headers = new Headers();
    for (const r of RULES) if (matches(r.pattern, p) || (r.pattern === '/*')) for (const [k, v] of r.headers) headers.set(k, v);
    if (!file) { headers.set('Content-Type', 'text/plain; charset=utf-8'); return new Response('Page not found', { status: 404, headers }); }
    headers.set('Content-Type', file.type);
    if (!headers.has('Cache-Control')) headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    return new Response(request.method === 'HEAD' ? null : bytes(p), { headers });
  },
};
`);
