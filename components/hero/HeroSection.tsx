import HeroSwitcher from './HeroSwitcher';

// The homepage hero: the original headline, text and buttons on the left
// (still animated by js/main.js), the "pick your business" switcher on the right.
export default function HeroSection({ copyHtml }: { copyHtml: string }) {
  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-dots" aria-hidden="true" />
      <div className="hero-grid container">
        <div dangerouslySetInnerHTML={{ __html: copyHtml }} />
        <HeroSwitcher />
      </div>
    </section>
  );
}
