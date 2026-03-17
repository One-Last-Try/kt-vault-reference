import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Vespid Stingwings'").get()?.id;
if (!FACTION_ID) { console.error('Vespid Stingwings faction not found'); process.exit(1); }

// Clear existing Vespid Stingwings data
db.prepare('DELETE FROM team_rules WHERE faction_id = ?').run(FACTION_ID);
db.prepare('DELETE FROM datacards WHERE faction_id = ?').run(FACTION_ID);

const insRule = db.prepare('INSERT INTO team_rules (faction_id, type, subtype, name, cost, description) VALUES (?, ?, ?, ?, ?, ?)');
const insCard = db.prepare('INSERT INTO datacards (faction_id, operative_name, role, stats_json, weapons_json, abilities_json, keywords) VALUES (?, ?, ?, ?, ?, ?, ?)');

function rule(type, subtype, name, cost, description) {
  insRule.run(FACTION_ID, type, subtype, name, cost, description.trim());
}
function card(name, role, stats, weapons, abilities, keywords) {
  insCard.run(FACTION_ID, name, role, JSON.stringify(stats), JSON.stringify(weapons), JSON.stringify(abilities), keywords);
}

// ── FACTION RULES ────────────────────────────────────────────────────────────

rule('faction_rules', null, 'ARCHETYPE', 0,
  'Archetypes: RECON, SEEK-DESTROY');

rule('faction_rules', null, 'OPERATIVES', 0,
  `1 VESPID STINGWING STRAIN LEADER operative
1 VESPID STINGWING OVERSIGHT DRONE operative
9 VESPID STINGWING operatives selected from the following list:
• LONGSTING
• SHADESTRAIN
• SKYBLAST
• SWARMGUARD
• WARRIOR

Other than WARRIOR operatives, your kill team can only include each operative above once.`);

rule('faction_rules', null, 'NEUTRON CHARGE', 0,
  'Neutron weapons are any weapons that have the word "neutron" in their name, e.g. neutron blaster, neutron grenade launcher, etc. Whenever a friendly VESPID STINGWING operative moves or uses FLY, its neutron weapons have the Piercing 1 weapon rule until the end of the turning point.');

rule('faction_rules', null, 'COMMUNION', 0,
  `Communion points are used to maintain the tactical focus of friendly VESPID STINGWING operatives. In the Ready step of each Strategy phase, you gain D3 Communion points, plus 1 if a friendly OVERSIGHT DRONE operative is in the killzone. Communion points are used as follows (OVERSIGHT DRONE operatives are unaffected by the following):

1. Whenever a friendly VESPID STINGWING operative is performing the Shoot action, it can only target the closest enemy operative within 8" of it (excluding enemy operatives within control range of other friendly VESPID STINGWING operatives) unless you spend 1 of your Communion points. For weapons with the Blast and Torrent weapon rules, only the first target must be selected in this way.
2. Whenever a friendly VESPID STINGWING operative performs the Charge action, it must finish the action within control range of the closest enemy operative it can unless you spend 1 of your Communion points.
3. Whenever you would perform the Pick Up Marker or a mission action (excluding Operate Hatch) with a friendly VESPID STINGWING operative, you must also spend 1 of your Communion points to do so.
4. Whenever a friendly VESPID STINGWING operative is shooting, you can spend 1 (and only 1) of your Communion points to re-roll one attack dice.`);

rule('faction_rules', null, 'FLY', 0,
  `Whenever a friendly VESPID STINGWING operative performs an action in which it moves, it can FLY. If it does, don\'t move it. Instead, remove it from the killzone and set it back up wholly within a distance equal to its Move stat (or 3" if it was a Dash) of its original location, measuring the horizontal distance only. Note that it gains no additional distance when performing the Charge action.

It must be set up in a location it can be placed, and unless it\'s the Charge action, it cannot be set up within control range of an enemy operative. In a killzone that uses the close quarters rules (e.g. Killzone: Gallowdark), you cannot measure the distance over or through wall terrain, and that operative cannot be set up on the other side of an access point (in other words, it cannot FLY through an open hatchway).`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'AERIAL AGILITY', 1,
  'Whenever an operative is shooting a friendly VESPIDS STINGWING operative while counteracting, or during an activation in which that shooting operative moved or was set up, roll one D6 whenever a normal success would inflict damage. On a 5+, ignore that inflicted damage. A maximum of one attack dice can be ignored per shooting sequence.');

rule('ploy', 'Strategy', 'AIRBORNE PREDATORS', 1,
  'Whenever a friendly VESPIDS STINGWING operative moves or uses FLY during its activation, its weapons have the Balanced weapon rule until the end of that activation.');

rule('ploy', 'Strategy', 'OCELLI', 1,
  'Use this firefight ploy when a friendly VESPID STINGWING operative performs the Shoot action during an activation in which it has used FLY. Until the end of that action, it gains all benefits from the first and second main features of Vantage terrain. When determining the height difference between operatives for Vantage terrain rules, treat that friendly operative as being 3" higher than it currently is (but not when determining the distance for Communion).');

rule('ploy', 'Strategy', 'STING', 1,
  'Improve the Hit stat of friendly VESPIDS STINGWING operatives\' claws by 1, and those weapons have the Lethal 5+ and Shock weapon rules.');

rule('ploy', 'Firefight', 'HARDENED EXOSKELETON', 1,
  'Whenever a friendly VESPIDS STINGWING operative (excluding OVERSIGHT DRONE) is fighting or retaliating, Normal Dmg of 4 or more inflicts 1 less damage on it.');

rule('ploy', 'Firefight', 'NEUTRON OVERLOAD', 1,
  'Use this firefight ploy when you resolve a critical success for a friendly VESPID STINGWING operative that is shooting with a neutron weapon during an activation in which it has moved or used FLY. If the target is within 4" of it, inflict D3 additional damage.');

rule('ploy', 'Firefight', 'VICIOUS VENOM', 1,
  'Use this firefight ploy when a friendly VESPID STINGWING operative (excluding OVERSIGHT DRONE) is fighting and strikes with a critical success. Inflict D3 additional damage.');

rule('ploy', 'Firefight', 'DARTING FLIGHT', 1,
  'Use this firefight ploy when a friendly VESPID STINGWING operative performs the Reposition action. Until the end of that action, it can move an additional D3", or be set up an additional D3" away if it uses FLY. In either case, it cannot perform Fight or Shoot actions for the rest of the turning point.');

// ── TACOPS ───────────────────────────────────────────────────────────────────

rule('tac_op', 'RECON', 'FLANK', 0,
  `Archetype: RECON

REVEAL: As a STRATEGIC GAMBIT.

ADDITIONAL RULES: Divide the killzone into two flanks (left and right) by drawing an imaginary line that's just like the centreline, except it runs from the centre of each player's killzone edge. An operative contests a flank while both wholly within it and wholly within their opponent's territory. Friendly operatives control a flank if the total APL stat of those contesting it is greater than that of enemy operatives.

VICTORY POINTS: After you reveal this op, at the end of each turning point after the first, for each flank friendly operatives control, you score 1VP. In the fourth turning point, if friendly operatives also controlled that flank at the end of the third turning point (excluding the first), you score 2VP instead. You cannot score more than 2VP from this op per turning point.`);

rule('tac_op', 'RECON', 'RETRIEVAL', 0,
  `Archetype: RECON

REVEAL: The first time you score VP from this op.

MISSION ACTION – RETRIEVE (1 APL): If the active operative controls an objective marker that hasn't been searched by friendly operatives, that operative is now carrying one of your Retrieval mission markers and that objective marker has been searched by friendly operatives. Friendly operatives can perform the Pick Up Marker action on your Retrieval mission markers.

An operative cannot perform this action during the first turning point, or while within control range of an enemy operative, or if it's already carrying a marker.

VICTORY POINTS: The first time each objective marker is searched by friendly operatives, you score 1VP. At the end of the battle, for each of your Retrieval mission markers friendly operatives are carrying, you score 1VP.`);

rule('tac_op', 'RECON', 'SCOUT ENEMY MOVEMENT', 0,
  `Archetype: RECON

REVEAL: The first time a friendly operative performs the Scout action.

MISSION ACTION – SCOUT (1 APL): Select one ready enemy operative visible to and more than 6" from the active operative. That enemy operative is now monitored until the Ready step of the next Strategy phase.

An operative cannot perform this action while it has an Engage order, during the first turning point, or while within control range of an enemy operative.

VICTORY POINTS: At the end of each turning point after the first, for each monitored enemy operative that's visible to friendly operatives, you score 1VP. Note that it doesn't have to be a friendly operative that performed the Scout action. You cannot score more than 2VP from this op per turning point.`);

rule('tac_op', 'SEEK-DESTROY', 'SWEEP & CLEAR', 0,
  `Archetype: SEEK-DESTROY

REVEAL: The first time an enemy operative is incapacitated while contesting an objective marker, or the first time a friendly operative performs the Clear action (whichever comes first).

ADDITIONAL RULES: When an enemy operative that contests an objective marker is incapacitated, that objective marker gains one of your Swept tokens (if it doesn't already have one) until the Ready step of the next Strategy phase.

MISSION ACTION – CLEAR (1 APL): An objective marker the active operative controls is cleared for the turning point. An operative cannot perform this action during the first turning point, or while within control range of an enemy operative.

VICTORY POINTS: At the end of each turning point after the first, if friendly operatives control any objective markers that have one of your Swept tokens, you score 1VP. If this is true and any of those objective markers are also cleared, you score 2VP instead. You cannot score more than 2VP from this op per turning point.`);

rule('tac_op', 'SEEK-DESTROY', 'DOMINATE', 0,
  `Archetype: SEEK-DESTROY

REVEAL: The first time an enemy operative is incapacitated by a friendly operative.

ADDITIONAL RULES: Each time a friendly operative incapacitates an enemy operative, that friendly operative gains one of your Dominate tokens.

VICTORY POINTS: At the end of the third and fourth turning point, you can remove Dominate tokens from friendly operatives that aren't incapacitated. For each you remove, you score 1VP. You cannot score more than 3VP from this op per turning point.`);

rule('tac_op', 'SEEK-DESTROY', 'ROUT', 0,
  `Archetype: SEEK-DESTROY

REVEAL: The first time you score VP from this op.

VICTORY POINTS: Whenever a friendly operative incapacitates an enemy operative, if that friendly operative is within 6" of your opponent's drop zone, you score 1VP; if this is true and that enemy operative had a Wounds stat of 12 or more, you score 2VP instead. You cannot score more than 2VP from this op per turning point.`);

// ── EQUIPMENT ────────────────────────────────────────────────────────────────

rule('equipment', null, 'NEUROSTIMULANT', 0,
  'In the Ready step of each Strategy phase, when determining how many Communion points to gain, you can roll two D3 and select one D3 to use.');

rule('equipment', null, 'ACCELERANT STIMULANT', 0,
  'Whenever a friendly VESPIS STINGWING operative (excluding OVERSIGHT DRONE) performs the Charge or Dash action, it can move an additional 1". If it uses FLY for this action, you can set it back up 1" further away.');

rule('equipment', null, 'CONVERGENCE STIMULANT', 0,
  'Once per turning point, a friendly VESPIS STINGWING operative can perform the Pick Up Marker or a mission action without you spending a Communion point.');

rule('equipment', null, 'AGGRESSION STIMULANT', 0,
  'Whenever a friendly VESPIS STINGWING operative (excluding OVERSIGHT DRONE) is fighting, its melee weapons have the Ceaseless weapon rule.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('VESPID STRAIN LEADER', 'Leader',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '10' },
  [
    { name: 'Neutron Blaster', atk: '4', hit: '3+', dmg: '3/3', wr: 'Devastating 2' },
    { name: 'Claws',           atk: '3', hit: '4+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Communion Helm', description: 'Once during each of this operative\'s activations, you can spend 1 Communion point for free.' },
    { name: 'Commune', description: 'When selecting your operatives for the battle, also select one VESPID STINGWING strategy ploy. Whenever this operative is in the killzone and not within control Range of an enemy operative, that ploy costs you 0CP.' },
  ],
  'VESPID STINGWING, T\'AU EMPIRE, STRAIN, LEADER'
);

card('OVERSIGHT DRONE', 'Companion',
  { APL: '2', MOVE: '8"', SAVE: '2+', WOUNDS: '5' },
  [
    { name: 'Ram', atk: '3', hit: '5+', dmg: '1/2', wr: '–' },
  ],
  [
    { name: 'Evasive Drone', description: 'This operative cannot perform any actions other than Aerial Guidance, Charge, Dash, Fall Back, Fight, and Reposition. Whenever determining control of objective markers, treat this operative\'s APL stat as 1 lower. Whenever determining what\'s visible to this operative, the round disc at the top of the miniature is its head. Whenever this operative has a Conceal order and is in cover, it cannot be selected as a valid target, taking precedence over all other rules (e.g., Seek, Vantage terrain) except within 2". Whenever an operative is shooting this operative, ignore the Piercing weapon rule.' },
    { name: 'AERIAL GUIDANCE (1AP)', description: 'SUPPORT: Until the start of this operative\'s next activation, whenever another friendly VESPID STINGWING operative within 6" of this operative is shooting an enemy operative visible to this operative, that friendly operative\'s ranged weapons have the Saturate and Lethal 5+ weapon rules. This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'VESPID STINGWING, T\'AU EMPIRE, OVERSIGHT, DRONE'
);

card('VESPID LONGSTING', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '9' },
  [
    { name: 'Neutron Rail Rifle – Aimed',    atk: '4', hit: '3+', dmg: '4/4', wr: 'Devastating 2, Neutron Fragment*, Lethal 5+, Heavy (Dash only)' },
    { name: 'Neutron Rail Rifle – Standard', atk: '4', hit: '4+', dmg: '4/4', wr: 'Devastating 2, Neutron Fragment*' },
    { name: 'Claws',                         atk: '3', hit: '4+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Neutron Fragment*', description: 'If the target isn\'t incapacitated but you resolve any attack dice, the target gains one of your Neutron Fragment tokens. Whenever an operative that has one of your Neutron Fragment tokens is activated, inflict D3 damage on it for each Neutron Fragment token it has (roll separately for each).' },
  ],
  'VESPID STINGWING, T\'AU EMPIRE, LONGSTING'
);

card('VESPID SHADESTRAIN', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '3+', WOUNDS: '9' },
  [
    { name: 'Neutron Sting',    atk: '4', hit: '4+', dmg: '3/3', wr: 'Range 8", Devastating 2' },
    { name: 'Neutron Grenade',  atk: '4', hit: '4+', dmg: '3/3', wr: 'Range 6", Blast 2, Devastating 2, Limited 1, Saturate' },
    { name: 'Claws',            atk: '3', hit: '4+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Ghost Rig', description: 'While this operative has a Conceal order, your opponent cannot select it as a valid target unless it\'s within 6" of the operative trying to target it. Note that this rule has no effect if this operative is not selected as the valid target, e.g. if it\'s a secondary target from the Blast weapon rule.' },
    { name: 'Camouflaged', description: 'Whenever an operative is shooting this operative, ignore the Piercing weapon rule and all cover saves are retained as critical successes. This rule has no effect if this operative is not selected as the valid target, e.g. if it\'s a secondary target from the Blast weapon rule.' },
  ],
  'VESPID STINGWING, T\'AU EMPIRE, SHADESTRAIN'
);

card('VESPID SKYBLAST', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '9' },
  [
    { name: 'Neutron Grenade Launcher', atk: '4', hit: '4+', dmg: '3/3', wr: 'Blast 2, Neutron Bombardment*, Devastating 2' },
    { name: 'Claws',                    atk: '3', hit: '4+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Neutron Bombardment*', description: 'Place one of your Neutron Fallout markers within the primary target\'s control Range.' },
    { name: 'Neutron Fallout', description: 'Once during each enemy operative\'s activation, as soon as it\'s within 2" of one of your Neutron Fallout markers, inflict D3 damage on it (multiple markers are not cumulative).' },
  ],
  'VESPID STINGWING, T\'AU EMPIRE, SKYBLAST'
);

card('VESPID SWARMGUARD', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '9' },
  [
    { name: 'Flamer – Skytorch', atk: '4', hit: '2+', dmg: '3/3', wr: 'Saturate, Torrent 0", Skytorch*' },
    { name: 'Flamer – Standard', atk: '4', hit: '2+', dmg: '3/3', wr: 'Range 8", Saturate, Torrent 2' },
    { name: 'Claws',             atk: '3', hit: '4+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Skytorch*', description: 'An operative can only use this weapon during an activation in which it performed the Reposition action with FLY. If it does, do not select a valid target. Instead, shoot against each operative within its torch zone (excluding operatives wholly underneath Vantage terrain); they are not in cover or obscured. Roll each sequence separately in order of furthest operative to closest. The torch zone is the area between the operative\'s current and previous location. A 28mm round Skytorch marker can be temporarily placed underneath this operative before it moves to help determine this. Note that Torrent 0" means you cannot select secondary targets outside of its torch zone, but this weapon still has the Torrent weapon rule for all other rules purposes, e.g. the Condensed Stronghold rule (see Killzone: Volkus, Kill Team Core Book).' },
    { name: 'SKYTORCH ASSAULT (2AP)', description: 'Perform a free Reposition action with this operative. During that action, it must FLY and can move an additional 2". Then perform a free Shoot action. You can only select a flamer (skytorch) for that Shoot action. This operative cannot perform this action while it has a Conceal order, or while within control Range of an enemy operative.' },
  ],
  'VESPID STINGWING, T\'AU EMPIRE, SWARMGUARD'
);

card('VESPID WARRIOR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '9' },
  [
    { name: 'Neutron Blaster', atk: '4', hit: '4+', dmg: '3/3', wr: 'Devastating 2' },
    { name: 'Claws',           atk: '3', hit: '4+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Warrior Instincts', description: 'Whenever this operative is shooting, if you don\'t spend Communion points during that sequence, its neutron blaster has the Accurate 1 weapon rule until the end of that sequence.' },
  ],
  'VESPID STINGWING, T\'AU EMPIRE, WARRIOR'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Vespid Stingwings populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
