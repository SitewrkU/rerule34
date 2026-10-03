import { Button } from 'antd';
import styles from './AgeCheck.module.css'
import {useAppStore} from "../../../store/appStore.ts";

const AgeCheck = () => {
  const set18Confirmed = useAppStore(s => s.set18Confirmed)
  return (
    <div className={styles.container}>
      <h1>Стоп..!</h1>
      <p className={styles.mainText}>А тобі точно є 18+ років?</p>
      <p className={styles.additionalText}>(Цей клієнт для перегляду контенту дорослого характеру)</p>

      <div className={styles.buttons}>
      <Button type="primary" className={styles.primaryButton}  href="https://www.google.com/search?q=funny+cat+meme&udm=2" target="_blank" rel="noopener noreferrer">
        Ні немає!
      </Button>
      <Button type="primary" className={styles.primaryButton}  href="https://youtu.be/k4Q4PW6Q4K8" target="_blank" rel="noopener noreferrer">
        Не знаю...
      </Button>
      <Button type="primary" className={styles.primaryButton} onClick={() => {set18Confirmed()}}>
        Мені є 18.
      </Button>
      </div>
    </div>
  );
};

export default AgeCheck;