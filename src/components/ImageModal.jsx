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
    <div className="fixed inset-0 z-[99999] animate-in fade-in duration-300">
      {/* [레이어 1] 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-pointer" 
        onClick={onClose}
      ></div>

      {/* [레이어 2] 이미지 컨테이너 (클릭 투과 설정) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4 md:p-8">
        <img 
          src={imageUrl} 
          alt="확대 이미지" 
          className="max-w-full max-h-full object-contain pointer-events-auto cursor-zoom-out drop-shadow-2xl animate-in zoom-in duration-300"
          onClick={onClose} 
        />
      </div>

      {/* [레이어 3] 닫기 버튼 (DOM 최하단 배치, 최상위 z-index 강제 활성화) */}
      <button 
        className="absolute top-6 right-6 z-[999999] pointer-events-auto p-4 bg-black/50 text-white rounded-full border border-white/10 hover:bg-white/20 transition-all flex items-center justify-center cursor-pointer shadow-lg"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
      >
        <span className="material-symbols-outlined text-3xl">close</span>
      </button>
    </div>
  );
}
