// Apple Silicon. Loaded on demand when Apple is chosen.
const generations = [
  { id: 'm4', label: 'Apple M4 family', year: 2024 },
  { id: 'm3', label: 'Apple M3 family', year: 2023 },
  { id: 'm2', label: 'Apple M2 family', year: 2022 },
  { id: 'm1', label: 'Apple M1 family', year: 2020 }
];

const cpus = [
  ['M4 Max', 'm4', 16, 98, 'Apple 40-core GPU'],
  ['M4 Pro', 'm4', 14, 90, 'Apple 20-core GPU'],
  ['M4', 'm4', 10, 80, 'Apple 10-core GPU'],
  ['M3 Max', 'm3', 16, 92, 'Apple 40-core GPU'],
  ['M3 Pro', 'm3', 12, 82, 'Apple 18-core GPU'],
  ['M3', 'm3', 8, 72, 'Apple 10-core GPU'],
  ['M2 Ultra', 'm2', 24, 96, 'Apple 76-core GPU'],
  ['M2 Max', 'm2', 12, 84, 'Apple 38-core GPU'],
  ['M2 Pro', 'm2', 10, 76, 'Apple 19-core GPU'],
  ['M2', 'm2', 8, 66, 'Apple 10-core GPU'],
  ['M1 Ultra', 'm1', 20, 88, 'Apple 48-core GPU'],
  ['M1 Max', 'm1', 10, 78, 'Apple 32-core GPU'],
  ['M1 Pro', 'm1', 10, 72, 'Apple 16-core GPU'],
  ['M1', 'm1', 8, 60, 'Apple 8-core GPU']
].map(([name, generation, cores, score, igpu]) => ({
  id: `apple-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  name: `Apple ${name}`,
  generation,
  cores,
  threads: cores,
  score,
  igpu,
  arch: 'arm64'
}));

export { generations, cpus };
