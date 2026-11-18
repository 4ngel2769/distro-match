<script>
  import { MatchingEngine } from '../lib/matchingEngine.js';
  import DistroLogo from './DistroLogo.svelte';

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
</script>

<div class="page-container">
  <section class="break-card">
    <div class="break-head">
      <div>
        <div class="eyebrow">STAGE {stage?.id} COMPLETE</div>
        <h1>{isFinal ? 'Your shortlist is ready' : `${stage?.title} — done`}</h1>
        <p>
          {isFinal
            ? 'We have everything we need. Here are the three strongest matches before the final calculation.'
            : `With ${stage?.short.toLowerCase()} out of the way, these are the current front-runners. You can still change any answer.`}
        </p>
      </div>
      <span class="stage-mark" aria-hidden="true">{stage?.id}</span>
    </div>

    <div class="leading-list">
      {#each leading as result, i}
        <div class="leading-row">
          <span class="leading-rank">{i + 1}</span>
          <DistroLogo distro={result.distro} size={34} decorative={true} />
          <div class="leading-info">
            <strong>{result.distro.name}</strong>
            <span>{result.distro.family} · {result.distro.releaseModel}</span>
          </div>
          <span class="leading-score">{result.matchPercentage}%</span>
        </div>
      {:else}
        <p class="no-matches">No distro passes every hard requirement yet. You can keep going — later answers may open the field up.</p>
      {/each}
    </div>

    <div class="break-note">
      {#if nextStage}
        Next up: <strong>{nextStage.title}</strong> — {nextStage.subtitle}
      {:else}
        No more questions. The final result explains why the winner beat the runners-up.
      {/if}
    </div>

    <div class="break-actions">
      <button class="btn-secondary" onclick={onBack}>← Change an answer</button>
      <button class="btn-primary" onclick={onContinue}>
        {isFinal ? 'See my matches →' : `Continue to ${nextStage?.short || 'next stage'} →`}
      </button>
    </div>
  </section>
</div>

<style>
  .break-card {
    max-width: 760px;
    margin: 0 auto;
    border: 2px solid var(--border-strong);
    background-color: var(--card-bg);
    box-shadow: var(--shadow-sharp);
    padding: 32px;
  }

  .break-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 20px;
    margin-bottom: 20px;
  }

  .eyebrow {
    font-family: var(--font-label);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent-color);
    margin-bottom: 10px;
  }

  .break-head h1 {
    font-size: 1.8rem;
    font-weight: 900;
    line-height: 1.15;
    letter-spacing: -0.02em;
    margin-bottom: 8px;
  }

  .break-head p {
    font-size: 0.94rem;
    color: var(--text-muted);
    max-width: 52ch;
    line-height: 1.5;
  }

  .stage-mark {
    font-family: var(--font-label);
    font-size: 2.6rem;
    font-weight: 900;
    line-height: 1;
    color: var(--bg-tertiary);
    flex-shrink: 0;
  }

  .leading-list {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-color);
    margin-bottom: 18px;
  }

  .leading-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-bottom: 1px solid var(--border-color);
  }

  .leading-row:last-child {
    border-bottom: none;
  }

  .leading-rank {
    font-family: var(--font-label);
    font-size: 0.78rem;
    font-weight: 800;
    color: var(--text-subtle);
    width: 16px;
  }

  .leading-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .leading-info strong {
    font-size: 0.98rem;
  }

  .leading-info span {
    font-family: var(--font-label);
    font-size: 0.74rem;
    color: var(--text-subtle);
  }

  .leading-score {
    font-family: var(--font-label);
    font-size: 0.9rem;
    font-weight: 800;
    color: var(--accent-color);
  }

  .no-matches {
    padding: 16px;
    font-size: 0.9rem;
    color: var(--text-muted);
    line-height: 1.5;
  }

  .break-note {
    font-size: 0.85rem;
    color: var(--text-muted);
    line-height: 1.5;
    margin-bottom: 22px;
  }

  .break-note strong {
    color: var(--text-main);
  }

  .break-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    border-top: 1px solid var(--border-color);
    padding-top: 18px;
  }

  @media (max-width: 600px) {
    .break-card {
      padding: 20px;
    }

    .break-head h1 {
      font-size: 1.45rem;
    }

    .stage-mark {
      display: none;
    }
  }
</style>
