import { test, expect } from 'bun:test';
import { traitSignals } from '../src/lib/swipeTraits.js';

const labels = (distro) => traitSignals(distro).map((signal) => signal.label.toLowerCase());

test('a beginner gaming distro gets newcomer and gaming signals', () => {
  const signals = traitSignals({
    userLevel: 'beginner',
    primaryUseCases: ['gaming', 'daily-driver']
  });
  const text = signals.map((s) => s.label.toLowerCase()).join(' ');
  expect(text).toMatch(/newcomer|beginner/);
  expect(text).toContain('gaming');
});

test('a strictly libre distro gets a libre purist signal', () => {
  expect(labels({ freeSoftwareStrictness: '100-libre-fsf' }).join(' ')).toMatch(/libre|purist/);
});

test('a non-systemd distro gets a non-systemd signal', () => {
  expect(labels({ initSystem: 'openrc' }).join(' ')).toContain('systemd');
});

test('a low-spec distro gets an old-hardware signal', () => {
  expect(labels({ hardwareSpec: 'potatoes-vintage' }).join(' ')).toMatch(/old|lightweight|low-spec/);
});

test('storage features do not produce a privacy signal', () => {
  const labels = traitSignals({ specialFeatures: ['zfs-storage-clustering', 'repository-manager'] })
    .map((signal) => signal.label);
  expect(labels).not.toContain('Privacy-first');
});

test('turnkey nvidia is reserved for excellent support', () => {
  expect(traitSignals({ gpuSupport: 'excellent-nvidia' }).map((s) => s.label))
    .toContain('Turnkey NVIDIA');
  expect(traitSignals({ gpuSupport: 'standard-nvidia' }).map((s) => s.label))
    .not.toContain('Turnkey NVIDIA');
});

test('a rolling distro gets a rolling signal', () => {
  expect(labels({ releaseModel: 'rolling' }).join(' ')).toContain('rolling');
});

test('an empty record produces no signals', () => {
  expect(traitSignals({})).toEqual([]);
});

test('signals are well formed and capped at three', () => {
  const signals = traitSignals({
    userLevel: 'beginner',
    primaryUseCases: ['gaming', 'server-homelab', 'privacy-anonymity'],
    freeSoftwareStrictness: '100-libre-fsf',
    releaseModel: 'rolling',
    initSystem: 'runit',
    hardwareSpec: 'potatoes-vintage'
  });
  expect(signals.length).toBeLessThanOrEqual(3);
  for (const signal of signals) {
    expect(Object.keys(signal).sort()).toEqual(['label', 'tone']);
    expect(['accent', 'neutral']).toContain(signal.tone);
  }
});
