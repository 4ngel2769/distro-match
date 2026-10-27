<script>
  import { LINUX_DISTROS } from '../data/distros.js';
  import SteeringPanel from './SteeringPanel.svelte';

  let { onStartQuiz, onNavigate, steering = {}, onSteeringChange } = $props();
</script>

<div class="page-container">
  <div class="welcome-hero-card">
    <span class="hero-badge">MATHEMATICAL SYSTEM TRIANGULATION</span>
    <h1 class="welcome-heading">
      Find Your Ideal Linux Distribution With Mathematical Precision.
    </h1>
    <p class="welcome-subtext">
      Linux isn't one operating system — it's an expansive universe of hundreds of independent distributions tailored for specific hardware, philosophies, init systems, and workflows. Stop distro-hopping blindly. Let our 4-round triangulation survey steer you directly to your ideal match.
    </p>

    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-number">{LINUX_DISTROS.length}+</div>
        <div class="stat-label">Distributions in Catalog</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">23</div>
        <div class="stat-label">Precision Questions</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">4</div>
        <div class="stat-label">Progressive Survey Rounds</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">0%</div>
        <div class="stat-label">Data Retention (100% Client-Side)</div>
      </div>
    </div>

    <!-- Live Steering Controls on Welcome -->
    <div style="margin-bottom: 24px;">
      <SteeringPanel {steering} {onSteeringChange} />
    </div>

    <div class="hero-buttons">
      <button class="btn-primary" onclick={onStartQuiz}>
        Launch Triangulation Survey ›
      </button>
      <button class="btn-secondary" onclick={() => onNavigate('directory')}>
        Browse All {LINUX_DISTROS.length}+ Distros
      </button>
      <button class="btn-secondary" onclick={() => onNavigate('compare')}>
        Side-by-Side Comparison Tool
      </button>
    </div>
  </div>

  <div class="methodology-card">
    <h3 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 12px;">
      How the Triangulation System Operates:
    </h3>
    <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 12px; line-height: 1.6;">
      Rather than asking superficial questions, LinuxMatch probes your hardware topology (dGPUs, AMD Ryzen APUs, hybrid graphics, low memory budgets), ideological constraints (100% Libre FSF compliance vs pragmatic drivers), init architecture (systemd vs OpenRC, runit, s6, sysvinit), and filesystem immutability.
    </p>
    <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.6;">
      Between each round, you receive a live candidate report previewing top contenders. You can adjust the importance weight of any question, skip questions anytime, and actively steer the decision engine with live sliders.
    </p>
  </div>
</div>

<style>
  .welcome-hero-card {
    border: 2px solid var(--border-strong);
    background-color: var(--card-bg);
    padding: 36px;
    box-shadow: var(--shadow-sharp);
    margin-bottom: 28px;
  }

  .hero-badge {
    font-family: var(--font-label);
    font-size: 0.8rem;
    font-weight: 800;
    background-color: var(--border-strong);
    color: var(--bg-primary);
    padding: 4px 8px;
    display: inline-block;
    margin-bottom: 16px;
  }

  .welcome-heading {
    font-size: 2.4rem;
    font-weight: 900;
    line-height: 1.18;
    letter-spacing: -0.03em;
    margin-bottom: 16px;
  }

  .welcome-subtext {
    font-size: 1.15rem;
    color: var(--text-muted);
    max-width: 760px;
    line-height: 1.5;
    margin-bottom: 28px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
    border-top: 1px solid var(--border-color);
    padding-top: 24px;
    margin-bottom: 28px;
  }

  .stat-box {
    border-left: 3px solid var(--border-strong);
    padding-left: 12px;
  }

  .stat-number {
    font-family: var(--font-label);
    font-size: 1.8rem;
    font-weight: 900;
    line-height: 1;
  }

  .stat-label {
    font-size: 0.85rem;
    color: var(--text-subtle);
    margin-top: 4px;
  }

  .hero-buttons {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  .methodology-card {
    border: 1px solid var(--border-color);
    background-color: var(--card-bg);
    padding: 24px;
  }
</style>
