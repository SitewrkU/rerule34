import { execFile } from 'node:child_process';
import ffprobeStatic from 'ffprobe-static';
import { LRUCache } from 'lru-cache';

const VIDEO_EXT = /\.(mp4|webm|mov|avi|mkv)$/i;

export function isVideoUrl(url: string) {
  return VIDEO_EXT.test(url);
}

// Успішні результати: 24 год
export const durationCache = new LRUCache<string, { duration: number }>({
  max: 5000,
  ttl: 1000 * 60 * 60 * 24,
});

// Невдачі: 5 хв, щоб не довбати CDN постійно
const failedCache = new LRUCache<string, true>({
  max: 5000,
  ttl: 1000 * 60 * 5,
});

// Один і той самий пост не рахуємо двічі паралельно
const inflight = new Map<string, Promise<number | null>>();

const MAX_CONCURRENT = 16;
let active = 0;
const queue: Array<() => void> = [];

function runLimited<T>(task: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const run = () => {
      active++;
      task()
        .then(resolve, reject)
        .finally(() => {
          active--;
          queue.shift()?.();
        });
    };
    if (active < MAX_CONCURRENT) run();
    else queue.push(run);
  });
}

function probe(fileUrl: string, timeoutMs = 30000): Promise<number | null> {
  return new Promise((resolve) => {
    execFile(
      ffprobeStatic.path,
      ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', fileUrl],
      { timeout: timeoutMs, killSignal: 'SIGKILL' }, // реально вбиває процес
      (err, stdout) => {
        if (err) {
          console.error('ffprobe error:', fileUrl, err.message);
          return resolve(null);
        }
        const n = parseFloat(stdout);
        resolve(Number.isFinite(n) ? n : null);
      }
    );
  });
}

export function getDuration(id: string, fileUrl: string): Promise<number | null> {
  const cached = durationCache.get(id);
  if (cached) return Promise.resolve(cached.duration);

  if (failedCache.has(id)) return Promise.resolve(null);

  let p = inflight.get(id);
  if (!p) {
    p = runLimited(() => probe(fileUrl))
      .then((d) => {
        if (d != null) durationCache.set(id, { duration: d });
        else failedCache.set(id, true);
        return d;
      })
      .finally(() => inflight.delete(id));
    inflight.set(id, p);
  }
  return p;
}

// UNUSED
export async function enrichWithDuration<T extends { id: string | number; file_url: string }>(
  posts: T[]
): Promise<(T & { duration?: number | null })[]> {
  return Promise.all(
    posts.map(async (post) => {
      if (!isVideoUrl(post.file_url)) return { ...post, duration: null };
      const duration = await getDuration(String(post.id), post.file_url);
      return { ...post, duration };
    })
  );
}