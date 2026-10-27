// 23 Precision Triangulation Questions across 4 Progressive Rounds
export const SURVEY_ROUNDS = [
  {
    id: 1,
    title: "Round 1: Foundation & User Profile",
    subtitle: "Establish your technical comfort level, primary goals, and core operating model."
  },
  {
    id: 2,
    title: "Round 2: Hardware Architecture, GPUs & Power",
    subtitle: "Align distros with your graphics silicon (NVIDIA, AMD, APUs), RAM, and device form factor."
  },
  {
    id: 3,
    title: "Round 3: Ideology, Init Systems & Software Freedom",
    subtitle: "Define your stance on init systems (systemd vs non-systemd), 100% libre code, and telemetry."
  },
  {
    id: 4,
    title: "Round 4: Desktop Experience, Workflows & Final Steering",
    subtitle: "Dial in your desktop environment, package ecosystem, gaming needs, and steering priority."
  }
];

export const QUESTIONS_DATA = [
  // ==========================================
  // ROUND 1: FOUNDATION & TRIANGULATION
  // ==========================================
  {
    id: "q1_user_level",
    round: 1,
    question: "What is your current level of experience with Linux?",
    subtitle: "Helps eliminate distributions that require advanced terminal administration or deep kernel troubleshooting.",
    explanation: "Beginner distros provide full graphical installers and driver managers. Advanced distros may expect you to manage partitioning or config files via shell.",
    isMultiSelect: false,
    defaultWeight: 3,
    options: [
      {
        id: "beginner",
        label: "Newcomer / Transitioning from Windows or macOS",
        description: "I want an intuitive graphical installer, automatic driver detection, and a desktop that works out of the box without command-line knowledge.",
        matchAttribute: { userLevel: ["beginner"] },
        steerTags: ["beginner-friendly", "gui-driven"]
      },
      {
        id: "intermediate",
        label: "Comfortable Enthusiast",
        description: "I know basic terminal commands (cd, ls, grep), understand file permissions, and don't mind occasional configuration tweaks or package management in the CLI.",
        matchAttribute: { userLevel: ["beginner", "intermediate"] },
        steerTags: ["intermediate", "general-purpose"]
      },
      {
        id: "advanced",
        label: "Power User / Tinkerer",
        description: "I enjoy full control over my operating system, know how to read system logs (journalctl/dmesg), and prefer minimal hand-holding.",
        matchAttribute: { userLevel: ["intermediate", "advanced", "expert"] },
        steerTags: ["tinkering-minimalism", "power-user"]
      },
      {
        id: "expert",
        label: "Systems Architect / Kernel Hacker",
        description: "I want to assemble my OS from raw components, compile from source, or write declarative reproducible configurations. CLI-only is welcome.",
        matchAttribute: { userLevel: ["advanced", "expert"] },
        steerTags: ["expert", "compiled-source", "declarative"]
      }
    ]
  },
  {
    id: "q2_use_cases",
    round: 1,
    question: "What are your primary purposes for this system?",
    subtitle: "Select all that apply to calibrate package ecosystems and kernel tuning.",
    explanation: "Different distros optimize their kernels for distinct priorities: low-latency for gaming/audio, hardened for servers, or battery-tuned for daily ultrabooks.",
    isMultiSelect: true,
    defaultWeight: 2,
    options: [
      {
        id: "daily-driver",
        label: "Everyday Daily Driver & Web Browsing",
        description: "Email, documents, media consumption, office productivity, and video calls.",
        steerTags: ["daily-driver"]
      },
      {
        id: "gaming",
        label: "PC Gaming, Steam, Proton & Emulation",
        description: "Running modern AAA titles, Steam Deck compatibility, custom wine/proton runners, and gamepad support.",
        steerTags: ["gaming"]
      },
      {
        id: "software-development",
        label: "Software Engineering, DevOps & Systems Development",
        description: "Docker, Kubernetes, IDEs, toolchains, compilers, Git workflows, and virtualization.",
        steerTags: ["software-development"]
      },
      {
        id: "privacy-anonymity",
        label: "High Privacy, Anonymity & Digital Defense",
        description: "Tor network routing, RAM-only amnesic sessions, metadata wiping, and zero telemetry.",
        steerTags: ["privacy-anonymity"]
      },
      {
        id: "cybersecurity-pentesting",
        label: "Cybersecurity, Penetration Testing & Forensics",
        description: "Offensive security tools, vulnerability auditing, reverse engineering, and network sniffing.",
        steerTags: ["cybersecurity-pentesting"]
      },
      {
        id: "server-homelab",
        label: "Home Server, Homelab, NAS & Virtualization",
        description: "Headless 24/7 reliability, Nextcloud, Plex/Jellyfin, ZFS, RAID, and low power idle.",
        steerTags: ["server-homelab"]
      },
      {
        id: "creative-multimedia",
        label: "Audio Engineering, Video Editing & 3D Graphics",
        description: "Blender, DaVinci Resolve, Krita, Ardour, low-latency audio kernels, and PipeWire/JACK routing.",
        steerTags: ["creative-multimedia"]
      },
      {
        id: "low-spec-hardware",
        label: "Reviving Vintage or Low-Spec Hardware",
        description: "Breathing fast responsiveness into an older PC, netbook, or budget laptop with limited RAM.",
        steerTags: ["low-spec-hardware"]
      },
      {
        id: "education",
        label: "School, University & Classroom Learning",
        description: "Assignments, research, coding classes, shared lab machines, and easy account or parental controls.",
        steerTags: ["education"]
      }
    ]
  },
  {
    id: "q3_release_model",
    round: 1,
    question: "What is your preference on update cadence and software freshness?",
    subtitle: "Balancing rock-solid battle-tested stability against having the latest packages.",
    explanation: "Fixed releases (like Debian/Ubuntu LTS) change rarely and guarantee stability. Rolling releases (like Arch/Tumbleweed) continuously deliver newer software as it is published upstream.",
    isMultiSelect: false,
    defaultWeight: 2,
    options: [
      {
        id: "fixed-rock-solid",
        label: "Rock-Solid Fixed Releases (LTS)",
        description: "I value uninterrupted stability. Software versions remain frozen for 2-5 years with only security patches.",
        matchAttribute: { releaseModel: ["fixed"] },
        steerTags: ["enterprise-stability", "frozen-packages"]
      },
      {
        id: "semi-rolling-balanced",
        label: "Balanced Cadence (Point Releases / 6-Month Cycle)",
        description: "A solid base updated every 6 to 12 months (like Fedora or Ubuntu interim), balancing modern packages with stability.",
        matchAttribute: { releaseModel: ["fixed", "semi-rolling"] },
        steerTags: ["balanced-freshness"]
      },
      {
        id: "rolling-bleeding-edge",
        label: "Continuous Rolling Release (Bleeding Edge)",
        description: "No version numbers: I want the absolute latest Linux kernels, Mesa graphics drivers, and software updates the moment they are released.",
        matchAttribute: { releaseModel: ["rolling"] },
        steerTags: ["rolling-release", "latest-drivers"]
      },
      {
        id: "immutable-atomic",
        label: "Modern Immutable / Atomic Upgrades",
        description: "System updates are downloaded as a single read-only image. If an update causes an issue, simply reboot to roll back instantly.",
        matchAttribute: { releaseModel: ["immutable-atomic"] },
        steerTags: ["atomic-updates", "immutable"]
      }
    ]
  },
  {
    id: "q4_filesystem_architecture",
    round: 1,
    question: "How do you feel about Immutable / Atomic Root Filesystems?",
    subtitle: "A modern paradigm where the core OS is read-only and user applications run in containers or Flatpaks.",
    explanation: "In traditional Linux (mutable), apt or pacman directly writes files to root. In immutable systems (like Fedora Silverblue, SteamOS, openSUSE Aeon), the root filesystem cannot be modified, making system corruption nearly impossible.",
    isMultiSelect: false,
    defaultWeight: 1,
    options: [
      {
        id: "traditional-mutable",
        label: "Traditional Mutable Filesystem",
        description: "I want standard root access where package managers install directly to /usr and /bin.",
        filterOut: ["immutable-atomic"],
        steerTags: ["traditional-linux"]
      },
      {
        id: "prefer-immutable",
        label: "I Love Immutable / Atomic Systems (SteamOS / Silverblue style)",
        description: "Bulletproof reliability, instant rollback pins, and Flatpak application isolation appeal to me.",
        matchAttribute: { releaseModel: ["immutable-atomic"] },
        steerTags: ["immutable-root"]
      },
      {
        id: "no-preference",
        label: "No Preference / Either Works",
        description: "As long as it's reliable and runs my software, I don't mind the underlying root architecture.",
        steerTags: ["neutral"]
      }
    ]
  },
  {
    id: "q5_out_of_box",
    round: 1,
    question: "What is your setup philosophy: Batteries-Included or Minimal DIY?",
    subtitle: "Determines how much pre-installed software and configuration you desire on first boot.",
    explanation: "'Batteries-included' means full web browser, media players, office suite, and drivers ready immediately. 'Minimal' gives you a terminal or bare window manager to customize yourself.",
    isMultiSelect: false,
    defaultWeight: 1,
    options: [
      {
        id: "turnkey-batteries-included",
        label: "Turnkey & Complete (Batteries Included)",
        description: "Give me a complete suite of polished apps, file manager, office tools, and multimedia playback ready to use immediately.",
        steerTags: ["turnkey", "complete-desktop"]
      },
      {
        id: "clean-minimal-base",
        label: "Clean Minimalist Base (Curate My Own)",
        description: "Give me only the essential OS and let me choose exactly which browser, text editor, and tools get installed.",
        steerTags: ["minimal-base", "tinkering-minimalism"]
      },
      {
        id: "no-preference",
        label: "No Strong Preference",
        description: "I can uninstall apps I don't need or install what's missing.",
        steerTags: ["neutral"]
      }
    ]
  },

  // ==========================================
  // ROUND 2: HARDWARE ARCHITECTURE & GPUS
  // ==========================================
  {
    id: "q6_gpu_architecture",
    round: 2,
    question: "What graphics hardware (GPU / APU) powers your computer?",
    subtitle: "Critical for driver compatibility, Wayland rendering, and gaming performance.",
    explanation: "NVIDIA GPUs rely primarily on proprietary drivers. AMD and Intel GPUs use open-source Mesa drivers built directly into the Linux kernel.",
    isMultiSelect: false,
    defaultWeight: 3,
    options: [
      {
        id: "nvidia-dedicated",
        label: "NVIDIA Dedicated GPU (RTX / GTX series)",
        description: "Requires robust NVIDIA proprietary driver support, Wayland compatibility patches, or dedicated ISO installer.",
        matchAttribute: { gpuSupport: ["excellent-nvidia", "standard-nvidia"] },
        steerTags: ["nvidia-support"]
      },
      {
        id: "amd-dedicated",
        label: "AMD Radeon Dedicated GPU (RX 6000/7000/8000+)",
        description: "First-class plug-and-play experience using the open-source Linux kernel AMDGPU driver.",
        steerTags: ["amd-radeon", "open-source-gpu"]
      },
      {
        id: "amd-apu",
        label: "AMD Ryzen APU / Integrated Radeon Graphics",
        description: "Exceptional gaming on integrated graphics (Steam Deck, ROG Ally, mini PCs, lightweight laptops).",
        matchAttribute: { apuSupport: ["stellar-apu-gaming", "standard-apu"] },
        steerTags: ["apu-optimized"]
      },
      {
        id: "intel-integrated",
        label: "Intel Integrated Graphics (HD / UHD / Iris Xe)",
        description: "Seamless open-source Mesa drivers; outstanding video decoding and battery conservation.",
        steerTags: ["intel-graphics"]
      },
      {
        id: "intel-arc",
        label: "Intel Arc Dedicated GPU (A750, A770, Battlemage)",
        description: "Requires very recent Linux kernels (6.8+) and updated Mesa packages for optimal gaming.",
        matchAttribute: { releaseModel: ["rolling", "semi-rolling"] },
        steerTags: ["fresh-kernel-needed"]
      },
      {
        id: "arm-apple-silicon",
        label: "ARM64 / Single-Board / Apple Silicon (M1/M2/M3)",
        description: "Asahi Linux, Raspberry Pi, or ARM single-board computers requiring specialized ARM64 kernels.",
        matchAttribute: { architectures: ["arm64"] },
        steerTags: ["arm64-support"]
      },
      {
        id: "older-legacy-gpu",
        label: "Older / Legacy Graphics (Pre-2014 hardware)",
        description: "Legacy cards requiring lightweight window managers and older kernel compatibility.",
        matchAttribute: { gpuSupport: ["legacy-hardware", "standard-apu"] },
        steerTags: ["legacy-gpu"]
      }
    ]
  },
  {
    id: "q7_nvidia_stance",
    round: 2,
    question: "If you use NVIDIA, how should drivers be handled?",
    subtitle: "Filters distros based on their automated proprietary driver installer tooling.",
    explanation: "Some distros (like Pop!_OS or Nobara) ship a dedicated NVIDIA ISO with the driver pre-installed. Others require you to install it via terminal after booting.",
    isMultiSelect: false,
    defaultWeight: 2,
    options: [
      {
        id: "nvidia-preinstalled-iso",
        label: "Dedicated NVIDIA ISO / Turnkey Installation",
        description: "I want an ISO that boots directly with NVIDIA drivers pre-installed and working out-of-the-box.",
        steerTags: ["nvidia-preinstalled", "excellent-nvidia"]
      },
      {
        id: "nvidia-gui-driver-manager",
        label: "1-Click Graphical Driver Manager Post-Install",
        description: "A notification or settings menu where I can tick a box to install the recommended proprietary driver.",
        steerTags: ["driver-manager", "standard-nvidia"]
      },
      {
        id: "open-source-only",
        label: "I Only Want Open-Source Drivers (Nouveau / NVK)",
        description: "I prefer 100% open-source software even if it means slightly reduced 3D performance.",
        steerTags: ["open-source-drivers", "100-libre-fsf"]
      },
      {
        id: "no-nvidia",
        label: "I Don't Have NVIDIA / Skip this factor",
        description: "My computer uses AMD, Intel, or virtual graphics.",
        steerTags: ["not-applicable"]
      }
    ]
  },
  {
    id: "q8_device_form_factor",
    round: 2,
    question: "What type of device are you installing this on?",
    subtitle: "Influences recommendations for power profiles, touchpad gestures, and handheld game UI.",
    explanation: "Handhelds need controller navigation and TDP controls. Laptops need sleep/suspend reliability. Servers need zero GUI overhead.",
    isMultiSelect: false,
    defaultWeight: 1,
    options: [
      {
        id: "desktop-pc",
        label: "Desktop Tower / Workstation",
        description: "Permanently plugged into wall power, dual/triple monitors, wired peripherals.",
        steerTags: ["desktop-pc"]
      },
      {
        id: "laptop-ultrabook",
        label: "Laptop / Ultrabook",
        description: "Touchpad gestures, Wi-Fi roaming, battery endurance, external display hotplugging.",
        steerTags: ["laptop-friendly"]
      },
      {
        id: "handheld-gaming",
        label: "Handheld Gaming PC (Steam Deck, ROG Ally, Legion Go)",
        description: "Direct boot to full-screen gamepad UI, TDP power sliders, custom controller keybindings.",
        steerTags: ["handheld-ready", "gaming"]
      },
      {
        id: "mini-pc-htpc",
        label: "Living Room Mini-PC / HTPC",
        description: "Connected to a 4K TV, HDMI-CEC control, controller or media remote.",
        steerTags: ["living-room-htpc", "tv-interface"]
      },
      {
        id: "server-node",
        label: "Dedicated Server Node / NAS / Homelab Box",
        description: "Headless rack or closet PC managed via web interface or SSH.",
        steerTags: ["server-homelab"]
      },
      {
        id: "older-low-spec-pc",
        label: "Older / Vintage Computer (Over 8-10 years old)",
        description: "Slower CPU, mechanical hard drive or early SSD, needing an ultra-lightweight environment.",
        steerTags: ["low-spec-hardware", "potatoes-vintage"]
      }
    ]
  },
  {
    id: "q9_ram_resources",
    round: 2,
    question: "How much system memory (RAM) does your machine possess?",
    subtitle: "Heavy desktop environments (GNOME/Plasma) require at least 4GB; lightweight distros can run in 512MB.",
    explanation: "Matching memory budget ensures your system will never thrash swap memory or freeze under load.",
    isMultiSelect: false,
    defaultWeight: 2,
    options: [
      {
        id: "ram-potato",
        label: "Very Low: Less than 2 GB RAM (or 32-bit CPU)",
        description: "Vintage laptops or micro-PCs requiring featherweight window managers (IceWM, Openbox, JWM).",
        matchAttribute: { hardwareSpec: ["potatoes-vintage"] },
        steerTags: ["potatoes-vintage", "ultra-low-ram"]
      },
      {
        id: "ram-low",
        label: "Modest: 2 GB to 4 GB RAM",
        description: "Budget machines best suited for XFCE, LXQt, or lightweight desktop environments.",
        matchAttribute: { hardwareSpec: ["potatoes-vintage", "lightweight"] },
        steerTags: ["lightweight"]
      },
      {
        id: "ram-standard",
        label: "Modern Mainstream: 8 GB to 16 GB RAM",
        description: "Sufficient for any modern Linux desktop (GNOME, KDE Plasma, multitasking, moderate gaming).",
        matchAttribute: { hardwareSpec: ["lightweight", "modern-standard"] },
        steerTags: ["modern-standard"]
      },
      {
        id: "ram-workstation",
        label: "Powerhouse: 32 GB RAM or more",
        description: "Can comfortably run virtualization, heavy Docker containers, ZFS caching, and compilation.",
        matchAttribute: { hardwareSpec: ["modern-standard", "high-end-workstation"] },
        steerTags: ["high-end-workstation"]
      }
    ]
  },
  {
    id: "q10_battery_power",
    round: 2,
    question: "How important is out-of-the-box battery life and power tuning?",
    subtitle: "Select if you rely on laptop battery for work on the go.",
    explanation: "Some distros integrate power-profiles-daemon, auto-cpufreq, or TLP directly into system settings for extended battery hours.",
    isMultiSelect: false,
    defaultWeight: 1,
    options: [
      {
        id: "critical-battery",
        label: "Crucial: Maximum Battery Endurance is Essential",
        description: "Need pre-configured power profiles, suspended background apps, and low idle CPU wattage.",
        steerTags: ["battery-saver", "power-profiles"]
      },
      {
        id: "balanced-power",
        label: "Balanced: Normal Laptop Use",
        description: "Standard power management is adequate.",
        steerTags: ["balanced-power"]
      },
      {
        id: "desktop-plugged-in",
        label: "Not Applicable: Desktop or Always Plugged In",
        description: "I want maximum performance without throttling.",
        steerTags: ["max-performance"]
      }
    ]
  },
  {
    id: "q22_maintenance_tolerance",
    round: 2,
    question: "How much ongoing maintenance are you willing to do?",
    subtitle: "Separates set-and-forget systems from distros that reward hands-on administration.",
    explanation: "Rolling and source-based distributions occasionally need manual intervention (merging configs, rebuilding kernels). Fixed-release and immutable systems trade freshness for a lower maintenance burden.",
    isMultiSelect: false,
    defaultWeight: 2,
    options: [
      {
        id: "zero-friction",
        label: "Zero Friction: It Should Just Keep Working",
        description: "Automatic updates, no config surgery. If something needs manual intervention, I would rather not use that distro.",
        steerTags: ["beginner-friendly", "set-and-forget"]
      },
      {
        id: "occasional-tinkering",
        label: "Occasional Tinkering Is Fine",
        description: "I can spend an hour or two a month on updates, driver fixes, or a config change.",
        steerTags: ["intermediate", "balanced-freshness"]
      },
      {
        id: "enjoy-fixing",
        label: "I Enjoy Fixing and Tuning My System",
        description: "Breaking and repairing things is part of the hobby. Give me the raw system and I will manage it.",
        steerTags: ["power-user", "tinkering-minimalism"]
      }
    ]
  },

  // ==========================================
  // ROUND 3: IDEOLOGY, INIT SYSTEMS & LICENSING
  // ==========================================
  {
    id: "q11_software_freedom",
    round: 3,
    question: "What is your stance on Software Freedom, Proprietary Drivers & Codecs?",
    subtitle: "Do you require 100% Free/Libre Software (FSF Endorsed), or do you prefer pragmatic compatibility?",
    explanation: "100% Free Software distributions contain zero proprietary binary firmware blobs in the Linux kernel. They will NOT work with hardware requiring closed-source firmware (such as many Wi-Fi chips and NVIDIA GPUs). Pragmatic distros include non-free drivers so everything works.",
    isMultiSelect: false,
    defaultWeight: 3,
    options: [
      {
        id: "strict-libre-fsf",
        label: "100% Free Software Only (FSF-Endorsed / Linux-libre)",
        description: "No proprietary blobs, no non-free drivers, no closed-source binary firmware. Complete digital autonomy.",
        matchAttribute: { freeSoftwareStrictness: ["100-libre-fsf"] },
        steerTags: ["100-libre-fsf", "fsf-endorsed"]
      },
      {
        id: "free-by-default-optin",
        label: "Free by Default, with Easy Opt-in for Proprietary",
        description: "System ships with open-source software, but makes it simple to enable proprietary codecs/drivers if required (like Fedora/Debian).",
        matchAttribute: { freeSoftwareStrictness: ["free-with-opt-in", "pragmatic"] },
        steerTags: ["free-with-opt-in"]
      },
      {
        id: "pragmatic-batteries",
        label: "Pragmatic Convenience: Include Non-Free Out of the Box",
        description: "Include MP3/H.264/AAC codecs, proprietary Wi-Fi firmware, and GPU drivers pre-installed so everything works instantly.",
        matchAttribute: { freeSoftwareStrictness: ["pragmatic"] },
        steerTags: ["pragmatic-codecs"]
      }
    ]
  },
  {
    id: "q12_init_system",
    round: 3,
    question: "What is your stance on Init Systems (systemd vs non-systemd)?",
    subtitle: "The init system is PID 1 — the very first process launched by the kernel that manages all system services.",
    explanation: "systemd is the modern standard used by 90% of Linux distros (Ubuntu, Fedora, Arch, Debian). Some UNIX purists prefer lighter, simpler alternatives (OpenRC, Runit, s6, sysvinit, Dinit, Shepherd) adhering strictly to the UNIX philosophy.",
    isMultiSelect: false,
    defaultWeight: 3,
    options: [
      {
        id: "systemd-preferred",
        label: "systemd is Fine / Preferred",
        description: "I want maximum software compatibility, journalctl logging, and standard systemctl service commands.",
        matchAttribute: { initSystem: ["systemd"] },
        steerTags: ["systemd"]
      },
      {
        id: "non-systemd-strict",
        label: "Strictly Non-systemd (OpenRC, Runit, s6, sysvinit, Dinit)",
        description: "I deliberately reject systemd. I want faster boot times, lightweight process supervision, and classic UNIX simplicity.",
        matchAttribute: { initSystem: ["openrc", "runit", "s6", "sysvinit", "dinit", "shepherd", "custom"] },
        steerTags: ["no-systemd", "init-freedom"]
      },
      {
        id: "no-preference-init",
        label: "No Preference / What's an Init System?",
        description: "I don't mind what system runs behind the scenes as long as the OS works reliably.",
        steerTags: ["neutral"]
      }
    ]
  },
  {
    id: "q13_telemetry_privacy",
    round: 3,
    question: "What are your expectations regarding Telemetry and Data Collection?",
    subtitle: "How aggressive should the operating system be about preserving absolute privacy?",
    explanation: "Most community Linux distros collect zero telemetry. Some corporate-backed distros have optional opt-out hardware reporting. Specialized privacy distros route all connections through Tor.",
    isMultiSelect: false,
    defaultWeight: 2,
    options: [
      {
        id: "zero-telemetry-strict",
        label: "Absolute Zero Telemetry by Default",
        description: "No automated pingbacks, no hardware surveys, and no metrics sent to developers.",
        steerTags: ["zero-telemetry"]
      },
      {
        id: "standard-open-source-telemetry",
        label: "Opt-Out / Transparent Open-Source Metrics are Fine",
        description: "I don't mind anonymous statistics that help developers improve hardware support (e.g. Ubuntu popularity contest or Fedora metrics).",
        steerTags: ["standard-telemetry"]
      },
      {
        id: "extreme-amnesic-tor",
        label: "Paranoid Amnesic Anonymity (Tor-Only / RAM-Only)",
        description: "I need complete digital stealth: all traffic forced through Tor, encrypted RAM wipe on shutdown, and zero hard drive footprints.",
        steerTags: ["privacy-anonymity", "amnesic-ram-only"]
      }
    ]
  },
  {
    id: "q14_governance_backing",
    round: 3,
    question: "Do you prefer Community-Driven or Corporate-Backed distributions?",
    subtitle: "Distributions differ significantly in how decisions, budgets, and steering roadmaps are handled.",
    explanation: "Community distros (Debian, Arch) are governed democratically by volunteers. Corporate distros (Ubuntu/Canonical, Fedora/Red Hat, openSUSE/SUSE) have full-time paid engineering teams and commercial support.",
    isMultiSelect: false,
    defaultWeight: 1,
    options: [
      {
        id: "pure-community",
        label: "Purely Community-Governed / Non-Profit",
        description: "Democratically steered by volunteer developers and non-profit foundations without corporate shareholder pressures.",
        steerTags: ["community-governed"]
      },
      {
        id: "corporate-backed",
        label: "Enterprise / Corporate-Backed",
        description: "Backed by companies with full-time paid kernel engineers, certified hardware vendor relationships, and long-term financial security.",
        steerTags: ["enterprise-backing"]
      },
      {
        id: "no-preference-governance",
        label: "No Preference",
        description: "I care about the quality of the software, not the legal structure of the organization.",
        steerTags: ["neutral"]
      }
    ]
  },
  {
    id: "q15_distro_lineage",
    round: 3,
    question: "Do you have an affinity for a specific Distro Family / Lineage?",
    subtitle: "If you have prior muscle memory for specific package managers or repositories, select it here.",
    explanation: "Debian/Ubuntu use apt. Arch uses pacman. Fedora/RHEL use dnf. openSUSE uses zypper. Independent systems use unique architectures.",
    isMultiSelect: false,
    defaultWeight: 2,
    options: [
      {
        id: "debian-ubuntu-family",
        label: "Debian / Ubuntu Lineage (.deb / apt)",
        description: "Massive online tutorials, universally available third-party .deb packages and PPAs.",
        matchAttribute: { family: ["Debian", "Ubuntu"] },
        steerTags: ["debian-lineage"]
      },
      {
        id: "arch-family",
        label: "Arch Linux Lineage (pacman / AUR)",
        description: "Access to the Arch User Repository (AUR), PKGBUILD recipes, and bleeding-edge upstream code.",
        matchAttribute: { family: ["Arch"] },
        steerTags: ["arch-lineage"]
      },
      {
        id: "fedora-rhel-family",
        label: "Fedora / Red Hat Lineage (dnf / rpm)",
        description: "Cutting-edge upstream standards, SELinux security, and enterprise alignment.",
        matchAttribute: { family: ["Fedora/RHEL"] },
        steerTags: ["fedora-lineage"]
      },
      {
        id: "opensuse-family",
        label: "openSUSE Family (zypper / YaST)",
        description: "Automated openQA testing matrix, YaST system center, and Snapper Btrfs integration.",
        matchAttribute: { family: ["openSUSE"] },
        steerTags: ["suse-lineage"]
      },
      {
        id: "independent-unique",
        label: "Independent / Unique Architectures (NixOS, Void, Alpine, Gentoo, Solus)",
        description: "Distros built from scratch with novel package managers (nix, apk, xbps, portage, eopkg).",
        matchAttribute: { family: ["Independent", "Gentoo", "Slackware"] },
        steerTags: ["independent-lineage"]
      },
      {
        id: "open-to-anything",
        label: "Completely Open to Any Family",
        description: "Pick whichever family best matches the rest of my answers.",
        steerTags: ["neutral"]
      }
    ]
  },

  // ==========================================
  // ROUND 4: DESKTOP WORKFLOWS & FINAL STEERING
  // ==========================================
  {
    id: "q16_desktop_environment",
    round: 4,
    question: "What is your preferred Desktop Environment or Window Management style?",
    subtitle: "The visual interface you interact with every second.",
    explanation: "GNOME is sleek and gesture-driven. KDE Plasma is customizable and Windows-like. Tiling WMs (i3, Hyprland, Sway) are keyboard-centric. XFCE is lightweight and snappy.",
    isMultiSelect: true,
    defaultWeight: 3,
    options: [
      {
        id: "gnome-cosmic",
        label: "Modern & Sleek: GNOME / COSMIC",
        description: "Clean, distraction-free workflow with smooth multi-finger trackpad gestures and dynamic workspaces.",
        steerTags: ["GNOME", "COSMIC"]
      },
      {
        id: "kde-plasma",
        label: "Ultra-Customizable: KDE Plasma",
        description: "Infinitely tweakable, low memory usage, familiar taskbar, and rich widget ecosystem.",
        steerTags: ["KDE Plasma"]
      },
      {
        id: "traditional-lightweight",
        label: "Classic & Traditional: XFCE / MATE / Cinnamon",
        description: "Reliable Windows-style bottom taskbar, start menu, and low CPU/RAM overhead.",
        steerTags: ["XFCE", "MATE", "Cinnamon"]
      },
      {
        id: "tiling-window-manager",
        label: "Keyboard-Driven Tiling Window Manager (i3 / Sway / Hyprland)",
        description: "No mouse needed: windows automatically tile into clean grids. Ultra-fast productivity.",
        steerTags: ["i3", "Sway", "Hyprland", "bspwm"]
      },
      {
        id: "minimalist-floating",
        label: "Ultra-Light Floating: Openbox / LXQt / IceWM",
        description: "Sub-300MB idle RAM, blazing launch speeds, and clean right-click root menus.",
        steerTags: ["Openbox", "LXQt", "IceWM"]
      },
      {
        id: "headless-cli",
        label: "Headless / Command-Line Only (No GUI)",
        description: "For servers, containers, or terminal purists who don't want a graphical display server.",
        steerTags: ["CLI/Headless"]
      }
    ]
  },
  {
    id: "q17_package_formats",
    round: 4,
    question: "How do you prefer installing application software?",
    subtitle: "Distributions differ in how software is packaged and sandboxed.",
    explanation: "Traditional package managers install directly to system libraries. Modern universal formats (Flatpak, Snap) sandbox apps for security and portability.",
    isMultiSelect: false,
    defaultWeight: 1,
    options: [
      {
        id: "flatpak-appcenter",
        label: "Flatpak & Modern Graphical Software Stores",
        description: "Sandboxed applications from Flathub with permission toggles and zero dependency conflicts.",
        steerTags: ["flatpak-centric"]
      },
      {
        id: "traditional-native-repos",
        label: "Native Repositories via Terminal (apt, pacman, dnf, zypper)",
        description: "Direct native packages tightly integrated with the system shared libraries.",
        steerTags: ["native-package-manager"]
      },
      {
        id: "declarative-nix-guix",
        label: "Declarative / Functional Package Management (Nix / Guix)",
        description: "Isolated environments, atomic rollbacks, and zero chance of breaking other applications.",
        steerTags: ["declarative-packages"]
      },
      {
        id: "aur-user-repos",
        label: "Arch User Repository (AUR) Community Build Scripts",
        description: "If software exists on GitHub or the web, there is already an automated community recipe for it.",
        steerTags: ["aur-ecosystem"]
      },
      {
        id: "dont-care-packaging",
        label: "Whatever Works Easily",
        description: "I'll use whichever package manager comes with the distro.",
        steerTags: ["neutral"]
      }
    ]
  },
  {
    id: "q18_gaming_tuning",
    round: 4,
    question: "How intensive are your PC gaming requirements?",
    subtitle: "Determines whether specialized low-latency kernels and pre-configured gaming tools are needed.",
    explanation: "Distros like Nobara, Bazzite, and CachyOS bundle custom kernels with fsync, Steam, Lutris, and Wine dependencies pre-configured.",
    isMultiSelect: false,
    defaultWeight: 2,
    options: [
      {
        id: "hardcore-pc-gamer",
        label: "Competitive / Dedicated PC Gamer",
        description: "I want custom gaming kernels, BORE/futex schedulers, Gamemode, MangoHud, Steam, and Wine pre-configured for maximum frame rates.",
        steerTags: ["gaming-optimized", "custom-kernel"]
      },
      {
        id: "casual-gamer",
        label: "Casual / Occasional Gaming",
        description: "I just need Steam and Proton to run standard games when I want to relax without special kernel tuning.",
        steerTags: ["casual-gaming"]
      },
      {
        id: "no-gaming",
        label: "No Gaming Required",
        description: "This computer is strictly for work, study, coding, or server tasks.",
        steerTags: ["non-gaming"]
      }
    ]
  },
  {
    id: "q19_snapshots_rollback",
    round: 4,
    question: "Do you want automated System Snapshots and Rollback Protection?",
    subtitle: "Ensures you can reverse an update or bad configuration directly from the bootloader menu.",
    explanation: "Filesystems like Btrfs or ZFS take sub-second snapshots. Distros like openSUSE (Snapper), Fedora, Garuda, and CachyOS automatically take a snapshot before every package transaction.",
    isMultiSelect: false,
    defaultWeight: 1,
    options: [
      {
        id: "automated-btrfs-snapper",
        label: "Yes: Automated Snapshots in GRUB (Snapper / Timeshift / Btrfs)",
        description: "If an update breaks anything, I want to select 'Boot into Yesterday' from the boot menu and be instantly back in action.",
        steerTags: ["btrfs-snapshots", "instant-rollback"]
      },
      {
        id: "standard-manual-backups",
        label: "Standard Manual Backups (Timeshift, Borg, rsync) are Sufficient",
        description: "I am comfortable setting up my own periodic backup schedule.",
        steerTags: ["standard-backups"]
      },
      {
        id: "not-needed-snapshots",
        label: "Not a Priority for Me",
        description: "I don't require automated filesystem snapshot hooks.",
        steerTags: ["neutral"]
      }
    ]
  },
  {
    id: "q20_documentation_community",
    round: 4,
    question: "What kind of Community Support and Documentation do you prefer?",
    subtitle: "When you run into a question, where do you look for answers?",
    explanation: "Having the right documentation can make the difference between a 2-minute fix and hours of frustration.",
    isMultiSelect: false,
    defaultWeight: 1,
    options: [
      {
        id: "encyclopedic-wiki",
        label: "Exhaustive Wiki & Knowledge Base (Arch Wiki / Gentoo Wiki style)",
        description: "I love reading in-depth technical documentation that explains how every daemon and config file works.",
        steerTags: ["wiki-encyclopedia"]
      },
      {
        id: "massive-forum-stack-overflow",
        label: "Massive Forum Search Results (Ubuntu / Debian / Reddit forums)",
        description: "I want to be able to copy-paste any error message into Google and immediately find 50 solved forum threads.",
        steerTags: ["massive-forum"]
      },
      {
        id: "cozy-irc-matrix",
        label: "Cozy Real-Time Chats (IRC, Matrix, Discord)",
        description: "I enjoy hanging out in tight-knit developer channels to ask questions directly to maintainers.",
        steerTags: ["cozy-community"]
      }
    ]
  },
  {
    id: "q23_mainstream_vs_indie",
    round: 4,
    question: "Do you want a mainstream ecosystem or an independent project?",
    subtitle: "Controls how much we favour well-known distros over niche or experimental ones.",
    explanation: "Mainstream distros get more testing, tutorials, and hardware support. Independent projects often offer a more distinctive design and a closer community, at the cost of fewer answers when something breaks.",
    isMultiSelect: false,
    defaultWeight: 2,
    options: [
      {
        id: "mainstream-ecosystem",
        label: "Mainstream: Proven, Popular, Widely Supported",
        description: "I want the distro with the most tutorials, the largest community, and the least chance of hitting an undocumented problem.",
        steerTags: ["beginner-friendly", "massive-forum"]
      },
      {
        id: "balanced-recognition",
        label: "Balanced: Recognised but Not Generic",
        description: "A well-run project with a real community, even if it is not the default recommendation.",
        steerTags: ["general-purpose"]
      },
      {
        id: "independent-novelty",
        label: "Independent: Distinctive and Off the Beaten Path",
        description: "I care more about a unique design or philosophy than about being on the most-trodden path.",
        steerTags: ["independent-lineage", "tinkering-minimalism"]
      }
    ]
  },
  {
    id: "q21_steering_priority",
    round: 4,
    question: "Final Steering Dial: What is your Single Absolute Highest Priority?",
    subtitle: "This answer receives 3x multiplier weight to firmly steer your final top recommendation.",
    explanation: "If two distros tie on scores, your steering priority acts as the definitive tiebreaker.",
    isMultiSelect: false,
    defaultWeight: 3,
    options: [
      {
        id: "steer-stability",
        label: "Rock-Solid Dependability (It Must Never Break)",
        description: "Prioritize battle-tested stability above all else.",
        steerTags: ["enterprise-stability", "frozen-packages"]
      },
      {
        id: "steer-gaming",
        label: "Maximum Gaming Performance & Turnkey Drivers",
        description: "Prioritize FPS, NVIDIA/AMD optimizations, and Proton gaming readiness.",
        steerTags: ["gaming", "gaming-optimized"]
      },
      {
        id: "steer-freshness",
        label: "Bleeding-Edge Software & Upstream Kernels",
        description: "Prioritize continuous rolling releases and newest package versions.",
        steerTags: ["rolling-release", "latest-drivers"]
      },
      {
        id: "steer-simplicity",
        label: "Ease of Use & Frictionless Migration from Windows/Mac",
        description: "Prioritize zero terminal requirements and intuitive desktop polish.",
        steerTags: ["beginner-friendly", "gui-driven"]
      },
      {
        id: "steer-freedom",
        label: "100% Free Software & Ethical Open-Source Purity",
        description: "Prioritize FSF libre guidelines and freedom from proprietary blobs.",
        steerTags: ["100-libre-fsf", "fsf-endorsed"]
      },
      {
        id: "steer-privacy",
        label: "Zero Telemetry, Anonymity & Digital Defense",
        description: "Prioritize metadata protection, isolation, and Tor routing.",
        steerTags: ["privacy-anonymity", "zero-telemetry"]
      },
      {
        id: "steer-minimalism",
        label: "Featherweight Speed & Old Hardware Resurrection",
        description: "Prioritize sub-500MB RAM usage, fast boot, and resource efficiency.",
        steerTags: ["tinkering-minimalism", "potatoes-vintage", "lightweight"]
      },
      {
        id: "steer-reproducibility",
        label: "Declarative Reproducibility & Modern Immutability",
        description: "Prioritize NixOS, atomic OSTree images, and container isolation.",
        steerTags: ["declarative", "atomic-updates", "immutable"]
      }
    ]
  }
];
