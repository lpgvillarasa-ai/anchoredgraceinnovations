// Shows one original section exactly as it was written. The wrapper takes no space
// in the layout (display: contents), so the page looks the same as before.
export default function Legacy({ html }: { html: string }) {
  return <div data-legacy="" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
