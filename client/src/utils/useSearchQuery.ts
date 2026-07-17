import {useSearchStore} from "../store/searchStore.ts";
import {blackThemes, useBlacklistStore} from "../store/blackListStore.ts";

export function useSearchQuery(): string {
  const maintags = useSearchStore((s) => s.params.tags);

  const transformedBLtags = titleToTags()

  const blacklistPart = transformedBLtags.map((tag) => `-${tag}`).join(' ');

  return [blacklistPart, maintags].filter(Boolean).join(' ');
}

function titleToTags(): string[] {
  const selected = useBlacklistStore.getState().selected;


  const selectedThemes = blackThemes.filter(theme =>
    selected.includes(theme.title)
  );

  return selectedThemes.flatMap(theme => theme.tags);
}