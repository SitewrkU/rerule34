import {Switch} from "antd";
import {useSettingsStore} from "../../../../store/settingsStore.ts";
import '../defaultSettingsComponents.css'
import styles from './Switcher.module.css'

type BooleanKeys<T> = {
  [K in keyof T]: T[K] extends boolean ? K : never;
}[keyof T];

interface SettingSwitchProps {
  settingKey: BooleanKeys<ReturnType<typeof useSettingsStore.getState>['settings']>;
  label: string;
  text?: string;
  disabled?: boolean;
}

const SettingSwitch = ({ settingKey, label, text, disabled }: SettingSwitchProps) => {
  const value = useSettingsStore((state) => state.settings[settingKey]);
  const updateSettings = useSettingsStore((state) => state.updateSettings);

  const switchEl = (
    <Switch
      checked={value}
      disabled={disabled}
      onChange={(checked) => updateSettings({ [settingKey]: checked } as any)}
    />
  );

  if (!label) return switchEl;

  return (
    <div className={styles.switcher}>
      <div className="info">
        <p>{label}</p>
        <p>{text}</p>
      </div>
      {switchEl}
    </div>
  );
}

export default SettingSwitch;