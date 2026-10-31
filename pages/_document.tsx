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
        </body>
      </Html>
    );
  }
}
