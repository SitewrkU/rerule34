import { useCallback, useState, useMemo } from 'react'
import { AutoComplete, Input } from 'antd';
import type { AutoCompleteProps } from 'antd';
import {useSearchStore} from "../../store/searchStore.ts";
import {getTagAutocomplete} from "../../utils/api.ts";
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
  const [value, setValue] = useState('');
  const setParams = useSearchStore((state) => state.setParams);


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

  // Встановлення параметрів з пошука в стор => Загрузка постів, через useEffect в Posts.tsx на стор.параметр
  const handleSubmit = () => {
    setParams({
      tags: value
    })
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