import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  pointerWithin,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const TIERS = [
  { id: 'S', label: 'S', colour: '#FFD700' },
  { id: 'A', label: 'A', colour: '#D94819' },
  { id: 'B', label: 'B', colour: '#e0c83c' },
  { id: 'C', label: 'C', colour: '#3cc864' },
  { id: 'D', label: 'D', colour: '#3c82e0' },
];

const GROUP_ACCENT = {
  Classified:   '#c8a84b',
  Declassified: '#4b7ec8',
};

const FACTION_ICONS = {
  'Angels of Death':        '/faction-icons/Angels_of_Death.png',
  'Battleclade':            '/faction-icons/Battleclade.png',
  'Blades of Khaine':       '/faction-icons/Blades_of_Khaine.png',
  'Brood Brothers':         '/faction-icons/Brood_Brothers.png',
  'Canoptek Circle':        '/faction-icons/Canoptek_Circle.png',
  'Celestian Insidiants':   '/faction-icons/Celestian_Insidiants.png',
  'Chaos Cult':             '/faction-icons/Chaos_Cult.png',
  'Deathwatch':             '/faction-icons/Deatwatch.png',
  'Exaction Squad':         '/faction-icons/Exaction_Squad.png',
  'Farstalker Kinband':     '/faction-icons/Farstalker_Kinband.png',
  'Fellgor Ravagers':       '/faction-icons/Fellgor_Ravagers.png',
  'Goremongers':            '/faction-icons/Goremongers.png',
  'Hand of the Archon':     '/faction-icons/Hand_of_the_archon.png',
  'Hearthkyn Salvagers':    '/faction-icons/Hearthkyn_Salvagers.png',
  'Hernkyn Yaegirs':        '/faction-icons/Hernkyn_Yaegirs.png',
  'Hierotek Circle':        '/faction-icons/Hierotek_Circle.png',
  'Imperial Navy Breachers':'/faction-icons/Imperial_Navy_Breachers.png',
  'Inquisitorial Agents':   '/faction-icons/Inquisitorial_Agents.png',
  'Kasrkin':                '/faction-icons/Kasrkin.png',
  'Mandrakes':              '/faction-icons/Mandrakes.png',
  'Murderwing':             '/faction-icons/Murderwing.png',
  'Nemesis Claw':           '/faction-icons/Nemesis_Claw.png',
  'Plague Marines':         '/faction-icons/Plague_Marines.png',
  'Ratlings':               '/faction-icons/Ratlings.png',
  'Raveners':               '/faction-icons/Raveners.png',
  'Sanctifiers':            '/faction-icons/Sanctifiers.png',
  'Scout Squad':            '/faction-icons/Scout_Squad.png',
  'Tempestus Aquilons':     '/faction-icons/Tempestus_Aquilons.png',
  'Vespid Stingwings':      '/faction-icons/Vespid_Stingwings.png',
  'Wolf Scouts':            '/faction-icons/Wolfe_Scouts.png',
  'Wrecka Krew':            '/faction-icons/Wrecka_Krew.png',
  'XV26 Stealth Battlesuits':'/faction-icons/XV26_Stealth_Battlesuits.png',
};

function nameToColour(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 25%, 20%)`;
}

function FactionThumb({ faction, size }) {
  const icon = FACTION_ICONS[faction.name];
  const initials = faction.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const bg = nameToColour(faction.name);
  const px = size === 'lg' ? 72 : 56;
  return (
    <div style={{ width: px, height: px, background: icon ? '#0d0c15' : `linear-gradient(135deg, ${bg}, #0d0c15)`, flexShrink: 0 }}
      className="flex items-center justify-center rounded-t overflow-hidden">
      {icon
        ? <img src={icon} alt={faction.name} style={{ width: px, height: px, objectFit: 'contain' }} draggable={false} />
        : <span className="font-black select-none text-[#ffffff20]" style={{ fontSize: size === 'lg' ? '1.5rem' : '1.1rem' }} aria-hidden="true">{initials}</span>
      }
    </div>
  );
}

// ── Square sortable card ──────────────────────────────────────────────────────
function SortableFactionCard({ faction, size = 'sm' }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(faction.id),
  });

  const px = size === 'lg' ? 72 : 56;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.2 : 1, width: px }}
      {...attributes}
      {...listeners}
      className="select-none cursor-grab active:cursor-grabbing flex flex-col rounded border border-[#2a2a3e] hover:border-[#D94819]/50 bg-[#0f0e17] overflow-hidden transition-colors"
    >
      <FactionThumb faction={faction} size={size} />
      <div className="px-1 py-1" style={{ width: px }}>
        <p className="text-[#ccc] leading-tight text-center"
          style={{ fontSize: 11, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {faction.name}
        </p>
      </div>
    </div>
  );
}

function FactionCardPreview({ faction }) {
  return (
    <div className="flex flex-col rounded border border-[#D94819] bg-[#0f0e17] overflow-hidden shadow-xl w-[72px]">
      <FactionThumb faction={faction} size="lg" />
      <div className="px-1 py-1">
        <p className="text-[#f0f0f0] leading-tight text-center"
          style={{ fontSize: 11, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {faction.name}
        </p>
      </div>
    </div>
  );
}

// ── Droppable zone ────────────────────────────────────────────────────────────
function DroppableZone({ id, children, className }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`${className} ${isOver ? 'bg-[#D94819]/20 ring-2 ring-inset ring-[#D94819]/60' : ''} transition-colors`}>
      {children}
    </div>
  );
}

// ── Tier row ──────────────────────────────────────────────────────────────────
function TierRow({ tier, factions }) {
  return (
    <div className="flex items-stretch border border-[#2a2a3e] rounded-lg overflow-hidden" style={{ minHeight: 76 }}>
      <div className="w-12 shrink-0 flex items-center justify-center font-black text-xl"
        style={{ background: tier.colour + '1a', color: tier.colour, borderRight: `2px solid ${tier.colour}33` }}
        aria-label={`Tier ${tier.label}`}>
        {tier.label}
      </div>
      <SortableContext items={factions.map(f => String(f.id))} strategy={rectSortingStrategy}>
        <DroppableZone id={tier.id} className="flex-1 flex flex-wrap gap-2 p-2 bg-[#0d0c15] overflow-x-auto" style={{ minHeight: 72 }}>
          {factions.map(f => <SortableFactionCard key={f.id} faction={f} size="sm" />)}
        </DroppableZone>
      </SortableContext>
    </div>
  );
}

// ── Pool ──────────────────────────────────────────────────────────────────────
function FactionPool({ factions }) {
  return (
    <div className="border border-[#2a2a3e] rounded-lg overflow-hidden">
      <div className="bg-[#0d0c15] px-3 py-2 border-b border-[#2a2a3e] flex items-center gap-2">
        <span className="text-[#7a7a8a] text-xs uppercase tracking-widest">Faction Pool</span>
        <span className="text-[#7a7a8a] text-xs">({factions.length})</span>
      </div>
      <SortableContext items={factions.map(f => String(f.id))} strategy={rectSortingStrategy}>
        <DroppableZone id="pool" className="flex flex-wrap gap-2 p-3 bg-[#0a0918] min-h-[80px]">
          {factions.map(f => <SortableFactionCard key={f.id} faction={f} size="lg" />)}
        </DroppableZone>
      </SortableContext>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const CONTAINER_KEYS = ['pool', 'S', 'A', 'B', 'C', 'D'];
const EMPTY_STATE = () => ({ pool: [], S: [], A: [], B: [], C: [], D: [] });


export default function TierMaker() {
  const [allFactions, setAllFactions] = useState([]);
  const [containers, _setContainers] = useState(EMPTY_STATE);
  const [activeId, setActiveId] = useState(null);
  const [groupFilter, setGroupFilter] = useState('all'); // 'all' | 'Classified'
  const tierRef = useRef(null);

  const containersRef = useRef(containers);
  function setContainers(updater) {
    _setContainers(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      containersRef.current = next;
      return next;
    });
  }

  useEffect(() => {
    axios.get(`${API}/api/factions`)
      .then(res => {
        setAllFactions(res.data);
        setContainers(c => ({ ...c, pool: res.data }));
      })
      .catch(() => {});
  }, []);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

  function findContainer(id) {
    for (const key of CONTAINER_KEYS) {
      if (containersRef.current[key].some(f => String(f.id) === id)) return key;
    }
    if (CONTAINER_KEYS.includes(id)) return id;
    return null;
  }

  // Cross-container: collide with zones only (ignore cards inside the target tier)
  // Within same tier: use closestCenter so cards can be reordered by position
  const collisionDetection = useCallback((args) => {
    const draggedId = String(args.active.id);
    const activeContainer = findContainer(draggedId);

    const zonesOnly = args.droppableContainers.filter(c =>
      CONTAINER_KEYS.includes(String(c.id))
    );
    const zoneHits = pointerWithin({ ...args, droppableContainers: zonesOnly });

    if (zoneHits.length > 0) {
      const targetZone = String(zoneHits[0].id);
      // Same zone — let closestCenter handle card-to-card reordering
      if (targetZone === activeContainer) return closestCenter(args);
      // Different zone — drop on the zone itself, ignore its cards
      return zoneHits;
    }

    return closestCenter(args);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleDragStart({ active }) { setActiveId(String(active.id)); }

  function handleDragEnd({ active, over }) {
    setActiveId(null);
    if (!over) return;
    const activeId = String(active.id);
    const overId   = String(over.id);
    const activeContainer = findContainer(activeId);
    const overContainer   = findContainer(overId);
    if (!activeContainer || !overContainer) return;

    if (activeContainer === overContainer) {
      const items    = containersRef.current[activeContainer];
      const oldIndex = items.findIndex(f => String(f.id) === activeId);
      const newIndex = items.findIndex(f => String(f.id) === overId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
      setContainers(prev => ({ ...prev, [activeContainer]: arrayMove(prev[activeContainer], oldIndex, newIndex) }));
    } else {
      setContainers(prev => {
        const faction = prev[activeContainer].find(f => String(f.id) === activeId);
        if (!faction) return prev;
        const srcItems  = prev[activeContainer].filter(f => String(f.id) !== activeId);
        const destItems = [...prev[overContainer]];
        const overItemIndex = destItems.findIndex(f => String(f.id) === overId);
        if (overItemIndex >= 0) destItems.splice(overItemIndex, 0, faction);
        else destItems.push(faction);
        return { ...prev, [activeContainer]: srcItems, [overContainer]: destItems };
      });
    }
  }

  // When filter switches to Classified, eject Declassified factions from tiers back to pool
  useEffect(() => {
    if (groupFilter === 'all') return;
    setContainers(prev => {
      const ejected = [];
      const newTiers = {};
      for (const key of CONTAINER_KEYS.filter(k => k !== 'pool')) {
        const kept = [];
        for (const f of prev[key]) {
          if (f.faction_group !== groupFilter) ejected.push(f);
          else kept.push(f);
        }
        newTiers[key] = kept;
      }
      if (!ejected.length) return prev;
      return { ...prev, ...newTiers, pool: [...prev.pool, ...ejected] };
    });
  }, [groupFilter]);

  function handleReset() {
    setContainers({ ...EMPTY_STATE(), pool: allFactions });
  }

  async function handleSaveJpg() {
    const el = tierRef.current;
    if (!el) return;

    // Clone off-screen at a fixed desktop width — live DOM is never touched
    const EXPORT_WIDTH = 860;
    const clone = el.cloneNode(true);
    clone.style.cssText = [
      'position:fixed',
      'top:-99999px',
      'left:-99999px',
      `width:${EXPORT_WIDTH}px`,
      'background:#0f0e17',
      'padding:8px',
      'box-sizing:border-box',
    ].join(';');
    document.body.appendChild(clone);

    try {
      // 1. Remove line-clamp from name labels
      clone.querySelectorAll('p').forEach(node => {
        if (node.style.overflow === 'hidden' || node.style.webkitLineClamp) {
          Object.assign(node.style, {
            display:         'block',
            webkitLineClamp: 'unset',
            webkitBoxOrient: 'unset',
            overflow:        'visible',
            whiteSpace:      'normal',
            width:           'auto',
          });
        }
      });

      // 2. Expand card wrappers (overflow-hidden class + fixed inline width)
      const cardWrappers = [];
      clone.querySelectorAll('.overflow-hidden').forEach(node => {
        const w = node.style.width;
        if (w === '56px' || w === '72px') {
          cardWrappers.push(node);
          node.style.overflow = 'visible';
          node.style.width    = 'auto';
        }
      });

      // 3. Expand text container divs (fixed width, no height)
      clone.querySelectorAll('div[style]').forEach(node => {
        const w = node.style.width;
        if ((w === '56px' || w === '72px') && !node.style.height) {
          node.style.width = 'auto';
        }
      });

      // 4. Reflow, then lock all cards to the widest one
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      if (cardWrappers.length > 0) {
        const maxW = Math.max(...cardWrappers.map(n => n.offsetWidth));
        cardWrappers.forEach(n => { n.style.width = `${maxW}px`; });
      }

      // Watermark
      const wm = document.createElement('div');
      wm.textContent = 'ktvault.gg';
      wm.style.cssText = 'font-size:11px;color:#888;background:#0d0c15;padding:8px;text-align:center;';
      clone.appendChild(wm);

      const canvas = await html2canvas(clone, { backgroundColor: '#0f0e17', scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.download = 'my-kt-tierlist.jpg';
      link.href = canvas.toDataURL('image/jpeg', 0.92);
      link.click();
    } finally {
      document.body.removeChild(clone);
    }
  }

  const activeFaction = activeId ? allFactions.find(f => String(f.id) === activeId) : null;

  // Pool only shows factions matching the current filter
  const visiblePool = groupFilter === 'all'
    ? containers.pool
    : containers.pool.filter(f => f.faction_group === groupFilter);

  return (
    <div id="main-content" className="flex flex-col h-[calc(100vh-52px)] overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-[#f0f0f0] font-bold text-base tracking-wide mr-3">Kill Team Tier List</h1>
            <div role="group" aria-label="Filter by faction group" className="flex gap-2 flex-wrap">
              {['all', 'Classified'].map(opt => (
                <button
                  key={opt}
                  onClick={() => setGroupFilter(opt)}
                  aria-pressed={groupFilter === opt}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors
                    ${groupFilter === opt
                      ? 'border-[#D94819] text-[#D94819] bg-[#D94819]/10'
                      : 'border-[#2a2a3e] text-[#8a8a9a] hover:text-[#e0e0f0]'}`}
                >
                  {opt === 'all' ? 'All' : 'Classified'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleReset}
              aria-label="Reset tier list"
              className="text-xs px-3 py-1.5 rounded border border-[#2a2a3e] text-[#8a8a9a] hover:text-[#e0e0f0] hover:border-[#8a8a9a] transition-colors">
              Reset
            </button>
            <button onClick={handleSaveJpg}
              aria-label="Save tier list as JPG"
              className="text-xs px-3 py-1.5 rounded border border-[#D94819]/50 text-[#D94819] hover:bg-[#D94819]/10 hover:brightness-110 transition-colors">
              Save as JPG
            </button>
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={collisionDetection}
          onDragStart={handleDragStart} onDragEnd={handleDragEnd}>

          <div ref={tierRef} className="space-y-1.5 bg-[#0f0e17] rounded-lg p-2 min-w-0">
            {TIERS.map(tier => (
              <TierRow key={tier.id} tier={tier} factions={containers[tier.id]} />
            ))}
          </div>

          <div className="mt-4">
            <FactionPool factions={visiblePool} />
          </div>

          <DragOverlay dropAnimation={null}>
            {activeFaction ? <FactionCardPreview faction={activeFaction} /> : null}
          </DragOverlay>
        </DndContext>

      </div>
    </div>
  );
}
