/**
 * Probe DistroWatch for a screenshot slug for every distro.
 * Writes scripts/dw-slugs.json. Read-only network probe.
 */
import fs from 'node:fs';
import { LINUX_DISTROS } from '../src/data/distros.js';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) DistroMatchAssetBot/1.0';
const BASE = 'https://distrowatch.com/images/cgfjoewdlbc';

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

const EXTRA = {
  'linux-mint': ['mint'],
  'ubuntu': ['ubuntu'],
  'debian': ['debian'],
  'arch-linux': ['arch'],
  'fedora-workstation': ['fedora'],
  'fedora-silverblue': ['silverblue'],
  'fedora-kinoite': ['kinoite'],
  'pop-os': ['popos'],
  'manjaro': ['manjaro'],
  'endeavouros': ['endeavouros'],
  'opensuse-tumbleweed': ['opensuse', 'tumbleweed'],
  'opensuse-leap': ['opensuse', 'leap'],
  'opensuse-aeon': ['opensuse', 'aeon', 'microos'],
  'zorin-os': ['zorin'],
  'elementary-os': ['elementary'],
  'mx-linux': ['mx'],
  'kde-neon': ['neon', 'kdeneon'],
  'deepin': ['deepin'],
  'kali-linux': ['kali'],
  'parrot-sec': ['parrot'],
  'tails': ['tails'],
  'qubes-os': ['qubes'],
  'whonix': ['whonix'],
  'nixos': ['nixos'],
  'guix-system': ['guix'],
  'alpine-linux': ['alpine'],
  'void-linux': ['void'],
  'gentoo': ['gentoo'],
  'slackware': ['slackware'],
  'rhel': ['redhat'],
  'rocky-linux': ['rocky'],
  'almalinux': ['alma'],
  'oracle-linux': ['oracle'],
  'centos-stream': ['centos'],
  'alma-linux': ['alma'],
  'clear-linux': ['clearlinux'],
  'chromeos-flex': ['chromeosflex'],
  'raspberry-pi-os': ['raspbian', 'raspberrypi'],
  'truenas-scale': ['truenas'],
  'proxmox-ve': ['proxmox'],
  'openmediavault': ['openmediavault'],
  'bazzite': ['bazzite'],
  'nobara-linux': ['nobara'],
  'cachyos': ['cachyos'],
  'steamos': ['steamos'],
  'garuda-linux': ['garuda'],
  'solus': ['solus'],
  'tuxedo-os': ['tuxedo'],
  'ultramarine-linux': ['ultramarine'],
  'bluefin': ['bluefin'],
  'vanilla-os': ['vanilla'],
  'chimeraos': ['chimeraos'],
  'chimera-linux': ['chimera'],
  'dragonfly-bsd-linux-compat': ['chimera'],
  'artix-linux': ['artix'],
  'devuan': ['devuan'],
  'antix': ['antix'],
  'dietpi': ['dietpi'],
  'armbian': ['armbian'],
  'sparkylinux': ['sparky'],
  'q4os': ['q4os'],
  'bodhi-linux': ['bodhi'],
  'peppermint-os': ['peppermint'],
  'rhino-linux': ['rhino'],
  'linux-lite': ['linuxlite'],
  'drauger-os': ['drauger'],
  'regolith-linux': ['regolith'],
  'bedrock-linux': ['bedrock'],
  'easyos': ['easyos'],
  'slitaz': ['slitaz'],
  'tiny-core': ['tinycore'],
  'puppy-linux': ['puppy'],
  'calculate-linux': ['calculate'],
  'gparted-live': ['gparted'],
  'clonezilla': ['clonezilla'],
  'mobian': ['mobian'],
  'postmarketos': ['postmarketos'],
  'libreelec': ['libreelec'],
  'lakka': ['lakka'],
  'batocera': ['batocera'],
  'recalbox': ['recalbox'],
  'openwrt': ['openwrt'],
  'flatcar': ['flatcar'],
  'talos-linux': ['talos'],
  'trisquel': ['trisquel'],
  'pureos': ['pureos'],
  'parabola': ['parabola'],
  'hyperbola': ['hyperbola'],
  'blackarch': ['blackarch'],
  'archcraft': ['archcraft'],
  'mabox': ['mabox'],
  'caine': ['caine'],
  'kodachi': ['kodachi'],
  'astra-linux': ['astra'],
  'alt-linux': ['alt'],
  'kaos': ['kaos'],
  'slax': ['slax'],
  'wattos': ['wattos'],
  'solydxk': ['solydxk'],
  'bunsenlabs': ['bunsenlabs'],
  'feren-os': ['feren'],
  'voyager-live': ['voyager'],
  'regata-os': ['regata'],
  'fourm-linux': ['4mlinux', 'fourmlinux'],
  'mageia': ['mageia'],
  'openmandriva': ['openmandriva'],
  'pclinuxos': ['pclinuxos'],
  'redcore-linux': ['redcore'],
  'funtoo': ['funtoo'],
  'salix': ['salix'],
  'porteus': ['porteus'],
  'clearos': ['clearos'],
  'snal-linux': ['snal'],
  'venom-linux': ['venom'],
  'anarchy-linux': ['anarchy'],
  'archlabs': ['archlabs'],
  'rebornos': ['rebornos'],
  'arcolinux': ['arcolinux'],
  'obarun': ['obarun'],
  'kiss-linux': ['kiss'],
  'venom': ['venom'],
  'nitrux': ['nitrux'],
  'endless-os': ['endless'],
  'quibian': ['quibian'],
  'bluestar-linux': ['bluestar'],
  'pearos': ['pearos'],
  'robolinux': ['robolinux'],
  'systemrescue': ['systemrescue'],
  'debian-edu': ['debianedu'],
  'devuan': ['devuan'],
  'gobo': ['gobolinux'],
  'foresight': ['foresight'],
  'sabayon': ['sabayon'],
  'korora': ['korora'],
  'chakra': ['chakra'],
  'cauldron': ['mageia'],
  'rosa': ['rosa'],
  'agilia': ['agilia'],
  'calculate': ['calculate'],
  'hyperbola': ['hyperbola']
};

function candidates(distro) {
  const clean = distro.name
    .replace(/\(.*?\)/g, ' ')
    .replace(/GNU\/Linux/gi, ' ')
    .replace(/\bLinux\b/gi, ' ')
    .replace(/\bOS\b/gi, ' ')
    .replace(/[’']/g, '')
    .trim();

  const list = new Set();
  const add = (s) => {
    const k = norm(s);
    if (k) list.add(k);
  };

  add(distro.id);
  add(distro.name);
  clean.split(/\s+/).forEach((w) => add(w));
  add(clean);
  add(distro.id.replace(/-linux$/, ''));
  add(distro.id.replace(/-os$/, ''));
  add(distro.id.replace(/-linux$/, '').replace(/-os$/, ''));
  (EXTRA[distro.id] || []).forEach(add);

  return [...list];
}

async function exists(slug) {
  try {
    const res = await fetch(`${BASE}/${slug}.png`, {
      method: 'GET',
      headers: { 'User-Agent': UA, Range: 'bytes=0-64' }
    });
    return res.status === 200 || res.status === 206;
  } catch {
    return false;
  }
}

const results = {};
for (const distro of LINUX_DISTROS) {
  let found = null;
  for (const slug of candidates(distro)) {
    const ok = await exists(slug);
    if (ok) {
      found = slug;
      break;
    }
  }
  results[distro.id] = found;
  console.log(`${found ? '✓' : '✗'} ${distro.id} -> ${found || 'none'}`);
  fs.writeFileSync(new URL('./dw-slugs.json', import.meta.url), JSON.stringify(results, null, 2));
}
