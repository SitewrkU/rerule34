import { BrowserRouter, Route, Routes} from "react-router-dom";
import HomePage from "./pages/Home/HomePage.tsx";
import SettingsPage from "./pages/Settings/SettingsPage.tsx";

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
        }
      }}
      >
        <BrowserRouter>
        <Routes>
          <Route element={<AnimatedOutlet />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
        </BrowserRouter>



      </ConfigProvider>
    </>
  );
};

export default App;