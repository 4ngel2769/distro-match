/**
 * LinuxMatch SEO build step.
 *
 * Runs after `vite build` (wired through vite.config.js) and produces:
 *   - per-route static HTML with route-specific <head> tags and crawlable
 *     content baked into the served markup (the SPA hydrates over it)
 *   - sitemap.xml covering every route and every distribution profile
 *   - robots.txt
 *   - site.webmanifest
 *   - a 1200x630 social share image
 *
 * Runtime: works under both `node` and `bun`.
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { LINUX_DISTROS } from '../src/data/distros.js';
import {
  FAMILY_PAGES,
  USE_CASE_PAGES,
  HUB_PAGE,
  landingPath
} from '../src/data/landingPages.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const SITE = {
  name: 'LinuxMatch',
  tagline: 'Find the best Linux distribution for you',
  primary: 'https://linuxmatch.adev0.eu',
  mirror: 'https://linuxmatch.pages.dev',
  author: 'buyangeldev0',
  locale: 'en_US',
  twitter: '@adev0',
  themeColor: '#a0f002'
};

const KEYWORDS = [
  'linux distributions',
  'linux distro list',
  'best linux distribution',
  'which linux distro should i use',
  'linux distro comparison',
  'linux distro directory',
  'linux distribution finder',
  'linux for beginners',
  'linux for gaming',
  'linux for programming',
  'linux for old hardware',
  'linux for privacy',
  'arch linux vs ubuntu',
  'linux mint vs ubuntu',
  'debian vs ubuntu',
  'fedora linux',
  'opensuse linux',
  'gentoo linux',
  'nix os linux',
  'arch based distributions',
  'debian based distributions',
  'ubuntu alternatives',
  'linux package managers',
  'systemd vs openrc',
  'linux distros with nvidia drivers',
  'linux distros without snaps',
  'best linux distro for gaming pc',
  'best lightweight linux distro',
  'best linux distro for developers',
  'best linux distro for privacy',
  'distro watch ranking',
  'linux distribution directory',
  'compare linux distros',
  'linux os list',
  'linux kernel distributions'
].join(', ');

const HOME_TITLE =
  'LinuxMatch — Find the Best Linux Distribution for You (116+ Distros Compared)';
const HOME_DESCRIPTION =
  'LinuxMatch is a free Linux distribution finder and comparison tool. Take the 23-question triangulation quiz or browse 116+ distributions (Ubuntu, Linux Mint, Arch, Fedora, openSUSE, Gentoo, NixOS) with package managers, init systems, desktop environments, pros, cons and official links.';

function abs(path) {
  const clean = path === '/' ? '' : path.replace(/\/+$/, '');
  return `${SITE.primary}${clean}/`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function jsonLd(block) {
  return `<script type="application/ld+json">${JSON.stringify(block)}</script>`;
}

const ORGANIZATION = {
  '@type': 'Organization',
  name: SITE.name,
  url: SITE.primary,
  logo: `${SITE.primary}/og-image.png`,
  sameAs: [SITE.mirror, 'https://adev0.eu']
};

const WEBSITE = {
  '@type': 'WebSite',
  name: SITE.name,
  alternateName: 'Linux Match',
  url: SITE.primary,
  description: HOME_DESCRIPTION,
  inLanguage: 'en',
  publisher: ORGANIZATION,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE.primary}/directory?q={search_term_string}`
    },
    'query-input': 'required name=search_term_string'
  }
};

const FAQ = {
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the best Linux distribution for beginners?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'For most beginners Linux Mint, Ubuntu, Linux Mint Cinnamon and Zorin OS are the easiest entry points: they ship with a graphical installer, driver manager and broad hardware support. LinuxMatch scores every distribution against your hardware, preferences and priorities so the answer is specific to you.'
      }
    },
    {
      '@type': 'Question',
      name: 'Which Linux distribution is best for gaming?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bazzite, Nobara, CachyOS and Pop!_OS lead for gaming because they ship with tuned drivers, Steam integration and low-latency kernels. LinuxMatch flags gaming-optimised distributions when you enable its gaming steering lever.'
      }
    },
    {
      '@type': 'Question',
      name: 'Is Arch Linux or Ubuntu better?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ubuntu is easier to install and maintain, while Arch gives you a rolling, minimal base you configure yourself. LinuxMatch compares them side by side across package managers, release models, init systems and stability.'
      }
    },
    {
      '@type': 'Question',
      name: 'How do I choose between Linux distributions?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Match the distribution to your hardware, your tolerance for maintenance and your package-format preferences. LinuxMatch asks 23 questions across four rounds about GPUs, init system, software freedom, memory budget and workflow, then ranks all 116+ distributions against your answers.'
      }
    },
    {
      '@type': 'Question',
      name: 'Does LinuxMatch store my data?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. LinuxMatch runs entirely in your browser. There are no accounts, no analytics, no cookies and nothing is sent to a server — your answers never leave your device.'
      }
    }
  ]
};

/** Per-route metadata: title, description, canonical path and JSON-LD blocks. */
function buildRoutes() {
  const routes = [];

  routes.push({
    path: '/',
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    priority: '1.0',
    changefreq: 'weekly',
    jsonLd: [WEBSITE, ORGANIZATION, FAQ],
    content: `
      <h1>Find your ideal Linux distribution</h1>
      <p>LinuxMatch is a free, private Linux distribution finder. Answer 23 technical
      questions across four rounds — hardware, GPUs, init system, package format and
      workflow — and get a ranked shortlist drawn from more than 116 Linux
      distributions, each scored against your actual setup.</p>
      <h2>Search the complete Linux distribution directory</h2>
      <p>Browse every distribution we track: Ubuntu, Debian, Arch Linux, Fedora, openSUSE,
      Gentoo, Linux Mint, Manjaro, NixOS, Kali Linux, Tails, elementary OS, Proxmox VE,
      SteamOS and many more. Each profile lists the package manager, init system,
      desktop environments, release model, hardware targets, GPU support, pros, cons and
      official download links.</p>
      <ul>
        <li><a href="/directory/">Linux distribution directory</a></li>
        <li><a href="/quiz/">Linux distribution finder quiz</a></li>
        <li><a href="/compare/">Compare two Linux distributions side by side</a></li>
      </ul>`
  });

  routes.push({
    path: '/quiz',
    title: 'Linux Distribution Finder Quiz — 23 Questions, 116+ Distros | LinuxMatch',
    description:
      'Take the LinuxMatch finder quiz: 23 questions in 4 rounds about your hardware, GPU, init system, software philosophy and workflow. Get a personalised ranking of 116+ Linux distributions with match scores and reasons.',
    priority: '0.9',
    changefreq: 'monthly',
    jsonLd: [
      {
        '@type': 'SoftwareApplication',
        name: 'LinuxMatch Linux Distribution Finder',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any (web browser)',
        url: abs('/quiz'),
        description:
          'A browser-based quiz that matches your hardware, preferences and workflow to the best Linux distributions.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        publisher: ORGANIZATION
      }
    ],
    content: `
      <h1>Linux distribution finder quiz</h1>
      <p>Twenty-three questions in four rounds: foundation and user profile, hardware
      topology, ecosystem and package philosophy, and workflow priorities. Every answer
      is weighted — you can mark a question as normal, high priority or a dealbreaker —
      and the matching engine re-ranks 116+ Linux distributions live.</p>
      <ul>
        <li><a href="/directory/">Browse all Linux distributions</a></li>
        <li><a href="/compare/">Compare two distributions side by side</a></li>
      </ul>`
  });

  routes.push({
    path: '/directory',
    title: 'Linux Distribution Directory — All 116+ Linux Distros Compared | LinuxMatch',
    description:
      'The complete Linux distribution directory: 116+ distros filtered by family, sorted by DistroWatch popularity, age or last update. Ubuntu, Debian, Arch, Fedora, openSUSE, Gentoo, NixOS and every niche release, with verified logos and screenshots.',
    priority: '0.9',
    changefreq: 'weekly',
    jsonLd: [
      {
        '@type': 'CollectionPage',
        name: 'Linux distribution directory',
        description:
          'A searchable directory of more than 116 Linux distributions with package managers, init systems, desktop environments and pros and cons.',
        url: abs('/directory'),
        isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.primary },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: LINUX_DISTROS.length,
          itemListElement: LINUX_DISTROS.slice(0, 100).map((d, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: d.name,
            url: abs(`/distro/${d.id}`)
          }))
        }
      }
    ],
    content: `
      <h1>Linux distribution directory</h1>
      <p>Every Linux distribution in the LinuxMatch catalogue — ${LINUX_DISTROS.length} in
      total — with its family, base, release model, package manager, init system,
      desktop environments, GPU support and hardware target. Filter by family, search by
      package manager or init system, and sort by DistroWatch popularity, age or last
      update.</p>
      <h2>All Linux distributions</h2>
      <ul>
        ${LINUX_DISTROS.map(
          (d) =>
            `<li><a href="/distro/${d.id}/">${escapeHtml(d.name)}</a> — ${escapeHtml(
              d.family
            )} family, ${escapeHtml(d.initSystem)}, ${escapeHtml(
              d.packageManager.split('/')[0].trim()
            )}</li>`
        ).join('\n        ')}
      </ul>`
  });

  routes.push({
    path: '/compare',
    title: 'Compare Linux Distributions Side by Side | LinuxMatch',
    description:
      'Compare two Linux distributions side by side: package manager, init system, release model, desktop environments, GPU support, memory requirements, pros and cons. A clean spec sheet for every pairing.',
    priority: '0.8',
    changefreq: 'monthly',
    jsonLd: [
      {
        '@type': 'WebApplication',
        name: 'Linux distribution comparison tool',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any (web browser)',
        url: abs('/compare'),
        description:
          'Compare two Linux distributions side by side across technical specifications, pros and cons.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        publisher: ORGANIZATION
      }
    ],
    content: `
      <h1>Compare Linux distributions side by side</h1>
      <p>Pick any two Linux distributions and see a plain comparison of package manager,
      init system, release model, desktop environments, minimum and recommended memory,
      GPU support, software stance and the trade-offs each one asks you to accept.</p>
      <ul>
        <li><a href="/directory/">Browse the Linux distribution directory</a></li>
        <li><a href="/quiz/">Not sure which two? Take the finder quiz</a></li>
      </ul>`
  });

  for (const d of LINUX_DISTROS) {
    const desktops = (d.desktopEnvironments || []).join(', ') || 'custom';
    const pros = (d.pros || []).slice(0, 3).join('; ');
    const cons = (d.cons || []).slice(0, 2).join('; ');
    const useCases = (d.primaryUseCases || []).join(', ') || 'general purpose';
    routes.push({
      path: `/distro/${d.id}`,
      title: `${d.name} — Linux Distribution Profile, Specs, Pros & Cons | LinuxMatch`,
      description: `${d.name} is a ${d.family}-based Linux distribution: ${d.tagline}. Package manager ${d.packageManager}, ${d.initSystem} init, ${desktops} desktop. Pros, cons, best uses and official downloads.`,
      priority: d.tier === 'flagship' ? '0.8' : d.tier === 'specialist' ? '0.7' : '0.6',
      changefreq: 'monthly',
      jsonLd: [
        {
          '@type': 'SoftwareApplication',
          name: `${d.name} — Linux distribution`,
          alternateName: `${d.name} Linux`,
          applicationCategory: 'OperatingSystem',
          operatingSystem: `Linux (${(d.architectures || ['x86_64']).join(', ')})`,
          description: `${d.name}: ${d.tagline}. ${d.family} family, ${d.packageManager} packages, ${d.initSystem} init, ${desktops} desktops. ${pros}`,
          url: abs(`/distro/${d.id}`),
          sameAs: [d.website].filter(Boolean),
          publisher: ORGANIZATION
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: abs('/') },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Linux distribution directory',
              item: abs('/directory')
            },
            { '@type': 'ListItem', position: 3, name: d.name, item: abs(`/distro/${d.id}`) }
          ]
        }
      ],
      content: `
        <h1>${escapeHtml(d.name)} — Linux distribution profile</h1>
        <p>${escapeHtml(d.name)} is a ${escapeHtml(d.family)}-family Linux distribution
        based on ${escapeHtml(d.base)}. ${escapeHtml(d.tagline)}.</p>
        <h2>${escapeHtml(d.name)} technical details</h2>
        <ul>
          <li>Package manager: ${escapeHtml(d.packageManager)}</li>
          <li>Init system: ${escapeHtml(d.initSystem)}</li>
          <li>Release model: ${escapeHtml(d.releaseModel)}</li>
          <li>Desktop environments: ${escapeHtml(desktops)}</li>
          <li>Hardware target: ${escapeHtml(d.hardwareSpec)}</li>
          <li>Architectures: ${escapeHtml((d.architectures || ['x86_64']).join(', '))}</li>
          <li>Best suited to: ${escapeHtml(useCases)}</li>
        </ul>
        <h2>${escapeHtml(d.name)} pros and cons</h2>
        <p>Strengths: ${escapeHtml(pros)}. Trade-offs: ${escapeHtml(cons)}.</p>
        <p><a href="${escapeHtml(d.website)}">${escapeHtml(d.name)} official website</a></p>
        <ul>
          <li><a href="/directory/">All Linux distributions</a></li>
          <li><a href="/quiz/">Find your perfect Linux distribution</a></li>
          <li><a href="/compare/">Compare Linux distributions side by side</a></li>
        </ul>`
    });
  }

  // --- Keyword landing pages -------------------------------------------------
  const landingList = (items) =>
    items
      .map(
        (d) =>
          `<li><a href="/distro/${d.id}/">${escapeHtml(d.name)}</a> — ${escapeHtml(
            d.family
          )} family, ${escapeHtml(d.initSystem)}, ${escapeHtml(d.packageManager.split('/')[0].trim())}</li>`
      )
      .join('\n            ');

  const familyLinks = FAMILY_PAGES.map(
    (f) => `<li><a href="${landingPath('family', f.slug)}">${escapeHtml(f.label)} Linux distributions</a></li>`
  ).join('\n            ');

  const useCaseLinks = USE_CASE_PAGES.map(
    (u) => `<li><a href="${landingPath('use-case', u.slug)}">${escapeHtml(u.label)}</a></li>`
  ).join('\n            ');

  routes.push({
    path: landingPath('hub', ''),
    title: HUB_PAGE.title,
    description: HUB_PAGE.description,
    priority: '0.9',
    changefreq: 'weekly',
    jsonLd: [
      {
        '@type': 'CollectionPage',
        name: 'All Linux distributions',
        description: HUB_PAGE.description,
        url: abs(landingPath('hub', '')),
        isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.primary },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: LINUX_DISTROS.length,
          itemListElement: LINUX_DISTROS.map((d, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: d.name,
            url: abs(`/distro/${d.id}`)
          }))
        }
      }
    ],
    content: `
      <h1>All Linux distributions</h1>
      <p>${escapeHtml(HUB_PAGE.intro)}</p>
      <h2>Browse Linux distributions by family</h2>
      <ul>
            ${familyLinks}
      </ul>
      <h2>Browse Linux distributions by use case</h2>
      <ul>
            ${useCaseLinks}
      </ul>
      <h2>Complete list of ${LINUX_DISTROS.length} Linux distributions</h2>
      <ul>
            ${landingList(LINUX_DISTROS)}
      </ul>`
  });

  for (const family of FAMILY_PAGES) {
    const items = LINUX_DISTROS.filter(family.match);
    routes.push({
      path: landingPath('family', family.slug),
      title: family.title,
      description: family.description,
      priority: '0.8',
      changefreq: 'weekly',
      jsonLd: [
        {
          '@type': 'CollectionPage',
          name: `${family.label} Linux distributions`,
          description: family.description,
          url: abs(landingPath('family', family.slug)),
          isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.primary },
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: items.length,
            itemListElement: items.map((d, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: d.name,
              url: abs(`/distro/${d.id}`)
            }))
          }
        }
      ],
      content: `
      <h1>${escapeHtml(family.label)} Linux distributions</h1>
      <p>${escapeHtml(family.intro)}</p>
      <h2>${items.length} ${escapeHtml(family.label)}-family distributions</h2>
      <ul>
            ${landingList(items)}
      </ul>
      <p><a href="/linux-distributions/">All Linux distributions</a> · <a href="/directory/">Open the directory</a> · <a href="/quiz/">Find my distribution</a></p>`
    });
  }

  for (const useCase of USE_CASE_PAGES) {
    const items = LINUX_DISTROS.filter((d) => (d.primaryUseCases || []).includes(useCase.useCase));
    routes.push({
      path: landingPath('use-case', useCase.slug),
      title: useCase.title,
      description: useCase.description,
      priority: '0.8',
      changefreq: 'weekly',
      jsonLd: [
        {
          '@type': 'CollectionPage',
          name: useCase.label,
          description: useCase.description,
          url: abs(landingPath('use-case', useCase.slug)),
          isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.primary },
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: items.length,
            itemListElement: items.map((d, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: d.name,
              url: abs(`/distro/${d.id}`)
            }))
          }
        }
      ],
      content: `
      <h1>${escapeHtml(useCase.title.replace(' | LinuxMatch', ''))}</h1>
      <p>${escapeHtml(useCase.intro)}</p>
      <h2>${items.length} distributions suited to ${escapeHtml(useCase.label.toLowerCase())}</h2>
      <ul>
            ${landingList(items)}
      </ul>
      <p><a href="/linux-distributions/">All Linux distributions</a> · <a href="/directory/">Open the directory</a> · <a href="/quiz/">Find my distribution</a></p>`
    });
  }

  routes.push({
    path: '/privacy',
    title: 'Privacy & GDPR — No Tracking, No Accounts | LinuxMatch',
    description:
      'LinuxMatch privacy policy: the app runs entirely in your browser, collects no personal data, uses no analytics or advertising cookies and is GDPR compliant by design.',
    priority: '0.3',
    changefreq: 'yearly',
    jsonLd: [],
    content: `
      <h1>Privacy and GDPR</h1>
      <p>LinuxMatch runs 100% inside your browser. Answers, hardware details and match
      scores never leave your device. There are no analytics trackers, no advertising
      cookies, no accounts and no server-side databases.</p>`
  });

  routes.push({
    path: '/terms',
    title: 'Terms of Service — LinuxMatch',
    description:
      'Terms of service for LinuxMatch, an open, educational decision-support tool for choosing a Linux distribution. Zero telemetry, zero data retention.',
    priority: '0.3',
    changefreq: 'yearly',
    jsonLd: [],
    content: `
      <h1>Terms of service</h1>
      <p>LinuxMatch is an open, educational decision-support tool for discovering Linux
      and open-source operating systems. Recommendations and match scores are
      informational evaluations derived from public project documentation and
      community metadata.</p>`
  });

  return routes;
}

/** Full &lt;head&gt; block for a route. */
function buildHead(route, originalHead = '') {
  const canonical = abs(route.path);
  const ogImage = `${SITE.primary}/og-image.png`;
  const blocks = route.jsonLd.map(jsonLd).join('\n  ');

  // Keep the tags Vite injected (stylesheet, module script, icon, fonts) and
  // drop only the ones this script owns. Script tags must be matched with
  // their closing tag, otherwise the document breaks.
  const preserved = (
    originalHead.match(/<script\b[\s\S]*?<\/script>|<(?:meta|link|style)\b[\s\S]*?>/gi) || []
  )
    .filter(
      (tag) =>
        !/<title>/i.test(tag) &&
        !/name="(description|keywords|robots|author|theme-color|color-scheme)"/i.test(tag) &&
        !/rel="(canonical|alternate)"/i.test(tag) &&
        !/property="og:/i.test(tag) &&
        !/name="twitter:/i.test(tag) &&
        !/type="application\/ld\+json"/i.test(tag)
    )
    .join('\n  ');

  return `<meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(route.title)}</title>
  <meta name="description" content="${escapeHtml(route.description)}">
  <meta name="keywords" content="${escapeHtml(KEYWORDS)}">
  <meta name="author" content="${escapeHtml(SITE.author)}">
  <meta name="theme-color" content="${SITE.themeColor}">
  <meta name="color-scheme" content="light dark">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="x-default" href="${canonical}">
  <link rel="alternate" hreflang="en" href="${canonical}">
  <link rel="alternate" type="application/manifest" href="/site.webmanifest">
  <link rel="sitemap" type="application/xml" href="/sitemap.xml">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${escapeHtml(SITE.name)}">
  <meta property="og:locale" content="${SITE.locale}">
  <meta property="og:title" content="${escapeHtml(route.title)}">
  <meta property="og:description" content="${escapeHtml(route.description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="LinuxMatch — find the best Linux distribution for you">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(route.title)}">
  <meta name="twitter:description" content="${escapeHtml(route.description)}">
  <meta name="twitter:image" content="${ogImage}">
  ${blocks}
  ${preserved}
  ${FALLBACK_STYLE}`;
}

const FALLBACK_STYLE = `<style>
      .seo-static{max-width:70ch;margin:0 auto;padding:48px 24px;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;line-height:1.6;color:#10180A}
      .seo-static h1{font-size:2rem;margin:0 0 12px}
      .seo-static h2{font-size:1.15rem;margin:28px 0 8px}
      .seo-static ul{padding-left:20px}
      .seo-static a{color:#3F6212}
    </style>`;

function buildSitemap(routes) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = routes
    .map(
      (route) => `  <url>
    <loc>${abs(route.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function buildRobots() {
  return `User-agent: *
Allow: /

# No crawling of comparison permutations - they are generated on demand.
Disallow: /compare/*

Sitemap: ${SITE.primary}/sitemap.xml
`;
}

function buildManifest() {
  return JSON.stringify(
    {
      name: SITE.name,
      short_name: SITE.name,
      description: HOME_DESCRIPTION,
      start_url: '/',
      display: 'standalone',
      background_color: '#0A0C08',
      theme_color: SITE.themeColor,
      lang: 'en',
      icons: [
        {
          src: '/og-image.png',
          sizes: '1200x630',
          type: 'image/png',
          purpose: 'any'
        }
      ]
    },
    null,
    2
  );
}

const OG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0A0C08"/>
      <stop offset="100%" stop-color="#16210A"/>
    </linearGradient>
    <linearGradient id="a" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#A0F002"/>
      <stop offset="60%" stop-color="#86DC3C"/>
      <stop offset="100%" stop-color="#4FC46A"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect x="0" y="0" width="1200" height="8" fill="url(#a)"/>
  <text x="80" y="210" font-family="Helvetica,Arial,sans-serif" font-size="86" font-weight="800" fill="#F2F5EC">LINUXMATCH</text>
  <text x="80" y="290" font-family="Helvetica,Arial,sans-serif" font-size="34" fill="#A0F002">Find the best Linux distribution for you.</text>
  <text x="80" y="360" font-family="Helvetica,Arial,sans-serif" font-size="24" fill="#B7C1AA">116+ distributions compared &#183; package managers, init systems,</text>
  <text x="80" y="398" font-family="Helvetica,Arial,sans-serif" font-size="24" fill="#B7C1AA">desktops, pros and cons &#183; 100% client-side, zero tracking.</text>
  <text x="80" y="540" font-family="Helvetica,Arial,sans-serif" font-size="26" font-weight="700" fill="#F2F5EC">linuxmatch.adev0.eu</text>
</svg>`;

async function writeOgImage(distDir) {
  const svgPath = join(distDir, 'og-image.svg');
  writeFileSync(svgPath, OG_SVG);
  try {
    const { default: sharp } = await import('sharp');
    await sharp(Buffer.from(OG_SVG)).png().toFile(join(distDir, 'og-image.png'));
  } catch {
    // Sharp is optional - the SVG is a perfectly usable fallback.
  }
}

/**
 * Writes the SEO artefacts into the built site.
 * @param {{ distDir?: string }} [options]
 */
export async function buildSeo(options = {}) {
  const distDir = options.distDir || join(__dirname, '..', 'dist');
  const indexPath = join(distDir, 'index.html');
  if (!existsSync(indexPath)) {
    throw new Error(`SEO build: ${indexPath} not found - run "vite build" first.`);
  }

  const template = readFileSync(indexPath, 'utf8');
  const originalHead = (template.match(/<head>([\s\S]*?)<\/head>/i) || ['', ''])[1];
  const routes = buildRoutes();

  for (const route of routes) {
    const head = buildHead(route, originalHead);
    const page = template.replace(/<head>[\s\S]*?<\/head>/i, `<head>\n  ${head}\n</head>`);
    const withContent = page.replace(
      /<div id="app"><\/div>/i,
      `<div id="app"><div class="seo-static">${route.content}</div></div>`
    );
    const outDir = route.path === '/' ? distDir : join(distDir, route.path.replace(/^\//, ''));
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'index.html'), withContent);
  }

  writeFileSync(join(distDir, 'sitemap.xml'), buildSitemap(routes));
  writeFileSync(join(distDir, 'robots.txt'), buildRobots());
  writeFileSync(join(distDir, 'site.webmanifest'), buildManifest());
  await writeOgImage(distDir);

  return { routes: routes.length, distros: LINUX_DISTROS.length };
}

const invokedDirectly =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1].replace(/\\/g, '/');

if (invokedDirectly || process.argv[1]?.endsWith('seo-build.mjs')) {
  buildSeo()
    .then((result) => {
      console.log(
        `[seo] ${result.routes} routes pre-rendered (${result.distros} distro profiles), sitemap.xml + robots.txt written.`
      );
    })
    .catch((error) => {
      console.error('[seo]', error);
      process.exit(1);
    });
}
