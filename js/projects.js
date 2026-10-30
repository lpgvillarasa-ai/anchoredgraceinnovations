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
     img      a screenshot saved in media/work (1280x800 page, jpg)
     show     false hides it from the site without deleting it

   Rule: a client's name goes up only once their site is public. Private
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
    name: 'KFitness PH', group: 'live', kind: 'Website',
    line: 'A bold site for a 24/7 gym chain across Metro Cebu: branches, plans and sign-ups.',
    tags: ['Fitness', 'Multi-branch'], url: 'https://kfitnessph.lpg-villarasa.workers.dev', img: 'media/work/kfitness.jpg', show: true,
  },
  {
    name: 'Supreme Pickle Court', group: 'live', kind: 'Booking app',
    line: 'Players book court-hours online; the owner runs the courts from one workspace.',
    tags: ['Sports', 'Booking'], url: 'https://supremepicklecourt.lpg-villarasa.workers.dev', img: 'media/work/supreme-pickle.jpg', show: true,
  },
  {
    name: 'Ruje Café', group: 'live', kind: 'Website',
    line: 'A warm, menu-first site for a specialty coffee shop inside a sports venue.',
    tags: ['Food & drink', 'Local'], url: 'https://rujecafeandperiperiboy.lpg-villarasa.workers.dev', img: 'media/work/ruje-cafe.jpg', show: true,
  },

  // ---------- Our own products ----------
  {
    name: 'Stewardly AI', group: 'product', kind: 'AI product',
    line: 'See your household net worth over decades and model the life decisions that shape it.',
    tags: ['AI', 'Finance', 'Mobile'], url: 'https://stewardly.app', img: 'media/work/stewardly.jpg', show: true,
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
    tags: ['AI', 'Voice', 'Productivity'], show: true,
  },

  {
    name: 'Agency sales pipeline', group: 'product', kind: 'Web app',
    line: 'Our own CRM: every client from first call to final payment, with referral commissions.',
    tags: ['CRM', 'Sales'], show: true,
  },
  // ---------- Private systems (general names only) ----------
  {
    name: 'Clinic operations system', group: 'system', kind: 'Web app',
    line: 'Point of sale, Face ID clock-in, payroll, patient consent and bookings for an aesthetic clinic.',
    tags: ['Healthcare', 'POS', 'Payroll'], show: true,
  },
  {
    name: 'Household staff app', group: 'system', kind: 'Web app',
    line: 'Daily tasks, time-in, pay and instant phone alerts for a family\'s household team.',
    tags: ['Operations', 'Mobile', 'Payroll'], show: true,
  },
  {
    name: 'Home health agency suite', group: 'system', kind: 'Web apps',
    line: 'HR, a field-sales CRM with geo check-ins and an executive dashboard for a US care agency.',
    tags: ['Healthcare', 'CRM', 'HR'], show: true,
  },
  {
    name: 'Restaurant POS and payroll', group: 'system', kind: 'Web app',
    line: 'Orders, inventory, staff and payroll for a 24/7 restaurant, built for the kitchen floor.',
    tags: ['Food & drink', 'POS', 'Payroll'], show: true,
  },
  {
    name: 'Retail POS and inventory', group: 'system', kind: 'Web app',
    line: 'Checkout and stock tracking for a specialty grocery in Cebu City.',
    tags: ['Retail', 'POS'], show: true,
  },

  // ---------- Built, not public yet (flip show to true when they launch) ----------
  { name: 'Bitalyze', group: 'live', kind: 'Website', line: 'App download site.', tags: ['App'], url: 'https://bitalyze.com', show: false },
  { name: 'Custom Canvas Ph', group: 'live', kind: 'Online shop', line: 'Made-to-order canvases with instant pricing.', tags: ['E-commerce'], url: 'https://customcanvasph.com', show: false },
  { name: 'Rochar Artisan Gelato', group: 'live', kind: 'Website', line: 'A minimalist gelato brand site.', tags: ['Food & drink'], url: 'https://rochargelato.com', show: false },
  { name: 'KinderWellness', group: 'live', kind: 'Website', line: 'An airway-first dental practice site in Brooklyn.', tags: ['Healthcare', 'USA'], url: 'https://www.kinderwellness.com', show: false },
];

/* Videos for the "Marketing videos" section. The section stays hidden until
   at least one entry is here. src: a file in /media (mp4), poster: a still. */
window.AGI_VIDEOS = [
  // { title: 'Product launch reel', note: 'Made from one product photo', src: 'media/reel-1.mp4', poster: 'media/reel-1.jpg' },
];
