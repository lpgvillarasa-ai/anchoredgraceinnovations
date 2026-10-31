// The approved price book (Draft 2, approved by Lee on 30 Oct 2026).
// The AI assistant never states a price itself: it picks items from this list,
// and estimate() below does all the math. Change a price here, nowhere else.
//
// php / usd: [low, high]. A missing currency means "not offered in that market".
// 'call' means offered there, with the price confirmed on a discovery call.
// billing: 'once' (one-time project), 'month' (every month), 'each' (per unit).

export const PRICE_BOOK_VERSION = '2026-10-31 draft 5 (approved)';

export const ITEMS = {
  // ----- Build -----
  landing_page: { group: 'Build', label: 'One-page landing page', billing: 'once', php: [15000, 30000], usd: [1200, 2500], weeks: '1-2' },
  business_website: { group: 'Build', label: 'Business website (5 to 10 pages)', billing: 'once', php: [60000, 120000], usd: [4000, 9000], weeks: '3-6' },
  premium_website: { group: 'Build', label: 'Premium / animated website', billing: 'once', php: [150000, 300000], usd: [10000, 25000], weeks: '6-12' },
  booking_website: { group: 'Build', label: 'Website with online booking', billing: 'once', php: [80000, 180000], usd: [5000, 12000], weeks: '4-8' },
  online_shop: { group: 'Build', label: 'Online shop (e-commerce)', billing: 'once', php: [100000, 220000], usd: [6000, 15000], weeks: '4-10' },
  booking_system: { group: 'Build', label: 'Custom booking system', billing: 'once', php: [150000, 350000], usd: [8000, 20000], weeks: '6-10', system: true },
  pos_inventory: { group: 'Build', label: 'POS and inventory system', billing: 'once', php: [200000, 450000], usd: [12000, 30000], weeks: '8-12', system: true },
  hr_payroll: { group: 'Build', label: 'HR, attendance and payroll system', billing: 'once', php: [250000, 600000], usd: [15000, 35000], weeks: '10-14', system: true },
  crm: { group: 'Build', label: 'CRM (client and sales tracker)', billing: 'once', php: [150000, 400000], usd: [10000, 25000], weeks: '6-12', system: true },
  client_portal: { group: 'Build', label: 'Client portal', billing: 'once', php: [150000, 400000], usd: [10000, 25000], weeks: '8-12', system: true },
  dashboard: { group: 'Build', label: 'Dashboard and reports', billing: 'once', php: [80000, 250000], usd: [6000, 18000], weeks: '3-8', system: true },
  multi_module_system: { group: 'Build', label: 'Multi-module business system', billing: 'once', php: [700000, 1500000], usd: [35000, 80000], weeks: '16-26', system: true },

  // ----- Automate -----
  ai_chat_assistant_setup: { group: 'Automate', label: 'AI chat assistant for your website (setup)', billing: 'once', php: [20000, 45000], usd: [1000, 3500], weeks: '1-3' },
  ai_chat_assistant_monthly: { group: 'Automate', label: 'AI chat assistant (monthly running and care)', billing: 'month', php: [3000, 7000], usd: [150, 400] },
  ai_feature: { group: 'Automate', label: 'AI added to an existing system (one feature)', billing: 'once', php: [80000, 250000], usd: [5000, 15000], weeks: '2-6' },
  automation_single: { group: 'Automate', label: 'Workflow automation (single workflow)', billing: 'once', php: [15000, 35000], usd: [600, 1500], weeks: '0.5-2' },
  automation_bundle: { group: 'Automate', label: 'Workflow automation bundle (3 to 5 linked workflows)', billing: 'once', php: [60000, 150000], usd: [2500, 6000], weeks: '2-4' },
  automation_care: { group: 'Automate', label: 'Automation care', billing: 'month', php: [3000, 8000], usd: [150, 400] },
  voice_agent_setup: { group: 'Automate', label: 'Voice / phone AI agent (setup)', billing: 'once', php: [80000, 180000], usd: [3000, 7000], weeks: '2-4' },
  voice_agent_monthly: { group: 'Automate', label: 'Voice / phone AI agent (monthly, plus call minutes)', billing: 'month', php: [8000, 18000], usd: [250, 600] },
  ai_training_half_day: { group: 'Automate', label: 'AI staff training, half day', billing: 'once', php: [30000, 60000], usd: [1500, 3000] },
  ai_training_full_day: { group: 'Automate', label: 'AI staff training, full day', billing: 'once', php: [60000, 120000], usd: [3000, 6000] },

  // ----- Staff (full time, priced in steps by role, Lee 2026-10-31) -----
  // Overseas: from $1,499, working the client's hours (every role up $300, Lee
  // 2026-10-31). Philippines: Philippine daytime hours, price confirmed on a call.
  staff_virtual_assistant: { group: 'Staff', label: 'AI-native virtual assistant (full time)', billing: 'month', php: 'call', usd: [1699, 2199] },
  staff_executive_assistant: { group: 'Staff', label: 'Executive assistant (full time)', billing: 'month', php: 'call', usd: [2099, 2699] },
  staff_bookkeeper: { group: 'Staff', label: 'Bookkeeper (full time)', billing: 'month', php: 'call', usd: [1799, 2399] },
  staff_admin: { group: 'Staff', label: 'Admin / back-office assistant (full time)', billing: 'month', php: 'call', usd: [1599, 1999] },
  staff_data_entry: { group: 'Staff', label: 'Data entry and research assistant (full time)', billing: 'month', php: 'call', usd: [1499, 1799] },
  staff_customer_support: { group: 'Staff', label: 'Customer support assistant (full time)', billing: 'month', php: 'call', usd: [1599, 2099] },

  // ----- Video -----
  video_product_reel: { group: 'Video', label: 'AI product reel from one photo (10 to 30 seconds)', billing: 'each', php: [1500, 4000], usd: [60, 150] },
  video_edited: { group: 'Video', label: 'Edited marketing video (30 to 90 seconds)', billing: 'each', php: [4000, 10000], usd: [150, 400] },
  video_pack_4: { group: 'Video', label: 'Monthly video package, 4 videos', billing: 'month', php: [7000, 15000], usd: [300, 600] },
  video_pack_8: { group: 'Video', label: 'Monthly video package, 8 videos', billing: 'month', php: [13000, 26000], usd: [550, 1100] },
  video_pack_12: { group: 'Video', label: 'Monthly video package, 12 videos', billing: 'month', php: [18000, 35000], usd: [750, 1500] },

  // ----- Care (after a build) -----
  website_care_basic: { group: 'Care', label: 'Website care, basic', billing: 'month', php: [2500, 5000], usd: [75, 150] },
  website_care_plus: { group: 'Care', label: 'Website care plus', billing: 'month', php: [6000, 12000], usd: [200, 400] },
  shop_care: { group: 'Care', label: 'Online shop care', billing: 'month', php: [10000, 25000], usd: [300, 700] },
  system_care: { group: 'Care', label: 'System care for a custom web app (1.25% to 1.75% of the build price a month)', billing: 'month', percentOfSystems: [0.0125, 0.0175], minimum: { php: 8000, usd: 400 } },
};

export const ITEM_IDS = Object.keys(ITEMS);
export const REGIONS = ['philippines', 'united_states', 'other_international'];

const MAX_QUANTITY = 50;

function money(n, currency) {
  return (currency === 'PHP' ? '₱' : '$') + Math.round(n).toLocaleString('en-US');
}

// Percentage-based prices are rounded to a tidy figure (₱500 or $50).
function tidy(n, currency) {
  return currency === 'PHP' ? Math.round(n / 500) * 500 : Math.round(n / 50) * 50;
}

// Works out an estimate from item ids. Returns { ok: false, problems } when the
// request breaks a price-book rule, so the assistant can correct itself.
export function estimate({ client_region, items }) {
  const problems = [];
  if (!REGIONS.includes(client_region)) problems.push(`Unknown client_region "${client_region}".`);
  if (!Array.isArray(items) || items.length === 0) problems.push('Pick at least one item.');
  if (problems.length) return { ok: false, problems };

  const currency = client_region === 'philippines' ? 'PHP' : 'USD';
  const key = currency === 'PHP' ? 'php' : 'usd';
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
    if (!range) { problems.push(`"${item.label}" is not offered in ${currency}.`); continue; }
    if (range === 'call') {
      lines.push({ item_id: id, label: item.label, billing: 'call', low: null, high: null, range: 'Price confirmed on a free discovery call', weeks: item.weeks || null });
      continue;
    }
    const qty = item.billing === 'each' ? Math.min(Math.max(parseInt(raw.quantity, 10) || 1, 1), MAX_QUANTITY) : 1;
    const low = range[0] * qty, high = range[1] * qty;
    if (item.billing === 'month') { monthLow += low; monthHigh += high; }
    else { onceLow += low; onceHigh += high; }
    if (item.system) { systemLow += low; systemHigh += high; }
    lines.push({ item_id: id, label: qty > 1 ? `${item.label} × ${qty}` : item.label, billing: item.billing === 'month' ? 'month' : 'once', low, high, range: `${money(low, currency)} to ${money(high, currency)}`, weeks: item.weeks || null });
  }

  if (wantsSystemCare) {
    if (systemHigh === 0) {
      problems.push('System care is priced from a custom system build in the same estimate. Add the system, or use website care instead.');
    } else {
      const care = ITEMS.system_care;
      const min = care.minimum[key];
      const low = Math.max(tidy(systemLow * care.percentOfSystems[0], currency), min);
      const high = Math.max(tidy(systemHigh * care.percentOfSystems[1], currency), min);
      monthLow += low; monthHigh += high;
      lines.push({ item_id: 'system_care', label: care.label, billing: 'month', low, high, range: `${money(low, currency)} to ${money(high, currency)}`, weeks: null });
    }
  }

  if (!lines.length) return { ok: false, problems: problems.length ? problems : ['Nothing to price.'] };
  return {
    ok: true,
    currency,
    lines,
    one_time: onceHigh ? `${money(onceLow, currency)} to ${money(onceHigh, currency)}` : null,
    monthly: monthHigh ? `${money(monthLow, currency)} to ${money(monthHigh, currency)} a month` : null,
    notes: [
      'Final price is confirmed after a free discovery call.',
      'Third-party costs (hosting, domains, app subscriptions, AI usage, payment fees) are separate.',
      ...(currency === 'PHP' ? ['Prices exclude VAT.'] : []),
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
