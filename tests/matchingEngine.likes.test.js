import { test, expect } from 'bun:test';
import { MatchingEngine } from '../src/lib/matchingEngine.js';

const answers = {
  q_experience: 'casual',
  q_goal: 'everyday',
  q_device: 'laptop',
  q_memory: 'mainstream',
  q_graphics: 'amd',
  q_updates: 'lts',
  q_maintenance: 'set-and-forget',
  q_starting_point: 'complete',
  q_rollback: 'manual',
  q_freedom: 'opt-in',
  q_init: 'systemd',
  q_privacy: 'strict',
  q_desktop: ['classic'],
  q_packages: 'app-store',
  q_priority: 'simplicity'
};

test('empty likes leave every score and disqualifier unchanged', () => {
  const baseline = MatchingEngine.evaluate(answers, {}, {});
  const withEmptyLikes = MatchingEngine.evaluate(answers, {}, {}, { likes: [] });
  expect(withEmptyLikes.map((r) => [r.distro.id, r.matchPercentage, r.disqualifiers])).toEqual(
    baseline.map((r) => [r.distro.id, r.matchPercentage, r.disqualifiers])
  );
});

test('a liked distro gains score and a swipe reason', () => {
  const baseline = MatchingEngine.evaluate(answers, {}, {});
  const liked = MatchingEngine.evaluate(answers, {}, {}, { likes: ['linux-mint'] });
  const before = baseline.find((r) => r.distro.id === 'linux-mint');
  const after = liked.find((r) => r.distro.id === 'linux-mint');
  expect(after.matchPercentage).toBeGreaterThan(before.matchPercentage);
  expect(after.matchReasons).toContain('You liked this in the swipe deck');
});

test('a hard filter still disqualifies a liked distro', () => {
  const strictAnswers = { ...answers, q_freedom: 'libre-only' };
  const result = MatchingEngine.evaluate(strictAnswers, {}, {}, { likes: ['ubuntu'] });
  const ubuntu = result.find((r) => r.distro.id === 'ubuntu');
  expect(ubuntu.disqualified).toBe(true);
});

test('liked eligible distros rank ahead of unliked ones', () => {
  const result = MatchingEngine.evaluate(answers, {}, {}, { likes: ['linux-mint'] });
  const eligible = result.filter((r) => !r.disqualified);
  const firstLiked = eligible.findIndex((r) => r.liked);
  const firstUnliked = eligible.findIndex((r) => !r.liked);
  expect(firstLiked).toBeGreaterThanOrEqual(0);
  expect(firstLiked).toBeLessThan(firstUnliked);
  expect(MatchingEngine.recommend(result, 5).winner.distro.id).toBe('linux-mint');
});

test('liking a niche distro lifts the mainstream scope gate for it', () => {
  const result = MatchingEngine.evaluate({}, {}, {}, { likes: ['ubuntu-budgie'] });
  const budgie = result.find((r) => r.distro.id === 'ubuntu-budgie');
  expect(budgie.disqualified).toBe(false);
});

test('recommend still caps families at two with likes present', () => {
  const result = MatchingEngine.evaluate(answers, {}, {}, { likes: ['linux-mint', 'arch-linux'] });
  const picks = MatchingEngine.recommend(result, 5).picks;
  const counts = new Map();
  for (const pick of picks) counts.set(pick.distro.family, (counts.get(pick.distro.family) || 0) + 1);
  for (const count of counts.values()) expect(count).toBeLessThanOrEqual(2);
});
