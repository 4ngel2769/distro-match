---
version: 1
slug: "src-app-svelte"
primary_target: "src/App.svelte"
related_targets: ["src/components/DirectoryView.svelte","src/components/QuizView.svelte","src/components/ResultsView.svelte","src/components/DistroDetailPage.svelte","src/components/ComparisonView.svelte","src/components/WelcomeView.svelte","src/components/SiteFooter.svelte","src/components/Navbar.svelte"]
---

Scope: the whole LinuxMatch web experience, keyed to src/App.svelte. Visitor mode: Operate (plus the welcome surface's first decision).

Audience/job: newcomers and switchers need a low-regret distro choice; experienced users need an expert path and branching logic that never asks irrelevant questions. Action: take the finder quiz, browse/sort the directory, compare two distros. Proof/content: 116 verified distro records, local screenshots/logos with credits, transparent score breakdown. Constraints: all data, routes and behavior preserved; web; light + dark; reduced motion.

## Direction contract

THESIS: A modern field guide to Linux distributions — the interface behaves like a working tool, while the visual language is a precise specimen catalogue. It refuses the neon "terminal" aesthetic and the soft-rounded consumer-card template.

OWN-WORLD: Paper-like warm neutral grounds (light) and deep graphite grounds (dark); lime #A0F002 used only as annotation ink for selection, active state and the single primary action. Hairline rules, generous annotation margins, tabular metadata, full-bleed screenshot plates with caption strips. Type: Public Sans for UI/body, Geist Mono for measurements and codes. No decorative gradient, no glow, no emoji icons.

STORY: The visitor reads the interface like a well-labelled specimen drawer: find the family, inspect the plate, compare the measurements, understand the recommendation. Expert mode adds a denser layer of instrumentation without changing the vocabulary.

FIRST VIEWPORT: A sticky slim header with wordmark, three destinations and theme switch. Welcome: a two-column lead — a plain-language promise and primary action on the left, a live "field sheet" showing the three most-matched specimens on the right. Directory: heading and one-line purpose, a single filter bar, then a three-column specimen grid; each card is one screenshot plate with a caption strip and a compact spec table.

FORM: Field Guide (user-pinned), seed key 9392dc29. Raise from centre-rail reference setting: hairline rules and exact one-pixel state marks. Raise from Crouwel specimen: visible grid discipline and aligned columns. Raise from orienteering legend: metadata as a ranked symbol table. Raise from warm consumer app: accent reserved strictly for actionable elements. Raise from emission rail: state carried by line weight and position, not hue.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
