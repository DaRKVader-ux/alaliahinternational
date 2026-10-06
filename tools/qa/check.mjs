// Browser QA pass: screenshots at the project QA widths, console errors,
// horizontal overflow, first keyboard focus, and an axe accessibility scan.
//
//   node tools/qa/check.mjs <url> <out-dir> [--axe-all]
//
// Exits non-zero on console errors, horizontal overflow or axe violations.
// Widths are owned by the alaliah-visual-regression skill; keep them in sync.
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const [url, out] = process.argv.slice(2);
if (!url || !out) {
	console.error('usage: node tools/qa/check.mjs <url> <out-dir> [--axe-all]');
	process.exit(2);
}
const axeAll = process.argv.includes('--axe-all');
const WIDTHS = [1920, 1440, 1024, 768, 390, 375];
const AXE_WIDTHS = axeAll ? WIDTHS : [1440, 390];

mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
let failed = false;

for (const width of WIDTHS) {
	const context = await browser.newContext({ viewport: { width, height: 900 } });
	const page = await context.newPage();
	const errors = [];
	// Resource failures are reported with their URL by the response handler below.
	page.on('console', (m) => m.type() === 'error' && !m.text().startsWith('Failed to load resource') && errors.push(m.text()));
	page.on('pageerror', (e) => errors.push(e.message));
	page.on('response', (r) => r.status() >= 400 && errors.push(`HTTP ${r.status()} ${r.url()}`));

	await page.goto(url, { waitUntil: 'networkidle' });
	await page.screenshot({ path: `${out}/w${width}.png`, fullPage: true });

	const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
	await page.keyboard.press('Tab');
	const firstFocus = await page.evaluate(() => {
		const el = document.activeElement;
		return el ? `${el.tagName.toLowerCase()} "${(el.textContent || '').trim().slice(0, 30)}"` : 'none';
	});

	let axe = '';
	if (AXE_WIDTHS.includes(width)) {
		const { violations } = await new AxeBuilder({ page }).analyze();
		axe = ` axe=${violations.length}${violations.length ? ` [${violations.map((v) => v.id).join(', ')}]` : ''}`;
		failed ||= violations.length > 0;
	}
	failed ||= errors.length > 0 || overflow;

	console.log(`${width}px console-errors=${errors.length} h-overflow=${overflow} first-focus=${firstFocus}${axe}`);
	for (const e of errors.slice(0, 3)) console.log(`  ! ${e}`);
	await context.close();
}

await browser.close();
process.exit(failed ? 1 : 0);
