import clsx from "clsx";
import {blackThemes, useBlacklistStore} from "../../../../store/blackListStore.ts";
import {useSettingsStore} from "../../../../store/settingsStore.ts";
import styles from "./BlacklistSettings.module.css";

const BlacklistSettings = () => {
  const selected = useBlacklistStore((s) => s.selected);
  const toggle = useBlacklistStore((s) => s.toggle);
  const isBlacklistEnabled = useSettingsStore((s) => s.settings.enableBlacklist);

  const selectedTitles = new Set(selected);
  const selectedCount = blackThemes.filter((theme) => selectedTitles.has(theme.title)).length;

  return (
    <div className={clsx(styles.blacklistSettings, !isBlacklistEnabled && styles.inactive)}>
      <div className={styles.header}>
        <span className={styles.title}>Теми блек-лісту</span>
        <span className={styles.hint}>
          {isBlacklistEnabled ? "клікни, щоб приховати" : "блек-ліст вимкнено"}
        </span>
        <span className={styles.counter}>
          {selectedCount} / {blackThemes.length}
        </span>
      </div>

      <div className={styles.grid}>
        {blackThemes.map((theme) => {
          const checked = selectedTitles.has(theme.title);

          return (
            <label
              key={theme.title}
              title={`${theme.title} — ${theme.description}`}
              className={clsx(styles.theme, checked && styles.checked)}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(theme.title)}
                className={styles.input}
              />
              <span className={styles.checkbox} aria-hidden="true" />
              <span className={styles.themeTitle}>{theme.title}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default BlacklistSettings;
