<script>
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
  <div class="compare-header-card">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 20px;">
      <div>
        <h1 style="font-size: 2.2rem; font-weight: 900; letter-spacing: -0.02em; margin-bottom: 6px;">
          Technical Distro Comparison Tool
        </h1>
        <p style="color: var(--text-muted); font-size: 0.95rem;">
          Type to search any distribution below to inspect side-by-side architectural trade-offs, package systems, init daemons, and hardware requirements.
        </p>
      </div>

      <div class="compare-sort-row">
        <span class="compare-sort-label">SORT SUGGESTIONS:</span>
        <button
          class="btn-secondary compare-sort-btn {sortBy === 'popularity' ? 'active-sort' : ''}"
          aria-pressed={sortBy === 'popularity'}
          onclick={() => sortBy = 'popularity'}
        >
          DistroWatch Rank
        </button>
        <button
          class="btn-secondary compare-sort-btn {sortBy === 'alphabetical' ? 'active-sort' : ''}"
          aria-pressed={sortBy === 'alphabetical'}
          onclick={() => sortBy = 'alphabetical'}
        >
          A to Z
        </button>
      </div>
    </div>

    <!-- 2 Search Bars with Autocomplete Dropdowns -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; position: relative;">
      
      <!-- Search A -->
      <div style="position: relative;">
        <label for="search-a" style="font-family: var(--font-label); font-weight: 800; font-size: 0.82rem; display: block; margin-bottom: 6px; color: var(--text-muted);">
          SELECT DISTRIBUTION A:
        </label>
        <div style="display: flex; align-items: center; gap: 8px;">
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
                <div>
                  <strong>{d.name}</strong>
                  <span style="font-family: var(--font-label); font-size: 0.75rem; color: var(--text-subtle); margin-left: 6px;">
                    #{d.dwRank || 'N/A'} • {d.family}
                  </span>
                </div>
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Search B -->
      <div style="position: relative;">
        <label for="search-b" style="font-family: var(--font-label); font-weight: 800; font-size: 0.82rem; display: block; margin-bottom: 6px; color: var(--text-muted);">
          SELECT DISTRIBUTION B:
        </label>
        <div style="display: flex; align-items: center; gap: 8px;">
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
                <div>
                  <strong>{d.name}</strong>
                  <span style="font-family: var(--font-label); font-size: 0.75rem; color: var(--text-subtle); margin-left: 6px;">
                    #{d.dwRank || 'N/A'} • {d.family}
                  </span>
                </div>
              </button>
            {/each}
          </div>
        {/if}
      </div>

    </div>

    <div class="compare-actions">
      <button class="btn-secondary" onclick={swapSides} style="padding: 7px 12px; font-size: 0.82rem;">
        ⇄ Swap sides
      </button>
      <button class="btn-primary" onclick={copyShareLink} style="padding: 7px 14px; font-size: 0.82rem;">
        Copy shareable link
      </button>
      <span class="share-note">This comparison has its own URL. Bookmark or share it.</span>
      {#if shareStatus}
        <span class="share-status" role="status">{shareStatus}</span>
      {/if}
    </div>
  </div>

  <!-- Comparison Side-by-Side Table -->
  <div style="border: 2px solid var(--border-strong); background-color: var(--card-bg); overflow-x: auto; box-shadow: var(--shadow-sharp);">
    <table class="compare-table">
      <thead>
        <tr>
          <th style="width: 24%;">Specification / Aspect</th>
          <th style="width: 38%;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <DistroLogo distro={distroA} size={30} decorative={true} />
              <div>
                <span style="font-size: 1.2rem; font-weight: 900;">{distroA.name}</span>
                <span class="tier-badge tier-{distroA.tier}" style="margin-left: 6px;">{distroA.tier}</span>
              </div>
            </div>
          </th>
          <th style="width: 38%;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <DistroLogo distro={distroB} size={30} decorative={true} />
              <div>
                <span style="font-size: 1.2rem; font-weight: 900;">{distroB.name}</span>
                <span class="tier-badge tier-{distroB.tier}" style="margin-left: 6px;">{distroB.tier}</span>
              </div>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Screenshot Preview</strong></td>
          <td>
            <DistroScreenshot distro={distroA} height={180} compact={true} />
          </td>
          <td>
            <DistroScreenshot distro={distroB} height={180} compact={true} />
          </td>
        </tr>

        <tr>
          <td><strong>DistroWatch Rank & Tier</strong></td>
          <td>
            <span style="font-family: var(--font-label); font-weight: 800;">#{distroA.dwRank || 'N/A'}</span>
            <span style="color: var(--text-muted); font-size: 0.85rem;">({distroA.tier} classification)</span>
          </td>
          <td>
            <span style="font-family: var(--font-label); font-weight: 800;">#{distroB.dwRank || 'N/A'}</span>
            <span style="color: var(--text-muted); font-size: 0.85rem;">({distroB.tier} classification)</span>
          </td>
        </tr>

        <tr>
          <td><strong>Core Tagline</strong></td>
          <td style="color: var(--text-muted);">{distroA.tagline}</td>
          <td style="color: var(--text-muted);">{distroB.tagline}</td>
        </tr>

        <tr>
          <td><strong>Family & Lineage</strong></td>
          <td><strong>{distroA.family}</strong> (Base: {distroA.base})</td>
          <td><strong>{distroB.family}</strong> (Base: {distroB.base})</td>
        </tr>

        <tr>
          <td><strong>Init System (PID 1)</strong></td>
          <td><span style="font-family: var(--font-label);">{distroA.initSystem}</span></td>
          <td><span style="font-family: var(--font-label);">{distroB.initSystem}</span></td>
        </tr>

        <tr>
          <td><strong>Release Cadence</strong></td>
          <td>{distroA.releaseModel}</td>
          <td>{distroB.releaseModel}</td>
        </tr>

        <tr>
          <td><strong>Package Management</strong></td>
          <td><span style="font-family: var(--font-label);">{distroA.packageManager}</span></td>
          <td><span style="font-family: var(--font-label);">{distroB.packageManager}</span></td>
        </tr>

        <tr>
          <td><strong>Desktop Environments</strong></td>
          <td>{distroA.desktopEnvironments ? distroA.desktopEnvironments.join(', ') : 'Custom'}</td>
          <td>{distroB.desktopEnvironments ? distroB.desktopEnvironments.join(', ') : 'Custom'}</td>
        </tr>

        <tr>
          <td><strong>Free Software Strictness</strong></td>
          <td>{distroA.freeSoftwareStrictness}</td>
          <td>{distroB.freeSoftwareStrictness}</td>
        </tr>

        <tr>
          <td><strong>NVIDIA & GPU Support</strong></td>
          <td>{distroA.gpuSupport}</td>
          <td>{distroB.gpuSupport}</td>
        </tr>

        <tr>
          <td><strong>Memory Requirements</strong></td>
          <td>Min: <strong>{distroA.minRam}</strong> | Rec: <strong>{distroA.recommendedRam}</strong></td>
          <td>Min: <strong>{distroB.minRam}</strong> | Rec: <strong>{distroB.recommendedRam}</strong></td>
        </tr>

        <tr>
          <td><strong>Key Strengths</strong></td>
          <td>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 4px; font-size: 0.88rem;">
              {#each (distroA.pros || []) as pro}
                <li><span style="color: var(--accent-green);">✓</span> {pro}</li>
              {/each}
            </ul>
          </td>
          <td>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 4px; font-size: 0.88rem;">
              {#each (distroB.pros || []) as pro}
                <li><span style="color: var(--accent-green);">✓</span> {pro}</li>
              {/each}
            </ul>
          </td>
        </tr>

        <tr>
          <td><strong>Considerations / Cons</strong></td>
          <td>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 4px; font-size: 0.88rem;">
              {#each (distroA.cons || []) as con}
                <li><span style="color: var(--accent-red);">✗</span> {con}</li>
              {/each}
            </ul>
          </td>
          <td>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 4px; font-size: 0.88rem;">
              {#each (distroB.cons || []) as con}
                <li><span style="color: var(--accent-red);">✗</span> {con}</li>
              {/each}
            </ul>
          </td>
        </tr>

        <tr>
          <td><strong>Official Links</strong></td>
          <td>
            <a href={distroA.website} target="_blank" rel="noopener noreferrer" class="btn-secondary" style="padding: 6px 12px; font-size: 0.85rem; text-decoration: none;">
              Website ↗
            </a>
          </td>
          <td>
            <a href={distroB.website} target="_blank" rel="noopener noreferrer" class="btn-secondary" style="padding: 6px 12px; font-size: 0.85rem; text-decoration: none;">
              Website ↗
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<style>
  .compare-header-card {
    border: 2px solid var(--border-strong);
    background-color: var(--card-bg);
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: var(--shadow-sharp);
  }

  .compare-sort-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .compare-sort-label {
    font-family: var(--font-label);
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-subtle);
    white-space: nowrap;
  }

  .compare-sort-btn {
    padding: 6px 12px;
    font-family: var(--font-label);
    font-size: 0.82rem;
    white-space: nowrap;
  }

  .compare-search-input {
    width: 100%;
    padding: 10px 14px;
    border: 2px solid var(--border-strong);
    background-color: var(--bg-primary);
    font-size: 0.95rem;
    font-family: var(--font-sans);
  }

  .compare-search-input:focus {
    outline: 2px solid var(--accent-color);
  }

  .suggestions-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: var(--card-bg);
    border: 2px solid var(--border-strong);
    box-shadow: var(--shadow-sharp);
    z-index: 50;
    max-height: 280px;
    overflow-y: auto;
  }

  .suggestion-item {
    width: 100%;
    padding: 8px 12px;
    border: none;
    border-bottom: 1px solid var(--border-color);
    background: transparent;
    display: flex;
    align-items: center;
    gap: 10px;
    text-align: left;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .suggestion-item:hover {
    background-color: var(--surface-hover);
  }

  .suggestion-logo {
    width: 22px;
    height: 22px;
    object-fit: contain;
  }

  .compare-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-top: 18px;
    padding-top: 14px;
    border-top: 1px solid var(--border-color);
  }

  .share-note {
    font-family: var(--font-label);
    font-size: 0.72rem;
    color: var(--text-subtle);
  }

  .share-status {
    font-family: var(--font-label);
    font-size: 0.72rem;
    font-weight: 800;
    color: var(--accent-green);
  }

  @media (max-width: 760px) {
    .compare-header-card > div:nth-child(2) {
      grid-template-columns: 1fr !important;
    }
  }

  .active-sort {
    background-color: var(--border-strong) !important;
    color: var(--bg-primary) !important;
  }

  .compare-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.92rem;
  }

  .compare-table th {
    background-color: var(--bg-tertiary);
    border-bottom: 2px solid var(--border-strong);
    padding: 14px 16px;
    text-align: left;
  }

  .compare-table td {
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-color);
    vertical-align: top;
  }

  .compare-table tr:hover td {
    background-color: var(--surface-hover);
  }
</style>
