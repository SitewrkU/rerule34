import { useEffect } from "react";
import {useSettingsStore} from "../store/settingsStore.ts";

export const useThemeSync = () => {
  const theme = useSettingsStore((s) => s.settings.theme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
};