import SettingSwitch from "./components/SettingsSwitcher/Switcher.tsx";
import SettingRadioGroup from "./components/SettingsRadioGroup/Radio.tsx";
import BlacklistSettings from "./components/BlacklistSettings/BlacklistSettings.tsx";
import {defaultSettings} from "../../store/settingsStore.ts";

import BackButton from "../../ui/BackButton/BackButton.tsx";

import { Home3, Brush, Customize, Image, CancelCircleHalfDot, Danger} from "clicons-react";
import styles from './SettingsPage.module.css'

const SettingsPage = () => {

  const handleReset = () => {
    if (!window.confirm("Скинути всі налаштування та локальні дані? Цю дію не можна скасувати.")) {
      return;
    }

    try {
      localStorage.clear();
    } finally {
      window.location.reload();
    }
  };

  return (
    <div className={styles.settings}>
      <BackButton navigateTo={'/'}/>

      <h1>Налаштування</h1>
      <p>Керуй виглядом та поведінкою додатка під себе</p>

      <div className={styles.sectionList}>
        <section className={styles.settingsSection}>
          <h2><Home3/> Основне</h2>
          <div>
          <SettingRadioGroup
            settingKey="theme"
            label="Тема оформлення" text="Які кольори тобі більше подобаються? (Краще не міняти, стилі тестові!)"
            options={[
              {label: 'Темня', value: 'dark'},
              {label: 'Dark Void', value: 'void'},
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
            <SettingSwitch checkedByDef={defaultSettings.showColoredScore} settingKey="showColoredScore" label="Фарбувати рейтинг поста в залежності від популярності" text="Так легше замітити популярні пости"/>
            <SettingSwitch checkedByDef={defaultSettings.showVideoDuration} settingKey="showVideoDuration" label="Підтягувати довжину відео" text="Менше навантаження, але і менше інформації"/>
          </div>
        </section>
        <section className={styles.settingsSection}>
          <h2><CancelCircleHalfDot/> Блек-ліст</h2>
          <div>
            <SettingSwitch checkedByDef={defaultSettings.enableBlacklist} settingKey="enableBlacklist" label="Включити блек-ліст під час пошуку" text="Фільтрація неприємних тем."/>
            <BlacklistSettings />
          </div>
        </section>
        <section className={styles.settingsSection}>
          <h2><Customize/> Незвичайні</h2>
          <div>
          <SettingSwitch settingKey="kittyMode" label="Kitty Mode" text="Сховаємо цю неподобщину.. мяу~"/>
          <SettingSwitch settingKey="blackMode" label="Black Mode" text="Просто тикни в любий із них, і дивись, що попалося :)"/>
          </div>
        </section>
        <section className={`${styles.settingsSection} ${styles.dangerZone}`}>
          <h2><Danger/> Небезпечна зона</h2>
          <div>
            <div className={styles.dangerRow}>
              <div className={styles.dangerInfo}>
                <span className={styles.dangerTitle}>Скинути всі налаштування</span>
                <span className={styles.dangerText}>Очистить локальне сховище (налаштування, блек-ліст, профіль), але збережені пости залишаться</span>
              </div>
              <button type="button" className={styles.dangerButton} onClick={handleReset}>
                Скинути
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default SettingsPage;