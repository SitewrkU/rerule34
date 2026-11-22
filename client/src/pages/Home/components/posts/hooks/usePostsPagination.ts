import { useCallback, useState } from "react";
import {
  EMPTY_POSTS,
  useHomePostsStore,
} from "../../../../../store/homePostsStore.ts";

export {
  PAGE_SIZE,
  PAGES_PER_BATCH,
  BATCH_SIZE,
} from "../../../../../store/homePostsStore.ts";

export function usePostsPagination(tabId: string, query: string) {
  const allPosts = useHomePostsStore(
    (s) => s.caches[tabId]?.allPosts ?? EMPTY_POSTS
  );
  const loadedBatches = useHomePostsStore(
    (s) => s.caches[tabId]?.loadedBatches ?? 0
  );
  const hasMore = useHomePostsStore(
    (s) => s.caches[tabId]?.hasMore ?? true
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBatch = useCallback(
    async (batchIndex: number) => {
      setLoading(true);
      setError(null);

      try {
        await useHomePostsStore
          .getState()
          .loadBatch(tabId, query, batchIndex);
      } catch (e) {
        console.error("Помилка при завантаженні постів:", e);
        setError("Не вдалося завантажити пости. Спробуйте ще раз.");
      } finally {
        setLoading(false);
      }
    },
    [tabId, query]
  );

  return { allPosts, loadedBatches, hasMore, loading, error, loadBatch };
}
