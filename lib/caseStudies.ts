// The three client case studies at /work/<slug>. Names, summaries, tags and links
// are the ones already published on the homepage. Everything in [brackets] is a
// placeholder for Lee to write: no results or quotes are made up here.
export type CaseStudy = {
  slug: string;
  name: string;
  kind: string;
  line: string;
  tags: string[];
  url: string;
  img: string;
  alt: string;
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'skin-delight-cebu', name: 'Skin Delight Cebu', kind: 'Website',
    line: 'A premium site for an aesthetic clinic: full price list, client results and online booking.',
    tags: ['Healthcare', 'Booking', 'Cebu'], url: 'https://skindelightcebu.com', img: '/media/work/skin-delight.jpg',
    alt: 'The Skin Delight Cebu website homepage',
  },
  {
    slug: 'coach-jasmin-rough', name: 'Coach Jasmin Rough', kind: 'Website',
    line: "A women's fitness coaching site: programs, results and consultation requests.",
    tags: ['Fitness', 'Personal brand'], url: 'https://jasminroughcoaching.com', img: '/media/work/jasmin-rough.jpg',
    alt: 'The Coach Jasmin Rough website homepage',
  },
  {
    slug: 'ck-12th-anniversary', name: 'CK 12th Anniversary', kind: 'Website + app',
    line: "Event website with tickets, door check-in and an admin app for a church's anniversary celebration.",
    tags: ['Events', 'Ticketing', 'Church'], url: 'https://ckworldharvest.org', img: '/media/work/ck12.jpg',
    alt: 'The CK 12th Anniversary event website',
  },
];
