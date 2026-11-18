/**
 * Swipe-deck trait signals.
 *
 * Every label is derived from a real catalogue field. This module is pure:
 * no imports, no side effects, no distro ids. The first (most distinctive)
 * signal is marked `accent`; the rest are `neutral`.
 */

const asList = (value) => (Array.isArray(value) ? value : value ? [value] : []);

const hasUseCase = (distro, name) =>
  asList(distro.primaryUseCases).some((use) => String(use).toLowerCase() === name);

const hasFeature = (distro, ...needles) => {
  const haystack = [
    ...asList(distro.specialFeatures),
    ...asList(distro.desktopEnvironments),
    ...asList(distro.architectures),
    distro.packageManager || '',
    distro.base || ''
  ]
    .join(' ')
    .toLowerCase();
  return needles.some((raw) => {
    const needle = raw.toLowerCase().trim();
    if (!needle) return false;
    const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '[-_ ]');
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`).test(haystack);
  });
};

/** Ordered by specificity; only the first three matches are kept. */
const RULES = [
  {
    label: '100% libre purist',
    matches: (d) => d.freeSoftwareStrictness === '100-libre-fsf'
  },
  {
    label: 'No systemd',
    matches: (d) => Boolean(d.initSystem) && d.initSystem !== 'systemd'
  },
  {
    label: 'Old-hardware friendly',
    matches: (d) => ['potatoes-vintage', 'lightweight'].includes(d.hardwareSpec)
  },
  {
    label: 'Gaming-ready',
    matches: (d) => hasUseCase(d, 'gaming') || hasFeature(d, 'gamescope', 'proton', 'gaming')
  },
  {
    label: 'Handheld-ready',
    matches: (d) => hasFeature(d, 'handheld', 'gamescope') && hasUseCase(d, 'gaming')
  },
  {
    label: 'Free software by default',
    matches: (d) => d.freeSoftwareStrictness === 'free-with-opt-in'
  },
  {
    label: 'Great for newcomers',
    matches: (d) => d.userLevel === 'beginner'
  },
  {
    label: 'Rolling updates',
    matches: (d) => d.releaseModel === 'rolling'
  },
  {
    label: 'Atomic & reversible',
    matches: (d) => d.releaseModel === 'immutable-atomic'
  },
  {
    label: 'Rock-solid LTS',
    matches: (d) => d.releaseModel === 'fixed'
  },
  {
    label: 'Server / homelab',
    matches: (d) => hasUseCase(d, 'server-homelab')
  },
  {
    label: 'Privacy-first',
    matches: (d) => hasUseCase(d, 'privacy-anonymity') || hasFeature(d, 'tor', 'anonymity')
  },
  {
    label: 'ARM64 build',
    matches: (d) => asList(d.architectures).includes('arm64')
  },
  {
    label: 'Power-user tools',
    matches: (d) => d.userLevel === 'advanced' || d.userLevel === 'expert'
  },
  {
    label: 'Turnkey NVIDIA',
    matches: (d) => d.gpuSupport === 'excellent-nvidia'
  },
  {
    label: 'NVIDIA drivers available',
    matches: (d) => d.gpuSupport === 'standard-nvidia'
  }
];

export function traitSignals(distro) {
  if (!distro || typeof distro !== 'object') return [];
  const matches = RULES.filter((rule) => rule.matches(distro))
    .slice(0, 3)
    .map((rule, index) => ({
      label: rule.label,
      tone: index === 0 ? 'accent' : 'neutral'
    }));
  return matches;
}
