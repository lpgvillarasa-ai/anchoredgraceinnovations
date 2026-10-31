import { useRef } from 'react';
import Placeholder from './Placeholder';

// "Who you work with": Lee, with a short intro video. Until Lee adds his photo and
// the 60-second video, both show clearly marked placeholders. To add them, put the
// files in public/media/founder/ and set the two paths below.
const PHOTO: string | null = null; // e.g. '/media/founder/lee.webp'
const VIDEO: string | null = null; // e.g. '/media/founder/why-i-started.mp4'

export default function FounderSection() {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const open = () => dialog.current?.showModal();
  const close = () => { video.current?.pause(); dialog.current?.close(); };

  return (
    <section id="founder" className="section">
      <div className="container tw:grid tw:items-center tw:gap-10 tw:md:grid-cols-[0.85fr_1.15fr] tw:lg:gap-16">
        <div className="tw:relative tw:mx-auto tw:aspect-[4/5] tw:w-full tw:max-w-[440px] tw:overflow-hidden tw:rounded-[28px] tw:bg-ink tw:shadow-[0_40px_90px_-40px_rgba(11,14,19,0.6)]">
          {PHOTO ? (
            <img src={PHOTO} alt="Lee Villarasa, founder of Anchored Grace Innovations" width={880} height={1100} loading="lazy" decoding="async" className="tw:size-full tw:object-cover" />
          ) : (
            <div className="tw:flex tw:size-full tw:flex-col tw:items-center tw:justify-center tw:gap-4 tw:bg-[radial-gradient(120%_80%_at_50%_0%,#1d222a,#0b0e13)] tw:p-8 tw:text-center">
              <svg className="tw:size-20 tw:text-cream" aria-hidden="true"><use href="#agi-mark" /></svg>
              <span className="tw:rounded-lg tw:border tw:border-dashed tw:border-gold/50 tw:px-3 tw:py-2 tw:font-mono tw:text-[12px] tw:text-gold">[PHOTO OF LEE]</span>
            </div>
          )}
          <button
            type="button"
            onClick={open}
            aria-label="Watch: why I started Anchored Grace, 60 seconds"
            className="tw:absolute tw:inset-0 tw:m-auto tw:flex tw:size-[72px] tw:cursor-pointer tw:items-center tw:justify-center tw:rounded-full tw:border tw:border-white/15 tw:bg-ink/85 tw:text-cream tw:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)] tw:backdrop-blur-md tw:transition-transform tw:duration-200 tw:hover:scale-105 tw:motion-reduce:transition-none tw:focus-visible:outline-3 tw:focus-visible:outline-offset-4 tw:focus-visible:outline-gold"
          >
            <svg viewBox="0 0 24 24" className="tw:ml-1 tw:size-7 tw:fill-current" aria-hidden="true"><path d="M7.5 5v14L19 12z" /></svg>
          </button>
          <span className="tw:absolute tw:bottom-5 tw:left-5 tw:right-5 tw:mx-auto tw:w-max tw:max-w-[calc(100%-40px)] tw:rounded-full tw:bg-cream/95 tw:px-4 tw:py-2 tw:text-center tw:text-[12.5px] tw:font-semibold tw:text-ink tw:shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)]" aria-hidden="true">
            Watch: why I started Anchored Grace · 60 sec
          </span>
        </div>

        <div>
          <div className="kicker">05 / WHO YOU WORK WITH</div>
          <h2 className="h2">You talk to the person who builds it.</h2>
          <p className="tw:mb-5 tw:mt-5 tw:max-w-[560px] tw:text-[18px] tw:leading-relaxed tw:text-body">
            I&apos;m Lee Villarasa. I spent years in operations helping business owners run their day, and now I build the websites and systems that make that day easier. No account managers, no handoffs: you get me, from the first call to launch.
          </p>
          <div className="tw:max-w-[560px]"><Placeholder text="[Add one line about your background or a value you stand for]" /></div>
          <div className="tw:mt-8 tw:flex tw:flex-wrap tw:gap-3">
            <a href="https://www.linkedin.com/in/leepatrickglennvillarasa/" target="_blank" rel="noopener" className="btn btn-dark btn-lg">
              Connect on LinkedIn <span className="btn-arrow" aria-hidden="true">↗</span>
            </a>
            <a href="https://leevillarasa.xyz/" target="_blank" rel="noopener" className="btn btn-outline btn-lg">My portfolio</a>
          </div>
        </div>
      </div>

      <dialog
        ref={dialog}
        aria-label="Why I started Anchored Grace"
        onClick={(e) => { if (e.target === dialog.current) close(); }}
        onClose={() => video.current?.pause()}
        className="tw:m-auto tw:w-[min(92vw,420px)] tw:overflow-hidden tw:rounded-2xl tw:border-0 tw:bg-ink tw:p-0 tw:text-cream tw:backdrop:bg-deep/80 tw:backdrop:backdrop-blur-sm"
      >
        <div className="tw:flex tw:items-center tw:justify-between tw:px-4 tw:py-3">
          <span className="tw:text-[14px] tw:font-semibold">Why I started Anchored Grace</span>
          <button type="button" onClick={close} aria-label="Close video" className="tw:flex tw:size-11 tw:cursor-pointer tw:items-center tw:justify-center tw:rounded-full tw:border-0 tw:bg-white/10 tw:text-[20px] tw:text-cream tw:hover:bg-white/20 tw:focus-visible:outline-2 tw:focus-visible:outline-gold">×</button>
        </div>
        {VIDEO ? (
          <video ref={video} src={VIDEO} controls playsInline preload="none" className="tw:block tw:aspect-[9/16] tw:w-full tw:bg-deep" />
        ) : (
          <div className="tw:flex tw:aspect-[9/16] tw:items-center tw:justify-center tw:bg-deep tw:p-6">
            <span className="tw:rounded-lg tw:border tw:border-dashed tw:border-gold/50 tw:px-3 tw:py-2 tw:text-center tw:font-mono tw:text-[12.5px] tw:text-gold">[VIDEO: why I started Anchored Grace, about 60 seconds]</span>
          </div>
        )}
      </dialog>
    </section>
  );
}
