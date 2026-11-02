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
     features 3 to 5 short points shown when the card is opened: only what the
              project really has (checked in its own code), no client data
     connected  optional: how it links to another system we built
     show     false hides it from the site without deleting it

   Rule: only our own work. Every url must be proven ours: a domain on our
   Cloudflare account, or a link on Lee's own portfolio (leevillarasa.xyz).
   Never take an address from a README alone.
   Rule: never show a hosting company's address (workers.dev, vercel.app,
   netlify.app, pages.dev). A site without its own domain gets a subdomain
   of ours instead, e.g. clientname.anchoredgraceinnovation.com (Cloudflare:
   Workers > the site > Settings > Domains > Add custom domain).
   Rule: a client's name goes up only once their site is public and they have
   agreed to be shown; until then, a general name, a blurred preview, no link.
   Rule: we never show real client data. Private systems are described with
   sample data only, never linked or opened, and nothing may say we show them
   with real data (not even on a call).
   ========================================================================== */

window.AGI_PROJECTS = [
  // ---------- Live client sites ----------
  {
    name: 'Skin Delight Cebu', group: 'live', kind: 'Website',
    line: 'A premium site for an aesthetic clinic: full price list, client results and online booking.',
    tags: ['Healthcare', 'Booking', 'Cebu'], url: 'https://skindelightcebu.com', img: 'media/work/skin-delight.jpg', show: true,
    features: ['Full price list for every clinic and salon service', 'Real client results, with posters you tap to enlarge', 'Dedicated pages for the clinic\'s key treatments', 'Messenger, call and get-directions buttons beside a map', 'Clients pick a service, day and free time online'],
    connected: 'The Book online button opens the clinic\'s own booking page, and each request lands in the clinic\'s staff system to confirm.',
  },
  {
    name: 'Coach Jasmin Rough', group: 'live', kind: 'Website',
    line: "A women's fitness coaching site: programs, results and consultation requests.",
    tags: ['Fitness', 'Personal brand'], url: 'https://jasminroughcoaching.com', img: 'media/work/jasmin-rough.jpg', show: true,
    features: ['Her story told in chapters, from first workout to the stage', 'Competition results and coaching certificates on show', 'Free consult request form sent straight to the coach', 'Coaching programs, FAQ and a link-in-bio page'],
  },
  {
    name: 'CK 12th Anniversary', group: 'live', kind: 'Website + app',
    line: "Event website with tickets, door check-in and an admin app for a church's anniversary celebration.",
    tags: ['Events', 'Ticketing', 'Church'], url: 'https://ckworldharvest.org', img: 'media/work/ck12.jpg', show: true,
    features: ['Event countdown, details, history timeline and FAQ', 'Every printed ticket carries its own QR code', 'Guests scan it, register, and save a phone ticket', 'Door scanner by USB or phone camera, works offline', 'Raffle draws only checked-in guests, shown full screen'],
    connected: 'The website, guest ticket pages and the staff app share one live ticket list.',
  },
  {
    // Client name withheld until they agree to be shown (Lee, 31 Oct 2026): general name, blurred preview, no link.
    name: 'Multi-branch gym website', group: 'live', kind: 'Website',
    line: 'A bold site for a 24/7 gym with several branches: locations, membership plans and free-trial sign-ups.',
    tags: ['Fitness', 'Multi-branch'], img: 'media/work/fitness-site.jpg', show: true,
    features: ['A page for every branch, with a branch picker', 'Membership plans, day passes and walk-in rates', 'Free-trial sign-up that asks for branch and goal', 'Floating Messenger, call and book button on every page', 'Training, recovery suite and community sections, plus FAQ'],
  },
  {
    // Client name withheld until they agree to be shown (Lee, 31 Oct 2026): general name, blurred preview, no link.
    name: 'Sports court booking app', group: 'live', kind: 'Booking app',
    line: 'Players book court time online; the owner runs every court from one workspace.',
    tags: ['Sports', 'Booking'], img: 'media/work/court-booking.jpg', show: true,
    features: ['Players pick a court, a day and the hours they want', 'Hours held 15 minutes while players send payment proof', 'Owner confirms payments, checks players in, blocks courts', 'Open-play sessions with player rosters', 'Sales reports, busiest-times heat map and front-desk logins'],
  },
  {
    name: 'Ruje Café', group: 'live', kind: 'Website',
    line: 'A warm, menu-first site for a specialty coffee shop inside a sports venue.',
    tags: ['Food & drink', 'Local'], url: 'https://rujecafe.anchoredgraceinnovation.com', img: 'media/work/ruje-cafe.jpg', show: true,
    features: ['Menu-first layout, drinks and food grouped by type', 'Pre-order for pickup: choose items, pickup time and cup name', 'Order copied and Messenger opened, ready to send', 'Find-us map with directions and a one-tap plus code', 'Phone-friendly, with a sticky Pre-order button'],
    connected: 'The same menu runs the café\'s counter register and stock app.',
  },

  // ---------- Our own products ----------
  {
    name: 'Stewardly AI', group: 'product', kind: 'AI product',
    line: 'Its AI reads your bills, loans and subscriptions in seconds, then reminds you before anything is due.',
    tags: ['AI', 'Finance', 'Mobile'], url: 'https://stewardlyai.com', img: 'media/work/stewardly.jpg', show: true,
    features: ['Snap a bill or loan, and AI fills in the details', 'Phone reminders days before each due date', 'Calendar and dashboard of everything due or overdue', 'Ask the AI about your money, by typing or voice', 'Spending, savings goals and debt payoff in one place'],
    connected: 'A marketing website with an early-access waitlist.',
  },
  {
    name: 'FaithFlow AI', group: 'product', kind: 'AI product',
    line: 'A biblical wisdom companion: ask a real-life question, get scripture-grounded guidance.',
    tags: ['AI', 'Faith'], url: 'https://faithflowai.com', img: 'media/work/faithflow.jpg', show: true,
    features: ['Ask a real-life question, get Bible-based guidance', 'Share a struggle and receive a written prayer', 'A verse of the day with a short reflection', 'Full Bible reader with saved highlights', 'Reading streaks, plus prayer requests sent to the prayer team'],
  },
  {
    name: 'Lee & Kyarah', group: 'product', kind: 'Website',
    line: 'Our own wedding website: story, schedule, RSVP and guest details in one place.',
    tags: ['Events', 'Design'], url: 'https://leeandkyarah.com', img: 'media/work/lee-kyarah.jpg', show: true,
    features: ['Our story, the day\'s schedule and venue details', 'RSVP with a private invite code and a note', 'Guests find their table by name on a floor plan', 'Prenup gallery, wedding-day photos and same-day video', 'Live countdown and background music'],
  },
  {
    name: 'Donna', group: 'product', kind: 'AI assistant',
    line: 'A voice-first AI executive assistant that keeps the calendar, the notes and the open loops.',
    tags: ['AI', 'Voice', 'Productivity'], img: 'media/work/donna.jpg', show: true,
    features: ['Say "Hey Donna" or tap to talk, she answers aloud', 'Keeps her own calendar: adds, moves and cancels events', 'Remembers decisions, people and daily notes between chats', 'Works from a phone, even through smart glasses', 'Drafts website changes for approval before anything goes live'],
  },

  {
    name: 'Agency sales pipeline', group: 'product', kind: 'Web app',
    line: 'Our own CRM: every client from first call to final payment, with referral commissions.',
    tags: ['CRM', 'Sales'], img: 'media/work/agency-pipeline.jpg', show: true,
    features: ['Every deal on one board, from first call to signed', 'Today screen shows what needs attention first', 'Installment plans, numbered bills and payments with photo proof', 'Clients get a private link to send payment proof', 'Agents and referral partners see only their own deals and commission'],
  },
  {
    name: 'AGIbnb', group: 'product', kind: 'Try it live',
    line: 'A stays and booking platform with an operations app and an owner portal. A full demo: everything stays in your browser.',
    tags: ['Booking', 'Payments flow', 'Owner portal'], url: 'https://agibnb.anchoredgraceinnovation.com', img: 'media/work/agibnb.jpg', show: true,
    features: ['Book stays nightly or monthly with an itemized quote', 'Guests upload a GCash, Maya or bank receipt to verify', 'Video walkthroughs and 360-degree tours of each home', 'Book viewings or send offers on homes for lease or sale', 'Concierge chat that answers guest questions'],
    connected: 'The guest website, the operations app (payments, housekeeping, drivers, owner statements) and the owner portal share the same bookings.',
  },
  {
    name: 'Restaurant POS: live demo', group: 'product', kind: 'Try it live',
    line: 'Sign in as Demo Admin with PIN 111111. Sample data only; nothing you enter leaves your browser.',
    tags: ['POS', 'Demo'], url: 'https://posdemo.anchoredgraceinnovation.com', img: 'media/work/concept-posdemo.jpg', show: true,
    features: ['Tables, timed rooms, takeout and delivery tickets', 'Kitchen display updates as orders come in', 'Stock deducts itself from each dish\'s recipe', 'Senior, PWD and employee discounts, plus service charge', 'Sales reports and staff PIN sign-in by role'],
  },

  // ---------- Private systems (general names only) ----------
  {
    name: 'Clinic operations system', group: 'system', kind: 'Web app',
    line: 'Point of sale, Face ID clock-in, payroll, patient consent and bookings for an aesthetic clinic.',
    tags: ['Healthcare', 'POS', 'Payroll'], img: 'media/work/clinic-system.jpg', show: true,
    features: ['Point of sale with pay-later bills and staff commissions', 'Staff clock in with their PIN, then Face ID', 'Payroll: payslips from days worked plus commissions', 'Patients sign consent and treatment forms on the tablet', 'Booking calendar by day, week or month'],
    connected: 'Online booking requests from the clinic\'s public website land here for staff to confirm.',
  },
  {
    name: 'Household staff app', group: 'system', kind: 'Web app',
    line: 'Daily tasks, time-in, pay and instant phone alerts for a family\'s household team.',
    tags: ['Operations', 'Mobile', 'Payroll'], img: 'media/work/household-app.jpg', show: true,
    features: ['Daily and repeating task lists by house, room and person', '"Need you now" button rings phones until someone answers', 'Staff time in on the app\'s own clock, and request leave', 'Pay, cash advances and payslips each person can check', 'Group chat and photos showing how each job should look'],
  },
  {
    name: 'Home health agency suite', group: 'system', kind: 'Web apps',
    line: 'HR, a field-sales CRM with geo check-ins and an executive dashboard for a US care agency.',
    tags: ['Healthcare', 'CRM', 'HR'], img: 'media/work/home-health-suite.jpg', show: true,
    features: ['HR records, time clock, leave and staff documents', 'Flags staff credentials the morning after they expire', 'Field visits checked by phone location, flagged if off site', 'Sales routes, leads pipeline and expenses with receipts', 'Executive dashboard that answers questions from live records'],
    connected: 'HR, sales and executive apps share one database, and each person sees only what their role allows.',
  },
  {
    name: 'Restaurant POS and kitchen system', group: 'system', kind: 'Web app',
    line: 'Orders, kitchen display, stock and sales reports for a 24/7 restaurant, built for the kitchen floor.',
    tags: ['Food & drink', 'POS', 'Inventory'], img: 'media/work/restaurant-pos.jpg', show: true,
    features: ['Tickets for rooms, tables, takeout and delivery', 'Move an open ticket to another table or room', 'Kitchen display and printed kitchen slips', 'Stock deducts itself as dishes are ordered', 'Sales reports by day, week, month or any dates'],
  },
  {
    name: 'Retail POS and inventory', group: 'system', kind: 'Web app',
    line: 'Checkout and stock tracking for a specialty grocery.',
    tags: ['Retail', 'POS'], img: 'media/work/retail-pos.jpg', show: true,
    features: ['Barcode-scanner checkout with printed receipts', 'Returns and voids need a reason and a manager PIN', 'Stock received from suppliers, with expiry dates', 'End-of-shift cash count that checks the drawer', 'Profit, VAT and stock value reports'],
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
