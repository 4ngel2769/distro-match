// Hardware catalog for the spec finder. Everything here is loaded on demand:
// brands are tiny and eager, while CPU families and the GPU list are split into
// separate chunks so the welcome screen stays light.

export const CPU_BRANDS = [
  { id: 'intel', label: 'Intel' },
  { id: 'amd', label: 'AMD' },
  { id: 'apple', label: 'Apple Silicon' },
  { id: 'arm', label: 'ARM / SBC board' }
];

const cpuLoaders = {
  intel: () => import('./cpus/intel.js'),
  amd: () => import('./cpus/amd.js'),
  apple: () => import('./cpus/apple.js'),
  arm: () => import('./cpus/arm.js')
};

const generationCache = new Map();
const cpuCache = new Map();

/** Load the generation list for a brand the first time it is needed. */
export async function loadGenerations(brand) {
  if (!cpuLoaders[brand]) return [];
  if (generationCache.has(brand)) return generationCache.get(brand);
  const module = await cpuLoaders[brand]();
  generationCache.set(brand, module.generations);
  cpuCache.set(brand, module.cpus);
  return module.generations;
}

/** Load CPUs for one brand and generation, filtering an already loaded brand file. */
export async function loadCpus(brand, generation) {
  if (!cpuLoaders[brand]) return [];
  if (!cpuCache.has(brand)) await loadGenerations(brand);
  return (cpuCache.get(brand) || []).filter((cpu) => cpu.generation === generation);
}

/** Load the GPU catalog only when the graphics picker is opened. */
export async function loadGpus() {
  const module = await import('./gpus.js');
  return module.gpus;
}

/** Turn a CPU's integrated graphics label into a usable GPU profile. */
export function igpuProfile(name = '') {
  const label = String(name || '').toLowerCase();
  let score = 28;
  if (/890m|880m|radeon 78|arc graphics|adreno x1|videoCore vii|ampere/i.test(label)) score = 58;
  else if (/radeon 76|radeon 84|860m|780m|760m|iris xe/i.test(label)) score = 50;
  else if (/vega 11|vega 8|vega 7|videoCore vi|mali-g610/i.test(label)) score = 38;
  else if (/mali|adreno|videoCore|vivante|maxwell/i.test(label)) score = 28;
  else if (/hd graphics|gma|none/i.test(label)) score = 14;
  return { score, vram: 0, proprietary: false, integrated: true };
}

export const RAM_OPTIONS = [
  { value: 2, label: '2 GB', note: 'Very light distros only' },
  { value: 4, label: '4 GB', note: 'Light desktops' },
  { value: 8, label: '8 GB', note: 'Comfortable for most desktops' },
  { value: 16, label: '16 GB', note: 'Great for development and gaming' },
  { value: 32, label: '32 GB', note: 'Heavy multitasking and VMs' },
  { value: 64, label: '64 GB', note: 'Workstations and servers' },
  { value: 128, label: '128 GB+', note: 'Large servers' }
];
