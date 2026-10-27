<script>
  function purgeData() {
    localStorage.clear();
    alert('All local browser storage wiped successfully.');
  }
</script>

<div class="page-container">
  <div class="legal-card">
    <div class="legal-header">
      <h1 class="legal-title">Privacy Policy</h1>
      <div class="legal-sub">Strict Zero-Data Retention Standard • Fully GDPR & CCPA Compliant</div>
    </div>

    <div class="gdpr-box">
      <h3 style="font-weight: 800; font-size: 1.1rem; margin-bottom: 8px; color: var(--accent-green);">
        ✓ Summary of Our Privacy Stance: Absolute Local Isolation
      </h3>
      <p style="margin-bottom: 0; font-size: 0.95rem; line-height: 1.5;">
        DistroMatch operates <strong>100% inside your web browser</strong>. Your question responses, hardware specifications, answers, and scoring calculations never leave your local device. We have no analytics trackers, no advertising cookies, no server-side telemetry, and zero user databases.
      </p>
    </div>

    <div class="legal-content">
      <h2>1. Introduction & General Data Protection Regulation (GDPR) Compliance</h2>
      <p>
        Under Regulation (EU) 2016/679 of the European Parliament and of the Council (General Data Protection Regulation or GDPR), you have fundamental rights regarding the processing and ownership of personal information. DistroMatch is architected to achieve compliance through the most robust mechanism possible: by declining to collect, store, transmit, or monetize any personal data whatsoever.
      </p>

      <h2>2. Data Collection & Processing Mechanism</h2>
      <ul style="padding-left: 20px; line-height: 1.7; margin-bottom: 16px;">
        <li><strong>Zero Server-Side Logging:</strong> All survey calculations, matching algorithms, and matrix scoring occur locally on your machine via client-side JavaScript execution.</li>
        <li><strong>Zero Tracking Cookies:</strong> We do not deploy advertising cookies, fingerprinting scripts, third-party analytics, or behavioral profiling beacons.</li>
        <li><strong>Zero Data Retention:</strong> The moment you close or refresh this browser tab, all transient survey responses residing in volatile memory (RAM) are instantly destroyed.</li>
        <li><strong>Local Settings:</strong> The only piece of data stored locally is your aesthetic theme preference (`light` or `dark`) inside your browser's standard `localStorage` container.</li>
      </ul>

      <h2>3. Your Rights Under GDPR and CCPA</h2>
      <p>
        Under GDPR Articles 15 through 22 and the California Consumer Privacy Act (CCPA), individuals hold the right of access, rectification, erasure ("right to be forgotten"), and restriction of data processing. Because DistroMatch retains zero identifier records, there is no personal data ledger to access or delete. If you wish to purge the local theme setting, click the button below:
      </p>

      <div style="margin: 20px 0;">
        <button class="btn-secondary" onclick={purgeData}>
          Purge Local Browser Storage Now
        </button>
      </div>

      <h2>4. External Links</h2>
      <p>
        DistroMatch provides direct outbound hyperlinks to external distribution websites, documentation wikis, and repositories. We do not control and are not responsible for the privacy practices of external projects. When visiting external domains, refer to their respective privacy disclosures.
      </p>
    </div>
  </div>
</div>

<style>
  .legal-card {
    border: 2px solid var(--border-strong);
    background-color: var(--card-bg);
    padding: 36px;
    box-shadow: var(--shadow-sharp);
  }

  .legal-header {
    border-bottom: 2px solid var(--border-strong);
    padding-bottom: 16px;
    margin-bottom: 24px;
  }

  .legal-title {
    font-size: 2.2rem;
    font-weight: 900;
    letter-spacing: -0.02em;
  }

  .legal-sub {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    color: var(--text-subtle);
    margin-top: 4px;
  }

  .gdpr-box {
    background-color: var(--bg-secondary);
    border: 2px solid var(--border-strong);
    padding: 20px;
    margin-bottom: 24px;
  }

  .legal-content h2 {
    font-size: 1.3rem;
    font-weight: 800;
    margin: 24px 0 8px 0;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 4px;
  }

  .legal-content p {
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 14px;
  }
</style>
