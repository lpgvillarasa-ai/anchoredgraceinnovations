import { useRef, useState, type KeyboardEvent } from 'react';

// "Try it live": three working demos. The laptop shows a real screenshot of the
// one picked; the button opens it in a new tab (no iframes, to keep the page light).
// The assistant's button is the site's existing estimate chat (data-estimate-open);
// like the site's other estimate buttons it only shows while the chat is switched on.
const DEMOS = [
  { id: 'pos', tab: 'Point of sale', line: 'Ring up a sale, print a receipt', img: '/media/demos/pos.webp', alt: 'The point of sale demo: a cashier ringing up an order', cta: 'Open the POS demo', href: 'https://posdemo.anchoredgraceinnovation.com/' },
  { id: 'booking', tab: 'Booking app', line: 'Pick dates and reserve a room', img: '/media/demos/booking.webp', alt: 'The AGIbnb booking demo homepage with a date and guest search', cta: 'Open the booking demo', href: 'https://agibnb.anchoredgraceinnovation.com/' },
  { id: 'assistant', tab: 'AI estimate assistant', line: 'Get a price estimate in a minute', img: '/media/demos/estimate.webp', alt: 'The estimate assistant chat open on this website', cta: 'Chat with the assistant', href: null },
] as const;

const GOLD_BTN = 'btn btn-gold btn-lg tw:inline-flex tw:items-center tw:justify-center tw:gap-2';

export default function DemosSection() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const select = (i: number) => {
    const next = (i + DEMOS.length) % DEMOS.length;
    setActive(next);
    tabs.current[next]?.focus();
  };
  const onKey = (e: KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowDown: active + 1, ArrowRight: active + 1, ArrowUp: active - 1, ArrowLeft: active - 1, Home: 0, End: DEMOS.length - 1 };
    if (e.key in keys) { e.preventDefault(); select(keys[e.key]); }
  };

  return (
    <section id="demos" className="section tw:pt-0">
      <div className="container">
        <div data-nav-dark="" className="tw:relative tw:overflow-hidden tw:rounded-[28px] tw:bg-ink tw:px-6 tw:py-10 tw:text-[#c9ccd1] tw:sm:px-10 tw:sm:py-14 tw:lg:px-14">
          <div className="tw:pointer-events-none tw:absolute tw:-right-40 tw:-top-40 tw:size-[520px] tw:rounded-full tw:bg-[radial-gradient(closest-side,rgba(216,195,155,0.18),transparent)]" aria-hidden="true" />
          <div className="tw:relative tw:grid tw:items-center tw:gap-10 tw:lg:grid-cols-[0.9fr_1.1fr] tw:lg:gap-14">
            <div>
              <div className="kicker gold">02 / TRY IT LIVE</div>
              <h2 className="h2 tw:text-cream">Real apps. Open them, use them, break them.</h2>
              <p className="tw:mb-8 tw:mt-4 tw:max-w-[440px] tw:text-[17px] tw:leading-relaxed">These are working demos of systems we build for clients. No sign-up, no sales pitch.</p>
              <div role="tablist" aria-label="Demos" aria-orientation="vertical" onKeyDown={onKey} className="tw:grid tw:gap-2.5">
                {DEMOS.map((d, i) => (
                  <button
                    key={d.id}
                    ref={(el) => { tabs.current[i] = el; }}
                    type="button"
                    role="tab"
                    id={`demo-tab-${d.id}`}
                    aria-selected={i === active}
                    aria-controls="demo-panel"
                    tabIndex={i === active ? 0 : -1}
                    onClick={() => select(i)}
                    className={`tw:flex tw:min-h-11 tw:w-full tw:cursor-pointer tw:items-center tw:gap-4 tw:rounded-2xl tw:border tw:px-5 tw:py-4 tw:text-left tw:font-sans tw:transition-colors tw:duration-200 tw:focus-visible:outline-2 tw:focus-visible:outline-offset-2 tw:focus-visible:outline-gold ${
                      i === active ? 'tw:border-gold/60 tw:bg-white/[0.08]' : 'tw:border-white/10 tw:bg-transparent tw:hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className={`tw:font-mono tw:text-[12px] ${i === active ? 'tw:text-gold' : 'tw:text-[#8b9098]'}`}>0{i + 1}</span>
                    <span>
                      <span className="tw:block tw:text-[16px] tw:font-semibold tw:text-cream">{d.tab}</span>
                      <span className="tw:block tw:text-[14px] tw:text-[#a9adb4]">{d.line}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div id="demo-panel" role="tabpanel" aria-labelledby={`demo-tab-${DEMOS[active].id}`}>
              <div className="tw:mx-auto tw:max-w-[640px]">
                <div className="tw:rounded-t-[18px] tw:border tw:border-white/10 tw:bg-[#1b1f26] tw:p-2.5 tw:pb-3 tw:shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] tw:sm:p-3.5">
                  <div className="tw:mb-2 tw:flex tw:justify-center" aria-hidden="true"><span className="tw:size-1.5 tw:rounded-full tw:bg-white/20" /></div>
                  <div className="tw:relative tw:aspect-[16/10] tw:overflow-hidden tw:rounded-md tw:bg-deep">
                    {DEMOS.map((d, i) => (
                      <img
                        key={d.id}
                        src={d.img}
                        alt={i === active ? d.alt : ''}
                        aria-hidden={i !== active}
                        width={1280}
                        height={800}
                        loading="lazy"
                        decoding="async"
                        className={`tw:absolute tw:inset-0 tw:size-full tw:object-cover tw:object-top tw:transition-opacity tw:duration-300 tw:motion-reduce:transition-none ${i === active ? 'tw:opacity-100' : 'tw:opacity-0'}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="tw:relative tw:-mx-[6%] tw:h-4 tw:rounded-b-[14px] tw:bg-gradient-to-b tw:from-[#2a2f37] tw:to-[#14171c] tw:shadow-[0_18px_30px_-16px_rgba(0,0,0,0.9)]" aria-hidden="true">
                  <span className="tw:absolute tw:left-1/2 tw:top-0 tw:h-1.5 tw:w-24 tw:-translate-x-1/2 tw:rounded-b-md tw:bg-[#0f1216]" />
                </div>
              </div>
              <div className="tw:mt-8 tw:flex tw:justify-center">
                {DEMOS.map((d, i) => (
                  <div key={d.id} hidden={i !== active}>
                    {d.href ? (
                      <a href={d.href} target="_blank" rel="noopener" className={GOLD_BTN}>
                        {d.cta} <span className="btn-arrow" aria-hidden="true">→</span>
                      </a>
                    ) : (
                      <button type="button" data-estimate-open="" className={`${GOLD_BTN} est-only tw:cursor-pointer tw:border-0 tw:font-sans`}>
                        {d.cta} <span className="btn-arrow" aria-hidden="true">→</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
