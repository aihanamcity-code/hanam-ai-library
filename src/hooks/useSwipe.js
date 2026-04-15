import { useRef, useCallback } from 'react';

/**
 * useSwipe – lightweight touch swipe detection hook
 * @param {Function} onSwipeLeft  – called when user swipes left
 * @param {Function} onSwipeRight – called when user swipes right
 * @param {number}   threshold   – minimum px to register as a swipe (default 50)
 * @returns {{ onTouchStart, onTouchEnd }} – spread onto the element you want to capture swipes on
 */
export function useSwipe(onSwipeLeft, onSwipeRight, threshold = 50) {
  const startX = useRef(null);
  const startY = useRef(null);

  const onTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (startX.current === null) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - startX.current;
    const dy = touch.clientY - startY.current;

    // Ignore if predominantly vertical (scrolling)
    if (Math.abs(dy) > Math.abs(dx)) {
      startX.current = null;
      return;
    }

    if (dx < -threshold && onSwipeLeft) onSwipeLeft();
    if (dx > threshold && onSwipeRight) onSwipeRight();
    startX.current = null;
  }, [onSwipeLeft, onSwipeRight, threshold]);

  return { onTouchStart, onTouchEnd };
}
