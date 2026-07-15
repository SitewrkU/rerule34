import {useBlacklistStore, blackThemes} from "../../../store/blackListStore.ts";
import {useAppStore} from "../../../store/appStore.ts";
import styles from "./Step.module.css";

const FinishStep = () => {
  const userName = useAppStore((s) => s.userName);
  const selected = useBlacklistStore((s) => s.selected)

  const selectedThemes = blackThemes.filter(theme =>
    selected.includes(theme.title)
  );

  const filteredTags = selectedThemes.flatMap(theme => theme.tags);

  return (
    <div className={styles.stepContainer}>
      <h1>Готово!</h1>
      <p className={styles.infoLongP}>Ми налаштували цей клієнт під тебе, {userName}!</p>
      <p className={styles.infoLongP}>
        Тепер все готово, за для зручності використання, та пошуку контенту.
        {filteredTags.length > 0 ? (
          <span> Також ми сховали <b>{filteredTags.length}</b> тегів для тебе. Все, заради того, щоб пошук контенту давав тільки приємні відчуття!</span>
        ) : (
          <span> І ми <b>не ховали</b> ніяких тегів для тебе. Здається, тобі не привикати</span>
        )}

      </p>
      <p></p>
    </div>
  );
};

export default FinishStep;