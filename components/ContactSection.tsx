import ContactForm from './ContactForm';

// "Tell us what you want to build": the original heading, text and buttons on the
// left (still driven by js/main.js and js/estimator.js), the note form on the right.
export default function ContactSection({ copyHtml }: { copyHtml: string }) {
  return (
    <section id="contact" className="contact" data-nav-dark="">
      <div className="contact-dots" aria-hidden="true" />
      <div className="contact-glow" aria-hidden="true" />
      <div className="contact-split tw:relative tw:mx-auto tw:grid tw:max-w-[1180px] tw:items-center tw:gap-12 tw:min-[1025px]:grid-cols-[1.1fr_0.9fr] tw:min-[1025px]:gap-16">
        <div dangerouslySetInnerHTML={{ __html: copyHtml }} />
        <div className="tw:mx-auto tw:w-full tw:max-w-[480px]">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
