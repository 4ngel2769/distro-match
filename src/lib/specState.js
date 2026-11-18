const STORAGE_KEY = 'distromatch_specs';

/** Read saved hardware specs. Returns null when nothing valid is stored. */
export function loadSpecs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const specs = JSON.parse(raw);
    if (!specs || typeof specs !== 'object') return null;
    if (!Array.isArray(specs.needs) || !specs.platform || !specs.ramGB) return null;
    return specs;
  } catch {
    return null;
  }
}

export function saveSpecs(specs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(specs));
  } catch {
    // Storage can be unavailable in private browsing. The in-memory state still works.
  }
}

export function clearSpecs() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
}

export function formatRam(ramGB) {
  const value = Number(ramGB);
  return Number.isFinite(value) ? `${value} GB` : String(ramGB);
}
