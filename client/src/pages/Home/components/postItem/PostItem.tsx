import type { Post } from "@rerule34/shared/types/post.ts";
import { ChevronUp, PlayCircle2, Comment } from "clicons-react";
import { usePostDuration } from "../../../../utils/usePostDuration.ts";
import {useSettingsStore} from "../../../../store/settingsStore.ts";
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

function formatDate(dateString) {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

export function PostItem({ post }: { post: Post }) {
  const { duration, ref } = usePostDuration(post);

  const settings = useSettingsStore(state => state.settings);

  const isVideo = /\.(mp4|webm|mov|avi|mkv)$/i.test(post.file_url);

  return (
    <div ref={ref} className={styles.post}>
      <a href={post.file_url} target="_blank" rel="noopener noreferrer">
        <div className={styles.imgWrapper}>
        <img
          loading="lazy"
          src={post.sample_url}
          alt="post"
          className={clsx(
            isVideo && styles.isVideo,
            (settings.kittyMode && post.rating === 'explicit') && styles.kittyMode
          )}
        />
        </div>
        {(duration != null && isVideo) && (
          <span className={styles.duration}><PlayCircle2/> {formatDuration(duration)}</span>
        )}
      </a>
      <div className={styles.postStats}>
        <div className={styles.postScores}>
          <p><ChevronUp strokeWidth={3} /> {post.score}</p>
          <p><Comment size={20} strokeWidth={2.5} /> {post.comment_count}</p>
        </div>
        <div className={styles.postDate}>
          <p>{formatDate(post.createdAt)}</p>
        </div>
      </div>

    </div>
  );
}