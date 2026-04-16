import React, { useState, useRef, useEffect, useCallback } from 'react';

const MIN_SCALE = 0.5;
const MAX_SCALE = 6;
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

/**
 * ZoomableImage
 * – 마우스 휠 / 트랙패드 : 줌 인·아웃
 * – 핀치 투 줌 (터치)     : 줌 인·아웃
 * – 드래그 / 터치 드래그  : 줌 상태에서 이동
 * – 더블클릭             : 1× ↔ 2.5× 토글
 * – 버튼 컨트롤          : + / − / 원래 크기
 */
export default function ZoomableImage({ src, alt }) {
  const [scale, setScale]   = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isDragging  = useRef(false);
  const dragOrigin  = useRef({ x: 0, y: 0 });
  const lastOffset  = useRef({ x: 0, y: 0 });
  const pinchDist   = useRef(null);
  const containerRef = useRef(null);

  // src 바뀌면 리셋
  useEffect(() => { setScale(1); setOffset({ x: 0, y: 0 }); }, [src]);

  // ── 마우스 휠 ──
  const onWheel = useCallback((e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    setScale(s => clamp(s * factor, MIN_SCALE, MAX_SCALE));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  // ── 마우스 드래그 ──
  const onMouseDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    dragOrigin.current = { x: e.clientX, y: e.clientY };
    lastOffset.current = offset;
  };

  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    setOffset({
      x: lastOffset.current.x + (e.clientX - dragOrigin.current.x),
      y: lastOffset.current.y + (e.clientY - dragOrigin.current.y),
    });
  };

  const onMouseUp = () => { isDragging.current = false; };

  // ── 더블클릭 ──
  const onDoubleClick = () => {
    if (scale !== 1) { setScale(1); setOffset({ x: 0, y: 0 }); }
    else setScale(2.5);
  };

  // ── 핀치 & 터치 드래그 ──
  const getPinchDist = (t) => {
    const dx = t[0].clientX - t[1].clientX;
    const dy = t[0].clientY - t[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      pinchDist.current = getPinchDist(e.touches);
    } else if (e.touches.length === 1) {
      isDragging.current = true;
      dragOrigin.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastOffset.current = offset;
    }
  };

  const onTouchMove = (e) => {
    if (e.touches.length === 2 && pinchDist.current !== null) {
      e.preventDefault();
      const next = getPinchDist(e.touches);
      const ratio = next / pinchDist.current;
      setScale(s => clamp(s * ratio, MIN_SCALE, MAX_SCALE));
      pinchDist.current = next;
    } else if (e.touches.length === 1 && isDragging.current) {
      setOffset({
        x: lastOffset.current.x + (e.touches[0].clientX - dragOrigin.current.x),
        y: lastOffset.current.y + (e.touches[0].clientY - dragOrigin.current.y),
      });
    }
  };

  const onTouchEnd = () => { isDragging.current = false; pinchDist.current = null; };

  // ── 버튼 핸들러 ──
  const zoomIn  = (e) => { e.stopPropagation(); setScale(s => clamp(s * 1.3, MIN_SCALE, MAX_SCALE)); };
  const zoomOut = (e) => { e.stopPropagation(); setScale(s => clamp(s / 1.3, MIN_SCALE, MAX_SCALE)); };
  const reset   = (e) => { e.stopPropagation(); setScale(1); setOffset({ x: 0, y: 0 }); };

  const pct = Math.round(scale * 100);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden select-none"
      style={{ cursor: scale > 1 ? 'grab' : 'zoom-in' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onDoubleClick={onDoubleClick}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* 이미지 */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="max-w-full max-h-full object-contain drop-shadow-2xl"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          transition: isDragging.current ? 'none' : 'transform 0.15s ease',
          willChange: 'transform',
        }}
        key={src}
      />

      {/* ── 줌 컨트롤 HUD ── */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/70 backdrop-blur-md border border-white/15 shadow-2xl z-20"
        onMouseDown={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={zoomOut}
          title="축소"
          className="w-7 h-7 rounded-full flex items-center justify-center text-white hover:bg-white/15 transition-colors active:scale-90"
        >
          <span className="material-symbols-outlined text-[18px]">remove</span>
        </button>

        <button
          onClick={reset}
          title="원래 크기"
          className="min-w-[46px] h-7 px-2 rounded-full text-white text-[11px] font-mono font-semibold hover:bg-white/15 transition-colors tabular-nums"
        >
          {pct}%
        </button>

        <button
          onClick={zoomIn}
          title="확대"
          className="w-7 h-7 rounded-full flex items-center justify-center text-white hover:bg-white/15 transition-colors active:scale-90"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
        </button>

        {/* 리셋 버튼 – 줌 적용 중일 때만 표시 */}
        {scale !== 1 && (
          <button
            onClick={reset}
            title="리셋"
            className="ml-1 w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-all active:scale-90"
          >
            <span className="material-symbols-outlined text-[16px]">fit_screen</span>
          </button>
        )}
      </div>

      {/* 힌트: 줌=1 일 때만 표시 */}
      {scale === 1 && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white/50 text-[11px] pointer-events-none">
          스크롤·핀치로 확대 | 더블클릭 2.5×
        </div>
      )}
    </div>
  );
}
