import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Hunter Clade'").get()?.id;
if (!FACTION_ID) { console.error('Hunter Clade faction not found'); process.exit(1); }

// Clear existing Hunter Clade data
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
  `1 HUNTER CLADE operative selected from the following list:
• SICARIAN INFILTRATOR PRINCEPS with one option from each of the following categories:
  - Flechette blaster or stubcarbine
  - Power weapon or taser goad
• SICARIAN RUSTSTALKER PRINCEPS
• SKITARII RANGER ALPHA with one of the following options:
  - Galvanic rifle; gun butt
  - Master-crafted radium pistol; power weapon
  Or one option from each of the following categories:
  - Arc pistol or phosphor blast pistol
  - Arc maul or taser goad
• SKITARII VANGUARD ALPHA with one of the following options:
  - Radium carbine; gun butt
  - Master-crafted radium pistol; power weapon
  Or one option from each of the following categories:
  - Arc pistol or phosphor blast pistol
  - Arc maul or taser goad

9 HUNTER CLADE operatives selected from the following list:
• SICARIAN INFILTRATOR WARRIOR* with one option from each of the following categories:
  - Flechette blaster or stubcarbine
  - Power weapon or taser goad
• SICARIAN RUSTSTALKER WARRIOR* with one of the following options:
  - Chordclaw and transonic razor
  - Transonic blades
• SKITARII RANGER DIKTAT
• SKITARII RANGER GUNNER* with gun butt and one of the following options:
  - Arc rifle, plasma caliver or transuranic arquebus
• SKITARII RANGER SURVEYOR
• SKITARII RANGER WARRIOR
• SKITARII VANGUARD DIKTAT
• SKITARII VANGUARD GUNNER* with gun butt and one of the following options:
  - Arc rifle, plasma caliver or transuranic arquebus
• SKITARII VANGUARD SURVEYOR
• SKITARII VANGUARD WARRIOR

*You cannot select more than 7 of these operatives combined.

Other than GUNNER and WARRIOR operatives, your kill team can only include each operative on this list once. Your kill team can only include up to one DIKTAT operative, up to one SURVEYOR operative and up to five SICARIAN operatives. Your kill team can only include up to one arc rifle, up to one plasma caliver and up to one transuranic arquebus.`);

rule('faction_rules', null, 'DOCTRINA IMPERATIVES', 0,
  `At the end of the Select Operatives step, select one DOCTRINA IMPERATIVE to be a Primary Mode for your kill team until the end of the battle (note that selecting a Primary Mode doesn't automatically give you the effects of that DOCTRINA IMPERATIVE for the battle; you must still select it as a STRATEGIC GAMBIT, as below)

STRATEGIC GAMBIT. Select one DOCTRINA IMPERATIVE for friendly HUNTER CLADE operatives to have until the Ready step of the next Strategy phase. Each DOCTRINA IMPERATIVE has both an Optimisation and a Deprecation rule. Both are in effect while your kill team has that DOCTRINA IMPERATIVE. Once per battle, when you select the DOCTRINA IMPERATIVE that's your kill team's Primary Mode, you can ignore its Deprecation rule.`);

rule('faction_rules', 'Doctrina Imperative', 'PROTECTOR IMPERATIVE', 0,
  `Optimisation: Friendly HUNTER CLADE operatives' ranged weapons have the Ceaseless weapon rule.

Deprecation: Worsen the Hit stat of friendly HUNTER CLADE operatives' melee weapons by 1. This isn't cumulative with being injured.`);

rule('faction_rules', 'Doctrina Imperative', 'CONQUEROR IMPERATIVE', 0,
  `Optimisation: Friendly HUNTER CLADE operatives' melee weapons have the Ceaseless weapon rule.

Deprecation: Worsen the Hit stat of friendly HUNTER CLADE operatives' ranged weapons by 1. This isn't cumulative with being injured.`);

rule('faction_rules', 'Doctrina Imperative', 'BULWARK IMPERATIVE', 0,
  `Optimisation: Normal Dmg of 3 or more inflicts 1 less damage on HUNTER CLADE friendly operatives.

Deprecation: Subtract 1" from the Move stat of friendly HUNTER CLADE operatives.`);

rule('faction_rules', 'Doctrina Imperative', 'AGGRESSOR IMPERATIVE', 0,
  `Optimisation: Add 1" to the Move stat of friendly HUNTER CLADE operatives.

Deprecation: Worsen the Save stat of friendly HUNTER CLADE operatives by 1.`);

rule('faction_rules', 'Doctrina Imperative', 'NEUTRAL IMPERATIVE', 0,
  `Optimisation: None.

Deprecation: None.`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'DEBILITATING IRRADIATION', 1,
  'Whenever an enemy operative is shooting against, fighting against or retaliating against a friendly HUNTER CLADE VANGUARD operative, if that enemy operative is under the effects of the Rad-Saturation rule (see VANGUARD operatives), subtract 1 from the Normal Dmg stat of its weapons (to a minimum of 3).');

rule('ploy', 'Strategy', 'SCOUTING PROTOCOL', 1,
  'Each friendly HUNTER CLADE RANGER operative that has a Conceal order and is more than 6" from enemy operatives can immediately perform a free Dash action in an order of your choice. You cannot use this ploy during the first turning point.');

rule('ploy', 'Strategy', 'NEUROSTATIC INTERFERENCE', 1,
  'Whenever an enemy operative within 6" of a friendly HUNTER CLADE INFILTRATOR operative is shooting, fighting or retaliating, your opponent cannot re-roll their attack dice.');

rule('ploy', 'Strategy', 'ACCELERANT AGENTS', 1,
  'During each friendly HUNTER CLADE RUSTSTALKER operative\'s activation, it can perform two Fight actions, and one of them can be free.');

rule('ploy', 'Firefight', 'CONTROL EDICT', 1,
  'Use this firefight ploy when it\'s your turn to activate a friendly operative. Select one friendly HUNTER CLADE LEADER operative and one other ready friendly HUNTER CLADE operative visible to and within 3" of that LEADER operative; activate one of them as normal. When that first friendly operative is expended, you can activate the other friendly operative before your opponent activates. Whenever you use this ploy, you cannot select more than one SICARIAN HUNTER CLADE operative.');

rule('ploy', 'Firefight', 'OMNISSIAH\'S IMPERATIVE', 1,
  `Use this firefight ploy during a friendly HUNTER CLADE operative's activation. Alternatively, use it when an enemy operative is shooting a friendly HUNTER CLADE operative, at the end of the Roll Attack Dice step. Until the Ready step of the next Strategy phase, that friendly operative has an additional rule determined by its current DOCTRINA IMPERATIVE as follows:
• Protector: This operative's ranged weapons have the Severe weapon rule.
• Conqueror: Whenever this operative is fighting, after resolving your first attack dice during that sequence, you can immediately resolve another (before your opponent).
• Bulwark: Improve this operative's Save stat by 1. In addition, whenever an operative is shooting this operative, you can collect and roll an additional defence dice. If you use this ploy during a Shoot action, this operative's Save stat is changed immediately (this takes precedence over the core rules).
• Aggressor: You can ignore the first vertical distance of 2" this operative moves during one climb up.
• Neutral: None.

Note that you can use this ploy after rolling attack or defence dice for this operative, or before or after retaining or re-rolling those dice.`);

rule('ploy', 'Firefight', 'SCRAPCODE OVERLOAD', 1,
  'Use this firefight ploy when a friendly HUNTER CLADE INFILTRATOR operative is activated. Alternatively, use this firefight ploy when a friendly HUNTER CLADE INFILTRATOR operative, or an enemy operative within 3" of that friendly operative, would perform the Pick Up Marker or a mission action (excluding Operate Hatch). Until the start of that friendly operative\'s next activation, whenever determining control of a marker, treat the total APL stat of enemy operatives that contest it as 1 lower if at least one of those enemy operatives is within 3" of that friendly operative. Note this isn\'t a change to the APL stat, so any changes are cumulative with this, and this can change control of a marker before performing the action.');

rule('ploy', 'Firefight', 'COMMAND OVERRIDE', 1,
  'Use this firefight ploy when you activate a friendly HUNTER CLADE operative. Select a DOCTRINA IMPERATIVE for that operative to have instead of its current one (if any) until the Ready step of the next Strategy phase.');

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

rule('equipment', null, 'RAD BOMBARDMENT', 0,
  'Once per battle STRATEGIC GAMBIT in any turning point after the first. Select one objective marker or your opponent\'s drop zone. Roll one D6 for each enemy operative within control range of that selected objective marker or within that drop zone, and subtract 1 from that enemy operative\'s APL stat until the end of its next activation on a 4+; on a 6, also inflict D3 damage on it (roll separately for each).');

rule('equipment', null, 'REFRACTOR FIELD', 0,
  'Once per turning point, when an operative is shooting a friendly HUNTER CLADE operative, at the start of the Roll Defence Dice step, you can use this rule. If you do, worsen the x of the Piercing weapon rule by 1 (if any) until the end of that sequence. Note that Piercing 1 would therefore be ignored.');

rule('equipment', null, 'EXTREMIS MIND-LINK', 0,
  'Once per battle, you can use the Control Edict firefight ploy for 0CP, but instead of activating the selected friendly operatives in succession, activate them at the same time. Complete their activations action by action in any order.');

rule('equipment', null, 'REDUNDANCY SYSTEMS', 0,
  'Once per turning point, when a friendly HUNTER CLADE operative is activated, if it\'s not within control range of enemy operatives, you can use this rule. If you do, that friendly operative regains up to D3+2 lost wounds.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('SICARIAN RUSTSTALKER PRINCEPS', 'Leader',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '11' },
  [
    { name: 'Chordclaw and transonic blades', atk: '5', hit: '3+', dmg: '4/6', wr: 'Balanced, Rending' },
  ],
  [
    { name: 'Wasteland Stalkers', description: 'Whenever an operative is shooting this operative, if you can retain any cover saves, you can retain one additional cover save, or you can retain one cover save as a critical success instead. This isn\'t cumulative with improved cover saves from Vantage terrain.' },
    { name: 'Canticle of Destruction', description: 'Whenever a friendly HUNTER CLADE RUSTSTALKER operative within 3" of this operative is fighting, the first time you strike with a critical success during that sequence, inflict 1 additional damage.' },
    { name: 'Control Protocol', description: 'You can use the Command Override firefight ploy for 0CP if the specified friendly HUNTER CLADE operative is visible to this operative.' },
  ],
  'HUNTER CLADE, ADEPTUS MECHANICUS, LEADER, SICARIAN, RUSTSTALKER, PRINCEPS'
);

card('SICARIAN INFILTRATOR PRINCEPS', 'Leader',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '11' },
  [
    { name: 'Flechette blaster', atk: '5', hit: '3+', dmg: '2/2', wr: 'Range 8", Saturate, Silent' },
    { name: 'Stubcarbine',       atk: '4', hit: '3+', dmg: '3/4', wr: 'Ceaseless' },
    { name: 'Power weapon',      atk: '4', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
    { name: 'Taser goad',        atk: '4', hit: '3+', dmg: '3/4', wr: 'Lethal 5+, Shock' },
  ],
  [
    { name: 'Canticle of Shroudpsalm', description: 'Whenever a friendly HUNTER CLADE INFILTRATOR operative is within 3" of this operative, has a Conceal order and is in cover, that friendly operative cannot be selected as a valid target, taking precedence over all other rules (e.g. Seek, Vantage terrain) except within 2".' },
    { name: 'Control Protocol', description: 'You can use the Command Override firefight ploy for 0CP if the specified friendly HUNTER CLADE operative is visible to this operative.' },
  ],
  'CLADO DE CAZADORES, ADEPTUS MECHANICUS, LEADER, SICARIAN, INFILTRATOR, PRINCEPS'
);

card('SKITARII RANGER ALPHA', 'Leader',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Arc pistol',                  atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 8", Piercing 1, Stun' },
    { name: 'Galvanic rifle',              atk: '4', hit: '3+', dmg: '3/4', wr: 'Heavy (Reposition only), Piercing Crits 1' },
    { name: 'Master-crafted radium pistol', atk: '4', hit: '3+', dmg: '2/4', wr: 'Range 8", Balanced, Rending' },
    { name: 'Phosphor blast pistol',       atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Blast 1", Severe' },
    { name: 'Arc maul',                    atk: '4', hit: '4+', dmg: '4/5', wr: 'Shock' },
    { name: 'Gun butt',                    atk: '3', hit: '4+', dmg: '2/3', wr: '-' },
    { name: 'Power weapon',                atk: '4', hit: '4+', dmg: '4/6', wr: 'Lethal 5+' },
    { name: 'Taser goad',                  atk: '4', hit: '4+', dmg: '3/4', wr: 'Lethal 5+, Shock' },
  ],
  [
    { name: 'Canticle of Elimination', description: 'Whenever a friendly HUNTER CLADE RANGER operative is within 3" of this operative, that friendly operative\'s ranged weapons have the Punishing weapon rule.' },
    { name: 'Targeting Protocol', description: 'Whenever this operative is shooting, if it hasn\'t moved during the activation, or if it\'s a counteraction, ranged weapons on its datacard have the Lethal 5+ weapon rule. Note this operative isn\'t restricted from moving after shooting.' },
    { name: 'Control Protocol', description: 'You can use the Command Override firefight ploy for 0CP if the specified friendly HUNTER CLADE operative is visible to this operative.' },
  ],
  'HUNTER CLADE, ADEPTUS MECHANICUS, LEADER, SKITARII, RANGER, ALPHA'
);

card('SKITARII VANGUARD ALPHA', 'Leader',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Arc pistol',                  atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 8", Piercing 1, Stun' },
    { name: 'Master-crafted radium pistol', atk: '4', hit: '3+', dmg: '2/4', wr: 'Range 8", Balanced, Rending' },
    { name: 'Phosphor blast pistol',       atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Blast 1", Severe' },
    { name: 'Radium carbine',              atk: '4', hit: '3+', dmg: '2/4', wr: 'Rending' },
    { name: 'Arc maul',                    atk: '4', hit: '4+', dmg: '4/5', wr: 'Shock' },
    { name: 'Gun butt',                    atk: '3', hit: '4+', dmg: '2/3', wr: '-' },
    { name: 'Power weapon',                atk: '4', hit: '4+', dmg: '4/6', wr: 'Lethal 5+' },
    { name: 'Taser goad',                  atk: '4', hit: '4+', dmg: '3/4', wr: 'Lethal 5+, Shock' },
  ],
  [
    { name: 'Rad-Saturation', description: 'Whenever an enemy operative is within 2" of friendly HUNTER CLADE VANGUARD operatives, worsen the Hit stat of that enemy operative\'s weapons by 1. This isn\'t cumulative with being injured.' },
    { name: 'Canticle of the Glow', description: 'Whenever an enemy operative is within 3" of this operative, if it\'s under the effects of the Rad-Saturation rule, also subtract 1 from the Atk stat of that enemy operative\'s weapons.' },
    { name: 'Control Protocol', description: 'You can use the Command Override firefight ploy for 0CP if the specified friendly HUNTER CLADE operative is visible to this operative.' },
  ],
  'HUNTER CLADE, ADEPTUS MECHANICUS, LEADER, SKITARII, VANGUARD, ALPHA'
);

card('SICARIAN INFILTRATOR WARRIOR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '10' },
  [
    { name: 'Flechette blaster', atk: '5', hit: '3+', dmg: '2/2', wr: 'Range 8", Saturate, Silent' },
    { name: 'Stubcarbine',       atk: '4', hit: '3+', dmg: '3/4', wr: 'Ceaseless' },
    { name: 'Power weapon',      atk: '4', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
    { name: 'Taser goad',        atk: '4', hit: '3+', dmg: '3/4', wr: 'Lethal 5+, Shock' },
  ],
  [],
  'HUNTER CLADE, ADEPTUS ADEPTUS MECHANICUS, SICARIAN, INFILTRATOR, WARRIOR'
);

card('SICARIAN RUSTSTALKER WARRIOR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '10' },
  [
    { name: 'Chordclaw and transonic razor', atk: '5', hit: '3+', dmg: '4/5', wr: 'Balanced' },
    { name: 'Transonic blades',              atk: '5', hit: '3+', dmg: '4/6', wr: 'Rending' },
  ],
  [
    { name: 'Wasteland Stalkers', description: 'Whenever an operative is shooting this operative, if you can retain any cover saves, you can retain one additional cover save, or you can retain one cover save as a critical success instead. This isn\'t cumulative with improved cover saves from Vantage terrain.' },
  ],
  'HUNTER CLADE, ADEPTUS MECHANICUS, SICARIAN, RUSTSTALKER, WARRIOR'
);

card('SKITARII RANGER DIKTAT', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Galvanic rifle', atk: '4', hit: '3+', dmg: '3/4', wr: 'Heavy (Reposition only), Piercing Crits 1' },
    { name: 'Gun butt',       atk: '3', hit: '4+', dmg: '2/3', wr: '-' },
  ],
  [
    { name: 'Targeting Protocol', description: 'Whenever this operative is shooting, if it hasn\'t moved during the activation, or if it\'s a counteraction, ranged weapons on its datacard have the Lethal 5+ weapon rule. Note this operative isn\'t restricted from moving after shooting.' },
    { name: 'SIGNAL (1AP)', description: 'Support. Select one other friendly HUNTER CLADE operative visible to and within 6" of this operative. Until the end of that operative\'s next activation, add 1 to its APL stat.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'HUNTER CLADE, ADEPTUS MECHANICUS, SKITARII, RANGER, DIKTAT'
);

card('SKITARII RANGER GUNNER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Arc rifle',                          atk: '4', hit: '3+', dmg: '4/5', wr: 'Piercing 1, Stun' },
    { name: 'Plasma caliver – Standard',          atk: '4', hit: '3+', dmg: '4/6', wr: 'Piercing 1' },
    { name: 'Plasma caliver – Supercharge',       atk: '4', hit: '3+', dmg: '5/6', wr: 'Hot, Lethal 5+, Piercing 1' },
    { name: 'Transuranic arquebus – Mobile',      atk: '4', hit: '3+', dmg: '4/3', wr: 'Devastating 2, Heavy (Dash only), Piercing 1' },
    { name: 'Transuranic arquebus – Stationary',  atk: '4', hit: '2+', dmg: '4/3', wr: 'Devastating 3, Heavy, Piercing 1, Severe' },
    { name: 'Gun butt',                           atk: '3', hit: '4+', dmg: '2/3', wr: '-' },
  ],
  [
    { name: 'Targeting Protocol', description: 'Whenever this operative is shooting, if it hasn\'t moved during the activation, or if it\'s a counteraction, ranged weapons on its datacard have the Lethal 5+ weapon rule. Note this operative isn\'t restricted from moving after shooting.' },
  ],
  'HUNTER CLADE, ADEPTUS MECHANICUS, SKITARII, RANGER, GUNNER'
);

card('SKITARII RANGER SURVEYOR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Galvanic rifle', atk: '4', hit: '3+', dmg: '3/4', wr: 'Heavy (Reposition only), Piercing Crits 1' },
    { name: 'Gun butt',       atk: '3', hit: '4+', dmg: '2/3', wr: '-' },
  ],
  [
    { name: 'Targeting Protocol', description: 'Whenever this operative is shooting, if it hasn\'t moved during the activation, or if it\'s a counteraction, ranged weapons on its datacard have the Lethal 5+ weapon rule. Note this operative isn\'t restricted from moving after shooting.' },
    { name: 'SPOT (1AP)', description: 'SUPPORT. Select one enemy operative visible to this operative. Until the end of the turning point, whenever a friendly HUNTER CLADE operative within 3" of this operative is shooting that enemy operative, you can use this effect. If you do:\n• That friendly operative\'s ranged weapons have the Seek Light weapon rule.\n• That enemy operative cannot be obscured.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'HUNTER CLADE, ADEPTUS MECHANICUS, SKITARII, RANGER, SURVEYOR'
);

card('SKITARII RANGER WARRIOR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Galvanic rifle', atk: '4', hit: '3+', dmg: '3/4', wr: 'Heavy (Reposition only), Piercing Crits 1' },
    { name: 'Gun butt',       atk: '3', hit: '4+', dmg: '2/3', wr: '-' },
  ],
  [
    { name: 'Targeting Protocol', description: 'Whenever this operative is shooting, if it hasn\'t moved during the activation, or if it\'s a counteraction, ranged weapons on its datacard have the Lethal 5+ weapon rule. Note this operative isn\'t restricted from moving after shooting.' },
  ],
  'HUNTER CLADE, ADEPTUS MECHANICUS, SKITARII, RANGER, WARRIOR'
);

card('SKITARII VANGUARD DIKTAT', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Radium carbine', atk: '4', hit: '3+', dmg: '2/4', wr: 'Rending' },
    { name: 'Gun butt',       atk: '3', hit: '4+', dmg: '2/3', wr: '-' },
  ],
  [
    { name: 'Rad-Saturation', description: 'Whenever an enemy operative is within 2" of friendly HUNTER CLADE VANGUARD operatives, worsen the Hit stat of that enemy operative\'s weapons by 1. This isn\'t cumulative with being injured.' },
    { name: 'SIGNAL (1AP)', description: 'Support. Select one other friendly HUNTER CLADE operative visible to and within 6" of this operative. Until the end of that operative\'s next activation, add 1 to its APL stat.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'HUNTER CLADE, ADEPTUS MECHANICUS, SKITARII, VANGUARD, DIKTAT'
);

card('SKITARII VANGUARD GUNNER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Arc rifle',                          atk: '4', hit: '3+', dmg: '4/5', wr: 'Piercing 1, Stun' },
    { name: 'Plasma caliver – Standard',          atk: '4', hit: '3+', dmg: '4/6', wr: 'Piercing 1' },
    { name: 'Plasma caliver – Supercharge',       atk: '4', hit: '3+', dmg: '5/6', wr: 'Hot, Lethal 5+, Piercing 1' },
    { name: 'Transuranic arquebus – Mobile',      atk: '4', hit: '3+', dmg: '4/3', wr: 'Devastating 2, Heavy (Dash only), Piercing 1' },
    { name: 'Transuranic arquebus – Stationary',  atk: '4', hit: '2+', dmg: '4/3', wr: 'Devastating 3, Heavy, Piercing 1, Severe' },
    { name: 'Gun butt',                           atk: '3', hit: '4+', dmg: '2/3', wr: '-' },
  ],
  [
    { name: 'Rad-Saturation', description: 'Whenever an enemy operative is within 2" of friendly HUNTER CLADE VANGUARD operatives, worsen the Hit stat of that enemy operative\'s weapons by 1. This isn\'t cumulative with being injured.' },
  ],
  'HUNTER CLADE, ADEPTUS MECHANICUS, SKITARII, VANGUARD, GUNNER'
);

card('SKITARII VANGUARD SURVEYOR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Radium carbine', atk: '4', hit: '3+', dmg: '2/4', wr: 'Rending' },
    { name: 'Gun butt',       atk: '3', hit: '4+', dmg: '2/3', wr: '-' },
  ],
  [
    { name: 'Rad-Saturation', description: 'Whenever an enemy operative is within 2" of friendly HUNTER CLADE VANGUARD operatives, worsen the Hit stat of that enemy operative\'s weapons by 1. This isn\'t cumulative with being injured.' },
    { name: 'SPOT (1AP)', description: 'SUPPORT. Select one enemy operative visible to this operative. Until the end of the turning point, whenever a friendly HUNTER CLADE operative within 3" of this operative is shooting that enemy operative, you can use this effect. If you do:\n• That friendly operative\'s ranged weapons have the Seek Light weapon rule.\n• That enemy operative cannot be obscured.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'HUNTER CLADE, ADEPTUS MECHANICUS, SKITARII, VANGUARD, SURVEYOR'
);

card('SKITARII VANGUARD WARRIOR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Radium carbine', atk: '4', hit: '3+', dmg: '2/4', wr: 'Rending' },
    { name: 'Gun butt',       atk: '3', hit: '4+', dmg: '2/3', wr: '-' },
  ],
  [
    { name: 'Rad-Saturation', description: 'Whenever an enemy operative is within 2" of friendly HUNTER CLADE VANGUARD operatives, worsen the Hit stat of that enemy operative\'s weapons by 1. This isn\'t cumulative with being injured.' },
  ],
  'HUNTER CLADE, ADEPTUS MECHANICUS, SKITARII, VANGUARD, WARRIOR'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Hunter Clade populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
