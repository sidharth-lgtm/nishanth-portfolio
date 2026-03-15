const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Get more details about the hero section
  const heroDetails = await page.evaluate(() => {
    // Find "View Work" or similar button
    const allBtns = Array.from(document.querySelectorAll('a, button'));
    const viewWorkBtn = allBtns.find(b => b.innerText.toLowerCase().includes('view') || b.innerText.toLowerCase().includes('work'));
    
    return {
      viewWorkBtn: viewWorkBtn ? {
        text: viewWorkBtn.innerText,
        class: viewWorkBtn.className,
        bgColor: window.getComputedStyle(viewWorkBtn).backgroundColor,
        color: window.getComputedStyle(viewWorkBtn).color,
        border: window.getComputedStyle(viewWorkBtn).border
      } : 'not found',
      h1: (() => {
        const h1 = document.querySelector('h1');
        if (!h1) return null;
        const style = window.getComputedStyle(h1);
        return {
          text: h1.innerText,
          fontSize: style.fontSize,
          textAlign: style.textAlign,
          position: h1.getBoundingClientRect()
        };
      })()
    };
  });
  console.log('Hero button details:', JSON.stringify(heroDetails, null, 2));

  // Check work card overlays
  await page.evaluate(() => {
    const workSection = document.querySelector('#work');
    if (workSection) workSection.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(500);

  const overlayDetails = await page.evaluate(() => {
    // Look for overlay elements
    const overlays = Array.from(document.querySelectorAll('[class*="overlay"], [class*="caption"], [class*="info"]'));
    return overlays.slice(0, 5).map(el => ({
      class: el.className,
      opacity: window.getComputedStyle(el).opacity,
      visibility: window.getComputedStyle(el).visibility,
      display: window.getComputedStyle(el).display
    }));
  });
  console.log('Overlay details:', JSON.stringify(overlayDetails, null, 2));

  // Check about portrait
  await page.evaluate(() => {
    const aboutSection = document.querySelector('#about');
    if (aboutSection) aboutSection.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(500);

  const portraitDetails = await page.evaluate(() => {
    const img = document.querySelector('#about img');
    if (!img) return { error: 'no img in #about' };
    const style = window.getComputedStyle(img);
    return {
      src: img.src,
      opacity: style.opacity,
      visibility: style.visibility,
      filter: style.filter,
      width: img.getBoundingClientRect().width,
      height: img.getBoundingClientRect().height
    };
  });
  console.log('Portrait details:', JSON.stringify(portraitDetails, null, 2));

  await browser.close();
})();
