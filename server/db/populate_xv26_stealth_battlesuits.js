import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'XV26 Stealth Battlesuits'").get()?.id;
if (!FACTION_ID) { console.error('XV26 Stealth Battlesuits faction not found'); process.exit(1); }

// Clear existing XV26 Stealth Battlesuits data
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
  `1 XV26 STEALTH BATTLESUIT SHAS\'VRE with pulse pistol and one of the following options:
• Burst cannon or fusion blaster

1 XV26 STEALTH BATTLESUIT MV75 MARKER DRONE

1 XV26 STEALTH BATTLESUIT MV15 GUN DRONE

4 XV26 STEALTH BATTLESUIT operatives from the following list:
• DESIGNATOR*
• INFILTRATOR*
• LIBERATOR*
• LODESTAR*
• NEUTRALISER*

Other than INFILTRATOR operatives, your kill team can only include each operative on this list once. Your kill team can only include up to two fusion blasters.

* With one of the following options:
• Burst cannon; fists
• Fusion blaster; fists`);

rule('faction_rules', null, 'KAUYON', 0,
  `Whenever a friendly XV26 STEALTH BATTLESUIT operative is shooting an enemy operative, its ranged weapons have the Accurate X weapon rule. X is determined by that enemy operative\'s location.

ENEMY OPERATIVE LOCATION / ACCURATE X:
• Within 3" of your territory: Accurate 1
• Within your territory: Accurate 2
• Within 3" of your drop zone: Accurate 3`);

rule('faction_rules', null, 'STEALTH FIELDS', 0,
  `Whenever a friendly XV26 STEALTH BATTLESUIT operative has a Conceal order, it is not visible to enemy operatives more than 3" of it (taking precedence over all other rules).

Whenever a friendly XV26 STEALTH BATTLESUIT operative has a Conceal order, it can perform the Fall Back action for 1 less AP.`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'PATIENT HUNTERS', 1,
  'Whenever a friendly XV26 STEALTH BATTLESUIT operative is shooting against or fighting against an expended enemy operative, that friendly operative\'s weapons have the Balanced weapon rule and its ranged weapons have the Saturate weapon rule.');

rule('ploy', 'Strategy', 'BONDS OF UNITY', 1,
  `Whenever a friendly XV26 STEALTH BATTLESUIT operative is activated (excluding DRONE), if it\'s visible and within 6" of another friendly XV26 STEALTH BATTLESUIT operative (excluding DRONE), you can ignore any modifiers to that first operative\'s APL stat and select one of the following:
• Ignore any changes to that first operative\'s Move stat from being injured until the end of that activation.
• Ignore any changes to the Hit stat of that first operative\'s weapons from being injured until the end of that activation.`);

rule('ploy', 'Strategy', 'PREPARE AMBUSH', 1,
  `Place one of your Ambush markers wholly within your territory and more than 2" from enemy operatives. Whenever a friendly XV26 STEALTH BATTLESUIT operative is shooting an enemy operative that\'s within 2" of that marker, you can use this rule. If you do, remove that marker and that friendly operative\'s ranged weapons have the Seek weapon rule until the end of the action. In the Ready step of the next Strategy phase, if that marker is still in the killzone, remove that marker.`);

rule('ploy', 'Strategy', 'HOLOWAVE COUNTERMEASURES', 1,
  'Whenever an operative is shooting a friendly XV26 STEALTH BATTLESUIT operative more than 6" from it, in the Roll Attack Dice step the attacker must discard one of their unresolved normal successes (or one of their critical successes if there are none). This isn\'t cumulative with being obscured.');

rule('ploy', 'Firefight', 'VECTORED RETRO-THURSTERS', 1,
  `Use this firefight ploy when an enemy operative ends the Charge action within control range of a friendly XV26 STEALTH BATTLESUIT operative (except DRONE). Interrupt that action to use this rule. If you do, that friendly operative can immediately perform a free Fall Back action, but it cannot move more than 3" during that action. Then, that enemy operative can immediately perform a free Reposition action using any remaining move distance it had from that first Charge action, and can do so even if it\'s performed an action that prevents it from performing the Reposition action.`);

rule('ploy', 'Firefight', 'GHOSTSHROUD', 1,
  'Use this firefight ploy at the end of a friendly XV26 STEALTH BATTLESUIT operative\'s activation, if that operative has an Engage order. Change it to Conceal. You cannot use this ploy for each friendly operative more than once per battle.');

rule('ploy', 'Firefight', 'ENGAGE JET PACK', 1,
  'Use this firefight ploy when a friendly XV26 STEALTH BATTLESUIT operative (excluding DRONE) is activated or counteracts. Until the end of that activation/counteraction, you can ignore the vertical distance they move during one climb and one drop.');

rule('ploy', 'Firefight', 'SAVIOUR PROTOCOLS', 1,
  'Use this firefight ploy whien a friendly XV26 STEALTH BATTLESUIT operative (excluding DRONE) is selected as the valid target of a Shoot action. Select one friendly XV26 STEALTH BATTLESUIT DRONE operative visible to and within 3" of that first friendly operative to become the valid target instead (even if it wouldn\'t normally be valid for this). That friendly DRONE operative is only in cover or obscured if the original target was. This ploy has no effect if the ranged weapon has the Blast or Torrent weapon rule.');

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

rule('equipment', null, 'HARDWIRED TARGET LOCKS', 0,
  'Whenever you would counteract, you can do so with one friendly XV26 STEALTH BATTLESUIT operative that has a Conceal order and is more than 3" from enemy operatives, but before it counteracts, you must change its order to Engage and it cannot perform any actions other than Shoot during that counteraction.');

rule('equipment', null, 'XV26 MULTITRACKERS', 0,
  'Once per turning point, when a friendly XV26 STEALTH BATTLESUIT operative is performing the Shoot action and you select a burst cannon (sweeping), you can use this rule. If you do, until the end of that action, that weapon has the Torrent 2" weapon rule.');

rule('equipment', null, 'COUNTER-NETWORK JAMMERS', 0,
  'Whenever determining control of a marker, treat the total APL stat of enemy operatives that contest it as 1 lower if only one friendly XV26 STEALTH BATTLESUIT operative and only two enemy operatives contest it. That friendly XV26 STEALTH BATTLESUIT operative cannot be a DRONE operative. Note this isn\'t a change to the APL stat, so any changes are cumulative with this.');

rule('equipment', null, 'ADVANCED BLACKSUN FILTERS', 0,
  'Whenever a friendly XV26 STEALTH BATTLESUIT operative is shooting an operative that\'s obscured, you don\'t have to discard one success as a result of that rule. All other effects of obscured apply as normal.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('XV26 SHAS\'VRE', 'Leader',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '13' },
  [
    { name: 'Burst cannon – Focused',        atk: '5', hit: '4+', dmg: '3/4', wr: 'Ceaseless' },
    { name: 'Burst cannon – Sweeping',       atk: '4', hit: '4+', dmg: '3/4', wr: 'Ceaseless, Torrent 1"' },
    { name: 'Fusion blaster – Short range',  atk: '4', hit: '4+', dmg: '6/3', wr: 'Range 6", Devastating 4, Piercing 2' },
    { name: 'Fusion blaster – Long range',   atk: '4', hit: '4+', dmg: '4/5', wr: 'Range 12", Piercing 1' },
    { name: 'Pulse pistol (ranged)',         atk: '4', hit: '4+', dmg: '4/5', wr: 'Range 8"' },
    { name: 'Pulse pistol (point-blank)',    atk: '3', hit: '4+', dmg: '4/5', wr: 'Accurate 1' },
  ],
  [
    { name: 'XV26 Drone Controller', description: 'STRATEGIC GAMBIT whenver this operative is in the killzone. Select one friendly XV26 STEALTH BATTLESUIT DRONE operative in the killzone. Until the end of that operative\'s next activation, ignore the first two bullet points of its Drone rule (this take precedence over that rule).' },
    { name: 'For The Greater Good', description: 'Whenever determining the value of Accurate X for the Kauyon faction rule, if this operative is in the killzone, add 1 to the result if 2 or more friendly XV26 STEALTH BATTLESUIT operatives (excluding DRONE) are incapacitated (to a maximum of Accurate 3). Note that you must have a minimum of Accurate 1 to use this rule.' },
  ],
  'XV26 STEALTH BATTLESUIT, T\'AU EMPIRE, LEADER, SHAS\'VRE'
);

card('XV26 DESIGNATOR', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '12' },
  [
    { name: 'Burst cannon – Focused',        atk: '5', hit: '4+', dmg: '3/4', wr: 'Ceaseless' },
    { name: 'Burst cannon – Sweeping',       atk: '4', hit: '4+', dmg: '3/4', wr: 'Ceaseless, Torrent 1"' },
    { name: 'Fusion blaster – Short range',  atk: '4', hit: '4+', dmg: '6/3', wr: 'Range 6", Devastating 4, Piercing 2' },
    { name: 'Fusion blaster – Long range',   atk: '4', hit: '4+', dmg: '4/5', wr: 'Range 12", Piercing 1' },
    { name: 'Fists',                         atk: '3', hit: '4+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Markerlight', description: 'Whenever an enemy operative is a valid target for this operative or is visible to this operative and within 2" of your Ambush marker (Prepare Ambush strategy ploy), it\'s marked. Whenever a friendly XV26 STEALTH BATTLESUIT operative is shooting an operative that\'s marked, that friendly operative\'s ranged weapons have the Severe weapon rule. Note that an operative can be a valid target for this operative even if this operative isn\'t the active operative.' },
  ],
  'XV26 STEALTH BATTLESUIT, T\'AU EMPIRE, DESIGNATOR'
);

card('XV26 INFILTRATOR', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '12' },
  [
    { name: 'Burst cannon – Focused',        atk: '5', hit: '4+', dmg: '3/4', wr: 'Ceaseless' },
    { name: 'Burst cannon – Sweeping',       atk: '4', hit: '4+', dmg: '3/4', wr: 'Ceaseless, Torrent 1"' },
    { name: 'Fusion blaster – Short range',  atk: '4', hit: '4+', dmg: '6/3', wr: 'Range 6", Devastating 4, Piercing 2' },
    { name: 'Fusion blaster – Long range',   atk: '4', hit: '4+', dmg: '4/5', wr: 'Range 12", Piercing 1' },
    { name: 'Fists',                         atk: '3', hit: '4+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Covert Protocols', description: 'This operative can counteract regardless of its order, but if it has a Conceal order during that counteraction, it cannot perform any actions other than Pick Up Marker, Place Marker or mission actions.' },
  ],
  'XV26 STEALTH BATTLESUIT, T\'AU EMPIRE, INFILTRATOR'
);

card('XV26 LIBERATOR', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '12' },
  [
    { name: 'Burst cannon – Focused',        atk: '5', hit: '4+', dmg: '3/4', wr: 'Ceaseless' },
    { name: 'Burst cannon – Sweeping',       atk: '4', hit: '4+', dmg: '3/4', wr: 'Ceaseless, Torrent 1"' },
    { name: 'EMP bomb',                      atk: '5', hit: '3+', dmg: '2/2', wr: 'Range 4", Blast 2", Devastating 1, Heavy (Reposition only), Lethal 4+, Limited 1, Saturate' },
    { name: 'Fusion blaster – Short range',  atk: '4', hit: '4+', dmg: '6/3', wr: 'Range 6", Devastating 4, Piercing 2' },
    { name: 'Fusion blaster – Long range',   atk: '4', hit: '4+', dmg: '4/5', wr: 'Range 12", Piercing 1' },
    { name: 'Fists',                         atk: '3', hit: '4+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Grenadier', description: 'This operative an use frag, krak, smoke and Stun grenades (see universal equipment). Doing so doesn\'t count towards any Limited uses you have (i.e. you can also select those grenades from equipment for other operatives). Whenever this operative is using frag or krak grenades, improve the Hit stat of that weapon by 1.' },
  ],
  'XV26 STEALTH BATTLESUIT, T\'AU EMPIRE, LIBERATOR'
);

card('XV26 LODESTAR', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '12' },
  [
    { name: 'Burst cannon – Focused',        atk: '5', hit: '4+', dmg: '3/4', wr: 'Ceaseless' },
    { name: 'Burst cannon – Sweeping',       atk: '4', hit: '4+', dmg: '3/4', wr: 'Ceaseless, Torrent 1"' },
    { name: 'Fusion blaster – Short range',  atk: '4', hit: '4+', dmg: '6/3', wr: 'Range 6", Devastating 4, Piercing 2' },
    { name: 'Fusion blaster – Long range',   atk: '4', hit: '4+', dmg: '4/5', wr: 'Range 12", Piercing 1' },
    { name: 'Fists',                         atk: '3', hit: '4+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Electrochaff Launcher', description: 'Once per turning point, when an enemy operative is performing the shoot action and your opponent selects a valid target (excluding DRONE) you can use this rule, providing this operative isn\'t within control Range of enemy operatives. If you do, until the end of that action, whenever an enemy operative is shooting a friendly XV26 STEALTH BATTLESUIT operative that\'s both visible to and within 3" of this operative and more than 2" from that enemy operative:\n• Ignore the Piercing weapon rule.\n• That friendly operative is obscured.' },
    { name: 'Homing Beacon', description: 'This operative is carrying your Homing Beacon marker. Operatives (excluding DRONE) can perform the Pick Up Marker action on that marker. The first time an enemy operative performs the Pick Up Marker action on your Homing Beacon marker, discard that marker (remove it from the battle).\n\nIn the Ready step of each Strategy phase, when you gain CP, if your Homing Beacon marker is in the killzone. roll one D6 if it\'s more than 6" from your drop zone; roll two D6 instead if it\'s within your territory; roll three D6 insteadif it\'s within 6" of your opponent\'s drop zone. If any result is 4+, you gain one additional CP.' },
  ],
  'XV26 STEALTH BATTLESUIT, T\'AU EMPIRE, LODESTAR'
);

card('XV26 NEUTRALISER', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '12' },
  [
    { name: 'Burst cannon – Focused',        atk: '5', hit: '4+', dmg: '3/4', wr: 'Ceaseless' },
    { name: 'Burst cannon – Sweeping',       atk: '4', hit: '4+', dmg: '3/4', wr: 'Ceaseless, Torrent 1"' },
    { name: 'Fusion blaster – Short range',  atk: '4', hit: '4+', dmg: '6/3', wr: 'Range 6", Devastating 4, Piercing 2' },
    { name: 'Fusion blaster – Long range',   atk: '4', hit: '4+', dmg: '4/5', wr: 'Range 12", Piercing 1' },
    { name: 'Fists',                         atk: '3', hit: '4+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Multispectrum Sensor Package', description: 'SUPPORT. Once per turning point, when an enemy operative visible to and within 8" of this operative is activated, you can use this rule. If you do, each friendly XV26 STEALTH BATTLESUIT operative within 3" of this operative can immediately do one of the following:\n• Perform a free Dash action (in an order of your choice).\n• Change its order.\n\nEach friendly operative that performs the Dash action cannot end that move within 3" of an enemy operative. Note that a Comms Device from universal equipment only affects the second distance of this rule.' },
    { name: 'SYSTEM JAM (1/2AP)', description: 'Select one enemy operative visible to this operative. Until the end of that operative\'s next activation, subtract 1 from its APL stat. Whenever this operative has a Conceal order, you must spend 1 additional AP to perform this action.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'XV26 STEALTH BATTLESUIT, T\'AU EMPIRE, NEUTRALISER'
);

card('MV75 MARKER DRONE', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Ram', atk: '3', hit: '5+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Drone', description: '• This operative cannot perform any actions other than Charge, Dash, Fall Back, Fight, Reposition and Shoot.\n• Whenever etermining control of an objective marker, treat this operative\'s APL stat as 1 lower. Not that this isn\'t a change to its APL stat, so any changes are cumulative with this.\n• This operative cannot use any weapons that aren\'t on its datacard.\n• Whenever determining what\'s visible to this operative, the round disc at the top of the miniature is its head.\n• This operative is ignored for your opponent\'s kill/elimination op (when it\'s incapacitated, and when determining your starting number of operatives). It\'s also ignored for victory conditions and scoring VPs if either require operatives to \'escape\', \'survive\' or be incapacitated by enemy operatives (if it escapes/survives/ is incapacitated, determining how many operatives must escape/survive/be incapacitated, etc.).' },
    { name: 'Markerlight', description: 'Whenever an enemy operative is a valid target for this operative or is visible to this operative and within 2" of your Ambush marker (Prepare Ambush strategy ploy), it\'s marked. Whenever a friendly XV26 STEALTH BATTLESUIT operative is shooting an operative that\'s marked, that friendly operative\'s ranged weapons have the Severe weapon rule. Note that an operative can be a valid target for this operative even if this operative isn\'t the active operative.' },
  ],
  'XV26 STEALTH BATTLESUIT, T\'AU EMPIRE, MV75 MARKER, DRONE'
);

card('MV15 GUN DRONE', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Twin pulse carbine', atk: '4', hit: '4+', dmg: '4/5', wr: 'Ceaseless' },
    { name: 'Ram',                atk: '3', hit: '5+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Drone', description: '• This operative cannot perform any actions other than Charge, Dash, Fall Back, Fight, Reposition and Shoot.\n• Whenever etermining control of an objective marker, treat this operative\'s APL stat as 1 lower. Not that this isn\'t a change to its APL stat, so any changes are cumulative with this.\n• This operative cannot use any weapons that aren\'t on its datacard.\n• Whenever determining what\'s visible to this operative, the round disc at the top of the miniature is its head.\n• This operative is ignored for your opponent\'s kill/elimination op (when it\'s incapacitated, and when determining your starting number of operatives). It\'s also ignored for victory conditions and scoring VPs if either require operatives to \'escape\', \'survive\' or be incapacitated by enemy operatives (if it escapes/survives/ is incapacitated, determining how many operatives must escape/survive/be incapacitated, etc.).' },
    { name: 'PHOTON GRENADE LAUNCHER (1AP)', description: 'Select one enemy operative visible to this operative and roll one D6: on a 3+, until the end of that operative\'s next acctivation, subtract 2" from its Move stat.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'XV26 STEALTH BATTLESUIT, T\'AU EMPIRE, MV15 GUN, DRONE'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ XV26 Stealth Battlesuits populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
