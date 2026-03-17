import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/',           label: 'Home' },
  { to: '/rules',      label: 'Rules' },
  { to: '/teams',      label: 'Teams' },
  { to: '/tier-maker', label: 'Tier Maker', color: 'text-[#a88be0]' },
  { to: '/changelog',  label: 'Changelog',  color: 'text-[#e0a83c]' },
];

export default function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="bg-[#0d0c15] border-b border-[#1e1e2e] h-[52px] flex items-center px-4 md:px-6 gap-1 relative z-50">
        <Link to="/" className="mr-4 md:mr-6 shrink-0 flex items-center">
          <img src="/KTVault_logo.png" alt="KTVault" className="h-[72px] w-auto" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          {links.map(({ to, label, color }) => {
            const isActive = location.pathname === to;
            return (
              <Link key={to} to={to}
                className={`text-xs px-3 py-1.5 rounded-md transition-colors
                  ${color
                    ? `${color} hover:opacity-80`
                    : isActive
                      ? 'text-[#f0f0f0] bg-[#1a1a2e] font-medium'
                      : 'text-[#8a8a9a] hover:text-[#e0e0f0] hover:bg-[#1a1a2e]/40'}`}>
                {label}
              </Link>
            );
          })}
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setOpen(v => !v)}
          className="md:hidden ml-auto p-2 text-[#8a8a9a] hover:text-[#e0e0f0] transition-colors"
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div id="mobile-nav" className="md:hidden fixed inset-0 top-[52px] z-40 bg-[#0d0c15]/95 backdrop-blur-sm border-t border-[#1e1e2e]">
          <div className="flex flex-col p-4 gap-1">
            {links.map(({ to, label, color }) => {
              const isActive = location.pathname === to;
              return (
                <Link key={to} to={to}
                  onClick={() => setOpen(false)}
                  className={`text-sm px-4 py-3 rounded-lg transition-colors
                    ${color
                      ? `${color}`
                      : isActive
                        ? 'text-[#f0f0f0] bg-[#1a1a2e] font-medium'
                        : 'text-[#8a8a9a] hover:text-[#e0e0f0] hover:bg-[#1a1a2e]/50'}`}>
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
