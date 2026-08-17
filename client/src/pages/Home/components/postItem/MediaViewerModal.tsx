import React, {useEffect, useState} from "react";
import { useCollectionsStore } from "../../../../store/collectionStore";
import {getComments} from "../../../../utils/api/posts.ts";
import {formatDate} from "../../../../lib/timeFormater.ts";
import type {Comment as CommentType} from '@rerule34/shared/types/comment'

import { Modal, Button } from "antd";

import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";

import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import clsx from "clsx";

import styles from './MediaViewerModal.module.css'
import {ChevronUp, Download, Bookmark2} from "clicons-react";

export interface MediaViewerPost {
  id: number;
  file_url: string;
  sample_url?: string;
  owner?: string;
  createdAt?: string;
  score?: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  post: MediaViewerPost;
  isVideo: boolean;
  duration: number | null;
  minimal?: boolean; // тільки плеєр/зображення, без інфи, коментів і кнопки збереження
}

export default function MediaViewerModal({ isOpen, onClose, post, isVideo, duration, minimal=false }: Props) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [isTallImage, setIsTallImage] = useState(false);

  function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    const ratio = img.naturalHeight / img.naturalWidth;
    setIsTallImage(ratio >= 2);
  }

  const isSaved = useCollectionsStore(state => state.defaultSavedIds.has(post.id));
  const saveToDefault = useCollectionsStore(state => state.saveToDefault);
  const [isSaving, setIsSaving] = useState(false);

  const handleSavePost = async () => {
    if (isSaving || isSaved) return;
    setIsSaving(true);

    try {
      await saveToDefault({
        id: post.id,
        sample_url: post.sample_url,
        file_url: post.file_url,
        video_duration: duration,
      });
    } catch (e) {
      console.error('Не вдалося зберегти пост:', e);
    } finally {
      setIsSaving(false);
    }
  }


  useEffect(() => {
    if (!isOpen || minimal) return;
    let cancelled = false;

    async function fetchComments() {
      setComments([]);
      try {
        setLoading(true);
        const data = await getComments(post.id);
        if (!cancelled) {
          setComments(data)
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    void fetchComments();

    return () => {
      cancelled = true;
    };
  }, [isOpen, post.id, minimal]);



  useEffect(() => {
    async function resetTall(){
      setIsTallImage(false);
    }

    void resetTall();
  }, [post.id]);


  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width="min(1100px, 92vw)"
      rootClassName={styles.viewerModal}
      destroyOnHidden
      styles={{
        body: { padding: 0 },
      }}
    >

      <div className={clsx(styles.viewerMedia, isTallImage && styles.viewerMediaTall )}>
        {isVideo ? (
          <MediaPlayer src={post.file_url} playsInline className={styles.viewerPlayer}>
            <MediaProvider />
            <DefaultVideoLayout icons={defaultLayoutIcons} />
          </MediaPlayer>
        ) : (
          <img
            src={post.file_url}
            alt="post"
            className={clsx(styles.viewerImage, isTallImage && styles.viewerImageTall )}
            draggable={false}
            onLoad={handleImageLoad}
          />
        )}
      </div>

      {!minimal && (
        <>
          <div className={styles.viewerInfo}>

            {post.owner && (
              <div className={styles.owner}>
                <img src="/profileImgPlaceholder.png" alt="profile Image"/>
                <div>
                  <p>{post.owner}</p>
                  {post.createdAt && (
                    <p className={styles.date}>{formatDate(post.createdAt, true)}</p>
                  )}
                </div>
              </div>
            )}

            {typeof post.score === 'number' && (
              <div className={styles.stats}>
                <p><ChevronUp strokeWidth={3} /> {post.score}</p>
                <p>Оцінки</p>
              </div>
            )}

            <div className={styles.save}>
              <Bookmark2
                strokeWidth={3}
                className={clsx(isSaved && styles.saved, isSaving && styles.saving)}
                onClick={handleSavePost}
              />
            </div>

            <div className={styles.download}>
              <Button
                icon={<Download/>}
                href={post.file_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Завантажити
              </Button>
            </div>

          </div>

          <div className={styles.comments}>
            <p>Коментарі ({comments.length})</p>
            {loading ? (
              <p>Коменти грузяться...</p>
            ) : (
              comments.map((comment: CommentType) => (
                <div key={comment.id} className={styles.comment}>
                  <div className={styles.commentInfo}>
                    <p>{comment.creator}</p>
                  </div>

                  <div className={styles.commentBody}>
                    <p>{comment.body}</p>
                  </div>

                </div>
              ))
            )}
          </div>
        </>
      )}

    </Modal>
  );
};