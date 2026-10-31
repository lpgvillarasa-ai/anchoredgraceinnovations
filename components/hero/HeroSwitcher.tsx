import { useRef, useState, type KeyboardEvent } from 'react';
import { INDUSTRIES, type Industry } from './industries';

// The hero's "pick your business" card: five tabs, each showing a mini website in a
// browser window plus a phone, for an example business of that kind.
export default function HeroSwitcher() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (i: number) => {
    const next = (i + INDUSTRIES.length) % INDUSTRIES.length;
    setActive(next);
    tabs.current[next]?.focus();
  };
  const onKey = (e: KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: INDUSTRIES.length - 1 };
    if (e.key in keys) { e.preventDefault(); select(keys[e.key]); }
  };

  return (
    <div className="hero-visual">
      <div className="hero-glow" aria-hidden="true" />
      <div
        role="tablist"
        aria-label="Pick your business"
        onKeyDown={onKey}
        className="tw:relative tw:mx-auto tw:mb-6 tw:flex tw:w-max tw:max-w-full tw:gap-1 tw:overflow-x-auto tw:rounded-full tw:border tw:border-ink/10 tw:bg-white/75 tw:p-1 tw:shadow-[0_10px_30px_-18px_rgba(11,14,19,0.35)] tw:backdrop-blur-md tw:[scrollbar-width:none]"
      >
        {INDUSTRIES.map((ind, i) => (
          <button
            key={ind.id}
            ref={(el) => { tabs.current[i] = el; }}
            type="button"
            role="tab"
            id={`hero-tab-${ind.id}`}
            aria-selected={i === active}
            aria-controls={`hero-panel-${ind.id}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => select(i)}
            className={`tw:min-h-11 tw:min-w-11 tw:shrink-0 tw:cursor-pointer tw:rounded-full tw:border-0 tw:px-2 tw:font-sans tw:text-[12.5px] tw:font-semibold tw:transition-colors tw:duration-200 tw:sm:px-4 tw:sm:text-[13.5px] tw:focus-visible:outline-2 tw:focus-visible:outline-offset-2 tw:focus-visible:outline-gold-ink ${
              i === active ? 'tw:bg-ink tw:text-cream' : 'tw:bg-transparent tw:text-body tw:hover:bg-ink/5'
            }`}
          >
            {ind.tab}
          </button>
        ))}
      </div>

      <div className="float-wrap">
        <div className="tw:grid">
          {INDUSTRIES.map((ind, i) => (
            <Panel key={ind.id} ind={ind} shown={i === active} />
          ))}
        </div>
        <div className="float-badge" aria-hidden="true">
          <span className="badge-dot" />
          <span>AI-native</span>
        </div>
        <div className="float-card" aria-hidden="true">
          <div className="float-card-icon">✓</div>
          <div>
            <div className="float-card-title">Mobile first</div>
            <div className="float-card-sub">Phone, tablet, desktop</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({ ind, shown }: { ind: Industry; shown: boolean }) {
  return (
    <div
      role="tabpanel"
      id={`hero-panel-${ind.id}`}
      aria-labelledby={`hero-tab-${ind.id}`}
      aria-hidden={!shown}
      inert={!shown}
      className={`tw:relative tw:[grid-area:1/1] tw:transition-opacity tw:duration-200 tw:ease-out tw:motion-reduce:transition-none ${shown ? 'tw:opacity-100' : 'tw:pointer-events-none tw:opacity-0'}`}
    >
      <div className="tw:rounded-2xl tw:border tw:border-white/[0.07] tw:bg-ink tw:p-2.5 tw:shadow-[0_40px_90px_-34px_rgba(11,14,19,0.6),0_4px_12px_rgba(11,14,19,0.18)] tw:sm:p-3">
        <div className="tw:flex tw:items-center tw:gap-1.5 tw:px-1.5 tw:pb-2.5 tw:pt-1">
          <span className="tw:size-2.5 tw:rounded-full tw:bg-[#3a3f48]" />
          <span className="tw:size-2.5 tw:rounded-full tw:bg-[#3a3f48]" />
          <span className="tw:size-2.5 tw:rounded-full tw:bg-[#3a3f48]" />
          <span className="tw:ml-2 tw:flex tw:min-w-0 tw:flex-1 tw:items-center tw:gap-1.5 tw:truncate tw:rounded-md tw:bg-white/[0.06] tw:px-2.5 tw:py-1 tw:font-mono tw:text-[10.5px] tw:text-[#a9adb4] tw:sm:text-[11px]">
            <svg viewBox="0 0 16 16" aria-hidden="true" className="tw:size-3 tw:shrink-0 tw:fill-none tw:stroke-current tw:[stroke-width:1.6]"><rect x="3.5" y="7" width="9" height="6.5" rx="1.5" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" /></svg>
            <span className="tw:truncate">{ind.domain} <span className="tw:text-[#9ba0a8]">(example)</span></span>
          </span>
        </div>
        <div className="tw:overflow-hidden tw:rounded-lg tw:bg-paper tw:px-5 tw:pb-36 tw:pt-4 tw:sm:px-7 tw:sm:pb-7 tw:sm:pr-48">
          <div className="tw:flex tw:items-center tw:justify-between tw:pb-5">
            <span className="tw:font-mono tw:text-[11px] tw:font-medium tw:tracking-[0.18em]" style={{ color: ind.color }}>{ind.brand}</span>
            <span className="tw:flex tw:gap-1" aria-hidden="true">
              <span className="tw:h-1 tw:w-5 tw:rounded-full tw:bg-ink/15" /><span className="tw:h-1 tw:w-5 tw:rounded-full tw:bg-ink/15" />
            </span>
          </div>
          <div className="tw:text-[25px] tw:font-semibold tw:leading-[1.08] tw:tracking-[-0.02em] tw:text-ink tw:sm:text-[28px]">{ind.headline}</div>
          <span className="tw:mt-4 tw:inline-block tw:rounded-lg tw:px-4 tw:py-2.5 tw:text-[13px] tw:font-semibold tw:text-white" style={{ background: ind.color }}>
            {ind.cta}
          </span>
          <ul className="tw:mt-5 tw:grid tw:gap-2 tw:p-0 tw:[list-style:none]">
            {ind.features.map((f, i) => (
              <li key={f} className="tw:flex tw:items-center tw:gap-2.5 tw:text-[13px] tw:text-body">
                <span
                  className={`tw:flex tw:size-4 tw:shrink-0 tw:items-center tw:justify-center tw:rounded-full ${i === ind.features.length - 1 ? 'tw:bg-gold' : 'tw:bg-ink'}`}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 12 12" className={`tw:size-2.5 tw:fill-none tw:[stroke-width:2] ${i === ind.features.length - 1 ? 'tw:stroke-ink' : 'tw:stroke-gold'}`}><path d="M2.5 6.2 5 8.5l4.5-5" /></svg>
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="tw:absolute tw:-bottom-9 tw:right-2 tw:w-[136px] tw:rounded-[22px] tw:border tw:border-white/10 tw:bg-ink tw:p-1.5 tw:shadow-[0_30px_60px_-24px_rgba(11,14,19,0.55)] tw:sm:-right-4 tw:sm:w-[172px]">
        <div className="tw:overflow-hidden tw:rounded-[17px] tw:bg-paper">
          <div className="tw:px-3 tw:pb-2 tw:pt-3" style={{ background: ind.color }}>
            <div className="tw:mx-auto tw:mb-2 tw:h-1 tw:w-8 tw:rounded-full tw:bg-white/30" aria-hidden="true" />
            <div className="tw:text-[11px] tw:font-semibold tw:leading-tight tw:text-white tw:sm:text-[12px]">{ind.phoneTitle}</div>
          </div>
          <ul className="tw:m-0 tw:grid tw:gap-1.5 tw:p-2 tw:[list-style:none]">
            {ind.phoneRows.map(([label, value]) => (
              <li key={label} className="tw:flex tw:items-center tw:justify-between tw:gap-1 tw:rounded-md tw:bg-white tw:px-2 tw:py-1.5 tw:text-[10px] tw:shadow-[0_1px_2px_rgba(11,14,19,0.08)] tw:sm:text-[10.5px]">
                <span className="tw:min-w-0 tw:truncate tw:font-medium tw:text-ink">{label}</span>
                <span className="tw:shrink-0 tw:font-mono tw:text-[9.5px] tw:text-gold-ink">{value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
