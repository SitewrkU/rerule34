import { motion, AnimatePresence } from "motion/react";
import { Hourglass } from "clicons-react";
import styles from './LoadingSpinner.module.css';

export const LoadingSpinner = () => (
  <div className={styles.loadingContainer}>
    <AnimatePresence>
      <motion.div
        animate={{ rotate: [0, 180, 180, 360] }}
        transition={{
          duration: 1.6,
          times: [0, 0.45, 0.55, 1],
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ display: "inline-flex" }}
      >
        <Hourglass className={styles.loadingIcon}/>
      </motion.div>
    </AnimatePresence>
  </div>
);