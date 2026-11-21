import {useRef, useState, type ChangeEvent} from "react";
import SettingSwitch from "./components/SettingsSwitcher/Switcher.tsx";
import SettingRadioGroup from "./components/SettingsRadioGroup/Radio.tsx";
import BlacklistSettings from "./components/BlacklistSettings/BlacklistSettings.tsx";
import {defaultSettings} from "../../store/settingsStore.ts";
import {exportSettingsBackup, importSettingsBackup} from "../../utils/settingsBackup.ts";
import {exportSavedBackup, importSavedBackup} from "../../utils/savedBackup.ts";
import {pluralizePosts} from "../../lib/pluralizePosts.ts";

import BackButton from "../../ui/BackButton/BackButton.tsx";

import { Home3, Brush, Customize, Image, CancelCircleHalfDot, Danger, Database2} from "clicons-react";
import styles from './SettingsPage.module.css'

type BackupNotice = {
  tone: 'success' | 'error';
  text: string;
};

function getBackupError(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    return fallback;
  }

  return error instanceof Error && error.message ? error.message : fallback;
}

const SettingsPage = () => {
  const settingsFileRef = useRef<HTMLInputElement>(null);
  const savedFileRef = useRef<HTMLInputElement>(null);
  const [backupNotice, setBackupNotice] = useState<BackupNotice | null>(null);
  const [backupBusy, setBackupBusy] = useState(false);

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

  const handleExportSettings = () => {
    try {
      exportSettingsBackup();
      setBackupNotice({tone: 'success', text: 'Файл налаштувань завантажено.'});
    } catch (error) {
      setBackupNotice({
        tone: 'error',
        text: getBackupError(error, 'Не вдалося експортувати налаштування.'),
      });
    }
  };

  const handleSettingsImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || backupBusy) return;

    if (!window.confirm('Імпорт замінить поточні налаштування. Продовжити?')) {
      return;
    }

    setBackupBusy(true);
    setBackupNotice(null);

    try {
      await importSettingsBackup(file);
      setBackupNotice({tone: 'success', text: 'Налаштування успішно імпортовано.'});
    } catch (error) {
      setBackupNotice({
        tone: 'error',
        text: getBackupError(error, 'Не вдалося імпортувати налаштування.'),
      });
    } finally {
      setBackupBusy(false);
    }
  };

  const handleExportSaved = async () => {
    setBackupBusy(true);
    setBackupNotice(null);

    try {
      await exportSavedBackup();
      setBackupNotice({tone: 'success', text: 'Файл збережень завантажено.'});
    } catch (error) {
      setBackupNotice({
        tone: 'error',
        text: getBackupError(error, 'Не вдалося експортувати збереження. Перевір, чи запущений сервер.'),
      });
    } finally {
      setBackupBusy(false);
    }
  };

  const handleSavedImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || backupBusy) return;

    if (!window.confirm(
      'Імпорт повністю замінить усі збережені пости та колекції на сервері. Продовжити?'
    )) {
      return;
    }

    setBackupBusy(true);
    setBackupNotice(null);

    try {
      const result = await importSavedBackup(file);
      setBackupNotice({
        tone: 'success',
        text: `Імпортовано ${result.posts} ${pluralizePosts(result.posts)}. Колекцій: ${result.collections}.`,
      });
    } catch (error) {
      setBackupNotice({
        tone: 'error',
        text: getBackupError(error, 'Не вдалося імпортувати збереження.'),
      });
    } finally {
      setBackupBusy(false);
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
        <section className={styles.settingsSection}>
          <h2><Database2/> Резервні копії</h2>
          <div>
            <div className={styles.backupRow}>
              <div className={styles.backupInfo}>
                <span className={styles.backupTitle}>Налаштування</span>
                <span className={styles.backupText}>
                  Тема, вигляд постів, блек-ліст і параметри пошуку.
                </span>
              </div>

              <div className={styles.backupActions}>
                <button
                  type="button"
                  className={styles.backupButton}
                  onClick={handleExportSettings}
                  disabled={backupBusy}
                >
                  Експорт
                </button>
                <button
                  type="button"
                  className={styles.backupButton}
                  onClick={() => settingsFileRef.current?.click()}
                  disabled={backupBusy}
                >
                  Імпорт
                </button>
                <input
                  ref={settingsFileRef}
                  className={styles.fileInput}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleSettingsImport}
                />
              </div>
            </div>

            <div className={styles.backupRow}>
              <div className={styles.backupInfo}>
                <span className={styles.backupTitle}>База збережень</span>
                <span className={styles.backupText}>
                  Колекції та збережені пости. Імпорт замінює їх на сервері.
                </span>
              </div>

              <div className={styles.backupActions}>
                <button
                  type="button"
                  className={styles.backupButton}
                  onClick={handleExportSaved}
                  disabled={backupBusy}
                >
                  Експорт
                </button>
                <button
                  type="button"
                  className={styles.backupButton}
                  onClick={() => savedFileRef.current?.click()}
                  disabled={backupBusy}
                >
                  Імпорт
                </button>
                <input
                  ref={savedFileRef}
                  className={styles.fileInput}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleSavedImport}
                />
              </div>
            </div>

            {backupNotice && (
              <p
                className={`${styles.backupNotice} ${
                  backupNotice.tone === 'error'
                    ? styles.backupNoticeError
                    : styles.backupNoticeSuccess
                }`}
                role="status"
              >
                {backupNotice.text}
              </p>
            )}
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