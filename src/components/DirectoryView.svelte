<script>
  import { LINUX_DISTROS } from '../data/distros.js';
  import { POPULARITY_YEARS } from '../data/distroFacts.js';
  import { FAMILY_PAGES, USE_CASE_PAGES, landingPath } from '../data/landingPages.js';
  import DistroLogo from './DistroLogo.svelte';
  import DistroScreenshot from './DistroScreenshot.svelte';
  import Icon from './Icon.svelte';

  let { onSelectForCompare, onOpenDistro } = $props();

  let searchQuery = $state('');
  let selectedFamily = $state('all');
  let sortBy = $state('popularity'); // popularity | age | updated | alphabetical
  let selectedYear = $state('current'); // current | 2025 | ... | 2021
  let sortDir = $state('asc'); // used by age / updated

  const families = ['all', 'Ubuntu', 'Debian', 'Arch', 'Fedora/RHEL', 'openSUSE', 'Gentoo', 'Slackware', 'Independent'];

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

  function shortDate(value) {
    if (!value) return null;
    return value.length > 7 ? value.slice(0, 7) : value;
  }

  function targetLabel(distro) {
    return distro.primaryUseCases?.[0] || distro.desktopEnvironments?.[0] || '—';
  }

  let filteredDistros = $derived.by(() => {
    let list = LINUX_DISTROS.filter((d) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.tagline.toLowerCase().includes(q) ||
        d.packageManager.toLowerCase().includes(q) ||
        d.initSystem.toLowerCase().includes(q) ||
        d.family.toLowerCase().includes(q) ||
        (d.desktopEnvironments || []).some((de) => de.toLowerCase().includes(q)) ||
        (d.specialFeatures || []).some((f) => f.toLowerCase().includes(q)) ||
        (d.primaryUseCases || []).some((u) => u.toLowerCase().includes(q));

      const matchesFamily = selectedFamily === 'all' || d.family === selectedFamily;

      return matchesSearch && matchesFamily;
    });

    const direction = sortDir === 'asc' ? 1 : -1;
    const missingLast = (value, fallback) => (value == null ? fallback : value);

    if (sortBy === 'alphabetical') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sortBy === 'popularity') {
      return [...list].sort((a, b) => {
        const ra = missingLast(rankFor(a), Number.POSITIVE_INFINITY);
        const rb = missingLast(rankFor(b), Number.POSITIVE_INFINITY);
        return ra - rb || a.name.localeCompare(b.name);
      });
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

  function primaryPackageManager(value) {
    // Card specs are deliberately terse; the full, multi-part value lives in
    // the title attribute and on the detail page.
    return (value || '').split('/')[0].trim() || '—';
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
    <div class="toolbar-intro">
      <span class="field-label">CATALOGUE / ALL DISTRIBUTIONS</span>
      <h1 class="directory-title">Linux Distribution Directory</h1>
      <p class="directory-sub">
        {LINUX_DISTROS.length} distributions, each with a full profile, verified logo and desktop screenshot.
        Click any card to open its page.
      </p>
    </div>

    <div class="toolbar-main">
      <div class="search-field">
        <span class="search-icon" aria-hidden="true"><Icon name="search" size={16} /></span>
        <input
          type="text"
          bind:value={searchQuery}
          class="search-input"
          placeholder="Search name, family, package manager, desktop, init system or feature…"
          aria-label="Search distributions"
        />
        {#if searchQuery}
          <button class="clear-btn" onclick={() => (searchQuery = '')} aria-label="Clear search">
            <Icon name="close" size={14} />
          </button>
        {/if}
      </div>

      <div class="sort-controls">
        <span class="field-label">SORT</span>
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
            Last update
          </button>
          <button
            class="sort-btn"
            class:active={sortBy === 'alphabetical'}
            aria-pressed={sortBy === 'alphabetical'}
            onclick={() => setSort('alphabetical')}
          >
            A–Z
          </button>
        </div>

        {#if sortBy === 'popularity'}
          <label class="sort-year-label">
            <span class="sr-only">Popularity year</span>
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

    <div class="family-controls">
      <span class="field-label">FAMILY</span>
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
    </div>

    <div class="toolbar-foot">
      <p class="result-count">
        SHOWING <span class="field-value">{filteredDistros.length}</span> / {LINUX_DISTROS.length}
        <span class="count-divider" aria-hidden="true"></span>
        SORTED BY {sortBy === 'popularity'
          ? `POPULARITY (${yearLabel().toUpperCase()})`
          : sortBy === 'age'
            ? `AGE (${sortDir === 'asc' ? 'OLDEST' : 'NEWEST'} FIRST)`
            : sortBy === 'updated'
              ? `LAST UPDATE (${sortDir === 'desc' ? 'NEWEST' : 'OLDEST'} FIRST)`
              : 'NAME'}
      </p>

      <div class="browse-hubs">
        <div class="hub-row">
          <span class="field-label">Browse by family</span>
          {#each FAMILY_PAGES as family}
            <a class="hub-link" href={landingPath('family', family.slug)}>{family.label}</a>
          {/each}
        </div>
        <div class="hub-row">
          <span class="field-label">Browse by use case</span>
          {#each USE_CASE_PAGES as useCase}
            <a class="hub-link" href={landingPath('use-case', useCase.slug)}>{useCase.label}</a>
          {/each}
        </div>
      </div>
    </div>
  </section>

  {#if filteredDistros.length === 0}
    <div class="empty-state">
      <div class="eyebrow field-label"><Icon name="alert" size={13} /> NO MATCHES</div>
      <h2>Nothing fits that filter</h2>
      <p>Try a broader search term or reset the family filter.</p>
      <button
        class="reset-btn"
        onclick={() => {
          searchQuery = '';
          selectedFamily = 'all';
        }}
      >
        Reset filters
      </button>
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
          <div class="card-media">
            <DistroScreenshot {distro} height={210} compact={true} fit="contain" showName={false} />
            <span class="card-scrim" aria-hidden="true"></span>
            <span class="tier-badge tier-{distro.tier} card-tier">{distro.tier}</span>

            <div class="card-overlay">
              <div class="card-title-row">
                <DistroLogo {distro} size={30} decorative={true} />
                <div class="card-title-text">
                  <span class="card-distro-name">{distro.name}</span>
                  <span class="card-subline">
                    {distro.family} <span class="card-rank">· {rankLabel(distro)}</span>
                  </span>
                </div>
              </div>
              <p class="card-tagline">{distro.tagline}</p>
            </div>
          </div>

          <div class="caption-strip card-caption">
            <strong>TRAITS</strong>
            <span class="specimen specimen--accent">{distro.releaseModel}</span>
            <span class="specimen">{distro.initSystem}</span>
            {#each (distro.desktopEnvironments || []).slice(0, 1) as de}
              <span class="specimen">{de}</span>
            {/each}
          </div>

          <table class="spec-table card-specs">
            <tbody>
              <tr>
                <th scope="row">Packages</th>
                <td class="spec-value" title={distro.packageManager}>{primaryPackageManager(distro.packageManager)}</td>
              </tr>
              <tr>
                <th scope="row">Target</th>
                <td class="spec-value" title={targetLabel(distro)}>{targetLabel(distro)}</td>
              </tr>
              <tr>
                <th scope="row">Since</th>
                <td class="spec-value">{shortDate(distro.firstRelease) || '—'}</td>
              </tr>
              <tr>
                <th scope="row">Updated</th>
                <td class="spec-value">{shortDate(distro.latestRelease) || '—'}</td>
              </tr>
            </tbody>
          </table>

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
    padding: var(--space-5);
    margin-bottom: var(--space-5);
  }

  .toolbar-intro {
    padding-bottom: var(--space-4);
    border-bottom: 1px solid var(--border-color);
  }

  .directory-title {
    font-family: var(--font-sans);
    font-size: 1.8rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.15;
    margin-top: 6px;
  }

  .directory-sub {
    color: var(--text-muted);
    font-size: 0.9rem;
    max-width: 70ch;
    line-height: 1.5;
    margin-top: 4px;
  }

  .toolbar-main {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
    gap: var(--space-5);
    align-items: start;
    padding: var(--space-4) 0;
  }

  .search-field {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    border: 1px solid var(--border-color);
    background-color: var(--bg-primary);
    padding: 0 var(--space-3);
    transition: border-color var(--dur-1) var(--ease-out);
  }

  .search-field:focus-within {
    border-color: var(--accent-color);
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
    width: 24px;
    height: 24px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--text-subtle);
    transition: color var(--dur-1) var(--ease-out), border-color var(--dur-1) var(--ease-out);
  }

  .clear-btn:hover {
    color: var(--text-main);
    border-color: var(--border-color);
  }

  .sort-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
  }

  .sort-controls > .field-label {
    flex-basis: 100%;
  }

  .sort-buttons,
  .filter-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .sort-btn,
  .filter-pill {
    font-family: var(--font-label);
    font-size: 0.76rem;
    font-weight: 500;
    color: var(--text-muted);
    background-color: transparent;
    border: 1px solid var(--border-color);
    padding: 5px 10px;
    transition: background-color var(--dur-1) var(--ease-out),
      border-color var(--dur-1) var(--ease-out), color var(--dur-1) var(--ease-out);
  }

  .sort-btn:hover,
  .filter-pill:hover {
    border-color: var(--border-strong);
    color: var(--text-main);
    background-color: var(--surface-hover);
  }

  .sort-btn.active,
  .filter-pill.active {
    background-color: var(--selected-bg);
    border-color: var(--selected-border);
    color: var(--accent-ink);
  }

  .sort-select,
  .sort-dir {
    height: 31px;
    padding: 0 9px;
    border: 1px solid var(--border-color);
    background-color: var(--bg-primary);
    color: var(--text-main);
    font-family: var(--font-mono);
    font-size: 0.74rem;
    font-variant-numeric: tabular-nums;
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

  .sort-year-label {
    display: inline-flex;
  }

  .family-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3);
    padding-bottom: var(--space-4);
    border-bottom: 1px solid var(--border-color);
  }

  .toolbar-foot {
    padding-top: var(--space-3);
  }

  .result-count {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.03em;
    color: var(--text-subtle);
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .result-count .field-value {
    color: var(--text-main);
    font-weight: 600;
  }

  .count-divider {
    width: 18px;
    height: 1px;
    background-color: var(--border-color);
  }

  .browse-hubs {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: var(--space-4);
    padding-top: var(--space-2);
  }

  .hub-row {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 2px 0;
  }

  .hub-row .field-label {
    margin-right: var(--space-3);
    text-transform: none;
    letter-spacing: 0.02em;
  }

  .hub-link {
    font-family: var(--font-label);
    font-size: 0.78rem;
    color: var(--text-muted);
    text-decoration: none;
    padding: 2px var(--space-3);
    border-left: 1px solid var(--border-color);
    border-bottom: 1px solid transparent;
    transition: color var(--dur-1) var(--ease-out), border-color var(--dur-1) var(--ease-out);
  }

  .hub-link:first-of-type {
    border-left: none;
    padding-left: 0;
  }

  .hub-link:hover {
    color: var(--accent-ink);
    border-bottom-color: var(--accent-color);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* ---------- Specimen grid ---------- */
  .directory-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1px;
  }

  .distro-card {
    display: flex;
    flex-direction: column;
    min-width: 0;
    border: 1px solid var(--border-color);
    background-color: var(--card-bg);
    color: inherit;
    text-decoration: none;
    transition: background-color var(--dur-2) var(--ease-out),
      border-color var(--dur-2) var(--ease-out);
    position: relative;
  }

  .distro-card:hover {
    background-color: var(--surface-hover);
    border-color: var(--border-strong);
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
    aspect-ratio: 8 / 5;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--image-void);
    overflow: hidden;
  }

  /* The screenshot fills the media box exactly, so a 16:10 capture shows the
     whole desktop with no crop and no letterbox bars. */
  .card-media :global(.screenshot-shell) {
    height: 100%;
    border: none;
  }

  .card-media :global(.screenshot-shell img) {
    height: 100%;
    object-fit: contain;
    object-position: center;
  }

  /* A stepped, bottom-up scrim built from the plate tokens — two solid bands
     keep the identity block legible without hiding the full screenshot. */
  .card-scrim {
    position: absolute;
    inset: auto 0 0 0;
    height: 58%;
    background-color: var(--scrim-plate);
    pointer-events: none;
    z-index: 1;
  }

  .card-scrim::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 100%;
    height: 26px;
    background-color: var(--scrim-plate);
    opacity: 0.5;
  }

  .card-tier {
    position: absolute;
    top: var(--space-2);
    right: var(--space-2);
    z-index: 2;
  }

  .card-overlay {
    position: absolute;
    inset: auto 0 0 0;
    z-index: 2;
    padding: var(--space-3) var(--space-4);
    display: flex;
    flex-direction: column;
    gap: 6px;
    color: var(--scrim-text);
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
  }

  .card-distro-name {
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-subline {
    font-family: var(--font-label);
    font-size: 0.72rem;
    color: var(--scrim-text-muted);
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-rank {
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
  }

  .card-tagline {
    font-family: var(--font-label);
    font-size: 0.82rem;
    color: var(--scrim-text);
    line-height: 1.45;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-caption {
    min-height: 38px;
    padding: 7px var(--space-4);
    align-items: center;
  }

  .specimen {
    font-family: var(--font-label);
    font-size: 0.68rem;
    font-weight: 500;
    line-height: 1.4;
    padding: 2px 7px;
    background-color: var(--tag-neutral-bg);
    border: 1px solid var(--tag-neutral-border);
    color: var(--tag-neutral-text);
    white-space: nowrap;
    max-width: 20ch;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .specimen--accent {
    background-color: var(--tag-accent-bg);
    border-color: var(--tag-accent-border);
    color: var(--tag-accent-text);
  }

  .card-specs {
    padding: var(--space-3) var(--space-4);
    font-size: 0.72rem;
    table-layout: fixed;
  }

  .card-specs tr + tr th,
  .card-specs tr + tr td {
    border-top: 1px solid var(--border-color);
  }

  .card-specs th {
    width: 38%;
    padding: 5px 0;
    text-transform: none;
    letter-spacing: 0;
  }

  .card-specs td {
    padding: 5px 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-specs .spec-value {
    font-variant-numeric: tabular-nums;
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    padding: 10px var(--space-4);
    border-top: 1px solid var(--border-color);
    background-color: var(--bg-secondary);
    font-family: var(--font-label);
    font-size: 0.76rem;
    font-weight: 600;
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
    padding: var(--space-7);
  }

  .empty-state .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--accent-red);
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
    font-family: var(--font-label);
    font-size: 0.82rem;
    font-weight: 600;
    padding: 9px 16px;
    border: 1px solid var(--accent-fill);
    background-color: var(--accent-fill);
    color: var(--accent-contrast);
    transition: background-color var(--dur-1) var(--ease-out), border-color var(--dur-1) var(--ease-out);
  }

  .reset-btn:hover {
    background-color: var(--accent-hover);
    border-color: var(--accent-hover);
  }

  @media (max-width: 860px) {
    .toolbar-main {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 560px) {
    .toolbar {
      padding: var(--space-4);
    }

    .directory-title {
      font-size: 1.5rem;
    }

    .empty-state {
      padding: var(--space-5);
    }
  }
</style>
