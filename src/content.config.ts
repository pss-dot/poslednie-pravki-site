import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    subject: z.string(),
    from: z.string(),
    to: z.string().default('info@poslednie-pravki.ru'),
    date: z.coerce.date(),
    tag: z.enum(['rassylka', 'avtory', 'perepiska', 'poslednie-pravki']),
    // How many "Re: " prefixes to show before the subject — 0 for a fresh
    // letter, 1+ for a reply in a thread (2 = "Re: Re: тема", etc).
    replyDepth: z.number().int().min(0).default(0),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
