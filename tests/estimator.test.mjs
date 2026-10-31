// Checks the estimate assistant's rules without calling the real AI.
// Run: npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import { estimate, ITEMS } from '../worker/pricebook.mjs';
import { runTurn, limitsFrom } from '../worker/estimator.mjs';
import { SYSTEM_PROMPT, ESTIMATE_TOOL } from '../worker/prompt.mjs';

test('Philippine website is priced in pesos straight from the price book', () => {
  const e = estimate({ client_region: 'philippines', items: [{ item_id: 'business_website', quantity: 1 }] });
  assert.equal(e.ok, true);
  assert.equal(e.currency, 'PHP');
  assert.equal(e.one_time, '₱60,000 to ₱120,000');
  assert.equal(e.monthly, null);
  assert.ok(e.notes.some((n) => n.includes('VAT')));
});

test('US client gets dollars, and one-time and monthly are kept apart', () => {
  const e = estimate({ client_region: 'united_states', items: [
    { item_id: 'booking_website', quantity: 1 },
    { item_id: 'website_care_plus', quantity: 1 },
  ] });
  assert.equal(e.currency, 'USD');
  assert.equal(e.one_time, '$5,000 to $12,000');
  assert.equal(e.monthly, '$200 to $400 a month');
});

test('staffing is US only, never quoted to Philippine or other clients', () => {
  const ph = estimate({ client_region: 'philippines', items: [{ item_id: 'staff_virtual_assistant', quantity: 1 }] });
  assert.equal(ph.ok, false);
  assert.match(ph.problems.join(' '), /US businesses only/);
  const other = estimate({ client_region: 'other_international', items: [{ item_id: 'staff_admin', quantity: 1 }] });
  assert.equal(other.ok, false);
  const us = estimate({ client_region: 'united_states', items: [{ item_id: 'staff_virtual_assistant', quantity: 1 }] });
  assert.equal(us.monthly, '$1,499 to $2,000 a month');
});

test('no staffing role starts below $1,499 a month', () => {
  for (const [id, it] of Object.entries(ITEMS)) {
    if (it.group === 'Staff') {
      assert.ok(it.usd[0] >= 1499, `${id} starts at ${it.usd[0]}`);
      assert.equal(it.php, undefined, `${id} must have no peso price`);
    }
  }
});

test('per-video items multiply by quantity, capped at 50', () => {
  const e = estimate({ client_region: 'philippines', items: [{ item_id: 'video_product_reel', quantity: 3 }] });
  assert.equal(e.one_time, '₱4,500 to ₱12,000');
  const big = estimate({ client_region: 'philippines', items: [{ item_id: 'video_product_reel', quantity: 9999 }] });
  assert.equal(big.lines[0].low, 1500 * 50);
});

test('unknown items and empty requests are refused, not guessed', () => {
  assert.equal(estimate({ client_region: 'philippines', items: [{ item_id: 'rocket_ship', quantity: 1 }] }).ok, false);
  assert.equal(estimate({ client_region: 'philippines', items: [] }).ok, false);
  assert.equal(estimate({ client_region: 'mars', items: [{ item_id: 'landing_page', quantity: 1 }] }).ok, false);
});

test('system care is a share of the system build, with a minimum', () => {
  const e = estimate({ client_region: 'philippines', items: [{ item_id: 'pos_inventory', quantity: 1 }, { item_id: 'system_care', quantity: 1 }] });
  assert.equal(e.ok, true);
  // 1.25% of 200,000 = 2,500 -> minimum 8,000; 1.75% of 450,000 = 7,875 -> minimum 8,000
  assert.equal(e.monthly, '₱8,000 to ₱8,000 a month');
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
    { stop_reason: 'end_turn', content: [{ type: 'text', text: 'A landing page usually runs ₱18,000 to ₱35,000.' }] },
  ]);
  const out = await runTurn(client, {}, [{ role: 'user', content: 'I need a landing page for my cafe in Cebu' }]);
  assert.equal(out.estimate.one_time, '₱18,000 to ₱35,000');
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
      { type: 'tool_use', id: 'tu_2', name: 'prepare_estimate', input: { client_region: 'philippines', items: [{ item_id: 'staff_admin', quantity: 1 }], project_summary: 'Admin staff' } },
    ] },
    { stop_reason: 'end_turn', content: [{ type: 'text', text: 'Our staffing is for US businesses only.' }] },
  ]);
  const out = await runTurn(client, {}, [{ role: 'user', content: 'I need an admin assistant for my shop in Cebu' }]);
  assert.equal(out.estimate, null);
  const result = client.calls[1].messages.at(-1).content[0];
  assert.equal(result.is_error, true);
  assert.match(result.content, /US businesses only/);
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
