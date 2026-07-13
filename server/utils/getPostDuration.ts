import ffmpeg from 'fluent-ffmpeg';
import ffprobeStatic from 'ffprobe-static';

ffmpeg.setFfprobePath(ffprobeStatic.path);

const VIDEO_EXT = /\.(mp4|webm|mov|avi|mkv)$/i;

export const durationCache = new Map<string | number, number | null>();

export function isVideoUrl(url: string) {
  return VIDEO_EXT.test(url);
}

export function getDuration(fileUrl: string): Promise<number | null> {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(fileUrl, (err, metadata) => {
      if (err) {
        console.error('ffprobe error:', fileUrl, err.message);
        return resolve(null);
      }
      resolve(metadata.format.duration ?? null);
    });
  });
}

// обмежує паралелізм
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

      if (!isVideoUrl(post.file_url)) continue;

      if (durationCache.has(post.id)) {
        results[i] = { ...post, duration: durationCache.get(post.id) };
        continue;
      }

      const duration = await getDuration(post.file_url);
      durationCache.set(post.id, duration);
      results[i] = { ...post, duration };
    }
  }

  const workers = Array.from({ length: concurrency }, worker);
  await Promise.all(workers);
  return results;
}