# Contributing to LinuxMatch

Thanks for wanting to help. LinuxMatch is a small, focused app, and the best contributions keep it friendly, fast and honest. This guide covers setup, conventions and what a good pull request looks like.

## Ground rules

- Be kind and constructive in issues and reviews. Assume good intent.
- Keep the product principles in mind: newcomer-first clarity, ask only questions that can change the answer, show the reasoning, verify assets, and keep the app fast and accessible.
- Do not add accounts, analytics, tracking or server-side data collection. Privacy is a product feature here.

## Prerequisites

- [Bun](https://bun.sh) 1.3 or newer. Bun is the only supported runtime and package manager.
- A modern browser with WebGL2 for the animated hero (the app falls back gracefully without it).

## Local setup

```bash
git clone https://github.com/4ngel2769/distro-match.git
cd distro-match
bun install
bun run dev
```

The dev server runs at `http://localhost:5173/`.

## Before you open a pull request

Run all of these and make sure they are clean:

```bash
bun run build                       # production build must succeed
bun test                            # all tests must pass
```

Also check the following by hand:

- The change works in both light and dark themes.
- Keyboard navigation and visible focus still work.
- The change holds up on a narrow mobile viewport.
- Reduced-motion mode is respected by any new animation.
- User-facing copy contains no em dashes. Use a colon, period, comma or rewritten sentence instead.

## Code conventions

- **Framework:** Svelte 5 with runes (`$state`, `$derived`, `$derived.by`, `$effect`). Match the style of the file you are editing.
- **Icons:** use Lucide icons through `src/components/Icon.svelte` with per-icon imports. Do not generate icons or wrap them in decorative coloured containers.
- **Styling:** design tokens and global rules live in `src/styles/theme.css`. Component-specific styles stay in the component. Follow the restrained radius scale in `DESIGN.md`; do not invent new corner radii.
- **Copy:** plain language, warm but concise. No em dashes, no hype, no invented claims about testimonials, benchmarks or customers.
- **Modules:** keep data in `src/data/`, shared logic in `src/lib/`, and lazy-load large catalogs as separate chunks where practical.

## Common changes

### Adding or updating a distribution

Distribution records live in `src/data/distros.js`. Assets are verified rather than hotlinked: use the scripts in `scripts/` to find, verify and download images, and record per-asset credits. Missing or unverifiable images must fall back to a labelled tile, never to another distro's artwork. Run `bun scripts/validate-assets.mjs` after touching assets.

### Changing the hardware picker

CPU, GPU and RAM catalogs live under `src/data/hardware/`. Keep ids stable because saved specs in local storage reference them. When adding an architecture, check the platform constraints in `src/lib/specMatching.js` so handhelds still block Apple Silicon and ARM boards still only see ARM/SBC CPUs.

### Changing quiz or recommendation logic

Update the matching engines and their tests together. Question data is in `src/data/questions.js`; keep the branching rules intact so irrelevant questions stay hidden. A logic change should come with a test that proves the new ranking or filtering behaviour.

### Changing SEO or deployment

Metadata is generated in `scripts/seo-build.mjs` and `src/lib/router.js`, with keyword landing pages in `src/data/landingPages.js`. Update these together so the client-rendered page and the pre-rendered HTML agree. Rebuild and confirm the sitemap and route titles.

## Branching and commits

- Branch from `main` with a short descriptive name, for example `fix/spec-persistence` or `feat/gpu-search`.
- Make small, focused commits with imperative messages such as `Add custom RAM values to spec finder`.
- Do not commit build output (`dist/`), dependencies, logs or local environment files.

## Pull requests

A good pull request explains:

1. What changed and why.
2. How you verified it (commands and manual checks).
3. Any follow-up work or known limitations.

Link the relevant issue if there is one. Keep the diff scoped to the problem; unrelated cleanup belongs in a separate pull request.

## Questions

If you are unsure where a change belongs, open an issue first with a short description of what you want to do. That is faster for everyone than a large pull request that needs to be rewritten.
