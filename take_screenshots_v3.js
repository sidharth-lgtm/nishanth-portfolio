const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const screenshotsDir = path.join(__dirname, 'screenshots');
  console.log('Saving to:', screenshotsDir);

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Screenshot 1: Hero section
  await page.screenshot({ path: path.join(screenshotsDir, '01_hero.png') });
  console.log('Hero saved');

  // Scroll to work section
  await page.evaluate(() => {
    const el = document.querySelector('#work');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotsDir, '02_work.png') });
  console.log('Work saved');

  // Scroll to about section
  await page.evaluate(() => {
    const el = document.querySelector('#about');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotsDir, '03_about.png') });
  console.log('About saved');

  // Scroll to clients section
  await page.evaluate(() => {
    const el = document.querySelector('#clients');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotsDir, '04_clients.png') });
  console.log('Clients saved');

  await browser.close();
  console.log('All done!');
})();
