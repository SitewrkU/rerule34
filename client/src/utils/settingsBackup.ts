import { useSettingsStore, type Settings } from '../store/settingsStore';
import { useSearchSettingsStore, type SearchSettings } from '../store/searchSettingsStore';
import { blackThemes, useBlacklistStore } from '../store/blackListStore';
import { downloadJson, isRecord, readJsonFile } from './backup';

const SETTINGS_BACKUP_TYPE = 'rer34-settings';
const SETTINGS_BACKUP_VERSION = 1;

type BooleanSettingKey = {
  [K in keyof Settings]: Settings[K] extends boolean ? K : never;
}[keyof Settings];

type BooleanSearchSettingKey = {
  [K in keyof SearchSettings]: SearchSettings[K] extends boolean ? K : never;
}[keyof SearchSettings];

const booleanSettingKeys: BooleanSettingKey[] = [
  'paginationOnTop',
  'showPostInfo',
  'showColoredScore',
  'showVideoDuration',
  'enableBlacklist',
  'kittyMode',
  'blackMode',
];

const booleanSearchSettingKeys: BooleanSearchSettingKey[] = [
  'customTagsEnabled',
  'sortEnabled',
  'ratingEnabled',
  'videoLengthEnabled',
  'minVotesEnabled',
];

const themes: Settings['theme'][] = ['dark', 'void', 'light', 'original'];
const paginationPositions: Settings['paginationPos'][] = ['left', 'center', 'right'];

const sortOptions: SearchSettings['sortOption'][] = ['popularity', 'new', 'old', 'random'];
const ratingOptions: SearchSettings['ratingOption'][] = ['explicit', 'questionable', 'safe'];
const contentTypes: SearchSettings['contentType'][] = ['video', 'photo', 'any'];
const videoOptions: SearchSettings['videoOption'][] = [
  'longer_t10m',
  'longer_t5m',
  'longer_t3m',
  'longer_t1m',
  'longer_t30s',
  'shorter_t1m',
  'shorter_t30s',
  'shorter_t10s',
];

function isOneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === 'string' && (options as readonly string[]).includes(value);
}

function sanitizeSettings(value: unknown): Partial<Settings> | null {
  if (!isRecord(value)) return null;

  const result: Partial<Settings> = {};

  if (isOneOf(value.theme, themes)) result.theme = value.theme;
  if (isOneOf(value.paginationPos, paginationPositions)) {
    result.paginationPos = value.paginationPos;
  }

  for (const key of booleanSettingKeys) {
    if (typeof value[key] === 'boolean') result[key] = value[key];
  }

  return Object.keys(result).length > 0 ? result : null;
}

function sanitizeSearchSettings(value: unknown): Partial<SearchSettings> | null {
  if (!isRecord(value)) return null;

  const result: Partial<SearchSettings> = {};

  for (const key of booleanSearchSettingKeys) {
    if (typeof value[key] === 'boolean') result[key] = value[key];
  }

  if (typeof value.customTags === 'string') {
    result.customTags = value.customTags.slice(0, 2000);
  }
  if (isOneOf(value.sortOption, sortOptions)) result.sortOption = value.sortOption;
  if (isOneOf(value.ratingOption, ratingOptions)) result.ratingOption = value.ratingOption;
  if (isOneOf(value.contentType, contentTypes)) result.contentType = value.contentType;
  if (isOneOf(value.videoOption, videoOptions)) result.videoOption = value.videoOption;

  if (typeof value.minVotes === 'number' && Number.isFinite(value.minVotes)) {
    result.minVotes = Math.max(0, Math.round(value.minVotes));
  }

  return Object.keys(result).length > 0 ? result : null;
}

function sanitizeBlacklist(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;

  const knownThemes = new Set(blackThemes.map(theme => theme.title));

  return [
    ...new Set(
      value.filter((item): item is string => typeof item === 'string' && knownThemes.has(item))
    ),
  ];
}

export function exportSettingsBackup(): void {
  const payload = {
    type: SETTINGS_BACKUP_TYPE,
    version: SETTINGS_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    settings: useSettingsStore.getState().settings,
    searchSettings: useSearchSettingsStore.getState().settings,
    blacklist: useBlacklistStore.getState().selected,
  };

  downloadJson(`rer34-settings-${payload.exportedAt.slice(0, 10)}.json`, payload);
}

export async function importSettingsBackup(file: File): Promise<void> {
  const raw = await readJsonFile(file);

  if (!isRecord(raw)) {
    throw new Error('Це не файл налаштувань Re:R34.');
  }
  if (raw.type !== undefined && raw.type !== SETTINGS_BACKUP_TYPE) {
    throw new Error('Це не файл налаштувань Re:R34.');
  }
  if (typeof raw.version === 'number' && raw.version > SETTINGS_BACKUP_VERSION) {
    throw new Error('Цей файл створений новішою версією застосунку.');
  }

  const settings = sanitizeSettings(raw.settings);
  const searchSettings = sanitizeSearchSettings(raw.searchSettings);
  const blacklist = sanitizeBlacklist(raw.blacklist);

  if (settings === null && searchSettings === null && blacklist === null) {
    throw new Error('У файлі не знайдено налаштувань Re:R34.');
  }

  if (settings) useSettingsStore.getState().updateSettings(settings);
  if (searchSettings) useSearchSettingsStore.getState().updateSettings(searchSettings);
  if (blacklist) useBlacklistStore.getState().setSelected(blacklist);
}
