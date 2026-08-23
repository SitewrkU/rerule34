import styles from '../Posts.module.css';

type PostsErrorStateProps = {
  error: string;
  onRetry: () => void;
};

export const PostsErrorState = ({error, onRetry}: PostsErrorStateProps) => (
  <div className={styles.errorState}>
    <p>{error}</p>
    <button onClick={onRetry}>Повторити</button>
  </div>
);