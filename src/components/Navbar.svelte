<script>
  import Icon from './Icon.svelte';

  let { activeView = 'welcome', onNavigate, onToggleTheme, currentTheme = 'light' } = $props();

  const links = [
    { view: 'welcome', label: 'Finder', match: ['welcome', 'quiz', 'intermission', 'results'] },
    { view: 'directory', label: 'Directory', match: ['directory', 'distro', 'landing'] },
    { view: 'compare', label: 'Compare', match: ['compare'] }
  ];
</script>

<header class="site-header">
  <div class="header-container">
    <button class="brand" onclick={() => onNavigate('welcome')} aria-label="LinuxMatch home">
      <img src="/logo-256.png" alt="" width="32" height="32" />
    </button>

    <nav aria-label="Main navigation">
      <ul class="nav-links">
        {#each links as link}
          <li>
            <button
              class="nav-btn"
              class:active={link.match.includes(activeView)}
              aria-current={link.match.includes(activeView) ? 'page' : undefined}
              onclick={() => onNavigate(link.view)}
            >{link.label}</button>
          </li>
        {/each}
        <li class="theme-item">
          <button
            class="theme-btn"
            onclick={onToggleTheme}
            aria-label={currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <Icon name={currentTheme === 'dark' ? 'sun' : 'moon'} size={18} />
          </button>
        </li>
      </ul>
    </nav>
  </div>
</header>

<style>
  .brand {
    display: inline-flex;
    align-items: center;
    border: 0;
    background: transparent;
    padding: 0;
    border-radius: var(--radius-sm);
  }

  .brand img {
    display: block;
    width: 32px;
    height: 32px;
    object-fit: contain;
  }

  .brand:hover img {
    transform: rotate(-6deg);
  }

  .brand img {
    transition: transform var(--dur-2) var(--ease-out);
  }

  .theme-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border: 0;
    background: transparent;
    color: var(--text-muted);
    border-radius: var(--radius-sm);
    transition: color var(--dur-1) var(--ease-out), background-color var(--dur-1) var(--ease-out);
  }

  .theme-btn:hover {
    color: var(--accent-ink);
    background-color: var(--accent-soft);
  }

  @media (max-width: 720px) {
    .header-container {
      flex-wrap: wrap;
    }

    .site-header nav {
      width: 100%;
    }

    .nav-links {
      width: 100%;
      justify-content: space-between;
    }
  }
</style>
