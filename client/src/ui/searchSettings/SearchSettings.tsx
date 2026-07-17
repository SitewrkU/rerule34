import { useState } from 'react';
import { Drawer } from 'antd';
import { Filter } from "clicons-react";

import styles from './SearchSettings.module.css'

const SearchSettings = () => {
  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Filter className={styles.button} onClick={showDrawer}/>
      <Drawer
        className={styles.drawer}
        title="Налаштування пошуку"
        closable={{ placement: 'end' }}
        onClose={onClose}
        open={open}
      >
        <p>Тут будуть налаштування</p>
      </Drawer>
    </>
  );
};

export default SearchSettings;