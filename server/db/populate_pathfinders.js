import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Pathfinders'").get()?.id;
if (!FACTION_ID) { console.error('Pathfinders faction not found'); process.exit(1); }

// Clear existing Pathfinders data
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
  'Archetypes: RECON, INFILTRATION');

rule('faction_rules', null, 'OPERATIVES', 0,
  `1 PATHFINDER® SHAS'UI operative

11 PATHFINDER® operatives selected from the following list:
• ASSAULT GRENADIER
• BLOODED
• COMMS SPECIALIST
• DRONE CONTROLLER
• MARKSMAN
• MEDICAL TECHNICIAN
• SHAS'LA
• TRANSPECTRAL INTERFERENCE
• MB3 RECON DRONE (counts as two selections)
• MV31 PULSE ACCELERATOR DRONE
• MV33 GRAV-INHIBITOR DRONE
• MV1 GUN DRONE
• MV4 SHIELD DRONE
• MV7 MARKER DRONE
• WEAPONS EXPERT with one of the following options:
  - Ion rifle; gun butt
  - Rail rifle; gun butt

Other than SHAS'LA and WEAPONS EXPERT operatives, your kill team can only include each operative on this list once. Your kill team can only include up to two WEAPONS EXPERT operatives.`);

rule('faction_rules', null, 'PULSE WEAPONS', 0,
  `Some PATHFINDER® rules refer to a "pulse weapon". The following weapons are pulse weapons: burst cannon, pulse carbine, suppressed pulse carbine, twin pulse carbine.`);

rule('faction_rules', null, 'MARKERLIGHTS', 0,
  `Some PATHFINDER operatives (indicated on their datacard) can perform the Markerlight unique action:

MARKERLIGHT (1AP): Select one enemy operative visible to this operative. That enemy operative gains one of your Markerlight tokens (to a maximum of four).

An operative cannot perform this action while within control range of an enemy operative. If an operative (excluding MB3 RECON) would perform the Shoot action (excluding Guard) and this action during the same activation, only the target of that Shoot action can be selected for this action (and vice versa).

Once during each of their activations, whenever an enemy operative that has any of your Markerlight tokens performs the Dash, Charge, Fall Back or Reposition action, remove one of those tokens. While only some PATHFINDER operatives can perform the Markerlight action, all PATHFINDER operatives can benefit from its effects. Whenever a friendly PATHFINDER operative is shooting with a weapon from its datacard (excluding ASSAULT GRENADIER\'S fusion grenade), it has additional rules determined by the number of your Markerlight tokens the target has. These are cumulative, so if an enemy operative has two of your Markerlight tokens, the friendly operative shooting it has the rules for 1 and 2 tokens during that sequence.

MARKERLIGHT TOKENS — ADDITIONAL RULES
1: Saturate and balanced weapon rules.
2: Balanced weapon rule. Improve the Hit stat of that friendly operative\'s ranged weapons by 1 (to a maximum of 3+).
3: The target cannot be obscured.
4: Seek Light weapon rule.`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'RECON SWEEP', 1,
  `Select one killzone edge (excluding your own). Each friendly PATHFINDER operative that\'s wholly within 6" of that edge can immediately perform a free Dash action in an order of your choice, but each that does so must end that move wholly within 6" of a killzone edge (excluding your own). You cannot use this ploy during the first turning point.`);

rule('ploy', 'Strategy', 'SUPPRESSING FIRE', 1,
  `Whenever an enemy operative is performing the Shoot action, if the target (the primary target if the weapon has the Blast or Torrent weapon rules) isn\'t the closest valid target, your opponent cannot re-roll their attack dice. Ignore friendly PATHFINDER operatives that have a Conceal order or are obscured when determining this.`);

rule('ploy', 'Strategy', 'BONDED', 1,
  `Whenever a friendly PATHFINDER operative (excluding DRONE) is shooting or retaliating with a ranged weapon (see Point-Blank Fusillade firefight ploy), if it\'s within 3" of another friendly PATHFINDER operative (excluding DRONE), that first friendly operative\'s ranged weapons have the Accurate 1 weapon rule.`);

rule('ploy', 'Strategy', 'TAKE COVER', 1,
  `Whenever an operative is shooting a friendly PATHFINDER operative, if you can retain any cover saves, improve that friendly operative\'s Save stat by 1.`);

rule('ploy', 'Firefight', 'A WORTHY CAUSE', 1,
  `Use this firefight ploy at the start of the Firefight phase. One friendly PATHFINDER operative (excluding DRONE) can immediately perform a free mission action.`);

rule('ploy', 'Firefight', 'SUPPORTING FIRE', 1,
  `Use this firefight ploy when a friendly PATHFINDER operative is performing the Shoot action and you\'re selecting a valid target within 6" of it. Having other friendly PATHFINDER operatives within an enemy operative\'s control range doesn\'t prevent that enemy operative from being selected.`);

rule('ploy', 'Firefight', 'SAVIOUR PROTOCOLS', 1,
  `Use this firefight ploy when a friendly PATHFINDER operative (excluding DRONE) is selected as the valid target of a Shoot action. Select one friendly PATHFINDER DRONE operative visible to and within 3" of that first friendly operative to become the valid target instead (even if it wouldn\'t normally be valid for this). That friendly DRONE operative is only in cover or obscured if the original target was. This ploy has no effect if the ranged weapon has the Blast or Torrent weapon rule.`);

rule('ploy', 'Firefight', 'POINT-BLANK FUSILLADE', 1,
  `Use this firefight ploy when a friendly PATHFINDER operative (excluding DRONE) is retaliating, if it wasn\'t within control range of enemy operatives at the start of that activation/counteraction. You can use one of its ranged weapons as a melee weapon (excluding a weapon that has the word \'grenade\' in its name) during that sequence. If you do, you cannot block during that sequence, and the following weapon rules have no effect on its weapons until the end of that sequence: Devastating, Piercing, Torrent. If that friendly operative is ready, has an Engage order and is retaliating with a pulse weapon, you resolve the first attack dice (i.e. defender instead of attacker).`);

// ── TAC OPS ──────────────────────────────────────────────────────────────────

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

rule('equipment', null, 'TARGET ANALYSIS OPTIC', 0,
  `Once per turning point, when a friendly PATHFINDER operative (excluding DRONE) is performing the Shoot action and you\'re selecting a valid target, you can use this rule. If you do, until the end of that action, if the target has at least one of your Markerlight tokens, it\'s treated as having one more. If the ranged weapon has the Blast or Torrent weapon rule, only the primary target is affected.`);

rule('equipment', null, 'HIGH INTENSITY MARKERLIGHT', 0,
  `Up to twice per turning point, when a friendly PATHFINDER operative (excluding MV7 MARKER DRONE) performs the Markerlight action, you can use this rule. If you do, the enemy operative you select gains two of your Markerlight tokens (instead of one).`);

rule('equipment', null, 'ORBITAL SURVEY UPLINK', 0,
  `Once per turning point, when a friendly PATHFINDER operative performs the Markerlight action, you can use this rule. If you do, you can select one enemy operative in the killzone to gain one of your Markerlight tokens instead (it doesn\'t need to be visible). This isn\'t cumulative with the High-intensity Markerlight or Analyse rules.`);

rule('equipment', null, 'PHOTON GRENADE', 0,
  `Once per turning point, a friendly PATHFINDER operative that has the Markerlight action on their datacard (excluding DRONE) can perform the following unique action:

PHOTON GRENADE (1AP): Select one enemy operative visible to this operative and roll one D6: on a 3+, until the end of that operative\'s next activation, subtract 2" from its Move stat and it cannot perform the Dash action.

An operative cannot perform this action while within control range of an enemy operative.`);

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('SHAS\'UI PATHFINDER', 'Leader',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '8' },
  [
    { name: 'Pulse carbine', atk: '4', hit: '3+', dmg: '4/5', wr: '–' },
    { name: 'Gun butt',      atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Art of War', description: 'Once per battle STRATEGIC GAMBIT. Select one of the following and apply its rules until the end of the turning point. You cannot select each option more than once per battle:\n• Mont\'ka: Add 1" to the Move stat of friendly PATHFINDER operatives.\n• Kauyon: Friendly PATHFINDER operatives can perform a free Markerlight action during their activation if they have a Conceal order.' },
    { name: 'Markerlight (1AP)', description: 'See the Markerlights faction rule.' },
  ],
  'PATHFINDER, T\'AU EMPIRE, LEADER, SHAS\'UI'
);

card('ASSAULT GRENADIER PATHFINDER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Fusion Grenade', atk: '4', hit: '3+', dmg: '4/3', wr: 'Range 6", Devastating 2, Limited 1, Piercing 2, Saturate' },
    { name: 'Pulse carbine',  atk: '4', hit: '4+', dmg: '4/5', wr: '–' },
    { name: 'Gun butt',       atk: '3', hit: '5+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Grenadier specialist', description: 'This operative can use frag and krak grenades (see universal equipment). Doing so doesn\'t count towards any Limited uses you have (i.e. if you also select those grenades from equipment for other operatives). Whenever it\'s doing so, improve the Hit stat of that weapon by 1.' },
    { name: 'Markerlight (1AP)', description: 'See the Markerlights faction rule.' },
  ],
  'PATHFINDER, T\'AU EMPIRE, ASSAULT GRENADIER'
);

card('BLOODED PATHFINDER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '8' },
  [
    { name: 'Suppressed pulse carbine', atk: '4', hit: '3+', dmg: '4/5', wr: 'Silent' },
    { name: 'Bionic arm',               atk: '3', hit: '4+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Veteran', description: 'During a turning point in which you have used a friendly SHAS\'UI operative\'s Art of War STRATEGIC GAMBIT and you selected Mont\'ka, this operative can use Kauyon instead during its activation (and vice versa).' },
    { name: 'Markerlight (1AP)', description: 'See the Markerlights faction rule.' },
  ],
  'PATHFINDER, T\'AU EMPIRE, BLOODED'
);

card('COMMUNICATIONS SPECIALIST PATHFINDER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Pulse carbine', atk: '4', hit: '4+', dmg: '4/5', wr: '–' },
    { name: 'Fists',         atk: '3', hit: '5+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Markerlight (1AP)', description: 'See the Markerlights faction rule.' },
    { name: 'Signal (1AP)', description: 'SUPPORT. Select one other friendly PATHFINDER operative visible to and within 6" of this operative. Until the end of that operative\'s next activation, add 1 to its APL stat.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'PATHFINDER, T\'AU EMPIRE, COMMUNICATIONS SPECIALIST'
);

card('DRONE CONTROLLER PATHFINDER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Pulse carbine', atk: '4', hit: '4+', dmg: '4/5', wr: '–' },
    { name: 'Gun butt',      atk: '3', hit: '5+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Drone Controller', description: 'Whenever this operative is in the killzone:\n• Add 2" to the Move stat of friendly PATHFINDER DRONE operatives.\n• The Saviour Protocols firefight ploy costs you 0CP.' },
    { name: 'Markerlight (1AP)', description: 'See the Markerlights faction rule.' },
    { name: 'Remote Pilot (1AP)', description: 'One friendly PATHFINDER DRONE operative can immediately perform one free action, but it cannot move more than 2" during that action. That action can be one that\'s normally restricted by its drone rule (this takes precedence over that rule).\n\nThis operative cannot perform this action while within control Range of an enemy operative. This operative can perform this action more than once during its activation, but if it does, the same DRONE operative cannot perform the same free action more than once per activation.' },
  ],
  'PATHFINDER, T\'AU EMPIRE, DRONE CONTROLLER'
);

card('MARKSMAN PATHFINDER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Marksman rail rifle – Standard',   atk: '4', hit: '3+', dmg: '4/4', wr: 'Devastating 2, Lethal 5+, Piercing 1' },
    { name: 'Marksman rail rifle – Dart round', atk: '4', hit: '3+', dmg: '3/4', wr: 'Piercing 1, Silent' },
    { name: 'Gun butt',                         atk: '3', hit: '5+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Inertial Dampener', description: 'You can ignore any changes to the Hit stat of this operative\'s marksman rail rifle.' },
  ],
  'PATHFINDER, T\'AU EMPIRE, MARKSMAN'
);

card('MEDICAL TECHNICIAN PATHFINDER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Pulse carbine', atk: '4', hit: '4+', dmg: '4/5', wr: '–' },
    { name: 'Gun butt',      atk: '3', hit: '5+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Medic!', description: 'The first time during each turning point that another friendly PATHFINDER operative (excluding DRONE) would be incapacitated while visible to and within 3" of this operative, you can use this rule, providing neither this nor that operative is within control Range of an enemy operative. If you do, that friendly operative isn\'t incapacitated and has 1 wound remaining and cannot be incapacitated for the remainder of the action. After that action, that friendly operative can then immediately perform a free Dash action, but must end that move within this operative\'s control Range. Subtract 1 from this and that operative\'s APL stats until the end of their next activations respectively, and if this rule was used during that friendly operative\'s activation, that activation ends. You cannot use this rule if this operative is incapacitated, or if it\'s a Shoot action and this operative would be a primary or secondary target.' },
    { name: 'Markerlight (1AP)', description: 'See the Markerlights faction rule.' },
    { name: 'Medikit (1AP)', description: 'Select one friendly PATHFINDER operative (excluding DRONE) within this operative\'s control Range to regain up to 2D3 lost wounds. It cannot be an operative that the Medic! rule was used on during this turning point.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'PATHFINDER, T\'AU EMPIRE, MEDIC, MEDICAL TECHNICIAN'
);

card('SHAS\'LA PATHFINDER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Pulse carbine', atk: '4', hit: '4+', dmg: '4/5', wr: '–' },
    { name: 'Gun butt',      atk: '3', hit: '5+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Group Activation', description: 'Whenever this operative is expended, you must then activate one other ready friendly PATHFINDER SHAS\'LA operative (if able) before your opponent activates. When that other operative is expended, your opponent then activates as normal (in other words, you cannot activate more than two operatives in succession with this rule).' },
    { name: 'Fearless on the Frontline', description: 'This operative can perform the Markerlight action while within control Range of an enemy operative (taking precedence over the Markerlight action\'s normal conditions). In addition, this operative can perform the Fall Back action for 1 less AP.' },
    { name: 'Markerlight (1AP)', description: 'See the Markerlights faction rule.' },
  ],
  'PATHFINDER, T\'AU EMPIRE, SHAS\'LA'
);

card('TRANSPECTRAL INTERFERENCE PATHFINDER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Pulse carbine', atk: '4', hit: '4+', dmg: '4/5', wr: '–' },
    { name: 'Gun butt',      atk: '3', hit: '5+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Multi-Dimensional Vision', description: 'Whenever this operative is shooting, enemy operatives cannot be obscured.' },
    { name: 'Markerlight (1AP)', description: 'See the Markerlights faction rule.' },
    { name: 'System Jam (1AP)', description: 'Select one enemy operative visible to this operative. Until the end of that operative\'s next activation, subtract 1 from its APL stat.\n\nThis operative cannot perform this action while it has a Conceal order, or while within control Range of an enemy operative.' },
  ],
  'PATHFINDER, T\'AU EMPIRE, TRANSPECTRAL INTERFERENCE'
);

card('WEAPONS EXPERT PATHFINDER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Ion rifle – Standard',    atk: '5', hit: '4+', dmg: '4/5', wr: 'Piercing Crits 1' },
    { name: 'Ion rifle – Supercharge', atk: '5', hit: '4+', dmg: '4/5', wr: 'Hot, Lethal 5+, Piercing 1' },
    { name: 'Rail rifle',              atk: '4', hit: '4+', dmg: '4/4', wr: 'Devastating 2, Lethal 5+, Piercing 1' },
    { name: 'Gun butt',                atk: '3', hit: '5+', dmg: '2/3', wr: '–' },
  ],
  [],
  'PATHFINDER, T\'AU EMPIRE, WEAPONS EXPERT'
);

card('MB3 RECON DRONE', 'Specialist',
  { APL: '3', MOVE: '6"', SAVE: '4+', WOUNDS: '12' },
  [
    { name: 'Burst cannon – Focused',  atk: '5', hit: '4+', dmg: '3/4', wr: 'Ceaseless, Heavy (Reposition only), Punishing' },
    { name: 'Burst cannon – Sweeping', atk: '4', hit: '4+', dmg: '3/4', wr: 'Ceaseless, Heavy (Reposition only), Punishing, Torrent 1' },
    { name: 'Ram',                     atk: '3', hit: '5+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Drone', description: 'This operative cannot perform any actions other than Charge, Dash, Fall Back, Fight, Markerlight, Shoot and Reposition. It cannot use any weapons that aren\'t on its datacard.\n\nWhenever determining control of an objective marker, treat this operative\'s APL stat as 1 lower.\n\nWhenever determining what\'s visible to this operative, the round disc at the top of the miniature is its head.' },
    { name: 'Analyse', description: 'Whenever this operative performs the Markerlight action, each other enemy operative that\'s both visible to this operative and within 3" of the enemy operative you selected for that action also gains one of your Markerlight tokens.' },
    { name: 'Markerlight (1AP)', description: 'See the Markerlights faction rule.' },
  ],
  'PATHFINDER, T\'AU EMPIRE, DRONE, MB3 RECON DRONE'
);

card('MV1 GUN DRONE', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Twin pulse carbine', atk: '4', hit: '4+', dmg: '4/5', wr: 'Ceaseless' },
    { name: 'Ram',                atk: '3', hit: '5+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Drone', description: 'This operative cannot perform any actions other than Charge, Dash, Fall Back, Fight, Reposition and Shoot. It cannot use any weapons that aren\'t on its datacard.\n\nWhenever determining control of an objective marker, treat this operative\'s APL stat as 1 lower.\n\nWhenever determining what\'s visible to this operative, the round disc at the top of the miniature is its head.' },
  ],
  'PATHFINDER, T\'AU EMPIRE, DRONE, MV1 GUN DRONE'
);

card('MV4 SHIELD DRONE', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Ram', atk: '3', hit: '5+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Drone', description: 'This operative cannot perform any actions other than Charge, Dash, Fall Back, Fight and Reposition. It cannot use any weapons that aren\'t on its datacard.\n\nWhenever determining control of an objective marker, treat this operative\'s APL stat as 1 lower.\n\nWhenever determining what\'s visible to this operative, the round disc at the top of the miniature is its head.' },
    { name: 'Shield Generator', description: 'This operative ignores the Piercing weapon rule.\n\nOnce per turning point, when an attack dice inflicts Normal Dmg on this operative, you can ignore that inflicted damage.\n\nYou can use the Saviour Protocols firefight ploy for 0CP if this is the specified DRONE operative.' },
  ],
  'PATHFINDER, T\'AU EMPIRE, DRONE, MV4 SHIELD DRONE'
);

card('MV7 MARKER DRONE', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Ram', atk: '3', hit: '5+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Drone', description: 'This operative cannot perform any actions other than Charge, Dash, Fall Back, Fight, Markerlight and Reposition. It cannot use any weapons that aren\'t on its datacard.\n\nWhenever determining control of an objective marker, treat this operative\'s APL stat as 1 lower.\n\nWhenever determining what\'s visible to this operative, the round disc at the top of the miniature is its head.' },
    { name: 'High-intensity Markerlight', description: 'Each time this operative performs the Markerlight action, the selected enemy operative gains 2 Markerlight tokens instead of 1.' },
    { name: 'Markerlight (1AP)', description: 'See the Markerlights faction rule.' },
  ],
  'PATHFINDER, T\'AU EMPIRE, DRONE, MV7 MARKER DRONE'
);

card('MV31 PULSE ACCELERATOR DRONE', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Ram', atk: '3', hit: '5+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Drone', description: 'This operative cannot perform any actions other than Charge, Dash, Fall Back, Fight and Reposition. It cannot use any weapons that aren\'t on its datacard.\n\nWhenever determining control of an objective marker, treat this operative\'s APL stat as 1 lower.\n\nWhenever determining what\'s visible to this operative, the round disc at the top of the miniature is its head.' },
    { name: 'Pulse Accelerator (1AP)', description: 'Until the start of this operative\'s next activation or until it\'s incapacitated (whichever comes first), whenever another friendly PATHFINDER operative is shooting with a pulse weapon within 3" of this operative, that weapon has the Lethal 5+ and Severe weapon rules.' },
  ],
  'PATHFINDER, DRONE, T\'AU EMPIRE, MV31 PULSE ACCELERATOR DRONE'
);

card('MV33 GRAV-INHIBITOR DRONE', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Ram', atk: '3', hit: '5+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Drone', description: 'This operative cannot perform any actions other than Charge, Dash, Fall Back, Fight and Reposition. It cannot use any weapons that aren\'t on its datacard.\n\nWhenever determining control of an objective marker, treat this operative\'s APL stat as 1 lower.\n\nWhenever determining what\'s visible to this operative, the round disc at the top of the miniature is its head.' },
    { name: 'Grav-inhibitor', description: 'Whenever an enemy operative performs an action in which it moves (excluding Dash), if it would move visible to and within 6" of this operative, treat the distance as an additional 2" and ignore the additional distances from the Obstructing and Accessible terrain rules.\n\nWhenever an enemy operative is fighting or retaliating while visible to and within 6" of this operative, worsen the Hit stat of that enemy operative\'s melee weapons by 1. This is cumulative with being injured.' },
  ],
  'PATHFINDER, T\'AU EMPIRE, DRONE, MV33 GRAV-INHIBITOR DRONE'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Pathfinders populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
