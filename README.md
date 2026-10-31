# Anchored Grace Innovations: agency website

The public website at **anchoredgraceinnovation.com**. It is where every client
lands: our services, our work, and a button to book a discovery call.

## What is on the page

- **Services:** three pillars (Build, Automate, Staff) plus marketing videos as an add-on
- **Our work:** a gallery with filters (client websites, our products, business systems)
- **Marketing videos:** hidden until videos are added (see below)
- **AI-native talent, how it works, ways to work with us, book a call**

## Changing the project list (the only file you need)

Open `js/projects.js`. Each project is one block. To hide one without deleting it,
set `show: false`. To show a site that just launched, set `show: true`.

Rules we follow:
- A client's name appears only once their site is public.
- Private systems hold real people's data: we describe them, never link or open them.
- Screenshots live in `media/work/` and are stored with the site, not loaded from
  another company's service.

To add videos, put the `.mp4` and a still picture in `media/` and add an entry to
`AGI_VIDEOS` at the bottom of `js/projects.js`. The video section appears by itself.

## Brand

- **Logo:** an anchor whose ring is a gold spark: a steady foundation with AI on top.
- **Fonts:** Geist (headings and text) and Geist Mono (small labels). Both free for commercial use.
- **Colors:** midnight `#0B0E13`, champagne `#D8C39B` (on dark), deep champagne `#8F7547`
  (champagne text on light backgrounds), paper `#F4F1EB`.

Logo files live in `brand/` (the text is drawn as shapes, so they look right anywhere):

| File | Use it for |
| --- | --- |
| `agi-logo-for-dark.svg` / `.png` | Full logo on dark backgrounds |
| `agi-logo-for-light.svg` / `.png` | Full logo on white or light backgrounds |
| `agi-icon.svg`, `png/agi-icon-*.png` | Profile pictures, app icons, favicons |
| `agi-mark-for-dark.svg` / `-for-light.svg` | The anchor alone, no tile |

Use the SVG whenever a tool accepts it (Canva, Figma, printers); PNGs are for everything else.
`og-image.png` is the picture shown when the site link is shared on Messenger, LinkedIn or Viber.

## Stack

Plain HTML, CSS and JavaScript. No build step.

- `index.html`: the page
- `css/styles.css`: all styles (colours and fonts at the top, in `:root`)
- `js/projects.js`: the project and video list
- `js/work.js`: draws the gallery from that list
- `js/main.js`: scroll animations, menu
- `_headers`: security rules (which outside sources the page may load)

## Run locally

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Publishing

The site and the estimate assistant run on Cloudflare as one Worker, `agi-website`.
It is **not** published automatically from GitHub; publishing is a deliberate step:

```sh
npm install
npm test
npm run build
npx wrangler deploy
```

`npm run build` packs every **git-tracked** site file (minus `.assetsignore`) together with
the assistant into `dist/worker.js`, so nothing unreviewed or private can go live by accident.

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
- **Privacy:** visitors' IP addresses are never stored, only a salted fingerprint. Names and
  emails are kept only when a visitor fills in the form and ticks consent.
- **Enquiries:** visitors who leave their details appear at `/admin/leads` (password in the
  `ADMIN_PASSWORD` secret). The "Book a free call" link opens Calendly pre-filled with their
  name, email and estimate.
- The window only appears when `ANTHROPIC_API_KEY`, `TURNSTILE_SITE_KEY` and
  `TURNSTILE_SECRET` are set. Set `ESTIMATOR=off` to hide it instantly.

Code: `worker/` (server), `js/estimator.js` (chat window), `tests/` (`npm test`).

## Coming next

- AGIbnb (the rebranded stays app) as a public demo at agibnb.anchoredgraceinnovation.com.
- Email alerts to Lee when a visitor leaves an enquiry (today they appear at `/admin/leads`).
