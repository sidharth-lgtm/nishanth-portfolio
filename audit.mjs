/**
 * Visual Audit Script — Nishanth Krishnan Portfolio
 * Runs all 10 audits and saves screenshots to /assets/screenshots/
 * Run: node audit.mjs
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = 'http://localhost:3000';
const SS   = 'assets/screenshots';
fs.mkdirSync(SS, { recursive: true });

const issues  = [];
const fixed   = [];
const manual  = [];

function issue(desc)       { issues.push(desc);  console.log(`  ⚠  ${desc}`); }
function fix(desc)         { fixed.push(desc);   console.log(`  ✓  ${desc}`); }
function note(desc)        { manual.push(desc);  console.log(`  📋 ${desc}`); }
function log(msg)          { console.log(`\n${msg}`); }

// ─────────────────────────────────────────────────────────────────
async function run() {
  const browser = await chromium.launch({ headless: true });

  // ── AUDIT 1 — HERO (desktop 1440×900) ────────────────────────
  log('═══ AUDIT 1 — HERO SECTION ════════════════════════════════');
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500); // let GSAP intro play

  // Full-page before
  await page.screenshot({ path: `${SS}/full-page-before.png`, fullPage: true });
  log('  Saved: full-page-before.png');

  // Hero screenshot
  await page.screenshot({ path: `${SS}/audit1-hero.png` });
  log('  Saved: audit1-hero.png');

  // Check hero elements
  const heroName = await page.locator('.hero__name').isVisible();
  const heroCta  = await page.locator('#heroCta').isVisible();
  const barTop   = await page.locator('.hero__bar--top').isVisible();
  const heroVideo= await page.locator('.hero__video').isVisible();

  if (!heroName)  issue('AUDIT 1: hero name not visible');
  else            fix('AUDIT 1: hero name "NISHANTH KRISHNAN" visible');
  if (!heroCta)   issue('AUDIT 1: gold CTA button not visible');
  else            fix('AUDIT 1: gold CTA button visible');
  if (!barTop)    issue('AUDIT 1: top letterbox bar not found');
  else            fix('AUDIT 1: letterbox bars present');
  if (!heroVideo) note('AUDIT 1: hero video element exists (no real .mp4 yet)');

  // Nav hidden check
  const navOpacity = await page.locator('#nav').evaluate(el =>
    parseFloat(window.getComputedStyle(el).opacity)
  );
  if (navOpacity > 0.05) issue(`AUDIT 1: nav visible on load (opacity ${navOpacity.toFixed(2)}) — should be 0`);
  else                   fix(`AUDIT 1: nav correctly hidden on load (opacity ≈ 0)`);

  // ── AUDIT 2 — WORK GRID ────────────────────────────────────────
  log('═══ AUDIT 2 — WORK GRID IMAGES ════════════════════════════');
  await page.evaluate(() => window.scrollTo(0, window.innerHeight));
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${SS}/audit2-work-grid.png` });
  log('  Saved: audit2-work-grid.png');

  // Check card dimensions & aspect ratios
  const cards = ['a','b','c','d','e'];
  for (const id of cards) {
    const card = page.locator(`.work__card--${id}`);
    if (!(await card.count())) { issue(`AUDIT 2: Card ${id.toUpperCase()} not found in DOM`); continue; }

    const box = await card.boundingBox();
    if (!box) { issue(`AUDIT 2: Card ${id.toUpperCase()} has no bounding box`); continue; }

    const ratio = box.width / box.height;
    const label = { a:'4:5 ~0.80', b:'16:9 ~1.78', c:'16:9 ~1.78', d:'4:5 ~0.80', e:'21:9 ~2.33' };
    const expected = { a:0.80, b:1.78, c:1.78, d:0.80, e:2.33 };
    const tolerance = 0.12;
    const diff = Math.abs(ratio - expected[id]);
    if (diff > tolerance)
      issue(`AUDIT 2: Card ${id.toUpperCase()} ratio ${ratio.toFixed(2)} — expected ${label[id]}`);
    else
      fix(`AUDIT 2: Card ${id.toUpperCase()} aspect ratio correct (${ratio.toFixed(2)})`);
  }

  // Check for broken images (img-error class)
  const brokenImgs = await page.locator('.work__card-media img.img-error').count();
  if (brokenImgs > 0) {
    issue(`AUDIT 2: ${brokenImgs} broken image(s) — placeholder text showing`);
    note(`AUDIT 2: Save real images and run: python process-image.py --batch`);
  } else {
    fix('AUDIT 2: No broken image icons');
  }

  // Check gap (3px)
  const gap = await page.locator('.work__grid').evaluate(el =>
    window.getComputedStyle(el).gap
  );
  if (gap === '3px') fix(`AUDIT 2: Grid gap is 3px (contact-sheet style)`);
  else               issue(`AUDIT 2: Grid gap is "${gap}", expected "3px"`);

  // ── AUDIT 3 — HOVER INTERACTIONS ──────────────────────────────
  log('═══ AUDIT 3 — HOVER INTERACTIONS ══════════════════════════');
  for (const id of ['a','b','c','d','e']) {
    const card = page.locator(`.work__card--${id}`);
    if (!(await card.count())) continue;
    await card.hover();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SS}/audit3-hover-card-${id}.png` });

    const overlay = card.locator('.work__card-overlay');
    const transform = await overlay.evaluate(el =>
      window.getComputedStyle(el).transform
    );
    // translateY(0) = matrix(1,0,0,1,0,0)
    const isVisible = transform === 'none' || transform.includes('matrix(1, 0, 0, 1, 0, 0)');
    if (isVisible) fix(`AUDIT 3: Card ${id.toUpperCase()} overlay slides up correctly`);
    else           issue(`AUDIT 3: Card ${id.toUpperCase()} overlay transform: ${transform}`);
  }
  log('  Saved: audit3-hover-card-[a-e].png');

  // ── AUDIT 4 — ABOUT SECTION ───────────────────────────────────
  log('═══ AUDIT 4 — ABOUT SECTION ════════════════════════════════');
  await page.locator('#about').scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${SS}/audit4-about.png` });
  log('  Saved: audit4-about.png');

  const aboutInner = await page.locator('.about__inner').boundingBox();
  if (aboutInner) {
    const cols = await page.locator('.about__inner').evaluate(el =>
      window.getComputedStyle(el).gridTemplateColumns
    );
    fix(`AUDIT 4: About grid columns: ${cols}`);
  }
  const portraitImg = await page.locator('.about__portrait-frame img').first();
  const portraitSrc = await portraitImg.getAttribute('src');
  const portraitOk  = await portraitImg.evaluate(el => el.naturalWidth > 0);
  if (!portraitOk) {
    issue(`AUDIT 4: Portrait image not loaded (${portraitSrc})`);
    note('AUDIT 4: Save portrait photo to assets/portrait.jpg');
  } else {
    fix(`AUDIT 4: Portrait image loaded correctly`);
  }

  // Body text color check
  const bodyColor = await page.locator('.about__body p').first().evaluate(el =>
    window.getComputedStyle(el).color
  );
  fix(`AUDIT 4: About body text color: ${bodyColor}`);

  // ── AUDIT 5 — FULL COLOR CHECK ────────────────────────────────
  log('═══ AUDIT 5 — COLOR AUDIT ══════════════════════════════════');

  const colorViolations = await page.evaluate(() => {
    const violations = [];
    const all = document.querySelectorAll('*');

    all.forEach(el => {
      const cs = window.getComputedStyle(el);
      const bg = cs.backgroundColor;
      const color = cs.color;

      const isPureBlack = (c) => c === 'rgb(0, 0, 0)';
      const isPureWhite = (c) => c === 'rgb(255, 255, 255)';

      const tag = el.tagName.toLowerCase();
      const cls = el.className && typeof el.className === 'string'
        ? el.className.split(' ')[0] : '';
      const id  = `${tag}${cls ? '.' + cls : ''}`;

      if (isPureBlack(bg)    && bg !== 'rgba(0, 0, 0, 0)') violations.push(`Pure black BG on ${id}`);
      if (isPureWhite(color))  violations.push(`Pure white text on ${id}`);
      if (isPureBlack(color))  violations.push(`Pure black text on ${id}`);
    });

    // deduplicate
    return [...new Set(violations)].slice(0, 20);
  });

  if (colorViolations.length === 0) {
    fix('AUDIT 5: No pure black/white color violations found');
  } else {
    colorViolations.forEach(v => issue(`AUDIT 5: ${v}`));
  }

  // Section screenshots
  for (const [id, name] of [['#work','work'],['#about','about'],['#clients','clients'],['#contact','contact']]) {
    await page.locator(id).scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${SS}/audit5-section-${name}.png` });
  }
  log('  Saved: audit5-section-[work|about|clients|contact].png');

  // ── AUDIT 6 — MOBILE 375px ────────────────────────────────────
  log('═══ AUDIT 6 — MOBILE VIEW (375px) ══════════════════════════');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SS}/audit6-mobile-full.png`, fullPage: true });
  log('  Saved: audit6-mobile-full.png');

  // Check for overflow
  const mobileOverflow = await page.evaluate(() => {
    const docW = document.documentElement.scrollWidth;
    const vp   = window.innerWidth;
    return docW > vp ? `Horizontal overflow: doc ${docW}px > viewport ${vp}px` : null;
  });
  if (mobileOverflow) issue(`AUDIT 6: ${mobileOverflow}`);
  else                fix('AUDIT 6: No horizontal overflow on mobile');

  // Work grid single column check
  const mobileGridCols = await page.locator('.work__grid').evaluate(el =>
    window.getComputedStyle(el).gridTemplateColumns
  );
  if (!mobileGridCols.includes(' '))
    fix(`AUDIT 6: Work grid single column on mobile`);
  else
    issue(`AUDIT 6: Work grid still multi-column on mobile: ${mobileGridCols}`);

  // Hero name font size at mobile
  const mobileHeroSize = await page.locator('.hero__name').evaluate(el =>
    parseFloat(window.getComputedStyle(el).fontSize)
  );
  if (mobileHeroSize >= 40 && mobileHeroSize <= 80)
    fix(`AUDIT 6: Hero name font size ${mobileHeroSize}px — appropriate for mobile`);
  else
    issue(`AUDIT 6: Hero name font size ${mobileHeroSize}px — check clamp()`);

  // About stacks on mobile
  const mobileCols = await page.locator('.about__inner').evaluate(el =>
    window.getComputedStyle(el).gridTemplateColumns
  );
  if (!mobileCols.includes(' '))
    fix('AUDIT 6: About section stacks to single column');
  else
    issue(`AUDIT 6: About inner still multi-column on mobile: ${mobileCols}`);

  // ── AUDIT 7 — TABLET 768px ────────────────────────────────────
  log('═══ AUDIT 7 — TABLET VIEW (768px) ══════════════════════════');
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SS}/audit7-tablet-full.png`, fullPage: true });
  log('  Saved: audit7-tablet-full.png');

  const tabletOverflow = await page.evaluate(() => {
    const docW = document.documentElement.scrollWidth;
    const vp   = window.innerWidth;
    return docW > vp ? `Horizontal overflow: doc ${docW}px > viewport ${vp}px` : null;
  });
  if (tabletOverflow) issue(`AUDIT 7: ${tabletOverflow}`);
  else                fix('AUDIT 7: No horizontal overflow at 768px');

  const tabletGridCols = await page.locator('.work__grid').evaluate(el =>
    window.getComputedStyle(el).gridTemplateColumns
  );
  fix(`AUDIT 7: Work grid at 768px: ${tabletGridCols}`);

  // ── AUDIT 8 — CONSOLE ERRORS ──────────────────────────────────
  log('═══ AUDIT 8 — CONSOLE ERRORS ═══════════════════════════════');
  await page.setViewportSize({ width: 1440, height: 900 });

  const consoleErrors = [];
  const networkErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('response', res => {
    if (res.status() >= 400) networkErrors.push(`${res.status()} ${res.url()}`);
  });

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  if (consoleErrors.length === 0) fix('AUDIT 8: No JS console errors');
  else consoleErrors.forEach(e => issue(`AUDIT 8 JS Error: ${e}`));

  const criticalNet = networkErrors.filter(e =>
    !e.includes('.mp4') && !e.includes('.jpg') && !e.includes('.png')
  );
  const assetNet = networkErrors.filter(e =>
    e.includes('.mp4') || e.includes('.jpg') || e.includes('.png')
  );

  if (criticalNet.length === 0) fix('AUDIT 8: No critical 404s (scripts/fonts OK)');
  else criticalNet.forEach(e => issue(`AUDIT 8 Critical 404: ${e}`));

  if (assetNet.length > 0) {
    assetNet.forEach(e => note(`AUDIT 8 Asset 404 (expected): ${e}`));
  }

  // ── AUDIT 9 — CDN / LIBRARY CHECK ────────────────────────────
  log('═══ AUDIT 9 — CDN & PERFORMANCE ════════════════════════════');

  const libChecks = await page.evaluate(() => ({
    gsap:          typeof gsap !== 'undefined',
    scrollTrigger: typeof ScrollTrigger !== 'undefined',
    lenis:         typeof Lenis !== 'undefined',
    cormorant:     [...document.fonts].some(f => f.family.includes('Cormorant')),
    inter:         [...document.fonts].some(f => f.family.includes('Inter')),
  }));

  for (const [lib, ok] of Object.entries(libChecks)) {
    if (ok) fix(`AUDIT 9: ${lib} loaded ✓`);
    else    issue(`AUDIT 9: ${lib} NOT loaded — check CDN link`);
  }

  // ── AUDIT 10 — FINAL SCREENSHOT ───────────────────────────────
  log('═══ AUDIT 10 — FINAL SCREENSHOT ════════════════════════════');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SS}/full-page-after.png`, fullPage: true });
  log('  Saved: full-page-after.png');

  await browser.close();

  // ── REPORT ────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(60));
  console.log('  AUDIT COMPLETE — VISUAL REPORT');
  console.log('═'.repeat(60));
  console.log(`\nISSUES FOUND: ${issues.length}`);
  console.log(`ISSUES FIXED: ${fixed.length} (checks passed)\n`);

  if (issues.length > 0) {
    console.log('ISSUES:');
    issues.forEach((iss, i) => console.log(`  ${i+1}. ${iss}`));
  }
  if (manual.length > 0) {
    console.log('\nMANUAL ATTENTION NEEDED:');
    manual.forEach((m, i) => console.log(`  ${i+1}. ${m}`));
  }

  console.log('\nSCREENSHOTS SAVED TO: assets/screenshots/');
  console.log('  full-page-before.png');
  console.log('  full-page-after.png');
  console.log('  audit1-hero.png');
  console.log('  audit2-work-grid.png');
  console.log('  audit3-hover-card-[a-e].png');
  console.log('  audit4-about.png');
  console.log('  audit5-section-[work|about|clients|contact].png');
  console.log('  audit6-mobile-full.png');
  console.log('  audit7-tablet-full.png');
  console.log('\n' + '═'.repeat(60));
}

run().catch(err => {
  console.error('Audit failed:', err.message);
  process.exit(1);
});
