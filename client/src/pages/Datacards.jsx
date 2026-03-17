import { useState, useEffect } from 'react';
import axios from 'axios';
import EmptyState from '../components/EmptyState';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const STAT_KEYS = ['M', 'APL', 'GA', 'DF', 'SV', 'W'];

function StatBlock({ stats }) {
  const s = (() => { try { return JSON.parse(stats || '{}'); } catch { return {}; } })();
  return (
    <div className="flex border-t border-[var(--kt)]/20">
      {STAT_KEYS.map(k => (
        <div key={k} className="flex-1 text-center border-r border-[var(--kt)]/10 last:border-r-0 py-2">
          <div className="text-[#8a8a9a] text-xs uppercase tracking-wider">{k}</div>
          <div className="text-[var(--text)] text-sm font-bold mt-0.5">{s[k] ?? '—'}</div>
        </div>
      ))}
    </div>
  );
}

function WeaponsTable({ weapons }) {
  const rows = (() => { try { return JSON.parse(weapons || '[]'); } catch { return []; } })();
  if (!rows.length) return null;
  return (
    <div className="mt-3 overflow-x-auto">
      <p className="text-[var(--kt)] text-xs uppercase tracking-widest mb-1">Weapons</p>
      <table className="w-full text-xs min-w-[260px]">
        <thead><tr className="text-[#8a8a9a] border-b border-[#2a2a3e]">
          <th className="text-left py-1 font-normal">Name</th>
          <th className="text-center py-1 font-normal">A</th>
          <th className="text-center py-1 font-normal">BS/WS</th>
          <th className="text-center py-1 font-normal">D</th>
        </tr></thead>
        <tbody>
          {rows.map((w, i) => (
            <tr key={i} className="border-b border-[var(--border)] text-[#ccc]">
              <td className="py-1">{w.name ?? '—'}</td>
              <td className="text-center py-1">{w.attacks ?? '—'}</td>
              <td className="text-center py-1">{w.bs ?? w.skill ?? '—'}</td>
              <td className="text-center py-1">{w.damage ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AbilityChips({ abilities }) {
  const list = (() => { try { return JSON.parse(abilities || '[]'); } catch { return []; } })();
  if (!list.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {list.map((ab, i) => (
        <span key={i} title={ab.description ?? ''}
          className="text-xs bg-[var(--bg)] border border-[#2a2a3e] text-[#b8b8c8] px-2 py-0.5 rounded-full cursor-help">
          {ab.name ?? ab}
        </span>
      ))}
    </div>
  );
}

function Datacard({ card }) {
  return (
    <div className="kt-card overflow-hidden hover:border-[var(--kt)]/60 hover:bg-[#D94819]/5">
      <div className="bg-[var(--kt)] px-4 py-2.5 flex items-center justify-between flex-wrap gap-1">
        <div>
          <p className="text-white font-bold text-sm uppercase tracking-wide leading-tight">{card.operative_name}</p>
          <p className="text-orange-200 text-xs uppercase tracking-widest">{card.faction_name ?? 'Unknown'}</p>
        </div>
        {card.role && (
          <span className="text-orange-100 text-xs border border-orange-200/40 px-2 py-0.5 rounded">{card.role}</span>
        )}
      </div>
      <div className="px-4 pb-4">
        <StatBlock stats={card.stats_json} />
        <WeaponsTable weapons={card.weapons_json} />
        <AbilityChips abilities={card.abilities_json} />
        {card.version && (
          <p className="mt-3 text-[var(--kt)] text-xs border border-[var(--kt)]/20 inline-block px-1.5 py-0.5 rounded">{card.version}</p>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="kt-card overflow-hidden">
      <div className="h-14 kt-skeleton rounded-none" />
      <div className="p-4 space-y-2">
        <div className="kt-skeleton h-3 w-full" />
        <div className="kt-skeleton h-3 w-4/5" />
      </div>
    </div>
  );
}

export default function Datacards() {
  const [cards, setCards]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState('');
  const [debouncedSearch, setDeb]   = useState('');
  const [faction, setFaction]       = useState('');
  const [factions, setFactions]     = useState([]);

  useEffect(() => {
    axios.get(`${API}/api/factions`).then(r => setFactions(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDeb(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (faction) params.category = faction;
    axios.get(`${API}/api/datacards`, { params })
      .then(r => setCards(r.data))
      .catch(() => setCards([]))
      .finally(() => setLoading(false));
  }, [debouncedSearch, faction]);

  return (
    <div id="main-content" className="flex flex-col h-[calc(100vh-80px)]">
      <div className="px-4 md:px-6 py-3 border-b border-[var(--border)] bg-[var(--nav)] flex flex-col sm:flex-row gap-2">
        <label htmlFor="datacards-search" className="sr-only">Search operatives</label>
        <input id="datacards-search" type="text" placeholder="Search operatives…" value={search}
          onChange={e => setSearch(e.target.value)} className="kt-input flex-1" />
        <label htmlFor="datacards-faction" className="sr-only">Filter by faction</label>
        <select id="datacards-faction" value={faction} onChange={e => setFaction(e.target.value)}
          className="kt-input sm:w-48">
          <option value="">All Factions</option>
          {factions.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : cards.length === 0 ? (
          <EmptyState
            message="No datacards found"
            sub={debouncedSearch || faction ? 'Try adjusting your filters.' : 'Import a PDF to add operatives.'}
            onClear={debouncedSearch || faction ? () => { setSearch(''); setFaction(''); } : undefined}
          />
        ) : (
          <>
            <p className="text-[#7a7a8a] text-xs mb-4">{cards.length} operative{cards.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {cards.map(c => <Datacard key={c.id} card={c} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
