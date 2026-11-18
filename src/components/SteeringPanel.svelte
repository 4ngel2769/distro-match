<script>
  import Icon from './Icon.svelte';

  let { steering = {}, onSteeringChange, startOpen = true } = $props();

  // svelte-ignore state_referenced_locally
  let open = $state(startOpen);

  function updateField(key, val) {
    onSteeringChange({
      ...steering,
      [key]: val
    });
  }
</script>

<details class="tuning surface" bind:open aria-label="Fine-tune your results">
  <summary>
    <span class="summary-icon"><Icon name="sliders" size={17} /></span>
    <span class="summary-text">
      <strong>Fine-tune your results</strong>
      <small>Optional. Tell us what matters to you</small>
    </span>
    <span class="chevron" class:open><Icon name="chevron-down" size={16} /></span>
  </summary>

  <div class="tuning-grid">
    <div class="control">
      <label for="steer-scope">Which distros to consider</label>
      <select
        id="steer-scope"
        value={steering.scope || 'mainstream'}
        onchange={(e) => updateField('scope', e.target.value)}
      >
        <option value="mainstream">Popular and well-supported</option>
        <option value="all">Everything, including niche picks</option>
      </select>
    </div>

    <div class="control">
      <label for="steer-family">Preferred family</label>
      <select
        id="steer-family"
        value={steering.familyBias || 'all'}
        onchange={(e) => updateField('familyBias', e.target.value)}
      >
        <option value="all">No preference</option>
        <option value="Ubuntu">Ubuntu</option>
        <option value="Debian">Debian</option>
        <option value="Arch">Arch</option>
        <option value="Fedora/RHEL">Fedora / Red Hat</option>
        <option value="openSUSE">openSUSE</option>
        <option value="Independent">Independent</option>
      </select>
    </div>

    <div class="control">
      <label for="steer-gaming">Gaming</label>
      <select
        id="steer-gaming"
        value={steering.gamingBoost ? 'true' : 'false'}
        onchange={(e) => updateField('gamingBoost', e.target.value === 'true')}
      >
        <option value="false">Not a priority</option>
        <option value="true">Favour gaming distros</option>
      </select>
    </div>

    <div class="control">
      <label for="steer-nvidia">NVIDIA drivers</label>
      <select
        id="steer-nvidia"
        value={steering.nvidiaBoost ? 'true' : 'false'}
        onchange={(e) => updateField('nvidiaBoost', e.target.value === 'true')}
      >
        <option value="false">No preference</option>
        <option value="true">Favour easy NVIDIA setups</option>
      </select>
    </div>

    <div class="control">
      <label for="steer-snaps">Packaging</label>
      <select
        id="steer-snaps"
        value={steering.snapsPreference || 'neutral'}
        onchange={(e) => updateField('snapsPreference', e.target.value)}
      >
        <option value="neutral">No preference</option>
        <option value="avoid-snaps">Avoid Snaps</option>
      </select>
    </div>
  </div>
</details>

<style>
  .tuning {
    overflow: hidden;
  }

  summary {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-5);
    cursor: pointer;
    list-style: none;
    user-select: none;
  }

  summary::-webkit-details-marker {
    display: none;
  }

  .summary-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    flex-shrink: 0;
    color: var(--accent-ink);
    background-color: var(--accent-soft);
    border-radius: var(--radius-md);
  }

  .summary-text {
    display: flex;
    flex-direction: column;
    gap: 1px;
    flex: 1;
  }

  .summary-text strong {
    font-size: 0.96rem;
    font-weight: 700;
  }

  .summary-text small {
    font-size: 0.82rem;
    color: var(--text-muted);
  }

  .chevron {
    display: inline-flex;
    color: var(--text-subtle);
    transition: transform var(--dur-2) var(--ease-out);
  }

  .chevron.open {
    transform: rotate(180deg);
  }

  .tuning-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: var(--space-4);
    padding: 0 var(--space-5) var(--space-5);
  }

  .control {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    min-width: 0;
  }

  .control label {
    font-size: 0.8rem;
    font-weight: 650;
    color: var(--text-muted);
  }

  .control select {
    width: 100%;
    min-height: 42px;
    padding: 9px 12px;
    border: 1px solid var(--border-color);
    background-color: var(--bg-primary);
    color: var(--text-main);
    font-size: 0.84rem;
    line-height: 1.3;
    border-radius: var(--radius-md);
    transition: border-color var(--dur-1) var(--ease-out), box-shadow var(--dur-1) var(--ease-out);
  }

  .control select:hover {
    border-color: var(--border-strong);
  }

  .control select:focus-visible {
    outline: 2px solid var(--accent-color);
    outline-offset: 2px;
  }

  @media (max-width: 980px) {
    .tuning-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 560px) {
    .tuning-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
