import ffmpeg from 'fluent-ffmpeg';
import ffprobeStatic from 'ffprobe-static';
import { LRUCache } from 'lru-cache';

ffmpeg.setFfprobePath(ffprobeStatic.path);

const VIDEO_EXT = /\.(mp4|webm|mov|avi|mkv)$/i;


type DurationEntry = { duration: number | null };

export const durationCache = new LRUCache<string, DurationEntry>({
  max: 5000,
  ttl: 1000 * 60 * 60 * 24, // 24 год
});


export function isVideoUrl(url: string) {
  return VIDEO_EXT.test(url);
}

export function getDuration(fileUrl: string, timeoutMs = 10000): Promise<number | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), timeoutMs);
    ffmpeg.ffprobe(fileUrl, (err, metadata) => {
      clearTimeout(timer);
      if (err) {
        console.error('ffprobe error:', fileUrl, err.message);
        return resolve(null);
      }
      resolve(metadata.format.duration ?? null);
    });
  });
}

// обмежує паралелізм воркерів
export async function enrichWithDuration<T extends { id: string | number; file_url: string }>(
  posts: T[],
  concurrency = 4
): Promise<(T & { duration?: number | null })[]> {
  const results: (T & { duration?: number | null })[] = [...posts] as any;
  let index = 0;

  async function worker() {
    while (index < posts.length) {
      const i = index++;
      const post = posts[i];

      if (!isVideoUrl(post.file_url)) {
        results[i] = { ...post, duration: null };
        continue;
      }

      const key = String(post.id);
      const cached = durationCache.get(key);
      if (cached) {
        results[i] = { ...post, duration: cached.duration };
        continue;
      }

      const duration = await getDuration(post.file_url);
      durationCache.set(key, { duration });
      results[i] = { ...post, duration };
    }
  }

  const workers = Array.from({ length: concurrency }, worker);
  await Promise.all(workers);
  return results;
}