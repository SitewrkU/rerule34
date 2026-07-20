import {ChevronDown, Tag, RemoveCircle, AddCircle} from "clicons-react";
import { Button, Dropdown, Collapse } from 'antd';
import styles from './SearchTagsBlock.module.css'
import {blackThemes, useBlacklistStore} from "../../store/blackListStore.ts";
import clsx from "clsx";

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

          <div className={styles.ddHeader}>
            <div className={styles.headerIcon}>
              <Tag size={18} strokeWidth={3}/>
            </div>
            <div className={styles.headerText}>
              <p>Додаткові теги</p>
              <p>Відкидаються або додаються під час пошуку</p>
            </div>
          </div>

          <Collapse
            className={styles.collapse}
            ghost
            expandIcon={() => null}
            items={[
              {
                key: '1',
                label: (
                  <div className={clsx(styles.collapseHeader, styles.chRemove)}>
                    <RemoveCircle/>
                    <p>Теги, які виключаються</p>
                    <p>-{filteredTags.length}</p>
                  </div>

                ),
                children: <p className={styles.tagstoremove}>
                  {filteredTags.map((tag, i) => (
                    <span key={i}>{tag}</span>
                  ))}
                </p>,
              },
              {
                key: '2',
                label: (
                  <div className={clsx(styles.collapseHeader, styles.chAdd)}>
                    <AddCircle/>
                    <p>Теги, які додаються</p>
                    <p>+0</p>
                  </div>
                ),
                children: <p>Тут будуть теги</p>,
              },
            ]}
          />

        </div>
      )}
    >
      <Button className={styles.button} icon={<ChevronDown className={styles.dropIcon}/>}>
        <div>
          <Tag size={18} strokeWidth={3} className={styles.tagIcon}/>
          <p className={styles.removed}>-{filteredTags.length}</p>
          <p className={styles.added}>+0</p>
        </div>
      </Button>
    </Dropdown>
  );
};

export default SearchTagsBlock;