import { useState } from 'react';
import {useAppStore} from "../../store/appStore.ts";
import SavedPosts from "./components/SavedPosts/SavedPosts.tsx";

import { AnimatePresence, motion } from 'motion/react';
import styles from './Collections.module.css'
import {User, Bookmark3} from "clicons-react";


const viewedRanks = {
  0: 'Larp Legend`s',
  500: 'Новачок у re:rule34',
  1000: 'Загально зацікавлений переглядом',
  2500: 'Уже шукаєш дивні теги?',
  5000: 'Просунутий переглядач контенту',
  8000: 'Думаю, ти можеш похвастатися колекцією',
  10000: 'Це уже не жарти',
  15000: 'Gooner',
  20000: 'Real Gooner',
  30000: 'True Gooner',
  50000: 'ABSOLUTE Gooner'
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

const ProfileView =
  ({userName, postViewed, onOpenSaved}: {
    userName: string;
    postViewed: number;
    onOpenSaved: () => void;
  }) => (
  <>
    <div className={styles.profile}>
      <div className={styles.profilePic}><User /></div>
      <div className={styles.profileInfo}>
        <p>@{userName}</p>
        <p>Тобою переглянуто: {postViewed} постів</p>
        <p className={styles.rank}>( {getRank(postViewed)} )</p>
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