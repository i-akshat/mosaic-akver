import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler } from './sync.mjs';

const mem = new Map();
const store = { get: async k => mem.has(k) ? structuredClone(mem.get(k)) : null, setJSON: async (k, v) => { mem.set(k, structuredClone(v)); }, delete: async k => { mem.delete(k); } };
const h = createHandler(async () => store);
const CODE = 'ABCDEFGHJKLMNPQR';
const req = (method, qs = '', body) => new Request('https://x.test/api/sync' + qs, { method, body: body && JSON.stringify(body), headers: { 'content-type': 'application/json' } });
const put = (expected, extra = {}) => req('PUT', '', { code: CODE, pid: 'p1', profiles: JSON.stringify([{ id: 'p1', name: 'A', hue: 10, kids: false }]), data: { 'p1/saved': '[]' }, expected, ...extra });

test('ping', async () => { const r = await h(req('GET', '?ping=1')); assert.equal(r.status, 200); assert.equal((await r.json()).ok, true); });
test('get missing is 404, bad code 400', async () => {
  assert.equal((await h(req('GET', '?code=' + CODE))).status, 404);
  assert.equal((await h(req('GET', '?code=bad'))).status, 400);
});
test('put/get round trip with version check', async () => {
  const r1 = await h(put(0)); assert.equal(r1.status, 200); const { t } = await r1.json(); assert.ok(t > 0);
  const g = await (await h(req('GET', '?code=' + CODE))).json(); assert.equal(g.t, t); assert.equal(g.data['p1/saved'], '[]');
  assert.equal((await h(put(0))).status, 409);
  assert.equal((await h(put(t))).status, 200);
});
test('rejects invalid payload and unknown methods', async () => {
  assert.equal((await h(put(0, { extra: 1 }))).status, 400);
  assert.equal((await h(new Request('https://x.test/api/sync', { method: 'PUT', body: '{nope' }))).status, 400);
  assert.equal((await h(req('POST'))).status, 405);
});
test('delete', async () => {
  assert.equal((await h(req('DELETE', '?code=' + CODE))).status, 200);
  assert.equal((await h(req('GET', '?code=' + CODE))).status, 404);
});
