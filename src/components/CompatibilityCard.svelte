<script>
  import { onMount } from 'svelte';
  import Icon from './Icon.svelte';
  import { loadSpecs } from '../lib/specState.js';
  import { compatibilityFor, describeSpecs } from '../lib/specMatching.js';

  let { distro, onNavigate = () => {} } = $props();

  let specs = $state(null);

  onMount(() => {
    specs = loadSpecs();
  });

  let result = $derived(specs && distro ? compatibilityFor(distro, specs) : null);
</script>

<section class="compat-card" aria-labelledby="compat-title">
  <div class="compat-head">
    <span class="compat-icon" aria-hidden="true"><Icon name="check" size={18} /></span>
    <div>
      <h2 id="compat-title">Will my computer run this well?</h2>
      <p>{specs ? 'Checked against the specs you saved.' : 'Add your specs once and check every distribution.'}</p>
    </div>
  </div>

  {#if !specs}
    <div class="compat-empty">
      <p>
        Tell us your processor, graphics card, memory and what you use the computer for.
        We will show a plain-language verdict here on every profile.
      </p>
      <button class="btn-secondary" onclick={() => onNavigate('welcome')}>Add my specs</button>
    </div>
  {:else}
    <p class="spec-line">{describeSpecs(specs)}</p>

    <div class="verdict" class:poor={result.tone === 'poor'}>
      <strong>{result.verdict}</strong>
      <span>{result.score}/100 fit</span>
    </div>
    <div class="meter" aria-hidden="true">
      <div class="meter-fill" class:poor={result.tone === 'poor'} style="transform: scaleX({result.score / 100})"></div>
    </div>

    {#if result.blockers.length}
      <ul class="detail-list blockers">
        {#each result.blockers as blocker}
          <li><Icon name="alert" size={14} /> {blocker}</li>
        {/each}
      </ul>
    {/if}

    <ul class="detail-list">
      {#each result.notes.slice(0, 5) as note}
        <li><Icon name="check" size={14} /> {note}</li>
      {/each}
    </ul>

    <button class="text-btn" onclick={() => onNavigate('welcome')}>Change my specs</button>
  {/if}
</section>

<style>
  .compat-card {
    border: 1px solid var(--border-color);
    background-color: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
    padding: var(--space-5);
  }

  .compat-head {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .compat-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 34px;
    height: 34px;
    border-radius: var(--radius-md);
    background-color: var(--accent-soft);
    color: var(--accent-ink);
  }

  .compat-head h2 {
    font-size: 1.05rem;
    font-weight: 750;
  }

  .compat-head p {
    font-size: 0.82rem;
    color: var(--text-muted);
    margin-top: 2px;
  }

  .compat-empty {
    margin-top: var(--space-4);
  }

  .compat-empty p {
    font-size: 0.88rem;
    color: var(--text-muted);
    line-height: 1.6;
    margin-bottom: var(--space-4);
  }

  .spec-line {
    margin-top: var(--space-4);
    font-size: 0.8rem;
    color: var(--text-subtle);
    line-height: 1.5;
  }

  .verdict {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-3);
    margin-top: var(--space-4);
  }

  .verdict strong {
    font-size: 1.05rem;
    color: var(--accent-ink);
  }

  .verdict span {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .verdict.poor strong {
    color: var(--accent-red);
  }

  .meter {
    height: 8px;
    margin-top: var(--space-2);
    background-color: var(--bg-tertiary);
    border-radius: var(--radius-pill);
    overflow: hidden;
  }

  .meter-fill {
    width: 100%;
    height: 100%;
    background-color: var(--accent-fill);
    border-radius: var(--radius-pill);
    transform-origin: left center;
    transition: transform var(--dur-3) var(--ease-out);
  }

  .meter-fill.poor {
    background-color: var(--accent-red);
  }

  .detail-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin-top: var(--space-4);
  }

  .detail-list li {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
    font-size: 0.86rem;
    line-height: 1.5;
    color: var(--text-muted);
  }

  .detail-list :global(svg) {
    color: var(--accent-color);
    margin-top: 2px;
  }

  .detail-list.blockers :global(svg) {
    color: var(--accent-red);
  }

  .text-btn {
    margin-top: var(--space-4);
    border: 0;
    background: transparent;
    color: var(--accent-ink);
    font-size: 0.84rem;
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 3px;
    padding: 0;
  }
</style>
