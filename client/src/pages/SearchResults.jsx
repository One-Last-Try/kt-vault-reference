import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const TYPE_META = {
  rule:     { label: 'Rule',      badge: 'bg-blue-900 text-blue-200',   to: '/rules' },
  datacard: { label: 'Datacard',  badge: 'bg-orange-900 text-orange-200', to: '/datacards' },
  team:     { label: 'Team Rule', badge: 'bg-purple-900 text-purple-200', to: '/teams' },
};

function highlight(text, query) {
  if (!query || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = String(text).split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-[#D94819]/30 text-[#f0f0f0] rounded px-0.5">{part}</mark>
      : part
  );
}

function getTo(item) {
  if (item._type === 'rule') return `/rules?highlight=${item.id}`;
  if (item._type === 'datacard') return `/teams?faction=${item.faction_id}&tab=operative&highlight=${item.id}`;
  return '/teams';
}

function ResultCard({ item, query }) {
  const meta = TYPE_META[item._type] || { label: item._type, badge: 'bg-gray-800 text-gray-300', to: '/' };
  const title = item.title || item.operative_name || item.name || '—';
  const sub   = item.category || item.faction_name || item.type || '';
  const body  = item.content || item.description || '';

  return (
    <Link to={getTo(item)} className="block bg-[#1a1a2e] rounded-lg p-4 border border-[#2a2a3e] hover:border-[#D94819]/60 hover:bg-[#D94819]/5 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-1 flex-wrap">
        <p className="text-[#f0f0f0] text-sm font-medium">{highlight(title, query)}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${meta.badge}`}>
          {meta.label}
        </span>
      </div>
      {sub && <p className="text-[#8a8a9a] text-xs mb-1">{highlight(sub, query)}</p>}
      {body && (
        <p className="text-[#a0a0b0] text-xs leading-relaxed line-clamp-2">
          {highlight(body, query)}
        </p>
      )}
    </Link>
  );
}

function Section({ title, badge, items, query }) {
  if (!items.length) return null;
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-[#f0f0f0] text-sm font-medium">{title}</h2>
        <span className={`text-xs px-2 py-0.5 rounded-full ${badge}`}>{items.length}</span>
      </div>
      <div className="grid gap-2">
        {items.map((item, i) => <ResultCard key={i} item={item} query={query} />)}
      </div>
    </div>
  );
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';

  const [input, setInput] = useState(q);
  const [results, setResults] = useState({ rules: [], datacards: [], teams: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => { setInput(q); }, [q]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (q) setSearchParams({ q });
    }, 300);
    return () => clearTimeout(t);
  }, [input]);

  useEffect(() => {
    if (!q.trim()) { setResults({ rules: [], datacards: [], teams: [] }); return; }
    setLoading(true);
    const params = { search: q };
    Promise.allSettled([
      axios.get(`${API}/api/rules`, { params }),
      axios.get(`${API}/api/datacards`, { params }),
      axios.get(`${API}/api/teams`, { params }),
    ]).then(([r, d, t]) => {
      setResults({
        rules:     (r.status === 'fulfilled' ? r.value.data : []).map(x => ({ ...x, _type: 'rule' })),
        datacards: (d.status === 'fulfilled' ? d.value.data : []).map(x => ({ ...x, _type: 'datacard' })),
        teams:     (t.status === 'fulfilled' ? t.value.data : []).map(x => ({ ...x, _type: 'team' })),
      });
    }).finally(() => setLoading(false));
  }, [q]);

  const total = results.rules.length + results.datacards.length + results.teams.length;

  return (
    <div id="main-content" className="max-w-3xl mx-auto px-6 py-8">
      <label htmlFor="search-main" className="sr-only">Search rules, datacards, and teams</label>
      <input
        id="search-main"
        type="text"
        value={input}
        onChange={e => { setInput(e.target.value); setSearchParams({ q: e.target.value }); }}
        placeholder="Search everything..."
        autoFocus
        className="w-full bg-[#1a1a2e] border border-[#2a2a3e] rounded-md px-4 py-3 text-sm text-[#f0f0f0] placeholder-[#6a6a8a] focus:border-[#D94819]/60 mb-6"
      />

      {loading ? (
        <div className="space-y-3" aria-label="Loading results" role="status">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-[#1a1a2e] rounded-lg p-4 animate-pulse h-16" />
          ))}
        </div>
      ) : !q.trim() ? (
        <p className="text-[#7a7a8a] text-sm text-center mt-16">Type something to search across rules, datacards, and teams</p>
      ) : total === 0 ? (
        <div className="text-center mt-16">
          <p className="text-[#6a6a7a] text-5xl mb-4" aria-hidden="true">☐</p>
          <p className="text-[#8a8a9a] text-sm">No results for "{q}"</p>
        </div>
      ) : (
        <>
          <p className="text-[#7a7a8a] text-xs mb-6">{total} result{total !== 1 ? 's' : ''} for "{q}"</p>
          <Section title="Rules"     badge={TYPE_META.rule.badge}     items={results.rules}     query={q} />
          <Section title="Datacards" badge={TYPE_META.datacard.badge} items={results.datacards} query={q} />
          <Section title="Team Rules" badge={TYPE_META.team.badge}    items={results.teams}     query={q} />
        </>
      )}
    </div>
  );
}
