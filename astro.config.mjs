import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://poslednie-pravki.ru',
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname;
        // Only tag landing pages (/tag/xxx/) and individual letters (/letter/xxx/) —
        // no homepage, no pagination pages, no cookies page.
        const isTagPage = /^\/tag\/[^/]+\/$/.test(path);
        const isLetterPage = /^\/letter\/[^/]+\/$/.test(path);
        return isTagPage || isLetterPage;
      },
    }),
  ],
});
