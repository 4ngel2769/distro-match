<script>
  import Icon from './Icon.svelte';

  let {
    label = '',
    value = $bindable(''),
    options = [],
    placeholder = 'Search…',
    loading = false,
    allowCustom = false,
    disabled = false,
    onOpen = () => {},
    onChange = () => {},
    id = undefined
  } = $props();

  let open = $state(false);
  let query = $state('');
  let activeIndex = $state(0);
  let container;
  let inputEl = $state(null);

  let selected = $derived(options.find((option) => option.value === value));
  let selectedLabel = $derived(selected?.label || (value ? String(value) : ''));

  let filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) =>
      `${option.label} ${option.note || ''}`.toLowerCase().includes(q)
    );
  });

  let canAddCustom = $derived(
    allowCustom && query.trim().length > 0 &&
      !filtered.some((option) => option.label.toLowerCase() === query.trim().toLowerCase())
  );

  let itemCount = $derived(filtered.length + (canAddCustom ? 1 : 0));

  function toggle() {
    if (disabled) return;
    open = !open;
    if (open) {
      query = '';
      activeIndex = 0;
      onOpen();
      queueMicrotask(() => inputEl?.focus());
    }
  }

  function choose(option) {
    value = option.value;
    open = false;
    query = '';
    onChange(option.value);
  }

  function chooseCustom() {
    const custom = query.trim();
    value = custom;
    open = false;
    query = '';
    onChange(custom);
  }

  function move(delta) {
    if (!itemCount) return;
    activeIndex = (activeIndex + delta + itemCount) % itemCount;
  }

  function handleKeydown(event) {
    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle();
      }
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      open = false;
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      move(1);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      move(-1);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (activeIndex < filtered.length) choose(filtered[activeIndex]);
      else if (canAddCustom) chooseCustom();
    }
  }

  function handleWindowClick(event) {
    if (open && container && !container.contains(event.target)) open = false;
  }
</script>

<svelte:window onclick={handleWindowClick} />

<div class="searchable" bind:this={container}>
  {#if label}
    <label class="field-label" for={id}>{label}</label>
  {/if}
  <button
    type="button"
    {id}
    class="select-trigger"
    class:placeholder={!selectedLabel}
    aria-haspopup="listbox"
    aria-expanded={open}
    aria-controls={id ? `${id}-listbox` : undefined}
    {disabled}
    onclick={toggle}
    onkeydown={handleKeydown}
  >
    <span class="trigger-text">{selectedLabel || placeholder}</span>
    <span class="chevron" class:open><Icon name="chevron-down" size={15} /></span>
  </button>

  {#if open}
    <div class="select-popover">
      <div class="search-line">
        <Icon name="search" size={15} />
        <input
          bind:this={inputEl}
          bind:value={query}
          type="text"
          class="search-box"
          placeholder={allowCustom ? 'Search or type a value' : 'Search options'}
          aria-label={label ? `Search ${label}` : 'Search options'}
          oninput={() => (activeIndex = 0)}
          onkeydown={handleKeydown}
        />
      </div>
      <div class="option-list" role="listbox" id={id ? `${id}-listbox` : undefined}>
        {#if loading}
          <p class="list-note">Loading options…</p>
        {:else}
          {#each filtered as option, i}
            <button
              type="button"
              class="option-row"
              class:active={i === activeIndex}
              class:selected={option.value === value}
              role="option"
              aria-selected={option.value === value}
              onclick={() => choose(option)}
            >
              <span class="option-label">{option.label}</span>
              {#if option.note}
                <span class="option-note">{option.note}</span>
              {/if}
              {#if option.value === value}
                <span class="option-check"><Icon name="check" size={13} /></span>
              {/if}
            </button>
          {/each}
          {#if canAddCustom}
            <button
              type="button"
              class="option-row custom-row"
              class:active={activeIndex === filtered.length}
              role="option"
              aria-selected="false"
              onclick={chooseCustom}
            >
              <span class="option-label">Use “{query.trim()}”</span>
              <span class="option-note">Custom value</span>
            </button>
          {/if}
          {#if !itemCount && !canAddCustom}
            <p class="list-note">No matching options</p>
          {/if}
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .searchable {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    min-width: 0;
  }

  .field-label {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-muted);
  }

  .select-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    width: 100%;
    min-height: 44px;
    padding: 10px 12px;
    text-align: left;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background-color: var(--card-bg);
    color: var(--text-main);
    font-size: 0.9rem;
    font-weight: 600;
    box-shadow: var(--shadow-subtle);
    transition: border-color var(--dur-1) var(--ease-out), box-shadow var(--dur-1) var(--ease-out);
  }

  .select-trigger:hover {
    border-color: var(--border-strong);
  }

  .select-trigger.placeholder {
    color: var(--text-muted);
    font-weight: 550;
  }

  .select-trigger:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .trigger-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chevron {
    display: inline-flex;
    color: var(--text-subtle);
    transition: transform var(--dur-2) var(--ease-out);
  }

  .chevron.open {
    transform: rotate(180deg);
  }

  .select-popover {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    z-index: 60;
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lift);
    padding: var(--space-1);
  }

  .search-line {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: 6px 10px;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-subtle);
  }

  .search-box {
    flex: 1;
    min-width: 0;
    border: 0;
    outline: none;
    background: transparent;
    color: var(--text-main);
    font-size: 0.88rem;
  }

  .option-list {
    max-height: 240px;
    overflow-y: auto;
    padding-top: 4px;
  }

  .option-row {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    padding: 8px 10px;
    border: 0;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text-main);
    text-align: left;
    cursor: pointer;
  }

  .option-row:hover,
  .option-row.active {
    background-color: var(--accent-soft);
  }

  .option-row.selected {
    color: var(--accent-ink);
  }

  .option-label {
    font-size: 0.88rem;
    font-weight: 650;
    color: var(--text-main);
  }

  .option-note {
    font-size: 0.76rem;
    color: var(--text-muted);
  }

  .option-check {
    position: absolute;
    right: 10px;
    color: var(--accent-ink);
  }

  .custom-row {
    border-top: 1px solid var(--border-color);
    border-radius: 0 0 var(--radius-sm) var(--radius-sm);
    margin-top: 4px;
  }

  .list-note {
    padding: 12px 10px;
    font-size: 0.85rem;
    color: var(--text-muted);
  }
</style>
