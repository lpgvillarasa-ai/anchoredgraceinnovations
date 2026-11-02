// A thin strip under the hero naming the tools we build with (plain text, no logos).
// On phones the names glide slowly sideways; with reduced motion they sit still and wrap.
// Tablets show the label above one centred row; wide screens put both on one line.
const TOOLS = ['Next.js', 'Supabase', 'Vercel', 'Tailwind', 'Claude AI', 'Stripe'];

function Names({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul
      aria-hidden={hidden || undefined}
      className="tw:m-0 tw:flex tw:shrink-0 tw:items-center tw:gap-10 tw:p-0 tw:pr-10 tw:[list-style:none] tw:md:flex-wrap tw:md:justify-center tw:md:gap-x-10 tw:md:gap-y-2 tw:md:pr-0 tw:xl:gap-x-12"
    >
      {TOOLS.map((t) => (
        <li key={t} className="tw:whitespace-nowrap tw:text-[17px] tw:font-semibold tw:tracking-[-0.01em] tw:text-[#6b6f76] tw:md:text-[18px]">{t}</li>
      ))}
    </ul>
  );
}

export default function BuiltWith() {
  return (
    <section aria-label="Tools we build with" className="tw:border-y tw:border-ink/10 tw:bg-paper tw:py-6">
      <div className="container tw:flex tw:flex-col tw:items-center tw:gap-4 tw:xl:flex-row tw:xl:justify-between tw:xl:gap-10">
        <p className="tw:m-0 tw:shrink-0 tw:text-center tw:font-mono tw:text-[11px] tw:font-medium tw:tracking-[0.16em] tw:text-gold-ink">
          BUILT WITH THE SAME TOOLS AS TOP TECH COMPANIES
        </p>
        <div className="tw:w-full tw:overflow-hidden tw:[mask-image:linear-gradient(90deg,transparent,#000_24px,#000_calc(100%-24px),transparent)] tw:md:w-auto tw:md:overflow-visible tw:md:[mask-image:none]">
          <div className="tw:flex tw:w-max tw:animate-[agiMarquee_28s_linear_infinite] tw:md:w-auto tw:md:animate-none tw:motion-reduce:w-auto tw:motion-reduce:animate-none tw:motion-reduce:flex-wrap tw:motion-reduce:justify-center">
            <Names />
            <div className="tw:md:hidden tw:motion-reduce:hidden"><Names hidden /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
