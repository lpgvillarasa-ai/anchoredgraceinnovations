// The approved price book (Draft 2, approved by Lee on 30 Oct 2026).
// The AI assistant never states a price itself: it picks items from this list,
// and estimate() below does all the math. Change a price here, nowhere else.
//
// ph / usd: [low, high] in US dollars. `ph` is for businesses in the Philippines,
// `usd` for everyone else. Every price is in dollars (Lee 2026-11-02); the `ph`
// prices are the approved peso prices converted at about ₱60 per $1 and rounded
// (to $50 from $500 up, to $25 below). A missing market means "not offered
// there".
//
// The `usd` (overseas) prices follow what experienced, top-rated freelancers and
// small offshore agencies charge on Upwork and Fiverr and in published 2025-2026
// cost guides (Lee 2026-11-02: "a website is around $1,500 on the market"); a
// business website now starts at $1,500. Staffing prices are Lee's own and are
// not part of that check.
// billing: 'once' (one-time project), 'month' (every month), 'each' (per unit).

export const PRICE_BOOK_VERSION = '2026-11-02 draft 8 (overseas prices set to the freelance market)';

export const ITEMS = {
  // ----- Build -----
  // Philippine website prices set to the Cebu market (Lee 2026-10-31): a business
  // website from ₱35,000 (now $600), and a landing page always below that.
  landing_page: { group: 'Build', label: 'One-page landing page', billing: 'once', ph: [250, 425], usd: [500, 1200], weeks: '1-2' },
  business_website: { group: 'Build', label: 'Business website (5 to 10 pages)', billing: 'once', ph: [600, 1500], usd: [1500, 4000], weeks: '3-6' },
  premium_website: { group: 'Build', label: 'Premium / animated website', billing: 'once', ph: [2500, 5000], usd: [5000, 12000], weeks: '6-12' },
  booking_website: { group: 'Build', label: 'Website with online booking', billing: 'once', ph: [1350, 3000], usd: [2000, 5000], weeks: '4-8' },
  online_shop: { group: 'Build', label: 'Online shop (e-commerce)', billing: 'once', ph: [1650, 3650], usd: [3000, 8000], weeks: '4-10' },
  booking_system: { group: 'Build', label: 'Custom booking system', billing: 'once', ph: [2500, 5850], usd: [8000, 16000], weeks: '6-10', system: true },
  pos_inventory: { group: 'Build', label: 'POS and inventory system', billing: 'once', ph: [3350, 7500], usd: [12000, 25000], weeks: '8-12', system: true },
  hr_payroll: { group: 'Build', label: 'HR, attendance and payroll system', billing: 'once', ph: [4150, 10000], usd: [15000, 30000], weeks: '10-14', system: true },
  crm: { group: 'Build', label: 'CRM (client and sales tracker)', billing: 'once', ph: [2500, 6650], usd: [10000, 20000], weeks: '6-12', system: true },
  client_portal: { group: 'Build', label: 'Client portal', billing: 'once', ph: [2500, 6650], usd: [10000, 20000], weeks: '8-12', system: true },
  dashboard: { group: 'Build', label: 'Dashboard and reports', billing: 'once', ph: [1350, 4150], usd: [5000, 12000], weeks: '3-8', system: true },
  multi_module_system: { group: 'Build', label: 'Multi-module business system', billing: 'once', ph: [11650, 25000], usd: [30000, 70000], weeks: '16-26', system: true },

  // ----- Automate -----
  ai_chat_assistant_setup: { group: 'Automate', label: 'AI chat assistant for your website (setup)', billing: 'once', ph: [325, 750], usd: [750, 2500], weeks: '1-3' },
  ai_chat_assistant_monthly: { group: 'Automate', label: 'AI chat assistant (monthly running and care)', billing: 'month', ph: [50, 125], usd: [100, 300] },
  ai_feature: { group: 'Automate', label: 'AI added to an existing system (one feature)', billing: 'once', ph: [1350, 4150], usd: [2500, 8000], weeks: '2-6' },
  automation_single: { group: 'Automate', label: 'Workflow automation (single workflow)', billing: 'once', ph: [250, 600], usd: [400, 1200], weeks: '0.5-2' },
  automation_bundle: { group: 'Automate', label: 'Workflow automation bundle (3 to 5 linked workflows)', billing: 'once', ph: [1000, 2500], usd: [1500, 4500], weeks: '2-4' },
  automation_care: { group: 'Automate', label: 'Automation care', billing: 'month', ph: [50, 125], usd: [150, 400] },
  voice_agent_setup: { group: 'Automate', label: 'Voice / phone AI agent (setup)', billing: 'once', ph: [1350, 3000], usd: [1500, 5000], weeks: '2-4' },
  voice_agent_monthly: { group: 'Automate', label: 'Voice / phone AI agent (monthly, plus call minutes)', billing: 'month', ph: [125, 300], usd: [200, 500] },
  ai_training_half_day: { group: 'Automate', label: 'AI staff training, half day', billing: 'once', ph: [500, 1000], usd: [750, 1500] },
  ai_training_full_day: { group: 'Automate', label: 'AI staff training, full day', billing: 'once', ph: [1000, 2000], usd: [1500, 3000] },

  // ----- Staff (full time, priced in steps by role, Lee 2026-10-31) -----
  // Overseas only: from $1,499, working the client's hours (Lee 2026-10-31).
  // Not offered to businesses in the Philippines (Lee 2026-11-02). Tops lowered
  // to what managed Philippine staffing agencies charge, starts kept (Lee 2026-11-02).
  staff_virtual_assistant: { group: 'Staff', label: 'AI-native virtual assistant (full time)', billing: 'month', usd: [1699, 1999] },
  staff_executive_assistant: { group: 'Staff', label: 'Executive assistant (full time)', billing: 'month', usd: [2099, 2499] },
  staff_bookkeeper: { group: 'Staff', label: 'Bookkeeper (full time)', billing: 'month', usd: [1799, 2299] },
  staff_admin: { group: 'Staff', label: 'Admin / back-office assistant (full time)', billing: 'month', usd: [1599, 1899] },
  staff_data_entry: { group: 'Staff', label: 'Data entry and research assistant (full time)', billing: 'month', usd: [1499, 1699] },
  staff_customer_support: { group: 'Staff', label: 'Customer support assistant (full time)', billing: 'month', usd: [1599, 1899] },

  // ----- Video -----
  video_product_reel: { group: 'Video', label: 'AI product reel from one photo (10 to 30 seconds)', billing: 'each', ph: [25, 75], usd: [60, 150] },
  video_edited: { group: 'Video', label: 'Edited marketing video (30 to 90 seconds)', billing: 'each', ph: [75, 175], usd: [150, 350] },
  video_pack_4: { group: 'Video', label: 'Monthly video package, 4 videos', billing: 'month', ph: [125, 250], usd: [300, 550] },
  video_pack_8: { group: 'Video', label: 'Monthly video package, 8 videos', billing: 'month', ph: [225, 425], usd: [500, 1000] },
  video_pack_12: { group: 'Video', label: 'Monthly video package, 12 videos', billing: 'month', ph: [300, 600], usd: [700, 1400] },

  // ----- Care (after a build) -----
  website_care_basic: { group: 'Care', label: 'Website care, basic', billing: 'month', ph: [50, 75], usd: [75, 150] },
  website_care_plus: { group: 'Care', label: 'Website care plus', billing: 'month', ph: [100, 200], usd: [150, 300] },
  shop_care: { group: 'Care', label: 'Online shop care', billing: 'month', ph: [175, 425], usd: [200, 500] },
  system_care: { group: 'Care', label: 'System care for a custom web app (a share of the build price each month)', billing: 'month', percentOfSystems: { ph: [0.0125, 0.0175], usd: [0.0125, 0.015] }, minimum: { ph: 125, usd: 300 } },
};

export const ITEM_IDS = Object.keys(ITEMS);
export const REGIONS = ['philippines', 'united_states', 'other_international'];

const MAX_QUANTITY = 50;

function money(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

// Percentage-based prices are rounded to a tidy figure ($25 for Philippine
// prices, $50 for the rest).
function tidy(n, key) {
  return key === 'ph' ? Math.round(n / 25) * 25 : Math.round(n / 50) * 50;
}

// Works out an estimate from item ids. Returns { ok: false, problems } when the
// request breaks a price-book rule, so the assistant can correct itself.
export function estimate({ client_region, items }) {
  const problems = [];
  if (!REGIONS.includes(client_region)) problems.push(`Unknown client_region "${client_region}".`);
  if (!Array.isArray(items) || items.length === 0) problems.push('Pick at least one item.');
  if (problems.length) return { ok: false, problems };

  const currency = 'USD';
  const key = client_region === 'philippines' ? 'ph' : 'usd';
  const lines = [];
  const seen = new Set();
  let onceLow = 0, onceHigh = 0, monthLow = 0, monthHigh = 0, systemLow = 0, systemHigh = 0;
  let wantsSystemCare = false;

  for (const raw of items.slice(0, 20)) {
    const id = raw && raw.item_id;
    const item = ITEMS[id];
    if (!item) { problems.push(`Unknown item "${id}".`); continue; }
    if (seen.has(id)) continue;
    seen.add(id);
    if (id === 'system_care') { wantsSystemCare = true; continue; }
    const range = item[key];
    if (!range) { problems.push(`"${item.label}" is not offered ${key === 'ph' ? 'in the Philippines' : 'outside the Philippines'}.`); continue; }
    const qty = item.billing === 'each' ? Math.min(Math.max(parseInt(raw.quantity, 10) || 1, 1), MAX_QUANTITY) : 1;
    const low = range[0] * qty, high = range[1] * qty;
    if (item.billing === 'month') { monthLow += low; monthHigh += high; }
    else { onceLow += low; onceHigh += high; }
    if (item.system) { systemLow += low; systemHigh += high; }
    lines.push({ item_id: id, label: qty > 1 ? `${item.label} × ${qty}` : item.label, billing: item.billing === 'month' ? 'month' : 'once', low, high, range: `${money(low)} to ${money(high)}`, weeks: item.weeks || null });
  }

  if (wantsSystemCare) {
    if (systemHigh === 0) {
      problems.push('System care is priced from a custom system build in the same estimate. Add the system, or use website care instead.');
    } else {
      const care = ITEMS.system_care;
      const min = care.minimum[key];
      const low = Math.max(tidy(systemLow * care.percentOfSystems[key][0], key), min);
      const high = Math.max(tidy(systemHigh * care.percentOfSystems[key][1], key), min);
      monthLow += low; monthHigh += high;
      lines.push({ item_id: 'system_care', label: care.label, billing: 'month', low, high, range: `${money(low)} to ${money(high)}`, weeks: null });
    }
  }

  if (!lines.length) return { ok: false, problems: problems.length ? problems : ['Nothing to price.'] };
  return {
    ok: true,
    currency,
    lines,
    one_time: onceHigh ? `${money(onceLow)} to ${money(onceHigh)}` : null,
    monthly: monthHigh ? `${money(monthLow)} to ${money(monthHigh)} a month` : null,
    notes: [
      'Final price is confirmed after a free discovery call.',
      'Third-party costs (hosting, domains, app subscriptions, AI usage, payment fees) are separate.',
      ...(key === 'ph' ? ['Prices exclude VAT.'] : []),
    ],
    problems,
    price_book: PRICE_BOOK_VERSION,
  };
}

// One line per item for the assistant's instructions: what it is, never what it costs.
export function catalogText() {
  const groups = {};
  for (const [id, it] of Object.entries(ITEMS)) {
    (groups[it.group] ||= []).push(`- ${id}: ${it.label}${it.billing === 'month' ? ' [monthly]' : it.billing === 'each' ? ' [per video, use quantity]' : ''}`);
  }
  return Object.entries(groups).map(([g, lines]) => `${g}:\n${lines.join('\n')}`).join('\n\n');
}
