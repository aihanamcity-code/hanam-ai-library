import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBoard } from '../context/BoardContext';

export default function FloatingMenu() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState(false);
  const navigate = useNavigate();
  const { isAdmin, loginAdmin, logoutAdmin, boardPosts } = useBoard();

  const pendingCount = boardPosts.filter(p => !p.isApproved).length;

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePolicy = () => navigate('/policy-analysis');

  const handleWiki = () => {
    window.open('https://notebooklm.google.com/notebook/2a4ed484-1547-4e84-81d9-c21a0c8a4e5d', '_blank', 'noopener,noreferrer');
  };

  const handleBoard = () => navigate('/board');

  const handleToolbox = () => {
    navigate('/');
    setTimeout(() => {
      document.getElementById('toolbox')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleLockClick = () => {
    if (isAdmin) {
      logoutAdmin();
      navigate('/');
    } else {
      setPw('');
      setPwError(false);
      setShowPwModal(true);
    }
  };

  const handlePwSubmit = () => {
    if (loginAdmin(pw)) {
      setShowPwModal(false);
      setPw('');
    } else {
      setPwError(true);
    }
  };

  return (
    <>
      <div
        className={`fixed right-8 bottom-12 z-[100] transition-all duration-500 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
        }`}
      >
        <div className="flex flex-col gap-6 py-10 px-3 rounded-full bg-black/60 backdrop-blur-[10px] border border-white/10 shadow-2xl">
          <MenuIcon icon="home" label="홈" onClick={handleHome} />
          <MenuIcon icon="radar" label="AI 정책 안테나" onClick={handlePolicy} />
          <MenuIcon icon="menu_book" label="하남위키" onClick={handleWiki} />
          <MenuIcon icon="forum" label="직원게시판" onClick={handleBoard} badge={isAdmin && pendingCount > 0 ? pendingCount : 0} />
          <MenuIcon icon="apps" label="AI 공구상자" onClick={handleToolbox} />
          <div className="w-full h-px bg-white/20 my-1"></div>
          <MenuIcon
            icon={isAdmin ? 'lock_open' : 'lock'}
            label={isAdmin ? '관리자 로그아웃' : '관리자'}
            onClick={handleLockClick}
            highlight={isAdmin}
            badge={!isAdmin && pendingCount > 0 ? pendingCount : 0}
          />
        </div>
      </div>

      {/* Password Modal */}
      {showPwModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" onClick={() => setShowPwModal(false)}></div>
          <div className="relative w-full max-w-sm bg-[#1c1c1e]/95 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.8)] p-8 z-10">
            <div className="text-center mb-6">
              <span className="material-symbols-outlined text-[48px] text-white/30 mb-3 block">admin_panel_settings</span>
              <h3 className="text-xl font-bold text-white mb-1">관리자 인증</h3>
              <p className="text-zinc-500 text-sm">관리자 비밀번호를 입력하세요</p>
            </div>
            <input
              type="password"
              value={pw}
              onChange={(e) => { setPw(e.target.value); setPwError(false); }}
              onKeyDown={(e) => e.key === 'Enter' && handlePwSubmit()}
              placeholder="비밀번호"
              autoFocus
              className={`w-full bg-white/5 border rounded-xl px-5 py-3 text-white text-sm text-center placeholder-zinc-500 focus:outline-none transition-all ${
                pwError ? 'border-red-500/50 shadow-[0_0_15px_rgba(255,59,48,0.2)]' : 'border-white/10 focus:border-[#0071e3]/50 focus:shadow-[0_0_15px_rgba(0,113,227,0.3)]'
              }`}
            />
            {pwError && <p className="text-red-400 text-xs text-center mt-2">비밀번호가 올바르지 않습니다</p>}
            <button
              onClick={handlePwSubmit}
              className="w-full mt-4 py-3 bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-sm rounded-xl transition-colors active:scale-[0.98]"
            >
              인증
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function MenuIcon({ icon, label, onClick, highlight, badge = 0 }) {
  return (
    <button
      onClick={onClick}
      className="group relative flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-colors"
    >
      <span className={`material-symbols-outlined transition-colors text-[25px] ${
        highlight ? 'text-emerald-400' : 'text-white/80 group-hover:text-[#0071e3]'
      }`}>
        {icon}
      </span>
      {/* Badge */}
      {badge > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg shadow-red-500/50 animate-pulse">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
      <span className="absolute right-full mr-5 bg-black/90 text-white text-[13px] font-medium py-1.5 px-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
        {label}
        {badge > 0 && <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-black rounded-full">{badge > 99 ? '99+' : badge}</span>}
      </span>
    </button>
  );
}
