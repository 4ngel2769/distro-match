/**
 * Pure helpers for the swipe deck. Kept out of the Svelte component so the
 * cursor and pool rules can be tested directly.
 */

/** Live/rescue images are tools, not installable desktop systems. */
const LIVE_IMAGE_DISTROS = new Set([
  'gparted-live', 'clonezilla', 'systemrescuecd', 'ventoy', 'rescatux'
]);

export function isSwipeable(distro) {
  return Boolean(distro?.id) && !LIVE_IMAGE_DISTROS.has(distro.id);
}

/**
 * Return the next deck cursor. While any filtered distro has not been seen,
 * show the first unseen one. Once the pool is exhausted, cycle through the
 * reviewed cards instead of freezing on the first one.
 */
export function nextCursor(ordered, seen, cursor) {
  if (!ordered.length) return 0;
  const hasUnseen = ordered.some((distro) => !seen.has(distro.id));
  return hasUnseen ? 0 : (cursor + 1) % ordered.length;
}
