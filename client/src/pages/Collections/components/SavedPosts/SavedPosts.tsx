import {useState} from "react";
import type {CollectionPost} from '@rerule34/shared/types/collection.ts'
import {useCollectionsStore} from "../../../../store/collectionStore.ts";
import MediaViewerModal from "../../../Home/components/postItem/MediaViewerModal.tsx";

import {formatDuration} from "../../../../lib/timeFormater.ts";
import {pluralizePosts} from "../../../../lib/pluralizePosts.ts";

import clsx from "clsx";
import styles from './SavedPosts.module.css'

const SavedPosts = () => {
  const collections = useCollectionsStore(s => s.collections);
  const loading = useCollectionsStore(s => s.loading);
  const fetched = useCollectionsStore(s => s.fetched);
  const error = useCollectionsStore(s => s.error);
  const fetchCollections = useCollectionsStore(s => s.fetchCollections);

  const [viewerPost, setViewerPost] = useState<CollectionPost | null>(null);

  const defaultCollection = collections.find(c => c.isDefault);
  const savedPosts = defaultCollection?.posts ?? [];

  const isLoading = loading || !fetched;

  return (
    <div>
      <div className={styles.savedHeader}>
        <p className={styles.savedTitle}>Збережені пости</p>
        {!isLoading && savedPosts.length > 0 && (
          <p className={styles.savedCount}>
            {savedPosts.length} {pluralizePosts(savedPosts.length)}
          </p>
        )}
      </div>

      <div className={styles.posts}>
        {error && !fetched && (
          <div className={styles.error}>
            <p>{error}</p>
            <button
              type="button"
              className={styles.retryButton}
              onClick={() => void fetchCollections().catch(() => {})}
            >
              Спробувати ще раз
            </button>
          </div>
        )}
        {!error && isLoading && <p className={styles.status}>Завантаження...</p>}
        {!error && !isLoading && savedPosts.length === 0 && (
          <p className={styles.status}>Поки що нічого не збережено</p>
        )}
        {!error && !isLoading && savedPosts.map(post => (
          <div key={post.id} className={styles.post} >
            <a
              href={post.file_url}
              draggable={false}
              onClick={(e) => {
                e.preventDefault();
                setViewerPost(post);
              }}
            >
              <div className={styles.imgWrapper}>
                <img
                  loading="lazy"
                  src={post.sample_url}
                  alt="post"
                  draggable={false}
                  className={clsx(
                    post.video_duration && styles.isVideo
                  )}
                />
              </div>
              {post.video_duration && (
                <p className={styles.duration}>{formatDuration(post.video_duration)}</p>
              )}
            </a>
          </div>
        ))}
      </div>

      {viewerPost && (
        <MediaViewerModal
          isOpen={!!viewerPost}
          onClose={() => setViewerPost(null)}
          post={viewerPost}
          isVideo={viewerPost.video_duration != null}
          duration={viewerPost.video_duration}
          minimal
        />
      )}
    </div>
  );
};

export default SavedPosts;