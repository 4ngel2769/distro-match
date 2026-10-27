/**
 * Asset discovery helper.
 *
 * Queries the Wikimedia Commons API for logo + screenshot candidates for every
 * distro in the local database and stores the raw result set so a human (or the
 * build script) can pick correct files. Commons is used because every file has
 * a documented free license and a stable, hotlink-friendly URL.
 *
 * Run: node scripts/discover-assets.mjs
 * Output: scripts/asset-candidates.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LINUX_DISTROS } from '../src/data/distros.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'asset-candidates.json');

const UA = 'DistroMatch/2.0 (https://github.com/distro-match; asset research; contact: distro-match@example.com)';
const API = 'https://commons.wikimedia.org/w/api.php';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(params, attempt = 0) {
  const url = new URL(API);
  Object.entries({ format: 'json', maxlag: '5', ...params }).forEach(([k, v]) => url.searchParams.set(k, v));
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, 'Api-User-Agent': UA } });
    if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`Non-JSON response: ${text.slice(0, 120)}`);
    }
    if (json.error) throw new Error(`${json.error.code}: ${json.error.info}`);
    return json;
  } catch (err) {
    if (attempt >= 4) throw err;
    const backoff = 4000 * (attempt + 1);
    console.warn(`  retry ${attempt + 1} after ${backoff}ms (${err.message})`);
    await sleep(backoff);
    return api(params, attempt + 1);
  }
}

/** Search file namespace, return enriched file records. */
async function searchFiles(query, limit = 10) {
  const found = await api({
    action: 'query',
    list: 'search',
    srsearch: query,
    srnamespace: '6',
    srlimit: String(limit)
  });
  const titles = (found.query?.search || []).map((s) => s.title);
  if (!titles.length) return [];

  const info = await api({
    action: 'query',
    titles: titles.join('|'),
    prop: 'imageinfo',
    iiprop: 'url|size|mime|extmetadata',
    iiurlwidth: '1600'
  });

  const pages = Object.values(info.query?.pages || {});
  const byTitle = new Map();
  for (const p of pages) {
    const ii = p.imageinfo?.[0];
    if (!ii) continue;
    const meta = ii.extmetadata || {};
    byTitle.set(p.title, {
      title: p.title,
      mime: ii.mime,
      width: ii.width,
      height: ii.height,
      size: ii.size,
      url: ii.url,
      thumbUrl: ii.thumburl || ii.url,
      descriptionUrl: ii.descriptionurl,
      license: meta.LicenseShortName?.value || null,
      artist: (meta.Artist?.value || '').replace(/<[^>]+>/g, '').trim() || null
    });
  }
  return titles.map((t) => byTitle.get(t)).filter(Boolean);
}

const ALIASES = {
  'parrot-sec': ['Parrot OS', 'Parrot Security'],
  'mx-linux': ['MX Linux'],
  'vanilla-os': ['Vanilla OS'],
  'chimera-linux': ['Chimera Linux'],
  'dragonfly-bsd-linux-compat': ['Chimera Linux'],
  'fourm-linux': ['4MLinux'],
  'opensuse-aeon': ['openSUSE MicroOS', 'openSUSE Aeon'],
  'opensuse-tumbleweed': ['openSUSE Tumbleweed', 'openSUSE'],
  'opensuse-leap': ['openSUSE Leap', 'openSUSE'],
  'elementary-os': ['elementary OS'],
  'chromeos-flex': ['ChromeOS Flex', 'Chrome OS Flex'],
  'raspberry-pi-os': ['Raspberry Pi OS', 'Raspbian'],
  'truenas-scale': ['TrueNAS SCALE', 'TrueNAS'],
  'proxmox-ve': ['Proxmox VE', 'Proxmox'],
  'openmediavault': ['OpenMediaVault'],
  'puppy-linux': ['Puppy Linux'],
  'tiny-core': ['Tiny Core Linux'],
  'calculate-linux': ['Calculate Linux'],
  'clear-linux': ['Clear Linux OS', 'Clear Linux'],
  'clearos': ['ClearOS'],
  'caine': ['CAINE'],
  'kodachi': ['Kodachi Linux'],
  'kde-neon': ['KDE neon'],
  'deepin': ['deepin'],
  'feren-os': ['Feren OS'],
  'regata-os': ['Regata OS'],
  'voyager-live': ['Voyager Live'],
  'alt-linux': ['ALT Linux'],
  'kaos': ['KaOS'],
  'slax': ['Slax'],
  'wattos': ['wattOS'],
  'solydxk': ['SolydXK'],
  'mabox': ['Mabox Linux'],
  'bunsenlabs': ['BunsenLabs'],
  'openwrt': ['OpenWrt'],
  'libreelec': ['LibreELEC'],
  'lakka': ['Lakka'],
  'batocera': ['Batocera'],
  'recalbox': ['Recalbox'],
  'flatcar': ['Flatcar Container Linux', 'Flatcar'],
  'talos-linux': ['Talos Linux'],
  'postmarketos': ['postmarketOS'],
  'hyperbola': ['Hyperbola GNU/Linux-libre', 'Hyperbola'],
  'parabola': ['Parabola GNU/Linux-libre', 'Parabola'],
  'blackarch': ['BlackArch'],
  'ultramarine-linux': ['Ultramarine Linux'],
  'nobara-linux': ['Nobara Linux', 'Nobara'],
  'bazzite': ['Bazzite'],
  'cachyos': ['CachyOS'],
  'steamos': ['SteamOS'],
  'garuda-linux': ['Garuda Linux'],
  'solus': ['Solus'],
  'zorin-os': ['Zorin OS'],
  'pop-os': ['Pop!_OS', 'Pop OS'],
  'ubuntu-budgie': ['Ubuntu Budgie'],
  'ubuntu-studio': ['Ubuntu Studio'],
  'q4os': ['Q4OS'],
  'bodhi-linux': ['Bodhi Linux'],
  'peppermint-os': ['Peppermint OS'],
  'rhino-linux': ['Rhino Linux'],
  'linux-lite': ['Linux Lite'],
  'drauger-os': ['Drauger OS'],
  'regolith-linux': ['Regolith Linux', 'Regolith'],
  'bedrock-linux': ['Bedrock Linux'],
  'easyos': ['EasyOS'],
  'slitaz': ['SliTaz'],
  'gparted-live': ['GParted'],
  'clonezilla': ['Clonezilla'],
  'mobian': ['Mobian'],
  'nixos': ['NixOS'],
  'guix-system': ['Guix System', 'GNU Guix'],
  'trisquel': ['Trisquel'],
  'pureos': ['PureOS'],
  'whonix': ['Whonix'],
  'qubes-os': ['Qubes OS'],
  'tails': ['Tails'],
  'alpine-linux': ['Alpine Linux'],
  'void-linux': ['Void Linux'],
  'antix': ['antiX'],
  'artix-linux': ['Artix Linux'],
  'devuan': ['Devuan'],
  'dietpi': ['DietPi'],
  'armbian': ['Armbian'],
  'sparkylinux': ['SparkyLinux'],
  'tuxedo-os': ['TUXEDO OS', 'Tuxedo OS'],
  'fedora-silverblue': ['Fedora Silverblue'],
  'fedora-kinoite': ['Fedora Kinoite'],
  'rocky-linux': ['Rocky Linux'],
  'almalinux': ['AlmaLinux'],
  'oracle-linux': ['Oracle Linux'],
  'centos-stream': ['CentOS Stream'],
  'rhel': ['Red Hat Enterprise Linux'],
  'bluefin': ['Project Bluefin', 'Bluefin'],
  'geckolinux': ['GeckoLinux'],
  'mageia': ['Mageia'],
  'openmandriva': ['OpenMandriva'],
  'pclinuxos': ['PCLinuxOS'],
  'redcore-linux': ['Redcore Linux'],
  'funtoo': ['Funtoo'],
  'salix': ['Salix OS', 'Salix'],
  'porteus': ['Porteus'],
  'astra-linux': ['Astra Linux'],
  'alt-linux': ['ALT Linux'],
  'opensuselinux': ['openSUSE']
};

function tokens(distro) {
  const clean = distro.name
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .replace(/\bGNU\/Linux\b/gi, '')
    .replace(/\bLinux\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  const list = new Set([distro.name, clean, ...(ALIASES[distro.id] || [])]);
  return [...list].filter((t) => t && t.length > 1);
}

const queriesFor = (distro) => {
  const [primary, ...rest] = tokens(distro);
  const alt = rest[0] || primary;
  return {
    logo: [
      `intitle:"${primary}" logo`,
      `"${primary}" logo`,
      `intitle:"${alt}" logo`,
      `"${alt}" icon`
    ],
    screenshot: [
      `intitle:"${primary}" desktop`,
      `"${primary}" screenshot`,
      `intitle:"${alt}" desktop`,
      `"${alt}" screenshot`
    ]
  };
};

const onlyNew = process.argv.includes('--resume')
  ? new Set(Object.keys(JSON.parse(fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '{}')))
  : new Set();

const results = fs.existsSync(OUT) && process.argv.includes('--resume')
  ? JSON.parse(fs.readFileSync(OUT, 'utf8'))
  : {};

for (const distro of LINUX_DISTROS) {
  if (onlyNew.has(distro.id)) {
    console.log(`skip ${distro.id}`);
    continue;
  }
  const q = queriesFor(distro);
  const logos = [];
  const screenshots = [];
  for (const query of q.logo) {
    await sleep(1100);
    try {
      const files = await searchFiles(query, 8);
      logos.push(...files);
    } catch (e) {
      console.warn(`  logo query failed "${query}": ${e.message}`);
    }
    if (logos.length >= 12) break;
  }
  for (const query of q.screenshot) {
    await sleep(1100);
    try {
      const files = await searchFiles(query, 8);
      screenshots.push(...files);
    } catch (e) {
      console.warn(`  shot query failed "${query}": ${e.message}`);
    }
    if (screenshots.length >= 16) break;
  }

  const dedupe = (arr) => [...new Map(arr.map((f) => [f.title, f])).values()];
  results[distro.id] = {
    name: distro.name,
    tokens: tokens(distro),
    logos: dedupe(logos),
    screenshots: dedupe(screenshots)
  };
  fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
  console.log(
    `✓ ${distro.id}: ${results[distro.id].logos.length} logo cands, ${results[distro.id].screenshots.length} screenshot cands`
  );
}

console.log(`\nWrote ${Object.keys(results).length} distro records to ${OUT}`);
