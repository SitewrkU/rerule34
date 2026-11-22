import {useEffect, useRef} from "react";
import {useAppStore} from "../../../../../store/appStore.ts";

/* Відстежує скільки нових постів "переглянуто" (viewedPostsCount) */

export function useViewedPostsTracker(viewedPostsCount: number, skipInitial = false) {
  const addPostViewed = useAppStore(s => s.addPostViewed);
  const prevViewedCountRef = useRef(skipInitial ? viewedPostsCount : 0);

  useEffect(() => {
    const delta = viewedPostsCount - prevViewedCountRef.current;
    if (delta > 0) {
      addPostViewed(delta);
      prevViewedCountRef.current = viewedPostsCount;
    }
  }, [viewedPostsCount, addPostViewed]);

  const reset = () => {
    prevViewedCountRef.current = 0;
  };

  return {reset};
}