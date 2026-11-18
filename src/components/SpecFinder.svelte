<script>
  import { onMount } from 'svelte';
  import SearchableSelect from './SearchableSelect.svelte';
  import DistroLogo from './DistroLogo.svelte';
  import Icon from './Icon.svelte';
  import { NEEDS, PLATFORMS } from '../data/specOptions.js';
  import {
    CPU_BRANDS,
    RAM_OPTIONS,
    loadGenerations,
    loadCpus,
    loadGpus,
    igpuProfile
  } from '../data/hardware/index.js';
  import {
    loadSpecs,
    saveSpecs,
    clearSpecs,
    getActivePlatform,
    setActivePlatform,
    hasSpecsFor
  } from '../lib/specState.js';
  import { recommendBySpecs, describeSpecs } from '../lib/specMatching.js';

  let { onOpenDistro = () => {} } = $props();

  let savedSpecs = $state(null);
  let results = $state([]);
  let showResults = $state(false);
  let error = $state('');
  let platformMessage = $state('');
  let savedPlatforms = $state([]);

  let needs = $state([]);
  let platform = $state('laptop');
  let cpuBrand = $state('');
  let cpuGeneration = $state('');
  let cpuId = $state('');
  let gpuId = $state('');
  let ramValue = $state('');

  let generations = $state([]);
  let cpus = $state([]);
  let gpuOptions = $state([]);
  let gpuCatalog = $state(null);
  let loadingGenerations = $state(false);
  let loadingCpus = $state(false);
  let loadingGpus = $state(false);

  const ramOptions = RAM_OPTIONS.map((item) => ({
    value: String(item.value),
    label: item.label,
    note: item.note
  }));

  let generationOptions = $derived(
    generations.map((item) => ({ value: item.id, label: item.label, note: String(item.year) }))
  );
  let cpuOptions = $derived(
    cpus.map((cpu) => ({
      value: cpu.id,
      label: cpu.name,
      note: `${cpu.cores} cores · ${cpu.igpu && cpu.igpu !== 'None' ? cpu.igpu + ' · ' : ''}performance ${cpu.score}`
    }))
  );

  let cpu = $derived(cpus.find((item) => item.id === cpuId) || null);

  let brandOptions = $derived(
    CPU_BRANDS
      .filter((brand) => {
        if (platform === 'handheld') return brand.id === 'intel' || brand.id === 'amd';
        if (platform === 'arm-board') return brand.id === 'arm';
        return true;
      })
      .map((brand) => ({ value: brand.id, label: brand.label }))
  );

  let gpuOptionsWithIntegrated = $derived([
    ...(cpu?.igpu && cpu.igpu !== 'None'
      ? [{ value: 'integrated', label: "Use my CPU's graphics", note: cpu.igpu }]
      : []),
    ...gpuOptions
  ]);

  $effect(() => {
    if (!cpuBrand) {
      generations = [];
      return;
    }
    let stale = false;
    loadingGenerations = true;
    loadGenerations(cpuBrand).then((list) => {
      if (stale) return;
      generations = list;
      loadingGenerations = false;
    });
    return () => { stale = true; };
  });

  $effect(() => {
    if (!cpuBrand || !cpuGeneration) {
      cpus = [];
      return;
    }
    let stale = false;
    loadingCpus = true;
    loadCpus(cpuBrand, cpuGeneration).then((list) => {
      if (stale) return;
      cpus = list;
      loadingCpus = false;
    });
    return () => { stale = true; };
  });

  function ensureGpus() {
    if (gpuOptions.length || loadingGpus) return;
    loadingGpus = true;
    loadGpus().then((list) => {
      gpuCatalog = list;
      gpuOptions = list.map((gpu) => ({
        value: gpu.id,
        label: gpu.name,
        note: `${gpu.brand} · ${gpu.vram ? `${gpu.vram} GB` : 'integrated'}`
      }));
      loadingGpus = false;
    });
  }

  function resetForm() {
    needs = [];
    cpuBrand = '';
    cpuGeneration = '';
    cpuId = '';
    gpuId = '';
    ramValue = '';
    results = [];
    showResults = false;
    error = '';
  }

  function refreshSavedPlatforms() {
    savedPlatforms = PLATFORMS.filter((item) => hasSpecsFor(item.id)).map((item) => item.id);
  }

  function applyStoredSpecs(targetPlatform) {
    resetForm();
    refreshSavedPlatforms();
    const stored = loadSpecs(targetPlatform);
    savedSpecs = stored;
    if (!stored) {
      platformMessage = `No specs saved for ${targetPlatform} yet. Add them below and they will be kept separately.`;
      return;
    }
    needs = Array.isArray(stored.needs) ? [...stored.needs] : [];
    ramValue = String(stored.ramGB || '');
    cpuBrand = stored.cpu?.brand || '';
    cpuGeneration = stored.cpu?.generation || '';
    cpuId = stored.cpu?.id || '';
    gpuId = stored.gpu?.id || '';
    platformMessage = `Loaded your saved ${targetPlatform} specs.`;
    if (gpuId && gpuId !== 'integrated') ensureGpus();
  }

  onMount(() => {
    platform = getActivePlatform();
    applyStoredSpecs(platform);
  });

  function toggleNeed(id) {
    needs = needs.includes(id) ? needs.filter((item) => item !== id) : [...needs, id];
  }

  function setPlatform(next) {
    if (next === platform) return;
    platform = next;
    setActivePlatform(next);
    applyStoredSpecs(next);
  }

  function handleBrandChange() {
    cpuGeneration = '';
    cpuId = '';
    if (gpuId === 'integrated') gpuId = '';
  }

  function handleGenerationChange() {
    cpuId = '';
    if (gpuId === 'integrated') gpuId = '';
  }

  function ramToNumber(value) {
    const match = String(value || '').match(/\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : NaN;
  }

  function submit() {
    error = '';
    const ramGB = ramToNumber(ramValue);
    if (!needs.length) {
      error = 'Pick at least one thing you will use the computer for.';
      return;
    }
    if (!cpuId) {
      error = 'Choose a processor brand, generation and model.';
      return;
    }
    if (!gpuId) {
      error = 'Choose a graphics card, or pick “Not sure”.';
      return;
    }
    if (!Number.isFinite(ramGB) || ramGB <= 0) {
      error = 'Choose a memory size or type your own, for example 12 GB.';
      return;
    }

    const selectedCpu = cpus.find((item) => item.id === cpuId);
    let gpu;
    if (gpuId === 'integrated') {
      const profile = igpuProfile(selectedCpu?.igpu);
      gpu = {
        id: 'integrated',
        name: selectedCpu?.igpu || 'Integrated graphics',
        brand: 'Integrated',
        score: profile.score,
        vram: 0,
        proprietary: false,
        integrated: true
      };
    } else {
      gpu = gpuCatalog?.find((item) => item.id === gpuId);
    }
    if (!selectedCpu || !gpu) {
      error = 'We could not read that hardware choice. Please pick it again.';
      return;
    }

    const specs = {
      needs: [...needs],
      platform,
      cpu: {
        id: selectedCpu.id,
        name: selectedCpu.name,
        brand: cpuBrand,
        generation: cpuGeneration,
        arch: selectedCpu.arch,
        score: selectedCpu.score,
        cores: selectedCpu.cores,
        igpu: selectedCpu.igpu
      },
      gpu: {
        id: gpu.id,
        name: gpu.name,
        brand: gpu.brand,
        score: gpu.score,
        vram: gpu.vram,
        proprietary: gpu.proprietary
      },
      ramGB
    };

    saveSpecs(specs);
    refreshSavedPlatforms();
    savedSpecs = specs;
    results = recommendBySpecs(specs, 5);
    showResults = true;
  }

  function handleClear() {
    clearSpecs(platform);
    applyStoredSpecs(platform);
  }

  function openProfile(event, id) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button === 1) return;
    event.preventDefault();
    onOpenDistro(id);
  }
</script>

<section class="spec-finder" aria-labelledby="spec-finder-title">
  <div class="spec-head">
    <div>
      <h2 id="spec-finder-title">Find a distro for your computer</h2>
      <p>
        Tell us what you do and what is inside your machine. We will rank distributions that
        fit and tell you how well each one should run.
      </p>
    </div>
  </div>

  <div class="spec-form">
    <div class="field-block">
      <span class="block-label">What will you use it for?</span>
      <div class="chip-row" role="group" aria-label="What you will use the computer for">
        {#each NEEDS as need}
          <button
            type="button"
            class="choice-chip"
            class:active={needs.includes(need.id)}
            aria-pressed={needs.includes(need.id)}
            title={need.note}
            onclick={() => toggleNeed(need.id)}
          >{need.label}</button>
        {/each}
      </div>
    </div>

    <div class="field-block">
      <span class="block-label">What kind of computer?</span>
      <div class="chip-row" role="group" aria-label="Computer type">
        {#each PLATFORMS as item}
          <button
            type="button"
            class="choice-chip"
            class:active={platform === item.id}
            aria-pressed={platform === item.id}
            title={item.note}
            onclick={() => setPlatform(item.id)}
          >{item.label}</button>
        {/each}
      </div>
      {#if platform === 'arm-board'}
        <p class="platform-note">ARM boards only list ARM processors. Apple M-series chips are not board CPUs.</p>
      {:else if platform === 'handheld'}
        <p class="platform-note">Handhelds use x86 processors from Intel or AMD, not Apple M-series chips.</p>
      {/if}
      {#if savedPlatforms.length}
        <p class="saved-platforms">
          Saved for:
          {#each savedPlatforms as saved}
            <button
              type="button"
              class:active={saved === platform}
              onclick={() => setPlatform(saved)}
            >{PLATFORMS.find((item) => item.id === saved)?.label || saved}</button>
          {/each}
        </p>
      {/if}
    </div>

    <div class="spec-grid">
      <SearchableSelect
        id="cpu-brand"
        label="Processor brand"
        placeholder="Choose a brand"
        options={brandOptions}
        bind:value={cpuBrand}
        onChange={handleBrandChange}
      />
      <SearchableSelect
        id="cpu-generation"
        label="Generation"
        placeholder={cpuBrand ? 'Choose a generation' : 'Choose a brand first'}
        options={generationOptions}
        bind:value={cpuGeneration}
        loading={loadingGenerations}
        disabled={!cpuBrand}
        onChange={handleGenerationChange}
      />
      <SearchableSelect
        id="cpu-model"
        label="Processor"
        placeholder={cpuGeneration ? 'Choose a processor' : 'Choose a generation first'}
        options={cpuOptions}
        bind:value={cpuId}
        loading={loadingCpus}
        disabled={!cpuGeneration}
      />
      <SearchableSelect
        id="gpu-model"
        label="Graphics card"
        placeholder="Search GPUs"
        options={gpuOptionsWithIntegrated}
        bind:value={gpuId}
        loading={loadingGpus}
        onOpen={ensureGpus}
      />
      <SearchableSelect
        id="ram-size"
        label="Memory"
        placeholder="Search or type a value"
        options={ramOptions}
        bind:value={ramValue}
        allowCustom={true}
      />
    </div>

    <div class="spec-actions">
      <button class="btn-primary" onclick={submit}>
        Show my matches <Icon name="arrow-right" size={15} />
      </button>
      {#if savedSpecs}
        <button class="text-btn" onclick={handleClear}>Forget {platform} specs</button>
      {/if}
      {#if error}
        <p class="spec-error" role="alert">{error}</p>
      {/if}
    </div>
  </div>

  {#if platformMessage}
    <p class="saved-note">{platformMessage}</p>
  {/if}
  {#if savedSpecs && describeSpecs(savedSpecs)}
    <p class="saved-note"><strong>{platform}</strong> specs: {describeSpecs(savedSpecs)}</p>
  {/if}

  {#if showResults}
    {#if results.length}
      <div class="spec-results">
        <h3>Best matches for your setup</h3>
        <div class="result-list">
          {#each results as result (result.distro.id)}
            <a
              class="result-row"
              href={`/distro/${result.distro.id}/`}
              onclick={(event) => openProfile(event, result.distro.id)}
            >
              <DistroLogo distro={result.distro} size={38} decorative={true} />
              <span class="result-main">
                <strong>{result.distro.name}</strong>
                <span class="result-reasons">{result.reasons.join(' · ') || result.distro.tagline}</span>
                <span class="compat-badge" class:great={result.compatibility.tone === 'great'}
                  class:good={result.compatibility.tone === 'good'}
                  class:okay={result.compatibility.tone === 'okay'}
                  class:poor={result.compatibility.tone === 'poor'}>
                  {result.compatibility.verdict}
                </span>
              </span>
              <span class="result-score">{result.matchPercentage}%</span>
              <Icon name="chevron-right" size={16} />
            </a>
          {/each}
        </div>
        <p class="results-foot">Open any match to see the full “Will my computer run this well?” breakdown.</p>
      </div>
    {:else}
      <div class="no-results">
        <Icon name="info" size={18} />
        <p>No distribution clears every hardware check. Try a lower memory value or a different platform.</p>
      </div>
    {/if}
  {/if}
</section>

<style>
  .spec-finder {
    padding: var(--space-6);
    margin-bottom: var(--space-5);
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
  }

  .spec-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-4);
  }

  .spec-head h2 {
    font-size: 1.3rem;
    font-weight: 750;
    letter-spacing: -0.02em;
  }

  .spec-head p {
    color: var(--text-muted);
    font-size: 0.94rem;
    max-width: 70ch;
    margin-top: 6px;
  }

  .spec-form {
    margin-top: var(--space-5);
  }

  .field-block {
    margin-bottom: var(--space-4);
  }

  .block-label {
    display: block;
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-muted);
    margin-bottom: var(--space-2);
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .platform-note {
    margin-top: var(--space-2);
    font-size: 0.78rem;
    color: var(--text-muted);
  }

  .saved-platforms {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-top: var(--space-2);
    font-size: 0.78rem;
    color: var(--text-muted);
  }

  .saved-platforms button {
    border: 1px solid var(--border-color);
    background-color: var(--bg-primary);
    color: var(--text-muted);
    font-size: 0.76rem;
    font-weight: 600;
    padding: 3px 9px;
    border-radius: var(--radius-pill);
  }

  .saved-platforms button.active {
    border-color: var(--accent-color);
    background-color: var(--accent-soft);
    color: var(--accent-ink);
  }

  .choice-chip {
    padding: 8px 14px;
    min-height: 38px;
    font-size: 0.84rem;
    font-weight: 600;
    color: var(--text-muted);
    background-color: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-pill);
    transition: background-color var(--dur-1) var(--ease-out), border-color var(--dur-1) var(--ease-out), color var(--dur-1) var(--ease-out);
  }

  .choice-chip:hover {
    border-color: var(--accent-color);
    color: var(--text-main);
  }

  .choice-chip.active {
    background-color: var(--accent-fill);
    border-color: var(--accent-fill);
    color: var(--accent-contrast);
  }

  .spec-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: var(--space-3);
    margin-top: var(--space-5);
  }

  .spec-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-4);
    margin-top: var(--space-5);
  }

  .text-btn {
    border: 0;
    background: transparent;
    color: var(--accent-ink);
    font-size: 0.84rem;
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 3px;
    padding: 6px 4px;
  }

  .spec-error {
    font-size: 0.86rem;
    color: var(--accent-red);
  }

  .saved-note {
    margin-top: var(--space-4);
    font-size: 0.82rem;
    color: var(--text-subtle);
  }

  .spec-results {
    margin-top: var(--space-5);
    padding-top: var(--space-5);
    border-top: 1px solid var(--border-color);
  }

  .spec-results h3 {
    font-size: 1.05rem;
    font-weight: 750;
    margin-bottom: var(--space-3);
  }

  .result-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .result-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background-color: var(--bg-primary);
    color: var(--text-main);
    text-decoration: none;
    transition: border-color var(--dur-1) var(--ease-out), transform var(--dur-1) var(--ease-spring), box-shadow var(--dur-1) var(--ease-out);
  }

  .result-row:hover {
    border-color: var(--accent-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-card);
  }

  .result-main {
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex: 1;
    min-width: 0;
  }

  .result-main strong {
    font-size: 0.96rem;
  }

  .result-reasons {
    font-size: 0.8rem;
    color: var(--text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .compat-badge {
    align-self: flex-start;
    font-size: 0.72rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: var(--radius-pill);
  }

  .compat-badge.great { background-color: var(--tier-flagship-bg); color: var(--tier-flagship-text); }
  .compat-badge.good { background-color: var(--tier-specialist-bg); color: var(--tier-specialist-text); }
  .compat-badge.okay { background-color: var(--tag-neutral-bg); color: var(--tag-neutral-text); }
  .compat-badge.poor { background-color: rgba(200, 72, 78, 0.14); color: var(--accent-red); }

  .result-score {
    font-family: var(--font-mono);
    font-size: 0.86rem;
    font-weight: 600;
    color: var(--accent-ink);
  }

  .results-foot {
    margin-top: var(--space-3);
    font-size: 0.8rem;
    color: var(--text-subtle);
  }

  .no-results {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    margin-top: var(--space-5);
    padding: var(--space-4);
    background-color: var(--bg-secondary);
    border-radius: var(--radius-md);
    color: var(--text-muted);
    font-size: 0.9rem;
  }

  @media (max-width: 1080px) {
    .spec-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 700px) {
    .spec-finder {
      padding: var(--space-4);
    }

    .spec-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 480px) {
    .spec-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
