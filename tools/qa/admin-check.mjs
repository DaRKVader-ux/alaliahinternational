// Admin-screen QA for the local WordPress test site: logs in, opens each admin path,
// reports console errors and HTTP errors, saves a screenshot, and runs axe scoped to
// the plugin's own UI (WordPress core admin markup is out of scope).
//
//   WP_USER=admin WP_PASS=… node tools/qa/admin-check.mjs <base-url> <out-dir> <path> [<path> …]
//
// Local sites only. Exits non-zero on console/HTTP errors or axe violations in scope.
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const [base, out, ...paths] = process.argv.slice(2);
if (!base || !out || !paths.length || !/^http:\/\/(localhost|127\.0\.0\.1):\d+/.test(base)) {
	console.error('usage: WP_USER=… WP_PASS=… node tools/qa/admin-check.mjs http://localhost:<port> <out-dir> <path>…');
	process.exit(2);
}
// The plugin's own containers: meta boxes (#aa-*) and the Data Quality page.
const SCOPE = ['[id^="aa-"].postbox', '.tools_page_aa-data-quality .wrap'];

mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
await page.goto(`${base}/wp-login.php`);
await page.fill('#user_login', process.env.WP_USER || 'admin');
await page.fill('#user_pass', process.env.WP_PASS || '');
await Promise.all([page.waitForNavigation(), page.click('#wp-submit')]);

let failed = false;
for (const [i, path] of paths.entries()) {
	const errors = [];
	const onConsole = (m) => m.type() === 'error' && !m.text().startsWith('Failed to load resource') && errors.push(m.text());
	const onError = (e) => errors.push(e.message);
	const onResponse = (r) => r.status() >= 400 && !r.url().includes('favicon') && errors.push(`HTTP ${r.status()} ${r.url()}`);
	page.on('console', onConsole);
	page.on('pageerror', onError);
	page.on('response', onResponse);

	await page.goto(`${base}/wp-admin/${path}`, { waitUntil: 'networkidle' });
	await page.screenshot({ path: `${out}/${i + 1}.png`, fullPage: true });
	const notices = await page.locator('text=/(Warning|Notice|Deprecated|Fatal error):/').count();

	let builder = new AxeBuilder({ page });
	let inScope = 0;
	for (const sel of SCOPE) {
		const n = await page.locator(sel).count();
		if (n) {
			builder = builder.include(sel);
			inScope += n;
		}
	}
	const violations = inScope ? (await builder.analyze()).violations : [];
	failed ||= errors.length > 0 || violations.length > 0 || notices > 0;
	console.log(`${path}  scope=${inScope} php-notices=${notices} console-errors=${errors.length} axe=${violations.length}${violations.length ? ` [${violations.map((v) => `${v.id}×${v.nodes.length}`).join(', ')}]` : ''}`);
	for (const v of violations) for (const n of v.nodes.slice(0, 3)) console.log(`  - ${v.id}: ${n.target.join(' ')}`);
	for (const e of errors.slice(0, 3)) console.log(`  ! ${e}`);

	page.off('console', onConsole);
	page.off('pageerror', onError);
	page.off('response', onResponse);
}
await browser.close();
process.exit(failed ? 1 : 0);
