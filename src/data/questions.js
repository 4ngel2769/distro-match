/**
 * LinuxMatch finder questionnaire (v4).
 *
 * Design rules for this file:
 *  - One decision per question. Every option maps to a real field in the
 *    distro catalogue, so an answer can change a score or a hard filter.
 *  - No filler "no preference" questions. If a factor does not apply, the
 *    question is skipped by its `when` guard instead of being asked.
 *  - Questions are grouped into short stages; the engine only scores answers
 *    that were actually given.
 *
 * `weight` values are importance levels: 1 = nice to have, 2 = important,
 * 3 = must-have. On factual constraints (GPU, memory, freedom, init, anonymity)
 * a must-have becomes a hard filter.
 */

export const QUIZ_STAGES = [
  {
    id: 1,
    title: 'Your setup',
    subtitle: 'The machine, your experience and what it needs to do.',
    short: 'Setup'
  },
  {
    id: 2,
    title: 'System behaviour',
    subtitle: 'Updates, drivers, upkeep and how far you trust an install.',
    short: 'Behaviour'
  },
  {
    id: 3,
    title: 'Principles & workflow',
    subtitle: 'Software freedom, privacy, desktop and package habits.',
    short: 'Principles'
  }
];

export const QUESTIONS_DATA = [
  // ─────────────────────────── STAGE 1: YOUR SETUP ───────────────────────────
  {
    id: 'q_experience',
    stage: 1,
    question: 'How comfortable are you with Linux?',
    hint: 'Pick the level that matches what you can fix without looking it up.',
    why: 'Some distributions expect you to edit config files or compile packages; others hide those details completely.',
    defaultWeight: 3,
    options: [
      { id: 'new', label: 'New to Linux', detail: 'I need a graphical installer and things working on first boot.' },
      { id: 'casual', label: 'I use it casually', detail: 'I know my way around the desktop and can follow a guide.' },
      { id: 'confident', label: 'Confident with the terminal', detail: 'I am fine with package managers, permissions and config files.' },
      { id: 'expert', label: 'I build and break systems', detail: 'Source builds, declarative configs and raw logs are normal to me.' }
    ]
  },
  {
    id: 'q_goal',
    stage: 1,
    question: 'What is the main job for this machine?',
    hint: 'Choose one. Specialised distros are built around a single job.',
    why: 'A gaming-first or privacy-first distro is the wrong tool for a general desktop, and the reverse is also true.',
    defaultWeight: 3,
    options: [
      { id: 'everyday', label: 'Everyday desktop', detail: 'Browsing, documents, video calls, media and general use.' },
      { id: 'gaming', label: 'Gaming', detail: 'Steam, Proton, emulators and the best frame rates available.' },
      { id: 'development', label: 'Development', detail: 'Toolchains, containers, IDEs and a predictable CLI workflow.' },
      { id: 'creative', label: 'Creative work', detail: 'Audio, video editing, 3D and low-latency media tooling.' },
      { id: 'privacy', label: 'Privacy or security work', detail: 'Tor, amnesic sessions, pentesting or forensic tooling.' },
      { id: 'server', label: 'Server or homelab', detail: 'Headless services, NAS, virtualisation and long uptimes.' },
      { id: 'revive', label: 'Revive old hardware', detail: 'Make an older or low-spec machine feel fast again.' }
    ]
  },
  {
    id: 'q_device',
    stage: 1,
    question: 'What is it running on?',
    hint: 'Form factor changes power, input and display priorities.',
    why: 'Handhelds need a controller-first session, laptops need suspend and battery tuning, and servers need no GUI at all.',
    defaultWeight: 2,
    options: [
      { id: 'desktop', label: 'Desktop PC', detail: 'Plugged in, full-size display and keyboard.' },
      { id: 'laptop', label: 'Laptop', detail: 'Battery life, suspend reliability and touchpad gestures matter.' },
      { id: 'handheld', label: 'Handheld gaming PC', detail: 'Steam Deck, ROG Ally or similar controller-first device.' },
      { id: 'living-room', label: 'Living-room PC / HTPC', detail: 'TV screen, remote or gamepad, media centre use.' },
      { id: 'server', label: 'Server / NAS box', detail: 'Headless, managed over SSH or a web interface.' },
      { id: 'old-pc', label: 'Old or low-spec computer', detail: 'Limited RAM, slow CPU or an aging hard drive.' }
    ]
  },
  {
    id: 'q_memory',
    stage: 1,
    question: 'How much RAM does it have?',
    hint: 'Use the installed amount, not what you wish it had.',
    why: 'A full GNOME or Plasma desktop is miserable on 2 GB; a lightweight desktop is wasted on a 64 GB workstation.',
    defaultWeight: 2,
    options: [
      { id: 'under2', label: 'Less than 2 GB', detail: 'Needs a featherweight window manager.' },
      { id: 'low', label: '2–4 GB', detail: 'XFCE, LXQt and other light desktops are the sweet spot.' },
      { id: 'mainstream', label: '8–16 GB', detail: 'Enough for any modern desktop and moderate gaming.' },
      { id: 'workstation', label: '32 GB or more', detail: 'Virtual machines, large builds and heavy multitasking.' }
    ]
  },
  {
    id: 'q_graphics',
    stage: 1,
    question: 'What graphics hardware does it use?',
    hint: 'The driver stack is the single biggest hardware constraint.',
    why: 'NVIDIA needs proprietary drivers, ARM needs a specific build, and Intel Arc needs a recent kernel.',
    defaultWeight: 3,
    options: [
      { id: 'nvidia', label: 'NVIDIA dedicated GPU', detail: 'RTX / GTX card. Driver support decides which distros are viable.' },
      { id: 'amd', label: 'AMD Radeon or Ryzen APU', detail: 'Open-source AMDGPU and Mesa, excellent out of the box.' },
      { id: 'intel', label: 'Intel integrated graphics', detail: 'HD, UHD or Iris Xe, with solid Mesa support everywhere.' },
      { id: 'intel-arc', label: 'Intel Arc dedicated GPU', detail: 'Needs a recent kernel and current Mesa for gaming.' },
      { id: 'arm', label: 'ARM64 / single-board / Apple Silicon', detail: 'Requires a distro that publishes an ARM64 image.' },
      { id: 'legacy', label: 'Old or legacy graphics', detail: 'Pre-2014 hardware that needs a light desktop stack.' }
    ]
  },

  // ─────────────────────── STAGE 2: SYSTEM BEHAVIOUR ───────────────────────
  {
    id: 'q_updates',
    stage: 2,
    question: 'How should software updates arrive?',
    hint: 'This is the distro’s core promise, so it cannot be changed later.',
    why: 'Fixed releases freeze versions for years; rolling releases update daily; atomic systems roll back a bad update on reboot.',
    defaultWeight: 3,
    options: [
      { id: 'lts', label: 'Frozen and predictable', detail: 'Long-term fixed releases with mostly security patches.' },
      { id: 'point', label: 'A new version every 6–12 months', detail: 'A balanced cadence with reasonably modern packages.' },
      { id: 'rolling', label: 'Continuous and current', detail: 'Latest kernel and packages as soon as upstream publishes them.' },
      { id: 'atomic', label: 'Atomic, with instant rollback', detail: 'Read-only system image; a bad update is undone by rebooting.' }
    ]
  },
  {
    id: 'q_nvidia',
    stage: 2,
    question: 'How should NVIDIA drivers be delivered?',
    hint: 'Only asked because you selected an NVIDIA GPU.',
    why: 'Pop!_OS and Nobara ship dedicated NVIDIA images; others expect a GUI toggle or a terminal command.',
    defaultWeight: 3,
    when: (answers) => answers.q_graphics === 'nvidia',
    options: [
      { id: 'turnkey-iso', label: 'Pre-installed in the installer', detail: 'Boot the USB and the proprietary driver is already working.' },
      { id: 'driver-manager', label: 'One click in a settings app', detail: 'A graphical driver manager after the first boot.' },
      { id: 'manual-cli', label: 'I can install them myself', detail: 'A documented terminal command is fine.' },
      { id: 'libre-only', label: 'Open-source drivers only', detail: 'Nouveau / NVK even at the cost of 3D performance.' }
    ]
  },
  {
    id: 'q_gaming_depth',
    stage: 2,
    question: 'How serious is the gaming on this machine?',
    hint: 'Only relevant if gaming or a handheld/tv device is part of the picture.',
    why: 'Gaming-first images ship kernels, Proton tooling and driver stacks that a general desktop deliberately leaves out.',
    defaultWeight: 2,
    when: (answers) =>
      answers.q_goal === 'gaming' ||
      ['handheld', 'living-room'].includes(answers.q_device),
    options: [
      { id: 'competitive', label: 'Competitive / maximum frames', detail: 'Custom kernels, schedulers and pre-tuned Proton runners.' },
      { id: 'casual', label: 'Occasional games are enough', detail: 'Steam and Proton should simply work when I want them.' }
    ]
  },
  {
    id: 'q_server_role',
    stage: 2,
    question: 'What will this server actually do?',
    hint: 'Asked only for a server or homelab machine.',
    why: 'Storage-first, container-first and web-facing boxes need different defaults and maintenance models.',
    defaultWeight: 2,
    when: (answers) => answers.q_goal === 'server' || answers.q_device === 'server',
    options: [
      { id: 'storage', label: 'Storage / NAS', detail: 'ZFS or RAID, sharing, backups and low idle power.' },
      { id: 'containers', label: 'Containers / virtualisation', detail: 'Docker, Kubernetes, VMs and automation.' },
      { id: 'web', label: 'Public-facing services', detail: 'Web servers, mail, databases and long uptimes.' }
    ]
  },
  {
    id: 'q_maintenance',
    stage: 2,
    question: 'How much upkeep are you willing to do?',
    hint: 'Be honest. This is about the boring months after installation.',
    why: 'Rolling and source-based systems occasionally need manual intervention; fixed and atomic systems trade freshness for calm.',
    defaultWeight: 2,
    options: [
      { id: 'set-and-forget', label: 'As little as possible', detail: 'Automatic updates and no config surgery.' },
      { id: 'light-touch', label: 'An hour a month is fine', detail: 'Occasional driver or configuration work is acceptable.' },
      { id: 'hands-on', label: 'I enjoy tuning and fixing', detail: 'Breaking and repairing the system is part of the hobby.' }
    ]
  },
  {
    id: 'q_starting_point',
    stage: 2,
    question: 'How finished should the first boot feel?',
    hint: 'Think apps and defaults, not the driver stack.',
    why: 'A complete image includes a browser, office suite and codecs; a minimal image expects you to choose every piece.',
    defaultWeight: 2,
    options: [
      { id: 'complete', label: 'Ready to use', detail: 'Browser, media, office tools and drivers already installed.' },
      { id: 'lean', label: 'A clean base I build on', detail: 'Only the essentials, and I choose the rest.' },
      { id: 'either', label: 'Either is fine', detail: 'I can install or remove software without a fuss.' }
    ]
  },
  {
    id: 'q_rollback',
    stage: 2,
    question: 'Do you want boot-menu rollback?',
    hint: 'A snapshot lets you undo a bad update from the bootloader.',
    why: 'Btrfs, ZFS and atomic images can restore yesterday in one click; most other systems need a manual backup routine.',
    defaultWeight: 1,
    options: [
      { id: 'automatic', label: 'Yes, automatic snapshots', detail: 'Every update gets a restore point I can boot into.' },
      { id: 'manual', label: 'Manual backups are enough', detail: 'I will set up Timeshift, Borg or rsync myself.' },
      { id: 'not-needed', label: 'Not a priority', detail: 'I rarely change system-level things.' }
    ]
  },

  // ────────────────────── STAGE 3: PRINCIPLES AND WORKFLOW ──────────────────────
  {
    id: 'q_freedom',
    stage: 3,
    question: 'How strict are you about proprietary software?',
    hint: 'This includes kernel firmware blobs and codecs, not just apps.',
    why: '100% libre distros will refuse hardware that needs closed firmware, but they offer complete software autonomy.',
    defaultWeight: 3,
    options: [
      { id: 'libre-only', label: 'Strictly 100% free software', detail: 'No proprietary blobs, ever. FSF-endorsed systems only.' },
      { id: 'opt-in', label: 'Free by default, opt-in when needed', detail: 'Open by default, but firmware can be enabled if I need it.' },
      { id: 'pragmatic', label: 'Pragmatic: make it work', detail: 'Include codecs and drivers so everything works immediately.' }
    ]
  },
  {
    id: 'q_init',
    stage: 3,
    question: 'Does the init system matter to you?',
    hint: 'Init is PID 1, the first process that starts every service.',
    why: 'systemd has the widest software support; OpenRC, runit and dinit appeal to people who want a simpler, classic Unix stack.',
    defaultWeight: 3,
    options: [
      { id: 'systemd', label: 'systemd is fine', detail: 'Standard tooling and maximum compatibility.' },
      { id: 'alternative', label: 'No systemd, please', detail: 'OpenRC, runit, dinit, s6 or sysvinit only.' },
      { id: 'indifferent', label: 'Do not care', detail: 'As long as the machine boots, it is fine.' }
    ]
  },
  {
    id: 'q_privacy',
    stage: 3,
    question: 'What is your privacy baseline?',
    hint: 'Telemetry is automatic data sent to the developers or vendors.',
    why: 'Most community distros send nothing; Tails and Whonix go further and force traffic through Tor.',
    defaultWeight: 2,
    options: [
      { id: 'strict', label: 'No telemetry at all', detail: 'No pingbacks, surveys or metrics leaving the machine.' },
      { id: 'transparent', label: 'Opt-in or transparent metrics are fine', detail: 'Anonymous statistics that improve hardware support are acceptable.' },
      { id: 'amnesic', label: 'Tor by default / amnesic session', detail: 'I need a system that leaves no trace and hides my IP.' }
    ]
  },
  {
    id: 'q_desktop',
    stage: 3,
    question: 'Which desktop feel do you want?',
    hint: 'Select any that appeal and we will match distros that offer them.',
    isMultiSelect: true,
    why: 'The desktop is the interface you touch every second, and swapping it later is not always simple.',
    defaultWeight: 3,
    when: (answers) => answers.q_goal !== 'server' && answers.q_device !== 'server',
    options: [
      { id: 'modern', label: 'Sleek and gesture-driven', detail: 'GNOME, COSMIC or Pantheon.' },
      { id: 'plasma', label: 'Highly customisable', detail: 'KDE Plasma with widgets and a traditional taskbar.' },
      { id: 'classic', label: 'Classic and lightweight', detail: 'XFCE, MATE, Cinnamon or Budgie.' },
      { id: 'tiling', label: 'Keyboard-driven tiling', detail: 'Hyprland, Sway, i3 or bspwm.' },
      { id: 'minimal', label: 'Featherweight floating', detail: 'Openbox, LXQt, IceWM or JWM.' },
      { id: 'headless', label: 'No graphical desktop', detail: 'Command line or server only.' }
    ]
  },
  {
    id: 'q_packages',
    stage: 3,
    question: 'How do you prefer to install applications?',
    hint: 'This affects the distro family as much as the app store.',
    why: 'AUR, Nix and Flatpak are not interchangeable because they imply very different underlying systems.',
    defaultWeight: 2,
    options: [
      { id: 'app-store', label: 'A graphical app store', detail: 'Flatpak, Discover or a curated software centre.' },
      { id: 'native', label: 'Native packages via terminal', detail: 'apt, dnf, pacman, zypper or apk.' },
      { id: 'aur', label: 'Arch User Repository', detail: 'A build recipe exists for almost everything.' },
      { id: 'nix', label: 'Declarative packages', detail: 'Nix or Guix with isolated, reproducible environments.' },
      { id: 'any', label: 'Whatever is easiest', detail: 'I will adapt to what the distro provides.' }
    ]
  },
  {
    id: 'q_kernel',
    stage: 3,
    expertOnly: true,
    question: 'Which kernel policy do you want?',
    hint: 'Expert path: this decides how often your hardware support changes.',
    why: 'A frozen kernel is predictable but misses new hardware; a rolling or custom kernel buys enablement at the cost of upkeep.',
    defaultWeight: 2,
    options: [
      { id: 'mainline-lts', label: 'Mainline LTS', detail: 'Predictable, long-supported kernel with backported fixes.' },
      { id: 'newest', label: 'Newest upstream', detail: 'Rolling kernel that picks up hardware enablement first.' },
      { id: 'custom', label: 'I build or patch my own', detail: 'Source-based or custom kernel workflows are normal for me.' }
    ]
  },
  {
    id: 'q_security',
    stage: 3,
    expertOnly: true,
    question: 'What mandatory-access model do you expect?',
    hint: 'Expert path: skipped for newcomers.',
    why: 'SELinux, AppArmor and permissive defaults are a real architectural difference between major families.',
    defaultWeight: 2,
    options: [
      { id: 'selinux', label: 'SELinux', detail: 'Fedora / RHEL-style enforced type enforcement.' },
      { id: 'apparmor', label: 'AppArmor', detail: 'Ubuntu / openSUSE-style path-based profiles.' },
      { id: 'flexible', label: 'No strong preference', detail: 'I will work with whatever the distro provides.' }
    ]
  },
  {
    id: 'q_priority',
    stage: 3,
    question: 'If you could keep only one thing, what would it be?',
    hint: 'This breaks final ties and acts as your strongest preference.',
    why: 'When two distros score almost the same, this single choice decides which one comes first.',
    defaultWeight: 3,
    options: [
      { id: 'stability', label: 'It must never break', detail: 'Battle-tested versions and long support windows.' },
      { id: 'gaming', label: 'Gaming performance', detail: 'Custom kernels, Proton tuning and turnkey drivers.' },
      { id: 'freshness', label: 'The newest software', detail: 'Rolling release and the latest upstream kernel.' },
      { id: 'simplicity', label: 'Ease of use', detail: 'No terminal required, polished defaults.' },
      { id: 'freedom', label: 'Software freedom', detail: 'FSF-libre purity above convenience.' },
      { id: 'privacy', label: 'Privacy and anonymity', detail: 'No telemetry, isolation and Tor-ready networking.' },
      { id: 'lightness', label: 'Speed on modest hardware', detail: 'Low RAM use, fast boot and efficient defaults.' },
      { id: 'reproducibility', label: 'Reproducible system state', detail: 'Declarative config, atomic images and instant rollback.' }
    ]
  }
];

/**
 * Questions actually asked for the current answers and mode.
 * `expertOnly` questions stay out of the newcomer path entirely.
 */
export function visibleQuestions(answers = {}, { expert = false } = {}) {
  return QUESTIONS_DATA.filter((q) => {
    if (q.expertOnly && !expert) return false;
    return typeof q.when === 'function' ? q.when(answers) : true;
  });
}

/** Stage metadata for a question id. */
export function stageForQuestion(questionId) {
  const q = QUESTIONS_DATA.find((item) => item.id === questionId);
  return q ? QUIZ_STAGES.find((s) => s.id === q.stage) || QUIZ_STAGES[0] : QUIZ_STAGES[0];
}
