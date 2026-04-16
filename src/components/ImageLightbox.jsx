import React, { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import ZoomableImage from './ZoomableImage';

/**
 * ImageLightbox
 *
 * Props:
 *   images    {string[]}  – 이미지 URL 배열
 *   startIndex {number}   – 처음 표시할 인덱스 (기본값 0)
 *   onClose   {function} – 닫기 콜백
 *
 * 사용 예시:
 *   <ImageLightbox images={post.images} startIndex={2} onClose={() => setLightbox(null)} />
 */
export default function ImageLightbox({ images, startIndex = 0, onClose }) {
  const [idx, setIdx] = useState(startIndex);

  const total = images?.length ?? 0;
  const canNav = total > 1;

  const prev = useCallback(() => setIdx(i => (i === 0 ? total - 1 : i - 1)), [total]);
  const next = useCallback(() => setIdx(i => (i + 1) % total), [total]);

  // 키보드 단축키
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, prev, next]);

  // 스크롤 잠금
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // idx가 startIndex 바뀔 때 동기화
  useEffect(() => { setIdx(startIndex); }, [startIndex]);

  if (!images || total === 0) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999]"
      aria-modal="true"
      role="dialog"
    >
      {/* ── 반투명 배경 오버레이 ── */}
      <div
        className="absolute inset-0 bg-black/92 backdrop-blur-2xl"
        onClick={onClose}
        aria-label="닫기"
      />

      {/* ── 이미지 뷰어 영역 ── */}
      {/* 핵심 수정: top-16으로 닫기 버튼 영역(상단 64px)을 물리적으로 침범 불가하게 설정 */}
      <div className="absolute top-16 bottom-0 left-0 right-0 flex flex-col items-center justify-center p-4 md:p-10 select-none">

        {/* ZoomableImage 활용 */}
        <div
          className="w-full h-full max-w-5xl max-h-[85vh] flex items-center justify-center"
          style={{ animation: 'lb-fadein 0.25s ease' }}
          key={idx}
        >
          <ZoomableImage src={images[idx]} alt={`이미지 ${idx + 1}`} />
        </div>

        {/* ── 이전 / 다음 버튼 ── */}
        {canNav && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center bg-black/50 hover:bg-black/80 border border-white/20 text-white transition-all active:scale-90 shadow-2xl backdrop-blur-md group"
              aria-label="이전 이미지"
            >
              <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform mr-1">
                arrow_back_ios
              </span>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center bg-black/50 hover:bg-black/80 border border-white/20 text-white transition-all active:scale-90 shadow-2xl backdrop-blur-md group"
              aria-label="다음 이미지"
            >
              <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform ml-1">
                arrow_forward_ios
              </span>
            </button>
          </>
        )}

        {/* ── 페이지 인디케이터 (하단 점) ── */}
        {canNav && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-2xl">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === idx
                    ? 'bg-white w-6 shadow-[0_0_10px_rgba(255,255,255,0.8)]'
                    : 'bg-white/40 w-2 hover:bg-white/60'
                }`}
                aria-label={`이미지 ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* ── 이미지 카운터 (좌상단) ── */}
        {canNav && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/70 text-[13px] font-medium">
            {idx + 1} / {total}
          </div>
        )}
      </div>

      {/* ── 닫기 버튼 ── */}
      {/* 핵심 수정: DOM 최하단 배치 + fixed 포지셔닝으로 어떤 형제 요소와도 독립 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 99999,
          pointerEvents: 'auto',
        }}
        className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all active:scale-90 shadow-xl backdrop-blur-md cursor-pointer"
        title="닫기 (ESC)"
        aria-label="라이트박스 닫기"
      >
        <span className="material-symbols-outlined text-2xl">close</span>
      </button>

      {/* 인라인 애니메이션 keyframes */}
      <style>{`
        @keyframes lb-fadein {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>,
    document.body,
  );
}
