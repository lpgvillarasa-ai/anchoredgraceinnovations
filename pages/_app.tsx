import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import '../styles/globals.css';

// The site's original scripts (public/js), per page, in the order they always ran.
// They drive the sections carried over from the hand-written site. They are added
// only after React has finished taking over the page: if they changed those
// sections first, React would rebuild them and the scripts' buttons would stop working.
const SCRIPTS: Record<string, string[]> = {
  '/': ['projects', 'work', 'main', 'film', 'estimator'],
  '/staffing': ['main', 'estimator'],
};
const DEFAULT_SCRIPTS = ['main', 'estimator'];

export default function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();
  useEffect(() => {
    if (document.documentElement.dataset.legacyScripts) return;
    document.documentElement.dataset.legacyScripts = 'loaded';
    for (const name of SCRIPTS[pathname] || DEFAULT_SCRIPTS) {
      const s = document.createElement('script');
      s.src = `/js/${name}.js`;
      s.async = false; // keeps them running in this order
      document.body.appendChild(s);
    }
  }, [pathname]);
  return <Component {...pageProps} />;
}
