import {useState} from "react";
import type {Post} from "@rerule34/shared/types/post.ts";
import {PAGE_SIZE, PAGES_PER_BATCH} from "./usePostsPagination.ts";

export function usePagePagination(
  allPosts: Post[],
  loadedBatches: number,
  hasMore: boolean,
  loadBatch: (batchIndex: number) => void
) {
  const [page, setPage] = useState(1);
  const [maxPageReached, setMaxPageReached] = useState(1);

  const handlePageChange = (newPage: number) => {
    const requiredBatch = Math.floor((newPage - 1) / PAGES_PER_BATCH);
    if (requiredBatch >= loadedBatches && hasMore) {
      loadBatch(requiredBatch);
    }

    setPage(newPage);
    setMaxPageReached(prev => Math.max(prev, newPage)); // ключова формула
    window.scrollTo({top: 0, behavior: 'instant'});
  };

  const reset = () => {
    setPage(1);
    setMaxPageReached(1);
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
    reset,
    totalPages,
    currentPagePosts,
    viewedPostsCount,
    estimatedTotal
  };
}