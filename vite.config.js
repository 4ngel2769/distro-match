import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { buildSeo } from './scripts/seo-build.mjs';

/**
 * Emits the SEO artefacts (per-route static HTML, sitemap.xml, robots.txt,
 * webmanifest, social image) right after the bundle is written.
 */
function seoPlugin() {
  return {
    name: 'linuxmatch-seo',
    apply: 'build',
    async closeBundle() {
      const result = await buildSeo({ distDir: 'dist' });
      this.info(
        `SEO: ${result.routes} routes pre-rendered, sitemap.xml + robots.txt written`
      );
    }
  };
}

export default defineConfig({
  plugins: [svelte(), seoPlugin()],
  server: {
    port: 5173,
    host: true
  }
});
