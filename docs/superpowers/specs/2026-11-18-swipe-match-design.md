# Design: Swipe-to-Match Discovery Mode

Date: 2026-11-18
Status: awaiting spec review

## Context and intent

LinuxMatch currently opens on a static welcome hero that leads into a 16-question questionnaire. The user wants the first experience to be a Tinder-like swipe deck of **real distro profiles**, with playful trait signals drawn from real catalogue fields, while keeping the questionnaire as an explicit alternative. Swiping must build a live shortlist that feeds the existing recommendation engine, not a separate scoring system.

References: `https://feralui.dev/` (playful, physics-driven elements) and `https://reactdrops.dev/components/gallery/fan-gallery` (spring card fan). These are inspiration for motion and card staging only; no React code or dependencies are copied.

## Goals

- Replace the welcome hero with an endless swipe deck as the default first experience.
- Right swipe = interested; left swipe = not for me. Build a live “Your picks” rail.
- Present each distro with honest, game-like trait signals (e.g. “Great for newcomers”, “Gaming-ready”, “Libre purist”) derived from existing data.
- Reuse the existing `MatchingEngine`, `ResultsView`, routes and distro data.
- Keep the Field Guide design language, both themes, keyboard access and reduced-motion support.

## Non-goals

- No new package manager, framework or runtime dependency.
- No new top-level route or nav item (the questionnaire stays the alternative inside the hero).
- No invented claims, ratings or testimonials. Trait signals are derived from real fields.
- No changes to the question set, hard filters or result layout beyond the optional `likes` input.

## Architecture

### New files

- `src/components/SwipeDeck.svelte` — owns deck state, filters, drag/swipe gestures, card fan, undo/reset and the picks rail.
- `src/lib/swipeTraits.js` — pure `traitSignals(distro)` mapper from catalogue fields to a short list of labels with a tone/role. No UI code, no hard-coded distro IDs where a field can be used.

### Modified files

- `src/components/WelcomeView.svelte` — hero becomes the swipe deck; questionnaire moves to a clearly visible alternative control; the existing field-sheet area becomes the live picks rail. Steering panel and methodology remain below.
- `src/lib/matchingEngine.js` — `evaluate(userAnswers, questionWeights, steering, options = {})` accepts `options.likes = []`. A liked distro gets a transparent `+0.06` satisfaction adjustment and a “You liked this in the swipe deck” reason. Existing scoring, hard filters and diversification are unchanged when `likes` is empty.
- `src/components/ResultsView.svelte` — optional `likes` prop forwarded to `MatchingEngine.evaluate`, plus a small “from your swipes” context line when likes exist. No layout rewrite.
- `src/App.svelte` — owns `swipeLikes` state, passes it to `ResultsView`, and clears it when the questionnaire is started normally.
- `src/data/questions.js` — no changes.

### Data flow

1. `SwipeDeck` derives its pool from `LINUX_DISTROS` filtered by scope/family/use case; it cycles the pool endlessly and excludes cards already swiped in the current round until reset.
2. `traitSignals(distro)` returns labels from real fields: `userLevel`, `primaryUseCases`, `specialFeatures`, `freeSoftwareStrictness`, `releaseModel`, `initSystem`, `hardwareSpec`, `desktopEnvironments`, `family`, `architectures`, `gpuSupport`.
3. Right swipe pushes the distro id to `App.swipeLikes`; left swipe discards it. Undo pops the last action; reset clears actions and rebuilds the deck.
4. “See matches” navigates to `/results/` with the existing quiz answers (empty if the user never took the quiz) and passes `swipeLikes`, so `MatchingEngine` ranks liked distros first and still explains why.

## Interaction and visual design

- Three-card fan: active card plus two staged cards behind it, using CSS transforms with spring-like easing. Drag tilts the active card; release past a threshold flies it out, otherwise it springs back.
- Equivalent controls: “Not for me” / “Interested” buttons and `←` / `→` keys. Pointer and touch drag both supported. Undo and reset are quiet text controls.
- Trait signals appear as restrained lime-edged labels inside the card caption strip, not loud badges. Card remains a Field Guide specimen plate: full screenshot, logo, name, tagline, rank and 2–3 mono specs.
- Picks rail: tabular field sheet with count, ranked list of liked distros and a “See matches” action.
- Filters: compact toolbar (scope, family, use case) above the deck.
- Reduced motion: no fan fly-out or spring; cards advance instantly. Focus rings, aria labels and 4.5:1 contrast in both themes are required.

## Testing

- `bun run build` and `node scripts/validate-assets.mjs`.
- Browser QA at 390px and 1440px in light and dark themes: drag, buttons, keyboard, threshold spring-back, undo, reset, filters, endless cycling, picks rail, results navigation, reduced motion, zero console errors, zero horizontal overflow.
- Unit-level check that `traitSignals` returns only labels supported by real distro fields and that `MatchingEngine.evaluate(..., { likes: [] })` is byte-for-byte equivalent to the current behavior.

## Risks and mitigations

- **Deck bias:** showing popular distros first could flatten discovery. Mitigation: the default pool is diversified by family and tier, and filters let users reach niche sets.
- **Empty answers at results:** a swipe-only user has no questionnaire answers. Mitigation: `MatchingEngine` already handles empty answers via priors; liked distros get the explicit boost and reasons, and results remain honest about confidence.
- **Gesture accessibility:** drag-only interaction would exclude keyboard/touch users. Mitigation: buttons and arrow keys are first-class controls, not fallbacks.
