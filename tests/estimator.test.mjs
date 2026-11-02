// Checks the estimate assistant's rules without calling the real AI.
// Run: npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import { estimate, ITEMS } from '../worker/pricebook.mjs';
import { runTurn, limitsFrom } from '../worker/estimator.mjs';
import { SYSTEM_PROMPT, ESTIMATE_TOOL } from '../worker/prompt.mjs';

test('Philippine website is priced in dollars straight from the price book', () => {
  const e = estimate({ client_region: 'philippines', items: [{ item_id: 'business_website', quantity: 1 }] });
  assert.equal(e.ok, true);
  assert.equal(e.currency, 'USD');
  assert.equal(e.one_time, '$600 to $1,500');
  assert.equal(e.monthly, null);
  assert.ok(e.notes.some((n) => n.includes('VAT')));
});

test('US client gets dollars, and one-time and monthly are kept apart', () => {
  const site = estimate({ client_region: 'united_states', items: [{ item_id: 'business_website', quantity: 1 }] });
  assert.equal(site.one_time, '$1,500 to $4,000');
  const e = estimate({ client_region: 'united_states', items: [
    { item_id: 'booking_website', quantity: 1 },
    { item_id: 'website_care_plus', quantity: 1 },
  ] });
  assert.equal(e.currency, 'USD');
  assert.equal(e.one_time, '$2,000 to $5,000');
  assert.equal(e.monthly, '$150 to $300 a month');
});

test('staffing is offered overseas only, in dollars', () => {
  const ph = estimate({ client_region: 'philippines', items: [{ item_id: 'staff_virtual_assistant', quantity: 1 }] });
  assert.equal(ph.ok, false);
  assert.match(ph.problems.join(' '), /not offered in the Philippines/);
  const phMixed = estimate({ client_region: 'philippines', items: [{ item_id: 'business_website', quantity: 1 }, { item_id: 'staff_data_entry', quantity: 1 }] });
  assert.equal(phMixed.ok, true);
  assert.equal(phMixed.one_time, '$600 to $1,500');
  assert.equal(phMixed.monthly, null);
  assert.equal(phMixed.lines.length, 1);
  assert.match(phMixed.problems.join(' '), /not offered in the Philippines/);
  const other = estimate({ client_region: 'other_international', items: [{ item_id: 'staff_admin', quantity: 1 }] });
  assert.equal(other.ok, true);
  assert.equal(other.monthly, '$1,599 to $1,999 a month');
  const us = estimate({ client_region: 'united_states', items: [{ item_id: 'staff_virtual_assistant', quantity: 1 }] });
  assert.equal(us.monthly, '$1,699 to $2,199 a month');
  const entry = estimate({ client_region: 'united_states', items: [{ item_id: 'staff_data_entry', quantity: 1 }] });
  assert.equal(entry.monthly, '$1,499 to $1,799 a month');
});

test('no staffing role starts below $1,499 a month, and none is offered in the Philippines', () => {
  for (const [id, it] of Object.entries(ITEMS)) {
    if (it.group === 'Staff') {
      assert.ok(it.usd[0] >= 1499, `${id} starts at ${it.usd[0]}`);
      assert.equal(it.ph, undefined, `${id} must not be offered in the Philippines`);
    }
  }
});

test('per-video items multiply by quantity, capped at 50', () => {
  const e = estimate({ client_region: 'philippines', items: [{ item_id: 'video_product_reel', quantity: 3 }] });
  assert.equal(e.one_time, '$75 to $225');
  const big = estimate({ client_region: 'philippines', items: [{ item_id: 'video_product_reel', quantity: 9999 }] });
  assert.equal(big.lines[0].low, 25 * 50);
});

test('unknown items and empty requests are refused, not guessed', () => {
  assert.equal(estimate({ client_region: 'philippines', items: [{ item_id: 'rocket_ship', quantity: 1 }] }).ok, false);
  assert.equal(estimate({ client_region: 'philippines', items: [] }).ok, false);
  assert.equal(estimate({ client_region: 'mars', items: [{ item_id: 'landing_page', quantity: 1 }] }).ok, false);
});

test('system care is a share of the system build, with a minimum', () => {
  const e = estimate({ client_region: 'philippines', items: [{ item_id: 'pos_inventory', quantity: 1 }, { item_id: 'system_care', quantity: 1 }] });
  assert.equal(e.ok, true);
  // 1.25% of $3,350 = $42 -> minimum $125; 1.75% of $7,500 = $131 -> $125 (tidied to $25)
  assert.equal(e.monthly, '$125 to $125 a month');
  const us = estimate({ client_region: 'united_states', items: [{ item_id: 'pos_inventory', quantity: 1 }, { item_id: 'system_care', quantity: 1 }] });
  // 1.25% of $12,000 = $150 -> minimum $300; 1.5% of $25,000 = $375 -> $400 (tidied to $50)
  assert.equal(us.monthly, '$300 to $400 a month');
  // Above the minimum, Philippine care keeps 1.25% to 1.75%; overseas is 1.25% to 1.5%.
  const phBig = estimate({ client_region: 'philippines', items: [{ item_id: 'multi_module_system', quantity: 1 }, { item_id: 'system_care', quantity: 1 }] });
  // 1.25% of $11,650 = $146 -> $150; 1.75% of $25,000 = $438 -> $450 (tidied to $25)
  assert.equal(phBig.monthly, '$150 to $450 a month');
  const usBig = estimate({ client_region: 'united_states', items: [{ item_id: 'multi_module_system', quantity: 1 }, { item_id: 'system_care', quantity: 1 }] });
  // 1.25% of $30,000 = $375 -> $400; 1.5% of $70,000 = $1,050 (tidied to $50)
  assert.equal(usBig.monthly, '$400 to $1,050 a month');
  const alone = estimate({ client_region: 'philippines', items: [{ item_id: 'system_care', quantity: 1 }] });
  assert.equal(alone.ok, false);
});

test('the tool only offers real catalog items and the prompt holds no prices', () => {
  const ids = ESTIMATE_TOOL.input_schema.properties.items.items.properties.item_id.enum;
  assert.deepEqual([...ids].sort(), Object.keys(ITEMS).sort());
  assert.equal(ESTIMATE_TOOL.strict, true);
  assert.doesNotMatch(SYSTEM_PROMPT.split('CATALOG')[1], /[₱$]\s?\d/, 'catalog section must not contain prices');
});

test('limits have safe defaults', () => {
  const l = limitsFrom({});
  assert.equal(l.turnsPerSession, 12);
  assert.equal(l.sessionsPerIpPerDay, 3);
  assert.equal(limitsFrom({ ESTIMATOR_SESSIONS_PER_DAY: '-5' }).sessionsPerDay, 150);
});

// A stand-in for the AI that replays scripted responses and records what it was sent.
function fakeClient(responses) {
  const calls = [];
  return {
    calls,
    beta: { messages: { create: async (params) => { calls.push(structuredClone(params)); return responses.shift(); } } },
  };
}

test('a turn that uses the tool returns the server-computed estimate', async () => {
  const client = fakeClient([
    { stop_reason: 'tool_use', content: [
      { type: 'thinking', thinking: '', signature: 'sig' },
      { type: 'tool_use', id: 'tu_1', name: 'prepare_estimate', input: { client_region: 'philippines', items: [{ item_id: 'landing_page', quantity: 1 }], project_summary: 'Landing page for a cafe' } },
    ] },
    { stop_reason: 'end_turn', content: [{ type: 'text', text: 'A landing page usually runs $250 to $425.' }] },
  ]);
  const out = await runTurn(client, {}, [{ role: 'user', content: 'I need a landing page for my cafe in Cebu' }]);
  assert.equal(out.estimate.one_time, '$250 to $425');
  assert.equal(out.summary, 'Landing page for a cafe');
  assert.match(out.reply, /landing page/i);
  // assistant (tool use), tool result, assistant (answer) appended in order, thinking kept unchanged
  assert.deepEqual(out.added.map((m) => m.role), ['assistant', 'user', 'assistant']);
  assert.equal(out.added[0].content[0].type, 'thinking');
  assert.equal(out.added[1].content[0].tool_use_id, 'tu_1');
  // the second call sends the whole conversation back, append-only
  assert.equal(client.calls[1].messages.length, 3);
  assert.equal(client.calls[0].model, 'claude-opus-5-5');
  assert.equal(client.calls[0].fallbacks, 'default');
  assert.deepEqual(client.calls[0].output_config, { effort: 'low' });
  assert.equal(client.calls[0].temperature, undefined);
});

test('a bad tool request goes back to the AI as an error, not a price', async () => {
  const client = fakeClient([
    { stop_reason: 'tool_use', content: [
      { type: 'tool_use', id: 'tu_2', name: 'prepare_estimate', input: { client_region: 'philippines', items: [{ item_id: 'system_care', quantity: 1 }], project_summary: 'Care for my system' } },
    ] },
    { stop_reason: 'end_turn', content: [{ type: 'text', text: 'System care is priced together with a system build.' }] },
  ]);
  const out = await runTurn(client, {}, [{ role: 'user', content: 'I need care for the system I already have' }]);
  assert.equal(out.estimate, null);
  const result = client.calls[1].messages.at(-1).content[0];
  assert.equal(result.is_error, true);
  assert.match(result.content, /custom system build/);
});

test('a refusal is reported so nothing is stored', async () => {
  const client = fakeClient([{ stop_reason: 'refusal', content: [] }]);
  const out = await runTurn(client, {}, [{ role: 'user', content: 'something off-limits' }]);
  assert.equal(out.refused, true);
});

test('a cheaper model can be chosen by setting, without fallbacks it does not support', async () => {
  const client = fakeClient([{ stop_reason: 'end_turn', content: [{ type: 'text', text: 'Hi' }] }]);
  await runTurn(client, { ESTIMATOR_MODEL: 'claude-haiku-5-5' }, [{ role: 'user', content: 'hi' }]);
  assert.equal(client.calls[0].model, 'claude-haiku-5-5');
  assert.equal(client.calls[0].fallbacks, undefined);
});

import { redactPersonal, priceSafe } from '../worker/estimator.mjs';

test('emails and phone or card numbers are removed before anything reaches the AI', () => {
  for (const [input, expected] of [
    ['email me at lee.v@example.com please', 'email me at [email removed] please'],
    ['call 0917 123 4567', 'call [number removed]'],
    ['call +63 917 123 4567 today', 'call [number removed] today'],
    ['US line (555) 123-4567', 'US line [number removed]'],
    ['09171234567', '[number removed]'],
    ['card 4111 1111 1111 1111', 'card [number removed]'],
  ]) assert.equal(redactPersonal(input).text, expected, input);
});

test('budgets and ordinary numbers are left alone', () => {
  for (const input of ['budget 150000 - 300000', 'around ₱150,000', 'we have 12 staff and 3 branches', 'open 9 to 5', 'year 2026']) {
    const r = redactPersonal(input);
    assert.equal(r.text, input, input);
    assert.equal(r.changed, false);
  }
});

test('a reply may only mention amounts that came from the price book tool', () => {
  const history = [
    { role: 'user', content: 'I need a website' },
    { role: 'assistant', content: [{ type: 'tool_use', id: 't', name: 'prepare_estimate', input: {} }] },
    { role: 'user', content: [{ type: 'tool_result', tool_use_id: 't', content: JSON.stringify({ ok: true, one_time: '₱60,000 to ₱120,000' }) }] },
  ];
  assert.equal(priceSafe('It usually runs ₱60,000 to ₱120,000.', history), true);
  assert.equal(priceSafe('Roughly ₱60k to ₱120k.', history), true);
  assert.equal(priceSafe('Staffing starts from $1,499 a month.', []), true);
  assert.equal(priceSafe('Staffing starts from $1,199 a month.', []), false);
  assert.equal(priceSafe('In the Philippines, staffing starts from ₱35,000 a month.', []), false);
  assert.equal(priceSafe('Your website will cost $1.', history), false);
  assert.equal(priceSafe('I can do it for ₱45,000.', history), false);
  assert.equal(priceSafe('About 50,000 pesos.', history), false);
  // an error result never makes an amount allowed
  const failed = [{ role: 'user', content: [{ type: 'tool_result', tool_use_id: 't', is_error: true, content: '{"ok":false,"problems":["$999"]}' }] }];
  assert.equal(priceSafe('$999', failed), false);
});

test('a made-up price in the AI text is replaced before the visitor sees it', async () => {
  const client = fakeClient([{ stop_reason: 'end_turn', content: [{ type: 'text', text: 'Your website will cost $1.' }] }]);
  const out = await runTurn(client, {}, [{ role: 'user', content: 'how much is a website?' }]);
  assert.doesNotMatch(out.reply, /\$1\b/);
  assert.match(out.reply, /price book/);
});

import { enabled } from '../worker/estimator.mjs';
test('the off switch has its own name and turns the assistant off', () => {
  const on = { ANTHROPIC_API_KEY: 'k', TURNSTILE_SECRET: 's', TURNSTILE_SITE_KEY: 'p' };
  assert.equal(enabled(on), true);
  assert.equal(enabled({ ...on, ESTIMATE_ASSISTANT: 'off' }), false);
  assert.equal(enabled({ ...on, ESTIMATOR: 'off' }), true, 'ESTIMATOR is the storage binding, not the switch');
});

test('a chat cannot start until the visitor accepts the AI notice', async () => {
  const { handleEstimator, AI_NOTICE } = await import('../worker/estimator.mjs');
  let started = 0;
  const fakeStore = { startSession: async () => { started++; return { ok: true, sessionId: 's1' }; } };
  const env = {
    ANTHROPIC_API_KEY: 'test', TURNSTILE_SECRET: 'test', TURNSTILE_SITE_KEY: 'test',
    ESTIMATOR: { idFromName: () => 'id', get: () => fakeStore },
  };
  const deps = { client: {}, verifyTurnstile: async () => true };
  const start = (body) => handleEstimator(new Request('https://anchoredgraceinnovation.com/api/estimate/start', {
    method: 'POST', headers: { origin: 'https://anchoredgraceinnovation.com', 'content-type': 'application/json' }, body: JSON.stringify(body),
  }), env, deps);

  const config = await (await handleEstimator(new Request('https://anchoredgraceinnovation.com/api/estimate/config'), env, deps)).json();
  assert.equal(config.notice, AI_NOTICE);
  assert.match(AI_NOTICE, /AI/);

  for (const body of [{ token: 'x'.repeat(20) }, { token: 'x'.repeat(20), aiNotice: 'yes' }, { token: 'x'.repeat(20), aiNotice: false }]) {
    const res = await start(body);
    assert.equal(res.status, 400);
    assert.equal((await res.json()).reason, 'notice');
  }
  assert.equal(started, 0);

  const ok = await start({ token: 'x'.repeat(20), aiNotice: true });
  assert.equal(ok.status, 200);
  assert.equal((await ok.json()).sessionId, 's1');
  assert.equal(started, 1);
});
