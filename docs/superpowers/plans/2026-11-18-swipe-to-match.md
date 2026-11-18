# Swipe-to-Match Discovery Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the welcome hero with an endless, filterable swipe deck of real distro profiles whose likes feed the existing recommendation engine as a live shortlist.

**Architecture:** A pure trait mapper derives game-like labels from real catalogue fields; a Svelte `SwipeDeck` owns deck/filter/gesture state and emits like/pass/undo/reset events; `WelcomeView` renders the deck plus a live picks rail. `MatchingEngine.evaluate` gains an optional `likes` input that boosts liked distros and records a reason, leaving all other scoring unchanged. `ResultsView` forwards likes and shows a short context line.

**Tech Stack:** Svelte 5 runes, Vite 8, Bun 1.3, existing CSS tokens in `src/styles/theme.css`, `bun test` (Node/Bun built-in test runner). No new runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-11-18-swipe-match-design.md`

## Global Constraints

- Keep all 116 distro records, every route, the questionnaire and the existing result layout intact.
- No new dependencies; no React code; inspiration only from feralui.dev and the Fan Gallery motion vocabulary.
- Trait signals must come from real distro fields only; never invent claims, ratings or testimonials.
- Field Guide design language: paper/graphite grounds, hairline rules, full screenshot plates, caption strips, tabular mono metadata, lime used only for actions/selection.
- Both themes, visible focus, keyboard control and `prefers-reduced-motion` are required.
- `MatchingEngine.evaluate` behavior must be unchanged when `likes` is omitted or empty.

## Review Focus

- **Swipe-only user has no questionnaire answers** — results must still rank liked distros and explain why. Test: Task 2 engine test with empty answers + likes; Task 5 browser QA.
- **Invented trait claims** — labels must map to real fields, not cuisine-style guesses. Test: Task 1 `traitSignals` tests including an empty/unknown record.
- **Endless cycling must not repeat swiped cards until reset** — otherwise duplicate cards erode trust. Test: Task 3 browser QA across more swipes than the filtered pool.
- **Undo/reset and keyboard parity with drag** — gesture-only control would exclude keyboard users. Test: Task 3 browser QA with buttons and arrow keys.
- **Reduced motion and both themes at 390px/1440px** — no fly-out, no overflow, no contrast regression. Test: Task 5 browser QA.

---

### Task 1: Trait signal mapper

**Files:**
- Create: `src/lib/swipeTraits.js`
- Test: `tests/swipeTraits.test.js`

**Interfaces:**
- Consumes: distro records from `src/data/distros.js` shape (fields only; no import needed in the helper).
- Produces: `traitSignals(distro) -> Array<{ label: string, tone: 'accent' | 'neutral' }>`, maximum 3 entries, ordered by specificity.

- [ ] **Step 1: Write failing tests**

Create `tests/swipeTraits.test.js` using `bun:test`. Assert:
- a beginner-level distro with `primaryUseCases: ['gaming']` returns a label containing "newcomer" or "beginner" and a gaming label;
- `freeSoftwareStrictness: '100-libre-fsf'` returns a libre/purist label;
- `initSystem: 'openrc'` (or other non-systemd) returns a non-systemd label;
- `hardwareSpec: 'potatoes-vintage'` returns an old-hardware label;
- `releaseModel: 'rolling'` returns a rolling label;
- an object `{}` returns `[]`;
- every returned object has only `label` and `tone`, with `tone` in `['accent','neutral']`, and the array length is ≤ 3.

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test tests/swipeTraits.test.js`
Expected: FAIL — module `src/lib/swipeTraits.js` not found.

- [ ] **Step 3: Implement `traitSignals(distro)`**

In `src/lib/swipeTraits.js`, derive labels from existing fields only (`userLevel`, `primaryUseCases`, `specialFeatures`, `freeSoftwareStrictness`, `releaseModel`, `initSystem`, `hardwareSpec`, `desktopEnvironments`, `family`, `architectures`, `gpuSupport`). Use a small ordered rule table; stop at 3 labels. Return `{ label, tone }` with `tone: 'accent'` for the most distinctive signal and `'neutral'` for the rest. No hard-coded distro ids.

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test tests/swipeTraits.test.js`
Expected: PASS (all assertions).

- [ ] **Step 5: Commit**

```bash
git add src/lib/swipeTraits.js tests/swipeTraits.test.js
git commit -m "feat: derive swipe trait signals from distro data"
```

---

### Task 2: Optional likes in the matching engine

**Files:**
- Modify: `src/lib/matchingEngine.js` — `evaluate` signature and scoring block
- Test: `tests/matchingEngine.likes.test.js`

**Interfaces:**
- Consumes: `EvaluatingEngine.evaluate(userAnswers, questionWeights, steering)` current signature.
- Produces: `MatchingEngine.evaluate(userAnswers, questionWeights, steering, { likes = [] } = {})`. With likes, liked distros get `+0.06` satisfaction and a reason string exactly `"You liked this in the swipe deck"`.

- [ ] **Step 1: Write failing tests**

Create `tests/matchingEngine.likes.test.js` using `bun:test`. Assert:
- `evaluate(answers, {}, {})` and `evaluate(answers, {}, {}, { likes: [] })` produce identical `matchPercentage` and `disqualifiers` for every distro;
- for a sample answer set, `evaluate(answers, {}, {}, { likes: ['linux-mint'] })` gives Linux Mint a strictly higher `matchPercentage` than the baseline and includes `"You liked this in the swipe deck"` in its `matchReasons`;
- a disliked-but-liked distro that fails a hard filter remains `disqualified === true`;
- `recommend()` still returns at most 2 distros per family with likes present.

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test tests/matchingEngine.likes.test.js`
Expected: FAIL — fourth argument ignored.

- [ ] **Step 3: Implement the `likes` option**

Extend `evaluate` to take a fourth `options = {}` parameter, read `const likes = options.likes || []`, and after existing `steeringAdjustment`/priors add `distro.id in likes ? 0.06 : 0` to satisfaction. Append the reason string to `matchReasons` for liked distros. Do not change hard-filter, confidence or diversification logic.

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test tests/matchingEngine.likes.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/matchingEngine.js tests/matchingEngine.likes.test.js
git commit -m "feat: let swipe likes boost matching engine results"
```

---

### Task 3: Swipe deck component

**Files:**
- Create: `src/components/SwipeDeck.svelte`

**Interfaces:**
- Consumes: `distros` (array of catalogue records), `likes` and `passes` (arrays of ids), and callbacks `onLike(id)`, `onPass(id)`, `onUndo()`, `onReset()`, `onSeeMatches()`.
- Produces: rendered deck, filter toolbar, four controls (pass button, like button, undo, reset), and a "See matches" button. No internal navigation.

- [ ] **Step 1: Implement deck state and filters**

In `SwipeDeck.svelte`: derive the pool from `distros` with three `<select>` filters (scope: all/flagship/specialist/niche; family; use case). Maintain a `seen` set from `likes` + `passes`; cycle the filtered pool endlessly, skipping seen ids until every filtered distro has been seen or filters/reset change. Keep the active card plus two staged cards behind it.

- [ ] **Step 2: Implement gestures and equivalent controls**

Pointer/touch drag on the active card applies translate/rotate; passing 96px horizontally triggers like/pass, otherwise it springs back. Add "Not for me" / "Interested" buttons and `ArrowLeft` / `ArrowRight` keyboard handlers calling the same callbacks. Add undo and reset controls. On `prefers-reduced-motion`, skip transform transitions and advance immediately.

- [ ] **Step 3: Render the Field Guide card**

Card shows full screenshot plate, logo, name, tier, tagline, rank, 2–3 mono specs, and trait signals from `traitSignals(distro)` as restrained lime-edged labels. Use only CSS variables from `theme.css` and `Icon.svelte` for icons.

- [ ] **Step 4: Verify in browser**

Run `bun run dev`, open `/`, and confirm: drag past threshold advances, below threshold springs back, buttons and arrow keys work, undo restores the last card, reset rebuilds the deck, filters change the pool, and the same card does not repeat before the pool is exhausted. Check 390px and 1440px, light and dark, with no console errors or horizontal overflow.

- [ ] **Step 5: Commit**

```bash
git add src/components/SwipeDeck.svelte
git commit -m "feat: add swipe deck with filters and keyboard controls"
```

---

### Task 4: Hero integration and live picks rail

**Files:**
- Modify: `src/components/WelcomeView.svelte`
- Modify: `src/App.svelte`
- Modify: `src/components/ResultsView.svelte`

**Interfaces:**
- Consumes: `SwipeDeck` callbacks from Task 3 and `MatchingEngine.evaluate(..., { likes })` from Task 2.
- Produces: `App.swipeLikes` and `App.swipePasses` state; `ResultsView` accepts `likes = []`; welcome offers "Take the questionnaire" as a visible alternative.

- [ ] **Step 1: Add App state**

In `App.svelte`, add `let swipeLikes = $state([])` and `let swipePasses = $state([])`. Add handlers that append/remove ids and clear both arrays in `handleStartQuiz`. Extend the existing `hasAnswers` derived value so `swipeLikes.length > 0` also permits `/results/` (otherwise the route guard sends swipe-only users back to welcome). Pass `likes={swipeLikes}` to `ResultsView`.

- [ ] **Step 2: Replace the welcome hero**

In `WelcomeView.svelte`, replace the current promise column with `SwipeDeck`, passing `distros={LINUX_DISTROS}`, the new state and callbacks. Keep the wizard/page-container motion. Convert the existing field-sheet column into a live "Your picks" rail: count, ranked list of liked distro names with family/rank, and a "See matches" action calling `onNavigate('results')` (guarded so it is disabled with zero likes). Add a visible "Take the questionnaire instead" button calling `onStartQuiz`. Keep steering panel and methodology below.

- [ ] **Step 3: Forward likes into results**

In `ResultsView.svelte`, add `likes = []` prop, pass `{ likes }` as the fourth argument to `MatchingEngine.evaluate`, and show a one-line context note when `likes.length > 0` (for example "Ranked from your swipe picks — answer the questionnaire for a more precise fit."). Do not change the result layout otherwise.

- [ ] **Step 4: Verify the full flow**

Run `bun run build`; open `/`, swipe three distros, confirm the picks rail updates, click "See matches", confirm `/results/` ranks liked distros first with the swipe reason, then confirm "Take the questionnaire" starts a fresh quiz with likes cleared and results unaffected.

- [ ] **Step 5: Commit**

```bash
git add src/App.svelte src/components/WelcomeView.svelte src/components/ResultsView.svelte
git commit -m "feat: wire swipe deck into welcome and results"
```

---

### Task 5: Full QA and design documentation

**Files:**
- Modify: `DESIGN.md`
- Modify: `.impeccable/design.json`
- Modify: `README.md`

**Interfaces:**
- Consumes: all previous tasks.
- Produces: documented Swipe Deck component and updated usage notes.

- [ ] **Step 1: Extend design documentation**

Add a "Swipe Deck" component entry to `DESIGN.md` and `.impeccable/design.json` matching the shipped card/trait-label styling. Add a short README note about the default swipe flow and the questionnaire alternative.

- [ ] **Step 2: Run the full verification set**

Run `bun run build`, `bun test`, `node scripts/validate-assets.mjs`, and the mechanical design detector (`impeccable.cmd detect --json src` in this environment). Expected: all pass with no findings.

- [ ] **Step 3: Browser QA across the review-focus inputs**

At 390px and 1440px, in both themes, with normal and reduced motion: verify empty-answer swipe results, endless-no-repeat cycling, undo/reset, keyboard parity, filters, and zero console errors/overflow. Fix any issues found in one batch.

- [ ] **Step 4: Commit**

```bash
git add DESIGN.md .impeccable/design.json README.md
git commit -m "docs: document swipe discovery flow and verify"
```
