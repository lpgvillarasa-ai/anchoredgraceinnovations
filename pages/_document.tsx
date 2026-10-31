import Document, { Html, Head, Main, NextScript } from 'next/document';

// The site's original scripts, per page, in the order they always ran.
// They load after the page and drive the sections carried over from the old site.
const SCRIPTS: Record<string, string[]> = {
  '/': ['projects', 'work', 'main', 'film', 'estimator'],
  '/staffing': ['main', 'estimator'],
};

export default class SiteDocument extends Document {
  render() {
    const scripts = SCRIPTS[this.props.__NEXT_DATA__.page] || ['main', 'estimator'];
    return (
      <Html lang="en">
        <Head>
          <meta name="theme-color" content="#0B0E13" />
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link
            href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body id="top">
          <Main />
          <NextScript />
          {scripts.map((name) => (
            <script key={name} src={`/js/${name}.js`} defer />
          ))}
        </body>
      </Html>
    );
  }
}
