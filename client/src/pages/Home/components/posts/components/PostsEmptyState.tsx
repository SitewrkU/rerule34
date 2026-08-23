import {ArrowLeft} from "clicons-react";
import styles from '../Posts.module.css';

type PostsEmptyStateProps = {
  searchTags: string;
  onClear: () => void;
};

export const PostsEmptyState = ({searchTags, onClear}: PostsEmptyStateProps) => (
  <div className={styles.emptyState}>
    <h2>Тут нікого, крім нас, курчат!</h2>
    <p>Ми не змогли нічого знайти за запитом "{searchTags}"</p>

    <div className={styles.emptyStateInfo}>
      <p>Це може означати кілька речей:</p>
      <ol>
        <li>Такого контенту, банально, не існує.</li>
        <li>В пошук було відправлено неповний(обрізаний) тег, провір його, "{searchTags}" - це справді те, що ти шукаєш?</li>
        <li>Запит надто важкий: таких комбо(з тегів) навіть в маку немає.</li>
        <li>Якщо це рідкисний тег, або комбінація тегів, то блек-ліст міг обрізати дорогоцінні матеріали. Спробуй відключити блек-ліст, тимчасово: Налаштування =&gt; Блек-ліст =&gt; Включити блек-ліст під час пошуку</li>
        <li>Те саме стосується і налаштувань пошуку</li>
      </ol>
    </div>
    <ArrowLeft onClick={onClear} className={styles.emptyStateBack}/>
  </div>
);