import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Blades of Khaine'").get()?.id;
if (!FACTION_ID) { console.error('Blades of Khaine faction not found'); process.exit(1); }

// Clear existing Blades of Khaine data
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
  `Archetypes: SEEK-DESTROY, and the associated archetype of the most common Aspect keyword in your kill team (if two keywords are equally most common, you can choose one of those keywords). Aspect keywords and their associated archetypes are as follows:
• DIRE AVENGER: Security
• HOWLING BANSHEE: Recon
• STRIKING SCORPION: Infiltration`);

rule('faction_rules', null, 'OPERATIVES', 0,
  `1 operative selected from the following list:
• DIRE AVENGER EXARCH equipped with one of the following options:
  - Shuriken catapult; Fists
  - Twin shuriken catapult; Gun butts
  Or one option from each of the following:
  - Diresword or Power weapon
  - Shimmershield or Suriken pistol
• HOWLING BANSHEE EXARCH equipped with one of the following options:
  - Mirrorswords
  - Shuriken pistol; Executioner
  - Shuriken pistol; Power weapon
  - Triskele, Power weapon
  - Triskele, Shuriken pistol
• STRIKING SCORPION EXARCH equipped with one of the following options:
  - Shuriken pistol; Biting blade
  - Shuriken pistol; scorpion\'s clay and Chainsword
  - Twin shuriken pistols; twin Chainswords

7 BLADES OF KHAINE operatives selected from the following list:
• DIRE AVENGER WARRIOR
• HOWLING BANSHEE WARRIOR
• STRIKING SCORPION WARRIOR`);

rule('faction_rules', null, 'ASPECT TECHNIQUES', 0,
  `Each ASPECT TECHNIQUE is in a category: Dire Avenger, Howling Banshee and Striking Scorpion. Each ASPECT TECHNIQUE can only be used with a friendly operative that has the matching Aspect keyword, and each will specify when it can be used and what its effects are. In addition:

• You cannot use more than one ASPECT TECHNIQUE per activation or counteraction.
• You cannot use each ASPECT TECHNIQUE more than once per turning point.
• If every friendly BLADES OF KHAINE operative selected for deployment has the same Aspect keyword (e.g. STRIKING SCORPION), you cannot use each ASPECT TECHNIQUE more than twice per turning point (instead of once).`);

rule('faction_rules', 'Aspect Technique: Dire Avenger', 'DEATH OF A THOUSAND BLADES', 0,
  'Use this ASPECT TECHNIQUE when a friendly DIRE AVENGER operative is performing the Shoot action and you select a shuriken catapult or twin shuriken catapult. Until the end of that action, that weapon has the Torrent 2" weapon rule, but you cannot select more than one secondary target.');

rule('faction_rules', 'Aspect Technique: Dire Avenger', 'RAGING HEAT OF THE DYING FLAME', 0,
  'Use this ASPECT TECHNIQUE during a friendly DIRE AVENGER operative\'s activation. Until the start of that operative\'s next activation, you can ignore any changes to its stats from being injured (including its weapons\' stats).');

rule('faction_rules', 'Aspect Technique: Dire Avenger', 'VIGILANCE OF THE AVENGER', 0,
  'Use this ASPECT TECHNIQUE when a friendly DIRE AVENGER operative is performing the Shoot action and you select a shuriken catapult or twin shuriken catapult. Until the end of that action, that weapon has the Lethal 5+ weapon rule.');

rule('faction_rules', 'Aspect Technique: Dire Avenger', 'THE SLICING HURRICANE', 0,
  'Use this ASPECT TECHNIQUE when a friendly DIRE AVENGER operative is performing the Reposition action. That operative can perform the Shoot action during that action (it must do so in a location it can be placed, and any remaining move distance it had from that Reposition action can be used after it does so). You must select its shuriken catapult, shuriken pistol or twin shuriken catapult for that Shoot action.');

rule('faction_rules', 'Aspect Technique: Dire Avenger', 'UNSTINTING, IMMOVABLE', 0,
  'Use this ASPECT TECHNIQUE when an operative is shooting a friendly DIRE AVENGER operative and you\'ve rolled two or more fails. You can discard one of them to retain the other as a normal success instead.');

rule('faction_rules', 'Aspect Technique: Howling Banshee', 'THE WOE', 0,
  'Use this ASPECT TECHNIQUE during a friendly HOWLING BANSHEE operative\'s activation, after it\'s performed the Charge action and incapacitated an enemy operative during the Fight action, and is no longer within control range of enemy operatives. That friendly operative can immediately perform a free Charge action using any remaining move distance it had from that first Charge action. This ASPECT TECHNIQUE allows that operative to perform two Charge actions during its activation to do so.');

rule('faction_rules', 'Aspect Technique: Howling Banshee', 'SCREAM-THAT-STEALS', 0,
  'Use this ASPECT TECHNIQUE when a friendly HOWLING BANSHEE operative is fighting or retaliating, at the start of the Resolve Attack Dice step. You can resolve one of your successes before the normal order. If you do, that success must be used to block.');

rule('faction_rules', 'Aspect Technique: Howling Banshee', 'RAIN OF TEARS', 0,
  'Use this ASPECT TECHNIQUE when a friendly HOWLING BANSHEE operative is fighting, after you strike with a critical success if the enemy operative isn\'t incapacitated. End that sequence (any remaining attack dice are discarded) and immediately perform a free Fall Back action up to 3" with that operative. Do so even if it\'s performed an action that prevents it from performing the Fall Back action.');

rule('faction_rules', 'Aspect Technique: Howling Banshee', 'SHRIEK-THAT-KILLS', 0,
  `Use this ASPECT TECHNIQUE when a friendly HOWLING BANSHEE operative is performing the Shoot action. Until the end of that action, that operative can use the following ranged weapon:

Shriek-that-kills: ATK 5, HIT 3+, DMG 1/2, WR: Range 6", Saturate, Seek Light, Stun, Torrent 1`);

rule('faction_rules', 'Aspect Technique: Howling Banshee', 'ACROBATIC', 0,
  `Use this ASPECT TECHNIQUE when a friendly HOWLING BANSHEE operative performs an action in which it moves. Until the end of the action, that operative:

• Can ignore all vertical distances whenever it drops and climbs.
• Can move through enemy operatives, move within control range of them, and during the Charge action, it can leave their control range (it must still end the move following all requirements for that move).
• Cannot move more than its Move stat if it\'s the Charge action.`);

rule('faction_rules', 'Aspect Technique: Striking Scorpion', 'PATIENT STALK, SUDDEN BLOW', 0,
  'Use this ASPECT TECHNIQUE when a friendly STRIKING SCORPION operative with a Conceal order performs the Reposition action. During that action, that operative can move within Control Range of enemy operatives (but cannot finish the move there), and you can inflict D3+2 damage on one enemy operative within Control Range after it has moved.');

rule('faction_rules', 'Aspect Technique: Striking Scorpion', 'STRIKE AND FADE', 0,
  'Use this ASPECT TECHNIQUE when a friendly STRIKING SCORPION operative incapacitates an enemy operative during while fighting or retaliating, and is no longer within 3" of enemy operatives. Change that friendly operative\'s order to Conceal and it can immediately perform a free Dash action, even if it\'s performed an action that prevents it from performing the Dash action.');

rule('faction_rules', 'Aspect Technique: Striking Scorpion', 'SCORPION\'S EYE', 0,
  'Use this ASPECT TECHNIQUE when a friendly STRIKING SCORPION operative performs the Shoot action and you select a shuriken pistol. Until the end of that action, that weapon has the Seek Light weapon rule.');

rule('faction_rules', 'Aspect Technique: Striking Scorpion', 'MERCILESS STRIKES', 0,
  'Use this ASPECT TECHNIQUE when a friendly STRIKING SCORPION operative is fighting. The first time you strike with a critical success during that sequence, that operative\'s melee weapons gain the Shock weapon rule until the end of the sequence.');

rule('faction_rules', 'Aspect Technique: Striking Scorpion', 'ONE WITH THE GLOOM', 0,
  'Use this ASPECT TECHNIQUE during a friendly STRIKING SCORPION operative\'s activation. Until the start of its next activation, while that operative has a Conceal order and is in cover, it cannot be selected as a valid target, regardless of any other rules (e.g., Seek, Vantage terrain) except beign within 2".');

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'DANCE OF DEATH', 1,
  'Select two friendly BLADES OF KHAINE operatives visible to and within 6" of each other. Remove them both from the killzone and set them back up in each other\'s previous locations (in other words, swap their positions).');

rule('ploy', 'Strategy', 'RUTHLESS POISE', 1,
  'Whenever a friendly BLADES OF KHAINE operative is fighting a ready enemy operative, that friendly operative\'s melee weapons have the Ceaseless weapon rule.');

rule('ploy', 'Strategy', 'FOREWARNED', 1,
  'Whenever an operative is shooting a ready friendly BLADES OF KHAINE operative, you can re-roll any of your defence dice results of one result (e.g., results of 2).');

rule('ploy', 'Strategy', 'KHAINE\'S VENGEANCE', 1,
  'Whenever a friendly BLADES OF KHAINE operative is shooting an expended enemy operative, that friendly operative\'s ranged weapons have the Ceaseless weapon rule.');

rule('ploy', 'Firefight', 'BLADEWIND', 1,
  'Use this Tactical Ploy during a friendly BLADES OF KHAINES operative\'s activation. Until the end of its activation, that operative can perform two Fight actions.');

rule('ploy', 'Firefight', 'FADING LIGHT', 1,
  'Use this Tactical Ploy during a friendly BLADES OF KHAINES operative\'s activation, before or after it performs an action. Until the end of its activation, that operative can perform the Fall Back action for one less action point (to a minimum of 0AP).');

rule('ploy', 'Firefight', 'STARFALL', 1,
  'Use this Tactical Ploy during a friendly BLADES OF KHAINE operative\'s activation. Until the end of its activation, that operative can perform two Shoot actions.');

rule('ploy', 'Firefight', 'CONTEMPT', 1,
  'Use this firefight ploy when a friendly BLADES OF KHAINE operative is retaliating or an enemy operative is shooting it, after your opponent rolls their attack dice, but before re-rolls. Until the end of the sequence, your opponent cannot re-roll their attack dice (if your opponent declared the use of any firefight ploys during that sequence that would allow them to re-roll, that ploy is cancelled and the CP spent on it is refunded).');

// ── TACOPS ───────────────────────────────────────────────────────────────────

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

rule('equipment', null, 'RUNE OF PROPHECY', 0,
  'Once per battle, after rolling off to decide initiative, you can add D3 to, or subtract D3 from, your result.');

rule('equipment', null, 'RUNE OF FORESIGHT', 0,
  'When this equipment is revealed, roll one D3. In the Strategy phase of the turning point equal to the result, you gain 1 additional Command Point (CP).');

rule('equipment', null, 'RUNE OF SHIELDING', 0,
  'Once per battle, when an attack dice inflicts Normal Damage on a friendly BLADES OF KHAINE operative, you can ignore that inflicted damage.');

rule('equipment', null, 'WRAITHBONE TALISMAN', 0,
  'Once per turning point, when a friendly BLADES OF KHAINE operative is shooting, fighting or retaliating, if you roll two or more fails, you can discard one of them to retain another as a normal success instead.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('DIRE AVENGER EXARCH', 'Leader',
  { APL: '3', MOVE: '7"', SAVE: '3+', WOUNDS: '9' },
  [
    { name: 'Shuriken catapult',     atk: '4', hit: '3+', dmg: '3/4', wr: 'Rending' },
    { name: 'Shuriken pistol',       atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Rending' },
    { name: 'Twin shuriken catapult', atk: '4', hit: '3+', dmg: '3/4', wr: 'Ceaseless, Rending' },
    { name: 'Diresword',             atk: '5', hit: '3+', dmg: '4/5', wr: 'Lethal 5+, Rending' },
    { name: 'Fists',                 atk: '4', hit: '3+', dmg: '2/4', wr: '–' },
    { name: 'Gun butts',             atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
    { name: 'Power weapon',          atk: '5', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Shimmershield', description: 'Whenever an operative is shooting a friendly BLADES OF KHAINE operative that\'s visible to and within 2" of this operative, ignore the Piercing weapon rule. This operative only has this rule if you select the shimmershield weapon option.' },
    { name: 'Exarch', description: 'This operative can perform two Shoot or Fight actions during its activation.' },
    { name: 'Defence Tactics', description: 'Whenever this operative contests an objective marker or one of your mission markers, or whenever it\'s shooting an enemy operative that does, this operative\'s weapons have the Balanced weapon rule.' },
  ],
  'BLADES OF KHAINE, ALDEARI, ASURYANI, LEADER, DIRE AVENGER, EXARCH'
);

card('HOWLING BANSHEE EXARCH', 'Leader',
  { APL: '3', MOVE: '7"', SAVE: '3+', WOUNDS: '9' },
  [
    { name: 'Shuriken pistol',  atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Rending' },
    { name: 'Triskele (ranged)', atk: '4', hit: '3+', dmg: '2/3', wr: 'Range 8", Rending, Torrent 2' },
    { name: 'Executioner',      atk: '5', hit: '3+', dmg: '3/7', wr: 'Lethal 5+' },
    { name: 'Mirrorswords',     atk: '5', hit: '3+', dmg: '4/6', wr: 'Ceaseless, Lethal 5+' },
    { name: 'Power weapon',     atk: '5', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
    { name: 'Triskele (melee)', atk: '5', hit: '3+', dmg: '4/5', wr: 'Rending' },
  ],
  [
    { name: 'Exarch', description: 'This operative can perform two Shoot or Fight actions during its activation.' },
    { name: 'Banshee Mask', description: 'Whenever this operative is fighting, worsen the Hit stat of the enemy operative\'s melee weapons by 1. This isn\'t cumulative with being injured.' },
  ],
  'BLADES OF KHAINE, ALDEARI, ASURYANI, LEADER, HOWLING BANSHEE, EXARCH'
);

card('STRIKING SCORPION EXARCH', 'Leader',
  { APL: '3', MOVE: '7"', SAVE: '3+', WOUNDS: '9' },
  [
    { name: 'Shuriken pistol',              atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Rending' },
    { name: 'Twin shuriken pistols',        atk: '4', hit: '4+', dmg: '3/4', wr: 'Range 8", Ceaseless, Rending' },
    { name: 'Biting blade',                 atk: '5', hit: '3+', dmg: '5/6', wr: 'Rending' },
    { name: 'Twin chainswords',             atk: '5', hit: '3+', dmg: '4/5', wr: 'Ceaseless, Rending' },
    { name: 'scorpion\'s claw and chainsword', atk: '5', hit: '3+', dmg: '4/6', wr: 'Brutal, Lethal 5+' },
  ],
  [
    { name: 'Mandiblasters', description: 'Whenever this operative performs the Fight action, at the start of the Roll Attack Dice step, inflict 2 damage on the enemy operative in that sequence.' },
    { name: 'Exarch', description: 'This operative can perform two Shoot or Fight actions during its activation.' },
  ],
  'BLADES OF KHAINE, ALDEARI, ASURYANI, LEADER, STRIKING SCORPION, EXARCH'
);

card('DIRE AVENGER WARRIOR', 'Warrior',
  { APL: '3', MOVE: '7"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Shuriken catapult', atk: '4', hit: '3+', dmg: '3/4', wr: 'Rending' },
    { name: 'Fists',             atk: '4', hit: '3+', dmg: '2/4', wr: '–' },
  ],
  [
    { name: 'Defence Tactics', description: 'Whenever this operative contests an objective marker or one of your mission markers, or whenever it\'s shooting an enemy operative that does, this operative\'s weapons have the Balanced weapon rule.' },
  ],
  'BLADES OF KHAINE, ALDEARI, ASURYANI, DIRE AVENGER, WARRIOR'
);

card('HOWLING BANSHEE WARRIOR', 'Warrior',
  { APL: '3', MOVE: '7"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Shuriken pistol', atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Rending' },
    { name: 'Power weapon',    atk: '4', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Banshee Mask', description: 'Whenever this operative is fighting, worsen the Hit stat of the enemy operative\'s melee weapons by 1. This isn\'t cumulative with being injured.' },
  ],
  'BLADES OF KHAINE, ALDEARI, ASURYANI, HOWLING BANSHEE, WARRIOR'
);

card('STRIKING SCORPION WARRIOR', 'Warrior',
  { APL: '3', MOVE: '7"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Shuriken pistol', atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Rending' },
    { name: 'Chainsword',      atk: '4', hit: '3+', dmg: '4/5', wr: 'Rending' },
  ],
  [
    { name: 'Mandiblasters', description: 'Whenever this operative performs the Fight action, at the start of the Roll Attack Dice step, inflict 2 damage on the enemy operative in that sequence.' },
  ],
  'BLADES OF KHAINE, ALDEARI, ASURYANI, STRIKING SCORPION, WARRIOR'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Blades of Khaine populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
