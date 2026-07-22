import {useSearchStore} from "../../store/searchStore.ts";
import { useNavigate } from 'react-router-dom';
import {useSettingsStore} from "../../store/settingsStore.ts";
import Searchbar from "../../ui/searchbar/Searchbar.tsx";
import SearchTagsBlock from "../../ui/searchTagsBlock/SearchTagsBlock.tsx";
import SearchSettings from "../../ui/searchSettings/SearchSettings.tsx";
import Posts from "./components/posts/Posts.tsx";

import { CollectionsBookmark, Settings } from "clicons-react";
import styles from './HomePage.module.css'
import clsx from "clsx"

const HomePage = () => {
  const resetParams = useSearchStore(state => state.resetParams);
  const navigate = useNavigate();
  const settings = useSettingsStore(state => state.settings);

  return (
    <>
      <header>
        <img
            src="/rer34text.png"
            alt="rer34logo"
            onClick={resetParams}
            className={clsx((settings.theme === 'light' || settings.theme === 'original') && styles.darked)}
        />
        <SearchTagsBlock/>
        <Searchbar/>
        <CollectionsBookmark className={clsx(styles.navButton, styles.notAvaible)}/>
        <Settings className={styles.navButton} onClick={() => navigate('/settings')}/>
        <SearchSettings/>
      </header>

      <Posts />
    </>
  );
};

export default HomePage;