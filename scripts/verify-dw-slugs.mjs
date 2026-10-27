/**
 * Verify that the DistroWatch slug we picked really belongs to this distro.
 * Reads scripts/dw-slugs.json, fetches the table page, extracts the page title.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const slugs = JSON.parse(fs.readFileSync(path.join(__dirname, 'dw-slugs.json'), 'utf8'));
const outPath = path.join(__dirname, 'dw-verify.json');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) DistroMatchAssetBot/1.0';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, 'utf8')) : {};

const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

for (const [id, slug] of Object.entries(slugs)) {
  if (!slug || results[id]?.status === 'ok') continue;
  try {
    const res = await fetch(`https://distrowatch.com/table.php?distribution=${encodeURIComponent(slug)}`, {
      headers: { 'User-Agent': UA }
    });
    const html = await res.text();
    const title = decode((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '');
    const pageTitle = decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '');
    results[id] = { slug, status: res.status, title, pageTitle };
    console.log(`${res.status} ${id} -> ${slug} :: ${title || pageTitle}`);
  } catch (e) {
    results[id] = { slug, status: 'error', error: e.message };
    console.log(`ERR ${id} -> ${slug} :: ${e.message}`);
  }
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  await sleep(900);
}

console.log('wrote', outPath);
