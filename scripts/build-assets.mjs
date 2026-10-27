/**
 * Build the local distro asset library.
 *
 * Inputs:
 *   scripts/asset-candidates.json  — Commons search results (logos + screenshots)
 *   scripts/dw-slugs.json          — DistroWatch screenshot slugs
 *   scripts/dw-verify.json         — DistroWatch page titles for slug verification
 *   scripts/asset-overrides.json   — optional manual choices, keyed by distro id
 *
 * Usage:
 *   node scripts/build-assets.mjs            # print the plan + write scripts/asset-plan.json
 *   node scripts/build-assets.mjs --download # download/optimise and write src/data/distroAssets.js
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { LINUX_DISTROS } from '../src/data/distros.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public', 'assets');
const readJson = (file, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, file), 'utf8'));
  } catch {
    return fallback;
  }
};

const candidates = readJson('asset-candidates.json', {});
const dwSlugs = readJson('dw-slugs.json', {});
const dwVerify = readJson('dw-verify.json', {});
const overrides = readJson('asset-overrides.json', {});
const simpleIcons = readJson('simpleicons.json', {});
const FORCE = process.argv.includes('--force');

const UA =
  'DistroMatch/2.0 (https://github.com/distro-match)';

/** Distros whose DistroWatch page shows a sibling variant, not this exact edition. */
const VARIANT_IDS = new Set([
  'fedora-silverblue',
  'fedora-kinoite',
  'opensuse-leap',
  'opensuse-aeon',
  'raspberry-pi-os'
]);

const norm = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');

const nameTokens = (record, distro) => {
  const names = [
    ...(record?.tokens || []),
    distro.name,
    distro.id,
    distro.name.replace(/\s*\(.*?\)\s*/g, ' '),
    distro.name.replace(/\bLinux\b/gi, ' '),
    distro.name.replace(/\bOS\b/gi, ' ')
  ];
  const words = names
    .flatMap((value) => String(value).split(/[^A-Za-z0-9]+/))
    .filter((word) => word.length >= 4 && !/^(linux|gnu|live|system|project|edition)$/i.test(word));
  return [...new Set([...names, ...words])]
    .map(norm)
    .filter((t) => t.length >= 4)
    .sort((a, b) => b.length - a.length);
};

const titleHasName = (title, tokens) => {
  const t = norm(title);
  return tokens.some((token) => t.includes(token));
};

const BAD_IMAGE_WORDS =
  /(screenshot|desktop|wallpaper|background|screensaver|boot|installer|grub|plymouth|firefox|chromium|waterfox|openoffice|libreoffice|terminal|filemanager|cursor|font|theme|airfield|bridge|pdf|talkheader|logoof|diversity)/i;
const OLD_WORDS = /(former|previous|old|unused|proposal|submission|draft|alternative|historical|obsolete)/i;

function scoreLogo(file, tokens) {
  const title = file.title.replace(/^File:/, '');
  if (!titleHasName(title, tokens)) return null;
  if (BAD_IMAGE_WORDS.test(title)) return null;
  if (/\.pdf$/i.test(title)) return null;

  let score = 0;
  if (/\blogo\b/i.test(title)) score += 6;
  if (/\bicon\b/i.test(title)) score += 4;
  if (/\bmark\b|\bemblem\b|\bsymbol\b/i.test(title)) score += 4;
  if (/wordmark|logotype|wordmark|lettering/i.test(title)) score -= 2;
  if (/wordmark|logotype/i.test(title)) score -= 2;
  if (OLD_WORDS.test(title)) score -= 3;
  if (file.mime === 'image/svg+xml') score += 3;

  const w = file.width || 1;
  const h = file.height || 1;
  const aspect = w / h;
  if (aspect >= 0.72 && aspect <= 1.4) score += 5;
  else if (aspect > 1.4 && aspect <= 2) score += 1;
  else if (aspect > 2.4) score -= 6;
  if (Math.max(w, h) < 100) score -= 1;

  return score;
}

function scoreScreenshot(file, tokens) {
  const title = file.title.replace(/^File:/, '');
  if (!titleHasName(title, tokens)) return null;
  if (/\.pdf$/i.test(title)) return null;
  if (/logo|icon|wordmark|wallpaper|theme|icon-theme|cursor|font/i.test(title)) return null;

  let score = 0;
  if (/screenshot|desktop|default/i.test(title)) score += 5;
  if (/gnome|kde|plasma|xfce|mate|cinnamon|budgie|pantheon|cosmic|lxqt|lxde/i.test(title)) score += 1;
  if (file.mime === 'image/png') score += 2;
  if (file.mime === 'image/jpeg') score += 1;
  if ((file.width || 0) >= 1600) score += 3;
  else if ((file.width || 0) >= 1000) score += 2;
  if ((file.width || 0) < (file.height || 0)) score -= 3;
  return score;
}

function pickBest(files, scorer, tokens) {
  const ranked = files
    .map((file) => ({ file, score: scorer(file, tokens) }))
    .filter((entry) => entry.score != null)
    .sort((a, b) => b.score - a.score);
  return ranked[0] || null;
}

function dwScreenshot(id) {
  const slug = dwSlugs[id];
  const verified = dwVerify[id];
  if (!slug || !verified || verified.status !== 200) return null;
  const title = verified.title || verified.pageTitle || '';
  if (VARIANT_IDS.has(id)) return null;
  // The page heading must mention the distro name; guards against slug collisions.
  const tokens = nameTokens(candidates[id], LINUX_DISTROS.find((d) => d.id === id));
  if (!titleHasName(title, tokens)) return null;
  return {
    kind: 'dw',
    url: `https://distrowatch.com/images/cgfjoewdlbc/${slug}.png`,
    pageUrl: `https://distrowatch.com/table.php?distribution=${encodeURIComponent(slug)}`,
    slug,
    title
  };
}

const plan = {};
const warnings = [];

for (const distro of LINUX_DISTROS) {
  const record = candidates[distro.id];
  const tokens = nameTokens(record, distro);

  const overrideLogo = overrides[distro.id]?.logo;
  const overrideScreenshot = overrides[distro.id]?.screenshot;

  let logo = null;
  if (overrideLogo === null || overrideLogo === 'none') {
    logo = null;
  } else if (overrideLogo) {
    // Overrides are either a Commons file title or an object describing an
    // official brand asset ({ url, credit, creditUrl, mime, license }).
    logo =
      typeof overrideLogo === 'object'
        ? { ...overrideLogo }
        : (record?.logos || []).find((f) => f.title === overrideLogo) || { title: overrideLogo };
  } else {
    logo = pickBest(record?.logos || [], scoreLogo, tokens)?.file || null;
  }
  // Last-resort verified brand mark for distros with no usable Commons logo.
  if (!logo && simpleIcons[distro.id]) {
    logo = { simpleIcon: simpleIcons[distro.id] };
  }
  if (!logo && !record) warnings.push(`${distro.id}: no Commons record (discovery missing)`);

  let screenshot = null;
  let screenshotSource = null;
  if (overrideScreenshot === null || overrideScreenshot === 'none') {
    screenshot = null;
  } else if (overrideScreenshot) {
    if (typeof overrideScreenshot === 'object') {
      // Official project screenshot ({ url, credit, creditUrl, license }).
      screenshot = { ...overrideScreenshot };
      screenshotSource = 'external';
    } else {
      const file = (record?.screenshots || []).find((f) => f.title === overrideScreenshot);
      if (file) {
        screenshot = file;
        screenshotSource = 'commons';
      } else if (overrideScreenshot.startsWith('dw:')) {
        const slug = overrideScreenshot.slice(3);
        screenshot = {
          url: `https://distrowatch.com/images/cgfjoewdlbc/${slug}.png`,
          pageUrl: `https://distrowatch.com/table.php?distribution=${encodeURIComponent(slug)}`,
          title: slug
        };
        screenshotSource = 'dw';
      }
    }
  } else {
    const dw = dwScreenshot(distro.id);
    if (dw) {
      screenshot = dw;
      screenshotSource = 'dw';
    } else {
      const best = pickBest(record?.screenshots || [], scoreScreenshot, tokens);
      if (best) {
        screenshot = best.file;
        screenshotSource = 'commons';
      }
    }
  }

  plan[distro.id] = {
    name: distro.name,
    logo: logo
      ? logo.simpleIcon
        ? {
            simpleIcon: logo.simpleIcon,
            title: `Simple Icons: ${logo.simpleIcon}`,
            url: `https://cdn.simpleicons.org/${logo.simpleIcon}`,
            mime: 'image/svg+xml',
            width: 24,
            height: 24
          }
        : {
            title: logo.title,
            url: logo.url,
            thumbUrl: logo.thumbUrl || logo.url,
            mime: logo.mime || '',
            width: logo.width || null,
            height: logo.height || null,
            license: logo.license || null,
            artist: logo.artist || null,
            descriptionUrl: logo.descriptionUrl || null,
            credit: logo.credit || null,
            creditUrl: logo.creditUrl || null,
            override: Boolean(overrideLogo)
          }
      : null,
    screenshot: screenshot
      ? {
          kind: screenshotSource,
          title: screenshot.title,
          url: screenshot.url,
          thumbUrl: screenshot.thumbUrl || screenshot.url,
          mime: screenshot.mime || '',
          width: screenshot.width || null,
          height: screenshot.height || null,
          license: screenshot.license || null,
          artist: screenshot.artist || null,
          descriptionUrl: screenshot.descriptionUrl || null,
          pageUrl: screenshot.pageUrl || null,
          credit: screenshot.credit || null,
          creditUrl: screenshot.creditUrl || null,
          override: Boolean(overrideScreenshot)
        }
      : null
  };
}

const outPath = path.join(__dirname, 'asset-plan.json');
fs.writeFileSync(outPath, JSON.stringify(plan, null, 2));

let missingLogos = 0;
let missingShots = 0;
for (const d of LINUX_DISTROS) {
  const p = plan[d.id];
  if (!p.logo) missingLogos++;
  if (!p.screenshot) missingShots++;
}

console.log(`Plan written: ${outPath}`);
console.log(`Logos: ${LINUX_DISTROS.length - missingLogos}/${LINUX_DISTROS.length}`);
console.log(`Screenshots: ${LINUX_DISTROS.length - missingShots}/${LINUX_DISTROS.length}`);
if (warnings.length) console.log('Warnings:\n  ' + warnings.join('\n  '));

if (!process.argv.includes('--download')) {
  console.log('\nReview the plan, add overrides to scripts/asset-overrides.json, then run with --download.');
  process.exit(0);
}

/* ------------------------------ download phase ------------------------------ */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchBuffer(url, attempt = 0) {
  try {
    // Wikimedia's imageinfo URLs carry utm_* query parameters that its CDN
    // rejects with 403. The path alone resolves to the same file.
    const target = url.startsWith('https://upload.wikimedia.org/') ? url.split('?')[0] : url;
    if (target.includes('upload.wikimedia.org')) await sleep(600);
    const res = await fetch(target, { headers: { 'User-Agent': UA } });
    if (res.status === 403) {
      // Wikimedia blocks the UA and DistroWatch returns 403 for missing image
      // slugs; retrying either is pointless.
      throw new Error(`HTTP 403 for ${url}`);
    }
    if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const type = (res.headers.get('content-type') || '').toLowerCase();
    // DistroWatch returns an HTML "not found" page with status 200 for a bad
    // image slug; never pass that to sharp.
    if (!type.startsWith('image/') && !type.startsWith('application/octet-stream')) {
      throw new Error(`Not an image (${type || 'unknown type'}) for ${url}`);
    }
    return Buffer.from(await res.arrayBuffer());
  } catch (err) {
    if (attempt >= 3) throw err;
    await sleep(8000 * (attempt + 1));
    return fetchBuffer(url, attempt + 1);
  }
}

const lg = (msg) => console.log(msg);

async function buildLogo(id, entry) {
  if (!entry) return null;
  const isSvg = entry.mime === 'image/svg+xml' || /\.svg$/i.test(entry.title);
  const file = `logos/${id}.${isSvg ? 'svg' : 'png'}`;
  const abs = path.join(publicDir, file);
  if (fs.existsSync(abs) && !FORCE) {
    let aspect = 1;
    if (isSvg) {
      const text = fs.readFileSync(abs, 'utf8').slice(0, 4000);
      const m = text.match(/viewBox=["']([\d.\-]+)[ ,]+([\d.\-]+)[ ,]+([\d.\-]+)[ ,]+([\d.\-]+)["']/);
      if (m) aspect = Number(m[3]) / Number(m[4]);
      else if (entry.width && entry.height) aspect = entry.width / entry.height;
    } else {
      const meta = await sharp(abs).metadata();
      aspect = (meta.width || 1) / (meta.height || 1);
    }
    return { path: `/assets/${file}`, aspect: Number(aspect.toFixed(2)) };
  }
  const sourceUrl = isSvg ? entry.url : entry.thumbUrl || entry.url;
  if (!sourceUrl) return null;
  const buf = await fetchBuffer(sourceUrl);

  if (isSvg && buf.length < 400 * 1024) {
    fs.writeFileSync(abs, buf);
    let aspect = 1;
    if (entry.width && entry.height) {
      aspect = entry.width / entry.height;
    } else {
      const m = buf.toString('utf8', 0, 4000).match(/viewBox=["']([\d.\-]+)[ ,]+([\d.\-]+)[ ,]+([\d.\-]+)[ ,]+([\d.\-]+)["']/);
      if (m) aspect = Number(m[3]) / Number(m[4]);
    }
    return { path: `/assets/${file}`, aspect: Number(aspect.toFixed(2)) };
  }

  let pipeline = sharp(buf, { density: 300 }).resize({
    width: 512,
    height: 512,
    fit: 'inside',
    withoutEnlargement: true
  });
  try {
    pipeline = pipeline.trim({ threshold: 10 });
  } catch {
    /* trim is best-effort */
  }
  const png = await pipeline.png().toBuffer();
  const meta = await sharp(png).metadata();
  fs.writeFileSync(abs, png);
  return { path: `/assets/${file}`, aspect: Number(((meta.width || 1) / (meta.height || 1)).toFixed(2)) };
}

async function buildScreenshot(id, entry) {
  if (!entry) return null;
  const file = `screenshots/${id}.jpg`;
  const abs = path.join(publicDir, file);
  if (fs.existsSync(abs) && !FORCE) {
    const meta = await sharp(abs).metadata();
    return {
      path: `/assets/${file}`,
      aspect: Number(((meta.width || 1) / (meta.height || 1)).toFixed(2))
    };
  }
  const url = entry.kind === 'dw' ? entry.url : entry.thumbUrl || entry.url;
  if (!url) return null;
  const buf = await fetchBuffer(url);
  const jpg = await sharp(buf)
    .resize({ width: 1400, height: 900, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  fs.writeFileSync(abs, jpg);
  const meta = await sharp(jpg).metadata();
  return {
    path: `/assets/${file}`,
    aspect: Number(((meta.width || 1) / (meta.height || 1)).toFixed(2))
  };
}

fs.mkdirSync(path.join(publicDir, 'logos'), { recursive: true });
fs.mkdirSync(path.join(publicDir, 'screenshots'), { recursive: true });

const assets = {};
let done = 0;
for (const distro of LINUX_DISTROS) {
  const p = plan[distro.id];
  const result = {};

  try {
    const logo = await buildLogo(distro.id, p.logo);
    if (logo) {
      result.logoUrl = logo.path;
      result.logoAspect = logo.aspect;
      result.logoCredit = p.logo.simpleIcon
        ? {
            label: 'Simple Icons',
            url: `https://simpleicons.org/?q=${p.logo.simpleIcon}`,
            license: 'CC0 1.0',
            artist: null
          }
        : p.logo.credit
          ? {
              label: p.logo.credit,
              url: p.logo.creditUrl || p.logo.url,
              license: p.logo.license || null,
              artist: null
            }
          : p.logo.descriptionUrl
            ? {
                label: 'Wikimedia Commons',
                url: p.logo.descriptionUrl,
                license: p.logo.license || 'free license',
                artist: p.logo.artist || null
              }
            : null;
    }
  } catch (err) {
    lg(`! logo ${distro.id}: ${err.message}`);
  }

  try {
    const shot = await buildScreenshot(distro.id, p.screenshot);
    if (shot) {
      result.screenshotUrl = shot.path;
      result.screenshotAspect = shot.aspect;
      result.screenshotCredit =
        p.screenshot.kind === 'dw'
          ? {
              label: 'DistroWatch',
              url: p.screenshot.pageUrl,
              license: 'Project screenshot',
              artist: null
            }
          : p.screenshot.kind === 'external'
            ? {
                label: p.screenshot.credit || 'Official project screenshot',
                url: p.screenshot.creditUrl || p.screenshot.url,
                license: p.screenshot.license || 'Project screenshot',
                artist: p.screenshot.artist || null
              }
            : {
                label: 'Wikimedia Commons',
                url: p.screenshot.descriptionUrl,
                license: p.screenshot.license || 'free license',
                artist: p.screenshot.artist || null
              };
    }
  } catch (err) {
    lg(`! screenshot ${distro.id}: ${err.message}`);
  }

  if (dwSlugs[distro.id]) result.dwSlug = dwSlugs[distro.id];
  if (result.logoUrl || result.screenshotUrl) assets[distro.id] = result;

  done++;
  if (done % 5 === 0) lg(`  ${done}/${LINUX_DISTROS.length} processed`);
  await sleep(entryDelay(plan[distro.id]));
}

function entryDelay(entry) {
  if (entry?.screenshot?.kind === 'dw') return 350;
  return 650;
}

const dataFile = path.join(root, 'src', 'data', 'distroAssets.js');
const body = `/**
 * Generated by scripts/build-assets.mjs — do not edit by hand.
 *
 * All URLs point at files downloaded into public/assets. Credits are kept with
 * each image so the UI can attribute the source and its license.
 */
export const DISTRO_ASSETS = ${JSON.stringify(assets, null, 2)};
`;
fs.writeFileSync(dataFile, body);
lg(`\nWrote ${dataFile} (${Object.keys(assets).length} distros with assets)`);
