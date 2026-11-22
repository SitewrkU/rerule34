import {useLayoutEffect} from "react";
import {useSearchStore} from "../../../../store/searchStore.ts";
import {useSettingsStore} from "../../../../store/settingsStore.ts";
import {useHomePostsStore} from "../../../../store/homePostsStore.ts";
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

  // Чи повернулися ми на Home з уже завантаженими постами
  const wasRestored = useHomePostsStore(
    (state) =>
      state.query === query &&
      state.handledSearchTrigger === searchTrigger &&
      state.allPosts.length > 0
  );

  const {allPosts, loadedBatches, hasMore, loading, error, loadBatch} =
    usePostsPagination(query);

  const {
    page,
    handlePageChange,
    totalPages,
    currentPagePosts,
    viewedPostsCount,
    estimatedTotal
  } = usePagePagination(allPosts, loadedBatches, hasMore, loadBatch);

  const {reset: resetViewedTracker} = useViewedPostsTracker(viewedPostsCount, wasRestored);


  useLayoutEffect(() => {
    const shouldLoad = useHomePostsStore
      .getState()
      .beginSearch(query, searchTrigger, hasSearched);

    if (!wasRestored) {
      resetViewedTracker();
      window.scrollTo({top: 0, behavior: 'instant'});
    }

    if (shouldLoad) {
      void loadBatch(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTrigger]);

  // Повертаємо користувача на те місце, де він зупинився
  useLayoutEffect(() => {
    if (!wasRestored) return;

    const y = useHomePostsStore.getState().scrollY;
    if (y > 0) {
      window.scrollTo({top: y, behavior: 'instant'});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Запам'ятовуємо позицію скролу для наступного повернення.
  // Саме layout-ефект: його cleanup виконується до видалення DOM, тому scrollY
  // не встигає скинутись через коротшу сторінку, на яку ми переходимо.
  useLayoutEffect(() => {
    const handleScroll = () => {
      useHomePostsStore.getState().setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, {passive: true});

    return () => {
      handleScroll();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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