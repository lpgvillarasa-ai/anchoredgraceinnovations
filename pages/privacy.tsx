import type { GetStaticProps } from 'next';
import type { ReactNode } from 'react';
import PageHead from '@/components/PageHead';
import SubpageShell from '@/components/SubpageShell';
import { readFragments, type Fragments } from '@/lib/legacy';

export const getStaticProps: GetStaticProps<{ f: Fragments }> = () => ({ props: { f: readFragments('shared') } });

// A plain policy describing what the site actually does today (Lee approved
// publishing it on 2026-11-02). Update it whenever the site starts collecting
// something new.
function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="tw:border-t tw:border-ink/10 tw:py-8">
      <h2 className="tw:m-0 tw:mb-3 tw:text-[21px] tw:font-semibold tw:tracking-[-0.015em] tw:text-ink">{title}</h2>
      <div className="tw:grid tw:gap-3 tw:text-[16px] tw:leading-relaxed tw:text-body tw:[&_p]:m-0">{children}</div>
    </section>
  );
}

export default function Privacy({ f }: { f: Fragments }) {
  return (
    <SubpageShell f={f}>
      <PageHead
        title="Privacy policy | Anchored Grace Innovations"
        description="What Anchored Grace Innovations does with what you share on this website: the contact form, the AI estimate chat, and the services that help run the site."
        path="/privacy"
      />
      <div className="tw:px-[var(--gutter)] tw:pb-28 tw:pt-36 tw:sm:pt-44">
        <article className="tw:mx-auto tw:max-w-[760px]">
          <div className="kicker">PRIVACY</div>
          <h1 className="h2 tw:mb-4 tw:mt-3">Privacy policy</h1>
          <p className="tw:mb-8 tw:mt-5 tw:text-[15px] tw:text-[#5b5f66]">Last updated: 2 November 2026</p>

          <Block title="Who we are">
            <p>Anchored Grace Innovations is a small studio based in Cebu, Philippines, run by Lee Villarasa. For anything about your information, email <a className="tw:text-gold-ink tw:underline" href="mailto:lee@anchoredgraceinnovations.com">lee@anchoredgraceinnovations.com</a>.</p>
          </Block>

          <Block title="The contact form">
            <p>When you leave a note, we keep your name, your email and what you wrote. It is saved in our own private storage on Cloudflare, which only Lee can open, and we use it only to reply to you. We do not sell it or add you to a mailing list.</p>
            <p>To stop automated spam, we also keep a scrambled fingerprint of your internet address (not the address itself) for one day, which limits how many notes can be sent.</p>
            <p>We keep notes only as long as we need them to reply to you, and we delete yours any time you ask by email.</p>
          </Block>

          <Block title="The AI estimate chat">
            <p>The estimate chat is answered by an AI service, Anthropic. What you type is sent to Anthropic to write the answer, under its business terms. Before that, the site removes email addresses and phone numbers it can spot, and the chat asks you not to share personal details there.</p>
            <p>The chat itself is kept for up to 2 days so the conversation can continue, then deleted. If you leave your details at the end of a chat to hear back from Lee, those details are kept with the other enquiries, like the contact form.</p>
            <p>A Cloudflare check (Turnstile) runs when a chat starts, to tell people from bots.</p>
          </Block>

          <Block title="Services that help run the site">
            <p>The site is hosted on Cloudflare, and our fonts are served from our own site. Booking a call opens Calendly, and our demos and concept sites open on their own pages. Each of these services handles the technical details your browser sends them under its own privacy policy.</p>
            <p>We count visits with Cloudflare Web Analytics, which does not use cookies and does not follow you to other sites. This site does not set cookies of its own and uses no advertising trackers.</p>
          </Block>

          <Block title="Your choices">
            <p>You can ask us what we hold about you, ask us to correct it, or ask us to delete it, by emailing Lee. We will answer within a reasonable time.</p>
            <p>If you are in the Philippines, these are your rights under the Data Privacy Act of 2012 (Republic Act 10173), and you can also raise a concern with the National Privacy Commission. Visitors from other countries can make the same requests the same way.</p>
          </Block>
        </article>
      </div>
    </SubpageShell>
  );
}
