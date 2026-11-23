import type { GetStaticProps } from 'next';
import type { ReactNode } from 'react';
import PageHead from '@/components/PageHead';
import SubpageShell from '@/components/SubpageShell';
import { readFragments, type Fragments } from '@/lib/legacy';
import { BUSINESS_NAME, CONTACT_EMAIL, SMS_TERMS_UPDATED, SMS_TOPICS } from '@/lib/contact';

export const getStaticProps: GetStaticProps<{ f: Fragments }> = () => ({ props: { f: readFragments('shared') } });

// The terms for our text messages, written the way carriers ask for them when a
// business number is approved for texting (Zoom Phone, Lee 2026-11-05). Service texts
// only: no marketing. Change the wording only together with the campaign in Zoom.
function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="tw:border-t tw:border-ink/10 tw:py-8">
      <h2 className="tw:m-0 tw:mb-3 tw:text-[21px] tw:font-semibold tw:tracking-[-0.015em] tw:text-ink">{title}</h2>
      <div className="tw:grid tw:gap-3 tw:text-[16px] tw:leading-relaxed tw:text-body tw:[&_p]:m-0">{children}</div>
    </section>
  );
}

const LINK = 'tw:text-gold-ink tw:underline';

export default function SmsTerms({ f }: { f: Fragments }) {
  return (
    <SubpageShell f={f}>
      <PageHead
        title="SMS terms | Anchored Grace Innovations"
        description="How Anchored Grace Innovations uses text messages: what we text about, how often, how to stop, and how we protect your number."
        path="/sms-terms"
      />
      <div className="tw:px-[var(--gutter)] tw:pb-28 tw:pt-36 tw:sm:pt-44">
        <article className="tw:mx-auto tw:max-w-[760px]">
          <div className="kicker">TEXT MESSAGES</div>
          <h1 className="h2 tw:mb-4 tw:mt-3">SMS terms</h1>
          <p className="tw:mb-8 tw:mt-5 tw:text-[15px] tw:text-[#5b5f66]">Last updated: {SMS_TERMS_UPDATED}</p>

          <Block title="The program">
            <p>{BUSINESS_NAME} text messages. {BUSINESS_NAME} is a web and software studio based in Cebu, Philippines, run by Lee Villarasa.</p>
            <p>We text people who have asked us to, about {SMS_TOPICS}. We do not send marketing or promotional texts.</p>
          </Block>

          <Block title="How you sign up">
            <p>You agree to receive our texts by ticking the box on the contact form on <a className={LINK} href="/#contact">our website</a> and giving your mobile number. The box is never ticked for you, and you do not need to tick it to contact us or to work with us: consent to texts is not a condition of any purchase.</p>
          </Block>

          <Block title="How often, and what it costs">
            <p>Message frequency varies with your enquiry or project.</p>
            <p>Message and data rates may apply, depending on your mobile plan. We do not charge for our texts.</p>
          </Block>

          <Block title="How to stop">
            <p>Reply <strong>STOP</strong> to any of our texts at any time (CANCEL, END, QUIT and UNSUBSCRIBE also work). We will send one text to confirm, and then no more. To start again, reply <strong>START</strong>.</p>
          </Block>

          <Block title="Help">
            <p>Reply <strong>HELP</strong> to any of our texts, or email <a className={LINK} href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
          </Block>

          <Block title="Delivery">
            <p>Mobile carriers are not liable for delayed or undelivered messages.</p>
          </Block>

          <Block title="Your privacy">
            <p>We never sell or share your mobile number or your consent to receive texts with third parties or affiliates for marketing or promotional purposes. Text messaging opt-in data and consent are never shared with any third parties.</p>
            <p>Read more in our <a className={LINK} href="/privacy">privacy policy</a>.</p>
          </Block>
        </article>
      </div>
    </SubpageShell>
  );
}
