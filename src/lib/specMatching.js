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

function popularityPrior(distro) {
  const rank = distro.dwRank || 999;
  if (rank <= 20) return 6;
  if (rank <= 50) return 4;
  if (rank <= 100) return 2;
  return 0;
}

function tierPrior(distro) {
  if (distro.tier === 'flagship') return 3;
  if (distro.tier === 'specialist') return 1.5;
  return 0;
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

    const base = compatibility.score * 0.6 + needScore * 0.25 + platformScore * 0.15;
    const matchPercentage = Math.max(0, Math.min(100, Math.round(base + popularityPrior(distro) + tierPrior(distro))));

    const reasons = compatibility.notes
      .filter((note) => !/not specifically|not primarily|no dedicated|may need setup|would feel|may be better|would suit/i.test(note))
      .slice(0, 3);

    return { distro, compatibility, matchPercentage, reasons };
  }).filter(Boolean);

  scored.sort((a, b) => b.matchPercentage - a.matchPercentage || (a.distro.dwRank || 999) - (b.distro.dwRank || 999));

  // Keep the shortlist varied by family.
  const perFamily = Math.ceil(count / 3);
  const familyCounts = new Map();
  const picks = [];
  const leftovers = [];
  for (const result of scored) {
    const family = result.distro.family;
    const used = familyCounts.get(family) || 0;
    if (used < perFamily && picks.length < count) {
      picks.push(result);
      familyCounts.set(family, used + 1);
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
