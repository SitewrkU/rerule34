import type {Post} from "@rerule34/shared/types/post.ts";
import {useCallback, useEffect, useState} from "react";
import {getPosts} from "../../../../utils/api.ts";
import {PostItem} from "../postItem/PostItem.tsx";
import {useSearchStore} from "../../../../store/searchStore.ts";
import {useSettingsStore} from "../../../../store/settingsStore.ts";
import {useSearchQuery} from "../../../../utils/useSearchQuery.ts";

import { Pagination } from 'antd';

import styles from './Posts.module.css'
import clsx from 'clsx';
import {FavouriteCircle, Search, ImageDownload2, Delete3} from "clicons-react";

const PAGE_SIZE = 30; // постів на одну стоірнку
const PAGES_PER_BATCH = 3; // к-ть сторінок які тягнуться за запит
const BATCH_SIZE = PAGE_SIZE * PAGES_PER_BATCH; // для апі, скільки всього треба повернуи

const Posts = () => {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [maxPageReached, setMaxPageReached] = useState(1);
  const [loadedBatches, setLoadedBatches] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const SearchBarParams = useSearchStore((state) => state.params);
  const query = useSearchQuery();
  const resetParams = useSearchStore((state) => state.resetParams);
  const settings = useSettingsStore((state) => state.settings);

  const paginationClassName = clsx(
    styles.pagination,
    {
      [styles.pagLeft]: settings.paginationPos === 'left',
      [styles.pagCenter]: settings.paginationPos === 'center',
      [styles.pagRight]: settings.paginationPos === 'right',
    }
  );

  // Основна функція загрузки постів (Працює на оновлення пошукових параметрів та на некст сторінку)
  const loadBatch = useCallback(async (batchIndex: number) => {
    if(SearchBarParams.tags === '') return;
    setLoading(true);

    try{
      const data = await getPosts({
        tags: query,
        limit: BATCH_SIZE,
        pid: batchIndex
      });
      const newPosts = data.data;

      setAllPosts(prev => batchIndex === 0 ? newPosts : [...prev, ...newPosts]);
      setHasMore(newPosts.length === BATCH_SIZE); // чек чи не прийшло менше, якщо прийшло то кінець
      setLoadedBatches(batchIndex + 1)
    }catch (e) {
      console.error('Помилка при завантаженні постів:', e)
    }finally {
      setLoading(false);
    }
  }, [SearchBarParams.tags, query]);


  const resetAndReload = useCallback(() => {
    setAllPosts([]);
    setPage(1);
    setMaxPageReached(1);
    setLoadedBatches(0);
    setHasMore(true);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    resetAndReload();
    if (SearchBarParams.tags !== '') {
      void loadBatch(0);
    }
  }, [SearchBarParams.tags]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClearClick  = () => {
    resetParams();
  };



  const handlePageChange = (newPage: number) => {
    const requiredBatch = Math.floor((newPage - 1) / PAGES_PER_BATCH);
    if (requiredBatch >= loadedBatches && hasMore) {
      void loadBatch(requiredBatch);
    }

    setPage(newPage);
    setMaxPageReached(prev => Math.max(prev, newPage)); // ключова формула
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  const viewedPostsCount = Math.min(maxPageReached * PAGE_SIZE, allPosts.length);
  const currentPagePosts = allPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // приблизний total те, що вже точно є + запас якщо hasMore
  const estimatedTotal = hasMore
    ? allPosts.length + PAGE_SIZE
    : allPosts.length;

  return (
    <div>
      {allPosts.length > 0 ? (
        <div>
          <div className={styles.pageInfo}>
            <div className={styles.totalPosts}>
              <p>
                <ImageDownload2/>
                {viewedPostsCount}
                <Delete3 className={styles.erarsePosts} onClick={handleClearClick}/>
              </p>
            </div>
            <div className={styles.searchInputView}><p><Search/> {SearchBarParams.tags}</p></div>
          </div>

          {settings.paginationOnTop ? (
            <Pagination
              className={clsx(styles.pagination, paginationClassName)}
              align="center"
              current={page}
              pageSize={PAGE_SIZE}
              total={estimatedTotal}
              onChange={handlePageChange}
              showSizeChanger={false}
              disabled={loading}
            />
          ) : null}


          <div className={styles.posts}>
            {currentPagePosts.map(post => <PostItem key={post.id} post={post} />)}
          </div>

          {!hasMore && (
            <p className={styles.endofpostsText}>Не видно потрібного поста? Спробуй переглянути свій блек-ліст, можливо, він вирізав якийсь пост. Або в пошук відправився не повний запит, перевір і його.</p>
          )}

          <Pagination
            className={clsx(styles.pagination, paginationClassName)}
            align="center"
            current={page}
            pageSize={PAGE_SIZE}
            total={estimatedTotal}
            onChange={handlePageChange}
            showSizeChanger={false}
            disabled={loading}
          />
        </div>
      ) : (
        <div className={styles.siteInfo}>
          <img src="/rer34.png" alt=""/>
          <h1># Re:Rule34</h1>
          <p style={{color: 'grey'}}>*Фляско махає рукою всім відвідувачам сайту*</p>
          <p>Цей проект - повністю open-source вебсайт, який розробляється однією людиною. Він створений не як комерційний продукт, а як спроба переосмислити існуючий сервіс, зробивши його сучаснішим, зручнішим і приємнішим.</p>
          <p>В основі проекту лежить концепція оригінального <a href="https://rule34.xxx/">Rule34</a>, але з повністю переробленим підходом до взаємодії з сайтом. Мета - не просто повторити оригінал, а створити більш комфортну та функціональну альтернативу.</p>
          <p><FavouriteCircle/> Варто також віддати належне оригінальному Rule34. Саме його API використовується для отримання контенту, тому цей проєкт не існував би без їхньої роботи.</p>
          <p>Реалізовані фішки цього клієнту:</p>
          <ul>
            <li>Сучасний та адаптивний інтерфейс</li>
            <li>Приємні анімації</li>
            <li>Відсутність реклами</li>
            <li>Зручніший пошук по тегах</li>
            <li>Краще відображення інформації по постам, в тому числі унікальний пред-перегляд довжини відео</li>
            <li>Розумна та зручна система пагінації сторінок постів</li>
            <li>Детальні налаштування клієнту</li>
            <li>+ Незвичайні фан-налаштування, які роблять перегляд цікавішим</li>
            <li>Система фільтрації потенційно неприємних тем</li>
          </ul>
          <p>[ІНФО]: Проект поки слабо оптимізований під мобільні пристрої. Поки немає влаштованого переглядача контенту, натомість, працює окрема вкладка (що не дуже зручно на деяких мобільних браузерах). Але я постійно працюю над вдосконаленнями, тому це не на довго.</p>
          <p>Робота над проектом триває, а кожне оновлення робить його ще кращим. Дякую за інтерес до нього!</p>
          <p className={styles.version}>Made with love, by BattWrku • v{__APP_VERSION__}</p>
        </div>
      )}
    </div>
  );
};

export default Posts;