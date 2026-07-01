# Anchored Grace Innovations — Website

Marketing site for Anchored Grace Innovations (AGI): staffing & AI-equipped talent placement plus websites, apps and systems for growing companies.

Implemented from the Claude Design handoff (`AGI Website.dc.html`).

## Stack

Plain static HTML/CSS/JS — no build step, no dependencies.

- `index.html` — the one-page site (hero, services, mission, talent, AI band, process, testimonials, pricing, contact, footer)
- `css/styles.css` — all styles; design tokens live in `:root`
- `js/main.js` — scroll reveals, glass-nav condense, mobile menu

## Run locally

Open `index.html` directly, or serve the folder:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Deploy

Any static host works (Netlify, Vercel, GitHub Pages, Cloudflare Pages). Point it at the repo root; no build command needed.

## Placeholders to fill in

- Testimonials section — two placeholder quote cards marked `PLACEHOLDER — YOUR TESTIMONIALS`
- Pricing — `from $—/mo` amounts on the Fractional and Dedicated Seat plans
