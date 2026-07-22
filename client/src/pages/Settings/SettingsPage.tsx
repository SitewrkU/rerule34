import { useNavigate } from 'react-router-dom';
import SettingSwitch from "./components/SettingsSwitcher/Switcher.tsx";
import SettingRadioGroup from "./components/SettingsRadioGroup/Radio.tsx";
import {defaultSettings} from "../../store/settingsStore.ts";

import {ChevronLeft, Home3, Brush, Customize, Image} from "clicons-react";
import styles from './SettingsPage.module.css'

const SettingsPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.settings}>
      <ChevronLeft
        size={32}
        className={styles.back}
        onClick={() => navigate("/")}
      />

      <h1>Налаштування</h1>
      <p>Керуй виглядом та поведінкою додатка під себе</p>

      <div className={styles.sectionList}>
        <section className={styles.settingsSection}>
          <h2><Home3/> Основне</h2>
          <div>
          <SettingRadioGroup
            settingKey="theme"
            label="Тема оформлення" text="Які кольори тобі більше подобаються? (Тепер працює! Але стилі все ще храмають)"
            options={[
              {label: 'Темня', value: 'dark'},
              {label: 'Світла', value: 'light'},
              {label: 'Оригінальна', value: 'original'},
            ]}
          />
          </div>
        </section>
        <section className={styles.settingsSection}>
          <h2><Brush/> Стилі</h2>
          <div>
            <SettingSwitch settingKey="paginationOnTop" label="Верхня пагінація" text="Щоб не гортати вниз"/>
            <SettingRadioGroup
              settingKey="paginationPos"
              label="Сторона відображення пагінації"
              options={[
                {label: 'Ліво', value: 'left'},
                {label: 'Центр', value: 'center'},
                {label: 'Право', value: 'right'},
              ]}
            />
          </div>
        </section>
        <section className={styles.settingsSection}>
          <h2><Image/> Пости</h2>
          <div>
            <SettingSwitch checkedByDef={defaultSettings.showPostInfo} settingKey="showPostInfo" label="Показувати інформацію по постам" text="По-о-овне погруження"/>
          </div>
        </section>
        <section className={styles.settingsSection}>
          <h2><Customize/> Незвичайні</h2>
          <div>
          <SettingSwitch settingKey="kittyMode" label="Kitty Mode" text="Ти прийшов сюди не за тим, що і всі.. Котики!"/>
          </div>
        </section>

      </div>
    </div>
  );
};

export default SettingsPage;