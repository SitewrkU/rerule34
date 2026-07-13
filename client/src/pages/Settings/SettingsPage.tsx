import { useNavigate } from 'react-router-dom';
import SettingSwitch from "./components/SettingsSwitcher/Switcher.tsx";
import SettingRadioGroup from "./components/SettingsRadioGroup/Radio.tsx";

import {ChevronLeft} from "clicons-react";
import styles from './SettingsPage.module.css'
import clsx from "clsx";

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
      <div className={styles.sectionList}>
      <section>
        <SettingRadioGroup
          settingKey="theme"
          label="Тема оформлення" text="Які кольори тобі більше подобаються?"
          options={[
            {label: 'Темня', value: 'dark'},
            {label: 'Світла', value: 'light'},
            {label: 'Оригінальна', value: 'original'},
          ]}
        />
        <SettingSwitch settingKey="kittyMode" label="Kitty Mode" text="Ти прийшов сюди не за тим, що і всі.. Котики!"/>
      </section>
      </div>
    </div>
  );
};

export default SettingsPage;