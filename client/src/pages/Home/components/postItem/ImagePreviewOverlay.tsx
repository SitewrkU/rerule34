import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import styles from "./PostItem.module.css";

export function ImagePreviewOverlay({ src, isOpen }: { src: string; isOpen: boolean }) {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.previewOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.img
            src={src}
            className={styles.previewImage}
            initial={{ scale: 0.92 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.92 }}
            transition={{ duration: 0.15 }}
            draggable={false}
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}