import {useState} from "react";
import type { Post } from "@rerule34/shared/types/post.ts";
import {usePostDuration} from "../../../../utils/usePostDuration.ts";
import {useSettingsStore} from "../../../../store/settingsStore.ts";
import {useLongPressPreview} from "../../../../utils/useLongPressPreview.ts";
import {ImagePreviewOverlay} from "./ImagePreviewOverlay.tsx";
import MediaViewerModal from "./MediaViewerModal.tsx";
import {formatDate} from "../../../../lib/dateFormater.ts";

import { ChevronUp, PlayCircle2, Comment } from "clicons-react";
import clsx from "clsx";
import styles from './PostItem.module.css';

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  if (m > 0){
    return `${m}хв`
  }else{
    return `${s}сек`
  }
}


export function PostItem({ post }: { post: Post }) {
  const { duration, ref } = usePostDuration(post);
  const settings = useSettingsStore(state => state.settings);
  const isVideo = /\.(mp4|webm|mov|avi|mkv)$/i.test(post.file_url);

  const { isPreviewOpen, handlers } = useLongPressPreview();
  const { onClick: onLongPressClick, ...pressHandlers } = handlers;
  const [isViewerOpen, setViewerOpen] = useState(false);

  return (
    <div
      ref={ref}
      className={styles.post}
    >
      <a
        href={post.file_url}
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        {...pressHandlers}
        onClick={(e) => {
          onLongPressClick(e);
          if (e.defaultPrevented) return;
          e.preventDefault();
          setViewerOpen(true);
        }}
      >
        <div className={styles.imgWrapper}>
        <img
          loading="lazy"
          src={post.sample_url}
          alt="post"
          draggable={false}
          className={clsx(
            isVideo && styles.isVideo,
            (settings.kittyMode && post.rating === 'explicit') && styles.kittyMode,
            settings.blackMode && styles.blackMode
          )}
        />
        </div>
        {(duration != null && isVideo) && (
          <span className={styles.duration}><PlayCircle2/> {formatDuration(duration)}</span>
        )}
      </a>

      {settings.showPostInfo && (
      <div className={styles.postStats}>
        <div className={styles.postScores}>
          <p><ChevronUp strokeWidth={3} /> {post.score}</p>
          <p><Comment size={20} strokeWidth={2.5} /> {post.comment_count}</p>
        </div>
        <div className={styles.postDate}>
          <p>{formatDate(post.createdAt)}</p>
        </div>
      </div>
      )}



      <ImagePreviewOverlay src={post.sample_url} isOpen={isPreviewOpen} />

      <MediaViewerModal
        isOpen={isViewerOpen}
        onClose={() => setViewerOpen(false)}
        post={post}
        isVideo={isVideo}
      />

    </div>
  );
}