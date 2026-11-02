import { useEffect, useRef, useState } from 'react';

// "Websites people remember": our three scroll-film concept sites. Each card plays
// a few seconds of its film (muted, looping) on hover with a mouse, or when its
// preview button is tapped. The clips load only when the section is near the screen.
const CONCEPTS = [
  {
    href: 'https://gr86.anchoredgraceinnovation.com', label: 'GR86 concept site, opens in a new tab',
    img: '/media/work/concept-gr86.jpg', alt: 'GR86 concept site: a red sports car under studio light', clip: '/media/previews/gr86.mp4',
    kind: 'Scroll film · 324 frames', title: 'GR86 Track bRED', text: 'One continuous camera move around a sports car, controlled by your scroll.', note: 'Unofficial concept · not affiliated with Toyota',
  },
  {
    href: 'https://redbull.anchoredgraceinnovation.com', label: 'Red Bull scroll film concept, opens in a new tab',
    img: '/media/work/concept-redbull.jpg', alt: 'Energy drink can on a wet surface, concept site', clip: '/media/previews/redbull.mp4',
    kind: 'Scroll film · product launch', title: 'Gives You Wiiings', text: 'A product launch told as a short film, made from AI-generated takes.', note: 'Unofficial concept · not affiliated with Red Bull',
  },
  {
    href: 'https://residences.anchoredgraceinnovation.com', label: 'AGI Residences concept site, opens in a new tab',
    img: '/media/work/concept-residences.jpg', alt: 'Clifftop villa with an infinity pool at sunset, AGI Residences', clip: '/media/previews/residences.mp4',
    kind: 'Scroll film · luxury real estate', title: 'AGI Residences', text: 'A five-chapter film that ends at a vault door, for a private residence club.', note: 'Our own concept brand',
  },
];

type Concept = (typeof CONCEPTS)[number];

function Card({ c, near, canHover }: { c: Concept; near: boolean; canHover: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const start = () => { video.current?.play().catch(() => {}); };
  const stop = () => {
    const v = video.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
  };
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  return (
    <article
      className="concept-card"
      onMouseEnter={() => { if (canHover && !reduced()) start(); }}
      onMouseLeave={() => { if (canHover) stop(); }}
    >
      <img src={c.img} alt={c.alt} width={960} height={600} loading="lazy" decoding="async" />
      <video
        ref={video}
        src={near ? c.clip : undefined}
        poster={c.img}
        muted
        loop
        playsInline
        preload={near ? (canHover ? 'auto' : 'metadata') : 'none'}
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className={`tw:absolute tw:inset-0 tw:z-[-2] tw:size-full tw:object-cover tw:transition-opacity tw:duration-300 tw:motion-reduce:transition-none ${playing ? 'tw:opacity-100' : 'tw:opacity-0'}`}
      />
      <div className="concept-body">
        <div className="concept-kind">{c.kind}</div>
        <h3>{c.title}</h3>
        <p>{c.text}</p>
        <span className="concept-note">{c.note}</span>
      </div>
      <a
        href={c.href}
        target="_blank"
        rel="noopener"
        aria-label={c.label}
        className="tw:absolute tw:inset-0 tw:z-[1] tw:rounded-[18px] tw:focus-visible:outline-3 tw:focus-visible:-outline-offset-3 tw:focus-visible:outline-gold"
      />
      <button
        type="button"
        aria-pressed={playing}
        onClick={() => (playing ? stop() : start())}
        className="tw:absolute tw:left-4 tw:top-4 tw:z-[2] tw:inline-flex tw:min-h-11 tw:cursor-pointer tw:items-center tw:gap-2 tw:rounded-full tw:border tw:border-white/15 tw:bg-ink/65 tw:px-3.5 tw:font-sans tw:text-[12px] tw:font-semibold tw:text-cream tw:backdrop-blur-md tw:transition-colors tw:hover:bg-ink/85 tw:focus-visible:outline-2 tw:focus-visible:outline-offset-2 tw:focus-visible:outline-gold"
      >
        <span className="tw:flex tw:size-5 tw:items-center tw:justify-center tw:rounded-full tw:bg-gold tw:text-ink" aria-hidden="true">
          {playing ? (
            <svg viewBox="0 0 12 12" className="tw:size-2.5 tw:fill-current"><rect x="2.5" y="2" width="2.5" height="8" rx=".6" /><rect x="7" y="2" width="2.5" height="8" rx=".6" /></svg>
          ) : (
            <svg viewBox="0 0 12 12" className="tw:ml-px tw:size-2.5 tw:fill-current"><path d="M3 1.8v8.4L10 6z" /></svg>
          )}
        </span>
        {playing ? 'Playing preview' : canHover ? 'Hover to preview' : 'Tap to preview'}
        <span className="tw:sr-only"> of the {c.title} film</span>
      </button>
    </article>
  );
}

export default function ConceptCards() {
  const section = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);
  const [canHover, setCanHover] = useState(false);
  useEffect(() => {
    setCanHover(matchMedia('(hover: hover) and (pointer: fine)').matches);
    const el = section.current;
    if (!el || !('IntersectionObserver' in window)) { setNear(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: '400px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section id="concepts" className="section-bottom" ref={section}>
      <div className="container">
        <div className="section-head split">
          <div>
            <div className="kicker">03 / SIGNATURE CONCEPTS</div>
            <h2 className="h2">Websites people remember.</h2>
          </div>
          <p className="section-aside">Our own concept builds: AI-generated film, scrubbed frame by frame as you scroll. Open one and scroll.</p>
        </div>
        <div className="concept-grid">
          {CONCEPTS.map((c) => <Card key={c.href} c={c} near={near} canHover={canHover} />)}
        </div>
      </div>
    </section>
  );
}
