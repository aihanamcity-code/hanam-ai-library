import { NavLink } from 'react-router-dom';

export default function TopNavBar({ bannerHeight = 0 }) {
  const navItems = [
    { name: '공지사항', path: '/notice' },
    { 
      name: 'AI 정책 안테나', 
      path: '/policy-analysis',
      subItems: [
        { name: 'AI 정책 분석', path: '/policy-analysis' },
        { name: 'AI & 팁 뱅크', path: '/tip-bank' },
        { name: '정책참고 카드뉴스', path: '/card-news' },
      ]
    },
    { name: '하남 위키', path: 'https://notebooklm.google.com/notebook/2a4ed484-1547-4e84-81d9-c21a0c8a4e5d', isExternal: true },
    { name: '직원 게시판', path: '/board' },
    { 
      name: 'AI 공구상자', 
      path: '/',
      subItems: [
        { name: '보도자료 초안 생성기', path: 'https://opal.google/app/11hEJtOp2a2sWJ7HRYrg93PMtNxelHRKr', isExternal: true },
        { name: '이미지 생성기(포스터, 카드뉴스)', path: 'https://opal.google/app/1J0T3teKwlaY1oXZE08zoN9kFXD5loJ16', isExternal: true },
        { name: '회의록 초안 생성기', path: 'https://opal.google/app/1IvYp1BFg53bDU8jw6nxrq_HbV-LHVEZK', isExternal: true },
        { name: '공문서 빨간펜 선생님', path: 'https://hanam-red-pen.onrender.com/', isExternal: true },
      ]
    },
  ];

  return (
    <nav
      style={{ top: bannerHeight }}
      className="fixed w-full h-[48px] z-50 glass-nav flex items-center justify-between px-10 max-w-full transition-[top] duration-300"
    >
      <div className="flex items-center gap-8 h-full">
        <NavLink to="/" className="flex items-center focus:outline-none h-full hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="하남시 로고" className="h-7 md:h-9 object-contain drop-shadow-md" />
          <span className="text-[20px] md:text-[26px] font-extrabold tracking-tight text-white ml-3 pt-0.5">AI 서재</span>
        </NavLink>
        
        <div className="hidden md:flex items-center gap-6 h-full">
          {navItems.map((item) => (
            <div key={item.name} className="relative group h-full flex items-center">
              {item.isExternal ? (
                <a
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[16px] uppercase transition-colors duration-200 text-white/90 group-hover:text-blue-400 font-semibold tracking-wider"
                >
                  {item.name}
                </a>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `text-[16px] uppercase transition-colors duration-200 ${
                      isActive
                        ? 'text-blue-500 font-bold tracking-wider'
                        : 'text-white/90 group-hover:text-blue-400 font-semibold tracking-wider'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              )}

              {/* Hover Dropdown */}
              {item.subItems && (
                <div className="absolute top-[48px] left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible translate-y-[-10px] group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 ease-in-out z-50">
                  <div className="w-max min-w-[200px] rounded-xl glass-nav flex flex-col py-2 shadow-2xl">
                    {item.subItems.map((sub, idx) => (
                      sub.isExternal ? (
                        <a
                          key={idx}
                          href={sub.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3 text-[16px] font-medium text-white/90 hover:text-[#0071e3] transition-colors duration-200 text-center whitespace-nowrap"
                        >
                          {sub.name}
                        </a>
                      ) : (
                        <NavLink
                          key={idx}
                          to={sub.path}
                          className="px-6 py-3 text-[16px] font-medium text-white/90 hover:text-[#0071e3] transition-colors duration-200 text-center whitespace-nowrap"
                        >
                          {sub.name}
                        </NavLink>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-4 h-full">
        <button className="text-white/90 hover:text-blue-400 transition-transform active:opacity-80 scale-95 focus:outline-none h-full flex items-center">
          <span className="material-symbols-outlined select-none" aria-hidden="true">account_circle</span>
        </button>
      </div>
    </nav>
  );
}
