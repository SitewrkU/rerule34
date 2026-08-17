import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SortOption = "popularity" | "new" | "old" | "random";
export type RatingOption = "explicit" | "questionable" | "safe";
export type ContentTypeOption = "video" | "photo" | "any";


export const sortTagMap: Record<SortOption, string> = {
  popularity: "sort:score",
  new: "sort:id:desc",
  old: "sort:id:asc",
  random: "sort:random",
};

export const ratingTagMap: Record<RatingOption, string> = {
  explicit: "rating:explicit",
  questionable: "rating:questionable",
  safe: "rating:safe",
};

export const contentTypeTagMap: Record<ContentTypeOption, string | null> = {
  video: "video",
  photo: "-video",
  any: null,
};


type SearchSettings = {
  customTagsEnabled: boolean;
  customTags: string;

  sortEnabled: boolean;
  sortOption: SortOption;

  ratingEnabled: boolean;
  ratingOption: RatingOption;

  contentType: ContentTypeOption;
};


type SearchSettingsStore = {
  settings: SearchSettings;
  updateSettings: (patch: Partial<SearchSettings>) => void;
};

export const useSearchSettingsStore = create<SearchSettingsStore>()(
  persist(
    (set) => ({
      settings: {
        customTagsEnabled: false,
        customTags: "",

        sortEnabled: false,
        sortOption: "popularity",

        ratingEnabled: false,
        ratingOption: "safe",

        contentType: "any",
      },
      updateSettings: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } })),
    }),
    { name: "search-settings-storage" }
  )
);

export function buildSettingsTags(settings: SearchSettings): string[] {
  const tags: string[] = [];

  if (settings.customTagsEnabled && settings.customTags.trim()) {
    tags.push(...settings.customTags.trim().split(/\s+/));
  }

  if (settings.sortEnabled) {
    tags.push(sortTagMap[settings.sortOption]);
  }

  if (settings.ratingEnabled) {
    tags.push(ratingTagMap[settings.ratingOption]);
  }

  const contentTag = contentTypeTagMap[settings.contentType];
  if (contentTag) {
    tags.push(contentTag);
  }

  return tags;
}