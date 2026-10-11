import styles from './AgeCheck.module.css'
import {useAppStore} from "../../../store/appStore.ts";

const AgeCheck = () => {
  const set18Confirmed = useAppStore(s => s.set18Confirmed)
  return (
    <div className={styles.container}>
      <p className={styles.upperText}>Підтвердження віку</p>

      <p className={styles.mainText}>Вам виповнилося 18 років?</p>

      <p className={styles.additionalText}>Цей застосунок призначений виключно да повнолітіх користувачів</p>

      <div className={styles.buttons}>
        <button
          type="button"
          className={`${styles.button} ${styles.confirm}`}
          onClick={() => set18Confirmed()}
        >
          Так, мені є 18 років
        </button>

        <a
          className={`${styles.button} ${styles.decline}`}
          href="https://www.pinterest.com/onlycatshirts/cat-memes/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ні, мені немає 18 років
        </a>
      </div>
    </div>
  );
};

export default AgeCheck;