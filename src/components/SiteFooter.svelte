<script>
  import { FAMILY_PAGES, USE_CASE_PAGES, landingPath } from '../data/landingPages.js';

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
        <li><button onclick={() => onNavigate('compare')}>Side-by-side comparison</button></li>
        <li><a href={landingPath('hub', '')}>All Linux distributions</a></li>
      </ul>
    </div>

    <div>
      <h3 class="footer-heading">Families</h3>
      <ul class="footer-list">
        {#each FAMILY_PAGES as family}
          <li><a href={landingPath('family', family.slug)}>{family.label}</a></li>
        {/each}
      </ul>
    </div>

    <div>
      <h3 class="footer-heading">Use cases</h3>
      <ul class="footer-list">
        {#each USE_CASE_PAGES as useCase}
          <li><a href={landingPath('use-case', useCase.slug)}>{useCase.label}</a></li>
        {/each}
      </ul>
    </div>

    <div>
      <h3 class="footer-heading">Legal</h3>
      <ul class="footer-list">
        <li><button onclick={() => onNavigate('privacy')}>Privacy &amp; GDPR</button></li>
        <li><button onclick={() => onNavigate('terms')}>Terms of service</button></li>
      </ul>
    </div>

    <div class="footer-credit">
      <h3 class="footer-heading">Build</h3>
      <span>Built by <strong>buyangeldev0</strong></span>
      <a href="https://adev0.eu" target="_blank" rel="noopener noreferrer">adev0.eu ↗</a>
    </div>
  </div>

  <div class="footer-bottom">
    <span>© {new Date().getFullYear()} LinuxMatch — zero telemetry, no accounts, nothing stored.</span>
    <span>Design &amp; code by buyangeldev0 · <a href="https://adev0.eu" target="_blank" rel="noopener noreferrer">adev0.eu</a></span>
  </div>
</footer>
