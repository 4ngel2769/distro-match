const STORAGE_KEY = 'distromatch_specs';
const ACTIVE_KEY = 'distromatch_active_platform';
const DEFAULT_PLATFORM = 'laptop';

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    // Old installs stored one flat spec object. Move it under its platform.
    if (parsed.platform && !parsed[parsed.platform]) {
      return { [parsed.platform]: parsed };
    }
    return parsed;
  } catch {
    return {};
  }
}

function writeAll(all) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Storage can be unavailable in private browsing. In-memory state still works.
  }
}

export function getActivePlatform() {
  try {
    return localStorage.getItem(ACTIVE_KEY) || DEFAULT_PLATFORM;
  } catch {
    return DEFAULT_PLATFORM;
  }
}

export function setActivePlatform(platform) {
  try {
    localStorage.setItem(ACTIVE_KEY, platform);
  } catch {
    // Ignore storage errors.
  }
}

/** Specs for one platform. With no argument, uses the active platform. */
export function loadSpecs(platform = null) {
  const all = readAll();
  const key = platform || getActivePlatform();
  const specs = all[key];
  if (!specs || typeof specs !== 'object' || !Array.isArray(specs.needs) || !specs.ramGB) return null;
  return specs;
}

export function hasSpecsFor(platform) {
  return Boolean(loadSpecs(platform));
}

/** Save specs under their platform and make that platform active. */
export function saveSpecs(specs) {
  if (!specs?.platform) return;
  const all = readAll();
  all[specs.platform] = specs;
  writeAll(all);
  setActivePlatform(specs.platform);
}

/** Clear one platform's specs, or everything when no platform is given. */
export function clearSpecs(platform = null) {
  try {
    if (platform) {
      const all = readAll();
      delete all[platform];
      writeAll(all);
      if (getActivePlatform() === platform) {
        localStorage.removeItem(ACTIVE_KEY);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ACTIVE_KEY);
    }
  } catch {
    // Ignore storage errors.
  }
}

export function formatRam(ramGB) {
  const value = Number(ramGB);
  return Number.isFinite(value) ? `${value} GB` : String(ramGB);
}
