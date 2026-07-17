import {ChevronDown, Tag, RemoveSquare, AddSquare} from "clicons-react";
import { Button, Dropdown, Collapse } from 'antd';
import styles from './SearchTagsBlock.module.css'
import {blackThemes, useBlacklistStore} from "../../store/blackListStore.ts";

const SearchTagsBlock = () => {
  const selected = useBlacklistStore((s) => s.selected)

  const selectedThemes = blackThemes.filter(theme =>
    selected.includes(theme.title)
  );

  const filteredTags = selectedThemes.flatMap(theme => theme.tags);


  return (
    <Dropdown
      trigger={['hover']}
      popupRender={() => (
        <div className={styles.dropdown}>
          <p className={styles.ddHeader}><Tag size={18} strokeWidth={3}/> Додаткові теги, які відкидаються або додаються під час пошуку</p>
          <Collapse
            className={styles.collapse}
            ghost
            expandIcon={() => null}
            items={[
              {
                key: '1',
                label: (
                  <p><RemoveSquare className={styles.iconRemove}/> Теги, які були прибрані з пошуку:</p>
                ),
                children: <p className={styles.tagstoremove}>
                  {filteredTags.map((tag, i) => (
                    <span key={i}>{tag} </span>
                  ))}
                </p>,
              },
              {
                key: '2',
                label: (
                  <p className={styles.tagstoadd}><AddSquare className={styles.iconAdd}/> Теги, які були добавлені в пошук:</p>
                ),
                children: <p>Тут будуть теги</p>,
              },
            ]}
          />

        </div>
      )}
    >
      <Button className={styles.button} icon={<ChevronDown />}>
        <div>
          <p className={styles.removed}>-{filteredTags.length}</p>
          <p className={styles.added}>+0</p>
        </div>
      </Button>
    </Dropdown>
  );
};

export default SearchTagsBlock;