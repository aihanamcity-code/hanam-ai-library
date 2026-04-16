import React, { useEffect } from 'react';

export default function ImageModal({ isOpen, imageUrl, onClose }) {
  // 모달이 열리면 배경 스크롤 방지
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-[9999] animate-in fade-in duration-300">
      {/* 1. 배경 레이어 (어두운 배경 영역, 클릭 시 닫힘) */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      {/* 2. 이미지 컨테이너 레이어 (컨테이너 내 빈 공간의 클릭 가로채기 방지) */}
      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8 pointer-events-none">
        {/* 실제 이미지 영역만 클릭 이벤트 활성화 */}
        <img 
          src={imageUrl} 
          alt="확대된 이미지" 
          className="max-w-full max-h-full object-contain animate-in zoom-in duration-300 drop-shadow-2xl pointer-events-auto cursor-zoom-out"
          onClick={onClose} 
        />
      </div>

      {/* 3. 닫기 버튼 레이어 (DOM 최하단 배치, 최상단 z-index, 클릭 강제 활성화) */}
      <button 
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-4 right-4 md:top-6 md:right-6 w-16 h-16 p-2 flex items-center justify-center rounded-full bg-black/50 border border-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all z-[99999] pointer-events-auto cursor-pointer"
      >
        <span className="material-symbols-outlined text-4xl">close</span>
      </button>
    </div>
  );
}
