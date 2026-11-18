<script>
  /**
   * Screenshot carousel for distro profiles.
   *
   * The first slide is the verified primary screenshot from distroAssets.js;
   * extra Commons screenshots come from distroGalleries.js. Only images that
   * passed the asset pipeline are included. When there is no verified image we
   * fall back to the labelled placeholder rather than borrowing another
   * distro's desktop.
   */
  import Icon from './Icon.svelte';
  import { DISTRO_GALLERIES } from '../data/distroGalleries.js';
  import DistroScreenshot from './DistroScreenshot.svelte';

  let { distro = null, height = 420, eager = false } = $props();

  let index = $state(0);
  let failed = $state(false);

  let images = $derived.by(() => {
    if (!distro) return [];
    const primary = distro.screenshotUrl
      ? [
          {
            url: distro.screenshotUrl,
            aspect: distro.screenshotAspect || 1.6,
            title: 'Current desktop',
            credit: distro.screenshotCredit || null
          }
        ]
      : [];
    return [...primary, ...(DISTRO_GALLERIES[distro.id] || [])];
  });

  let current = $derived(images[Math.min(index, Math.max(0, images.length - 1))] || null);
  let hasMultiple = $derived(images.length > 1);

  $effect(() => {
    distro?.id;
    index = 0;
    failed = false;
  });

  function go(delta) {
    if (!images.length) return;
    failed = false;
    index = (index + delta + images.length) % images.length;
  }
</script>

{#if !images.length}
  <DistroScreenshot {distro} {height} {eager} />
{:else}
  <div
    class="gallery"
    role="region"
    aria-roledescription="carousel"
    aria-label="{distro?.name} screenshots"
  >
    <div class="gallery-frame" style="--gallery-height: {height}px;">
      <div
        class="gallery-backdrop"
        style="--gallery-backdrop: url('{current.url}')"
        aria-hidden="true"
      ></div>
      {#key current.url}
        {#if !failed}
          <img
            src={current.url}
            alt="{distro?.name} screenshot: {current.title}"
            loading={eager && index === 0 ? 'eager' : 'lazy'}
            decoding="async"
            onerror={() => (failed = true)}
          />
        {:else}
          <div class="gallery-broken">
            <strong>{distro?.name}</strong>
            <span>This screenshot could not be loaded.</span>
          </div>
        {/if}
      {/key}

      {#if hasMultiple}
        <button class="gallery-nav gallery-prev" onclick={() => go(-1)} aria-label="Previous screenshot">
          <Icon name="chevron-left" size={18} />
        </button>
        <button class="gallery-nav gallery-next" onclick={() => go(1)} aria-label="Next screenshot">
          <Icon name="chevron-right" size={18} />
        </button>
        <span class="gallery-count field-value" aria-live="polite">{index + 1} / {images.length}</span>
      {/if}
    </div>

    <div class="gallery-caption">
      <div class="gallery-caption-text">
        <strong>{current.title || 'Desktop screenshot'}</strong>
        {#if current.credit?.url}
          <a href={current.credit.url} target="_blank" rel="noopener noreferrer">
            {current.credit.label || 'Source'} <Icon name="external" size={11} />
          </a>
          {#if current.credit.license}
            <span>· {current.credit.license}</span>
          {/if}
          {#if current.credit.artist}
            <span>· {current.credit.artist}</span>
          {/if}
        {/if}
      </div>

      {#if hasMultiple}
        <div class="gallery-thumbs" role="tablist" aria-label="Choose a screenshot">
          {#each images as image, i}
            <button
              class="gallery-thumb"
              class:active={i === index}
              onclick={() => {
                index = i;
                failed = false;
              }}
              role="tab"
              aria-selected={i === index}
              aria-label="Show screenshot {i + 1}: {image.title}"
              title={image.title}
            >
              <img src={image.url} alt="" loading="lazy" decoding="async" />
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .gallery {
    border: 1px solid var(--hairline);
    background-color: var(--card-bg);
  }

  .gallery-frame {
    position: relative;
    height: var(--gallery-height);
    background-color: var(--image-void);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .gallery-backdrop {
    position: absolute;
    inset: -24px;
    background-image: var(--gallery-backdrop);
    background-position: center;
    background-size: cover;
    filter: blur(28px) brightness(0.34) saturate(0.85);
    transform: scale(1.08);
    opacity: 0.9;
    pointer-events: none;
  }

  .gallery-frame img {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    animation: galleryFade var(--dur-2) var(--ease-out);
  }

  @keyframes galleryFade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .gallery-broken {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    color: var(--scrim-text-muted);
    font-size: 0.88rem;
    text-align: center;
    padding: var(--space-5);
  }

  .gallery-broken strong {
    font-size: 1.1rem;
  }

  .gallery-nav {
    position: absolute;
    z-index: 2;
    top: 50%;
    transform: translateY(-50%);
    width: 36px;
    height: 48px;
    border: 1px solid var(--scrim-border);
    background: var(--scrim-plate);
    color: var(--scrim-text);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color var(--dur-1) var(--ease-out),
      color var(--dur-1) var(--ease-out), border-color var(--dur-1) var(--ease-out);
  }

  .gallery-nav:hover {
    background: var(--accent-fill);
    color: var(--accent-contrast);
    border-color: var(--accent-fill);
  }

  .gallery-prev {
    left: var(--space-3);
  }

  .gallery-next {
    right: var(--space-3);
  }

  .gallery-count {
    position: absolute;
    z-index: 2;
    top: var(--space-3);
    right: var(--space-3);
    font-size: 0.68rem;
    letter-spacing: 0.04em;
    color: var(--scrim-text);
    background: var(--scrim-plate);
    border: 1px solid var(--scrim-border);
    padding: 4px 8px;
  }

  .gallery-caption {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    flex-wrap: wrap;
    padding: var(--space-3) var(--space-4);
    border-top: 1px solid var(--hairline);
    background-color: var(--bg-secondary);
  }

  .gallery-caption-text {
    font-family: var(--font-mono);
    font-size: 0.68rem;
    color: var(--text-subtle);
    min-width: 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1) var(--space-2);
    align-items: baseline;
  }

  .gallery-caption-text strong {
    color: var(--text-main);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-right: var(--space-1);
  }

  .gallery-caption-text a {
    display: inline-flex;
    align-items: baseline;
    gap: 2px;
    color: var(--text-muted);
    transition: color var(--dur-1) var(--ease-out);
  }

  .gallery-caption-text a:hover {
    color: var(--accent-ink);
  }

  .gallery-thumbs {
    display: flex;
    gap: var(--space-1);
    flex-shrink: 0;
  }

  .gallery-thumb {
    width: 54px;
    height: 34px;
    padding: 0;
    border: 1px solid var(--border-color);
    background: var(--image-void);
    cursor: pointer;
    opacity: 0.6;
    transition: opacity var(--dur-1) var(--ease-out), border-color var(--dur-1) var(--ease-out);
  }

  .gallery-thumb img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: var(--image-void);
    display: block;
  }

  .gallery-thumb:hover,
  .gallery-thumb.active {
    opacity: 1;
    border-color: var(--selected-border);
  }

  @media (max-width: 560px) {
    .gallery-frame {
      height: min(var(--gallery-height), 58vw);
    }

    .gallery-thumbs {
      width: 100%;
      overflow-x: auto;
      padding-bottom: 2px;
    }
  }
</style>
