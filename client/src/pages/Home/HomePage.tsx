import {useTabsStore} from "../../store/tabsStore.ts";
import { useNavigate } from 'react-router-dom';
import {useSettingsStore} from "../../store/settingsStore.ts";
import AppTabs from "../../ui/AppTabs/AppTabs.tsx";
import Searchbar from "../../ui/searchbar/Searchbar.tsx";
import SearchTagsBlock from "../../ui/searchTagsBlock/SearchTagsBlock.tsx";
import SearchSettings from "../../ui/searchSettings/SearchSettings.tsx";
import Posts from "./components/posts/Posts.tsx";

import { CollectionsBookmark, Settings } from "clicons-react";
import styles from './HomePage.module.css'
import clsx from "clsx"

const HomePage = () => {
  const activeTabId = useTabsStore(state => state.activeTabId);
  const resetActiveSearch = useTabsStore(state => state.resetActiveSearch);
  const navigate = useNavigate();
  const settings = useSettingsStore(state => state.settings);

  return (
    <>
      <AppTabs/>

      <header>
        <img
            src="/rer34text.png"
            alt="rer34logo"
            onClick={resetActiveSearch}
            className={clsx((settings.theme === 'light' || settings.theme === 'original') && styles.darked)}
        />
        <SearchTagsBlock/>
        <Searchbar/>
        <CollectionsBookmark className={clsx(styles.navButton)} onClick={() => navigate('/collections')}/>
        <Settings className={styles.navButton} onClick={() => navigate('/settings')}/>
        <SearchSettings/>
      </header>

      <Posts key={activeTabId} />
    </>
  );
};

export default HomePage;
