<div align="center">

<img src="public/logo.png" alt="LinuxMatch" width="112" />

# LinuxMatch

**Find the Linux distribution that actually fits your machine and the way you use it.**

A friendly, private Linux distro finder. Take a short adaptive quiz, or tell LinuxMatch your CPU, GPU and RAM and see which of 116+ distributions fit, with a plain-language verdict and the reasons behind every match.

[![Live app](https://img.shields.io/badge/live-linuxmatch.adev0.eu-5B4BE0?style=for-the-badge)](https://linuxmatch.adev0.eu/)
[![Svelte 5](https://img.shields.io/badge/Svelte-5-FF3E00?style=for-the-badge&logo=svelte)](https://svelte.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite)](https://vite.dev/)
[![Bun](https://img.shields.io/badge/Bun-1.3-fbf0df?style=for-the-badge&logo=bun)](https://bun.sh/)
[![Privacy first](https://img.shields.io/badge/100%25_client--side-2EA043?style=for-the-badge)](https://linuxmatch.adev0.eu/privacy/)

[Open the app](https://linuxmatch.adev0.eu/) · [Browse the directory](https://linuxmatch.adev0.eu/directory/) · [Contributing](CONTRIBUTING.md)

</div>

---

## At a glance

| 116+ | 198 | 101 | 0 |
| :---: | :---: | :---: | :---: |
| distributions catalogued | CPUs in the picker | GPUs in the picker | trackers, accounts or analytics |

---

## Why LinuxMatch?

Picking a Linux distribution usually means reading a dozen forum threads and guessing. LinuxMatch turns that into a clear, honest answer:

- **It asks only what matters.** The questionnaire is a dialogue tree. Questions that cannot change the recommendation are skipped, and an optional expert path adds kernel and security detail without slowing newcomers down.
- **It shows its work.** Every result comes with a match score, the reasons behind it, and a diversified shortlist rather than one unexplained winner.
- **It understands your hardware.** A dedicated spec finder maps CPU, GPU and memory to architecture, driver support and RAM targets, then reuses those specs on every distro profile to answer *"Will my computer run this well?"*
- **It stays on your device.** No accounts, no analytics, no tracking cookies. Light or dark theme is remembered by one optional cookie, and any specs you save live in local storage.

---

## Features

<table>
  <tr>
    <td width="50%" valign="top">
      <strong>Adaptive finder quiz</strong><br />
      A short branching interview across three stages. Importance can be set from nice-to-have to must-have, and factual constraints act as hard filters.
    </td>
    <td width="50%" valign="top">
      <strong>Hardware-first spec finder</strong><br />
      Pick a platform and a use case, then choose a CPU from a lazy-loaded brand → generation → model cascade and a searchable GPU list. RAM accepts custom values.
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <strong>Compatibility verdicts</strong><br />
      A plain-language "Runs great" to "Not a good fit" answer, with reasons, on both the spec results and every distribution profile.
    </td>
    <td width="50%" valign="top">
      <strong>Searchable directory</strong><br />
      Search, sort and filter all 116+ distros. Typing a name ranks name matches by popularity before falling back to descriptions.
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <strong>Verified media</strong><br />
      Locally stored logos, screenshots and galleries with per-asset credits. Unverifiable images fall back to a labelled tile instead of another distro's branding.
    </td>
    <td width="50%" valign="top">
      <strong>Side-by-side comparison</strong><br />
      Compare two distributions across 14 technical dimensions via a shareable <code>/compare/&lt;a&gt;+&lt;b&gt;/</code> URL.
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <strong>Warm, accessible design</strong><br />
      Light and dark themes, restrained radii, visible focus, reduced-motion support and a single indigo accent. A liquid-glass navbar and an animated hero that pauses offscreen.
    </td>
    <td width="50%" valign="top">
      <strong>Static-friendly SEO</strong><br />
      142 pre-rendered routes with route-specific metadata, structured data, a sitemap and a generated social share image.
    </td>
  </tr>
</table>

---

## Quick start

Requires [Bun](https://bun.sh) 1.3 or newer. Bun is the only supported runtime and package manager.

```bash
git clone https://github.com/4ngel2769/distro-match.git
cd distro-match
bun install
bun run dev
```

The dev server runs at `http://localhost:5173/`.

```bash
bun run build     # production build into dist/
bun run preview   # preview that build locally
bun test          # run the test suite
```

### Static hosting

The app uses the History API. Any host that serves `dist/index.html` for unknown paths works: `public/_redirects` covers Netlify and Cloudflare Pages, and Vite's preview server does this automatically. On a plain static host, configure an SPA fallback to `index.html`.

---

## Routes

| Path | What it is |
| --- | --- |
| `/` | Welcome screen, quiz start and hardware spec finder |
| `/quiz` | Adaptive recommendation quiz |
| `/results` | Match results and scoring breakdown |
| `/directory` | Searchable, sortable distro directory |
| `/distro/<id>` | Full profile (for example `/distro/linux-mint`) |
| `/compare/<a>+<b>/` | Shareable side-by-side comparison |
| `/privacy`, `/terms` | Privacy and terms pages |
| `/linux-distributions/…`, `/linux-for-…/` | SEO landing pages by family and use case |

Unknown paths render an in-app 404 page.

---

## Project layout

```text
src/
  components/     Svelte UI (welcome, spec finder, directory, profiles, compare)
  data/           Distro catalogue, quiz questions, hardware catalogs, landing pages
  lib/            Router, matching engines, spec state, theme and Wayglim WebGL engine
  styles/         Design tokens and global theme (theme.css)
scripts/          SEO pre-render, asset discovery/verification, fact refreshes
public/           Logo, favicons, verified images and host config
tests/            Matching and swipe-deck tests
DESIGN.md         Design system reference
PRODUCT.md        Product definition and principles
CONTRIBUTING.md   How to contribute
```

---

## Privacy

LinuxMatch runs entirely in the browser. There are no accounts, no analytics and no tracking cookies. One optional cookie remembers a light or dark theme choice, and hardware specs you choose to save are kept in local storage, one set per platform. The privacy page includes a one-click local storage purge.

---

## Deployment

The default host is Cloudflare Pages. Set the build command to `bun run build` and the output directory to `dist`. `public/_headers` provides caching and baseline security headers, and `public/_redirects` keeps the SPA fallback.

`bun run build` runs `vite build`, then the `linuxmatch-seo` plugin emits pre-rendered HTML for every route plus `sitemap.xml`, `robots.txt`, `site.webmanifest` and a 1200×630 `og-image.png`. Structured data covers `WebSite`, `Organization`, `FAQPage`, `CollectionPage`, `ItemList`, `SoftwareApplication`, `WebApplication` and `BreadcrumbList`.

The canonical domain is `https://linuxmatch.adev0.eu`, with a mirror at `https://linuxmatch.pages.dev`. To change domains, update `SITE` in `scripts/seo-build.mjs` and rebuild. Keyword landing pages are defined in `src/data/landingPages.js`, which both the app and the pre-render read.

---

## Credits

Distro names and logos are trademarks of their respective projects and are used here only to identify each distribution. Logos and screenshots are stored locally with per-asset credits shown on each profile page. Sources include Wikimedia Commons (under the licence named on the asset), DistroWatch, Simple Icons (CC0) and official project sites. If you redistribute this project, check the licence of each credited asset and remove any image whose terms do not fit your use.

Built by [angeldev0](https://adev0.eu/).

---

## Contributing

Pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) for the setup, coding conventions, verification commands and review expectations before opening one.

<div align="center">

Made with care for people who just want to pick a Linux distro.

</div>
