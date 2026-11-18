<script>
  import { onMount } from 'svelte';

  const WAYGLIM_BACKGROUND = 'transparent';
  const WAYGLIM_ASPECT = 1.777778;

  let {
    class: className = '',
    style = '',
    layout = 'fill',
    paused = false,
    label = ''
  } = $props();

  let container;
  let player = null;

  onMount(() => {
    if (!container) return;
    let cancelled = false;
    // The WebGL engine is a separate chunk, fetched only when the hero mounts.
    import('../lib/wayglim.js').then(({ mountWayglim, WAYGLIM_SETTINGS }) => {
      if (cancelled || !container) return;
      try {
        player = mountWayglim(container, WAYGLIM_SETTINGS);
      } catch {
        player = null;
      }
    }).catch(() => {
      player = null;
    });
    return () => {
      cancelled = true;
      player?.destroy();
      player = null;
    };
  });

  $effect(() => {
    player?.setPaused(paused);
  });

  let box = $derived(
    layout === 'block'
      ? `position:relative;width:100%;aspect-ratio:${WAYGLIM_ASPECT};`
      : 'position:absolute;top:0;left:0;width:100%;height:100%;'
  );
</script>

<div
  bind:this={container}
  class={className}
  role={label ? 'img' : undefined}
  aria-label={label || undefined}
  aria-hidden={label ? undefined : 'true'}
  data-wayglim=""
  style="{box}overflow:hidden;pointer-events:none;background-color:{WAYGLIM_BACKGROUND};{style}"
></div>
