<script>
  import { MatchingEngine } from '../lib/matchingEngine.js';
  import DistroLogo from './DistroLogo.svelte';
  import Icon from './Icon.svelte';

  let {
    stage = null,
    nextStage = null,
    userAnswers = {},
    questionWeights = {},
    steering = {},
    isFinal = false,
    onContinue,
    onBack
  } = $props();

  let leading = $derived(
    MatchingEngine.recommend(
      MatchingEngine.evaluate(userAnswers, questionWeights, steering),
      3
    ).picks
  );

  function reasonFor(result) {
    const reasons = result.matchReasons;
    if (Array.isArray(reasons) && reasons.length) return reasons[0];
    return `${result.distro.family} · ${result.distro.releaseModel}`;
  }
</script>

<div class="page-container">
  <section class="report surface">
    <div class="report-head">
      <span class="field-label">Check-in {stage?.id} of 3</span>
      <h1>{isFinal ? 'Your shortlist is ready' : `Nice — ${stage?.short.toLowerCase()} is done`}</h1>
      <p>
        {isFinal
          ? 'That’s everything we need. Here are your three strongest matches before the final score.'
          : `Here’s who’s leading so far. You can still go back and change any answer.`}
      </p>
    </div>

    <div class="report-rows" aria-label="Current front-runners">
      {#each leading as result, i}
        <div class="report-row">
          <span class="row-rank field-value">{String(i + 1).padStart(2, '0')}</span>
          <DistroLogo distro={result.distro} size={30} decorative={true} />
          <div class="row-body">
            <strong>{result.distro.name}</strong>
            <span class="row-reason">{reasonFor(result)}</span>
          </div>
          <span class="row-score field-value">{result.matchPercentage}<small>%</small></span>
        </div>
      {:else}
        <p class="no-matches">No distro passes every hard requirement yet. You can keep going — later answers may open the field up.</p>
      {/each}
    </div>

    <p class="report-note">
      {#if nextStage}
        Next up: <strong>{nextStage.title}</strong> — {nextStage.subtitle}
      {:else}
        No more questions. We’ll show you the score breakdown so you can see why the winner came out on top.
      {/if}
    </p>

    <div class="report-actions">
      <button class="btn-secondary" onclick={onBack}>
        <Icon name="arrow-left" size={14} /> Change an answer
      </button>
      <button class="btn-primary" onclick={onContinue}>
        {isFinal ? 'See my matches' : `Continue to ${nextStage?.short || 'next stage'}`}
        <Icon name="arrow-right" size={14} />
      </button>
    </div>
  </section>
</div>

<style>
  .report {
    max-width: 760px;
    margin: 0 auto;
    padding: var(--space-6);
  }

  .report-head {
    margin-bottom: var(--space-5);
  }

  .report-head h1 {
    font-size: clamp(1.5rem, 3vw, 1.9rem);
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.015em;
    margin: var(--space-4) 0 var(--space-2);
  }

  .report-head p {
    font-size: 0.94rem;
    color: var(--text-muted);
    max-width: 62ch;
    line-height: 1.6;
  }

  .report-rows {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin-bottom: var(--space-5);
  }

  .report-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background-color: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
  }

  .row-rank {
    font-size: 0.78rem;
    color: var(--text-subtle);
    width: 20px;
    flex-shrink: 0;
  }

  .row-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }

  .row-body strong {
    font-size: 0.98rem;
    font-weight: 600;
  }

  .row-reason {
    font-size: 0.8rem;
    color: var(--text-muted);
    line-height: 1.45;
  }

  .row-score {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--accent-ink);
    white-space: nowrap;
  }

  .row-score small {
    font-size: 0.7rem;
    color: var(--text-subtle);
    margin-left: 1px;
  }

  .no-matches {
    padding: var(--space-4) var(--space-2);
    font-size: 0.9rem;
    color: var(--text-muted);
    line-height: 1.5;
  }

  .report-note {
    font-size: 0.85rem;
    color: var(--text-muted);
    line-height: 1.55;
    max-width: 62ch;
    margin-bottom: var(--space-6);
  }

  .report-note strong {
    color: var(--text-main);
  }

  .report-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  @media (max-width: 600px) {
    .report {
      padding: var(--space-5);
    }

    .report-head h1 {
      font-size: 1.4rem;
    }
  }
</style>
