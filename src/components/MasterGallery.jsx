import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBoard } from '../context/BoardContext';
import { useSwipe } from '../hooks/useSwipe';
import ImageLightbox from './ImageLightbox';

// ── Helpers ──
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function getFileIcon(name) {
  const ext = name.split('.').pop().toLowerCase();
  if (['pdf'].includes(ext)) return 'picture_as_pdf';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'table_chart';
  if (['doc', 'docx'].includes(ext)) return 'description';
  if (['ppt', 'pptx'].includes(ext)) return 'slideshow';
  if (['zip', 'rar', '7z'].includes(ext)) return 'folder_zip';
  return 'attach_file';
}

function readFileAsDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

// ── Upload Modal (Shared for Write & Edit) ──
function UploadModal({ isOpen, onClose, onSubmit, pageTitle, initial }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);        // Array of { url, name }
  const [attachments, setAttachments] = useState([]); // Array of { name, size, url }
  const [isFeatured, setIsFeatured] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(initial?.title || '');
      setContent(initial?.content || '');
      setImages(initial?.images?.map((url, i) => ({ url, name: `image_${i+1}` })) || []);
      setAttachments(initial?.attachments || []);
      setIsFeatured(initial?.isFeatured || false);
    }
  }, [isOpen, initial]);

  const handleImageFiles = useCallback(async (files) => {
    const imgFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    const newImages = [];
    for (const f of imgFiles) {
      const url = await readFileAsDataURL(f);
      newImages.push({ url, name: f.name });
    }
    setImages(prev => [...prev, ...newImages]);
  }, []);

  const handleAttachmentFiles = useCallback(async (files) => {
    const newAtts = [];
    for (const f of Array.from(files)) {
      const url = await readFileAsDataURL(f);
      newAtts.push({ name: f.name, size: f.size, url });
    }
    setAttachments(prev => [...prev, ...newAtts]);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleImageFiles(e.dataTransfer.files);
  }, [handleImageFiles]);

  const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx));
  const removeAttachment = (idx) => setAttachments(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    onSubmit(title, content, images.map(i => i.url), attachments.map(a => ({ name: a.name, size: a.size, url: a.url })), isFeatured);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#1c1c1e] rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
          <h3 className="text-xl font-bold text-white">{initial ? '글 수정' : '새 글 등록'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Category Badge */}
          <span className="inline-flex px-3 py-1 bg-[#0071e3]/20 text-[#0071e3] text-[12px] font-bold rounded-full border border-[#0071e3]/30">{pageTitle}</span>

          {/* Title */}
          <input type="text" placeholder="제목을 입력하세요" value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#0071e3]/50 transition-all" />

          {/* Content */}
          <textarea placeholder="본문 내용을 입력하세요" value={content} onChange={(e) => setContent(e.target.value)} rows={5}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#0071e3]/50 transition-all resize-none" />

          {/* Featured Toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none group">
            <div
              onClick={() => setIsFeatured(p => !p)}
              className={`w-11 h-6 rounded-full transition-all duration-300 flex items-center px-0.5 shrink-0 ${
                isFeatured ? 'bg-[#0071e3]' : 'bg-white/10 border border-white/10'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                isFeatured ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">📣 상단 홍보 배너에 등록</p>
              <p className="text-zinc-500 text-[11px] mt-0.5">메인 페이지 하이라이트 슬라이더에 노출됩니다</p>
            </div>
          </label>

          {/* ── Image Upload Zone ── */}
          <div>
            <label className="text-zinc-400 text-[13px] font-semibold tracking-wide mb-2 block">🖼️ 이미지</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => imageInputRef.current?.click()}
              className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 ${
                dragOver
                  ? 'border-[#0071e3]/60 bg-[#0071e3]/10'
                  : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
              }`}
            >
              <span className="material-symbols-outlined text-3xl text-zinc-500 mb-2 block">cloud_upload</span>
              <p className="text-zinc-400 text-sm">이미지를 여기에 끌어다 놓거나 클릭하세요</p>
              <p className="text-zinc-600 text-xs mt-1">JPG, PNG, GIF, WEBP</p>
            </div>
            <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => { handleImageFiles(e.target.files); e.target.value = ''; }} />

            {/* Image Thumbnails */}
            {images.length > 0 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-white/10 group">
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    <button onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-white text-[14px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── File Attachment Zone ── */}
          <div>
            <label className="text-zinc-400 text-[13px] font-semibold tracking-wide mb-2 block">📎 일반 파일 첨부</label>
            <button onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition-all w-full justify-center">
              <span className="material-symbols-outlined text-[20px]">attach_file</span>
              파일 선택 (PDF, Excel, Word 등)
            </button>
            <input ref={fileInputRef} type="file" multiple className="hidden"
              accept=".pdf,.xls,.xlsx,.csv,.doc,.docx,.ppt,.pptx,.zip,.rar,.hwp,.txt"
              onChange={(e) => { handleAttachmentFiles(e.target.files); e.target.value = ''; }} />

            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((att, idx) => (
                  <div key={idx} className="flex items-center gap-3 px-4 py-2.5 bg-white/[0.03] border border-white/[0.07] rounded-xl group">
                    <span className="material-symbols-outlined text-zinc-400 text-xl">{getFileIcon(att.name)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{att.name}</p>
                      {att.size && <p className="text-zinc-600 text-[11px]">{formatFileSize(att.size)}</p>}
                    </div>
                    <button onClick={() => removeAttachment(idx)}
                      className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 shrink-0">
          <button onClick={handleSubmit} disabled={!title.trim() || !content.trim()}
            className="w-full py-3 bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]">
            {initial ? '수정 완료' : '등록'}
          </button>
        </div>
      </div>
    </div>
  );
}


// ─── Main Component ───
export default function MasterGallery() {
  const location = useLocation();
  const { isAdmin, galleryPosts, addGalleryPost, editGalleryPost, deleteGalleryPost } = useBoard();

  const [selectedItem, setSelectedItem] = useState(null);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null); // null = 닫힘
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('latest');

  // Upload modal state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = new, object = edit

  useEffect(() => {
    if (selectedItem || uploadOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedItem, uploadOpen]);

  let category = 'notice';
  let pageTitle = '공지사항';
  let pageDesc = '하남 AI 서재의 새로운 소식과 주요 안내 사항을 전해드립니다.';

  if (location.pathname.includes('policy-analysis')) {
    category = 'policy'; pageTitle = 'AI 정책 분석'; pageDesc = '자동 수집된 전국 정책 데이터를 하남시 맞춤형으로 분석합니다.';
  } else if (location.pathname.includes('tip-bank')) {
    category = 'tip'; pageTitle = 'AI & 팁 뱅크'; pageDesc = '퇴근을 앞당기는 AI 활용 및 업무 스마트 노하우를 공유합니다.';
  } else if (location.pathname.includes('card-news')) {
    category = 'card'; pageTitle = '정책참고 카드뉴스'; pageDesc = '복잡한 전국 정책 흐름을 알기 쉬운 이미지로 확인하세요.';
  }

  const processedData = galleryPosts
    .filter(item => item.category === category)
    .filter(item => { if (!searchTerm) return true; const t = searchTerm.toLowerCase(); return item.title.toLowerCase().includes(t) || item.content.toLowerCase().includes(t); })
    .sort((a, b) => {
      if (sortOrder === 'latest') return new Date(b.date.replace(/\./g, '-')) - new Date(a.date.replace(/\./g, '-'));
      return b.likes - a.likes;
    });

  const openModal = (item) => { setSelectedItem(item); setCurrentImgIndex(0); };
  const closeModal = () => setSelectedItem(null);
  const nextImage = (e) => { if (e) e.stopPropagation(); if (!selectedItem?.images?.length) return; setCurrentImgIndex(prev => (prev + 1) % selectedItem.images.length); };
  const prevImage = (e) => { if (e) e.stopPropagation(); if (!selectedItem?.images?.length) return; setCurrentImgIndex(prev => (prev === 0 ? selectedItem.images.length - 1 : prev - 1)); };

  // Touch swipe for image panel
  const swipeHandlers = useSwipe(
    () => nextImage(null),
    () => prevImage(null),
  );

  const handleUploadSubmit = (title, content, images, attachments, isFeatured) => {
    if (editTarget) {
      editGalleryPost(editTarget.id, title, content, images, attachments, isFeatured);
    } else {
      addGalleryPost(title, content, category, images, attachments, isFeatured);
    }
    setEditTarget(null);
  };

  const startEdit = (item) => { setEditTarget(item); setSelectedItem(null); setUploadOpen(true); };
  const handleDelete = (id) => { deleteGalleryPost(id); setSelectedItem(null); };

  const liveSelected = selectedItem ? galleryPosts.find(p => p.id === selectedItem.id) : null;

  return (
    <div className="w-full min-h-[calc(100vh-48px)] bg-black text-white p-6 md:p-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0071e3]/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-[1200px] mx-auto relative z-10 fade-in-up">
        {/* Header */}
        <div className="mb-8 border-b border-white/10 pb-8 fade-in-up">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-tight text-white mb-3">{pageTitle}</h1>
          <p className="text-zinc-400 text-lg md:text-xl tracking-wide font-medium">{pageDesc}</p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 fade-in-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center gap-4 text-sm font-semibold tracking-wide">
            <button onClick={() => setSortOrder('latest')} className={`transition-colors duration-300 ${sortOrder === 'latest' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>최신순</button>
            <div className="w-[1px] h-3 bg-white/20"></div>
            <button onClick={() => setSortOrder('popular')} className={`transition-colors duration-300 ${sortOrder === 'popular' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>인기순</button>
          </div>
          <div className="relative group w-full md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[20px] transition-colors group-focus-within:text-[#0071e3]">search</span>
            <input type="text" placeholder="제목 또는 내용 검색" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#0071e3]/50 focus:shadow-[0_0_15px_rgba(0,113,227,0.3)] transition-all duration-300" />
          </div>
        </div>

        {/* Grid */}
        {processedData.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 flex flex-col items-center justify-center text-center opacity-50">
            <span className="material-symbols-outlined text-[64px] mb-4">search_off</span>
            <p className="text-xl">검색 결과가 없습니다.</p>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
            <AnimatePresence>
              {processedData.map(item => {
                const hasImage = item.images && item.images.length > 0;
                return (
                  <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4, ease: "easeInOut" }}
                    key={item.id} onClick={() => openModal(item)}
                    className="group relative cursor-pointer aspect-square max-h-[500px] overflow-hidden bg-zinc-900 border border-black/50">
                    {hasImage ? (
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1c1c1e] to-black flex flex-col items-center justify-center p-8 text-center shadow-inner transition-transform duration-700 group-hover:scale-105 border-t border-white/5">
                        <span className="material-symbols-outlined text-white/20 text-6xl mb-4 font-light drop-shadow-lg">article_shortcut</span>
                        <h3 className="font-semibold text-white/80 line-clamp-3 text-lg md:text-xl leading-relaxed">{item.title}</h3>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6 text-center text-white z-10 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">
                      <span className="material-symbols-outlined text-3xl mb-3 opacity-90 drop-shadow-md">zoom_in</span>
                      <h3 className="text-xl font-bold tracking-tight line-clamp-3 mb-3 drop-shadow-md">{item.title}</h3>
                      <div className="flex items-center gap-4 text-sm font-medium text-white/90 drop-shadow-md">
                        <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">calendar_today</span> {item.date}</span>
                        {item.images && item.images.length > 1 && <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">photo_library</span> {item.images.length}</span>}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Admin: Floating Write Button */}
      {isAdmin && (
        <button onClick={() => { setEditTarget(null); setUploadOpen(true); }}
          className="fixed right-8 bottom-8 px-5 py-3.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full flex items-center gap-2 shadow-lg shadow-[#0071e3]/40 transition-all active:scale-90 hover:scale-105 z-[100] text-sm font-bold">
          <span className="material-symbols-outlined text-xl">add</span> 새 글 등록
        </button>
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadOpen}
        onClose={() => { setUploadOpen(false); setEditTarget(null); }}
        onSubmit={handleUploadSubmit}
        pageTitle={pageTitle}
        initial={editTarget}
      />

      {/* Detail Modal */}
      {liveSelected && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-6 lg:p-12 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={closeModal}></div>
          <div className="relative w-full max-w-7xl h-full md:h-[85vh] bg-[#1c1c1e] md:rounded-[2rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10 flex flex-col md:flex-row overflow-hidden z-10">
            {/* Left: Image – swipe-enabled on mobile */}
            <div {...swipeHandlers} className={`w-full md:w-3/5 bg-black relative flex items-center justify-center group shrink-0 aspect-square md:aspect-auto md:h-full overflow-hidden ${(!liveSelected.images || liveSelected.images.length === 0) ? 'hidden md:flex' : ''}`}>
              {liveSelected.images && liveSelected.images.length > 0 ? (
                <>
                  {/* 이미지 클릭 → 라이트박스 오픈 */}
                  <div
                    className="w-full h-full p-0 md:p-4 pb-0 flex items-center justify-center cursor-zoom-in"
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(currentImgIndex); }}
                    title="클릭하면 이미지를 크게 볼 수 있습니다"
                  >
                    <img src={liveSelected.images[currentImgIndex]} alt="Gallery" className="w-full h-full object-contain animate-in fade-in zoom-in duration-300 drop-shadow-2xl" key={currentImgIndex} />
                  </div>
                  {/* 확대 힌트 배지 */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white/50 text-[11px] flex items-center gap-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-[13px]">zoom_in</span>
                    클릭하여 확대
                  </div>
                  {liveSelected.images.length > 1 && (
                    <>
                      <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full overflow-hidden flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 shadow-xl">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-lg border border-white/20"></div>
                        <span className="material-symbols-outlined relative z-10 text-white text-xl drop-shadow-md mr-1">arrow_back_ios</span>
                      </button>
                      <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full overflow-hidden flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 shadow-xl">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-lg border border-white/20"></div>
                        <span className="material-symbols-outlined relative z-10 text-white text-xl drop-shadow-md ml-1">arrow_forward_ios</span>
                      </button>
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 shadow-2xl">
                        {liveSelected.images.map((_, idx) => (
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
            <div className={`w-full flex-col bg-[#1c1c1e] relative shrink-0 custom-scrollbar ${(!liveSelected.images || liveSelected.images.length === 0) ? 'md:w-2/5 flex h-full border-l-0 md:border-l border-white/10' : 'md:w-2/5 flex h-[calc(100%-100vw)] md:h-full border-t md:border-t-0 md:border-l border-white/20 md:border-white/10'}`}>
              <button onClick={closeModal} className="md:hidden absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-xl active:scale-90 transition-transform">
                <span className="material-symbols-outlined">close</span>
              </button>

              <div className="p-8 md:p-10 pb-6 border-b border-white/5 shrink-0 bg-[#1c1c1e]/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center justify-between mb-5">
                  <span className="inline-flex px-4 py-1.5 bg-[#0071e3]/20 text-[#0071e3] text-[13px] font-bold rounded-full uppercase tracking-wider border border-[#0071e3]/30 shadow-sm">{liveSelected.category}</span>
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <>
                        <button onClick={() => startEdit(liveSelected)} className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/10 text-zinc-400 hover:text-[#0071e3] transition-colors" title="수정">
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button onClick={() => handleDelete(liveSelected.id)} className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-colors" title="삭제">
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </>
                    )}
                    <button onClick={closeModal} className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors active:scale-95">
                      <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                  </div>
                </div>
                <h2 className="text-[26px] md:text-[32px] font-bold text-white mb-4 tracking-tight leading-snug break-keep">{liveSelected.title}</h2>
                <span className="text-zinc-500 font-medium tracking-wide flex items-center gap-1.5 text-[15px]"><span className="material-symbols-outlined text-[18px]">calendar_month</span> {liveSelected.date}</span>
              </div>

              <div className="p-8 md:p-10 overflow-y-auto flex-1 font-sans">
                <p className="text-zinc-300 text-[17px] leading-[1.8] whitespace-pre-wrap break-keep">{liveSelected.content}</p>

                {/* Attachments List */}
                {liveSelected.attachments && liveSelected.attachments.length > 0 && (
                  <div className="mt-10 border-t border-white/5 pt-6">
                    <h4 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">attach_file</span> 첨부파일 ({liveSelected.attachments.length})
                    </h4>
                    <div className="space-y-2">
                      {liveSelected.attachments.map((att, idx) => (
                        <div key={idx} className="flex items-center gap-3 px-4 py-3 bg-white/[0.03] border border-white/[0.07] rounded-xl hover:bg-white/[0.06] transition-colors group">
                          <span className="material-symbols-outlined text-zinc-400 text-xl">{getFileIcon(att.name)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{att.name}</p>
                            {att.size && <p className="text-zinc-600 text-[11px]">{formatFileSize(att.size)}</p>}
                          </div>
                          <a href={att.url} download={att.name}
                            className="flex items-center justify-center w-9 h-9 rounded-full bg-[#0071e3]/10 text-[#0071e3] hover:bg-[#0071e3]/20 transition-colors shrink-0"
                            onClick={(e) => e.stopPropagation()}>
                            <span className="material-symbols-outlined text-[18px]">download</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Decorative Footer */}
                <div className="mt-10 flex items-center gap-4 text-zinc-500 border-t border-white/5 pt-8">
                  <button className="flex items-center justify-center w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 hover:text-white transition-colors border border-white/10">
                    <span className="material-symbols-outlined text-[20px]">share</span>
                  </button>
                  <button className="flex items-center justify-center w-12 h-12 rounded-full bg-white/5 hover:bg-[#ff3b30]/20 hover:border-[#ff3b30]/50 hover:text-[#ff3b30] transition-colors border border-white/10 group">
                    <span className="material-symbols-outlined text-[20px] group-active:scale-125 transition-transform">favorite</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Image Lightbox ── */}
      {lightboxIndex !== null && liveSelected?.images?.length > 0 && (
        <ImageLightbox
          images={liveSelected.images}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
