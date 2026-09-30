// Run with Playwright installed or NODE_PATH pointing to its runtime directory.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'msedge' });
  try {
    async function scenario({ saved = {}, host = 'camp-planner.online', mobile = false } = {}) {
      const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1365, height: 900 } });
      const google = [];
      await context.addInitScript((entries) => {
        if (!sessionStorage.getItem('seeded')) {
          for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, value);
          sessionStorage.setItem('seeded', '1');
        }
      }, saved);
      await context.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.hostname !== host) {
          if (url.hostname.includes('google')) google.push(url.href);
          return route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
        }
        const file = path.join(root, url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname));
        if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return route.fulfill({ status: 404, body: '' });
        const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' };
        return route.fulfill({ status: 200, contentType: types[path.extname(file)] || 'application/octet-stream', body: fs.readFileSync(file) });
      });
      const page = await context.newPage();
      await page.goto('https://' + host + '/?email=private@example.com');
      return { context, page, google };
    }
    const fresh = await scenario({ mobile: true });
    assert.equal(fresh.google.length, 0, 'No Google request before consent');
    assert.equal(await fresh.page.locator('[data-choice-analytics]').isChecked(), false);
    assert.equal(await fresh.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Mobile has no horizontal overflow');
    await fresh.page.locator('[data-consent="declined"]').click();
    await fresh.page.reload();
    assert.equal(fresh.google.length, 0, 'Decline survives reload');
    await fresh.page.locator('[data-open-consent]').first().click();
    await fresh.page.locator('[data-choice-analytics]').check();
    await fresh.page.locator('[data-consent="save"]').click();
    await fresh.page.waitForFunction(() => window.dataLayer?.some(x => x[0] === 'config'));
    const config = await fresh.page.evaluate(() => Array.from(window.dataLayer.find(x => x[0] === 'config')));
    assert.equal(config[1], 'G-19CQPS2HDT');
    assert.equal(config[2].page_location, 'https://camp-planner.online/');
    assert.equal(await fresh.page.evaluate(() => localStorage.getItem('cp-external-content-consent')), 'declined');
    await fresh.context.addCookies([{ name: '_ga', value: 'test', domain: '.camp-planner.online', path: '/' }]);
    await fresh.page.locator('[data-open-consent]').first().click();
    await fresh.page.locator('[data-consent="declined"]').click();
    await fresh.page.waitForFunction(() => !window.dataLayer && localStorage.getItem('cp-analytics-consent') === 'declined');
    assert.equal((await fresh.context.cookies()).some(x => x.name === '_ga'), false, 'Withdrawal removes GA cookie');
    await fresh.context.close();

    const legacy = await scenario({ saved: { 'cp-external-content-consent': 'accepted' } });
    assert.equal(legacy.google.filter(x => x.includes('gtag')).length, 0, 'Legacy HubSpot consent cannot enable GA');
    assert.equal(await legacy.page.locator('[data-choice-analytics]').isChecked(), false);
    await legacy.context.close();

    const accepted = await scenario({ saved: { 'cp-external-content-consent': 'declined', 'cp-analytics-consent': 'accepted' } });
    await accepted.page.waitForFunction(() => !!window.dataLayer);
    assert.equal(await accepted.page.locator('.cp-consent').count(), 0, 'Saved choice respected');
    const other = await accepted.context.newPage();
    await other.goto('https://camp-planner.online/');
    await other.evaluate(() => localStorage.setItem('cp-analytics-consent', 'declined'));
    await accepted.page.waitForFunction(() => !window.dataLayer && window['ga-disable-G-19CQPS2HDT']);
    await accepted.context.close();

    const preview = await scenario({ host: 'preview.vercel.app', saved: { 'cp-analytics-consent': 'accepted' } });
    assert.equal(preview.google.filter(x => x.includes('gtag')).length, 0, 'Previews do not pollute analytics');
    await preview.context.close();
    console.log('PASS: consent, persistence, migration, withdrawal, cross-tab revocation, URL sanitization, preview exclusion and mobile layout. Google requests mocked; no data sent.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
