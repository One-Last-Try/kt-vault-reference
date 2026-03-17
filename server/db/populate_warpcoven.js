import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Warpcoven'").get()?.id;
if (!FACTION_ID) { console.error('Warpcoven faction not found'); process.exit(1); }

// Clear existing Warpcoven data
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
  `5 WARPCOVEN operatives selected from the following list:
• SORCERER OF DESTINY¹
• SORCERER OF TEMPYRION¹
• SORCERER OF WARPFIRE¹
• RUBRIC MARINE GUNNER with one of the following options:
  - Warpflamer; fists
  - Soulreaper cannon²; fists
• RUBRIC MARINE ICON BEARER
• RUBRIC MARINE WARRIOR
• TZAANGOR CHAMPION³ with one of the following options:
  - Greataxe
  - Greatblade
• TZAANGOR HORN BEARER³
• TZAANGOR ICON BEARER³
• TZAANGOR WARRIOR³ with one of the following options:
  - Tzaangor blades
  - Tzaangor blade & shield
  - Autopistol; chainsword

¹ With force stave, PSYCHIC weapons on their datacard and one of the following options:
  - Inferno bolt pistol
  - Prosperine khopesh
  - Warpflame pistol²

² Your kill team can only include up to one warpflame pistol and up to one soulreaper cannon.

³ These operatives count as half a selection each.

You must select at least one friendly SORCERER operative. Other than WARRIOR operatives, your kill team can only include each operative on this list once.`);

rule('faction_rules', null, 'BOONS OF TZEENTCH', 0,
  `Whenever you select a SORCERER operative for the battle, you must select a BOON OF TZEENTCH (below) for it to have for the battle. You cannot select each BOON OF TZEENTCH more than once per battle.`);

rule('faction_rules', 'Boon of Tzeentch', 'INCORPOREAL SIGHT', 0,
  `This operative\'s ranged weapons have the Saturate weapon rule. Whenever this operative is shooting, enemy operatives cannot be obscured.`);

rule('faction_rules', 'Boon of Tzeentch', 'TIME-WALK', 0,
  `Add 1" to this operative\'s Move stat.`);

rule('faction_rules', 'Boon of Tzeentch', 'ECHOES FROM THE WARP', 0,
  `Once per battle, when you counteract with this operative, you can change its order, and it can perform an additional 1AP action for free during that counteraction, but both actions must be different.`);

rule('faction_rules', 'Boon of Tzeentch', 'WARP SWELL', 0,
  `Add 1 to the Normal Dmg stat of this operative\'s melee weapons.`);

rule('faction_rules', 'Boon of Tzeentch', 'IMMATERIAL FLIGHT', 0,
  `Once per turning point, when this operative is performing the Charge or Reposition action during its activation, it can FLY. If it does, don\'t move it. Instead, remove it from the killzone and set it back up wholly within a distance equal to its Move stat of its original location, measuring the horizontal distance only. In a killzone that uses the close quarters rules (e.g. Killzone: Gallowdark), this distance cannot be measured over or through Wall terrain, and that operative cannot be set up on the other side of an access point (in other words, it cannot FLY through an open hatchway). Note that it gains no additional distance when performing the Charge action. It must be set up in a location it can be placed, and unless it\'s the Charge action, it cannot be set up within control range of an enemy operative.`);

rule('faction_rules', 'Boon of Tzeentch', 'TWIST OF FATE', 0,
  `This operative\'s PSYCHIC ranged weapons have the Piercing Crits 1 weapon rule.`);

rule('faction_rules', 'Boon of Tzeentch', 'MUTANT APPENDAGE', 0,
  `Having an enemy operative within this operative\'s control range doesn\'t prevent it from performing the Pick Up Marker or mission actions. Once per activation, this operative can perform the Pick Up Marker, Place Marker or a mission action for 1 less AP.`);

rule('faction_rules', 'Boon of Tzeentch', 'ASTRAL BOMBARDMENT', 0,
  `Select one of this operative\'s PSYCHIC ranged weapons. That weapon has the Devastating 1 weapon rule. If you select a doombolt, it has the 2" Devastating 2 weapon rule instead of Devastating 2. If you select firestorm or mindburn (SORCERER OF WARPFIRE), whenever that operative performs the Shoot action, select the Seek Light or Devastating 1 weapon rule for that weapon to have until the end of the action (it cannot have both).`);

rule('faction_rules', 'Boon of Tzeentch', 'MASTER OF THE IMMATERIUM', 0,
  `Add 3" to the distance requirements of this operative\'s PSYCHIC actions that have a distance requirement. Note that for the SORCERER OF TEMPYRION\'s Temporal Flux action, this boon only affects the distance in the first effect of that rule.`);

rule('faction_rules', null, 'ASTARTES', 0,
  `During each friendly WARPCOVEN HERETIC ASTARTES operative\'s activation, it can perform either two Shoot actions or two Fight actions. If it\'s two Shoot actions and a soulreaper cannon or a warpflamer is selected for both, 1 additional AP must be spent for the second action. You cannot select the same PSYCHIC ranged weapon more than once per activation.

Each friendly WARPCOVEN HERETIC ASTARTES operative can counteract regardless of its order.`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'AETHERIAL WARDING', 1,
  `Whenever an operative is shooting a friendly WARPCOVEN operative, weapons with the Piercing 1 weapon rule have the Piercing Crits 1 weapon rule instead.`);

rule('ploy', 'Strategy', 'FATE ITSELF IS MY WEAPON', 1,
  `Roll two D6 and reserve them (put them to one side). In the following Firefight phase, whenever an operative is shooting, fighting or retaliating, after you or your opponent roll their attack dice, but before re-rolls, you can use one of your reserved dice to replace one of the D6 rolled for that sequence (yours or your opponent\'s); that replacement dice cannot be changed or re-rolled or retained as a success or critical success if it\'s not, and is discarded at the end of that sequence. Then, if the combined result of both reserved dice was less than 9, discard the other dice. You cannot use more than one reserved dice per sequence. Discard any remaining reserved dice at the end of the turning point.`);

rule('ploy', 'Strategy', 'BROTHERHOOD OF SORCERERS', 1,
  `Friendly WARPCOVEN SORCERER operatives\' PSYCHIC weapons have the Balanced weapon rule, or Ceaseless instead if another friendly WARPCOVEN SORCERER operative is within 9" of that operative.`);

rule('ploy', 'Strategy', 'SAVAGE HERD', 1,
  `Friendly WARPCOVEN TZAANGOR operatives\' melee weapons have the Accurate 1 weapon rule. Whenever a friendly WARPCOVEN TZAANGOR operative is assisted by a friendly WARPCOVEN operative, or is fighting while visible to and within 6" of a friendly WARPCOVEN SORCERER operative, that friendly WARPCOVEN TZAANGOR operative\'s melee weapons also have the Severe weapon rule.`);

rule('ploy', 'Firefight', 'CAPRICIOUS PLAN', 1,
  `Use this firefight ploy at the end of a friendly WARPCOVEN SORCERER operative\'s activation. That friendly operative can immediately perform a free Dash action (even if it\'s performed an action that prevents it from performing the Dash action), and/or you can change its order.`);

rule('ploy', 'Firefight', 'MUTANT HERD', 1,
  `Use this firefight ploy when a friendly WARPCOVEN TZAANGOR operative is activated. Select one other ready friendly WARPCOVEN TZAANGOR operative visible to and within 2" of it to activate at the same time. Complete their activations action by action in any order.`);

rule('ploy', 'Firefight', 'PSYCHIC CABAL', 1,
  `Use this firefight ploy when a friendly WARPCOVEN SORCERER operative is activated. Select one other friendly WARPCOVEN SORCERER operative visible to and within 9" of that operative, then select one of that other friendly operative\'s PSYCHIC unique actions or PSYCHIC ranged weapons for that first friendly operative to have until the end of its activation. You cannot select a PSYCHIC ranged weapon that has been used by that other friendly operative during this turning point, and that other friendly operative cannot use the selected weapon during this turning point.`);

rule('ploy', 'Firefight', 'ALL IS DUST', 1,
  `Use this firefight ploy when an attack dice inflicts Normal Dmg on a friendly WARPCOVEN RUBRIC MARINE operative. That attack dice inflicts 1 damage instead.`);

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

rule('equipment', null, 'ENSORCELLED ROUNDS', 0,
  `Friendly WARPCOVEN operatives\' inferno boltguns, inferno bolt pistols and autopistols have the Devastating 1 weapon rule.`);

rule('equipment', null, 'DAEMONMAW WEAPONS', 0,
  `Add 1 to the Atk stat of friendly WARPCOVEN RUBRIC MARINE operatives\' melee weapons. Whenever a friendly WARPCOVEN RUBRIC MARINE operative is retaliating, its melee weapons have the Accurate 1 weapon rule.`);

rule('equipment', null, 'ARCANE ROBES', 0,
  `Once per turning point, whenever an attack dice would inflict Critical Dmg on a friendly WARPCOVEN SORCERER operative, you can use this rule. If you do, that attack dice to inflict Normal Dmg instead. You cannot use this rule for each friendly WARPCOVEN SORCERER operative more than once per turning point.`);

rule('equipment', null, 'SORCEROUS SCROLLS', 0,
  `Once per battle, when a friendly WARPCOVEN SORCERER operative is activated or counteracts, you can select a different BOON OF TZEENTCH for it to have until the end of the battle (it loses any it previously had). It cannot be the same BOON OF TZEENTCH any other friendly operative has. This takes precedence over the normal Boons of Tzeentch rules.`);

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('SORCERER OF DESTINY', 'Leader',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '15' },
  [
    { name: 'Inferno bolt pistol',  atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Piercing 1' },
    { name: 'Warpflame pistol',     atk: '4', hit: '2+', dmg: '3/3', wr: 'Range 6", Piercing 1, Torrent 1"' },
    { name: 'Doombolt',             atk: '4', hit: '3+', dmg: '4/2', wr: 'PSYCHIC, Devastating 2, Lethal 5+' },
    { name: 'Force stave',          atk: '4', hit: '3+', dmg: '4/6', wr: 'PSYCHIC, Shock' },
    { name: 'Prosperine khopesh',   atk: '5', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
  ],
  [
    { name: 'PROTECTED BY FATE (1AP)', description: 'PSYCHIC. Select one friendly WARPCOVEN operative visible to this operative. Until the start of this operative\'s next activation, until it\'s incapacitated or until this action is performed again by a friendly operative (whichever comes first), whenever an operative is shooting that selected operative, you can re-roll any of your defence dice.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
    { name: 'RAVAGE DESTINY (1AP)', description: 'PSYCHIC. Select one enemy operative visible to and within 9" of this operative. Until the start of this operative\'s next activation, until it\'s incapacitated or until this action is performed again by a friendly operative (whichever comes first), whenever that enemy operative is shooting, fighting or retaliating, your opponent must re-roll their attack dice results of 6, and whenever determining control of a marker, treat that enemy operative\'s APL stat as 1 lower. Note this isn\'t a change to its APL stat, so any changes are cumulative with this.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'WARPCOVEN, CHAOS, HERETIC ASTARTES, PSYKER, SORCERER, DESTINY'
);

card('SORCERER OF TEMPYRION', 'Leader',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '15' },
  [
    { name: 'Fluxblast',            atk: '4', hit: '3+', dmg: '3/4', wr: 'PSYCHIC, Blast 2", Rending' },
    { name: 'Inferno bolt pistol',  atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Piercing 1' },
    { name: 'Warpflame pistol',     atk: '4', hit: '2+', dmg: '3/3', wr: 'Range 6", Piercing 1, Torrent 1"' },
    { name: 'Force stave',          atk: '4', hit: '3+', dmg: '4/6', wr: 'PSYCHIC, Shock' },
    { name: 'Prosperine khopesh',   atk: '5', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
  ],
  [
    { name: 'TEMPORAL FLUX (1AP)', description: 'PSYCHIC. Select one friendly WARPCOVEN operative visible to and within 6" of this operative and place your Temporal Flux marker within that operative\'s control Range.\n\nAt the end of that operative\'s next activation, if it hasn\'t been incapacitated and is still wholly within 6" of your Temporal Flux marker, remove that operative from the killzone and set it back up in a location it can be placed; when it\'s set back up, it must have your Temporal Flux marker within its control Range (or as close as possible). Then remove your Temporal Flux marker from the killzone. If that operative isn\'t wholly within 6" of your Temporal Flux marker (including if it\'s incapacitated), remove that marker from the killzone.\n\nThis operative cannot perform this action while within control Range of an enemy operative, or if your Temporal Flux marker is currently in the killzone.' },
    { name: 'RECONSTUTION RITUAL (1AP)', description: 'PSYCHIC. Select one friendly WARPCOVEN operative visible to and within 6" of this operative. That operative regains up to 2D3 lost wounds.\n\nThis operative cannot perform this action while within control Range of an enemy operative, or if a friendly operative has already performed this action during this turning point.' },
  ],
  'WARPCOVEN, CHAOS, HERETIC ASTARTES, PSYKER, SORCERER, TEMPYRION'
);

card('SORCERER OF WARPFIRE', 'Leader',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '15' },
  [
    { name: 'Inferno Bolt Pistol',  atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Piercing 1' },
    { name: 'Warpflame pistol',     atk: '4', hit: '2+', dmg: '3/3', wr: 'Range 6", Piercing 1, Torrent 1"' },
    { name: 'Mindburn',             atk: '5', hit: '4+', dmg: '1/1', wr: 'PSYCHIC, Lethal 5+, Saturate, Seek Light, Mindburn*' },
    { name: 'Firestorm',            atk: '5', hit: '4+', dmg: '2/3', wr: 'PSYCHIC, Saturate, Seek Light, Torrent 2"' },
    { name: 'Force stave',          atk: '4', hit: '3+', dmg: '4/6', wr: 'PSYCHIC, Shock' },
    { name: 'Prosperine khopesh',   atk: '5', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
  ],
  [
    { name: 'ALIGHT (1AP)', description: 'PSYCHIC. Select one enemy operative visible to this operative. Until the start of this operative\'s next activation, until it\'s incapacitated or until this action is performed again by a friendly operative (whichever comes first), that enemy operative gains one of your Alight tokens (if it doesn\'t already have one). Whenever a friendly WARPCOVEN operative is shooting against, fighting against or retaliating against an enemy operative that has one of your Alight tokens, that friendly operative\'s weapons have the Ceaseless weapon rule.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'WARPCOVEN, CHAOS, HERETIC ASTARTES, PSYKER, SORCERER, WARPFIRE'
);

card('RUBRIC MARINE GUNNER', 'Warrior',
  { APL: '3', MOVE: '5"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Soulreaper cannon (sweeping)', atk: '4', hit: '3+', dmg: '4/5', wr: 'Piercing 1, Torrent 1"' },
    { name: 'Soulreaper cannon (focused)',  atk: '5', hit: '3+', dmg: '4/5', wr: 'Piercing 1' },
    { name: 'Warpflamer',                   atk: '4', hit: '2+', dmg: '4/4', wr: 'Range 8", Saturate, Piercing 1, Torrent 2"' },
    { name: 'Fists',                        atk: '3', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Sorcerous Automata', description: 'Whenever this operative is activated, subtract 1 from its APL stat until the end of that activation, unless a friendly WARPCOVEN SORCERER operative is within 9" of it.' },
  ],
  'WARPCOVEN, CHAOS, HERETIC ASTARTES, RUBRIC MARINE, GUNNER'
);

card('RUBRIC MARINE ICON BEARER', 'Warrior',
  { APL: '3', MOVE: '5"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Inferno boltgun', atk: '4', hit: '3+', dmg: '3/4', wr: 'Piercing 1' },
    { name: 'Fists',           atk: '3', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Sorcerous Automata', description: 'Whenever this operative is activated, subtract 1 from its APL stat until the end of that activation, unless a friendly WARPCOVEN SORCERER operative is within 9" of it.' },
    { name: 'Icon Bearer', description: 'Whenever determining control of a marker, treat this operative\'s APL stat as 1 higher. Note this isn\'t a change to its APL stat, so any changes are cumulative with this.' },
  ],
  'WARPCOVEN, CHAOS, HERETIC ASTARTES, RUBRIC MARINE, ICON BEARER'
);

card('RUBRIC MARINE WARRIOR', 'Warrior',
  { APL: '3', MOVE: '5"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Inferno boltgun', atk: '4', hit: '3+', dmg: '3/4', wr: 'Piercing 1' },
    { name: 'Fists',           atk: '3', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Sorcerous Automata', description: 'Whenever this operative is activated, subtract 1 from its APL stat until the end of that activation, unless a friendly WARPCOVEN SORCERER operative is within 9" of it.' },
    { name: 'Slow and Purposeful', description: 'Whenever this operative is shooting, if it hasn\'t performed the Charge or Reposition action during the activation, or if it\'s a counteraction, its ranged weapons have the Ceaseless weapon rule. Note this operative isn\'t restricted from performing these actions after shooting.' },
  ],
  'WARPCOVEN, CHAOS, HERETIC ASTARTES, RUBRIC MARINE, WARRIOR'
);

card('TZAANGOR CHAMPION', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '10' },
  [
    { name: 'Greatblade', atk: '4', hit: '3+', dmg: '4/5', wr: 'Lethal 5+, Rending' },
    { name: 'Greataxe',   atk: '4', hit: '3+', dmg: '4/5', wr: 'Brutal, Lethal 5+' },
  ],
  [
    { name: 'Savage Brutality', description: 'The first time this operative performs the Fight action during each of its activations, if it isn\'t incapacitated, it can immediately perform a free Fight action afterwards (you don\'t have to select the same enemy operative to fight against). This takes precedence over action restrictions.' },
  ],
  'WARPCOVEN, CHAOS, TZAANGOR, CHAMPION'
);

card('TZAANGOR HORN BEARER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '9' },
  [
    { name: 'Dagger', atk: '4', hit: '4+', dmg: '3/5', wr: '–' },
  ],
  [
    { name: 'BRAYHORN (0AP)', description: 'Until the Ready step of the next Strategy phase, add 1" to the Move stat of friendly WARPCOVEN TZAANGOR operatives.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'WARPCOVEN, CHAOS, TZAANGOR, HORN BEARER'
);

card('TZAANGOR ICON BEARER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '9' },
  [
    { name: 'Dagger', atk: '4', hit: '4+', dmg: '3/5', wr: '–' },
  ],
  [
    { name: 'Herd Banner', description: 'Whenever an attack dice inflicts Normal damage of 3 or more on a friendly WARPCOVEN TZAANGOR operative that\'s visible to and within 3" of this operative, subtract 1 from that inflicted damage.' },
    { name: 'Icon Bearer', description: 'Whenever determining control of a marker, treat this operative\'s APL stat as 1 higher. Note this isn\'t a change to its APL stat, so any changes are cumulative with this.' },
  ],
  'WARPCOVEN, CHAOS, TZAANGOR, ICON BEARER'
);

card('TZAANGOR WARRIOR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '9' },
  [
    { name: 'Autopistol',             atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Tzaangor blade & shield', atk: '4', hit: '4+', dmg: '3/4', wr: 'Shield*' },
    { name: 'Tzaangor blades',        atk: '4', hit: '4+', dmg: '4/5', wr: 'Balanced' },
    { name: 'Chainsword',             atk: '4', hit: '4+', dmg: '4/5', wr: '–' },
  ],
  [
    { name: 'Relic Hunters', description: 'Once per battle, one friendly WARPCOVEN TZAANGOR WARRIOR can perform the Pick Up Marker, Place Marker or a mission action for 1 less AP if that friendly operative is within your opponent\'s territory.' },
  ],
  'WARPCOVEN, CHAOS, TZAANGOR, WARRIOR'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Warpcoven populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
