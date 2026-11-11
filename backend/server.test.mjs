import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_SYNC_BYTES, SYNC_KEYS, nextSyncVersion, storeFilename, syncVersionMatches, validCode, validateSyncPayload } from './server.mjs';

const goodCode = 'ABCDEFGHJKLMNPQR';
const validPayload = () => ({
  code:goodCode,
  expected:0,
  profiles:JSON.stringify([{ id:'p1', name:'You', hue:230, kids:false },{ id:'p2', name:'Family', hue:120, kids:true }]),
  pid:'p1',
  data:{ 'p1/saved':'["m1"]', 'p1/theme':'{"mode":"dark"}', 'p2/recent':'["film"]', 'p1/reel-comments':'{}', 'p2/followed':'[]', 'p2/language':'"hi"' }
});

test('accepts the app sync-code alphabet and exact length', () => {
  assert.equal(validCode(goodCode),true);
  assert.equal(validCode('ABCDEFGHJKLMNPQ'),false);
  assert.equal(validCode('ABCDEFGHJKLMNPQO'),false);
});

test('stores data under a one-way hash of the bearer code', () => {
  const name=storeFilename(goodCode);
  assert.match(name,/^[a-f0-9]{64}\.json$/);
  assert.equal(name.includes(goodCode),false);
  assert.throws(()=>storeFilename('bad-code'),/Invalid sync code/);
});

test('accepts the profile and string map sent by Mosaic', () => {
  const out=validateSyncPayload(validPayload());
  assert.deepEqual(Object.keys(out.data).sort(),['p1/reel-comments','p1/saved','p1/theme','p2/followed','p2/language','p2/recent']);
  assert.equal(out.pid,'p1');
  assert.equal(out.expected,0);
});

test('rejects malformed codes, profile JSON, and active profile ids', () => {
  assert.throws(()=>validateSyncPayload({ ...validPayload(), code:'easy-to-guess' }),/Invalid sync code/);
  assert.throws(()=>validateSyncPayload({ ...validPayload(), profiles:'not json' }),/not valid JSON/);
  assert.throws(()=>validateSyncPayload({ ...validPayload(), profiles:'[]' }),/one to five profiles/);
  assert.throws(()=>validateSyncPayload({ ...validPayload(), profiles:JSON.stringify([{ id:'p1', name:'You' }]) }),/Invalid profile entry/);
  assert.throws(()=>validateSyncPayload({ ...validPayload(), pid:'p3' }),/not in the profile list/);
  assert.throws(()=>validateSyncPayload({ ...validPayload(), pid:'../../private' }),/Invalid active profile id/);
});

test('rejects unsupported keys and non-string values', () => {
  assert.throws(()=>validateSyncPayload({ ...validPayload(), data:{ ...validPayload().data, fileBytes:'base64' } }),/Unsupported sync data/);
  assert.throws(()=>validateSyncPayload({ ...validPayload(), data:{ saved:[] } }),/Unsupported sync data/);
  assert.throws(()=>validateSyncPayload({ ...validPayload(), data:{ 'p9/saved':'[]' } }),/not in the profile list/);
  assert.ok(SYNC_KEYS.has('saved'));
  assert.ok(['reel-comments','followed','language'].every(key=>SYNC_KEYS.has(key)));
});

test('enforces an aggregate data-size limit', () => {
  assert.throws(()=>validateSyncPayload({ ...validPayload(), data:{ saved:'x'.repeat(MAX_SYNC_BYTES) } }),/storage limit/);
});

test('requires a safe compare-and-swap version', () => {
  assert.throws(()=>validateSyncPayload({ ...validPayload(), expected:-1 }),/expected sync version/);
  const { expected,...missing }=validPayload();
  assert.throws(()=>validateSyncPayload(missing),/expected sync version/);
});

test('sync versions accept current writes and reject stale writers', () => {
  assert.equal(syncVersionMatches(0,0),true);
  assert.equal(syncVersionMatches(4,4),true);
  assert.equal(syncVersionMatches(3,4),false);
  assert.equal(syncVersionMatches(-1,4),false);
  assert.equal(syncVersionMatches(4.5,4),false);
  assert.equal(nextSyncVersion(4,100),100);
  assert.equal(nextSyncVersion(100,50),101);
});
