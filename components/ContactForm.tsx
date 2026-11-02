import { useState, type FormEvent } from 'react';

// "Not ready for a call? Leave a note." Sends to /api/contact, which saves the note
// on Lee's private enquiries page. The hidden "website" field is a trap for bots.
type Field = 'name' | 'email' | 'note';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function check(v: Record<Field, string>): Partial<Record<Field, string>> {
  const e: Partial<Record<Field, string>> = {};
  if (!v.name.trim()) e.name = 'Please enter your name.';
  if (!EMAIL.test(v.email.trim())) e.email = 'Please enter a valid email address.';
  if (v.note.trim().length < 10) e.note = 'Please tell us a little about it (at least 10 characters).';
  return e;
}

const INPUT =
  'tw:mt-1.5 tw:block tw:w-full tw:rounded-xl tw:border tw:bg-white tw:px-4 tw:py-3 tw:font-sans tw:text-[16px] tw:text-ink tw:placeholder:text-[#8a8e95] tw:focus:border-ink tw:focus:outline-2 tw:focus:outline-offset-1 tw:focus:outline-gold';

export default function ContactForm() {
  const [values, setValues] = useState<Record<Field, string>>({ name: '', email: '', note: '' });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [problem, setProblem] = useState('');

  const set = (k: Field) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProblem('');
    const found = check(values);
    setErrors(found);
    const first = (['name', 'email', 'note'] as Field[]).find((k) => found[k]);
    if (first) { document.getElementById(`cf-${first}`)?.focus(); return; }
    setState('sending');
    try {
      const website = (e.currentTarget.elements.namedItem('website') as HTMLInputElement | null)?.value || '';
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, website }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) { setState('sent'); return; }
      if (data.field) setErrors({ [data.field as Field]: data.error });
      setProblem(data.field ? '' : data.error || 'Sorry, something went wrong. Please email us instead.');
    } catch {
      setProblem('Sorry, your note could not be sent. Please check your connection, or email us instead.');
    }
    setState('idle');
  }

  if (state === 'sent') {
    return (
      <div className="tw:rounded-[24px] tw:bg-paper tw:p-8 tw:text-left tw:text-body" role="status">
        <span className="tw:flex tw:size-11 tw:items-center tw:justify-center tw:rounded-full tw:bg-gold" aria-hidden="true">
          <svg viewBox="0 0 12 12" className="tw:size-5 tw:fill-none tw:stroke-ink tw:[stroke-width:1.8]"><path d="M2.5 6.2 5 8.5l4.5-5" /></svg>
        </span>
        <p className="tw:mb-2 tw:mt-5 tw:text-[22px] tw:font-semibold tw:tracking-[-0.015em] tw:text-ink">Thanks, your note is in.</p>
        <p className="tw:m-0 tw:text-[15.5px] tw:leading-relaxed">We reply within one business day, to the email you gave us.</p>
      </div>
    );
  }

  const field = (k: Field, label: string, props: Record<string, unknown>, multiline = false) => {
    const err = errors[k];
    const shared = {
      id: `cf-${k}`, name: k, value: values[k], onChange: set(k), 'aria-invalid': err ? true : undefined,
      'aria-describedby': err ? `cf-${k}-error` : undefined, className: `${INPUT} ${err ? 'tw:border-[#b3261e]' : 'tw:border-ink/15'}`, ...props,
    };
    return (
      <div>
        <label htmlFor={`cf-${k}`} className="tw:text-[14px] tw:font-semibold tw:text-ink">{label}</label>
        {multiline ? <textarea rows={4} {...shared} /> : <input {...shared} />}
        {err && <p id={`cf-${k}-error`} className="tw:mb-0 tw:mt-1.5 tw:text-[13.5px] tw:font-medium tw:text-[#b3261e]">{err}</p>}
      </div>
    );
  };

  return (
    <form noValidate onSubmit={submit} aria-labelledby="cf-title" className="tw:rounded-[24px] tw:bg-paper tw:p-7 tw:text-left tw:shadow-[0_40px_90px_-40px_rgba(0,0,0,0.8)] tw:sm:p-8">
      <h3 id="cf-title" className="tw:m-0 tw:text-[22px] tw:font-semibold tw:leading-tight tw:tracking-[-0.015em] tw:text-ink">Not ready for a call? Leave a note.</h3>
      <div className="tw:mt-6 tw:grid tw:gap-4">
        {field('name', 'Name', { type: 'text', autoComplete: 'name', maxLength: 80 })}
        {field('email', 'Email', { type: 'email', autoComplete: 'email', inputMode: 'email', maxLength: 120 })}
        {field('note', 'What do you want to build?', { maxLength: 1000 }, true)}
        <div className="tw:absolute tw:left-[-10000px] tw:size-px tw:overflow-hidden" aria-hidden="true">
          <label htmlFor="cf-website">Leave this empty</label>
          <input id="cf-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
      </div>
      {problem && <p className="tw:mb-0 tw:mt-4 tw:text-[14px] tw:font-medium tw:text-[#b3261e]" role="alert">{problem}</p>}
      <button
        type="submit"
        disabled={state === 'sending'}
        className="btn btn-gold btn-lg tw:mt-6 tw:w-full tw:cursor-pointer tw:border-0 tw:text-center tw:font-sans tw:disabled:cursor-wait tw:disabled:opacity-70"
      >
        {state === 'sending' ? 'Sending…' : 'Send. We reply within one business day.'}
      </button>
      <p className="tw:mb-0 tw:mt-3 tw:text-[12.5px] tw:leading-relaxed tw:text-[#5b5f66]">
        Your note goes only to Lee. See our <a href="/privacy" className="tw:text-gold-ink tw:underline">privacy policy</a>.
      </p>
    </form>
  );
}
