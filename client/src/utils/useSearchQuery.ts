import {useSearchStore} from "../store/searchStore.ts";
import {blackThemes, useBlacklistStore} from "../store/blackListStore.ts";
import {useSettingsStore} from "../store/settingsStore.ts";
import { useSearchSettingsStore, buildSettingsTags, sortTagMap } from "../store/searchSettingsStore.ts";


/* Це ГОЛОВНИЙ збирач фінального результату в пошук*/
export function useSearchQuery(): string {
  const maintags = useSearchStore(s => s.params.tags);
  const settings  = useSettingsStore(s => s.settings);
  const searchsettings  = useSearchSettingsStore(s => s.settings);

  const blacklistPart = settings.enableBlacklist
    ? titleToTags().map((tag) => `-${tag}`).join(' ')
    : "";

  // Пошук за автором (user:name) — окремий режим без фільтрів пошуку
  const isAuthorSearch = /^user:\S+$/.test(maintags.trim());

  if (isAuthorSearch && settings.authorSearchWithoutFilters) {
    const authorBlacklist = settings.authorSearchUseBlacklist ? blacklistPart : '';

    return [authorBlacklist, sortTagMap.popularity, maintags]
      .filter(Boolean)
      .join(' ');
  }

  const settingsTags = buildSettingsTags(searchsettings).join(' ');

  return [blacklistPart, settingsTags, maintags].filter(Boolean).join(' ');
}




function titleToTags(): string[] {
  const selected = useBlacklistStore.getState().selected;


  const selectedThemes = blackThemes.filter(theme =>
    selected.includes(theme.title)
  );

  return selectedThemes.flatMap(theme => theme.tags);
}