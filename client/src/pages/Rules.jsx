import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import EmptyState from '../components/EmptyState';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const CATEGORIES = ['All', 'Core Rules', 'Actions', 'Weapons', 'Terrain', 'Equipment'];

const CATEGORY_COLOURS = {
  'Core Rules': 'bg-blue-900/60 text-blue-300',
  'Actions':    'bg-green-900/60 text-green-300',
  'Weapons':    'bg-red-900/60 text-red-300',
  'Terrain':    'bg-yellow-900/60 text-yellow-300',
  'Equipment':  'bg-purple-900/60 text-purple-300',
};

function SkeletonCard() {
  return (
    <div className="kt-card p-4 space-y-2">
      <div className="flex justify-between gap-3">
        <div className="kt-skeleton h-3.5 w-1/3" />
        <div className="kt-skeleton h-5 w-16 rounded-full" />
      </div>
      <div className="kt-skeleton h-2.5 w-full" />
      <div className="kt-skeleton h-2.5 w-5/6" />
      <div className="kt-skeleton h-2.5 w-4/6" />
    </div>
  );
}

function RuleCard({ rule, highlighted }) {
  const badgeClass = CATEGORY_COLOURS[rule.category] || 'bg-gray-800/60 text-gray-300';
  return (
    <div id={'rule-' + rule.id} className={`kt-card p-4 hover:border-[#D94819]/60 hover:bg-[#D94819]/5${highlighted ? ' border-[#D94819] bg-[#D94819]/10' : ''}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-[var(--text)] font-medium text-sm">{rule.title}</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${badgeClass}`}>{rule.category}</span>
      </div>
      <p className="text-[var(--muted)] text-xs leading-relaxed mb-3">{rule.content}</p>
      <div className="flex items-center gap-3 flex-wrap">
        {rule.page_ref && <span className="text-[#8a8a9a] text-xs">p. {rule.page_ref}</span>}
        {rule.version  && (
          <span className="text-[var(--kt)] text-xs border border-[var(--kt)]/30 px-1.5 py-0.5 rounded">
            {rule.version}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Rules() {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');

  const [rules, setRules]               = useState([]);
  const [loading, setLoading]           = useState(false);
  const [search, setSearch]             = useState('');
  const [debouncedSearch, setDebounced] = useState('');
  const [category, setCategory]         = useState('All');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (category !== 'All') params.category = category;
    axios.get(`${API}/api/rules`, { params })
      .then(res => setRules(res.data))
      .catch(() => setRules([]))
      .finally(() => setLoading(false));
  }, [debouncedSearch, category]);

  useEffect(() => {
    if (!loading && highlightId) {
      const el = document.getElementById('rule-' + highlightId);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightId, loading]);

  return (
    <div id="main-content" className="flex h-[calc(100vh-80px)]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[200px] shrink-0 bg-[var(--nav)] border-r border-[var(--border)] py-4 flex-col overflow-y-auto">
        <p className="text-[#7a7a8a] text-xs uppercase tracking-widest px-4 mb-3">Category</p>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            aria-pressed={category === cat}
            className={`w-full text-left px-4 py-2 text-xs transition-colors border-l-2
              ${category === cat
                ? 'border-[var(--kt)] text-[var(--text)] bg-[var(--panel)]'
                : 'border-transparent text-[#8a8a9a] hover:text-[#e0e0f0] hover:bg-[var(--panel)]/50'}`}>
            {cat}
          </button>
        ))}
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile horizontal filter */}
        <div className="md:hidden flex gap-2 px-4 py-2 overflow-x-auto border-b border-[var(--border)] bg-[var(--nav)] scrollbar-none" role="group" aria-label="Filter by category">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              aria-pressed={category === cat}
              className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap shrink-0 transition-colors
                ${category === cat
                  ? 'border-[var(--kt)] text-[var(--kt)] bg-[var(--kt-dim)]'
                  : 'border-[#2a2a3e] text-[#8a8a9a] hover:text-[#e0e0f0]'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-4 md:px-6 py-3 border-b border-[var(--border)] bg-[var(--nav)]">
          <label htmlFor="rules-search" className="sr-only">Search rules</label>
          <input id="rules-search" type="text" placeholder="Search rules…" value={search}
            onChange={e => setSearch(e.target.value)} className="kt-input" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {loading ? (
            <div className="grid gap-3">{[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : rules.length === 0 ? (
            <EmptyState
              message="No rules found"
              sub={debouncedSearch || category !== 'All' ? 'Try adjusting your filters.' : 'Import a PDF to add rules.'}
              onClear={debouncedSearch || category !== 'All' ? () => { setSearch(''); setCategory('All'); } : undefined}
            />
          ) : (
            <>
              <p className="text-[#7a7a8a] text-xs mb-4">{rules.length} rule{rules.length !== 1 ? 's' : ''}</p>
              <div className="grid gap-3">{rules.map(r => <RuleCard key={r.id} rule={r} highlighted={String(r.id) === highlightId} />)}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
