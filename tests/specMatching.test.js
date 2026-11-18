import { describe, expect, test } from 'bun:test';
import { DISTRO_MAP } from '../src/data/distros.js';
import { compatibilityFor, recommendBySpecs, describeSpecs } from '../src/lib/specMatching.js';

const modernSpecs = {
  needs: ['gaming', 'daily'],
  platform: 'laptop',
  cpu: {
    id: 'amd-ryzen-5-5600x',
    name: 'AMD Ryzen 5 5600X',
    brand: 'amd',
    generation: 'zen3',
    arch: 'x86_64',
    score: 72,
    cores: 6
  },
  gpu: {
    id: 'gpu-nvidia',
    name: 'GeForce RTX 4060',
    brand: 'NVIDIA',
    score: 66,
    vram: 8,
    proprietary: true
  },
  ramGB: 16
};

describe('compatibilityFor', () => {
  test('gives a strong verdict for a well matched modern laptop', () => {
    const result = compatibilityFor(DISTRO_MAP['linux-mint'], modernSpecs);
    expect(result.tone).toBe('great');
    expect(result.blockers).toHaveLength(0);
    expect(result.notes.join(' ')).toContain('NVIDIA drivers');
  });

  test('blocks an ARM processor on a distro without an ARM build', () => {
    const armSpecs = {
      ...modernSpecs,
      platform: 'arm-board',
      cpu: { ...modernSpecs.cpu, arch: 'arm64', name: 'Apple M1' },
      ramGB: 4
    };
    const result = compatibilityFor(DISTRO_MAP['linux-mint'], armSpecs);
    expect(result.tone).toBe('poor');
    expect(result.blockers.join(' ')).toContain('ARM');
    expect(result.score).toBeLessThan(20);
  });

  test('flags low memory and proprietary drivers on a mesa-only distro', () => {
    const result = compatibilityFor(DISTRO_MAP['steamos'], {
      ...modernSpecs,
      ramGB: 2
    });
    expect(result.blockers.join(' ')).toMatch(/memory|driver/i);
  });
});

describe('recommendBySpecs', () => {
  test('returns five distinct eligible distros with match percentages', () => {
    const picks = recommendBySpecs(modernSpecs, 5);
    expect(picks).toHaveLength(5);
    expect(new Set(picks.map((pick) => pick.distro.id)).size).toBe(5);
    for (const pick of picks) {
      expect(pick.matchPercentage).toBeGreaterThanOrEqual(0);
      expect(pick.matchPercentage).toBeLessThanOrEqual(100);
      expect(pick.compatibility.blockers).toHaveLength(0);
    }
  });

  test('varies the families in the shortlist when possible', () => {
    const picks = recommendBySpecs(modernSpecs, 5);
    expect(new Set(picks.map((pick) => pick.distro.family)).size).toBeGreaterThan(1);
  });
});

describe('describeSpecs', () => {
  test('summarises saved specs in plain text', () => {
    const text = describeSpecs(modernSpecs);
    expect(text).toContain('Laptop');
    expect(text).toContain('16 GB RAM');
    expect(text).toContain('Gaming');
  });
});
