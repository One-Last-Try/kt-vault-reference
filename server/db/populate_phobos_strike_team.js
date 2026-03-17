import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Phobos Strike Team'").get()?.id;
if (!FACTION_ID) { console.error('Phobos Strike Team faction not found'); process.exit(1); }

// Clear existing Phobos Strike Team data
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
  `1 PHOBOS STRIKE TEAM operative selected from the following list:
• INFILTRATOR SERGEANT
• INCURSOR SERGEANT
• REIVER SERGEANT with one of the following options:
  - Special issue bolt pistol; combat knife
  - Bolt carbine; fists

5 PHOBOS STRIKE TEAM operatives selected from the following list:
• INFILTRATOR COMMSMAN
• INFILTRATOR HELIX ADEPT
• INFILTRATOR SABOTEUR
• INFILTRATOR VETERAN
• INFILTRATOR VOXBREAKER
• INFILTRATOR WARRIOR
• INCURSOR MARKSMAN
• INCURSOR MINELAYER
• INCURSOR WARRIOR
• REIVER WARRIOR with one of the following options:
  - Special issue bolt pistol; combat knife
  - Bolt carbine; fists

Other than WARRIOR operatives, your kill team can only include each operative on this list once.`);

rule('faction_rules', null, 'ASTARTES', 0,
  `During each friendly PHOBOS STRIKE TEAM operative\'s activation, it can perform either two Shoot actions or two Fight actions. If it\'s two Shoot actions, a bolt weapon must be selected for at least one of them. A bolt weapon is any ranged weapon that includes \'bolt\' in its name, e.g. marksman bolt carbine, special issue bolt pistol, etc.

Each friendly PHOBOS STRIKE TEAM operative can counteract regardless of its order.`);

rule('faction_rules', null, 'TERROR', 0,
  `Whenever an enemy operative is within 3" of friendly REIVER operatives, your opponent must spend 1 additional AP for that enemy operative to perform the Pick Up Marker and mission actions.

Whenever determining control of a marker, treat the total APL stat of enemy operatives that contest it as 1 lower if at least one of those enemy operatives is within 3" of friendly REIVER operatives. Note this isn\'t a change to the APL stat, so any changes are cumulative with this.`);

rule('faction_rules', null, 'OMNI-SCRAMBLER', 0,
  `STRATEGIC GAMBIT if a friendly INFILTRATOR operative is in the killzone. Select one enemy operative visible to a friendly INFILTRATOR operative, or within 6" of a friendly VOXBREAKER operative. In the following Firefight phase, that enemy operative cannot be activated or perform actions until one of the following is true:

• Your opponent has activated a number of enemy operatives equal to the number of friendly INFILTRATOR operatives in the killzone when this STRATEGIC GAMBIT was used.
• It\'s the last enemy operative to be activated.`);

rule('faction_rules', null, 'MULTI-SPECTRUM ARRAY', 0,
  'Whenever a friendly INCURSOR operative is shooting, enemy operatives cannot be obscured.');

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'AND THEY SHALL KNOW NO FEAR', 1,
  'You can ignore any changes to the stats of friendly PHOBOS STRIKE TEAM operatives from being injured (including their weapons\' stats).');

rule('ploy', 'Strategy', 'DEADLY SHOTS', 1,
  'Whenever a friendly PHOBOS STRIKE TEAM operative is shooting during an activation in which it hasn\'t performed the Charge, Fall Back or Reposition action, or against an operative that isn\'t in cover and is more than 6" from it, or against an operative that isn\'t in cover, that friendly operative\'s ranged weapons have the Balanced weapon rule. Note that for the first requirement, that operative isn\'t restricted from performing those actions after shooting.');

rule('ploy', 'Strategy', 'LETHAL ASSAULTS', 1,
  'Whenever a friendly PHOBOS STRIKE TEAM operative is fighting, its melee weapons have the Balanced weapon rule. If that friendly operative is doing so during an activation in which it performed the Charge action, its melee weapons also have the Lethal 5+ weapon rule.');

rule('ploy', 'Strategy', 'GUERRILLA WARFARE', 1,
  `Friendly PHOBOS STRIKE TEAM operatives can perform the following unique action:

GUERRILLA WARFARE 1APL

Change this operative\'s order.

An operative cannot perform this action while within control range of an enemy operative.`);

rule('ploy', 'Firefight', 'PATIENT AMBUSH', 1,
  'Use this firefight ploy when it\'s your turn to activate a friendly operative. You can skip that activation.');

rule('ploy', 'Firefight', 'CRITICAL SHOT', 1,
  'Use this firefight ploy when you resolve a critical success for a friendly PHOBOS STRIKE TEAM operative that\'s shooting with a bolt weapon. Inflict D3 additional damage.');

rule('ploy', 'Firefight', 'STEALTH ASSAULT', 1,
  'Use this firefight ploy when a friendly PHOBOS STRIKE TEAM operative that has a Conceal order is activated, is given an Engage order, performs the Charge and then the Fight action, and you\'re resolving your first attack dice from this activation. After doing so, you can immediately resolve another of your attack dice (before your opponent). The operative cannot have performed any other actions during this activation (but can do so after resolving this ploy).');

rule('ploy', 'Firefight', 'TRANSHUMAN PHYSIOLOGY', 1,
  'Use this firefight ploy when an operative is shooting a friendly PHOBOS STRIKE TEAM operative, in the Roll Defence Dice step. You can retain one of your normal successes as a critical success instead.');

// ── TACOPS ───────────────────────────────────────────────────────────────────

rule('tac_op', 'INFILTRATION', 'TRACK ENEMY', 0,
  `Archetype: INFILTRATION

REVEAL: The first time you score VP from this op.

ADDITIONAL RULES: An enemy operative is being tracked if it\'s a valid target for a friendly operative within 6" of it. That friendly operative must have a Conceal order, cannot be a valid target for the enemy operative it\'s attempting to track, and cannot be within control range of enemy operatives.

VICTORY POINTS: At the end of each turning point after the first:
• If one enemy operative is being tracked, you score 1VP, or 2VP instead if it\'s the fourth turning point.
• If two or more enemy operatives are being tracked, you score 2VP.

You cannot score more than 2VP from this op per turning point.`);

rule('tac_op', 'INFILTRATION', 'PLANT DEVICES', 0,
  `Archetype: INFILTRATION

REVEAL: The first time a friendly operative performs the Plant Device action.

MISSION ACTION – PLANT DEVICE (1 APL): One objective marker the active operative controls gains one of your Device tokens.

An operative cannot perform this action during the first turning point, while within control range of an enemy operative, or if that objective marker already has one of your Device tokens.

VICTORY POINTS: At the end of each turning point after the first:
• If your opponent\'s objective marker has one of your Device tokens, you score 1VP.
• For each other objective marker enemy operatives contest that has one of your Device tokens, you score 1VP.

You cannot score more than 2VP from this op per turning point.`);

rule('tac_op', 'INFILTRATION', 'STEAL INTELLIGENCE', 0,
  `Archetype: INFILTRATION

REVEAL: The first time an enemy operative is incapacitated.

ADDITIONAL RULES: Whenever an enemy operative is incapacitated, before it\'s removed from the killzone, place one of your Intelligence mission markers within its control range.

Friendly operatives can perform the Pick Up Marker action on your Intelligence mission markers, and for the purposes of that action\'s conditions, ignore the first Intelligence mission marker the active operative is carrying. In other words, each friendly operative can carry up to two Intelligence mission markers, or one and one other marker.

VICTORY POINTS: At the end of each turning point after the first, if any friendly operatives are carrying any of your Intelligence mission markers, you score 1VP.

At the end of the battle, for each of your Intelligence mission markers friendly operatives are carrying, you score 1VP.`);

rule('tac_op', 'RECON', 'FLANK', 0,
  `Archetype: RECON

REVEAL: As a STRATEGIC GAMBIT.

ADDITIONAL RULES: Divide the killzone into two flanks (left and right) by drawing an imaginary line that\'s just like the centreline, except it runs from the centre of each player\'s killzone edge. An operative contests a flank while both wholly within it and wholly within their opponent\'s territory. Friendly operatives control a flank if the total APL stat of those contesting it is greater than that of enemy operatives.

VICTORY POINTS: After you reveal this op, at the end of each turning point after the first, for each flank friendly operatives control, you score 1VP. In the fourth turning point, if friendly operatives also controlled that flank at the end of the third turning point (excluding the first), you score 2VP instead. You cannot score more than 2VP from this op per turning point.`);

rule('tac_op', 'RECON', 'RETRIEVAL', 0,
  `Archetype: RECON

REVEAL: The first time you score VP from this op.

MISSION ACTION – RETRIEVE (1 APL): If the active operative controls an objective marker that hasn\'t been searched by friendly operatives, that operative is now carrying one of your Retrieval mission markers and that objective marker has been searched by friendly operatives. Friendly operatives can perform the Pick Up Marker action on your Retrieval mission markers.

An operative cannot perform this action during the first turning point, or while within control range of an enemy operative, or if it\'s already carrying a marker.

VICTORY POINTS: The first time each objective marker is searched by friendly operatives, you score 1VP. At the end of the battle, for each of your Retrieval mission markers friendly operatives are carrying, you score 1VP.`);

rule('tac_op', 'RECON', 'SCOUT ENEMY MOVEMENT', 0,
  `Archetype: RECON

REVEAL: The first time a friendly operative performs the Scout action.

MISSION ACTION – SCOUT (1 APL): Select one ready enemy operative visible to and more than 6" from the active operative. That enemy operative is now monitored until the Ready step of the next Strategy phase.

An operative cannot perform this action while it has an Engage order, during the first turning point, or while within control range of an enemy operative.

VICTORY POINTS: At the end of each turning point after the first, for each monitored enemy operative that\'s visible to friendly operatives, you score 1VP. Note that it doesn\'t have to be a friendly operative that performed the Scout action. You cannot score more than 2VP from this op per turning point.`);

// ── EQUIPMENT ────────────────────────────────────────────────────────────────

rule('equipment', null, 'PURITY SEALS', 0,
  'Once per turning point, when a friendly PHOBOS STRIKE TEAM operative is shooting, fighting or retaliating, if you roll two or more fails, you can discard one of them to retain another as a normal success instead.');

rule('equipment', null, 'COMBAT BLADES', 0,
  `Friendly PHOBOS STRIKE TEAM operatives have the following melee weapon:

Combat Blade – ATK: 5, HIT: 3+, DMG: 3/4`);

rule('equipment', null, 'ADDITIONAL UTILITY GRENADES', 0,
  'This equipment allows you to select four utility grenades from the utility grenades equipment (see universal equipment). You cannot also select that equipment as normal (i.e. to give you six).');

rule('equipment', null, 'SPECIAL ISSUE AMMUNITION', 0,
  'Once per turning point, when a friendly PHOBOS STRIKE TEAM operative is performing the Shoot action and you select a bolt carbine, marksman bolt carbine or occulus bolt carbine, you can use this rule. If you do, until the end of the turning point, that weapon has the Piercing 1 weapon rule.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('INFILTRATOR SERGEANT', 'Leader',
  { APL: '3', MOVE: '7"', SAVE: '3+', WOUNDS: '13' },
  [
    { name: 'Marksman bolt carbine', atk: '4', hit: '3+', dmg: '3/4', wr: 'Lethal 5+' },
    { name: 'Fists',                 atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Tactical Advantage', description: 'You can do each of the following once per battle: When rolling-off to decide initiative, if this operative is in the killzone, you can re-roll your dice. You can use a firefight ploy for 0CP if this is the specified PHOBOS STRIKE TEAM operative (including Command Re-roll if the attack or defence dice was rolled for this operative), or the Patient Ambush firefight ploy for 0CP if this operative is ready and not within control Range of enemy operatives.' },
  ],
  'PHOBOS STRIKE TEAM, IMPERIUM, ADEPTUS ASTARTES, LEADER, INFILTRATOR, SERGEANT'
);

card('INCURSOR SERGEANT', 'Leader',
  { APL: '3', MOVE: '7"', SAVE: '3+', WOUNDS: '13' },
  [
    { name: 'Occulus bolt carbine', atk: '4', hit: '3+', dmg: '3/4', wr: 'Saturate' },
    { name: 'Fists',                atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Tactical Advantage', description: 'You can do each of the following once per battle: When rolling-off to decide initiative, if this operative is in the killzone, you can re-roll your D6. You can use a firefight ploy for 0CP if this is the specified PHOBOS STRIKE TEAM operative (including Command Re-roll if the attack or defence dice was rolled for this operative), or the Patient Ambush firefight ploy for 0CP if this operative is ready and not within control Range of enemy operatives.' },
  ],
  'PHOBOS STRIKE TEAM, IMPERIUM, ADEPTUS ASTARTES, LEADER, INCURSOR, SERGEANT'
);

card('REIVER SERGEANT', 'Leader',
  { APL: '3', MOVE: '7"', SAVE: '3+', WOUNDS: '13' },
  [
    { name: 'Bolt carbine',            atk: '4', hit: '3+', dmg: '3/4', wr: 'Accurate 1' },
    { name: 'Special issue bolt pistol', atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Piercing 1' },
    { name: 'Combat Knife',            atk: '5', hit: '3+', dmg: '4/5', wr: '–' },
    { name: 'Fists',                   atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Tactical Advantage', description: 'You can do each of the following once per battle: When rolling-off to decide initiative, if this operative is in the killzone, you can re-roll your D6. You can use a firefight ploy for 0CP if this is the specified PHOBOS STRIKE TEAM operative (including Command Re-roll if the attack or defence dice was rolled for this operative), or the Patient Ambush firefight ploy for 0CP if this operative is ready and not within control Range of enemy operatives.' },
    { name: 'Grav-chute and Grapnel Launcher', description: 'Whenever this operative is climbing up, you can treat the vertical distance as 2" (regardless of how far the operative actually moves vertically). Whenever this operative is dropping, ignore the vertical distance.' },
  ],
  'PHOBOS STRIKE TEAM, IMPERIUM, ADEPTUS ASTARTES, LEADER, REIVER, SERGEANT'
);

card('INFILTRATOR COMMSMAN', 'Warrior',
  { APL: '3', MOVE: '7"', SAVE: '3+', WOUNDS: '12' },
  [
    { name: 'Marksman bolt carbine', atk: '4', hit: '3+', dmg: '3/4', wr: 'Lethal 5+' },
    { name: 'Fists',                 atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Strategic Oversight', description: 'In the Ready step of each Strategy phase, when you gain CP, if this operative is in the killzone and not within control Range of enemy operatives, you can use this rule. If you do, roll one D6: on a 4+, you gain one additional CP.' },
    { name: 'Comms Array', description: 'Once per turning point, during a friendly PHOBOS STRIKE TEAM operative\'s activation or counteraction, before or after it performs an action, if this operative is in the killzone, you can change one strategy ploy you\'ve used this turning point (it doesn\'t cost you any CP to do so).' },
  ],
  'PHOBOS STRIKE TEAM, IMPERIUM, ADEPTUS ASTARTES, INFILTRATOR, COMMSMAN'
);

card('INFILTRATOR HELIX ADEPT', 'Warrior',
  { APL: '3', MOVE: '7"', SAVE: '3+', WOUNDS: '12' },
  [
    { name: 'Marksman bolt carbine', atk: '4', hit: '3+', dmg: '3/4', wr: 'Lethal 5+' },
    { name: 'Fists',                 atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Medic!', description: 'The first time during each turning point that another friendly PHOBOS STRIKE TEAM operative would be incapacitated while visible to and within 3" of this operative, you can use this rule, providing neither this nor that operative is within control Range of an enemy operative. If you do, that friendly operative isn\'t incapacitated and has D3 wound remaining and cannot be incapacitated for the remainder of the action. After that action, that friendly operative can then immediately perform a free Dash action, but must end that move within this operative\'s control Range. Subtract 1 from this and that operative\'s APL stats until the end of their next activations respectively, and if this rule was used during that friendly operative\'s activation, that activation ends. You cannot use this rule if this operative is incapacitated, or if it\'s a Shoot action and this operative would be a primary or secondary target.' },
    { name: 'HELIX GAUNTLET (1AP)', description: 'Select one friendly PHOBOS STRIKE TEAM operative within this operative\'s control Range to regain up to D3+3 lost wounds. It cannot be an operative that the Medic! rule was used on during this turning point.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'PHOBOS STRIKE TEAM, IMPERIUM, ADEPTUS ASTARTES, PRIMARIS, INFILTRATOR, HELIX ADEPT'
);

card('INFILTRATOR SABOTEUR', 'Warrior',
  { APL: '3', MOVE: '7"', SAVE: '3+', WOUNDS: '12' },
  [
    { name: 'Marksman bolt carbine', atk: '4', hit: '3+', dmg: '3/4', wr: 'Lethal 5+' },
    { name: 'Remote detonator',      atk: '4', hit: '2+', dmg: '5/6', wr: 'Heavy (Dash only), Limited 1, Piercing 1, Silent, Detonate*' },
    { name: 'Fists',                 atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Plant Explosives', description: 'This operative is carrying your Explosives marker. It can perform the Pick Up Marker action on that marker, and whenever it performs the Place Marker action on that marker, it can immediately perform a free Dash action.' },
    { name: '*Detonate', description: 'Don\'t select a valid target. Instead, shoot against each operative within 2" of your Explosives marker, unless Heavy terrain is wholly intervening between that operative and that marker. Each of those operatives cannot be in cover or obscured. Roll each sequence separately in an order of your choice. This weapon cannot be selected if your Explosives marker isn\'t in the killzone. At the end of the action, remove your Explosives marker from the killzone. In a killzone that uses the close quarters rules (e.g. Killzone: Tomb World), this weapon has the Lethal 5+ weapon rule.' },
  ],
  'PHOBOS STRIKE TEAM, IMPERIUM, ADEPTUS ASTARTES, INFILTRATOR, SABOTEUR'
);

card('INFILTRATOR VETERAN', 'Warrior',
  { APL: '3', MOVE: '7"', SAVE: '3+', WOUNDS: '12' },
  [
    { name: 'Custom bolt carbine', atk: '4', hit: '3+', dmg: '3/4', wr: 'Custom*' },
    { name: 'Fists',               atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: '*Custom', description: 'At the end of the Select Operatives step, if this operative is selected for deployment, select up to two of the following weapon rules for this weapon to have for the battle: Balanced, Lethal 5+, Piercing Crits 1, Rending, Saturate.' },
  ],
  'PHOBOS STRIKE TEAM, IMPERIUM, ADEPTUS ASTARTES, INFILTRATOR, VETERAN'
);

card('INFILTRATOR VOXBREAKER', 'Warrior',
  { APL: '3', MOVE: '7"', SAVE: '3+', WOUNDS: '12' },
  [
    { name: 'Marksman bolt carbine', atk: '4', hit: '3+', dmg: '3/4', wr: 'Lethal 5+' },
    { name: 'Fists',                 atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Voxbreak', description: 'Whenever an enemy operative is within 6" of this operative, your opponent cannot re-roll their attack or defence dice for that operative.' },
    { name: 'AUSPEX SCAN (1AP)', description: 'Until the start of this operative\'s next activation or until it\'s incapacitated (whichever comes first), whenever a friendly PHOBOS STRIKE TEAM operative is shooting an enemy operative within 8" of this operative, that enemy operative cannot be obscured; if that friendly operative is an INCURSOR, its ranged weapons also have the Seek Light weapon rule.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'PHOBOS STRIKE TEAM, IMPERIUM, ADEPTUS ASTARTES, INFILTRATOR, VOXBREAKER'
);

card('INFILTRATOR WARRIOR', 'Warrior',
  { APL: '3', MOVE: '7"', SAVE: '3+', WOUNDS: '12' },
  [
    { name: 'Marksman bolt carbine', atk: '4', hit: '3+', dmg: '3/4', wr: 'Lethal 5+' },
    { name: 'Fists',                 atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Vanguard', description: 'Once per turning point, one friendly PHOBOS STRIKE TEAM operative with this rule can perform the Pick Up Marker or a mission action for 1 less AP.' },
  ],
  'PHOBOS STRIKE TEAM, IMPERIUM, ADEPTUS ASTARTES, INFILTRATOR, WARRIOR'
);

card('INCURSOR MARKSMAN', 'Warrior',
  { APL: '3', MOVE: '7"', SAVE: '3+', WOUNDS: '12' },
  [
    { name: 'Stalker marksman bolt carbine', atk: '4', hit: '2+', dmg: '3/4', wr: 'Lethal 5+, Piercing 1' },
    { name: 'Fists',                         atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Track Target', description: 'This operative can perform the Guard action (see close quarters rules, Kill Team Core Book) in any killzone. It can perform the Guard action while it has a Conceal order, but when you perform the free Shoot or Fight action during the interruption, you must change its order to Engage.' },
  ],
  'PHOBOS STRIKE TEAM, IMPERIUM, ADEPTUS ASTARTES, INCURSOR, MARKSMAN'
);

card('INCURSOR MINELAYER', 'Warrior',
  { APL: '3', MOVE: '7"', SAVE: '3+', WOUNDS: '12' },
  [
    { name: 'Occulus bolt carbine', atk: '4', hit: '3+', dmg: '3/4', wr: 'Saturate' },
    { name: 'Fists',                atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Haywire Mine', description: 'This operative is carrying your Haywire Mine marker. It can perform the Pick Up Marker action on that marker, but that marker cannot be placed within an enemy operative\'s control Range (if this operative is incapacitated while carrying that marker and that marker cannot be placed, it\'s removed with this operative).' },
    { name: 'Proximity Mine', description: 'The first time your Haywire Mine marker is within another operative\'s control Range, remove that marker, subtract 1 from that operative\'s APL stat until the end of its next activation, and inflict 2D3+3 damage on it; if it isn\'t incapacitated, end its action (if any), even if that action\'s effects aren\'t fulfilled. If it cannot be placed, move it the minimum amount to do so. Note that this operative is ignored for these effects (i.e. it cannot set it off or take damage from that marker).' },
  ],
  'PHOBOS STRIKE TEAM, IMPERIUM, ADEPTUS ASTARTES, INCURSOR, MINELAYER'
);

card('INCURSOR WARRIOR', 'Warrior',
  { APL: '3', MOVE: '7"', SAVE: '3+', WOUNDS: '12' },
  [
    { name: 'Occulus bolt carbine', atk: '4', hit: '3+', dmg: '3/4', wr: 'Saturate' },
    { name: 'Fists',                atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Vanguard', description: 'Once per turning point, one friendly PHOBOS STRIKE TEAM operative with this rule can perform the Pick Up Marker or a mission action for 1 less AP.' },
  ],
  'PHOBOS STRIKE TEAM, IMPERIUM, ADEPTUS ASTARTES, INCURSOR, WARRIOR'
);

card('REIVER WARRIOR', 'Warrior',
  { APL: '3', MOVE: '7"', SAVE: '3+', WOUNDS: '12' },
  [
    { name: 'Bolt carbine',              atk: '4', hit: '3+', dmg: '3/4', wr: 'Accurate 1' },
    { name: 'Special issue bolt pistol', atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Piercing 1' },
    { name: 'Combat Knife',              atk: '5', hit: '3+', dmg: '4/5', wr: '–' },
    { name: 'Fists',                     atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Vanguard', description: 'Once per turning point, one friendly PHOBOS STRIKE TEAM operative with this rule can perform the Pick Up Marker or a mission action for 1 less AP.' },
    { name: 'Grav-chute and Grapnel Launcher', description: 'Whenever this operative is climbing up, you can treat the vertical distance as 2" (regardless of how far the operative actually moves vertically). Whenever this operative is dropping, ignore the vertical distance.' },
  ],
  'PHOBOS STRIKE TEAM, IMPERIUM, ADEPTUS ASTARTES, PRIMARIS, REIVER, WARRIOR'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Phobos Strike Team populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
