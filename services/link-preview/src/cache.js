import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import murmur from 'murmurhash-js';

const CACHE_DIR = path.resolve('./cache');
const JSON_DIR = path.join(CACHE_DIR, 'json');
const IMG_DIR  = path.join(CACHE_DIR, 'img');
const TTL = Number(process.env.CACHE_TTL_SECONDS || 86400);

export function ensureDirs() {
  for (const d of [CACHE_DIR, JSON_DIR, IMG_DIR]) {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  }
}

export function ensureCacheDirs() { ensureDirs(); }

export function normalizeUrl(u) {
  try {
    const url = new URL(u);
    url.hash = '';
    // normalize www.
    if (url.hostname.startsWith('www.')) url.hostname = url.hostname.slice(4);
    return url.toString();
  } catch { return u; }
}

function hashKey(key) {
  return murmur.murmur3(key).toString(16);
}

export function getCachePaths(key, kind /* 'json' | 'img' */) {
  const h = hashKey(key);
  const base = kind === 'json' ? JSON_DIR : IMG_DIR;
  const file = path.join(base, `${h}.${kind === 'json' ? 'json' : 'bin'}`);
  return { file };
}

function isFresh(file) {
  if (!fs.existsSync(file)) return false;
  const age = (Date.now() - fs.statSync(file).mtimeMs) / 1000;
  return age < TTL;
}

export async function withCache(key, kind, fn) {
  ensureDirs();
  const { file } = getCachePaths(key, kind);
  if (isFresh(file)) {
    const buf = fs.readFileSync(file);
    return kind === 'json' ? JSON.parse(buf.toString('utf8')) : buf;
  }
  const value = await fn();
  if (kind === 'json') fs.writeFileSync(file, Buffer.from(JSON.stringify(value)));
  else fs.writeFileSync(file, value);
  return value;
}
