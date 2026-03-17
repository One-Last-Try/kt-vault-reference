import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Brood Brothers'").get()?.id;
if (!FACTION_ID) { console.error('Brood Brothers faction not found'); process.exit(1); }

// Clear existing Brood Brothers data
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
  'Archetypes: INFILTRATION, SECURITY');

rule('faction_rules', null, 'OPERATIVES', 0,
  `1 BROOD BROTHER COMMANDER equipped with one of the following options:
• Bolt Pistol; Chainsword and Claw
• Drum-fed autogun; Bayonet
• Laspistol; Power Weapon and Claw

9 BROOD BROTHER operatives from the following list:
• BROOD BROTHER AGITATOR
• BROOD BROTHER GUNNER with a Flamer and Bayonet
• BROOD BROTHER GUNNER with a Grenade Launcher and Bayonet
• BROOD BROTHER GUNNER with a Meltagun and Bayonet
• BROOD BROTHER GUNNER with a Plasma Gun and Bayonet
• BROOD BROTHER ICONWARD
• BROOD BROTHER KNIFE FIGHTER
• BROOD BROTHER MEDIC
• BROOD BROTHER SAPPER
• BROOD BROTHER SNIPER
• BROOD BROTHER TROOPER
• BROOD BROTHER VETERAN
• BROOD BROTHER VOX OPERATOR

3 BROOD BROTHER operatives/Tactical Assets selected from the following list:
• 2 PSYCHIC FAMILIARS (still counts as one selection)
• MAGUS (counts as two selections)
• PATRIARCH (counts as three selections)
• PRIMUS (counts as two selections)
• BROOD BROTHER TROOPER

Other than TROOPER operatives, your kill team can only include each option opposite once. It cannot include more than three GUNNER and SNIPER operatives combined.

1. Your kill team can only include up to one BROODCOVEN operative. If one of these operatives is selected for deployment, your COMMANDER operative loses the LEADER keyword for the battle.
2. These are tactical assets, not operatives, and are explained on the following page. They are not on your roster/dataslate.
3. Up to three times, instead of selecting one of these operatives, you can select one BROOD BROTHER ploy to cost you 0CP for the battle. Note that 'counts as' selections still apply; for example, if you select a PATRIARCH operative, you could not do this.`);

rule('faction_rules', null, 'CROSSFIRE', 0,
  `Whenever a friendly BROOD BROTHER operative is shooting against or fighting against an enemy operative, after resolving all of your attack dice, if that enemy operative isn\'t incapacitated it gains one of your Crossfire tokens.

Whenever a friendly BROOD BROTHER operative is shooting against, fighting against or retaliating against an enemy operative that has any of your Crossfire tokens, you can remove any of those tokens. For each that you do, you can re-roll one of your attack dice.`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'PERVASIVE', 1,
  'During each friendly BROOD BROTHER operative\'s activation, you can ignore the first vertical distance of 2" they move during one climb.');

rule('ploy', 'Strategy', 'UPRISING', 1,
  'The first time each friendly BROOD BROTHER operative performs either the Shoot or Fight action during each of its activations, if its order was changed from Conceal to Engage at the start of that activation, the enemy operative selected as the valid target to shoot at or fight against gains one of your Crossfire tokens as soon as it\'s selected (instead of after resolving your attack dice). This ploy has no effect if that friendly operative was activated within control range of an enemy operative. Note this ploy cannot come into effect more than once per activation (you cannot use it during both the Shoot and Fight action in the same activation).');

rule('ploy', 'Strategy', 'EMBEDDED', 1,
  'Whenever an enemy operative is shooting a friendly BROOD BROTHER operative, if you can retain any cover saves as a result of Heavy terrain, you can retain one additional cover save.');

rule('ploy', 'Strategy', 'CULT DEVOTION', 1,
  'Whenever a friendly BROOD BROTHER operative (excluding PATRIARCH) is incapacitated when fighting or retaliating, if you have any unresolved attack dice, you can roll one D6: if the result is a success as if it were the Roll Attack Dice step of that sequence (i.e. using the same weapon, but with no re-rolls), you can strike the enemy operative in that sequence with one of your unresolved normal successes, or any of your successes instead if the D6 result is a critical success. In either case, that friendly operative is removed from the killzone afterwards.');

rule('ploy', 'Firefight', 'RUTHLESS COORDINATION', 1,
  'Use this Tactical Ploy when selecting a valid target for a friendly BROOD BROTHER operative. Until the end of the action, determine visibility as normal, but you can instead determine intervening (for cover and obscured) from another friendly BROOD BROTHER operative that both that friendly operative and the potential valid target are visible to, but that isn\'t itself within control range of enemy operatives.\n\nDesigner\'s Note: The friendly operative doesn\'t gain the additional benefits of Vantage terrain if the other friendly operative is on it (e.g. to target an enemy operative that has a Conceal order that\'s in cover provided only by Light terrain).');

rule('ploy', 'Firefight', 'UNQUESTIONING LOYALTY', 1,
  'Use this firefight ploy when a friendly BROOD BROTHER LEADER operative is selected as the valid target of a Shoot action or to fight against during the Fight action. Select one other friendly BROOD BROTHER BROODGUARD operative (excluding LEADER) visible to and within 3" of that LEADER operative to become the valid target or to be fought against (as appropriate) instead (even if it wouldn\'t normally be valid for this). If it\'s the Fight action, treat that other operative as being within the fighting operative\'s control range for the duration of that action.\n\nThis ploy has no effect if it\'s the Shoot action and the ranged weapon has the Blast or Torrent weapon rule.');

rule('ploy', 'Firefight', 'IDOLISATION', 1,
  'Use this Tactical Ploy when a friendly BROOD BROTHER operative (excluding LEADER) within 6" of a friendly BROOD BROTHER LEADER or BROOD BROTHER ICONWARD operative is shooting, fighting or retaliating, in the Roll Attack Dice step. You can retain one of your fails as a normal success instead of discarding it, or retain one of your normal successes as a critical success instead.');

rule('ploy', 'Firefight', 'INSIDIOUS', 1,
  'Use this Tactical Ploy after an activation. Before the next activation, you can perform a free Dash action with a friendly BROOD BROTHER operative, as long as it\'s not a valid target for an enemy operative when it starts and ends that action. You cannot use this ploy during the first turning point.');

// ── TACOPS ───────────────────────────────────────────────────────────────────

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

// ── EQUIPMENT ────────────────────────────────────────────────────────────────

rule('equipment', null, 'CULT TALISMAN', 0,
  'Once per turning point, when an operative is shooting a friendly BROOD BROTHER operative (excluding PATRIARCH), in the Roll Defence Dice step, you can retain one of your normal successes as a critical success instead.');

rule('equipment', null, 'COVERT GUISE', 0,
  'After revealing this equipment option, roll one D3. As a STRATEGIC GAMBIT in the first turning point, a number of friendly BROOD BROTHER BROODGUARD operatives equal to the result that are wholly within your drop zone can immediately perform a free Reposition action, but must end that move wholly within 3" of your drop zone.');

rule('equipment', null, 'CULT KNIFE', 0,
  `Friendly BROOD BROTHER BROODGUARD operatives have the following melee weapon:

NAME: Cult Knife | ATT: 3 | HIT: 4+ | DMG: 3/4`);

rule('equipment', null, 'LOOKOUT', 0,
  'STRATEGIC GAMBIT: Select one enemy operative visible to a friendly BROOD BROTHER operative to gain one of your Crossfire tokens.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('BROOD BROTHER COMMANDER', 'Leader',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '8' },
  [
    { name: 'Bolt Pistol',           atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Drum-fed autogun',      atk: '4', hit: '3+', dmg: '2/3', wr: 'Ceaseless' },
    { name: 'Laspistol',             atk: '4', hit: '3+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Bayonet',               atk: '3', hit: '3+', dmg: '2/3', wr: '–' },
    { name: 'Chainsword and Claw',   atk: '4', hit: '3+', dmg: '4/5', wr: 'Balanced, Rending' },
    { name: 'Power Weapon and Claw', atk: '4', hit: '3+', dmg: '4/6', wr: 'Balanced, Lethal 5+' },
  ],
  [
    { name: 'Coordinate: STRATEGIC GAMBIT', description: 'If this operative is in the killzone. Select one enemy operative to gain one of your Crossfire tokens.' },
  ],
  'BROOD BROTHER, TYRANID, GENESTEALER CULT, BROODGUARD, LEADER, COMMANDER'
);

card('BROOD BROTHER AGITATOR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Shock Maul', atk: '4', hit: '4+', dmg: '4/4', wr: 'Shock' },
  ],
  [
    { name: 'Devoted', description: 'Once per turning point, when this operative is fighting or retaliating, in the Resolve Attack Dice step, you can ignore the damage inflicted on it from one normal success.' },
    { name: 'Psiren Caster', description: 'Whenever a friendly BROOD BROTHER operative is shooting against, fighting against or retaliating against an enemy operative within 6" of this operative, you can re-roll one of your attack dice.' },
  ],
  'BROOD BROTHER, TYRANID, GENESTEALER CULT, BROODGUARD, AGITATOR'
);

card('BROOD BROTHER GUNNER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Flamer',                    atk: '4', hit: '2+', dmg: '3/3', wr: 'Range 8", Saturate, Torrent 2' },
    { name: 'Grenade Launcher – Frag',   atk: '4', hit: '4+', dmg: '2/4', wr: 'Blast 2' },
    { name: 'Grenade Launcher – Krak',   atk: '4', hit: '4+', dmg: '4/5', wr: 'Piercing 1' },
    { name: 'Meltagun',                  atk: '4', hit: '4+', dmg: '6/3', wr: 'Range 6", Devastating 4, Piercing 2' },
    { name: 'Plasma Gun – Standard',     atk: '4', hit: '4+', dmg: '4/6', wr: 'Piercing 1' },
    { name: 'Plasma Gun – Supercharge',  atk: '4', hit: '4+', dmg: '5/6', wr: 'Hot, Lethal 5+, Piercing 1' },
    { name: 'Bayonet',                   atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [],
  'BROOD BROTHER, TYRANID, GENESTEALER CULT, BROODGUARD, GUNNER'
);

card('BROOD BROTHER ICONWARD', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Large Knife', atk: '4', hit: '4+', dmg: '3/5', wr: '–' },
  ],
  [
    { name: 'Cult Icon', description: 'Whenever determining control of a marker within 4" of this operative, treat the total APL stat of friendly BROOD BROTHER operatives that contest it as 1 higher if at least one friendly BROOD BROTHER operative contests that marker. Note this isn\'t a change to the APL stat, so any changes are cumulative with this.' },
    { name: 'Broodmind Devotion', description: 'Once per turning point, when a ready friendly BROOD BROTHER BROODGUARD operative is incapacitated while visible to and within 6" of this operative, you can use this rule. If you do, before that operative is removed from the killzone, it can perform a 1APL free action (excluding Fight and Explosives), and you can change its order to do so. It\'s then incapacitated as normal. You cannot use this rule and the Medic! rule (see MEDIC datacard) on the same operative at the same time.' },
  ],
  'BROOD BROTHER, TYRANID, GENESTEALER CULT, BROODGUARD, ICONWARD'
);

card('BROOD BROTHER KNIFE FIGHTER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Poisoned fighting Knives', atk: '4', hit: '3+', dmg: '3/4', wr: 'Ceaseless, Lethal 5+' },
  ],
  [
    { name: 'Assassin', description: 'This operative can perform the Charge action while it has a Conceal order.' },
    { name: 'Counterattack', description: 'Whenever this operative is fighting or retaliating, whenever your opponent resolves a normal success, inflict 1 damage on the enemy operative in that sequence.' },
  ],
  'BROOD BROTHER, TYRANID, GENESTEALER CULT, BROODGUARD, KNIFE FIGHTER'
);

card('BROOD BROTHER MEDIC', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Lasgun',       atk: '4', hit: '4+', dmg: '2/3', wr: '–' },
    { name: 'Bayonet',      atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
    { name: 'Gene-needler', atk: '1', hit: '4+', dmg: '5/7', wr: 'Lethal 5+, Limited 1' },
  ],
  [
    { name: 'Medic!', description: 'The first time during each turning point that another friendly BROOD BROTHER operative (excluding PATRIARCH) would be incapacitated while visible to and within 3" of this operative, you can use this rule, providing neither this nor that operative is within control Range of an enemy operative. If you do, that friendly operative isn\'t incapacitated and has 1 wound remaining and cannot be incapacitated for the remainder of the action After that action, that friendly operative can immediately perform a free Dash action, but must end that move within this operative\'s control Range. Subtract 1 from this and that operative\'s APL stats until the end of their next activations respectively, and if this rule was used during that friendly operative\'s activation, that activation ends. You cannot use this rule if this operative is incapacitated.' },
    { name: 'MEDIKIT (1AP)', description: 'Select one friendly BROOD BROTHER operative (excluding PATRIARCH) within this operative\'s control Range to regain 2D3 lost wounds. It cannot be an operative that the Medic! rule was used on during this turning point.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'BROOD BROTHER, TYRANID, GENESTEALER CULT, BROODGUARD, MEDIC'
);

card('BROOD BROTHER SAPPER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Demolition Charge', atk: '4', hit: '3+', dmg: '4/6', wr: 'Range 3", Blast 2", Heavy (Reposition only), Limited 1, Piercing 1, Saturate' },
    { name: 'Bayonet',           atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Final Defiance', description: 'If this operative is incapacitated, it can perform a free Explosives unique action before it\'s removed from the killzone.' },
    { name: 'Grenadier', description: 'This operative can use frag and krak grenades (see universal equipment). Doing so doesn\'t count towards any Limited uses you have (i.e. if you also select those grenades from equipment for other operatives). Whenever it\'s doing so, improve the Hit stat of that weapon by 1.' },
    { name: 'EXPLOSIVES (1AP)', description: 'The first time this operative performs this action during the battle, place your Explosives marker within its control Range. The second time this operative performs this action during the battle, inflict 2D6 damage on each operative within 2" of that marker (roll separately for each) unless Heavy terrain is wholly intervening between that operative and that marker.\n\nThis operative cannot perform this action more than twice per battle, while within control Range of an enemy operative, or during the same activation in which it performed the Charge, Dash, or Fall Back action (or vice versa).' },
  ],
  'BROOD BROTHER, TYRANID, GENESTEALER CULT, BROODGUARD, SAPPER'
);

card('BROOD BROTHER SNIPER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Sniper Rifle – Concealed',  atk: '4', hit: '2+', dmg: '3/3', wr: 'Devastating 3, Heavy, Silent, Concealed Position*' },
    { name: 'Sniper Rifle – Mobile',     atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Sniper Rifle – Stationary', atk: '4', hit: '2+', dmg: '3/3', wr: 'Devastating 3, Heavy' },
    { name: 'Fists',                     atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: '*Concealed Position', description: 'This operative can only use this weapon the first time it\'s performing the Shoot action during the battle.' },
  ],
  'BROOD BROTHER, TYRANID, GENESTEALER CULT, BROODGUARD, SNIPER'
);

card('BROOD BROTHER TROOPER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Lasgun',  atk: '4', hit: '4+', dmg: '2/3', wr: '–' },
    { name: 'Bayonet', atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Group Activation', description: 'Whenever this operative is expended, you must then activate one other ready friendly BROOD BROTHER TROOPER operative (if able) before your opponent activates. When that other operative is expended, your opponent then activates as normal (in other words, you cannot activate more than two operatives in succession with this rule).' },
  ],
  'BROOD BROTHER, TYRANID, GENESTEALER CULT, BROODGUARD, TROOPER'
);

card('BROOD BROTHER VETERAN', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Combat Shotgun – Short range', atk: '4', hit: '3+', dmg: '4/4', wr: 'Range 6"' },
    { name: 'Combat Shotgun – Long range',  atk: '4', hit: '4+', dmg: '2/2', wr: '–' },
    { name: 'Bayonet and Claw',             atk: '3', hit: '4+', dmg: '2/3', wr: 'Balanced' },
  ],
  [
    { name: 'Resilient', description: 'Normal Dmg of 3 or more inflicts 1 less damage on this operative.' },
    { name: 'Bodyguard', description: 'You can use the Unquestioning Loyalty Tactical Ploy for 0CP if this operative is the friendly BROODGUARD operative.' },
  ],
  'BROOD BROTHER, TYRANID, GENESTEALER CULT, BROODGUARD, VETERAN'
);

card('BROOD BROTHER VOX OPERATOR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Lasgun', atk: '4', hit: '4+', dmg: '2/3', wr: '–' },
    { name: 'Fists',  atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'SIGNAL (1AP)', description: 'Support: Select one other friendly BROOD BROTHER BROODGUARD operative visible to and within 6" of this operative. Until the end of that operative\'s next activation, add 1 to its APL stat.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
    { name: 'JAM (1/2AP)', description: 'Select one ready enemy operative that\'s a valid target for this operative, or visible to this operative instead if you spend 1 additional AP. Roll one D6. Until the end of the turning point, that enemy operative cannot be activated or perform actions until it\'s the last enemy operative to be activated, or until your opponent has activated a number of enemy operatives after this action equal to the result of the D6 (whichever comes first).\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'BROOD BROTHER, TYRANID, GENESTEALER CULT, BROODGUARD, VOX-OPERATOR'
);

card('PSYCHIC FAMILIAR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '3' },
  [
    { name: 'Claws', atk: '3', hit: '4+', dmg: '2/3', wr: 'Rending' },
  ],
  [
    { name: 'Small', description: 'This operative cannot use any weapons that aren\'t on its datacard, or perform unique actions. Whenever this operative is in cover, it cannot be selected as a valid target, taking precedence over all other rules (e.g. Seek, Vantage terrain) except being within 2". This operative can perform the Fall Back action for 1 less AP.' },
    { name: 'Elusive', description: 'This operative can perform mission actions while within control Range of an enemy operative (taking precedence over those actions\' normal conditions). It can move through enemy operatives, move within control Range of them, and during the Charge action can leave their control Range (it must still end the move following all requirements for that move).' },
    { name: 'Group Activation', description: 'Whenever this operative is expended, you must then activate one other ready friendly BROOD BROTHER PSYCHIC FAMILIAR operative (if able) before your opponent activates. When that other operative is expended, your opponent then activates as normal.' },
  ],
  'BROOD BROTHER, TYRANID, GENESTEALER CULT, PSYCHIC FAMILIAR'
);

card('MAGUS', 'Leader',
  { APL: '3', MOVE: '6"', SAVE: '4+', WOUNDS: '9' },
  [
    { name: 'Autopistol',   atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Bio dagger',   atk: '2', hit: '4+', dmg: '3/6', wr: 'Lethal 4+' },
    { name: 'Force Stave',  atk: '4', hit: '4+', dmg: '4/6', wr: 'PSYCHIC, Shock' },
  ],
  [
    { name: 'Spiritual Leader: STRATEGIC GAMBIT', description: 'If this operative is in the killzone. Select one of the following for friendly BROOD BROTHER operatives to have until the end of the turning point or until this operative is incapacitated (whichever comes first):\n• Whenever an operative is shooting a friendly BROOD BROTHER operative, ignore the Piercing weapon rule.\n• You can ignore any changes to friendly BROOD BROTHER operatives\' stats from being injured (including their weapons\' stats).\n• You can ignore any changes to the APL stats of friendly BROOD BROTHER operatives.' },
    { name: 'TELEPATHIC OVERLOAD (1AP)', description: 'PSYCHIC. Select one enemy operative visible to this operative. Until the end of that operative\'s next activation, subtract 1 from its APL stat.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
    { name: 'MENTAL ONSLAUGH (1AP)', description: 'PSYCHIC. Select one enemy operative that\'s a valid target for this operative. Inflict 2 damage on it, or 4 damage instead if it\'s within 6" of this operative. Then roll one D6: if the result is higher than that enemy operative\'s APL stat, inflict an additional 2 damage on it, or 4 damage instead if it\'s within 6" of this operative. Keep rolling one D6 in this manner until you roll equal to or less than that enemy operative\'s APL stat, until it\'s incapacitated, or until you inflict 8 damage on it during this action (whichever comes first).\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'BROOD BROTHER, TYRANID, GENESTEALER CULT, BROODCOVEN, PSYKER, LEADER, MAGUS'
);

card('PATRIARCH', 'Leader',
  { APL: '4', MOVE: '6"', SAVE: '4+', WOUNDS: '21' },
  [
    { name: 'Claws', atk: '5', hit: '3+', dmg: '5/6', wr: 'Relentless, Rending' },
  ],
  [
    { name: 'Alpha Predator', description: 'Whenever an operative is shooting this operative, ignore the Piercing weapon rule. You can activate this operative twice during the turning point as long as it has AP to spend (it stays ready while it can still be activated a second time). Per turning point, it cannot move more than 9" and you cannot spend more than 4AP in total for it.' },
    { name: 'Monster', description: 'This operative cannot use any weapons that aren\'t on its datacard, or perform unique actions (excluding Into Shadow and Mind Control). Whenever your opponent is selecting a valid target, if this operative has a Conceal order, it cannot use Light terrain for cover. Whilst this can allow this operative to be targeted (assuming it\'s visible), it doesn\'t remove its cover save (if any).' },
    { name: 'INTO SHADOW (1AP)', description: 'Change this operative\'s order.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
    { name: 'MIND CONTROL (2AP)', description: 'PSYCHIC. Select one enemy operative visible to and within 2" of this operative. Both players roll one D6 and add their respective operative\'s APL stat to the total. If your total is higher than your opponent\'s, you can resolve this action\'s second effect.\n\nUntil the end of the activation, that enemy operative is a friendly operative (an enemy operative for your opponent), you can change its order, and it can immediately perform one free action. It cannot perform an action in which it moves other than Dash (in which case specify the location for your opponent to move the operative to). You can only resolve this action\'s second effect once per battle.\n\nThis operative cannot perform this action while within control Range of an enemy operative, unless the only enemy operative it\'s within control Range of is selected for this action.' },
  ],
  'BROOD BROTHER, TYRANID, GENESTEALER CULT, BROODCOVEN, PSYKER, LEADER, PATRIARCH'
);

card('PRIMUS', 'Leader',
  { APL: '3', MOVE: '6"', SAVE: '4+', WOUNDS: '9' },
  [
    { name: 'Scoped Needle Pistol – Short range', atk: '4', hit: '3+', dmg: '2/4', wr: 'Range 8", Lethal 5+, Silent' },
    { name: 'Scoped Needle Pistol – Long range',  atk: '4', hit: '3+', dmg: '2/4', wr: 'Silent' },
    { name: 'Bonesword and Toxin Injector Claw',  atk: '5', hit: '3+', dmg: '4/5', wr: 'Lethal 5+, Rending' },
  ],
  [
    { name: 'Fist of the Patriarch', description: 'This operative can perform two Fight or Shoot actions during its activation.' },
    { name: 'Mastermind', description: 'Once per Turning Point, after rolling off to determine initiative, if the operative is in the killzone, you can do one of the following (you cannot select each option more than once per battle):\n• Add 1 to your dice result.\n• If you didn\'t have initiative in the previous Turning Point, re-roll your dice.' },
    { name: 'CONSPIRE (1AP)', description: 'You gain 1CP.\n\nThis operative cannot perform this action while within control Range of an enemy operative, or more than once per turning point.' },
  ],
  'BROOD BROTHER, TYRANID, GENESTEALER CULT, BROODCOVEN, LEADER, PRIMUS'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Brood Brothers populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
