/**
 * Tiny history-API router. No dependency, works with `vite dev`, `vite preview`
 * and any static host that rewrites unknown paths to index.html.
 */

const STATIC_ROUTES = {
  '': 'welcome',
  quiz: 'quiz',
  results: 'results',
  directory: 'directory',
  compare: 'compare',
  privacy: 'privacy',
  terms: 'terms'
};

/** @returns {{view:string, distroId:string|null, compareIds:string[]|null, path:string}} */
export function parseRoute(pathname = '/') {
  const segments = pathname
    .replace(/\/+$/, '')
    .split('/')
    .filter(Boolean)
    .map((s) => {
      try {
        return decodeURIComponent(s);
      } catch {
        return s;
      }
    });

  if (!segments.length) {
    return { view: 'welcome', distroId: null, compareIds: null, path: '/' };
  }

  const [first, second] = segments;
  if (first === 'distro' && second) {
    return {
      view: 'distro',
      distroId: second,
      compareIds: null,
      path: `/distro/${encodeURIComponent(second)}`
    };
  }
  if (first === 'compare' && second) {
    const ids = second.split('+').filter(Boolean);
    if (ids.length === 2) {
      return {
        view: 'compare',
        distroId: null,
        compareIds: ids,
        path: comparePath(ids[0], ids[1])
      };
    }
  }
  if (STATIC_ROUTES[first]) {
    return {
      view: STATIC_ROUTES[first],
      distroId: null,
      compareIds: null,
      path: `/${first}`
    };
  }
  return { view: 'notfound', distroId: null, compareIds: null, path: pathname };
}

export function routePath(view, distroId) {
  if (view === 'welcome') return '/';
  if (view === 'distro' && distroId) return `/distro/${encodeURIComponent(distroId)}`;
  return `/${view}`;
}

/** Canonical shareable comparison URL, e.g. /compare/linux-mint+arch-linux/ */
export function comparePath(a, b) {
  return `/compare/${encodeURIComponent(a)}+${encodeURIComponent(b)}/`;
}

export function routeTitle(view, distro) {
  switch (view) {
    case 'welcome':
      return 'DistroMatch — Find your Linux distribution';
    case 'quiz':
      return 'Distro finder quiz — DistroMatch';
    case 'results':
      return 'Your matches — DistroMatch';
    case 'directory':
      return 'Linux distribution directory — DistroMatch';
    case 'compare':
      return 'Compare distributions — DistroMatch';
    case 'privacy':
      return 'Privacy & GDPR — DistroMatch';
    case 'terms':
      return 'Terms of Service — DistroMatch';
    case 'distro':
      return distro ? `${distro.name} — DistroMatch` : 'Distribution profile — DistroMatch';
    default:
      return 'Not found — DistroMatch';
  }
}

export function replaceRoute(path) {
  window.history.replaceState({}, '', path);
}
