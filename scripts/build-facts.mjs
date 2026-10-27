/**
 * Build src/data/distroFacts.js from DistroWatch.
 *
 * - Current page-hit rank comes from the live "Last 12 months" table.
 * - Historical ranks come from the Internet Archive snapshots taken each
 *   January, so the 2024 figure is the 2024 calendar-year ranking.
 * - First/latest release dates come from each distribution's DistroWatch page.
 *
 * The generated file is merged into LINUX_DISTROS so the UI can sort by
 * popularity, age, or last release without hotlinking or runtime requests.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(ROOT, 'src', 'data', 'distroFacts.js');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) DistroMatch/2.0';

const dwSlugs = JSON.parse(fs.readFileSync(path.join(HERE, 'dw-slugs.json'), 'utf8'));
const slugToIds = new Map();
for (const [id, slug] of Object.entries(dwSlugs)) {
  if (!slug) continue;
  if (!slugToIds.has(slug)) slugToIds.set(slug, []);
  slugToIds.get(slug).push(id);
}

const SNAPSHOTS = [
  [2021, '20220111152846'],
  [2022, '20230105150716'],
  [2023, '20240104164758'],
  [2024, '20250107010958'],
  [2025, '20260105001831']
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchText(url, tries = 3) {
  let lastError;
  for (let attempt = 0; attempt < tries; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (error) {
      lastError = error;
      await sleep(700 * (attempt + 1));
    }
  }
  throw lastError;
}

/** Parse the first table after the "Last 12 months" heading. */
function parseRanking(html) {
  const start = html.indexOf('Last 12 months');
  if (start < 0) return new Map();
  const end = html.indexOf('Last 6 months', start);
  const block = html.slice(start, end > start ? end : start + 160000);
  const ranks = new Map();
  const row = /<th class="phr1">\s*(\d+)\s*<\/th>\s*<td class="phr2"><a[^>]*href="([^"]+)"[^>]*>/g;
  let match;
  while ((match = row.exec(block))) {
    const rank = Number(match[1]);
    const slug = match[2].replace(/^.*[?&]distribution=/, '').replace(/[#?].*$/, '');
    for (const id of slugToIds.get(slug) || []) {
      if (!ranks.has(id)) ranks.set(id, rank);
    }
  }
  return ranks;
}

async function fetchRankings() {
  const byYear = {};
  const liveHtml = await fetchText('https://distrowatch.com/dwres.php?resource=popularity');
  byYear.current = parseRanking(liveHtml);
  console.log(`Ranking current: ${byYear.current.size} matched`);

  for (const [year, timestamp] of SNAPSHOTS) {
    await sleep(500);
    try {
      const html = await fetchText(
        `https://web.archive.org/web/${timestamp}id_/https://distrowatch.com/dwres.php?resource=popularity`
      );
      byYear[year] = parseRanking(html);
      console.log(`Ranking ${year}: ${byYear[year].size} matched`);
    } catch (error) {
      byYear[year] = new Map();
      console.warn(`Ranking ${year} failed: ${error.message}`);
    }
  }
  return byYear;
}

/** Release dates live in the first `<th>Release Date</th>` table row. */
function parseReleaseDates(html) {
  const marker = html.indexOf('<th>Release Date</th>');
  if (marker < 0) return { firstRelease: null, latestRelease: null };
  const rest = html.slice(marker + 24, marker + 30000);
  const stop = rest.search(/<th[^>]*>(?!Release Date)/);
  const block = stop >= 0 ? rest.slice(0, stop) : rest;
  const dates = [...block.matchAll(/class="Date">\s*(\d{4}-\d{2}(?:-\d{2})?)\s*</g)]
    .map((match) => match[1])
    .filter((date) => /^\d{4}-\d{2}(-\d{2})?$/.test(date));
  if (!dates.length) return { firstRelease: null, latestRelease: null };
  dates.sort();
  return { firstRelease: dates[0], latestRelease: dates[dates.length - 1] };
}

async function fetchFacts() {
  const ids = Object.keys(dwSlugs);
  const facts = {};
  let done = 0;
  const queue = [...ids];

  async function worker() {
    while (queue.length) {
      const id = queue.shift();
      const slug = dwSlugs[id];
      try {
        const html = await fetchText(`https://distrowatch.com/table.php?distribution=${encodeURIComponent(slug)}`);
        facts[id] = parseReleaseDates(html);
        const title = html.match(/<title>[^<]*?: ([^<]+)<\/title>/i);
        if (title) facts[id].distroWatchName = title[1].trim();
      } catch (error) {
        facts[id] = { firstRelease: null, latestRelease: null };
        console.warn(`${id}: ${error.message}`);
      }
      done++;
      if (done % 20 === 0) console.log(`Facts: ${done}/${ids.length}`);
    }
  }

  await Promise.all([worker(), worker(), worker(), worker()]);
  return facts;
}

const rankings = await fetchRankings();
const dates = await fetchFacts();

const output = {};
for (const id of Object.keys(dwSlugs)) {
  const rankHistory = {};
  for (const [year] of SNAPSHOTS) {
    if (rankings[year]?.has(id)) rankHistory[year] = rankings[year].get(id);
  }
  const currentRank = rankings.current?.get(id) ?? null;
  output[id] = {
    dwRank: currentRank,
    firstRelease: dates[id]?.firstRelease ?? null,
    latestRelease: dates[id]?.latestRelease ?? null,
    rankHistory
  };
}

const header = `/**
 * Generated by scripts/build-facts.mjs - do not edit by hand.
 *
 * Popularity: live DistroWatch page-hit rank plus Internet Archive
 * snapshots (January) for each calendar year. Dates: DistroWatch release
 * tables. Entries with no data are null and the UI shows "unranked".
 */
export const POPULARITY_YEARS = ${JSON.stringify(SNAPSHOTS.map(([year]) => year))};

export const DISTRO_FACTS = `;

fs.writeFileSync(OUT, `${header}${JSON.stringify(output, null, 2)};\n`, 'utf8');
console.log(`Wrote ${OUT} (${Object.keys(output).length} distributions)`);
