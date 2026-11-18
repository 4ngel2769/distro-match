// AMD desktop and mobile CPUs. Loaded on demand when AMD is chosen.
const generations = [
  { id: 'zen5', label: 'Ryzen 9000 series (Zen 5)', year: 2024 },
  { id: 'strix-point', label: 'Ryzen AI 300 series (Strix Point)', year: 2024 },
  { id: 'zen4', label: 'Ryzen 7000 series (Zen 4)', year: 2022 },
  { id: 'zen4-apu', label: 'Ryzen 8000G series (Zen 4 APU)', year: 2024 },
  { id: 'zen3', label: 'Ryzen 5000 series (Zen 3)', year: 2020 },
  { id: 'zen3-apu', label: 'Ryzen 5000G series (Zen 3 APU)', year: 2020 },
  { id: 'zen2', label: 'Ryzen 3000 series (Zen 2)', year: 2019 },
  { id: 'zen1', label: 'Ryzen 1000 and 2000 series', year: 2017 },
  { id: 'threadripper', label: 'Ryzen Threadripper', year: 2017 },
  { id: 'older', label: 'FX, A-Series and Athlon', year: 2011 }
];

const cpus = [
  // Zen 5
  ['Ryzen 9 9950X', 'zen5', 16, 32, 100, 'None'],
  ['Ryzen 9 9900X', 'zen5', 12, 24, 94, 'None'],
  ['Ryzen 7 9800X3D', 'zen5', 8, 16, 96, 'None'],
  ['Ryzen 7 9700X', 'zen5', 8, 16, 86, 'None'],
  ['Ryzen 5 9600X', 'zen5', 6, 12, 80, 'None'],
  // Ryzen AI 300
  ['Ryzen AI 9 HX 370', 'strix-point', 12, 24, 90, 'Radeon 890M'],
  ['Ryzen AI 9 365', 'strix-point', 10, 20, 84, 'Radeon 880M'],
  ['Ryzen AI 7 350', 'strix-point', 8, 16, 78, 'Radeon 860M'],
  ['Ryzen AI 5 340', 'strix-point', 6, 12, 68, 'Radeon 840M'],
  // Zen 4
  ['Ryzen 9 7950X', 'zen4', 16, 32, 98, 'Radeon Graphics'],
  ['Ryzen 9 7900X', 'zen4', 12, 24, 92, 'Radeon Graphics'],
  ['Ryzen 9 7800X3D', 'zen4', 8, 16, 94, 'Radeon Graphics'],
  ['Ryzen 7 7700X', 'zen4', 8, 16, 84, 'Radeon Graphics'],
  ['Ryzen 7 7840HS', 'zen4', 8, 16, 82, 'Radeon 780M'],
  ['Ryzen 7 7840U', 'zen4', 8, 16, 80, 'Radeon 780M'],
  ['Ryzen 7 7640U', 'zen4', 6, 12, 72, 'Radeon 760M'],
  ['Ryzen 5 7600X', 'zen4', 6, 12, 78, 'Radeon Graphics'],
  ['Ryzen 5 7600', 'zen4', 6, 12, 74, 'Radeon Graphics'],
  ['Ryzen 5 7500F', 'zen4', 6, 12, 72, 'None'],
  // Zen 4 APU
  ['Ryzen 7 8700G', 'zen4-apu', 8, 16, 82, 'Radeon 780M'],
  ['Ryzen 5 8600G', 'zen4-apu', 6, 12, 74, 'Radeon 760M'],
  ['Ryzen 5 8500G', 'zen4-apu', 6, 12, 68, 'Radeon 740M'],
  // Zen 3
  ['Ryzen 9 5950X', 'zen3', 16, 32, 90, 'None'],
  ['Ryzen 9 5900X', 'zen3', 12, 24, 86, 'None'],
  ['Ryzen 7 5800X3D', 'zen3', 8, 16, 84, 'None'],
  ['Ryzen 7 5800X', 'zen3', 8, 16, 76, 'None'],
  ['Ryzen 7 5825U', 'zen3', 8, 16, 70, 'Radeon Vega 8'],
  ['Ryzen 5 5600X', 'zen3', 6, 12, 72, 'None'],
  ['Ryzen 5 5600', 'zen3', 6, 12, 68, 'None'],
  ['Ryzen 5 5500', 'zen3', 6, 12, 60, 'None'],
  // Zen 3 APU
  ['Ryzen 7 5700G', 'zen3-apu', 8, 16, 74, 'Radeon Vega 8'],
  ['Ryzen 5 5600G', 'zen3-apu', 6, 12, 66, 'Radeon Vega 7'],
  ['Ryzen 3 5300G', 'zen3-apu', 4, 8, 52, 'Radeon Vega 6'],
  // Zen 2
  ['Ryzen 9 3900X', 'zen2', 12, 24, 76, 'None'],
  ['Ryzen 7 3800X', 'zen2', 8, 16, 68, 'None'],
  ['Ryzen 7 3700X', 'zen2', 8, 16, 66, 'None'],
  ['Ryzen 7 3750H', 'zen2', 4, 8, 50, 'Radeon Vega 10'],
  ['Ryzen 5 3600X', 'zen2', 6, 12, 60, 'None'],
  ['Ryzen 5 3600', 'zen2', 6, 12, 58, 'None'],
  ['Ryzen 5 3400G', 'zen2', 4, 8, 46, 'Radeon Vega 11'],
  ['Ryzen 5 4600G', 'zen2', 6, 12, 56, 'Radeon Vega 7'],
  ['Ryzen 3 3300X', 'zen2', 4, 8, 50, 'None'],
  ['Ryzen 3 3100', 'zen2', 4, 8, 44, 'None'],
  // Zen 1
  ['Ryzen 7 1800X', 'zen1', 8, 16, 52, 'None'],
  ['Ryzen 7 1700X', 'zen1', 8, 16, 48, 'None'],
  ['Ryzen 7 2700X', 'zen1', 8, 16, 54, 'None'],
  ['Ryzen 5 2600', 'zen1', 6, 12, 46, 'None'],
  ['Ryzen 5 1600', 'zen1', 6, 12, 44, 'None'],
  ['Ryzen 5 1400', 'zen1', 4, 8, 38, 'None'],
  ['Ryzen 3 1300X', 'zen1', 4, 4, 32, 'None'],
  ['Ryzen 3 1200', 'zen1', 4, 4, 28, 'None'],
  // Threadripper
  ['Threadripper 3990X', 'threadripper', 64, 128, 98, 'None'],
  ['Threadripper 3970X', 'threadripper', 32, 64, 94, 'None'],
  ['Threadripper 3960X', 'threadripper', 24, 48, 90, 'None'],
  ['Threadripper 2990WX', 'threadripper', 32, 64, 78, 'None'],
  ['Threadripper 2950X', 'threadripper', 16, 32, 72, 'None'],
  ['Threadripper 1950X', 'threadripper', 16, 32, 62, 'None'],
  // Older
  ['FX-8350', 'older', 8, 8, 26, 'None'],
  ['FX-6300', 'older', 6, 6, 20, 'None'],
  ['A10-7800', 'older', 4, 4, 16, 'Radeon R7'],
  ['Athlon X4 860K', 'older', 4, 4, 14, 'None'],
  ['Sempron 2650', 'older', 2, 2, 8, 'Radeon HD 8240']
].map(([name, generation, cores, threads, score, igpu]) => ({
  id: `amd-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  name: `AMD ${name}`,
  generation,
  cores,
  threads,
  score,
  igpu,
  arch: 'x86_64'
}));

export { generations, cpus };
