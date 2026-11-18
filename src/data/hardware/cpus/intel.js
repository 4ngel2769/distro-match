// Intel desktop and mobile CPUs. Loaded on demand when Intel is chosen.
const generations = [
  { id: 'core-ultra-arrow', label: 'Core Ultra 200S (Arrow Lake)', year: 2024 },
  { id: 'core-ultra-lunar', label: 'Core Ultra 200V (Lunar Lake)', year: 2024 },
  { id: 'core-ultra-meteor', label: 'Core Ultra 100 series (Meteor Lake)', year: 2023 },
  { id: 'raptor-lake', label: '13th and 14th Gen Core (Raptor Lake)', year: 2022 },
  { id: 'alder-lake', label: '12th Gen Core (Alder Lake)', year: 2021 },
  { id: 'tiger-lake', label: '11th Gen Core (Tiger Lake)', year: 2020 },
  { id: 'ice-lake', label: '10th Gen Core mobile (Ice Lake)', year: 2019 },
  { id: 'comet-lake', label: '10th Gen Core desktop (Comet Lake)', year: 2019 },
  { id: 'coffee-lake', label: '8th and 9th Gen Core', year: 2017 },
  { id: 'kaby-lake', label: '7th Gen Core (Kaby Lake)', year: 2017 },
  { id: 'skylake', label: '6th Gen Core (Skylake)', year: 2015 },
  { id: 'older-core', label: 'Older Core (1st to 5th Gen)', year: 2008 },
  { id: 'xeon', label: 'Xeon workstation and server', year: 2012 },
  { id: 'atom', label: 'Atom, Celeron and Pentium', year: 2008 }
];

const cpus = [
  // Core Ultra 200S
  ['Core Ultra 9 285K', 'core-ultra-arrow', 24, 24, 99, 'Intel Graphics'],
  ['Core Ultra 7 265K', 'core-ultra-arrow', 20, 20, 93, 'Intel Graphics'],
  ['Core Ultra 5 245K', 'core-ultra-arrow', 14, 14, 84, 'Intel Graphics'],
  ['Core Ultra 5 225', 'core-ultra-arrow', 10, 10, 74, 'Intel Graphics'],
  // Core Ultra 200V
  ['Core Ultra 9 288V', 'core-ultra-lunar', 8, 8, 90, 'Intel Arc Graphics'],
  ['Core Ultra 7 268V', 'core-ultra-lunar', 8, 8, 86, 'Intel Arc Graphics'],
  ['Core Ultra 7 258V', 'core-ultra-lunar', 8, 8, 82, 'Intel Arc Graphics'],
  ['Core Ultra 5 238V', 'core-ultra-lunar', 8, 8, 74, 'Intel Arc Graphics'],
  ['Core Ultra 5 228V', 'core-ultra-lunar', 8, 8, 70, 'Intel Arc Graphics'],
  // Core Ultra 100 series
  ['Core Ultra 9 185H', 'core-ultra-meteor', 16, 22, 90, 'Intel Arc Graphics'],
  ['Core Ultra 7 165H', 'core-ultra-meteor', 16, 22, 86, 'Intel Arc Graphics'],
  ['Core Ultra 7 155H', 'core-ultra-meteor', 16, 22, 84, 'Intel Arc Graphics'],
  ['Core Ultra 5 125H', 'core-ultra-meteor', 14, 18, 76, 'Intel Arc Graphics'],
  ['Core Ultra 5 115U', 'core-ultra-meteor', 8, 10, 58, 'Intel Graphics'],
  // 13th and 14th Gen
  ['i9-14900K', 'raptor-lake', 24, 32, 98, 'UHD 770'],
  ['i7-14700K', 'raptor-lake', 20, 28, 92, 'UHD 770'],
  ['i5-14600K', 'raptor-lake', 14, 20, 84, 'UHD 770'],
  ['i9-13900K', 'raptor-lake', 24, 32, 96, 'UHD 770'],
  ['i9-13900H', 'raptor-lake', 14, 20, 88, 'Iris Xe'],
  ['i7-13700K', 'raptor-lake', 16, 24, 90, 'UHD 770'],
  ['i7-13700H', 'raptor-lake', 14, 20, 84, 'Iris Xe'],
  ['i5-13600K', 'raptor-lake', 14, 20, 82, 'UHD 770'],
  ['i5-13500H', 'raptor-lake', 12, 16, 76, 'Iris Xe'],
  ['i5-13400', 'raptor-lake', 10, 16, 70, 'UHD 730'],
  ['i3-13100', 'raptor-lake', 4, 8, 58, 'UHD 730'],
  // 12th Gen
  ['i9-12900KS', 'alder-lake', 16, 24, 97, 'UHD 770'],
  ['i9-12900K', 'alder-lake', 16, 24, 96, 'UHD 770'],
  ['i9-12900H', 'alder-lake', 14, 20, 88, 'Iris Xe'],
  ['i7-12700K', 'alder-lake', 12, 20, 90, 'UHD 770'],
  ['i7-12700H', 'alder-lake', 14, 20, 86, 'Iris Xe'],
  ['i7-1255U', 'alder-lake', 10, 12, 66, 'Iris Xe'],
  ['i5-12600K', 'alder-lake', 10, 16, 82, 'UHD 770'],
  ['i5-12500H', 'alder-lake', 12, 16, 78, 'Iris Xe'],
  ['i5-1235U', 'alder-lake', 10, 12, 62, 'Iris Xe'],
  ['i5-12400', 'alder-lake', 6, 12, 72, 'UHD 730'],
  ['i3-1215U', 'alder-lake', 6, 8, 52, 'UHD Graphics'],
  ['i3-12100', 'alder-lake', 4, 8, 62, 'UHD 730'],
  // 11th Gen
  ['i9-11900K', 'tiger-lake', 8, 16, 84, 'UHD 750'],
  ['i7-11800H', 'tiger-lake', 8, 16, 80, 'Iris Xe'],
  ['i7-11700K', 'tiger-lake', 8, 16, 78, 'UHD 750'],
  ['i5-11600K', 'tiger-lake', 6, 12, 68, 'UHD 750'],
  ['i5-11400H', 'tiger-lake', 6, 12, 66, 'Iris Xe'],
  ['i5-11400', 'tiger-lake', 6, 12, 64, 'UHD 730'],
  ['i3-1115G4', 'tiger-lake', 2, 4, 40, 'UHD Xe G4'],
  // 10th Gen mobile
  ['i7-1065G7', 'ice-lake', 4, 8, 58, 'Iris Plus Graphics'],
  ['i5-1035G7', 'ice-lake', 4, 8, 50, 'Iris Plus Graphics'],
  ['i5-1035G1', 'ice-lake', 4, 8, 46, 'UHD Graphics'],
  // 10th Gen desktop
  ['i9-10900K', 'comet-lake', 10, 20, 80, 'UHD 630'],
  ['i7-10700K', 'comet-lake', 8, 16, 74, 'UHD 630'],
  ['i7-10750H', 'comet-lake', 6, 12, 64, 'UHD 630'],
  ['i5-10600K', 'comet-lake', 6, 12, 66, 'UHD 630'],
  ['i5-10400', 'comet-lake', 6, 12, 58, 'UHD 630'],
  ['i5-10300H', 'comet-lake', 4, 8, 52, 'UHD 630'],
  ['i3-10100', 'comet-lake', 4, 8, 48, 'UHD 630'],
  // 8th and 9th Gen
  ['i9-9900K', 'coffee-lake', 8, 16, 74, 'UHD 630'],
  ['i7-9700K', 'coffee-lake', 8, 8, 68, 'UHD 630'],
  ['i7-8750H', 'coffee-lake', 6, 12, 58, 'UHD 630'],
  ['i5-9600K', 'coffee-lake', 6, 6, 60, 'UHD 630'],
  ['i5-8600K', 'coffee-lake', 6, 6, 56, 'UHD 630'],
  ['i5-8400', 'coffee-lake', 6, 6, 52, 'UHD 630'],
  ['i5-8300H', 'coffee-lake', 4, 8, 48, 'UHD 630'],
  ['i3-8100', 'coffee-lake', 4, 4, 40, 'UHD 630'],
  // 7th Gen
  ['i7-7700K', 'kaby-lake', 4, 8, 54, 'HD 630'],
  ['i7-7700HQ', 'kaby-lake', 4, 8, 48, 'HD 630'],
  ['i5-7600K', 'kaby-lake', 4, 4, 44, 'HD 630'],
  ['i5-7300HQ', 'kaby-lake', 4, 4, 40, 'HD 630'],
  // 6th Gen
  ['i7-6700K', 'skylake', 4, 8, 50, 'HD 530'],
  ['i7-6700HQ', 'skylake', 4, 8, 44, 'HD 530'],
  ['i5-6600K', 'skylake', 4, 4, 40, 'HD 530'],
  ['i5-6500', 'skylake', 4, 4, 38, 'HD 530'],
  ['i3-6100', 'skylake', 2, 4, 30, 'HD 530'],
  // Older Core
  ['i7-4790K', 'older-core', 4, 8, 42, 'HD 4600'],
  ['i7-3770', 'older-core', 4, 8, 36, 'HD 4000'],
  ['i5-4590', 'older-core', 4, 4, 34, 'HD 4600'],
  ['i5-2500K', 'older-core', 4, 4, 28, 'HD 3000'],
  ['i3-4160', 'older-core', 2, 4, 24, 'HD 4400'],
  ['Core 2 Duo E8400', 'older-core', 2, 2, 14, 'None'],
  ['Core 2 Quad Q6600', 'older-core', 4, 4, 16, 'None'],
  // Xeon
  ['Xeon W-2245', 'xeon', 8, 16, 72, 'None'],
  ['Xeon E-2236', 'xeon', 6, 12, 62, 'UHD P630'],
  ['Xeon E-2124G', 'xeon', 4, 4, 46, 'UHD P630'],
  ['Xeon Silver 4214', 'xeon', 12, 24, 60, 'None'],
  ['Xeon Gold 5218', 'xeon', 16, 32, 72, 'None'],
  ['Xeon E5-2640 v3', 'xeon', 8, 16, 38, 'None'],
  // Atom and low power
  ['Pentium Gold G6400', 'atom', 2, 4, 26, 'UHD 610'],
  ['Celeron N3050', 'atom', 2, 2, 10, 'HD Graphics'],
  ['Celeron J1900', 'atom', 4, 4, 14, 'HD Graphics'],
  ['Atom Z3735F', 'atom', 4, 4, 8, 'HD Graphics'],
  ['Atom N270', 'atom', 1, 2, 4, 'GMA 950']
].map(([name, generation, cores, threads, score, igpu]) => ({
  id: `intel-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  name: `Intel ${name}`,
  generation,
  cores,
  threads,
  score,
  igpu,
  arch: 'x86_64'
}));

export { generations, cpus };
