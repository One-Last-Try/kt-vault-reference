import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Battleclade'").get()?.id;
if (!FACTION_ID) { console.error('Battleclade faction not found'); process.exit(1); }

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
  'Archetypes: INFILTRATION, RECON');

rule('faction_rules', null, 'OPERATIVES', 0,
  `1 BATTLECLADE TECHNOARCHEOLOGIST operative
1 BATTLECLADE SERVITOR UNDERSEER operative
8 BATTLECLADE operatives selected from the following list:
• AUTO-PROXY SERVITOR
• BREACHER SERVITOR
• COMBAT SERVITOR with one of the following options:
  - Servo-claw; incendine igniter
  - Servo-claw; meltagun
  - Servo-claw; phosphor blaster
• GUN SERVITOR with heavy arc rifle and augmetic claw
• GUN SERVITOR with heavy bolter and augmetic claw
• TECHNOMEDIC SERVITOR

Other than COMBAT SERVITOR operatives, your kill team can only include each operative above once. You cannot select a COMBAT SERVITOR with meltagun more than once, and you cannot select one with incendine igniter more than three times.`);

rule('faction_rules', null, 'NOOSPHERIC NETWORK', 0,
  `Once during each friendly BATTLECLADE SERVITOR operative's activation, before or after it performs an action, you can spend 1AP to Transfer Power.

After that activation, you can Network Counteract with one other friendly SERVITOR BATTLECLADE operative before your opponent activates. Whenever you Network Counteract with a friendly operative, first select its order. It can then perform a 1AP action for free, but cannot move more than 2" during that action. Once it's done so, your opponent then activates as normal.

An operative cannot Transfer Power or Network Counteract if it has an APL stat of less than 2 (e.g. if the stat has been changed to less than 2 by a rule). Network Counteract is a counteraction, but the operative doesn't need to be expended with an Engage order to do it. That means if they're ready when they Network Counteract, they can still be activated as normal later in the turning point. An operative that does Network Counteract cannot do so again, or counteract, during the same turning point.`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'NOOSPHERIC POSSESSION', 1,
  `Support. Whenever a friendly SERVITOR BATTLECLADE operative is within 6" of a friendly AUTO-PROXY BATTLECLADE or SERVITOR UNDERSEER BATTLECLADE operative, that friendly SERVITOR operative's weapons have the Accurate 1 weapon rule.

For the purposes of this Support rule and the Comms Device equipment, the AUTO-PROXY or SERVITOR UNDERSEER operative must control your Comms Device marker to add 3" to its distance requirement for this rule.`);

rule('ploy', 'Strategy', 'INCANTATION OF THE IRON SOUL', 1,
  'Whenever an attack dice inflicts damage of 3 or more on a friendly BATTLECLADE operative, roll one D6: on a 5+, subtract 1 from that inflicted damage.');

rule('ploy', 'Strategy', 'PRIORITISED ACQUISITION', 1,
  `Select one objective marker or one of your mission markers.

Whenever determining control of that marker, treat the total APL stat of friendly BATTLECLADE operatives that contest it as 1 higher if at least one friendly BATTLECLADE operative contests that marker. Note this isn't a change to the APL stat, so any changes are cumulative with this.

Whenever a friendly BATTLECLADE operative is within 3" of that marker, add 1 to the Atk stat of its melee weapons (to a maximum of 4).`);

rule('ploy', 'Strategy', 'DUTY OF RECLAMATION', 1,
  'Once per action, you can use the Command Re-roll firefight ploy for 0CP if the attack or defence dice was rolled for a friendly BATTLECLADE operative that contests an objective marker or one of your mission markers.');

rule('ploy', 'Firefight', 'SYSTEM EXORCISM', 1,
  'Use this firefight ploy when you would activate a friendly OPERATIVE BATTLECLADE. Remove one rules effect or stat change your opponent has applied to it (e.g. Poison token, -1APL, cannot be activated or perform actions, etc), then activate it. This ploy cannot allow it to regain lost wounds, ignore the effects of being injured, remove mission pack rules, or remove -1APL that you\'ve applied to it (i.e. from TRANSFER POWER).');

rule('ploy', 'Firefight', 'REMOTE ACCESS', 1,
  `Use this firefight ploy during a friendly TECH-PRIEST BATTLECLADE operative's activation. Once during that activation, you can use one of the following rules:

• That operative doesn't require a marker to be within its control range to perform a mission action that usually requires this (taking precedence over that action's conditions). Instead, the marker must be within 4" of it and no enemy operatives can contest that marker. However, you can ignore enemy operatives within control range of other friendly BATTLECLADE operatives when determining this.
• That operative doesn't require a hatchway's access point to be within its control range to perform an Operate Hatch action. Instead, that access point must be within 4" of it.`);

rule('ploy', 'Firefight', 'AUTO-FERRIC SUPPLICATION', 1,
  'Use this firefight ploy when an operative is shooting a friendly TECH-PRIEST BATTLECLADE operative, at the start of the Roll Attack Dice step. Until the end of the sequence, ignore the Piercing weapon rule.');

rule('ploy', 'Firefight', 'SERVILE SURROGACY', 1,
  `Use this firefight ploy when a friendly TECH-PRIEST BATTLECLADE operative is selected as the valid target of a Shoot action or to fight against during the Fight action. Select one friendly SERVITOR BATTLECLADE operative visible to and within 3" of that first friendly operative to become the valid target or to be fought against (as appropriate) instead (even if it wouldn't normally be valid for this). If it's the Fight action, treat that SERVITOR operative as being within the fighting operative's control range for the duration of that action. If it's the Shoot action, that SERVITOR operative is only in cover or obscured if the original target was.

This ploy has no effect if it's the Shoot action and the ranged weapon has the Blast or Torrent weapon rule.`);

// ── TAC OPS ───────────────────────────────────────────────────────────────────

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

rule('equipment', null, 'COVERT GUISES', 0,
  `After revealing this equipment option, roll one D3. As a STRATEGIC GAMBIT in the first turning point, a number of friendly BATTLECLADE operatives equal to the result that are wholly within your drop zone can immediately perform a free Reposition action, but must end that move wholly within 3" of your drop zone. Your TECHNOARCHEOLOGIST operative cannot perform more than one Reposition action in the Strategy phase of the first turning point (i.e. as a result of the Seeker of Divine Arcana rule as well).`);

rule('equipment', null, 'ELECTROMANTIC CAPACITORS', 0,
  `Friendly BATTLECLADE operatives' melee weapons have the Shock weapon rule. Whenever a ready friendly BATTLECLADE operative is retaliating, its melee weapons also have the Severe weapon rule.`);

rule('equipment', null, 'CONCEALED APPARATUS', 0,
  `STRATEGIC GAMBIT in the second turning point. You can swap the locations of any number of friendly BATTLECLADE SERVITOR operatives with each other (excluding GUN SERVITOR), and you can swap the locations of friendly BATTLECLADE GUN SERVITOR operatives with each other (remove them from the killzone and set them back up again). You cannot swap any operatives that have done any of the following during the battle:

• Used any weapons on their datacard.
• Performed any actions on their datacard.
• Used the Mechanosuture Array rule (see TECHNOMEDIC).`);

rule('equipment', null, 'NEUROCYCLIC RESERVE CELLS', 0,
  `After revealing this equipment option, roll one D3. A number of times during the battle equal to the result, whenever you TRANSFER POWER, you can use this rule. If you do, you can TRANSFER POWER for 0AP, but it cannot perform Shoot or Fight actions during that activation (this takes precedence over the normal Noospheric Network rules).`);

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('TECHNOARCHEOLOGIST', 'Leader',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '9' },
  [
    { name: 'Eradication pistol', atk: '4', hit: '3+', dmg: '4/2', wr: 'Range 8", 1" Devastating 3, Lethal 5+' },
    { name: 'Servo-arc claw',     atk: '4', hit: '4+', dmg: '3/4', wr: 'Shock, Severe' },
  ],
  [
    { name: 'Seekers of Divine Mysteries', description: 'STRATEGIC GAMBIT. You can immediately change this operative\'s order and/or it can immediately perform a free Omniscanner, Fall Back, Place Marker, Pick Up Marker, Reposition or free mission action. If it performs the Fall Back or Reposition action and isn\'t carrying a marker, it must end that action either wholly within your drop zone (if not possible, as close as possible to it) or within control of an objective or one of your mission markers.' },
    { name: 'OMNISCANNER (1AP)', description: 'Select one enemy operative visible to or within 8" of this operative to gain one of your Omniscanner tokens. Whenever a friendly BATTLECLADE operative is shooting against, fighting against or retaliating against an enemy operative that has one of your Omniscanner tokens, that friendly operative\'s weapons have the Ceaseless weapon rule. This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'BATTLECLADE, IMPERIUM, ADEPTUS MECHANICUS, TECH-PRIEST, LEADER, TECHNOARCHOLOGIST'
);

card('SERVITOR UNDERSEER', 'Leader',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '9' },
  [
    { name: 'Master-crafted radium pistol', atk: '4', hit: '3+', dmg: '2/4', wr: 'Range 8", Balanced, Rending' },
    { name: 'Dataspikes',                   atk: '3', hit: '5+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'DATACORONAL ACCUMULATOR (1AP)', description: 'Support. Determine the friendly BATTLECLADE operatives within 6" of this operative and/or a friendly BATTLECLADE AUTO-PROXY operative, then roll one D3. If the result is equal to or less than the number of objective markers those friendly operatives contest, you gain 1CP. For the purposes of the Comms Device universal equipment, the operative the distance is being determined from must control your Comms Device marker to add 3" to its distance requirement for this rule. This operative cannot perform this action while within control Range of an enemy operative.' },
    { name: 'NETWORK OVERRIDE (1AP)', description: 'Support. Select one friendly BATTLECLADE SERVITOR operative within 6" of either this operative or a friendly BATTLECLADE AUTO-PROXY operative to immediately NETWORK COUNTERACT (you don\'t have to TRANSFER POWER to do so). Continue this operative\'s activation after doing so. For the purposes of the Comms Device universal equipment, the operative the distance is being determined from must control that marker. This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'BATTLECLADE, IMPERIUM, ADEPTUS MECHANICUS, TECH-PRIEST, SERVITOR UNDERSEER'
);

card('AUTO-PROXY SERVITOR', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Taser goad', atk: '4', hit: '4+', dmg: '3/4', wr: 'Lethal 5+, Shock' },
  ],
  [
    { name: 'Achillan Eye', description: 'Whenever a friendly BATTLECLADE operative is shooting an enemy operative visible to this operative, that friendly operative\'s ranged weapons have the Saturate weapon rule. This rule has no effect if this operative is within control Range of an enemy operative.' },
    { name: 'GAZE OF THE OMNISSIAH (1AP)', description: 'Select one enemy operative visible to this operative. Until the end of the turning point, whenever a friendly BATTLECLADE operative is shooting that enemy operative, you can use this effect. If you do: that friendly operative\'s ranged weapons have the Seek Light weapon rule; that enemy operative cannot be obscured. This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'BATTLECLADE, IMPERIUM, ADEPTUS MECHANICUS, AUTO-PROXY, SERVITOR'
);

card('BREACHER SERVITOR', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Lascutter – Short range',            atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 2", Lethal 5+, Piercing 2' },
    { name: 'Lascutter – Long range',             atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 6", Lethal 5+' },
    { name: 'Hydraulic pincer and lascutter',     atk: '4', hit: '4+', dmg: '4/6', wr: 'Lethal 5+' },
  ],
  [
    { name: 'BREACH (1AP)', description: 'Place one of your Breach markers within this operative\'s control Range as close as possible to a terrain feature within control Range of it. Whenever an operative is within 1" of that marker, it treats parts of that terrain feature that are no more than 1" thick as Accessible terrain. This operative cannot perform this action while within control Range of an enemy operative, or if a terrain feature isn\'t within its control Range.' },
  ],
  'BATTLECLADE, IMPERIUM, ADEPTUS MECHANICUS, BREACHER, SERVITOR'
);

card('COMBAT SERVITOR', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Incendine Igniter',  atk: '4', hit: '2+', dmg: '4/4', wr: 'Range 6", Torrent 1, Saturate' },
    { name: 'Meltagun',           atk: '4', hit: '4+', dmg: '6/3', wr: 'Range 6", Devastating 4, Piercing 2' },
    { name: 'Phosphor blaster',   atk: '4', hit: '4+', dmg: '3/4', wr: 'Blast 1", Severe' },
    { name: 'Servo-claw',         atk: '3', hit: '4+', dmg: '3/4', wr: '–' },
  ],
  [],
  'BATTLECLADE, IMPERIUM, ADEPTUS MECHANICUS, COMBAT, SERVITOR'
);

card('GUN SERVITOR', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '4+', WOUNDS: '11' },
  [
    { name: 'Heavy arc rifle',           atk: '5', hit: '4+', dmg: '4/6', wr: 'Heavy (Dash only), Piercing 1, Stun' },
    { name: 'Heavy bolter – Focused',    atk: '5', hit: '4+', dmg: '4/5', wr: 'Heavy (Dash only), Piercing Crits 1' },
    { name: 'Heavy bolter – Sweeping',   atk: '4', hit: '4+', dmg: '4/5', wr: 'Heavy (Dash only), Piercing Crits 1, Torrent 1' },
    { name: 'Augmetic claw',             atk: '3', hit: '4+', dmg: '4/5', wr: 'Brutal' },
  ],
  [],
  'BATTLECLADE, IMPERIUM, ADEPTUS MECHANICUS, GUN, SERVITOR'
);

card('TECHNOMEDIC SERVITOR', 'Specialist',
  { APL: '2', MOVE: '5"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Servo-chirurgic claw', atk: '4', hit: '4+', dmg: '3/4', wr: 'Rending' },
  ],
  [
    { name: 'Mechanosuture Array', description: 'Once per turning point, when another friendly BATTLECLADE operative would be incapacitated while visible to and within 3" of this operative, you can use this rule, providing neither this nor that operative is within control Range of an enemy operative. If you do, that friendly operative isn\'t incapacitated and has 1 wound remaining and cannot be incapacitated for the remainder of the action. After that action, t. That friendly operative can then immediately perform a free Dash action, but must end that move within this operative\'s control Range. If this rule was used during that friendly operative\'s activation, that activation ends. You cannot use this rule if this operative is incapacitated, or if it\'s a Shoot action and this operative would be a primary or secondary target.' },
    { name: 'EXPEDIENT REPAIR (1AP)', description: 'Select one friendly BATTLECLADE operative within this operative\'s control Range to regain 1D3+3 lost wounds. It cannot be an operative that the Mechanosuture Array rule was used on during this turning point. This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'BATTLECLADE, IMPERIUM, ADEPTUS MECHANICUS, MEDIC, TECHNOMEDIC, SERVITOR'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Battleclade populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
