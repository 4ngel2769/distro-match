<script>
  import { LINUX_DISTROS } from '../data/distros.js';
  import { POPULARITY_YEARS } from '../data/distroFacts.js';
  import DistroLogo from './DistroLogo.svelte';
  import DistroScreenshot from './DistroScreenshot.svelte';

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
  <div class="directory-controls-card">
    <div class="directory-head">
      <div>
        <h1 class="directory-title">Linux Distribution Directory</h1>
        <p class="directory-sub">
          {LINUX_DISTROS.length} distributions, each with a full profile, verified logo and desktop screenshot.
          Click any card to open its page.
        </p>
      </div>

      <div class="sort-row">
        <span class="control-label">SORT BY</span>
        <button
          class="btn-secondary sort-btn"
          class:active-sort={sortBy === 'popularity'}
          aria-pressed={sortBy === 'popularity'}
          onclick={() => setSort('popularity')}
        >
          Popularity
        </button>
        <button
          class="btn-secondary sort-btn"
          class:active-sort={sortBy === 'age'}
          aria-pressed={sortBy === 'age'}
          onclick={() => setSort('age')}
        >
          Age
        </button>
        <button
          class="btn-secondary sort-btn"
          class:active-sort={sortBy === 'updated'}
          aria-pressed={sortBy === 'updated'}
          onclick={() => setSort('updated')}
        >
          Last update
        </button>
        <button
          class="btn-secondary sort-btn"
          class:active-sort={sortBy === 'alphabetical'}
          aria-pressed={sortBy === 'alphabetical'}
          onclick={() => setSort('alphabetical')}
        >
          A–Z
        </button>

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
          <button class="sort-dir" onclick={() => (sortDir = sortDir === 'asc' ? 'desc' : 'asc')}>
            {sortDir === 'asc' ? 'Oldest first ↑' : 'Newest first ↓'}
          </button>
        {/if}
      </div>
    </div>

    <div class="search-row">
      <input
        type="text"
        bind:value={searchQuery}
        class="search-input"
        placeholder="Search name, family, package manager, desktop, init system or feature…"
        aria-label="Search distributions"
      />
      {#if searchQuery}
        <button class="clear-btn" onclick={() => (searchQuery = '')} aria-label="Clear search">✕</button>
      {/if}
    </div>

    <div class="family-row">
      <span class="control-label">FAMILY</span>
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

    <div class="result-count">
      Showing <strong>{filteredDistros.length}</strong> of {LINUX_DISTROS.length} distributions
      · sorted by
      {sortBy === 'popularity'
        ? `popularity (${yearLabel()})`
        : sortBy === 'age'
          ? `age (${sortDir === 'asc' ? 'oldest' : 'newest'} first)`
          : sortBy === 'updated'
            ? `last update (${sortDir === 'desc' ? 'newest' : 'oldest'} first)`
            : 'name'}
    </div>
  </div>

  {#if filteredDistros.length === 0}
    <div class="empty-state">
      <div class="eyebrow">NO MATCHES</div>
      <h2>Nothing fits that filter</h2>
      <p>Try a broader search term or reset the family filter.</p>
      <button
        class="btn-primary"
        onclick={() => {
          searchQuery = '';
          selectedFamily = 'all';
        }}
      >
        Reset filters
      </button>
    </div>
  {:else}
    <div class="directory-cards-grid">
      {#each filteredDistros as distro (distro.id)}
        <a
          class="distro-card"
          href={`/distro/${distro.id}`}
          onclick={(event) => handleClick(event, distro)}
          aria-label={`Open the ${distro.name} profile`}
        >
          <div class="card-media">
            <DistroScreenshot {distro} height={132} compact={true} />
            <span class="tier-badge tier-{distro.tier} card-tier">{distro.tier}</span>
          </div>

          <div class="card-body">
            <div class="card-title-row">
              <DistroLogo {distro} size={34} decorative={true} />
              <div class="card-title-text">
                <span class="card-distro-name">{distro.name}</span>
                <span class="card-subline">
                  {distro.family} · {rankLabel(distro)}
                </span>
              </div>
            </div>

            <p class="card-distro-tagline">{distro.tagline}</p>

            <div class="card-chip-row">
              <span class="chip chip--release">{distro.releaseModel}</span>
              <span class="chip chip--init">{distro.initSystem}</span>
              {#each (distro.desktopEnvironments || []).slice(0, 2) as de}
                <span class="chip chip--de">{de}</span>
              {/each}
            </div>

            <div class="card-specs-row">
              <span title={distro.packageManager}>
                <strong>Packages</strong> {primaryPackageManager(distro.packageManager)}
              </span>
              <span title={distro.userLevel}><strong>Target</strong> {distro.userLevel}</span>
              <span><strong>Since</strong> {distro.firstRelease ? distro.firstRelease.slice(0, 4) : '—'}</span>
              <span><strong>Updated</strong> {shortDate(distro.latestRelease) || '—'}</span>
            </div>
          </div>

          <div class="card-footer">
            <span>View full profile</span>
            <span class="card-arrow" aria-hidden="true">→</span>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>

<style>
  .directory-controls-card {
    border: 2px solid var(--border-strong);
    background-color: var(--card-bg);
    padding: 24px;
    margin-bottom: 22px;
    box-shadow: var(--shadow-sharp);
  }

  .directory-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 18px;
  }

  .directory-title {
    font-size: 2.1rem;
    font-weight: 900;
    letter-spacing: -0.03em;
    line-height: 1.1;
    margin-bottom: 6px;
  }

  .directory-sub {
    color: var(--text-muted);
    font-size: 0.94rem;
    max-width: 62ch;
    line-height: 1.45;
  }

  .control-label {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    color: var(--text-subtle);
  }

  .sort-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .sort-btn {
    padding: 6px 12px;
    font-size: 0.8rem;
    font-family: var(--font-mono);
  }

  .sort-year-label {
    display: inline-flex;
  }

  .sort-select,
  .sort-dir {
    height: 35px;
    padding: 0 10px;
    border: 2px solid var(--border-strong);
    background-color: var(--bg-primary);
    color: var(--text-main);
    font-family: var(--font-mono);
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
  }

  .sort-dir {
    background-color: var(--bg-tertiary);
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

  .active-sort {
    background-color: var(--border-strong) !important;
    color: var(--bg-primary) !important;
  }

  .search-row {
    position: relative;
  }

  .search-input {
    width: 100%;
    padding: 12px 44px 12px 16px;
    border: 2px solid var(--border-strong);
    background-color: var(--bg-primary);
    font-size: 1rem;
    font-family: var(--font-sans);
  }

  .search-input:focus {
    outline: 2px solid var(--accent-color);
    outline-offset: 1px;
  }

  .clear-btn {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    font-size: 1rem;
    color: var(--text-subtle);
    cursor: pointer;
    padding: 4px 6px;
  }

  .family-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-top: 14px;
  }

  .filter-pill {
    background-color: var(--bg-primary);
    border: 1px solid var(--border-color);
    padding: 5px 12px;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    cursor: pointer;
    transition: all 0.1s ease;
  }

  .filter-pill:hover {
    border-color: var(--border-strong);
    background-color: var(--bg-tertiary);
  }

  .filter-pill.active {
    background-color: var(--border-strong);
    color: var(--bg-primary);
    border-color: var(--border-strong);
  }

  .result-count {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--text-subtle);
    margin-top: 14px;
  }

  .result-count strong {
    color: var(--text-main);
  }

  .directory-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }

  .distro-card {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-color);
    background-color: var(--card-bg);
    text-decoration: none;
    color: inherit;
    transition: border-color 0.12s ease, transform 0.12s ease, box-shadow 0.12s ease;
    position: relative;
    overflow: hidden;
  }

  .distro-card:hover {
    border-color: var(--border-strong);
    transform: translate(-2px, -2px);
    box-shadow: var(--shadow-sharp);
  }

  .distro-card:focus-visible {
    outline: 3px solid var(--accent-color);
    outline-offset: 2px;
  }

  .card-media {
    position: relative;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--bg-tertiary);
  }

  .card-tier {
    position: absolute;
    top: 8px;
    right: 8px;
    border: 1px solid rgba(0, 0, 0, 0.28);
    box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.28);
    letter-spacing: 0.08em;
  }

  .card-body {
    padding: 14px 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
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
    font-size: 1.12rem;
    font-weight: 800;
    letter-spacing: -0.01em;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-subline {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--text-subtle);
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-distro-tagline {
    font-size: 0.86rem;
    color: var(--text-muted);
    line-height: 1.45;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex: 1;
  }

  .card-chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .chip {
    font-family: var(--font-mono);
    font-size: 0.67rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    padding: 3px 7px;
    background-color: var(--tag-neutral-bg);
    border: 1px solid var(--tag-neutral-border);
    color: var(--tag-neutral-text);
    white-space: nowrap;
    max-width: 14ch;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chip--release {
    background-color: var(--tag-orange-bg);
    border-color: var(--tag-orange-border);
    color: var(--tag-orange-text);
  }

  .chip--init {
    background-color: var(--tag-blue-bg);
    border-color: var(--tag-blue-border);
    color: var(--tag-blue-text);
  }

  .chip--de {
    background-color: var(--tag-pink-bg);
    border-color: var(--tag-pink-border);
    color: var(--tag-pink-text);
  }

  .card-specs-row {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--text-subtle);
    border-top: 1px dashed var(--border-color);
    padding-top: 8px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 4px 10px;
    min-width: 0;
  }

  .card-specs-row span {
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-specs-row strong {
    color: var(--text-subtle);
    text-transform: uppercase;
    font-size: 0.64rem;
    letter-spacing: 0.05em;
    margin-right: 5px;
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px 16px;
    border-top: 1px solid var(--border-color);
    background-color: var(--bg-secondary);
    font-family: var(--font-mono);
    font-size: 0.76rem;
    font-weight: 700;
    color: var(--text-main);
  }

  .card-arrow {
    color: var(--accent-color);
    transition: transform 0.12s ease;
  }

  .distro-card:hover .card-arrow {
    transform: translateX(3px);
  }

  .empty-state {
    border: 2px solid var(--border-strong);
    box-shadow: var(--shadow-sharp);
    background-color: var(--card-bg);
    padding: 40px;
  }

  .eyebrow {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    font-weight: 800;
    color: var(--accent-red);
    margin-bottom: 8px;
  }

  .empty-state h2 {
    font-size: 1.6rem;
    margin-bottom: 6px;
  }

  .empty-state p {
    color: var(--text-muted);
    margin-bottom: 18px;
  }

  @media (max-width: 560px) {
    .directory-controls-card {
      padding: 18px;
    }

    .directory-title {
      font-size: 1.7rem;
    }
  }
</style>
