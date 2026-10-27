/**
 * LinuxMatch recommendation engine.
 *
 * Design goals (v3):
 *  1. Every answer contributes a *normalised* 0..1 satisfaction score, so a
 *     distro cannot win simply by collecting positive points on easy questions.
 *  2. Hard requirements (NVIDIA on a mesa-only distro, ARM64, non-systemd,
 *     FSF-libre) are hard filters, not soft penalties.
 *  3. The per-question importance slider actually changes the result.
 *  4. Scores are comparable: 95 = almost everything you asked for, 50 = mixed
 *     bag, <35 = several important mismatches.
 *  5. Recommendations are diversified across families so the runners-up are
 *     genuinely different choices, not five Ubuntu respins.
 */
import { LINUX_DISTROS } from '../data/distros.js';
import { QUESTIONS_DATA } from '../data/questions.js';

/** Default importance of each question (1–3), used until the user customises it. */
const QUESTION_DEFAULT_WEIGHTS = Object.fromEntries(
  QUESTIONS_DATA.map((q) => [q.id, q.defaultWeight || 1])
);

/** User-level fit matrix: [userLevel][distroLevel] -> satisfaction */
const LEVEL_FIT = {
  beginner: { beginner: 1, intermediate: 0.55, advanced: 0.18, expert: 0.1 },
  intermediate: { beginner: 0.9, intermediate: 1, advanced: 0.62, expert: 0.38 },
  advanced: { beginner: 0.55, intermediate: 0.92, advanced: 1, expert: 0.72 },
  expert: { beginner: 0.35, intermediate: 0.62, advanced: 0.85, expert: 1 }
};

const RELEASE_FIT = {
  // How well a distro's release model serves each requested cadence.
  // A rolling distro is *not* a good answer to "give me a 6-month cadence" —
  // it is a different promise, so it must not score near a true point release.
  'fixed-rock-solid': { fixed: 1, 'semi-rolling': 0.72, rolling: 0.32, 'immutable-atomic': 0.78 },
  'semi-rolling-balanced': { fixed: 0.86, 'semi-rolling': 1, rolling: 0.58, 'immutable-atomic': 0.5 },
  'rolling-bleeding-edge': { fixed: 0.3, 'semi-rolling': 0.72, rolling: 1, 'immutable-atomic': 0.45 },
  'immutable-atomic': { fixed: 0.25, 'semi-rolling': 0.4, rolling: 0.3, 'immutable-atomic': 1 }
};

const USE_CASE_MATCHERS = {
  'daily-driver': (d) => (d.primaryUseCases || []).some((u) => u === 'daily-driver' || u === 'general-purpose'),
  gaming: (d) => (d.primaryUseCases || []).includes('gaming') || hasFeature(d, 'gaming', 'gamescope', 'proton'),
  'software-development': (d) => (d.primaryUseCases || []).includes('software-development'),
  'privacy-anonymity': (d) =>
    (d.primaryUseCases || []).includes('privacy-anonymity') || hasFeature(d, 'anonymity', 'tor', 'amnesic', 'privacy'),
  'cybersecurity-pentesting': (d) => (d.primaryUseCases || []).includes('cybersecurity-pentesting'),
  'server-homelab': (d) => (d.primaryUseCases || []).includes('server-homelab'),
  'creative-multimedia': (d) =>
    (d.primaryUseCases || []).some((u) => u === 'creative-multimedia' || u === 'multimedia-creation'),
  'multimedia-creation': (d) =>
    (d.primaryUseCases || []).some((u) => u === 'creative-multimedia' || u === 'multimedia-creation'),
  education: (d) =>
    (d.primaryUseCases || []).includes('education') ||
    hasFeature(d, 'education', 'classroom', 'school', 'edubuntu'),
  'enterprise-stability': (d) =>
    (d.primaryUseCases || []).includes('enterprise-stability') ||
    hasFeature(d, 'enterprise', 'long-term-support', 'commercial-support'),
  'tinkering-minimalism': (d) =>
    (d.primaryUseCases || []).includes('tinkering-minimalism') ||
    hasFeature(d, 'tinkering', 'minimal', 'from-scratch'),
  'low-spec-hardware': (d) => ['potatoes-vintage', 'lightweight'].includes(d.hardwareSpec)
};

const DE_STYLE_MAP = {
  'gnome-cosmic': ['gnome', 'cosmic', 'pantheon'],
  'kde-plasma': ['kde', 'plasma'],
  'traditional-lightweight': ['xfce', 'mate', 'cinnamon', 'budgie', 'lxde', 'lxqt'],
  'tiling-window-manager': ['i3', 'sway', 'hyprland', 'bspwm', 'dwm', 'qtile', 'river', 'awesome'],
  'minimalist-floating': ['openbox', 'icewm', 'jwm', 'fluxbox', 'blackbox', 'window maker', 'twm'],
  'headless-cli': ['cli', 'headless', 'console', 'none']
};

/** Distros whose primary product *is* a desktop workflow rather than a base. */
const GAMING_SPECIALISTS = new Set([
  'bazzite', 'nobara-linux', 'cachyos', 'steamos', 'chimeraos', 'garuda-linux',
  'drauger-os', 'regata-os', 'pop-os', 'batocera', 'lakka', 'recalbox'
]);

const PRIVACY_SPECIALISTS = new Set(['tails', 'whonix', 'qubes-os', 'kodachi', 'pureos', 'parrot-sec']);

/**
 * Live and rescue images. They are legitimate projects and they belong in the
 * directory, but they are not installable desktop systems — recommending one
 * as "your Linux distribution" is nonsense, so they never win a shortlist.
 */
const LIVE_IMAGE_DISTROS = new Set([
  'gparted-live', 'clonezilla', 'systemrescuecd', 'ventoy', 'rescatux'
]);

/** Distros engineered around amnesic sessions or Tor-by-default. */
const AMNESIC_SPECIALISTS = new Set(['tails', 'whonix', 'qubes-os', 'kodachi']);

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

function isGamingDistro(distro) {
  return GAMING_SPECIALISTS.has(distro.id) || (distro.primaryUseCases || []).includes('gaming');
}

function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

/** Ordered family similarity, used for lineage partial credit. */
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

function desktopStylesOf(distro) {
  const des = (distro.desktopEnvironments || []).map((d) => d.toLowerCase());
  const styles = new Set();
  for (const [style, keys] of Object.entries(DE_STYLE_MAP)) {
    if (des.some((de) => keys.some((k) => de.includes(k) || k.includes(de)))) {
      styles.add(style);
    }
  }
  if (!styles.size) styles.add('headless-cli');
  return styles;
}

function buildCriteria(distro, answers, questionWeights) {
  // Question weights are absolute priorities (1–3). A question's default is
  // used until the user moves its priority slider; we do not multiply the two,
  // otherwise leaving a slider at its displayed default would silently double
  // or triple that question's influence.
  const weightFor = (qid) =>
    Math.max(1, Math.min(3, questionWeights?.[qid] ?? QUESTION_DEFAULT_WEIGHTS[qid] ?? 1));
  const criteria = [];
  const hardFails = [];

  /** @param {string} id @param {string} label @param {number} value @param {string} [note] @param {string} [gap] */
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

  /**
   * A criterion that returns the same value for every distro carries no
   * information. It is still shown in the breakdown, but it must not dilute the
   * weighted average — otherwise a stack of flat 0.85s compresses the real
   * differences until a rounding-level prior decides the winner.
   */
  const addNeutral = (id, label, value) => {
    if (value == null) return;
    criteria.push({
      id,
      label,
      value: clamp01(value),
      weight: 0,
      note: null,
      gap: null,
      neutral: true
    });
  };

  // 1 — Experience level
  const level = answers.q1_user_level;
  if (level && LEVEL_FIT[level]) {
    const v = LEVEL_FIT[level][distro.userLevel] ?? 0.3;
    add(
      'q1_user_level',
      'Experience fit',
      v,
      v >= 0.9 ? `Pitched at ${distro.userLevel} users like you` : null,
      v < 0.5 ? `Assumes ${distro.userLevel} Linux skills — expect to read docs` : null
    );
  }

  // 2 — Use cases (proportion of requested jobs the distro advertises)
  const useCases = answers.q2_use_cases || [];
  if (useCases.length) {
    const matched = useCases.filter((uc) => USE_CASE_MATCHERS[uc]?.(distro));
    const v = matched.length / useCases.length;
    // "Daily driver" and "education" are baseline expectations, not
    // specialities. A distro that is a capable desktop but does not advertise
    // the exact tag should be scored low, not ruled out — otherwise every
    // specialist (including FSF-libre desktops) disappears when someone asks
    // for everyday use, and only one distro survives an education request.
    const SOFT_USE_CASES = new Set(['daily-driver', 'education']);
    const hardUseCases = useCases.filter((uc) => !SOFT_USE_CASES.has(uc));
    if (!matched.length && hardUseCases.length) {
      hardFails.push(
        `Not built for ${hardUseCases.map(prettyUseCase).join(' or ')} — this would be the wrong tool for the job`
      );
    }
    add(
      'q2_use_cases',
      'Use-case coverage',
      v,
      matched.length ? `Built for ${matched.map(prettyUseCase).join(', ')}` : null,
      matched.length < useCases.length
        ? `Weak fit for ${useCases.filter((u) => !matched.includes(u)).map(prettyUseCase).join(', ')}`
        : null
    );
  }

  // 3 — Release cadence
  const release = answers.q3_release_model;
  if (release && RELEASE_FIT[release]) {
    const v = RELEASE_FIT[release][distro.releaseModel] ?? 0.4;
    add(
      'q3_release_model',
      'Release cadence',
      v,
      v >= 0.9 ? `${prettyRelease(distro.releaseModel)} as requested` : null,
      v < 0.5 ? `Is ${prettyRelease(distro.releaseModel)}; you asked for ${prettyRelease(release)}` : null
    );
  }

  // 4 — Mutable vs immutable root
  const fsArch = answers.q4_filesystem_architecture;
  if (fsArch === 'prefer-immutable') {
    const v = distro.releaseModel === 'immutable-atomic' ? 1 : 0.25;
    add('q4_filesystem_architecture', 'Atomic / immutable root', v,
      v === 1 ? 'Atomic image with rollback' : null,
      v < 0.5 ? 'Traditional mutable root filesystem' : null);
  } else if (fsArch === 'traditional-mutable') {
    const v = distro.releaseModel === 'immutable-atomic' ? 0.25 : 1;
    add('q4_filesystem_architecture', 'Traditional mutable root', v,
      v === 1 ? 'Normal mutable root with full control' : null,
      v < 0.5 ? 'Immutable root limits where you can install system packages' : null);
  }

  // 5 — Batteries included vs minimal base
  const setup = answers.q5_out_of_box;
  if (setup === 'turnkey-batteries-included') {
    const v = { beginner: 1, intermediate: 0.75, advanced: 0.4, expert: 0.25 }[distro.userLevel] ?? 0.5;
    add('q5_out_of_box', 'Batteries-included setup', v,
      v >= 0.9 ? 'Complete desktop out of the box' : null,
      v < 0.5 ? 'Ships a fairly bare base — you assemble the rest' : null);
  } else if (setup === 'clean-minimal-base') {
    const v = { beginner: 0.3, intermediate: 0.55, advanced: 0.9, expert: 1 }[distro.userLevel] ?? 0.6;
    add('q5_out_of_box', 'Minimal base to build on', v,
      v >= 0.9 ? 'Minimal base, you choose the stack' : null,
      v < 0.5 ? 'Comes pre-loaded with apps and defaults you may not want' : null);
  }

  // 6 — GPU platform (with hard blockers)
  const gpu = answers.q6_gpu_architecture;
  if (gpu === 'nvidia-dedicated') {
    let v = distro.gpuSupport === 'excellent-nvidia' ? 1 : distro.gpuSupport === 'standard-nvidia' ? 0.65 : 0.2;
    if (hasFeature(distro, 'nvidia')) v = Math.max(v, 0.9);
    if (distro.gpuSupport === 'mesa-only') {
      v = 0;
      hardFails.push('No proprietary NVIDIA driver support — your GPU will not accelerate');
    }
    add('q6_gpu_architecture', 'NVIDIA driver support', v,
      v >= 0.9 ? 'First-class NVIDIA driver story' : null,
      v < 0.5 ? 'No turnkey NVIDIA setup; manual driver work required' : null);
  } else if (gpu === 'amd-dedicated' || gpu === 'amd-apu') {
    const v = distro.apuSupport === 'stellar-apu-gaming' || hasFeature(distro, 'amd', 'mesa', 'vulkan') ? 1 : 0.75;
    add('q6_gpu_architecture', 'AMD / Mesa support', v,
      v >= 0.9 ? 'Modern Mesa + AMDGPU stack' : null,
      v < 0.5 ? 'Older Mesa — newer AMD GPUs may misbehave' : null);
  } else if (gpu === 'intel-integrated') {
    const v = hasFeature(distro, 'mesa', 'intel') ? 1 : 0.85;
    add('q6_gpu_architecture', 'Intel graphics support', v, v >= 0.9 ? 'Solid Intel Mesa support' : null);
  } else if (gpu === 'intel-arc') {
    const v = ['rolling', 'semi-rolling'].includes(distro.releaseModel) ? 1 : 0.4;
    add('q6_gpu_architecture', 'Fresh kernel for Intel Arc', v,
      v === 1 ? 'Rolling kernel keeps Arc drivers current' : null,
      v < 0.5 ? 'Frozen kernel — Arc needs 6.8+ for stability' : null);
  } else if (gpu === 'arm-apple-silicon') {
    const supported = (distro.architectures || []).includes('arm64');
    if (!supported) hardFails.push('No ARM64 build — cannot run on your machine');
    add('q6_gpu_architecture', 'ARM64 availability', supported ? 1 : 0,
      supported ? 'Official ARM64 image' : null,
      supported ? null : 'x86_64 only');
  } else if (gpu === 'older-legacy-gpu') {
    const v = ['potatoes-vintage', 'lightweight'].includes(distro.hardwareSpec) ? 1 : 0.45;
    add('q6_gpu_architecture', 'Legacy GPU friendliness', v,
      v === 1 ? 'Lightweight stack suits old GPUs' : null,
      v < 0.5 ? 'Heavy desktop stack for legacy graphics' : null);
  }

  // 7 — NVIDIA delivery preference
  const nvidia = answers.q7_nvidia_stance;
  if (nvidia === 'nvidia-preinstalled-iso') {
    const v = distro.gpuSupport === 'excellent-nvidia' && hasFeature(distro, 'nvidia') ? 1
      : distro.gpuSupport === 'excellent-nvidia' ? 0.75 : 0.25;
    add('q7_nvidia_stance', 'Preinstalled NVIDIA image', v,
      v === 1 ? 'Dedicated NVIDIA ISO or image' : null,
      v < 0.5 ? 'No preinstalled NVIDIA variant' : null);
  } else if (nvidia === 'nvidia-gui-driver-manager') {
    const v = hasFeature(distro, 'driver-manager', 'mhwd', 'hardware-detection') || distro.gpuSupport === 'excellent-nvidia' ? 1 : 0.5;
    add('q7_nvidia_stance', 'Graphical driver manager', v,
      v === 1 ? 'GUI driver tooling included' : null,
      v < 0.5 ? 'Drivers via CLI only' : null);
  } else if (nvidia === 'open-source-only') {
    const v = distro.freeSoftwareStrictness === '100-libre-fsf' ? 1 : 0.4;
    add('q7_nvidia_stance', 'Open-source-only graphics', v,
      v === 1 ? 'Ships libre graphics stack only' : null,
      v < 0.5 ? 'Includes proprietary GPU blobs' : null);
  }

  // 8 — Device form factor
  const device = answers.q8_device_form_factor;
  if (device === 'handheld-gaming') {
    const v = ['bazzite', 'steamos', 'chimeraos'].includes(distro.id) || hasFeature(distro, 'handheld', 'gamescope') ? 1
      : isGamingDistro(distro) ? 0.55 : 0.2;
    add('q8_device_form_factor', 'Handheld / HTPC support', v,
      v === 1 ? 'Gamescope session built for handhelds' : null,
      v < 0.5 ? 'No handheld session or controller-first UI' : null);
  } else if (device === 'server-node') {
    const v = (distro.primaryUseCases || []).includes('server-homelab') ? 1 : 0.2;
    add('q8_device_form_factor', 'Server / homelab role', v,
      v === 1 ? 'Server and homelab oriented' : null,
      v < 0.5 ? 'Desktop-first distribution' : null);
  } else if (device === 'older-low-spec-pc') {
    const v = { 'potatoes-vintage': 1, lightweight: 0.85, 'modern-standard': 0.35, 'high-end-workstation': 0.15 }[distro.hardwareSpec] ?? 0.4;
    add('q8_device_form_factor', 'Low-spec device fit', v,
      v >= 0.9 ? 'Designed for vintage/low-spec hardware' : null,
      v < 0.5 ? 'Expects modern hardware' : null);
  } else if (device === 'laptop-ultrabook') {
    const v = hasFeature(distro, 'power', 'battery', 'tlp', 'auto-cpufreq', 'laptop') ? 1 : 0.75;
    add('q8_device_form_factor', 'Laptop power tuning', v,
      v === 1 ? 'Laptop power tooling included' : null);
  } else if (device === 'desktop-pc' || device === 'mini-pc-htpc') {
    addNeutral('q8_device_form_factor', 'Desktop form factor', 0.85);
  }

  // 9 — RAM
  const ram = answers.q9_ram_resources;
  if (ram) {
    const hw = distro.hardwareSpec;
    const fit = {
      'ram-potato': { 'potatoes-vintage': 1, lightweight: 0.7, 'modern-standard': 0.2, 'high-end-workstation': 0.05 },
      'ram-low': { 'potatoes-vintage': 1, lightweight: 1, 'modern-standard': 0.6, 'high-end-workstation': 0.25 },
      'ram-standard': { 'potatoes-vintage': 0.55, lightweight: 0.85, 'modern-standard': 1, 'high-end-workstation': 0.95 },
      'ram-workstation': { 'potatoes-vintage': 0.7, lightweight: 0.85, 'modern-standard': 1, 'high-end-workstation': 1 }
    }[ram];
    const v = fit?.[hw] ?? 0.6;
    add('q9_ram_resources', 'Memory footprint', v,
      v === 1 ? `Fits your RAM budget (${distro.minRam} min)` : null,
      v < 0.5 ? `Needs ${distro.recommendedRam} for comfort — above your RAM budget` : null);
  }

  // 10 — Battery
  const battery = answers.q10_battery_power;
  if (battery === 'critical-battery') {
    const v = hasFeature(distro, 'battery', 'power', 'tlp', 'auto-cpufreq') || ['potatoes-vintage', 'lightweight'].includes(distro.hardwareSpec) ? 1 : 0.6;
    add('q10_battery_power', 'Battery endurance tooling', v,
      v === 1 ? 'Power tuning / light footprint for long battery life' : null,
      v < 0.5 ? 'No special power management' : null);
  } else if (battery === 'balanced-power') {
    addNeutral('q10_battery_power', 'Battery endurance tooling', 0.85);
  }

  // 11 — Software freedom
  const freedom = answers.q11_software_freedom;
  if (freedom === 'strict-libre-fsf') {
    const v = distro.freeSoftwareStrictness === '100-libre-fsf' ? 1 : 0;
    if (v === 0) hardFails.push('Ships proprietary firmware/blobs — conflicts with your FSF-libre requirement');
    add('q11_software_freedom', 'FSF-libre purity', v,
      v === 1 ? 'FSF-endorsed, no proprietary blobs' : null,
      v < 1 ? 'Includes non-free blobs by default' : null);
  } else if (freedom === 'free-by-default-optin') {
    const v = { 'free-with-opt-in': 1, pragmatic: 0.8, '100-libre-fsf': 0.6 }[distro.freeSoftwareStrictness] ?? 0.6;
    add('q11_software_freedom', 'Free by default, opt-in blobs', v,
      distro.freeSoftwareStrictness === 'free-with-opt-in' ? 'Free software by default with opt-in firmware' : null);
  } else if (freedom === 'pragmatic-batteries') {
    const v = { pragmatic: 1, 'free-with-opt-in': 0.8, '100-libre-fsf': 0.4 }[distro.freeSoftwareStrictness] ?? 0.7;
    add('q11_software_freedom', 'Pragmatic codecs & drivers', v,
      v === 1 ? 'Codecs and drivers work out of the box' : null,
      v < 0.5 ? 'Strict libre stance — Wi-Fi/media may not work out of the box' : null);
  }

  // 12 — Init system
  const init = answers.q12_init_system;
  if (init === 'non-systemd-strict') {
    const v = distro.initSystem === 'systemd' ? 0 : 1;
    if (v === 0) hardFails.push('Uses systemd — you require a different init');
    add('q12_init_system', 'Non-systemd init', v,
      v === 1 ? `${distro.initSystem} init, as requested` : null,
      v === 0 ? 'systemd init' : null);
  } else if (init === 'systemd-preferred') {
    const v = distro.initSystem === 'systemd' ? 1 : 0.4;
    add('q12_init_system', 'systemd init', v,
      v === 1 ? 'Standard systemd init' : null,
      v < 0.5 ? `Alternative init (${distro.initSystem})` : null);
  }

  // 13 — Telemetry / anonymity
  const telemetry = answers.q13_telemetry_privacy;
  if (telemetry === 'extreme-amnesic-tor') {
    const amnesic = AMNESIC_SPECIALISTS.has(distro.id);
    const v = amnesic ? 1 : 0;
    if (!amnesic) {
      hardFails.push('No amnesic session or Tor-by-default architecture — cannot meet your anonymity requirement');
    }
    add('q13_telemetry_privacy', 'Anonymity engineering', v,
      amnesic ? 'Amnesic / Tor-by-default architecture' : null,
      v < 0.5 ? 'No anonymising network or amnesic session support' : null);
  } else if (telemetry === 'zero-telemetry-strict') {
    const v = distro.id === 'ubuntu' ? 0.55 : distro.family === 'Ubuntu' ? 0.9 : 1;
    add('q13_telemetry_privacy', 'Zero telemetry', v,
      v === 1 ? 'No telemetry by default' : null,
      v < 0.7 ? 'Parent project collects some opt-out telemetry' : null);
  } else if (telemetry === 'standard-open-source-telemetry') {
    addNeutral('q13_telemetry_privacy', 'Telemetry expectations', 0.85);
  }

  // 14 — Governance
  const governance = answers.q14_governance_backing;
  if (governance === 'pure-community') {
    const v = COMMUNITY_GOVERNED.has(distro.id) || (distro.family === 'Independent' && !CORP_BACKED.has(distro.id)) ? 1 : 0.55;
    add('q14_governance_backing', 'Community governance', v,
      v === 1 ? 'Community-governed project' : null,
      v < 0.7 ? 'Corporate-backed project' : null);
  } else if (governance === 'corporate-backed') {
    const v = CORP_BACKED.has(distro.id) || ['Ubuntu', 'Fedora/RHEL', 'openSUSE'].includes(distro.family) ? 1 : 0.7;
    add('q14_governance_backing', 'Corporate backing', v,
      v === 1 ? 'Backed by a company with paid engineers' : null);
  }

  // 15 — Lineage
  const lineage = answers.q15_distro_lineage;
  if (lineage && lineage !== 'open-to-anything') {
    const wanted = {
      'debian-ubuntu-family': ['Debian', 'Ubuntu'],
      'arch-family': ['Arch'],
      'fedora-rhel-family': ['Fedora/RHEL'],
      'opensuse-family': ['openSUSE'],
      'independent-unique': ['Independent', 'Gentoo', 'Slackware']
    }[lineage] || [];
    let v = 0.25;
    if (wanted.includes(distro.family)) v = 1;
    else if (wanted.some((f) => (FAMILY_RELATIVES[distro.family] || []).includes(f))) v = 0.6;
    add('q15_distro_lineage', 'Preferred lineage', v,
      v === 1 ? `${distro.family} family, as requested` : null,
      v < 0.5 ? `${distro.family} family instead of your preferred lineage` : null);
  }

  // 16 — Desktop workflow
  const desktops = answers.q16_desktop_environment || [];
  if (desktops.length) {
    const styles = desktopStylesOf(distro);
    const matched = desktops.filter((d) => styles.has(d));
    const v = matched.length / desktops.length;
    add('q16_desktop_environment', 'Desktop workflow fit', v,
      matched.length ? `Offers ${prettyDesktop(matched[0])} workflow` : null,
      matched.length < desktops.length
        ? `Does not offer ${desktops.filter((d) => !matched.includes(d)).map(prettyDesktop).join(' / ')}`
        : null);
  }

  // 17 — Package tooling
  const pkg = answers.q17_package_formats;
  if (pkg === 'aur-user-repos') {
    const v = distro.family === 'Arch' ? 1 : 0.2;
    add('q17_package_formats', 'AUR access', v,
      v === 1 ? 'AUR access via Arch lineage' : null,
      v < 0.5 ? 'No AUR — different package ecosystem' : null);
  } else if (pkg === 'declarative-nix-guix') {
    const v = ['nixos', 'guix-system'].includes(distro.id) ? 1 : 0.2;
    add('q17_package_formats', 'Declarative packages', v,
      v === 1 ? 'Nix/Guix declarative system' : null,
      v < 0.5 ? 'Imperative package management only' : null);
  } else if (pkg === 'flatpak-appcenter') {
    const v = hasFeature(distro, 'flatpak', 'appcenter', 'software center') ? 1 : 0.7;
    add('q17_package_formats', 'Flatpak / app center', v,
      v === 1 ? 'Flatpak-first with a graphical app store' : null);
  } else if (pkg === 'traditional-native-repos') {
    addNeutral('q17_package_formats', 'Native repositories', 0.95);
  }

  // 18 — Gaming intensity
  const gaming = answers.q18_gaming_tuning;
  if (gaming === 'hardcore-pc-gamer') {
    const v = GAMING_SPECIALISTS.has(distro.id) ? 1 : (distro.primaryUseCases || []).includes('gaming') ? 0.7 : 0.3;
    add('q18_gaming_tuning', 'Gaming tuning', v,
      v === 1 ? 'Gaming kernel, Proton and driver tuning baked in' : null,
      v < 0.5 ? 'No gaming-specific tuning; you assemble it yourself' : null);
  } else if (gaming === 'casual-gamer') {
    const v = isGamingDistro(distro) ? 1 : 0.7;
    add('q18_gaming_tuning', 'Gaming readiness', v,
      v === 1 ? 'Gaming-ready out of the box' : null);
  } else if (gaming === 'no-gaming') {
    const v = GAMING_SPECIALISTS.has(distro.id) ? 0.55 : 1;
    add('q18_gaming_tuning', 'Non-gaming focus', v,
      v === 1 ? 'Desktop/productivity focus' : null,
      v < 0.7 ? 'Gaming-first image carries extra tooling' : null);
  }

  // 19 — Snapshots
  const snapshots = answers.q19_snapshots_rollback;
  if (snapshots === 'automated-btrfs-snapper') {
    const v = hasFeature(distro, 'snapshot', 'snapper', 'btrfs', 'rollback', 'timeshift', 'atomic') ? 1 : 0.45;
    add('q19_snapshots_rollback', 'Snapshot / rollback', v,
      v === 1 ? 'Automated snapshots or atomic rollback' : null,
      v < 0.5 ? 'No first-class snapshot integration' : null);
  } else if (snapshots === 'standard-manual-backups') {
    addNeutral('q19_snapshots_rollback', 'Standard backup options', 0.85);
  }

  // 20 — Documentation & community
  const docs = answers.q20_documentation_community;
  if (docs === 'encyclopedic-wiki') {
    const v = ['arch-linux', 'endeavouros', 'gentoo', 'nixos'].includes(distro.id) || distro.family === 'Arch' ? 1 : 0.55;
    add('q20_documentation_community', 'Deep wiki / documentation', v,
      v === 1 ? 'Encyclopedic wiki and deep documentation' : null,
      v < 0.5 ? 'Thinner documentation; more forum archaeology' : null);
  } else if (docs === 'massive-forum-stack-overflow') {
    const v = ['Ubuntu', 'Debian'].includes(distro.family) ? 1 : 0.5;
    add('q20_documentation_community', 'Huge answer ecosystem', v,
      v === 1 ? 'Huge Q&A and tutorial ecosystem' : null);
  } else if (docs === 'cozy-irc-matrix') {
    const v = ['Independent', 'Gentoo', 'Slackware', 'Arch'].includes(distro.family) ? 1 : 0.7;
    add('q20_documentation_community', 'Small friendly community', v);
  }
  // 21 — Single highest priority (3x)
  const priority = answers.q21_steering_priority;
  if (priority) {
    const priorityFit = {
      'steer-stability': { fixed: 1, 'semi-rolling': 0.6, rolling: 0.3, 'immutable-atomic': 0.85 },
      'steer-gaming': null,
      'steer-freshness': { fixed: 0.3, 'semi-rolling': 0.75, rolling: 1, 'immutable-atomic': 0.5 },
      'steer-simplicity': null,
      'steer-freedom': null,
      'steer-privacy': null,
      'steer-minimalism': null,
      'steer-reproducibility': null
    }[priority];
    let v;
    if (priority === 'steer-gaming') v = GAMING_SPECIALISTS.has(distro.id) ? 1 : isGamingDistro(distro) ? 0.7 : 0.3;
    else if (priority === 'steer-simplicity') v = { beginner: 1, intermediate: 0.65, advanced: 0.3, expert: 0.12 }[distro.userLevel] ?? 0.4;
    else if (priority === 'steer-freedom') v = { '100-libre-fsf': 1, 'free-with-opt-in': 0.55, pragmatic: 0.15 }[distro.freeSoftwareStrictness] ?? 0.3;
    else if (priority === 'steer-privacy') v = PRIVACY_SPECIALISTS.has(distro.id) ? 1 : hasFeature(distro, 'tor', 'privacy', 'anonymity') ? 0.85 : 0.4;
    else if (priority === 'steer-minimalism') v = { 'potatoes-vintage': 1, lightweight: 0.9, 'modern-standard': 0.5, 'high-end-workstation': 0.3 }[distro.hardwareSpec] ?? 0.5;
    else if (priority === 'steer-reproducibility') v = distro.releaseModel === 'immutable-atomic' || ['nixos', 'guix-system'].includes(distro.id) ? 1 : 0.3;
    else v = priorityFit ? priorityFit[distro.releaseModel] ?? 0.5 : 0.5;
    add('q21_steering_priority', 'Your #1 priority', v,
      v >= 0.9 ? `Strongest possible fit for “${prettyPriority(priority)}”` : null,
      v < 0.5 ? `Compromises on “${prettyPriority(priority)}”` : null);
  }

  // 22 — Maintenance tolerance
  const maintenance = answers.q22_maintenance_tolerance;
  if (maintenance === 'zero-friction') {
    const v = { beginner: 1, intermediate: 0.8, advanced: 0.35, expert: 0.15 }[distro.userLevel] ?? 0.5;
    const bonus = distro.releaseModel === 'immutable-atomic' ? 0.05 : 0;
    add('q22_maintenance_tolerance', 'Low-maintenance operation', clamp01(v + bonus),
      v >= 0.9 ? 'Set-and-forget update model' : null,
      v < 0.5 ? 'Expects regular manual maintenance' : null);
  } else if (maintenance === 'occasional-tinkering') {
    const v = { beginner: 0.8, intermediate: 1, advanced: 1, expert: 0.75 }[distro.userLevel] ?? 0.7;
    add('q22_maintenance_tolerance', 'Occasional-tinkering fit', v);
  } else if (maintenance === 'enjoy-fixing') {
    const v = { beginner: 0.25, intermediate: 0.6, advanced: 1, expert: 1 }[distro.userLevel] ?? 0.6;
    add('q22_maintenance_tolerance', 'Hands-on maintenance fit', v,
      v === 1 ? 'Rewards hands-on administration' : null,
      v < 0.5 ? 'Hides the internals; little to tinker with' : null);
  }

  // 23 — Mainstream vs independent
  const mainstream = answers.q23_mainstream_vs_indie;
  if (mainstream === 'mainstream-ecosystem') {
    const v = { flagship: 1, specialist: 0.72, niche: 0.28 }[distro.tier] ?? 0.5;
    add('q23_mainstream_vs_indie', 'Mainstream ecosystem', v,
      distro.tier === 'flagship' ? 'Large, well-trodden ecosystem' : null,
      v < 0.5 ? 'Small ecosystem — fewer tutorials and drivers tested' : null);
  } else if (mainstream === 'balanced-recognition') {
    const v = { flagship: 1, specialist: 0.95, niche: 0.62 }[distro.tier] ?? 0.6;
    add('q23_mainstream_vs_indie', 'Recognisable ecosystem', v);
  } else if (mainstream === 'independent-novelty') {
    const v = { flagship: 0.55, specialist: 0.82, niche: 1 }[distro.tier] ?? 0.7;
    add('q23_mainstream_vs_indie', 'Independent / novel pick', v,
      distro.tier === 'niche' ? 'Independent project, not a derivative' : null);
  }

  return { criteria, hardFails };
}

/* ---------------------------- human labels ---------------------------- */

const USE_CASE_LABELS = {
  'daily-driver': 'daily driving',
  gaming: 'gaming',
  'software-development': 'software development',
  'privacy-anonymity': 'privacy',
  'cybersecurity-pentesting': 'security work',
  'server-homelab': 'servers/homelab',
  'creative-multimedia': 'creative work',
  'multimedia-creation': 'creative work',
  'low-spec-hardware': 'low-spec hardware',
  education: 'education',
  'enterprise-stability': 'enterprise stability',
  'tinkering-minimalism': 'tinkering/minimalism'
};
const prettyUseCase = (id) => USE_CASE_LABELS[id] || id;

const RELEASE_LABELS = {
  fixed: 'fixed/LTS',
  'semi-rolling': 'semi-rolling',
  rolling: 'rolling',
  'immutable-atomic': 'immutable/atomic'
};
const prettyRelease = (id) => RELEASE_LABELS[id] || id;

const DESKTOP_LABELS = {
  'gnome-cosmic': 'GNOME',
  'kde-plasma': 'KDE Plasma',
  'traditional-lightweight': 'traditional (XFCE/MATE/Cinnamon)',
  'tiling-window-manager': 'tiling',
  'minimalist-floating': 'minimal floating',
  'headless-cli': 'headless CLI'
};
const prettyDesktop = (id) => DESKTOP_LABELS[id] || id;

const PRIORITY_LABELS = {
  'steer-stability': 'rock-solid stability',
  'steer-gaming': 'gaming performance',
  'steer-freshness': 'bleeding-edge software',
  'steer-simplicity': 'ease of use',
  'steer-freedom': 'free software purity',
  'steer-privacy': 'privacy & anonymity',
  'steer-minimalism': 'minimal resource use',
  'steer-reproducibility': 'reproducibility'
};
const prettyPriority = (id) => PRIORITY_LABELS[id] || id;

/* ------------------------------- scoring ------------------------------- */

function tierPrior(distro, wantsIndependent = false) {
  // An explicit "give me something off the beaten path" answer means the
  // flagship bias has to step back, otherwise it cancels out the question.
  if (wantsIndependent) {
    if (distro.tier === 'flagship') return 0.008;
    if (distro.tier === 'specialist') return 0.014;
    return 0.02;
  }
  if (distro.tier === 'flagship') return 0.045;
  if (distro.tier === 'specialist') return 0.018;
  return 0; // niche gets no free boost; it has to earn its place
}

/**
 * Real-world familiarity prior.
 *
 * DistroWatch rank is the only objective "how many people actually use this"
 * signal in the dataset, and it matters: two distros can satisfy every
 * technical criterion equally well, and the one people can actually find help
 * for should win. The curve is steep on purpose so that a rank-2 project
 * (Mint, Ubuntu) always outranks a rank-180 curiosity.
 *
 * `wantsIndependent` damps it: if the user explicitly asked for an independent
 * project, raw popularity is exactly the wrong thing to reward.
 */
function popularityPrior(distro, wantsIndependent = false) {
  const rank = distro.dwRank || 999;
  let bonus;
  if (rank <= 3) bonus = 0.05;
  else if (rank <= 10) bonus = 0.04;
  else if (rank <= 25) bonus = 0.028;
  else if (rank <= 50) bonus = 0.016;
  else if (rank <= 100) bonus = 0.008;
  else if (rank <= 200) bonus = 0.002;
  else bonus = 0;
  return wantsIndependent ? bonus * 0.3 : bonus;
}

function steeringAdjustment(distro, steering) {
  let delta = 0;
  const scope = steering.scope || 'mainstream';

  if (steering.familyBias && steering.familyBias !== 'all') {
    delta += distro.family === steering.familyBias ? 0.06 : -0.04;
  }
  if (steering.gamingBoost && isGamingDistro(distro)) delta += 0.05;
  if (steering.nvidiaBoost && distro.gpuSupport === 'excellent-nvidia') delta += 0.04;
  if (steering.stabilityBias === 'rock-solid' && distro.releaseModel === 'fixed') delta += 0.035;
  if (steering.stabilityBias === 'rolling' && distro.releaseModel === 'rolling') delta += 0.035;
  if (steering.snapsPreference === 'avoid-snaps') {
    if (hasFeature(distro, 'no-snaps')) delta += 0.035;
    else if (distro.id === 'ubuntu') delta -= 0.06;
  }

  return { delta, scope };
}

/**
 * Evaluate every distro.
 * @returns {Array<{
 *   distro: object, score: number, matchPercentage: number,
 *   disqualified: boolean, disqualifiers: string[],
 *   matchReasons: string[], tradeoffs: string[],
 *   breakdown: Array<{id:string,label:string,value:number,weight:number,note:string|null,gap:string|null}>,
 *   confidence: {answered:number, total:number, percent:number}
 * }>}
 */
export const MatchingEngine = {
  evaluate(userAnswers = {}, questionWeights = {}, steering = {}) {
    const answeredCount = Object.keys(userAnswers).filter((k) => {
      const v = userAnswers[k];
      return Array.isArray(v) ? v.length > 0 : v != null;
    }).length;
    const totalQuestions = QUESTIONS_DATA.length;
    const confidence = {
      answered: answeredCount,
      total: totalQuestions,
      percent: Math.round((answeredCount / totalQuestions) * 100)
    };

    const userLevel = userAnswers.q1_user_level || null;
    const useCases = userAnswers.q2_use_cases || [];
    const scope = steering.scope || 'mainstream';

    const results = LINUX_DISTROS.map((distro) => {
      const { criteria, hardFails } = buildCriteria(distro, userAnswers, questionWeights);

      // --- Niche gate: never recommend an obscure project to a newcomer who
      // did not explicitly ask for an obscure project or a niche workflow.
      const specialtyRequested = useCases.some((u) =>
        ['cybersecurity-pentesting', 'privacy-anonymity', 'server-homelab', 'low-spec-hardware'].includes(u)
      );
      if (scope !== 'all' && distro.tier === 'niche' && !specialtyRequested) {
        const expertish = userLevel === 'advanced' || userLevel === 'expert' || userAnswers.q23_mainstream_vs_indie === 'independent-novelty';
        if (!expertish) {
          hardFails.push('Niche project — outside mainstream scope you selected');
        }
      }

      // --- Unpopularity gate: a project that barely registers on DistroWatch
      // is not a sensible recommendation for anyone who did not specifically
      // ask for an off-the-beaten-path system, even if it ticks every box.
      // Without this, a handful of near-identical niche projects crawl into
      // the shortlist purely because their data happens to line up.
      const wantsIndependent = userAnswers.q23_mainstream_vs_indie === 'independent-novelty';
      const rank = distro.dwRank || 999;
      const obscure = rank > 150;
      if (scope !== 'all' && obscure && !wantsIndependent && !specialtyRequested) {
        hardFails.push('Very small project — little community, documentation or hardware support');
      }

      // --- Live/rescue images are tools, not desktop distributions. They can
      // never be the recommendation, only ever a directory entry.
      if (LIVE_IMAGE_DISTROS.has(distro.id)) {
        hardFails.push('Live/rescue image — not an installable desktop system');
      }

      let satisfaction = 0;
      let weightSum = 0;
      for (const c of criteria) {
        // Neutral criteria are identical for every distro, so they cannot
        // express a preference. Excluding them keeps the weighted average
        // focused on the answers that actually separate the candidates.
        if (c.neutral || c.weight <= 0) continue;
        satisfaction += c.value * c.weight;
        weightSum += c.weight;
      }
      // Leave headroom above 0 for the priors below. If the criteria average
      // could reach 1.0 on its own, clamping would erase the popularity and
      // tier signal exactly where it matters most — and a dozen distros would
      // tie at 98% with the winner decided by an arbitrary tie-break.
      satisfaction = weightSum > 0 ? (satisfaction / weightSum) * 0.88 : 0.44;

      const { delta } = steeringAdjustment(distro, steering);
      satisfaction = clamp01(
        satisfaction + delta + tierPrior(distro, wantsIndependent) + popularityPrior(distro, wantsIndependent)
      );

      const disqualified = hardFails.length > 0;
      // A hard requirement violation should dominate the percentage, but keep it
      // non-zero so "ruled out" entries can still be inspected.
      const matchPercentage = disqualified
        ? Math.max(3, Math.round(22 * satisfaction))
        : Math.round(8 + 90 * Math.pow(satisfaction, 1.15));
      const strong = criteria
        .filter((c) => c.value >= 0.9 && c.weight >= 3 && c.note)
        .sort((a, b) => b.weight - a.weight);
      const medium = criteria
        .filter((c) => c.value >= 0.75 && c.weight >= 2 && c.note)
        .sort((a, b) => b.weight - a.weight);
      const matchReasons = [...new Set([...strong, ...medium].map((c) => c.note))].slice(0, 6);

      const tradeoffs = criteria
        .filter((c) => c.gap && c.value < 0.6 && c.weight >= 2)
        .sort((a, b) => b.weight * (1 - b.value) - a.weight * (1 - a.value))
        .map((c) => c.gap)
        .slice(0, 4);

      const breakdown = [...criteria]
        // Neutral criteria carry no weight and no information, so they are not
        // part of the score anatomy shown to the user.
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

  /**
   * Pick a diversified shortlist. Max 2 distros per family so the alternatives
   * are actually alternatives, not five Ubuntu respins.
   */
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
    // Backfill if diversity rules were too strict for the available data.
    if (picks.length < count) {
      for (const r of eligible) {
        if (picks.length >= count) break;
        if (!picks.includes(r)) picks.push(r);
      }
    }

    // Present the chosen set in score order, even though diversity decided membership.
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

  /** Plain-language explanation of what moved the winner to the top. */
  explain(winner, pick) {
    if (!winner) return [];
    const lines = [...winner.matchReasons];
    const runnerUp = pick?.alternatives?.[0];
    if (runnerUp) {
      const gap = winner.matchPercentage - runnerUp.matchPercentage;
      lines.push(
        gap <= 2
          ? `Practically tied with ${runnerUp.distro.name} — pick either, the difference is ${gap} point${gap === 1 ? '' : 's'}.`
          : `Outranks ${runnerUp.distro.name} by ${gap} points on the criteria you weighted highest.`
      );
    }
    return lines;
  },

  /** Generates user psychographic persona archetype (kept from v2, extended). */
  generateUserPersona(userAnswers, topDistro) {
    const q1 = userAnswers['q1_user_level'];
    const q2 = userAnswers['q2_use_cases'] || [];
    const q3 = userAnswers['q3_release_model'];
    const q11 = userAnswers['q11_software_freedom'];
    const q12 = userAnswers['q12_init_system'];
    const q18 = userAnswers['q18_gaming_tuning'];
    const q21 = userAnswers['q21_steering_priority'];

    if (q11 === 'strict-libre-fsf' || q21 === 'steer-freedom') {
      return {
        title: 'The Free Software Purist',
        badge: 'FSF LIBRE GUARDIAN',
        quote: 'Freedom is not a feature; it is the prerequisite of computing dignity.',
        description: 'You believe software should serve its users, not corporate surveillance monopolies. You refuse proprietary blobs, un-audited telemetry, and digital restrictions.',
        keyTraits: ['Zero Proprietary Blobs', 'Ideological Integrity', 'Open Standards Advocate', 'Local Hardware Sovereignty']
      };
    }

    if (q12 === 'non-systemd-strict') {
      return {
        title: 'The Unix Artisan',
        badge: 'INIT FREEDOM PIONEER',
        quote: 'Write programs that do one thing and do it well. Keep it simple and auditable.',
        description: 'You value clarity, process isolation, and the classic UNIX philosophy. You appreciate the speed of Runit or OpenRC, lightning-fast boot times, and a system where PID 1 does not attempt to swallow the entire operating system stack.',
        keyTraits: ['KISS Philosophy', 'Micro-Supervisor Fan', 'Minimal Background Daemons', 'Deep OS Literacy']
      };
    }

    if (q18 === 'hardcore-pc-gamer' || q21 === 'steer-gaming' || q2.includes('gaming')) {
      return {
        title: 'The High-FPS Frontier Gamer',
        badge: 'PROTON & SILICON COMMANDER',
        quote: 'Why tolerate Windows bloatware and telemetry when Linux pushes more frames?',
        description: 'You demand maximum GPU throughput, bleeding-edge Vulkan drivers, custom low-latency kernels (fsync/BORE), and zero stutters.',
        keyTraits: ['Custom Gaming Kernels', 'Proton & DXVK Tuning', 'Vulkan Enthusiast', 'Handheld / TV Console Ready']
      };
    }

    if (q2.includes('privacy-anonymity') || q21 === 'steer-privacy') {
      return {
        title: 'The Ghost Protocol Sentinel',
        badge: 'ZERO-TELEMETRY OPERATOR',
        quote: "If you aren't paying for privacy with architecture, you're paying with your identity.",
        description: 'You treat network boundaries with disciplined skepticism. Whether routing traffic through multi-hop Tor circuits or running amnesic sessions in RAM, you leave zero traces.',
        keyTraits: ['Amnesic Memory Architecture', 'Traffic Compartmentalization', 'Anti-Fingerprinting', 'Cryptographic Rigor']
      };
    }

    if (q1 === 'expert' || q3 === 'rolling-bleeding-edge' || q21 === 'steer-freshness') {
      return {
        title: 'The Bleeding-Edge Architect',
        badge: 'UPSTREAM PIONEER',
        quote: "If my packages aren't from this morning, my system is already obsolete.",
        description: 'You thrive on continuous rolling releases, upstream kernel commits, and the Arch Wiki. You don\'t fear manual intervention; you relish tailoring every config file to perfection.',
        keyTraits: ['Rolling Upstream Kernel', 'Custom Ricing & Dotfiles', 'Terminal Dexterity', 'Continuous Innovation']
      };
    }

    if (q3 === 'immutable-atomic' || q21 === 'steer-reproducibility' || (topDistro && (topDistro.id === 'nixos' || topDistro.id.includes('silverblue') || topDistro.id === 'bazzite'))) {
      return {
        title: 'The Declarative Architect',
        badge: 'REPRODUCIBILITY VIRTUOSO',
        quote: 'State is a bug; reproducible configuration is the only sanity.',
        description: 'You treat your operating system not as an imperatively modified snowflake, but as immutable infrastructure. You want atomic deployments, instant rollback snapshots, and containerized dev environments that never rot.',
        keyTraits: ['Atomic Root Filesystems', 'Declarative Builds', 'Flatpak & Container Workflows', 'Instant Snapshot Rollbacks']
      };
    }

    if (q2.includes('low-spec-hardware') || q21 === 'steer-minimalism') {
      return {
        title: 'The Silicon Resurrecter',
        badge: 'HARDWARE ALCHEMIST',
        quote: 'Planned obsolescence is an illusion created by inefficient software.',
        description: 'Where others see e-waste, you see a functional computing machine. With ultra-light window managers and efficient C/musl libraries, you make 15-year-old laptops run snappier than modern consumer computers burdened by bloat.',
        keyTraits: ['Sub-300MB RAM Footprint', 'E-Waste Reduction', 'Featherweight Window Managers', 'Ultra-Efficient Kernels']
      };
    }

    if (q2.includes('software-development')) {
      return {
        title: 'The Developer Craftsperson',
        badge: 'ENGINEERING WORKBENCH',
        quote: 'My OS is the foundation of my toolchain — it should never be the bottleneck.',
        description: 'You need Docker, Kubernetes, compilers, IDEs, and Git workflows to all run seamlessly. Container isolation, terminal multiplexing, and polyglot language toolchains are your daily bread.',
        keyTraits: ['Container Orchestration', 'Polyglot Toolchains', 'Terminal Dexterity', 'CI/CD Pipeline Ready']
      };
    }

    return {
      title: 'The Pragmatic Workhorse',
      badge: 'EFFICIENCY & PRODUCTIVITY REALIST',
      quote: 'My operating system is a tool to get things done, not an obstacle to fight.',
      description: 'You value an elegant, responsive desktop with battle-tested stability and seamless hardware support. You want your Wi-Fi, displays, and software to simply work without unnecessary ritual.',
      keyTraits: ['High Productivity', 'Stable Software Baseline', 'Frictionless Workflow', 'Pragmatic Driver Harmony']
    };
  }
};
