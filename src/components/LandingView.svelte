<script>
  /**
   * Keyword landing pages (hub, family, use case).
   *
   * The same content is pre-rendered into static HTML by
   * `scripts/seo-build.mjs`; this component is the client-side twin so the
   * SPA shows the page instead of a 404 when a visitor navigates to it.
   */
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
      <a class="btn-primary" href="/quiz/">Find my Linux distribution</a>
      <a class="btn-secondary" href="/directory/">Full directory</a>
    </div>
  </nav>
</div>

<style>
  .landing-crumbs {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-label);
    font-size: 0.8rem;
    color: var(--text-subtle);
    flex-wrap: wrap;
    margin-bottom: 18px;
  }

  .landing-crumbs a {
    color: var(--text-muted);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .landing-header {
    border: 2px solid var(--border-strong);
    background-color: var(--card-bg);
    box-shadow: var(--shadow-sharp);
    padding: 30px 32px;
    margin-bottom: 22px;
  }

  .landing-eyebrow {
    font-family: var(--font-label);
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent-color);
    display: block;
    margin-bottom: 10px;
  }

  .landing-header h1 {
    font-size: 2.1rem;
    font-weight: 900;
    line-height: 1.12;
    letter-spacing: -0.03em;
    margin-bottom: 10px;
    max-width: 22ch;
  }

  .landing-intro {
    color: var(--text-muted);
    font-size: 1rem;
    line-height: 1.55;
    max-width: 72ch;
  }

  .landing-count {
    margin-top: 14px;
    font-family: var(--font-label);
    font-size: 0.78rem;
    color: var(--text-subtle);
  }

  .landing-count strong {
    color: var(--text-main);
  }

  .landing-groups {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 18px;
    margin-bottom: 22px;
  }

  .landing-group {
    border: 1px solid var(--border-color);
    background-color: var(--card-bg);
    padding: 18px 20px;
  }

  .landing-group-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-family: var(--font-label);
    font-size: 0.78rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-subtle);
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 8px;
    margin-bottom: 12px;
  }

  .landing-group-count {
    color: var(--accent-color);
  }

  .landing-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .landing-list a {
    display: flex;
    flex-direction: column;
    gap: 2px;
    text-decoration: none;
    color: inherit;
    border-left: 2px solid transparent;
    padding-left: 10px;
  }

  .landing-list a:hover {
    border-left-color: var(--accent-color);
    background-color: transparent;
  }

  .landing-item-name {
    font-weight: 700;
    font-size: 0.98rem;
  }

  .landing-item-meta {
    font-family: var(--font-label);
    font-size: 0.75rem;
    color: var(--text-subtle);
    line-height: 1.4;
  }

  .landing-links {
    border: 2px solid var(--border-strong);
    background-color: var(--card-bg);
    box-shadow: var(--shadow-subtle);
    padding: 22px 24px;
  }

  .landing-links-title {
    font-family: var(--font-label);
    font-size: 0.72rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: var(--text-subtle);
    margin: 14px 0 8px;
  }

  .landing-links-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .landing-links-row a {
    font-family: var(--font-label);
    font-size: 0.8rem;
    font-weight: 600;
    border: 1px solid var(--border-color);
    padding: 5px 11px;
    text-decoration: none;
    color: var(--text-main);
  }

  .landing-links-row a:hover {
    border-color: var(--border-strong);
    background-color: var(--bg-tertiary);
  }

  .landing-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 20px;
    padding-top: 18px;
    border-top: 1px solid var(--border-color);
  }

  @media (max-width: 560px) {
    .landing-header {
      padding: 22px 20px;
    }

    .landing-header h1 {
      font-size: 1.6rem;
    }
  }
</style>
