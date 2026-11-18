<script>
  import { onMount } from 'svelte';
  import { LINUX_DISTROS } from '../data/distros.js';
  import { POPULARITY_YEARS } from '../data/distroFacts.js';
  import { USE_CASE_PAGES, landingPath } from '../data/landingPages.js';
  import DistroLogo from './DistroLogo.svelte';
  import DistroScreenshot from './DistroScreenshot.svelte';
  import Icon from './Icon.svelte';
  import { loadSpecs } from '../lib/specState.js';
  import { compatibilityFor } from '../lib/specMatching.js';

  let { onSelectForCompare, onOpenDistro } = $props();

  let specs = $state(null);
  let compatByDistro = $derived.by(() => {
    const map = new Map();
    if (specs) {
      for (const distro of filteredDistros) map.set(distro.id, compatibilityFor(distro, specs));
    }
    return map;
  });

  onMount(() => {
    specs = loadSpecs();
  });

  let searchQuery = $state('');
  let selectedFamily = $state('all');
  let sortBy = $state('popularity'); // popularity | age | updated | alphabetical
  let selectedYear = $state('current'); // current | 2025 | ... | 2021
  let sortDir = $state('asc'); // used by age / updated

  const families = ['all', 'Ubuntu', 'Debian', 'Arch', 'Fedora/RHEL', 'openSUSE', 'Gentoo', 'Slackware', 'Independent'];

  let hasFilters = $derived(Boolean(searchQuery.trim()) || selectedFamily !== 'all');

  function resetFilters() {
    searchQuery = '';
    selectedFamily = 'all';
  }

  function rankFor(distro, year = selectedYear) {
    if (year === 'current') return distro.dwRank ?? null;
    return distro.rankHistory?.[year] ?? null;
  }

  function yearLabel(year = selectedYear) {
    return year === 'current' ? 'Current' : String(year);
  }

  function setSort(next) {
    sortBy = next;
    if (next === 'age') sortDir = 'asc';
    else if (next === 'updated') sortDir = 'desc';
  }

  function rankLabel(distro) {
    const rank = rankFor(distro);
    if (!rank) return 'Unranked';
    return selectedYear === 'current' ? `#${rank} DistroWatch` : `#${rank} in ${selectedYear}`;
  }

  let filteredDistros = $derived.by(() => {
    const query = searchQuery.toLowerCase().trim();
    const byFamily = (distro) => selectedFamily === 'all' || distro.family === selectedFamily;
    const missingLast = (value, fallback) => (value == null ? fallback : value);
    const byPopularity = (a, b) =>
      missingLast(rankFor(a), Number.POSITIVE_INFINITY) -
        missingLast(rankFor(b), Number.POSITIVE_INFINITY) ||
      a.name.localeCompare(b.name);

    let list;

    if (query) {
      // A name match wins outright. Only when nothing matches a name do we
      // look at taglines, packages, desktops and the other descriptive fields.
      const nameMatches = LINUX_DISTROS.filter(
        (distro) => byFamily(distro) && distro.name.toLowerCase().includes(query)
      );
      if (nameMatches.length) {
        return [...nameMatches].sort((a, b) => {
          const aStarts = a.name.toLowerCase().startsWith(query) ? 0 : 1;
          const bStarts = b.name.toLowerCase().startsWith(query) ? 0 : 1;
          return aStarts - bStarts || byPopularity(a, b);
        });
      }

      list = LINUX_DISTROS.filter(
        (distro) =>
          byFamily(distro) &&
          (distro.tagline.toLowerCase().includes(query) ||
            distro.packageManager.toLowerCase().includes(query) ||
            distro.initSystem.toLowerCase().includes(query) ||
            distro.family.toLowerCase().includes(query) ||
            (distro.desktopEnvironments || []).some((de) => de.toLowerCase().includes(query)) ||
            (distro.specialFeatures || []).some((feature) => feature.toLowerCase().includes(query)) ||
            (distro.primaryUseCases || []).some((useCase) => useCase.toLowerCase().includes(query)))
      );
    } else {
      list = LINUX_DISTROS.filter(byFamily);
    }

    const direction = sortDir === 'asc' ? 1 : -1;

    if (sortBy === 'alphabetical') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sortBy === 'popularity') {
      return [...list].sort(byPopularity);
    }

    const key = sortBy === 'age' ? 'firstRelease' : 'latestRelease';
    return [...list].sort((a, b) => {
      const aMissing = !a[key];
      const bMissing = !b[key];
      if (aMissing !== bMissing) return aMissing ? 1 : -1;
      if (aMissing) return a.name.localeCompare(b.name);
      const da = Date.parse(a[key]);
      const db = Date.parse(b[key]);
      return (da - db) * direction || a.name.localeCompare(b.name);
    });
  });

  function mediaAspect(distro) {
    const ratio = Number(distro.screenshotAspect) || 16 / 10;
    return Math.min(1.8, Math.max(1.35, ratio)).toFixed(3);
  }

  function primaryPackageManager(value) {
    // Card specs are deliberately terse; the full, multi-part value lives in
    // the title attribute and on the detail page.
    return (value || '').split('/')[0].trim() || 'Not listed';
  }

  function handleClick(event, distro) {
    // Respect open-in-new-tab / new-window / middle click.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button === 1) return;
    event.preventDefault();
    onOpenDistro?.(distro.id);
  }
</script>

<div class="page-container">
  <section class="toolbar surface" aria-label="Directory controls">
    <div class="toolbar-top">
      <div class="toolbar-intro">
        <h1 class="directory-title">Find your next Linux distro</h1>
        <p class="directory-sub">
          Browse {LINUX_DISTROS.length} distributions. Each one has a real screenshot and a full profile.
          Click any card to take a closer look.
        </p>
      </div>
      <div class="result-badge" aria-live="polite">
        <strong>{filteredDistros.length}</strong>
        <span>of {LINUX_DISTROS.length} shown</span>
      </div>
    </div>

    <div class="toolbar-controls">
      <div class="search-row">
        <div class="search-group">
          <label class="control-label" for="directory-search">Search the catalogue</label>
          <div class="search-field">
            <span class="search-icon" aria-hidden="true"><Icon name="search" size={17} /></span>
            <input
              id="directory-search"
              type="text"
              bind:value={searchQuery}
              class="search-input"
              placeholder="Name, family, desktop or feature"
              aria-label="Search distributions"
            />
            {#if searchQuery}
              <button class="clear-btn" onclick={() => (searchQuery = '')} aria-label="Clear search">
                <Icon name="close" size={14} />
              </button>
            {/if}
          </div>
        </div>

        <div class="sort-group">
          <span class="control-label">Sort by</span>
          <div class="sort-row">
            <div class="sort-buttons" role="group" aria-label="Sort distributions">
              <button
                class="sort-btn"
                class:active={sortBy === 'popularity'}
                aria-pressed={sortBy === 'popularity'}
                onclick={() => setSort('popularity')}
              >
                Popularity
              </button>
              <button
                class="sort-btn"
                class:active={sortBy === 'age'}
                aria-pressed={sortBy === 'age'}
                onclick={() => setSort('age')}
              >
                Age
              </button>
              <button
                class="sort-btn"
                class:active={sortBy === 'updated'}
                aria-pressed={sortBy === 'updated'}
                onclick={() => setSort('updated')}
              >
                Updated
              </button>
              <button
                class="sort-btn"
                class:active={sortBy === 'alphabetical'}
                aria-pressed={sortBy === 'alphabetical'}
                onclick={() => setSort('alphabetical')}
              >
                A to Z
              </button>
            </div>

            {#if sortBy === 'popularity'}
              <label class="year-field">
                <span>Year</span>
                <select class="sort-select" bind:value={selectedYear} aria-label="Popularity year">
                  <option value="current">Current</option>
                  {#each [...POPULARITY_YEARS].reverse() as year}
                    <option value={year}>{year}</option>
                  {/each}
                </select>
              </label>
            {:else if sortBy === 'age' || sortBy === 'updated'}
              <button
                class="sort-dir"
                aria-label="Reverse sort direction"
                onclick={() => (sortDir = sortDir === 'asc' ? 'desc' : 'asc')}
              >
                <Icon name="swap" size={13} />
                <span>{sortDir === 'asc' ? 'Oldest first' : 'Newest first'}</span>
              </button>
            {/if}
          </div>
        </div>
      </div>

      <div class="filter-row">
        <span class="control-label">Family</span>
        <div class="filter-pills" role="group" aria-label="Filter by family">
          {#each families as fam}
            <button
              class="filter-pill"
              class:active={selectedFamily === fam}
              aria-pressed={selectedFamily === fam}
              onclick={() => (selectedFamily = fam)}
            >
              {fam === 'all' ? 'All families' : fam}
            </button>
          {/each}
        </div>
        {#if hasFilters}
          <button class="clear-filters" onclick={resetFilters}>Clear filters</button>
        {/if}
      </div>
    </div>

    <div class="toolbar-foot">
      <p class="result-count">
        Showing {filteredDistros.length} of {LINUX_DISTROS.length}, sorted by {sortBy === 'popularity'
          ? `popularity (${yearLabel()})`
          : sortBy === 'age'
            ? `age (${sortDir === 'asc' ? 'oldest' : 'newest'} first)`
            : sortBy === 'updated'
              ? `last update (${sortDir === 'desc' ? 'newest' : 'oldest'} first)`
              : 'name'}.
      </p>
      <nav class="browse-hubs" aria-label="Use case guides">
        <span class="browse-label">Browse by use case</span>
        <div class="hub-links">
          {#each USE_CASE_PAGES as useCase}
            <a class="hub-link" href={landingPath('use-case', useCase.slug)}>{useCase.label}</a>
          {/each}
        </div>
      </nav>
    </div>
  </section>

  {#if filteredDistros.length === 0}
    <div class="empty-state">
      <h2>Nothing fits that filter</h2>
      <p>Try a broader search term or reset the family filter.</p>
      <button class="reset-btn" onclick={resetFilters}>Reset filters</button>
    </div>
  {:else}
    <div class="directory-cards-grid stagger-in">
      {#each filteredDistros as distro (distro.id)}
        <a
          class="distro-card"
          href={`/distro/${distro.id}/`}
          onclick={(event) => handleClick(event, distro)}
          aria-label={`Open the ${distro.name} profile`}
        >
          <div
            class="card-media"
            style="aspect-ratio: {mediaAspect(distro)}; --shot-url: url('{distro.screenshotUrl || ''}')"
          >
            <span class="card-blur" aria-hidden="true"></span>
            <DistroScreenshot {distro} height={190} compact={true} fit="contain" showName={false} />
            <span class="tier-badge tier-{distro.tier} card-tier">{distro.tier}</span>
          </div>

          <div class="card-body">
            <div class="card-title-row">
              <DistroLogo {distro} size={34} decorative={true} />
              <div class="card-title-text">
                <strong class="card-distro-name">{distro.name}</strong>
                <span class="card-subline">
                  {distro.family} <span class="card-rank">· {rankLabel(distro)}</span>
                </span>
              </div>
              {#if compatByDistro.get(distro.id)}
                {@const compat = compatByDistro.get(distro.id)}
                <span
                  class="card-compat"
                  class:great={compat.tone === 'great'}
                  class:good={compat.tone === 'good'}
                  class:okay={compat.tone === 'okay'}
                  class:poor={compat.tone === 'poor'}
                  title="Compatibility with your saved specs"
                >{compat.verdict}</span>
              {/if}
            </div>
            <p class="card-tagline">{distro.tagline}</p>
            <div class="card-facts">
              <span><small>Packages</small><b>{primaryPackageManager(distro.packageManager)}</b></span>
              <span><small>Release</small><b>{distro.releaseModel}</b></span>
              <span><small>Memory</small><b>{distro.recommendedRam}</b></span>
            </div>
          </div>

          <div class="card-footer">
            <span>View profile</span>
            <span class="card-arrow" aria-hidden="true"><Icon name="arrow-right" size={15} /></span>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>

<style>
  /* ---------- Toolbar ---------- */
  .toolbar {
    border: 1px solid var(--border-color);
    background-color: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
    padding: var(--space-6);
    margin-bottom: var(--space-5);
  }

  .toolbar-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-5);
  }

  .toolbar-intro {
    flex: 1;
    min-width: 0;
  }

  .directory-title {
    font-size: 1.8rem;
    font-weight: 750;
    letter-spacing: -0.02em;
    line-height: 1.15;
  }

  .directory-sub {
    color: var(--text-muted);
    font-size: 0.94rem;
    max-width: 68ch;
    line-height: 1.6;
    margin-top: 6px;
  }

  .result-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    min-width: 118px;
    padding: 10px 16px;
    background-color: var(--accent-soft);
    border-radius: var(--radius-md);
    color: var(--accent-ink);
  }

  .result-badge strong {
    font-size: 1.5rem;
    font-weight: 750;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
  }

  .result-badge span {
    font-size: 0.78rem;
    font-weight: 600;
  }

  .toolbar-controls {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    margin-top: var(--space-6);
  }

  .search-row {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
    gap: var(--space-5);
    align-items: start;
  }

  .search-group,
  .sort-group {
    min-width: 0;
  }

  .control-label {
    display: block;
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-muted);
    margin-bottom: 8px;
  }

  .search-field {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    border: 1px solid var(--border-color);
    background-color: var(--bg-primary);
    padding: 0 var(--space-4);
    border-radius: var(--radius-md);
    transition: border-color var(--dur-1) var(--ease-out), box-shadow var(--dur-1) var(--ease-out);
  }

  .search-field:focus-within {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px var(--accent-wash);
  }

  .search-icon {
    color: var(--text-subtle);
    display: inline-flex;
  }

  .search-input {
    flex: 1;
    min-width: 0;
    height: 40px;
    border: none;
    outline: none;
    background: transparent;
    color: var(--text-main);
    font-family: var(--font-sans);
    font-size: 0.9rem;
  }

  .search-input::placeholder {
    color: var(--text-subtle);
  }

  .clear-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border: 0;
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--text-subtle);
    transition: color var(--dur-1) var(--ease-out), background-color var(--dur-1) var(--ease-out);
  }

  .clear-btn:hover {
    background-color: var(--bg-tertiary);
  }

  .clear-btn:hover {
    color: var(--text-main);
    border-color: var(--border-color);
  }

  .sort-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
  }

  .sort-buttons,
  .filter-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .sort-btn,
  .filter-pill {
    font-family: var(--font-sans);
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-muted);
    background-color: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-pill);
    padding: 7px 14px;
    transition: background-color var(--dur-1) var(--ease-out),
      border-color var(--dur-1) var(--ease-out), color var(--dur-1) var(--ease-out), transform var(--dur-1) var(--ease-spring);
  }

  .sort-btn:hover,
  .filter-pill:hover {
    border-color: var(--border-strong);
    color: var(--text-main);
    background-color: var(--surface-hover);
  }

  .sort-btn.active,
  .filter-pill.active {
    background-color: var(--accent-fill);
    border-color: var(--accent-fill);
    color: var(--accent-contrast);
  }

  .sort-select,
  .sort-dir {
    height: 36px;
    padding: 0 12px;
    border: 1px solid var(--border-color);
    background-color: var(--bg-primary);
    color: var(--text-main);
    font-family: var(--font-sans);
    font-size: 0.82rem;
    font-weight: 600;
    border-radius: var(--radius-md);
    transition: border-color var(--dur-1) var(--ease-out), background-color var(--dur-1) var(--ease-out);
  }

  .sort-select:hover,
  .sort-dir:hover {
    border-color: var(--border-strong);
  }

  .sort-dir {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--text-muted);
  }

  .year-field {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--text-muted);
  }

  .filter-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3);
  }

  .filter-row .control-label {
    margin-bottom: 0;
  }

  .clear-filters {
    margin-left: auto;
    border: 0;
    background: transparent;
    color: var(--accent-ink);
    font-size: 0.82rem;
    font-weight: 700;
    padding: 6px 8px;
    border-radius: var(--radius-sm);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .clear-filters:hover {
    background-color: var(--accent-soft);
  }

  .toolbar-foot {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin-top: var(--space-5);
    padding-top: var(--space-4);
    border-top: 1px solid var(--border-color);
  }

  .result-count {
    font-size: 0.84rem;
    color: var(--text-muted);
  }

  .browse-hubs {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--space-2) var(--space-3);
  }

  .browse-label {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-muted);
    white-space: nowrap;
  }

  .hub-links {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .hub-link {
    font-family: var(--font-sans);
    font-size: 0.8rem;
    color: var(--text-muted);
    text-decoration: none;
    padding: 3px 10px;
    border-radius: var(--radius-pill);
    transition: color var(--dur-1) var(--ease-out), background-color var(--dur-1) var(--ease-out);
  }

  .hub-link:hover {
    color: var(--accent-ink);
    background-color: var(--accent-soft);
  }

  /* ---------- Specimen grid ---------- */
  .directory-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--space-4);
  }

  .distro-card {
    display: flex;
    flex-direction: column;
    min-width: 0;
    border: 1px solid var(--border-color);
    background-color: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
    color: inherit;
    text-decoration: none;
    overflow: hidden;
    transition: background-color var(--dur-2) var(--ease-out),
      border-color var(--dur-2) var(--ease-out), transform var(--dur-2) var(--ease-out), box-shadow var(--dur-2) var(--ease-out);
    position: relative;
  }

  .distro-card:hover {
    background-color: var(--card-bg);
    border-color: var(--accent-color);
    transform: translateY(-4px);
    box-shadow: var(--shadow-lift);
  }

  .distro-card:focus-visible {
    outline: 2px solid var(--accent-color);
    outline-offset: -3px;
    z-index: 2;
  }

  .distro-card:hover .card-arrow {
    transform: translateX(3px);
  }

  .card-media {
    position: relative;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--bg-secondary);
    overflow: hidden;
  }

  /* Screenshots that do not fill the frame exactly get a soft, blurred copy
     of themselves behind them rather than dark letterbox bars. */
  .card-blur {
    position: absolute;
    inset: -28px;
    z-index: 0;
    background-image: var(--shot-url);
    background-size: cover;
    background-position: center;
    filter: blur(22px) saturate(1.35) brightness(0.78);
    opacity: 0.9;
    pointer-events: none;
  }

  /* Flush media sits inside the card corners, so it inherits the outer radius. */
  .card-media :global(.screenshot-shell) {
    position: relative;
    z-index: 1;
    height: 100%;
    border: 0;
    border-radius: 0;
    background-color: transparent;
  }

  .card-media :global(.screenshot-shell img) {
    height: 100%;
    object-fit: contain;
    object-position: center;
    background-color: transparent;
  }

  .card-tier {
    position: absolute;
    top: var(--space-2);
    right: var(--space-2);
    z-index: 2;
  }

  .card-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: var(--space-4);
  }

  .card-title-row {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .card-title-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }

  .card-distro-name {
    font-size: 1rem;
    font-weight: 750;
    letter-spacing: -0.01em;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-subline {
    font-size: 0.72rem;
    color: var(--text-muted);
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-rank {
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
  }

  .card-compat {
    flex: 0 0 auto;
    font-size: 0.68rem;
    font-weight: 750;
    padding: 4px 8px;
    border-radius: var(--radius-pill);
  }

  .card-compat.great { background-color: var(--tier-flagship-bg); color: var(--tier-flagship-text); }
  .card-compat.good { background-color: var(--tier-specialist-bg); color: var(--tier-specialist-text); }
  .card-compat.okay { background-color: var(--tag-neutral-bg); color: var(--tag-neutral-text); }
  .card-compat.poor { background-color: rgba(200, 72, 78, 0.14); color: var(--accent-red); }

  .card-tagline {
    font-size: 0.82rem;
    color: var(--text-muted);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-facts {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 6px 14px;
    padding-top: 2px;
  }

  .card-facts span {
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    min-width: 0;
  }

  .card-facts span + span {
    padding-left: 14px;
    border-left: 1px solid var(--border-color);
  }

  .card-facts small {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--text-subtle);
  }

  .card-facts b {
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--text-main);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    padding: 12px var(--space-4);
    border-top: 1px solid var(--border-color);
    background-color: var(--bg-secondary);
    font-family: var(--font-sans);
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-main);
  }

  .card-arrow {
    display: inline-flex;
    color: var(--accent-color);
    transition: transform var(--dur-1) var(--ease-out);
  }

  /* ---------- Empty state ---------- */
  .empty-state {
    border: 1px solid var(--border-color);
    background-color: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
    padding: var(--space-7);
  }

  .empty-state h2 {
    font-size: 1.4rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin: var(--space-2) 0;
  }

  .empty-state p {
    color: var(--text-muted);
    margin-bottom: var(--space-5);
  }

  .reset-btn {
    font-family: var(--font-sans);
    font-size: 0.86rem;
    font-weight: 650;
    padding: 11px 18px;
    border: 0;
    border-radius: var(--radius-md);
    background-color: var(--accent-fill);
    color: var(--accent-contrast);
    transition: background-color var(--dur-1) var(--ease-out), transform var(--dur-1) var(--ease-spring);
  }

  .reset-btn:hover {
    transform: translateY(-2px);
  }

  .reset-btn:hover {
    background-color: var(--accent-hover);
    border-color: var(--accent-hover);
  }

  @media (max-width: 860px) {
    .search-row {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 560px) {
    .toolbar {
      padding: var(--space-4);
    }

    .toolbar-top {
      flex-direction: column;
    }

    .result-badge {
      flex-direction: row;
      gap: 8px;
      align-self: flex-start;
    }

    .directory-title {
      font-size: 1.5rem;
    }

    .empty-state {
      padding: var(--space-5);
    }
  }
</style>
