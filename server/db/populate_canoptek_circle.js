import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Canoptek Circle'").get()?.id;
if (!FACTION_ID) { console.error('Canoptek Circle faction not found'); process.exit(1); }

// Clear existing Canoptek Circle data
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
  'Archetypes: RECON, SECURITY');

rule('faction_rules', null, 'OPERATIVES', 0,
  `1 CANOPTEK CIRCLE GEOMANCER operative
2 CANOPTEK CIRCLE TOMB CRAWLER operatives with one of the following options (select separately for each):
• Twin gauss reapers; claws
• Transdimensional isolator; claws *

1 CANOPTEK CIRCLE ACCELERATOR operative
1 CANOPTEK CIRCLE REANIMATOR operative
3 CANOPTEK CIRCLE WARRIOR operatives with one of the following options (select separately for each):
• Gauss scalpel; claws & tail
• Tesla caster; claws & tail

* Your kill team can only include up to one transdimensional isolator.`);

rule('faction_rules', null, 'OBELISK NODE MATRIX', 0,
  `Obelisk nodes are concentrations of Necron technology, hubs of energy and data streams. Whether raised up from their sites of ancient burial, formed from restructured local matter or phased into place from a pocket dimension, these angular nodes can empower a Cryptek and their servants. Impelled into positions where they can connect in a matrix of power, they aid the Cryptek\'s ambitions whilst hampering their foes.

As a STRATEGIC GAMBIT in the first turning point, place your three OBELISK NODE markers wholly within your territory. As a STRATEGIC GAMBIT in each turning point after the first, you can move your OBELISK NODE markers up to 3" horizontally each.

Your OBELISK NODE markers control other markers within 1" of them that no enemy operatives contest (treat your OBELISK NODE markers as friendly operatives for this purpose). If more than one player would use their OBELISK NODE markers to control the same marker, no OBELISK NODE markers control it.

Whenever one of your OBELISK NODE markers is within 6" horizontally of another of your OBELISK NODE markers, those markers and the area between them create an OBELISK NODE MATRIX above and below (in other words, their height in the killzone is irrelevant). If all three of your OBELISK NODE markers fulfil this, it creates a larger combined OBELISK NODE MATRIX.

Whenever a friendly CANOPTEK CIRCLE operative is within your OBELISK NODE MATRIX:
• Weapons on its datacard have the Accurate 1 weapon rule.
• Add 1 to its APL stat (to a maximum of 3).`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'HYPERSHIELDING', 1,
  'Whenever an operative is shooting a friendly CANOPTEK CIRCLE operative, if your OBELISK NODE MATRIX is intervening, or that friendly operative is within your OBELISK NODE MATRIX, you can re-roll any of your defence dice results of one result (e.g., results of 2).');

rule('ploy', 'Strategy', 'TRANSDYNAMIC AMPLIFICATION', 1,
  'Whenever a friendly CANOPTEK CIRCLE operative is shooting, if your OBELISK NODE MATRIX is intervening, or the target is within your OBELISK NODE MATRIX, that friendly operative\'s weapons have the Ceaseless weapon rule.');

rule('ploy', 'Strategy', 'CRYPTOGRAVITIC REPULSION', 1,
  'Once per action, the first time an enemy operative would move within your OBELISK NODE MATRIX, the distance is treated as an additional 1". Note this means if that enemy operative doesn\'t have sufficient move distance (e.g., it\'s at the end of its move), that operative cannot move within your OBELISK NODE MATRIX.');

rule('ploy', 'Strategy', 'SOULDRAIN', 1,
  'Whenever an enemy operative is within your OBELISK NODE MATRIX, or whenever it\'s fighting or retaliating against a friendly CANOPTEK CIRCLE operative that\'s within your OBELISK NODE MATRIX, subtract 1 from both Dmg stats of that enemy operative\'s melee weapons (to a minimum of 2) until the end of the activation/counteraction. Note this means if the enemy operative moves through your OBELISK NODE MATRIX, apply this change at the end of that move action until the end of the activation/counteraction.');

rule('ploy', 'Firefight', 'ANIMATE OBELISK NODES', 1,
  'Use this firefight ploy when it\'s your turn to activate or counteract. Move any number of your OBELISK NODE markers instead. They can move up to 6" horizontally combined, and distances are always rounded up to the nearest inch (so if you move a marker 1.5", it\'s treated as moving it 2"). For example, you could move one marker 6", three markers 1" each, or any combination that doesn\'t exceed 6" in total. You can also move them 0" (to effectively skip an activation). In any case, your opponent activates as normal afterwards.');

rule('ploy', 'Firefight', 'SHIELD FLARE', 1,
  'Use this firefight ploy when an attack dice inflicts Normal Dmg on a friendly CANOPTEK CIRCLE operative. If your OBELISK NODE MATRIX is intervening, or that friendly operative is within your OBELISK NODE MATRIX, ignore that inflicted damage. Note your opponent determines intervening (i.e. where on their operative\'s base to draw the targeting lines from).');

rule('ploy', 'Firefight', 'NODAL RESPONSE', 1,
  'Use this firefight ploy during a friendly CANOPTEK CIRCLE operative\'s activation, before or after it performs an action. You can either change one of the strategy ploys you used during this turning point (only pay additional CP if that ploy costs more), or use a strategy ploy now (pay its CP cost as normal).');

rule('ploy', 'Firefight', 'SACRIFICIAL THRALL', 1,
  'Use this firefight ploy when a friendly CANOPTEK CIRCLE GEOMANCER operative is selected as the valid target of a Shoot action or to fight against during the Fight action. Select one other friendly CANOPTEK CIRCLE CANOPTEK operative visible to and within 3" of that first friendly operative to become the valid target or to be fought against (as appropriate) instead (even if it wouldn\'t normally be valid for this). If it\'s the Fight action, treat that other operative as being within the fighting operative\'s control range for the duration of that action. If it\'s the Shoot action, that other operative is only in cover or obscured if the original target was.\n\nThis ploy has no effect if it\'s the Shoot action and the ranged weapon has the Blast or Torrent weapon rule.');

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

// ── EQUIPMENT ────────────────────────────────────────────────────────────────

rule('equipment', null, 'MATRIX MANIPULATOR', 0,
  'Once per battle, during a friendly CANOPTEK CIRCLE operative\'s activation or counteraction, you can use this rule. If you do, until the end of that activation/counteraction, a friendly CANOPTEK CIRCLE GEOMANCER operative is treated as your fourth OBELISK NODE marker.');

rule('equipment', null, 'AWAKENED OBELISK NODES', 0,
  'After revealing this equipment option, roll one D3. You can use the Animate Obelisk Nodes firefight ploy for 0CP a number of times during the battle equal to the result.');

rule('equipment', null, 'NANOSCARAB CASKETS', 0,
  'Whenever a friendly CANOPTEK CIRCLE operative is activated, it regains D3 lost wounds.');

rule('equipment', null, 'PHASE SHIFTER', 0,
  'Once per turning point, when an operative is shooting a friendly CANOPTEK CIRCLE GEOMANCER operative, at the start of the Roll Defence Dice step, you can use this rule. If you do, worsen the x of the Piercing weapon rule by 1 (if any) until the end of that sequence. Note that Piercing 1 would therefore be ignored.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('GEOMANCER', 'Leader',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Tremorglaive (part matter)', atk: '4', hit: '3+', dmg: '4/5', wr: 'Piercing Crits 2, Piercing 1' },
    { name: 'Tremorglaive (quake)',       atk: '5', hit: '3+', dmg: '1/2', wr: 'Blast 2, Stun, Seek (Light)' },
    { name: 'Tremorglaive (sweep)',       atk: '4', hit: '4+', dmg: '4/5', wr: 'Severe, Shock, Stun' },
  ],
  [
    { name: 'Obelisk Node Control', description: 'Whenever this operative would perform a mission action (excluding Retrieve, Approved Ops 2025), if it requires this operative to control an objective marker, you can instead determine control from one of your OBELISK NODE markers (see Obelisk Node Matrix faction rule). Whenever this operative would perform the Operate Hatch action, you can open or close a hatchway that access point is within 1" of one of your OBELISK NODE markers instead. Note that you must still fulfil the Operate Hatch action\'s conditions.' },
    { name: 'MOLECULAR BREACH (1AP)', description: 'SUPPORT. Select one friendly CANOPTEK CIRCLE operative visible to and within 6" of this operative. Alternatively, select one friendly CANOPTEK CIRCLE operative visible to this operative and within your OBELISK NODE MATRIX (SUPPORT doesn\'t apply to this selection).\n\nThe next time the selected operative performs an action in which it moves, don\'t move it. Instead, remove it from the killzone and set it back up wholly within a distance equal to its Move stat (or 3" if it was a Dash) of its original location, measuring the horizontal distance only (in a close-quarters killzone, e.g. Tomb World, this distance can be measured over and through Wall terrain and the operative can be set up on the other side). It gains no additional distance when performing a Charge. It must be set up in a location it can be placed, and unless it\'s the Charge action, it cannot be set up within control Range of an enemy operative.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
    { name: 'CANOPTEK CONTROL (1AP)', description: 'SUPPORT. Select one friendly CANOPTEK CIRCLE CANOPTEK operative visible to and within 6" of this operative. Alternatively, select one friendly CANOPTEK CIRCLE CANOPTEK operative that\'s visible to this operative and within your OBELISK NODE MATRIX (SUPPORT doesn\'t apply to this selection). That selected operative can immediately perform a 1AP action for free; during that action, it cannot move more than 2", or must be set up wholly within 2" if it\'s removed and set up again.\n\nThis operative cannot perform this action while within control Range of an enemy operative, or while counteracting.' },
    { name: 'GEOMANTIC DISTURBANCE (1AP)', description: 'Select a point on a terrain feature; that point must be visible to and within 8" of this operative. Separately roll 2D6 for each operative within 2" of that point. If the result is higher than that operative\'s remaining wounds, inflict damage on it equal to the difference.\n\nThis operative cannot perform this action while it has a Conceal order, or while within control Range of an enemy operative.' },
  ],
  'CANOPTEK CIRCLE, NECRON, CRYPTEK, LEADER, GEOMANCER'
);

card('CANOPTEK TOMB CRAWLER', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '3+', WOUNDS: '21' },
  [
    { name: 'Twin gauss reapers – Focused',   atk: '5', hit: '4+', dmg: '4/5', wr: 'Piercing 1, Severe' },
    { name: 'Twin gauss reapers – Sweeping',  atk: '4', hit: '4+', dmg: '4/5', wr: 'Piercing 1, Torrent 1", Severe' },
    { name: 'Transdimensional isolator',      atk: '5', hit: '4+', dmg: '5/6', wr: 'Dimensional banishment*' },
    { name: 'Claws',                          atk: '4', hit: '4+', dmg: '4/4', wr: '–' },
  ],
  [
    { name: 'Weapon Sentinel', description: 'Whenever your opponent is selecting a valid target, if this operative has a Conceal order, it cannot use Light terrain for cover. While this can allow this operative to be targeted (assuming it\'s visible), it doesn\'t remove its cover save (if any).' },
    { name: 'Steadfast', description: 'Whenever determining control of a marker, you can treat this operative\'s APL stat as 3. If you do, this takes precedence over all other rules, meaning any changes to its APL stat are ignored for this.' },
    { name: '*Dimensional Banishment', description: 'After this operative uses this weapon, if you inflicted damage or retained any critical successes, if the target wasn\'t incapacitated, roll 2D6: if the result is higher than the target\'s remaining wounds, the target is incapacitated (taking precedence over rules that prevent incapacitation, e.g. Medic!, FELLGOR RAVAGER Frenzy) and your opponent cannot place a Reanimation marker (HIEROTEK CIRCLE) for that operative, if relevant.' },
  ],
  'CANOPTEK CIRCLE, NECRON, CANOPTEK, TOMB CRAWLER'
);

card('MACROCYTE WARRIOR', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Tesla caster – Focused',          atk: '4', hit: '4+', dmg: '2/3', wr: '–' },
    { name: 'Tesla caster – Living lightning', atk: '4', hit: '4+', dmg: '2/3', wr: 'Blast 2' },
    { name: 'Gauss scalpel',                   atk: '4', hit: '4+', dmg: '2/3', wr: 'Piercing 1' },
    { name: 'Claws and tail',                  atk: '3', hit: '4+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Expendable Construct', description: 'This operative is ignored for your opponent\'s kill/elimination op (when it\'s incapacitated, and when determining your starting number of operatives). It\'s also ignored for victory conditions and scoring VPs if either require operatives to \'escape\', \'survive\' or be incapacitated by enemy operatives (if it escapes/survives/is incapacitated, determining how many operatives must escape/survive/be incapacitated, etc.).' },
    { name: 'A Ceaseless Scuttling', description: 'As a STRATEGIC GAMBIT in each turning point after the first, if you have fewer than three non-incapacitated friendly CANOPTEK CIRCLE WARRIOR operatives, you can set up another one wholly within your drop zone, ready and with a Conceal order (you can select its weapon options as normal).' },
    { name: 'Aggressive Defence', description: 'If this operative is incapacitated by an enemy operative within 2", roll one D3; on a 2+, inflict 1 damage on that enemy operative.' },
  ],
  'CANOPTEK CIRCLE, NECRON, CANOPTEK, MACROCYTE, WARRIOR'
);

card('MACROCYTE REANIMATOR', 'Specialist',
  { APL: '2', MOVE: '7"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Atomiser beam', atk: '4', hit: '4+', dmg: '3/4', wr: 'Range 6", Lethal 5+' },
    { name: 'Claws and tail', atk: '4', hit: '4+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Reanimate', description: 'Once per turning point, when another friendly CANOPTEK CIRCLE operative would be incapacitated, if that operative is visible to and within 6" of this operative, or if this and that operative are within your OBELISK NODE MATRIX, you can use this rule, providing neither this nor that operative is within control Range of an enemy operative. If you do, that friendly operative isn\'t incapacitated, has 1 wound remaining and cannot be incapacitated for the remainder of the action. After that action, that friendly operative can then immediately perform a free Dash action, but must end that action within this operative\'s control Range or within your OBELISK NODE MATRIX. Subtract 1 from this and that operative\'s APL stats until the end of their next activations respectively, and if this rule was used during that friendly operative\'s activation, that activation ends. You cannot use this rule if this operative is incapacitated, or if it\'s a Shoot action and this operative would be a primary or secondary target.' },
    { name: 'NANOSCARAB BEAM (1AP)', description: 'Select one friendly CANOPTEK CIRCLE operative visible to and within 6" of this operative. Alternatively, if this operative is within your OBELISK NODE MATRIX, you can select one other friendly CANOPTEK CIRCLE operative within your OBELISK NODE MATRIX. The selected operative regains up to 3D3 lost wounds. It cannot be an operative that the Reanimate rule was used on during this turning point.\n\nThis operative cannot perform this action while within control Range of an enemy operative, or more than once per turning point.' },
  ],
  'CANOPTEK CIRCLE, NECRON, CANOPTEK, MACROCYTE, REANIMATOR'
);

card('MACROCYTE ACELARATOR', 'Specialist',
  { APL: '2', MOVE: '7"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Spark',           atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 4", Piercing 1' },
    { name: 'Claws and spark', atk: '3', hit: '4+', dmg: '3/4', wr: 'Lethal 5+, Stun' },
  ],
  [
    { name: 'OVERCHARGE (1AP)', description: 'Select one other friendly CANOPTEK CIRCLE CANOPTEK operative visible to and within 3" of this operative. Alternatively, if this operative is within your OBELISK NODE MATRIX, you can select one other friendly CANOPTEK CIRCLE CANOPTEK operative within your OBELISK NODE MATRIX. Until the end of that selected operative\'s next activation, add 1 to its APL stat.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
    { name: 'CRANIAL OVERLOAD (1AP)', description: 'Select one enemy operative visible to and within 3" of this operative. Alternatively, if this operative is within your OBELISK NODE MATRIX, you can select one enemy operative within your OBELISK NODE MATRIX. Until the end of that enemy operative\'s next activation, subtract 1 from its APL stat.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'CANOPTEK CIRCLE, NECRON, CANOPTEK, MACROCYTE, ACELERATOR'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Canoptek Circle populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
