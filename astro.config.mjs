import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://poslednie-pravki.ru',
  output: 'static',
  integrations: [sitemap()],
});
