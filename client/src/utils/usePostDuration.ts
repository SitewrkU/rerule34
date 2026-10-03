import { useEffect, useRef, useState } from "react";
import { api } from "./api/api.ts";
import type { Post } from "@rerule34/shared/types/post.ts";

export function usePostDuration(post: Post, enabled = true) {
  const [duration, setDuration] = useState<number | null>(post.duration ?? null);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const fetched = useRef(false);

  const isVideo = /\.(mp4|webm|mov|avi|mkv)$/i.test(post.file_url);

  useEffect(() => {
    if (!enabled) return;
    if (!isVideo || duration != null || fetched.current) return;

    let cancelled = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || fetched.current) return;

        fetched.current = true;
        observer.disconnect();

        api
          .get(`/posts/${post.id}/duration`, {
            params: { file_url: post.file_url },
            timeout: 60000, // більше, ніж час у черзі + 30 с ffprobe на бекенді
          })
          .then(({ data }) => {
            if (cancelled) return;
            if (data.duration != null) setDuration(data.duration);
            else setFailed(true);
          })
          .catch(() => {
            if (cancelled) return;
            setFailed(true);
            fetched.current = false; // дозволити повтор при наступному вході у вʼюпорт
          });
      },
      { rootMargin: "200px" }
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [post.id, post.file_url, enabled, isVideo, duration]);

  return { duration, failed, ref };
}