import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';

// Письма пишутся с осмысленными переносами строк внутри абзацев (варианты ответа
// в анкетах, подписи, реплики). Превращаем «мягкие» переносы в <br>, чтобы вёрстке не
// приходилось держать весь текст в white-space: pre-wrap — из-за него между тегами
// <p>/<li> появлялись пустые строки, а абзацы и списки разъезжались.
const softBreaks = {
  name: 'soft-breaks',
  text(node, ctx) {
    if (!node.value.includes('\n')) return;
    const pieces = [];
    node.value.split('\n').forEach((part, i) => {
      if (i > 0) pieces.push({ type: 'break' });
      if (part) pieces.push({ type: 'text', value: part });
    });
    ctx.insertBefore(node, pieces);
    ctx.removeNode(node);
  },
};

export default defineConfig({
  site: 'https://poslednie-pravki.ru',
  output: 'static',
  markdown: {
    processor: satteri({ mdastPlugins: [softBreaks] }),
  },
  integrations: [
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname;
        // Only tag landing pages (/tag/xxx/) and individual letters (/letter/xxx/) —
        // no homepage, no pagination pages, no cookies page.
        const isHomePage = path === '/';
        const isTagPage = /^\/tag\/[^/]+\/$/.test(path);
        const isLetterPage = /^\/letter\/[^/]+\/$/.test(path);
        return isHomePage || isTagPage || isLetterPage;
      },
    }),
  ],
});
