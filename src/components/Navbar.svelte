<script>
  import Icon from './Icon.svelte';

  let { activeView = 'welcome', onNavigate, onToggleTheme, currentTheme = 'light' } = $props();
</script>

<header class="site-header">
  <div class="header-container">
    <button class="site-logo-btn" onclick={() => onNavigate('welcome')} aria-label="Go to home">
      <span class="logo-badge">LINUXMATCH</span>
      <span class="brand-tagline">The Linux Triangulator</span>
    </button>

    <nav aria-label="Main Navigation">
      <ul class="nav-links">
        <li>
          <button
            class="nav-btn {activeView === 'welcome' || activeView === 'quiz' || activeView === 'intermission' || activeView === 'results' ? 'active' : ''}"
            onclick={() => onNavigate('welcome')}
          >
            Finder Quiz
          </button>
        </li>
        <li>
          <button
            class="nav-btn {activeView === 'directory' ? 'active' : ''}"
            onclick={() => onNavigate('directory')}
          >
            Directory (116+)
          </button>
        </li>
        <li>
          <button
            class="nav-btn {activeView === 'compare' ? 'active' : ''}"
            onclick={() => onNavigate('compare')}
          >
            Comparison Tool
          </button>
        </li>
        <li>
          <button
            class="theme-icon-btn"
            onclick={onToggleTheme}
            aria-label="Toggle light/dark theme"
            title="Toggle light/dark theme"
          >
            <Icon name={currentTheme === 'dark' ? 'sun' : 'moon'} size={18} />
          </button>
        </li>
      </ul>
    </nav>
  </div>
</header>

<style>
  .site-logo-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--text-main);
    cursor: pointer;
  }
</style>
