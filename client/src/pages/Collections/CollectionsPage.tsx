import { useState } from 'react';
import {useAppStore} from "../../store/appStore.ts";
import {useCollectionsStore} from "../../store/collectionStore.ts";
import {pluralizePosts} from "../../lib/pluralizePosts.ts";
import SavedPosts from "./components/SavedPosts/SavedPosts.tsx";

import { AnimatePresence, motion } from 'motion/react';
import styles from './Collections.module.css'
import {User, Bookmark3, View, Calendar3, Crown3, ChevronRight} from "clicons-react";
import BackButton from "../../ui/BackButton/BackButton.tsx";

const viewedRanks: Record<number, string> = {
  0: 'Ларпер',
  250: 'Новачок',
  500: 'Учень-початківець',
  1000: 'Учень',
  2500: 'Завсідник',
  5000: 'Дослідник',
  7500: 'Знавець',
  10000: 'Експерт',
  15000: 'Ветеран',
  20000: 'Майстер',
  30000: 'Гуру',
  40000: 'Легенда',
  50000: 'True Gooner'
}

const sortedThresholds = Object.keys(viewedRanks)
  .map(Number)
  .sort((a, b) => b - a);

function getRank(postViewed: number): string {
  const threshold = sortedThresholds.find(t => postViewed >= t);
  return viewedRanks[threshold ?? 0];
}

type ViewMode = 'profile' | 'saved';

const slideVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 40 : -40,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -40 : 40,
  }),
};

const CollectionsPage = () => {
  const userName = useAppStore(s => s.userName);
  const postViewed = useAppStore(s => s.postViewed);
  const joinedAt = useAppStore(s => s.joinedAt)
  const savedCount = useCollectionsStore(
    s => s.collections.find(c => c.isDefault)?.posts.length ?? 0
  );
  const collectionsLoaded = useCollectionsStore(s => s.fetched);


  const [view, setView] = useState<ViewMode>('profile');
  const [direction, setDirection] = useState(1); // Для анімацій, 1 = вперед, -1 = назад

  const goTo = (next: ViewMode, dir: number) => {
    setDirection(dir);
    setView(next);
  };

  return (
    <div className={styles.page}>
      <BackButton
        {...(view === 'saved'
          ? { onBack: () => goTo('profile', -1) }
          : { navigateTo: '/' })}
      />

      <AnimatePresence mode="wait" custom={direction} initial={false}>
        {view === 'profile' && (
          <motion.div
            key="profile"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <ProfileView
              userName={userName}
              postViewed={postViewed}
              joinedAt={joinedAt}
              savedCount={savedCount}
              collectionsLoaded={collectionsLoaded}
              onOpenSaved={() => goTo('saved', 1)}
            />
          </motion.div>
        )}

        {view === 'saved' && (
          <motion.div
            key="saved"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <SavedPosts/>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const formatDate = (date: number) => {
  return new Date(date).toLocaleDateString('en-CA').replace(/-/g, '.');
}

const ProfileView =
  ({userName, postViewed, joinedAt, savedCount, collectionsLoaded, onOpenSaved}: {
    userName: string;
    postViewed: number;
    joinedAt: number | null;
    savedCount: number;
    collectionsLoaded: boolean;
    onOpenSaved: () => void;
  }) => (
  <>
    <div className={styles.profile}>
      <div className={styles.profileHeader}>
        <div className={styles.profilePic}><User /></div>

        <div className={styles.identity}>
          <p className={styles.userName}>@{userName}</p>
          <p className={styles.rank}><Crown3/> {getRank(postViewed)}</p>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statIcon}><View/></span>
          <span className={styles.statBody}>
            <strong className={styles.statValue}>{postViewed.toLocaleString('uk-UA')}</strong>
            <small className={styles.statLabel}>прогорнуто постів</small>
          </span>
        </div>

        <div className={styles.stat}>
          <span className={styles.statIcon}><Calendar3/></span>
          <span className={styles.statBody}>
            <strong className={styles.statValue}>
              {joinedAt !== null ? formatDate(joinedAt) : "—"}
            </strong>
            <small className={styles.statLabel}>ми побачили тебе вперше</small>
          </span>
        </div>
      </div>
    </div>

    <div className={styles.actions}>
      <button type="button" className={styles.savedButton} onClick={onOpenSaved}>
        <span className={styles.savedIcon}><Bookmark3/></span>

        <span className={styles.savedText}>
          <strong>Збережені пости</strong>
          <small>
            {collectionsLoaded
              ? `${savedCount} ${pluralizePosts(savedCount)}`
              : 'Твоя колекція'}
          </small>
        </span>

        <ChevronRight className={styles.savedChevron}/>
      </button>
    </div>
  </>
)


export default CollectionsPage;