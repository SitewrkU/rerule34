import { BrowserRouter, Route, Routes} from "react-router-dom";
import HomePage from "./pages/Home/HomePage.tsx";
import SettingsPage from "./pages/Settings/SettingsPage.tsx";
import SetupPage from "./pages/Setup/SetupPage.tsx";
import {SetupGuard} from "./pages/Setup/SetupGuard.tsx";

import AnimatedOutlet from "./ui/AnimatedOutlet.tsx";
import { ConfigProvider, theme } from "antd";
import './App.module.css'

const App = () => {

  return (
    <>
      <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#aae5a4',
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