<script>
  import { LINUX_DISTROS } from '../data/distros.js';
  import SteeringPanel from './SteeringPanel.svelte';
  import SwipeDeck from './SwipeDeck.svelte';
  import DistroLogo from './DistroLogo.svelte';
  import SpecFinder from './SpecFinder.svelte';
  import WayglimBackground from './WayglimBackground.svelte';
  import Icon from './Icon.svelte';

  // Swipe discovery is built but parked for now; the finder quiz is the default
  // first experience. Flip this to true to restore the swipe deck as the hero.
  let ENABLE_SWIPE_DECK = $state(false);

  const FEATURED = [
    { id: 'linux-mint', reason: 'Best for beginners: a familiar desktop and everything works on first boot' },
    { id: 'fedora-workstation', reason: 'Great for developers: recent tooling and a clean GNOME experience' },
    { id: 'bazzite', reason: 'Best for gaming: Steam-ready with drivers included' }
  ];
  const featured = FEATURED
    .map((item) => ({ ...item, distro: LINUX_DISTROS.find((distro) => distro.id === item.id) }))
    .filter((item) => item.distro);

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
    if (!model) return 'Not listed';
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

  function scrollToSpecs() {
    const target = document.getElementById('spec-finder-section');
    if (!target) return;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
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
              <span class="field-value pick-rank">#{distro.dwRank || 'Unranked'}</span>
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
  <section class="hero-shell" aria-labelledby="hero-title">
    <WayglimBackground class="hero-bg" />
    <div class="hero-inner">
      <div class="hero-copy">
        <h1 id="hero-title">Find a Linux distro that feels like yours.</h1>
        <p>
          Answer a few quick questions or tell us your computer specs. Either way, we match
          real distributions to how you actually use a machine and show you why each one fits.
        </p>
        <div class="hero-meta">
          <span class="meta-chip"><Icon name="check" size={13} /> About 3 minutes</span>
          <span class="meta-chip"><Icon name="check" size={13} /> No sign-up or tracking</span>
          <span class="meta-chip"><Icon name="check" size={13} /> {LINUX_DISTROS.length} real distros</span>
        </div>
      </div>

      <aside class="starter-card" aria-label="Good places to start">
        <div class="starter-head">
          <h2>Good places to start</h2>
          <p>Three popular picks from the catalogue.</p>
        </div>
        <div class="starter-list">
          {#each featured as item (item.id)}
            <button class="starter-row" onclick={() => onNavigate('distro', item.id)}>
              <DistroLogo distro={item.distro} size={34} decorative={true} />
              <span class="starter-text">
                <strong>{item.distro.name}</strong>
                <small>{item.distro.family} · {prettyModel(item.distro.releaseModel)} · #{item.distro.dwRank}</small>
                <span class="starter-reason">{item.reason}</span>
              </span>
              <Icon name="chevron-right" size={15} />
            </button>
          {/each}
        </div>
      </aside>
    </div>
  </section>

  <section class="paths" aria-labelledby="paths-title">
    <div class="paths-intro">
      <h2 id="paths-title">Choose your path</h2>
      <p>Three ways in. You can switch between them whenever you like.</p>
    </div>

    <div class="path-options">
      <button class="path-option featured" onclick={onStartQuiz}>
        <span class="path-icon"><Icon name="list" size={19} /></span>
        <span class="path-text">
          <strong>Take the finder quiz</strong>
          <small>A short interview that adapts to your answers</small>
        </span>
        <Icon name="arrow-right" size={16} />
      </button>
      <button class="path-option" onclick={scrollToSpecs}>
        <span class="path-icon"><Icon name="layers" size={19} /></span>
        <span class="path-text">
          <strong>Use my computer specs</strong>
          <small>Match by hardware, needs and platform</small>
        </span>
        <Icon name="arrow-right" size={16} />
      </button>
      <button class="path-option" onclick={() => onNavigate('directory')}>
        <span class="path-icon"><Icon name="grid" size={19} /></span>
        <span class="path-text">
          <strong>Browse the directory</strong>
          <small>Search and compare all {LINUX_DISTROS.length} distros</small>
        </span>
        <Icon name="arrow-right" size={16} />
      </button>
    </div>

    <div class="mode-picker">
      <div class="mode-picker-head">
        <span class="mode-picker-icon"><Icon name="sliders" size={16} /></span>
        <div>
          <strong>Quiz mode: newcomer or expert?</strong>
          <span>You can change this at any point before you finish.</span>
        </div>
      </div>
      <div class="mode-options" role="group" aria-label="Quiz mode">
        <button
          type="button"
          class:active={!expertMode}
          aria-pressed={!expertMode}
          onclick={() => switchMode(false)}
        >
          <strong>Newcomer</strong>
          <small>Plain language, essentials only</small>
        </button>
        <button
          type="button"
          class:active={expertMode}
          aria-pressed={expertMode}
          onclick={() => switchMode(true)}
        >
          <strong>Expert</strong>
          <small>Kernel, security and release details</small>
        </button>
      </div>
    </div>
  </section>
  {/if}

  <div id="spec-finder-section" class="spec-slot">
    <SpecFinder onOpenDistro={(id) => onNavigate('distro', id)} />
  </div>

  <div class="refine">
    <SteeringPanel {steering} {onSteeringChange} startOpen={false} />
  </div>

  <section class="method">
    <h2>How it works</h2>
    <div class="method-steps">
      <div class="method-step">
        <span class="step-num">1</span>
        <div>
          <h3>Answer a few questions</h3>
          <p>
            Each answer maps to a real detail in the catalogue, from graphics support and memory
            to update pace, desktop style and more. Questions that can't change the result
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
            a few alternatives, not just one asserted winner.
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
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--section-radius);
    overflow: hidden;
  }

  .hero-shell {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    border: 0;
    border-radius: 0;
    background-color: var(--bg-secondary);
    padding: var(--space-7);
    margin-bottom: 0;
  }

  .hero-shell::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
    background-color: color-mix(in srgb, var(--bg-secondary) 55%, transparent);
    pointer-events: none;
  }

  :global(.hero-bg) {
    z-index: 0;
    opacity: var(--hero-bg-opacity);
    filter: saturate(0.85);
  }

  .hero-inner {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.75fr);
    gap: var(--space-6);
    align-items: center;
  }

  .hero-shell .hero-copy h1 {
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 750;
    line-height: 1.12;
    letter-spacing: -0.03em;
    max-width: 20ch;
    margin-bottom: var(--space-4);
    text-wrap: balance;
  }

  .hero-shell .hero-copy p {
    font-size: 1.05rem;
    color: var(--text-muted);
    max-width: 60ch;
    line-height: 1.65;
  }

  .paths {
    padding: var(--space-5);
    margin-bottom: 0;
    border: 0;
    border-top: 1px solid var(--border-color);
    border-radius: 0;
    box-shadow: none;
  }

  .spec-slot :global(.spec-finder) {
    margin-bottom: 0;
    border: 0;
    border-top: 1px solid var(--border-color);
    border-radius: 0;
    box-shadow: none;
  }

  .paths-intro h2 {
    font-size: 1.3rem;
    font-weight: 750;
    letter-spacing: -0.02em;
  }

  .paths-intro p {
    font-size: 0.9rem;
    color: var(--text-muted);
    margin-top: 4px;
  }

  .path-options {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-3);
    margin-top: var(--space-4);
  }

  .path-option {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    min-width: 0;
    padding: var(--space-4);
    text-align: left;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background-color: var(--bg-primary);
    color: var(--text-main);
    transition: border-color var(--dur-1) var(--ease-out), transform var(--dur-1) var(--ease-spring), box-shadow var(--dur-1) var(--ease-out);
  }

  .path-option:hover {
    border-color: var(--accent-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-card);
  }

  .path-option.featured {
    border-color: var(--accent-color);
    background-color: var(--accent-soft);
  }

  .path-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 38px;
    height: 38px;
    border-radius: var(--radius-sm);
    background-color: var(--card-bg);
    color: var(--accent-ink);
  }

  .path-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }

  .path-text strong {
    font-size: 0.9rem;
    font-weight: 750;
  }

  .path-text small {
    font-size: 0.76rem;
    color: var(--text-muted);
    line-height: 1.4;
  }

  .mode-picker {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--space-4);
    margin-top: var(--space-5);
    padding-top: var(--space-5);
    border-top: 1px solid var(--border-color);
  }

  .mode-picker-head {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex: 1 1 280px;
  }

  .mode-picker-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 34px;
    height: 34px;
    border-radius: var(--radius-sm);
    background-color: var(--accent-soft);
    color: var(--accent-ink);
  }

  .mode-picker-head strong,
  .mode-picker-head span {
    display: block;
  }

  .mode-picker-head strong {
    font-size: 0.92rem;
    font-weight: 750;
  }

  .mode-picker-head span {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-top: 2px;
  }

  .mode-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
    flex: 0 1 460px;
  }

  .mode-options button {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    padding: 11px 14px;
    text-align: left;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background-color: var(--bg-primary);
    color: var(--text-muted);
    transition: border-color var(--dur-1) var(--ease-out), background-color var(--dur-1) var(--ease-out), box-shadow var(--dur-1) var(--ease-out);
  }

  .mode-options button:hover {
    border-color: var(--accent-color);
  }

  .mode-options button.active {
    border-color: var(--accent-color);
    background-color: var(--accent-soft);
    box-shadow: 0 0 0 2px var(--accent-wash);
    color: var(--text-main);
  }

  .mode-options strong {
    font-size: 0.86rem;
    font-weight: 750;
  }

  .mode-options small {
    font-size: 0.74rem;
    color: var(--text-muted);
    line-height: 1.4;
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

  .lead {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr);
    gap: var(--space-5);
    align-items: stretch;
    margin-bottom: var(--space-5);
  }

  .starter-head h2 {
    font-size: 1.3rem;
    font-weight: 750;
    letter-spacing: -0.02em;
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
    padding: var(--space-5);
    border-radius: var(--radius-md);
    background-color: var(--glass-bg);
    border: 1px solid var(--glass-border);
    backdrop-filter: blur(20px) saturate(140%);
    -webkit-backdrop-filter: blur(20px) saturate(140%);
    box-shadow: inset 0 1px 0 var(--glass-highlight), 0 18px 44px rgba(20, 18, 32, 0.16);
  }

  .starter-head p {
    font-size: 0.88rem;
    color: var(--text-muted);
    margin-top: 4px;
  }

  .starter-list {
    display: flex;
    flex-direction: column;
    margin-top: var(--space-4);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .starter-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    width: 100%;
    padding: 12px var(--space-4);
    text-align: left;
    background-color: color-mix(in srgb, var(--card-bg) 60%, transparent);
    border: 0;
    border-radius: 0;
    color: var(--text-subtle);
    transition: background-color var(--dur-1) var(--ease-out);
  }

  .starter-row + .starter-row {
    border-top: 1px solid var(--border-color);
  }

  .starter-row:first-child {
    border-radius: var(--radius-md) var(--radius-md) 0 0;
  }

  .starter-row:last-child {
    border-radius: 0 0 var(--radius-md) var(--radius-md);
  }

  .starter-row:hover {
    background-color: var(--accent-soft);
  }

  .starter-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }

  .starter-text strong {
    font-size: 0.92rem;
    font-weight: 700;
    color: var(--text-main);
  }

  .starter-text small {
    font-size: 0.74rem;
    color: var(--text-muted);
  }

  .starter-reason {
    font-size: 0.72rem;
    line-height: 1.4;
    color: var(--accent-ink);
    margin-top: 2px;
  }

  .refine {
    margin-bottom: 0;
  }

  .refine :global(.tuning) {
    margin-bottom: 0;
    border: 0;
    border-top: 1px solid var(--border-color);
    border-radius: 0;
    box-shadow: none;
  }

  .method {
    padding: var(--space-6);
    margin-bottom: 0;
    border: 0;
    border-top: 1px solid var(--border-color);
    border-radius: 0;
    box-shadow: none;
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
    .lead, .method-steps, .hero-inner, .path-options {
      grid-template-columns: 1fr;
    }

    .method-steps {
      gap: var(--space-4);
    }

    .hero-shell {
      padding: var(--space-5);
    }

    .picks {
      position: static;
    }
  }

  @media (max-width: 560px) {
    .mode-options {
      grid-template-columns: 1fr;
      flex-basis: 100%;
    }
  }
</style>
