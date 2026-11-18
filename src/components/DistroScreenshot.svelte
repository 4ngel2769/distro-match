<script>
  /**
   * Desktop screenshot with a graceful, honest fallback.
   *
   * Screenshots live in the local verified asset library. When a distro has no
   * freely licensed screenshot we render a labelled placeholder instead of
   * borrowing another distro's desktop (which is what the old hard-coded
   * Linux Mint fallback did).
   */
  import Icon from './Icon.svelte';
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
              See the official gallery <Icon name="external" size={13} />
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
      <Icon name="external" size={11} />
    </a>
  {/if}
</div>

<style>
  .screenshot-shell {
    position: relative;
    border: 1px solid var(--hairline);
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
    border-top: 1px solid var(--shot-accent);
  }

  .shot-placeholder--compact {
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: var(--space-3);
    padding: 0 var(--space-4);
    border-top: none;
    border-left: 1px solid var(--shot-accent);
    background-color: var(--bg-tertiary);
  }

  .shot-compact-name {
    font-weight: 700;
    font-size: 0.92rem;
    letter-spacing: -0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .shot-placeholder-bar {
    display: flex;
    gap: var(--space-2);
    align-items: center;
    padding: var(--space-2) var(--space-3);
    border-bottom: 1px solid var(--hairline);
    background-color: var(--bg-tertiary);
  }

  .shot-placeholder-bar span {
    width: 7px;
    height: 7px;
    background-color: var(--border-color);
    display: block;
  }

  .shot-placeholder-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    padding: var(--space-5);
    text-align: center;
  }

  .shot-placeholder-name {
    font-weight: 700;
    font-size: 1.1rem;
    letter-spacing: -0.01em;
  }

  .shot-placeholder-copy {
    font-size: 0.85rem;
    color: var(--text-muted);
    max-width: 34ch;
  }

  .shot-placeholder-link {
    display: inline-flex;
    align-items: baseline;
    gap: var(--space-1);
    font-family: var(--font-mono);
    font-size: 0.74rem;
    color: var(--accent-ink);
    transition: color var(--dur-1) var(--ease-out);
  }

  .shot-placeholder-link:hover {
    color: var(--accent-hover);
  }

  .screenshot-credit {
    position: absolute;
    right: 0;
    bottom: 0;
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
    font-size: 0.66rem;
    padding: 4px 9px;
    background-color: var(--scrim-plate);
    color: var(--scrim-text);
    text-decoration: none;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: background-color var(--dur-1) var(--ease-out);
  }

  .screenshot-credit:hover {
    background-color: var(--scrim-plate-strong);
    color: var(--scrim-text);
  }
</style>
