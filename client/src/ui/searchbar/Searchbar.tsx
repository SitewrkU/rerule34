import { useCallback, useState, useMemo } from 'react'
import { AutoComplete, Input } from 'antd';
import type { AutoCompleteProps } from 'antd';
import {useTabsStore, selectActiveTab} from "../../store/tabsStore.ts";
import {getTagAutocomplete} from "../../utils/api/posts.ts";
import styles from './Searchbar.module.css'

const parseCount = (label: string): string | null => {
  const match = label.match(/\((\d+)\)/);
  return match ? match[1] : null;
};

const debounce = <Args extends unknown[]>(fn: (...args: Args) => void, delay: number) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};


const Searchbar = () => {
  const [options, setOptions] = useState<AutoCompleteProps['options']>([]);
  const activeTab = useTabsStore(selectActiveTab);
  const activeTabId = activeTab?.id ?? "";
  const tags = activeTab?.tags ?? "";
  const submitSearch = useTabsStore((state) => state.submitSearch);

  // Поле показує запит активної вкладки; синхронізація під час рендеру,
  // доки користувач просто друкує — не скидається.
  const [value, setValue] = useState(tags);
  const searchKey = `${activeTabId}\u0000${tags}`;
  const [prevSearchKey, setPrevSearchKey] = useState(searchKey);

  if (searchKey !== prevSearchKey) {
    setPrevSearchKey(searchKey);
    setValue(tags);
    setOptions([]);
  }

  const fetchOptions = useCallback(async (query: string) => {
    if (!query) {
      setOptions([]);
      return;
    }

    try {
      const results = await getTagAutocomplete(query);

      setOptions(
        results.map((item) => {
          const count = parseCount(item.label);
          return {
            value: item.value,
            label: (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.value}</span>
                {count && <span style={{ opacity: 0.6 }}>{count}</span>}
              </div>
            ),
          };
        })
      );
    } catch (err) {
      console.error('Autocomplete error:', err);
      setOptions([]);
    }
  }, []);

  const debouncedFetch = useMemo(
    () => debounce(fetchOptions, 300),
    [fetchOptions]
  );

  // Пошук у поточній вкладці
  const handleSubmit = () => {
    submitSearch(value);
  }

  // Пошук тегів по автокомліту
  const handleSearchTags = (query: string) => {
    setValue(query);

    const currentTag = query.split(/\s+/).pop() ?? ""; // Щоб на api відправлявся тільки останній для autocomplete

    debouncedFetch(currentTag);
  };


  const onSelectTag = (selectedValue: string) => {
    const tags = value.trim().split(/\s+/); // Розбирає всі теги в рядку
    tags[tags.length - 1] = selectedValue; // Змінює тільки останній тег, який не завершений
    const newValue = tags.join(' ') + ' '; // пробіл

    setValue(newValue);
    setOptions([]);
  };



  return (
    <AutoComplete
      popupMatchSelectWidth={252}
      options={options}
      value={value}
      onSelect={onSelectTag}
      onSearch={handleSearchTags}
      className={styles.searchbar}
    >
      <Input.Search
        size="large"
        placeholder="Що сьогодні шукаємо?"
        enterButton onSearch={handleSubmit}
      />
    </AutoComplete>
  );
};

export default Searchbar;