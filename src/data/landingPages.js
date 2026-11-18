/**
 * SEO landing pages.
 *
 * One source of truth for the keyword landing pages: the SPA renders them
 * client-side, and `scripts/seo-build.mjs` renders the exact same content
 * into static HTML for crawlers. Keep them in sync by editing this file only.
 */

export const FAMILY_PAGES = [
  {
    slug: 'ubuntu',
    label: 'Ubuntu',
    title: 'Ubuntu Linux Distributions: Every Ubuntu-Based Distro Compared | LinuxMatch',
    description:
      'Every Ubuntu and Ubuntu-derived Linux distribution in one place: Ubuntu itself, Linux Mint, Pop!_OS, Zorin OS, elementary OS, Kubuntu, Xubuntu, Lubuntu, Tails and more, with specs, pros and cons.',
    intro:
      'Ubuntu and the distributions derived from it dominate the desktop Linux world. They share the apt package format, the Snap ecosystem and a predictable six-month release cadence, so they are the safest first stop for most desktops.',
    match: (d) => d.family === 'Ubuntu'
  },
  {
    slug: 'debian',
    label: 'Debian',
    title: 'Debian-Based Linux Distributions: All Debian Derivatives | LinuxMatch',
    description:
      'All Debian-based Linux distributions compared: Debian itself, Ubuntu, Linux Mint, MX Linux, Deepin, Kali Linux, Parrot OS, PureOS, Devuan, AntiX and more, with package manager, init system and pros and cons.',
    intro:
      'Debian is the ancestor of a huge branch of the ecosystem. Its descendants trade Debian rock-solid stability for newer kernels, preinstalled extras or specialised use cases.',
    match: (d) => d.family === 'Debian'
  },
  {
    slug: 'arch',
    label: 'Arch',
    title: 'Arch-Based Linux Distributions: Rolling Releases Compared | LinuxMatch',
    description:
      'Every Arch-based Linux distribution compared: Arch Linux itself, Manjaro, EndeavourOS, CachyOS, Garuda, Artix, Manjaro-based gaming images and more, with pacman details and pros and cons.',
    intro:
      'Arch-based distributions install with pacman and follow a rolling release. They suit users who want recent kernels and are willing to maintain their system, or who prefer a curated fork that does that work for them.',
    match: (d) => d.family === 'Arch'
  },
  {
    slug: 'fedora-rhel',
    label: 'Fedora / RHEL',
    title: 'Fedora and RHEL-Based Linux Distributions Compared | LinuxMatch',
    description:
      'Fedora, Red Hat Enterprise Linux, CentOS Stream, Rocky Linux, AlmaLinux, Oracle Linux, Nobara and more: enterprise-grade Linux distributions compared by release model, init system and support.',
    intro:
      'The Fedora and RHEL family is where enterprise Linux lives: predictable release models, long support windows and conservative, well-tested stacks.',
    match: (d) => d.family === 'Fedora/RHEL'
  },
  {
    slug: 'opensuse',
    label: 'openSUSE',
    title: 'openSUSE and SUSE-Based Linux Distributions Compared | LinuxMatch',
    description:
      'openSUSE Tumbleweed, Leap, MicroOS, SLED and SUSE Linux Enterprise compared: rolling and fixed release Linux distributions withzypper, Btrfs snapshots and YaST.',
    intro:
      'openSUSE is one of the few remaining independent Linux vendors, shipping both a rolling Tumbleweed release and a fixed Leap release with long enterprise support.',
    match: (d) => d.family === 'openSUSE'
  },
  {
    slug: 'gentoo',
    label: 'Gentoo',
    title: 'Gentoo and Source-Based Linux Distributions Compared | LinuxMatch',
    description:
      'Gentoo Linux, Funtoo, Calculate Linux, Chimera Linux and other source-based distributions compared: Portage, USE flags, custom compilation and the trade-offs involved.',
    intro:
      'Source-based distributions compile your software from source, giving extreme control over the system at the cost of your time and a lot of disk space.',
    match: (d) => d.family === 'Gentoo'
  },
  {
    slug: 'slackware',
    label: 'Slackware',
    title: 'Slackware and Traditional Linux Distributions Compared | LinuxMatch',
    description:
      'Slackware, Puppy Linux, Tiny Core, Salix, antiX, Puppy-derived and other traditional Linux distributions compared: simple, minimal systems with old-school administration.',
    intro:
      'Traditional distributions keep the Unix philosophy close: small package sets, plain configuration files and no hidden magic.',
    match: (d) => d.family === 'Slackware'
  },
  {
    slug: 'independent',
    label: 'Independent',
    title: 'Independent Linux Distributions: Built From Scratch | LinuxMatch',
    description:
      'Linux distributions built from scratch with no upstream parent: NixOS, Void Linux, Guix, Solus, Chimera, Serpent, BellSoft and more, each with a distinct philosophy.',
    intro:
      'Independent distributions refuse to inherit another project’s decisions. That is where you find the most unusual package managers, init systems and release models in the ecosystem.',
    match: (d) => d.family === 'Independent'
  }
];

export const USE_CASE_PAGES = [
  {
    slug: 'gaming',
    label: 'Gaming',
    title: 'Best Linux Distributions for Gaming: Steam, Proton and NVIDIA | LinuxMatch',
    description:
      'The best Linux distributions for gaming: Bazzite, Nobara, CachyOS, Pop!_OS, SteamOS, ChimeraOS and more, with Steam Deck, Proton and NVIDIA driver support compared.',
    intro:
      'Gaming on Linux is no longer a compromise. These distributions ship with tuned kernels, Proton and Steam integration, and graphics drivers that are ready on first boot.',
    useCase: 'gaming'
  },
  {
    slug: 'beginners',
    label: 'Beginners',
    title: 'Best Linux Distributions for Beginners: Easy First Install | LinuxMatch',
    description:
      'The best Linux distributions for beginners and Windows switchers: Linux Mint, Ubuntu, Zorin OS, elementary OS, MX Linux and more, with graphical installers and driver support.',
    intro:
      'A first Linux should install without a manual partition and work with your hardware out of the box. These are the distributions that meet you there.',
    useCase: 'daily-driver'
  },
  {
    slug: 'developers',
    label: 'Development',
    title: 'Best Linux Distributions for Software Development | LinuxMatch',
    description:
      'The best Linux distributions for developers: Ubuntu, Fedora, Debian, Arch and openSUSE compared by package freshness, container tooling, IDE support and kernel headers.',
    intro:
      'Developers care about package freshness, sane defaults and a toolchain that stays out of the way. These are the distributions that keep that promise.',
    useCase: 'software-development'
  },
  {
    slug: 'privacy',
    label: 'Privacy',
    title: 'Privacy-Focused Linux Distributions: Free Software, No Tracking | LinuxMatch',
    description:
      'Privacy-focused Linux distributions compared: Tails, Whonix, Qubes OS, Parrot Security, PureOS, Fedora Silverblue and more, with 100% libre and hardened options.',
    intro:
      'Privacy distributions trade convenience for control: fully free software, hardened kernels, encrypted storage and routing that resists tracking.',
    useCase: 'privacy-anonymity'
  },
  {
    slug: 'old-hardware',
    label: 'Old hardware',
    title: 'Best Lightweight Linux Distributions for Old and Low-Spec PCs | LinuxMatch',
    description:
      'Lightweight Linux distributions for old hardware and low-RAM machines: antiX, Puppy Linux, Tiny Core, Lubuntu, Xubuntu and more, with minimum memory requirements compared.',
    intro:
      'On a machine with 2 GB of RAM, the choice of distribution matters more than the choice of applications. These are the lightest serious Linux distributions.',
    useCase: 'low-spec-hardware'
  },
  {
    slug: 'servers',
    label: 'Servers',
    title: 'Best Linux Distributions for Servers and Homelabs | LinuxMatch',
    description:
      'Linux distributions for servers, NAS and homelabs: Debian, Ubuntu Server, Proxmox VE, Rocky Linux, AlmaLinux, openSUSE, TrueNAS SCALE and more compared.',
    intro:
      'Servers reward boring, predictable releases with long support windows and small unattended upgrades.',
    useCase: 'server-homelab'
  },
  {
    slug: 'minimal',
    label: 'Minimalism',
    title: 'Minimal and Tinkering Linux Distributions: Build Your Own | LinuxMatch',
    description:
      'Minimal, from-scratch and tinkering Linux distributions compared: Void Linux, NixOS, Guix, Tiny Core, Alpine, Slackware and more for users who want a small base.',
    intro:
      'If you want a system that contains only what you put in it, these distributions start almost empty and let you build upward.',
    useCase: 'tinkering-minimalism'
  },
  {
    slug: 'multimedia',
    label: 'Multimedia',
    title: 'Best Linux Distributions for Audio, Video and Creative Work | LinuxMatch',
    description:
      'Linux distributions for multimedia and creative work: Ubuntu Studio, Fedora, openSUSE, AV Linux, PureOS and more, with codecs, DAW and creative app availability compared.',
    intro:
      'Creative work on Linux depends less on the distribution than on the codec, driver and plugin situation, and some distributions get that right out of the box.',
    useCase: 'multimedia-creation'
  },
  {
    slug: 'education',
    label: 'Education',
    title: 'Best Linux Distributions for Education and Students | LinuxMatch',
    description:
      'Linux distributions for students and education: Ubuntu, Linux Mint, elementary OS, Fedora Education, KDE neon and more, compared for classroom laptops and study use.',
    intro:
      'School laptops need stability, easy updates and a desktop that does not fight the user. These are the distributions education projects build on.',
    useCase: 'education'
  },
  {
    slug: 'security',
    label: 'Security',
    title: 'Linux Distributions for Penetration Testing and Security | LinuxMatch',
    description:
      'Security and penetration-testing Linux distributions compared: Kali Linux, Parrot OS, BlackArch, Tails and more, with tooling, anonymity and hardware requirements.',
    intro:
      'Security distributions pre-load an enormous toolbox. They are built for auditing and training, so use them responsibly and legally.',
    useCase: 'cybersecurity-pentesting'
  },
  {
    slug: 'enterprise',
    label: 'Enterprise',
    title: 'Enterprise and Long-Term Support Linux Distributions | LinuxMatch',
    description:
      'Enterprise Linux distributions with long-term support compared: RHEL, Rocky Linux, AlmaLinux, Ubuntu LTS, SUSE Linux Enterprise and more, with lifecycle and stability details.',
    intro:
      'Enterprise distributions trade novelty for support windows, certification and predictable patching.',
    useCase: 'enterprise-stability'
  }
];

export const HUB_PAGE = {
  slug: '',
  kind: 'hub',
  label: 'All Linux distributions',
  title: 'All Linux Distributions: Complete List, Specs and Comparisons | LinuxMatch',
  description:
    'The complete list of Linux distributions: 116+ distros across every family, with package managers, init systems, desktop environments, hardware targets, pros and cons and official links.',
  intro:
    'Linux is not one operating system. This is the complete LinuxMatch index: every distribution we track, grouped by family, with the technical details you need to compare them honestly.'
};

/**
 * Resolve a landing page from a URL path.
 * @param {string} pathname
 * @returns {{kind:string, slug:string, page:object}|null}
 */
export function landingPageFor(pathname = '/') {
  const segments = pathname
    .replace(/\/+$/, '')
    .split('/')
    .filter(Boolean);

  if (!segments.length) return null;

  if (segments[0] === 'linux-distributions') {
    const slug = segments[1] || '';
    if (!slug) return { kind: 'hub', slug: '', page: HUB_PAGE };
    const page = FAMILY_PAGES.find((p) => p.slug === slug);
    return page ? { kind: 'family', slug, page } : null;
  }

  if (segments[0].startsWith('linux-for-')) {
    const slug = segments[0].slice('linux-for-'.length);
    const page = USE_CASE_PAGES.find((p) => p.slug === slug);
    return page ? { kind: 'use-case', slug, page } : null;
  }

  return null;
}

/** Canonical path for a landing page. */
export function landingPath(kind, slug) {
  if (kind === 'hub') return '/linux-distributions/';
  if (kind === 'family') return `/linux-distributions/${slug}/`;
  return `/linux-for-${slug}/`;
}
