import fs from 'node:fs';
import path from 'node:path';
import { LINUX_DISTROS } from '../src/data/distros.js';
import { DISTRO_ASSETS } from '../src/data/distroAssets.js';
import { DISTRO_GALLERIES } from '../src/data/distroGalleries.js';
const ids = new Set();
const problems = [];
const screenshotUrls = new Set();
let logos = 0, shots = 0, galleryImages = 0, galleries = 0;
for (const d of LINUX_DISTROS) {
  if (ids.has(d.id)) problems.push(`duplicate id: ${d.id}`);
  ids.add(d.id);
  const a = DISTRO_ASSETS[d.id];
  if (!a) { problems.push(`no asset record: ${d.id}`); continue; }
  for (const [kind, urlKey, creditKey] of [['logo','logoUrl','logoCredit'],['screenshot','screenshotUrl','screenshotCredit']]) {
    const url = a[urlKey];
    if (!url) continue;
    if (!url.startsWith('/assets/')) problems.push(`${d.id} ${kind} path not /assets/: ${url}`);
    const file = path.join('public', url.replace(/^\//, ''));
    if (!fs.existsSync(file)) problems.push(`${d.id} ${kind} missing file: ${file}`);
    else if (fs.statSync(file).size === 0) problems.push(`${d.id} ${kind} empty file: ${file}`);
    const credit = a[creditKey];
    if (!credit?.url || !credit?.label) problems.push(`${d.id} ${kind} missing credit: ${JSON.stringify(credit)}`);
    if (kind === 'logo') logos++;
    else {
      shots++;
      screenshotUrls.add(url);
    }
  }
}
for (const id of Object.keys(DISTRO_ASSETS)) if (!ids.has(id)) problems.push(`asset for unknown distro: ${id}`);
for (const [id, images] of Object.entries(DISTRO_GALLERIES)) {
  if (!ids.has(id)) {
    problems.push(`gallery for unknown distro: ${id}`);
    continue;
  }
  if (!Array.isArray(images) || images.length === 0) {
    problems.push(`empty gallery: ${id}`);
    continue;
  }
  galleries++;
  for (const image of images) {
    const url = image.url;
    if (!url || !url.startsWith('/assets/screenshots/gallery/')) {
      problems.push(`${id} gallery path not /assets/screenshots/gallery/: ${url}`);
      continue;
    }
    if (screenshotUrls.has(url)) problems.push(`${id} duplicate gallery screenshot: ${url}`);
    screenshotUrls.add(url);
    const file = path.join('public', url.replace(/^\//, ''));
    if (!fs.existsSync(file)) problems.push(`${id} gallery missing file: ${file}`);
    else if (fs.statSync(file).size === 0) problems.push(`${id} gallery empty file: ${file}`);
    if (!image.credit?.url || !image.credit?.label) {
      problems.push(`${id} gallery missing credit: ${url}`);
    }
    if (!image.title) problems.push(`${id} gallery missing title: ${url}`);
    if (!Number.isFinite(image.aspect) || image.aspect <= 0) {
      problems.push(`${id} gallery invalid aspect: ${url}`);
    }
    galleryImages++;
  }
}
console.log(`distros=${LINUX_DISTROS.length} logos=${logos} screenshots=${shots} galleries=${galleries} gallery_images=${galleryImages}`);
console.log(problems.length ? problems.join('\n') : 'OK: all asset paths exist and have credits');
