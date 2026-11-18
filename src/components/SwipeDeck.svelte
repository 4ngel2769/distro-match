<script>
  import DistroLogo from './DistroLogo.svelte';
  import DistroScreenshot from './DistroScreenshot.svelte';
  import Icon from './Icon.svelte';
  import { traitSignals } from '../lib/swipeTraits.js';

  let {
    distros = [],
    likes = [],
    passes = [],
    onLike = () => {},
    onPass = () => {},
    onUndo = () => {},
    onReset = () => {},
    onSeeMatches = () => {}
  } = $props();

  const THRESHOLD = 96;

  let scope = $state('all');
  let family = $state('all');
  let useCase = $state('all');
  let cycle = $state(0);
  let dragX = $state(0);
  let startX = $state(0);
  let dragging = $state(false);
  let exit = $state(null);

  let families = $derived(
    ['all', ...new Set(distros.map((d) => d.family).filter(Boolean))].sort((a, b) =>
      a === 'all' ? -1 : b === 'all' ? 1 : a.localeCompare(b)
    )
  );
  let useCases = $derived(
    ['all', ...new Set(distros.flatMap((d) => d.primaryUseCases || []))].sort((a, b) =>
      a === 'all' ? -1 : b === 'all' ? 1 : a.localeCompare(b)
    )
  );

  let pool = $derived(
    distros.filter((d) => {
      if (scope !== 'all' && d.tier !== scope) return false;
      if (family !== 'all' && d.family !== family) return false;
      if (useCase !== 'all' && !(d.primaryUseCases || []).includes(useCase)) return false;
      return true;
    })
  );

  let seen = $derived(new Set([...likes, ...passes]));
  let ordered = $derived.by(() => {
    const unseen = pool.filter((d) => !seen.has(d.id));
    const reviewed = pool.filter((d) => seen.has(d.id));
    return [...unseen, ...reviewed];
  });
  let active = $derived(ordered[cycle % Math.max(1, ordered.length)] || null);
  let nextCards = $derived([
    ordered[(cycle + 1) % Math.max(1, ordered.length)],
    ordered[(cycle + 2) % Math.max(1, ordered.length)]
  ].filter(Boolean));

  function reducedMotion() {
    return typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function finish(direction) {
    const id = active?.id;
    if (!id) return;
    if (direction === 'right') onLike(id);
    else onPass(id);
    cycle = 0;
    dragX = 0;
    exit = null;
  }

  function commit(direction) {
    if (!active || exit) return;
    if (reducedMotion()) {
      finish(direction);
      return;
    }
    exit = direction;
    window.setTimeout(() => finish(direction), 180);
  }

  function startDrag(event) {
    if (!active || exit || event.button !== 0) return;
    dragging = true;
    startX = event.clientX;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function moveDrag(event) {
    if (!dragging) return;
    dragX = event.clientX - startX;
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    if (Math.abs(dragX) >= THRESHOLD) commit(dragX > 0 ? 'right' : 'left');
    else dragX = 0;
  }

  function handleKeydown(event) {
    const tag = document.activeElement?.tagName;
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tag)) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      commit('left');
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      commit('right');
    }
  }

  function resetFilters() {
    scope = 'all';
    family = 'all';
    useCase = 'all';
    cycle = 0;
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<section class="swipe" aria-label="Swipe to find a distro">
  <div class="deck-toolbar">
    <span class="field-label">Swipe deck</span>
    <div class="filters">
      <label>
        <span class="field-label">Scope</span>
        <select bind:value={scope} onchange={() => (cycle = 0)}>
          <option value="all">All tiers</option>
          <option value="flagship">Flagships</option>
          <option value="specialist">Specialists</option>
          <option value="niche">Niche</option>
        </select>
      </label>
      <label>
        <span class="field-label">Family</span>
        <select bind:value={family} onchange={() => (cycle = 0)}>
          {#each families as item}
            <option value={item}>{item === 'all' ? 'Any family' : item}</option>
          {/each}
        </select>
      </label>
      <label>
        <span class="field-label">Use case</span>
        <select bind:value={useCase} onchange={() => (cycle = 0)}>
          {#each useCases as item}
            <option value={item}>{item === 'all' ? 'Any use case' : item.replace(/-/g, ' ')}</option>
          {/each}
        </select>
      </label>
    </div>
  </div>

  <div class="deck-stage">
    {#each nextCards as card, i}
      <div class="stack-card" class:second={i === 1} aria-hidden="true">
        <DistroScreenshot distro={card} height={260} compact={true} fit="contain" showName={false} />
      </div>
    {/each}

    {#if active}
      <article
        class="swipe-card"
        class:dragging
        class:exit-left={exit === 'left'}
        class:exit-right={exit === 'right'}
        style="--drag-x: {dragX}px"
        onpointerdown={startDrag}
        onpointermove={moveDrag}
        onpointerup={endDrag}
        onpointercancel={endDrag}
      >
        <div class="card-plate">
          <DistroScreenshot distro={active} height={260} fit="contain" eager={true} showName={false} />
          <span class="tier-badge tier-{active.tier}">{active.tier}</span>
        </div>

        <div class="card-info">
          <div class="identity">
            <DistroLogo distro={active} size={32} decorative={true} />
            <div>
              <h2>{active.name}</h2>
              <p class="field-value">{active.family} · #{active.dwRank || '—'} DistroWatch</p>
            </div>
          </div>
          <p class="tagline">{active.tagline}</p>

          <div class="signals">
            {#each traitSignals(active) as signal}
              <span class="signal" class:accent={signal.tone === 'accent'}>{signal.label}</span>
            {/each}
          </div>

          <dl class="spec-table card-specs">
            <div><dt>Release</dt><dd>{active.releaseModel}</dd></div>
            <div><dt>Init</dt><dd>{active.initSystem}</dd></div>
            <div><dt>Packages</dt><dd>{String(active.packageManager || '—').split('/')[0].trim()}</dd></div>
          </dl>
        </div>
      </article>
    {:else}
      <div class="deck-empty">
        <p>No distributions match these filters.</p>
        <button class="btn-secondary" onclick={resetFilters}>Clear filters</button>
      </div>
    {/if}
  </div>

  <div class="deck-actions">
    <button class="btn-secondary" onclick={() => commit('left')} disabled={!active}>
      <Icon name="close" size={15} /> Not for me
    </button>
    <button class="btn-accent" onclick={() => commit('right')} disabled={!active}>
      <Icon name="check" size={15} /> Interested
    </button>
    <div class="utility">
      <button class="quiet-btn" onclick={onUndo} disabled={!likes.length && !passes.length}>
        <Icon name="arrow-left" size={13} /> Undo
      </button>
      <button class="quiet-btn" onclick={() => { onReset(); cycle = 0; }} disabled={!likes.length && !passes.length}>
        Reset
      </button>
      <button class="quiet-btn" onclick={onSeeMatches} disabled={!likes.length}>
        See matches <Icon name="arrow-right" size={13} />
      </button>
    </div>
  </div>

  <p class="deck-hint field-value">
    Drag the card or press ← / → · {likes.length} liked · {passes.length} passed
  </p>
</section>

<style>
  .swipe {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .deck-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    justify-content: space-between;
    gap: var(--space-4);
    border-bottom: 1px solid var(--border-color);
    padding-bottom: var(--space-4);
  }

  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  .filters label {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .filters select {
    padding: 8px 10px;
    min-width: 140px;
    border: 1px solid var(--border-color);
    background-color: var(--bg-primary);
    font-size: 0.82rem;
  }

  .deck-stage {
    position: relative;
    min-height: 460px;
    display: flex;
    align-items: flex-start;
    justify-content: center;
  }

  .stack-card {
    position: absolute;
    top: 12px;
    width: min(100%, 520px);
    opacity: 0.45;
    transform: translateY(10px) scale(0.96);
    pointer-events: none;
  }

  .stack-card.second {
    opacity: 0.25;
    transform: translateY(20px) scale(0.92);
  }

  .swipe-card {
    position: relative;
    width: min(100%, 520px);
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-sharp);
    transform: translateX(var(--drag-x)) rotate(calc(var(--drag-x) / 24));
    cursor: grab;
    user-select: none;
    touch-action: pan-y;
    transition: transform var(--dur-2) var(--ease-out);
  }

  .swipe-card.dragging {
    cursor: grabbing;
    transition: none;
  }

  .swipe-card.exit-left {
    transform: translateX(-140%) rotate(-14deg);
    opacity: 0;
  }

  .swipe-card.exit-right {
    transform: translateX(140%) rotate(14deg);
    opacity: 0;
  }

  .card-plate {
    position: relative;
    background-color: var(--image-void);
  }

  .card-plate .tier-badge {
    position: absolute;
    top: 10px;
    right: 10px;
  }

  .card-info {
    padding: var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .identity {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .identity h2 {
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.15;
  }

  .identity p {
    font-size: 0.72rem;
    color: var(--text-subtle);
    margin-top: 2px;
  }

  .tagline {
    font-size: 0.92rem;
    color: var(--text-muted);
    line-height: 1.5;
  }

  .signals {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .signal {
    font-family: var(--font-mono);
    font-size: 0.68rem;
    padding: 4px 8px;
    border: 1px solid var(--border-color);
    background-color: var(--bg-secondary);
    color: var(--text-muted);
  }

  .signal.accent {
    border-color: var(--accent-color);
    box-shadow: inset 0 -2px 0 var(--accent-fill);
    color: var(--text-main);
  }

  .card-specs {
    border-top: 1px solid var(--border-color);
    padding-top: var(--space-3);
  }

  .card-specs > div {
    display: flex;
    justify-content: space-between;
    gap: var(--space-3);
    padding: 3px 0;
  }

  .card-specs dt {
    font-size: 0.68rem;
  }

  .card-specs dd {
    font-size: 0.74rem;
    text-align: right;
  }

  .deck-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3);
    border-top: 1px solid var(--border-color);
    padding-top: var(--space-4);
  }

  .utility {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    margin-left: auto;
  }

  .quiet-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: none;
    border: 0;
    padding: 0;
    font-size: 0.8rem;
    color: var(--text-muted);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .quiet-btn:hover:not(:disabled) {
    color: var(--text-main);
  }

  .quiet-btn:disabled,
  .deck-actions button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .deck-hint {
    font-size: 0.7rem;
    color: var(--text-subtle);
  }

  .deck-empty {
    width: min(100%, 520px);
    border: 1px solid var(--border-color);
    padding: var(--space-7);
    text-align: center;
    color: var(--text-muted);
  }

  .deck-empty p {
    margin-bottom: var(--space-4);
  }

  @media (max-width: 560px) {
    .deck-stage {
      min-height: 420px;
    }

    .card-info {
      padding: var(--space-4);
    }

    .utility {
      margin-left: 0;
      width: 100%;
    }
  }
</style>
