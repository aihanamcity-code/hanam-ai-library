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
      {/* [레이어 1] 배경 오버레이 (클릭 시 닫힘) */}
      <div 
        className="absolute inset-0 bg-black/90 cursor-pointer" 
        onClick={onClose}
      ></div>

      {/* [레이어 2] 이미지 컨테이너 (컨테이너는 클릭 통과, 이미지 자체는 버블링 차단) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img 
          src={imageUrl} 
          alt="확대 이미지" 
          className="max-w-full max-h-[90vh] object-contain pointer-events-auto cursor-default drop-shadow-2xl animate-in zoom-in duration-300"
          onClick={(e) => e.stopPropagation()} 
        />
      </div>

      {/* [레이어 3] 닫기 버튼 (완벽한 버블링 차단 및 클릭 이벤트 강제 보장) */}
      <button 
        className="absolute top-6 right-6 z-[999999] pointer-events-auto p-4 bg-black/50 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all border border-white/10"
        onClick={(e) => { 
          e.stopPropagation(); 
          onClose(); 
        }}
      >
        <span className="material-symbols-outlined text-3xl">close</span>
      </button>
    </div>
  );
}
