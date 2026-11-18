<script>
  import { LINUX_DISTROS } from '../data/distros.js';
  import SteeringPanel from './SteeringPanel.svelte';
  import SwipeDeck from './SwipeDeck.svelte';
  import Icon from './Icon.svelte';

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

  function switchMode(next) {
    if (next !== expertMode && typeof onExpertModeChange === 'function') {
      onExpertModeChange();
    }
  }
</script>

<div class="page-container welcome">
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

  <div class="refine">
    <SteeringPanel {steering} {onSteeringChange} />
  </div>

  <section class="method">
    <h2>How the field is narrowed</h2>
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
    grid-template-columns: 28px minmax(0, 1fr) auto;
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

    .picks {
      position: static;
    }
  }
</style>
