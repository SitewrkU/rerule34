import { useState } from 'react';
import {useAppStore} from "../../store/appStore.ts";
import SavedPosts from "./components/SavedPosts/SavedPosts.tsx";

import { AnimatePresence, motion } from 'motion/react';
import styles from './Collections.module.css'
import {User, Bookmark3, View, Calendar3, Crown3} from "clicons-react";

const viewedRanks = {
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

  const [view, setView] = useState<ViewMode>('profile');
  const [direction, setDirection] = useState(1); // Для анімацій, 1 = вперед, -1 = назад

  const goTo = (next: ViewMode, dir: number) => {
    setDirection(dir);
    setView(next);
  };

  return (
    <div className={styles.page}>
      <AnimatePresence mode="wait" custom={direction}>
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
            <SavedPosts
              onBack={() => goTo('profile', -1)}
            />
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
  ({userName, postViewed, joinedAt, onOpenSaved}: {
    userName: string;
    postViewed: number;
    joinedAt: number;
    onOpenSaved: () => void;
  }) => (
  <>
    <div className={styles.profile}>
      <div className={styles.userName}>
        <p>@{userName}</p>
      </div>

      <div className={styles.mainInfo}>
      <div className={styles.profilePic}><User /></div>
      <div className={styles.profileInfo}>

        <p className={styles.rank}><Crown3/> {getRank(postViewed)} </p>
        <p className={styles.stat}><span><View/>{postViewed}</span> прогорнуто постів</p>
        <p className={styles.stat}><span><Calendar3/>{formatDate(joinedAt)}</span> ми побачили тебе вперше</p>
      </div>
      </div>
    </div>

    <div className={styles.actions}>
      <button className={styles.savedButton} onClick={onOpenSaved}>
        <Bookmark3/>
      </button>
    </div>
  </>
)


export default CollectionsPage;