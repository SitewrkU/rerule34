import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SortOption = "popularity" | "new" | "old" | "random";
export type RatingOption = "explicit" | "questionable" | "safe";
export type ContentTypeOption = "video" | "photo" | "any";
export type VideoLengthOption =
  "longer_t10m" | "longer_t5m" | "longer_t3m" | "longer_t1m" | "longer_t30s" |
  "shorter_t1m" | "shorter_t30s" | "shorter_t10s";


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


export const videoLengthMap: Record<VideoLengthOption, string> = {
  longer_t30s: 'longer_than_30_seconds',
  longer_t1m: 'longer_than_one_minute',
  longer_t3m: 'longer_than_3_minutes',
  longer_t5m: 'longer_than_5_minutes',
  longer_t10m: 'longer_than_10_minutes',

  shorter_t1m: 'shorter_than_one_minute',
  shorter_t30s: 'shorter_than_30_seconds',
  shorter_t10s: 'shorter_than_10_seconds',
};


type SearchSettings = {
  customTagsEnabled: boolean;
  customTags: string;

  sortEnabled: boolean;
  sortOption: SortOption;

  ratingEnabled: boolean;
  ratingOption: RatingOption;

  contentType: ContentTypeOption;

  videoLengthEnabled: boolean;
  videoOption: VideoLengthOption;
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

        videoLengthEnabled: false,
        videoOption: "longer_t1m",
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

  if (settings.videoLengthEnabled) {
    tags.push(videoLengthMap[settings.videoOption]);
  }

  return tags;
}