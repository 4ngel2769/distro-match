import { mount } from 'svelte';
import './styles/theme.css';
import App from './App.svelte';

const target = document.getElementById('app');

// Static SEO markup may be pre-rendered into #app for crawlers. The SPA owns
// the DOM, so drop it before mounting to avoid duplicated content.
if (target) target.innerHTML = '';

const app = mount(App, {
  target
});

export default app;
