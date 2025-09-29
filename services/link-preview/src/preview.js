import ogs from 'open-graph-scraper';
import * as cheerio from 'cheerio';
import { URL } from 'url';
import puppeteer from 'puppeteer';

export async function previewForUrl(url) {
  const og = await getOG(url);
  const base = baseFields(url, og);

  // Pick hero image: OG > Twitter > fallback scan
  let hero = og.ogImage?.url || og.twitterImage || null;
  if (!hero) hero = await findLargestImage(url, og.html);

  // Special handling for IMDb URLs - extract movie title
  let title = og.ogTitle || og.twitterTitle || base.title || base.domain;
  let description = og.ogDescription || og.twitterDescription || base.description || '';
  let isMovie = false;

  if (url.includes('imdb.com/title/')) {
    isMovie = true;
    // Try to extract movie title from the page title
    if (base.title && !base.title.toLowerCase().includes('imdb')) {
      title = base.title.replace(/\s*\([^)]*\)\s*$/, '').trim(); // Remove year in parentheses
    }
  }

  if (isAmazonUrl(url)) {
    const amazon = await parseAmazonMetadata(url, og.html);
    if (amazon.title) title = amazon.title;
    if (amazon.description) description = amazon.description;
    if (!hero && amazon.image) hero = amazon.image;
  }

  if (isTikTokUrl(url)) {
    const tiktok = await parseTikTokMetadata(url, og.html);
    if (tiktok.title) title = tiktok.title;
    if (tiktok.description) description = tiktok.description;
    if (!hero && tiktok.image) hero = tiktok.image;
  }

  return {
    url: base.url,
    domain: base.domain,
    title,
    description,
    favicon: base.favicon,
    heroImage: hero,
    cardImage: hero,
    isMovie
  };
}

function isAmazonUrl(url) {
  try {
    const { hostname } = new URL(url);
    return /amazon\./i.test(hostname);
  } catch {
    return false;
  }
}

async function parseAmazonMetadata(url, htmlMaybe) {
  if (!htmlMaybe) return {};
  const $ = cheerio.load(htmlMaybe);

  const title = $('#productTitle').text().trim()
    || $('meta[name="title"]').attr('content')?.trim()
    || $('meta[property="og:title"]').attr('content')?.trim()
    || '';

  let primaryImage = $('#landingImage').attr('data-old-hires')
    || $('#landingImage').attr('data-a-hires')
    || $('#landingImage').attr('src')
    || $('img#imgBlkFront').attr('src')
    || $('meta[property="og:image"]').attr('content')
    || null;

  if (!primaryImage) {
    const dynamic = $('#landingImage').attr('data-a-dynamic-image');
    if (dynamic) {
      try {
        const parsed = JSON.parse(dynamic.replace(/&quot;/g, '"'));
        const firstKey = Object.keys(parsed)[0];
        if (firstKey) primaryImage = firstKey;
      } catch {}
    }
  }

  if (!primaryImage) {
    const wrapperImg = $('#imgTagWrapperId img').attr('data-old-hires')
      || $('#imgTagWrapperId img').attr('src')
      || $('[data-a-dynamic-image]').first().attr('data-a-dynamic-image')
      || null;

    if (wrapperImg) {
      if (wrapperImg.startsWith('{') || wrapperImg.includes('&quot;')) {
        try {
          const parsed = JSON.parse(wrapperImg.replace(/&quot;/g, '"'));
          const firstKey = Object.keys(parsed)[0];
          if (firstKey) primaryImage = firstKey;
        } catch {}
      } else {
        primaryImage = wrapperImg;
      }
    }
  }

  if (!primaryImage) {
    primaryImage = $('meta[name="twitter:image"]').attr('content') || null;
  }

  const bullets = $('#feature-bullets li span')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean);

  const description = bullets.length
    ? bullets.slice(0, 5).join(' • ')
    : $('meta[name="description"]').attr('content')?.trim()
      || '';

  return {
    title,
    description,
    image: primaryImage ? resolveUrl(url, primaryImage) : null
  };
}

function isTikTokUrl(url) {
  try {
    const { hostname } = new URL(url);
    return /tiktok\.com$/i.test(hostname) || /tiktok\.com/i.test(hostname);
  } catch {
    return false;
  }
}

async function parseTikTokMetadata(url, htmlMaybe) {
  let title = '';
  let description = '';
  let image = null;

  if (htmlMaybe) {
    try {
      const $ = cheerio.load(htmlMaybe);
      title = $('meta[property="og:title"]').attr('content')?.trim() || $('title').text().trim() || '';
      description = $('meta[property="og:description"]').attr('content')?.trim() || description;
      image = $('meta[property="og:image"]').attr('content')?.trim() || image;
    } catch {}
  }

  if (title && image) {
    return { title, description, image };
  }

  try {
    const enriched = await captureTikTokMetadata(url);
    return {
      title: title || enriched.title || '',
      description: description || enriched.description || '',
      image: image || enriched.image || null
    };
  } catch (error) {
    console.error('TikTok metadata enrichment failed:', error.message);
    return { title, description, image };
  }
}

async function getOG(url) {
  try {
    const { result } = await ogs({
      url,
      timeout: 12000,
      onlyGetOpenGraphInfo: false,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    // open-graph-scraper returns images as array or object; normalize:
    let img = null;
    if (result.ogImage) {
      if (Array.isArray(result.ogImage)) img = result.ogImage[0]?.url || null;
      else if (typeof result.ogImage === 'object') img = result.ogImage.url || null;
    }
    return {
      ogTitle: result.ogTitle,
      ogDescription: result.ogDescription,
      ogImage: img ? { url: resolveUrl(url, img) } : null,
      twitterTitle: result.twitterTitle,
      twitterDescription: result.twitterDescription,
      twitterImage: result.twitterImage ? resolveUrl(url, result.twitterImage) : null,
      html: result.html || null
    };
  } catch (error) {
    console.error('OG scraping error:', error);
    return {
      ogTitle: null,
      ogDescription: null,
      ogImage: null,
      twitterTitle: null,
      twitterDescription: null,
      twitterImage: null,
      html: null
    };
  }
}

function baseFields(url, htmlMaybe) {
  const u = new URL(url);
  let title = '';
  let description = '';
  let favicon = null;

  if (htmlMaybe) {
    const $ = cheerio.load(htmlMaybe);
    title = $('title').first().text()?.trim() || '';
    description = $('meta[name="description"]').attr('content') || '';
    const fav = $('link[rel="icon"]').attr('href') ||
                $('link[rel="shortcut icon"]').attr('href') || null;
    if (fav) favicon = resolveUrl(url, fav);
  }
  if (!favicon) favicon = `${u.origin}/favicon.ico`;

  return {
    url,
    domain: u.hostname.replace(/^www\./,''),
    title, description, favicon
  };
}

async function findLargestImage(url, htmlMaybe) {
  if (!htmlMaybe) return null;
  const $ = cheerio.load(htmlMaybe);
  // gather candidates
  const candidates = [];
  $('img').each((_, el) => {
    const src = $(el).attr('src');
    const width = Number($(el).attr('width') || 0);
    const height = Number($(el).attr('height') || 0);
    if (!src) return;
    candidates.push({
      src: resolveUrl(url, src),
      score: width * height || 0
    });
  });
  // pick highest score
  candidates.sort((a,b) => b.score - a.score);
  return candidates[0]?.src || null;
}

function resolveUrl(base, maybeRelative) {
  try { return new URL(maybeRelative, base).toString(); }
  catch { return maybeRelative; }
}

export function ensureCacheDirs() {
  // no-op; handled in cache.js via server import
}

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

export async function takePageScreenshot(url, width = 1200, height = 800) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  try {
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    
    const screenshot = await page.screenshot({ 
      type: 'png',
      fullPage: false 
    });
    
    return screenshot;
  } finally {
    await page.close();
  }
}

async function captureTikTokMetadata(url) {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 840, height: 1480, deviceScaleFactor: 1 });
    await page.setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
    );
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(1500);

    let title = await page.evaluate(() => {
      const primary = document.querySelector('h1[data-e2e="browse-video-desc"], h1[data-e2e="video-desc"]');
      if (primary?.textContent) return primary.textContent.trim();
      const meta = document.querySelector('meta[property="og:title"], meta[name="title"]');
      if (meta?.getAttribute('content')) return meta.getAttribute('content').trim();
      return document.title.replace(/\s*-\s*TikTok.*$/i, '').trim();
    });

    const description = await page.evaluate(() => {
      const meta = document.querySelector('meta[property="og:description"], meta[name="description"]');
      return meta?.getAttribute('content')?.trim() || '';
    });

    let image = null;
    const videoHandle = await page.$('video');
    if (videoHandle) {
      try {
        const screenshot = await videoHandle.screenshot({ type: 'jpeg', quality: 80, encoding: 'base64' });
        if (screenshot) image = `data:image/jpeg;base64,${screenshot}`;
      } catch (err) {
        console.warn('TikTok video screenshot failed, falling back to viewport capture:', err.message);
      }
    }

    if (!image) {
      const fallback = await page.screenshot({ type: 'jpeg', quality: 70, encoding: 'base64', fullPage: false });
      image = fallback ? `data:image/jpeg;base64,${fallback}` : null;
    }

    return { title, description, image };
  } finally {
    try { await page.close(); } catch {}
  }
}
