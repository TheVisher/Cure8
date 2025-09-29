export async function withPage(browser, fn) {
  const page = await browser.newPage();
  try {
    return await fn(page);
  } finally {
    try {
      await page.close();
    } catch {}
  }
}
