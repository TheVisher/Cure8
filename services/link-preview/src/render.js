import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { withPage } from './lib/withPage.js';

const NAV_TIMEOUT = Number(process.env.NAVIGATION_TIMEOUT_MS || 20000);
const CONCURRENCY = Number(process.env.RENDER_CONCURRENCY || 2);

let browserPromise;
function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
    });
  }
  return browserPromise;
}

export async function renderCard({ meta, width = 1200, height = 630, format = 'webp' }) {
  const browser = await getBrowser();

  // Use movie poster dimensions for movies (2:3 aspect ratio)
  let finalWidth = width;
  let finalHeight = height;

  if (meta.isMovie) {
    // Movie poster aspect ratio (2:3) - make it taller
    finalHeight = Math.round(finalWidth * 1.5); // 2:3 ratio
  }

  const screenshot = await withPage(browser, async (page) => {
    page.setDefaultTimeout(15000);
    page.setDefaultNavigationTimeout(15000);
    await page.setViewport({ width: finalWidth, height: finalHeight, deviceScaleFactor: 2 });

    const html = template(meta, finalWidth, finalHeight);
    await page.setContent(html, { waitUntil: ['load', 'networkidle0'], timeout: NAV_TIMEOUT });

    return await page.screenshot({ type: 'jpeg', quality: 80 });
  });

  // Convert/resize via sharp (keeps output deterministic)
  const img = sharp(screenshot).resize(finalWidth, finalHeight, { fit: 'cover', position: 'attention' });
  return format === 'png' ? await img.png().toBuffer() : await img.webp({ quality: 92 }).toBuffer();
}

function template(meta, width, height) {
  const title = escapeHtml(meta.title || meta.domain || ' ');
  const domain = escapeHtml(meta.domain || '');
  const desc = escapeHtml(meta.description || '');
  const hero = meta.heroImage ? `background-image: url('${meta.heroImage}');` : '';
  const favicon = meta.favicon ? `<img src="${meta.favicon}" alt="" style="width:22px;height:22px;border-radius:4px;margin-right:8px;object-fit:cover;">` : '';

  // Movie poster styling vs regular card styling
  const isMovie = meta.isMovie;
  const titleSize = isMovie ? '42px' : '48px';
  const descSize = isMovie ? '18px' : '22px';
  const contentPadding = isMovie ? '32px' : '48px';
  const bottomPadding = isMovie ? '28px' : '42px';

  return `
<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=${width}, initial-scale=1"/>
<style>
  @font-face { font-family: Inter; src: local("Inter"); }
  body { margin:0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial; }
  .card {
    position:relative; width:${width}px; height:${height}px; overflow:hidden; background:#0b0b0f;
  }
  .bg {
    position:absolute; inset:0; ${hero}
    background-size: cover; background-position:center;
    filter: saturate(1.05) contrast(1.02) brightness(0.95);
    transform: scale(1.02);
  }
  .grad {
    position:absolute; inset:0;
    background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(8,8,12,0.65) 70%, rgba(8,8,12,0.9) 100%);
  }
  .content {
    position:absolute; left:${contentPadding}; right:${contentPadding}; bottom:${bottomPadding}; color:#f8fafc;
    text-shadow: 0 1px 2px rgba(0,0,0,0.35);
  }
  .title {
    font-size: ${titleSize}; line-height:1.1; font-weight: 700; letter-spacing: -0.02em; margin:0 0 10px 0;
    max-height: 2.2em; overflow: hidden;
  }
  .desc {
    font-size: ${descSize}; color:#e5e7eb; opacity:.85; margin:0 0 18px 0;
    max-height: 3.0em; overflow:hidden;
  }
  .chip {
    display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border-radius:9999px;
    background: rgba(15,15,22,0.55); backdrop-filter: blur(8px);
    border: 1px solid rgba(148,163,184,0.28); color:#cbd5e1; font-weight:600;
  }
</style>
</head>
<body>
  <div class="card">
    <div class="bg"></div>
    <div class="grad"></div>
    <div class="content">
      <h1 class="title">${title}</h1>
      ${desc ? `<p class="desc">${desc}</p>` : ''}
      <div class="chip">${favicon}<span>${domain}</span></div>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(s='') {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
