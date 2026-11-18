<script>
  import { LINUX_DISTROS } from '../data/distros.js';
  import SteeringPanel from './SteeringPanel.svelte';
  import SwipeDeck from './SwipeDeck.svelte';
  import Icon from './Icon.svelte';

  // Swipe discovery is built but parked for now; the finder quiz is the default
  // first experience. Flip this to true to restore the swipe deck as the hero.
  const ENABLE_SWIPE_DECK = false;

  const FEATURED_IDS = ['linux-mint', 'fedora-workstation', 'arch-linux'];
  const featured = FEATURED_IDS
    .map((id) => LINUX_DISTROS.find((distro) => distro.id === id))
    .filter(Boolean);

  let {
    onStartQuiz,
    onNavigate,
    steering = {},
    onSteeringChange,
    expertMode = false,
    onExpertModeChange,
    likes = [],
    passes = [],
    onSwipeLike = () => {},
    onSwipePass = () => {},
    onSwipeUndo = () => {},
    onSwipeReset = () => {}
  } = $props();

  let likedDistros = $derived(
    likes
      .map((id) => LINUX_DISTROS.find((distro) => distro.id === id))
      .filter(Boolean)
  );

  function prettyModel(model) {
    if (!model) return '—';
    return String(model)
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('-');
  }

  function switchMode(next) {
    if (next !== expertMode && typeof onExpertModeChange === 'function') {
      onExpertModeChange();
    }
  }
</script>

<div class="page-container welcome">
  {#if ENABLE_SWIPE_DECK}
  <header class="hero-head">
    <div>
      <h1>Find your match, one distro at a time.</h1>
      <p>
        Swipe through real distributions, keep the ones that fit and let the field guide
        rank your shortlist. {LINUX_DISTROS.length} verified specimens to explore.
      </p>
    </div>
    <button class="btn-secondary" onclick={onStartQuiz}>
      Take the questionnaire instead <Icon name="arrow-right" size={14} />
    </button>
  </header>

  <div class="lead">
    <SwipeDeck
      distros={LINUX_DISTROS}
      {likes}
      {passes}
      onLike={onSwipeLike}
      onPass={onSwipePass}
      onUndo={onSwipeUndo}
      onReset={onSwipeReset}
      onSeeMatches={() => onNavigate('results')}
    />

    <aside class="picks surface" aria-label="Your liked distributions">
      <div class="sheet-head">
        <span class="field-label">Your picks</span>
        <span class="field-value sheet-code">{String(likedDistros.length).padStart(2, '0')} / {LINUX_DISTROS.length}</span>
      </div>

      {#if likedDistros.length}
        <ol class="pick-list">
          {#each likedDistros as distro, i}
            <li class="pick-row">
              <span class="field-value pick-rank">{String(i + 1).padStart(2, '0')}</span>
              <span class="pick-name">{distro.name}</span>
              <span class="field-value pick-family">{distro.family}</span>
              <span class="field-value pick-rank">#{distro.dwRank || '—'}</span>
            </li>
          {/each}
        </ol>
      {:else}
        <p class="picks-empty">
          Swipe right on a specimen to keep it here. Nothing is added until you do.
        </p>
      {/if}

      <div class="picks-actions">
        <button
          class="btn-primary"
          onclick={() => onNavigate('results')}
          disabled={!likedDistros.length}
        >
          See matches <Icon name="arrow-right" size={14} />
        </button>
        <button class="quiet-link" onclick={() => onNavigate('directory')}>
          Browse the full catalogue <Icon name="chevron-right" size={13} />
        </button>
        <button class="quiet-link" onclick={() => onNavigate('compare')}>
          Compare two distributions <Icon name="arrow-right" size={13} />
        </button>
      </div>

      <div class="mode-block">
        <span class="field-label">Questionnaire mode</span>
        <div class="mode-switch" role="group" aria-label="Questionnaire mode">
          <button
            type="button"
            class:active={!expertMode}
            aria-pressed={!expertMode}
            onclick={() => switchMode(false)}
          >Newcomer</button>
          <button
            type="button"
            class:active={expertMode}
            aria-pressed={expertMode}
            onclick={() => switchMode(true)}
          >Expert</button>
        </div>
        <p class="mode-note">Expert adds kernel and security questions and skips beginner framing.</p>
      </div>
    </aside>
  </div>
  {:else}
  <header class="hero-head">
    <div>
      <h1>Find a Linux distro that actually fits.</h1>
      <p>
        A short, focused questionnaire maps your hardware, work and principles to a
        verified catalogue of {LINUX_DISTROS.length} distributions — then shows the
        shortlist and the reasoning behind it.
      </p>
    </div>
    <button class="btn-secondary" onclick={() => onNavigate('compare')}>
      Compare two distributions <Icon name="arrow-right" size={14} />
    </button>
  </header>

  <div class="lead">
    <section class="promise surface" aria-label="Finder questionnaire">
      <span class="field-label">Finder questionnaire</span>
      <p class="promise-copy">
        Sixteen pinpoint questions across three short stages. The path branches around
        questions that do not apply to you, and expert users can switch to a deeper track.
      </p>

      <div class="actions">
        <button class="btn-primary" onclick={onStartQuiz}>
          Find my distro <Icon name="arrow-right" size={14} />
        </button>
        <button class="btn-secondary" onclick={() => onNavigate('directory')}>
          Browse the catalogue <Icon name="chevron-right" size={14} />
        </button>
      </div>

      <div class="mode-block">
        <span class="field-label">Questionnaire mode</span>
        <div class="mode-switch" role="group" aria-label="Questionnaire mode">
          <button
            type="button"
            class:active={!expertMode}
            aria-pressed={!expertMode}
            onclick={() => switchMode(false)}
          >Newcomer</button>
          <button
            type="button"
            class:active={expertMode}
            aria-pressed={expertMode}
            onclick={() => switchMode(true)}
          >Expert</button>
        </div>
        <p class="mode-note">Expert adds kernel and security questions and skips beginner framing.</p>
      </div>
    </section>

    <section class="field-sheet surface" aria-label="Reference specimens">
      <div class="sheet-head">
        <span class="field-label">Field sheet</span>
        <span class="field-value sheet-code">03 / {LINUX_DISTROS.length}</span>
      </div>
      <p class="sheet-intro">Three reference specimens drawn from the catalogue.</p>

      <div class="spec-head" aria-hidden="true">
        <span class="field-label">Specimen</span>
        <span class="field-label">Family</span>
        <span class="field-label">Release</span>
        <span class="field-label rank-col">Rank</span>
      </div>
      <div class="spec-rows">
        {#each featured as distro}
          <div class="spec-row">
            <span class="spec-name">{distro.name}</span>
            <span class="field-value spec-family">{distro.family}</span>
            <span class="field-value spec-release">{prettyModel(distro.releaseModel)}</span>
            <span class="field-value rank-col">#{distro.dwRank}</span>
          </div>
        {/each}
      </div>
      <div class="caption-strip">
        <span><strong>Ranks</strong> DistroWatch, current</span>
        <span><strong>Fields</strong> name · family · release · rank</span>
      </div>
    </section>
  </div>
  {/if}

  <div class="refine">
    <SteeringPanel {steering} {onSteeringChange} />
  </div>

  <section class="method">
    <h2>How the field is narrowed</h2>
    {#if ENABLE_SWIPE_DECK}
      <p>
        Every card shows a real distribution with its traits drawn from the catalogue —
        release model, init system, package tooling, hardware target and philosophy.
        Your right-swipes are the specimens you want the engine to favour.
      </p>
      <p>
        The result ranks your picks first, then shows the reasoning and trade-offs. If you
        prefer a precise interview, the questionnaire asks only the questions that can
        change the answer, with an expert path for experienced users.
      </p>
    {:else}
      <p>
        Each question maps to a real catalogue field — graphics support, memory budget,
        update cadence, init system, software freedom, desktop style and package tooling.
        Questions that cannot change the answer are skipped automatically.
      </p>
      <p>
        After each short stage you get a report of the current front-runners. The final
        result shows the score breakdown, the trade-offs you accepted and a diversified
        shortlist — not a single asserted winner.
      </p>
    {/if}
  </section>
</div>

<style>
  .welcome {
    max-width: 1160px;
    margin: 0 auto;
  }

  .hero-head {
    display: flex;
    justify-content: space-between;
    align-items: end;
    flex-wrap: wrap;
    gap: var(--space-5);
    margin-bottom: var(--space-6);
  }

  .hero-head h1 {
    font-size: clamp(1.8rem, 3.4vw, 2.5rem);
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.02em;
    max-width: 24ch;
    margin-bottom: var(--space-3);
  }

  .hero-head p {
    font-size: 1rem;
    color: var(--text-muted);
    max-width: 64ch;
    line-height: 1.6;
  }

  .lead {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.85fr);
    gap: var(--space-6);
    align-items: start;
    margin-bottom: var(--space-7);
  }

  .promise {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-6);
  }

  .promise-copy {
    font-size: 0.96rem;
    color: var(--text-muted);
    max-width: 62ch;
    line-height: 1.6;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  .field-sheet {
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 80px;
  }

  .sheet-intro {
    padding: var(--space-4) var(--space-5);
    font-size: 0.88rem;
    color: var(--text-muted);
    max-width: 56ch;
  }

  .spec-head,
  .spec-row {
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1fr) auto;
    gap: var(--space-3);
    align-items: baseline;
    padding: var(--space-3) var(--space-5);
  }

  .spec-head {
    padding-top: var(--space-2);
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--border-color);
  }

  .spec-row {
    border-bottom: 1px solid var(--hairline);
    font-size: 0.88rem;
  }

  .spec-name {
    font-weight: 600;
  }

  .spec-family,
  .spec-release {
    font-size: 0.72rem;
    color: var(--text-muted);
  }

  .rank-col {
    text-align: right;
  }

  .picks {
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 80px;
  }

  .sheet-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-5);
    border-bottom: 1px solid var(--border-color);
    background-color: var(--bg-secondary);
  }

  .sheet-code {
    font-size: 0.72rem;
    color: var(--text-subtle);
  }

  .pick-list {
    list-style: none;
    max-height: 340px;
    overflow-y: auto;
  }

  .pick-row {
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr) auto auto;
    align-items: baseline;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-5);
    border-bottom: 1px solid var(--hairline);
    font-size: 0.88rem;
  }

  .pick-rank {
    font-size: 0.7rem;
    color: var(--text-subtle);
  }

  .pick-name {
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pick-family {
    font-size: 0.7rem;
    color: var(--text-subtle);
  }

  .picks-empty {
    padding: var(--space-5);
    font-size: 0.88rem;
    color: var(--text-muted);
    line-height: 1.55;
  }

  .picks-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
    padding: var(--space-4) var(--space-5);
  }

  .picks-actions .btn-primary {
    width: 100%;
  }

  .quiet-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 0;
    border: 0;
    background: transparent;
    color: var(--text-muted);
    font-size: 0.8rem;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .quiet-link:hover {
    color: var(--text-main);
  }

  .mode-block {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    border-top: 1px solid var(--border-color);
    padding: var(--space-4) var(--space-5);
  }

  .mode-switch {
    display: inline-flex;
    border: 1px solid var(--border-color);
    background-color: var(--bg-secondary);
  }

  .mode-switch button {
    border: 0;
    background: transparent;
    color: var(--text-muted);
    font-family: var(--font-sans);
    font-size: 0.8rem;
    font-weight: 600;
    padding: 7px 14px;
  }

  .mode-switch button + button {
    border-left: 1px solid var(--border-color);
  }

  .mode-switch button.active {
    background-color: var(--card-bg);
    color: var(--text-main);
    box-shadow: inset 0 -2px 0 var(--accent-fill);
  }

  .mode-note {
    font-size: 0.76rem;
    color: var(--text-subtle);
    line-height: 1.45;
  }

  .refine {
    margin-bottom: var(--space-6);
  }

  .method {
    border-top: 1px solid var(--border-color);
    padding-top: var(--space-5);
  }

  .method h2 {
    font-size: 1.15rem;
    font-weight: 700;
    margin-bottom: var(--space-3);
  }

  .method p {
    color: var(--text-muted);
    font-size: 0.94rem;
    line-height: 1.6;
    max-width: 72ch;
    margin-bottom: var(--space-2);
  }

  @media (max-width: 900px) {
    .lead {
      grid-template-columns: 1fr;
    }

    .picks,
    .field-sheet {
      position: static;
    }

    .promise {
      padding: var(--space-5);
    }
  }
</style>
