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
</script>

<div class="page-container">
  <nav class="landing-crumbs" aria-label="Breadcrumb">
    <a href="/">Home</a>
    <span>/</span>
    <a href="/directory/">Distributions</a>
    <span>/</span>
    <span aria-current="page">{page.label}</span>
  </nav>

  <header class="landing-header">
    <span class="landing-eyebrow">{kind === 'hub' ? 'DIRECTORY' : kind === 'family' ? 'FAMILY' : 'USE CASE'}</span>
    <h1>{page.title.replace(' | LinuxMatch', '')}</h1>
    <p class="landing-intro">{page.intro}</p>
    <p class="landing-count">
      <strong>{distros.length}</strong>
      {distros.length === 1 ? 'distribution' : 'distributions'} listed
    </p>
  </header>

  <section class="landing-groups">
    {#each byFamily as [family, items]}
      <div class="landing-group">
        <h2 class="landing-group-title">
          {family}
          <span class="landing-group-count">{items.length}</span>
        </h2>
        <ul class="landing-list">
          {#each items as distro (distro.id)}
            <li>
              <a href={`/distro/${distro.id}/`}>
                <span class="landing-item-name">{distro.name}</span>
                <span class="landing-item-meta">
                  {distro.initSystem} · {distro.packageManager.split('/')[0].trim()} · {distro.tagline}
                </span>
                <span class="landing-item-arrow"><Icon name="arrow-right" size={14} /></span>
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </section>

  <nav class="landing-links" aria-label="Related keyword pages">
    <h2 class="landing-links-title">Browse by family</h2>
    <div class="landing-links-row">
      {#each FAMILY_PAGES as family}
        <a href={landingPath('family', family.slug)}>{family.label}</a>
      {/each}
    </div>

    <h2 class="landing-links-title">Browse by use case</h2>
    <div class="landing-links-row">
      {#each USE_CASE_PAGES as useCase}
        <a href={landingPath('use-case', useCase.slug)}>{useCase.label}</a>
      {/each}
    </div>

    <div class="landing-actions">
      <a class="btn-primary" href="/quiz/">Find my Linux distribution <Icon name="arrow-right" size={15} /></a>
      <a class="btn-secondary" href="/directory/">Full directory <Icon name="arrow-right" size={15} /></a>
    </div>
  </nav>
</div>

<style>
  .landing-crumbs {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--text-subtle);
    flex-wrap: wrap;
    margin-bottom: var(--space-5);
  }

  .landing-crumbs a {
    color: var(--text-muted);
    text-decoration: underline;
    text-underline-offset: 3px;
    transition: color var(--dur-1) var(--ease-out);
  }

  .landing-crumbs a:hover {
    color: var(--accent-ink);
  }

  .landing-header {
    border: 1px solid var(--hairline);
    border-top: 2px solid var(--border-strong);
    background-color: var(--card-bg);
    padding: var(--space-7) var(--space-6);
    margin-bottom: var(--space-5);
  }

  .landing-eyebrow {
    display: block;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent-color);
    margin-bottom: var(--space-3);
  }

  .landing-header h1 {
    font-size: 2.1rem;
    font-weight: 700;
    line-height: 1.12;
    letter-spacing: -0.03em;
    margin-bottom: var(--space-3);
    max-width: 22ch;
  }

  .landing-intro {
    color: var(--text-muted);
    font-size: 1rem;
    line-height: 1.55;
    max-width: 72ch;
  }

  .landing-count {
    margin-top: var(--space-4);
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
    font-size: 0.78rem;
    color: var(--text-subtle);
  }

  .landing-count strong {
    color: var(--text-main);
  }

  .landing-groups {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: var(--space-5);
    margin-bottom: var(--space-5);
  }

  .landing-group {
    border: 1px solid var(--hairline);
    background-color: var(--card-bg);
    padding: var(--space-5);
  }

  .landing-group-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    font-family: var(--font-mono);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-subtle);
    border-bottom: 1px solid var(--hairline);
    padding-bottom: var(--space-2);
    margin-bottom: var(--space-3);
  }

  .landing-group-count {
    font-variant-numeric: tabular-nums;
    color: var(--accent-ink);
  }

  .landing-list {
    list-style: none;
    display: flex;
    flex-direction: column;
  }

  .landing-list li + li {
    border-top: 1px solid var(--hairline);
  }

  .landing-list a {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 2px;
    text-decoration: none;
    color: inherit;
    padding: var(--space-3) var(--space-6) var(--space-3) 0;
    transition: background-color var(--dur-1) var(--ease-out);
  }

  .landing-list a:hover {
    background-color: var(--surface-hover);
  }

  .landing-item-name {
    font-weight: 700;
    font-size: 0.96rem;
  }

  .landing-item-meta {
    font-family: var(--font-label);
    font-size: 0.75rem;
    color: var(--text-subtle);
    line-height: 1.4;
  }

  .landing-item-arrow {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    display: inline-flex;
    color: var(--accent-color);
    opacity: 0;
    transition: opacity var(--dur-1) var(--ease-out), transform var(--dur-1) var(--ease-out);
  }

  .landing-list a:hover .landing-item-arrow {
    opacity: 1;
    transform: translate(2px, -50%);
  }

  .landing-links {
    border: 1px solid var(--hairline);
    background-color: var(--card-bg);
    padding: var(--space-6);
  }

  .landing-links-title {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-subtle);
    margin: var(--space-4) 0 var(--space-2);
  }

  .landing-links-title:first-child {
    margin-top: 0;
  }

  .landing-links-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .landing-links-row a {
    font-family: var(--font-label);
    font-size: 0.8rem;
    font-weight: 600;
    border: 1px solid var(--border-color);
    padding: 5px 11px;
    text-decoration: none;
    color: var(--text-main);
    background-color: var(--tag-neutral-bg);
    transition: border-color var(--dur-1) var(--ease-out), background-color var(--dur-1) var(--ease-out);
  }

  .landing-links-row a:hover {
    border-color: var(--border-strong);
    background-color: var(--bg-tertiary);
  }

  .landing-actions {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
    margin-top: var(--space-5);
    padding-top: var(--space-4);
    border-top: 1px solid var(--hairline);
  }

  .landing-actions :global(svg) {
    margin-left: var(--space-1);
  }

  @media (max-width: 560px) {
    .landing-header {
      padding: var(--space-5);
    }

    .landing-header h1 {
      font-size: 1.6rem;
    }
  }
</style>
