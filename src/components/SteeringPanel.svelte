<script>
  import Icon from './Icon.svelte';

  let { steering = {}, onSteeringChange } = $props();

  function updateField(key, val) {
    onSteeringChange({
      ...steering,
      [key]: val
    });
  }
</script>

<section class="instrument surface" aria-label="Refine the field">
  <div class="instrument-head">
    <div class="instrument-title">
      <Icon name="sliders" size={14} />
      <h2>Refine the field</h2>
    </div>
    <span class="field-label">Optional</span>
  </div>

  <div class="instrument-grid">
    <div class="control">
      <label for="steer-scope" class="field-label">Scope</label>
      <select
        id="steer-scope"
        value={steering.scope || 'mainstream'}
        onchange={(e) => updateField('scope', e.target.value)}
      >
        <option value="mainstream">Mainstream &amp; Flagships (Safe, Popular)</option>
        <option value="all">Unrestricted (Include Niche &amp; Obscure Distros)</option>
      </select>
    </div>

    <div class="control">
      <label for="steer-family" class="field-label">Lineage</label>
      <select
        id="steer-family"
        value={steering.familyBias || 'all'}
        onchange={(e) => updateField('familyBias', e.target.value)}
      >
        <option value="all">Any Lineage (Neutral)</option>
        <option value="Ubuntu">Ubuntu Family</option>
        <option value="Debian">Debian Family</option>
        <option value="Arch">Arch Family</option>
        <option value="Fedora/RHEL">Fedora / Red Hat Family</option>
        <option value="openSUSE">openSUSE Family</option>
        <option value="Independent">Independent / Built From Scratch</option>
      </select>
    </div>

    <div class="control">
      <label for="steer-gaming" class="field-label">Gaming</label>
      <select
        id="steer-gaming"
        value={steering.gamingBoost ? 'true' : 'false'}
        onchange={(e) => updateField('gamingBoost', e.target.value === 'true')}
      >
        <option value="false">Standard Workloads</option>
        <option value="true">Boost Gaming Distros (Nobara, Bazzite, CachyOS)</option>
      </select>
    </div>

    <div class="control">
      <label for="steer-nvidia" class="field-label">NVIDIA</label>
      <select
        id="steer-nvidia"
        value={steering.nvidiaBoost ? 'true' : 'false'}
        onchange={(e) => updateField('nvidiaBoost', e.target.value === 'true')}
      >
        <option value="false">Standard Graphics</option>
        <option value="true">Prioritize Turnkey NVIDIA ISOs</option>
      </select>
    </div>

    <div class="control">
      <label for="steer-snaps" class="field-label">Packaging</label>
      <select
        id="steer-snaps"
        value={steering.snapsPreference || 'neutral'}
        onchange={(e) => updateField('snapsPreference', e.target.value)}
      >
        <option value="neutral">Neutral (Any Package Format)</option>
        <option value="avoid-snaps">Avoid Snaps (Boost Mint, Pop, Nobara)</option>
      </select>
    </div>
  </div>
</section>

<style>
  .instrument-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-5);
    background-color: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
  }

  .instrument-title {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--text-main);
  }

  .instrument-title h2 {
    font-size: 0.95rem;
    font-weight: 700;
  }

  .instrument-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    padding: var(--space-5);
  }

  .control {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    min-width: 0;
  }

  .control select {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid var(--border-color);
    background-color: var(--bg-primary);
    color: var(--text-main);
    font-family: var(--font-sans);
    font-size: 0.78rem;
    line-height: 1.3;
    transition: border-color var(--dur-1) var(--ease-out),
      background-color var(--dur-1) var(--ease-out);
  }

  .control select:hover {
    border-color: var(--border-strong);
  }

  .control select:focus-visible {
    outline: 2px solid var(--accent-color);
    outline-offset: 1px;
  }

  @media (min-width: 981px) {
    .control {
      padding: 0 var(--space-4);
      border-left: 1px solid var(--border-color);
    }

    .control:first-child {
      padding-left: 0;
      border-left: 0;
    }
  }

  @media (max-width: 980px) {
    .instrument-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--space-4) 0;
    }

    .control {
      padding: 0 var(--space-4);
      border-left: 1px solid var(--border-color);
    }

    .control:nth-child(3n + 1) {
      padding-left: 0;
      border-left: 0;
    }
  }

  @media (max-width: 640px) {
    .instrument-grid {
      grid-template-columns: 1fr;
      gap: var(--space-4);
    }

    .control,
    .control:nth-child(3n + 1) {
      padding: var(--space-3) 0 0;
      border-left: 0;
      border-top: 1px solid var(--border-color);
    }

    .control:first-child {
      padding-top: 0;
      border-top: 0;
    }
  }
</style>
