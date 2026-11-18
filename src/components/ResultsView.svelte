<script>
  import { MatchingEngine } from '../lib/matchingEngine.js';
  import SteeringPanel from './SteeringPanel.svelte';
  import DistroLogo from './DistroLogo.svelte';
  import DistroScreenshot from './DistroScreenshot.svelte';
  import Icon from './Icon.svelte';

  let {
    userAnswers = {},
    questionWeights = {},
    steering = {},
    likes = [],
    onSteeringChange,
    onRetake,
    onCompareWith,
    onOpenDistro
  } = $props();

  let showSteering = $state(false);

  let evaluatedResults = $derived(
    MatchingEngine.evaluate(userAnswers, questionWeights, steering, { likes })
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

  function toggleExpertMode() {
    onSteeringChange({ ...steering, expertMode: !steering.expertMode });
  }
</script>

<div class="page-container">
  {#if !winner}
    <!-- Empty result: a calm, labelled sheet rather than an error panel. -->
    <section class="sheet empty-sheet">
      <div class="sheet-topline">
        <span class="field-label"><Icon name="alert" size={13} /> No exact match yet</span>
        <div class="head-tools">
          <button
            class="mode-switch"
            onclick={toggleExpertMode}
            aria-pressed={!!steering.expertMode}
            aria-label="Switch between newcomer and expert mode"
          >
            <span class="mode-opt" class:on={!steering.expertMode}>Newcomer</span>
            <span class="mode-opt" class:on={!!steering.expertMode}>Expert</span>
          </button>
          <button class="act-btn act-quiet" onclick={() => (showSteering = !showSteering)} aria-expanded={showSteering}>
            <Icon name="sliders" size={14} />
            <span>{showSteering ? 'Hide options' : 'Fine-tune'}</span>
          </button>
        </div>
      </div>

      <h1>No distro fits all of those</h1>
      <p>
        That usually means two must-haves conflict, for example a strictly libre system with
        ready-to-go NVIDIA drivers. Loosen one and the shortlist comes straight back.
      </p>
      <div class="empty-actions">
        <button class="act-btn act-primary" onclick={onRetake}>
          <Icon name="arrow-left" size={14} />
          <span>Retake the quiz</span>
        </button>
      </div>

      {#if showSteering}
        <div class="steering-slot">
          <SteeringPanel {steering} {onSteeringChange} />
        </div>
      {/if}

      {#if closestDisqualified.length}
        <div class="close-section">
          <span class="field-label">Almost a fit, one thing in the way</span>
          <div class="close-grid stagger-in">
            {#each closestDisqualified as r}
              <div class="close-card">
                <span class="close-mark" aria-hidden="true"><Icon name="alert" size={13} /></span>
                <span class="close-name">{r.distro.name}</span>
                <span class="close-reason">{r.disqualifiers[0]}</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </section>
  {:else}
    <article class="specimen-sheet">
      <!-- Winner sheet -->
      <section class="sheet winner-sheet">
        <div class="sheet-topline">
          <span class="field-label"><Icon name="star" size={13} /> Your best match</span>
          <div class="head-tools">
            <button
              class="mode-switch"
              onclick={toggleExpertMode}
              aria-pressed={!!steering.expertMode}
              aria-label="Switch between newcomer and expert mode"
            >
              <span class="mode-opt" class:on={!steering.expertMode}>Newcomer</span>
              <span class="mode-opt" class:on={!!steering.expertMode}>Expert</span>
            </button>
            <button class="act-btn act-quiet" onclick={() => (showSteering = !showSteering)} aria-expanded={showSteering}>
              <Icon name="sliders" size={14} />
              <span>{showSteering ? 'Hide options' : 'Fine-tune'}</span>
            </button>
          </div>
        </div>

        {#if likes.length}
          <p class="swipe-context">
            Ranked from your {likes.length} swipe pick{likes.length === 1 ? '' : 's'}. Answer the
            questionnaire for a more precise fit.
          </p>
        {/if}

        {#if showSteering}
          <div class="steering-slot">
            <SteeringPanel {steering} {onSteeringChange} />
          </div>
        {/if}

        {#if lowConfidence}
          <div class="confidence-warning">
            <Icon name="alert" size={15} />
            <span>
              <strong>A quick note:</strong> you answered {winner.confidence.percent}% of the quiz. A few more answers,
              especially about hardware and your top priority, will make this a stronger match.
            </span>
          </div>
        {/if}

        <div class="winner-head">
          <div class="winner-identity">
            <DistroLogo distro={winner.distro} size={72} />
            <div class="winner-text">
              <span class="field-label best-label"><Icon name="star" size={12} /> Top match</span>
              <div class="winner-name-row">
                <h1>{winner.distro.name}</h1>
                <span class="tier-badge tier-{winner.distro.tier}">{winner.distro.tier}</span>
              </div>
              <p class="winner-tagline">{winner.distro.tagline}</p>
              <dl class="winner-meta spec-table">
                <div><dt>Family</dt><dd>{winner.distro.family}</dd></div>
                <div><dt>Init</dt><dd>{winner.distro.initSystem}</dd></div>
                <div><dt>Packages</dt><dd>{winner.distro.packageManager}</dd></div>
                <div><dt>Rank</dt><dd>{winner.distro.dwRank ? `#${winner.distro.dwRank}` : 'unranked'}</dd></div>
              </dl>
            </div>
          </div>

          <div class="score-block">
            <div class="field-label score-label">Match score</div>
            <div class="score-number field-value">{winner.matchPercentage}<span>%</span></div>
            <div class="score-sub field-value">
              {winner.confidence.answered}/{winner.confidence.total} ANSWERS
            </div>
          </div>
        </div>
      </section>

      <figure class="plate-figure">
        <DistroScreenshot distro={winner.distro} height={380} eager={true} />
        <figcaption class="caption-strip">
          <span><strong>PLATE</strong> {winner.distro.name} desktop</span>
          <span><strong>FAMILY</strong> {winner.distro.family}</span>
          <span><strong>RELEASE</strong> {winner.distro.releaseModel}</span>
        </figcaption>
      </figure>

      <!-- Reasoning + score anatomy -->
      <div class="sheet-columns">
        <section class="reasons-block">
          <h2 class="block-title">Why this is your match</h2>
          <ul class="mark-list">
            {#each winner.matchReasons as reason}
              <li>
                <span class="mark-icon mark-good" aria-hidden="true"><Icon name="check" size={15} /></span>
                <span>{reason}</span>
              </li>
            {/each}
          </ul>

          {#if winner.tradeoffs.length}
            <h2 class="block-title gaps-title">What you accept</h2>
            <ul class="mark-list">
              {#each winner.tradeoffs as gap}
                <li>
                  <span class="mark-icon mark-warn" aria-hidden="true"><Icon name="alert" size={15} /></span>
                  <span>{gap}</span>
                </li>
              {/each}
            </ul>
          {/if}
        </section>

        <section class="breakdown-block">
          <h2 class="block-title">How we scored it</h2>
          <table class="anatomy-table">
            <thead>
              <tr>
                <th scope="col">Rk</th>
                <th scope="col">Criterion</th>
                <th scope="col">Wt</th>
                <th scope="col">Score</th>
              </tr>
            </thead>
            <tbody>
              {#each topBreakdown as item, i}
                <tr>
                  <td class="anatomy-rank field-value">{String(i + 1).padStart(2, '0')}</td>
                  <td>
                    <div class="anatomy-label">{item.label}</div>
                    <div class="bar-track">
                      <div class="bar-fill {barClass(item.value)}" style="width: {item.value}%"></div>
                    </div>
                  </td>
                  <td class="anatomy-weight field-value">×{item.weight}</td>
                  <td class="anatomy-value field-value">{item.value}</td>
                </tr>
              {/each}
            </tbody>
          </table>
          <p class="breakdown-note">
            Each answer is scored 0–100 against the distro's traits, then weighted. Hard requirements
            (NVIDIA driver support, ARM64, init system, FSF-libre) disqualify instead of deducting.
          </p>
        </section>
      </div>

      <!-- Actions -->
      <div class="sheet-actions">
        <div class="action-row">
          <a
            class="act-btn act-primary"
            href={`/distro/${winner.distro.id}/`}
            onclick={(event) => profileClick(event, winner.distro.id)}
          >
            <Icon name="arrow-right" size={14} />
            <span>See the full profile</span>
          </a>
          <a class="act-btn act-quiet" href={winner.distro.website} target="_blank" rel="noopener noreferrer">
            <Icon name="external" size={14} />
            <span>Official site</span>
          </a>
          <button class="act-btn act-quiet" onclick={() => onCompareWith(winner.distro.id)}>
            <Icon name="swap" size={14} />
            <span>Compare with another</span>
          </button>
        </div>
        <button class="act-btn act-quiet" onclick={onRetake}>
          <Icon name="arrow-left" size={14} />
          <span>Retake the quiz</span>
        </button>
      </div>

      <!-- Persona field note -->
      <aside class="field-note">
        <div class="note-head">
          <span class="field-label">A little about you</span>
          <span class="note-badge field-value">{persona.badge}</span>
        </div>
        <blockquote class="note-quote">“{persona.quote}”</blockquote>
        <h2 class="note-title">{persona.title}</h2>
        <p class="note-description">{persona.description}</p>
        <div class="trait-row">
          {#each persona.keyTraits as trait}
            <span class="specimen">{trait}</span>
          {/each}
        </div>
      </aside>

      <!-- Alternatives -->
      <section class="alternatives sheet">
        <header class="alternatives-head">
          <span class="field-label">Other good fits</span>
          <h2>Also worth a look</h2>
          <p>Picked from different families, so these are genuine alternatives rather than near-copies.</p>
        </header>

        <div class="runner-list stagger-in">
          {#each runnersUp as r, i}
            <article class="runner-row">
              <div class="runner-rank field-value">{String(i + 2).padStart(2, '0')}</div>
              <div class="runner-thumb">
                <DistroScreenshot distro={r.distro} height={104} compact={true} eager={true} />
              </div>
              <div class="runner-main">
                <div class="runner-title-row">
                  <a
                    class="runner-name"
                    href={`/distro/${r.distro.id}/`}
                    onclick={(event) => profileClick(event, r.distro.id)}
                  >
                    {r.distro.name}
                  </a>
                  <span class="tier-badge tier-{r.distro.tier}">{r.distro.tier}</span>
                </div>
                <p class="runner-tagline">{r.distro.tagline}</p>
                <div class="runner-meta field-value">
                  {r.distro.family} · {r.distro.initSystem} · {r.distro.packageManager}
                </div>
              </div>
              <div class="runner-score field-value">
                {r.matchPercentage}<span>%</span>
              </div>
              <div class="runner-actions">
                <a
                  class="act-btn act-quiet compact"
                  href={`/distro/${r.distro.id}/`}
                  onclick={(event) => profileClick(event, r.distro.id)}
                >
                  <Icon name="arrow-right" size={13} />
                  <span>Profile</span>
                </a>
                <button class="act-btn act-quiet compact" onclick={() => onCompareWith(r.distro.id)}>
                  <Icon name="swap" size={13} />
                  <span>Compare</span>
                </button>
              </div>
            </article>
          {/each}
        </div>

        {#if alsoConsidered.length}
          <div class="also-considered">
            <span class="field-label">Also considered</span>
            <div class="also-row">
              {#each alsoConsidered as r}
                <a
                  class="also-chip"
                  href={`/distro/${r.distro.id}/`}
                  onclick={(event) => profileClick(event, r.distro.id)}
                >
                  <span>{r.distro.name}</span>
                  <span class="also-score field-value">{r.matchPercentage}%</span>
                </a>
              {/each}
            </div>
          </div>
        {/if}
      </section>
    </article>
  {/if}
</div>

<style>
  /* ---------- Shared sheet primitives ---------- */
  .sheet {
    border: 1px solid var(--border-color);
    background-color: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
    padding: var(--space-6);
    margin-bottom: var(--space-5);
  }

  .specimen-sheet {
    display: block;
  }

  .sheet-topline {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
    margin-bottom: var(--space-5);
  }

  .sheet-topline .field-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .head-tools {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .act-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: 10px 16px;
    min-height: 40px;
    font-family: var(--font-sans);
    font-size: 0.85rem;
    font-weight: 650;
    line-height: 1.2;
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    background-color: transparent;
    color: var(--text-main);
    text-decoration: none;
    transition: background-color var(--dur-1) var(--ease-out),
      color var(--dur-1) var(--ease-out), border-color var(--dur-1) var(--ease-out), transform var(--dur-1) var(--ease-spring);
  }

  .act-btn:hover {
    transform: translateY(-2px);
  }

  .act-btn:hover {
    background-color: var(--bg-tertiary);
  }

  .act-primary {
    background-color: var(--accent-fill);
    color: var(--accent-contrast);
    box-shadow: 0 4px 12px var(--accent-wash);
  }

  .act-primary:hover {
    background-color: var(--accent-hover);
  }

  .act-quiet {
    border-color: var(--border-color);
    color: var(--text-muted);
    background-color: var(--card-bg);
  }

  .act-quiet:hover {
    border-color: var(--accent-color);
    color: var(--accent-ink);
    background-color: var(--accent-soft);
  }

  .act-btn.compact {
    padding: 6px 10px;
    font-size: 0.75rem;
  }

  .mode-switch {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    background-color: var(--bg-secondary);
    padding: 4px;
    border-radius: var(--radius-pill);
  }

  .mode-opt {
    font-family: var(--font-sans);
    font-size: 0.8rem;
    font-weight: 650;
    color: var(--text-muted);
    padding: 6px 14px;
    border-radius: var(--radius-pill);
    transition: background-color var(--dur-1) var(--ease-out), color var(--dur-1) var(--ease-out), box-shadow var(--dur-1) var(--ease-out);
  }

  .mode-opt.on {
    background-color: var(--card-bg);
    color: var(--accent-ink);
    box-shadow: var(--shadow-subtle);
  }

  .steering-slot {
    margin-bottom: var(--space-5);
  }

  /* ---------- Empty sheet ---------- */
  .empty-sheet h1 {
    font-size: 1.6rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: var(--space-2);
  }

  .empty-sheet > p {
    color: var(--text-muted);
    font-size: 0.92rem;
    line-height: 1.6;
    max-width: 72ch;
  }

  .empty-actions {
    margin-top: var(--space-5);
  }

  .close-section {
    margin-top: var(--space-6);
    border-top: 1px solid var(--border-color);
    padding-top: var(--space-4);
  }

  .close-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: var(--space-3);
    margin-top: var(--space-3);
  }

  .close-card {
    display: grid;
    grid-template-columns: 16px 1fr;
    column-gap: var(--space-2);
    align-items: start;
    border: 1px solid var(--border-color);
    background-color: var(--card-bg);
    border-radius: var(--radius-md);
    padding: var(--space-3) var(--space-4);
  }

  .close-mark {
    color: var(--accent-red);
    display: inline-flex;
    padding-top: 2px;
  }

  .close-name {
    font-weight: 600;
    font-size: 0.88rem;
  }

  .close-reason {
    grid-column: 2;
    font-size: 0.76rem;
    color: var(--text-muted);
    margin-top: 2px;
  }

  /* ---------- Winner header ---------- */
  .swipe-context {
    font-size: 0.82rem;
    color: var(--text-muted);
    margin-bottom: var(--space-4);
  }

  .confidence-warning {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    border: 1px solid var(--accent-amber);
    background-color: var(--bg-secondary);
    border-radius: var(--radius-md);
    padding: 12px 16px;
    font-size: 0.88rem;
    line-height: 1.5;
    color: var(--text-main);
    margin-bottom: var(--space-5);
  }

  .confidence-warning :global(svg) {
    color: var(--accent-amber);
    margin-top: 2px;
  }

  .winner-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-5);
    flex-wrap: wrap;
  }

  .winner-identity {
    display: flex;
    align-items: center;
    gap: var(--space-5);
    min-width: 0;
  }

  .winner-text {
    min-width: 0;
  }

  .best-label {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: var(--accent-ink);
  }

  .winner-name-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
    margin-top: 6px;
  }

  .winner-name-row h1 {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: -0.03em;
  }

  .winner-tagline {
    font-size: 0.94rem;
    color: var(--text-muted);
    margin-top: 6px;
    max-width: 62ch;
    line-height: 1.5;
  }

  .winner-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 4px var(--space-5);
    margin-top: var(--space-3);
    font-size: 0.72rem;
  }

  .winner-meta > div {
    display: flex;
    align-items: baseline;
    gap: 6px;
    min-width: 0;
  }

  .winner-meta dt {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--text-muted);
  }

  .winner-meta dd {
    color: var(--text-main);
    font-variant-numeric: tabular-nums;
  }

  .score-block {
    background-color: var(--accent-soft);
    border-radius: var(--radius-lg);
    padding: var(--space-4) var(--space-5);
    min-width: 160px;
    text-align: right;
    flex-shrink: 0;
  }

  .score-number {
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
    font-size: 2.2rem;
    font-weight: 600;
    line-height: 1;
    margin-top: 4px;
    color: var(--text-main);
  }

  .score-number span {
    font-size: 1rem;
    color: var(--text-subtle);
    margin-left: 2px;
  }

  .score-sub {
    font-size: 0.62rem;
    color: var(--text-subtle);
    margin-top: 6px;
  }

  /* ---------- Plate ---------- */
  .plate-figure {
    margin: 0 0 var(--space-5);
  }

  .plate-figure :global(.screenshot-shell) {
    border: 1px solid var(--border-color);
  }

  /* ---------- Reasoning columns ---------- */
  .sheet-columns {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    gap: var(--space-6);
    border: 1px solid var(--border-color);
    background-color: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
    padding: var(--space-6);
    margin-bottom: var(--space-5);
  }

  .block-title {
    font-family: var(--font-sans);
    font-size: 1.05rem;
    font-weight: 750;
    letter-spacing: -0.01em;
    color: var(--text-main);
    margin-bottom: var(--space-4);
  }

  .gaps-title {
    margin-top: var(--space-5);
    padding-top: var(--space-4);
    border-top: 1px solid var(--border-color);
  }

  .mark-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 9px;
    font-size: 0.88rem;
    line-height: 1.5;
    color: var(--text-main);
  }

  .mark-list li {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  .mark-icon {
    display: inline-flex;
    flex-shrink: 0;
    padding-top: 2px;
  }

  .mark-good { color: var(--accent-green); }
  .mark-warn { color: var(--accent-amber); }

  .breakdown-block {
    min-width: 0;
    border-left: 1px solid var(--border-color);
    padding-left: var(--space-6);
  }

  .anatomy-table {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    font-variant-numeric: tabular-nums;
  }

  .anatomy-table th {
    font-family: var(--font-label);
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-subtle);
    text-align: left;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--border-color);
  }

  .anatomy-table td {
    padding: 7px 0;
    border-bottom: 1px solid var(--border-color);
    vertical-align: middle;
  }

  .anatomy-table .anatomy-rank {
    width: 26px;
    color: var(--text-subtle);
  }

  .anatomy-label {
    font-family: var(--font-sans);
    font-size: 0.8rem;
    color: var(--text-main);
    margin-bottom: 4px;
  }

  .anatomy-weight,
  .anatomy-value {
    text-align: right;
  }

  .anatomy-weight {
    width: 44px;
    color: var(--text-subtle);
  }

  .anatomy-value {
    width: 42px;
    color: var(--text-main);
    font-weight: 600;
  }

  .bar-track {
    height: 4px;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-color);
  }

  .bar-fill {
    height: 100%;
  }

  .bar-good { background-color: var(--accent-green); }
  .bar-mid { background-color: var(--accent-amber); }
  .bar-bad { background-color: var(--accent-red); }

  .breakdown-note {
    margin-top: var(--space-4);
    font-size: 0.76rem;
    color: var(--text-subtle);
    line-height: 1.5;
    border-top: 1px solid var(--border-color);
    padding-top: var(--space-3);
  }

  /* ---------- Actions ---------- */
  .sheet-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-4);
    flex-wrap: wrap;
    border: 1px solid var(--border-color);
    background-color: var(--bg-secondary);
    padding: var(--space-3) var(--space-4);
    margin-bottom: var(--space-5);
  }

  .action-row {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  /* ---------- Field note ---------- */
  .field-note {
    border: 1px solid var(--border-color);
    border-left: 2px solid var(--accent-color);
    background-color: var(--card-bg);
    padding: var(--space-5);
    margin-bottom: var(--space-5);
  }

  .note-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
    margin-bottom: var(--space-3);
  }

  .note-badge {
    font-size: 0.66rem;
    letter-spacing: 0.04em;
    padding: 3px 8px;
    background-color: var(--tag-accent-bg);
    border: 1px solid var(--tag-accent-border);
    color: var(--tag-accent-text);
  }

  .note-quote {
    font-style: italic;
    font-size: 0.98rem;
    line-height: 1.5;
    color: var(--text-main);
    margin-bottom: var(--space-3);
  }

  .note-title {
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    margin-bottom: 6px;
  }

  .note-description {
    font-size: 0.88rem;
    line-height: 1.6;
    color: var(--text-muted);
    margin-bottom: var(--space-4);
    max-width: 76ch;
  }

  .trait-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .specimen {
    font-family: var(--font-label);
    font-size: 0.68rem;
    font-weight: 500;
    padding: 3px 8px;
    background-color: var(--tag-neutral-bg);
    border: 1px solid var(--tag-neutral-border);
    color: var(--tag-neutral-text);
    white-space: nowrap;
  }

  /* ---------- Alternatives ---------- */
  .alternatives {
    margin-bottom: 0;
  }

  .alternatives-head {
    border-bottom: 1px solid var(--border-strong);
    padding-bottom: var(--space-3);
    margin-bottom: var(--space-2);
  }

  .alternatives-head h2 {
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-top: 6px;
  }

  .alternatives-head p {
    font-size: 0.84rem;
    color: var(--text-muted);
    margin-top: 4px;
  }

  .runner-list {
    display: flex;
    flex-direction: column;
  }

  .runner-row {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-3) 0;
    border-top: 1px solid var(--border-color);
    transition: background-color var(--dur-1) var(--ease-out);
  }

  .runner-row:hover {
    background-color: var(--surface-hover);
  }

  .runner-rank {
    width: 28px;
    flex-shrink: 0;
    color: var(--text-subtle);
  }

  .runner-thumb {
    width: 140px;
    flex-shrink: 0;
  }

  .runner-main {
    flex: 1 1 220px;
    min-width: 0;
  }

  .runner-title-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .runner-name {
    font-weight: 700;
    font-size: 0.98rem;
    color: var(--text-main);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color var(--dur-1) var(--ease-out);
  }

  .runner-name:hover {
    border-bottom-color: var(--text-main);
  }

  .runner-tagline {
    font-size: 0.82rem;
    color: var(--text-muted);
    margin-top: 4px;
    line-height: 1.45;
  }

  .runner-meta {
    font-size: 0.66rem;
    color: var(--text-subtle);
    margin-top: 6px;
  }

  .runner-score {
    width: 58px;
    flex-shrink: 0;
    text-align: right;
    font-weight: 600;
    color: var(--text-main);
  }

  .runner-score span {
    color: var(--text-subtle);
  }

  .runner-actions {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }

  .also-considered {
    margin-top: var(--space-5);
    border-top: 1px solid var(--border-color);
    padding-top: var(--space-4);
  }

  .also-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: var(--space-3);
  }

  .also-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    border: 1px solid var(--border-color);
    background-color: var(--bg-secondary);
    padding: 5px 10px;
    font-size: 0.8rem;
    color: var(--text-muted);
    text-decoration: none;
    transition: border-color var(--dur-1) var(--ease-out), color var(--dur-1) var(--ease-out);
  }

  .also-chip:hover {
    border-color: var(--border-strong);
    color: var(--text-main);
  }

  .also-score {
    font-size: 0.68rem;
    color: var(--text-subtle);
  }

  @media (max-width: 900px) {
    .sheet-columns {
      grid-template-columns: 1fr;
    }

    .breakdown-block {
      border-left: none;
      border-top: 1px solid var(--border-color);
      padding-left: 0;
      padding-top: var(--space-5);
    }
  }

  @media (max-width: 720px) {
    .sheet {
      padding: var(--space-4);
    }

    .winner-name-row h1 {
      font-size: 1.6rem;
    }

    .score-block {
      text-align: left;
    }

    .runner-thumb {
      display: none;
    }

    .runner-actions {
      width: 100%;
      justify-content: flex-start;
    }
  }
</style>
