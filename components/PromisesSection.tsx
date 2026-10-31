// "What you can count on": four promises, on a dark band.
const ICON = 'tw:size-7 tw:fill-none tw:stroke-gold tw:[stroke-linecap:round] tw:[stroke-linejoin:round] tw:[stroke-width:1.6]';

const PROMISES = [
  {
    title: 'A fixed quote first', text: 'You know the price and scope in writing before any work starts.',
    icon: <svg viewBox="0 0 24 24" className={ICON} aria-hidden="true"><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4" /><path d="M10 12h5M10 16h5" /></svg>,
  },
  {
    title: 'You own it', text: 'Your domain, your website, your data. Nothing is held hostage.',
    icon: <svg viewBox="0 0 24 24" className={ICON} aria-hidden="true"><circle cx="8" cy="15" r="4" /><path d="m11 12 8-8M16 7l2 2M14 9l2 2" /></svg>,
  },
  {
    title: 'A clear timeline', text: 'Dates for every step, and updates you can see as we build.',
    icon: <svg viewBox="0 0 24 24" className={ICON} aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /><path d="m9.5 14.5 2 2 3.5-3.5" /></svg>,
  },
  {
    title: 'English or Filipino', text: 'Calls in your language, scheduled in your time zone.',
    icon: <svg viewBox="0 0 24 24" className={ICON} aria-hidden="true"><path d="M4 5h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-4 3.5V15H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" /><path d="M17 9h3a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1v3l-3.5-3H13" /></svg>,
  },
];

export default function PromisesSection() {
  return (
    <section aria-labelledby="promises-title" className="tw:bg-deep tw:px-[var(--gutter)] tw:py-24 tw:sm:py-28" data-nav-dark="">
      <div className="tw:mx-auto tw:max-w-[1200px]">
        <div className="kicker gold">05 / OUR PROMISES</div>
        <h2 id="promises-title" className="h2 tw:text-cream">What you can count on.</h2>
        <ul className="tw:m-0 tw:mt-12 tw:grid tw:gap-4 tw:p-0 tw:[list-style:none] tw:sm:grid-cols-2 tw:lg:grid-cols-4 tw:lg:gap-5">
          {PROMISES.map((p) => (
            <li key={p.title} className="tw:rounded-[20px] tw:border tw:border-white/10 tw:bg-white/[0.03] tw:p-7">
              <span className="tw:flex tw:size-12 tw:items-center tw:justify-center tw:rounded-xl tw:border tw:border-gold/30 tw:bg-gold/[0.07]">{p.icon}</span>
              <h3 className="tw:mb-2 tw:mt-5 tw:text-[19px] tw:font-semibold tw:tracking-[-0.01em] tw:text-cream">{p.title}</h3>
              <p className="tw:m-0 tw:text-[15px] tw:leading-relaxed tw:text-[#b4b8bf]">{p.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
