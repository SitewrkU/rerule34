import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {useAppStore} from "../../store/appStore.ts";

import UserStep from "./Steps/UserStep.tsx";
import BlacklistStep from "./Steps/BlacklistStep.tsx";
import FinishStep from "./Steps/FinishStep.tsx";

import { Steps, Button } from 'antd';
import styles from './SetupPage.module.css'

const steps = [
  {
    title: 'Користувач',
    content: <UserStep/>
  },
  {
    title: 'Блек-ліст',
    content: <BlacklistStep/>
  },
  {
    title: 'Фініш',
    content: <FinishStep/>
  },
]

const SetupPage = () => {
  const [current, setCurrent] = useState(0)
  const setConfigured = useAppStore((s) => s.setConfigured)
  const userName = useAppStore((s) => s.userName)
  const navigate = useNavigate()

  const next = () => setCurrent((c) => c + 1)
  const prev = () => setCurrent((c) => c - 1)

  const handleEndSetup = () => {
    setConfigured(true)
    navigate('/');
  }

  const canGoNext = () => {
    if (current === 0) return userName.trim().length > 0;
    return true;
  };


  const isLastStep = current === steps.length - 1;

  return (
    <div className={styles.setupPage}>
      <Steps
        className={styles.steps}
        responsive={false}
        current={current}
        titlePlacement="vertical"
        items={steps.map((s) => ({ title: s.title }))}
      />

      <div>
        {steps[current].content}
      </div>

      <div className={styles.buttons}>
        <Button onClick={prev} disabled={current === 0}>
          Назад
        </Button>

        {isLastStep ? (
          <Button type="primary" className={styles.primaryButton} onClick={handleEndSetup}>
            Завершити
          </Button>
        ) : (
          <Button type="primary" className={styles.primaryButton} onClick={next} disabled={!canGoNext()}>
            Далі
          </Button>
        )}
      </div>
    </div>
  );
};

export default SetupPage;