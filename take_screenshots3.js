const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Find the actual "View Work" CTA button in hero
  const ctaInfo = await page.evaluate(() => {
    // Search all anchors and buttons for CTA
    const all = Array.from(document.querySelectorAll('a, button'));
    return all.map(el => ({
      text: el.innerText.trim(),
      class: el.className,
      href: el.href || '',
      bgColor: window.getComputedStyle(el).backgroundColor,
      color: window.getComputedStyle(el).color,
      border: window.getComputedStyle(el).border,
      display: window.getComputedStyle(el).display
    })).filter(el => el.text.length > 0 && el.text.length < 30);
  });
  console.log('All CTAs:', JSON.stringify(ctaInfo, null, 2));

  await browser.close();
})();
