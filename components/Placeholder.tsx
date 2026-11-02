// A clearly marked gap for Lee to fill in. Shown on the page as a dashed box,
// so nobody mistakes it for finished copy.
export default function Placeholder({ text }: { text: string }) {
  return (
    <p className="tw:m-0 tw:rounded-xl tw:border tw:border-dashed tw:border-gold-ink/60 tw:bg-gold/10 tw:px-4 tw:py-3 tw:font-mono tw:text-[13.5px] tw:leading-relaxed tw:text-gold-ink">
      {text}
    </p>
  );
}
