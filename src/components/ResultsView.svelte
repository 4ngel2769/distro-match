<script>
  import { onMount } from 'svelte';
  import { MatchingEngine } from '../lib/matchingEngine.js';
  import { ConfettiCannon } from '../lib/confetti.js';
  import SteeringPanel from './SteeringPanel.svelte';
  import DistroLogo from './DistroLogo.svelte';
  import DistroScreenshot from './DistroScreenshot.svelte';

  let {
    userAnswers = {},
    questionWeights = {},
    steering = {},
    onSteeringChange,
    onRetake,
    onCompareWith,
    onOpenDistro
  } = $props();

  let showSteering = $state(false);

  let evaluatedResults = $derived(
    MatchingEngine.evaluate(userAnswers, questionWeights, steering)
  );
  let recommendation = $derived(MatchingEngine.recommend(evaluatedResults, 5));
  let winner = $derived(recommendation.winner);
  let runnersUp = $derived(recommendation.alternatives);
  let alsoConsidered = $derived(recommendation.alsoConsidered);
  let closestDisqualified = $derived(
    evaluatedResults.filter((r) => r.disqualified).slice(0, 3)
  );
  let persona = $derived(
    MatchingEngine.generateUserPersona(userAnswers, winner ? winner.distro : null)
  );
  let topBreakdown = $derived(winner ? winner.breakdown.slice(0, 8) : []);
  let lowConfidence = $derived(winner && winner.confidence.percent < 55);

  onMount(() => {
    if (recommendation.winner) {
      setTimeout(() => ConfettiCannon.pop({ count: 140 }), 200);
    }
  });

  function barClass(value) {
    if (value >= 78) return 'bar-good';
    if (value >= 50) return 'bar-mid';
    return 'bar-bad';
  }

  function profileClick(event, id) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button === 1) return;
    event.preventDefault();
    onOpenDistro?.(id);
  }
</script>

<div class="page-container">
  {#if !winner}
    <div class="empty-result-card">
      <div class="eyebrow">NO DISTRO PASSES EVERY HARD REQUIREMENT</div>
      <h1>Your constraints rule out every distribution</h1>
      <p>
        That usually means two hard requirements conflict — for example a strictly libre system with
        turnkey NVIDIA drivers, or a non-systemd distro with an NVIDIA preinstall image. Relax one
        requirement and the shortlist returns immediately.
      </p>
      <div class="empty-actions">
        <button class="btn-primary" onclick={() => (showSteering = !showSteering)}>
          {showSteering ? 'Hide steering levers' : 'Open steering levers'}
        </button>
        <button class="btn-secondary" onclick={onRetake}>Retake the quiz</button>
      </div>
      {#if showSteering}
        <div class="steering-slot">
          <SteeringPanel {steering} {onSteeringChange} />
        </div>
      {/if}
      {#if closestDisqualified.length}
        <h2 class="close-heading">Closest fits, with one blocker each</h2>
        <div class="close-grid">
          {#each closestDisqualified as r}
            <div class="close-card">
              <DistroLogo distro={r.distro} size={40} decorative={true} />
              <div>
                <div class="close-name">{r.distro.name}</div>
                <div class="close-reason">{r.disqualifiers[0]}</div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {:else}
    <!-- Winner -->
    <section class="winner-card">
      <div class="winner-topline">
        <span class="winner-badge">★ BEST MATCH</span>
        <div class="winner-topline-actions">
          <span class="confidence-note">
            Based on {winner.confidence.answered}/{winner.confidence.total} answers
          </span>
          <button
            class="btn-secondary compact-btn"
            onclick={() => (showSteering = !showSteering)}
          >
            {showSteering ? 'Hide steering' : 'Steer results'}
          </button>
        </div>
      </div>

      {#if showSteering}
        <div class="steering-slot">
          <SteeringPanel {steering} {onSteeringChange} />
        </div>
      {/if}

      {#if lowConfidence}
        <div class="confidence-warning">
          <strong>Thin data.</strong> You answered {winner.confidence.percent}% of the quiz. Answer a few more
          questions (especially hardware and priority) to make this recommendation reliable.
        </div>
      {/if}

      <div class="winner-head">
        <div class="winner-identity">
          <DistroLogo distro={winner.distro} size={72} />
          <div class="winner-text">
            <div class="winner-name-row">
              <h1>{winner.distro.name}</h1>
              <span class="tier-badge tier-{winner.distro.tier}">{winner.distro.tier}</span>
            </div>
            <p class="winner-tagline">{winner.distro.tagline}</p>
            <div class="winner-meta">
              <span><strong>Family</strong> {winner.distro.family}</span>
              <span><strong>Init</strong> {winner.distro.initSystem}</span>
              <span><strong>Packages</strong> {winner.distro.packageManager}</span>
              <span><strong>Rank</strong> {winner.distro.dwRank ? `#${winner.distro.dwRank}` : 'unranked'}</span>
            </div>
          </div>
        </div>

        <div class="score-block">
          <div class="score-number">{winner.matchPercentage}<span>%</span></div>
          <div class="score-label">MATCH SCORE</div>
        </div>
      </div>

      <DistroScreenshot distro={winner.distro} height={380} eager={true} />

      <div class="winner-columns">
        <div class="reasons-block">
          <h2 class="block-title">Why this is your match</h2>
          <ul class="reasons-list">
            {#each winner.matchReasons as reason}
              <li><span class="mark good">■</span>{reason}</li>
            {/each}
          </ul>

          {#if winner.tradeoffs.length}
            <h2 class="block-title gaps-title">What you accept by choosing it</h2>
            <ul class="reasons-list">
              {#each winner.tradeoffs as gap}
                <li><span class="mark bad">■</span>{gap}</li>
              {/each}
            </ul>
          {/if}
        </div>

        <div class="breakdown-block">
          <h2 class="block-title">Score anatomy</h2>
          <div class="breakdown-list">
            {#each topBreakdown as item}
              <div class="breakdown-row">
                <div class="breakdown-head">
                  <span class="breakdown-label">{item.label}</span>
                  <span class="breakdown-value">{item.value}%</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill {barClass(item.value)}" style="width: {item.value}%"></div>
                </div>
                <div class="breakdown-weight">weight ×{item.weight}</div>
              </div>
            {/each}
          </div>
          <p class="breakdown-note">
            Each answer is scored 0–100 against the distro's traits, then weighted. Hard requirements
            (NVIDIA driver support, ARM64, init system, FSF-libre) disqualify instead of deducting.
          </p>
        </div>
      </div>

      <div class="winner-actions">
        <div class="action-row">
          <a
            class="btn-primary"
            href={`/distro/${winner.distro.id}`}
            onclick={(event) => profileClick(event, winner.distro.id)}
          >
            Open full profile →
          </a>
          <a class="btn-secondary" href={winner.distro.website} target="_blank" rel="noopener noreferrer">
            Official site ↗
          </a>
          <button class="btn-secondary" onclick={() => onCompareWith(winner.distro.id)}>
            Compare with another ⇄
          </button>
        </div>
        <button class="btn-secondary" onclick={onRetake}>Retake the quiz</button>
      </div>
    </section>

    <!-- Persona -->
    <section class="persona-card">
      <div class="persona-topline">
        <span class="persona-tag">{persona.badge}</span>
        <span class="persona-eyebrow">YOUR LINUX PERSONA</span>
      </div>
      <h2 class="persona-title">{persona.title}</h2>
      <div class="persona-quote">“{persona.quote}”</div>
      <p class="persona-description">{persona.description}</p>
      <div class="trait-row">
        {#each persona.keyTraits as trait}
          <span class="trait-pill">{trait}</span>
        {/each}
      </div>
    </section>

    <!-- Alternatives -->
    <section class="alternatives-card">
      <div class="alternatives-head">
        <h2>Runner-up contenders</h2>
        <p>Diversified by family so these are real alternatives, not five versions of the same base.</p>
      </div>

      <div class="runner-list">
        {#each runnersUp as r, i}
          <article class="runner-row">
            <div class="runner-thumb">
              <DistroScreenshot distro={r.distro} height={104} compact={true} />
            </div>
            <div class="runner-main">
              <div class="runner-title-row">
                <span class="runner-rank">#{i + 2}</span>
                <DistroLogo distro={r.distro} size={28} decorative={true} />
                <a
                  class="runner-name"
                  href={`/distro/${r.distro.id}`}
                  onclick={(event) => profileClick(event, r.distro.id)}
                >
                  {r.distro.name}
                </a>
                <span class="tier-badge tier-{r.distro.tier}">{r.distro.tier}</span>
              </div>
              <p class="runner-tagline">{r.distro.tagline}</p>
              <div class="runner-meta">
                {r.distro.family} · {r.distro.initSystem} · {r.distro.packageManager}
              </div>
            </div>
            <div class="runner-actions">
              <div class="runner-score">{r.matchPercentage}%</div>
              <a
                class="btn-secondary compact-btn"
                href={`/distro/${r.distro.id}`}
                onclick={(event) => profileClick(event, r.distro.id)}
              >
                Profile →
              </a>
              <button class="btn-secondary compact-btn" onclick={() => onCompareWith(r.distro.id)}>
                Compare ⇄
              </button>
            </div>
          </article>
        {/each}
      </div>

      {#if alsoConsidered.length}
        <div class="also-considered">
          <h3>Just outside the shortlist</h3>
          <div class="also-row">
            {#each alsoConsidered as r}
              <a
                class="also-chip"
                href={`/distro/${r.distro.id}`}
                onclick={(event) => profileClick(event, r.distro.id)}
              >
                <span>{r.distro.name}</span>
                <span class="also-score">{r.matchPercentage}%</span>
              </a>
            {/each}
          </div>
        </div>
      {/if}
    </section>
  {/if}
</div>

<style>
  .winner-card,
  .persona-card,
  .alternatives-card,
  .empty-result-card {
    border: 2px solid var(--border-strong);
    background-color: var(--card-bg);
    box-shadow: var(--shadow-sharp);
    padding: 30px;
    margin-bottom: 24px;
  }

  .winner-topline {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 18px;
  }

  .winner-topline-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .winner-badge {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    background-color: var(--accent-green);
    color: #052e1c;
    padding: 5px 10px;
    display: inline-block;
  }

  .confidence-note {
    font-family: var(--font-mono);
    font-size: 0.74rem;
    color: var(--text-subtle);
  }

  .confidence-warning {
    border: 1px solid var(--accent-amber);
    border-left-width: 4px;
    background-color: var(--bg-secondary);
    padding: 10px 14px;
    font-size: 0.88rem;
    color: var(--text-main);
    margin-bottom: 18px;
  }

  .steering-slot {
    margin-bottom: 22px;
  }

  .compact-btn {
    padding: 5px 10px;
    font-size: 0.78rem;
    font-family: var(--font-mono);
    text-decoration: none;
  }

  .winner-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 22px;
    flex-wrap: wrap;
    margin-bottom: 22px;
  }

  .winner-identity {
    display: flex;
    align-items: center;
    gap: 18px;
    min-width: 0;
  }

  .winner-text {
    min-width: 0;
  }

  .winner-name-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .winner-name-row h1 {
    font-size: 2.5rem;
    font-weight: 900;
    line-height: 1.02;
    letter-spacing: -0.03em;
  }

  .winner-tagline {
    font-size: 1rem;
    color: var(--text-muted);
    margin-top: 6px;
    max-width: 60ch;
    line-height: 1.45;
  }

  .winner-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 16px;
    margin-top: 10px;
    font-family: var(--font-mono);
    font-size: 0.74rem;
    color: var(--text-muted);
  }

  .winner-meta strong {
    color: var(--text-subtle);
    text-transform: uppercase;
    font-size: 0.66rem;
    letter-spacing: 0.04em;
    margin-right: 4px;
  }

  .score-block {
    text-align: right;
    border: 2px solid var(--border-strong);
    padding: 10px 18px;
    background-color: var(--border-strong);
    color: var(--bg-primary);
    flex-shrink: 0;
  }

  .score-number {
    font-family: var(--font-mono);
    font-size: 2.1rem;
    font-weight: 900;
    line-height: 1;
  }

  .score-number span {
    font-size: 1.1rem;
    margin-left: 1px;
  }

  .score-label {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    letter-spacing: 0.14em;
    margin-top: 4px;
    opacity: 0.85;
  }

  .winner-columns {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
    gap: 26px;
    margin-top: 24px;
    border-top: 1px solid var(--border-color);
    padding-top: 22px;
  }

  .block-title {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-subtle);
    margin-bottom: 12px;
  }

  .gaps-title {
    margin-top: 22px;
  }

  .reasons-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 0.92rem;
    line-height: 1.45;
  }

  .reasons-list li {
    display: flex;
    gap: 9px;
    align-items: flex-start;
  }

  .mark {
    font-size: 0.66rem;
    line-height: 1.8;
    flex-shrink: 0;
  }

  .mark.good {
    color: var(--accent-green);
  }

  .mark.bad {
    color: var(--accent-red);
  }

  .breakdown-list {
    display: flex;
    flex-direction: column;
    gap: 11px;
  }

  .breakdown-head {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    font-size: 0.8rem;
  }

  .breakdown-label {
    color: var(--text-main);
    font-weight: 600;
  }

  .breakdown-value {
    font-family: var(--font-mono);
    font-size: 0.76rem;
    color: var(--text-muted);
  }

  .bar-track {
    height: 6px;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    margin-top: 4px;
  }

  .bar-fill {
    height: 100%;
  }

  .bar-good {
    background-color: var(--accent-green);
  }

  .bar-mid {
    background-color: var(--accent-amber);
  }

  .bar-bad {
    background-color: var(--accent-red);
  }

  .breakdown-weight {
    font-family: var(--font-mono);
    font-size: 0.63rem;
    color: var(--text-subtle);
    margin-top: 3px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .breakdown-note {
    margin-top: 14px;
    font-size: 0.78rem;
    color: var(--text-subtle);
    line-height: 1.5;
    border-top: 1px dashed var(--border-color);
    padding-top: 10px;
  }

  .winner-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    border-top: 1px solid var(--border-color);
    margin-top: 24px;
    padding-top: 20px;
  }

  .action-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .winner-actions a.btn-primary,
  .winner-actions a.btn-secondary {
    text-decoration: none;
  }

  /* Persona */
  .persona-topline {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }

  .persona-tag {
    font-family: var(--font-mono);
    font-size: 0.74rem;
    font-weight: 800;
    background-color: var(--border-strong);
    color: var(--bg-primary);
    padding: 4px 9px;
  }

  .persona-eyebrow {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--text-subtle);
    letter-spacing: 0.08em;
  }

  .persona-title {
    font-size: 1.9rem;
    font-weight: 900;
    letter-spacing: -0.02em;
    margin-bottom: 10px;
  }

  .persona-quote {
    font-style: italic;
    font-size: 1rem;
    color: var(--text-muted);
    border-left: 3px solid var(--border-strong);
    padding-left: 14px;
    margin-bottom: 14px;
  }

  .persona-description {
    font-size: 0.94rem;
    line-height: 1.6;
    margin-bottom: 16px;
  }

  .trait-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .trait-pill {
    font-family: var(--font-mono);
    font-size: 0.76rem;
    font-weight: 700;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-color);
    padding: 4px 9px;
  }

  /* Alternatives */
  .alternatives-head {
    margin-bottom: 18px;
    border-bottom: 2px solid var(--border-strong);
    padding-bottom: 12px;
  }

  .alternatives-head h2 {
    font-size: 1.4rem;
    font-weight: 900;
    letter-spacing: -0.02em;
  }

  .alternatives-head p {
    font-size: 0.86rem;
    color: var(--text-muted);
    margin-top: 4px;
  }

  .runner-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .runner-row {
    display: flex;
    align-items: stretch;
    gap: 16px;
    border: 1px solid var(--border-color);
    padding: 0;
    flex-wrap: wrap;
    transition: border-color 0.1s ease, background-color 0.1s ease;
  }

  .runner-row:hover {
    border-color: var(--border-strong);
    background-color: var(--surface-hover);
  }

  .runner-thumb {
    width: 160px;
    flex-shrink: 0;
    border-right: 1px solid var(--border-color);
    background-color: var(--bg-tertiary);
  }

  .runner-main {
    flex: 1;
    min-width: 200px;
    padding: 12px 0;
  }

  .runner-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .runner-rank {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    font-weight: 800;
    color: var(--text-subtle);
  }

  .runner-name {
    font-weight: 800;
    font-size: 1.06rem;
    color: var(--text-main);
    text-decoration: none;
    border-bottom: 1px solid transparent;
  }

  .runner-name:hover {
    border-bottom-color: var(--text-main);
  }

  .runner-tagline {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-top: 4px;
    line-height: 1.4;
  }

  .runner-meta {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--text-subtle);
    margin-top: 6px;
  }

  .runner-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 14px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .runner-score {
    font-family: var(--font-mono);
    font-weight: 900;
    font-size: 1rem;
    border: 1px solid var(--border-color);
    background-color: var(--bg-tertiary);
    padding: 4px 8px;
  }

  .also-considered {
    margin-top: 20px;
    border-top: 1px dashed var(--border-color);
    padding-top: 16px;
  }

  .also-considered h3 {
    font-family: var(--font-mono);
    font-size: 0.74rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-subtle);
    margin-bottom: 10px;
  }

  .also-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .also-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--border-color);
    padding: 5px 10px;
    font-size: 0.82rem;
    text-decoration: none;
    color: var(--text-main);
    background-color: var(--bg-secondary);
  }

  .also-chip:hover {
    border-color: var(--border-strong);
  }

  .also-score {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--text-subtle);
  }

  /* Empty state */
  .eyebrow {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    font-weight: 800;
    color: var(--accent-red);
    margin-bottom: 8px;
  }

  .empty-result-card h1 {
    font-size: 1.9rem;
    letter-spacing: -0.02em;
    margin-bottom: 10px;
  }

  .empty-result-card p {
    color: var(--text-muted);
    font-size: 0.95rem;
    line-height: 1.55;
    max-width: 70ch;
  }

  .empty-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 18px;
  }

  .close-heading {
    font-size: 1.1rem;
    margin-top: 26px;
    margin-bottom: 12px;
  }

  .close-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 10px;
  }

  .close-card {
    display: flex;
    gap: 10px;
    align-items: center;
    border: 1px solid var(--border-color);
    padding: 10px 12px;
  }

  .close-name {
    font-weight: 800;
    font-size: 0.92rem;
  }

  .close-reason {
    font-size: 0.76rem;
    color: var(--accent-red);
    margin-top: 2px;
  }

  @media (max-width: 900px) {
    .winner-columns {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 700px) {
    .winner-card,
    .persona-card,
    .alternatives-card,
    .empty-result-card {
      padding: 20px;
    }

    .winner-name-row h1 {
      font-size: 1.9rem;
    }

    .score-block {
      text-align: left;
    }

    .runner-thumb {
      width: 110px;
    }

    .runner-actions {
      justify-content: flex-start;
      padding-top: 0;
    }
  }
</style>
