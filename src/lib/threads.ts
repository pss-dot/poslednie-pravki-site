import type { CollectionEntry } from 'astro:content';

// Reply-chain files are named with a "re-" prefix repeated once per reply
// depth (re-slug, re-re-slug, ...). Stripping those prefixes gives the
// slug of the thread's original (depth-0) letter, which we use as a stable
// id to group a whole conversation together.
export function threadBase(id: string): string {
  return id.replace(/^(re-)+/, '');
}

// Groups posts into threads keyed by threadBase(id), each thread's members
// sorted oldest-first (by replyDepth). Map iteration order follows the
// order posts were first encountered, so callers that need a specific sort
// (e.g. by latest message date) should re-sort the returned values.
export function groupThreads(
  posts: CollectionEntry<'posts'>[]
): Map<string, CollectionEntry<'posts'>[]> {
  const groups = new Map<string, CollectionEntry<'posts'>[]>();
  for (const post of posts) {
    const base = threadBase(post.id);
    const list = groups.get(base);
    if (list) {
      list.push(post);
    } else {
      groups.set(base, [post]);
    }
  }
  for (const members of groups.values()) {
    members.sort((a, b) => a.data.replyDepth - b.data.replyDepth);
  }
  return groups;
}

export interface ThreadSummary {
  base: string;
  latest: CollectionEntry<'posts'>;
  count: number;
}

// Groups posts into threads and returns them as a flat array, newest first
// (by the date of the latest message in each thread). This is the shape
// every listing page (index, tag pages, and their paginated variants) needs.
export function getSortedThreads(posts: CollectionEntry<'posts'>[]): ThreadSummary[] {
  const threads = Array.from(groupThreads(posts).values()).map((members) => ({
    base: members[0].id,
    latest: members[members.length - 1],
    count: members.length,
  }));
  threads.sort((a, b) => b.latest.data.date.valueOf() - a.latest.data.date.valueOf());
  return threads;
}
