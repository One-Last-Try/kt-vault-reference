import { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const CHANGE_TYPE_META = {
  added:    { dot: 'bg-green-400',  badge: 'bg-green-900/50 text-green-300 border-green-700/30',   label: 'Added' },
  modified: { dot: 'bg-amber-400',  badge: 'bg-amber-900/50 text-amber-300 border-amber-700/30',   label: 'Modified' },
  removed:  { dot: 'bg-[#D94819]',  badge: 'bg-red-900/50 text-red-300 border-red-700/30',          label: 'Removed' },
};

const CONTENT_TYPE_BADGE = {
  rule:      'bg-blue-900/50 text-blue-300',
  datacard:  'bg-orange-900/50 text-orange-300',
  team_rule: 'bg-purple-900/50 text-purple-300',
};

function formatDate(str) {
  if (!str) return '—';
  return str.slice(0, 10);
}

// ── Single entry row ──────────────────────────────────────────────────────────
function EntryRow({ entry }) {
  const [expanded, setExpanded] = useState(false);
  const meta    = CHANGE_TYPE_META[entry.change_type]    ?? { dot: 'bg-[#8a8a9a]', badge: 'bg-gray-800 text-gray-400', label: entry.change_type };
  const ctBadge = CONTENT_TYPE_BADGE[entry.content_type] ?? 'bg-gray-800 text-gray-400';

  let detail = null;
  if (entry.detail) {
    try { detail = JSON.parse(entry.detail); } catch { detail = null; }
  }

  return (
    <div className="border-b border-[#1a1a2e] last:border-0">
      <div
        className="flex items-center gap-3 px-5 py-3 hover:bg-[#1a1a2e]/50 transition-colors cursor-pointer flex-wrap"
        onClick={() => detail && setExpanded(v => !v)}
        role={detail ? 'button' : undefined}
        aria-expanded={detail ? expanded : undefined}
        tabIndex={detail ? 0 : undefined}
        onKeyDown={detail ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(v => !v); } } : undefined}
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} aria-hidden="true" />
        <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${meta.badge}`}>
          {meta.label}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${ctBadge}`}>
          {entry.content_type ?? 'entry'}
        </span>
        <p className="text-[#ccc] text-xs flex-1 truncate">{entry.summary ?? '—'}</p>
        {detail && (
          <span className="text-[#7a7a8a] text-xs shrink-0" aria-hidden="true">{expanded ? '▲' : '▼'}</span>
        )}
      </div>

      {expanded && detail && (
        <div className="px-5 pb-4 bg-[#0f0e17]/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {detail.old && (
              <div className="bg-red-950/20 border border-red-800/20 rounded-lg p-3">
                <p className="text-red-400 text-xs uppercase tracking-wider mb-2">Before</p>
                <pre className="text-[#a0a0b0] text-xs whitespace-pre-wrap break-all leading-relaxed">
                  {typeof detail.old === 'string' ? detail.old : JSON.stringify(detail.old, null, 2)}
                </pre>
              </div>
            )}
            {detail.new && (
              <div className="bg-green-950/20 border border-green-800/20 rounded-lg p-3">
                <p className="text-green-400 text-xs uppercase tracking-wider mb-2">After</p>
                <pre className="text-[#ccc] text-xs whitespace-pre-wrap break-all leading-relaxed">
                  {typeof detail.new === 'string' ? detail.new : JSON.stringify(detail.new, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Version block ─────────────────────────────────────────────────────────────
function VersionBlock({ version, entries }) {
  const [open, setOpen] = useState(true);

  const added    = entries.filter(e => e.change_type === 'added').length;
  const modified = entries.filter(e => e.change_type === 'modified').length;
  const removed  = entries.filter(e => e.change_type === 'removed').length;

  const sources = [...new Set(entries.map(e => e.source_pdf).filter(Boolean))];
  const date    = entries.map(e => e.approved_at).filter(Boolean).sort().pop();

  return (
    <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl overflow-hidden mb-4">
      {/* Header */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#0f0e17]/30 transition-colors text-left flex-wrap"
      >
        <span className="text-xs bg-green-900/50 text-green-400 border border-green-700/30 px-2.5 py-1 rounded font-bold shrink-0">
          {version}
        </span>
        {sources.length > 0 && (
          <span className="text-[#8a8a9a] text-xs truncate">{sources.join(', ')}</span>
        )}
        <span className="flex-1" />
        <div className="flex items-center gap-3 text-xs shrink-0 flex-wrap">
          {added    > 0 && <span className="text-green-400">{added} added</span>}
          {modified > 0 && <span className="text-amber-400">{modified} modified</span>}
          {removed  > 0 && <span className="text-red-400">{removed} removed</span>}
        </div>
        {date && <span className="text-[#7a7a8a] text-xs shrink-0">{formatDate(date)}</span>}
        <span className="text-[#7a7a8a] text-xs ml-2" aria-hidden="true">{open ? '▲' : '▼'}</span>
      </button>

      {/* Entries */}
      {open && (
        <div className="border-t border-[#0f0e17]">
          {entries.map((e, i) => <EntryRow key={e.id ?? i} entry={e} />)}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Changelog() {
  const [entries, setEntries]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filterChange, setFilterChange] = useState('all');
  const [filterContent, setFilterContent] = useState('all');
  const [search, setSearch]           = useState('');
  const [debSearch, setDebSearch]     = useState('');

  useEffect(() => {
    axios.get(`${API}/api/changelog`)
      .then(r => setEntries(r.data))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Apply filters
  const filtered = entries.filter(e => {
    if (filterChange  !== 'all' && e.change_type   !== filterChange)  return false;
    if (filterContent !== 'all' && e.content_type  !== filterContent) return false;
    if (debSearch && !( (e.summary ?? '').toLowerCase().includes(debSearch.toLowerCase()) ||
                        (e.version ?? '').toLowerCase().includes(debSearch.toLowerCase()) )) return false;
    return true;
  });

  // Group by version
  const grouped = filtered.reduce((acc, e) => {
    const v = e.version ?? 'Unknown';
    if (!acc[v]) acc[v] = [];
    acc[v].push(e);
    return acc;
  }, {});

  const versions = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
  const changeTypes  = ['all', 'added', 'modified', 'removed'];
  const contentTypes = ['all', 'rule', 'datacard', 'team_rule'];

  return (
    <div id="main-content" className="min-h-[calc(100vh-80px)] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[#f0f0f0] font-black text-2xl mb-1">Changelog</h1>
          <p className="text-[#7a7a8a] text-sm">Track every update imported from official Kill Team PDFs.</p>
        </div>

        {/* Filters */}
        <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[180px]">
            <label htmlFor="changelog-search" className="block text-[#7a7a8a] text-xs uppercase tracking-widest mb-2">Search</label>
            <input
              id="changelog-search"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter by summary or version…"
              className="w-full bg-[#0f0e17] border border-[#2a2a3e] rounded-md px-3 py-1.5 text-xs text-[#f0f0f0] placeholder-[#6a6a8a] focus:border-[#D94819]/60"
            />
          </div>

          <div>
            <p className="text-[#7a7a8a] text-xs uppercase tracking-widest mb-2" id="change-type-label">Change Type</p>
            <div className="flex gap-1.5 flex-wrap" role="group" aria-labelledby="change-type-label">
              {changeTypes.map(t => (
                <button key={t} onClick={() => setFilterChange(t)}
                  aria-pressed={filterChange === t}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors capitalize
                    ${filterChange === t
                      ? 'border-[#D94819] text-[#D94819] bg-[#D94819]/10'
                      : 'border-[#2a2a3e] text-[#8a8a9a] hover:text-[#e0e0f0]'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[#7a7a8a] text-xs uppercase tracking-widest mb-2" id="content-type-label">Content Type</p>
            <div className="flex gap-1.5 flex-wrap" role="group" aria-labelledby="content-type-label">
              {contentTypes.map(t => (
                <button key={t} onClick={() => setFilterContent(t)}
                  aria-pressed={filterContent === t}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors
                    ${filterContent === t
                      ? 'border-[#D94819] text-[#D94819] bg-[#D94819]/10'
                      : 'border-[#2a2a3e] text-[#8a8a9a] hover:text-[#e0e0f0]'}`}>
                  {t === 'team_rule' ? 'Team Rule' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {(filterChange !== 'all' || filterContent !== 'all' || debSearch) && (
            <button
              onClick={() => { setFilterChange('all'); setFilterContent('all'); setSearch(''); }}
              className="text-xs text-[#D94819] hover:underline self-end pb-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Results summary */}
        {!loading && (
          <p className="text-[#7a7a8a] text-xs mb-4">
            {filtered.length} entr{filtered.length !== 1 ? 'ies' : 'y'} across {versions.length} version{versions.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl h-16 animate-pulse" />
            ))}
          </div>
        ) : versions.length === 0 ? (
          <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-16 text-center">
            <p className="text-[#6a6a7a] text-5xl mb-4" aria-hidden="true">☐</p>
            {entries.length === 0 ? (
              <>
                <p className="text-[#8a8a9a] text-sm mb-2">No changelog entries yet.</p>
                <p className="text-[#6a6a7a] text-xs">Import a PDF from the Admin panel to generate entries.</p>
              </>
            ) : (
              <>
                <p className="text-[#8a8a9a] text-sm mb-2">No entries match your filters.</p>
                <button
                  onClick={() => { setFilterChange('all'); setFilterContent('all'); setSearch(''); }}
                  className="text-xs text-[#D94819] hover:underline mt-2"
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        ) : (
          versions.map(v => (
            <VersionBlock key={v} version={v} entries={grouped[v]} />
          ))
        )}
      </div>
    </div>
  );
}
