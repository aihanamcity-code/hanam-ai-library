import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNavBar from './TopNavBar';
import Footer from './Footer';
import FloatingMenu from './FloatingMenu';
import { useBoard } from '../context/BoardContext';

const BANNER_H = 32;
const NAV_H = 48;

export default function Layout() {
  const { isAdmin, boardPosts } = useBoard();
  const pendingCount = boardPosts.filter(p => !p.isApproved).length;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-[#0071e3] selection:text-white">
      {isAdmin && (
        <div
          style={{ height: BANNER_H }}
          className="sticky top-0 left-0 right-0 z-[70] bg-gradient-to-r from-emerald-600/95 to-emerald-500/95 backdrop-blur-md flex items-center justify-center gap-2 text-white text-[12px] font-bold tracking-wider shadow-lg shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
          관리자 모드 활성화 중
          {pendingCount > 0 && (
            <span className="ml-2 flex items-center gap-1 px-2 py-0.5 bg-red-500/90 text-white text-[11px] font-black rounded-full shadow-sm">
              <span className="material-symbols-outlined text-[12px]">notifications</span>
              승인 대기 {pendingCount}건
            </span>
          )}
        </div>
      )}
      <TopNavBar bannerHeight={isAdmin ? BANNER_H : 0} />
      <main style={{ paddingTop: NAV_H }} className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <FloatingMenu />
    </div>
  );
}
