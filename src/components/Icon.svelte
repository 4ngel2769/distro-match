<script>
  /** Consistent 1.6px stroke icon set. Decorative by default. */
  let { name, size = 16, label = null, class: className = '' } = $props();
</script>

<svg
  class={className}
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.6"
  stroke-linecap="square"
  stroke-linejoin="miter"
  aria-hidden={label ? undefined : 'true'}
  role={label ? 'img' : undefined}
  aria-label={label}
>
  {#if name === 'arrow-right'}
    <path d="M4 12h15M13 6l6 6-6 6" />
  {:else if name === 'arrow-left'}
    <path d="M20 12H5M11 18l-6-6 6-6" />
  {:else if name === 'chevron-right'}
    <path d="M9 5l7 7-7 7" />
  {:else if name === 'chevron-left'}
    <path d="M15 5l-7 7 7 7" />
  {:else if name === 'external'}
    <path d="M13 4h7v7M20 4l-9 9" />
    <path d="M19 14v5H5V5h5" />
  {:else if name === 'check'}
    <path d="M4 12l5 5L20 6" />
  {:else if name === 'close'}
    <path d="M5 5l14 14M19 5L5 19" />
  {:else if name === 'search'}
    <circle cx="11" cy="11" r="6" />
    <path d="M15.5 15.5L20 20" />
  {:else if name === 'swap'}
    <path d="M4 8h14M15 5l3 3-3 3M20 16H6M9 13l-3 3 3 3" />
  {:else if name === 'sun'}
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
  {:else if name === 'moon'}
    <path d="M20 13.2A8.5 8.5 0 1 1 10.8 4 6.8 6.8 0 0 0 20 13.2z" />
  {:else if name === 'plus'}
    <path d="M12 4v16M4 12h16" />
  {:else if name === 'minus'}
    <path d="M4 12h16" />
  {:else if name === 'star'}
    <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z" />
  {:else if name === 'info'}
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v6M12 7.5v.5" />
  {:else if name === 'alert'}
    <path d="M12 3L2.5 20h19L12 3z" />
    <path d="M12 9v5M12 17v.5" />
  {:else if name === 'sliders'}
    <path d="M4 7h16M4 12h16M4 17h16" />
    <path d="M9 5v4M15 10v4M7 15v4" />
  {:else if name === 'copy'}
    <path d="M9 9h11v11H9z" />
    <path d="M15 9V4H4v11h5" />
  {:else if name === 'bookmark'}
    <path d="M6 3h12v18l-6-4-6 4V3z" />
  {:else if name === 'filter'}
    <path d="M3 5h18l-7 8v6l-4 2v-8L3 5z" />
  {:else if name === 'tag'}
    <path d="M3 3h8l10 10-8 8L3 11V3z" />
    <path d="M7.5 7.5h.5" />
  {:else if name === 'grid'}
    <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
  {:else if name === 'list'}
    <path d="M4 6h16M4 12h16M4 18h16" />
  {:else if name === 'download'}
    <path d="M12 3v12M7 11l5 5 5-5M4 20h16" />
  {:else if name === 'shield'}
    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
    <path d="M9 12l2 2 4-4" />
  {:else if name === 'clock'}
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  {:else if name === 'layers'}
    <path d="M12 3l9 5-9 5-9-5 9-5z" />
    <path d="M3 13l9 5 9-5" />
  {/if}
</svg>

<style>
  svg {
    display: inline-block;
    flex-shrink: 0;
    vertical-align: -0.15em;
  }
</style>
