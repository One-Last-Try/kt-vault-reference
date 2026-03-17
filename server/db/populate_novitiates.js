import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Novitiates'").get()?.id;
if (!FACTION_ID) { console.error('Novitiates faction not found'); process.exit(1); }

// Clear existing Novitiates data
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
  `1 NOVITIATE SUPERIOR operative with one of the following options:
• Plasma pistol; power weapon
• Relic boltgun; gun butt
• Relic bolt pistol; power weapon

9 NOVITIATE operatives selected from the following list:
• CONDEMNOR
• DIALOGUS
• DUELLIST
• EXACTOR
• HOSPITALLER
• PENITENT
• PRECEPTOR
• PRONATUS
• PURGATUS
• RELIQUARIUS
• MILITANT with one of the following options:
  - Autopistol; Novitiate blade
  - Autogun; Gun butt

Other than MILITANT and PURGATUS operatives, your kill team can only include each operative on this list once. Your kill team can only include up to two PURGATUS operatives.`);

rule('faction_rules', null, 'ACTS OF FAITH', 0,
  `In the Ready step of each Strategy phase, you gain a number of Faith points equal to half the number of friendly NOVITIATE operatives that haven't been incapacitated (rounding up). Whenever a friendly NOVITIATE operative is shooting, fighting or retaliating, or an operative is shooting it, in the Roll Attack Dice (or Roll Defence Dice step if an operative is shooting it), you can spend your Faith points to use one ACT OF FAITH. You cannot use more than one ACT OF FAITH per sequence, and their costs and effects are as follows:

GUIDANCE — 1 FAITH POINT
You can re-roll one of your dice.

BLESSING — 2 FAITH POINTS
You can retain one of your normal successes as a critical success instead.

INTERVENTION — 3 FAITH POINTS
You can retain one of your fails as a normal success instead of discarding it.`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'ARDENT VENGEANCE', 1,
  'Whenever a friendly NOVITIATE operative is shooting against, fighting against or retaliating against an expended enemy operative, that friendly operative\'s weapons have the Punishing weapon rule.');

rule('ploy', 'Strategy', 'BLESSED REJUVENATION', 1,
  'Whenever you spend Faith points, at the end of that action, the friendly operative you spent them on can regain up to D3 lost wounds. Note this ploy has no effect if the ACT OF FAITH doesn\'t cost any Faith points, e.g. Auto-chastisers equipment.');

rule('ploy', 'Strategy', 'DEFENDERS OF THE FAITH', 1,
  'Whenever an operative is shooting against, fighting against or retaliating against a friendly NOVITIATE operative that contests an objective marker or one of your mission markers, in the Resolve Attack Dice step of that sequence, you can halve the damage inflicted (rounding up and to a minimum of 2) on that friendly operative from one normal success.');

rule('ploy', 'Strategy', 'RIGHTEOUS ADVANCE', 1,
  'Up to one third of the friendly NOVITIATE operatives in the killzone (rounding down, to a minimum of 1) can immediately perform a free Dash action in an order of your choice, but each that does so must end that move closer to its closest enemy operative, its closest objective marker or your opponent\'s drop zone (you can choose separately for each). You cannot use this ploy during the first turning point.');

rule('ploy', 'Firefight', 'GLORIOUS MARTYRDOM', 1,
  'Use this firefight ploy when a friendly NOVITIATE operative is incapacitated, before it\'s removed from the killzone.. For each enemy operative visible to and within 2" of it, you gain 1 Faith point and inflict D3 damage on that enemy operative (roll separately for each).');

rule('ploy', 'Firefight', 'BLAZING INFERNO', 1,
  `Use this firefight ploy when a friendly NOVITIATE operative is shooting with a Ministorum flamer and you inflict damage with any critical successes. The target gains one of your Blaze tokens (if it doesn't already have one). Whenever an operative that has one of your Blaze tokens is activated:
• Inflict D3 damage on it.
• Its controlling player can subtract 1 from that operative's APL stat until the end of that activation to remove that token. Note that this must be done before that operative performs any actions during that activation.`);

rule('ploy', 'Firefight', 'BLINDING AURA', 1,
  'Use this firefight ploy when an enemy operative is performing the Shoot action and selects a friendly NOVITIATE operative as the valid target. Until the end of that activation/counteraction, while that friendly operative is more than 2" from that enemy operative, your opponent cannot select it as a valid target. If there are no other valid targets that your opponent can select, that action ends (it\'s not cancelled, so that operative has still performed it). Note this ploy has no effect if it\'s not the selected operative, e.g. if it\'s a secondary target from the Blast weapon rule.');

rule('ploy', 'Firefight', 'GUIDED BY FAITH', 1,
  'Use this firefight ploy when a friendly NOVITIATE operative is performing the Shoot action and you\'re selecting a ranged weapon. Until the end of that action, whenever that operative is shooting an operative within 6" of it, that weapon has the Seek Light weapon rule');

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

rule('equipment', null, 'ICON OF FAITH', 0,
  'Once per turning point, you can use up to two ACTS OF FAITH during a sequence, but each one must be different. This takes precedence over the normal ACTS OF FAITH rules.');

rule('equipment', null, 'SANCTIFIED ROUNDS', 0,
  'Whenever a friendly NOVITIATE operative is shooting with an autogun, autopistol, relic bolt pistol or relic boltgun, if you spend a Faith point, that weapon has the Piercing Crits 1 weapon rule until the end of that sequence.');

rule('equipment', null, 'AUTO-CHASTISER', 0,
  'Once per turning point, when a friendly NOVITIATE operative is shooting, fighting or retaliating, in the Roll Attack Dice step, you can inflict 1-3 damage on that friendly operative (but not enough to incapacitate it). If you do, you can use one ACT OF FAITH for free during that sequence with a Faith points cost no more than the damage you inflicted from this rule.');

rule('equipment', null, 'HOLY EMBROCATIONS', 0,
  'You can ignore any changes to the Move stat of friendly NOVITIATE operatives from being injured.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('NOVITIATE SUPERIOR', 'Leader',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '9' },
  [
    { name: 'Plasma pistol – Standard',    atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 8", Piercing 1' },
    { name: 'Plasma pistol – Supercharge', atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 8", Hot, Lethal 5+, Piercing 1' },
    { name: 'Relic bolt pistol',           atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 8", Lethal 5+' },
    { name: 'Relic boltgun',               atk: '4', hit: '3+', dmg: '3/5', wr: 'Lethal 5+' },
    { name: 'Gun butt',                    atk: '3', hit: '3+', dmg: '2/3', wr: '–' },
    { name: 'Power weapon',                atk: '4', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Inspirational Example', description: 'Whenever this operative incapacitates an enemy operative, you gain 1 Faith point, or 2 Faith points if that enemy operative had a Wounds stat of 12 or more. This rule has no effect when using the Glorious Martyrdom firefight ploy.' },
  ],
  'NOVITIATE, IMPERIUM, ADEPTA SORORITAS, LEADER, SUPERIOR'
);

card('NOVITIATE PENITENT', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Autopistol',             atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Penitent eviscerator',   atk: '4', hit: '4+', dmg: '5/6', wr: 'Brutal, Zealous Rage*' },
  ],
  [
    { name: 'Absolution Through Destruction', description: 'Whenever this operative performs the Fight action, if it isn\'t incapacitated, it can immediately perform a free Fight action afterwards. This takes precedence over action restrictions, and you cannot perform more than two Fight actions in succession as a result of this rule. If this operative is benefiting from the effects of the Whip Into Frenzy action (see EXACTOR), this applies to each of the Fight actions from those effects.' },
  ],
  'NOVITIATE, IMPERIUM, ADEPTA SORORITAS, PENITENT'
);

card('NOVITIATE PURGATUS', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Ministorum flamer', atk: '4', hit: '2+', dmg: '4/4', wr: 'Range 8", Saturate, Torrent 2' },
    { name: 'Gun butt',          atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Purge with Flame', description: 'Once per turning point, you can use the Inferno firefight ploy for 0CP if this is the specified friendly NOVITIATE operative.' },
  ],
  'NOVITIATE, IMPERIUM, ADEPTA SORORITAS, PURGATUS'
);

card('NOVITIATE PRONATUS', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Autopistol', atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Gun butt',   atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Relic Seeker', description: 'Once during each of this operative\'s activations, it can perform the Pick Up Marker, Place Marker or a mission action for 1 less AP.' },
    { name: 'Divine Acquisition', description: 'Once per turning point, when this operative performs a mission action that requires it to control an objective or mission marker, you gain a number of Faith points equal to the turning point number.' },
  ],
  'NOVITIATE, IMPERIUM, ADEPTA SORORITAS, PRONATUS'
);

card('NOVITIATE EXACTOR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Neural whips (ranged)', atk: '5', hit: '3+', dmg: '2/3', wr: 'Range 3", Lethal 5+, Stun' },
    { name: 'Neural whips (melee)',  atk: '5', hit: '3+', dmg: '2/3', wr: 'Lethal 5+, Shock' },
  ],
  [
    { name: 'WHIP INTO FRENZY (1AP)', description: 'Select one other friendly NOVITIATE operative (excluding SUPERIOR) visible to and within 3" of this operative that isn\'t currently benefitting from the effects of this action. Until the end of that operative\'s next activation, add 1" to its Move stat, it can perform two Fight actions during its next activation, and one of them can be free.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'NOVITIATE, IMPERIUM, ADEPTA SORORITAS, EXACTOR'
);

card('NOVITIATE RELIQUARIUS', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Autopistol', atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Gun butt',   atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Icon Bearer', description: 'Whenever determining control of a marker, treat this operative\'s APL stat as 1 higher. Note this isn\'t a change to its APL stat, so any changes are cumulative with this.' },
    { name: 'RAISE ICON (1AP)', description: 'You gain 1 Faith point. If this operative controls an objective marker, you also gain a number of Faith points equal to the turning point number.\n\nThis operative can only perform this action once per turning point, and cannot perform it while within control Range of an enemy operative.' },
  ],
  'NOVITIATE, IMPERIUM, ADEPTA SORORITAS, RELIQUARIUS'
);

card('NOVITIATE HOSPITALLER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Autopistol',    atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Surgical saw',  atk: '4', hit: '4+', dmg: '2/3', wr: 'Lethal 5+, Rending' },
  ],
  [
    { name: 'Medic!', description: 'The first time during each turning point that another friendly NOVITIATE operative would be incapacitated while visible to and within 3" of this operative, you can use this rule, providing neither this nor that operative is within control Range of an enemy operative. If you do, that friendly operative isn\'t incapacitated and has 1 wound remaining and cannot be incapacitated for the remainder of the action. After that action, that friendly operative can then immediately perform a free Dash action, but must end that move within this operative\'s control Range. Subtract 1 from this and that operative\'s APL stats until the end of their next activations respectively, and if this rule was used during that friendly operative\'s activation, that activation ends. You cannot use this rule if this operative is incapacitated, or if it\'s a Shoot action and this operative would be a primary or secondary target.' },
    { name: 'CHIRURGEON\'S TOOLS (1AP)', description: 'Select one friendly NOVITIATE operative within this operative\'s control Range to regain up to 2D3 lost wounds. It cannot be an operative that the Medic! rule was used on during this turning point.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'NOVITIATE, IMPERIUM, ADEPTA SORORITAS, HOSPITALLER'
);

card('NOVITIATE PRECEPTOR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Mace of the Righteous', atk: '4', hit: '4+', dmg: '5/5', wr: 'Brutal, Severe' },
  ],
  [
    { name: 'Unflinching Example', description: 'Whenever this operative incapacitates a ready enemy operative within its control Range, you gain 1 Faith point, or 2 Faith points if that enemy operative had a Wounds stat of 12 or more.' },
    { name: 'Glorious Hymnal: SUPPORT', description: 'Whenever a friendly NOVITIATE operative is within 3" of this operative, that friendly operative\'s weapons have the Severe weapon rule.' },
  ],
  'NOVITIATE, IMPERIUM, ADEPTA SORORITAS, PRECEPTOR'
);

card('NOVITIATE DIALOGUS', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Autopistol',     atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Dialogus stave', atk: '4', hit: '4+', dmg: '3/3', wr: 'Shock' },
  ],
  [
    { name: 'STIRRING RHETORIC (1AP)', description: 'SUPPORT. Select one other friendly NOVITIATE operative visible to and within 6" of this operative, or within 6" of your Auto-broadcaster marker. Until the end of that operative\'s next activation, add 1 to its APL stat (to a maximum of 3 after all APL stat changes have been totalled).\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
    { name: 'AUTO-BROADCASTER (0AP)', description: 'If your Auto-broadcaster marker isn\'t in the killzone, place it within 8" horizontally of this operative; otherwise, move your Auto-broadcaster marker up to 8" horizontally. If this operative is removed from the killzone, remove your Auto-broadcaster marker from the killzone.\n\nWhenever an enemy operative within 3" of your Auto-broadcaster marker is shooting, fighting or retaliating, your opponent cannot re-roll their attack dice.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'NOVITIATE, IMPERIUM, ADEPTA SORORITAS, DIALOGUS'
);

card('NOVITIATE DUELLIST', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Autopistol',      atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Duelling blades', atk: '4', hit: '3+', dmg: '4/5', wr: 'Ceaseless, Riposte*' },
  ],
  [],
  'NOVITIATE, IMPERIUM, ADEPTA SORORITAS, DUELLIST'
);

card('NOVITIATE CONDEMNOR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Condemnor stakethrower', atk: '4', hit: '3+', dmg: '3/3', wr: 'Devastating 2, Piercing Crits 1, Silent, Anti-PSYKER*' },
    { name: 'Null rod',               atk: '4', hit: '4+', dmg: '3/3', wr: 'Shock, Anti-PSYKER*' },
  ],
  [
    { name: 'Null Rod', description: 'PSYCHIC ranged weapons cannot inflict damage on this operative. For the effects of PSYCHIC actions, this operative cannot be selected and is never treated as being within those actions\' required distances. Whenever an operative is within 6" of this operative:\n• That operative cannot perform PSYCHIC actions or use PSYCHIC additional rules.\n• That operative cannot use PSYCHIC ranged weapons.\n• PSYCHIC melee weapons have no weapon rules and cannot have Dmg stats higher than 3/4.' },
  ],
  'NOVITIATE, IMPERIUM, ADEPTA SORORITAS, CONDEMNOR'
);

card('NOVITIATE MILITANT', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Autogun',          atk: '4', hit: '4+', dmg: '2/3', wr: '–' },
    { name: 'Autopistol',       atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Gun butt',         atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
    { name: 'Novitiate blade',  atk: '4', hit: '4+', dmg: '4/5', wr: '–' },
  ],
  [
    { name: 'Militant Faith', description: 'Whenever this operative is shooting, fighting or retaliating, if you use an ACT OF FAITH during that sequence and an enemy operative is incapacitated, the Faith points spent on that ACT OF FAITH are refunded. If you use the Icon of Faith equipment, Faith points are only refunded for one of those ACTS OF FAITH (your choice).' },
  ],
  'NOVITIATE, IMPERIUM, ADEPTA SORORITAS, MILITANT'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Novitiates populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
