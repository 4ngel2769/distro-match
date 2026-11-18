import { test, expect } from 'bun:test';
import { nextCursor, isSwipeable } from '../src/lib/swipeDeck.js';

const distros = [
  { id: 'a', name: 'A' },
  { id: 'b', name: 'B' },
  { id: 'c', name: 'C' }
];

test('cursor returns to zero while unseen cards remain', () => {
  expect(nextCursor(distros, new Set(['a']), 0)).toBe(0);
});

test('cursor advances through the pool after every card has been seen', () => {
  const seen = new Set(['a', 'b', 'c']);
  expect(nextCursor(distros, seen, 0)).toBe(1);
  expect(nextCursor(distros, seen, 1)).toBe(2);
  expect(nextCursor(distros, seen, 2)).toBe(0);
});

test('empty pool keeps cursor at zero', () => {
  expect(nextCursor([], new Set(), 0)).toBe(0);
});

test('live and rescue images are not swipeable', () => {
  expect(isSwipeable({ id: 'clonezilla' })).toBe(false);
  expect(isSwipeable({ id: 'gparted-live' })).toBe(false);
  expect(isSwipeable({ id: 'linux-mint' })).toBe(true);
});
