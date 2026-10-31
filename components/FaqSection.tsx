import { useState } from 'react';

// "What owners usually ask": one answer open at a time, the first open to start.
// The same questions are given to search engines as FAQ data (see FAQ_JSON_LD).
export const FAQS: [string, string][] = [
  ['How much does a website cost?', 'It depends on what you need. Most small business sites start at [STARTING PRICE]. You get a fixed quote after a free 30-minute call, and the estimate assistant can give you a ballpark right now.'],
  ['How long does it take?', 'A marketing website usually takes [X] weeks. Apps and systems take longer, and you get the timeline in writing before we start.'],
  ['Do I own the website?', 'Yes. Your domain, your content and your data are yours. If you ever leave, you take everything with you.'],
  ['You are a new studio. Why should I trust you?', 'Fair question. Try the live demos on this page, meet Lee on a call, and only pay against a fixed quote you approve first.'],
  ['Can you work with my existing website or system?', 'Often, yes. We can redesign what you have, add AI to it, or connect it to new tools. We will tell you honestly on the call.'],
];

export const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
};

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="section">
      <div className="container tw:grid tw:gap-10 tw:lg:grid-cols-[0.8fr_1.2fr] tw:lg:gap-16">
        <div>
          <div className="kicker">09 / QUESTIONS</div>
          <h2 className="h2">What owners usually ask.</h2>
        </div>
        <div className="tw:border-t tw:border-ink/15">
          {FAQS.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <div key={q} className="tw:border-b tw:border-ink/15">
                <h3 className="tw:m-0">
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="tw:flex tw:min-h-11 tw:w-full tw:cursor-pointer tw:items-center tw:justify-between tw:gap-6 tw:border-0 tw:bg-transparent tw:py-5 tw:text-left tw:font-sans tw:text-[17.5px] tw:font-semibold tw:tracking-[-0.01em] tw:text-ink tw:focus-visible:outline-2 tw:focus-visible:outline-offset-2 tw:focus-visible:outline-gold-ink"
                  >
                    {q}
                    <span
                      className={`tw:flex tw:size-8 tw:shrink-0 tw:items-center tw:justify-center tw:rounded-full tw:border tw:border-ink/20 tw:text-[18px] tw:leading-none tw:transition-transform tw:duration-200 tw:motion-reduce:transition-none ${isOpen ? 'tw:rotate-45 tw:bg-ink tw:text-cream' : ''}`}
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </button>
                </h3>
                <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} hidden={!isOpen}>
                  <p className="tw:m-0 tw:max-w-[620px] tw:pb-6 tw:text-[16px] tw:leading-relaxed tw:text-body">{a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
