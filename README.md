# Anchored Grace Innovations: agency website

The public website at **anchoredgraceinnovation.com**. It is where every client
lands: our services, our work, and a button to book a discovery call.

## What is on the page

Homepage, top to bottom: the hero with a "pick your business" switcher, a "Built with"
strip, the Anchored / Built / Staffed film, six working service tiles, "Try it live"
demos, concept sites with preview clips, Our work, the founder, our promises, marketing
videos, staffing, how it works, ways to work with us, questions, and contact (with a
note form). Other pages: `/staffing`, three case studies at `/work/<name>`, `/privacy`.

Placeholders for Lee to fill in are written in [square brackets] on the page.

## Changing the project list (the only file you need)

Open `public/js/projects.js`. Each project is one block. To hide one without deleting it,
set `show: false`. To show a site that just launched, set `show: true`.

Rules we follow:
- A client's name appears only once their site is public.
- We never show real client data. Private systems are shown with sample data only, never linked or opened.
- Screenshots live in `public/media/work/` and are stored with the site, not loaded from
  another company's service.

To add videos, put the `.mp4` and a still picture in `public/media/` and add an entry to
`AGI_VIDEOS` at the bottom of `public/js/projects.js`. The video section appears by itself.

## Brand

- **Logo:** an anchor whose ring is a gold spark: a steady foundation with AI on top.
- **Fonts:** Geist (headings and text) and Geist Mono (small labels). Both free for commercial use.
- **Colors:** midnight `#0B0E13`, champagne `#D8C39B` (on dark), deep champagne `#7A5F2E`
  (champagne text on light backgrounds, dark enough to read), paper `#F4F1EB`.

Logo files live in `public/brand/` (the text is drawn as shapes, so they look right anywhere):

| File | Use it for |
| --- | --- |
| `agi-logo-for-dark.svg` / `.png` | Full logo on dark backgrounds |
| `agi-logo-for-light.svg` / `.png` | Full logo on white or light backgrounds |
| `agi-icon.svg`, `png/agi-icon-*.png` | Profile pictures, app icons, favicons |
| `agi-mark-for-dark.svg` / `-for-light.svg` | The anchor alone, no tile |

Use the SVG whenever a tool accepts it (Canva, Figma, printers); PNGs are for everything else.
`og-image.png` is the picture shown when the site link is shared on Messenger, LinkedIn or Viber.

## Stack

Next.js (Pages Router) with TypeScript and Tailwind, built into plain files. Nothing runs
on a Next.js server: the Cloudflare Worker serves the built files.

- `pages/`: one file per page (`index.tsx`, `staffing.tsx`, `work/[slug].tsx`, `privacy.tsx`)
- `components/`: the newer sections (hero switcher, service tiles, demos, founder, FAQ, contact form...)
- `legacy/`: sections carried over unchanged from the hand-written site, as plain HTML
- `public/js/`: the original scripts that still drive those sections (menu, reveal, work
  rail, film, estimate chat). `pages/_app.tsx` starts them once React has started.
- `styles/legacy.css`: the original stylesheet; `styles/globals.css` adds the fonts and
  Tailwind. Tailwind classes start with `tw:` (for example `tw:bg-ink`) so they never
  clash with the original class names; brand colours are in `globals.css`.
- `lib/caseStudies.ts`: the case study pages
- `worker/`: the Cloudflare Worker (pages, estimate assistant, contact form, film files)
- `_headers`: security rules (which outside sources the page may load)

## Run locally

```sh
npm install
npm run build
npx wrangler dev
```

Then visit http://localhost:8787 (the film and video files load only on the live site).
`npm run dev` starts Next.js alone, without the Worker, for quick layout work.

## Publishing

The site and the estimate assistant run on Cloudflare as one Worker, `agi-website`.
It is **not** published automatically from GitHub; publishing is a deliberate step:

```sh
npm install
npm test
npm run build
npx wrangler deploy
```

`npm run build` runs Next.js (out/) and packs the result together with the assistant into
`dist/worker.js`. A file from `public/` is packed only if git tracks it, so nothing unreviewed
or private can go live by accident. The build also records the fingerprint of the small
script Next.js writes inside each page, and the Worker allows exactly those scripts.

## Estimate assistant

A chat window ("Get an estimate") where visitors describe what they need and get a price
range. How it stays safe and cheap:

- **Prices come only from the approved price book** in `worker/pricebook.mjs`. The AI picks
  items; the server does the math. The AI never states a number of its own.
- **Topic-locked:** it only talks about our services and estimates (`worker/prompt.mjs`).
- **Bot protection:** Cloudflare's human check before a chat starts, same-site requests only,
  3 chats per visitor per day, 12 messages per chat, 6 messages a minute, 150 chats and
  1,500 messages a day site-wide, 800 characters per message. Change limits with Worker
  variables (`ESTIMATOR_SESSIONS_PER_DAY` and friends, see `worker/estimator.mjs`).
- **Cost control:** the instructions and price book are cached by the AI provider, effort is
  set low for chat, and Lee sets a hard monthly spending cap on the Anthropic account.
- **Privacy:** visitors' IP addresses are never stored, only a salted fingerprint. Emails and
  phone numbers typed into the chat are removed on the server before anything is stored or
  sent to the AI. Names and emails are kept only from the form, with consent, and the form
  never goes to the AI.
- **Price guard:** every amount in a reply is checked against the price book results in that
  chat; a reply with any other amount is never shown.
- **One message at a time** per chat, so a double-tap cannot mix up the conversation.
- **Enquiries:** visitors who leave their details appear at `/admin/leads` (password in the
  `ADMIN_PASSWORD` secret). The "Book a free call" link opens Calendly pre-filled with their
  name, email and estimate.
- The window only appears when `ANTHROPIC_API_KEY`, `TURNSTILE_SITE_KEY` and
  `TURNSTILE_SECRET` are set. Set the variable `ESTIMATE_ASSISTANT` to `off` to hide it instantly.

Code: `worker/` (server), `js/estimator.js` (chat window), `tests/` (`npm test`).

## Homepage film

The scroll film under the hero is explained in [docs/film.md](docs/film.md): where its pictures live, how to swap or hide it, and how it was made.

## Coming next

- Email alerts to Lee when a visitor leaves an enquiry (today they appear at `/admin/leads`).
