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
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 md:top-6 md:right-6 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 border border-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all z-10"
      >
        <span className="material-symbols-outlined text-2xl">close</span>
      </button>

      {/* 이미지가 화면에 꽉 차도록 max-w-full, max-h-full 및 object-contain 적용 */}
      {/* 훅~ 다가오는 애니메이션(animate-in zoom-in) */}
      <img 
        src={imageUrl} 
        alt="확대된 이미지" 
        className="max-w-full max-h-full object-contain animate-in zoom-in duration-300 drop-shadow-2xl cursor-zoom-out"
        onClick={onClose} // 이미지 클릭 시에도 모달이 닫히도록 설정
      />
    </div>
  );
}
