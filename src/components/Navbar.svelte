<script>
  let { activeView = 'welcome', onNavigate, onToggleTheme, currentTheme = 'light' } = $props();
</script>

<header class="site-header">
  <div class="header-container">
    <button class="site-logo-btn" onclick={() => onNavigate('welcome')} aria-label="Go to home">
      <span class="logo-badge">DISTRO//MATCH</span>
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
        <li class="nav-secondary">
          <button
            class="nav-btn {activeView === 'privacy' ? 'active' : ''}"
            onclick={() => onNavigate('privacy')}
          >
            Privacy & GDPR
          </button>
        </li>
        <li class="nav-secondary">
          <button
            class="nav-btn {activeView === 'terms' ? 'active' : ''}"
            onclick={() => onNavigate('terms')}
          >
            Terms
          </button>
        </li>
        <li>
          <button
            class="theme-icon-btn"
            onclick={onToggleTheme}
            aria-label="Toggle light/dark theme"
            title="Toggle light/dark theme"
          >
            {#if currentTheme === 'dark'}
              <!-- Sun Icon -->
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            {:else}
              <!-- Moon Icon -->
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            {/if}
          </button>
        </li>
      </ul>
    </nav>
  </div>
</header>

<style>
  .site-logo-btn {
    background: transparent;
    border: none;
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 800;
    font-size: 1.2rem;
    color: var(--text-main);
    cursor: pointer;
    padding: 0;
  }
</style>
