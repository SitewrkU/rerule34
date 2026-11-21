import {useRef, useState, type ChangeEvent} from "react";
import {Database2} from "clicons-react";
import {pluralizePosts} from "../../../../lib/pluralizePosts.ts";
import {exportSettingsBackup, importSettingsBackup} from "../../../../utils/settingsBackup.ts";
import {exportSavedBackup, importSavedBackup} from "../../../../utils/savedBackup.ts";
import styles from "./BackupSettings.module.css";

type BackupNotice = {
  tone: 'success' | 'error';
  text: string;
};

type Props = {
  sectionClassName?: string;
};

function getBackupError(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    return fallback;
  }

  return error instanceof Error && error.message ? error.message : fallback;
}

const BackupSettings = ({sectionClassName}: Props) => {
  const settingsFileRef = useRef<HTMLInputElement>(null);
  const savedFileRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<BackupNotice | null>(null);
  const [busy, setBusy] = useState(false);

  const handleExportSettings = () => {
    try {
      exportSettingsBackup();
      setNotice({tone: 'success', text: 'Файл налаштувань завантажено.'});
    } catch (error) {
      setNotice({
        tone: 'error',
        text: getBackupError(error, 'Не вдалося експортувати налаштування.'),
      });
    }
  };

  const handleSettingsImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || busy) return;

    if (!window.confirm('Імпорт замінить поточні налаштування. Продовжити?')) {
      return;
    }

    setBusy(true);
    setNotice(null);

    try {
      await importSettingsBackup(file);
      setNotice({tone: 'success', text: 'Налаштування успішно імпортовано.'});
    } catch (error) {
      setNotice({
        tone: 'error',
        text: getBackupError(error, 'Не вдалося імпортувати налаштування.'),
      });
    } finally {
      setBusy(false);
    }
  };

  const handleExportSaved = async () => {
    setBusy(true);
    setNotice(null);

    try {
      await exportSavedBackup();
      setNotice({tone: 'success', text: 'Файл збережень завантажено.'});
    } catch (error) {
      setNotice({
        tone: 'error',
        text: getBackupError(error, 'Не вдалося експортувати збереження. Перевір, чи запущений сервер.'),
      });
    } finally {
      setBusy(false);
    }
  };

  const handleSavedImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || busy) return;

    if (!window.confirm(
      'Імпорт повністю замінить усі збережені пости та колекції на сервері. Продовжити?'
    )) {
      return;
    }

    setBusy(true);
    setNotice(null);

    try {
      const result = await importSavedBackup(file);
      setNotice({
        tone: 'success',
        text: `Імпортовано ${result.posts} ${pluralizePosts(result.posts)}. Колекцій: ${result.collections}.`,
      });
    } catch (error) {
      setNotice({
        tone: 'error',
        text: getBackupError(error, 'Не вдалося імпортувати збереження.'),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={sectionClassName}>
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
              disabled={busy}
            >
              Експорт
            </button>
            <button
              type="button"
              className={styles.backupButton}
              onClick={() => settingsFileRef.current?.click()}
              disabled={busy}
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
              disabled={busy}
            >
              Експорт
            </button>
            <button
              type="button"
              className={styles.backupButton}
              onClick={() => savedFileRef.current?.click()}
              disabled={busy}
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

        {notice && (
          <p
            className={`${styles.notice} ${
              notice.tone === 'error' ? styles.noticeError : styles.noticeSuccess
            }`}
            role="status"
          >
            {notice.text}
          </p>
        )}
      </div>
    </section>
  );
};

export default BackupSettings;
