import type { ReactNode } from 'react';
import Legacy from './Legacy';
import type { Fragments } from '@/lib/legacy';

// Header and footer for the newer pages (case studies, privacy). Links point back
// to the homepage sections; js/main.js drives the menu as on every other page.
export default function SubpageShell({ f, children }: { f: Fragments; children: ReactNode }) {
  return (
    <>
      <Legacy html={f.sprite} />
      <Legacy html={f['header-sub']} />
      <main>{children}</main>
      <Legacy html={f.footer} />
    </>
  );
}
