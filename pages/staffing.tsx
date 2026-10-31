import type { GetStaticProps } from 'next';
import Legacy from '@/components/Legacy';
import PageHead from '@/components/PageHead';
import { readFragments, type Fragments } from '@/lib/legacy';

export const getStaticProps: GetStaticProps<{ f: Fragments }> = () => ({ props: { f: readFragments('staffing') } });

export default function Staffing({ f }: { f: Fragments }) {
  return (
    <>
      <PageHead
        title="AI-Native Admin Staff for Growing Businesses | Anchored Grace Innovations"
        description="A dedicated, full-time AI-native assistant for your small business, wherever you are: inbox, calendar, customer support, bookkeeping and data. Works your hours. From $1,199 a month, or ₱35,000 in the Philippines."
        path="/staffing"
        ogTitle="AI-native admin staff for growing businesses"
        ogDescription="A dedicated, full-time assistant trained on AI and supervised by us. Works your hours. From $1,199 a month, or ₱35,000 in the Philippines."
      />
      <Legacy html={f.sprite} />
      <Legacy html={f.header} />
      <main>
        <Legacy html={f['01-hero']} />
        <Legacy html={f['02-tasks']} />
        <Legacy html={f['03-ai-band']} />
        <Legacy html={f['04-process']} />
        <Legacy html={f['05-pricing']} />
        <Legacy html={f['06-faq']} />
        <Legacy html={f['07-contact']} />
      </main>
      <Legacy html={f.footer} />
    </>
  );
}
