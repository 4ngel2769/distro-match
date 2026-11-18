<script>
  import { LINUX_DISTROS } from '../data/distros.js';
  import SteeringPanel from './SteeringPanel.svelte';
  import Icon from './Icon.svelte';

  let {
    onStartQuiz,
    onNavigate,
    steering = {},
    onSteeringChange,
    expertMode = false,
    onExpertModeChange
  } = $props();

  const FEATURED_IDS = ['linux-mint', 'fedora-workstation', 'arch-linux'];
  const featured = FEATURED_IDS
    .map((id) => LINUX_DISTROS.find((distro) => distro.id === id))
    .filter(Boolean);

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
  <div class="lead">
    <section class="promise">
      <span class="field-label">Distribution field guide</span>
      <h1>Find a Linux distro that actually fits.</h1>
      <p class="promise-copy">
        A short, focused questionnaire maps your hardware, work and principles to a
        verified catalogue of {LINUX_DISTROS.length} distributions — then shows the
        shortlist and the reasoning behind it.
      </p>

      <div class="actions">
        <button class="btn-primary" onclick={onStartQuiz}>
          Find my distro <Icon name="arrow-right" size={14} />
        </button>
        <button class="btn-secondary" onclick={() => onNavigate('directory')}>
          Browse the catalogue <Icon name="chevron-right" size={14} />
        </button>
      </div>

      <button class="quiet-link" onclick={() => onNavigate('compare')}>
        Or compare two distributions side by side <Icon name="arrow-right" size={13} />
      </button>

      <div class="mode-block">
        <div class="mode-head">
          <span class="field-label">Path</span>
          <p class="mode-note">Expert adds kernel and security questions and skips beginner framing.</p>
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

  <div class="refine">
    <SteeringPanel {steering} {onSteeringChange} />
  </div>

  <section class="method">
    <h2>How the field is narrowed</h2>
    <p>
      Each answer maps to a real catalogue field — graphics support, memory budget,
      update cadence, init system, software freedom, desktop style and package
      tooling. Skip what does not apply; mark what matters as a must-have.
    </p>
    <p>
      After each short stage you get a field report of the current front-runners.
      The final result shows the score breakdown, the trade-offs you accepted and a
      diversified shortlist — not a single asserted winner.
    </p>
  </section>
</div>

<style>
  .welcome {
    max-width: 1160px;
    margin: 0 auto;
  }

  .lead {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
    gap: var(--space-7);
    align-items: start;
    margin-bottom: var(--space-7);
  }

  .promise h1 {
    font-size: clamp(2rem, 4vw, 2.8rem);
    font-weight: 700;
    line-height: 1.13;
    letter-spacing: -0.02em;
    max-width: 20ch;
    margin: var(--space-5) 0 var(--space-3);
  }

  .promise-copy {
    font-size: 1.02rem;
    color: var(--text-muted);
    max-width: 68ch;
    line-height: 1.6;
    margin-bottom: var(--space-6);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  .quiet-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: var(--space-4);
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--text-muted);
    font-size: 0.84rem;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .quiet-link:hover {
    color: var(--text-main);
  }

  .mode-block {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--space-4);
    border-top: 1px solid var(--border-color);
    margin-top: var(--space-7);
    padding-top: var(--space-4);
  }

  .mode-head {
    max-width: 44ch;
  }

  .mode-note {
    font-size: 0.8rem;
    color: var(--text-subtle);
    line-height: 1.5;
    margin-top: var(--space-1);
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
    font-size: 0.82rem;
    font-weight: 600;
    padding: 8px 16px;
    transition: color var(--dur-1) var(--ease-out), background-color var(--dur-1) var(--ease-out);
  }

  .mode-switch button + button {
    border-left: 1px solid var(--border-color);
  }

  .mode-switch button:hover {
    color: var(--text-main);
  }

  .mode-switch button.active {
    background-color: var(--card-bg);
    color: var(--text-main);
    box-shadow: inset 0 -2px 0 var(--accent-fill);
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
    border-bottom: 1px solid var(--border-color);
    padding-top: var(--space-2);
    padding-bottom: var(--space-2);
  }

  .spec-row {
    border-bottom: 1px solid var(--hairline);
    font-size: 0.88rem;
  }

  .spec-row:last-child {
    border-bottom: 0;
  }

  .spec-name {
    font-weight: 600;
    color: var(--text-main);
  }

  .spec-row .field-value {
    font-size: 0.76rem;
    color: var(--text-muted);
  }

  .rank-col {
    text-align: right;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .refine {
    margin-bottom: var(--space-7);
  }

  .method {
    max-width: 72ch;
    border-top: 1px solid var(--border-color);
    padding-top: var(--space-5);
  }

  .method h2 {
    font-size: 1.15rem;
    font-weight: 700;
    margin: var(--space-2) 0 var(--space-3);
  }

  .method p {
    font-size: 0.94rem;
    color: var(--text-muted);
    line-height: 1.65;
    max-width: 70ch;
  }

  .method p + p {
    margin-top: var(--space-3);
  }

  @media (max-width: 860px) {
    .lead {
      grid-template-columns: 1fr;
      gap: var(--space-6);
    }
  }

  @media (max-width: 560px) {
    .spec-head {
      display: none;
    }

    .spec-row {
      grid-template-columns: minmax(0, 1fr) auto;
      row-gap: 2px;
    }

    .spec-name {
      grid-column: 1;
      grid-row: 1;
    }

    .spec-row .rank-col {
      grid-column: 2;
      grid-row: 1;
    }

    .spec-family {
      grid-column: 1;
      grid-row: 2;
    }

    .spec-release {
      grid-column: 2;
      grid-row: 2;
      text-align: right;
    }
  }
</style>
