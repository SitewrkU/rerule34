import React, { useState } from 'react';
import {useSearchSettingsStore} from "../../store/searchSettingsStore.ts";

import { Drawer, Divider, Input, Switch, Radio } from "antd";
const { TextArea } = Input;

import styles from './SearchSettings.module.css'
import { Filter } from "clicons-react";

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
        <p>
          УВАГА: Ця фішка знаходиться у відкладеній розробці, базовий
          функціонал буде реалізовано як умога швидше, але повний доведеться
          зачекати.
        </p>
        <Divider />

        <div className={styles.switcherArea}>
          <p>
            Якщо є якісь теги, які ти хочеш застосовувати до ВСІХ пошукових
            запитів, пиши сюди:
          </p>
          <Switch
            className={styles.switcher}
            checked={settings.customTagsEnabled}
            onChange={(checked) =>
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
            onChange={(checked) => updateSettings({ sortEnabled: checked })}
          />
        </div>
        <Radio.Group
          value={settings.sortOption}
          disabled={!settings.sortEnabled}
          onChange={(e) => updateSettings({ sortOption: e.target.value })}
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
            onChange={(checked) => updateSettings({ ratingEnabled: checked })}
          />
        </div>
        <Radio.Group
          value={settings.ratingOption}
          disabled={!settings.ratingEnabled}
          onChange={(e) => updateSettings({ ratingOption: e.target.value })}
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
          onChange={(e) => updateSettings({ contentType: e.target.value })}
          className={styles.radioGroup}
        >
          <Radio value="video">Тільки відео</Radio>
          <Radio value="photo">Тільки фото</Radio>
          <Radio value="any">Без різниці</Radio>
          <Radio disabled>Вебтуни (Coming soon)</Radio>
        </Radio.Group>
      </Drawer>
    </div>
  );
};

export default SearchSettings;