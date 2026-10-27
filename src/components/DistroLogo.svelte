<script>
  /**
   * Distro logo tile with a deterministic monogram fallback.
   *
   * Logos are served from the local verified asset library (`/assets/logos`).
   * If a file is missing or fails to load we render an initials tile instead of
   * silently showing another distro's logo — the bug that put Debian's spiral
   * on Parrot OS cards.
   */
  let { distro = null, size = 40, decorative = false } = $props();

  let failed = $state(false);
  let src = $derived(distro?.logoUrl || '');
  let name = $derived(distro?.name || '');
  let accent = $derived(distro?.accentColor || '#475569');

  // Many distros only publish a wordmark. Give those a wider tile so the mark
  // stays legible instead of shrinking to a 20px-tall strip in a square box.
  let logoAspect = $derived(Math.max(1, Math.min(2.8, distro?.logoAspect || 1)));
  let tileWidth = $derived(logoAspect >= 1.7 ? Math.round(size * logoAspect) : size);

  $effect(() => {
    // Reset the error state whenever the logo source changes.
    src;
    failed = false;
  });

  let initials = $derived.by(() => {
    const cleaned = name
      .replace(/GNU\/Linux/gi, '')
      .replace(/\(.*?\)/g, '')
      .replace(/\b(Linux|OS|Live|System)\b/gi, '')
      .trim();
    const words = cleaned.split(/\s+/).filter(Boolean);
    if (!words.length) return name.slice(0, 2).toUpperCase();
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  });

  // Pick black or white text for the accent tile so the monogram stays legible.
  let fallbackTextColor = $derived.by(() => {
    const hex = (accent || '#475569').replace('#', '');
    if (hex.length !== 6) return '#0F172A';
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.62 ? '#0F172A' : '#FFFFFF';
  });
</script>

<div
  class="logo-tile"
  class:logo-tile--image={src && !failed}
  class:logo-tile--fallback={!src || failed}
  style="--logo-size: {size}px; --logo-width: {tileWidth}px; --logo-accent: {accent}; --logo-text: {fallbackTextColor};"
  title={name ? `${name} logo` : undefined}
  role={decorative ? undefined : 'img'}
  aria-label={decorative ? undefined : `${name} logo`}
  aria-hidden={decorative ? 'true' : undefined}
>
  {#if src && !failed}
    <img
      {src}
      alt={decorative ? '' : `${name} logo`}
      loading="lazy"
      decoding="async"
      onerror={() => { failed = true; }}
    />
  {:else}
    <span class="logo-monogram" aria-hidden="true">{initials}</span>
  {/if}
</div>

<style>
  .logo-tile {
    width: var(--logo-size);
    height: var(--logo-size);
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border-color);
    overflow: hidden;
  }

  .logo-tile--image {
    background-color: #ffffff;
    padding: calc(var(--logo-size) * 0.12);
    width: var(--logo-width);
  }

  .logo-tile--image img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  .logo-tile--fallback {
    background-color: var(--logo-accent);
  }

  .logo-monogram {
    font-family: var(--font-label);
    font-weight: 800;
    font-size: calc(var(--logo-size) * 0.36);
    line-height: 1;
    letter-spacing: -0.04em;
    color: var(--logo-text);
  }
</style>
