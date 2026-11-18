# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: people new to Linux or switching from Windows/macOS who need a confident, low-regret distribution choice.
Secondary: experienced Linux users who want to compare technical trade-offs (init system, package manager, release model, philosophy). The experience must offer an explicit expert mode/path for them without burdening newcomers.

## Product Purpose

LinuxMatch helps a visitor triangulate one Linux distribution that fits their hardware, values and workflow, or browse/compare a verified catalogue of 116+ distributions. Success is a visitor who understands *why* a recommendation fits and can act on it (open the profile, compare, or download).

## Positioning

The product's differentiator is a transparent triangulation engine: answers map to real catalogue fields, factual constraints act as hard filters, and the result explains the score, trade-offs and a diversified shortlist rather than asserting a single winner. (Inferred from the shipped quiz/engine; not separately confirmed by the user.)

## Operating Context

Web app used in a browser. Three main jobs: take the finder questionnaire, browse/search/sort the directory, and compare two distros side by side. All data is local and client-side; no accounts or telemetry.

## Capabilities and Constraints

- Preserve all data, routes and behavior: 116 distributions, verified local logos/screenshots/galleries, quiz logic, `/distro/<id>`, `/compare/<a>+<b>/`, directory sorting, SEO pre-rendered routes.
- Questionnaire must branch like a dialogue tree: skip questions made irrelevant by earlier answers (e.g. never ask NVIDIA driver handling after a non-NVIDIA GPU is chosen; don't ask gaming questions for an expert who wants a server distro).
- Provide an expert mode/path for advanced users alongside the newcomer-first flow.
- Stack (confirmed by repository): Svelte 5 + Vite, Bun as package manager/runtime.

## Brand Commitments

Name: LinuxMatch. Author credit: angeldev0 / https://adev0.eu. The user explicitly wants a clean, user-friendly interface with a real design language, proper dark/light modes, intentional animations and coherent typography. Lime `#A0F002` is the incumbent accent but is not pinned as a permanent brand constraint for this redesign.

## Evidence on Hand

`src/data/distros.js` (116 distro records), `public/assets/` (114 logos, 114 screenshots, 212 gallery images with credits), `src/data/questions.js`, `src/lib/matchingEngine.js`, README.md, existing Svelte components. No testimonials, customers, pricing or benchmark claims exist; do not invent them.

## Product Principles

- Newcomer-first clarity; expert depth available on demand.
- Ask only questions that can change the answer.
- Show the reasoning, not just the verdict.
- Verified assets and honest fallbacks over decorative filler.
- Keep the web fast, accessible and device-agnostic.

## Accessibility & Inclusion

Keyboard operation, visible focus, contrast in both themes, reduced-motion support and readable small text are required for this redesign (inferred from product context and prior QA).
