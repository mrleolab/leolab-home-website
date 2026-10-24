module.exports = {
  title: 'Leo Lab Knowledge Base',
  tagline: 'Learn by building. Share what works.',
  url: 'https://leo.leolan.workers.dev',
  baseUrl: '/knowledge-base/',
  trailingSlash: true,
  favicon: '/favicon.svg',
  onBrokenLinks: 'throw',
  i18n: {defaultLocale: 'en', locales: ['en']},
  presets: [['classic', {
    docs: {routeBasePath: '/', sidebarPath: './sidebars.js'},
    blog: false,
    pages: false,
    theme: {customCss: './src/css/custom.css'},
    sitemap: false
  }]],
  themeConfig: {
    colorMode: {defaultMode: 'light', respectPrefersColorScheme: false},
    navbar: {
      title: 'Leo Lab / Knowledge Base',
      items: [
        {href: '/', label: 'Home', position: 'right', target: '_self'},
        {href: 'https://github.com/mrleolab', label: 'GitHub', position: 'right'}
      ]
    },
    footer: {style: 'light', copyright: 'Leo Lab · Learn by building. Share what works.'},
    prism: {additionalLanguages: ['json', 'bash']},
    tableOfContents: {minHeadingLevel: 2, maxHeadingLevel: 3}
  }
};
