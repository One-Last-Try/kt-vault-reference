import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Exaction Squad'").get()?.id;
if (!FACTION_ID) { console.error('Exaction Squad faction not found'); process.exit(1); }

// Clear existing Exaction Squad data
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
  `1 PROCTOR-EXACTANT operative with one of the following options:
• Combat shotgun; repression baton
• Shotpistol; dominator maul & assault shield

10 EXACTION SQUAD operatives selected from the following list:
• CASTIGATOR
• CHIRURGANT
• LEASHMASTER
• R-VR CYBER-MASTIFF
• MALOCATOR
• MARKSMAN
• REVELATUM
• SUBDUCTOR
• VIGILANT
• VOX-SIGNIFIER
• GUNNER equipped with one of the following options:
  - Grenade launcher; repression baton
  - Heavy stubber; repression baton
  - Webber; repression baton

Other than GUNNER, SUBDUCTOR and VIGILANT operatives, your kill team can only include each operative on this list once. Your kill team can only include up to two GUNNER operatives (each must have a different option) and up to four SUBDUCTOR operatives.`);

rule('faction_rules', null, 'RUTHLESS EFFICIENCY', 0,
  `Whenever a friendly EXACTION SQUAD operative is shooting (excluding with frag or krak grenades) and you're selecting a valid target, you can use this rule. If you do, having other friendly EXACTION SQUAD operatives within an enemy operative's control range doesn't prevent that enemy operative from being selected.`);

rule('faction_rules', null, 'REPRESS', 0,
  `Some weapons in this team's rules have the Repress weapon rule below.

*Repress: Whenever this operative is using this weapon:

• Each of your blocks can be allocated to block two unresolved successes (instead of one).
• If this operative is retaliating, you resolve the first attack dice (i.e. defender instead of attacker).`);

rule('faction_rules', null, 'MARKED FOR JUSTICE', 0,
  `STRATEGIC GAMBIT. Select one enemy operative to be your mark for the turning point. Whenever a friendly EXACTION SQUAD operative is shooting against, fighting against or retaliating against your mark, that friendly operative's weapons have the Punishing weapon rule. Whenever your mark is incapacitated, you can select a new enemy operative to be your mark for the turning point (and can continue to do so during this turning point).`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'DISPENSE JUSTICE', 1,
  `Whenever a friendly EXACTION SQUAD operative is fighting or retaliating, if it hasn't moved more than its Move stat during the activation, or if it's a counteraction, its melee weapons have the Ceaseless weapon rule.`);

rule('ploy', 'Strategy', 'GUILT REVEALS ITSELF', 1,
  `Whenever you're selecting a valid target for a friendly EXACTION SQUAD operative, enemy operatives within 4" of it cannot be in cover (instead of 2"). While this can allow such operatives to be targeted (assuming they're visible), it doesn't remove their cover save (if any), unless the friendly EXACTION SQUAD operative is within 2" as normal.`);

rule('ploy', 'Strategy', 'INVIOLATE JURISDICTION', 1,
  `Whenever an operative is shooting a friendly EXACTION SQUAD operative that's within 2" of an objective marker or an enemy operative, you can re-roll one of your defence dice.`);

rule('ploy', 'Strategy', 'TERMINAL DECREE', 1,
  `Whenever a friendly EXACTION SQUAD operative is shooting an enemy operative within 6" of it, or whenever a friendly EXACTION SQUAD GUNNER operative is shooting, that friendly operative's ranged weapons have the Balanced weapon rule.`);

rule('ploy', 'Firefight', 'BRUTAL BACKUP', 1,
  `Use this firefight ploy during a friendly EXACTION SQUAD operative's activation, before or after it performs an action. Select one enemy operative within its control range. One other friendly EXACTION SQUAD operative can immediately perform a free Fight action, but it can only fight against that enemy operative.`);

rule('ploy', 'Firefight', 'EXECUTION ORDER', 1,
  `Use this firefight ploy when an enemy operative performs a mission action (excluding Operate Hatch). Alternatively, use it at the end of the Firefight phase and select one enemy operative that controls an objective marker.

In either case, the next time your opponent would activate that enemy operative, you can interrupt that activation and activate a ready friendly EXACTION SQUAD operative. If you do, during that activation, that friendly operative must fight against or shoot against that enemy operative, and cannot do so against any other enemy operatives until it does (if this isn't possible, that friendly operative's activation is cancelled).

After completing that friendly operative's activation, continue that enemy operative's activation (if possible). You cannot use this firefight ploy again until that enemy operative is activated or incapacitated.`);

rule('ploy', 'Firefight', 'EXACT PUNISHMENT', 1,
  `Use this firefight ploy after an enemy operative shoots against or fights against a friendly EXACTION SQUAD operative within 6" of it, and that friendly operative isn't incapacitated as a result. That friendly operative can immediately perform either a free Shoot or a free Fight action, but other enemy operatives cannot be selected as a valid target or to fight against during that action (note that secondary targets from the Blast weapon rule can still be targeted).`);

rule('ploy', 'Firefight', 'LONG ARM OF THE EMPEROR\'S LAW', 1,
  `Use this firefight ploy when a friendly EXACTION SQUAD operative is performing the Shoot action and you select a weapon with the Range x weapon rule (excluding frag or krak grenade). Until the end of that action, add 3" to x.`);

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

rule('equipment', null, 'REINFORCED MIRROR-VISOR', 0,
  'You can ignore any changes to the APL stats of friendly EXACTION SQUAD operatives, and they aren\'t affected by enemy operatives\' Shock weapon rule.');

rule('equipment', null, 'MANACLES', 0,
  'Whenever an enemy operative would perform the Fall Back action while within control range of a friendly EXACTION SQUAD operative, if no other enemy operatives are within that friendly operative\'s control range, you can use this rule. If you do, roll two D6, or one D6 if that enemy operative has a higher Wounds stat than that friendly operative. If any result is a 4+, that enemy operative cannot perform that action during that activation or counteraction (no AP are spent on it), and you cannot use this rule again during this turning point.');

rule('equipment', null, 'STROBING PHOSPHOR-LUMEN', 0,
  'Whenever an enemy operative is shooting against, fighting against or retaliating against a friendly EXACTION SQUAD operative within 2" of it, your opponent cannot re-roll their attack dice results of 1.');

rule('equipment', null, 'SPECIAL ISSUE SHELLS', 0,
  `Up to twice per turning point, when a friendly EXACTION SQUAD operative is performing the Shoot action and you select a combat shotgun, executioner shotgun, scoped shotpistol or shotpistol, you can use this rule. If you do, select one of the following weapon rules for that weapon to have until the end of that action:
• Saturate.
• Piercing 1, but only if the target has a Save stat of 3+ or better.
• Torrent 1", but you cannot select more than one secondary target.`);

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('ARBITES PROCTOR-EXACTANT', 'Leader',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '9' },
  [
    { name: 'Combat shotgun – Short range', atk: '4', hit: '2+', dmg: '4/4', wr: 'Range 6"' },
    { name: 'Combat shotgun – Long range',  atk: '4', hit: '4+', dmg: '2/2', wr: '–' },
    { name: 'Shotpistol',                   atk: '4', hit: '3+', dmg: '3/3', wr: 'Range 8"' },
    { name: 'Dominator maul & assault shield', atk: '4', hit: '3+', dmg: '4/4', wr: 'Lethal 5+, Shock, Repress*' },
    { name: 'Repression baton',             atk: '3', hit: '3+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Assault Shield', description: 'If this operative has a dominator maul & assault shield, it has a 3+ Save stat.' },
    { name: 'Nuncio-aquila', description: 'Whenever an enemy operative is within 3" of your Nuncio-aquila marker (or this operative if your Nuncio-aquila marker isn\'t in the killzone), your opponent must spend 1 additional AP for that enemy operative to perform the Pick Up Marker and mission actions.\n\nWhenever determining control of a marker, treat the total APL stat of enemy operatives that contest it as 1 lower if at least one of those enemy operatives is within 3" of your Nuncio-aquila marker (or this operative if your Nuncio-aquila marker isn\'t in the killzone). Note this isn\'t a change to the APL stat, so any changes are cumulative with this.' },
    { name: 'DEPLOY NUNCIO-AQUILA (0AP)', description: 'If your Nuncio-aquila marker isn\'t in the killzone, place it within 6" horizontally of this operative; otherwise, move your Nuncio-aquila marker up to 6" horizontally. If this operative is removed from the killzone, remove your Nuncio-aquila marker from the killzone.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'EXACTION SQUAD, IMPERIUM, ADEPTUS ARBITES, LEADER, PROCTOR-EXACTANT'
);

card('ARBITES CASTIGATOR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Combat shotgun – Short range', atk: '4', hit: '3+', dmg: '4/4', wr: 'Range 6"' },
    { name: 'Combat shotgun – Long range',  atk: '4', hit: '5+', dmg: '2/2', wr: '–' },
    { name: 'Excruciator maul',             atk: '4', hit: '3+', dmg: '5/5', wr: 'Rending, Shock' },
  ],
  [
    { name: 'Engendered Focus', description: 'You can ignore any changes to this operative\'s stats (including its weapons\' stats, but excluding its Save stat).' },
    { name: 'Zealous Dedication', description: 'Whenever an attack dice inflicts damage of 3 or more on this operative, roll one D6: on a 5+, subtract 1 from that inflicted damage.' },
    { name: 'Castigator\'s Arrest', description: 'Whenever an enemy operative is within control Range of this operative, if no other enemy operatives are within this operative\'s control Range, that enemy operative cannot perform the Fall Back action.' },
  ],
  'EXACTION SQUAD, IMPERIUM, ADEPTUS ARBITES, CASTIGATOR'
);

card('ARBITES CHIRURGANT', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Combat shotgun – Short range', atk: '4', hit: '3+', dmg: '4/4', wr: 'Range 6"' },
    { name: 'Combat shotgun – Long range',  atk: '4', hit: '5+', dmg: '2/2', wr: '–' },
    { name: 'Repression baton',             atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Medic!', description: 'The first time during each turning point that another friendly EXACTION SQUAD would be incapacitated while visible to and within 3" of this operative, you can use this rule, providing neither this nor that operative is within control Range of an enemy operative. If you do, that friendly operative isn\'t incapacitated and has 1 wound remaining and cannot be incapacitated for the remainder of the action. After that action, that friendly operative can then immediately perform a free Dash action, but must end that move within this operative\'s control Range. Subtract 1 from this and that operative\'s APL stats until the end of their next activations respectively, and if this rule was used during that friendly operative\'s activation, that activation ends. You cannot use this rule if this operative is incapacitated, or if it\'s a Shoot action and this operative would be a primary or secondary target.' },
    { name: 'MEDIKIT (1AP)', description: 'Select one friendly EXACTION SQUAD operative within this operative\'s control Range to regain up to 2D3 lost wounds. It cannot be an operative that the Medic! rule was used on during this turning point.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'EXACTION SQUAD, IMPERIUM, ADEPTUS ARBITES, MEDIC, CHIRURGANT'
);

card('ARBITES GUNNER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Grenade launcher',         atk: '5', hit: '4+', dmg: '4/5', wr: 'Piercing 1' },
    { name: 'Heavy stubber – Sweeping', atk: '4', hit: '4+', dmg: '4/5', wr: 'Heavy (Dash only), Torrent 1"' },
    { name: 'Heavy stubber – Focused',  atk: '5', hit: '4+', dmg: '4/5', wr: 'Heavy (Dash only)' },
    { name: 'Webber',                   atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 12", Severe, Stun' },
    { name: 'Repression baton',         atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [],
  'EXACTION SQUAD, IMPERIUM, ADEPTUS ARBITES, GUNNER'
);

card('ARBITES LEASHMASTER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Combat shotgun – Short range', atk: '4', hit: '3+', dmg: '4/4', wr: 'Range 6"' },
    { name: 'Combat shotgun – Long range',  atk: '4', hit: '5+', dmg: '2/2', wr: '–' },
    { name: 'Shotpistol',                   atk: '4', hit: '4+', dmg: '3/3', wr: 'Range 8"' },
    { name: 'Repression baton',             atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Handler', description: 'Whenever this operative is activated, you can activate a ready friendly EXACTION SQUAD R-VR CYBER-MASTIFF operative at the same time. Complete their activations action by action in any order.' },
    { name: 'Attack Pattern', description: 'STRATEGIC GAMBIT in the first turning point. Select two of the following attack patterns for a friendly EXACTION SQUAD R-VR CYBER-MASTIFF operative to have for the battle:\n• Aggressive: Its melee weapons have the Relentless weapon rule.\n• Swift: Add 2" to its Move stat.\n• Defensive: Improve its Save stat by 1.' },
    { name: 'R-VR COMMAND (0AP)', description: 'Select one friendly EXACTION SQUAD R-VR CYBER-MASTIFF operative and change one of its attack patterns.' },
  ],
  'EXACTION SQUAD, IMPERIUM, ADEPTUS ARBITES, LEASHMASTER'
);

card('R-VR CYBER-MASTIFF', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Mechanical bite', atk: '4', hit: '4+', dmg: '3/5', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Beast', description: 'This operative cannot perform any actions other than Apprehend, Charge, Dash, Fall Back, Fight, Guard, Reposition, Pick Up Marker and Place Marker. It cannot use any weapons that aren\'t on its datacard.' },
    { name: 'APPREHEND (0AP)', description: 'Select one enemy operative within this operative\'s control Range. Until that enemy operative is no longer within this operative\'s control Range, or until this operative performs this action again (whichever comes first), worsen the Hit stat of that enemy operative\'s weapons by 1 (this isn\'t cumulative with being injured); in addition, that enemy operative cannot perform the Fall Back action.\n\nThis operative cannot perform this action unless an enemy operative is within its control Range.' },
  ],
  'EXACTION SQUAD, IMPERIUM, ADEPTUS ARBITES, R-VR CYBER-MASTIFF'
);

card('ARBITES MALOCATOR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Combat shotgun – Short range', atk: '4', hit: '3+', dmg: '4/4', wr: 'Range 6"' },
    { name: 'Combat shotgun – Long range',  atk: '4', hit: '5+', dmg: '2/2', wr: '–' },
    { name: 'Repression baton',             atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Acute Focus', description: 'Once during each of this operative\'s activations, it can perform the Pick Up Marker, Place Marker, Veriscant or a mission action for 1 less AP.' },
    { name: 'VERISCANT (1AP)', description: 'Select one enemy operative visible to this operative. Until the start of this operative\'s next activation, until it\'s incapacitated or until it performs this action again (whichever comes first), whenever a friendly EXACTION SQUAD operative is shooting against, fighting against or retaliating against that enemy operative, that friendly operative\'s weapons have the Lethal 5+ and Severe weapon rules.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'EXACTION SQUAD, IMPERIUM, ADEPTUS ARBITES, MALOCATOR'
);

card('ARBITES MARKSMAN', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Executioner shotgun – Stationary', atk: '4', hit: '2+', dmg: '4/0', wr: 'Devastating 4, Heavy' },
    { name: 'Executioner shotgun – Mobile',     atk: '4', hit: '3+', dmg: '4/4', wr: '–' },
    { name: 'Executioner shotgun – Concealed',  atk: '4', hit: '2+', dmg: '4/0', wr: 'Devastating 4, Heavy, Silent, Concealed Position' },
    { name: 'Repression baton',                 atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: '*Concealed Position', description: 'This operative can only use this weapon the first time it\'s performing the Shoot action during the battle.' },
    { name: 'OPTICS (1AP)', description: 'Until the start of this operative\'s next activation:\n• The concealed and stationary profiles of its executioner shotgun have the Lethal 5+ weapon rule.\n• Whenever it\'s shooting with its executioner shotgun, enemy operatives cannot be obscured.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'EXACTION SQUAD, IMPERIUM, ADEPTUS ARBITES, MARKSMAN'
);

card('ARBITES REVELATUM', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Scoped shotpistol – Short range', atk: '4', hit: '3+', dmg: '3/3', wr: 'Range 8", Lethal 5+' },
    { name: 'Scoped shotpistol – Long range',  atk: '4', hit: '3+', dmg: '3/3', wr: '–' },
    { name: 'Repression baton',                atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'First in the Field', description: 'STRATEGIC GAMBIT in the first turning point. If this operative is wholly within your drop zone, it can immediately perform a free Reposition action.' },
    { name: 'SPOT (1AP)', description: 'SUPPORT. Select one enemy operative visible to and within 8" of this operative. Until the end of the turning point, whenever a friendly EXACTION SQUAD operative is shooting that enemy operative, you can use this effect. If you do:\n• That friendly operative\'s ranged weapons have the Seek Light weapon rule.\n• That enemy operative cannot be obscured.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'EXACTION SQUAD, IMPERIUM, ADEPTUS ARBITES, REVELATUM'
);

card('ARBITES SUBDUCTOR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '3+', WOUNDS: '8' },
  [
    { name: 'Shotpistol',                atk: '4', hit: '4+', dmg: '3/3', wr: 'Range 8"' },
    { name: 'Shock maul & assault shield', atk: '4', hit: '4+', dmg: '4/4', wr: 'Shock, Repress*' },
  ],
  [
    { name: 'Stubborn Subjugator', description: 'You can ignore any changes to the Hit stat of this operative\'s melee weapons.' },
  ],
  'EXACTION SQUAD, IMPERIUM, ADEPTUS ARBITES, SUBDUCTOR'
);

card('ARBITES VIGILANT', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Combat shotgun – Short range', atk: '4', hit: '3+', dmg: '4/4', wr: 'Range 6"' },
    { name: 'Combat shotgun – Long range',  atk: '4', hit: '5+', dmg: '2/2', wr: '–' },
    { name: 'Repression baton',             atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Close Quarters Vigilance', description: 'This operative can perform the Shoot action (excluding Guard) while within control Range of an enemy operative, but only if it hasn\'t performed the Charge action during the activation, or if it\'s a counteraction. Note this operative isn\'t restricted from performing the Charge action after performing the Shoot action.' },
  ],
  'EXACTION SQUAD, IMPERIUM, ADEPTUS ARBITES, VIGILANT'
);

card('ARBITES VOX-SIGNIFIER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Combat shotgun – Short range', atk: '4', hit: '3+', dmg: '4/4', wr: 'Range 6"' },
    { name: 'Combat shotgun – Long range',  atk: '4', hit: '5+', dmg: '2/2', wr: '–' },
    { name: 'Repression baton',             atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'SIGNAL (1AP)', description: 'SUPPORT. Select one other friendly EXACTION SQUAD operative visible to this operative. Until the end of that operative\'s next activation, add 1 to its APL stat.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'EXACTION SQUAD, IMPERIUM, ADEPTUS ARBITES, VOX-SIGNIFIER'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Exaction Squad populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
