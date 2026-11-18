<script>
  import { LINUX_DISTROS } from '../data/distros.js';
  import SteeringPanel from './SteeringPanel.svelte';
  import SwipeDeck from './SwipeDeck.svelte';
  import DistroLogo from './DistroLogo.svelte';
  import Icon from './Icon.svelte';

  // Swipe discovery is built but parked for now; the finder quiz is the default
  // first experience. Flip this to true to restore the swipe deck as the hero.
  let ENABLE_SWIPE_DECK = $state(false);

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
    <div class="hero-copy">
      <h1>Find a Linux distro that feels like yours.</h1>
      <p>
        Answer a few quick questions about what you do and what you care about. We'll
        match them to real distributions — and show you exactly why each one fits.
      </p>
      <div class="hero-meta">
        <span class="meta-chip"><Icon name="check" size={13} /> About 3 minutes</span>
        <span class="meta-chip"><Icon name="check" size={13} /> No sign-up or tracking</span>
        <span class="meta-chip"><Icon name="check" size={13} /> {LINUX_DISTROS.length} real distros</span>
      </div>
    </div>
    <div class="hero-actions">
      <button class="btn-primary hero-cta" onclick={onStartQuiz}>
        Find my distro <Icon name="arrow-right" size={16} />
      </button>
      <button class="btn-secondary" onclick={() => onNavigate('directory')}>
        Browse all distributions
      </button>
    </div>
  </header>

  <div class="lead">
    <section class="start-card surface" aria-label="Get started">
      <h2>Start here</h2>
      <p class="start-copy">
        A short questionnaire maps your hardware, work and principles to the catalogue.
        It skips anything that can't change the answer, so you only answer what matters.
      </p>
      <div class="actions">
        <button class="btn-primary" onclick={onStartQuiz}>
          Take the questionnaire <Icon name="arrow-right" size={15} />
        </button>
        <button class="btn-secondary" onclick={() => onNavigate('compare')}>
          Compare two distros
        </button>
      </div>

      <div class="mode-block">
        <div class="mode-copy">
          <span class="mode-title">How deep should we go?</span>
          <p class="mode-note">
            Newcomer keeps things simple. Expert adds kernel, security and release-model questions.
          </p>
        </div>
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
      </div>
    </section>

    <section class="starter-card surface" aria-label="Good places to start">
      <div class="starter-head">
        <h2>Good places to start</h2>
        <p>Three popular distributions from the catalogue.</p>
      </div>
      <div class="starter-list">
        {#each featured as distro}
          <button class="starter-row" onclick={() => onNavigate('distro', distro.id)}>
            <DistroLogo distro={distro} size={38} decorative={true} />
            <span class="starter-text">
              <strong>{distro.name}</strong>
              <small>{distro.family} · {prettyModel(distro.releaseModel)} · #{distro.dwRank}</small>
            </span>
            <Icon name="chevron-right" size={15} />
          </button>
        {/each}
      </div>
      <p class="starter-foot">Every pick is a real, verified distribution — no invented suggestions.</p>
    </section>
  </div>
  {/if}

  <div class="refine">
    <SteeringPanel {steering} {onSteeringChange} startOpen={false} />
  </div>

  <section class="method surface">
    <h2>How it works</h2>
    <div class="method-steps">
      <div class="method-step">
        <span class="step-num">1</span>
        <div>
          <h3>Answer a few questions</h3>
          <p>
            Each answer maps to a real detail in the catalogue — graphics support, memory,
            update pace, desktop style and more. Questions that can't change the result
            are skipped automatically.
          </p>
        </div>
      </div>
      <div class="method-step">
        <span class="step-num">2</span>
        <div>
          <h3>See your shortlist</h3>
          <p>
            After each short stage you get a quick check-in with the current front-runners.
            You can change any answer before you finish.
          </p>
        </div>
      </div>
      <div class="method-step">
        <span class="step-num">3</span>
        <div>
          <h3>Understand the why</h3>
          <p>
            The final result shows the score breakdown, the trade-offs you accepted and
            a few alternatives — not just one asserted winner.
          </p>
        </div>
      </div>
    </div>
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
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-6);
    margin-bottom: var(--space-7);
  }

  .hero-copy {
    flex: 1 1 520px;
  }

  .hero-head h1 {
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 750;
    line-height: 1.12;
    letter-spacing: -0.03em;
    max-width: 20ch;
    margin-bottom: var(--space-4);
    text-wrap: balance;
  }

  .hero-head p {
    font-size: 1.05rem;
    color: var(--text-muted);
    max-width: 60ch;
    line-height: 1.65;
  }

  .hero-meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: var(--space-5);
  }

  .meta-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-muted);
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-pill);
    box-shadow: var(--shadow-subtle);
  }

  .meta-chip :global(svg) {
    color: var(--accent-color);
  }

  .hero-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    flex: 0 0 auto;
  }

  .hero-cta {
    font-size: 1rem;
    padding: 15px 24px;
    min-height: 52px;
    border-radius: var(--radius-lg);
  }

  .lead {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr);
    gap: var(--space-5);
    align-items: stretch;
    margin-bottom: var(--space-5);
  }

  .start-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-6);
  }

  .start-card h2,
  .starter-head h2 {
    font-size: 1.3rem;
    font-weight: 750;
    letter-spacing: -0.02em;
  }

  .start-copy {
    font-size: 0.96rem;
    color: var(--text-muted);
    max-width: 62ch;
    line-height: 1.65;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    margin-top: auto;
  }

  .mode-block {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--space-4);
    padding-top: var(--space-5);
    border-top: 1px solid var(--border-color);
  }

  .mode-copy {
    flex: 1 1 260px;
  }

  .mode-title {
    display: block;
    font-size: 0.92rem;
    font-weight: 700;
    margin-bottom: 2px;
  }

  .mode-switch {
    display: inline-flex;
    gap: 3px;
    padding: 4px;
    background-color: var(--bg-secondary);
    border-radius: var(--radius-pill);
  }

  .mode-switch button {
    border: 0;
    background: transparent;
    color: var(--text-muted);
    font-family: var(--font-sans);
    font-size: 0.82rem;
    font-weight: 650;
    padding: 8px 16px;
    border-radius: var(--radius-pill);
    transition: color var(--dur-1) var(--ease-out), background-color var(--dur-1) var(--ease-out), box-shadow var(--dur-1) var(--ease-out);
  }

  .mode-switch button.active {
    background-color: var(--card-bg);
    color: var(--accent-ink);
    box-shadow: var(--shadow-subtle);
  }

  .mode-note {
    font-size: 0.82rem;
    color: var(--text-subtle);
    line-height: 1.5;
  }

  .starter-card {
    display: flex;
    flex-direction: column;
    padding: var(--space-6);
  }

  .starter-head p {
    font-size: 0.88rem;
    color: var(--text-muted);
    margin-top: 4px;
  }

  .starter-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin-top: var(--space-5);
  }

  .starter-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    width: 100%;
    padding: var(--space-3);
    text-align: left;
    background-color: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    color: var(--text-subtle);
    transition: border-color var(--dur-1) var(--ease-out), transform var(--dur-1) var(--ease-spring), box-shadow var(--dur-1) var(--ease-out);
  }

  .starter-row:hover {
    border-color: var(--accent-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-card);
  }

  .starter-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }

  .starter-text strong {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-main);
  }

  .starter-text small {
    font-size: 0.78rem;
    color: var(--text-muted);
  }

  .starter-foot {
    margin-top: auto;
    padding-top: var(--space-4);
    font-size: 0.78rem;
    color: var(--text-subtle);
  }

  .refine {
    margin-bottom: var(--space-5);
  }

  .method {
    padding: var(--space-6);
  }

  .method h2 {
    font-size: 1.3rem;
    font-weight: 750;
    letter-spacing: -0.02em;
    margin-bottom: var(--space-5);
  }

  .method-steps {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-6);
  }

  .method-step {
    display: flex;
    gap: var(--space-3);
  }

  .step-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 28px;
    height: 28px;
    border-radius: var(--radius-pill);
    background-color: var(--accent-soft);
    color: var(--accent-ink);
    font-family: var(--font-mono);
    font-size: 0.8rem;
    font-weight: 600;
  }

  .method-step h3 {
    font-size: 0.95rem;
    font-weight: 700;
    margin-bottom: var(--space-1);
  }

  .method-step p {
    color: var(--text-muted);
    font-size: 0.88rem;
    line-height: 1.6;
  }

  /* Styles for the parked swipe deck */
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
    background-color: var(--bg-secondary);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }

  .sheet-code {
    font-size: 0.74rem;
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
    border-top: 1px solid var(--hairline);
    font-size: 0.88rem;
  }

  .pick-rank { font-size: 0.72rem; color: var(--text-subtle); }
  .pick-name { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .pick-family { font-size: 0.72rem; color: var(--text-subtle); }

  .picks-empty {
    padding: var(--space-5);
    font-size: 0.88rem;
    color: var(--text-muted);
  }

  .picks-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
    padding: var(--space-4) var(--space-5);
  }

  .picks-actions .btn-primary { width: 100%; }

  .quiet-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 0;
    border: 0;
    background: transparent;
    color: var(--text-muted);
    font-size: 0.82rem;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .quiet-link:hover { color: var(--accent-ink); }

  @media (max-width: 900px) {
    .lead, .method-steps {
      grid-template-columns: 1fr;
    }

    .method-steps {
      gap: var(--space-4);
    }

    .picks {
      position: static;
    }
  }
</style>
