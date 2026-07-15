import React from "react";
import {useEffect, useState} from "react";
import {useAppStore} from "../../../store/appStore.ts";

import {motion, AnimatePresence} from "motion/react";
import styles from './Step.module.css'
import { Input } from 'antd';

const UserStep = () => {
  const [showMessage, setShowMessage] = useState(false);

  const userName = useAppStore((s) => s.userName);
  const setUserName = useAppStore((s) => s.setUserName);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
    setShowMessage(false);
  };

  useEffect(() => {
    if (!userName.trim()) return;

    const timeout = setTimeout(() => {
      setShowMessage(true);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [userName]);


  return (
    <div className={styles.stepContainer}>
      <h1>Вітаю в re:Rule34!</h1>
      <p className={styles.infoP}>Ця сторінка допоможе нам налаштувати цей клієнт під тебе. Для початку нам варто знати... як ти себе називаєш?</p>
      <Input
        className={styles.input}
        placeholder="Я..."
        value={userName}
        onChange={handleChange}
        maxLength={20}
        showCount
      />
      <AnimatePresence>
      {showMessage && (
        <motion.div
          className={styles.motionP}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
        >
          Яке красиве ім'я!
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default UserStep;