import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Hearthkyn Salvagers'").get()?.id;
if (!FACTION_ID) { console.error('Hearthkyn Salvagers faction not found'); process.exit(1); }

// Clear existing Hearthkyn Salvagers data
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
  'Archetypes: SECURITY, RECON');

rule('faction_rules', null, 'OPERATIVES', 0,
  `1 HEARTHKYN SALVAGER THEYN operative with one option from each of the following:
• Autoch-pattern bolt pistol, Autoch-pattern bolter, bolt revolver, EtaCarn plasma pistol, ion blaster or ion pistol
• Concussion gauntlet or plasma weapon

9 HEARTHKYN SALVAGER operatives selected from the following list:
• DÔZR
• FIELD MEDIC
• GRENADIER
• JUMP PACK WARRIOR
• KINLYNK*
• KOGNITÂAR*
• LOKÂTR*
• LUGGER
• WARRIOR*
• GUNNER with one of the following options:
  - EtaCarn plasma beamer; fists
  - HYLas auto rifle; fists
  - HYLas rotary cannon; fists
  - L7 missile launcher; fists
  - Magna rail rifle; fists

* With one of the following options:
• Autoch-pattern bolter; fists
• Ion blaster; fists

Other than GUNNER and WARRIOR operatives, your kill team can only include each operative on this list once. Your kill team can only include up to three GUNNER operatives (each must have a different option).`);

rule('faction_rules', null, 'GRUDGE', 0,
  `Whenever an enemy operative incapacitates a friendly HEARTHKYN SALVAGER operative, that enemy operative gains one of your Grudge tokens for the battle. Whenever a friendly HEARTHKYN SALVAGER operative is shooting against, fighting against or retaliating against an enemy operative, for each of your Grudge tokens that enemy operative has, you can retain one of your normal successes as a critical success instead (including any normal successes already retained as a result of the Accurate weapon rule). Note that Grudge tokens aren\'t removed when you do this.`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'NEED KEEPS', 1,
  `Select one objective marker or one of your mission markers.
• Whenever determining control of that marker, treat the total APL stat of friendly HEARTHKYN SALVAGER operatives that contest it as 1 higher if at least one friendly HEARTHKYN SALVAGER operative contests that marker. Note this isn\'t a change to the APL stat, so any changes are cumulative with this.
• Whenever a friendly HEARTHKYN SALVAGER operative is within 3" of that marker, add 1 to the Atk stat of its melee weapons (to a maximum of 4); if the weapon already has an Atk stat of 4, it has the Balanced weapon rule.`);

rule('ploy', 'Strategy', 'TOIL EARNS', 1,
  `Select one objective marker or one of your mission markers. Whenever an enemy operative is within 3" of that marker, treat it as having one additional Grudge token.`);

rule('ploy', 'Strategy', 'WROUGHT DEFENCE', 1,
  `Whenever an operative is shooting a friendly HEARTHKYN SALVAGER operative, if you rolled one or less successes (including any re-rolls), you can retain one of your fails as a normal success instead of discarding it.`);

rule('ploy', 'Strategy', 'PROXIMATE FIREPOWER', 1,
  `Whenever a friendly HEARTHKYN SALVAGER operative is shooting an enemy operative within 6" of it, improve the Hit stat of that friendly operative\'s ranged weapons by 1 (to a maximum of 3+).`);

rule('ploy', 'Firefight', 'THE ANCESTORS ARE WATCHING', 1,
  `Use this firefight ploy during a friendly HEARTHKYN SALVAGER operative\'s activation. Until the end of that activation, that operative can perform either a free Shoot or a free Fight action.`);

rule('ploy', 'Firefight', 'WORTH IT', 1,
  `Use this firefight ploy when a friendly HEARTHKYN SALVAGER operative is incapacitated. It can perform a free mission action before it\'s removed from the killzone.`);

rule('ploy', 'Firefight', 'STURDY', 1,
  `Use this firefight ploy when an operative is shooting a friendly HEARTHKYN SALVAGER operative, when you collect your defence dice. Change the attacker\'s retained critical successes to normal successes (any weapon rules they\'ve already resolved aren\'t affected, e.g. Piercing Crits).`);

rule('ploy', 'Firefight', 'ENGAGE TO ACQUIRE', 1,
  `Use this firefight ploy after rolling your attack dice for a friendly HEARTHKYN SALVAGER operative, if it\'s shooting against or fighting against an enemy operative that controls an objective marker or one of your mission markers. You can re-roll any of your attack dice.`);

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

rule('equipment', null, 'PLASMA KNIVES', 0,
  `Friendly HEARTHKYN SALVAGER operatives have the following melee weapon. Note that the FIELD MEDIC operative already has this weapon but with better stats; in that instance, use the better version:

Plasma Knife: ATK 3, HIT 4+, DMG 3/5, WR: Lethal 5+`);

rule('equipment', null, 'EXCAVATION TOOL', 0,
  `Friendly HEARTHKYN SALVAGER operatives can perform the Pick Up Marker action for 1 less AP, and don\'t have to control the marker to do so (taking precedence over that action\'s conditions – they only need to contest the marker).`);

rule('equipment', null, 'CLIMBING RIGS', 0,
  `During each friendly HEARTHKYN SALVAGER operative\'s activation, you can do one of the following:
• When that operative is climbing up, you can treat the vertical distance as 2" (regardless of how far the operative actually moves vertically).
• When that operative is dropping, ignore the vertical distance.`);

rule('equipment', null, 'WRIT OF CLAIM', 0,
  `Once per battle, if friendly HEARTHKYN SALVAGER operatives contest two or more objective markers, after rolling off to decide initiative, you can use this rule. If you do you can re-roll your dice.
• Add 1 to your result for each objective marker friendly HEARTHKYN SALVAGER operatives contest.
• Add 1 to your result for each objective marker friendly HEARTHKYN SALVAGER operatives control. Note this is cumulative with the above (if they control the marker, they also contest it).`);

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('HEARTHKYN THEYN', 'Leader',
  { APL: '2', MOVE: '5"', SAVE: '3+', WOUNDS: '9' },
  [
    { name: 'Autoch-pattern bolt pistol', atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Accurate 1' },
    { name: 'Autoch-pattern bolter',      atk: '4', hit: '4+', dmg: '3/4', wr: 'Accurate 1' },
    { name: 'Bolt revolver',              atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 8"' },
    { name: 'EtaCarn plasma pistol',      atk: '4', hit: '4+', dmg: '3/5', wr: 'Range 8", Piercing 1' },
    { name: 'Ion blaster',                atk: '4', hit: '4+', dmg: '3/4', wr: 'Piercing Crits 1' },
    { name: 'Ion pistol',                 atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Piercing Crits 1' },
    { name: 'Concussion gauntlet',        atk: '4', hit: '4+', dmg: '5/7', wr: 'Brutal, Shock' },
    { name: 'Plasma weapon',              atk: '4', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Eye of the Ancestors', description: 'STRATEGIC GAMBIT if this operative is in the killzone. Select one enemy operative, or up to two enemy operatives if three or more friendly HEARTHKYN SALVAGER operatives are incapacitated. Each of those enemy operatives gains one of your Grudge tokens.' },
    { name: 'Weavefield Crest', description: 'Once per battle, when an attack dice inflicts Normal Dmg on this operative, you can ignore that inflicted damage.' },
  ],
  'HEARTHKYN SALVAGER, LEAGUES OF VOTANN, LEADER, THEYN'
);

card('HEARTHKYN DÔZR', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '3+', WOUNDS: '8' },
  [
    { name: 'Autoch-pattern bolt pistol', atk: '4', hit: '4+', dmg: '3/4', wr: 'Range 8", Accurate 1' },
    { name: 'Concussion knux',            atk: '4', hit: '3+', dmg: '4/4', wr: 'Ceaseless, Lethal 5+, Shock' },
  ],
  [
    { name: 'Brawler', description: 'Each time this operative fights in combat:\n• Enemy operatives cannot assist.\n• If it\'s incapacitated, you can strike the enemy operative in that sequence with one of your unresolved successes before it\'s removed from the killzone.\n• Normal Dmg of 4 or more inflicts 1 less damage on it.' },
    { name: 'KNUX SMASH (1AP)', description: 'Select one enemy operative within this operative\'s control Range. You can move that enemy operative up to 3" to a location it can be placed. Then inflict D3+1 damage on it (even if you don\'t move it); if the D3 result is 3, also subtract 1 from that enemy operative\'s APL stat until the end of its next activation. This operative can then immediately perform a free Charge action (even if it\'s already performed the Charge action during that activation), but cannot move more than 3" during that action. This operative cannot perform this action unless an enemy operative is within its control Range.' },
  ],
  'HEARTHKYN SALVAGER, LEAGUES OF VOTANN, DÔZR'
);

card('HEARTHKYN FIELD MEDIC', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '3+', WOUNDS: '8' },
  [
    { name: 'Bolt revolver',  atk: '4', hit: '4+', dmg: '3/5', wr: 'Range 8"' },
    { name: 'Plasma knife',   atk: '4', hit: '4+', dmg: '3/5', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Medic!', description: 'The first time during each turning point that another friendly HEARTHKYN SALVAGER operative would be removed from the killzone as incapacitated while visible to and within 3" of this operative, you can use this rule, providing neither this nor that operative is within control Range of an enemy operative. If you do, that friendly operative isn\'t incapacitated and has 1 wound remaining. That friendly operative can then immediately perform a free Dash action, but must end that move within this operative\'s control Range. Subtract 1 from this and that operative\'s APL stats until the end of their next activations respectively, and if this rule was used during that friendly operative\'s activation, that activation ends. You cannot use this rule if this operative is incapacitated.' },
    { name: 'MEDIKIT (1AP)', description: 'Select one friendly HEARTHKYN SALVAGER operative within this operative\'s control Range to regain up to 2D3 lost wounds. It cannot be an operative that the Medic! rule was used on during this turning point. This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'HEARTHKYN SALVAGER, LEAGUES OF VOTANN, MEDIC, FIELD MEDIC'
);

card('HEARTHKYN GRENADIER', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '3+', WOUNDS: '8' },
  [
    { name: 'Autoch-pattern bolt pistol', atk: '4', hit: '4+', dmg: '3/4', wr: 'Range 8", Accurate 1' },
    { name: 'C8 HX charge',               atk: '4', hit: '3+', dmg: '4/6', wr: 'Range 4", Blast 1", Heavy (Reposition only), Limited 1, Piercing 1, Saturate' },
    { name: 'Fists',                       atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Grenadier', description: 'This operative can use frag, krak, smoke and Stun grenades (see universal equipment). Doing so doesn\'t count towards any Limited uses you have (i.e. if you also select those grenades from equipment for other operatives). Whenever this operative is using a frag or krak grenade, improve the Hit stat of that weapon by 1.' },
    { name: 'VÁYR-3 UTILITY GRENADE (1AP)', description: 'Place one of your Utility Grenade markers within 6" of this operative. It must be visible to this operative, or on Vantage terrain of a terrain feature that\'s visible to this operative. Whenever an operative is within 3" of that Utility Grenade marker, its controlling player must spend 1 additional AP for that operative to perform the Pick Up Marker and mission actions. In the Ready step of the next Strategy phase, roll one D3. Remove that Utility Grenade marker after a number of activations equal to the result have been completed, or at the end of the turning point (whichever comes first). This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'HEARTHKYN SALVAGER, LEAGUES OF VOTANN, GRENADIER'
);

card('HEARTHKYN GUNNER', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '3+', WOUNDS: '8' },
  [
    { name: 'EtaCarn plasma beamer',        atk: '4', hit: '4+', dmg: '5/6', wr: 'Piercing 1, Beam*' },
    { name: 'HYLas auto rifle',             atk: '4', hit: '4+', dmg: '4/5', wr: 'Ceaseless, Rending' },
    { name: 'HYLas rotary cannon – Focused',   atk: '5', hit: '4+', dmg: '4/5', wr: 'Ceaseless, Heavy (Reposition only), Saturate' },
    { name: 'HYLas rotary cannon – Sweeping',  atk: '4', hit: '4+', dmg: '4/5', wr: 'Ceaseless, Heavy (Reposition only), Saturate, Torrent 1' },
    { name: 'L7 missile launcher – Blast',  atk: '4', hit: '4+', dmg: '3/5', wr: 'Blast 2' },
    { name: 'L7 missile launcher – Focused', atk: '4', hit: '4+', dmg: '5/6', wr: 'Piercing 1' },
    { name: 'Magna rail rifle',             atk: '4', hit: '4+', dmg: '4/2', wr: 'Devastating 3, Heavy (Dash only), Piercing 2' },
    { name: 'Fists',                        atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: '*Beam', description: 'Whenever this operative is shooting with this weapon, each retained critical success immediately inflicts D3 damage on each other operative along one (and only one) beam line (roll separately for each operative), but the target isn\'t affected. An operative is along a beam line if a targeting line can be drawn from this operative to its base, and that line crosses the base of the original target but doesn\'t cross Heavy terrain.' },
  ],
  'HEARTHKYN SALVAGER, LEAGUES OF VOTANN, GUNNER'
);

card('HEARTHKYN JUMP PACK WARRIOR', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '3+', WOUNDS: '8' },
  [
    { name: 'Autoch-pattern bolt pistol', atk: '4', hit: '4+', dmg: '3/4', wr: 'Range 8", Accurate 1' },
    { name: 'Plasma weapon',              atk: '4', hit: '3+', dmg: '4/6', wr: 'Lethal 5+, Force Impact*' },
  ],
  [
    { name: 'Jump Pack', description: 'Whenever this operative performs an action in which it moves, it can FLY. If it does, don\'t move it. Instead, remove it from the killzone and set it back up wholly within a distance equal to its Move stat (or 3" if it was a Dash) of its original location, measuring the horizontal distance only (in a killzone that uses the close quarters rules, e.g. Killzone: Gallowdark, this distance cannot be measured over or through Wall terrain, and that operative cannot be set up on the other side of an access point – in other words it cannot FLY through an open hatchway). Note that it gains no additional distance when performing the Charge action. It must be set up in a location it can be placed, and unless it\'s the Charge action, it cannot be set up within control Range of an enemy operative.' },
    { name: '*Force Impact', description: 'Whenever this operative is fighting with this weapon, if it\'s performed the Charge action during the activation, this weapon has the Brutal weapon rule.' },
  ],
  'HEARTHKYN SALVAGER, LEAGUES OF VOTANN, JUMP PACK WARRIOR'
);

card('HEARTHKYN KINLYNK', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '3+', WOUNDS: '8' },
  [
    { name: 'Autoch-pattern bolter', atk: '4', hit: '4+', dmg: '3/4', wr: 'Accurate 1' },
    { name: 'Ion blaster',           atk: '4', hit: '4+', dmg: '3/4', wr: 'Piercing Crits 1' },
    { name: 'Fists',                 atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'SIGNAL (1AP)', description: 'SUPPORT. Select one other friendly HEARTHKYN SALVAGER operative in the killzone. Until the end of that operative\'s next activation, add 1 to its APL stat. This operative cannot perform this action while within control Range of an enemy operative.' },
    { name: 'SYSTEM JAM (1AP)', description: 'Select one enemy operative that\'s a valid target for this operative and that doesn\'t have one of your System Jam tokens; it gains one. Until the end of the battle, whenever an enemy operative has one of your System Jam tokens, it cannot be activated until each enemy operative without one is expended. When an enemy operative that has one of your System Jam tokens is activated, remove that token. This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'HEARTHKYN SALVAGER, LEAGUES OF VOTANN, KINLYNK'
);

card('HEARTHKYN KOGNITÂAR', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '3+', WOUNDS: '8' },
  [
    { name: 'Autoch-pattern bolter', atk: '4', hit: '4+', dmg: '3/4', wr: 'Accurate 1' },
    { name: 'Ion blaster',           atk: '4', hit: '4+', dmg: '3/4', wr: 'Piercing Crits 1' },
    { name: 'Fists',                 atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Tactician', description: 'STRATEGIC GAMBIT if this operative is in the killzone. Place either your Attack or Defence marker in the killzone. Whenever a friendly HEARTHKYN SALVAGER operative is shooting against, fighting against or retaliating against an enemy operative that\'s within 3" of your Attack marker, that friendly operative\'s weapons have the Balanced weapon rule. Whenever an enemy operative is shooting a friendly HEARTHKYN SALVAGER operative that\'s within 3" of your Defence marker, you can re-roll one of your defence dice. In the Ready step of the next Strategy phase, remove that marker.' },
    { name: 'ACCELERATED APPRAISAL (1AP)', description: 'If your Attack or Defence marker is in the killzone, remove it. Place your Attack or Defence marker in the killzone. This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'HEARTHKYN SALVAGER, LEAGUES OF VOTANN, KOGNITÂAR'
);

card('HEARTHKYN LOKÂTR', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '3+', WOUNDS: '8' },
  [
    { name: 'Autoch-pattern bolter', atk: '4', hit: '4+', dmg: '3/4', wr: 'Accurate 1' },
    { name: 'Ion blaster',           atk: '4', hit: '4+', dmg: '3/4', wr: 'Piercing Crits 1' },
    { name: 'Fists',                 atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'SPOT (1AP)', description: 'SUPPORT. Select one enemy operative visible to this operative. Until the end of the turning point, whenever a friendly HEARTHKYN SALVAGER operative within 3" of this operative is shooting that enemy operative you can use this effect. If you do:\n• That friendly operative\'s ranged weapons have the Seek Light weapon rule.\n• That enemy operative cannot be obscured.\nThis operative cannot perform this action while within control Range of an enemy operative.' },
    { name: 'PAN SPECTRAL SCAN (1AP)', description: 'Place your Pan Spectral Scan marker in the killzone. Whenever a friendly HEARTHKYN SALVAGER operative is shooting an enemy operative that\'s within 3" of that marker, that friendly operative\'s ranged weapons have the Accurate 1 and Saturate weapon rules. When this operative is next activated, is incapacitated or performs this action again (whichever comes first), remove that marker. This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'HEARTHKYN SALVAGER, LEAGUES OF VOTANN, LOKÂTR'
);

card('HEARTHKYN LUGGER', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '3+', WOUNDS: '8' },
  [
    { name: 'Autoch-pattern bolter', atk: '4', hit: '4+', dmg: '3/4', wr: 'Accurate 1' },
    { name: 'Ion blaster',           atk: '4', hit: '4+', dmg: '3/4', wr: 'Piercing Crits 1' },
    { name: 'Fists',                 atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Well Supplied', description: 'You can select one additional equipment option.' },
    { name: 'I\'ve Got It', description: 'Once during each of this operative\'s activations, it can perform a mission action for 1 less AP.' },
  ],
  'HEARTHKYN SALVAGER, LEAGUES OF VOTANN, LUGGER'
);

card('HEARTHKYN WARRIOR', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '3+', WOUNDS: '8' },
  [
    { name: 'Autoch-pattern bolter', atk: '4', hit: '4+', dmg: '3/4', wr: 'Accurate 1' },
    { name: 'Ion blaster',           atk: '4', hit: '4+', dmg: '3/4', wr: 'Piercing Crits 1' },
    { name: 'Fists',                 atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Secure Salvage', description: 'Whenever an enemy operative is shooting against, fighting against or retaliating against this operative, if this operative contests an objective marker or one of your mission markers, in the Resolve Attack Dice step, you can subtract 1 from the damage inflicted on it from one success.' },
  ],
  'HEARTHKYN SALVAGER, LEAGUES OF VOTANN, WARRIOR'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Hearthkyn Salvagers populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
