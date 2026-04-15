import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HeroSlider from '../components/HeroSlider';

export default function HomePage() {
  const [activeMenu, setActiveMenu] = useState('policy');

  const tools = [
    {
      icon: 'edit_note',
      title: '보도자료 초안 생성기',
      desc: '주요 정책 및 행사 보도자료를 AI가 정교하게 초안을 작성합니다.',
      link: 'https://opal.google/app/11hEJtOp2a2sWJ7HRYrg93PMtNxelHRKr'
    },
    {
      icon: 'image',
      title: '이미지 생성기(포스터, 카드뉴스)',
      desc: '홍보물 및 시각 자료를 위한 고품질 행정 이미지를 생성합니다.',
      link: 'https://opal.google/app/1J0T3teKwlaY1oXZE08zoN9kFXD5loJ16'
    },
    {
      icon: 'summarize',
      title: '회의록 초안 생성기',
      desc: '복잡한 회의 내용을 핵심 요점 위주로 일목요연하게 요약합니다.',
      link: 'https://opal.google/app/1IvYp1BFg53bDU8jw6nxrq_HbV-LHVEZK'
    },
    {
      icon: 'spellcheck',
      title: '공문서 빨간펜 선생님',
      desc: '공문서의 어법, 양식 및 완성도를 AI가 실시간으로 검토합니다.',
      link: 'https://hanam-red-pen.onrender.com/'
    }
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-black min-h-[921px] flex flex-col items-center justify-center text-center w-full relative overflow-hidden">
        
        {/* Full-bleed Cinematic Background Banner */}
        <div className="absolute top-1/2 left-0 w-full h-[500px] md:h-[700px] -translate-y-1/2 pointer-events-none">
          <img 
            className="w-full h-full object-cover opacity-50" 
            alt="cinematic visualization of high-tech digital data streams flowing through a dark space" 
            src="/hero-image.png"
          />
          {/* Vertical Fades */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none"></div>
          {/* Horizontal Fades */}
          <div className="absolute inset-y-0 left-0 w-1/3 md:w-1/4 bg-gradient-to-r from-black via-black/90 to-transparent pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-1/3 md:w-1/4 bg-gradient-to-l from-black via-black/90 to-transparent pointer-events-none"></div>
        </div>

        {/* Overlapping Text */}
        <div className="z-10 flex flex-col items-center px-6 relative drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
          <h1 className="hero-title text-[40px] md:text-[64px] font-bold text-white whitespace-nowrap">
            당신의 퇴근을 앞당길 AI 파트너
          </h1>
        </div>
      </section>

      {/* Highlight Hero Slider */}
      <HeroSlider />

      {/* Interactive Dashboard Section */}
      <section className="bg-black py-32 px-6 min-h-[600px] flex items-center">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-16 md:gap-24">
          {/* Left Side: Menus */}
          <div className="flex flex-col gap-10 flex-1 justify-center">
            {[
              { id: 'policy', label: 'AI 정책 안테나' },
              { id: 'wiki', label: '하남위키' },
              { id: 'board', label: '직원 게시판' }
            ].map(menu => (
              <button
                key={menu.id}
                onMouseEnter={() => setActiveMenu(menu.id)}
                onClick={() => setActiveMenu(menu.id)}
                className={`text-5xl md:text-[64px] font-bold text-left tracking-tight transition-all duration-300 ${
                  activeMenu === menu.id ? 'text-white opacity-100 translate-x-2' : 'text-white opacity-40 hover:opacity-70'
                }`}
              >
                {menu.label}
              </button>
            ))}
          </div>

          {/* Right Side: Dynamic Content */}
          <div className="flex-1 flex flex-col justify-center min-h-[350px]">
            <div key={activeMenu} className="fade-in-up w-full h-full flex flex-col justify-center">
              <div className="flex flex-col gap-5 w-full max-w-lg">
                {(
                  activeMenu === 'policy' ? [
                    { name: 'AI 정책 분석', path: '/policy-analysis', isExternal: false },
                    { name: 'AI & 팁 뱅크', path: '/tip-bank', isExternal: false },
                    { name: '정책참고 카드뉴스', path: '/card-news', isExternal: false }
                  ] :
                  activeMenu === 'wiki' ? [
                    { name: '하남시 맞춤형 챗봇 바로가기', path: 'https://notebooklm.google.com/notebook/2a4ed484-1547-4e84-81d9-c21a0c8a4e5d', isExternal: true }
                  ] :
                  [
                    { name: '실시간 핫 게시글', path: '/board', isExternal: false },
                    { name: '나만의 팁 공유', path: '/board', isExternal: false },
                    { name: '새로운 아이디어 제안', path: '/board', isExternal: false }
                  ]
                ).map((item, idx) => {
                  const ItemContent = (
                    <div className="group cursor-pointer bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] transition-all duration-300 rounded-2xl px-8 py-6 w-full flex justify-between items-center shadow-lg">
                      <span className="text-white text-xl font-medium tracking-wide">{item.name}</span>
                      <span className="text-zinc-500 group-hover:text-white transition-colors text-2xl">&gt;</span>
                    </div>
                  );
                  return item.isExternal ? (
                    <a key={idx} href={item.path} target="_blank" rel="noopener noreferrer" className="block w-full">
                      {ItemContent}
                    </a>
                  ) : (
                    <Link key={idx} to={item.path} className="block w-full">
                      {ItemContent}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Toolbox Grid */}
      <section id="toolbox" className="bg-[#f5f5f7] py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col mb-16 gap-2">
            <span className="text-[12px] font-semibold tracking-wider uppercase text-[#0071e3]">Collection</span>
            <h2 className="text-[48px] font-semibold tracking-tight text-[#1d1d1f]">AI 공구상자</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tools.map((tool, idx) => (
              <div key={idx} className="bg-white p-10 rounded-2xl custom-shadow group hover:scale-[1.02] transition-transform duration-500 flex flex-col justify-between h-[320px]">
                <div>
                  <span className="material-symbols-outlined text-zinc-400 mb-6 block text-4xl" aria-hidden="true">{tool.icon}</span>
                  <h3 className="text-[28px] font-semibold text-[#1d1d1f]">{tool.title}</h3>
                  <p className="mt-2 text-zinc-500 whitespace-nowrap overflow-hidden text-ellipsis">{tool.desc}</p>
                </div>
                <a className="text-[14px] font-semibold text-[#0071e3] hover:underline transition-all" href={tool.link} target="_blank" rel="noopener noreferrer">
                  도구 실행하기 &gt;
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
