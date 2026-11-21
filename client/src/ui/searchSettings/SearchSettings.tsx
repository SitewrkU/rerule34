import React, { useState } from 'react';
import {useSearchSettingsStore, type SearchSettings as SearchSettingsState} from "../../store/searchSettingsStore.ts";

import { Drawer, Divider, Input, Switch, Radio, InputNumber } from "antd";
import type { RadioChangeEvent } from "antd";
const { TextArea } = Input;

import styles from './SearchSettings.module.css'
import { Filter } from "clicons-react";

type SearchFilterSettings = Pick<
  SearchSettingsState,
  | 'sortEnabled'
  | 'sortOption'
  | 'ratingEnabled'
  | 'ratingOption'
  | 'contentType'
  | 'videoLengthEnabled'
  | 'videoOption'
  | 'minVotesEnabled'
  | 'minVotes'
>;

type SearchPreset = {
  id: string;
  label: string;
  filters: SearchFilterSettings;
};

const filterDefaults: SearchFilterSettings = {
  sortEnabled: false,
  sortOption: 'popularity',
  ratingEnabled: false,
  ratingOption: 'safe',
  contentType: 'any',
  videoLengthEnabled: false,
  videoOption: 'longer_t1m',
  minVotesEnabled: false,
  minVotes: 50,
};

const searchPresets: SearchPreset[] = [
  {
    id: 'popular',
    label: 'Популярне',
    filters: {...filterDefaults, sortEnabled: true, sortOption: 'popularity'},
  },
  {
    id: 'new',
    label: 'Нове',
    filters: {...filterDefaults, sortEnabled: true, sortOption: 'new'},
  },
  {
    id: 'newtop',
    label: 'Популярні новинки',
    filters: {...filterDefaults, sortEnabled: true, sortOption: 'new', minVotesEnabled: true, minVotes: 100},
  },
  {
    id: 'random',
    label: 'Рандом',
    filters: {...filterDefaults, sortEnabled: true, sortOption: 'random'},
  },
  {
    id: 'long-video',
    label: 'Довгі відео',
    filters: {
      ...filterDefaults,
      contentType: 'video',
      videoLengthEnabled: true,
      videoOption: 'longer_t5m',
    },
  },
  {
    id: 'short-video',
    label: 'Короткі відео',
    filters: {
      ...filterDefaults,
      contentType: 'video',
      videoLengthEnabled: true,
      videoOption: 'shorter_t1m',
    },
  },
  {
    id: 'photo',
    label: 'Тільки фото',
    filters: {...filterDefaults, contentType: 'photo'},
  },
];

function presetSignature(settings: SearchFilterSettings): string {
  return [
    settings.sortEnabled,
    settings.sortOption,
    settings.ratingEnabled,
    settings.ratingOption,
    settings.contentType,
    settings.videoLengthEnabled,
    settings.videoOption,
    settings.minVotesEnabled,
    settings.minVotes,
  ].join('|');
}

const SearchSettings = () => {
  const [open, setOpen] = useState(false);

  const settings = useSearchSettingsStore((s) => s.settings);
  const updateSettings = useSearchSettingsStore((s) => s.updateSettings);

  const showDrawer = () => setOpen(true);
  const onClose = () => setOpen(false);

  const MAX_TAGS = 20; // Не міняй це на вище, багато тегів ламає пошук

  const handleTextareaTagsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const words = value.split(/\s+/).filter(Boolean);
    setTextareaTags(words);

    if (words.length > MAX_TAGS) {
      updateSettings({ customTags: words.slice(0, MAX_TAGS).join(" ") });
    } else {
      updateSettings({ customTags: value });
    }
  };

  const [textareaTags, setTextareaTags] = useState<string[]>([]);

  const currentFilterSignature = presetSignature(settings);

  const applyPreset = (preset: SearchPreset) => {
    updateSettings({...preset.filters});
  };

  return (
    <div className={styles.searchSettings}>
      <Filter className={styles.button} onClick={showDrawer} />
      <Drawer
        className={styles.drawer}
        title="Налаштування пошуку"
        closable={{ placement: "end" }}
        onClose={onClose}
        open={open}
      >
        <div className={styles.presets}>
          <div className={styles.presetsHeader}>
            <p className={styles.presetsTitle}>Швидкі пресети</p>
            <button
              type="button"
              className={styles.presetsReset}
              onClick={() => updateSettings({...filterDefaults})}
            >
              Скинути фільтри
            </button>
          </div>

          <div className={styles.presetGrid}>
            {searchPresets.map((preset) => {
              const active = currentFilterSignature === presetSignature(preset.filters);

              return (
                <button
                  key={preset.id}
                  type="button"
                  className={`${styles.preset} ${active ? styles.presetActive : ''}`}
                  aria-pressed={active}
                  onClick={() => applyPreset(preset)}
                >
                  <span className={styles.presetLabel}>{preset.label}</span>
                </button>
              );
            })}
          </div>

          <p className={styles.presetsNote}>
            Пресет змінює фільтри пошуку, але не твої власні теги.
          </p>
        </div>


        <Divider />
        <div className={styles.switcherArea}>
          <p>
            Якщо є якісь теги, які ти хочеш застосовувати до ВСІХ пошукових
            запитів, пиши сюди:
          </p>
          <Switch
            className={styles.switcher}
            checked={settings.customTagsEnabled}
            onChange={(checked: boolean) =>
              updateSettings({ customTagsEnabled: checked })
            }
          />
        </div>
        <TextArea
          placeholder="Введіть теги через пробіл"
          allowClear
          value={settings.customTags}
          onChange={handleTextareaTagsChange}
          disabled={!settings.customTagsEnabled}
        />
        <p>{textareaTags.length}/{MAX_TAGS}</p>


        <Divider />
        <div className={styles.switcherArea}>
          <p>Додаткові параметри відображення контенту</p>
          <Switch
            className={styles.switcher}
            checked={settings.sortEnabled}
            onChange={(checked: boolean) => updateSettings({ sortEnabled: checked })}
          />
        </div>
        <Radio.Group
          value={settings.sortOption}
          disabled={!settings.sortEnabled}
          onChange={(e: RadioChangeEvent) => updateSettings({ sortOption: e.target.value })}
          className={styles.radioGroup}
        >
          <Radio value="popularity">За популярністю</Radio>
          <Radio value="new">Спочатку нові</Radio>
          <Radio value="old">Спочатку старі</Radio>
          <Radio value="random"><span className={styles.randomText}>Рандомні</span></Radio>
        </Radio.Group>


        <Divider />
        <div className={styles.switcherArea}>
          <p>За рейтингом</p>
          <Switch
            className={styles.switcher}
            checked={settings.ratingEnabled}
            onChange={(checked: boolean) => updateSettings({ ratingEnabled: checked })}
          />
        </div>
        <Radio.Group
          value={settings.ratingOption}
          disabled={!settings.ratingEnabled}
          onChange={(e: RadioChangeEvent) => updateSettings({ ratingOption: e.target.value })}
          className={styles.radioGroup}
        >
          <Radio value="explicit">Відверті</Radio>
          <Radio value="questionable">Сумнівні</Radio>
          <Radio value="safe">Безпечні</Radio>
        </Radio.Group>


        <Divider />
        <p>За типом контенту</p>
        <Radio.Group
          value={settings.contentType}
          onChange={(e: RadioChangeEvent) => updateSettings({ contentType: e.target.value })}
          className={styles.radioGroup}
        >
          <Radio value="video">Тільки відео</Radio>
          <Radio value="photo">Тільки фото</Radio>
          <Radio value="any">Без різниці</Radio>
          <Radio disabled>Вебтуни (Coming soon)</Radio>
        </Radio.Group>


        <Divider />
        <div className={styles.switcherArea}>
          <p>За довжиною відео</p>
          <Switch
            className={styles.switcher}
            checked={settings.videoLengthEnabled}
            onChange={(checked: boolean) => updateSettings({ videoLengthEnabled: checked })}
          />
        </div>
        <Radio.Group
          value={settings.videoOption}
          disabled={!settings.videoLengthEnabled}
          onChange={(e: RadioChangeEvent) => updateSettings({ videoOption: e.target.value })}
          className={styles.radioGroup}
        >
          <Radio value="longer_t30s">Довше 30 секунд</Radio>
          <Radio value="longer_t1m">Довше 1 хвилини</Radio>
          <Radio value="longer_t3m">Довше 3 хвилин</Radio>
          <Radio value="longer_t5m">Довше 5 хвилин</Radio>
          <Radio value="longer_t10m">Довше 10 хвилин</Radio>
          <Radio value="shorter_t1m">Коротше 1 хвилини</Radio>
          <Radio value="shorter_t30s">Коротше 30 секунд</Radio>
          <Radio value="shorter_t10s">Коротше 10 секунд</Radio>
        </Radio.Group>
        <p className={styles.textinfo}>(Зауваж, ці теги виставляють самі аплоадери контенту, тому не всі пости фільтруються за цим)</p>


        <Divider />
        <div className={styles.switcherArea}>
          <p>За кількістю ап-воутів</p>
          <Switch
            className={styles.switcher}
            checked={settings.minVotesEnabled}
            onChange={(checked: boolean) => updateSettings({ minVotesEnabled: checked })}
          />
        </div>
        <InputNumber
          className={styles.votesInput}
          aria-label="Мінімум ап-воутів"
          min={1}
          step={10}
          precision={0}
          mode={'spinner'}
          value={settings.minVotes}
          disabled={!settings.minVotesEnabled}
          onChange={(value: number | null) => {
            if (value !== null && Number.isFinite(value)) {
              updateSettings({ minVotes: Math.max(1, Math.round(value)) });
            }
          }}
          changeOnWheel
        />
        <p className={styles.textinfo}>
          Мінімум ап-воутів, які повинен мати пост, щоб потрапити у видачу.
        </p>


      </Drawer>
    </div>
  );
};

export default SearchSettings;