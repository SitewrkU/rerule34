import {useSearchStore} from "../store/searchStore.ts";
import {blackThemes, useBlacklistStore} from "../store/blackListStore.ts";
import {useSettingsStore} from "../store/settingsStore.ts";

export function useSearchQuery(): string {
  const maintags = useSearchStore(s => s.params.tags);
  const settings  = useSettingsStore(s => s.settings);

  if(!settings.enableBlacklist){
    return maintags || '';
  }

  const transformedBlackListTags = titleToTags()
  const blacklistPart = transformedBlackListTags.map((tag) => `-${tag}`).join(' ');

  return [blacklistPart, maintags].filter(Boolean).join(' ');
}

function titleToTags(): string[] {
  const selected = useBlacklistStore.getState().selected;


  const selectedThemes = blackThemes.filter(theme =>
    selected.includes(theme.title)
  );

  return selectedThemes.flatMap(theme => theme.tags);
}