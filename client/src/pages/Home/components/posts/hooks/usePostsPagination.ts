import { useCallback, useState } from "react";
import { useHomePostsStore } from "../../../../../store/homePostsStore.ts";

export {
  PAGE_SIZE,
  PAGES_PER_BATCH,
  BATCH_SIZE,
} from "../../../../../store/homePostsStore.ts";

export function usePostsPagination(query: string) {
  const allPosts = useHomePostsStore((s) => s.allPosts);
  const loadedBatches = useHomePostsStore((s) => s.loadedBatches);
  const hasMore = useHomePostsStore((s) => s.hasMore);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBatch = useCallback(
    async (batchIndex: number) => {
      setLoading(true);
      setError(null);

      try {
        await useHomePostsStore.getState().loadBatch(query, batchIndex);
      } catch (e) {
        console.error("Помилка при завантаженні постів:", e);
        setError("Не вдалося завантажити пости. Спробуйте ще раз.");
      } finally {
        setLoading(false);
      }
    },
    [query]
  );

  return { allPosts, loadedBatches, hasMore, loading, error, loadBatch };
}
