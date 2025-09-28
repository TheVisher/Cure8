import ogs from 'open-graph-scraper';
import * as cheerio from 'cheerio';
import { URL } from 'url';

export async function previewForUrl(url) {
  const og = await getOG(url);
  const base = baseFields(url, og);

  // Pick hero image: OG > Twitter > fallback scan
  let hero = og.ogImage?.url || og.twitterImage || null;
  if (!hero) hero = await findLargestImage(url, og.html);

  return {
    url: base.url,
    domain: base.domain,
    title: og.ogTitle || og.twitterTitle || base.title || base.domain,
    description: og.ogDescription || og.twitterDescription || base.description || '',
    favicon: base.favicon,
    heroImage: hero
  };
}

async function getOG(url) {
  try {
    const { result } = await ogs({ url, timeout: { request: 10000, download: 10000 }, onlyGetOpenGraphInfo: false });
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
