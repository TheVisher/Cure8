import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { previewForUrl, ensureCacheDirs } from './src/preview.js';
import { renderCard } from './src/render.js';
import { getCachePaths, withCache, normalizeUrl } from './src/cache.js';
import { takePageScreenshot } from './src/preview.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 8787;

ensureCacheDirs();

/**
 * Health
 */
app.get('/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

/**
 * JSON metadata endpoint:
 * GET /preview?url=...
 */
app.get('/preview', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: 'Missing url' });

    const norm = normalizeUrl(url);
    const data = await withCache(norm, 'json', async () => {
      return await previewForUrl(norm);
    });

    res.json(data);
  } catch (err) {
    console.error('preview error', err);
    res.status(500).json({ error: 'Preview failed', detail: String(err) });
  }
});

/**
 * PNG/WebP card endpoint:
 * GET /card.png?url=...&w=1200&h=630&format=webp|png
 */
app.get(['/card.png', '/card.webp', '/card'], async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).send('Missing url');

    const width = Number(req.query.w || 1200);
    const height = Number(req.query.h || 630);
    const format = (req.query.format || (req.path.endsWith('.webp') ? 'webp' : 'png')).toLowerCase();

    const norm = normalizeUrl(url);

    // get metadata (cached)
    const meta = await withCache(norm, 'json', async () => previewForUrl(norm));

    // render card (cached separately by size+format)
    const key = `${norm}|${width}|${height}|${format}`;
    const buf = await withCache(key, 'img', async () => renderCard({ meta, width, height, format }));

    res.set('Cache-Control', 'public, max-age=86400');
    res.type(format === 'webp' ? 'image/webp' : 'image/png').send(buf);
  } catch (err) {
    console.error('card error', err);
    res.status(500).send('Card render failed');
  }
});

/**
 * Screenshot endpoint:
 * GET /screenshot.png?url=...&w=1200&h=800
 */
app.get('/screenshot.png', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).send('Missing url');

    const width = Number(req.query.w || 1200);
    const height = Number(req.query.h || 800);
    const norm = normalizeUrl(url);

    // Cache screenshots by URL and dimensions
    const key = `screenshot|${norm}|${width}|${height}`;
    const buf = await withCache(key, 'img', async () => {
      console.log(`Taking screenshot of: ${url}`);
      return await takePageScreenshot(url);
    });

    res.set('Cache-Control', 'public, max-age=86400');
    res.type('image/png').send(buf);
  } catch (err) {
    console.error('screenshot error', err);
    res.status(500).send('Screenshot failed');
  }
});

app.listen(PORT, () => {
  console.log(`[link-preview] listening on http://localhost:${PORT}`);
});
