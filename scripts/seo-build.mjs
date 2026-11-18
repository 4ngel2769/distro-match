/**
 * LinuxMatch SEO build step.
 *
 * Runs after `vite build` (wired through vite.config.js) and produces:
 *   - per-route static HTML with route-specific <head> tags and crawlable
 *     content baked into the served markup (the SPA hydrates over it)
 *   - sitemap.xml covering every route and every distribution profile
 *   - robots.txt
 *   - llms.txt and llms-full.txt for AI assistants and LLM search
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
  themeColor: '#5B4BE0'
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
  'linux kernel distributions',
  'will my pc run linux',
  'linux compatibility checker',
  'best linux distro for my pc',
  'linux distro finder by hardware',
  'linux distro for my cpu and gpu',
  'linux for handheld devices',
  'linux for raspberry pi'
].join(', ');

const HOME_TITLE =
  'LinuxMatch: Find the Best Linux Distribution for You (116+ Distros Compared)';
const HOME_DESCRIPTION =
  'LinuxMatch is a free, private Linux distribution finder. Take a short adaptive quiz or enter your CPU, GPU and RAM to see which of 116+ distros fit, with a clear "Will my computer run this well?" verdict, match reasons, verified screenshots and official links.';

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
        text: 'Match the distribution to your hardware, your tolerance for maintenance and your package-format preferences. LinuxMatch offers a short adaptive quiz and a hardware picker for CPU, GPU and memory, then ranks 116+ distributions against your answers and explains every match.'
      }
    },
    {
      '@type': 'Question',
      name: 'Does LinuxMatch store my data?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. LinuxMatch runs entirely in your browser. There are no accounts, no analytics and no tracking cookies. A single cookie remembers your light or dark theme choice if you make one, and hardware specs you choose to save stay in local storage, one set per platform. Nothing is sent to a server.'
      }
    },
    {
      '@type': 'Question',
      name: 'How does the "Will my computer run this well?" check work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Enter your processor, graphics card and memory in the spec finder, and LinuxMatch compares them with each distribution architecture, memory targets, GPU driver support and hardware focus. You get a plain-language verdict and the reasons behind it, and saved specs are reused on every distro profile.'
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
      <p>LinuxMatch is a free, private Linux distribution finder. Take a short adaptive
      quiz, or tell us your processor, graphics card and memory to see which of 116+
      distributions match your needs and hardware. Every match comes with a clear
      "Will my computer run this well?" verdict and the reasons behind it.</p>
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
    title: 'Linux Distribution Finder Quiz: Adaptive, 116+ Distros | LinuxMatch',
    description:
      'Take the LinuxMatch finder quiz: a short adaptive interview about your hardware, GPU, init system, software philosophy and workflow. Get a personalised ranking of 116+ Linux distributions with match scores and reasons.',
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
      <p>A short adaptive interview across three stages: your setup, system behaviour and
      principles. Questions that cannot change the answer are skipped automatically. Every
      answer is weighted, from nice to have to must-have, and the matching engine re-ranks
      116+ Linux distributions live with a transparent score breakdown.</p>
      <ul>
        <li><a href="/directory/">Browse all Linux distributions</a></li>
        <li><a href="/compare/">Compare two distributions side by side</a></li>
      </ul>`
  });

  routes.push({
    path: '/directory',
    title: 'Linux Distribution Directory: All 116+ Linux Distros Compared | LinuxMatch',
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
      <p>Every Linux distribution in the LinuxMatch catalogue, ${LINUX_DISTROS.length} in
      total, with its family, base, release model, package manager, init system,
      desktop environments, GPU support and hardware target. Filter by family, search by
      package manager or init system, and sort by DistroWatch popularity, age or last
      update.</p>
      <h2>All Linux distributions</h2>
      <ul>
        ${LINUX_DISTROS.map(
          (d) =>
            `<li><a href="/distro/${d.id}/">${escapeHtml(d.name)}</a>: ${escapeHtml(
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
      title: `${d.name}: Linux Distribution Profile, Specs, Pros & Cons | LinuxMatch`,
      description: `${d.name} is a ${d.family}-based Linux distribution: ${d.tagline}. Package manager ${d.packageManager}, ${d.initSystem} init, ${desktops} desktop. Pros, cons, best uses and official downloads.`,
      priority: d.tier === 'flagship' ? '0.8' : d.tier === 'specialist' ? '0.7' : '0.6',
      changefreq: 'monthly',
      jsonLd: [
        {
          '@type': 'SoftwareApplication',
          name: `${d.name}: Linux distribution`,
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
        <h1>${escapeHtml(d.name)}: Linux distribution profile</h1>
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
          `<li><a href="/distro/${d.id}/">${escapeHtml(d.name)}</a>: ${escapeHtml(
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
    title: 'Privacy and GDPR: No Tracking, No Accounts | LinuxMatch',
    description:
      'LinuxMatch privacy policy: the app runs entirely in your browser, collects no personal data, uses no analytics or advertising cookies, keeps only one theme preference cookie and is GDPR compliant by design.',
    priority: '0.3',
    changefreq: 'yearly',
    jsonLd: [],
    content: `
      <h1>Privacy and GDPR</h1>
      <p>LinuxMatch runs 100% inside your browser. Answers, hardware details and match
      scores never leave your device. There are no analytics trackers, no advertising
      cookies and no server-side databases. One small cookie remembers your theme choice only if you change it.</p>`
  });

  routes.push({
    path: '/terms',
    title: 'Terms of Service | LinuxMatch',
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
  // Set GOOGLE_SITE_VERIFICATION to the token Google Search Console gives you.
  // The meta tag is emitted on every pre-rendered route, so any of them verifies.
  const verification = process.env.GOOGLE_SITE_VERIFICATION
    ? `<meta name="google-site-verification" content="${escapeHtml(process.env.GOOGLE_SITE_VERIFICATION)}">\n  `
    : '';

  // Keep the tags Vite injected (stylesheet, module script, icon, fonts) and
  // drop only the ones this script owns. Script tags must be matched with
  // their closing tag, otherwise the document breaks.
  const preserved = (
    originalHead.match(/<script\b[\s\S]*?<\/script>|<(?:meta|link|style)\b[\s\S]*?>/gi) || []
  )
    .filter(
      (tag) =>
        !/<title>/i.test(tag) &&
        !/charset=/i.test(tag) &&
        !/name="viewport"/i.test(tag) &&
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
  ${verification}<link rel="canonical" href="${canonical}">
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
  <meta property="og:image:alt" content="LinuxMatch: find the best Linux distribution for you">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(route.title)}">
  <meta name="twitter:description" content="${escapeHtml(route.description)}">
  <meta name="twitter:image" content="${ogImage}">
  ${blocks}
  ${preserved}
  ${FALLBACK_STYLE}`;
}

const FALLBACK_STYLE = `<style>
      .seo-static{max-width:70ch;margin:0 auto;padding:48px 24px;font-family:"Public Sans",system-ui,sans-serif;line-height:1.6;color:#22202A}
      .seo-static h1{font-size:2rem;margin:0 0 12px}
      .seo-static h2{font-size:1.15rem;margin:28px 0 8px}
      .seo-static ul{padding-left:20px}
      .seo-static a{color:#4A3AC9}
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

/** Concise, human-curated index for LLMs and AI search assistants. */
function buildLlmsTxt(routes) {
  const byPath = new Map(routes.map((route) => [route.path, route]));
  const link = (path) => {
    const route = byPath.get(path);
    if (!route) return '';
    const label = route.title.replace(/ \| LinuxMatch$/, '').split(':')[0];
    return `- [${label}](${abs(path)}): ${route.description}`;
  };
  const group = (predicate) => routes.filter(predicate).map((route) => link(route.path));

  const core = ['/', '/quiz', '/directory', '/compare', '/privacy', '/terms']
    .map(link)
    .filter(Boolean);
  const profiles = routes
    .filter((route) => route.path.startsWith('/distro/'))
    .slice(0, 10)
    .map((route) => link(route.path));

  return `# ${SITE.name}

> ${HOME_DESCRIPTION}

Canonical URL: ${SITE.primary}/
Sitemap: ${SITE.primary}/sitemap.xml
Full index: ${SITE.primary}/llms-full.txt

## Core pages

${core.join('\n')}

## Browse by family

${group((route) => route.path.startsWith('/linux-distributions/') && route.path !== '/linux-distributions/').join('\n')}

## Browse by use case

${group((route) => route.path.startsWith('/linux-for-')).join('\n')}

## Example distribution profiles

${profiles.join('\n')}

## Notes

- Every page is pre-rendered as static HTML, then hydrates into a client-side Svelte app.
- The directory accepts a search term in the URL: ${SITE.primary}/directory?q=ubuntu
- No accounts, analytics or tracking cookies. One optional cookie stores the light or dark theme choice.
- Distro names and logos are trademarks of their respective owners. Per-asset credits appear on each profile.
`;
}

/** Complete route index for assistants that need every URL. */
function buildLlmsFull(routes) {
  const pages = routes.map(
    (route) =>
      `- [${route.title.replace(/ \| LinuxMatch$/, '')}](${abs(route.path)}): ${route.description}`
  );

  return `# ${SITE.name} - full content index

> ${HOME_DESCRIPTION}

Canonical URL: ${SITE.primary}/
Sitemap: ${SITE.primary}/sitemap.xml
Short index: ${SITE.primary}/llms.txt

${pages.join('\n')}
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
      background_color: '#16151B',
      theme_color: SITE.themeColor,
      lang: 'en',
      icons: [
        {
          src: '/favicon.png',
          sizes: '64x64',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/logo-256.png',
          sizes: '256x256',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    },
    null,
    2
  );
}

const LOGO_PATH = join(__dirname, '..', 'public', 'logo.png');
const LOGO_DATA = existsSync(LOGO_PATH)
  ? `data:image/png;base64,${readFileSync(LOGO_PATH).toString('base64')}`
  : '';

const OG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0D0C11"/>
      <stop offset="100%" stop-color="#1B1730"/>
    </linearGradient>
    <linearGradient id="a" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#A394FF"/>
      <stop offset="100%" stop-color="#6C5CE7"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect x="0" y="0" width="1200" height="8" fill="url(#a)"/>
  <circle cx="1080" cy="90" r="220" fill="#6C5CE7" opacity="0.14"/>
  <circle cx="1010" cy="560" r="170" fill="#C9A77A" opacity="0.08"/>
  ${LOGO_DATA ? `<image href="${LOGO_DATA}" x="80" y="92" width="104" height="104"/>` : ''}
  <text x="208" y="158" font-family="Helvetica,Arial,sans-serif" font-size="62" font-weight="800" fill="#F4F2F7">LinuxMatch</text>
  <text x="80" y="298" font-family="Helvetica,Arial,sans-serif" font-size="52" font-weight="700" fill="#F4F2F7">Find a Linux distro that fits.</text>
  <text x="80" y="352" font-family="Helvetica,Arial,sans-serif" font-size="28" fill="#BDB9FF">Adaptive quiz or hardware matching with CPU, GPU and RAM</text>
  <text x="80" y="398" font-family="Helvetica,Arial,sans-serif" font-size="28" fill="#BDB9C8">116+ distributions &#183; compatibility verdicts &#183; zero tracking</text>
  <rect x="80" y="446" width="432" height="52" rx="10" fill="#6C5CE7"/>
  <text x="104" y="480" font-family="Helvetica,Arial,sans-serif" font-size="22" font-weight="700" fill="#FFFFFF">Will my computer run this well?</text>
  <text x="80" y="556" font-family="Helvetica,Arial,sans-serif" font-size="26" font-weight="700" fill="#F4F2F7">linuxmatch.adev0.eu</text>
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
  writeFileSync(join(distDir, 'llms.txt'), buildLlmsTxt(routes));
  writeFileSync(join(distDir, 'llms-full.txt'), buildLlmsFull(routes));
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
        `[seo] ${result.routes} routes pre-rendered (${result.distros} distro profiles); sitemap.xml, robots.txt, llms.txt and llms-full.txt written.`
      );
    })
    .catch((error) => {
      console.error('[seo]', error);
      process.exit(1);
    });
}
