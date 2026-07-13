import { useEffect, useRef, useState } from "react";
import { api } from "../utils/api.ts";
import type { Post } from "@rerule34/shared/types/post.ts";

export function usePostDuration(post: Post) {
  const [duration, setDuration] = useState(post.duration);
  const ref = useRef<HTMLDivElement>(null);
  const fetched = useRef(false);

  const isVideo = /\.(mp4|webm|mov|avi|mkv)$/i.test(post.file_url);

  useEffect(() => {
    if (!isVideo || duration != null || fetched.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fetched.current) {
          fetched.current = true;
          api.get(`/posts/${post.id}/duration`, { params: { file_url: post.file_url } })
            .then(({ data }) => setDuration(data.duration));
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [post.id]);

  return { duration, ref };
}