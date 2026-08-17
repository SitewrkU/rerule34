import {useSearchStore} from "../store/searchStore.ts";
import {blackThemes, useBlacklistStore} from "../store/blackListStore.ts";
import {useSettingsStore} from "../store/settingsStore.ts";
import { useSearchSettingsStore, buildSettingsTags } from "../store/searchSettingsStore.ts";

export function useSearchQuery(): string {
  const maintags = useSearchStore(s => s.params.tags);
  const settings  = useSettingsStore(s => s.settings);
  const searchsettings  = useSearchSettingsStore(s => s.settings);

  const settingsTags = buildSettingsTags(searchsettings).join(' ');

  const blacklistPart = settings.enableBlacklist
    ? titleToTags().map((tag) => `-${tag}`).join(' ')
    : "";

  return [blacklistPart, settingsTags, maintags].filter(Boolean).join(' ');
}

function titleToTags(): string[] {
  const selected = useBlacklistStore.getState().selected;


  const selectedThemes = blackThemes.filter(theme =>
    selected.includes(theme.title)
  );

  return selectedThemes.flatMap(theme => theme.tags);
}