import React from 'react';

export default function PlaceholderPage({ title }) {
  return (
    <div className="w-full min-h-[calc(100vh-200px)] flex items-center justify-center bg-black text-white">
      <div className="text-center fade-in-up">
        <span className="material-symbols-outlined text-white/40 text-[64px] mb-6 block font-light">construction</span>
        <h2 className="text-[32px] font-bold text-white mb-4 tracking-tight">{title}</h2>
        <p className="text-[18px] text-zinc-400 font-medium tracking-wide">해당 페이지는 구축 중입니다.</p>
      </div>
    </div>
  );
}
