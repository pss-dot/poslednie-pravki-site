import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import fs from 'node:fs';
import path from 'node:path';

// lastmod для карты сайта: берём даты из фронтматтера писем (для цепочки — самая поздняя).
const postsDir = path.resolve('./src/content/posts');
const lastmodBySlug = new Map();
let newest = 0;
for (const file of fs.readdirSync(postsDir)) {
  if (!file.endsWith('.md')) continue;
  const text = fs.readFileSync(path.join(postsDir, file), 'utf8');
  if (/^draft:\s*true/m.test(text)) continue;
  const m = text.match(/^date:\s*"?([0-9T:\-+.Z ]+?)"?\s*$/m);
  if (!m) continue;
  const time = new Date(m[1].trim().replace(' ', 'T')).getTime();
  if (Number.isNaN(time)) continue;
  const base = file.replace(/\.md$/, '').replace(/^(re-)+/, '');
  lastmodBySlug.set(base, Math.max(lastmodBySlug.get(base) ?? 0, time));
  newest = Math.max(newest, time);
}
const iso = (t) => new Date(t).toISOString();

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
        const isArchive = path === '/arhiv/';
        return isHomePage || isTagPage || isLetterPage || isArchive;
      },
      serialize(item) {
        const p = new URL(item.url).pathname;
        const letter = p.match(/^\/letter\/([^/]+)\/$/);
        if (letter && lastmodBySlug.has(letter[1])) {
          item.lastmod = iso(lastmodBySlug.get(letter[1]));
        } else if (newest) {
          item.lastmod = iso(newest); // главная, папки, архив меняются при каждом новом письме
        }
        return item;
      },
    }),
  ],
});
