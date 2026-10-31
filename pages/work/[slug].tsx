import type { GetStaticPaths, GetStaticProps } from 'next';
import PageHead from '@/components/PageHead';
import Placeholder from '@/components/Placeholder';
import SubpageShell from '@/components/SubpageShell';
import { CASE_STUDIES, type CaseStudy } from '@/lib/caseStudies';
import { readFragments, type Fragments } from '@/lib/legacy';

type Props = { study: CaseStudy; f: Fragments };

export const getStaticPaths: GetStaticPaths = () => ({
  paths: CASE_STUDIES.map((s) => ({ params: { slug: s.slug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = ({ params }) => {
  const study = CASE_STUDIES.find((s) => s.slug === params?.slug);
  if (!study) return { notFound: true };
  return { props: { study, f: readFragments('shared') } };
};

const SECTIONS: [string, string][] = [
  ['The problem', '[PROBLEM: 2 to 3 sentences]'],
  ['What we built', '[WHAT WE BUILT: 3 to 5 short points]'],
  ['How it is used today', '[HOW IT IS USED TODAY: 2 to 3 sentences]'],
];

export default function CaseStudyPage({ study, f }: Props) {
  return (
    <SubpageShell f={f}>
      <PageHead
        title={`${study.name}: case study | Anchored Grace Innovations`}
        description={`How Anchored Grace Innovations built ${study.name}. ${study.line}`}
        path={`/work/${study.slug}`}
      />
      <section className="tw:px-[var(--gutter)] tw:pb-16 tw:pt-36 tw:sm:pt-44">
        <div className="tw:mx-auto tw:max-w-[1080px]">
          <a href="/#work" className="tw:inline-flex tw:min-h-11 tw:items-center tw:gap-1.5 tw:text-[14px] tw:font-semibold tw:text-gold-ink tw:no-underline tw:hover:underline">
            <span aria-hidden="true">←</span> All work
          </a>
          <div className="kicker tw:mt-4">CASE STUDY · {study.kind.toUpperCase()}</div>
          <h1 className="h2 tw:mb-4 tw:mt-3">{study.name}</h1>
          <p className="tw:m-0 tw:max-w-[640px] tw:text-[18px] tw:leading-relaxed tw:text-body">{study.line}</p>
          <ul className="tw:m-0 tw:mt-5 tw:flex tw:flex-wrap tw:gap-2 tw:p-0 tw:[list-style:none]">
            {study.tags.map((t) => (
              <li key={t} className="tw:rounded-full tw:border tw:border-ink/15 tw:px-3 tw:py-1 tw:font-mono tw:text-[11.5px] tw:text-body">{t}</li>
            ))}
          </ul>
          <div className="tw:mt-10 tw:overflow-hidden tw:rounded-2xl tw:border tw:border-ink/10 tw:bg-ink tw:p-2.5 tw:shadow-[0_40px_90px_-40px_rgba(11,14,19,0.55)]">
            <div className="tw:flex tw:items-center tw:gap-1.5 tw:px-1.5 tw:pb-2.5 tw:pt-1" aria-hidden="true">
              <span className="tw:size-2.5 tw:rounded-full tw:bg-[#3a3f48]" /><span className="tw:size-2.5 tw:rounded-full tw:bg-[#3a3f48]" /><span className="tw:size-2.5 tw:rounded-full tw:bg-[#3a3f48]" />
              <span className="tw:ml-2 tw:truncate tw:rounded-md tw:bg-white/[0.06] tw:px-2.5 tw:py-1 tw:font-mono tw:text-[11px] tw:text-[#a9adb4]">{study.url.replace('https://', '')}</span>
            </div>
            <img src={study.img} alt={study.alt} width={960} height={600} className="tw:block tw:h-auto tw:w-full tw:rounded-lg" />
          </div>
        </div>
      </section>

      <section className="tw:px-[var(--gutter)] tw:pb-20">
        <div className="tw:mx-auto tw:grid tw:max-w-[1080px] tw:gap-10 tw:md:grid-cols-[1fr_2fr]">
          {SECTIONS.map(([heading, gap]) => (
            <div key={heading} className="tw:contents">
              <h2 className="tw:m-0 tw:text-[22px] tw:font-semibold tw:tracking-[-0.015em] tw:text-ink">{heading}</h2>
              <Placeholder text={gap} />
            </div>
          ))}
        </div>
      </section>

      <section className="tw:px-[var(--gutter)] tw:pb-28">
        <div className="tw:mx-auto tw:flex tw:max-w-[1080px] tw:flex-col tw:items-start tw:gap-6 tw:rounded-[24px] tw:bg-ink tw:px-7 tw:py-10 tw:sm:flex-row tw:sm:items-center tw:sm:justify-between tw:sm:px-10">
          <div>
            <p className="tw:m-0 tw:text-[24px] tw:font-semibold tw:leading-tight tw:tracking-[-0.015em] tw:text-cream">Want something like this?</p>
            <p className="tw:m-0 tw:mt-2 tw:text-[15.5px] tw:text-[#a9adb4]">A free 30-minute call. You get a fixed quote before any work starts.</p>
          </div>
          <div className="tw:flex tw:flex-wrap tw:gap-3">
            <a href={study.url} target="_blank" rel="noopener" className="btn btn-ghost btn-lg tw:inline-flex tw:items-center">
              Visit the live site <span className="btn-arrow" aria-hidden="true">↗</span>
            </a>
            <a href="https://calendly.com/lpg-villarasa/30min" target="_blank" rel="noopener" className="btn btn-gold btn-lg">
              Book a discovery call <span className="btn-arrow" aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>
    </SubpageShell>
  );
}
