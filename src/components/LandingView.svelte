<script>
  /**
   * Keyword landing pages (hub, family, use case).
   *
   * The same content is pre-rendered into static HTML by
   * `scripts/seo-build.mjs`; this component is the client-side twin so the
   * SPA shows the page instead of a 404 when a visitor navigates to it.
   */
  import Icon from './Icon.svelte';
  import { LINUX_DISTROS } from '../data/distros.js';
  import { FAMILY_PAGES, USE_CASE_PAGES, HUB_PAGE, landingPath } from '../data/landingPages.js';

  let { kind = 'hub', slug = '' } = $props();

  let page = $derived(
    kind === 'hub'
      ? HUB_PAGE
      : kind === 'family'
        ? FAMILY_PAGES.find((p) => p.slug === slug) || HUB_PAGE
        : USE_CASE_PAGES.find((p) => p.slug === slug) || HUB_PAGE
  );

  let distros = $derived.by(() => {
    if (kind === 'family') {
      const family = FAMILY_PAGES.find((p) => p.slug === slug);
      return family ? LINUX_DISTROS.filter(family.match) : [];
    }
    if (kind === 'use-case') {
      const useCase = USE_CASE_PAGES.find((p) => p.slug === slug);
      return useCase
        ? LINUX_DISTROS.filter((d) => (d.primaryUseCases || []).includes(useCase.useCase))
        : [];
    }
    return LINUX_DISTROS;
  });

  let byFamily = $derived.by(() => {
    const groups = new Map();
    for (const distro of distros) {
      if (!groups.has(distro.family)) groups.set(distro.family, []);
      groups.get(distro.family).push(distro);
    }
    return [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
  });

  let kindLabel = $derived(kind === 'hub' ? 'The full catalogue' : kind === 'family' ? 'Family guide' : 'Use case guide');
</script>

<div class="page-container landing-page">
  <nav class="landing-crumbs" aria-label="Breadcrumb">
    <a href="/">Home</a>
    <span>/</span>
    <a href="/directory/">Distributions</a>
    <span>/</span>
    <span aria-current="page">{page.label}</span>
  </nav>

  <header class="landing-header">
    <div class="landing-copy">
      <span class="landing-kicker">{kindLabel}</span>
      <h1>{page.label}</h1>
      <p class="landing-intro">{page.intro}</p>
      <div class="landing-meta">
        <span class="count-pill"><strong>{distros.length}</strong> {distros.length === 1 ? 'distribution' : 'distributions'}</span>
        <span class="meta-note">Grouped by family, with verified screenshots and full profiles</span>
      </div>
    </div>
  </header>

  <div class="landing-section-head">
    <h2>Distributions in this collection</h2>
    <p>Each row links to a full profile with hardware needs, package details and pros and cons.</p>
  </div>

  <section class="landing-groups">
    {#each byFamily as [family, items]}
      <div class="landing-group">
        <div class="group-head">
          <h3>{family}</h3>
          <span class="group-count">{items.length}</span>
        </div>
        <ul class="landing-list">
          {#each items as distro (distro.id)}
            <li>
              <a href={`/distro/${distro.id}/`}>
                <span class="item-dot" style="background-color: {distro.accentColor || 'var(--accent-fill)'}"></span>
                <span class="item-body">
                  <strong>{distro.name}</strong>
                  <small>{distro.packageManager.split('/')[0].trim()} · {distro.releaseModel} · {distro.hardwareSpec?.replace(/-/g, ' ')}</small>
                </span>
                <span class="item-arrow"><Icon name="arrow-right" size={15} /></span>
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </section>

  <nav class="landing-links" aria-label="Related keyword pages">
    <div class="link-column">
      <h2>Browse by family</h2>
      <div class="landing-links-row">
        {#each FAMILY_PAGES as family}
          <a href={landingPath('family', family.slug)}>{family.label}</a>
        {/each}
      </div>
    </div>
    <div class="link-column">
      <h2>Browse by use case</h2>
      <div class="landing-links-row">
        {#each USE_CASE_PAGES as useCase}
          <a href={landingPath('use-case', useCase.slug)}>{useCase.label}</a>
        {/each}
      </div>
    </div>

    <div class="landing-actions">
      <a class="btn-primary" href="/quiz/">Take the finder quiz <Icon name="arrow-right" size={15} /></a>
      <a class="btn-secondary" href="/directory/">Full directory <Icon name="arrow-right" size={15} /></a>
    </div>
  </nav>
</div>

<style>
  .landing-page {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .landing-crumbs {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: 0.8rem;
    color: var(--text-subtle);
    flex-wrap: wrap;
  }

  .landing-crumbs a {
    color: var(--text-muted);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .landing-crumbs a:hover {
    color: var(--accent-ink);
  }

  .landing-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-6);
    border: 1px solid var(--tier-flagship-border);
    background-color: var(--tier-flagship-bg);
    border-radius: var(--radius-lg);
    padding: var(--space-7);
    position: relative;
    overflow: hidden;
  }

  .landing-header::after {
    content: '';
    position: absolute;
    right: -60px;
    top: -80px;
    width: 240px;
    height: 240px;
    border-radius: 999px;
    background-color: var(--accent-wash);
    pointer-events: none;
  }

  .landing-copy {
    position: relative;
    z-index: 1;
    max-width: 72ch;
  }

  .landing-kicker {
    display: inline-block;
    font-size: 0.78rem;
    font-weight: 750;
    color: var(--tier-flagship-text);
    margin-bottom: var(--space-3);
  }

  .landing-header h1 {
    font-size: 2.2rem;
    font-weight: 750;
    line-height: 1.12;
    letter-spacing: -0.03em;
    margin-bottom: var(--space-3);
    max-width: 24ch;
  }

  .landing-intro {
    color: var(--text-muted);
    font-size: 1rem;
    line-height: 1.65;
  }

  .landing-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-3);
    margin-top: var(--space-4);
  }

  .count-pill {
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    padding: 6px 12px;
    border-radius: var(--radius-pill);
    background-color: var(--card-bg);
    color: var(--text-muted);
    font-size: 0.8rem;
    font-weight: 600;
  }

  .count-pill strong {
    color: var(--accent-ink);
    font-size: 0.95rem;
  }

  .meta-note {
    font-size: 0.82rem;
    color: var(--text-muted);
  }

  .landing-section-head h2 {
    font-size: 1.3rem;
    font-weight: 750;
    letter-spacing: -0.02em;
  }

  .landing-section-head p {
    font-size: 0.9rem;
    color: var(--text-muted);
    margin-top: 4px;
  }

  .landing-groups {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
    gap: var(--space-4);
    align-items: start;
  }

  .landing-group {
    border: 1px solid var(--border-color);
    background-color: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
    padding: var(--space-4);
    overflow: hidden;
  }

  .group-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding-bottom: var(--space-3);
    border-bottom: 1px solid var(--border-color);
  }

  .group-head h3 {
    font-size: 0.95rem;
    font-weight: 750;
  }

  .group-count {
    font-family: var(--font-mono);
    font-size: 0.74rem;
    font-weight: 600;
    color: var(--accent-ink);
    background-color: var(--accent-soft);
    padding: 3px 9px;
    border-radius: var(--radius-pill);
  }

  .landing-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-top: var(--space-2);
  }

  .landing-list a {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: 10px;
    border-radius: var(--radius-sm);
    color: inherit;
    text-decoration: none;
    transition: background-color var(--dur-1) var(--ease-out);
  }

  .landing-list a:hover {
    background-color: var(--accent-soft);
  }

  .item-dot {
    width: 9px;
    height: 9px;
    flex: 0 0 9px;
    border-radius: var(--radius-pill);
  }

  .item-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }

  .item-body strong {
    font-size: 0.9rem;
    font-weight: 700;
  }

  .item-body small {
    font-size: 0.74rem;
    color: var(--text-muted);
    line-height: 1.4;
  }

  .item-arrow {
    display: inline-flex;
    color: var(--accent-color);
    opacity: 0;
    transition: opacity var(--dur-1) var(--ease-out), transform var(--dur-1) var(--ease-out);
  }

  .landing-list a:hover .item-arrow {
    opacity: 1;
    transform: translateX(2px);
  }

  .landing-links {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-5);
    border: 1px solid var(--border-color);
    background-color: var(--card-bg);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
  }

  .link-column h2 {
    font-size: 0.95rem;
    font-weight: 750;
    margin-bottom: var(--space-3);
  }

  .landing-links-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .landing-links-row a {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-muted);
    text-decoration: none;
    padding: 5px 11px;
    border-radius: var(--radius-pill);
    background-color: var(--bg-primary);
    border: 1px solid var(--border-color);
    transition: border-color var(--dur-1) var(--ease-out), background-color var(--dur-1) var(--ease-out), color var(--dur-1) var(--ease-out);
  }

  .landing-links-row a:hover {
    border-color: var(--accent-color);
    background-color: var(--accent-soft);
    color: var(--accent-ink);
  }

  .landing-actions {
    grid-column: 1 / -1;
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
    padding-top: var(--space-4);
    border-top: 1px solid var(--border-color);
  }

  @media (max-width: 560px) {
    .landing-header {
      padding: var(--space-5);
    }

    .landing-header h1 {
      font-size: 1.6rem;
    }

    .landing-links {
      grid-template-columns: 1fr;
      padding: var(--space-4);
    }
  }
</style>
