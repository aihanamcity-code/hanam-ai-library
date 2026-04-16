import React, { useEffect } from 'react';

export default function ImageModal({ isOpen, imageUrl, onClose }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      style={{ pointerEvents: 'auto' }}
      className="fixed inset-0 z-[99999]"
    >
      {/* [레이어 1] 배경 오버레이 - 직접 onClick 연결 */}
      <div
        className="absolute inset-0 bg-black/90"
        style={{ cursor: 'pointer' }}
        onClick={onClose}
      />

      {/* [레이어 2] 이미지 - w-auto h-auto로 화면 전체를 침범하지 않도록 크기 제한 */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ pointerEvents: 'none' }}
      >
        <img
          src={imageUrl}
          alt="확대 이미지"
          style={{ pointerEvents: 'auto', cursor: 'default', maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain' }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* [레이어 3] 닫기 버튼 - DOM 맨 마지막, id 부여, console.log 포함 */}
      <button
        id="modal-close-button"
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          zIndex: 999999,
          pointerEvents: 'auto',
          cursor: 'pointer',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          lineHeight: 1,
        }}
        onClick={(e) => {
          console.log("닫기 버튼 눌림");
          e.stopPropagation();
          onClose();
        }}
      >
        ✕
      </button>
    </div>
  );
}
