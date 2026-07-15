import {useBlacklistStore} from "../../../store/blackListStore.ts";
import {blackThemes} from "../../../store/blackListStore.ts";

import styles from "./Step.module.css";

const BlacklistStep = () => {
  const toggle = useBlacklistStore((s) => s.toggle);
  const selected = useBlacklistStore((s) => s.selected);
  return (
    <div className={styles.stepContainer}>
      <h1>Блек-ліст</h1>
      <p className={styles.infoP}>Знайди теми, які для тебе є неприйнятними, та позначи їх. (Попередження: Можливий шокуючий контент)</p>
      <div className={styles.blacklist}>
        {blackThemes.map((b) => (
          <label key={b.title} className={styles.blacklistCheckbox}>
            <input
              type="checkbox"
              checked={selected.includes(b.title)}
              onChange={() => toggle(b.title)}
              className={styles.checkboxInput}
            />
            <span className={styles.checkboxBox} aria-hidden="true" />
            <div>
              <p className={styles.title}>{b.title}</p>
              <p className={styles.description}>{b.description}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default BlacklistStep;