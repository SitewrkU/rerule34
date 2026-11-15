import {useEffect} from "react";
import { BrowserRouter, Route, Routes} from "react-router-dom";
import {useCollectionsStore} from "./store/collectionStore.ts";
import HomePage from "./pages/Home/HomePage.tsx";
import SettingsPage from "./pages/Settings/SettingsPage.tsx";
import SetupPage from "./pages/Setup/SetupPage.tsx";
import CollectionsPage from "./pages/Collections/CollectionsPage.tsx";
import {SetupGuard} from "./SetupGuard.tsx";

import AnimatedOutlet from "./ui/AnimatedOutlet.tsx";
import { ConfigProvider, theme } from "antd";
import './App.module.css'
import {useSettingsStore} from "./store/settingsStore.ts";
import {useThemeSync} from "./utils/useThemeSync.ts";

const antdThemeMap = {
  dark: { algorithm: theme.darkAlgorithm, colorPrimary: '#aae5a4', colorTextLightSolid: '#101210' },
  void: { algorithm: theme.darkAlgorithm, colorPrimary: '#b9adff', colorTextLightSolid: '#08070f' },
  light: { algorithm: theme.defaultAlgorithm, colorPrimary: '#3f7d39', colorTextLightSolid: '#ffffff' },
  original: { algorithm: theme.defaultAlgorithm, colorPrimary: '#1d431d', colorTextLightSolid: '#ffffff' },
};

const App = () => {
  useThemeSync();
  const currentTheme = useSettingsStore((s) => s.settings.theme);
  const antdTheme = antdThemeMap[currentTheme];

  useEffect(() => {
    void useCollectionsStore.getState().fetchCollections();
  }, []);

  return (
    <>
      <ConfigProvider
      theme={{
        algorithm: antdTheme.algorithm,
        token: {
          colorPrimary: antdTheme.colorPrimary,
          colorTextLightSolid: antdTheme.colorTextLightSolid,
          fontFamily: 'SN Pro, sans-serif'
        }
      }}
      >
        <BrowserRouter>
        <Routes>
          <Route element={<SetupGuard><AnimatedOutlet/></SetupGuard>}>
            <Route path="/" element={<HomePage />} />
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
          </Route>
        </Routes>
        </BrowserRouter>



      </ConfigProvider>
    </>
  );
};

export default App;