// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { remarkExhibits, rehypeTables } from './src/lib/exhibits.mjs';

export default defineConfig({
  // Set by the deploy workflow: the custom domain, or the GitHub Pages project URL.
  site: process.env.SITE_URL || 'https://movingcurve.online',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },
  integrations: [sitemap()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkExhibits],
      rehypePlugins: [rehypeTables],
      remarkRehype: {
        // Drawn return arrow for footnotes instead of the "↩" glyph (which iOS renders as an emoji).
        footnoteBackContent: () => [
          {
            type: 'element',
            tagName: 'svg',
            properties: { viewBox: '0 0 24 24', width: 13, height: 13, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', ariaHidden: 'true', style: 'vertical-align:-2px' },
            children: [{ type: 'element', tagName: 'path', properties: { d: 'M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11' }, children: [] }],
          },
        ],
      },
    }),
    shikiConfig: { theme: 'github-light' },
  },
});
