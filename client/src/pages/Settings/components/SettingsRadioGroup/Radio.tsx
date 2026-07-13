import type {ReactNode} from "react";
import { Radio } from "antd";
import type { RadioChangeEvent } from "antd";
import { useSettingsStore } from "../../../../store/settingsStore.ts";
import '../defaultSettingsComponents.css'
import styles from './Radio.module.css'

type SettingsState = ReturnType<typeof useSettingsStore.getState>['settings'];

interface RadioOption<T> {
  label: ReactNode;
  value: T;
  disabled?: boolean;
}

interface SettingRadioGroupProps<K extends keyof SettingsState> {
  settingKey: K;
  label?: string;
  text?: string;
  options: RadioOption<SettingsState[K]>[];
  disabled?: boolean;
}

const SettingRadioGroup = <K extends keyof SettingsState>({
                                                            settingKey,
                                                            label,
                                                            text,
                                                            options,
                                                            disabled,
                                                          }: SettingRadioGroupProps<K>) => {
  const value = useSettingsStore((state) => state.settings[settingKey]);
  const updateSettings = useSettingsStore((state) => state.updateSettings);

  const onChange = (e: RadioChangeEvent) => {
    updateSettings({ [settingKey]: e.target.value } as Pick<SettingsState, K>);
  };

  const radioGroupEl = (
    <Radio.Group
      vertical
      optionType="button"
      value={value}
      onChange={onChange}
      disabled={disabled}
      options={options}
    />
  );

  if (!label) return radioGroupEl;

  return (
    <div className={styles.radio}>
      <div className="info">
        <p>{label}</p>
        <p>{text}</p>
      </div>
      {radioGroupEl}
    </div>
  );
};

export default SettingRadioGroup;