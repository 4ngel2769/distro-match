---
version: 2
slug: "src-app-svelte"
primary_target: "src/App.svelte"
related_targets: ["src/components/DirectoryView.svelte","src/components/QuizView.svelte","src/components/IntermissionView.svelte","src/components/ResultsView.svelte","src/components/DistroDetailPage.svelte","src/components/ComparisonView.svelte","src/components/WelcomeView.svelte","src/components/SteeringPanel.svelte","src/components/SiteFooter.svelte","src/components/Navbar.svelte"]
---

Scope: the whole LinuxMatch web experience, keyed to src/App.svelte. Visitor mode: Operate (plus the welcome surface's first decision).

Audience/job: newcomers and switchers need a low-regret distro choice; experienced users need an expert path and branching logic that never asks irrelevant questions. Action: take the finder quiz, browse/sort the directory, compare two distros. Proof/content: 116 verified distro records, local screenshots/logos with credits, transparent score breakdown. Constraints: all data, routes and behavior preserved; web; light + dark; reduced motion.

## Direction contract

THESIS: A calm, friendly studio desk for choosing a Linux distro. The interface behaves like a working tool, but it welcomes you in plain language instead of cataloguing you. It refuses both the cold specimen-drawer look it replaces and the generic soft-card template with no point of view.

OWN-WORLD: Warm stone ground (#F7F6F3) and warm charcoal ground (#16151B) with white/soft-charcoal cards, 16–24px radii and two low, offset shadows. Indigo #5B4BE0 / #A394FF is the only accent and appears strictly on actions, active choices and focus. Public Sans carries every interface phrase; Geist Mono is reserved for ranks, counts and data. No gradients, glow, emoji icons or uppercase mono headings.

STORY: The visitor understands what this is within seconds, answers a few questions that adapt to them, sees a shortlist with reasons, and can browse or compare real distributions. Expert depth is one pill-switch away. Advanced tuning hides behind a gentle "Fine-tune your results" disclosure until asked for.

FIRST VIEWPORT: A translucent sticky header with pill wordmark, pill navigation and round theme switch. Welcome: a large two-line promise with three small reassurance chips and the primary action on the right; below, "Start here" and "Good places to start" cards sit side by side, a collapsed fine-tune bar, then a three-beat "How it works" row. Directory: a friendly heading, one search field, sort pills and family pills, then a three-column grid of rounded screenshot cards with a soft scrim, caption strip and "View profile" footer. Quiz: stage pills, a thin progress bar and one generous question card with rounded option rows.

FORM: Warm Studio (user-pinned warm/friendly direction; beats the concept-seed's transit-map assignment because the brief pins warmth), seed key 2d54d959. Donation from the warm-consumer catalog world: an action-only accent and plain-language labels. Donation from the field guide it replaces: full, captioned screenshot plates and honest fallbacks.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
