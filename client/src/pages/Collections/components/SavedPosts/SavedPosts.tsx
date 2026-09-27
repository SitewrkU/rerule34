import {useState} from "react";
import type {CollectionPost} from '@rerule34/shared/types/collection.ts'
import {useCollectionsStore} from "../../../../store/collectionStore.ts";
import MediaViewerModal from "../../../Home/components/postItem/MediaViewerModal.tsx";

import {formatDuration} from "../../../../lib/timeFormater.ts";

import clsx from "clsx";
import styles from './SavedPosts.module.css'

const SavedPosts = () => {
  const collections = useCollectionsStore(s => s.collections);
  const loading = useCollectionsStore(s => s.loading);

  const [viewerPost, setViewerPost] = useState<CollectionPost | null>(null);

  const defaultCollection = collections.find(c => c.isDefault);
  const savedPosts = defaultCollection?.posts ?? [];

  return (
    <div>
      <div className={styles.savedHeader}>
        <p className={styles.savedTitle}>Збережені пости</p>
      </div>

      <div className={styles.posts}>
        {loading && <p>Завантаження...</p>}
        {!loading && savedPosts.length === 0 && <p>Поки що нічого не збережено</p>}
        {!loading && savedPosts.map(post => (
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