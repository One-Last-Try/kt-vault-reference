import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function authHeaders() {
  const token = localStorage.getItem('kt_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Login ─────────────────────────────────────────────────────────────────────
function LoginForm({ onLogin }) {
  const [pw, setPw]       = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/api/admin/login`, { password: pw });
      localStorage.setItem('kt_admin_token', res.data.token);
      onLogin();
    } catch {
      setError('Invalid password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center h-[calc(100vh-52px)]">
      <form onSubmit={handleSubmit} className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-8 w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <img src="/KTVault_logo.png" alt="KTVault" className="h-10 w-auto" />
        </div>
        <h1 className="text-[#f0f0f0] font-bold text-base mb-6 text-center">Admin Access</h1>
        <div className="mb-3">
          <label htmlFor="admin-password" className="block text-[#a0a0b0] text-xs mb-1.5">Password</label>
          <input
            id="admin-password"
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="Enter password"
            autoFocus
            className="w-full bg-[#0f0e17] border border-[#2a2a3e] rounded-md px-3 py-2 text-sm text-[#f0f0f0] placeholder-[#6a6a8a] focus:border-[#D94819]/60"
          />
        </div>
        {error && <p className="text-red-400 text-xs mb-3" role="alert">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full bg-[#D94819] hover:bg-[#c03a10] hover:brightness-110 text-white text-sm font-medium py-2 rounded-md transition-colors disabled:opacity-50">
          {loading ? 'Checking…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

// ── Diff badge ────────────────────────────────────────────────────────────────
function DiffBadge({ kind }) {
  const map = {
    new:      'bg-green-900/60 text-green-300 border-green-700/50',
    modified: 'bg-amber-900/60 text-amber-300 border-amber-700/50',
    removed:  'bg-red-900/60 text-red-300 border-red-700/50',
    unchanged:'bg-[#1a1a2e] text-[#8a8a9a] border-[#2a2a3e]',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border uppercase tracking-wider ${map[kind] ?? map.unchanged}`}>
      {kind}
    </span>
  );
}

function FieldRow({ label, oldVal, newVal }) {
  const changed = String(oldVal ?? '') !== String(newVal ?? '');
  return (
    <div className={`text-xs rounded px-2 py-1 ${changed ? 'bg-amber-950/40' : ''}`}>
      <span className="text-[#8a8a9a] mr-2">{label}:</span>
      {changed ? (
        <>
          <span className="text-red-400 line-through mr-2">{oldVal ?? '—'}</span>
          <span className="text-green-400">{newVal ?? '—'}</span>
        </>
      ) : (
        <span className="text-[#a0a0b0]">{newVal ?? '—'}</span>
      )}
    </div>
  );
}

function DiffCard({ item, kind }) {
  const [expanded, setExpanded] = useState(false);
  const d = item.data ?? item.old ?? {};
  const title = d.title ?? d.operative_name ?? d.name ?? '(unnamed)';
  const typeLabel = { rule: 'Rule', datacard: 'Datacard', team_rule: 'Team Rule' }[item.type] ?? item.type;

  return (
    <div className={`rounded-lg border p-3 ${
      kind === 'new'      ? 'border-green-700/40 bg-green-950/20' :
      kind === 'modified' ? 'border-amber-700/40 bg-amber-950/20' :
      kind === 'removed'  ? 'border-red-700/40 bg-red-950/20' :
                            'border-[#2a2a3e] bg-[#1a1a2e]'
    }`}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <DiffBadge kind={kind} />
          <span className="text-xs text-[#8a8a9a] uppercase">{typeLabel}</span>
          <span className="text-[#ccc] text-xs font-medium truncate">{title}</span>
        </div>
        <button onClick={() => setExpanded(v => !v)}
          aria-expanded={expanded}
          aria-label={`${expanded ? 'Hide' : 'Show'} details for ${title}`}
          className="text-xs text-[#7a7a8a] hover:text-[#e0e0f0] shrink-0">
          {expanded ? 'Hide' : 'Details'}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-1 border-t border-[#2a2a3e] pt-3">
          {item.type === 'rule' && <>
            <FieldRow label="Category" oldVal={item.old?.category}   newVal={d.category} />
            <FieldRow label="Content"  oldVal={item.old?.content}    newVal={d.content} />
            <FieldRow label="Page ref" oldVal={item.old?.page_ref}   newVal={d.page_ref} />
          </>}
          {item.type === 'datacard' && <>
            <FieldRow label="Faction"  oldVal={item.old?.faction_name} newVal={d.faction} />
            <FieldRow label="Role"     oldVal={item.old?.role}         newVal={d.role} />
            <FieldRow label="Stats"    oldVal={item.old?.stats_json}   newVal={JSON.stringify(d.stats)} />
          </>}
          {item.type === 'team_rule' && <>
            <FieldRow label="Type"        oldVal={item.old?.type}        newVal={d.type} />
            <FieldRow label="Cost"        oldVal={item.old?.cost}        newVal={d.cost} />
            <FieldRow label="Description" oldVal={item.old?.description} newVal={d.description} />
          </>}
        </div>
      )}
    </div>
  );
}

// ── PDF Import tab ────────────────────────────────────────────────────────────
function PdfImportTab() {
  const [file, setFile]       = useState(null);
  const [uploading, setUploading] = useState(false);
  const [diff, setDiff]       = useState(null);
  const [importId, setImportId] = useState(null);
  const [approving, setApproving] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState('');
  const [history, setHistory] = useState([]);
  const inputRef = useRef();

  useEffect(() => {
    axios.get(`${API}/api/admin/imports`, { headers: authHeaders() })
      .then(r => setHistory(r.data))
      .catch(() => {});
  }, [done]);

  async function handleUpload() {
    if (!file) return;
    setUploading(true); setError(''); setDiff(null); setDone(false);
    const fd = new FormData();
    fd.append('pdf', file);
    try {
      const res = await axios.post(`${API}/api/admin/pdf`, fd, {
        headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' },
      });
      setDiff(res.data.diff);
      setImportId(res.data.id);
    } catch (e) {
      setError(e.response?.data?.error ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleApprove() {
    if (!importId) return;
    setApproving(true);
    try {
      await axios.post(`${API}/api/admin/pdf/${importId}/approve`, {}, { headers: authHeaders() });
      setDone(true); setDiff(null); setFile(null);
    } catch (e) {
      setError(e.response?.data?.error ?? 'Approve failed');
    } finally {
      setApproving(false);
    }
  }

  const totalChanges = diff ? diff.new.length + diff.modified.length + diff.removed.length : 0;

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-6">
        <h2 className="text-[#f0f0f0] text-sm font-medium mb-4">Upload PDF</h2>
        <div
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
          role="button"
          tabIndex={0}
          aria-label="Select a Kill Team PDF file to upload"
          className="border-2 border-dashed border-[#2a2a3e] hover:border-[#D94819]/50 rounded-lg p-8 text-center cursor-pointer transition-colors"
        >
          {file ? (
            <p className="text-[#D94819] text-sm">{file.name}</p>
          ) : (
            <p className="text-[#7a7a8a] text-sm">Click to select a Kill Team PDF</p>
          )}
          <label htmlFor="pdf-upload" className="sr-only">Select PDF file</label>
          <input id="pdf-upload" ref={inputRef} type="file" accept=".pdf" className="hidden"
            onChange={e => { setFile(e.target.files[0] ?? null); setDiff(null); setDone(false); }} />
        </div>
        {error && <p className="mt-3 text-red-400 text-xs" role="alert">{error}</p>}
        {done  && <p className="mt-3 text-green-400 text-xs" role="status">Changes approved and written to database.</p>}
        <button onClick={handleUpload} disabled={!file || uploading}
          className="mt-4 bg-[#D94819] hover:bg-[#c03a10] hover:brightness-110 disabled:opacity-40 text-white text-xs font-medium px-4 py-2 rounded-md transition-colors">
          {uploading ? 'Processing with AI…' : 'Upload & Analyse'}
        </button>
      </div>

      {/* Diff review */}
      {diff && (
        <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h2 className="text-[#f0f0f0] text-sm font-medium">Diff Review</h2>
              <p className="text-[#8a8a9a] text-xs mt-0.5">
                {diff.new.length} new · {diff.modified.length} modified · {diff.removed.length} removed · {diff.unchanged.length} unchanged
              </p>
            </div>
            {totalChanges > 0 && (
              <button onClick={handleApprove} disabled={approving}
                className="bg-green-700 hover:bg-green-600 hover:brightness-110 disabled:opacity-40 text-white text-xs font-medium px-4 py-2 rounded-md transition-colors">
                {approving ? 'Approving…' : `Approve All (${totalChanges})`}
              </button>
            )}
          </div>

          {totalChanges === 0 && (
            <p className="text-[#8a8a9a] text-sm text-center py-6">No changes detected — database is already up to date.</p>
          )}

          <div className="space-y-2">
            {diff.new.map((item, i)      => <DiffCard key={`new-${i}`}      item={item} kind="new" />)}
            {diff.modified.map((item, i) => <DiffCard key={`mod-${i}`}      item={item} kind="modified" />)}
            {diff.removed.map((item, i)  => <DiffCard key={`rem-${i}`}      item={item} kind="removed" />)}
          </div>
        </div>
      )}

      {/* Import history */}
      {history.length > 0 && (
        <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-6">
          <h2 className="text-[#f0f0f0] text-sm font-medium mb-4">Import History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[400px]">
              <thead>
                <tr className="text-[#7a7a8a] border-b border-[#2a2a3e]">
                  <th className="text-left pb-2 font-normal">ID</th>
                  <th className="text-left pb-2 font-normal">File</th>
                  <th className="text-left pb-2 font-normal">Status</th>
                  <th className="text-left pb-2 font-normal">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.id} className="border-b border-[#1e1e2e] text-[#a0a0b0]">
                    <td className="py-2 text-[#8a8a9a]">#{h.id}</td>
                    <td className="py-2 truncate max-w-[200px]">{h.filename}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        h.status === 'approved'  ? 'bg-green-900/50 text-green-300' :
                        h.status === 'pending'   ? 'bg-amber-900/50 text-amber-300' :
                        h.status === 'error'     ? 'bg-red-900/50 text-red-300' :
                        'bg-[#2a2a3e] text-[#8a8a9a]'}`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="py-2">{h.created_at?.slice(0, 16) ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Factions tab ──────────────────────────────────────────────────────────────
function FactionsTab() {
  const [factions, setFactions] = useState([]);
  useEffect(() => {
    axios.get(`${API}/api/factions`).then(r => setFactions(r.data)).catch(() => {});
  }, []);

  const groups = ['Classified', 'Declassified'];
  return (
    <div className="space-y-6">
      {groups.map(g => {
        const items = factions.filter(f => f.faction_group === g);
        return (
          <div key={g} className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-6">
            <h2 className="text-[#f0f0f0] text-sm font-medium mb-4">{g} <span className="text-[#7a7a8a] font-normal">({items.length})</span></h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {items.map(f => (
                <div key={f.id} className="bg-[#0f0e17] border border-[#2a2a3e] rounded-md px-3 py-2 text-xs text-[#a0a0b0]">
                  <span className="text-[#8a8a9a] mr-1">#{f.id}</span>{f.name}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Rules tab ─────────────────────────────────────────────────────────────────
function RulesTab() {
  const [rules, setRules] = useState([]);
  useEffect(() => {
    axios.get(`${API}/api/rules`).then(r => setRules(r.data)).catch(() => {});
  }, []);
  return (
    <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-6">
      <h2 className="text-[#f0f0f0] text-sm font-medium mb-4">Rules <span className="text-[#7a7a8a] font-normal">({rules.length})</span></h2>
      {rules.length === 0 ? (
        <p className="text-[#7a7a8a] text-sm text-center py-8">No rules in database yet. Import a PDF to add rules.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[400px]">
            <thead>
              <tr className="text-[#7a7a8a] border-b border-[#2a2a3e]">
                <th className="text-left pb-2 font-normal">ID</th>
                <th className="text-left pb-2 font-normal">Category</th>
                <th className="text-left pb-2 font-normal">Title</th>
                <th className="text-left pb-2 font-normal">Version</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(r => (
                <tr key={r.id} className="border-b border-[#1e1e2e] text-[#a0a0b0]">
                  <td className="py-2 text-[#8a8a9a]">#{r.id}</td>
                  <td className="py-2">{r.category}</td>
                  <td className="py-2 text-[#ccc]">{r.title}</td>
                  <td className="py-2 text-[#D94819]">{r.version ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Datacards tab ─────────────────────────────────────────────────────────────
function DatacardsTab() {
  const [cards, setCards] = useState([]);
  useEffect(() => {
    axios.get(`${API}/api/datacards`).then(r => setCards(r.data)).catch(() => {});
  }, []);
  return (
    <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-6">
      <h2 className="text-[#f0f0f0] text-sm font-medium mb-4">Datacards <span className="text-[#7a7a8a] font-normal">({cards.length})</span></h2>
      {cards.length === 0 ? (
        <p className="text-[#7a7a8a] text-sm text-center py-8">No datacards yet. Import a PDF to add operatives.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[400px]">
            <thead>
              <tr className="text-[#7a7a8a] border-b border-[#2a2a3e]">
                <th className="text-left pb-2 font-normal">ID</th>
                <th className="text-left pb-2 font-normal">Operative</th>
                <th className="text-left pb-2 font-normal">Faction</th>
                <th className="text-left pb-2 font-normal">Role</th>
                <th className="text-left pb-2 font-normal">Version</th>
              </tr>
            </thead>
            <tbody>
              {cards.map(c => (
                <tr key={c.id} className="border-b border-[#1e1e2e] text-[#a0a0b0]">
                  <td className="py-2 text-[#8a8a9a]">#{c.id}</td>
                  <td className="py-2 text-[#ccc]">{c.operative_name}</td>
                  <td className="py-2">{c.faction_name ?? '—'}</td>
                  <td className="py-2">{c.role ?? '—'}</td>
                  <td className="py-2 text-[#D94819]">{c.version ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
const TABS = ['PDF Import', 'Factions', 'Rules', 'Datacards'];

function Dashboard({ onLogout }) {
  const [tab, setTab] = useState('PDF Import');

  return (
    <div id="main-content" className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-[#f0f0f0] font-bold text-base">Admin Dashboard</h1>
        <button onClick={onLogout} className="text-xs text-[#8a8a9a] hover:text-[#e0e0f0] border border-[#2a2a3e] px-3 py-1.5 rounded transition-colors">
          Sign out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#1e1e2e] pb-0" role="tablist">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            role="tab"
            aria-selected={tab === t}
            className={`text-xs px-4 py-2 rounded-t transition-colors -mb-px border-b-2
              ${tab === t
                ? 'text-[#f0f0f0] border-[#D94819] bg-[#1a1a2e]'
                : 'text-[#8a8a9a] border-transparent hover:text-[#e0e0f0]'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'PDF Import'  && <PdfImportTab />}
      {tab === 'Factions'    && <FactionsTab />}
      {tab === 'Rules'       && <RulesTab />}
      {tab === 'Datacards'   && <DatacardsTab />}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('kt_admin_token'));

  function handleLogout() {
    localStorage.removeItem('kt_admin_token');
    setAuthed(false);
  }

  if (!authed) return <LoginForm onLogin={() => setAuthed(true)} />;
  return <Dashboard onLogout={handleLogout} />;
}
