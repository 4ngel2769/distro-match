# LinuxMatch: The Definitive Linux Distribution Triangulator

An encyclopedic, precision Linux distribution picker and triangulation engine covering **116+ Linux distributions** across every architectural family, init system, package manager, and hardware setup. Built as a high-performance **Svelte** application.

The default first experience is the pinpoint questionnaire: 16 branching questions across three short stages, with an expert path and a transparent shortlist. A swipe-based discovery deck is implemented but currently parked. Flip `ENABLE_SWIPE_DECK` in `src/components/WelcomeView.svelte` to restore it.

---

## What's New in Version 2.0

1. **Migrated to Svelte & Vite**:
   - Replaced raw Go server with a modern reactive **Svelte 5** and **Vite** architecture.
   - Snappy state management, reactive filtering, and zero-runtime bloat.

2. **Revamped Triangulation & Real-Time Steering**:
   - **16 pinpoint questions across 3 short stages** replace the old 23-question survey. Each option maps to a real catalogue field; conditional questions (NVIDIA drivers) are skipped when they do not apply. Importance is explicit: *nice to have*, *important*, or *must-have*. Must-haves on factual constraints become hard filters.
   - Fixed flawed legacy matching that previously over-promoted niche distros like Calculate Linux.
   - **Distro Popularity & Tier Classification**:
     - **Flagships (Tier 1)**: Linux Mint, Ubuntu, Debian, Fedora, Arch, Pop!_OS, openSUSE, Zorin, EndeavourOS.
     - **Specialists (Tier 2)**: Bazzite, Nobara, CachyOS, SteamOS, Manjaro, KDE neon, NixOS, Void, Alpine, Tuxedo, Kali, Tails, Qubes, Proxmox, TrueNAS.
     - **Niche Systems (Tier 3)**: Calculate Linux, Gentoo, Slackware, Tiny Core, Devuan, Artix, Bedrock. Niche distros are now gated and will **never** be recommended to beginners or casual users unless explicitly unlocked.
   - **Interactive Real-Time Steering Dial**:
     - Adjust levers at any point (on the welcome screen or the final results page):
       - *Distro Scope*: Mainstream/Flagships vs Unrestricted (All).
       - *Family Bias*: Ubuntu, Debian, Arch, Fedora/RHEL, openSUSE, Independent.
       - *Gaming Boost*: Nobara, Bazzite, CachyOS, Pop!_OS.
       - *NVIDIA Prioritization*: Pre-configured proprietary drivers & turnkey ISOs.
       - *Packaging Stance*: Avoid Snaps, prefer Flatpak/native.

3. **Verified Local Logos & Screenshots**:
   - Every logo and screenshot is downloaded into `public/assets/` and matched to a specific distro before it ships, with no hotlinks, no 429s, and no borrowing another distro's branding.
   - Logos come from Wikimedia Commons (SVG where possible); screenshots come from the distro's own DistroWatch page or Commons, with attribution shown on the profile.
   - Missing or unverifiable images fall back to a monogram tile / labelled placeholder instead of showing a wrong distro's logo.

4. **Clickable Distro Directory with Full Profiles**:
   - Every single distribution card in the Directory is now clickable and opens a real page at `/distro/<id>` (deep-linkable and back-button friendly).
   - Each profile shows a verified screenshot, DistroWatch rank, complete technical specs, hardware RAM requirements, pros & cons, related distros, and outbound download/wiki links.
   - Profiles with multiple verified screenshots (83 distros, 212 extra images) include a keyboard-accessible carousel with thumbnails and per-image credits.

5. **Enhanced Technical Comparison Tool**:
   - Two live searchable inputs with autocomplete dropdown suggestions (no more rigid dropdowns).
   - Sort suggestions by **DistroWatch Popularity**, **Distro Age**, **Last Update**, or **Alphabetical (A-Z)**.
   - Shareable comparison URLs in the form `/compare/<distro-id>+<distro-id>/`, with canonical redirects and duplicate handling.
   - Side-by-side comparison across 14 architectural and hardware dimensions.

6. **Warm Studio Design System**:
   - A warm, friendly language: stone grounds, soft white cards with gentle shadows, restrained rounded corners, plain-language labels and a single indigo action colour (`#5B4BE0`, `#A394FF` in dark mode).
   - Public Sans for interface and reading, Geist Mono only for measurements, ranks and codes.
   - Proper light and dark themes with persisted preference, visible focus, reduced-motion support and one authored view entrance.
   - Thin top loading bar and a consistent 1.6px stroke SVG icon set; no gradients, glow, emoji icons or hard offset shadows.

7. **Branching Questionnaire and Expert Path**:
   - Questions form a dialogue tree: NVIDIA driver handling is skipped for non-NVIDIA GPUs, gaming-depth questions only appear for gaming/handheld paths, and server-role questions only appear for servers.
   - A visible Newcomer / Expert switch adds kernel-policy and security-model questions without changing the newcomer flow.

8. **GDPR Compliant & Zero Data Retention**:
   - 100% client-side in-browser execution.
   - Zero tracking cookies, zero analytics, zero server logs.
   - 1-click local browser storage purge button on the Privacy page.

### Spec-based finder and compatibility check

The hero uses a ported Wayglim WebGL background, loaded as its own chunk only when the home page mounts. It pauses offscreen and respects reduced motion, with the page background as a fallback when WebGL2 is unavailable.

The welcome page also includes a hardware-first finder. Pick what you will use the computer for (gaming, development, privacy, daily use and more), choose a platform, then select a CPU through a lazy-loaded brand / generation / model cascade and a searchable GPU list. Memory is a searchable list that also accepts a custom value such as `12 GB`. The finder ranks distributions with a plain-language "Runs great" to "Not a good fit" verdict and saves the specs locally. Saved specs then power the same compatibility breakdown on every distro profile. The catalog covers 198 CPUs across Intel, AMD, Apple Silicon and ARM/SBC boards plus 101 GPUs. CPU families and the GPU catalog are loaded as separate chunks on demand, so the initial page stays small.

---

## Development & Usage

### Prerequisites
- [Bun](https://bun.sh) v1.3+ (the only supported runtime/package manager)

Install dependencies with `bun install` (uses the committed `bun.lock`).

### Running Development Server
```bash
bun run dev
```
By default, Vite runs at `http://localhost:5173/`.

### Building for Production
```bash
bun run build
```
Builds the optimized production assets into `dist/` via Vite running on the Bun runtime.

### Previewing Production Build
```bash
bun run preview
```

### Deep links / static hosting
The app uses the History API. Any host that serves `dist/index.html` for unknown
paths will work (`public/_redirects` covers Netlify and Cloudflare Pages; Vite's
preview server does this automatically). For a plain static host, configure an
SPA fallback to `index.html`.

### Routes
- `/`: welcome screen and quiz start.
- `/directory`: searchable directory of all distros.
- `/quiz`: the recommendation quiz.
- `/results`: quiz results and recommendation breakdown.
- `/distro/<id>`: full profile page (for example `/distro/linux-mint`).
- `/compare`: side-by-side comparison.
- `/compare/<a>+<b>/`: shareable comparison link (canonical form).
- Unknown paths: in-app 404 page.

### Refreshing the image library
```bash
bun scripts/find-dw-slugs.mjs      # map distro ids to DistroWatch screenshot slugs
bun scripts/verify-dw-slugs.mjs    # confirm each slug really is that distro
bun scripts/discover-assets.mjs    # search Wikimedia Commons for logos/screenshots
bun scripts/build-assets.mjs       # write scripts/asset-plan.json and review it
bun scripts/build-assets.mjs --download
bun scripts/build-facts.mjs        # refresh DistroWatch ranks, release dates, popularity years
bun scripts/build-galleries.mjs    # refresh extra verified gallery screenshots
bun scripts/validate-assets.mjs    # verify asset paths, credits, galleries, duplicates
```
Manual corrections live in `scripts/asset-overrides.json`. The download step
optimises images into `public/assets/` and regenerates `src/data/distroAssets.js`.
Missing or unverifiable images fall back to a monogram or a labelled placeholder
instead of borrowing another project's artwork.

### Trademarks and image credits
Distro names and logos are the trademarks of their respective projects and are
used here only to identify each distribution. Logos and screenshots are stored
locally with per-asset credits shown on each profile page. Sources include
Wikimedia Commons (under the licence named on the asset), DistroWatch, Simple
Icons (CC0), and official project websites/repositories. If you redistribute
this project, check the licence of each credited asset and remove any image whose
terms do not fit your use.

---

## SEO & Deployment

**LinuxMatch** is served from two domains:

- Canonical: `https://linuxmatch.adev0.eu` (all canonical tags, sitemap and JSON-LD point here)
- Cloudflare Pages mirror: `https://linuxmatch.pages.dev`

### Build

`bun run build` runs `vite build` on the Bun runtime, and the `linuxmatch-seo` Vite plugin
then emits the SEO artefacts into `dist/`:

| File | Purpose |
| --- | --- |
| `dist/index.html`, `dist/<route>/index.html` | Pre-rendered static HTML with route-specific `<title>`, meta description, keywords, canonical, Open Graph, Twitter card and JSON-LD. The SPA hydrates over it (`src/main.js` clears the static block on boot). |
| `dist/sitemap.xml` | 122 URLs: home, quiz, directory, comparison, legal pages and every distribution profile. |
| `dist/robots.txt` | Allows everything except generated `/compare/*` permutations; points at the sitemap. |
| `dist/site.webmanifest` | Installable web app metadata. |
| `dist/og-image.png` / `og-image.svg` | 1200x630 social share card. |

Structured data used: `WebSite` + `Organization` + `FAQPage` (home), `CollectionPage` +
`ItemList` (directory), `SoftwareApplication` + `BreadcrumbList` (each distro profile),
`SoftwareApplication` (quiz) and `WebApplication` (comparison).

### Cloudflare Pages settings

- Build command: `bun run build`
- Build output directory: `dist`
- `public/_headers` sets long-lived caching for hashed assets and the baseline security headers.
- `public/_redirects` keeps the SPA fallback for any path that has no pre-rendered file.

### Changing the domain

Update `SITE` in `scripts/seo-build.mjs` (primary + mirror) and rebuild - every canonical,
sitemap entry and JSON-LD URL is generated from it.
### Keyword landing pages

`src/data/landingPages.js` is the single source of truth for the landing pages; both the SPA
(`src/components/LandingView.svelte`) and the pre-render read from it, so the client-rendered
page and the static HTML always match.

| Path | Target query |
| --- | --- |
| `/linux-distributions/` | "linux distributions list", "all linux distros" |
| `/linux-distributions/{ubuntu,debian,arch,fedora-rhel,opensuse,gentoo,slackware,independent}/` | "ubuntu based linux distributions", "arch based distros", ... |
| `/linux-for-{gaming,beginners,developers,privacy,old-hardware,servers,minimal,multimedia,education,security,enterprise}/` | "best linux distro for gaming", "linux for beginners", "lightweight linux for old pcs", ... |

They are linked from the footer (Families / Use cases columns) and from the "Browse by family" /
"Browse by use case" rows on the directory page, and every one of them is in `sitemap.xml`.