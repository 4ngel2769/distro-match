// ARM CPUs for single board computers, ARM laptops and embedded boards.
// Apple M-series chips are deliberately excluded here and live in their own brand.
const generations = [
  { id: 'raspberry-pi', label: 'Raspberry Pi (Broadcom)', year: 2012 },
  { id: 'rockchip', label: 'Rockchip RK series', year: 2014 },
  { id: 'amlogic', label: 'Amlogic S series', year: 2015 },
  { id: 'allwinner', label: 'Allwinner H and A series', year: 2014 },
  { id: 'qualcomm', label: 'Qualcomm Snapdragon ARM laptops', year: 2016 },
  { id: 'nvidia-tegra', label: 'NVIDIA Tegra and Jetson', year: 2015 },
  { id: 'other-arm', label: 'Other ARM boards and SoCs', year: 2013 }
];

const cpus = [
  // Raspberry Pi
  ['Raspberry Pi 1 (BCM2835)', 'raspberry-pi', 1, 1, 3, 'VideoCore IV', 'armhf'],
  ['Raspberry Pi 2 (BCM2836)', 'raspberry-pi', 4, 4, 8, 'VideoCore IV', 'armhf'],
  ['Raspberry Pi 3 (BCM2837)', 'raspberry-pi', 4, 4, 12, 'VideoCore IV', 'arm64'],
  ['Raspberry Pi Zero 2 W', 'raspberry-pi', 4, 4, 12, 'VideoCore IV', 'arm64'],
  ['Raspberry Pi 4 (BCM2711)', 'raspberry-pi', 4, 4, 20, 'VideoCore VI', 'arm64'],
  ['Raspberry Pi 5 (BCM2712)', 'raspberry-pi', 4, 4, 38, 'VideoCore VII', 'arm64'],
  // Rockchip
  ['Rockchip RK3288', 'rockchip', 4, 4, 10, 'Mali-T760', 'armhf'],
  ['Rockchip RK3328', 'rockchip', 4, 4, 14, 'Mali-450', 'arm64'],
  ['Rockchip RK3399', 'rockchip', 6, 6, 24, 'Mali-T860', 'arm64'],
  ['Rockchip RK3566', 'rockchip', 4, 4, 22, 'Mali-G52', 'arm64'],
  ['Rockchip RK3568', 'rockchip', 4, 4, 26, 'Mali-G52', 'arm64'],
  ['Rockchip RK3588', 'rockchip', 8, 8, 48, 'Mali-G610', 'arm64'],
  // Amlogic
  ['Amlogic S905X3', 'amlogic', 4, 4, 20, 'Mali-G31', 'arm64'],
  ['Amlogic S905X4', 'amlogic', 4, 4, 24, 'Mali-G31', 'arm64'],
  ['Amlogic S922X', 'amlogic', 6, 6, 28, 'Mali-G52', 'arm64'],
  ['Amlogic A311D', 'amlogic', 6, 6, 30, 'Mali-G52', 'arm64'],
  // Allwinner
  ['Allwinner H3', 'allwinner', 4, 4, 8, 'Mali-400', 'armhf'],
  ['Allwinner H5', 'allwinner', 4, 4, 12, 'Mali-450', 'arm64'],
  ['Allwinner H6', 'allwinner', 4, 4, 16, 'Mali-T720', 'arm64'],
  ['Allwinner H616', 'allwinner', 4, 4, 18, 'Mali-G31', 'arm64'],
  ['Allwinner A64', 'allwinner', 4, 4, 10, 'Mali-400', 'arm64'],
  // Qualcomm ARM laptops
  ['Snapdragon 7c Gen 2', 'qualcomm', 8, 8, 42, 'Adreno 618', 'arm64'],
  ['Snapdragon 8cx Gen 3', 'qualcomm', 8, 8, 58, 'Adreno 690', 'arm64'],
  ['Snapdragon X Elite X1E-80-100', 'qualcomm', 12, 12, 82, 'Adreno X1', 'arm64'],
  ['Snapdragon X Plus X1P-64-100', 'qualcomm', 10, 10, 72, 'Adreno X1', 'arm64'],
  // NVIDIA Tegra
  ['Tegra X1', 'nvidia-tegra', 4, 4, 14, 'Maxwell GM204', 'arm64'],
  ['Jetson Nano', 'nvidia-tegra', 4, 4, 12, 'Maxwell GM204', 'arm64'],
  ['Jetson Orin Nano', 'nvidia-tegra', 6, 6, 42, 'Ampere', 'arm64'],
  ['Jetson Orin NX', 'nvidia-tegra', 8, 8, 56, 'Ampere', 'arm64'],
  ['Jetson AGX Orin', 'nvidia-tegra', 12, 12, 72, 'Ampere', 'arm64'],
  // Other ARM
  ['NXP i.MX 8M Plus', 'other-arm', 4, 4, 24, 'Vivante GC8000', 'arm64'],
  ['Marvell Armada 8040', 'other-arm', 4, 4, 18, 'None', 'arm64'],
  ['Broadcom BCM2711 (Pi 4)', 'other-arm', 4, 4, 20, 'VideoCore VI', 'arm64']
].map(([name, generation, cores, threads, score, igpu, arch]) => ({
  id: `arm-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  name,
  generation,
  cores,
  threads,
  score,
  igpu,
  arch
}));

export { generations, cpus };
