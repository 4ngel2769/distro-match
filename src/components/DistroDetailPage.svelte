<script>
  import Icon from './Icon.svelte';
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
    <div class="not-found">
      <div class="not-found-mark"><Icon name="alert" size={18} /></div>
      <div class="eyebrow">404 — UNKNOWN DISTRIBUTION</div>
      <h1>This profile does not exist</h1>
      <p>The distribution may have been renamed or the link is incomplete.</p>
      <button class="btn-primary" onclick={onBack}>
        <Icon name="arrow-left" size={15} /> Back to the directory
      </button>
    </div>
  </div>
{:else}
  <div class="page-container distro-page">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <button class="crumb-link" onclick={onBack}>Directory</button>
      <span class="crumb-sep" aria-hidden="true">/</span>
      <span class="crumb-current">{distro.family}</span>
      <span class="crumb-sep" aria-hidden="true">/</span>
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

      <dl class="meta-table">
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
          <dd class="field-value">{distro.dwRank ? `#${distro.dwRank}` : 'Unranked'}</dd>
        </div>
        <div>
          <dt>Target user</dt>
          <dd>{titleCase(distro.userLevel)}</dd>
        </div>
      </dl>

      <div class="header-actions">
        <a href={distro.website} target="_blank" rel="noopener noreferrer" class="btn-primary">
          Official site <Icon name="external" size={15} />
        </a>
        {#if distro.downloadUrl && distro.downloadUrl !== distro.website}
          <a href={distro.downloadUrl} target="_blank" rel="noopener noreferrer" class="btn-secondary">
            Download <Icon name="external" size={15} />
          </a>
        {/if}
        {#if onCompareWith}
          <button class="btn-secondary" onclick={() => onCompareWith(distro.id)}>
            Compare <Icon name="swap" size={15} />
          </button>
        {/if}
      </div>
    </header>

    <!-- Screenshot plate -->
    <section class="shot-plate" aria-label="{distro.name} screenshots">
      <DistroGallery {distro} height={420} eager={true} />
      <div class="shot-caption">
        <span><strong>Desktop</strong>{distro.desktopEnvironments?.join(' · ') || 'Custom'}</span>
        <span><strong>Init</strong>{distro.initSystem}</span>
        <span><strong>Packages</strong>{distro.packageManager}</span>
        <span><strong>Release</strong>{titleCase(distro.releaseModel)}</span>
      </div>
    </section>

    <div class="profile-grid">
      <!-- Main column -->
      <div class="main-column">
        <section class="panel">
          <h2 class="section-title">Where it excels</h2>
          <ul class="trade-list">
            {#each distro.pros || [] as pro}
              <li><span class="mark good"><Icon name="check" size={15} /></span>{pro}</li>
            {/each}
          </ul>
        </section>

        <section class="panel">
          <h2 class="section-title">What you trade off</h2>
          <ul class="trade-list">
            {#each distro.cons || [] as con}
              <li><span class="mark bad"><Icon name="close" size={15} /></span>{con}</li>
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
            <li><a href={distro.website} target="_blank" rel="noopener noreferrer">Official website <Icon name="external" size={13} /></a></li>
            {#if distro.documentation}
              <li><a href={distro.documentation} target="_blank" rel="noopener noreferrer">Documentation / wiki <Icon name="external" size={13} /></a></li>
            {/if}
            <li><a href="https://distrowatch.com/table.php?distribution={distro.dwSlug || distro.id}" target="_blank" rel="noopener noreferrer">DistroWatch page <Icon name="external" size={13} /></a></li>
            {#if distro.logoCredit?.url}
              <li>
                <a href={distro.logoCredit.url} target="_blank" rel="noopener noreferrer">
                  Logo source ({distro.logoCredit.label}{distro.logoCredit.artist ? ` — ${distro.logoCredit.artist}` : ''}) <Icon name="external" size={13} />
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
        <div class="suggestion-list">
          {#each suggestions as other}
            <a
              class="suggestion-row"
              href="/distro/{other.id}/"
              onclick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
                e.preventDefault();
                onNavigateDistro?.(other.id);
              }}
            >
              <DistroLogo distro={other} size={32} decorative={true} />
              <span class="suggestion-name">{other.name}</span>
              <span class="suggestion-meta">{other.family} · {other.initSystem}</span>
              <span class="suggestion-arrow"><Icon name="arrow-right" size={15} /></span>
            </a>
          {/each}
        </div>
      </section>
    {/if}

    <div class="page-footer-nav">
      <button class="btn-secondary" onclick={onBack}>
        <Icon name="arrow-left" size={15} /> Back to directory
      </button>
      <span class="footer-hint">Facts are sourced from project documentation and DistroWatch.</span>
    </div>
  </div>
{/if}

<style>
  .distro-page {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.04em;
    color: var(--text-subtle);
    flex-wrap: wrap;
  }

  .crumb-link {
    background: transparent;
    border: none;
    padding: 0;
    font: inherit;
    color: var(--accent-ink);
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
    transition: color var(--dur-1) var(--ease-out);
  }

  .crumb-link:hover {
    color: var(--accent-hover);
  }

  .crumb-sep {
    color: var(--border-color);
  }

  .crumb-current {
    color: var(--text-muted);
  }

  .profile-header {
    border: 1px solid var(--border-color);
    background-color: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .identity-row {
    display: flex;
    gap: var(--space-5);
    align-items: flex-start;
  }

  .identity-text {
    min-width: 0;
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .title-row h1 {
    font-size: 2.2rem;
    font-weight: 700;
    line-height: 1.08;
    letter-spacing: -0.03em;
  }

  .tagline {
    margin-top: var(--space-2);
    font-size: 1rem;
    color: var(--text-muted);
    max-width: 62ch;
    line-height: 1.5;
  }

  .meta-table {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    border-top: 1px solid var(--hairline);
    border-left: 1px solid var(--hairline);
  }

  .meta-table > div {
    padding: var(--space-3) var(--space-4);
    border-right: 1px solid var(--hairline);
    border-bottom: 1px solid var(--hairline);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    min-width: 0;
  }

  .meta-table dt {
    font-family: var(--font-sans);
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-muted);
  }

  .meta-table dd {
    font-size: 0.92rem;
    font-weight: 600;
    color: var(--text-main);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .header-actions {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
    border-top: 1px solid var(--hairline);
    padding-top: var(--space-5);
  }

  .shot-plate {
    border: 1px solid var(--border-color);
    background-color: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
    overflow: hidden;
  }

  .shot-plate :global(.gallery) {
    border: 0;
  }

  .shot-caption {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-6);
    background-color: var(--bg-secondary);
    border-top: 1px solid var(--hairline);
    padding: var(--space-3) var(--space-4);
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
    font-size: 0.72rem;
    color: var(--text-muted);
  }

  .shot-caption span {
    display: inline-flex;
    align-items: baseline;
    gap: var(--space-2);
  }

  .shot-caption strong {
    color: var(--text-subtle);
    font-weight: 700;
  }

  .profile-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(260px, 1fr);
    gap: var(--space-7);
    align-items: start;
  }

  .main-column,
  .side-column {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .panel {
    min-width: 0;
  }

  .panel + .panel {
    padding-top: var(--space-5);
    border-top: 1px solid var(--hairline);
  }

  .section-title {
    font-family: var(--font-sans);
    font-size: 1.05rem;
    font-weight: 750;
    letter-spacing: -0.01em;
    color: var(--text-main);
    margin-bottom: var(--space-4);
  }

  .trade-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    font-size: 0.94rem;
    line-height: 1.5;
  }

  .trade-list li {
    display: flex;
    gap: var(--space-3);
    align-items: flex-start;
  }

  .mark {
    display: inline-flex;
    flex-shrink: 0;
    margin-top: 2px;
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
    gap: var(--space-2);
  }

  .use-tag {
    font-family: var(--font-sans);
    font-size: 0.8rem;
    font-weight: 600;
    border: 1px solid var(--tag-neutral-border);
    background-color: var(--tag-neutral-bg);
    color: var(--tag-neutral-text);
    padding: 5px 12px;
    border-radius: var(--radius-pill);
  }

  .footnote {
    margin-top: var(--space-3);
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--text-subtle);
  }

  .spec-list {
    display: flex;
    flex-direction: column;
  }

  .spec-list div {
    display: flex;
    justify-content: space-between;
    gap: var(--space-4);
    padding: var(--space-2) 0;
    border-bottom: 1px solid var(--hairline);
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
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
    font-size: 0.78rem;
    line-height: 1.45;
    text-align: right;
    color: var(--text-main);
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .link-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    font-size: 0.88rem;
  }

  .link-list a {
    display: inline-flex;
    align-items: baseline;
    gap: var(--space-1);
    transition: color var(--dur-1) var(--ease-out);
  }

  .suggestions {
    border-top: 1px solid var(--hairline);
    padding-top: var(--space-5);
  }

  .suggestion-list {
    display: flex;
    flex-direction: column;
  }

  .suggestion-row {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-3) var(--space-2);
    border-bottom: 1px solid var(--hairline);
    text-decoration: none;
    color: inherit;
    transition: background-color var(--dur-1) var(--ease-out);
  }

  .suggestion-row:hover {
    background-color: var(--surface-hover);
  }

  .suggestion-name {
    font-weight: 700;
    font-size: 0.95rem;
    line-height: 1.2;
  }

  .suggestion-meta {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--text-subtle);
  }

  .suggestion-arrow {
    display: inline-flex;
    margin-left: auto;
    color: var(--accent-color);
    transition: transform var(--dur-1) var(--ease-out);
  }

  .suggestion-row:hover .suggestion-arrow {
    transform: translateX(3px);
  }

  .page-footer-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-4);
    flex-wrap: wrap;
    border-top: 1px solid var(--hairline);
    padding-top: var(--space-5);
  }

  .footer-hint {
    font-size: 0.84rem;
    color: var(--text-muted);
  }

  .not-found {
    border: 1px solid var(--border-color);
    background-color: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
    padding: var(--space-7);
    max-width: 60ch;
  }

  .not-found-mark {
    display: inline-flex;
    color: var(--accent-red);
    margin-bottom: var(--space-3);
  }

  .eyebrow {
    font-family: var(--font-mono);
    font-size: 0.74rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    color: var(--accent-red);
    margin-bottom: var(--space-2);
  }

  .not-found h1 {
    font-size: 1.9rem;
    font-weight: 700;
    margin-bottom: var(--space-2);
  }

  .not-found p {
    color: var(--text-muted);
    margin-bottom: var(--space-5);
  }

  @media (max-width: 860px) {
    .profile-grid {
      grid-template-columns: 1fr;
      gap: var(--space-6);
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
      padding: var(--space-5);
    }
  }
</style>
