import {useCallback, useState} from "react";
import type {Post} from "@rerule34/shared/types/post.ts";
import { getPosts } from "../../../../../utils/api/posts.ts";

const PAGE_SIZE = 30; // постів на одну сторінку
const PAGES_PER_BATCH = 3; // к-ть сторінок які тягнуться за запит
const BATCH_SIZE = PAGE_SIZE * PAGES_PER_BATCH; // для апі, скільки всього треба повернути

export {PAGE_SIZE, PAGES_PER_BATCH, BATCH_SIZE};

export function usePostsPagination(query: string) {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loadedBatches, setLoadedBatches] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBatch = useCallback(async (batchIndex: number) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getPosts({
        tags: query,
        limit: BATCH_SIZE,
        pid: batchIndex
      });

      setAllPosts(prev => batchIndex === 0 ? data : [...prev, ...data]);
      setHasMore(data.length === BATCH_SIZE); // чек чи не прийшло менше, якщо прийшло то кінець
      setLoadedBatches(batchIndex + 1);
    } catch (e) {
      console.error('Помилка при завантаженні постів:', e);
      setError('Не вдалося завантажити пости. Спробуйте ще раз.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  const reset = useCallback(() => {
    setAllPosts([]);
    setLoadedBatches(0);
    setHasMore(true);
    setError(null);
  }, []);

  return { allPosts, loadedBatches, hasMore, loading, error, loadBatch, reset };
}