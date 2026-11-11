import http from 'node:http';
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const PORT = Number(process.env.PORT || 8787);
export const MAX_BODY_BYTES = 1024 * 1024;
export const MAX_SYNC_BYTES = 900 * 1024;
export const VALID_CODE = /^[A-HJ-NP-Z2-9]{16}$/;
export const SYNC_KEYS = new Set(['saved','prog','hid','theme','pls','seeds','plays','likes','recent','pad','eq','bm','mood','auto','last','vol','rm','reel-comments','followed','language']);
export const syncVersionMatches = (expected,current) => Number.isSafeInteger(expected) && expected >= 0 && expected === current;
export const nextSyncVersion = (current,now=Date.now()) => Math.max(now,current + 1);

const here = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(here, '..');
const contentTypes = new Map([
  ['.html','text/html; charset=utf-8'],['.js','text/javascript; charset=utf-8'],['.webmanifest','application/manifest+json; charset=utf-8'],
  ['.svg','image/svg+xml'],['.png','image/png'],['.md','text/markdown; charset=utf-8']
]);
const staticFiles = new Set(['index.html','manifest.webmanifest','sw.js','icon.svg','icon-192.png','icon-512.png','favicon-32.png','apple-touch-icon.png','DEPLOY.md','LOCAL_FIRST.md','PLAYER_GUIDE.md','RELEASE_STATUS.md','BACKEND.md','NATIVE_VLC_WINDOWS_ANDROID.md']);

export function validCode(value) {
  return typeof value === 'string' && VALID_CODE.test(value);
}

export function storeFilename(code) {
  if (!validCode(code)) throw new TypeError('Invalid sync code');
  return createHash('sha256').update(code).digest('hex') + '.json';
}

export function validateSyncPayload(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Expected a JSON object');
  if (!validCode(value.code)) throw new TypeError('Invalid sync code');
  const allowedTop = new Set(['code','profiles','pid','data','expected']);
  if (Object.keys(value).some(key => !allowedTop.has(key))) throw new TypeError('Unexpected sync field');
  if (!Number.isSafeInteger(value.expected) || value.expected < 0) throw new TypeError('Invalid expected sync version');
  let profiles = null, profileText = null;
  if (value.profiles != null) {
    if (typeof value.profiles !== 'string' || Buffer.byteLength(value.profiles) > 64 * 1024) throw new TypeError('Invalid profile list');
    try { profiles = JSON.parse(value.profiles); } catch { throw new TypeError('Profile list is not valid JSON'); }
    if (!Array.isArray(profiles) || profiles.length < 1 || profiles.length > 5) throw new TypeError('Profile list must contain one to five profiles');
    const ids = new Set();
    profiles = profiles.map(profile => {
      if (!profile || typeof profile !== 'object' || Array.isArray(profile) || !/^p\d{1,16}$/.test(profile.id || '') || typeof profile.name !== 'string' || !profile.name.trim() || profile.name.trim().length > 14 || !Number.isFinite(profile.hue) || profile.hue < 0 || profile.hue >= 360 || typeof profile.kids !== 'boolean') throw new TypeError('Invalid profile entry');
      if (ids.has(profile.id)) throw new TypeError('Profile ids must be unique');
      ids.add(profile.id);
      return { id:profile.id, name:profile.name.trim(), hue:Math.floor(profile.hue), kids:profile.kids };
    });
    profileText = JSON.stringify(profiles);
  }
  if (typeof value.pid !== 'string' || !/^p[A-Za-z0-9_-]{1,40}$/.test(value.pid)) throw new TypeError('Invalid active profile id');
  if (profiles && !profiles.some(profile => profile.id === value.pid)) throw new TypeError('Active profile is not in the profile list');
  if (!value.data || typeof value.data !== 'object' || Array.isArray(value.data)) throw new TypeError('Invalid sync data');
  const data = {};
  for (const [key, item] of Object.entries(value.data)) {
    const scoped=key.match(/^(p\d{1,16})\/([a-z-]+)$/);
    if ((!SYNC_KEYS.has(key) && !(scoped && SYNC_KEYS.has(scoped[2]))) || typeof item !== 'string') throw new TypeError('Unsupported sync data');
    if (scoped && (!profiles || !profiles.some(profile => profile.id === scoped[1]))) throw new TypeError('Profile data is not in the profile list');
    data[key] = item;
  }
  const record = { profiles:profileText, pid: value.pid, data };
  if (Buffer.byteLength(JSON.stringify(record)) > MAX_SYNC_BYTES) throw new TypeError('Sync data exceeds the storage limit');
  return { code: value.code, expected:value.expected, ...record };
}

function sendJson(res, status, value, extra = {}) {
  const body = JSON.stringify(value);
  res.writeHead(status, { 'content-type':'application/json; charset=utf-8', 'cache-control':'no-store', 'x-content-type-options':'nosniff', ...extra });
  res.end(body);
}

async function readJson(req) {
  const declared = Number(req.headers['content-length'] || 0);
  if (declared > MAX_BODY_BYTES) throw Object.assign(new Error('Request body too large'), { status: 413 });
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw Object.assign(new Error('Request body too large'), { status: 413 });
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw Object.assign(new Error('Malformed JSON'), { status: 400 }); }
}

function allowedOrigin(req, configuredOrigin) {
  const origin = req.headers.origin;
  if (!origin) return { ok:true, headers:{} };
  let own;
  try { own = `${req.socket.encrypted ? 'https' : 'http'}://${req.headers.host}`; } catch { own = ''; }
  if (origin === own) return { ok:true, headers:{ 'access-control-allow-origin':origin, 'vary':'Origin' } };
  if (configuredOrigin && origin === configuredOrigin) return { ok:true, headers:{ 'access-control-allow-origin':origin, 'access-control-allow-methods':'GET, PUT, DELETE, OPTIONS', 'access-control-allow-headers':'content-type', 'vary':'Origin' } };
  return { ok:false, headers:{} };
}

function makeLimiter(max = 240, windowMs = 60_000) {
  const entries = new Map();
  return key => {
    const now = Date.now(), old = entries.get(key);
    if (!old || now - old.start >= windowMs) { entries.set(key, { start:now, count:1 }); return true; }
    old.count++;
    if (entries.size > 5000) for (const [k,v] of entries) if (now - v.start >= windowMs) entries.delete(k);
    return old.count <= max;
  };
}

export function createMosaicServer({ dataDir = process.env.MOSAIC_DATA_DIR || path.resolve(packageRoot, '.mosaic-data'), corsOrigin = process.env.MOSAIC_ALLOWED_ORIGIN || '' } = {}) {
  const limit = makeLimiter();
  const fileFor = code => path.join(dataDir, storeFilename(code));
  return http.createServer(async (req, res) => {
    res.setHeader('x-content-type-options','nosniff');
    res.setHeader('referrer-policy','strict-origin-when-cross-origin');
    let url;
    try { url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`); }
    catch { return sendJson(res,400,{ error:'Invalid request URL' }); }
    const origin = allowedOrigin(req, corsOrigin);
    if (!origin.ok) return sendJson(res,403,{ error:'Origin is not allowed' });
    if (url.pathname.startsWith('/api/')) {
      for (const [key,value] of Object.entries(origin.headers)) res.setHeader(key,value);
      if (!limit(req.socket.remoteAddress || 'unknown')) return sendJson(res,429,{ error:'Too many requests' });
      if (req.method === 'OPTIONS' && url.pathname === '/api/sync') { res.writeHead(204); return res.end(); }
      if (url.pathname !== '/api/sync') return sendJson(res,404,{ error:'Not found' });
      if (req.method === 'GET' && url.searchParams.get('ping') === '1') return sendJson(res,200,{ ok:true, version:1 },origin.headers);
      if (req.method === 'GET') {
        const code = url.searchParams.get('code');
        if (!validCode(code)) return sendJson(res,400,{ error:'Invalid sync code' },origin.headers);
        try {
          const doc = JSON.parse(await readFile(fileFor(code),'utf8'));
          return sendJson(res,200,doc,origin.headers);
        } catch (error) {
          if (error.code === 'ENOENT') return sendJson(res,404,{ error:'No sync data for this code' },origin.headers);
          return sendJson(res,500,{ error:'Stored sync data could not be read' },origin.headers);
        }
      }
      if (req.method === 'PUT') {
        let data;
        try { data = validateSyncPayload(await readJson(req)); }
        catch (error) { return sendJson(res,error.status || 400,{ error:error.message || 'Invalid sync data' },origin.headers); }
        try {
          let previous = null;
          try { previous = JSON.parse(await readFile(fileFor(data.code),'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
          const currentVersion=Number(previous?.t || 0);
          if (!syncVersionMatches(data.expected,currentVersion)) return sendJson(res,409,{ error:'Sync changed on another device', t:currentVersion },origin.headers);
          const doc = { profiles:data.profiles, pid:data.pid, data:data.data, t:nextSyncVersion(currentVersion) };
          await mkdir(dataDir,{ recursive:true });
          const target = fileFor(data.code), temp = target + '.' + randomUUID() + '.tmp';
          await writeFile(temp,JSON.stringify(doc),{ encoding:'utf8', mode:0o600 });
          await rename(temp,target);
          return sendJson(res,200,{ ok:true, t:doc.t },origin.headers);
        } catch (error) { return sendJson(res,500,{ error:'Sync data could not be saved' },origin.headers); }
      }
      if (req.method === 'DELETE') {
        const code = url.searchParams.get('code');
        if (!validCode(code)) return sendJson(res,400,{ error:'Invalid sync code' },origin.headers);
        try { await rm(fileFor(code),{ force:true }); return sendJson(res,200,{ ok:true },origin.headers); }
        catch { return sendJson(res,500,{ error:'Sync data could not be deleted' },origin.headers); }
      }
      res.setHeader('allow','GET, PUT, DELETE, OPTIONS');
      return sendJson(res,405,{ error:'Method not allowed' },origin.headers);
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.setHeader('allow','GET, HEAD'); return sendJson(res,405,{ error:'Method not allowed' }); }
    let file;
    try { file = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1)); }
    catch { return sendJson(res,400,{ error:'Invalid path' }); }
    if (!staticFiles.has(file)) return sendJson(res,404,{ error:'Not found' });
    try {
      const bytes = await readFile(path.join(packageRoot,file));
      res.writeHead(200,{ 'content-type':contentTypes.get(path.extname(file)) || 'application/octet-stream', 'cache-control':file === 'index.html' || file === 'sw.js' ? 'no-cache' : 'public, max-age=86400', 'x-content-type-options':'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : bytes);
    } catch { sendJson(res,404,{ error:'Not found' }); }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const server = createMosaicServer();
  server.listen(PORT,'0.0.0.0',()=>console.log(`Mosaic server listening on port ${PORT}`));
  const stop = () => server.close(()=>process.exit(0));
  process.on('SIGINT',stop); process.on('SIGTERM',stop);
}
