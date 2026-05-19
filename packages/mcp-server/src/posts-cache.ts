/**
 * Persistent post-metadata cache.
 *
 * Aula's `posts.getAllPosts` endpoint won't return posts the user has
 * already read (every call advances `profileLastSeenPostDate` to now).
 * `notifications.list` only contains *unread* badges, so once a guardian
 * opens the Aula app the post drops off both endpoints.
 *
 * To keep the daily digest useful, we observe posts while they're still
 * visible in `notifications.list` and persist them on disk. Subsequent
 * digest runs merge the cache so even already-read posts appear.
 *
 * The cache is plain JSON (no encryption — these are post titles, not
 * tokens). Entries past the retention window are pruned on every write.
 */

import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export interface CachedPost {
  postId: number;
  title: string;
  /** ISO-8601 timestamp the post was published (from `triggered` in notifications). */
  triggered: string;
  institutionProfileId?: number;
  institutionCode?: string;
  /** ISO-8601 timestamp we last observed this post in notifications.list. */
  observedAt: string;
}

interface PostsCacheFile {
  version: 1;
  posts: Record<string, CachedPost>;
}

const RETENTION_DAYS = 30;

/** Persist posts seen via notifications so they survive read-status mutation. */
export class PostsCache {
  private cache: PostsCacheFile = { version: 1, posts: {} };
  private loaded = false;

  constructor(private readonly filePath: string) {}

  async load(): Promise<void> {
    if (this.loaded) return;
    this.loaded = true;
    if (!existsSync(this.filePath)) return;
    try {
      const raw = await readFile(this.filePath, 'utf-8');
      const parsed = JSON.parse(raw) as PostsCacheFile;
      if (parsed?.version === 1 && parsed.posts) {
        this.cache = parsed;
      }
    } catch {
      // Corrupt cache → start fresh. The post-metadata loss is recoverable
      // (next notifications.list will repopulate).
    }
  }

  /** Upsert post entries from a notifications.list response. Returns number added or updated. */
  observeNotifications(notifs: unknown): number {
    if (!Array.isArray(notifs)) return 0;
    const now = new Date().toISOString();
    let touched = 0;
    for (const n of notifs as Array<Record<string, unknown>>) {
      if (n.notificationArea !== 'Posts') continue;
      const postId = typeof n.postId === 'number' ? n.postId : null;
      const title = typeof n.postTitle === 'string' ? n.postTitle : null;
      const triggered = typeof n.triggered === 'string' ? n.triggered : null;
      if (postId === null || !title || !triggered) continue;
      const key = String(postId);
      const entry: CachedPost = {
        postId,
        title,
        triggered,
        observedAt: now,
      };
      if (typeof n.institutionProfileId === 'number') {
        entry.institutionProfileId = n.institutionProfileId;
      }
      if (typeof n.institutionCode === 'string') {
        entry.institutionCode = n.institutionCode;
      }
      this.cache.posts[key] = entry;
      touched++;
    }
    return touched;
  }

  /** Return cached posts within the last `withinDays` (by `triggered` timestamp), newest first. */
  list(withinDays: number): CachedPost[] {
    const cutoff = Date.now() - withinDays * 24 * 60 * 60 * 1000;
    return Object.values(this.cache.posts)
      .filter((p) => Date.parse(p.triggered) >= cutoff)
      .sort((a, b) => Date.parse(b.triggered) - Date.parse(a.triggered));
  }

  /** Drop entries past the retention window, then write to disk. */
  async save(): Promise<void> {
    const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
    for (const [k, p] of Object.entries(this.cache.posts)) {
      if (Date.parse(p.triggered) < cutoff) delete this.cache.posts[k];
    }
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(this.cache, null, 2), 'utf-8');
  }

  /** Total cached entries (for diagnostics). */
  get size(): number {
    return Object.keys(this.cache.posts).length;
  }
}
