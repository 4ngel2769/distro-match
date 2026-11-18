import { LINUX_DISTROS } from '../data/distros.js';
import { NEEDS, PLATFORMS } from '../data/specOptions.js';

const NEED_TO_USE_CASES = {
  daily: ['daily-driver'],
  gaming: ['gaming'],
  development: ['software-development'],
  privacy: ['privacy-anonymity'],
  creative: ['creative-multimedia', 'multimedia-creation'],
  learning: ['education', 'daily-driver']
};

const NEED_LABELS = Object.fromEntries(NEEDS.map((need) => [need.id, need.label]));
const PLATFORM_LABELS = Object.fromEntries(PLATFORMS.map((platform) => [platform.id, platform.label]));

// Distros with a usable Apple Silicon desktop build. An arm64 package alone is
// not enough: a server-only or embedded image is not a Mac desktop experience.
const APPLE_SILICON_DISTROS = new Set([
  'ubuntu', 'debian', 'fedora-workstation', 'pop-os', 'manjaro', 'endeavouros',
  'opensuse-tumbleweed', 'elementary-os', 'nixos', 'void-linux', 'kali-linux',
  'fedora-silverblue', 'deepin', 'ubuntu-budgie', 'vanilla-os', 'rhino-linux',
  'fedora-kinoite', 'pureos', 'trisquel', 'parrot-sec', 'guix-system',
  'opensuse-leap', 'ultramarine-linux', 'mageia', 'openmandriva',
  'bedrock-linux', 'regolith-linux', 'chimera-linux', 'astra-linux',
  'alt-linux', 'gentoo', 'q4os', 'sparkylinux'
]);

function ramToGb(value) {
  const text = String(value || '').trim().toLowerCase();
  const number = parseFloat(text);
  if (!Number.isFinite(number)) return null;
  return text.includes('mb') ? number / 1024 : number;
}

function hasUseCase(distro, ids) {
  return ids.some((id) => (distro.primaryUseCases || []).includes(id));
}

function hasFeature(distro, words) {
  const features = (distro.specialFeatures || []).join(' ').toLowerCase();
  return words.some((word) => features.includes(word));
}

function isHeavyDesktop(distro) {
  return (distro.desktopEnvironments || []).some((env) =>
    /gnome|kde|plasma|cinnamon/i.test(env)
  );
}

/**
 * Work out how well one distro fits a set of specs.
 * Returns a score, a plain-language verdict and the reasons behind it.
 */
export function compatibilityFor(distro, specs) {
  let score = 100;
  const notes = [];
  const blockers = [];
  const add = (text, penalty = 0) => {
    notes.push(text);
    score -= penalty;
  };
  const block = (text, penalty) => {
    blockers.push(text);
    score -= penalty;
  };

  const cpu = specs.cpu;
  const gpu = specs.gpu;
  const ram = Number(specs.ramGB) || 0;
  const architectures = distro.architectures || [];
  const minRam = ramToGb(distro.minRam) ?? 0;
  const recommendedRam = ramToGb(distro.recommendedRam) ?? minRam;

  // Architecture is the only truly absolute check.
  if (cpu?.arch === 'arm64' && !architectures.includes('arm64')) {
    block('No ARM build is available for this distribution', 70);
  } else if (cpu?.arch === 'x86_64' && !architectures.includes('x86_64') && !architectures.includes('x86_32')) {
    block('This distribution does not run on x86 processors', 70);
  } else if (architectures.includes('arm64') || architectures.includes('x86_64')) {
    add('Runs on your processor architecture');
  }

  // Apple Silicon needs a real Mac desktop build, not just any ARM package.
  if (cpu?.brand === 'apple') {
    if (APPLE_SILICON_DISTROS.has(distro.id)) {
      add('Has an Apple Silicon build');
    } else {
      block('No Apple Silicon build is available for this distribution', 75);
    }
  }

  // Platform and processor family must agree.
  if (specs.platform === 'arm-board' && cpu?.arch !== 'arm64' && cpu?.arch !== 'armhf') {
    block('An ARM board needs an ARM processor', 75);
  }
  if (specs.platform === 'handheld' && cpu?.brand === 'apple') {
    block('Handhelds do not use Apple M-series chips', 75);
  }

  // Memory.
  if (ram && ram < minRam) {
    block(`Needs at least ${distro.minRam} of memory`, 60);
  } else if (ram && ram < recommendedRam) {
    add(`${ram} GB works, but ${distro.recommendedRam} is recommended`, 16);
  } else if (ram) {
    add(`${ram} GB meets the recommended memory target`);
  }

  // Processor speed, using the catalog's relative score.
  if (cpu?.score != null) {
    if (cpu.score < 22 && distro.hardwareSpec === 'high-end-workstation') {
      add('This processor may struggle with a workstation-oriented release', 22);
    } else if (cpu.score < 30 && distro.hardwareSpec === 'modern-standard') {
      add('A lighter edition would feel snappier on this processor', 12);
    } else if (cpu.score >= 70) {
      add('Your processor has plenty of headroom');
    }
  }

  // Graphics and drivers.
  if (gpu?.proprietary) {
    if (distro.gpuSupport === 'mesa-only') {
      block('No proprietary NVIDIA driver support', 65);
    } else if (distro.gpuSupport === 'excellent-nvidia') {
      add('NVIDIA drivers are available out of the box');
    } else if (distro.gpuSupport === 'standard-nvidia') {
      add('NVIDIA drivers are supported but may need setup', 8);
    }
  } else if (gpu) {
    if (distro.gpuSupport === 'mesa-only' || distro.gpuSupport === 'standard-apu') {
      add('Open-source graphics drivers are built in');
    }
    if (gpu.score < 20 && isHeavyDesktop(distro)) {
      add('A lighter desktop would suit this graphics chip better', 12);
    }
  }

  // Platform fit.
  if (specs.platform === 'server') {
    if (hasUseCase(distro, ['server-homelab', 'enterprise-stability'])) {
      add('Built with servers and always-on use in mind');
    } else {
      add('Not primarily designed as a server system', 24);
    }
  } else if (specs.platform === 'handheld') {
    if (hasFeature(distro, ['handheld', 'gamescope'])) {
      add('Has a dedicated handheld edition');
    } else {
      add('No dedicated handheld mode, so controls may need setup', 18);
    }
  } else if (specs.platform === 'arm-board') {
    if (architectures.includes('arm64') || architectures.includes('armhf')) {
      add('Supports ARM single board computers');
    }
  } else if (specs.platform === 'laptop' && hasFeature(distro, ['laptop', 'wifi'])) {
    add('Good laptop support');
  }

  // Needs.
  for (const needId of specs.needs || []) {
    const useCases = NEED_TO_USE_CASES[needId] || [];
    const label = NEED_LABELS[needId] || needId;
    if (hasUseCase(distro, useCases)) {
      add(`Fits ${label.toLowerCase()}`);
    } else {
      add(`Not specifically tuned for ${label.toLowerCase()}`, 10);
    }
  }
  if ((specs.needs || []).includes('privacy') && distro.freeSoftwareStrictness === '100-libre-fsf') {
    add('Fully free software, which suits a privacy focus');
  }

  // Heavy desktops on small memory.
  if (ram && ram <= 4 && isHeavyDesktop(distro)) {
    add('A lighter desktop edition may be better with this much memory', 10);
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const tone = blockers.length || score < 45 ? 'poor' : score < 65 ? 'okay' : score < 85 ? 'good' : 'great';
  const verdicts = {
    great: 'Runs great',
    good: 'Should run well',
    okay: 'Runs with compromises',
    poor: 'Not a good fit'
  };

  return { score, tone, verdict: verdicts[tone], notes, blockers };
}

const GAMING_SPECIALISTS = new Set([
  'bazzite', 'nobara', 'cachyos', 'pop-os', 'steamos', 'garuda-linux',
  'manjaro', 'endeavouros', 'batocera', 'lakka', 'recalbox', 'chimeraos'
]);
const BOARD_DISTROS = new Set([
  'raspberry-pi-os', 'armbian', 'dietpi', 'openwrt', 'libreelec',
  'batocera', 'lakka', 'recalbox', 'postmarketos', 'mobian', 'alpine-linux'
]);

function popularityPrior(distro) {
  const rank = distro.dwRank || 999;
  if (rank <= 10) return 2;
  if (rank <= 30) return 1.5;
  if (rank <= 70) return 0.75;
  return 0;
}

function tierPrior(distro) {
  if (distro.tier === 'flagship') return 1.5;
  if (distro.tier === 'specialist') return 1;
  return 0;
}

/** Positive evidence that a distro fits the chosen needs, platform and hardware. */
function specificity(distro, specs) {
  const signals = [];
  const add = (points, text) => signals.push({ points, text });
  const needs = specs.needs || [];
  const platform = specs.platform;
  const ram = Number(specs.ramGB) || 0;
  const cpuScore = specs.cpu?.score || 0;
  const proprietary = Boolean(specs.gpu?.proprietary);
  const integrated = Boolean(specs.gpu?.integrated);

  // Needs.
  if (needs.includes('gaming')) {
    if (GAMING_SPECIALISTS.has(distro.id)) add(16, 'Built for gaming');
    else if (hasFeature(distro, ['gamescope', 'handheld', 'hdr-and-vrr', 'steam'])) add(11, 'Gaming-focused desktop');
    else if (hasUseCase(distro, ['gaming'])) add(7, 'Supports gaming');
  }
  if (needs.includes('development')) {
    const packages = (distro.packageManager || '').toLowerCase();
    if (hasFeature(distro, ['aur', 'nix', 'developer'])) add(10, 'Developer-friendly tooling');
    else if (/aur|nix|flatpak/.test(packages)) add(6, 'Useful package tooling for development');
    else if (hasUseCase(distro, ['software-development'])) add(5, 'Suits software development');
  }
  if (needs.includes('privacy')) {
    if (distro.freeSoftwareStrictness === '100-libre-fsf') add(12, 'Fully free software');
    if (hasUseCase(distro, ['privacy-anonymity'])) add(9, 'Privacy-focused by design');
    if (hasFeature(distro, ['tor', 'amnesic'])) add(8, 'Privacy features built in');
  }
  if (needs.includes('daily')) {
    if (hasUseCase(distro, ['daily-driver'])) add(9, 'Made for everyday use');
    if (distro.userLevel === 'beginner') add(4, 'Easy for newcomers');
  }
  if (needs.includes('creative') && hasUseCase(distro, ['creative-multimedia', 'multimedia-creation'])) {
    add(10, 'Geared toward creative work');
  }
  if (needs.includes('learning')) {
    if (distro.userLevel === 'beginner') add(11, 'A friendly first Linux distro');
    if (hasUseCase(distro, ['education'])) add(7, 'Used in education');
  }

  // Platform.
  if (platform === 'handheld') {
    if (hasFeature(distro, ['handheld-editions', 'dedicated-handheld'])) add(22, 'Dedicated handheld edition');
    else if (hasFeature(distro, ['gamescope'])) add(13, 'Gamescope session for controllers');
  } else if (platform === 'server') {
    if (hasUseCase(distro, ['server-homelab', 'enterprise-stability'])) add(13, 'Built for server use');
    if ((distro.desktopEnvironments || []).some((env) => /headless|cli/i.test(env))) add(8, 'Runs headless');
  } else if (platform === 'arm-board') {
    if (BOARD_DISTROS.has(distro.id)) add(20, 'Designed for single board computers');
    if (hasUseCase(distro, ['tinkering-minimalism', 'low-spec-hardware', 'server-homelab'])) add(6, 'Fits small ARM hardware');
  } else if (platform === 'mini-pc') {
    if (distro.hardwareSpec === 'lightweight') add(9, 'Light on resources');
    if (distro.apuSupport === 'low-power-apu') add(7, 'Tuned for low-power graphics');
  } else if (platform === 'laptop') {
    if (hasFeature(distro, ['laptop', 'wifi', 'power'])) add(8, 'Good laptop support');
    if (distro.hardwareSpec === 'lightweight') add(5, 'Kind to battery and thermals');
  } else if (platform === 'desktop' && cpuScore >= 70 && distro.hardwareSpec === 'high-end-workstation') {
    add(8, 'Can use your processor fully');
  }

  // Hardware.
  if (proprietary) {
    if (distro.gpuSupport === 'excellent-nvidia') add(12, 'Excellent NVIDIA driver support');
    if (hasFeature(distro, ['preinstalled-nvidia', 'dedicated-nvidia-iso'])) add(10, 'NVIDIA drivers included');
    else if (distro.gpuSupport === 'standard-nvidia') add(4, 'NVIDIA drivers supported');
  }
  if (integrated) {
    if (distro.apuSupport === 'stellar-apu-gaming') add(12, 'Tuned for integrated graphics');
    else if (distro.apuSupport === 'low-power-apu') add(6, 'Good with integrated graphics');
  }
  if (ram && ram <= 4 && ['lightweight', 'potatoes-vintage'].includes(distro.hardwareSpec)) {
    add(13, 'Runs well with limited memory');
  }
  if (cpuScore && cpuScore < 25 && ['lightweight', 'potatoes-vintage'].includes(distro.hardwareSpec)) {
    add(10, 'Suits older processors');
  }

  const points = Math.min(45, signals.reduce((sum, signal) => sum + signal.points, 0));
  return { points, reasons: signals.sort((a, b) => b.points - a.points).map((signal) => signal.text) };
}

/**
 * Rank distributions for a set of specs. Blocked distros are left out.
 */
export function recommendBySpecs(specs, count = 5) {
  const needs = specs.needs || [];
  const platform = specs.platform;

  const scored = LINUX_DISTROS.map((distro) => {
    const compatibility = compatibilityFor(distro, specs);
    if (compatibility.blockers.length) return null;

    let needScore = 50;
    if (needs.length) {
      const matches = needs.filter((needId) =>
        hasUseCase(distro, NEED_TO_USE_CASES[needId] || [])
      ).length;
      needScore = Math.round((matches / needs.length) * 100);
    }

    let platformScore = 50;
    if (platform === 'server') {
      platformScore = hasUseCase(distro, ['server-homelab', 'enterprise-stability']) ? 100 : 20;
    } else if (platform === 'handheld') {
      platformScore = hasFeature(distro, ['handheld', 'gamescope']) ? 100 : 40;
    } else if (platform === 'arm-board') {
      platformScore = (distro.architectures || []).some((arch) => arch.startsWith('arm')) ? 100 : 10;
    } else if (platform === 'desktop' || platform === 'laptop' || platform === 'mini-pc') {
      platformScore = hasUseCase(distro, ['daily-driver', 'gaming', 'software-development']) ? 90 : 45;
    }

    const fit = specificity(distro, specs);
    const base = compatibility.score * 0.4 + needScore * 0.15 + platformScore * 0.12 + fit.points * 0.45;
    const matchPercentage = Math.max(
      0,
      Math.min(100, Math.round(base + popularityPrior(distro) + tierPrior(distro)))
    );

    const compatibilityReasons = compatibility.notes.filter((note) =>
      !/not specifically|not primarily|no dedicated|may need setup|would feel|may be better|would suit/i.test(note)
    );
    const reasons = [...fit.reasons, ...compatibilityReasons].slice(0, 4);

    return { distro, compatibility, matchPercentage, reasons, fit: fit.points };
  }).filter(Boolean);

  scored.sort(
    (a, b) => b.matchPercentage - a.matchPercentage || b.fit - a.fit ||
      (a.distro.dwRank || 999) - (b.distro.dwRank || 999)
  );

  // Keep the shortlist varied by family, then by base distribution.
  const perFamily = Math.ceil(count / 3);
  const familyCounts = new Map();
  const baseCounts = new Map();
  const picks = [];
  const leftovers = [];
  for (const result of scored) {
    const family = result.distro.family;
    const base = result.distro.base || family;
    const familyUsed = familyCounts.get(family) || 0;
    const baseUsed = baseCounts.get(base) || 0;
    if (familyUsed < perFamily && baseUsed < 2 && picks.length < count) {
      picks.push(result);
      familyCounts.set(family, familyUsed + 1);
      baseCounts.set(base, baseUsed + 1);
    } else {
      leftovers.push(result);
    }
  }
  while (picks.length < count && leftovers.length) picks.push(leftovers.shift());

  return picks;
}

export function describeSpecs(specs) {
  const parts = [];
  if (specs.platform) parts.push(PLATFORM_LABELS[specs.platform] || specs.platform);
  if (specs.cpu?.name) parts.push(specs.cpu.name);
  if (specs.gpu?.name) parts.push(specs.gpu.name);
  if (specs.ramGB) parts.push(`${specs.ramGB} GB RAM`);
  if ((specs.needs || []).length) {
    parts.push((specs.needs || []).map((id) => NEED_LABELS[id] || id).join(' and '));
  }
  return parts.join(' · ');
}
