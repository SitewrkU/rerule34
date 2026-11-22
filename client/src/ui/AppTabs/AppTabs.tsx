import { useEffect, useRef, useState, type DragEvent } from "react";
import { Add, ArrowLeft, ArrowRight, Cancel, Search, User } from "clicons-react";

import { MAX_TABS, useTabsStore, type AppTab } from "../../store/tabsStore.ts";

import styles from "./AppTabs.module.css";

const AUTHOR_TAG = /^user:(\S+)$/;

function tabTitle(tab: AppTab): string {
  const tags = tab.tags.trim();
  if (!tags) return "Нова вкладка";

  const author = tags.match(AUTHOR_TAG);
  if (author) return `@${author[1]}`;

  return tags;
}

function TabIcon({ tab }: { tab: AppTab }) {
  const tags = tab.tags.trim();
  if (AUTHOR_TAG.test(tags)) return <User />;
  if (tags) return <Search />;
  return null;
}

type DropTarget = { id: string; side: "before" | "after" };

/** Смуга вкладок на головній: одна вкладка = один пошук зі своїм станом. */
const AppTabs = () => {
  const tabs = useTabsStore((s) => s.tabs);
  const activeTabId = useTabsStore((s) => s.activeTabId);
  const activateTab = useTabsStore((s) => s.activateTab);
  const closeTab = useTabsStore((s) => s.closeTab);
  const createTab = useTabsStore((s) => s.createTab);
  const moveTab = useTabsStore((s) => s.moveTab);

  const listRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  const atLimit = tabs.length >= MAX_TABS;

  const updateScrollState = () => {
    const el = listRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  // Колесо миші гортає вкладки по горизонталі, якщо вони не вміщаються.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) > 0 || el.scrollWidth <= el.clientWidth) return;

      const delta = event.deltaY;
      const max = el.scrollWidth - el.clientWidth;
      if ((delta < 0 && el.scrollLeft <= 0) || (delta > 0 && el.scrollLeft >= max)) return;

      event.preventDefault();
      el.scrollLeft = Math.max(0, Math.min(max, el.scrollLeft + delta));
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("scroll", updateScrollState, { passive: true });

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("scroll", updateScrollState);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    updateScrollState();
  }, [tabs]);

  // Активна вкладка завжди має бути видною.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const active = el.querySelector<HTMLElement>(`[data-tab-id="${activeTabId}"]`);
    if (!active) return;

    const a = active.getBoundingClientRect();
    const l = el.getBoundingClientRect();
    if (a.left < l.left) el.scrollLeft -= l.left - a.left + 8;
    else if (a.right > l.right) el.scrollLeft += a.right - l.right + 8;
  }, [activeTabId]);

  const scrollBy = (direction: -1 | 1) => {
    const el = listRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.max(120, el.clientWidth * 0.7), behavior: "smooth" });
  };

  const handleDragStart = (event: DragEvent<HTMLDivElement>, id: string) => {
    setDraggingId(id);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>, id: string) => {
    if (!draggingId || draggingId === id) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    const rect = event.currentTarget.getBoundingClientRect();
    const side: DropTarget["side"] =
      event.clientX < rect.left + rect.width / 2 ? "before" : "after";

    setDropTarget((prev) =>
      prev && prev.id === id && prev.side === side ? prev : { id, side }
    );
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, id: string) => {
    event.preventDefault();
    if (!draggingId) return;

    const side: DropTarget["side"] =
      dropTarget?.id === id ? dropTarget.side : "after";

    const from = tabs.findIndex((tab) => tab.id === draggingId);
    const target = tabs.findIndex((tab) => tab.id === id);

    if (from !== -1 && target !== -1 && draggingId !== id) {
      let insertAt = side === "after" ? target + 1 : target;
      if (from < insertAt) insertAt -= 1;
      moveTab(draggingId, insertAt);
    }

    setDraggingId(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDropTarget(null);
  };

  return (
    <nav className={styles.tabsBar} aria-label="Вкладки">
      <button
        type="button"
        className={`${styles.scrollButton} ${canScrollLeft ? styles.scrollVisible : ""}`}
        onClick={() => scrollBy(-1)}
        aria-label="Прокрутити вкладки вліво"
        tabIndex={canScrollLeft ? 0 : -1}
      >
        <ArrowLeft />
      </button>

      <div className={styles.tabsList} ref={listRef}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const title = tabTitle(tab);
          const isDragging = draggingId === tab.id;
          const drop = dropTarget?.id === tab.id ? dropTarget.side : null;

          const className = [
            styles.tab,
            isActive ? styles.active : "",
            isDragging ? styles.dragging : "",
            drop === "before" ? styles.dropBefore : "",
            drop === "after" ? styles.dropAfter : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div
              key={tab.id}
              data-tab-id={tab.id}
              className={className}
              draggable
              onDragStart={(event) => handleDragStart(event, tab.id)}
              onDragOver={(event) => handleDragOver(event, tab.id)}
              onDrop={(event) => handleDrop(event, tab.id)}
              onDragEnd={handleDragEnd}
              onAuxClick={(event) => {
                if (event.button === 1) {
                  event.preventDefault();
                  closeTab(tab.id);
                }
              }}
            >
              <button
                type="button"
                className={styles.tabMain}
                onClick={() => activateTab(tab.id)}
                title={tab.tags || title}
                aria-current={isActive ? "page" : undefined}
              >
                <span className={styles.tabIcon}>
                  <TabIcon tab={tab} />
                </span>
                <span className={styles.tabTitle}>{title}</span>
              </button>
              <button
                type="button"
                className={styles.closeButton}
                onClick={(event) => {
                  event.stopPropagation();
                  closeTab(tab.id);
                }}
                aria-label={`Закрити вкладку ${title}`}
                title="Закрити"
              >
                <Cancel />
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className={`${styles.scrollButton} ${canScrollRight ? styles.scrollVisible : ""}`}
        onClick={() => scrollBy(1)}
        aria-label="Прокрутити вкладки вправо"
        tabIndex={canScrollRight ? 0 : -1}
      >
        <ArrowRight />
      </button>

      <button
        type="button"
        className={styles.addButton}
        onClick={() => createTab()}
        disabled={atLimit}
        aria-label="Нова вкладка"
        title={atLimit ? `Максимум вкладок: ${MAX_TABS}` : "Нова вкладка"}
      >
        <Add />
      </button>
    </nav>
  );
};

export default AppTabs;
