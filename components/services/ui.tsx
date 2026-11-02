import type { ReactNode } from 'react';

// Shared look for the six service tiles. Every tile lifts slightly on hover
// (not with reduced motion).
const TONES = {
  light: 'tw:bg-paper tw:border-ink/10 tw:text-body',
  dark: 'tw:bg-ink tw:border-white/10 tw:text-[#c9ccd1]',
  sand: 'tw:bg-sand tw:border-ink/10 tw:text-body',
};

export function Tile({ tone, label, title, className = '', children }: { tone: keyof typeof TONES; label: string; title: string; className?: string; children: ReactNode }) {
  const dark = tone === 'dark';
  return (
    <article
      className={`tw:flex tw:flex-col tw:rounded-[20px] tw:border tw:p-6 tw:transition tw:duration-300 tw:ease-out tw:hover:-translate-y-1 tw:hover:shadow-[0_24px_48px_-28px_rgba(11,14,19,0.45)] tw:motion-reduce:transition-none tw:motion-reduce:hover:translate-y-0 tw:sm:p-7 ${TONES[tone]} ${className}`}
    >
      <p className={`tw:m-0 tw:font-mono tw:text-[11px] tw:font-medium tw:tracking-[0.16em] ${dark ? 'tw:text-gold' : 'tw:text-gold-ink'}`}>{label}</p>
      <h3 className={`tw:mb-5 tw:mt-2 tw:text-[21px] tw:font-semibold tw:leading-tight tw:tracking-[-0.015em] ${dark ? 'tw:text-cream' : 'tw:text-ink'}`}>{title}</h3>
      {children}
    </article>
  );
}

// A real button with a 44px minimum touch target and a visible focus ring.
export const BTN =
  'tw:min-h-11 tw:cursor-pointer tw:rounded-xl tw:border tw:font-sans tw:font-semibold tw:transition-colors tw:duration-200 tw:focus-visible:outline-2 tw:focus-visible:outline-offset-2 tw:focus-visible:outline-gold-ink tw:disabled:cursor-not-allowed tw:disabled:opacity-45';

export function peso(n: number) {
  return '₱' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
