import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

export default function ImageModal({ isOpen, imageUrl, onClose }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen || !imageUrl) return null;

  // createPortal: 컴포넌트 위치와 무관하게 document.body에 직접 마운트
  // 어떠한 stacking context, z-index, overflow 제약도 돌파함
  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        pointerEvents: 'auto',
      }}
    >
      {/* [레이어 1] 배경 오버레이 */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.9)',
          cursor: 'pointer',
        }}
      />

      {/* [레이어 2] 이미지 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <img
          src={imageUrl}
          alt="확대 이미지"
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: '90vw',
            maxHeight: '85vh',
            objectFit: 'contain',
            pointerEvents: 'auto',
            cursor: 'default',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
          }}
        />
      </div>

      {/* [레이어 3] 닫기 버튼 */}
      <button
        id="modal-close-button"
        onClick={(e) => {
          console.log("닫기 버튼 눌림");
          e.stopPropagation();
          onClose();
        }}
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
          border: '1px solid rgba(255,255,255,0.25)',
          color: 'white',
          fontSize: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ✕
      </button>
    </div>,
    document.body // React 컴포넌트 트리를 완전히 탈출, body에 직접 마운트
  );
}
