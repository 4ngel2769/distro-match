<script>
  import Icon from './Icon.svelte';
  import { landingPath } from '../data/landingPages.js';

  let { onNavigate, distroCount = 0 } = $props();
</script>

<footer class="site-footer">
  <div class="footer-container">
    <div class="footer-brand">
      <span class="footer-brand-mark">LINUXMATCH</span>
      <p class="footer-brand-note">
        A client-side triangulation engine for finding the Linux distribution that actually fits your
        hardware, your values and your workflow.
        {distroCount ? `${distroCount} distributions catalogued.` : ''}
      </p>
    </div>

    <div>
      <h3 class="footer-heading">Explore</h3>
      <ul class="footer-list">
        <li><button onclick={() => onNavigate('welcome')}>Finder quiz</button></li>
        <li><button onclick={() => onNavigate('directory')}>Distro directory</button></li>
        <li><button onclick={() => onNavigate('compare')}>Comparison tool</button></li>
        <li><a href={landingPath('hub', '')}>All distributions</a></li>
      </ul>
    </div>

    <div class="footer-credit">
      <h3 class="footer-heading">Project</h3>
      <span>Built by <strong>angeldev0</strong></span>
      <a class="footer-external" href="https://adev0.eu" target="_blank" rel="noopener noreferrer">
        https://adev0.eu <Icon name="external" size={13} />
      </a>
      <span class="footer-note">Open data · no trackers · no accounts</span>
    </div>
  </div>

  <div class="footer-bottom">
    <span>© {new Date().getFullYear()} LinuxMatch — zero telemetry, nothing stored.</span>
    <div class="footer-legal">
      <button onclick={() => onNavigate('privacy')}>Privacy</button>
      <span aria-hidden="true">·</span>
      <button onclick={() => onNavigate('terms')}>Terms</button>
    </div>
  </div>
</footer>

<style>
  .footer-external {
    display: inline-flex;
    align-items: baseline;
    gap: var(--space-1);
  }

  .footer-external :global(svg) {
    color: var(--accent-color);
  }

  .footer-note {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--text-subtle);
    margin-top: var(--space-1);
  }

  .footer-legal {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .footer-legal [aria-hidden='true'] {
    color: var(--text-subtle);
  }
</style>
