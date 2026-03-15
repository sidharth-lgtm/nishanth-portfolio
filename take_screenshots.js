const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Screenshot 1: Hero section (full viewport, no scroll)
  console.log('Taking hero screenshot...');
  await page.screenshot({ path: '/c/Users/user/nishanth-portfolio/screenshots/01_hero.png' });

  // Get hero section details
  const heroText = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const btn = document.querySelector('button, a[href]');
    return {
      h1Text: h1 ? h1.innerText : 'none',
      h1FontSize: h1 ? window.getComputedStyle(h1).fontSize : 'none',
      h1Position: h1 ? h1.getBoundingClientRect() : null,
      buttons: Array.from(document.querySelectorAll('button, a')).slice(0, 5).map(b => ({
        text: b.innerText.trim(),
        class: b.className
      }))
    };
  });
  console.log('Hero info:', JSON.stringify(heroText, null, 2));

  // Scroll to work section
  console.log('Scrolling to work section...');
  await page.evaluate(() => {
    const workSection = document.querySelector('#work, [data-section="work"], section:nth-of-type(2)');
    if (workSection) workSection.scrollIntoView({ behavior: 'instant' });
    else window.scrollBy(0, 900);
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/c/Users/user/nishanth-portfolio/screenshots/02_work.png' });

  // Check card overlays
  const cardInfo = await page.evaluate(() => {
    const cards = document.querySelectorAll('[class*="card"], [class*="work"], [class*="project"]');
    return Array.from(cards).slice(0, 3).map(c => ({
      class: c.className,
      visible: window.getComputedStyle(c).display !== 'none'
    }));
  });
  console.log('Card info:', JSON.stringify(cardInfo, null, 2));

  // Scroll to about section
  console.log('Scrolling to about section...');
  await page.evaluate(() => {
    const aboutSection = document.querySelector('#about, [data-section="about"]');
    if (aboutSection) aboutSection.scrollIntoView({ behavior: 'instant' });
    else window.scrollBy(0, 1800);
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/c/Users/user/nishanth-portfolio/screenshots/03_about.png' });

  // Check portrait
  const aboutInfo = await page.evaluate(() => {
    const img = document.querySelector('#about img, [data-section="about"] img, img[alt*="portrait"], img[alt*="about"]');
    const allImgs = document.querySelectorAll('img');
    return {
      portraitSrc: img ? img.src : 'none',
      allImages: Array.from(allImgs).slice(0, 5).map(i => ({ src: i.src, alt: i.alt, class: i.className }))
    };
  });
  console.log('About info:', JSON.stringify(aboutInfo, null, 2));

  // Scroll to clients section
  console.log('Scrolling to clients section...');
  await page.evaluate(() => {
    const clientsSection = document.querySelector('#clients, [data-section="clients"]');
    if (clientsSection) clientsSection.scrollIntoView({ behavior: 'instant' });
    else window.scrollBy(0, 2700);
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/c/Users/user/nishanth-portfolio/screenshots/04_clients.png' });

  // Get client names
  const clientInfo = await page.evaluate(() => {
    const section = document.querySelector('#clients, [data-section="clients"]');
    if (section) return section.innerText;
    // Try to find by heading
    const headings = Array.from(document.querySelectorAll('h2, h3')).find(h => h.innerText.toLowerCase().includes('client'));
    if (headings) return headings.parentElement.innerText;
    return document.body.innerText.substring(0, 500);
  });
  console.log('Clients text:', clientInfo);

  await browser.close();
  console.log('Done!');
})();
