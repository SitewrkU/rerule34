import type { Post } from "@rerule34/shared/types/post.ts";
import { useHomePostsStore } from "../../../../../store/homePostsStore.ts";
import { PAGE_SIZE, PAGES_PER_BATCH } from "./usePostsPagination.ts";

export function usePagePagination(
  tabId: string,
  allPosts: Post[],
  loadedBatches: number,
  hasMore: boolean,
  loadBatch: (batchIndex: number) => void
) {
  const page = useHomePostsStore((s) => s.caches[tabId]?.page ?? 1);
  const maxPageReached = useHomePostsStore(
    (s) => s.caches[tabId]?.maxPageReached ?? 1
  );
  const setPage = useHomePostsStore((s) => s.setPage);

  const handlePageChange = (newPage: number) => {
    const requiredBatch = Math.floor((newPage - 1) / PAGES_PER_BATCH);
    if (requiredBatch >= loadedBatches && hasMore) {
      loadBatch(requiredBatch);
    }

    setPage(tabId, newPage);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const totalPages = Math.ceil(allPosts.length / PAGE_SIZE);
  const currentPagePosts = allPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const viewedPostsCount = Math.min(maxPageReached * PAGE_SIZE, allPosts.length);

  // приблизний total те, що вже точно є + запас якщо hasMore
  const estimatedTotal = hasMore ? allPosts.length + PAGE_SIZE : allPosts.length;

  return {
    page,
    maxPageReached,
    handlePageChange,
    totalPages,
    currentPagePosts,
    viewedPostsCount,
    estimatedTotal,
  };
}
