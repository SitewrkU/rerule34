import { BrowserRouter, Route, Routes} from "react-router-dom";
import HomePage from "./pages/Home/HomePage.tsx";
import SettingsPage from "./pages/Settings/SettingsPage.tsx";
import SetupPage from "./pages/Setup/SetupPage.tsx";
import {SetupGuard} from "./pages/Setup/SetupGuard.tsx";

import AnimatedOutlet from "./ui/AnimatedOutlet.tsx";
import { ConfigProvider, theme } from "antd";
import './App.module.css'
import {useSettingsStore} from "./store/settingsStore.ts";
import {useThemeSync} from "./utils/useThemeSync.ts";

const antdThemeMap = {
  dark: { algorithm: theme.darkAlgorithm, colorPrimary: '#aae5a4' },
  light: { algorithm: theme.defaultAlgorithm, colorPrimary: '#4f9c47' },
  original: { algorithm: theme.defaultAlgorithm, colorPrimary: '#207a16' },
};

const App = () => {
  useThemeSync();
  const currentTheme = useSettingsStore((s) => s.settings.theme);
  const antdTheme = antdThemeMap[currentTheme];

  return (
    <>
      <ConfigProvider
      theme={{
        algorithm: antdTheme.algorithm,
        token: {
          colorPrimary: antdTheme.colorPrimary,
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
          </Route>
        </Routes>
        </BrowserRouter>



      </ConfigProvider>
    </>
  );
};

export default App;