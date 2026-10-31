import type { GetStaticProps } from 'next';
import Legacy from '@/components/Legacy';
import HeroSection from '@/components/hero/HeroSection';
import BuiltWith from '@/components/BuiltWith';
import ServicesBento from '@/components/services/ServicesBento';
import DemosSection from '@/components/DemosSection';
import PageHead from '@/components/PageHead';
import { readFragments, type Fragments } from '@/lib/legacy';

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Anchored Grace Innovations',
  url: 'https://anchoredgraceinnovation.com/',
  areaServed: 'Worldwide',
  address: { '@type': 'PostalAddress', addressLocality: 'Cebu', addressCountry: 'PH' },
  founder: { '@type': 'Person', name: 'Lee Villarasa', url: 'https://leevillarasa.xyz/' },
  knowsAbout: ['Web design', 'Web applications', 'AI integration', 'Marketing video', 'Outsourced staffing'],
};

export const getStaticProps: GetStaticProps<{ f: Fragments }> = () => ({ props: { f: readFragments('home') } });

export default function Home({ f }: { f: Fragments }) {
  return (
    <>
      <PageHead
        title="Anchored Grace Innovations | AI-native websites, apps and teams"
        description="We build websites and custom web apps, put AI to work inside your business, and staff AI-native admin professionals for growing businesses worldwide. Based in Cebu, serving clients worldwide."
        path="/"
        ogTitle="Anchored Grace Innovations"
        ogDescription="Websites, custom web apps, AI inside your systems, and AI-native staff. Based in Cebu, serving clients worldwide."
        jsonLd={[JSON_LD]}
      />
      <Legacy html={f.sprite} />
      <Legacy html={f.header} />
      <main>
        <HeroSection copyHtml={f['01-hero-copy']} />
        <BuiltWith />
        <Legacy html={f['02-film']} />
        <ServicesBento />
        <DemosSection />
        <Legacy html={f['04-concepts']} />
        <Legacy html={f['05-work']} />
        <Legacy html={f['06-videos']} />
        <Legacy html={f['07-talent']} />
        <Legacy html={f['08-process']} />
        <Legacy html={f['09-pricing']} />
        <Legacy html={f['10-contact']} />
      </main>
      <Legacy html={f.footer} />
    </>
  );
}
