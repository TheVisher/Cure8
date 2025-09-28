export function pickProvider(url) {
  try {
    const u = new URL(url);
    const h = u.hostname.replace(/^www\./,'');
    if (h === 'youtube.com' || h === 'youtu.be') return 'youtube';
    if (h === 'vimeo.com') return 'vimeo';
    if (h === 'tiktok.com') return 'tiktok';
    if (h === 'reddit.com' || h === 'old.reddit.com') return 'reddit';
    if (h === 'twitter.com' || h === 'x.com') return 'twitter';
    return null;
  } catch { return null; }
}

export async function providerThumbnail(url) {
  const u = new URL(url);
  const host = u.hostname.replace(/^www\./,'');
  
  // YouTube
  if (host === 'youtube.com' || host === 'youtu.be') {
    const id = u.searchParams.get('v') || u.pathname.split('/').filter(Boolean).pop();
    if (id) return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
  }
  
  // Vimeo
  if (host === 'vimeo.com') {
    const res = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`);
    if (res.ok) return (await res.json()).thumbnail_url || null;
  }
  
  // TikTok - Use oEmbed API for thumbnail
  if (host === 'tiktok.com') {
    try {
      const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        return data.thumbnail_url || null;
      }
    } catch (error) {
      console.log('TikTok oEmbed failed:', error.message);
    }
  }
  
  // Reddit (best effort)
  if (host.endsWith('reddit.com')) {
    const res = await fetch(`${url}.json`, { headers: { 'User-Agent': 'Cure8Preview/1.0' } });
    if (res.ok) {
      const j = await res.json();
      const p = j?.[0]?.data?.children?.[0]?.data?.preview?.images?.[0]?.source?.url;
      if (p) return p.replace(/&amp;/g,'&');
    }
  }
  
  // Amazon - Return null to let the service use HTML scraping instead
  // Amazon's direct image URLs are unreliable and often return 400 errors
  if (host === 'amazon.com' || host === 'amazon.co.uk' || host === 'amazon.ca') {
    return null; // Let the service fall back to HTML scraping
  }
  
  // Etsy - Extract listing ID and use Etsy's image API
  if (host === 'etsy.com') {
    const listingMatch = url.match(/\/listing\/(\d+)/);
    if (listingMatch) {
      const listingId = listingMatch[1];
      try {
        // Try to get the first image from Etsy's API
        const res = await fetch(`https://openapi.etsy.com/v3/application/listings/${listingId}/images`, {
          headers: {
            'x-api-key': 'public', // Use public API key
            'User-Agent': 'Cure8Preview/1.0'
          }
        });
        if (res.ok) {
          const data = await res.json();
          const firstImage = data.results?.[0];
          if (firstImage) {
            return firstImage.url_fullxfull || firstImage.url_570xN || firstImage.url_75x75;
          }
        }
      } catch (error) {
        console.log('Etsy API failed:', error.message);
        // Fallback to a generic Etsy image URL pattern
        return `https://i.etsystatic.com/${listingId}/d/etsy_placeholder.jpg`;
      }
    }
  }
  
  // Twitter/X: no direct card image via oEmbed; return null to fall back.
  return null;
}
