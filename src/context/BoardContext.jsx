import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// ── Random Nickname Generator ──
const LOCATIONS = ['천현', '신장', '덕풍', '미사', '위례', '감일', '초이', '춘궁'];
const ANIMALS   = ['다람쥐', '부엉이', '수달', '고양이', '펭귄', '여우', '토끼', '판다'];
export function generateNickname() {
  return `${LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]} ${ANIMALS[Math.floor(Math.random() * ANIMALS.length)]}`;
}

// ── localStorage Vote helpers ──
function getVoteKey(type, id)       { return `vote_${type}_${id}`; }
function getVoteState(type, id)     { try { return localStorage.getItem(getVoteKey(type, id)); } catch { return null; } }
function setVoteState(type, id, v)  { try { v ? localStorage.setItem(getVoteKey(type, id), v) : localStorage.removeItem(getVoteKey(type, id)); } catch { /**/ } }

// ── Helpers ──
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
}

// ── DB Row → App Object mappers ──
const mapGalleryPost = (r) => ({
  id: r.id, category: r.category, title: r.title, content: r.content || '',
  date: r.date || '', likes: r.likes || 0,
  images:      Array.isArray(r.images)      ? r.images      : [],
  attachments: Array.isArray(r.attachments) ? r.attachments : [],
  isFeatured: r.is_featured || false,
});

const mapComment = (r) => ({
  id: r.id, author: r.author || '', content: r.content || '',
  likes: r.likes || 0, dislikes: r.dislikes || 0,
  isAdmin: r.is_admin || false, date: r.date || '',
});

const mapBoardPost = (r) => ({
  id: r.id, category: r.category, title: r.title, content: r.content || '',
  author: r.author || '', date: r.date || '',
  likes: r.likes || 0, dislikes: r.dislikes || 0,
  isApproved: r.is_approved || false,
  comments: (r.board_comments || []).map(mapComment)
    .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0)),
});

// ── Context ──
const BoardContext = createContext(null);

export function BoardProvider({ children }) {
  const [galleryPosts, setGalleryPosts] = useState([]);
  const [boardPosts,   setBoardPosts]   = useState([]);
  const [isAdmin,      setIsAdmin]      = useState(false);
  const [isLoading,    setIsLoading]    = useState(true);

  // ── Initial Data Load from Supabase ──
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [{ data: gallery, error: ge }, { data: posts, error: pe }] = await Promise.all([
          supabase.from('gallery_posts').select('*').order('created_at', { ascending: false }),
          supabase.from('board_posts').select('*, board_comments(*)').order('created_at', { ascending: false }),
        ]);
        if (ge) throw ge;
        if (pe) throw pe;
        setGalleryPosts((gallery || []).map(mapGalleryPost));
        setBoardPosts((posts   || []).map(mapBoardPost));
      } catch (err) {
        console.error('[Supabase] 데이터 로드 실패:', err.message);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // ── Admin Auth ──
  const loginAdmin  = useCallback((pw) => { if (pw === '1234') { setIsAdmin(true); return true; } return false; }, []);
  const logoutAdmin = useCallback(() => setIsAdmin(false), []);

  // ── Gallery CRUD ──
  const addGalleryPost = useCallback(async (title, content, category, images = [], attachments = [], isFeatured = false) => {
    const id = `g${Date.now()}`;
    const date = todayStr();
    const optimistic = { id, category, title, content, date, likes: 0, images, attachments, isFeatured };
    setGalleryPosts(prev => [optimistic, ...prev]);

    const { error } = await supabase.from('gallery_posts').insert({
      id, category, title, content, date, images, attachments, is_featured: isFeatured,
    });
    if (error) {
      console.error('[Supabase] gallery insert 실패:', error.message);
      setGalleryPosts(prev => prev.filter(p => p.id !== id));
    }
  }, []);

  const editGalleryPost = useCallback(async (id, title, content, images, attachments, isFeatured) => {
    setGalleryPosts(prev => prev.map(p =>
      p.id === id ? { ...p, title, content,
        ...(images      !== undefined && { images }),
        ...(attachments !== undefined && { attachments }),
        ...(isFeatured  !== undefined && { isFeatured }),
      } : p
    ));
    const { error } = await supabase.from('gallery_posts').update({
      title, content,
      ...(images      !== undefined && { images }),
      ...(attachments !== undefined && { attachments }),
      ...(isFeatured  !== undefined && { is_featured: isFeatured }),
    }).eq('id', id);
    if (error) console.error('[Supabase] gallery update 실패:', error.message);
  }, []);

  const deleteGalleryPost = useCallback(async (id) => {
    setGalleryPosts(prev => prev.filter(p => p.id !== id));
    const { error } = await supabase.from('gallery_posts').delete().eq('id', id);
    if (error) console.error('[Supabase] gallery delete 실패:', error.message);
  }, []);

  // ── Board CRUD ──
  const addBoardPost = useCallback(async (title, content, category) => {
    const id = `b${Date.now()}`;
    const author = generateNickname();
    const date = todayStr();
    const optimistic = { id, category, title, content, author, date, likes: 0, dislikes: 0, isApproved: false, comments: [] };
    setBoardPosts(prev => [optimistic, ...prev]);

    const { error } = await supabase.from('board_posts').insert({
      id, category, title, content, author, date, is_approved: false,
    });
    if (error) {
      console.error('[Supabase] board insert 실패:', error.message);
      setBoardPosts(prev => prev.filter(p => p.id !== id));
    }
  }, []);

  const editBoardPost = useCallback(async (id, title, content) => {
    setBoardPosts(prev => prev.map(p => p.id === id ? { ...p, title, content } : p));
    const { error } = await supabase.from('board_posts').update({ title, content }).eq('id', id);
    if (error) console.error('[Supabase] board update 실패:', error.message);
  }, []);

  const deleteBoardPost = useCallback(async (id) => {
    setBoardPosts(prev => prev.filter(p => p.id !== id));
    const { error } = await supabase.from('board_posts').delete().eq('id', id);
    if (error) console.error('[Supabase] board delete 실패:', error.message);
  }, []);

  const approveBoardPost = useCallback(async (id) => {
    setBoardPosts(prev => prev.map(p => p.id === id ? { ...p, isApproved: true } : p));
    const { error } = await supabase.from('board_posts').update({ is_approved: true }).eq('id', id);
    if (error) console.error('[Supabase] board approve 실패:', error.message);
  }, []);

  // ── Board Comments ──
  const addComment = useCallback(async (postId, content) => {
    const id = `c${Date.now()}`;
    const author = isAdmin ? '📢 관리자 공식 답변' : generateNickname();
    const date = todayStr();
    const newComment = { id, author, content, likes: 0, dislikes: 0, isAdmin, date };
    setBoardPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
    ));

    const { error } = await supabase.from('board_comments').insert({
      id, post_id: postId, author, content, is_admin: isAdmin, date,
    });
    if (error) {
      console.error('[Supabase] comment insert 실패:', error.message);
      setBoardPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, comments: p.comments.filter(c => c.id !== id) } : p
      ));
    }
  }, [isAdmin]);

  // ── Votes (localStorage 어뷰징 방지 + Supabase 숫자 동기화) ──
  const voteBoardPost = useCallback((postId, type) => {
    const current = getVoteState('post', postId);
    let newLikes, newDislikes;

    setBoardPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      let { likes, dislikes } = p;
      if (current === type) {
        // 토글 OFF
        if (type === 'like') likes = Math.max(0, likes - 1);
        else dislikes = Math.max(0, dislikes - 1);
        setVoteState('post', postId, null);
      } else {
        // 반대 해제 후 신규 적용
        if (current === 'like') likes = Math.max(0, likes - 1);
        if (current === 'dislike') dislikes = Math.max(0, dislikes - 1);
        if (type === 'like') likes++;
        else dislikes++;
        setVoteState('post', postId, type);
      }
      newLikes = likes; newDislikes = dislikes;
      return { ...p, likes, dislikes };
    }));

    // Supabase 숫자 싱크 (fire-and-forget)
    setTimeout(() => {
      supabase.from('board_posts').update({ likes: newLikes, dislikes: newDislikes }).eq('id', postId)
        .then(({ error }) => { if (error) console.error('[Supabase] vote sync 실패:', error.message); });
    }, 0);
  }, []);

  const voteComment = useCallback((postId, commentId, type) => {
    const current = getVoteState('comment', commentId);
    let syncLikes, syncDislikes;

    setBoardPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const comments = p.comments.map(c => {
        if (c.id !== commentId) return c;
        let { likes, dislikes } = c;
        if (current === type) {
          if (type === 'like') likes = Math.max(0, likes - 1);
          else dislikes = Math.max(0, dislikes - 1);
          setVoteState('comment', commentId, null);
        } else {
          if (current === 'like') likes = Math.max(0, likes - 1);
          if (current === 'dislike') dislikes = Math.max(0, dislikes - 1);
          if (type === 'like') likes++;
          else dislikes++;
          setVoteState('comment', commentId, type);
        }
        syncLikes = likes; syncDislikes = dislikes;
        return { ...c, likes, dislikes };
      });
      return { ...p, comments };
    }));

    setTimeout(() => {
      supabase.from('board_comments').update({ likes: syncLikes, dislikes: syncDislikes }).eq('id', commentId)
        .then(({ error }) => { if (error) console.error('[Supabase] comment vote sync 실패:', error.message); });
    }, 0);
  }, []);

  return (
    <BoardContext.Provider value={{
      isAdmin, loginAdmin, logoutAdmin, isLoading,
      galleryPosts, addGalleryPost, editGalleryPost, deleteGalleryPost,
      boardPosts, addBoardPost, editBoardPost, deleteBoardPost, approveBoardPost,
      addComment, voteBoardPost, voteComment,
      getVoteState: (type, id) => getVoteState(type, id),
    }}>
      {children}
    </BoardContext.Provider>
  );
}

export function useBoard() {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error('useBoard must be used within BoardProvider');
  return ctx;
}
