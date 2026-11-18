/**
 * LinuxMatch recommendation engine (v4).
 *
 *  - Every answer produces a normalised 0..1 satisfaction value against a real
 *    distro field. A distro cannot win by collecting easy positive points.
 *  - Importance is explicit: 1 = nice to have, 2 = important, 3 = must-have.
 *    A must-have on a factual constraint becomes a hard filter.
 *  - Conditional questions (NVIDIA drivers) are only scored when asked.
 *  - The shortlist is diversified so the alternatives are real alternatives.
 */
import { LINUX_DISTROS } from '../data/distros.js';
import { QUESTIONS_DATA, visibleQuestions } from '../data/questions.js';

/** Default importance (1–3) for each question. */
const QUESTION_DEFAULT_WEIGHTS = Object.fromEntries(
  QUESTIONS_DATA.map((q) => [q.id, q.defaultWeight || 1])
);

const LEVEL_FIT = {
  new: { beginner: 1, intermediate: 0.5, advanced: 0.18, expert: 0.1 },
  casual: { beginner: 0.9, intermediate: 1, advanced: 0.62, expert: 0.38 },
  confident: { beginner: 0.55, intermediate: 0.92, advanced: 1, expert: 0.72 },
  expert: { beginner: 0.35, intermediate: 0.62, advanced: 0.85, expert: 1 }
};

const UPDATE_FIT = {
  lts: { fixed: 1, 'semi-rolling': 0.72, rolling: 0.32, 'immutable-atomic': 0.78 },
  point: { fixed: 0.86, 'semi-rolling': 1, rolling: 0.58, 'immutable-atomic': 0.5 },
  rolling: { fixed: 0.3, 'semi-rolling': 0.72, rolling: 1, 'immutable-atomic': 0.45 },
  atomic: { fixed: 0.25, 'semi-rolling': 0.4, rolling: 0.3, 'immutable-atomic': 1 }
};

const GOAL_MATCHERS = {
  everyday: (d) =>
    (d.primaryUseCases || []).some((u) => u === 'daily-driver' || u === 'general-purpose'),
  gaming: (d) =>
    (d.primaryUseCases || []).includes('gaming') || hasFeature(d, 'gaming', 'gamescope', 'proton'),
  development: (d) => (d.primaryUseCases || []).includes('software-development'),
  creative: (d) =>
    (d.primaryUseCases || []).some((u) => u === 'creative-multimedia' || u === 'multimedia-creation'),
  privacy: (d) =>
    (d.primaryUseCases || []).includes('privacy-anonymity') ||
    hasFeature(d, 'anonymity', 'tor', 'amnesic', 'privacy'),
  server: (d) => (d.primaryUseCases || []).includes('server-homelab'),
  revive: (d) => ['potatoes-vintage', 'lightweight'].includes(d.hardwareSpec)
};

const GOAL_LABELS = {
  everyday: 'everyday use',
  gaming: 'gaming',
  development: 'development',
  creative: 'creative work',
  privacy: 'privacy and security work',
  server: 'server / homelab use',
  revive: 'low-spec hardware'
};

const DESKTOP_STYLES = {
  modern: ['gnome', 'cosmic', 'pantheon'],
  plasma: ['kde', 'plasma'],
  classic: ['xfce', 'mate', 'cinnamon', 'budgie', 'lxde', 'lxqt'],
  tiling: ['i3', 'sway', 'hyprland', 'bspwm', 'dwm', 'qtile', 'river', 'awesome'],
  minimal: ['openbox', 'icewm', 'jwm', 'fluxbox', 'blackbox', 'window maker', 'twm'],
  headless: ['cli', 'headless', 'console', 'none']
};

const DESKTOP_LABELS = {
  modern: 'GNOME / COSMIC',
  plasma: 'KDE Plasma',
  classic: 'XFCE / MATE / Cinnamon',
  tiling: 'tiling window manager',
  minimal: 'lightweight floating',
  headless: 'headless CLI'
};

const GAMING_SPECIALISTS = new Set([
  'bazzite', 'nobara-linux', 'cachyos', 'steamos', 'chimeraos', 'garuda-linux',
  'drauger-os', 'regata-os', 'pop-os', 'batocera', 'lakka', 'recalbox'
]);

const PRIVACY_SPECIALISTS = new Set([
  'tails', 'whonix', 'qubes-os', 'kodachi', 'pureos', 'parrot-sec'
]);

const AMNESIC_SPECIALISTS = new Set(['tails', 'whonix', 'qubes-os', 'kodachi']);

const LIVE_IMAGE_DISTROS = new Set([
  'gparted-live', 'clonezilla', 'systemrescuecd', 'ventoy', 'rescatux'
]);

const CORP_BACKED = new Set([
  'ubuntu', 'kubuntu', 'xubuntu', 'lubuntu', 'ubuntu-budgie', 'ubuntu-studio',
  'fedora-workstation', 'fedora-silverblue', 'fedora-kinoite', 'rhel', 'rocky-linux',
  'almalinux', 'oracle-linux', 'centos-stream', 'opensuse-tumbleweed', 'opensuse-leap',
  'opensuse-aeon', 'tuxedo-os', 'zorin-os', 'pop-os', 'deepin', 'clear-linux',
  'truenas-scale', 'proxmox-ve', 'chromeos-flex', 'clearos'
]);

const COMMUNITY_GOVERNED = new Set([
  'debian', 'arch-linux', 'void-linux', 'artix-linux', 'devuan', 'antix', 'alpine-linux',
  'slackware', 'gentoo', 'nixos', 'guix-system', 'trisquel', 'parabola', 'hyperbola',
  'mx-linux', 'linux-mint', 'elementary-os', 'solus', 'mageia', 'openmandriva',
  'pclinuxos', 'kaos', 'salix', 'slax', 'porteus', 'tiny-core', 'slitaz'
]);

const FAMILY_RELATIVES = {
  Ubuntu: ['Debian'],
  Debian: ['Ubuntu'],
  Arch: ['Gentoo', 'Slackware'],
  'Fedora/RHEL': ['openSUSE'],
  openSUSE: ['Fedora/RHEL'],
  Gentoo: ['Arch', 'Slackware'],
  Slackware: ['Arch', 'Gentoo'],
  Independent: []
};

const PRIORITY_LABELS = {
  stability: 'rock-solid stability',
  gaming: 'gaming performance',
  freshness: 'up-to-date software',
  simplicity: 'ease of use',
  freedom: 'software freedom',
  privacy: 'privacy and anonymity',
  lightness: 'speed on modest hardware',
  reproducibility: 'reproducible system state'
};

function hasFeature(distro, ...needles) {
  const haystack = [
    ...(distro.specialFeatures || []),
    distro.packageManager || '',
    distro.base || '',
    ...(distro.desktopEnvironments || [])
  ]
    .join(' ')
    .toLowerCase();
  return needles.some((raw) => {
    const needle = raw.toLowerCase().trim();
    if (!needle) return false;
    const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '[-_ ]');
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`).test(haystack);
  });
}

const clamp01 = (n) => Math.max(0, Math.min(1, n));
const prettyGoal = (id) => GOAL_LABELS[id] || id;
const prettyDesktop = (id) => DESKTOP_LABELS[id] || id;
const prettyPriority = (id) => PRIORITY_LABELS[id] || id;

function prettyRelease(id) {
  return {
    fixed: 'fixed / LTS',
    'semi-rolling': 'semi-rolling',
    rolling: 'rolling',
    'immutable-atomic': 'immutable / atomic'
  }[id] || id;
}

function desktopStylesOf(distro) {
  const des = (distro.desktopEnvironments || []).map((d) => d.toLowerCase());
  const styles = new Set();
  for (const [style, keys] of Object.entries(DESKTOP_STYLES)) {
    if (des.some((de) => keys.some((k) => de.includes(k) || k.includes(de)))) styles.add(style);
  }
  if (!styles.size) styles.add('headless');
  return styles;
}

function isGamingDistro(distro) {
  return GAMING_SPECIALISTS.has(distro.id) || (distro.primaryUseCases || []).includes('gaming');
}

function buildCriteria(distro, answers, questionWeights) {
  const weightFor = (qid) =>
    Math.max(1, Math.min(3, questionWeights?.[qid] ?? QUESTION_DEFAULT_WEIGHTS[qid] ?? 1));
  const mustHave = (qid) => weightFor(qid) === 3;

  const criteria = [];
  const hardFails = [];

  const add = (id, label, value, note, gap) => {
    if (value == null) return;
    criteria.push({
      id,
      label,
      value: clamp01(value),
      weight: weightFor(id),
      note: note || null,
      gap: gap || null
    });
  };

  /** Answers that apply to every distro equally must not dilute the average. */
  const addNeutral = (id, label, value) => {
    if (value == null) return;
    criteria.push({ id, label, value: clamp01(value), weight: 0, note: null, gap: null, neutral: true });
  };

  // 1 — Experience
  const experience = answers.q_experience;
  if (experience && LEVEL_FIT[experience]) {
    const v = LEVEL_FIT[experience][distro.userLevel] ?? 0.3;
    add(
      'q_experience',
      'Experience fit',
      v,
      v >= 0.9 ? `Pitched at ${distro.userLevel} users like you` : null,
      v < 0.5 ? `Assumes ${distro.userLevel} Linux skills — expect to read docs` : null
    );
  }

  // 2 — Primary goal (soft for everyday: most desktops can do it)
  const goal = answers.q_goal;
  if (goal && GOAL_MATCHERS[goal]) {
    const matched = GOAL_MATCHERS[goal](distro);
    const v = matched ? 1 : (goal === 'everyday' ? 0.7 : 0.15);
    if (!matched && goal !== 'everyday' && mustHave('q_goal')) {
      hardFails.push(`Not built for ${prettyGoal(goal)} — wrong tool for the job`);
    }
    add(
      'q_goal',
      'Primary use fit',
      v,
      matched ? `Built for ${prettyGoal(goal)}` : null,
      !matched ? `Not specialised for ${prettyGoal(goal)}` : null
    );
  }

  // 3 — Device
  const device = answers.q_device;
  if (device === 'handheld') {
    const v = ['bazzite', 'steamos', 'chimeraos'].includes(distro.id) ||
      hasFeature(distro, 'handheld', 'gamescope') ? 1 : isGamingDistro(distro) ? 0.55 : 0.2;
    add('q_device', 'Handheld support', v,
      v === 1 ? 'Gamescope session built for handhelds' : null,
      v < 0.5 ? 'No controller-first session' : null);
  } else if (device === 'server') {
    const v = (distro.primaryUseCases || []).includes('server-homelab') ? 1 : 0.2;
    add('q_device', 'Server / homelab role', v,
      v === 1 ? 'Headless and server oriented' : null,
      v < 0.5 ? 'Desktop-first distribution' : null);
  } else if (device === 'old-pc') {
    const v = {
      'potatoes-vintage': 1,
      lightweight: 0.85,
      'modern-standard': 0.35,
      'high-end-workstation': 0.15
    }[distro.hardwareSpec] ?? 0.4;
    if (v < 0.5 && mustHave('q_device')) {
      hardFails.push('Expects modern hardware — a poor fit for an old machine');
    }
    add('q_device', 'Low-spec device fit', v,
      v >= 0.9 ? 'Designed for old and low-spec hardware' : null,
      v < 0.5 ? 'Expects modern hardware' : null);
  } else if (device === 'laptop') {
    const v = hasFeature(distro, 'power', 'battery', 'tlp', 'auto-cpufreq', 'laptop') ? 1 : 0.78;
    add('q_device', 'Laptop support', v, v === 1 ? 'Power and suspend tooling included' : null);
  } else if (device === 'living-room') {
    const v = isGamingDistro(distro) || hasFeature(distro, 'htpc', 'media-center', 'gamescope') ? 0.9 : 0.65;
    add('q_device', 'Living-room fit', v);
  } else {
    addNeutral('q_device', 'Desktop form factor', 0.85);
  }

  // 4 — Memory
  const memory = answers.q_memory;
  if (memory) {
    const fit = {
      under2: { 'potatoes-vintage': 1, lightweight: 0.7, 'modern-standard': 0.2, 'high-end-workstation': 0.05 },
      low: { 'potatoes-vintage': 1, lightweight: 1, 'modern-standard': 0.6, 'high-end-workstation': 0.25 },
      mainstream: { 'potatoes-vintage': 0.55, lightweight: 0.85, 'modern-standard': 1, 'high-end-workstation': 0.95 },
      workstation: { 'potatoes-vintage': 0.7, lightweight: 0.85, 'modern-standard': 1, 'high-end-workstation': 1 }
    }[memory] || {};
    const v = fit[distro.hardwareSpec] ?? 0.6;
    const tooHeavy = (memory === 'under2' && ['modern-standard', 'high-end-workstation'].includes(distro.hardwareSpec)) ||
      (memory === 'low' && distro.hardwareSpec === 'high-end-workstation');
    if (tooHeavy && mustHave('q_memory')) {
      hardFails.push(`Needs ${distro.recommendedRam} for comfort — above your memory budget`);
    }
    add('q_memory', 'Memory footprint', v,
      v >= 0.95 ? `Fits your RAM budget (${distro.minRam} min)` : null,
      v < 0.5 ? `Needs ${distro.recommendedRam} for comfort — above your RAM budget` : null);
  }

  // 5 — Graphics hardware
  const graphics = answers.q_graphics;
  if (graphics === 'nvidia') {
    let v = distro.gpuSupport === 'excellent-nvidia' ? 1
      : distro.gpuSupport === 'standard-nvidia' ? 0.65 : 0.2;
    if (hasFeature(distro, 'nvidia')) v = Math.max(v, 0.9);
    if (distro.gpuSupport === 'mesa-only') {
      hardFails.push('No proprietary NVIDIA driver support — your GPU will not accelerate');
      v = 0;
    }
    add('q_graphics', 'NVIDIA driver support', v,
      v >= 0.9 ? 'First-class NVIDIA driver story' : null,
      v < 0.5 ? 'No turnkey NVIDIA setup; manual driver work required' : null);
  } else if (graphics === 'amd') {
    const v = distro.apuSupport === 'stellar-apu-gaming' || hasFeature(distro, 'amd', 'mesa', 'vulkan') ? 1 : 0.75;
    add('q_graphics', 'AMD / Mesa support', v,
      v === 1 ? 'Modern Mesa + AMDGPU stack' : null);
  } else if (graphics === 'intel') {
    const v = hasFeature(distro, 'mesa', 'intel') ? 1 : 0.85;
    add('q_graphics', 'Intel graphics support', v, v === 1 ? 'Solid Intel Mesa support' : null);
  } else if (graphics === 'intel-arc') {
    const v = ['rolling', 'semi-rolling'].includes(distro.releaseModel) ? 1 : 0.4;
    if (v < 0.5 && mustHave('q_graphics')) {
      hardFails.push('Frozen kernel — Intel Arc needs a recent kernel and Mesa');
    }
    add('q_graphics', 'Fresh kernel for Intel Arc', v,
      v === 1 ? 'Rolling kernel keeps Arc drivers current' : null,
      v < 0.5 ? 'Frozen kernel — Arc needs 6.8+ for stability' : null);
  } else if (graphics === 'arm') {
    const supported = (distro.architectures || []).includes('arm64');
    if (!supported) hardFails.push('No ARM64 build — cannot run on your machine');
    add('q_graphics', 'ARM64 availability', supported ? 1 : 0,
      supported ? 'Official ARM64 image' : null,
      supported ? null : 'x86_64 only');
  } else if (graphics === 'legacy') {
    const v = ['potatoes-vintage', 'lightweight'].includes(distro.hardwareSpec) ? 1 : 0.45;
    add('q_graphics', 'Legacy GPU friendliness', v,
      v === 1 ? 'Lightweight stack suits old GPUs' : null,
      v < 0.5 ? 'Heavy desktop stack for legacy graphics' : null);
  }

  // 6 — NVIDIA delivery (only asked when relevant)
  const nvidia = answers.q_nvidia;
  if (nvidia === 'turnkey-iso') {
    const v = distro.gpuSupport === 'excellent-nvidia' && hasFeature(distro, 'nvidia') ? 1
      : distro.gpuSupport === 'excellent-nvidia' ? 0.75 : 0.25;
    add('q_nvidia', 'Preinstalled NVIDIA image', v,
      v === 1 ? 'Dedicated NVIDIA ISO or image' : null,
      v < 0.5 ? 'No preinstalled NVIDIA variant' : null);
  } else if (nvidia === 'driver-manager') {
    const v = hasFeature(distro, 'driver-manager', 'mhwd', 'hardware-detection') ||
      distro.gpuSupport === 'excellent-nvidia' ? 1 : 0.5;
    add('q_nvidia', 'Graphical driver manager', v,
      v === 1 ? 'GUI driver tooling included' : null,
      v < 0.5 ? 'Drivers via CLI only' : null);
  } else if (nvidia === 'libre-only') {
    const v = distro.freeSoftwareStrictness === '100-libre-fsf' ? 1 : 0.3;
    if (v < 1 && mustHave('q_nvidia')) {
      hardFails.push('Ships proprietary GPU firmware — conflicts with open-source-only drivers');
    }
    add('q_nvidia', 'Open-source-only graphics', v,
      v === 1 ? 'Ships libre graphics stack only' : null,
      v < 1 ? 'Includes proprietary GPU blobs' : null);
  } else if (nvidia === 'manual-cli') {
    addNeutral('q_nvidia', 'NVIDIA driver installation', 0.9);
  }

  // 7 — Update cadence
  const updates = answers.q_updates;
  if (updates && UPDATE_FIT[updates]) {
    const v = UPDATE_FIT[updates][distro.releaseModel] ?? 0.4;
    add('q_updates', 'Release cadence', v,
      v >= 0.9 ? `${prettyRelease(distro.releaseModel)} as requested` : null,
      v < 0.5 ? `Is ${prettyRelease(distro.releaseModel)}; you asked for ${prettyRelease(updates)}` : null);
  }

  // 8 — Maintenance tolerance
  const maintenance = answers.q_maintenance;
  if (maintenance === 'set-and-forget') {
    const v = { beginner: 1, intermediate: 0.8, advanced: 0.35, expert: 0.15 }[distro.userLevel] ?? 0.5;
    const bonus = distro.releaseModel === 'immutable-atomic' ? 0.05 : 0;
    add('q_maintenance', 'Low-maintenance operation', clamp01(v + bonus),
      v >= 0.9 ? 'Set-and-forget update model' : null,
      v < 0.5 ? 'Expects regular manual maintenance' : null);
  } else if (maintenance === 'light-touch') {
    const v = { beginner: 0.8, intermediate: 1, advanced: 1, expert: 0.75 }[distro.userLevel] ?? 0.7;
    add('q_maintenance', 'Occasional-tinkering fit', v);
  } else if (maintenance === 'hands-on') {
    const v = { beginner: 0.25, intermediate: 0.6, advanced: 1, expert: 1 }[distro.userLevel] ?? 0.6;
    add('q_maintenance', 'Hands-on maintenance fit', v,
      v === 1 ? 'Rewards hands-on administration' : null,
      v < 0.5 ? 'Hides the internals; little to tinker with' : null);
  }

  // 9 — Starting point
  const startingPoint = answers.q_starting_point;
  if (startingPoint === 'complete') {
    const v = { beginner: 1, intermediate: 0.75, advanced: 0.4, expert: 0.25 }[distro.userLevel] ?? 0.5;
    add('q_starting_point', 'Batteries-included setup', v,
      v >= 0.9 ? 'Complete desktop out of the box' : null,
      v < 0.5 ? 'Ships a fairly bare base — you assemble the rest' : null);
  } else if (startingPoint === 'lean') {
    const v = { beginner: 0.3, intermediate: 0.55, advanced: 0.9, expert: 1 }[distro.userLevel] ?? 0.6;
    add('q_starting_point', 'Minimal base to build on', v,
      v >= 0.9 ? 'Minimal base, you choose the stack' : null,
      v < 0.5 ? 'Comes pre-loaded with apps and defaults you may not want' : null);
  }

  // 10 — Rollback
  const rollback = answers.q_rollback;
  if (rollback === 'automatic') {
    const v = hasFeature(distro, 'snapshot', 'snapper', 'btrfs', 'rollback', 'timeshift', 'atomic') ? 1 : 0.45;
    if (v < 0.5 && mustHave('q_rollback')) {
      hardFails.push('No first-class snapshot or rollback integration');
    }
    add('q_rollback', 'Snapshot / rollback', v,
      v === 1 ? 'Automated snapshots or atomic rollback' : null,
      v < 0.5 ? 'No first-class snapshot integration' : null);
  } else if (rollback === 'manual') {
    addNeutral('q_rollback', 'Backup strategy', 0.85);
  }

  // 10b — Gaming depth (only asked when gaming is actually relevant)
  const gamingDepth = answers.q_gaming_depth;
  if (gamingDepth === 'competitive') {
    const v = GAMING_SPECIALISTS.has(distro.id) ? 1 : isGamingDistro(distro) ? 0.7 : 0.3;
    add('q_gaming_depth', 'Competitive gaming fit', v,
      v === 1 ? 'Gaming kernel and Proton tuning baked in' : null,
      v < 0.5 ? 'No low-latency gaming stack by default' : null);
  } else if (gamingDepth === 'casual') {
    const v = isGamingDistro(distro) ? 1 : 0.75;
    add('q_gaming_depth', 'Casual gaming readiness', v);
  }

  // 10c — Server role (only asked for server/homelab paths)
  const serverRole = answers.q_server_role;
  if (serverRole === 'storage') {
    const v = (distro.primaryUseCases || []).includes('server-homelab') &&
      hasFeature(distro, 'zfs', 'btrfs', 'nas', 'storage') ? 1
      : (distro.primaryUseCases || []).includes('server-homelab') ? 0.75 : 0.25;
    add('q_server_role', 'Storage / NAS fit', v,
      v === 1 ? 'Storage filesystem and sharing tooling included' : null,
      v < 0.5 ? 'Desktop-first distribution' : null);
  } else if (serverRole === 'containers') {
    const v = hasFeature(distro, 'docker', 'kubernetes', 'container', 'virtualization') ? 1 : 0.4;
    add('q_server_role', 'Container / VM fit', v,
      v === 1 ? 'Container and virtualisation tooling available' : null,
      v < 0.5 ? 'Limited container tooling' : null);
  } else if (serverRole === 'web') {
    const v = (distro.primaryUseCases || []).includes('server-homelab') ? 1 : 0.3;
    add('q_server_role', 'Service server fit', v,
      v === 1 ? 'Headless server oriented' : null,
      v < 0.5 ? 'Desktop-first distribution' : null);
  }

  // 11 — Software freedom
  const freedom = answers.q_freedom;
  if (freedom === 'libre-only') {
    const v = distro.freeSoftwareStrictness === '100-libre-fsf' ? 1 : 0;
    if (v === 0) hardFails.push('Ships proprietary firmware/blobs — conflicts with your 100% libre requirement');
    add('q_freedom', 'FSF-libre purity', v,
      v === 1 ? 'FSF-endorsed, no proprietary blobs' : null,
      'Includes non-free blobs by default');
  } else if (freedom === 'opt-in') {
    const v = { 'free-with-opt-in': 1, pragmatic: 0.8, '100-libre-fsf': 0.6 }[distro.freeSoftwareStrictness] ?? 0.6;
    add('q_freedom', 'Free by default, opt-in blobs', v,
      distro.freeSoftwareStrictness === 'free-with-opt-in' ? 'Free software by default with opt-in firmware' : null);
  } else if (freedom === 'pragmatic') {
    const v = { pragmatic: 1, 'free-with-opt-in': 0.8, '100-libre-fsf': 0.4 }[distro.freeSoftwareStrictness] ?? 0.7;
    if (v < 0.5 && mustHave('q_freedom')) {
      hardFails.push('Strict libre stance — proprietary codecs and firmware are not included');
    }
    add('q_freedom', 'Pragmatic codecs & drivers', v,
      v === 1 ? 'Codecs and drivers work out of the box' : null,
      v < 0.5 ? 'Strict libre stance — Wi-Fi/media may not work out of the box' : null);
  }

  // 12 — Init system
  const init = answers.q_init;
  if (init === 'alternative') {
    const v = distro.initSystem === 'systemd' ? 0 : 1;
    if (v === 0) hardFails.push('Uses systemd — you asked for a different init');
    add('q_init', 'Non-systemd init', v,
      v === 1 ? `${distro.initSystem} init, as requested` : null,
      'systemd init');
  } else if (init === 'systemd') {
    const v = distro.initSystem === 'systemd' ? 1 : 0.4;
    if (v < 1 && mustHave('q_init')) {
      hardFails.push(`Uses ${distro.initSystem} instead of systemd`);
    }
    add('q_init', 'systemd init', v,
      v === 1 ? 'Standard systemd init' : null,
      v < 0.5 ? `Alternative init (${distro.initSystem})` : null);
  }

  // 13 — Privacy baseline
  const privacy = answers.q_privacy;
  if (privacy === 'amnesic') {
    const amnesic = AMNESIC_SPECIALISTS.has(distro.id);
    if (!amnesic) hardFails.push('No amnesic session or Tor-by-default architecture');
    add('q_privacy', 'Anonymity engineering', amnesic ? 1 : 0,
      amnesic ? 'Amnesic / Tor-by-default architecture' : null,
      amnesic ? null : 'No anonymising network or amnesic session support');
  } else if (privacy === 'strict') {
    const v = distro.id === 'ubuntu' ? 0.55 : distro.family === 'Ubuntu' ? 0.9 : 1;
    add('q_privacy', 'Zero telemetry', v,
      v === 1 ? 'No telemetry by default' : null,
      v < 0.7 ? 'Parent project collects some opt-out telemetry' : null);
  }

  // 14 — Desktop workflow
  const desktops = answers.q_desktop || [];
  if (desktops.length) {
    const styles = desktopStylesOf(distro);
    const matched = desktops.filter((d) => styles.has(d));
    const v = matched.length / desktops.length;
    add('q_desktop', 'Desktop workflow fit', v,
      matched.length ? `Offers ${prettyDesktop(matched[0])}` : null,
      matched.length < desktops.length
        ? `Does not offer ${desktops.filter((d) => !matched.includes(d)).map(prettyDesktop).join(' / ')}`
        : null);
  }

  // 15 — Package tooling
  const packages = answers.q_packages;
  if (packages === 'aur') {
    const v = distro.family === 'Arch' ? 1 : 0.2;
    add('q_packages', 'AUR access', v,
      v === 1 ? 'AUR access via Arch lineage' : null,
      v < 0.5 ? 'No AUR — different package ecosystem' : null);
  } else if (packages === 'nix') {
    const v = ['nixos', 'guix-system'].includes(distro.id) ? 1 : 0.2;
    add('q_packages', 'Declarative packages', v,
      v === 1 ? 'Nix / Guix declarative system' : null,
      v < 0.5 ? 'Imperative package management only' : null);
  } else if (packages === 'app-store') {
    const v = hasFeature(distro, 'flatpak', 'appcenter', 'software center') ? 1 : 0.7;
    add('q_packages', 'Flatpak / app centre', v,
      v === 1 ? 'Flatpak-first with a graphical app store' : null);
  }

  // 15b — Kernel policy (expert path)
  const kernel = answers.q_kernel;
  if (kernel === 'mainline-lts') {
    const v = ['fixed', 'immutable-atomic'].includes(distro.releaseModel) ? 1 : 0.45;
    add('q_kernel', 'Long-term kernel policy', v,
      v === 1 ? 'Stable, long-supported kernel baseline' : null,
      v < 0.5 ? 'Frequent kernel changes on this distro' : null);
  } else if (kernel === 'newest') {
    const v = distro.releaseModel === 'rolling' ? 1 : distro.releaseModel === 'semi-rolling' ? 0.7 : 0.35;
    add('q_kernel', 'Current upstream kernel', v,
      v === 1 ? 'Rolling kernel picks up new hardware first' : null,
      v < 0.5 ? 'Frozen kernel — newer hardware may need backports' : null);
  } else if (kernel === 'custom') {
    const v = ['gentoo', 'arch-linux', 'slackware', 'nixos', 'void-linux'].includes(distro.id) ? 1 : 0.35;
    add('q_kernel', 'Custom kernel workflow', v,
      v === 1 ? 'Source-level kernel control is normal here' : null,
      v < 0.5 ? 'Prebuilt kernel workflow only' : null);
  }

  // 15c — Mandatory access control (expert path)
  const security = answers.q_security;
  if (security === 'selinux') {
    const v = ['Fedora/RHEL'].includes(distro.family) ? 1 : 0.45;
    add('q_security', 'SELinux model', v,
      v === 1 ? 'SELinux is a first-class part of the system' : null,
      v < 0.5 ? 'No SELinux policy by default' : null);
  } else if (security === 'apparmor') {
    const v = ['Ubuntu', 'Debian', 'openSUSE'].includes(distro.family) || hasFeature(distro, 'apparmor') ? 1 : 0.45;
    add('q_security', 'AppArmor model', v,
      v === 1 ? 'AppArmor profiles ship with the system' : null,
      v < 0.5 ? 'No AppArmor policy by default' : null);
  }

  // 16 — Highest priority
  const priority = answers.q_priority;
  if (priority) {
    const releasePriorityFit = {
      stability: { fixed: 1, 'semi-rolling': 0.6, rolling: 0.3, 'immutable-atomic': 0.85 },
      freshness: { fixed: 0.3, 'semi-rolling': 0.75, rolling: 1, 'immutable-atomic': 0.5 }
    }[priority];
    let v;
    if (priority === 'gaming') {
      v = GAMING_SPECIALISTS.has(distro.id) ? 1 : isGamingDistro(distro) ? 0.7 : 0.3;
    } else if (priority === 'simplicity') {
      v = { beginner: 1, intermediate: 0.65, advanced: 0.3, expert: 0.12 }[distro.userLevel] ?? 0.4;
    } else if (priority === 'freedom') {
      v = { '100-libre-fsf': 1, 'free-with-opt-in': 0.55, pragmatic: 0.15 }[distro.freeSoftwareStrictness] ?? 0.3;
    } else if (priority === 'privacy') {
      v = PRIVACY_SPECIALISTS.has(distro.id) ? 1
        : hasFeature(distro, 'tor', 'privacy', 'anonymity') ? 0.85 : 0.4;
    } else if (priority === 'lightness') {
      v = { 'potatoes-vintage': 1, lightweight: 0.9, 'modern-standard': 0.5, 'high-end-workstation': 0.3 }[distro.hardwareSpec] ?? 0.5;
    } else if (priority === 'reproducibility') {
      v = distro.releaseModel === 'immutable-atomic' || ['nixos', 'guix-system'].includes(distro.id) ? 1 : 0.3;
    } else {
      v = releasePriorityFit ? releasePriorityFit[distro.releaseModel] ?? 0.5 : 0.5;
    }
    add('q_priority', 'Your #1 priority', v,
      v >= 0.9 ? `Strongest possible fit for ${prettyPriority(priority)}` : null,
      v < 0.5 ? `Compromises on ${prettyPriority(priority)}` : null);
  }

  return { criteria, hardFails };
}

/* ------------------------------- scoring ------------------------------- */

function tierPrior(distro) {
  if (distro.tier === 'flagship') return 0.04;
  if (distro.tier === 'specialist') return 0.016;
  return 0;
}

function popularityPrior(distro, allowObscure = false) {
  const rank = distro.dwRank || 999;
  let bonus;
  if (rank <= 3) bonus = 0.038;
  else if (rank <= 10) bonus = 0.03;
  else if (rank <= 25) bonus = 0.022;
  else if (rank <= 50) bonus = 0.013;
  else if (rank <= 100) bonus = 0.007;
  else if (rank <= 200) bonus = 0.002;
  else bonus = 0;
  return allowObscure ? bonus * 0.35 : bonus;
}

function steeringAdjustment(distro, steering) {
  let delta = 0;
  if (steering.familyBias && steering.familyBias !== 'all') {
    delta += distro.family === steering.familyBias ? 0.05 : -0.03;
  }
  if (steering.gamingBoost && isGamingDistro(distro)) delta += 0.04;
  if (steering.nvidiaBoost && distro.gpuSupport === 'excellent-nvidia') delta += 0.03;
  if (steering.stabilityBias === 'rock-solid' && distro.releaseModel === 'fixed') delta += 0.03;
  if (steering.stabilityBias === 'rolling' && distro.releaseModel === 'rolling') delta += 0.03;
  if (steering.snapsPreference === 'avoid-snaps') {
    if (hasFeature(distro, 'no-snaps')) delta += 0.03;
    else if (distro.id === 'ubuntu') delta -= 0.05;
  }
  return delta;
}

export const MatchingEngine = {
  evaluate(userAnswers = {}, questionWeights = {}, steering = {}, options = {}) {
    const likes = Array.isArray(options.likes) ? options.likes : [];
    const asked = visibleQuestions(userAnswers, { expert: Boolean(steering.expertMode) });
    const askedIds = new Set(asked.map((q) => q.id));
    const answeredCount = asked.filter((q) => {
      const v = userAnswers[q.id];
      return Array.isArray(v) ? v.length > 0 : v != null && v !== '';
    }).length;

    const confidence = {
      answered: answeredCount,
      total: asked.length,
      percent: asked.length ? Math.round((answeredCount / asked.length) * 100) : 0
    };

    const experience = userAnswers.q_experience;
    const goal = userAnswers.q_goal;
    const specialtyRequested = ['privacy', 'server', 'revive'].includes(goal);
    const expertish = experience === 'expert' || experience === 'confident';
    const allowObscure = (steering.scope || 'mainstream') === 'all' || specialtyRequested || expertish;

    const results = LINUX_DISTROS.map((distro) => {
      // Answers to skipped questions never affect scoring.
      const relevantAnswers = Object.fromEntries(
        Object.entries(userAnswers).filter(([key]) => askedIds.has(key))
      );
      const { criteria, hardFails } = buildCriteria(distro, relevantAnswers, questionWeights);

      if (steering.scope !== 'all' && distro.tier === 'niche' && !specialtyRequested && !expertish) {
        hardFails.push('Niche project — outside the mainstream scope you selected');
      }
      const rank = distro.dwRank || 999;
      if (steering.scope !== 'all' && rank > 150 && !allowObscure) {
        hardFails.push('Very small project — little community, documentation or hardware support');
      }
      if (LIVE_IMAGE_DISTROS.has(distro.id)) {
        hardFails.push('Live/rescue image — not an installable desktop system');
      }

      let satisfaction = 0;
      let weightSum = 0;
      for (const c of criteria) {
        if (c.neutral || c.weight <= 0) continue;
        satisfaction += c.value * c.weight;
        weightSum += c.weight;
      }
      satisfaction = weightSum > 0 ? (satisfaction / weightSum) * 0.9 : 0.45;
      const liked = likes.includes(distro.id);
      satisfaction = clamp01(
        satisfaction + steeringAdjustment(distro, steering) + tierPrior(distro) +
          popularityPrior(distro, allowObscure) + (liked ? 0.06 : 0)
      );

      const disqualified = hardFails.length > 0;
      const matchPercentage = disqualified
        ? Math.max(3, Math.round(22 * satisfaction))
        : Math.round(8 + 92 * Math.pow(satisfaction, 1.15));

      const strong = criteria
        .filter((c) => c.value >= 0.9 && c.weight >= 3 && c.note)
        .sort((a, b) => b.weight - a.weight);
      const medium = criteria
        .filter((c) => c.value >= 0.75 && c.weight >= 2 && c.note)
        .sort((a, b) => b.weight - a.weight);
      const matchReasons = [...new Set([
        ...(liked ? ['You liked this in the swipe deck'] : []),
        ...strong.map((c) => c.note),
        ...medium.map((c) => c.note)
      ])].slice(0, 6);

      const tradeoffs = criteria
        .filter((c) => c.gap && c.value < 0.6 && c.weight >= 2)
        .sort((a, b) => b.weight * (1 - b.value) - a.weight * (1 - a.value))
        .map((c) => c.gap)
        .slice(0, 4);

      const breakdown = criteria
        .filter((c) => !c.neutral)
        .sort((a, b) => b.weight * b.value - a.weight * a.value)
        .map((c) => ({
          id: c.id,
          label: c.label,
          value: Math.round(c.value * 100),
          weight: c.weight,
          note: c.note,
          gap: c.gap
        }));

      return {
        distro,
        score: weightSum > 0 ? satisfaction * weightSum : 0,
        satisfaction,
        matchPercentage,
        disqualified,
        disqualifiers: [...new Set(hardFails)],
        matchReasons,
        tradeoffs,
        breakdown,
        confidence
      };
    });

    results.sort((a, b) => {
      if (a.disqualified !== b.disqualified) return a.disqualified ? 1 : -1;
      if (b.matchPercentage !== a.matchPercentage) return b.matchPercentage - a.matchPercentage;
      if (b.satisfaction !== a.satisfaction) return b.satisfaction - a.satisfaction;
      return (a.distro.dwRank || 999) - (b.distro.dwRank || 999);
    });

    return results;
  },

  /** Max two distros per family so the shortlist is genuinely diversified. */
  recommend(evaluated, count = 5) {
    const eligible = evaluated.filter((r) => !r.disqualified);
    const maxPerFamily = Math.max(1, Math.ceil(count / 3));
    const picks = [];
    const familyCount = new Map();

    for (const r of eligible) {
      if (picks.length >= count) break;
      const fam = r.distro.family;
      if ((familyCount.get(fam) || 0) >= maxPerFamily) continue;
      picks.push(r);
      familyCount.set(fam, (familyCount.get(fam) || 0) + 1);
    }
    for (const r of eligible) {
      if (picks.length >= count) break;
      if (!picks.includes(r)) picks.push(r);
    }
    picks.sort((a, b) => {
      if (b.matchPercentage !== a.matchPercentage) return b.matchPercentage - a.matchPercentage;
      return (a.distro.dwRank || 999) - (b.distro.dwRank || 999);
    });

    const overflow = eligible.filter((r) => !picks.includes(r));
    return {
      picks,
      winner: picks[0] || null,
      alternatives: picks.slice(1),
      alsoConsidered: overflow.slice(0, 3)
    };
  },

  explain(winner, pick) {
    if (!winner) return [];
    const lines = [...winner.matchReasons];
    const runnerUp = pick?.alternatives?.[0];
    if (runnerUp) {
      const gap = winner.matchPercentage - runnerUp.matchPercentage;
      lines.push(
        gap <= 2
          ? `Practically tied with ${runnerUp.distro.name} — pick either; the difference is ${gap} point${gap === 1 ? '' : 's'}.`
          : `Outranks ${runnerUp.distro.name} by ${gap} points on the criteria you weighted highest.`
      );
    }
    return lines;
  },

  generateUserPersona(userAnswers, topDistro) {
    const experience = userAnswers.q_experience;
    const goal = userAnswers.q_goal;
    const updates = userAnswers.q_updates;
    const freedom = userAnswers.q_freedom;
    const init = userAnswers.q_init;
    const priority = userAnswers.q_priority;

    if (freedom === 'libre-only' || priority === 'freedom') {
      return {
        title: 'The Free Software Purist',
        badge: 'FSF LIBRE GUARDIAN',
        quote: 'Freedom is not a feature; it is the prerequisite of computing dignity.',
        description: 'You believe software should serve its users. You refuse proprietary blobs, unaudited telemetry and digital restrictions, even when convenience suffers.',
        keyTraits: ['Zero Proprietary Blobs', 'Ideological Integrity', 'Open Standards', 'Hardware Sovereignty']
      };
    }
    if (init === 'alternative') {
      return {
        title: 'The Unix Artisan',
        badge: 'INIT FREEDOM PIONEER',
        quote: 'Write programs that do one thing and do it well. Keep it simple and auditable.',
        description: 'You value clarity, process isolation and the classic Unix philosophy. You want a fast, legible system where PID 1 does not swallow the operating stack.',
        keyTraits: ['KISS Philosophy', 'Alternative Init', 'Minimal Daemons', 'Deep OS Literacy']
      };
    }
    if (goal === 'gaming' || priority === 'gaming') {
      return {
        title: 'The High-FPS Frontier Gamer',
        badge: 'PROTON & SILICON COMMANDER',
        quote: 'Why tolerate Windows bloatware and telemetry when Linux pushes more frames?',
        description: 'You demand maximum GPU throughput, current Vulkan drivers, low-latency kernels and zero stutter.',
        keyTraits: ['Gaming Kernels', 'Proton & DXVK Tuning', 'Vulkan Enthusiast', 'Handheld & TV Ready']
      };
    }
    if (goal === 'privacy' || priority === 'privacy') {
      return {
        title: 'The Ghost Protocol Sentinel',
        badge: 'ZERO-TELEMETRY OPERATOR',
        quote: 'If you are not paying for privacy with architecture, you are paying with your identity.',
        description: 'You treat network boundaries with disciplined skepticism. Tor-by-default, compartmentalisation and amnesic sessions are tools you actually use.',
        keyTraits: ['Amnesic Sessions', 'Traffic Compartmentalisation', 'Anti-Fingerprinting', 'Cryptographic Rigour']
      };
    }
    // Checked before "bleeding edge": an expert asking for atomic updates is
    // a declarative architect, not a rolling-release thrill seeker.
    if (updates === 'atomic' || priority === 'reproducibility' ||
      (topDistro && (topDistro.id === 'nixos' || topDistro.id === 'silverblue' || topDistro.id === 'bazzite'))) {
      return {
        title: 'The Declarative Architect',
        badge: 'REPRODUCIBILITY VIRTUOSO',
        quote: 'State is a bug; reproducible configuration is the only sanity.',
        description: 'You treat your operating system as immutable infrastructure: atomic deployments, instant rollback and containerised environments that never rot.',
        keyTraits: ['Atomic Root', 'Declarative Builds', 'Container Workflows', 'Instant Rollback']
      };
    }
    if (goal === 'server' || userAnswers.q_server_role) {
      return {
        title: 'The Steady Operator',
        badge: 'RELIABILITY ENGINEER',
        quote: 'Nothing is more impressive than a service nobody had to think about.',
        description: 'You value boring, dependable systems: headless operation, long support windows, storage or container tooling that stays out of the way, and upgrades that never surprise you.',
        keyTraits: ['Long Uptime', 'Headless Operation', 'Storage & Containers', 'Quiet Maintenance']
      };
    }
    if (experience === 'expert' || updates === 'rolling' || priority === 'freshness') {
      return {
        title: 'The Bleeding-Edge Architect',
        badge: 'UPSTREAM PIONEER',
        quote: 'If my packages are not from this morning, my system is already obsolete.',
        description: 'You thrive on rolling releases, upstream kernels and deep documentation. You relish tailoring every config file to perfection.',
        keyTraits: ['Rolling Kernel', 'Dotfiles & Ricing', 'Terminal Dexterity', 'Continuous Innovation']
      };
    }
    if (goal === 'revive' || priority === 'lightness') {
      return {
        title: 'The Silicon Resurrecter',
        badge: 'HARDWARE ALCHEMIST',
        quote: 'Planned obsolescence is an illusion created by inefficient software.',
        description: 'Where others see e-waste, you see a functional machine. Lightweight desktops and efficient kernels make aging hardware feel new again.',
        keyTraits: ['Low RAM Footprint', 'E-Waste Reduction', 'Featherweight Desktops', 'Efficient Kernels']
      };
    }
    if (goal === 'development') {
      return {
        title: 'The Developer Craftsperson',
        badge: 'ENGINEERING WORKBENCH',
        quote: 'My OS is the foundation of my toolchain — it should never be the bottleneck.',
        description: 'You need containers, compilers, IDEs and Git workflows to run seamlessly. A predictable terminal is your daily workbench.',
        keyTraits: ['Container Tooling', 'Polyglot Toolchains', 'Terminal Dexterity', 'Stable Baseline']
      };
    }
    return {
      title: 'The Pragmatic Workhorse',
      badge: 'EFFICIENCY & PRODUCTIVITY REALIST',
      quote: 'My operating system is a tool to get things done, not an obstacle to fight.',
      description: 'You value a responsive desktop, a stable software baseline and hardware that simply works without unnecessary ritual.',
      keyTraits: ['High Productivity', 'Stable Baseline', 'Frictionless Workflow', 'Pragmatic Drivers']
    };
  }
};
