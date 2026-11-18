<script>
  import Icon from './Icon.svelte';

  function purgeData() {
    localStorage.clear();
    document.cookie = 'distromatch_theme=; path=/; max-age=0; SameSite=Lax';
    alert('Your saved specs and theme choice have been cleared. The theme will follow your browser again.');
  }
</script>

<div class="page-container">
  <article class="legal-doc">
    <header class="legal-header">
      <h1 class="legal-title">Privacy Policy</h1>
      <div class="legal-sub">Strict Zero-Data Retention Standard • Fully GDPR &amp; CCPA Compliant</div>
    </header>

    <section class="legal-callout">
      <h2 class="callout-title">
        <Icon name="check" size={17} />
        <span>Summary of Our Privacy Stance: Absolute Local Isolation</span>
      </h2>
      <p>
        LinuxMatch operates <strong>100% inside your web browser</strong>. Your question responses, hardware specifications, answers, and scoring calculations never leave your local device. We have no analytics trackers, no advertising cookies, no server-side telemetry, and zero user databases.
      </p>
    </section>

    <div class="legal-content">
      <h2>1. Introduction &amp; General Data Protection Regulation (GDPR) Compliance</h2>
      <p>
        Under Regulation (EU) 2016/679 of the European Parliament and of the Council (General Data Protection Regulation or GDPR), you have fundamental rights regarding the processing and ownership of personal information. LinuxMatch is architected to achieve compliance through the most robust mechanism possible: by declining to collect, store, transmit, or monetize any personal data whatsoever.
      </p>

      <h2>2. Data Collection &amp; Processing Mechanism</h2>
      <ul>
        <li><strong>Zero Server-Side Logging:</strong> All survey calculations, matching algorithms, and matrix scoring occur locally on your machine via client-side JavaScript execution.</li>
        <li><strong>Zero Tracking Cookies:</strong> We do not deploy advertising cookies, fingerprinting scripts, third-party analytics, or behavioral profiling beacons.</li>
        <li><strong>Zero Data Retention:</strong> The moment you close or refresh this browser tab, all transient survey responses residing in volatile memory (RAM) are instantly destroyed.</li>
        <li><strong>Local Settings:</strong> Your theme choice is saved in a single cookie named `distromatch_theme`, and the hardware specs you enter in the spec finder are saved in your browser's `localStorage` so compatibility checks work on every profile. Neither is used for tracking, and neither is ever sent to a server. If you have not chosen a theme, we follow your browser's light or dark setting.</li>
      </ul>

      <h2>3. Your Rights Under GDPR and CCPA</h2>
      <p>
        Under GDPR Articles 15 through 22 and the California Consumer Privacy Act (CCPA), individuals hold the right of access, rectification, erasure ("right to be forgotten"), and restriction of data processing. Because LinuxMatch retains zero identifier records, there is no personal data ledger to access or delete. If you wish to purge the local theme setting, click the button below:
      </p>

      <div class="purge-row">
        <button class="btn-secondary" onclick={purgeData}>
          Clear Saved Specs and Theme
        </button>
      </div>

      <h2>4. External Links</h2>
      <p>
        LinuxMatch provides direct outbound hyperlinks to external distribution websites, documentation wikis, and repositories. We do not control and are not responsible for the privacy practices of external projects. When visiting external domains, refer to their respective privacy disclosures.
      </p>
    </div>
  </article>
</div>

<style>
  .legal-doc {
    max-width: 74ch;
  }

  .legal-header {
    border-bottom: 1px solid var(--hairline);
    padding-bottom: var(--space-4);
    margin-bottom: var(--space-6);
  }

  .legal-title {
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .legal-sub {
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
    font-size: 0.78rem;
    color: var(--text-subtle);
    margin-top: var(--space-2);
  }

  .legal-callout {
    background-color: var(--bg-secondary);
    border: 1px solid var(--hairline);
    border-left: 2px solid var(--accent-fill);
    padding: var(--space-5);
    margin-bottom: var(--space-6);
  }

  .callout-title {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
    font-size: 1rem;
    font-weight: 700;
    color: var(--accent-green);
    margin-bottom: var(--space-2);
  }

  .callout-title :global(svg) {
    flex-shrink: 0;
    color: var(--accent-green);
  }

  .legal-callout p {
    font-size: 0.94rem;
    line-height: 1.6;
    color: var(--text-muted);
  }

  .legal-callout strong {
    color: var(--text-main);
  }

  .legal-content h2 {
    font-size: 1.15rem;
    font-weight: 700;
    margin: var(--space-6) 0 var(--space-3);
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--hairline);
  }

  .legal-content p {
    font-size: 0.95rem;
    line-height: 1.65;
    color: var(--text-muted);
    margin-bottom: var(--space-4);
  }

  .legal-content ul {
    list-style: disc;
    padding-left: 1.25rem;
    margin-bottom: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .legal-content li {
    font-size: 0.95rem;
    line-height: 1.65;
    color: var(--text-muted);
  }

  .legal-content strong {
    color: var(--text-main);
  }

  .purge-row {
    margin: var(--space-5) 0;
  }
</style>
