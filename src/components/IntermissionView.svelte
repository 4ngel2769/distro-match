<script>
  import { MatchingEngine } from '../lib/matchingEngine.js';
  import SteeringPanel from './SteeringPanel.svelte';

  let {
    completedRound = 1,
    userAnswers = {},
    questionWeights = {},
    steering = {},
    onSteeringChange,
    onContinue,
    onBack
  } = $props();

  let liveCandidates = $derived(
    MatchingEngine.evaluate(userAnswers, questionWeights, steering).slice(0, 8)
  );
</script>

<div class="page-container">
  <div class="intermission-card">
    <div style="margin-bottom: 12px;">
      <span class="round-complete-badge">
        ROUND {completedRound} COMPLETED — LIVE FIELD REPORT
      </span>
    </div>

    <h1 class="intermission-title">
      Here is your Potential List of Distros
    </h1>
    <p class="intermission-lead">
      Based on your responses through Round {completedRound}, here are the leading operating systems currently competing for your recommendation. Use the live steering controls below to shape the engine in real time.
    </p>

    <!-- Interactive Real-time Steering Levers in Intermission -->
    <div style="margin-bottom: 24px;">
      <SteeringPanel {steering} {onSteeringChange} />
    </div>

    <!-- Candidate Table -->
    <div class="candidates-table-container">
      <table class="candidates-table">
        <thead>
          <tr>
            <th style="width: 60px;">Rank</th>
            <th>Distribution</th>
            <th style="width: 140px;">Current Match</th>
            <th>Key Alignment Factor</th>
          </tr>
        </thead>
        <tbody>
          {#each liveCandidates as c, idx}
            <tr>
              <td style="font-family: var(--font-label); font-weight: 900; font-size: 1rem;">
                #{idx + 1}
              </td>
              <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <img
                    src={c.distro.logoUrl}
                    alt=""
                    style="width: 28px; height: 28px; object-fit: contain;"
                    onerror={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div>
                    <div style="font-weight: 800; font-size: 1rem;">
                      {c.distro.name}
                      <span class="tier-badge tier-{c.distro.tier}" style="margin-left: 6px;">{c.distro.tier}</span>
                    </div>
                    <span style="font-family: var(--font-label); font-size: 0.75rem; color: var(--text-subtle);">
                      {c.distro.family} • {c.distro.initSystem} • {c.distro.releaseModel}
                    </span>
                  </div>
                </div>
              </td>
              <td>
                <span class="match-score-pill">
                  {c.matchPercentage}% MATCH
                </span>
              </td>
              <td style="font-size: 0.88rem; color: var(--text-muted);">
                {c.matchReasons[0] || c.distro.tagline}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Action Toolbar -->
    <div class="intermission-actions">
      <button class="btn-secondary" onclick={onBack}>
        ← Back to Adjust Answers
      </button>
      <button class="btn-primary" onclick={onContinue}>
        Proceed to Round {completedRound + 1} ›
      </button>
    </div>
  </div>
</div>

<style>
  .intermission-card {
    border: 2px solid var(--border-strong);
    background-color: var(--card-bg);
    padding: 32px;
    box-shadow: var(--shadow-sharp);
  }

  .round-complete-badge {
    font-family: var(--font-label);
    font-size: 0.78rem;
    font-weight: 800;
    background-color: var(--accent-color);
    color: var(--accent-contrast);
    padding: 4px 8px;
    display: inline-block;
  }

  .intermission-title {
    font-size: 2.2rem;
    font-weight: 900;
    letter-spacing: -0.02em;
    margin-bottom: 8px;
  }

  .intermission-lead {
    font-size: 1.05rem;
    color: var(--text-muted);
    margin-bottom: 24px;
    max-width: 800px;
  }

  .candidates-table-container {
    border: 2px solid var(--border-strong);
    overflow-x: auto;
    margin-bottom: 28px;
  }

  .candidates-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.92rem;
  }

  .candidates-table th {
    background-color: var(--bg-tertiary);
    border-bottom: 2px solid var(--border-strong);
    padding: 12px 14px;
    text-align: left;
    font-family: var(--font-label);
    font-size: 0.8rem;
  }

  .candidates-table td {
    padding: 12px 14px;
    border-bottom: 1px solid var(--border-color);
    vertical-align: middle;
  }

  .candidates-table tr:hover td {
    background-color: var(--surface-hover);
  }

  .match-score-pill {
    font-family: var(--font-label);
    font-weight: 800;
    font-size: 0.88rem;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    padding: 3px 8px;
    display: inline-block;
  }

  .intermission-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }
</style>
