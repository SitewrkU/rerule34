import { useCallback, useEffect, useRef, useState } from "react";

interface Options {
  threshold?: number;// мс утримання до показу
  moveCancel?: number;// px зсуву до старту показу, відміняє лонгпрес
  moveDismiss?: number;// px зсуву під час показу, закриває прев'ю
}

export function useLongPressPreview({
                                      threshold = 350,
                                      moveCancel = 10,
                                      moveDismiss = 40,
                                    }: Options = {}) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const activePointerId = useRef<number | null>(null);
  const wasLongPress = useRef(false);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const closePreview = useCallback(() => {
    clearTimer();
    setIsPreviewOpen(false);
    startPos.current = null;
    activePointerId.current = null;
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;

    activePointerId.current = e.pointerId;
    startPos.current = { x: e.clientX, y: e.clientY };
    wasLongPress.current = false;

    // КЛЮЧОВИЙ ФІКС: гарантуємо, що move/up/cancel прийдуть саме
    // на цей елемент, навіть якщо зверху з'явиться preview-оверлей
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch { /* empty */ }

    clearTimer();
    timerRef.current = setTimeout(() => {
      wasLongPress.current = true;
      setIsPreviewOpen(true);
    }, threshold);
  }, [threshold]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (activePointerId.current !== e.pointerId || !startPos.current) return;

    const dist = Math.hypot(
      e.clientX - startPos.current.x,
      e.clientY - startPos.current.y
    );

    if (isPreviewOpen) {
      if (dist > moveDismiss) closePreview();
    } else if (dist > moveCancel) {
      clearTimer();
    }
  }, [isPreviewOpen, moveCancel, moveDismiss, closePreview]);

  const endPress = useCallback((e: React.PointerEvent) => {
    if (activePointerId.current !== e.pointerId) return;
    clearTimer();

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch { /* empty */ }

    if (isPreviewOpen) closePreview();
    else activePointerId.current = null;
  }, [isPreviewOpen, closePreview]);
  
  const onContextMenu = useCallback((e: React.MouseEvent) => {
    // глушимо системне контекстне меню/callout при утриманні на мобілці
    if (wasLongPress.current || timerRef.current) e.preventDefault();
  }, []);

  const onClick = useCallback((e: React.MouseEvent) => {
    if (wasLongPress.current) {
      e.preventDefault();
      e.stopPropagation();
      wasLongPress.current = false;
    }
  }, []);

  useEffect(() => clearTimer, []);

  return {
    isPreviewOpen,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endPress,
      onPointerCancel: endPress,
      onContextMenu,
      onClick,
    },
  };
}