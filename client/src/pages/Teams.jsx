import { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const GROUP_BORDER = {
  Classified:   { normal: 'border-[#c8a84b]/30 hover:border-[#c8a84b]/70', selected: 'border-[#D94819] bg-[#1e1620]' },
  Declassified: { normal: 'border-[#4b7ec8]/30 hover:border-[#4b7ec8]/70', selected: 'border-[#D94819] bg-[#1e1620]' },
};

const GROUP_BADGE = {
  Classified:   'bg-[#c8a84b]/20 text-[#c8a84b]',
  Declassified: 'bg-[#4b7ec8]/20 text-[#4b7ec8]',
};

const SEASON_BADGE = {
  'Gallowdark':   'bg-[#1a2a1a]/80 text-[#6abf6a] border border-[#6abf6a]/30',
  'Bheta-Decima': 'bg-[#1a1a2a]/80 text-[#8888dd] border border-[#8888dd]/30',
  'Volkus':       'bg-[#2a1a1a]/80 text-[#d97b6a] border border-[#d97b6a]/30',
  'Tomb World':   'bg-[#1a1a1a]/80 text-[#b8b8c8] border border-[#aaaaaa]/30',
};

// Fixed tab order matching the PDF structure
const TAB_ORDER = ['faction_rules', 'operative', 'tac_op', 'ploy', 'equipment', 'strategic_ploy', 'tactical_ploy'];

const TAB_LABEL = {
  faction_rules:  'Faction Rules',
  operative:      'Operatives',
  tac_op:         'Tacops',
  ploy:           'Ploys',
  equipment:      'Equipment',
  strategic_ploy: 'Strategic Ploys',
  tactical_ploy:  'Tactical Ploys',
};

const PLOY_COLOUR   = 'bg-purple-900/60 text-purple-200';
const TAC_OP_COLOUR = 'bg-green-900/60 text-green-200';
const EQUIP_COLOUR  = 'bg-yellow-900/60 text-yellow-200';
const FR_COLOUR     = 'bg-blue-900/60 text-blue-200';

const FACTION_ICONS = {
  'Angels of Death':         '/faction-icons/Angels_of_Death.png',
  'Battleclade':             '/faction-icons/Battleclade.png',
  'Blades of Khaine':        '/faction-icons/Blades_of_Khaine.png',
  'Brood Brothers':          '/faction-icons/Brood_Brothers.png',
  'Canoptek Circle':         '/faction-icons/Canoptek_Circle.png',
  'Celestian Insidiants':    '/faction-icons/Celestian_Insidiants.png',
  'Chaos Cult':              '/faction-icons/Chaos_Cult.png',
  'Deathwatch':              '/faction-icons/Deatwatch.png',
  'Exaction Squad':          '/faction-icons/Exaction_Squad.png',
  'Farstalker Kinband':      '/faction-icons/Farstalker_Kinband.png',
  'Fellgor Ravagers':        '/faction-icons/Fellgor_Ravagers.png',
  'Goremongers':             '/faction-icons/Goremongers.png',
  'Hand of the Archon':      '/faction-icons/Hand_of_the_archon.png',
  'Hearthkyn Salvagers':     '/faction-icons/Hearthkyn_Salvagers.png',
  'Hernkyn Yaegirs':         '/faction-icons/Hernkyn_Yaegirs.png',
  'Hierotek Circle':         '/faction-icons/Hierotek_Circle.png',
  'Imperial Navy Breachers': '/faction-icons/Imperial_Navy_Breachers.png',
  'Inquisitorial Agents':    '/faction-icons/Inquisitorial_Agents.png',
  'Kasrkin':                 '/faction-icons/Kasrkin.png',
  'Mandrakes':               '/faction-icons/Mandrakes.png',
  'Murderwing':              '/faction-icons/Murderwing.png',
  'Nemesis Claw':            '/faction-icons/Nemesis_Claw.png',
  'Plague Marines':          '/faction-icons/Plague_Marines.png',
  'Ratlings':                '/faction-icons/Ratlings.png',
  'Raveners':                '/faction-icons/Raveners.png',
  'Sanctifiers':             '/faction-icons/Sanctifiers.png',
  'Scout Squad':             '/faction-icons/Scout_Squad.png',
  'Tempestus Aquilons':      '/faction-icons/Tempestus_Aquilons.png',
  'Vespid Stingwings':       '/faction-icons/Vespid_Stingwings.png',
  'Wolf Scouts':             '/faction-icons/Wolfe_Scouts.png',
  'Wrecka Krew':             '/faction-icons/Wrecka_Krew.png',
  'XV26 Stealth Battlesuits':'/faction-icons/XV26_Stealth_Battlesuits.png',
};

function nameToColour(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 25%, 22%)`;
}

function PlaceholderImage({ name, size = 'full' }) {
  const icon = FACTION_ICONS[name];
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const bg = nameToColour(name);
  const cls = size === 'full' ? 'w-full aspect-square' : 'w-10 h-10';
  if (icon) {
    return (
      <div className={`${cls} flex items-center justify-center rounded-t-lg bg-[#0d0c15]`} aria-hidden="true">
        <img src={icon} alt="" className="w-full h-full object-contain p-2" draggable={false} />
      </div>
    );
  }
  return (
    <div
      className={`${cls} flex items-center justify-center rounded-t-lg`}
      style={{ background: `linear-gradient(135deg, ${bg}, #0d0c15)` }}
      aria-hidden="true"
    >
      <span className="text-[#ffffff22] font-black select-none"
        style={{ fontSize: size === 'full' ? '2.5rem' : '0.9rem' }}>
        {initials}
      </span>
    </div>
  );
}

function FactionCard({ faction, selected, onClick, compact }) {
  const borders = GROUP_BORDER[faction.faction_group] || { normal: 'border-[#2a2a3e] hover:border-[#D94819]', selected: 'border-[#D94819] bg-[#1e1620]' };
  const badge   = GROUP_BADGE[faction.faction_group] || 'bg-gray-800 text-gray-300';

  if (compact) {
    return (
      <button
        onClick={onClick}
        aria-pressed={selected}
        className={`w-full flex items-center gap-2 p-2 rounded-lg border-2 text-left transition-all
          ${selected ? borders.selected : borders.normal + ' bg-[#1a1a2e]'}`}
      >
        <div className="shrink-0 w-10 h-10 rounded overflow-hidden bg-[#0d0c15]" aria-hidden="true">
          {FACTION_ICONS[faction.name]
            ? <img src={FACTION_ICONS[faction.name]} alt="" className="w-full h-full object-contain p-1" draggable={false} />
            : <div className="w-full h-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${nameToColour(faction.name)}, #0d0c15)` }}>
                <span className="text-[#ffffff33] font-black text-sm select-none">
                  {faction.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                </span>
              </div>
          }
        </div>
        <div>
          <p className="text-[#ccc] text-xs font-medium leading-snug">{faction.name}</p>
          {faction.season && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full mt-0.5 inline-block ${SEASON_BADGE[faction.season] || 'bg-[#2a2a2a] text-[#a0a0b0]'}`}>
              {faction.season}
            </span>
          )}
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-lg border-2 overflow-hidden text-left transition-all hover:brightness-110
        ${selected ? borders.selected : borders.normal + ' bg-[#1a1a2e]'}`}
    >
      <PlaceholderImage name={faction.name} size="full" />
      <div className="px-2 py-2.5">
        <p className="text-[#f0f0f0] text-sm font-semibold leading-snug mb-1.5 text-center">{faction.name}</p>
        <div className="flex flex-wrap gap-1 justify-center">
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${badge}`}>
            {faction.faction_group}
          </span>
          {faction.season && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${SEASON_BADGE[faction.season] || 'bg-[#2a2a2a] text-[#a0a0b0]'}`}>
              {faction.season}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

const SUBTYPE_BADGE = {
  'Strategy':      'bg-[#1a1030] text-[#c084fc] border border-[#c084fc]/30',
  'Firefight':     'bg-[#1a2a10] text-[#86efac] border border-[#86efac]/30',
  'SEEK-DESTROY':  'bg-[#2a1010] text-[#f87171] border border-[#f87171]/30',
  'SECURITY':      'bg-[#10202a] text-[#7dd3fc] border border-[#7dd3fc]/30',
  'Chapter Tactic':'bg-[#2a1a10] text-[#fdba74] border border-[#fdba74]/30',
};

// ── Rule card (faction_rules, ploys, tacops, equipment) ──────────────────────
function RuleCard({ rule }) {
  return (
    <div className="bg-[#1a1a2e] rounded-lg p-4 border border-[#2a2a3e]">
      <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
        <p className="text-[#f0f0f0] text-sm font-semibold uppercase tracking-wide">{rule.name}</p>
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          {rule.subtype && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${SUBTYPE_BADGE[rule.subtype] || 'bg-[#2a2a3e] text-[#a0a0b0]'}`}>
              {rule.subtype}
            </span>
          )}
          {rule.cost > 0 && (
            <span className="text-[#D94819] text-xs font-bold">{rule.cost}CP</span>
          )}
        </div>
      </div>
      {rule.description && (
        <p className="text-[#a0a0b0] text-xs leading-relaxed whitespace-pre-wrap">{rule.description}</p>
      )}
    </div>
  );
}

// ── Operative card ────────────────────────────────────────────────────────────
function OperativeCard({ op }) {
  const stats    = (() => { try { return JSON.parse(op.stats_json    || '{}'); } catch { return {}; } })();
  const weapons  = (() => { try { return JSON.parse(op.weapons_json  || '[]'); } catch { return []; } })();
  const abilities = (() => { try { return JSON.parse(op.abilities_json || '[]'); } catch { return []; } })();

  return (
    <div className="bg-[#1a1a2e] rounded-lg border border-[#2a2a3e] overflow-hidden">
      {/* Header */}
      <div className="bg-[#D94819]/10 border-b border-[#D94819]/20 px-4 py-2.5">
        <p className="text-[#f0f0f0] font-bold text-sm uppercase tracking-wide">{op.operative_name}</p>
      </div>

      <div className="px-4 py-3">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-1 mb-3">
          {Object.entries(stats).map(([k, v]) => (
            <div key={k} className="bg-[#0d0c15] rounded p-1.5 text-center">
              <div className="text-[#8a8a9a] text-xs uppercase tracking-wider">{k}</div>
              <div className="text-[#f0f0f0] text-sm font-bold mt-0.5">{v}</div>
            </div>
          ))}
        </div>

        {/* Weapons */}
        {weapons.length > 0 && (
          <div className="mb-3 overflow-x-auto">
            <table className="w-full text-xs min-w-[300px]">
              <thead>
                <tr className="text-[#8a8a9a] border-b border-[#2a2a3e]">
                  <th className="text-left py-1 font-normal">Name</th>
                  <th className="text-center py-1 font-normal">ATK</th>
                  <th className="text-center py-1 font-normal">HIT</th>
                  <th className="text-center py-1 font-normal">DMG</th>
                  <th className="text-left py-1 font-normal pl-2">WR</th>
                </tr>
              </thead>
              <tbody>
                {weapons.map((w, i) => (
                  <tr key={i} className="border-b border-[#2a2a3e]/50 text-[#ccc]">
                    <td className="py-1 pr-2">{w.name}</td>
                    <td className="text-center py-1">{w.atk}</td>
                    <td className="text-center py-1">{w.hit}</td>
                    <td className="text-center py-1">{w.dmg}</td>
                    <td className="py-1 pl-2 text-[#a0a0b0]">{w.wr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Abilities */}
        {abilities.length > 0 && (
          <div className="space-y-1.5">
            {abilities.map((ab, i) => (
              <div key={i} className="bg-[#0d0c15] rounded p-2">
                <span className="text-[#D94819] text-xs font-semibold">{ab.name}: </span>
                <span className="text-[#a0a0b0] text-xs leading-relaxed">{ab.description}</span>
              </div>
            ))}
          </div>
        )}

        {/* Keywords */}
        {op.keywords && (
          <p className="mt-2 pt-2 border-t border-[#2a2a3e] text-[#7a7a8a] text-xs uppercase tracking-widest leading-relaxed">
            {op.keywords}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Teams() {
  const [factions, setFactions]     = useState([]);
  const [selected, setSelected]     = useState(null);
  const [teamRules, setTeamRules]   = useState([]);
  const [operatives, setOperatives] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [activeTab, setActiveTab]   = useState('faction_rules');
  const [groupFilter, setGroupFilter] = useState('all');
  const [tacOpFilter, setTacOpFilter] = useState('all');
  const [ployFilter, setPloyFilter]   = useState('all');

  useEffect(() => {
    axios.get(`${API}/api/factions`)
      .then(res => setFactions(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    Promise.all([
      axios.get(`${API}/api/teams`),
      axios.get(`${API}/api/datacards`, { params: { category: selected.name } }),
    ])
      .then(([rulesRes, cardsRes]) => {
        const rules = rulesRes.data.filter(r => r.faction_id === selected.id);
        setTeamRules(rules);
        setOperatives(cardsRes.data);
        // Set first available tab
        const ruleTypes = new Set(rules.map(r => r.type));
        const firstTab = TAB_ORDER.find(t => t === 'operative' ? cardsRes.data.length > 0 : ruleTypes.has(t));
        setActiveTab(firstTab || 'faction_rules');
      })
      .catch(() => { setTeamRules([]); setOperatives([]); })
      .finally(() => setLoading(false));
  }, [selected]);

  const groups = ['Classified', 'Declassified'];
  const filteredFactions = groupFilter === 'all' ? factions : factions.filter(f => f.faction_group === groupFilter);

  // Determine which tabs to show in order
  const ruleTypes = new Set(teamRules.map(r => r.type));
  const availableTabs = TAB_ORDER.filter(t =>
    t === 'operative' ? operatives.length > 0 : ruleTypes.has(t)
  );

  // Derive available archetypes for this team's tacops
  const tacOpArchetypes = [...new Set(
    teamRules.filter(r => r.type === 'tac_op' && r.subtype).map(r => r.subtype)
  )];

  // Filtered content per tab
  const visibleContent = (() => {
    if (activeTab === 'operative') return null;
    let base = teamRules.filter(r => r.type === activeTab);
    if (activeTab === 'tac_op' && tacOpFilter !== 'all')
      return base.filter(r => r.subtype === tacOpFilter);
    if (activeTab === 'ploy' && ployFilter !== 'all')
      return base.filter(r => r.subtype === ployFilter);
    if (activeTab === 'faction_rules')
      base = [...base].sort((a, b) => (a.name === 'OPERATIVES' ? -1 : b.name === 'OPERATIVES' ? 1 : 0));
    return base;
  })();

  function selectFaction(f) {
    if (selected?.id === f.id) return;
    setSelected(f);
    setTeamRules([]);
    setOperatives([]);
    setActiveTab('faction_rules');
    setTacOpFilter('all');
    setPloyFilter('all');
  }

  return (
    <div id="main-content" className="flex h-[calc(100vh-80px)]">
      {/* Faction panel — hidden on mobile once a team is selected */}
      <div className={`overflow-y-auto transition-all duration-300 ${selected ? 'hidden md:block md:w-[260px] md:shrink-0 md:border-r md:border-[#1e1e2e]' : 'w-full'}`}>
        <div className="p-5">
          {!selected && (
            <div className="flex gap-2 mb-5 flex-wrap" role="group" aria-label="Filter by faction group">
              {['all', ...groups].map(g => (
                <button key={g} onClick={() => setGroupFilter(g)}
                  aria-pressed={groupFilter === g}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize
                    ${groupFilter === g
                      ? 'border-[#D94819] text-[#D94819] bg-[#D94819]/10'
                      : 'border-[#2a2a3e] text-[#8a8a9a] hover:text-[#e0e0f0]'}`}>
                  {g === 'all' ? 'All' : g}
                </button>
              ))}
            </div>
          )}

          {selected && (
            <button
              onClick={() => { setSelected(null); setTeamRules([]); setOperatives([]); setActiveTab('faction_rules'); }}
              className="text-xs text-[#8a8a9a] hover:text-[#e0e0f0] mb-4 flex items-center gap-1"
            >
              ← All factions
            </button>
          )}

          {(selected ? groups : (groupFilter === 'all' ? groups : [groupFilter])).map(group => {
            const groupFactions = filteredFactions.filter(f => f.faction_group === group);
            if (!groupFactions.length) return null;
            return (
              <div key={group} className="mb-6">
                <h2 className="text-[#7a7a8a] text-xs uppercase tracking-widest mb-3">{group}</h2>
                {selected ? (
                  <div className="flex flex-col gap-1.5">
                    {groupFactions.map(f => (
                      <FactionCard key={f.id} faction={f} selected={selected?.id === f.id}
                        onClick={() => selectFaction(f)} compact />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-2 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
                    {groupFactions.map(f => (
                      <FactionCard key={f.id} faction={f} selected={false}
                        onClick={() => selectFaction(f)} compact={false} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile team selector */}
          <div className="md:hidden flex items-center gap-2 px-3 py-2 border-b border-[#1e1e2e] bg-[#0d0c15]">
            <button
              onClick={() => { setSelected(null); setTeamRules([]); setOperatives([]); setActiveTab('faction_rules'); }}
              className="shrink-0 text-[#8a8a9a] hover:text-[#e0e0f0] px-1 py-1 text-lg leading-none"
              aria-label="Back to all factions"
            >←</button>
            <select
              value={selected.id}
              onChange={e => {
                const f = factions.find(f => String(f.id) === e.target.value);
                if (f) selectFaction(f);
              }}
              className="flex-1 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg px-3 py-2 text-sm text-[#f0f0f0] focus:border-[#D94819]/60 focus:outline-none"
              aria-label="Select faction"
            >
              {groups.map(group => {
                const gf = factions.filter(f => f.faction_group === group);
                if (!gf.length) return null;
                return (
                  <optgroup key={group} label={group}>
                    {gf.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </optgroup>
                );
              })}
            </select>
          </div>

          {/* Tab bar */}
          <div className="px-4 py-0 border-b border-[#1e1e2e] bg-[#0d0c15] flex items-center gap-0 overflow-x-auto" role="tablist">
            <p className="text-[#f0f0f0] font-medium text-sm px-4 py-3 shrink-0 border-r border-[#1e1e2e] mr-2">{selected.name}</p>
            {loading ? (
              <span className="text-[#7a7a8a] text-xs px-3 py-3">Loading…</span>
            ) : availableTabs.map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                role="tab"
                aria-selected={activeTab === t}
                className={`text-xs px-4 py-3 border-b-2 shrink-0 transition-colors whitespace-nowrap
                  ${activeTab === t
                    ? 'border-[#D94819] text-[#f0f0f0]'
                    : 'border-transparent text-[#8a8a9a] hover:text-[#e0e0f0]'}`}>
                {TAB_LABEL[t] || t}
              </button>
            ))}
          </div>

          {/* Tacop filter bar */}
          {activeTab === 'tac_op' && tacOpArchetypes.length > 0 && (
            <div className="px-6 py-2.5 border-b border-[#1e1e2e] bg-[#0a0918] flex items-center gap-2 flex-wrap">
              {['all', ...tacOpArchetypes].map(a => {
                const colours = {
                  'SEEK-DESTROY': tacOpFilter === a ? 'border-[#f87171] text-[#f87171] bg-[#f87171]/10' : 'border-[#2a2a3e] text-[#8a8a9a] hover:text-[#f87171]/70',
                  'SECURITY':     tacOpFilter === a ? 'border-[#7dd3fc] text-[#7dd3fc] bg-[#7dd3fc]/10' : 'border-[#2a2a3e] text-[#8a8a9a] hover:text-[#7dd3fc]/70',
                  'RECON':        tacOpFilter === a ? 'border-[#86efac] text-[#86efac] bg-[#86efac]/10' : 'border-[#2a2a3e] text-[#8a8a9a] hover:text-[#86efac]/70',
                  'INFILTRATION': tacOpFilter === a ? 'border-[#c084fc] text-[#c084fc] bg-[#c084fc]/10' : 'border-[#2a2a3e] text-[#8a8a9a] hover:text-[#c084fc]/70',
                };
                const cls = a === 'all'
                  ? (tacOpFilter === 'all' ? 'border-[#D94819] text-[#D94819] bg-[#D94819]/10' : 'border-[#2a2a3e] text-[#8a8a9a] hover:text-[#e0e0f0]')
                  : (colours[a] || (tacOpFilter === a ? 'border-[#D94819] text-[#D94819] bg-[#D94819]/10' : 'border-[#2a2a3e] text-[#8a8a9a] hover:text-[#e0e0f0]'));
                return (
                  <button key={a} onClick={() => setTacOpFilter(a)}
                    aria-pressed={tacOpFilter === a}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${cls}`}>
                    {a === 'all' ? 'All Archetypes' : a}
                  </button>
                );
              })}
            </div>
          )}

          {/* Ploy filter bar */}
          {activeTab === 'ploy' && (
            <div className="px-6 py-2.5 border-b border-[#1e1e2e] bg-[#0a0918] flex items-center gap-2 flex-wrap">
              {[
                { key: 'all',       label: 'All Ploys',   active: 'border-[#D94819] text-[#D94819] bg-[#D94819]/10',       inactive: 'border-[#2a2a3e] text-[#8a8a9a] hover:text-[#e0e0f0]' },
                { key: 'Strategy',  label: 'Strategy',    active: 'border-[#c084fc] text-[#c084fc] bg-[#c084fc]/10',       inactive: 'border-[#2a2a3e] text-[#8a8a9a] hover:text-[#c084fc]/70' },
                { key: 'Firefight', label: 'Firefight',   active: 'border-[#86efac] text-[#86efac] bg-[#86efac]/10',       inactive: 'border-[#2a2a3e] text-[#8a8a9a] hover:text-[#86efac]/70' },
              ].map(({ key, label, active, inactive }) => (
                <button key={key} onClick={() => setPloyFilter(key)}
                  aria-pressed={ployFilter === key}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${ployFilter === key ? active : inactive}`}>
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="grid gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-[#1a1a2e] rounded-lg p-4 animate-pulse h-20" />
                ))}
              </div>
            ) : activeTab === 'operative' ? (
              operatives.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-[#8a8a9a] text-sm">No operatives found for this faction yet</p>
                </div>
              ) : (
                <>
                  <p className="text-[#7a7a8a] text-xs mb-4">{operatives.length} operative{operatives.length !== 1 ? 's' : ''}</p>
                  <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
                    {operatives.map(op => <OperativeCard key={op.id} op={op} />)}
                  </div>
                </>
              )
            ) : visibleContent?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-[#8a8a9a] text-sm">No content found for this section yet</p>
              </div>
            ) : (
              <>
                <p className="text-[#7a7a8a] text-xs mb-4">{visibleContent?.length} entr{visibleContent?.length !== 1 ? 'ies' : 'y'}</p>
                <div className="grid gap-3">
                  {visibleContent?.map(rule => <RuleCard key={rule.id} rule={rule} />)}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
