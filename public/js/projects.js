/* ==========================================================================
   THE PROJECT LIST. This is the only file to edit when a project changes.

   Each project:
     name     what the card shows as its title
     group    'live'    a public site we built for a client (named, linked)
              'product' our own product or passion project (named, linked)
              'system'  client work in progress or private: a general name,
                        never the client's name, never a link
     kind     short label, e.g. 'Website', 'Web app'
     line     one sentence: what it does for the business
     tags     2 to 4 short tags
     url      the live address (live and product only)
     img      a screenshot saved in media/work (1280x800 page, jpg). For a
              private system: made from fake/training data only, with the
              business name hidden and every name, number and date blurred.
     show     false hides it from the site without deleting it

   Rule: only our own work. Every url must be proven ours: a domain on our
   Cloudflare account, or a link on Lee's own portfolio (leevillarasa.xyz).
   Never take an address from a README alone.
   Rule: never show a hosting company's address (workers.dev, vercel.app,
   netlify.app, pages.dev). A site without its own domain gets a subdomain
   of ours instead, e.g. clientname.anchoredgraceinnovation.com (Cloudflare:
   Workers > the site > Settings > Domains > Add custom domain).
   Rule: a client's name goes up only once their site is public and they have
   agreed to be shown; until then, a general name, a blurred preview, no link. Private
   systems hold real people's data, so they are described, never opened.
   ========================================================================== */

window.AGI_PROJECTS = [
  // ---------- Live client sites ----------
  {
    name: 'Skin Delight Cebu', group: 'live', kind: 'Website',
    line: 'A premium site for an aesthetic clinic: full price list, client results and online booking.',
    tags: ['Healthcare', 'Booking', 'Cebu'], url: 'https://skindelightcebu.com', img: 'media/work/skin-delight.jpg', show: true,
  },
  {
    name: 'Coach Jasmin Rough', group: 'live', kind: 'Website',
    line: "A women's fitness coaching site: programs, results and consultation requests.",
    tags: ['Fitness', 'Personal brand'], url: 'https://jasminroughcoaching.com', img: 'media/work/jasmin-rough.jpg', show: true,
  },
  {
    name: 'CK 12th Anniversary', group: 'live', kind: 'Website + app',
    line: "Event website with tickets, door check-in and an admin app for a church's anniversary celebration.",
    tags: ['Events', 'Ticketing', 'Church'], url: 'https://ckworldharvest.org', img: 'media/work/ck12.jpg', show: true,
  },
  {
    // Client name withheld until they agree to be shown (Lee, 31 Oct 2026): general name, blurred preview, no link.
    name: 'Multi-branch gym website', group: 'live', kind: 'Website',
    line: 'A bold site for a 24/7 gym with several branches: locations, membership plans and free-trial sign-ups.',
    tags: ['Fitness', 'Multi-branch'], img: 'media/work/fitness-site.jpg', show: true,
  },
  {
    // Client name withheld until they agree to be shown (Lee, 31 Oct 2026): general name, blurred preview, no link.
    name: 'Sports court booking app', group: 'live', kind: 'Booking app',
    line: 'Players book court time online; the owner runs every court from one workspace.',
    tags: ['Sports', 'Booking'], img: 'media/work/court-booking.jpg', show: true,
  },
  {
    name: 'Ruje Café', group: 'live', kind: 'Website',
    line: 'A warm, menu-first site for a specialty coffee shop inside a sports venue.',
    tags: ['Food & drink', 'Local'], url: 'https://rujecafe.anchoredgraceinnovation.com', img: 'media/work/ruje-cafe.jpg', show: true,
  },

  // ---------- Our own products ----------
  {
    name: 'Stewardly AI', group: 'product', kind: 'AI product',
    line: 'Its AI reads your bills, loans and subscriptions in seconds, then reminds you before anything is due.',
    tags: ['AI', 'Finance', 'Mobile'], url: 'https://stewardlyai.com', img: 'media/work/stewardly.jpg', show: true,
  },
  {
    name: 'FaithFlow AI', group: 'product', kind: 'AI product',
    line: 'A biblical wisdom companion: ask a real-life question, get scripture-grounded guidance.',
    tags: ['AI', 'Faith'], url: 'https://faithflowai.com', img: 'media/work/faithflow.jpg', show: true,
  },
  {
    name: 'Lee & Kyarah', group: 'product', kind: 'Website',
    line: 'Our own wedding website: story, schedule, RSVP and guest details in one place.',
    tags: ['Events', 'Design'], url: 'https://leeandkyarah.com', img: 'media/work/lee-kyarah.jpg', show: true,
  },
  {
    name: 'Donna', group: 'product', kind: 'AI assistant',
    line: 'A voice-first AI executive assistant that keeps the calendar, the notes and the open loops.',
    tags: ['AI', 'Voice', 'Productivity'], img: 'media/work/donna.jpg', show: true,
  },

  {
    name: 'Agency sales pipeline', group: 'product', kind: 'Web app',
    line: 'Our own CRM: every client from first call to final payment, with referral commissions.',
    tags: ['CRM', 'Sales'], img: 'media/work/agency-pipeline.jpg', show: true,
  },
  {
    name: 'AGIbnb', group: 'product', kind: 'Try it live',
    line: 'A stays and booking platform with an operations app and an owner portal. A full demo: everything stays in your browser.',
    tags: ['Booking', 'Payments flow', 'Owner portal'], url: 'https://agibnb.anchoredgraceinnovation.com', img: 'media/work/agibnb.jpg', show: true,
  },
  {
    name: 'Restaurant POS: live demo', group: 'product', kind: 'Try it live',
    line: 'Sign in as Demo Admin with PIN 111111. Sample data only; nothing you enter leaves your browser.',
    tags: ['POS', 'Demo'], url: 'https://posdemo.anchoredgraceinnovation.com', img: 'media/work/concept-posdemo.jpg', show: true,
  },

  // ---------- Private systems (general names only) ----------
  {
    name: 'Clinic operations system', group: 'system', kind: 'Web app',
    line: 'Point of sale, Face ID clock-in, payroll, patient consent and bookings for an aesthetic clinic.',
    tags: ['Healthcare', 'POS', 'Payroll'], img: 'media/work/clinic-system.jpg', show: true,
  },
  {
    name: 'Household staff app', group: 'system', kind: 'Web app',
    line: 'Daily tasks, time-in, pay and instant phone alerts for a family\'s household team.',
    tags: ['Operations', 'Mobile', 'Payroll'], img: 'media/work/household-app.jpg', show: true,
  },
  {
    name: 'Home health agency suite', group: 'system', kind: 'Web apps',
    line: 'HR, a field-sales CRM with geo check-ins and an executive dashboard for a US care agency.',
    tags: ['Healthcare', 'CRM', 'HR'], img: 'media/work/home-health-suite.jpg', show: true,
  },
  {
    name: 'Restaurant POS and payroll', group: 'system', kind: 'Web app',
    line: 'Orders, inventory, staff and payroll for a 24/7 restaurant, built for the kitchen floor.',
    tags: ['Food & drink', 'POS', 'Payroll'], img: 'media/work/restaurant-pos.jpg', show: true,
  },
  {
    name: 'Retail POS and inventory', group: 'system', kind: 'Web app',
    line: 'Checkout and stock tracking for a specialty grocery in Cebu City.',
    tags: ['Retail', 'POS'], img: 'media/work/retail-pos.jpg', show: true,
  },

  // ---------- Built, not public yet ----------
  // Before showing one: add its url, and only after confirming that address is
  // really our build (on our Cloudflare account or linked from Lee's portfolio).
  { name: 'Bitalyze', group: 'live', kind: 'Website', line: 'App download site.', tags: ['App'], show: false },
  { name: 'Custom Canvas Ph', group: 'live', kind: 'Online shop', line: 'Made-to-order canvases with instant pricing.', tags: ['E-commerce'], show: false },
  { name: 'Rochar Artisan Gelato', group: 'live', kind: 'Website', line: 'A minimalist gelato brand site.', tags: ['Food & drink'], show: false },
  { name: 'KinderWellness', group: 'live', kind: 'Website', line: 'An airway-first dental practice site in Brooklyn.', tags: ['Healthcare', 'USA'], show: false },
];

/* Videos for the "Marketing videos" section. The section stays hidden until
   at least one entry is here. The files live in our own storage, folder reels/
   (see worker/film.mjs): src is the video, poster the still shown before it plays.
   Made by Lee for Seikomods Premium, shown with their brand (Lee, 31 Oct 2026). */
window.AGI_VIDEOS = [
  { title: 'Studio reveal', note: 'Seikomods Premium · product film', src: '/reels/v1/reveal.mp4', poster: '/reels/v1/reveal.jpg' },
  { title: 'Chronograph close-up', note: 'Seikomods Premium · social reel', src: '/reels/v1/chronograph.mp4', poster: '/reels/v1/chronograph.jpg' },
  { title: 'Golden hour drive', note: 'Seikomods Premium · social reel', src: '/reels/v1/golden-hour.mp4', poster: '/reels/v1/golden-hour.jpg' },
  { title: 'Unboxing', note: 'Seikomods Premium · customer-style reel', src: '/reels/v1/unboxing.mp4', poster: '/reels/v1/unboxing.jpg' },
];
