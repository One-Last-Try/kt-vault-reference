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

  return (
    <nav className="bg-[#0d0c15] border-b border-[#1e1e2e] h-[80px] flex items-center px-4 md:px-6 gap-1 relative z-50">
      <Link to="/" className="mr-4 md:mr-6 shrink-0 flex items-center">
        <img src="/KTVault_logo.png" alt="KTVault" className="h-[40px] md:h-[72px] w-auto" />
      </Link>

      <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none flex-1">
        {links.map(({ to, label, color }) => {
          const isActive = location.pathname === to;
          return (
            <Link key={to} to={to}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0
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
    </nav>
  );
}
