import { useNavigate } from 'react-router-dom';

import styles from "./BackButton.module.css";
import { ChevronLeft } from "clicons-react";

type Props =
  | { navigateTo: string; onBack?: never }
  | { onBack: () => void; navigateTo?: never };

const BackButton = (props: Props) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if ('onBack' in props) {
      props.onBack();
    } else {
      navigate(props.navigateTo);
    }
  };

  return (
    <button
      type="button"
      aria-label="Назад"
      className={styles.back}
      onClick={handleClick}
    >
      <ChevronLeft size={32} />
    </button>
  );
};

export default BackButton;