import {useSearchStore} from "../../store/searchStore.ts";
import { useNavigate } from 'react-router-dom';
import Searchbar from "../../ui/searchbar/Searchbar.tsx";
import Posts from "../../components/posts/Posts.tsx";

import { CollectionsBookmark, Settings } from "clicons-react";
import styles from './HomePage.module.css'
import clsx from "clsx"

const HomePage = () => {
  const resetParams = useSearchStore(state => state.resetParams);
  const navigate = useNavigate();

  return (
    <>
      <header>
        <img src="/rer34text.png" alt="rer34logo" onClick={resetParams}/>
        <Searchbar/>
        <CollectionsBookmark className={clsx(styles.navButton, styles.notAvaible)}/>
        <Settings className={styles.navButton} onClick={() => navigate('/settings')}/>
      </header>

      <Posts />
    </>
  );
};

export default HomePage;