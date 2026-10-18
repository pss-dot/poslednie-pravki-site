import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { getSortedThreads, groupThreads } from '../lib/threads';
import { TAG_LABELS } from '../lib/tags';
import { SITE_DESCRIPTION } from '../lib/about';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Короткая аннотация: первые ~200 символов чистого текста без цитат и разметки.
function summary(body: string): string {
  const plain = body
    .split('\n')
    .filter((l) => !l.trim().startsWith('>'))
    .join(' ')
    .replace(/<div class="(voice-note|attachment-broken)">[\s\S]*?<\/div>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#*_`~>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= 200) return plain;
  const cut = plain.slice(0, 200);
  const sp = cut.lastIndexOf(' ');
  return (sp > 120 ? cut.slice(0, sp) : cut).replace(/[\s,;:—–-]+$/, '') + '…';
}

export async function GET(context: APIContext) {
  const site = (context.site ?? new URL('https://poslednie-pravki.ru')).toString().replace(/\/$/, '');
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  const threads = getSortedThreads(posts).slice(0, 60);
  const groups = groupThreads(posts);

  const items = threads
    .map(({ base, latest }) => {
      const first = groups.get(base)![0];
      const subject = 'Re: '.repeat(latest.data.replyDepth) + latest.data.subject;
      const link = `${site}/letter/${base}/`;
      return `    <item>
      <title>${esc(subject)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${latest.data.date.toUTCString()}</pubDate>
      <category>${esc(TAG_LABELS[latest.data.tag] ?? latest.data.tag)}</category>
      <description>${esc(summary(first.body ?? ''))}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Последние правки</title>
    <link>${site}/</link>
    <description>${esc(SITE_DESCRIPTION)}</description>
    <language>ru-RU</language>
    <atom:link href="${site}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
