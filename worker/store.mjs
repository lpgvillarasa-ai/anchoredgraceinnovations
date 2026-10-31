// The estimate assistant's memory: one small SQLite store inside Cloudflare
// (a Durable Object). It keeps each chat, counts usage so bots cannot run up a
// bill, and saves the enquiries visitors leave for Lee.
// Visitors' IP addresses are never stored, only a salted fingerprint of them.
import { DurableObject } from 'cloudflare:workers';

const HOUR = 3600_000;
const SESSION_TTL = 2 * HOUR;
const IN_FLIGHT_MAX = 90_000; // a stuck turn frees itself after 90 seconds

export class EstimatorStore extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, ip_hash TEXT, created INTEGER, user_turns INTEGER DEFAULT 0, estimate TEXT, summary TEXT, in_flight INTEGER DEFAULT 0);
      CREATE TABLE IF NOT EXISTS messages (session_id TEXT, seq INTEGER, role TEXT, content TEXT, PRIMARY KEY (session_id, seq));
      CREATE TABLE IF NOT EXISTS counters (key TEXT PRIMARY KEY, count INTEGER, expires INTEGER);
      CREATE TABLE IF NOT EXISTS leads (id INTEGER PRIMARY KEY AUTOINCREMENT, created INTEGER, session_id TEXT, name TEXT, email TEXT, business TEXT, note TEXT, summary TEXT, estimate TEXT);
    `);
    const cols = this.sql.exec('PRAGMA table_info(sessions)').toArray().map((c) => c.name);
    if (!cols.includes('in_flight')) this.sql.exec('ALTER TABLE sessions ADD COLUMN in_flight INTEGER DEFAULT 0');
  }

  // Adds one to a counter and says whether it is still within the limit.
  bump(key, limit, ttlMs) {
    const now = Date.now();
    const row = this.sql.exec('SELECT count, expires FROM counters WHERE key = ?', key).toArray()[0];
    const count = row && row.expires > now ? row.count : 0;
    if (count >= limit) return false;
    this.sql.exec('INSERT OR REPLACE INTO counters (key, count, expires) VALUES (?, ?, ?)', key, count + 1, row && row.expires > now ? row.expires : now + ttlMs);
    return true;
  }

  tidy() {
    const now = Date.now();
    this.sql.exec('DELETE FROM counters WHERE expires < ?', now);
    const old = now - 2 * 24 * HOUR;
    this.sql.exec('DELETE FROM messages WHERE session_id IN (SELECT id FROM sessions WHERE created < ?)', old);
    this.sql.exec('DELETE FROM sessions WHERE created < ?', old);
  }

  startSession({ ipHash, limits }) {
    this.tidy();
    if (!this.bump(`ip:${ipHash}:sessions`, limits.sessionsPerIpPerDay, 24 * HOUR)) return { ok: false, reason: 'ip_daily' };
    if (!this.bump('all:sessions', limits.sessionsPerDay, 24 * HOUR)) return { ok: false, reason: 'busy' };
    const id = crypto.randomUUID();
    this.sql.exec('INSERT INTO sessions (id, ip_hash, created) VALUES (?, ?, ?)', id, ipHash, Date.now());
    return { ok: true, sessionId: id };
  }

  // Checks every limit, then records the visitor's message and returns the chat so far.
  // Only one message per chat is handled at a time, so turns can never interleave.
  beginTurn({ sessionId, ipHash, text, limits }) {
    const s = this.sql.exec('SELECT * FROM sessions WHERE id = ?', sessionId).toArray()[0];
    if (!s || s.ip_hash !== ipHash) return { ok: false, reason: 'no_session' };
    if (Date.now() - s.created > SESSION_TTL) return { ok: false, reason: 'expired' };
    if (s.in_flight && Date.now() - s.in_flight < IN_FLIGHT_MAX) return { ok: false, reason: 'one_at_a_time' };
    if (s.user_turns >= limits.turnsPerSession) return { ok: false, reason: 'turns' };
    if (!this.bump(`ip:${ipHash}:minute`, limits.messagesPerIpPerMinute, 60_000)) return { ok: false, reason: 'slow_down' };
    if (!this.bump('all:messages', limits.messagesPerDay, 24 * HOUR)) return { ok: false, reason: 'busy' };
    const seq = this.append(sessionId, [{ role: 'user', content: text }]);
    this.sql.exec('UPDATE sessions SET user_turns = user_turns + 1, in_flight = ? WHERE id = ?', Date.now(), sessionId);
    return { ok: true, seq, history: this.history(sessionId), turnsLeft: limits.turnsPerSession - s.user_turns - 1 };
  }

  history(sessionId) {
    return this.sql.exec('SELECT role, content FROM messages WHERE session_id = ? ORDER BY seq', sessionId)
      .toArray().map((m) => ({ role: m.role, content: JSON.parse(m.content) }));
  }

  // Messages are only ever added at the end, never edited (the AI requires that).
  // Returns the position of the first message added.
  append(sessionId, messages) {
    const next = this.sql.exec('SELECT COALESCE(MAX(seq), -1) + 1 AS n FROM messages WHERE session_id = ?', sessionId).one().n;
    messages.forEach((m, i) => {
      this.sql.exec('INSERT INTO messages (session_id, seq, role, content) VALUES (?, ?, ?, ?)', sessionId, next + i, m.role, JSON.stringify(m.content));
    });
    return next;
  }

  // The answer to the turn that started at seq: saved only if that turn is still the last one.
  finishTurn(sessionId, seq, messages) {
    const last = this.sql.exec('SELECT MAX(seq) AS m FROM messages WHERE session_id = ?', sessionId).one().m;
    if (last === seq) this.append(sessionId, messages);
    this.sql.exec('UPDATE sessions SET in_flight = 0 WHERE id = ?', sessionId);
    return last === seq;
  }

  // If the AI call failed, that turn's own message is taken back so the visitor can resend it.
  undoTurn(sessionId, seq) {
    const row = this.sql.exec('SELECT role FROM messages WHERE session_id = ? AND seq = ?', sessionId, seq).toArray()[0];
    const last = this.sql.exec('SELECT MAX(seq) AS m FROM messages WHERE session_id = ?', sessionId).one().m;
    if (row && row.role === 'user' && last === seq) {
      this.sql.exec('DELETE FROM messages WHERE session_id = ? AND seq = ?', sessionId, seq);
      this.sql.exec('UPDATE sessions SET user_turns = MAX(user_turns - 1, 0) WHERE id = ?', sessionId);
    }
    this.sql.exec('UPDATE sessions SET in_flight = 0 WHERE id = ?', sessionId);
  }

  setEstimate(sessionId, estimate, summary) {
    this.sql.exec('UPDATE sessions SET estimate = ?, summary = ? WHERE id = ?', JSON.stringify(estimate), summary || '', sessionId);
  }

  saveLead({ sessionId, ipHash, name, email, business, note }) {
    const s = this.sql.exec('SELECT * FROM sessions WHERE id = ?', sessionId).toArray()[0];
    if (!s || s.ip_hash !== ipHash) return { ok: false, reason: 'no_session' };
    if (!this.bump(`ip:${ipHash}:leads`, 3, 24 * HOUR)) return { ok: false, reason: 'ip_daily' };
    this.sql.exec('INSERT INTO leads (created, session_id, name, email, business, note, summary, estimate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      Date.now(), sessionId, name, email, business, note, s.summary || '', s.estimate || '');
    return { ok: true, summary: s.summary || '', estimate: s.estimate ? JSON.parse(s.estimate) : null };
  }

  // A note from the contact form on the homepage ("Not ready for a call?"). Saved
  // with the chat enquiries so Lee sees both on /admin/leads. At most 3 a day from
  // one visitor and 200 a day in all, so a bot cannot flood the list.
  saveNote({ ipHash, name, email, note }) {
    this.tidy();
    if (!this.bump(`ip:${ipHash}:notes`, 3, 24 * HOUR)) return { ok: false, reason: 'ip_daily' };
    if (!this.bump('all:notes', 200, 24 * HOUR)) return { ok: false, reason: 'busy' };
    this.sql.exec('INSERT INTO leads (created, session_id, name, email, business, note, summary, estimate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      Date.now(), 'contact-form', name, email, '', note, 'Contact form note', '');
    return { ok: true };
  }

  listLeads() {
    return this.sql.exec('SELECT id, created, name, email, business, note, summary, estimate FROM leads ORDER BY id DESC LIMIT 200').toArray();
  }
}
