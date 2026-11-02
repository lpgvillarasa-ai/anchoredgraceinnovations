// Reads the site's original section markup (legacy/<page>/*.html) at build time.
// These sections were carried over unchanged from the hand-written pages; the
// scripts in public/js still drive them. New sections are React components.
import fs from 'node:fs';
import path from 'node:path';

export type Fragments = Record<string, string>;

export function readFragments(page: string): Fragments {
  const dir = path.join(process.cwd(), 'legacy', page);
  const out: Fragments = {};
  for (const file of fs.readdirSync(dir).sort()) {
    if (file.endsWith('.html')) out[file.slice(0, -5)] = fs.readFileSync(path.join(dir, file), 'utf8').trim();
  }
  return out;
}
