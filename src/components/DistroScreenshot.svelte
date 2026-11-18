<script>
  /**
   * Desktop screenshot with a graceful, honest fallback.
   *
   * Screenshots live in the local verified asset library. When a distro has no
   * freely licensed screenshot we render a labelled placeholder instead of
   * borrowing another distro's desktop (which is what the old hard-coded
   * Linux Mint fallback did).
   */
  import DistroLogo from './DistroLogo.svelte';

  let { distro = null, height = 380, eager = false, compact = false, fit = 'contain', showName = true } = $props();

  let failed = $state(false);
  let src = $derived(distro?.screenshotUrl || '');
  let credit = $derived(distro?.screenshotCredit || null);
  // Phone/tablet captures are much taller than the 16:9 card frame. Cropping
  // them with `cover` can hide most of the UI, so show the whole capture and
  // letterbox it instead of pretending it is a desktop screenshot.
  let letterbox = $derived((distro?.screenshotAspect || 1) < 1.15);

  $effect(() => {
    src;
    failed = false;
  });
</script>

<div
  class="screenshot-shell"
  style="--shot-height: {height}px; --shot-accent: {distro?.accentColor || 'var(--accent-fill)'};"
>
  {#if src && !failed}
    <img
      {src}
      class:shot-letterbox={letterbox}
      class:shot-contain={fit === 'contain'}
      alt="{distro?.name} desktop screenshot"
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onerror={() => { failed = true; }}
    />
  {:else}
    <div
      class="shot-placeholder"
      class:shot-placeholder--compact={compact}
      role="img"
      aria-label="No screenshot available for {distro?.name}"
    >
      {#if compact}
        <DistroLogo {distro} size={34} decorative={true} />
        {#if showName}
          <span class="shot-compact-name">{distro?.name}</span>
        {/if}
      {:else}
        <div class="shot-placeholder-bar" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
        <div class="shot-placeholder-body">
          <DistroLogo {distro} size={64} decorative={true} />
          <div class="shot-placeholder-name">{distro?.name}</div>
          <div class="shot-placeholder-copy">
            No freely licensed screenshot in our library yet.
          </div>
          {#if distro?.website}
            <a
              class="shot-placeholder-link"
              href={distro.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              See the official gallery ↗
            </a>
          {/if}
        </div>
      {/if}
    </div>
  {/if}

  {#if src && !failed && credit && !compact}
    <a
      class="screenshot-credit"
      href={credit.url}
      target="_blank"
      rel="noopener noreferrer"
      title="Image source and license"
    >
      {credit.label || 'Wikimedia Commons'} · {credit.license || 'free license'}
    </a>
  {/if}
</div>

<style>
  .screenshot-shell {
    position: relative;
    border: 1px solid var(--border-color);
    background-color: var(--image-void);
    overflow: hidden;
  }

  .screenshot-shell img {
    display: block;
    width: 100%;
    height: var(--shot-height);
    object-fit: contain;
    object-position: center;
    background: var(--image-void);
  }

  .screenshot-shell img.shot-letterbox {
    object-fit: contain;
    background: var(--image-void);
  }

  /* Show the whole capture — letterboxed rather than cropped. */
  .screenshot-shell img.shot-contain {
    object-fit: contain;
    object-position: center;
    background: var(--image-void);
  }

  .shot-placeholder {
    height: var(--shot-height);
    display: flex;
    flex-direction: column;
    background-color: var(--bg-secondary);
    color: var(--text-main);
    border-top: 4px solid var(--shot-accent);
  }

  .shot-placeholder--compact {
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    padding: 0 14px;
    border-top: none;
    border-left: 4px solid var(--shot-accent);
    background-color: var(--bg-tertiary);
  }

  .shot-compact-name {
    font-weight: 800;
    font-size: 0.92rem;
    letter-spacing: -0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .shot-placeholder-bar {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--bg-tertiary);
  }

  .shot-placeholder-bar span {
    width: 8px;
    height: 8px;
    background-color: var(--border-color);
    display: block;
  }

  .shot-placeholder-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 20px;
    text-align: center;
  }

  .shot-placeholder-name {
    font-weight: 800;
    font-size: 1.1rem;
    letter-spacing: -0.01em;
  }

  .shot-placeholder-copy {
    font-size: 0.85rem;
    color: var(--text-muted);
    max-width: 34ch;
  }

  .shot-placeholder-link {
    font-family: var(--font-label);
    font-size: 0.8rem;
  }

  .screenshot-credit {
    position: absolute;
    right: 0;
    bottom: 0;
    font-family: var(--font-label);
    font-size: 0.68rem;
    padding: 3px 8px;
    background-color: var(--scrim-plate);
    color: var(--scrim-text);
    text-decoration: none;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .screenshot-credit:hover {
    background-color: var(--scrim-plate-strong);
    color: var(--scrim-text);
  }
</style>
