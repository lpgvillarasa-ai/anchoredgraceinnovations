import Document, { Html, Head, Main, NextScript } from 'next/document';

// The site's original scripts are added by pages/_app.tsx once React has started.

export default class SiteDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta name="theme-color" content="#0B0E13" />
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="preload" href="/fonts/Geist-Variable.woff2" as="font" type="font/woff2" crossOrigin="" />
        </Head>
        <body id="top">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
