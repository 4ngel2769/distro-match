<script>
  import { LINUX_DISTROS } from '../data/distros.js';
  import DistroLogo from './DistroLogo.svelte';
  import DistroGallery from './DistroGallery.svelte';

  let { distro = null, onBack, onNavigateDistro, onCompareWith } = $props();

  const USE_CASE_LABELS = {
    'daily-driver': 'Everyday desktop',
    gaming: 'Gaming',
    'software-development': 'Software development',
    'privacy-anonymity': 'Privacy & anonymity',
    'cybersecurity-pentesting': 'Security testing',
    'server-homelab': 'Server / homelab',
    'creative-multimedia': 'Creative & multimedia',
    'multimedia-creation': 'Multimedia creation',
    'low-spec-hardware': 'Low-spec hardware',
    'tinkering-minimalism': 'Tinkering & minimalism',
    'enterprise-stability': 'Enterprise stability',
    education: 'Education'
  };

  let related = $derived.by(() => {
    if (!distro) return [];
    return LINUX_DISTROS.filter((d) => d.id !== distro.id && d.family === distro.family)
      .sort((a, b) => (a.dwRank || 999) - (b.dwRank || 999))
      .slice(0, 4);
  });

  let altRelated = $derived.by(() => {
    if (!distro || related.length >= 3) return [];
    return LINUX_DISTROS.filter((d) => d.id !== distro.id && d.family !== distro.family)
      .sort((a, b) => {
        const aShared = (a.primaryUseCases || []).filter((u) => (distro.primaryUseCases || []).includes(u)).length;
        const bShared = (b.primaryUseCases || []).filter((u) => (distro.primaryUseCases || []).includes(u)).length;
        return bShared - aShared || (a.dwRank || 999) - (b.dwRank || 999);
      })
      .slice(0, 3 - related.length);
  });

  let suggestions = $derived([...related, ...altRelated]);
  let useCases = $derived((distro?.primaryUseCases || []).filter((u) => u !== 'general-purpose'));

  function capabilityLabel(value) {
    const map = {
      'excellent-nvidia': 'Excellent NVIDIA support',
      'standard-nvidia': 'Standard NVIDIA support',
      'mesa-only': 'Open-source GPU drivers only',
      'stellar-apu-gaming': 'Tuned for AMD APUs',
      'standard-apu': 'Standard APU support',
      '100-libre-fsf': '100% free software (FSF)',
      'free-with-opt-in': 'Free by default, opt-in firmware',
      pragmatic: 'Pragmatic — includes proprietary bits'
    };
    return map[value] || value;
  }

  function titleCase(value) {
    if (!value) return '—';
    return value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
</script>

{#if !distro}
  <div class="page-container">
    <div class="not-found-card">
      <div class="eyebrow">404 — UNKNOWN DISTRIBUTION</div>
      <h1>This profile does not exist</h1>
      <p>The distribution may have been renamed or the link is incomplete.</p>
      <button class="btn-primary" onclick={onBack}>Back to the directory</button>
    </div>
  </div>
{:else}
  <div class="page-container distro-page">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <button class="crumb-link" onclick={onBack}>Directory</button>
      <span class="crumb-sep">/</span>
      <span class="crumb-current">{distro.family}</span>
      <span class="crumb-sep">/</span>
      <span class="crumb-current" aria-current="page">{distro.name}</span>
    </nav>

    <!-- Identity header -->
    <header class="profile-header">
      <div class="identity-row">
        <DistroLogo {distro} size={72} />
        <div class="identity-text">
          <div class="title-row">
            <h1>{distro.name}</h1>
            <span class="tier-badge tier-{distro.tier}">{distro.tier}</span>
          </div>
          <p class="tagline">{distro.tagline}</p>
        </div>
      </div>

      <dl class="meta-grid">
        <div>
          <dt>Family</dt>
          <dd>{distro.family}</dd>
        </div>
        <div>
          <dt>Based on</dt>
          <dd>{distro.base}</dd>
        </div>
        <div>
          <dt>DistroWatch</dt>
          <dd>{distro.dwRank ? `#${distro.dwRank}` : 'Unranked'}</dd>
        </div>
        <div>
          <dt>Target user</dt>
          <dd>{titleCase(distro.userLevel)}</dd>
        </div>
      </dl>

      <div class="header-actions">
        <a href={distro.website} target="_blank" rel="noopener noreferrer" class="btn-primary">
          Official site ↗
        </a>
        {#if distro.downloadUrl && distro.downloadUrl !== distro.website}
          <a href={distro.downloadUrl} target="_blank" rel="noopener noreferrer" class="btn-secondary">
            Download ↗
          </a>
        {/if}
        {#if onCompareWith}
          <button class="btn-secondary" onclick={() => onCompareWith(distro.id)}>
            Compare ⇄
          </button>
        {/if}
      </div>
    </header>

    <!-- Screenshot carousel -->
    <section class="shot-section" aria-label="{distro.name} screenshots">
      <DistroGallery {distro} height={420} eager={true} />
      <div class="shot-caption">
        <span><strong>Desktop</strong> {distro.desktopEnvironments?.join(' · ') || 'Custom'}</span>
        <span><strong>Init</strong> {distro.initSystem}</span>
        <span><strong>Packages</strong> {distro.packageManager}</span>
        <span><strong>Release</strong> {titleCase(distro.releaseModel)}</span>
      </div>
    </section>

    <div class="profile-grid">
      <!-- Main column -->
      <div class="main-column">
        <section class="panel">
          <h2 class="section-title">Where it excels</h2>
          <ul class="pros-list">
            {#each distro.pros || [] as pro}
              <li><span class="mark good" aria-hidden="true">■</span> {pro}</li>
            {/each}
          </ul>
        </section>

        <section class="panel">
          <h2 class="section-title">What you trade off</h2>
          <ul class="cons-list">
            {#each distro.cons || [] as con}
              <li><span class="mark bad" aria-hidden="true">■</span> {con}</li>
            {/each}
          </ul>
        </section>

        <section class="panel">
          <h2 class="section-title">Best for</h2>
          <div class="tag-row">
            {#each useCases as useCase}
              <span class="use-tag">{USE_CASE_LABELS[useCase] || titleCase(useCase)}</span>
            {/each}
          </div>
          {#if distro.architectures?.length}
            <div class="footnote">
              Official builds: {distro.architectures.join(' · ')}
            </div>
          {/if}
        </section>
      </div>

      <!-- Sidebar -->
      <aside class="side-column">
        <section class="panel spec-panel">
          <h2 class="section-title">Technical sheet</h2>
          <dl class="spec-list">
            <div><dt>Package manager</dt><dd>{distro.packageManager}</dd></div>
            <div><dt>Init system</dt><dd>{distro.initSystem}</dd></div>
            <div><dt>Release model</dt><dd>{titleCase(distro.releaseModel)}</dd></div>
            {#if distro.firstRelease}
              <div><dt>First release</dt><dd>{distro.firstRelease}</dd></div>
            {/if}
            {#if distro.latestRelease}
              <div><dt>Latest release</dt><dd>{distro.latestRelease}</dd></div>
            {/if}
            <div><dt>Desktops</dt><dd>{distro.desktopEnvironments?.join(', ') || 'Custom'}</dd></div>
            <div><dt>RAM (min / rec.)</dt><dd>{distro.minRam} / {distro.recommendedRam}</dd></div>
            <div><dt>Hardware target</dt><dd>{titleCase(distro.hardwareSpec)}</dd></div>
            <div><dt>GPU support</dt><dd>{capabilityLabel(distro.gpuSupport)}</dd></div>
            <div><dt>Software stance</dt><dd>{capabilityLabel(distro.freeSoftwareStrictness)}</dd></div>
            <div><dt>Architectures</dt><dd>{distro.architectures?.join(', ') || 'x86_64'}</dd></div>
          </dl>
        </section>

        <section class="panel">
          <h2 class="section-title">Official links</h2>
          <ul class="link-list">
            <li><a href={distro.website} target="_blank" rel="noopener noreferrer">Official website ↗</a></li>
            {#if distro.documentation}
              <li><a href={distro.documentation} target="_blank" rel="noopener noreferrer">Documentation / wiki ↗</a></li>
            {/if}
            <li><a href="https://distrowatch.com/table.php?distribution={distro.dwSlug || distro.id}" target="_blank" rel="noopener noreferrer">DistroWatch page ↗</a></li>
            {#if distro.logoCredit?.url}
              <li>
                <a href={distro.logoCredit.url} target="_blank" rel="noopener noreferrer">
                  Logo source ({distro.logoCredit.label}{distro.logoCredit.artist ? ` — ${distro.logoCredit.artist}` : ''}) ↗
                </a>
              </li>
            {/if}
          </ul>
        </section>
      </aside>
    </div>

    {#if suggestions.length}
      <section class="suggestions">
        <h2 class="section-title">Similar distributions</h2>
        <div class="suggestion-grid">
          {#each suggestions as other}
            <a
              class="suggestion-card"
              href="/distro/{other.id}/"
              onclick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
                e.preventDefault();
                onNavigateDistro?.(other.id);
              }}
            >
              <DistroLogo distro={other} size={36} decorative={true} />
              <div>
                <div class="suggestion-name">{other.name}</div>
                <div class="suggestion-meta">{other.family} · {other.initSystem}</div>
              </div>
            </a>
          {/each}
        </div>
      </section>
    {/if}

    <div class="page-footer-nav">
      <button class="btn-secondary" onclick={onBack}>← Back to directory</button>
      <span class="footer-hint">Facts are sourced from project documentation and DistroWatch.</span>
    </div>
  </div>
{/if}

<style>
  .distro-page {
    display: flex;
    flex-direction: column;
    gap: 22px;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-label);
    font-size: 0.8rem;
    color: var(--text-subtle);
    flex-wrap: wrap;
  }

  .crumb-link {
    background: transparent;
    border: none;
    padding: 0;
    font: inherit;
    color: var(--text-main);
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }

  .crumb-sep {
    opacity: 0.5;
  }

  .crumb-current {
    color: var(--text-muted);
  }

  .profile-header {
    border: 2px solid var(--border-strong);
    background-color: var(--card-bg);
    box-shadow: var(--shadow-sharp);
    padding: 26px 28px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .identity-row {
    display: flex;
    gap: 20px;
    align-items: flex-start;
  }

  .identity-text {
    min-width: 0;
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .title-row h1 {
    font-size: 2.4rem;
    font-weight: 900;
    line-height: 1.05;
    letter-spacing: -0.03em;
  }

  .tagline {
    margin-top: 6px;
    font-size: 1.02rem;
    color: var(--text-muted);
    max-width: 62ch;
    line-height: 1.5;
  }

  .meta-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    border: 1px solid var(--border-color);
  }

  .meta-grid > div {
    padding: 10px 14px;
    border-right: 1px solid var(--border-color);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .meta-grid dt {
    font-family: var(--font-label);
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-subtle);
  }

  .meta-grid dd {
    font-size: 0.92rem;
    font-weight: 600;
    color: var(--text-main);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .header-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    border-top: 1px solid var(--border-color);
    padding-top: 18px;
  }

  .shot-section {
    border: 2px solid var(--border-strong);
    background-color: var(--card-bg);
    box-shadow: var(--shadow-sharp);
    overflow: hidden;
  }

  .shot-section :global(.gallery) {
    border: 0;
  }

  .shot-caption {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 22px;
    background-color: var(--bg-tertiary);
    border-top: 1px solid var(--border-color);
    padding: 10px 16px;
    font-family: var(--font-label);
    font-size: 0.76rem;
    color: var(--text-muted);
  }

  .shot-caption strong {
    color: var(--text-muted);
    font-size: 0.76rem;
    font-weight: 700;
    margin-right: 5px;
  }

  .profile-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(260px, 1fr);
    gap: 18px;
    align-items: start;
  }

  .main-column,
  .side-column {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  /* Sections are separated by quiet dividers instead of stacked boxes. */
  .panel {
    padding: 4px 0;
  }

  .panel + .panel {
    border-top: 1px solid var(--border-color);
    padding-top: 18px;
  }

  .section-title {
    font-size: 0.8rem;
    font-weight: 800;
    font-family: var(--font-label);
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--text-subtle);
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 8px;
    margin-bottom: 14px;
  }

  .pros-list,
  .cons-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 9px;
    font-size: 0.94rem;
    line-height: 1.5;
  }

  .pros-list li,
  .cons-list li {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  .mark {
    font-size: 0.7rem;
    line-height: 1.7;
  }

  .mark.good {
    color: var(--accent-green);
  }

  .mark.bad {
    color: var(--accent-red);
  }

  .tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .use-tag {
    font-family: var(--font-label);
    font-size: 0.76rem;
    font-weight: 500;
    border: 1px solid var(--tag-neutral-border);
    background-color: var(--tag-neutral-bg);
    color: var(--tag-neutral-text);
    padding: 5px 10px;
  }

  .footnote {
    margin-top: 12px;
    font-family: var(--font-label);
    font-size: 0.74rem;
    color: var(--text-subtle);
  }

  .spec-list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .spec-list div {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid var(--border-color);
    font-size: 0.86rem;
  }

  .spec-list div:last-child {
    border-bottom: none;
  }

  .spec-list dt {
    font-family: var(--font-label);
    font-size: 0.8rem;
    color: var(--text-subtle);
    flex-shrink: 0;
  }

  .spec-list dd {
    text-align: right;
    font-weight: 600;
    min-width: 0;
  }

  .link-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 0.9rem;
  }

  .suggestions {
    border: 2px solid var(--border-strong);
    background-color: var(--card-bg);
    box-shadow: var(--shadow-sharp);
    padding: 22px;
  }

  .suggestion-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 10px;
  }

  .suggestion-card {
    display: flex;
    align-items: center;
    gap: 12px;
    border: 1px solid var(--border-color);
    padding: 12px 14px;
    text-decoration: none;
    color: inherit;
    transition: border-color 0.1s ease, background-color 0.1s ease;
  }

  .suggestion-card:hover {
    border-color: var(--border-strong);
    background-color: var(--surface-hover);
  }

  .suggestion-name {
    font-weight: 800;
    font-size: 0.95rem;
    line-height: 1.2;
  }

  .suggestion-meta {
    font-family: var(--font-label);
    font-size: 0.72rem;
    color: var(--text-subtle);
    margin-top: 2px;
  }

  .page-footer-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .footer-hint {
    font-family: var(--font-label);
    font-size: 0.74rem;
    color: var(--text-subtle);
  }

  .not-found-card {
    border: 2px solid var(--border-strong);
    box-shadow: var(--shadow-sharp);
    background-color: var(--card-bg);
    padding: 40px;
  }

  .eyebrow {
    font-family: var(--font-label);
    font-size: 0.8rem;
    font-weight: 800;
    color: var(--accent-red);
    margin-bottom: 8px;
  }

  .not-found-card h1 {
    font-size: 2rem;
    margin-bottom: 8px;
  }

  .not-found-card p {
    color: var(--text-muted);
    margin-bottom: 20px;
  }

  @media (max-width: 860px) {
    .profile-grid {
      grid-template-columns: 1fr;
    }

    .title-row h1 {
      font-size: 1.9rem;
    }
  }

  @media (max-width: 560px) {
    .identity-row {
      flex-direction: column;
    }

    .profile-header {
      padding: 20px;
    }
  }
</style>
