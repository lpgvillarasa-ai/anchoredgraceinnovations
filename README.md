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

The site runs on Cloudflare as the Worker `agi-website`. It is **not** published
automatically from GitHub; publishing is a deliberate step:

```sh
npx wrangler deploy
```

If asset upload is not possible (some sandboxes), `node tools/bundle-worker.mjs > worker.js`
packs the whole site into one script that can be uploaded instead.

`.assetsignore` keeps these notes and the agent files off the public site.

## Coming next

- Phase 2: an AI estimate assistant that only talks about our services and only
  quotes from the price book Lee approves, with bot protection and spending caps.
- Phase 3: safe demo copies of our own products on fake data, and tap-to-talk.
