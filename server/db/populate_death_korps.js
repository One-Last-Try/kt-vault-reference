import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Death Korps'").get()?.id;
if (!FACTION_ID) { console.error('Death Korps faction not found'); process.exit(1); }

// Clear existing Death Korps data
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
  'Archetypes: SECURITY, SEEK-DESTROY');

rule('faction_rules', null, 'OPERATIVES', 0,
  `1 DEATH KORPS WATCHMASTER operative equipped with one of the following options:
• Boltgun; Bayonet.
• Bolt pistol, Relic Laspistol or Plasma pistol; Chainsword or Power weapon.

4 operatives TROOPER*

9 DEATH KORPS operatives selected from the following list:
• BRUISER
• CONFIDANT equipped with one of the following options:
  - Boltgun or Lasgun; Bayonet.
  - Bolt pistol or Laspistol; Chainsword.
• GUNNER equipped with a Bayonet and Flamer
• GUNNER equipped with a Bayonet and Grenade launcher
• GUNNER equipped with a Bayonet and Meltagun
• GUNNER equipped with a Bayonet and Plasma gun
• MEDIC
• SAPPER
• SNIPER
• SPOTTER
• TROOPER
• VETERAN
• VOX-OPERATOR
• ZEALOT

Other than TROOPER operatives, your Kill team can only include each operative on this list once.

*Up to four times, instead of taking one of these TROOPER operatives, you can select one DEATH KORPS ploy to cost you 0CP for the battle.`);

rule('faction_rules', null, 'GUARDSMEN ORDERS', 0,
  `STRATEGIC GAMBIT and SUPPORT. A friendly WATCHMASTER DEATH KORPS operative can issue a GUARDSMAN ORDER. Whenever it does so, select one GUARDSMAN ORDER for all friendly DEATH KORPS operatives within 6" of it to receive.

Whenever a friendly operative receives a GUARDSMAN ORDER, apply its rules until the end of the turning point. Operatives cannot benefit from more than one GUARDSMAN ORDER at a time; they only benefit from the most recent order they received during the turning point.

MOVE! MOVE! MOVE!
Whenever an operative that has received this order performs a Reposition action, add 1" to its Movement stat.

TAKE AIM!
The ranged weapons of operatives that have received this order (excluding mortar barrage and remote detonator) have the Ceaseless weapon rule.

DIG IN!
Whenever an enemy operative is shooting a friendly operative that has received this order, if you retain any cover saves, you can re-roll any of your defence dice results of one result (e.g. results of 2).

FIX BAYONETS!
Melee weapons of operatives that have received this order have the Ceaseless weapon rule.`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'SIEGE WARFARE', 1,
  'The ranged weapons of friendly DEATH KORPS operatives gain the Saturate and Accurate 1 weapon rules.');

rule('ploy', 'Strategy', 'TAKE COVER', 1,
  'Whenever an enemy operative shoots a friendly DEATH KORPS operative, if you can retain any cover saves, improve that friendly operative\'s Save stat by 1 for that shot.');

rule('ploy', 'Strategy', 'CLEAR THE LINE', 1,
  'Friendly DEATH KORPS operatives\' melee weapons have the Accurate 1 weapon rule. Whenever a friendly DEATH KORPS operative is fighting wholly within your territory, or whenever it\'s retaliating, its melee weapons also have the Severe weapon rule.');

rule('ploy', 'Strategy', 'REGROUP', 1,
  `SUPPORT. Select one friendly DEATH KORPS operative that's more than 3" from enemy operatives. Each other friendly DEATH KORPS operative within 5" of that operative and not within control range of enemy operatives can immediately perform a free Dash action in an order of your choice, but each that does so must end that move closer to that operative. Note that a Comms Device from universal equipment only affects the second distance of this rule.

You cannot use this ploy and the Chronometer faction equipment STRATEGIC GAMBIT during the same turning point.`);

rule('ploy', 'Firefight', 'INSPIRATIONAL LEADERSHIP', 1,
  'SUPPORT. Use this firefight ploy during a friendly DEATH KORPS WATCHMASTER or CONFIDANT operative\'s activation, before or after it performs an action. It issues a GUARDSMAN ORDER.');

rule('ploy', 'Firefight', 'COMBINED ARMS', 1,
  'Use this firefight ploy after rolling your attack dice for a friendly DEATH KORPS operative. If it\'s shooting an enemy operative that\'s been shot by another friendly DEATH KORPS operative during this Turning Point, you can re-roll any of your attack dice.');

rule('ploy', 'Firefight', 'IN LIFE, SHAME', 1,
  'Use this firefight ploy when a friendly DEATH KORPS operative is activated and given an Engage order. It receives every GUARDSMAN ORDER. This takes precedence over the normal rule that operatives cannot benefit from more than one GUARDSMAN ORDER at once.');

rule('ploy', 'Firefight', 'IN DEATH, ATONEMENT', 1,
  'Use this firefight ploy when a ready friendly DEATH KORPS operative is incapacitated. If it isn\'t within control range of enemy operatives. Before it\'s removed from the killzone, it can immediately perform one free action and you can change its order to do so. Note that that friendly operative is injured for the duration of that action.');

// ── TACOPS ───────────────────────────────────────────────────────────────────

rule('tac_op', 'SECURITY', 'PLANT BANNER', 0,
  `Archetype: SECURITY

REVEAL: When you perform the Plant Banner action.

MISSION ACTION – PLANT BANNER (1 APL): Place your Banner mission marker within the active operative's control range, wholly within your opponent's territory and more than 5" from a neutral killzone edge. Operatives can perform the Pick Up Marker action on your Banner mission marker. An operative cannot perform this action during the first turning point, while within control range of an enemy operative, or if a friendly operative has already performed this action during the battle.

VICTORY POINTS: At the end of each turning point after the first, if your Banner mission marker is wholly within your opponent's territory and friendly operatives control it, you score 1VP; if that's true and no enemy operatives contest it, you score 2VP instead. Note your Banner mission marker must be in the killzone (not being carried) to score.`);

rule('tac_op', 'SECURITY', 'MARTYRS', 0,
  `Archetype: SECURITY

REVEAL: The first time a friendly operative is incapacitated while contesting an objective marker.

ADDITIONAL RULES: Whenever a friendly operative is incapacitated while contesting an objective marker, that marker gains one of your Martyr tokens. Note that this is only the first time each operative is incapacitated, so if an operative is incapacitated, set back up (e.g. HIEROTEK CIRCLE Reanimation Protocols) and then subsequently incapacitated again, a second Martyr token cannot be gained as a result.

VICTORY POINTS: At the end of each turning point after the first, if friendly operatives contest an objective marker that has one or more of your Martyr tokens, you can remove any of those tokens. For each token you remove, you score 1VP; if friendly operatives also control that marker, you score 2VP instead. You cannot score more than 2VP from this op per turning point.`);

rule('tac_op', 'SECURITY', 'ENVOY', 0,
  `Archetype: SECURITY

REVEAL: The first time you select an envoy.

ADDITIONAL RULES: As a STRATEGIC GAMBIT in each turning point after the first, select one friendly operative to be your envoy until the Ready step of the next Strategy phase. You cannot select an operative you selected during a previous turning point or an operative that's ignored for the kill op.

VICTORY POINTS: At the end of each turning point after the first, if your envoy is wholly within enemy territory and not within control range of enemy operatives, you score 1VP; if this is true and your envoy has not lost any wounds during that turning point, you score 2VP instead.`);

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

rule('equipment', null, 'HAND AXE', 0,
  `Friendly DEATH KORPS operatives have the following melee weapon:

NAME: Hand Axe | ATK: 3 | HIT: 4+ | DMG: 3/4`);

rule('equipment', null, 'CHRONOMETER', 0,
  'STRATEGIC GAMBIT once per battle, in the first or second turning point. Each friendly DEATH KORPS operative wholly within your territory can immediately perform a free Dash action in an order of your choice but must end that move closer to an opponent\'s drop zone or killzone edge.\n\nYou cannot use this STRATEGIC GAMBIT and the Regroup strategy ploy during the same turning point.');

rule('equipment', null, 'COMM BEADS', 0,
  'Whenever a friendly DEATH KORPS WATCHMASTER or CONFIDANT operative issues a GUARDSMAN ORDER, you can use this rule. If you do, instead of each friendly DEATH KORPS operative within 6" receiving the order, you can select one friendly DEATH KORPS operative to receive that order.');

rule('equipment', null, 'GAS BOMBARDMENT', 0,
  'STRATEGIC GAMBIT once per battle. Place your Gas marker in the killzone; it cannot be placed underneath Vantage terrain. Whenever an operative is within 3" of that marker, subtract 1 from its APL stat. In the Ready step of the next Strategy phase, remove that marker. Note that an operative\'s APL stat is only changed while it\'s within 3" of that marker. If it moves more than 3" from that marker, its APL stat is no longer changed by this rule.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('DEATH KORPS WATCHMASTER', 'Leader',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '8' },
  [
    { name: 'Bolt pistol',               atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Boltgun',                   atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Las pistol',                atk: '4', hit: '3+', dmg: '2/4', wr: 'Range 8", Lethal 5+' },
    { name: 'Plasma pistol – Standard',  atk: '4', hit: '4+', dmg: '3/5', wr: 'Range 8", Piercing 1' },
    { name: 'Plasma pistol – Supercharge', atk: '4', hit: '4+', dmg: '4/5', wr: 'Range 8", Hot, Lethal 5+, Piercing 1' },
    { name: 'Bayonet',                   atk: '4', hit: '3+', dmg: '2/3', wr: '–' },
    { name: 'Chainsword',                atk: '4', hit: '3+', dmg: '4/5', wr: '–' },
    { name: 'Power weapon',              atk: '4', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Adaptive Orders', description: 'If this operative doesn\'t issue a GUARDSMAN ORDER as a STRATEGIC GAMBIT, you can use the Inspirational Leadership firefight ploy for 0CP during this operative\'s activation.' },
    { name: 'Bring it Down!', description: 'STRATEGIC GAMBIT if this operative is in the killzone. Select one enemy operative. Whenever a friendly DEATH KORPS operative is shooting against, fighting against or retaliating against that enemy operative, that friendly operative\'s weapons have the Punishing weapon rule.' },
  ],
  'DEATH KORPS, IMPERIUM, ASTRA MILITARUM, LEADER, WATCHMASTER'
);

card('DEATH KORPS SNIPER', 'Specialist',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Long-las – Concealed',   atk: '4', hit: '2+', dmg: '3/3', wr: 'Devastating 3, Heavy, Silent, Concealed Position*' },
    { name: 'Long-las – Mobile',      atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Long-las – Stationary',  atk: '4', hit: '2+', dmg: '3/3', wr: 'Devastating 3, Heavy' },
    { name: 'Bayonet',                atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Concealed Position', description: '*This operative can only use this weapon the first time it\'s performing the Shoot action during the battle.' },
  ],
  'DEATH KORPS, IMPERIUM, ASTRA MILITARUM, SNIPER'
);

card('DEATH KORPS GUNNER (Flamer)', 'Specialist',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Flamer',  atk: '4', hit: '2+', dmg: '3/3', wr: 'Range 8", Saturate, Torrent 2' },
    { name: 'Bayonet', atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [],
  'DEATH KORPS, IMPERIUM, ASTRA MILITARUM, GUNNER'
);

card('DEATH KORPS GUNNER (Grenade launcher)', 'Specialist',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Grenade launcher – Frag', atk: '4', hit: '4+', dmg: '2/4', wr: 'Blast 2' },
    { name: 'Grenade launcher – Krak', atk: '4', hit: '4+', dmg: '4/5', wr: 'Piercing 1' },
    { name: 'Bayonet',                 atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [],
  'DEATH KORPS, IMPERIUM, ASTRA MILITARUM, GUNNER'
);

card('DEATH KORPS GUNNER (Meltagun)', 'Specialist',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Meltagun', atk: '4', hit: '4+', dmg: '6/3', wr: 'Range 6", Devastating 4, Piercing 2' },
    { name: 'Bayonet',  atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [],
  'DEATH KORPS, IMPERIUM, ASTRA MILITARUM, GUNNER'
);

card('DEATH KORPS GUNNER (Plasma gun)', 'Specialist',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Plasma gun – Standard',    atk: '4', hit: '4+', dmg: '4/6', wr: 'Piercing 1' },
    { name: 'Plasma gun – Supercharge', atk: '4', hit: '4+', dmg: '5/6', wr: 'Hot, Lethal 5+, Piercing 1' },
    { name: 'Bayonet',                  atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [],
  'DEATH KORPS, IMPERIUM, ASTRA MILITARUM, GUNNER'
);

card('DEATH KORPS CONFIDANT', 'Specialist',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Bolt pistol',      atk: '4', hit: '4+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Boltgun',          atk: '4', hit: '4+', dmg: '3/4', wr: '–' },
    { name: 'Relic Laspistol',  atk: '4', hit: '4+', dmg: '2/4', wr: 'Range 8", Lethal 5+' },
    { name: 'Lasgun',           atk: '4', hit: '4+', dmg: '2/3', wr: '–' },
    { name: 'Bayonet',          atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
    { name: 'Chainsword',       atk: '4', hit: '4+', dmg: '4/5', wr: '–' },
  ],
  [
    { name: 'Second in Command', description: 'If a friendly WATCHMASTER operative is incapacitated and removed from the killzone, you can use this rule. If you do, until the end of the battle, this operative can issue a GUARDSMAN ORDER as a STRATEGIC GAMBIT (even though it\'s not a WATCHMASTER operative).' },
    { name: 'Directive', description: 'Whenever this operative is activated, if you haven\'t used the Second in Command rule during the battle, you can select one other ready friendly DEATH KORPS operative visible to and within 6" of it. When this operative is expended, activate that other friendly operative before your opponent activates (if that operative is a TROOPER, ignore its Group Activation rule).' },
  ],
  'DEATH KORPS, IMPERIUM, ASTRA MILITARUM, CONFIDANT'
);

card('DEATH KORPS SAPPER', 'Specialist',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Lasgun',      atk: '4', hit: '4+', dmg: '2/3', wr: '–' },
    { name: 'Remote mine', atk: '4', hit: '2+', dmg: '5/6', wr: 'Heavy (Dash only), Limited 1, Piercing 1, Silent, Detonate*' },
    { name: 'Bayonet',     atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Mine Layer', description: 'This operative is carrying your Mine marker. It can perform the Pick Up Marker action on that marker, and whenever it performs the Place Marker action on that marker, it can immediately perform a free Dash action.' },
    { name: 'Detonate*', description: 'Don\'t select a valid target. Instead, shoot against each operative within 2" of your Mine marker, unless Heavy terrain is wholly intervening between that operative and that marker. Each of those operatives cannot be in cover or obscured. Roll each sequence separately in an order of your choice. This weapon cannot be selected if your Mine marker isn\'t in the killzone. At the end of the action, remove your Mine marker from the killzone. In a killzone that uses the close quarters rules (e.g. Killzone: Tomb World), this weapon has the Lethal 5+ weapon rule.' },
  ],
  'DEATH KORPS, IMPERIUM, ASTRA MILITARUM, SAPPER'
);

card('DEATH KORPS ZEALOT', 'Specialist',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Lasgun',  atk: '4', hit: '4+', dmg: '2/3', wr: '–' },
    { name: 'Bayonet', atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'The Emperor Protects', description: 'Whenever an operative is shooting this operative, you can re-roll any of your defence dice.' },
    { name: 'Uplifting Primer', description: 'SUPPORT. Whenever a friendly DEATH KORPS operative is within 3" of this operative, that friendly operative\'s weapons have the Severe weapon rule.' },
  ],
  'DEATH KORPS, IMPERIUM, ASTRA MILITARUM, ZEALOT'
);

card('DEATH KORPS MEDIC', 'Specialist',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Lasgun',  atk: '4', hit: '4+', dmg: '2/3', wr: '–' },
    { name: 'Bayonet', atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Medic', description: 'The first time during each turning point that another friendly DEATH KORPS operative would be incapacitated while visible to and within 3" of this operative, you can use this rule, providing neither this nor that operative is within control Range of an enemy operative. If you do, that friendly operative isn\'t incapacitated and has 1 wound remaining and cannot be incapacitated for the remainder of the action. After that action, that friendly operative can then immediately perform a free Dash action, but must end that move within this operative\'s control Range. Subtract 1 from this and that operative\'s APL stats until the end of their next activations respectively, and if this rule was used during that friendly operative\'s activation, that activation ends. You cannot use this rule if this operative is incapacitated, or if it\'s a Shoot action and this operative would be a primary or secondary target.' },
    { name: 'MEDIKIT (1AP)', description: 'Select one friendly DEATH KORPS operative within this operative\'s control Range to regain 2D3 lost wounds. It cannot be an operative that the Medic! rule was used on during this turning point.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'DEATH KORPS, IMPERIUM, ASTRA MILITARUM, MEDIC'
);

card('DEATH KORPS VOX-OPERATOR', 'Specialist',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Lasgun',  atk: '4', hit: '4+', dmg: '2/3', wr: '–' },
    { name: 'Bayonet', atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Relay Orders', description: 'Once per turning point, when this operative receives a GUARDSMAN ORDER, if it\'s not within control Range of enemy operatives, it can relay that order. Whenever an order is relayed, all friendly DEATH KORPS operatives in the killzone receive that order, then subtract 1 from this operative\'s APL stat until the end of its next activation.' },
    { name: 'SIGNAL (1AP)', description: 'SUPPORT. Select one other friendly DEATH KORPS operative visible to and within 6" of this operative. Until the end of that operative\'s next activation, add 1 to its APL stat.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'DEATH KORPS, IMPERIUM, ASTRA MILITARUM, VOX-OPERATOR'
);

card('DEATH KORPS BRUISER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Lasgun',      atk: '4', hit: '4+', dmg: '2/3', wr: '–' },
    { name: 'Trench club', atk: '4', hit: '3+', dmg: '3/3', wr: 'Shock' },
  ],
  [
    { name: 'Bruiser', description: 'Once per turning point, when this operative is fighting or retaliating, in the Resolve Attack Dice step, you can ignore the damage inflicted on it from one normal success. If this operative is incapacitated during the Fight action, you can strike the enemy operative in that sequence with one of your unresolved successes before this operative is removed from the killzone.' },
  ],
  'DEATH KORPS, IMPERIUM, ASTRA MILITARUM, BRUISER'
);

card('DEATH KORPS VETERAN', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Lasgun',     atk: '4', hit: '4+', dmg: '2/3', wr: '–' },
    { name: 'Bionic arm', atk: '3', hit: '4+', dmg: '4/5', wr: '–' },
  ],
  [
    { name: 'Veteran Guardsman', description: 'Whenever this operative is activated, it can receive one GUARDSMAN ORDER.' },
    { name: 'Bionics', description: 'Normal Dmg of 3 or more inflicts 1 less damage on this operative.' },
  ],
  'DEATH KORPS, IMPERIUM, ASTRA MILITARUM, VETERAN'
);

card('DEATH KORPS SPOTTER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Lasgun',         atk: '4', hit: '4+', dmg: '2/3', wr: '–' },
    { name: 'Mortar barrage', atk: '4', hit: '4+', dmg: '3/5', wr: 'Blast 2, Heavy (Dash only), Silent' },
    { name: 'Bayonet',        atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'SPOT (1AP)', description: 'SUPPORT: Select one enemy operative visible to this operative. Once during this Turning Point, when a friendly DEATH KORPS operative within 3" of this operative shoots that enemy operative, you can use this effect. If you do:\n• That friendly operative\'s ranged weapons gain the Seek (Light) weapon rule.\n• That enemy operative cannot be obscured.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'DEATH KORPS, IMPERIUM, ASTRA MILITARUM, SPOTTER'
);

card('DEATH KORPS TROOPER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Lasgun',  atk: '4', hit: '4+', dmg: '2/3', wr: '–' },
    { name: 'Bayonet', atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Group Activation', description: 'Whenever this operative is expended, you must then activate one other ready friendly DEATH KORPS TROOPER operative (if able) before your opponent activates. When that other operative is expended, your opponent then activates as normal (in other words, you cannot activate more than two operatives in succession with this rule).' },
  ],
  'DEATH KORPS, IMPERIUM, ASTRA MILITARUM, TROOPER'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Death Korps populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
