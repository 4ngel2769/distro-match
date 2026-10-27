/**
 * Tiny history-API router. No dependency, works with `vite dev`, `vite preview`
 * and any static host that rewrites unknown paths to index.html.
 */
import { landingPageFor, landingPath } from '../data/landingPages.js';

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
      path: `/distro/${encodeURIComponent(second)}/`
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
      path: `/${first}/`
    };
  }

  // Keyword landing pages: /linux-distributions/[/family/] and /linux-for-<use-case>/
  const landing = landingPageFor(pathname);
  if (landing) {
    return {
      view: 'landing',
      distroId: null,
      compareIds: null,
      landingKind: landing.kind,
      landingSlug: landing.slug,
      path: landingPath(landing.kind, landing.slug)
    };
  }

  return { view: 'notfound', distroId: null, compareIds: null, path: pathname };
}

export function routePath(view, distroId) {
  if (view === 'welcome') return '/';
  if (view === 'distro' && distroId) return `/distro/${encodeURIComponent(distroId)}/`;
  return `/${view}/`;
}

/** Canonical shareable comparison URL, e.g. /compare/linux-mint+arch-linux/ */
export function comparePath(a, b) {
  return `/compare/${encodeURIComponent(a)}+${encodeURIComponent(b)}/`;
}

export function routeTitle(view, distro) {
  switch (view) {
    case 'welcome':
      return 'LinuxMatch — Find the Best Linux Distribution for You (116+ Distros)';
    case 'quiz':
      return 'Linux Distribution Finder Quiz — 23 Questions | LinuxMatch';
    case 'results':
      return 'Your Linux Distribution Matches — LinuxMatch';
    case 'directory':
      return 'Linux Distribution Directory — All 116+ Linux Distros | LinuxMatch';
    case 'compare':
      return 'Compare Linux Distributions Side by Side | LinuxMatch';
    case 'privacy':
      return 'Privacy & GDPR — No Tracking, No Accounts | LinuxMatch';
    case 'terms':
      return 'Terms of Service — LinuxMatch';
    case 'distro':
      return distro
        ? `${distro.name} — Linux Distribution Profile, Specs & Pros/Cons | LinuxMatch`
        : 'Distribution profile — LinuxMatch';
    case 'landing':
      return 'Linux Distributions — Lists, Families and Use Cases | LinuxMatch';
    default:
      return 'Page not found — LinuxMatch';
  }
}

export function replaceRoute(path) {
  window.history.replaceState({}, '', path);
}
