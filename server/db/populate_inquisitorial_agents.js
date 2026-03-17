import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Inquisitorial Agents'").get()?.id;
if (!FACTION_ID) { console.error('Inquisitorial Agents faction not found'); process.exit(1); }

// Clear existing Inquisitorial Agents data
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
  'Archetypes: SECURITY, SEEK-DESTROY, INFILTRATION, RECON');

rule('faction_rules', null, 'OPERATIVES', 0,
  `An INQUISITORIAL AGENT kill team consists of:
• 1 INQUISITORIAL AGENT INTERROGATOR operative
• 1 INQUISITORIAL AGENT TOME-SKULL operative
• 5 INQUISITORIAL AGENT operatives selected from the following list:
  - AUTOSAVANT
  - QUESTKEEPER
  - DEATH WORLD VETERAN
  - ENLIGHTENER
  - HEXORCIST
  - MYSTIC
  - PENAL LEGIONNAIRE
  - PISTOLIER
  - GUN SERVITOR with one of the following options:
    • Heavy bolter; servo claw
    • Multi-melta; servo claw
    • Plasma cannon; servo claw

5 INQUISITORIAL AGENT operatives selected from the above list, or REQUISITIONED operatives from one group in the Inquisitorial Requisition faction rule (you cannot select REQUISITIONED operatives from different groups).

Your kill team can only include each operative on this list once, unless you are not including any REQUISITIONED operatives, in which case you can include up to two GUN SERVITOR operatives, but each one must have different options.

Your kill team (including any REQUISITIONED operatives) cannot include more than one weapon with the Piercing 2 weapon rule, and cannot include more than three weapons with the Piercing X (excluding Piercing Crits X) weapon rule combined.`);

rule('faction_rules', null, 'INQUISITORIAL REQUISITION', 0,
  `REQUISITIONED operatives can be taken from one of the following groups to supplement an INQUISITORIAL AGENT kill team, as specified in this kill team's selection rules:

• DEATH KORPS
• EXACTION SQUAD
• IMPERIAL NAVY BREACHER
• KASRKIN
• SISTER OF SILENCE
• TEMPESTUS SCION

These operatives have their faction keyword replaced in all instances on their datacards with INQUISITORIAL AGENT (unless they already have it). You cannot use ploys and equipment associated with a REQUISITIONED operative's former faction keyword, and you cannot use a REQUISITIONED operative's former faction rules unless specified on their Inquisitorial Requisition card (it only applies to those REQUISITIONED operatives). Note that with their new faction keyword, REQUISITIONED operatives can interact with the INQUISITORIAL AGENT rules.`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'DENOUNCE', 1,
  'Select one enemy operative and roll one D3. In the Firefight phase of this turning point, that enemy operative cannot be activated or perform actions until it\'s the last enemy operative to be activated, or your opponent has activated a number of enemy operatives equal to the result of the D3 (whichever comes first). This ploy costs you 1 additional CP for each previous time you used it during the battle (e.g. 1CP the first time you would use it, 2CP the second time, etc.).');

rule('ploy', 'Strategy', 'INTENSE SCRUTINY', 1,
  'Whenever you\'re selecting a valid target for a friendly INQUISITORIAL AGENT operative, enemy operatives within 4" of it cannot be in cover (instead of 2"). While this can allow such operatives to be targeted (assuming they\'re visible), it doesn\'t remove their cover save (if any), unless the friendly INQUISITORIAL AGENT operative is within 2" as normal.');

rule('ploy', 'Strategy', 'IRREFUTABLE JURISDICTION', 1,
  'Whenever an operative is shooting a friendly INQUISITORIAL AGENT operative that\'s within 3" of an objective marker, you can re-roll one of your defence dice. If that friendly operative contests that marker, you can re-roll any of your defence dice results of one result instead (e.g. results of 2).');

rule('ploy', 'Strategy', 'QUARRY', 1,
  'Select one enemy operative to be your quarry for the turning point. Whenever a friendly INQUISITORIAL AGENT operative is shooting against, fighting against or retaliating against your quarry target, that friendly operative\'s weapons have the Ceaseless weapon rule. Whenever your quarry is incapacitated, you can select a new enemy operative to be the quarry. (You can only select one quarry at a time, and can continue to do so during this turning point.)');

rule('ploy', 'Firefight', 'ABSOLUTE AUTHORITY', 1,
  'Use this firefight ploy during the battle, when an opponent uses a strategic or firefight ploy (excluding Command Re-roll or one that costs 0CP). Their ploy isn\'t used, the CP spent on it is refunded and they cannot use that ploy again during its turning point. This ploy cannot be used to stop the same ploy more than once per battle.');

rule('ploy', 'Firefight', 'RELENTLESS IN PURSUIT', 1,
  'Use this firefight ploy when an enemy operative within 2" of a ready friendly INQUISITORIAL AGENT operative performs an action in which it moves. After it moves, that friendly INQUISITORIAL AGENT operative can perform a free Reposition action, but must end that move within 2" of that enemy operative, or a free Charge action, but must end that move within control range of that enemy operative. If neither is possible, that friendly operative cannot perform those actions, this ploy isn\'t used and the CP spent on it is refunded.');

rule('ploy', 'Firefight', 'THE EMPEROR\'S WILL', 1,
  'Use this firefight ploy when a friendly INQUISITORIAL AGENT operative is activated. Until the end of that operative\'s activation, you can ignore any changes to its stats (including its weapons\' stats).');

rule('ploy', 'Firefight', 'INTIMIDATING PRESENCE', 1,
  'Use this firefight ploy when an enemy operative visible to and within 3" of a friendly INQUISITORIAL AGENT operative, or visible to and within 6" of a friendly MYSTIC operative, performs the Pick Up Marker or a mission action (excluding Operate Hatch). Your opponent must spend 1 additional AP for that enemy operative to perform that action (if they cannot or choose not to, the AP spent on it is refunded).');

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

// ── EQUIPMENT ────────────────────────────────────────────────────────────────

rule('equipment', null, 'INQUISITORIAL ROSETTE', 0,
  'Once per battle, when a friendly INQUISITORIAL AGENT operative is activated, if you\'ve used the Quarry strategy ploy during this turning point, you can use this rule. If you do, you can select a new enemy operative to be your quarry until the end of the turning point.');

rule('equipment', null, 'COMBAT DAGGERS', 0,
  'Friendly INQUISITORIAL AGENT operatives have the following melee weapon. Whenever a friendly SISTER OF SILENCE operative is using it, add 1 to its Atk stat.\n\nPower knife: ATK 3, BS/WS 4+, DMG 3/4');

rule('equipment', null, 'ARMOURED BODYSUITS', 0,
  'Whenever an operative is shooting a friendly INQUISITORIAL AGENT operative (excluding TOME-SKULL) that has a 5+ Save stat, you can retain one of your defence dice results of 4 as a normal success.');

rule('equipment', null, 'SERVO-SKULL', 0,
  'Once per battle, one friendly INQUISITORIAL AGENT operative can perform a mission action for 1 less AP.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('INTERROGATOR AGENT', 'Leader',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '8' },
  [
    { name: 'Extended stock relic autopistol', atk: '4', hit: '3+', dmg: '2/4', wr: 'Range 12", Lethal 5+' },
    { name: 'Fists',                           atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Inquisitorial Tomes', description: 'STRATEGIC GAMBIT if this operative is in the killzone and/or when this operative is activated. Select one of the following INQUISITORIAL TOME rules for this operative to have, and one for a friendly INQUISITORIAL AGENT TOME-SKULL operative to have (they can be the same, and ignore the rule you didn\'t select for each operative):\n• Denunciation: Whenever a friendly INQUISITORIAL AGENT operative is shooting against, fighting against or retaliating against an enemy operative within 2" of friendly operatives with this rule, add 1 to the Atk stat of that friendly operative\'s weapons.\n• Sanctification: Whenever an enemy operative is shooting against, fighting against or retaliating against a friendly INQUISITORIAL AGENT operative within 2" of friendly operatives with this rule, subtract 1 from the Atk stat of that enemy operative\'s weapons.' },
  ],
  'INQUISITORIAL AGENT, IMPERIUM, INQUISITION, LEADER, INTERROGATOR'
);

card('TOME-SKULL', 'Specialist',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '5' },
  [],
  [
    { name: 'Consecrated Tome', description: 'This operative can have an INQUISITORIAL TOME rule (see INTERROGATOR\'s datacard). Note it keeps that rule even if that friendly INTERROGATOR operative is removed from the killzone.' },
    { name: 'Machine', description: 'This operative cannot perform any actions other than Charge, Dash, Fall Back, and Reposition. It cannot retaliate or assist in a fight. Whenever determining control of a marker, treat this operative\'s APL stat as 1 lower. Note this isn\'t a change to its APL stat, so any changes are cumulative with this. Whenever this operative has a Conceal order and is in cover, it cannot be selected as a valid target, taking precedence over all other rules (e.g. Seek, Vantage terrain), except being within 2".' },
    { name: 'Expendable', description: 'This operative is ignored for your opponent\'s kill/elimination operation (when it\'s incapacitated, and when determining your starting number of operatives). It\'s also ignored for victory conditions and scoring VPs if either require operatives to \'escape\', \'survive\' or be incapacitated by enemy operatives (if it escapes/survives/is incapacitated, determining how many operatives must escape/survive/be incapacitated, etc.).' },
    { name: 'Group Activation', description: 'Whenever this operative is expended, you must then activate a ready friendly INQUISITORIAL AGENT INTERROGATOR operative (if able) before your opponent activates. The same is true in reverse (INTERROGATOR followed by TOME-SKULL). When that other operative is expended, your opponent then activates as normal.' },
  ],
  'INQUISITORIAL AGENT, IMPERIUM, INQUISITION, TOME-SKULL'
);

card('AUTOSAVANT AGENT', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Mechanical appendages', atk: '3', hit: '5+', dmg: '1/2', wr: '–' },
  ],
  [
    { name: 'Scrivener', description: 'Each subsequent time your opponent uses each ploy during the battle (excluding Command Re-roll), you gain 1CP (to a maximum of 2CP per turning point).' },
    { name: 'Lightly Armed', description: 'This operative cannot use any weapons that aren\'t on its datacard, or perform unique actions.' },
    { name: 'Irrefutable Report', description: 'Whenever this operative contests an objective marker or one of your mission markers, it always controls that marker. This takes precedence over all other rules.' },
  ],
  'INQUISITORIAL AGENT, IMPERIUM, INQUISITION, AUTOSAVANT'
);

card('QUESTKEEPER AGENT', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Autopistol',  atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Eviscerator', atk: '4', hit: '4+', dmg: '5/6', wr: 'Brutal' },
  ],
  [
    { name: 'Irrepressible Purpose', description: 'If this operative is incapacitated while fighting or retaliating, you can strike the enemy operative in that sequence with one of your unresolved successes before it\'s removed from the killzone.' },
    { name: 'Zealot', description: 'Whenever an attack dice inflicts damage of 3 or more on this operative, roll one D6: on a 5+, subtract 1 from that inflicted damage.' },
  ],
  'INQUISITORIAL AGENT, IMPERIUM, INQUISITION, QUESTKEEPER'
);

card('DEATH WORLD VETERAN AGENT', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Autopistol', atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Knife',      atk: '1', hit: '2+', dmg: '5/7', wr: 'Lethal 5+' },
    { name: 'Polearm',    atk: '4', hit: '3+', dmg: '4/5', wr: '–' },
  ],
  [
    { name: 'Hunter', description: 'This operative can perform a Charge action while it has a Conceal order.' },
    { name: 'Weathered', description: 'Once per turning point, when this operative is fighting or retaliating, in the Resolve Attack Dice step, you can ignore the damage inflicted on it from one normal success.' },
  ],
  'INQUISITORIAL AGENT, IMPERIUM, INQUISITION, DEATH WORLD VETERAN'
);

card('ENLIGHTENER AGENT', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Autopistol',    atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Paired blades', atk: '4', hit: '3+', dmg: '3/5', wr: 'Balanced, Rending' },
  ],
  [
    { name: 'No Escape', description: 'Whenever an enemy operative would perform the Fall Back action while within control Range of this operative, you can use this rule. If you do, roll one D6, subtracting 1 from the result if that enemy operative has a higher Wounds stat than this operative, and adding 1 if that enemy operative is wounded: on a 4+, that enemy operative cannot perform that action during that activation or counteraction (the AP spent on it isn\'t refunded).' },
    { name: 'Extract Information', description: 'Whenever an enemy operative is incapacitated within this operative\'s control Range, you gain 1CP.' },
  ],
  'INQUISITORIAL AGENT, IMPERIUM, INQUISITION, ENLIGHTENER'
);

card('GUN SERVITOR', 'Warrior',
  { APL: '1', MOVE: '5"', SAVE: '4+', WOUNDS: '11' },
  [
    { name: 'Heavy bolter – Focused',    atk: '5', hit: '4+', dmg: '4/5', wr: 'Heavy (Dash only), Piercing Crits 1' },
    { name: 'Heavy bolter – Sweeping',   atk: '4', hit: '4+', dmg: '4/5', wr: 'Heavy (Dash only), Piercing Crits 1, Torrent 1' },
    { name: 'Multi-melta',               atk: '4', hit: '4+', dmg: '6/3', wr: 'Devastating 4, Heavy (Dash only), Piercing 2' },
    { name: 'Plasma cannon – Standard',  atk: '4', hit: '4+', dmg: '4/6', wr: 'Blast 2, Heavy (Dash only), Piercing 1' },
    { name: 'Plasma cannon – Supercharge', atk: '4', hit: '4+', dmg: '5/6', wr: 'Blast 2, Heavy (Dash only), Hot, Lethal 5+, Piercing 1' },
    { name: 'Servo claw',                atk: '3', hit: '4+', dmg: '4/5', wr: '–' },
  ],
  [
    { name: 'Lobotomised', description: 'Whenever this operative is activated, if it\'s visible to and within 3" of another friendly INQUISITORIAL AGENT operative (excluding GUN SERVITOR) or vice versa, add 1 to this operative\'s APL stat until the end of that activation.' },
  ],
  'INQUISITORIAL AGENT, IMPERIUM, INQUISITION, GUN SERVITOR'
);

card('HEXORCIST AGENT', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Shotgun', atk: '4', hit: '3+', dmg: '3/3', wr: 'Range 6"' },
    { name: 'Fists',   atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Hexorcise', description: 'Whenever an enemy operative is visible to and within 6" of this operative, your opponent cannot re-roll their attack or defence dice for that operative.' },
    { name: 'CHASTEN (1AP)', description: 'Select one enemy operative that\'s a valid target for this operative and within 6" of it, then select one additional rule (including a unique action) that enemy operative has on its datacard (excluding a weapon rule or a rule that states it is ignored for the kill/elimination op). Until the end of that enemy operative\'s next activation, it\'s treated as not having that additional rule. This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'INQUISITORIAL AGENT, IMPERIUM, INQUISITION, HEXORCIST'
);

card('MYSTIC AGENT', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Autopistol', atk: '4', hit: '2+', dmg: '2/3', wr: 'Range 8", Seek' },
    { name: 'Fists',      atk: '3', hit: '5+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Icon Bearer', description: 'Whenever determining control of a marker, treat this operative\'s APL stat as 1 higher. Note this isn\'t a change to its APL stat, so any changes are cumulative with this.' },
    { name: 'Lightly Armed', description: 'This operative cannot use any weapons that aren\'t on its datacard.' },
    { name: 'SCRY (1AP)', description: 'PSYCHIC. Select one friendly INQUISITORIAL AGENT operative within 6" of this operative, then select one of the following effects to last until the start of this operative\'s next activation, until it\'s incapacitated or until it performs this action again (whichever comes first):\n• Guidance: PSYCHIC. Whenever the selected operative is shooting, fighting, or retaliating, in the Roll Attack Dice step, you can retain one of your fails as a normal success instead of discarding it, or retain one of your normal successes as a critical success instead.\n• Protection: PSYCHIC. Whenever an operative is shooting the selected operative, in the Roll Defence Dice step, you can retain one of your fails as a normal success instead of discarding it, or retain one of your normal successes as a critical success instead.\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'INQUISITORIAL AGENT, IMPERIUM, INQUISITION, PSYKER, MYSTIC'
);

card('PENAL LEGIONNAIRE AGENT', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Hand flamer', atk: '4', hit: '2+', dmg: '3/3', wr: 'Range 6", Torrent 1, Saturate' },
    { name: 'Chainsword',  atk: '4', hit: '4+', dmg: '4/5', wr: '–' },
  ],
  [
    { name: 'Chem-mask', description: 'You can ignore any changes to this operative\'s APL stat, and any changes to its stats from being injured. This operative is not affected by enemy operatives\' Shock and Stun weapon rules.' },
    { name: 'Cruel', description: 'Whenever this operative is shooting against, fighting against or retaliating against a wounded enemy operative, this operative\'s weapons have the Relentless weapon rule.' },
  ],
  'INQUISITORIAL AGENT, IMPERIUM, INQUISITION, PENAL LEGIONNAIRE'
);

card('PISTOLIER AGENT', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Scoped plasma pistol – Standard',    atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 12", Piercing 1' },
    { name: 'Scoped plasma pistol – Supercharge', atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 12", Hot, Lethal 5+, Piercing 1' },
    { name: 'Suppressed autopistol',              atk: '4', hit: '3+', dmg: '2/3', wr: 'Range 8", Silent' },
    { name: 'Fists',                              atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Pistolier', description: 'You can ignore any changes to the Hit stat of this operative\'s ranged weapons.' },
    { name: 'PISTOL BARRAGE (1APL)', description: 'Perform two free Shoot actions with this operative (this takes precedence over action restrictions). You must select a profile of its scoped plasma pistol for one action and its suppressed autopistol for the other (in any order). This operative cannot perform this action while it has a Conceal order, or during an activation in which it performed the Shoot action (or vice versa).' },
  ],
  'INQUISITORIAL AGENT, IMPERIUM, INQUISITION, PISTOLIER'
);

card('TEMPESTUS SCION GUNNER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Flamer',                              atk: '4', hit: '2+', dmg: '3/3', wr: 'Range 8", Saturate, Torrent 2' },
    { name: 'Grenade launcher – Frag',             atk: '4', hit: '3+', dmg: '2/4', wr: 'Blast 2' },
    { name: 'Grenade launcher – Krak',             atk: '4', hit: '3+', dmg: '4/5', wr: 'Piercing 1' },
    { name: 'Hot-shot volleygun – Focused',        atk: '5', hit: '3+', dmg: '3/4', wr: 'Piercing Crits 1' },
    { name: 'Hot-shot volleygun – Sweeping',       atk: '4', hit: '3+', dmg: '3/4', wr: 'Piercing Crits 1, Torrent 1' },
    { name: 'Meltagun',                            atk: '4', hit: '3+', dmg: '6/3', wr: 'Range 6", Devastating 4, Piercing 2' },
    { name: 'Plasma gun – Standard',               atk: '4', hit: '3+', dmg: '4/6', wr: 'Piercing 1' },
    { name: 'Plasma gun – Supercharge',            atk: '4', hit: '3+', dmg: '5/6', wr: 'Hot, Lethal 5+, Piercing 1' },
    { name: 'Gun butt',                            atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [],
  'INQUISITORIAL AGENT, IMPERIUM, ASTRA MILITARUM, TEMPESTUS SCIONS, GUNNER'
);

card('TEMPESTUS SCION MEDIC', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Hot-shot lasgun', atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Gun butt',        atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Medic!', description: 'The first time during each turning point that another friendly INQUISITORIAL AGENT operative would be incapacitated while visible to and within 3" of this operative, you can use this rule, providing neither this nor that operative is within control Range of an enemy operative. If you do, that friendly operative isn\'t incapacitated, has 1 wound remaining and cannot be incapacitated for the remainder of the action. After that action, that friendly operative can immediately perform a free Dash action, but must end that move within this operative\'s control Range. Subtract 1 from this and that operative\'s APL stats until the end of their next activations respectively, and if this rule was used during that friendly operative\'s activation, that activation ends. You cannot use this rule if this operative is incapacitated, or if it\'s a Shoot action and this operative would be a primary or secondary target.' },
    { name: 'MEDKIT (1APL)', description: 'Select one friendly INQUISITORIAL AGENT operative within this operative\'s control Range to regain up to 2D3 lost wounds. It cannot be an operative that the Medic! rule was used on during this turning point. This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'INQUISITORIAL AGENT, IMPERIUM, ASTRA MILITARUM, TEMPESTUS SCIONS, MEDIC'
);

card('TEMPESTUS SCION TROOPER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Hot-shot lasgun', atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Gun butt',        atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Adaptive Equipment', description: 'You can do each of the following once per turning point:\n• One friendly INQUISITORIAL AGENT TEMPESTUS SCION TROOPER operative can perform the Smoke Grenade action.\n• One friendly INQUISITORIAL AGENT TEMPESTUS SCION TROOPER operative can perform the Stun Grenade action.\nThe rules for these actions are found in universal equipment. Performing these actions using this rule doesn\'t count towards their action limits (i.e. if you also select those grenades from equipment).' },
  ],
  'INQUISITORIAL AGENT, IMPERIUM, ASTRA MILITARUM, TEMPESTUS SCIONS, TROOPER'
);

card('TEMPESTUS SCION VOX-OPERATOR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '6+', WOUNDS: '8' },
  [
    { name: 'Hot-shot lasgun', atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Gun butt',        atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'SIGNAL (1APL)', description: 'SUPPORT. Select one friendly INQUISITORIAL AGENT operative in the killzone. Until the end of that operative\'s next activation, add 1 to its APL stat. This operative can perform this action twice during its activation, but cannot perform this action while within control Range of an enemy operative.' },
  ],
  'INQUISITORIAL AGENT, IMPERIUM, ASTRA MILITARUM, TEMPESTUS SCIONS, VOX-OPERATOR'
);

card('SISTER OF SILENCE PROSECUTOR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '3+', WOUNDS: '8' },
  [
    { name: 'Boltgun',   atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Gun butt',  atk: '4', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Psychic Null', description: 'PSYCHIC ranged weapons cannot inflict damage on this operative. For the effects of PSYCHIC actions, this operative cannot be selected and is never treated as being within those actions\' required distances. Whenever an operative is within 6" of this operative:\n• That operative cannot perform PSYCHIC actions or use PSYCHIC additional rules.\n• That operative cannot use PSYCHIC ranged weapons.\n• PSYCHIC melee weapons have no weapon rules and cannot have Dmg stats higher than 3/4.' },
  ],
  'INQUISITORIAL AGENT, IMPERIUM, ANATHEMA PSYKANA, SISTER OF SILENCE, PROSECUTOR'
);

card('SISTER OF SILENCE VIGILATOR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '3+', WOUNDS: '8' },
  [
    { name: 'Executioner greatblade', atk: '4', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Psychic Null', description: 'PSYCHIC ranged weapons cannot inflict damage on this operative. For the effects of PSYCHIC actions, this operative cannot be selected and is never treated as being within those actions\' required distances. Whenever an operative is within 6" of this operative:\n• That operative cannot perform PSYCHIC actions or use PSYCHIC additional rules.\n• That operative cannot use PSYCHIC ranged weapons.\n• PSYCHIC melee weapons have no weapon rules and cannot have Dmg stats higher than 3/4.' },
  ],
  'INQUISITORIAL AGENT, IMPERIUM, ANATHEMA PSYKANA, SISTER OF SILENCE, VIGILATOR'
);

card('SISTER OF SILENCE WITCHSEEKER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '3+', WOUNDS: '8' },
  [
    { name: 'Flamer',   atk: '4', hit: '2+', dmg: '3/3', wr: 'Range 8", Saturate, Torrent 2' },
    { name: 'Gun butt', atk: '4', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Psychic Null', description: 'PSYCHIC ranged weapons cannot inflict damage on this operative. For the effects of PSYCHIC actions, this operative cannot be selected and is never treated as being within those actions\' required distances. Whenever an operative is within 6" of this operative:\n• That operative cannot perform PSYCHIC actions or use PSYCHIC additional rules.\n• That operative cannot use PSYCHIC ranged weapons.\n• PSYCHIC melee weapons have no weapon rules and cannot have Dmg stats higher than 3/4.' },
  ],
  'INQUISITORIAL AGENT, IMPERIUM, ANATHEMA PSYKANA, SISTER OF SILENCE, WITCHSEEKER'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Inquisitorial Agents populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
