// The three client case studies at /work/<slug>. Names, summaries, tags and links
// are the ones already published on the homepage. The story text was written on
// 2026-11-02 from each project's own code and live site: no results, numbers or
// quotes are made up, and no client data is shown.
export type CaseStudy = {
  slug: string;
  name: string;
  kind: string;
  line: string;
  tags: string[];
  url: string;
  img: string;
  alt: string;
  problem: string;
  built: string[];
  today: string;
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'skin-delight-cebu', name: 'Skin Delight Cebu', kind: 'Website',
    line: 'A premium site for an aesthetic clinic: full price list, client results and online booking.',
    tags: ['Healthcare', 'Booking', 'Cebu'], url: 'https://skindelightcebu.com', img: '/media/work/skin-delight.jpg',
    alt: 'The Skin Delight Cebu website homepage',
    problem: 'Skin Delight Cebu runs an aesthetic clinic and a salon under one roof in Cordova, Cebu. They needed a website that felt as premium as their treatments, showed every service and price up front, and let clients ask for an appointment at any hour, not only by sending a message.',
    built: [
      'A full price list for every clinic and salon service, grouped so clients find a treatment fast',
      'Real client results, shared with the clients\' consent, as posters you tap to enlarge',
      'Dedicated pages for the clinic\'s key treatments',
      '"Book online" buttons that open the clinic\'s own booking page, where clients pick a service, a day and a free time',
      'Messenger, call and get-directions buttons beside a map',
    ],
    today: 'The site is live at skindelightcebu.com. Clients browse the prices and results, then message the clinic or send a booking request for a free time. Each request lands in the clinic\'s staff system, where the team confirms it.',
  },
  {
    slug: 'coach-jasmin-rough', name: 'Coach Jasmin Rough', kind: 'Website',
    line: "A women's fitness coaching site: programs, results and consultation requests.",
    tags: ['Fitness', 'Personal brand'], url: 'https://jasminroughcoaching.com', img: '/media/work/jasmin-rough.jpg',
    alt: 'The Coach Jasmin Rough website homepage',
    problem: 'Coach Jasmin is a women\'s fitness coach in Lapu-Lapu City, Cebu, and a natural bodybuilding competitor. She needed one place that tells her story, shows her credentials, and turns a curious visitor into a booked free consult.',
    built: [
      'Her story told in chapters, from her first workout to the competition stage',
      'Competition results and coaching certificates on show',
      'A coaching page with 8, 12 and 24-session packages, plus an FAQ for first-timers and busy moms',
      'A request form for a free consult or a free session for Gems Fitness members, sent straight to the coach by email',
      'A link-in-bio page that gives her social profiles one link to share',
    ],
    today: 'The site is live at jasminroughcoaching.com. Visitors read her story, check the coaching options and send a request. Coach Jasmin gets it by email and calls or texts back to set a time.',
  },
  {
    slug: 'ck-12th-anniversary', name: 'CK 12th Anniversary', kind: 'Website + app',
    line: "Event website with tickets, door check-in and an admin app for a church's anniversary celebration.",
    tags: ['Events', 'Ticketing', 'Church'], url: 'https://ckworldharvest.org', img: '/media/work/ck12.jpg',
    alt: 'The CK 12th Anniversary event website',
    problem: 'Covenant Keepers Movement is celebrating its 12th anniversary with a large event in December 2026. They needed printed tickets that nobody could copy or claim for someone else, a fast way to check guests in at the door, and a fair raffle among the people who actually came.',
    built: [
      'An event website with a countdown, event details, the movement\'s history and an FAQ',
      'A unique QR code on every printed ticket, with a hidden security code so a ticket cannot be claimed by typing someone else\'s number',
      'A guest page where ticket holders register and save a digital ticket on their phone',
      'A staff app with a printer export, a dashboard and a door scanner that works with a USB scanner or a phone camera, and keeps working if the internet drops',
      'A raffle that draws only from checked-in guests, never picks the same person twice, and runs full screen on the projector',
    ],
    today: 'The website is live at ckworldharvest.org, and ticket holders register on it ahead of the celebration. On the day, the door team checks guests in with the scanner, and the raffle draws from the same live ticket list.',
  },
];
