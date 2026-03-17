import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const FILTER_PILLS = [
  { label: 'Rules',   to: '/rules' },
  { label: 'Teams',   to: '/teams' },
  { label: 'Tac Ops', to: '/teams' },
  { label: 'Ploys',   to: '/teams' },
];

const TIER_PREVIEW = [
  { id: 'S', colour: '#FFD700', chips: ['Angels of Death', 'Deathwatch', 'Kasrkin'] },
  { id: 'A', colour: '#D94819', chips: ['Scout Squad', 'Pathfinders', 'Kommandos', 'Legionaries'] },
  { id: 'B', colour: '#e0c83c', chips: ['Blooded', 'Novitiates', 'Warpcoven'] },
  { id: 'C', colour: '#3cc864', chips: ['Wyrmblade', 'Chaos Cult'] },
  { id: 'D', colour: '#3c82e0', chips: ['Gellerpox Infected'] },
];

const CHANGE_DOT = {
  added:    'bg-green-400',
  modified: 'bg-amber-400',
  removed:  'bg-[#D94819]',
};

const TYPE_BADGE = {
  rule:      'bg-blue-900/60 text-blue-300',
  datacard:  'bg-orange-900/60 text-orange-300',
  team_rule: 'bg-purple-900/60 text-purple-300',
  changelog: 'bg-gray-800 text-gray-400',
};

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <section className="py-20 px-6 text-center border-b border-[#1e1e2e]">
      <div className="flex justify-center mb-8">
        <img src="/KTVault_tagline.png" alt="KTVault — Every rule. Every card." className="h-48 w-auto max-w-full" />
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto mb-6 flex-wrap">
        <label htmlFor="hero-search" className="sr-only">Search rules, operatives, factions</label>
        <input
          id="hero-search"
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search rules, operatives, factions…"
          className="flex-1 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg px-4 py-3 text-sm text-[#f0f0f0] placeholder-[#6a6a8a] focus:border-[#D94819]/60 min-w-[200px]"
        />
        <button type="submit"
          className="bg-[#D94819] hover:bg-[#c03a10] hover:brightness-110 text-white text-sm font-medium px-5 py-3 rounded-lg transition-colors">
          Search
        </button>
      </form>

      {/* Filter pills */}
      <div className="flex flex-wrap justify-center gap-2" aria-label="Browse by content type">
        {FILTER_PILLS.map(p => (
          <Link key={p.label} to={p.to}
            className="text-xs px-3 py-1.5 rounded-full border border-[#2a2a3e] text-[#8a8a9a] hover:text-[#e0e0f0] hover:border-[#D94819]/60 transition-colors">
            {p.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── Quick Access ──────────────────────────────────────────────────────────────
function QuickAccess() {
  const [counts, setCounts] = useState({ rules: null, datacards: null, factions: null });

  useEffect(() => {
    Promise.allSettled([
      axios.get(`${API}/api/rules`),
      axios.get(`${API}/api/datacards`),
      axios.get(`${API}/api/factions`),
    ]).then(([r, d, f]) => {
      setCounts({
        rules:     r.status === 'fulfilled' ? r.value.data.length : 0,
        datacards: d.status === 'fulfilled' ? d.value.data.length : 0,
        factions:  f.status === 'fulfilled' ? f.value.data.length : 0,
      });
    });
  }, []);

  const cards = [
    { label: 'Rules',     count: counts.rules,     desc: 'Core, Actions, Terrain & more', to: '/rules',     accent: '#3c82e0' },
    { label: 'Datacards', count: counts.datacards, desc: 'Operative stats & weapons',      to: '/datacards', accent: '#D94819' },
    { label: 'Teams',     count: counts.factions,  desc: 'Ploys, equipment & tac ops',     to: '/teams',     accent: '#3cc864' },
  ];

  return (
    <section className="py-14 px-6 border-b border-[#1e1e2e]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-[#7a7a8a] text-xs uppercase tracking-widest mb-6">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cards.map(c => (
            <Link key={c.label} to={c.to}
              className="group bg-[#1a1a2e] border border-[#2a2a3e] hover:border-[#D94819]/60 hover:bg-[#D94819]/5 rounded-xl p-6 transition-colors">
              <div className="text-[#D94819] text-3xl font-black mb-1">
                {c.count === null ? <span className="text-[#6a6a7a] animate-pulse">—</span> : c.count}
              </div>
              <p className="text-[#f0f0f0] font-medium text-sm mb-1">{c.label}</p>
              <p className="text-[#7a7a8a] text-xs">{c.desc}</p>
              <div className="mt-4 text-[#8a8a9a] text-xs group-hover:text-[#D94819] transition-colors">
                Browse →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Changelog Snapshot ────────────────────────────────────────────────────────
function ChangelogSnapshot() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/changelog`)
      .then(r => setEntries(r.data.slice(0, 5)))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  const added    = entries.filter(e => e.change_type === 'added').length;
  const modified = entries.filter(e => e.change_type === 'modified').length;
  const removed  = entries.filter(e => e.change_type === 'removed').length;

  return (
    <section className="py-14 px-6 border-b border-[#1e1e2e]">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <h2 className="text-[#7a7a8a] text-xs uppercase tracking-widest">Latest Changes</h2>
          <Link to="/changelog" className="text-xs text-[#D94819] hover:underline">
            View full changelog →
          </Link>
        </div>

        <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-[#2a2a3e] rounded animate-pulse" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-[#6a6a7a] text-sm">No changelog entries yet.</p>
              <p className="text-[#6a6a7a] text-xs mt-1">Import a PDF in the Admin panel to generate entries.</p>
            </div>
          ) : (
            <>
              {entries.map((e, i) => (
                <div key={e.id ?? i}
                  className="flex items-center gap-3 px-5 py-3 border-b border-[#0f0e17] last:border-0 hover:bg-[#0f0e17]/50 transition-colors flex-wrap">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${CHANGE_DOT[e.change_type] ?? 'bg-[#7a7a8a]'}`} aria-hidden="true" />
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${TYPE_BADGE[e.content_type] ?? TYPE_BADGE.changelog}`}>
                    {e.content_type ?? 'entry'}
                  </span>
                  <p className="text-[#ccc] text-xs flex-1 truncate">{e.summary ?? '—'}</p>
                  {e.version && (
                    <span className="text-xs bg-green-900/40 text-green-400 border border-green-700/30 px-2 py-0.5 rounded shrink-0">
                      {e.version}
                    </span>
                  )}
                  {e.approved_at && (
                    <span className="text-[#7a7a8a] text-xs shrink-0">
                      {e.approved_at.slice(0, 10)}
                    </span>
                  )}
                </div>
              ))}

              {/* Summary row */}
              <div className="flex items-center gap-4 px-5 py-3 bg-[#0f0e17]/60 text-xs text-[#8a8a9a] flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" aria-hidden="true" />{added} added
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" aria-hidden="true" />{modified} modified
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D94819]" aria-hidden="true" />{removed} removed
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Tier Maker CTA ────────────────────────────────────────────────────────────
function TierMakerCTA() {
  return (
    <section className="py-14 px-6 border-b border-[#1e1e2e]">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-[#7a7a8a] text-xs uppercase tracking-widest mb-3">Tier Maker</h2>
          <h3 className="text-[#f0f0f0] text-2xl font-black mb-3 leading-snug">
            Rank every<br />Kill Team.
          </h3>
          <p className="text-[#8a8a9a] text-sm mb-6 leading-relaxed">
            Drag and drop all 46 factions into your personal S–D tier list and export it as a JPG to share.
          </p>
          <Link to="/tier-maker"
            className="inline-block bg-[#D94819] hover:bg-[#c03a10] hover:brightness-110 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
            Build my tier list →
          </Link>
        </div>

        {/* Static tier preview */}
        <div className="space-y-1.5 pointer-events-none select-none" aria-hidden="true">
          {TIER_PREVIEW.map(tier => (
            <div key={tier.id}
              className="flex items-center gap-0 rounded-lg overflow-hidden border border-[#2a2a3e]">
              <div className="w-10 shrink-0 flex items-center justify-center font-black text-sm h-10"
                style={{ background: tier.colour + '1a', color: tier.colour, borderRight: `2px solid ${tier.colour}33` }}>
                {tier.id}
              </div>
              <div className="flex-1 flex flex-wrap gap-1.5 p-1.5 bg-[#0d0c15]">
                {tier.chips.map(chip => (
                  <span key={chip}
                    className="text-[#a0a0b0] text-xs bg-[#1a1a2e] border border-[#2a2a3e] rounded px-2 py-0.5">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const links = [
    { to: '/rules',      label: 'Rules' },
    { to: '/datacards',  label: 'Datacards' },
    { to: '/teams',      label: 'Teams' },
    { to: '/tier-maker', label: 'Tier Maker' },
    { to: '/changelog',  label: 'Changelog' },
    { to: '/admin',      label: 'Admin' },
  ];
  return (
    <footer className="py-10 px-6">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 flex-wrap">
        <img src="/KTVault_logo.png" alt="KTVault" className="h-[72px] w-auto" />
        <nav aria-label="Footer navigation">
          <div className="flex flex-wrap gap-4 justify-center">
            {links.map(l => (
              <Link key={l.to} to={l.to} className="text-[#7a7a8a] text-xs hover:text-[#e0e0f0] transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
        <p className="text-[#6a6a7a] text-xs">Not affiliated with Games Workshop</p>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div id="main-content" className="min-h-[calc(100vh-80px)] flex flex-col">
      <Hero />
      <QuickAccess />
      <ChangelogSnapshot />
      <TierMakerCTA />
      <Footer />
    </div>
  );
}
