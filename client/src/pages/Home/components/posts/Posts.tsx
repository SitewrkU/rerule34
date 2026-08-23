import {useLayoutEffect} from "react";
import {useSearchStore} from "../../../../store/searchStore.ts";
import {useSettingsStore} from "../../../../store/settingsStore.ts";
import {useSearchQuery} from "../../../../utils/useSearchQuery.ts";

import {usePostsPagination} from "./hooks/usePostsPagination.ts";
import {usePagePagination} from "./hooks/usePagePagination.ts";
import {useViewedPostsTracker} from "./hooks/useViewedPostsTracker.ts";

import {PostsHeader} from "./components/PostsHeader.tsx";
import {PostsGrid} from "./components/PostsGrid.tsx";
import {PostsPagination} from "./components/PostsPagination.tsx";
import {PostsEmptyState} from "./components/PostsEmptyState.tsx";
import {PostsErrorState} from "./components/PostsErrorState.tsx";
import {SiteInfo} from "./components/SiteInfo.tsx";


import {LoadingSpinner} from "../../../../ui/LoadingSpinner/LoadingSpinner.tsx";

import styles from './Posts.module.css';

const Posts = () => {
  const SearchBarParams = useSearchStore((state) => state.params);
  const searchTrigger = useSearchStore((state) => state.searchTrigger);
  const hasSearched = useSearchStore((state) => state.hasSearched);
  const resetParams = useSearchStore((state) => state.resetParams);
  const settings = useSettingsStore((state) => state.settings);
  const query = useSearchQuery();

  const {allPosts, loadedBatches, hasMore, loading, error, loadBatch, reset: resetPosts} =
    usePostsPagination(query);

  const {
    page,
    handlePageChange,
    reset: resetPage,
    totalPages,
    currentPagePosts,
    viewedPostsCount,
    estimatedTotal
  } = usePagePagination(allPosts, loadedBatches, hasMore, loadBatch);

  const {reset: resetViewedTracker} = useViewedPostsTracker(viewedPostsCount);


  useLayoutEffect(() => {
    resetPosts();
    resetPage();
    resetViewedTracker();
    if (hasSearched) {
      void loadBatch(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTrigger]);

  const handleClearClick = () => {
    resetParams();
  };

  // Якщо немає активного пошуку, то інфо по сайту
  if (!hasSearched && allPosts.length === 0) {
    return <SiteInfo/>;
  }

  // Пошук є, але постів ще нема
  if (allPosts.length === 0) {
    if (error) {
      return <PostsErrorState error={error} onRetry={() => loadBatch(0)}/>;
    }
    if (loading) {
      return <LoadingSpinner/>;
    }
    return <PostsEmptyState searchTags={SearchBarParams.tags} onClear={handleClearClick}/>;
  }

  // ПОСТИ
  return (
    <div>
      <PostsHeader
        viewedPostsCount={viewedPostsCount}
        searchTags={SearchBarParams.tags}
        onClear={handleClearClick}
      />

      {(settings.paginationOnTop && !loading) && (
        <PostsPagination
          page={page}
          total={estimatedTotal}
          loading={loading}
          paginationPos={settings.paginationPos}
          onChange={handlePageChange}
        />
      )}

      <PostsGrid posts={currentPagePosts}/>

      {!hasMore && page === totalPages && (
        <p className={styles.endofpostsText}>
          Не видно потрібного поста? Спробуй вимкнути свій <b>блек-ліст</b>, можливо, він вирізав пости.
          Або <b>в пошук відправився не повний запит</b>, перевір і його.
        </p>
      )}

      {!loading ? (
        <PostsPagination
          page={page}
          total={estimatedTotal}
          loading={loading}
          paginationPos={settings.paginationPos}
          onChange={handlePageChange}
        />
      ) : (
        <LoadingSpinner/>
      )}
    </div>
  );
};

export default Posts;