import React, { useState, useEffect, useCallback } from 'react';
import { useBoard } from '../context/BoardContext';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_LABELS = {
  notice: '공지사항',
  policy: 'AI 정책 분석',
  tip: 'AI & 팁 뱅크',
  card: '정책참고 카드뉴스',
};

const CATEGORY_COLORS = {
  notice: '#34c759',
  policy: '#0071e3',
  tip: '#ff9f0a',
  card: '#bf5af2',
};

// ── Placeholder gradient backgrounds for items without images ──
const GRADIENTS = [
  'from-[#0071e3]/40 to-[#1c1c1e]',
  'from-[#bf5af2]/30 to-[#1c1c1e]',
  'from-[#ff9f0a]/30 to-[#1c1c1e]',
  'from-[#34c759]/20 to-[#1c1c1e]',
];

export default function HeroSlider() {
  const { galleryPosts } = useBoard();
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const featured = galleryPosts.filter(p => p.isFeatured);

  // Auto-advance every 5s
  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % featured.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featured.length]);

  // Block body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = selectedPost ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedPost]);

  const goTo = useCallback((idx) => setActiveIdx(idx), []);

  const openModal = (post) => { setSelectedPost(post); setCurrentImgIndex(0); };
  const closeModal = () => setSelectedPost(null);

  const nextImg = (e) => { e.stopPropagation(); if (!selectedPost?.images?.length) return; setCurrentImgIndex(p => (p + 1) % selectedPost.images.length); };
  const prevImg = (e) => { e.stopPropagation(); if (!selectedPost?.images?.length) return; setCurrentImgIndex(p => p === 0 ? selectedPost.images.length - 1 : p - 1); };

  if (featured.length === 0) return null;

  const active = featured[activeIdx] || featured[0];
  const gradient = GRADIENTS[activeIdx % GRADIENTS.length];
  const catColor = CATEGORY_COLORS[active.category] || '#0071e3';
  const catLabel = CATEGORY_LABELS[active.category] || active.category;

  return (
    <>
      {/* ── Slider Container ── */}
      <section className="w-full px-4 md:px-8 lg:px-12 py-6 bg-black">
        <div className="max-w-[1200px] mx-auto">
          <div
            onClick={() => openModal(active)}
            className="relative w-full h-[280px] md:h-[360px] rounded-3xl overflow-hidden cursor-pointer shadow-[0_8px_48px_rgba(0,0,0,0.7)] border border-white/[0.07] group"
          >
            {/* Blurred background layer */}
            <AnimatePresence mode="sync">
              <motion.div
                key={`bg-${active.id}`}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
              >
                {active.images && active.images.length > 0 ? (
                  <img
                    src={active.images[0]}
                    alt=""
                    className="w-full h-full object-cover scale-110 blur-md brightness-40"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${gradient}`} />
                )}
                {/* Scrim overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              </motion.div>
            </AnimatePresence>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${active.id}`}
                className="absolute inset-0 flex flex-col md:flex-row items-center gap-6 md:gap-10 p-7 md:p-10 z-10"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                {/* Thumbnail */}
                {active.images && active.images.length > 0 && (
                  <div className="hidden md:block shrink-0 w-[180px] h-[200px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group-hover:scale-[1.02] transition-transform duration-500">
                    <img src={active.images[0]} alt={active.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Text */}
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="px-3 py-1 text-[11px] font-bold rounded-full tracking-wider uppercase"
                      style={{ backgroundColor: `${catColor}25`, color: catColor, border: `1px solid ${catColor}40` }}
                    >
                      {catLabel}
                    </span>
                    <span className="text-zinc-500 text-[12px] font-medium">{active.date}</span>
                  </div>

                  <h2 className="text-white text-[20px] md:text-[28px] font-bold tracking-tight leading-snug break-keep mb-3 line-clamp-2">
                    {active.title}
                  </h2>

                  <p className="text-zinc-400 text-sm md:text-[15px] leading-relaxed line-clamp-2 md:line-clamp-3 break-keep">
                    {active.content}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-white/70 group-hover:text-white transition-colors">
                    자세히 보기
                    <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dot Indicators */}
            {featured.length > 1 && (
              <div className="absolute bottom-5 right-7 flex items-center gap-2 z-20">
                {featured.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); goTo(idx); }}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      idx === activeIdx ? 'bg-white w-8 shadow-[0_0_8px_rgba(255,255,255,0.6)]' : 'bg-white/30 w-2 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Auto-progress bar */}
            {featured.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 z-20">
                <motion.div
                  key={activeIdx}
                  className="h-full bg-white/50"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 5, ease: 'linear' }}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Detail Modal ── */}
      {selectedPost && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-6 lg:p-12 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={closeModal}></div>
          <div className="relative w-full max-w-7xl h-full md:h-[85vh] bg-[#1c1c1e] md:rounded-[2rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10 flex flex-col md:flex-row overflow-hidden z-10">

            {/* Left: Image */}
            <div className={`w-full md:w-3/5 bg-black relative flex items-center justify-center group shrink-0 aspect-square md:aspect-auto md:h-full overflow-hidden ${(!selectedPost.images || selectedPost.images.length === 0) ? 'hidden md:flex' : ''}`}>
              {selectedPost.images && selectedPost.images.length > 0 ? (
                <>
                  <div className="w-full h-full p-0 md:p-4 pb-0 flex items-center justify-center">
                    <img src={selectedPost.images[currentImgIndex]} alt={selectedPost.title} className="w-full h-full object-contain animate-in fade-in zoom-in duration-300 drop-shadow-2xl" key={currentImgIndex} />
                  </div>
                  {selectedPost.images.length > 1 && (
                    <>
                      <button onClick={prevImg} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full overflow-hidden flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 shadow-xl">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-lg border border-white/20"></div>
                        <span className="material-symbols-outlined relative z-10 text-white text-xl drop-shadow-md mr-1">arrow_back_ios</span>
                      </button>
                      <button onClick={nextImg} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full overflow-hidden flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 shadow-xl">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-lg border border-white/20"></div>
                        <span className="material-symbols-outlined relative z-10 text-white text-xl drop-shadow-md ml-1">arrow_forward_ios</span>
                      </button>
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 shadow-2xl">
                        {selectedPost.images.map((_, idx) => (
                          <button key={idx} onClick={(e) => { e.stopPropagation(); setCurrentImgIndex(idx); }}
                            className={`h-2 rounded-full transition-all duration-300 ${idx === currentImgIndex ? 'bg-white w-6 shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'bg-white/40 w-2 hover:bg-white/60'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1c1c1e] to-black flex flex-col items-center justify-center p-8 text-center text-white/30 border-r border-white/5">
                  <span className="material-symbols-outlined text-[80px] mb-4 font-light opacity-50">texture_add</span>
                  <p className="font-medium text-lg tracking-wide">이미지가 없습니다</p>
                </div>
              )}
            </div>

            {/* Right: Content */}
            <div className={`w-full flex-col bg-[#1c1c1e] relative shrink-0 ${(!selectedPost.images || selectedPost.images.length === 0) ? 'md:w-2/5 flex h-full border-l-0 md:border-l border-white/10' : 'md:w-2/5 flex h-[calc(100%-100vw)] md:h-full border-t md:border-t-0 md:border-l border-white/20 md:border-white/10'}`}>
              <button onClick={closeModal} className="md:hidden absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-xl active:scale-90 transition-transform">
                <span className="material-symbols-outlined">close</span>
              </button>
              <div className="p-8 md:p-10 pb-6 border-b border-white/5 shrink-0 bg-[#1c1c1e]/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center justify-between mb-5">
                  <span className="inline-flex px-4 py-1.5 text-[13px] font-bold rounded-full uppercase tracking-wider border shadow-sm" style={{ backgroundColor: `${catColor}20`, color: catColor, borderColor: `${catColor}30` }}>{selectedPost.category}</span>
                  <button onClick={closeModal} className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors active:scale-95">
                    <span className="material-symbols-outlined text-2xl">close</span>
                  </button>
                </div>
                <h2 className="text-[26px] md:text-[32px] font-bold text-white mb-4 tracking-tight leading-snug break-keep">{selectedPost.title}</h2>
                <span className="text-zinc-500 font-medium tracking-wide flex items-center gap-1.5 text-[15px]"><span className="material-symbols-outlined text-[18px]">calendar_month</span> {selectedPost.date}</span>
              </div>
              <div className="p-8 md:p-10 overflow-y-auto flex-1 font-sans">
                <p className="text-zinc-300 text-[17px] leading-[1.8] whitespace-pre-wrap break-keep">{selectedPost.content}</p>
                {selectedPost.attachments && selectedPost.attachments.length > 0 && (
                  <div className="mt-10 border-t border-white/5 pt-6">
                    <h4 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">attach_file</span> 첨부파일 ({selectedPost.attachments.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedPost.attachments.map((att, idx) => (
                        <div key={idx} className="flex items-center gap-3 px-4 py-3 bg-white/[0.03] border border-white/[0.07] rounded-xl">
                          <span className="material-symbols-outlined text-zinc-400 text-xl">attach_file</span>
                          <div className="flex-1 min-w-0"><p className="text-white text-sm font-medium truncate">{att.name}</p></div>
                          <a href={att.url} download={att.name} className="flex items-center justify-center w-9 h-9 rounded-full bg-[#0071e3]/10 text-[#0071e3] hover:bg-[#0071e3]/20 transition-colors shrink-0" onClick={(e) => e.stopPropagation()}>
                            <span className="material-symbols-outlined text-[18px]">download</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
