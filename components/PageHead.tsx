import Head from 'next/head';

const SITE = 'https://anchoredgraceinnovation.com';

type Props = {
  title: string;
  description: string;
  path: string;
  ogTitle?: string;
  ogDescription?: string;
  jsonLd?: object[];
};

// Title, search description and link-preview tags for one page.
export default function PageHead({ title, description, path, ogTitle, ogDescription, jsonLd = [] }: Props) {
  const url = SITE + path;
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={`${SITE}/og-image.png`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      {jsonLd.map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
      ))}
    </Head>
  );
}
