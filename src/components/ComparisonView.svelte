<script>
  import Icon from './Icon.svelte';
  import { LINUX_DISTROS, DISTRO_MAP } from '../data/distros.js';
  import DistroLogo from './DistroLogo.svelte';
  import DistroScreenshot from './DistroScreenshot.svelte';

  let {
    initialDistroA = 'linux-mint',
    initialDistroB = 'arch-linux',
    onCompareChange = null
  } = $props();

  let distroIdA = $state('linux-mint');
  let distroIdB = $state('arch-linux');
  let shareStatus = $state('');

  let searchA = $state('');
  let searchB = $state('');
  let showSuggestionsA = $state(false);
  let showSuggestionsB = $state(false);

  // Follow URL-driven changes (initial load, back/forward, canonical redirects)
  // without fighting local selections made by the pickers.
  $effect(() => {
    if (initialDistroA) {
      distroIdA = initialDistroA;
      searchA = '';
    }
  });
  $effect(() => {
    if (initialDistroB) {
      distroIdB = initialDistroB;
      searchB = '';
    }
  });

  let sortBy = $state('popularity'); // 'popularity' or 'alphabetical'

  // Sorted list for suggestions
  let sortedDistros = $derived.by(() => {
    if (sortBy === 'alphabetical') {
      return [...LINUX_DISTROS].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      return [...LINUX_DISTROS].sort((a, b) => (a.dwRank || 999) - (b.dwRank || 999));
    }
  });

  let suggestionsA = $derived.by(() => {
    const q = searchA.toLowerCase().trim();
    if (!q) return sortedDistros.slice(0, 10);
    return sortedDistros.filter(d => d.name.toLowerCase().includes(q) || d.family.toLowerCase().includes(q)).slice(0, 10);
  });

  let suggestionsB = $derived.by(() => {
    const q = searchB.toLowerCase().trim();
    if (!q) return sortedDistros.slice(0, 10);
    return sortedDistros.filter(d => d.name.toLowerCase().includes(q) || d.family.toLowerCase().includes(q)).slice(0, 10);
  });

  let distroA = $derived(DISTRO_MAP[distroIdA] || LINUX_DISTROS[0]);
  let distroB = $derived(DISTRO_MAP[distroIdB] || LINUX_DISTROS[1]);

  function pickA(d) {
    if (!DISTRO_MAP[d.id]) return;
    if (d.id === distroIdB) distroIdB = distroIdA;
    distroIdA = d.id;
    searchA = d.name;
    showSuggestionsA = false;
    onCompareChange?.(distroIdA, distroIdB);
  }

  function pickB(d) {
    if (!DISTRO_MAP[d.id]) return;
    if (d.id === distroIdA) distroIdA = distroIdB;
    distroIdB = d.id;
    searchB = d.name;
    showSuggestionsB = false;
    onCompareChange?.(distroIdA, distroIdB);
  }

  function swapSides() {
    [distroIdA, distroIdB] = [distroIdB, distroIdA];
    [searchA, searchB] = [searchB, searchA];
    showSuggestionsA = false;
    showSuggestionsB = false;
    onCompareChange?.(distroIdA, distroIdB);
  }

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      shareStatus = 'Link copied';
    } catch {
      shareStatus = window.location.href;
    }
    setTimeout(() => (shareStatus = ''), 2200);
  }
</script>

<div class="page-container">
  <section class="compare-head">
    <div class="compare-head-top">
      <div>
        <h1 class="compare-title">Technical Distro Comparison Tool</h1>
        <p class="compare-intro">
          Type to search any distribution below to inspect side-by-side architectural trade-offs, package systems, init daemons, and hardware requirements.
        </p>
      </div>

      <div class="compare-sort-row">
        <span class="field-label">Sort suggestions</span>
        <button
          class="compare-sort-btn"
          class:active-sort={sortBy === 'popularity'}
          aria-pressed={sortBy === 'popularity'}
          onclick={() => sortBy = 'popularity'}
        >
          DistroWatch Rank
        </button>
        <button
          class="compare-sort-btn"
          class:active-sort={sortBy === 'alphabetical'}
          aria-pressed={sortBy === 'alphabetical'}
          onclick={() => sortBy = 'alphabetical'}
        >
          A to Z
        </button>
      </div>
    </div>

    <!-- 2 Search Bars with Autocomplete Dropdowns -->
    <div class="compare-pickers">
      <!-- Search A -->
      <div class="picker">
        <label class="field-label" for="search-a">Select distribution A</label>
        <div class="search-field">
          <Icon name="search" size={16} />
          <input
            id="search-a"
            type="text"
            class="compare-search-input"
            placeholder="Type to search (e.g. 'Mint', 'Fedora', 'Bazzite')..."
            value={searchA || (distroA ? distroA.name : '')}
            onfocus={(e) => {
              showSuggestionsA = true;
              e.currentTarget.select();
            }}
            oninput={(e) => { searchA = e.target.value; showSuggestionsA = true; }}
          />
        </div>

        {#if showSuggestionsA}
          <div class="suggestions-dropdown" role="listbox">
            {#each suggestionsA as d}
              <button class="suggestion-item" onclick={() => pickA(d)}>
                <DistroLogo distro={d} size={22} decorative={true} />
                <span class="suggestion-name">{d.name}</span>
                <span class="suggestion-meta">
                  <span class="field-value">#{d.dwRank || 'N/A'}</span>
                  <span>{d.family}</span>
                </span>
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Search B -->
      <div class="picker">
        <label class="field-label" for="search-b">Select distribution B</label>
        <div class="search-field">
          <Icon name="search" size={16} />
          <input
            id="search-b"
            type="text"
            class="compare-search-input"
            placeholder="Type to search (e.g. 'Arch', 'Ubuntu', 'Pop')..."
            value={searchB || (distroB ? distroB.name : '')}
            onfocus={(e) => {
              showSuggestionsB = true;
              e.currentTarget.select();
            }}
            oninput={(e) => { searchB = e.target.value; showSuggestionsB = true; }}
          />
        </div>

        {#if showSuggestionsB}
          <div class="suggestions-dropdown" role="listbox">
            {#each suggestionsB as d}
              <button class="suggestion-item" onclick={() => pickB(d)}>
                <DistroLogo distro={d} size={22} decorative={true} />
                <span class="suggestion-name">{d.name}</span>
                <span class="suggestion-meta">
                  <span class="field-value">#{d.dwRank || 'N/A'}</span>
                  <span>{d.family}</span>
                </span>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <div class="compare-actions">
      <button class="btn-secondary action-btn" onclick={swapSides}>
        <Icon name="swap" size={15} /> Swap sides
      </button>
      <button class="btn-primary action-btn" onclick={copyShareLink}>
        <Icon name="copy" size={15} /> Copy shareable link
      </button>
      <span class="share-note">This comparison has its own URL. Bookmark or share it.</span>
      {#if shareStatus}
        <span class="share-status" role="status">{shareStatus}</span>
      {/if}
    </div>
  </section>

  <!-- Comparison Side-by-Side Table -->
  <div class="compare-table-wrap">
    <table class="compare-table">
      <thead>
        <tr>
          <th class="aspect-col" scope="col">Specification / Aspect</th>
          <th scope="col">
            <div class="table-identity">
              <DistroLogo distro={distroA} size={30} decorative={true} />
              <span class="identity-name">{distroA.name}</span>
              <span class="tier-badge tier-{distroA.tier}">{distroA.tier}</span>
            </div>
          </th>
          <th scope="col">
            <div class="table-identity">
              <DistroLogo distro={distroB} size={30} decorative={true} />
              <span class="identity-name">{distroB.name}</span>
              <span class="tier-badge tier-{distroB.tier}">{distroB.tier}</span>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Screenshot Preview</th>
          <td>
            <DistroScreenshot distro={distroA} height={180} compact={true} />
          </td>
          <td>
            <DistroScreenshot distro={distroB} height={180} compact={true} />
          </td>
        </tr>

        <tr>
          <th scope="row">DistroWatch Rank &amp; Tier</th>
          <td>
            <span class="field-value rank">#{distroA.dwRank || 'N/A'}</span>
            <span class="cell-sub">({distroA.tier} classification)</span>
          </td>
          <td>
            <span class="field-value rank">#{distroB.dwRank || 'N/A'}</span>
            <span class="cell-sub">({distroB.tier} classification)</span>
          </td>
        </tr>

        <tr>
          <th scope="row">Core Tagline</th>
          <td class="cell-muted">{distroA.tagline}</td>
          <td class="cell-muted">{distroB.tagline}</td>
        </tr>

        <tr>
          <th scope="row">Family &amp; Lineage</th>
          <td><strong>{distroA.family}</strong> (Base: {distroA.base})</td>
          <td><strong>{distroB.family}</strong> (Base: {distroB.base})</td>
        </tr>

        <tr>
          <th scope="row">Init System (PID 1)</th>
          <td><span class="field-value">{distroA.initSystem}</span></td>
          <td><span class="field-value">{distroB.initSystem}</span></td>
        </tr>

        <tr>
          <th scope="row">Release Cadence</th>
          <td>{distroA.releaseModel}</td>
          <td>{distroB.releaseModel}</td>
        </tr>

        <tr>
          <th scope="row">Package Management</th>
          <td><span class="field-value">{distroA.packageManager}</span></td>
          <td><span class="field-value">{distroB.packageManager}</span></td>
        </tr>

        <tr>
          <th scope="row">Desktop Environments</th>
          <td>{distroA.desktopEnvironments ? distroA.desktopEnvironments.join(', ') : 'Custom'}</td>
          <td>{distroB.desktopEnvironments ? distroB.desktopEnvironments.join(', ') : 'Custom'}</td>
        </tr>

        <tr>
          <th scope="row">Free Software Strictness</th>
          <td>{distroA.freeSoftwareStrictness}</td>
          <td>{distroB.freeSoftwareStrictness}</td>
        </tr>

        <tr>
          <th scope="row">NVIDIA &amp; GPU Support</th>
          <td>{distroA.gpuSupport}</td>
          <td>{distroB.gpuSupport}</td>
        </tr>

        <tr>
          <th scope="row">Memory Requirements</th>
          <td>
            Min: <span class="field-value">{distroA.minRam}</span> · Rec: <span class="field-value">{distroA.recommendedRam}</span>
          </td>
          <td>
            Min: <span class="field-value">{distroB.minRam}</span> · Rec: <span class="field-value">{distroB.recommendedRam}</span>
          </td>
        </tr>

        <tr>
          <th scope="row">Key Strengths</th>
          <td>
            <ul class="trade-list">
              {#each (distroA.pros || []) as pro}
                <li><span class="trade-mark good"><Icon name="check" size={14} /></span>{pro}</li>
              {/each}
            </ul>
          </td>
          <td>
            <ul class="trade-list">
              {#each (distroB.pros || []) as pro}
                <li><span class="trade-mark good"><Icon name="check" size={14} /></span>{pro}</li>
              {/each}
            </ul>
          </td>
        </tr>

        <tr>
          <th scope="row">Considerations / Cons</th>
          <td>
            <ul class="trade-list">
              {#each (distroA.cons || []) as con}
                <li><span class="trade-mark bad"><Icon name="close" size={14} /></span>{con}</li>
              {/each}
            </ul>
          </td>
          <td>
            <ul class="trade-list">
              {#each (distroB.cons || []) as con}
                <li><span class="trade-mark bad"><Icon name="close" size={14} /></span>{con}</li>
              {/each}
            </ul>
          </td>
        </tr>

        <tr>
          <th scope="row">Official Links</th>
          <td>
            <a href={distroA.website} target="_blank" rel="noopener noreferrer" class="link-action">
              Website <Icon name="external" size={13} />
            </a>
          </td>
          <td>
            <a href={distroB.website} target="_blank" rel="noopener noreferrer" class="link-action">
              Website <Icon name="external" size={13} />
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<style>
  .compare-head {
    border: 1px solid var(--hairline);
    border-top: 2px solid var(--border-strong);
    background-color: var(--card-bg);
    padding: var(--space-6);
    margin-bottom: var(--space-6);
  }

  .compare-head-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: var(--space-5);
    margin-bottom: var(--space-6);
  }

  .compare-title {
    font-size: 1.9rem;
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.02em;
    margin-bottom: var(--space-2);
  }

  .compare-intro {
    color: var(--text-muted);
    font-size: 0.94rem;
    max-width: 72ch;
    line-height: 1.55;
  }

  .compare-sort-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .compare-sort-row .field-label {
    white-space: nowrap;
    margin-right: var(--space-1);
  }

  .compare-sort-btn {
    padding: 6px 12px;
    border: 1px solid var(--border-color);
    background-color: transparent;
    color: var(--text-muted);
    font-family: var(--font-label);
    font-size: 0.78rem;
    font-weight: 600;
    white-space: nowrap;
    transition: background-color var(--dur-1) var(--ease-out),
      color var(--dur-1) var(--ease-out), border-color var(--dur-1) var(--ease-out);
  }

  .compare-sort-btn:hover {
    background-color: var(--bg-tertiary);
    color: var(--text-main);
  }

  .compare-sort-btn.active-sort {
    background-color: var(--accent-fill);
    border-color: var(--accent-fill);
    color: var(--accent-contrast);
  }

  .compare-pickers {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-6);
    position: relative;
  }

  .picker {
    position: relative;
    min-width: 0;
  }

  .picker > .field-label {
    display: block;
    margin-bottom: var(--space-2);
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
    outline: 2px solid var(--accent-color);
    outline-offset: 1px;
  }

  .search-field :global(svg) {
    color: var(--text-subtle);
  }

  .compare-search-input {
    flex: 1;
    min-width: 0;
    padding: 11px 0;
    border: 0;
    background-color: transparent;
    font-size: 0.92rem;
    font-family: var(--font-sans);
    color: var(--text-main);
  }

  .compare-search-input:focus {
    outline: none;
  }

  .suggestions-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    z-index: 50;
    max-height: 280px;
    overflow-y: auto;
  }

  .suggestion-item {
    width: 100%;
    padding: var(--space-2) var(--space-3);
    border: 0;
    border-bottom: 1px solid var(--hairline);
    background: transparent;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    text-align: left;
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--text-main);
    transition: background-color var(--dur-1) var(--ease-out);
  }

  .suggestion-item:hover {
    background-color: var(--surface-hover);
  }

  .suggestion-name {
    font-weight: 600;
    white-space: nowrap;
  }

  .suggestion-meta {
    display: inline-flex;
    align-items: baseline;
    gap: var(--space-2);
    margin-left: auto;
    font-family: var(--font-label);
    font-size: 0.74rem;
    color: var(--text-subtle);
    min-width: 0;
  }

  .compare-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3);
    margin-top: var(--space-5);
    padding-top: var(--space-4);
    border-top: 1px solid var(--hairline);
  }

  .action-btn {
    font-size: 0.82rem;
    padding: 7px 12px;
  }

  .share-note {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--text-subtle);
  }

  .share-status {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--accent-green);
  }

  .compare-table-wrap {
    border: 1px solid var(--hairline);
    background-color: var(--card-bg);
    overflow-x: auto;
  }

  .compare-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  .compare-table th,
  .compare-table td {
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--hairline);
    text-align: left;
    vertical-align: top;
  }

  .compare-table thead th {
    background-color: var(--bg-secondary);
    border-bottom: 1px solid var(--border-strong);
  }

  .compare-table tbody th {
    font-family: var(--font-label);
    font-size: 0.74rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-subtle);
    width: 24%;
  }

  .compare-table tbody td {
    width: 38%;
  }

  .compare-table tbody tr:hover td,
  .compare-table tbody tr:hover th {
    background-color: var(--surface-hover);
  }

  .aspect-col {
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-subtle);
  }

  .table-identity {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .identity-name {
    font-size: 1.2rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .rank {
    font-size: 0.9rem;
    color: var(--text-main);
  }

  .cell-sub {
    color: var(--text-muted);
    font-size: 0.85rem;
    margin-left: var(--space-2);
  }

  .cell-muted {
    color: var(--text-muted);
  }

  .trade-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    font-size: 0.88rem;
  }

  .trade-list li {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
    line-height: 1.45;
  }

  .trade-mark {
    display: inline-flex;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .trade-mark.good {
    color: var(--accent-green);
  }

  .trade-mark.bad {
    color: var(--accent-red);
  }

  .link-action {
    display: inline-flex;
    align-items: baseline;
    gap: var(--space-1);
    font-family: var(--font-mono);
    font-size: 0.8rem;
    padding: 6px 12px;
    border: 1px solid var(--border-color);
    text-decoration: none;
    color: var(--accent-ink);
    transition: background-color var(--dur-1) var(--ease-out), border-color var(--dur-1) var(--ease-out);
  }

  .link-action:hover {
    background-color: var(--bg-tertiary);
    border-color: var(--border-strong);
  }

  @media (max-width: 760px) {
    .compare-pickers {
      grid-template-columns: 1fr;
    }
  }
</style>
