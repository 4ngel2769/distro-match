<script>
  let { steering = {}, onSteeringChange } = $props();

  function updateField(key, val) {
    onSteeringChange({
      ...steering,
      [key]: val
    });
  }
</script>

<div class="steering-panel-card">
  <div class="steering-title-row">
    <div class="steering-heading">
      <span style="color: var(--accent-color);">⚙</span>
      <span>REAL-TIME USER STEERING DIAL</span>
    </div>
    <span style="font-family: var(--font-label); font-size: 0.78rem; color: var(--text-subtle);">
      Adjust any lever to dynamically steer recommendation scores
    </span>
  </div>

  <div class="steering-grid">
    <div class="steering-item">
      <label for="steer-scope" class="steering-label">Distro Scope / Horizon:</label>
      <select
        id="steer-scope"
        class="steering-select"
        value={steering.scope || 'mainstream'}
        onchange={(e) => updateField('scope', e.target.value)}
      >
        <option value="mainstream">Mainstream & Flagships (Safe, Popular)</option>
        <option value="all">Unrestricted (Include Niche & Obscure Distros)</option>
      </select>
    </div>

    <div class="steering-item">
      <label for="steer-family" class="steering-label">Lineage / Family Bias:</label>
      <select
        id="steer-family"
        class="steering-select"
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

    <div class="steering-item">
      <label for="steer-gaming" class="steering-label">Gaming Optimization:</label>
      <select
        id="steer-gaming"
        class="steering-select"
        value={steering.gamingBoost ? 'true' : 'false'}
        onchange={(e) => updateField('gamingBoost', e.target.value === 'true')}
      >
        <option value="false">Standard Workloads</option>
        <option value="true">Boost Gaming Distros (Nobara, Bazzite, CachyOS)</option>
      </select>
    </div>

    <div class="steering-item">
      <label for="steer-nvidia" class="steering-label">NVIDIA Drivers:</label>
      <select
        id="steer-nvidia"
        class="steering-select"
        value={steering.nvidiaBoost ? 'true' : 'false'}
        onchange={(e) => updateField('nvidiaBoost', e.target.value === 'true')}
      >
        <option value="false">Standard Graphics</option>
        <option value="true">Prioritize Turnkey NVIDIA ISOs</option>
      </select>
    </div>

    <div class="steering-item">
      <label for="steer-snaps" class="steering-label">Packaging Stance:</label>
      <select
        id="steer-snaps"
        class="steering-select"
        value={steering.snapsPreference || 'neutral'}
        onchange={(e) => updateField('snapsPreference', e.target.value)}
      >
        <option value="neutral">Neutral (Any Package Format)</option>
        <option value="avoid-snaps">Avoid Snaps (Boost Mint, Pop, Nobara)</option>
      </select>
    </div>
  </div>
</div>
