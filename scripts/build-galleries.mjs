/**
 * Build extra desktop screenshots for the profile carousel.
 *
 * Uses the Commons candidates collected by discover-assets.mjs. The primary
 * screenshot stays in distroAssets.js; this script only adds *additional*
 * verified images, and skips anything already used as the primary shot.
 *
 * Usage:
 *   node scripts/build-galleries.mjs
 *   node scripts/build-galleries.mjs --force
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(ROOT, 'src', 'data', 'distroGalleries.js');
const PUBLIC = path.join(ROOT, 'public', 'assets');
const UA = 'DistroMatch/2.0 (https://github.com/distro-match)';

const candidates = JSON.parse(fs.readFileSync(path.join(HERE, 'asset-candidates.json'), 'utf8'));
const plan = JSON.parse(fs.readFileSync(path.join(HERE, 'asset-plan.json'), 'utf8'));
const FORCE = process.argv.includes('--force');
const MAX_EXTRA = 3;

const norm = (value) =>
  (value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');

const GENERIC_NAME_WORDS = new Set([
  'linux',
  'gnu',
  'os',
  'live',
  'edition',
  'project',
  'system',
  'workstation',
  'desktop'
]);

/**
 * Match whole words, not substrings: "Nyarch Linux" must not count as Arch
 * Linux, and a Cambodge Garuda temple photo must not count as Garuda Linux.
 */
const hasDistroName = (title, record) => {
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const name = record?.name || '';
  const brandWords = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .filter((word) => word && !GENERIC_NAME_WORDS.has(word));
  if (!brandWords.length) return false;
  if (!brandWords.every((word) => words.includes(word))) return false;
  // For names of the form "<brand> Linux", require the Linux word too. This
  // keeps "Arch" from matching unrelated projects such as Nyarch.
  if (/\blinux\b/i.test(name) && !/\bGNU\/Linux\b/i.test(name) && !words.includes('linux')) {
    return false;
  }
  return true;
};

// Reject images of unrelated apps, installers, boot screens, icon themes and
// logos. These are technically tagged with the distro name but are not useful
// as desktop screenshots.
const BAD_TITLE =
  /(bug|error|crash|installer|installation|boot|grub|plymouth|wallpaper|background|screensaver|logo|icon|wordmark|theme|cursor|font|pdf|terminal|settings|configuration|about|menu|firefox|chromium|libreoffice|gimp|blender|steam|virtualbox|vmware|qemu|file manager|neofetch|launcher)/i;

function score(file, record) {
  const title = file.title.replace(/^File:/, '');
  if (!hasDistroName(title, record)) return null;
  if (BAD_TITLE.test(title)) return null;
  if (!/image\/(png|jpeg|webp)/i.test(file.mime || '')) return null;
  if ((file.width || 0) < 900 || (file.height || 0) < 500) return null;
  if ((file.width || 0) <= (file.height || 0)) return null;

  let value = 0;
  if (/default desktop|clean desktop|desktop$/i.test(title)) value += 8;
  if (/screenshot|desktop/i.test(title)) value += 4;
  if (/gnome|kde|plasma|xfce|mate|cinnamon|budgie|pantheon|cosmic|lxqt|lxde/i.test(title)) value += 2;
  if ((file.width || 0) >= 1600) value += 3;
  if (/20(2[3-6])/.test(title)) value += 2;
  return value;
}

async function fetchBuffer(url, tries = 3) {
  let lastError;
  for (let attempt = 0; attempt < tries; attempt++) {
    try {
      // Wikimedia returns 403 when utm_* query parameters are present.
      const clean = url.replace(/\?.*$/, '');
      const res = await fetch(clean, { headers: { 'user-agent': UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
    }
  }
  throw lastError;
}

function primaryKeys(id) {
  const entry = plan[id]?.screenshot;
  if (!entry) return new Set();
  const keys = new Set();
  if (entry.title) keys.add(entry.title);
  if (entry.url) keys.add(entry.url.replace(/\?.*$/, ''));
  if (entry.thumbUrl) keys.add(entry.thumbUrl.replace(/\?.*$/, ''));
  return keys;
}

async function buildOne(id, file, index) {
  const rel = `screenshots/gallery/${id}-${index}.jpg`;
  const abs = path.join(PUBLIC, rel);
  if (!fs.existsSync(abs) || FORCE) {
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    const source = await fetchBuffer(file.thumbUrl || file.url);
    const jpg = await sharp(source)
      .resize({ width: 1400, height: 900, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    fs.writeFileSync(abs, jpg);
  }
  const meta = await sharp(abs).metadata();
  return {
    url: `/assets/${rel}`,
    aspect: Number(((meta.width || 1) / (meta.height || 1)).toFixed(2)),
    credit: {
      label: 'Wikimedia Commons',
      url: file.descriptionUrl,
      license: file.license || 'free license',
      artist: file.artist || null
    },
    title: file.title.replace(/^File:/, '').replace(/\.[^.]+$/, '')
  };
}

const galleries = {};
const ids = Object.keys(candidates);
let done = 0;

for (const id of ids) {
  const record = candidates[id];
  const skip = primaryKeys(id);
  const seen = new Set();
  const ranked = (record.screenshots || [])
    .map((file) => ({ file, value: score(file, record) }))
    .filter((entry) => entry.value != null)
    .filter(({ file }) => {
      const url = (file.url || '').replace(/\?.*$/, '');
      if (skip.has(file.title) || skip.has(url)) return false;
      if (seen.has(file.title)) return false;
      seen.add(file.title);
      return true;
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, MAX_EXTRA);

  if (!ranked.length) {
    done++;
    continue;
  }

  const images = [];
  for (let i = 0; i < ranked.length; i++) {
    try {
      images.push(await buildOne(id, ranked[i].file, i + 2));
    } catch (error) {
      console.warn(`! ${id}: ${error.message}`);
    }
  }
  if (images.length) galleries[id] = images;
  done++;
  if (done % 15 === 0) console.log(`Galleries: ${done}/${ids.length}`);
}

const header = `/**
 * Generated by scripts/build-galleries.mjs - do not edit by hand.
 *
 * Additional desktop screenshots for the profile carousel. The primary
 * screenshot remains in distroAssets.js; these are extra, verified images.
 */
export const DISTRO_GALLERIES = `;
fs.writeFileSync(OUT, `${header}${JSON.stringify(galleries, null, 2)};\n`, 'utf8');
console.log(`Wrote ${OUT}: ${Object.keys(galleries).length} galleries, ${Object.values(galleries).flat().length} extra images`);
