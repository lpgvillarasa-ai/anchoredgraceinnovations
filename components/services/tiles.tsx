import { useEffect, useRef, useState } from 'react';
import { BTN, Tile, peso } from './ui';

// ---------- 1. Booking calendar ----------
const DAYS = ['Mon 3', 'Tue 4', 'Wed 5', 'Thu 6', 'Fri 7'];
const SLOTS = ['10:00 AM', '1:30 PM', '4:00 PM', '6:00 PM'];

export function BookingTile({ className }: { className?: string }) {
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const pick = (on: boolean) => (on ? 'tw:border-ink tw:bg-ink tw:text-cream' : 'tw:border-ink/15 tw:bg-white tw:text-ink tw:hover:border-ink/40');
  return (
    <Tile tone="light" label="BOOKING CALENDAR" title="Clients book themselves in." className={className}>
      <div className="tw:grid tw:grid-cols-5 tw:gap-1.5 tw:sm:gap-2" role="group" aria-label="Day">
        {DAYS.map((d) => {
          const [name, num] = d.split(' ');
          return (
            <button key={d} type="button" aria-pressed={day === d} onClick={() => setDay(d)} className={`${BTN} tw:flex tw:flex-col tw:items-center tw:py-2 ${pick(day === d)}`}>
              <span className="tw:text-[11px] tw:font-medium tw:opacity-70">{name}</span>
              <span className="tw:text-[17px] tw:leading-tight">{num}</span>
            </button>
          );
        })}
      </div>
      <div className="tw:mt-3 tw:grid tw:grid-cols-2 tw:gap-2 tw:sm:grid-cols-4" role="group" aria-label="Time">
        {SLOTS.map((s) => (
          <button key={s} type="button" aria-pressed={slot === s} onClick={() => setSlot(s)} className={`${BTN} tw:px-2 tw:text-[13.5px] ${pick(slot === s)}`}>
            {s}
          </button>
        ))}
      </div>
      <p aria-live="polite" className={`tw:mb-0 tw:mt-auto tw:flex tw:min-h-11 tw:items-center tw:gap-2 tw:pt-5 tw:text-[14px] ${day && slot ? 'tw:font-semibold tw:text-ink' : 'tw:text-[#5b5f66]'}`}>
        {day && slot ? (
          <>
            <span className="tw:flex tw:size-5 tw:items-center tw:justify-center tw:rounded-full tw:bg-gold" aria-hidden="true">
              <svg viewBox="0 0 12 12" className="tw:size-3 tw:fill-none tw:stroke-ink tw:[stroke-width:2]"><path d="M2.5 6.2 5 8.5l4.5-5" /></svg>
            </span>
            {`Booked: ${day}, ${slot}. Confirmation sent.`}
          </>
        ) : (
          'Pick a day and a time.'
        )}
      </p>
    </Tile>
  );
}

// ---------- 2. Point of sale ----------
const PRODUCTS = [
  { name: 'Iced latte', price: 140 },
  { name: 'Facial', price: 1200 },
  { name: 'Haircut', price: 350 },
];

export function PosTile({ className }: { className?: string }) {
  const [qty, setQty] = useState<Record<string, number>>({});
  const [note, setNote] = useState('');
  const lines = PRODUCTS.filter((p) => qty[p.name]);
  const total = lines.reduce((sum, p) => sum + p.price * qty[p.name], 0);
  const add = (name: string) => { setNote(''); setQty((q) => ({ ...q, [name]: (q[name] || 0) + 1 })); };
  const charge = () => { setNote(`Charged ${peso(total)}. Receipt printed.`); setQty({}); };
  return (
    <Tile tone="dark" label="POINT OF SALE" title="Ring up a sale." className={className}>
      <div className="tw:grid tw:gap-2">
        {PRODUCTS.map((p) => (
          <button key={p.name} type="button" onClick={() => add(p.name)} className={`${BTN} tw:flex tw:items-center tw:justify-between tw:border-white/12 tw:bg-white/[0.06] tw:px-4 tw:text-[14.5px] tw:text-cream tw:hover:bg-white/[0.11] tw:focus-visible:outline-gold`}>
            <span>{p.name}</span>
            <span className="tw:flex tw:items-center tw:gap-3 tw:font-mono tw:text-[13px] tw:text-gold">
              {peso(p.price)}
              <span className="tw:flex tw:size-6 tw:items-center tw:justify-center tw:rounded-full tw:bg-gold tw:text-[16px] tw:leading-none tw:text-ink" aria-hidden="true">+</span>
            </span>
          </button>
        ))}
      </div>
      <div className="tw:mt-4 tw:flex tw:flex-1 tw:flex-col tw:rounded-xl tw:bg-cream tw:p-4 tw:font-mono tw:text-[12.5px] tw:text-ink" aria-label="Receipt">
        <div className="tw:mb-2 tw:border-b tw:border-dashed tw:border-ink/25 tw:pb-2 tw:text-center tw:text-[11px] tw:tracking-[0.14em]">RECEIPT</div>
        {lines.length ? (
          <ul className="tw:m-0 tw:grid tw:gap-1 tw:p-0 tw:[list-style:none]">
            {lines.map((p) => (
              <li key={p.name} className="tw:flex tw:justify-between tw:gap-3">
                <span>{qty[p.name]} x {p.name}</span>
                <span>{peso(p.price * qty[p.name])}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="tw:my-1 tw:text-center tw:text-[#5b5f66]">{note || 'Receipt is empty. Add an item.'}</p>
        )}
        <div className="tw:mt-auto tw:flex tw:justify-between tw:border-t tw:border-dashed tw:border-ink/25 tw:pt-2 tw:font-semibold">
          <span>TOTAL</span>
          <span aria-live="polite">{peso(total)}</span>
        </div>
      </div>
      <button type="button" onClick={charge} disabled={!lines.length} className={`${BTN} tw:mt-3 tw:border-gold tw:bg-gold tw:text-[14.5px] tw:text-ink tw:hover:bg-[#e6d5b2] tw:focus-visible:outline-gold`}>
        Charge and print
      </button>
    </Tile>
  );
}

// ---------- 3. AI front desk (canned answers only: no AI is called here) ----------
const QA: [string, string][] = [
  ['Are you open Sunday?', 'Yes. We are open Sundays from 10:00 AM to 4:00 PM. Would you like to book a time?'],
  ['How much is a facial?', 'Prices depend on the treatment, and I can send you our full menu. Would you like me to book you in for this week?'],
  ['Is there parking?', 'Yes, there is free parking for clients right in front of the clinic.'],
];

export function FrontDeskTile({ className }: { className?: string }) {
  const [asked, setAsked] = useState<number | null>(null);
  return (
    <Tile tone="light" label="AI FRONT DESK" title="Answers while you work." className={className}>
      <div className="tw:flex tw:flex-1 tw:flex-col tw:gap-2 tw:text-[14px]" aria-live="polite">
        <p className="tw:m-0 tw:max-w-[88%] tw:rounded-2xl tw:rounded-tl-md tw:bg-white tw:px-3.5 tw:py-2.5 tw:text-ink tw:shadow-[0_1px_2px_rgba(11,14,19,0.08)]">
          Hi! I am the front desk assistant for Luma Clinic. What can I help you with?
        </p>
        {asked !== null && (
          <>
            <p className="tw:m-0 tw:max-w-[80%] tw:self-end tw:rounded-2xl tw:rounded-tr-md tw:bg-ink tw:px-3.5 tw:py-2.5 tw:text-cream">{QA[asked][0]}</p>
            <p className="tw:m-0 tw:max-w-[88%] tw:rounded-2xl tw:rounded-tl-md tw:bg-white tw:px-3.5 tw:py-2.5 tw:text-ink tw:shadow-[0_1px_2px_rgba(11,14,19,0.08)]">{QA[asked][1]}</p>
          </>
        )}
      </div>
      <div className="tw:mt-4 tw:flex tw:flex-wrap tw:gap-2">
        {QA.map(([q], i) => (
          <button key={q} type="button" aria-pressed={asked === i} onClick={() => setAsked(i)} className={`${BTN} tw:rounded-full tw:px-3.5 tw:text-[13px] ${asked === i ? 'tw:border-ink tw:bg-ink tw:text-cream' : 'tw:border-ink/15 tw:bg-white tw:text-ink tw:hover:border-ink/40'}`}>
            {q}
          </button>
        ))}
      </div>
      <p className="tw:mb-0 tw:mt-3 tw:text-[12px] tw:text-[#5b5f66]">Example answers for this demo.</p>
    </Tile>
  );
}

// ---------- 4. Dashboard (sample data) ----------
const DATA = {
  week: { label: 'Bookings per day', bars: [['Mon', 12], ['Tue', 18], ['Wed', 15], ['Thu', 22], ['Fri', 28], ['Sat', 34], ['Sun', 19]] as [string, number][] },
  month: { label: 'Bookings per week', bars: [['Wk 1', 86], ['Wk 2', 104], ['Wk 3', 97], ['Wk 4', 128]] as [string, number][] },
};

export function DashboardTile({ className }: { className?: string }) {
  const [range, setRange] = useState<'week' | 'month'>('week');
  const [grown, setGrown] = useState(true);
  const chart = useRef<HTMLDivElement>(null);
  // Bars grow in the first time the chart comes into view (not with reduced motion).
  useEffect(() => {
    const el = chart.current;
    if (!el || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0) return;
    setGrown(false);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setGrown(true); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const { bars, label } = DATA[range];
  const max = Math.max(...bars.map((b) => b[1]));
  return (
    <Tile tone="light" label="DASHBOARD" title="Your numbers at a glance." className={className}>
      <div className="tw:flex tw:items-center tw:justify-between tw:gap-3">
        <div className="tw:flex tw:rounded-xl tw:bg-ink/[0.06] tw:p-1" role="group" aria-label="Range">
          {(['week', 'month'] as const).map((k) => (
            <button key={k} type="button" aria-pressed={range === k} onClick={() => setRange(k)} className={`${BTN} tw:rounded-lg tw:border-0 tw:px-3 tw:text-[13px] ${range === k ? 'tw:bg-white tw:text-ink tw:shadow-[0_1px_3px_rgba(11,14,19,0.15)]' : 'tw:bg-transparent tw:text-[#5b5f66]'}`}>
              {k === 'week' ? 'This week' : 'This month'}
            </button>
          ))}
        </div>
        <span className="tw:rounded-full tw:border tw:border-ink/15 tw:px-2.5 tw:py-1 tw:font-mono tw:text-[10.5px] tw:text-[#5b5f66]">Sample data</span>
      </div>
      <div ref={chart} className="tw:mt-5 tw:flex tw:h-36 tw:items-end tw:gap-2" role="img" aria-label={`${label}, sample data: ${bars.map(([d, v]) => `${d} ${v}`).join(', ')}`}>
        {bars.map(([d, v]) => (
          <div key={d} className="tw:flex tw:h-full tw:flex-1 tw:flex-col tw:items-center tw:justify-end tw:gap-1.5">
            <span className="tw:font-mono tw:text-[10.5px] tw:text-[#5b5f66]">{v}</span>
            <div
              className={`tw:w-full tw:origin-bottom tw:rounded-t-md tw:transition-[height,transform] tw:duration-500 tw:ease-out tw:motion-reduce:transition-none ${v === max ? 'tw:bg-ink' : 'tw:bg-gold'}`}
              style={{ height: `${(v / max) * 100}%`, transform: grown ? 'scaleY(1)' : 'scaleY(0)' }}
            />
            <span className="tw:text-[11px] tw:text-[#5b5f66]">{d}</span>
          </div>
        ))}
      </div>
      <p className="tw:mb-0 tw:mt-3 tw:text-[12.5px] tw:text-[#5b5f66]">{label}</p>
    </Tile>
  );
}

// ---------- 5. Staffing ----------
const DAY: [string, string][] = [
  ['9:00', 'Inbox sorted, urgent items flagged'],
  ['10:30', 'Invoices entered and matched'],
  ['3:30', 'Weekly report drafted with AI'],
];

export function StaffingTile({ className }: { className?: string }) {
  return (
    <Tile tone="sand" label="STAFFING" title="An assistant's day." className={className}>
      <ol className="tw:m-0 tw:grid tw:gap-0 tw:p-0 tw:[list-style:none]">
        {DAY.map(([t, what], i) => (
          <li key={t} className="tw:relative tw:flex tw:gap-4 tw:pb-4 tw:last:pb-0">
            {i < DAY.length - 1 && <span className="tw:absolute tw:bottom-0 tw:left-[5px] tw:top-4 tw:w-px tw:bg-ink/20" aria-hidden="true" />}
            <span className="tw:mt-1.5 tw:size-[11px] tw:shrink-0 tw:rounded-full tw:border-2 tw:border-ink tw:bg-sand" aria-hidden="true" />
            <span>
              <span className="tw:block tw:font-mono tw:text-[12px] tw:text-gold-ink">{t}</span>
              <span className="tw:text-[14.5px] tw:text-ink">{what}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="tw:mt-auto tw:pt-6">
        <p className="tw:m-0 tw:text-[20px] tw:font-semibold tw:tracking-[-0.01em] tw:text-ink">From $1,499 / month</p>
        <p className="tw:m-0 tw:text-[13.5px] tw:text-[#5b5f66]">In the Philippines, the price is confirmed on a call</p>
        <a href="/staffing" className="tw:mt-3 tw:inline-flex tw:min-h-11 tw:items-center tw:gap-1.5 tw:font-semibold tw:text-ink tw:underline tw:decoration-gold-ink tw:underline-offset-4 tw:hover:decoration-2">
          See staffing <span aria-hidden="true">→</span>
        </a>
      </div>
    </Tile>
  );
}

// ---------- 6. Marketing video (a real clip from our Seikomods samples) ----------
export function VideoTile({ className }: { className?: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const play = () => { const v = video.current; if (!v) return; v.controls = true; v.play().catch(() => {}); };
  return (
    <Tile tone="dark" label="MARKETING VIDEO" title="One photo in. A scroll-stopping ad out." className={className}>
      <div className="tw:grid tw:grid-cols-[1fr_auto_1fr] tw:items-center tw:gap-3">
        <figure className="tw:m-0">
          <div className="tw:flex tw:h-56 tw:flex-col tw:items-center tw:sm:h-64 tw:justify-center tw:gap-2 tw:rounded-xl tw:border tw:border-dashed tw:border-white/20 tw:bg-white/[0.04] tw:text-center tw:text-[#a9adb4]">
            <svg viewBox="0 0 24 24" className="tw:size-7 tw:fill-none tw:stroke-gold tw:[stroke-width:1.6]" aria-hidden="true"><rect x="3" y="6" width="18" height="14" rx="2.5" /><circle cx="12" cy="13" r="3.5" /><path d="M8.5 6 10 3.8h4L15.5 6" /></svg>
            <span className="tw:px-2 tw:text-[12px]">Your product photo</span>
          </div>
          <figcaption className="tw:mt-2 tw:text-center tw:font-mono tw:text-[11px] tw:text-[#a9adb4]">1. Product photo</figcaption>
        </figure>
        <span className="tw:text-[20px] tw:text-gold" aria-hidden="true">→</span>
        <figure className="tw:m-0">
          <div className="tw:relative tw:h-56 tw:overflow-hidden tw:sm:h-64 tw:rounded-xl tw:bg-deep">
            <video
              ref={video}
              className="tw:size-full tw:object-cover"
              src="/reels/v1/reveal.mp4"
              poster="/reels/v1/reveal.jpg"
              preload="none"
              playsInline
              loop
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              aria-label="Finished product video for Seikomods, a watch brand"
            />
            {!playing && (
              <button type="button" onClick={play} aria-label="Play the finished video" className={`${BTN} tw:absolute tw:inset-0 tw:m-auto tw:flex tw:size-14 tw:items-center tw:justify-center tw:rounded-full tw:border-0 tw:bg-cream/90 tw:text-ink tw:hover:bg-cream tw:focus-visible:outline-gold`}>
                <svg viewBox="0 0 24 24" className="tw:ml-0.5 tw:size-6 tw:fill-current" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" /></svg>
              </button>
            )}
          </div>
          <figcaption className="tw:mt-2 tw:text-center tw:font-mono tw:text-[11px] tw:text-[#a9adb4]">2. Finished clip</figcaption>
        </figure>
      </div>
      <a href="https://calendly.com/lpg-villarasa/30min" target="_blank" rel="noopener" className="tw:mt-5 tw:inline-flex tw:min-h-11 tw:items-center tw:gap-1.5 tw:self-start tw:font-semibold tw:text-gold tw:underline tw:decoration-gold/50 tw:underline-offset-4 tw:hover:decoration-gold">
        Ask about video <span aria-hidden="true">→</span>
      </a>
    </Tile>
  );
}
