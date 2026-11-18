/**
 * Shared helpers for the directory's ?q= search parameter.
 *
 * Keeping this in one place means the WebSite SearchAction structured data in
 * scripts/seo-build.mjs points at a URL that really filters the directory, and
 * a copied search URL opens with the same results.
 */

/** Read the search term from a location.search string. */
export function readSearchTerm(search = '') {
  return new URLSearchParams(search).get('q') || '';
}

/** Build a pathname + query + hash string for a given search term. */
export function searchUrlFor(term, pathname = '/directory/', hash = '') {
  const params = new URLSearchParams();
  const value = (term || '').trim();
  if (value) params.set('q', value);
  const query = params.toString();
  return `${pathname}${query ? `?${query}` : ''}${hash}`;
}
