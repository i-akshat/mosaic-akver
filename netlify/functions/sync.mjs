// Netlify Function: Mosaic profile sync (replaces backend/server.mjs on Netlify).
// Storage: Netlify Blobs (the filesystem on Netlify is not persistent).
import { validCode, storeFilename, validateSyncPayload, syncVersionMatches, nextSyncVersion, MAX_BODY_BYTES } from '../../backend/server.mjs';

const json = (status, body, extra = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...extra }
});

export function createHandler(getStoreFn) {
  return async function handler(req) {
    const url = new URL(req.url);
    const allow = { allow: 'GET, PUT, DELETE, OPTIONS' };
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allow });
    if (req.method === 'GET' && url.searchParams.get('ping') === '1') return json(200, { ok: true, version: 1 });

    const store = await getStoreFn();
    const key = code => storeFilename(code);

    if (req.method === 'GET') {
      const code = url.searchParams.get('code');
      if (!validCode(code)) return json(400, { error: 'Invalid sync code' });
      try {
        const doc = await store.get(key(code), { type: 'json' });
        return doc ? json(200, doc) : json(404, { error: 'No sync data for this code' });
      } catch { return json(500, { error: 'Stored sync data could not be read' }); }
    }

    if (req.method === 'PUT') {
      let data;
      try {
        const text = await req.text();
        if (text.length > MAX_BODY_BYTES) { const e = new Error('Request body too large'); e.status = 413; throw e; }
        data = validateSyncPayload(JSON.parse(text));
      } catch (error) {
        return json(error.status || 400, { error: error instanceof SyntaxError ? 'Invalid JSON' : (error.message || 'Invalid sync data') });
      }
      try {
        const previous = await store.get(key(data.code), { type: 'json' });
        const currentVersion = Number(previous?.t || 0);
        if (!syncVersionMatches(data.expected, currentVersion)) return json(409, { error: 'Sync changed on another device', t: currentVersion });
        const doc = { profiles: data.profiles, pid: data.pid, data: data.data, t: nextSyncVersion(currentVersion) };
        await store.setJSON(key(data.code), doc);
        return json(200, { ok: true, t: doc.t });
      } catch { return json(500, { error: 'Sync data could not be saved' }); }
    }

    if (req.method === 'DELETE') {
      const code = url.searchParams.get('code');
      if (!validCode(code)) return json(400, { error: 'Invalid sync code' });
      try { await store.delete(key(code)); return json(200, { ok: true }); }
      catch { return json(500, { error: 'Sync data could not be deleted' }); }
    }
    return json(405, { error: 'Method not allowed' }, allow);
  };
}

export default createHandler(async () => (await import('@netlify/blobs')).getStore({ name: 'mosaic-sync', consistency: 'strong' }));
export const config = { path: '/api/sync' };
