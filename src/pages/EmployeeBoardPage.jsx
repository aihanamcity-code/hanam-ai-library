import React, { useState, useMemo } from 'react';
import { useBoard } from '../context/BoardContext';
import { motion, AnimatePresence } from 'framer-motion';

// ── CSV Export Helper ──
function exportBoardToCSV(posts) {
  const headers = ['ID', '유형', '제목', '작성자', '날짜', '추쳍', '비추쳍', '댓글수', '승인여부'];
  const rows = posts.map(p => [
    p.id,
    p.category === 'tip' ? '팟 공유' : '아이디어',
    `"${p.title.replace(/"/g, '""')}"`,
    p.author,
    p.date,
    p.likes,
    p.dislikes,
    p.comments.length,
    p.isApproved ? 'O' : 'X'
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel Korean
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `직원게시판_데이터_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Sub-components ───

function TabBar({ activeTab, setActiveTab }) {
  return (
    <div className="flex gap-2 mb-6">
      {[
        { id: 'tip', label: '💡 나만의 팁 공유' },
        { id: 'idea', label: '🚀 새로운 아이디어 제안' },
      ].map(tab => (
        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
          className={`relative px-6 py-3 rounded-2xl text-sm font-bold tracking-wide transition-all duration-300 ${
            activeTab === tab.id ? 'bg-[#0071e3] text-white shadow-lg shadow-[#0071e3]/30' : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/10'
          }`}>{tab.label}</button>
      ))}
    </div>
  );
}

function Toolbar({ searchTerm, setSearchTerm, sortOrder, setSortOrder }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const sortLabels = { latest: '최신순', likes: '추천순', comments: '댓글순' };
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="relative">
        <button onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 transition-colors hover:bg-white/10">
          <span className="material-symbols-outlined text-[18px]">swap_vert</span>
          {sortLabels[sortOrder]}
          <span className="material-symbols-outlined text-[16px]">expand_more</span>
        </button>
        {dropdownOpen && (
          <div className="absolute top-full left-0 mt-2 w-36 bg-[#2c2c2e]/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl z-50 overflow-hidden">
            {Object.entries(sortLabels).map(([key, label]) => (
              <button key={key} onClick={() => { setSortOrder(key); setDropdownOpen(false); }}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${sortOrder === key ? 'text-[#0071e3] bg-white/5' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>{label}</button>
            ))}
          </div>
        )}
      </div>
      <div className="relative group w-full md:w-72">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-[20px] transition-colors group-focus-within:text-[#0071e3]">search</span>
        <input type="text" placeholder="제목 또는 내용 검색" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-full py-2.5 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#0071e3]/50 focus:shadow-[0_0_15px_rgba(0,113,227,0.3)] transition-all duration-300" />
      </div>
    </div>
  );
}

function PostCard({ post, onClick, onVote, getVoteState }) {
  const isHallOfFame = post.likes >= 10;
  const currentVote = getVoteState('post', post.id);
  return (
    <motion.div layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.35, ease: 'easeOut' }}
      onClick={onClick} className="group cursor-pointer bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.07] hover:border-white/15 rounded-2xl p-6 transition-all duration-300 relative overflow-hidden">
      {isHallOfFame && <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isHallOfFame && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-500/20 to-yellow-400/20 text-amber-300 text-[12px] font-bold rounded-full border border-amber-400/30 shadow-sm">🥇 명예의 전당</span>
            )}
            <span className="text-[12px] text-zinc-500 font-medium">{post.category === 'tip' ? '💡 팁' : '🚀 아이디어'}</span>
          </div>
          <span className="text-[12px] text-zinc-600">{post.date}</span>
        </div>
        <h3 className="text-[18px] font-bold text-white/90 group-hover:text-white mb-2 tracking-tight leading-snug line-clamp-2 transition-colors">{post.title}</h3>
        <p className="text-[13px] text-zinc-500 mb-4">{post.author}</p>
        <div className="flex items-center gap-5 text-zinc-500">
          <button onClick={(e) => { e.stopPropagation(); onVote(post.id, 'like'); }}
            className={`flex items-center gap-1.5 text-[13px] font-medium transition-colors active:scale-95 ${currentVote === 'like' ? 'text-[#0071e3]' : 'hover:text-[#0071e3]'}`}>
            👍 <span>{post.likes}</span>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onVote(post.id, 'dislike'); }}
            className={`flex items-center gap-1.5 text-[13px] font-medium transition-colors active:scale-95 ${currentVote === 'dislike' ? 'text-red-400' : 'hover:text-red-400'}`}>
            👎 <span>{post.dislikes}</span>
          </button>
          <span className="flex items-center gap-1.5 text-[13px] font-medium">💬 <span>{post.comments.length}</span></span>
        </div>
      </div>
    </motion.div>
  );
}

function WriteModal({ isOpen, onClose, activeTab, onSubmit }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  if (!isOpen) return null;
  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    onSubmit(title, content, activeTab);
    setTitle(''); setContent(''); onClose();
  };
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-[#1c1c1e] rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden z-10">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h3 className="text-xl font-bold text-white">새 글 작성</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-xl">close</span></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-[#0071e3]/20 text-[#0071e3] text-[12px] font-bold rounded-full border border-[#0071e3]/30">{activeTab === 'tip' ? '💡 팁 공유' : '🚀 아이디어'}</span>
            <span className="text-zinc-500 text-[12px]">랜덤 익명 닉네임이 자동으로 부여됩니다</span>
          </div>
          <input type="text" placeholder="제목을 입력하세요" value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#0071e3]/50 transition-all" />
          <textarea placeholder="내용을 입력하세요" value={content} onChange={(e) => setContent(e.target.value)} rows={6}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#0071e3]/50 transition-all resize-none" />
        </div>
        <div className="p-6 pt-0">
          <button onClick={handleSubmit} disabled={!title.trim() || !content.trim()}
            className="w-full py-3 bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]">
            게시글 등록 (관리자 승인 후 공개)
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ post, isOpen, onClose }) {
  const { isAdmin, addComment, voteBoardPost, voteComment, getVoteState, editBoardPost, deleteBoardPost } = useBoard();
  const [commentText, setCommentText] = useState('');
  const [editing, setEditing] = useState(false);
  const [eTitle, setETitle] = useState('');
  const [eContent, setEContent] = useState('');

  if (!isOpen || !post) return null;
  const postVote = getVoteState('post', post.id);

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    addComment(post.id, commentText);
    setCommentText('');
  };

  const startEdit = () => { setETitle(post.title); setEContent(post.content); setEditing(true); };
  const saveEdit = () => { editBoardPost(post.id, eTitle, eContent); setEditing(false); };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-8">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative w-full max-w-3xl h-full md:h-[85vh] bg-[#1c1c1e] md:rounded-3xl border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden z-10">
        <div className="p-8 pb-6 border-b border-white/5 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#0071e3]/20 text-[#0071e3] text-[12px] font-bold rounded-full border border-[#0071e3]/30">{post.category === 'tip' ? '💡 팁 공유' : '🚀 아이디어'}</span>
              {post.likes >= 10 && <span className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-yellow-400/20 text-amber-300 text-[12px] font-bold rounded-full border border-amber-400/30">🥇 명예의 전당</span>}
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <>
                  <button onClick={startEdit} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 text-zinc-400 hover:text-[#0071e3] transition-colors"><span className="material-symbols-outlined text-xl">edit</span></button>
                  <button onClick={() => { deleteBoardPost(post.id); onClose(); }} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-colors"><span className="material-symbols-outlined text-xl">delete</span></button>
                </>
              )}
              <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-2xl">close</span></button>
            </div>
          </div>
          {editing ? (
            <div className="space-y-3">
              <input value={eTitle} onChange={e => setETitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-lg font-bold focus:outline-none focus:border-[#0071e3]/50" />
              <textarea value={eContent} onChange={e => setEContent(e.target.value)} rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-[#0071e3]/50 resize-none" />
              <div className="flex gap-2">
                <button onClick={saveEdit} className="px-4 py-2 bg-[#0071e3] text-white text-sm font-bold rounded-xl">저장</button>
                <button onClick={() => setEditing(false)} className="px-4 py-2 bg-white/5 text-zinc-400 text-sm rounded-xl border border-white/10">취소</button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-[28px] font-bold text-white mb-3 tracking-tight leading-snug break-keep">{post.title}</h2>
              <div className="flex items-center gap-4 text-zinc-500 text-[14px]"><span>{post.author}</span><span>{post.date}</span></div>
            </>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {!editing && <p className="text-zinc-300 text-[16px] leading-[1.85] whitespace-pre-wrap break-keep mb-8">{post.content}</p>}
          <div className="flex items-center gap-4 pb-8 mb-8 border-b border-white/5">
            <button onClick={() => voteBoardPost(post.id, 'like')}
              className={`flex items-center gap-2 px-5 py-2.5 bg-white/5 border rounded-full text-sm font-medium transition-all active:scale-95 ${postVote === 'like' ? 'border-[#0071e3]/50 text-[#0071e3]' : 'border-white/10 text-white/70 hover:text-[#0071e3] hover:border-[#0071e3]/30'}`}>
              👍 추천 <span className="text-white/50">{post.likes}</span>
            </button>
            <button onClick={() => voteBoardPost(post.id, 'dislike')}
              className={`flex items-center gap-2 px-5 py-2.5 bg-white/5 border rounded-full text-sm font-medium transition-all active:scale-95 ${postVote === 'dislike' ? 'border-red-400/50 text-red-400' : 'border-white/10 text-white/70 hover:text-red-400 hover:border-red-400/30'}`}>
              👎 비추천 <span className="text-white/50">{post.dislikes}</span>
            </button>
          </div>

          <h4 className="text-white font-bold text-sm mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">chat</span> 댓글 {post.comments.length}개
          </h4>
          <div className="space-y-4 mb-6">
            {post.comments.map(c => {
              const cVote = getVoteState('comment', c.id);
              return (
                <div key={c.id} className={`p-4 rounded-2xl border ${c.isAdmin ? 'bg-[#0071e3]/10 border-[#0071e3]/20' : 'bg-white/[0.03] border-white/[0.07]'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[13px] font-bold ${c.isAdmin ? 'text-[#0071e3]' : 'text-zinc-400'}`}>{c.author}</span>
                    <span className="text-[11px] text-zinc-600">{c.date}</span>
                  </div>
                  <p className="text-zinc-300 text-[14px] leading-relaxed mb-3">{c.content}</p>
                  <div className="flex items-center gap-4 text-zinc-500 text-[12px]">
                    <button onClick={() => voteComment(post.id, c.id, 'like')} className={`transition-colors active:scale-95 ${cVote === 'like' ? 'text-[#0071e3]' : 'hover:text-[#0071e3]'}`}>👍 {c.likes}</button>
                    <button onClick={() => voteComment(post.id, c.id, 'dislike')} className={`transition-colors active:scale-95 ${cVote === 'dislike' ? 'text-red-400' : 'hover:text-red-400'}`}>👎 {c.dislikes}</button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-3">
            <input type="text" placeholder={isAdmin ? "관리자 공식 답변 작성..." : "댓글을 입력하세요 (익명)"} value={commentText}
              onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              className={`flex-1 bg-white/5 border rounded-xl px-5 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none transition-all ${isAdmin ? 'border-[#0071e3]/30 focus:border-[#0071e3]/60' : 'border-white/10 focus:border-white/20'}`} />
            <button onClick={handleAddComment} disabled={!commentText.trim()} className="px-5 py-3 bg-[#0071e3] text-white text-sm font-bold rounded-xl hover:bg-[#0077ed] transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 shrink-0">등록</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminPendingModal({ isOpen, onClose }) {
  const { boardPosts, approveBoardPost, deleteBoardPost } = useBoard();
  const pendingPosts = boardPosts.filter(p => !p.isApproved);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl max-h-[80vh] bg-[#1c1c1e] rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden z-10">
        <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">🔴 승인 대기 목록 <span className="text-sm text-zinc-400 font-normal">({pendingPosts.length}건)</span></h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-xl">close</span></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {pendingPosts.length === 0 ? (
            <div className="py-16 text-center text-zinc-500"><span className="material-symbols-outlined text-5xl mb-3 block opacity-50">check_circle</span><p className="font-medium">모든 게시글이 승인되었습니다!</p></div>
          ) : pendingPosts.map(post => (
            <div key={post.id} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2"><span className="text-[12px] text-zinc-500">{post.category === 'tip' ? '💡 팁' : '🚀 아이디어'}</span><span className="text-[12px] text-zinc-600">{post.date}</span></div>
              <h4 className="text-white font-bold mb-1.5 tracking-tight">{post.title}</h4>
              <p className="text-zinc-400 text-sm line-clamp-2 mb-4">{post.content}</p>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-zinc-500 text-[13px]">{post.author}</span>
                <div className="flex-1"></div>
                <button onClick={() => approveBoardPost(post.id)} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 font-bold text-[13px] rounded-xl border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors active:scale-95">✅ 승인</button>
                <button onClick={() => deleteBoardPost(post.id)} className="px-4 py-2 bg-red-500/20 text-red-400 font-bold text-[13px] rounded-xl border border-red-500/30 hover:bg-red-500/30 transition-colors active:scale-95">❌ 반려</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main ───
export default function EmployeeBoardPage() {
  const { boardPosts, isAdmin, addBoardPost, voteBoardPost, getVoteState } = useBoard();
  const [activeTab, setActiveTab] = useState('tip');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('latest');
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  const processedPosts = useMemo(() => {
    return boardPosts
      .filter(p => p.isApproved).filter(p => p.category === activeTab)
      .filter(p => { if (!searchTerm) return true; const t = searchTerm.toLowerCase(); return p.title.toLowerCase().includes(t) || p.content.toLowerCase().includes(t); })
      .sort((a, b) => {
        if (sortOrder === 'latest') return new Date(b.date.replace(/\./g, '-')) - new Date(a.date.replace(/\./g, '-'));
        if (sortOrder === 'likes') return b.likes - a.likes;
        return b.comments.length - a.comments.length;
      });
  }, [boardPosts, activeTab, searchTerm, sortOrder]);

  const liveSelectedPost = selectedPost ? boardPosts.find(p => p.id === selectedPost.id) : null;
  const pendingCount = boardPosts.filter(p => !p.isApproved).length;

  return (
    <div className="w-full min-h-[calc(100vh-48px)] bg-black text-white p-6 md:p-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0071e3]/8 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-[960px] mx-auto relative z-10 fade-in-up">
        <div className="mb-8 border-b border-white/10 pb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[40px] md:text-[56px] font-bold tracking-tight text-white mb-3">직원 게시판</h1>
              <p className="text-zinc-400 text-lg md:text-xl tracking-wide font-medium">동료들의 AI 팁과 아이디어를 만나보세요. 모든 글은 완전 익명입니다.</p>
            </div>
          </div>
        </div>

        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />

        {isAdmin && (
          <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
            <button onClick={() => setAdminModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold hover:bg-red-500/20 transition-colors active:scale-95">
              🔴 승인 대기 목록
              {pendingCount > 0 && <span className="min-w-[22px] h-[22px] flex items-center justify-center bg-red-500 text-white text-[11px] font-bold rounded-full px-1.5">{pendingCount}</span>}
            </button>
            <button
              onClick={() => exportBoardToCSV(boardPosts)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-bold hover:bg-emerald-500/20 transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              전체 데이터 엑셀 다운로드
            </button>
          </div>
        )}

        <Toolbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} sortOrder={sortOrder} setSortOrder={setSortOrder} />

        {processedPosts.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 flex flex-col items-center justify-center text-center text-zinc-500">
            <span className="material-symbols-outlined text-[56px] mb-4 opacity-40">inbox</span>
            <p className="text-lg font-medium">게시물이 존재하지 않습니다.</p>
            <p className="text-sm mt-1">첫 번째 글의 주인공이 되어보세요!</p>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 gap-4">
            <AnimatePresence>
              {processedPosts.map(post => (
                <PostCard key={post.id} post={post} onClick={() => setSelectedPost(post)} onVote={voteBoardPost} getVoteState={getVoteState} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <button onClick={() => setWriteModalOpen(true)}
        className="fixed right-8 bottom-8 w-14 h-14 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#0071e3]/40 transition-all active:scale-90 hover:scale-105 z-[100]">
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      <WriteModal isOpen={writeModalOpen} onClose={() => setWriteModalOpen(false)} activeTab={activeTab} onSubmit={addBoardPost} />
      <DetailModal post={liveSelectedPost} isOpen={!!selectedPost} onClose={() => setSelectedPost(null)} />
      <AdminPendingModal isOpen={adminModalOpen} onClose={() => setAdminModalOpen(false)} />
    </div>
  );
}
