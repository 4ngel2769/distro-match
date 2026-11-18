<script>
  import Icon from './Icon.svelte';
  import { USE_CASE_PAGES, landingPath } from '../data/landingPages.js';

  let { onNavigate, distroCount = 0, connected = false } = $props();

  const guides = USE_CASE_PAGES.slice(0, 5);
</script>

<footer class="site-footer" class:connected>
  <div class="footer-container">
    <div class="footer-brand">
      <div class="brand-line">
        <img src="/logo-256.png" alt="" width="36" height="36" />
        <span>LinuxMatch</span>
      </div>
      <p class="footer-brand-note">
        A private, client-side finder for the Linux distribution that fits your hardware,
        your work and your values. {distroCount ? `${distroCount} distributions catalogued.` : ''}
      </p>
    </div>

    <div class="footer-column">
      <h3 class="footer-heading">Explore</h3>
      <ul class="footer-list">
        <li><button onclick={() => onNavigate('welcome')}>Finder quiz</button></li>
        <li><button onclick={() => onNavigate('directory')}>Distro directory</button></li>
        <li><button onclick={() => onNavigate('compare')}>Compare distros</button></li>
        <li><a href={landingPath('hub', '')}>All distributions</a></li>
      </ul>
    </div>

    <div class="footer-column">
      <h3 class="footer-heading">Popular guides</h3>
      <ul class="footer-list">
        {#each guides as guide}
          <li><a href={landingPath('use-case', guide.slug)}>{guide.label}</a></li>
        {/each}
      </ul>
    </div>

    <div class="footer-column">
      <h3 class="footer-heading">Project</h3>
      <ul class="footer-list">
        <li>Built by <strong>angeldev0</strong></li>
        <li>
          <a href="https://adev0.eu" target="_blank" rel="noopener noreferrer">
            adev0.eu <Icon name="external" size={12} />
          </a>
        </li>
        <li><span class="muted">Open data · no telemetry</span></li>
      </ul>
    </div>
  </div>

  <div class="footer-bottom">
    <span class="privacy-badge"><Icon name="shield" size={13} /> No trackers</span>
    <span class="footer-copyright">
      © {new Date().getFullYear()} LinuxMatch. Made for people choosing Linux.
    </span>
    <div class="footer-legal">
      <button onclick={() => onNavigate('privacy')}>Privacy</button>
      <span aria-hidden="true">·</span>
      <button onclick={() => onNavigate('terms')}>Terms</button>
    </div>
  </div>
</footer>

<style>
  .brand-line {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .brand-line img {
    width: 48px;
    height: 48px;
    object-fit: contain;
    border-radius: var(--radius-md);
  }

  .brand-line span {
    font-size: 1.05rem;
    font-weight: 750;
    letter-spacing: -0.02em;
    color: var(--text-main);
  }

  .privacy-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    justify-self: start;
    font-size: 0.74rem;
    font-weight: 600;
    color: var(--text-muted);
    white-space: nowrap;
  }

  .privacy-badge :global(svg) {
    color: var(--accent-tertiary);
  }

  .footer-copyright {
    text-align: center;
    font-size: 0.8rem;
    color: var(--text-subtle);
  }

  .footer-legal {
    display: flex;
    align-items: center;
    justify-self: end;
    gap: var(--space-3);
  }

  .footer-column strong {
    color: var(--text-main);
    font-weight: 700;
  }

  .muted {
    color: var(--text-subtle);
  }

  .footer-column :global(svg) {
    color: var(--accent-ink);
  }

  @media (max-width: 720px) {
    .privacy-badge,
    .footer-copyright,
    .footer-legal {
      justify-self: center;
      text-align: center;
    }

    .footer-bottom {
      gap: var(--space-2);
    }
  }
</style>
