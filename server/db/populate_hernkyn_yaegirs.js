import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Hernkyn Yaegirs'").get()?.id;
if (!FACTION_ID) { console.error('Hernkyn Yaegirs faction not found'); process.exit(1); }

// Clear existing Hernkyn Yaegirs data
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
  'Archetypes: SEEK-DESTROY, INFILTRATION');

rule('faction_rules', null, 'OPERATIVES', 0,
  `1 HEARNKYN YAEGIR THEYN operative

9 HERNKYN YAEGIR operatives selected from the following list:
• BLADEKYN
• BOMBAST
• GUNNER
• IRONBRAEK
• RIFLEKYN
• TRACKER
• WARRIOR equipped with one of the following options:
  - Bolt revolver, plasma knife
  - Bolt shotgun; fists

Other than WARRIOR operatives, your kill team can only include each operative above once.`);

rule('faction_rules', null, 'RESOURCEFUL', 0,
  `In the Ready step of each Strategy phase after the first, you gain Resourceful points determined by the number of friendly HERNKYN YAEGIR operatives in the killzone that aren\'t within control range of enemy operatives. At the end of each turning point, discard your Resourceful points.

OPERATIVES        RESOURCEFUL POINTS
5+                2
1–4               1

You can spend 1 of your Resourceful points during each activation of each friendly HERNKYN YAEGIR operative to do one of the following:

• Before or after it performs an action, if it\'s not within control range of enemy operatives, you can use this rule. If you do, add 1 to that friendly operative\'s APL stat until the end of its activation.
• When it\'s activated, if it\'s not within control range of enemy operatives, it regains up to D3+1 lost wounds.`);

rule('faction_rules', null, 'DAUNTLESS EXPLORERS', 0,
  'STRATEGIC GAMBIT in the first turning point. Each friendly HERNKYN YAEGIR operative wholly within your drop zone can immediately perform a free Reposition action. Each that does so must end that move wholly within 4" of your drop zone.');

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'HIDDEN ENGAGEMENT', 1,
  'Whenever a friendly HERNKYN YAEGIR operative is shooting, if it\'s in cover from the target\'s perspective, its weapons have the Balanced weapon rule. Note that your opponent still determines the targeting lines for this (i.e. they decide which point of their operative\'s base targeting lines are drawn from).');

rule('ploy', 'Strategy', 'MASTERFUL BLADEWORK', 1,
  'Whenever a friendly HERNKYN YAEGIR operative is fighting, or has a Conceal order and is retaliating, add 1 to the Atk stat of its melee weapons (to a maximum of 4) and they have the Balanced weapon rule; if the weapon already has that weapon rule, it has the Ceaseless weapon rule instead of Balanced.');

rule('ploy', 'Strategy', 'TOUGH SURVIVALISTS', 1,
  'The first time an attack dice inflicts damage on each friendly HERNKYN YAEGIR operative during the Turning Point in the Resolve Attack Dice step, you can halve that inflicted damage (rounding up, to a minimum of 2).');

rule('ploy', 'Strategy', 'IN POSITION', 1,
  'Whenever a friendly HERNKYN YAEGIR operative has a Conceal order and is in cover, it cannot be selected as a valid target, taking precedence over all other rules (e.g. Seek, Vantage terrain), except being at 2" or less.');

rule('ploy', 'Firefight', 'STALWART DEFENCE', 1,
  `Use this Firefight Ploy when an enemy operative ends a move within the control range of a friendly HERNKYN YAEGIR operative. Select one other friendly HERNKYN YAEGIR operative visible to and within 6" of that friendly operative, but that isn\'t itself within control range of enemy operatives. The selected operative can perform a free Shoot action. During that action:
• It can target that enemy operative even though it\'s within control range of a friendly operative.
• Other enemy operatives cannot be selected as a valid target.
• Worsen the Hit stat of its weapons by 1.
• You cannot select a frag or krak grenade, or a weapon with the Blast or x" Devastating x weapon rule (e.g. Devastating 1").`);

rule('ploy', 'Firefight', 'STURDY', 1,
  'Use this Firefight Ploy when an operative is shooting a friendly HERNKYN YAEGIR operative, when you collect your defence dice. Change the attacker\'s retained critical successes to normal successes (any weapon rules they\'ve already resolved aren\'t affected, e.g. Piercing Crits).');

rule('ploy', 'Firefight', 'BONDS THAT BIND', 1,
  'Use this Firefight Ploy when a friendly HERNKYN YAEGIR operative is activated. Select one other ready friendly HERNKYN YAEGIR operative visible to and within 3" of that operative. When that first friendly operative is expended, you can activate that other friendly operative before your opponent activates.\n\nNeither operative can be a BOMBAST operative if its Wroughtlock Negotiation STRATEGIC GAMBIT has been used this turning point.');

rule('ploy', 'Firefight', 'NO KIN LEFT BEHIND', 1,
  'Use this Firefight Ploy when a friendly HERNKYN YAEGIR operative is incapacitated. Before that operative is removed from the killzone, remove your Fallen Kin marker from the killzone (if any), then place it within that operative\'s control range. That operative is then incapacitated as normal.\n\nWhenever a friendly HERNKYN YAEGIR operative within 3" of your Fallen Kin marker is shooting, fighting or retaliating, in the Roll Attack Dice step, you can retain one of your fails as a normal success or one of your normal successes as a critical success instead.');

// ── TACOPS ───────────────────────────────────────────────────────────────────

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

rule('tac_op', 'INFILTRATION', 'TRACK ENEMY', 0,
  `Archetype: INFILTRATION

REVEAL: The first time you score VP from this op.

ADDITIONAL RULES: An enemy operative is being tracked if it's a valid target for a friendly operative within 6" of it. That friendly operative must have a Conceal order, cannot be a valid target for the enemy operative it's attempting to track, and cannot be within control range of enemy operatives.

VICTORY POINTS: At the end of each turning point after the first:
• If one enemy operative is being tracked, you score 1VP, or 2VP instead if it's the fourth turning point.
• If two or more enemy operatives are being tracked, you score 2VP.

You cannot score more than 2VP from this op per turning point.`);

rule('tac_op', 'INFILTRATION', 'PLANT DEVICES', 0,
  `Archetype: INFILTRATION

REVEAL: The first time a friendly operative performs the Plant Device action.

MISSION ACTION – PLANT DEVICE (1 APL): One objective marker the active operative controls gains one of your Device tokens.

An operative cannot perform this action during the first turning point, while within control range of an enemy operative, or if that objective marker already has one of your Device tokens.

VICTORY POINTS: At the end of each turning point after the first:
• If your opponent's objective marker has one of your Device tokens, you score 1VP.
• For each other objective marker enemy operatives contest that has one of your Device tokens, you score 1VP.

You cannot score more than 2VP from this op per turning point.`);

rule('tac_op', 'INFILTRATION', 'STEAL INTELLIGENCE', 0,
  `Archetype: INFILTRATION

REVEAL: The first time an enemy operative is incapacitated.

ADDITIONAL RULES: Whenever an enemy operative is incapacitated, before it's removed from the killzone, place one of your Intelligence mission markers within its control range.

Friendly operatives can perform the Pick Up Marker action on your Intelligence mission markers, and for the purposes of that action's conditions, ignore the first Intelligence mission marker the active operative is carrying. In other words, each friendly operative can carry up to two Intelligence mission markers, or one and one other marker.

VICTORY POINTS: At the end of each turning point after the first, if any friendly operatives are carrying any of your Intelligence mission markers, you score 1VP.

At the end of the battle, for each of your Intelligence mission markers friendly operatives are carrying, you score 1VP.`);

// ── EQUIPMENT ────────────────────────────────────────────────────────────────

rule('equipment', null, 'PLASMA KNIFE', 0,
  'Friendly HERNKYN YAEGIR operatives have the following melee weapon: Plasma Knife. Note that some operatives already have this weapon but with better stats; in that instance, use the better version, and that weapon has the Balanced weapon rule for the battle.\n\nNAME: Plasma Knife | A: 3 | BS: 4+ | D: 3/5\nSPECIAL RULES: Lethal 5+');

rule('equipment', null, 'STABILISED BOLT SHELLS', 0,
  'Up to twice per Turning Point, whenever a friendly HERNKYN YAEGIR operative is performing the Shoot action with a bolt shotgun (long range), you can use this rule. If you do, until the end of that action, improve the Hit stat of that weapon by 1 and add 1 to both of its Dmg stats.');

rule('equipment', null, 'FIRESTORM BOLT SHELLS', 0,
  'Once per turning point, when a friendly HERNKYN YAEGIR operative is performing the Shoot action with a bolt shotgun (short range), you can use this rule. If you do, until the end of that action, that weapon has the Blast 1" weapon rule.');

rule('equipment', null, 'KV-CERAMIDE UNDERSUIT', 0,
  'Whenever an operative is shooting a friendly HERNKYN YAEGIR operative, if the ranged weapon in that sequence has the Blast or Torrent weapon rule, you can re-roll one of your defence dice. In addition, friendly HERNKYN YAEGIR operatives aren\'t affected by the Devastating x" weapon rule (i.e., Devastating with a distance) unless they are the target during that sequence.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('YAEGIR THEYN', 'Leader',
  { APL: '2', MOVE: '5"', SAVE: '4+', WOUNDS: '9' },
  [
    { name: 'Bolt revolver',           atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 8"' },
    { name: 'Bolt shotgun – Short range', atk: '4', hit: '3+', dmg: '4/4', wr: 'Range 6"' },
    { name: 'Bolt shotgun – Long range',  atk: '4', hit: '5+', dmg: '2/2', wr: '–' },
    { name: 'Plasma knife',            atk: '4', hit: '3+', dmg: '3/5', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Veteran Adventurer', description: 'In the Ready step of each Strategy phase after the first, if this operative is in the killzone and isn\'t within control Range of enemy operatives, you gain 1 Resourceful point.' },
    { name: 'Outright Conviction', description: 'The first time this operative would be incapacitated during the battle, it\'s not incapacitated, has 1 wound remaining and cannot be incapacitated for the remainder of the action. All remaining attack dice are discarded (including yours if this operative is fighting or retaliating).' },
  ],
  'HEARNKYN YAEGIR, LEAGUES OF VOTANN, LEADER, THEYN'
);

card('YAEGIR BLADEKYN', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Throwing plasma knife', atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 6", Lethal 5+, Limited 1, Silent' },
    { name: 'Dual plasma knives',    atk: '4', hit: '3+', dmg: '3/5', wr: 'Ceaseless, Lethal 5+' },
  ],
  [
    { name: 'Stalker', description: 'This operative can perform the Charge action while it has a Conceal order.' },
    { name: 'Irrepressible Hardiness', description: 'If this operative is incapacitated during the Fight action, you can strike the enemy operative in that sequence with one of your unresolved successes before this operative is removed from the killzone.' },
  ],
  'HEARNKYN YAEGIR, LEAGUES OF VOTANN, BLADEKYN'
);

card('YAEGIR BOMBAST', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Wroughtlock revolvers', atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 9", Ceaseless, Lethal 5+' },
    { name: 'Fists',                 atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Wroughtlock Negotiation', description: 'STRATEGIC GAMBIT. This operative can immediately perform a free Shoot action (you can change its order to Engage to do so).' },
    { name: 'Brazen Killer', description: 'Whenever this operative incapacitates an enemy operative with its Wroughtlock revolvers, roll one D6 separately for each other enemy operative visible to and within 2" of that enemy operative. If the result is higher than that other enemy operative\'s APL stat, subtract 1 from its APL stat until the end of its next activation.' },
  ],
  'HEARNKYN YAEGIR, LEAGUES OF VOTANN, BOMBAST'
);

card('YAEGIR GUNNER', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'APM launcher – Armour piercing', atk: '5', hit: '4+', dmg: '4/5', wr: 'Heavy (Reposition only), Piercing 1, Bipod*' },
    { name: 'APM launcher – Breaching',       atk: '5', hit: '4+', dmg: '3/5', wr: 'Blast 2", Heavy (Reposition only), Bipod*' },
    { name: 'APM launcher – High explosive',  atk: '5', hit: '4+', dmg: '2/4', wr: 'Blast 3", Heavy (Reposition only), Bipod*' },
    { name: 'Fists',                          atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Bipod', description: 'Whenever this operative is shooting with this weapon, if it hasn\'t moved during the activation, or if it\'s a counteraction, this weapon has the Ceaseless weapon rule. Note this operative isn\'t restricted from moving after shooting.' },
  ],
  'HEARNKYN YAEGIR, LEAGUES OF VOTANN, GUNNER'
);

card('YAEGIR IRONBRAEK', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Bolt revolver', atk: '4', hit: '4+', dmg: '3/5', wr: 'Range 8"' },
    { name: 'Entrencher',    atk: '3', hit: '4+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Minefield', description: 'You have five Minefield markers for the battle. On the reverse side, three of them are HY-Pex mines (see right) and two are blank. Set up all your Minefield markers as if they were one item of equipment. Each must be set up reverse-side down (their specifics aren\'t revealed), more than 2" from other markers, access points and accesible terrain, and more than 6" from your opponent\'s drop zone and your other Minefield markers. Whenever this operative is readied, if it\'s not within control Range of enemy operatives, you can reset one of your flipped Minefield markers that\'s within its control Range (flip the marker back over again).' },
    { name: 'HY-Pex Mines', description: 'Whenever one of your reverse-side down Minefield markers is both within an enemy operative\'s control Range and not within a friendly HERNKYN YAEGIR operative\'s control Range, flip the marker over. If it\'s a blank, there\'s no effect. If it\'s a HY-Pex mine, inflict 3 damage on that enemy operative and roll one D6: if the result is less than that enemy operative\'s Save stat, inflict additional damage equal to the dice result; if it\'s not incapacitated, end its action (if any), even if that action\'s effects aren\'t fulfilled. If it cannot be placed, move it the minimum amount to do so. Regardless, that marker isn\'t removed.' },
  ],
  'HEARNKYN YAEGIR, LEAGUES OF VOTANN, IRONBRAEK'
);

card('YAEGIR RIFLEKYN', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Magna-coil rifle – Concealed',  atk: '4', hit: '2+', dmg: '3/3', wr: 'Devastating 3, Heavy, Piercing 1, Silent, Concealed Position*' },
    { name: 'Magna-coil rifle – Mobile',     atk: '4', hit: '3+', dmg: '3/4', wr: 'Heavy (Reposition only), Piercing 1' },
    { name: 'Magna-coil rifle – Stationary', atk: '4', hit: '2+', dmg: '3/3', wr: 'Devastating 3, Heavy, Piercing 1' },
    { name: 'Fists',                         atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Weavewerke Cloak', description: 'Whenever an operative is shooting this operative: Ignore the Saturate weapon rule. If you can retain any cover saves, you can retain one additional cover save, or you can retain one cover save as a critical success instead. This isn\'t cumulative with improved cover saves from Vantage terrain.' },
    { name: '*Concealed Position', description: 'This operative can only use this weapon the first time it\'s performing the Shoot action during the battle.' },
  ],
  'HEARNKYN YAEGIR, LEAGUES OF VOTANN, RIFLEKYN'
);

card('YAEGIR TRACKER', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'SiNR handbow',      atk: '4', hit: '4+', dmg: '3/5', wr: 'Silent' },
    { name: 'Throwing hatchet',  atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 6", Limited 1, Rending, Silent' },
    { name: 'Hatchet',           atk: '4', hit: '3+', dmg: '4/5', wr: '–' },
  ],
  [
    { name: 'Pan Spectral Visor', description: 'Whenever this operative is shooting an operative within 6" of it: This operative\'s weapons have the Seek Light weapon rule. That operative cannot be obscured.' },
    { name: 'Tracker', description: 'Whenever this operative is shooting against or fighting against an expended operative within 6" of it, this operative\'s weapons have the Punishing weapon rule.' },
  ],
  'HEARNKYN YAEGIR, LEAGUES OF VOTANN, TRACKER'
);

card('YAEGIR WARRIOR', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Bolt revolver',             atk: '4', hit: '4+', dmg: '3/5', wr: 'Range 8"' },
    { name: 'Bolt shotgun – Short range', atk: '4', hit: '3+', dmg: '4/4', wr: 'Range 6"' },
    { name: 'Bolt shotgun – Long range',  atk: '4', hit: '5+', dmg: '2/2', wr: '–' },
    { name: 'Fists',                     atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
    { name: 'Plasma knife',              atk: '4', hit: '4+', dmg: '3/5', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Intrepid', description: 'Whenever you spend a Resourceful point for this operative, the following take precedence: If you add 1 to its APL stat, it lasts until the start of its next activation instead. If it regains lost wounds, it regains 4 instead.' },
  ],
  'HEARNKYN YAEGIR, LEAGUES OF VOTANN, WARRIOR'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Hernkyn Yaegirs populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
