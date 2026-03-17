import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Blooded'").get()?.id;
if (!FACTION_ID) { console.error('Blooded faction not found'); process.exit(1); }

// Clear existing Blooded data
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
  'Archetypes: SEEK-DESTROY, INFILTRATION');

rule('faction_rules', null, 'OPERATIVES', 0,
  `1 BLOODED CHIEFTAIN operative equipped with one of the following options:
• Autopistol or laspistol; chainsword or power weapon
• Bolt pistol; chainsword
• Boltgun; bayonet
• Plasma pistol; improvised blade2

9 BLOODED operatives selected from the following list:
• BRIMSTONE GRENADIER
• BUTCHER
• COMMSMAN
• CORPSEMAN
• FLENSER
• GUNNER with bayonet and flamer1
• GUNNER with bayonet and grenade launcher1
• GUNNER with bayonet and meltagun1
• GUNNER with bayonet and plasma gun1,2
• SHARPSHOOTER1
• THUG
• TRENCH SWEEPER
• TROOPER

4 BLOODED operatives selected from the following list:
• ENFORCER (counts as two selections)
• OGRYN (counts as two selections)
• TROOPER

Other than TROOPER operatives, your kill team can only include each operative above once.

1 You cannot select more than three of these operatives combined.

2 You cannot select this option and this operative. In other words, you can only have one operative with a plasma weapon.`);

rule('faction_rules', null, 'BLOODED', 0,
  `You gain one Blooded token:
• In the Ready step of each Strategy phase.
• The first time an enemy operative is incapacitated during each turning point.
• The first time a friendly operative is incapacitated within 6" of an enemy operative during each turning point.

As a STRATEGIC GAMBIT, you can assign any of your unassigned Blooded tokens to friendly BLOODED operatives. Each operative cannot have more than one of your Blooded tokens. Then, if four or more friendly operatives in the killzone have one of your Blooded tokens, you can select one of them to be under the GAZE OF THE GODS until the end of the turning point.

Whenever a friendly BLOODED operative has one of your Blooded tokens, its weapons have the Accurate 1 weapon rule. If that friendly BLOODED operative is under the GAZE OF THE GODS, you can retain one of your normal successes as a result of the Accurate 1 weapon rule as a critical success instead.`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'GLORY KILL', 1,
  `Select one enemy operative visible to a friendly BLOODED operative. Until the end of the turning point, whenever a friendly BLOODED operative is shooting against, fighting against or retaliating against that enemy operative, its weapons have the Ceaseless weapon rule, or Relentless if that shooting, fighting or retaliating operative has one of your Blooded tokens.`);

rule('ploy', 'Strategy', 'RECKLESS ASPIRANT', 1,
  `Whenever a friendly BLOODED operative that\'s wholly within your opponent\'s territory and doesn\'t have one of your Blooded tokens is shooting or fighting, its weapons have the Accurate 1 weapon rule.

Whenever a friendly BLOODED operative that has one of your Blooded tokens is wholly within your opponent\'s territory, its weapons have the Punishing weapon rule.`);

rule('ploy', 'Strategy', 'MALEVOLENT GRIT', 1,
  `Whenever an operative is shooting a friendly BLOODED operative that has one of your Blooded tokens or is wholly within your opponent\'s territory, you can re-roll one of your defence dice.`);

rule('ploy', 'Strategy', 'BITTER DEMISE', 1,
  `Whenever a friendly BLOODED operative is incapacitated, before it\'s removed from the killzone, roll one D3: on a 3 (or 2+ if that friendly operative has one of your Blooded tokens), inflict damage equal to the result on one enemy operative visible to and within 2" of that friendly operative.`);

rule('ploy', 'Firefight', 'CALLOUS DISREGARD', 1,
  `Use this firefight ploy when a friendly BLOODED operative performs the Shoot action and you\'re selecting a valid target. Having other friendly BLOODED operatives within an enemy operative\'s control range doesn\'t prevent that enemy operative from being selected. Until the end of that action, whenever you discard an attack dice as a fail, inflict damage equal to the dice result on one friendly operative of your choice within control range of the target.`);

rule('ploy', 'Firefight', 'DARK FAVOUR', 1,
  `Use this firefight ploy when a friendly BLOODED operative that has one of your Blooded tokens is selected as the valid target of a Shoot action or to fight against during the Fight action. Select one other friendly BLOODED operative visible to and within 3" of that first friendly operative to become the valid target or to be fought against instead. If it\'s the Fight action, treat that other operative as being within the fighting operative\'s control range for the duration of that action. If it\'s the Shoot action, that other operative is only in cover or obscured if the original target was.

This ploy has no effect if it\'s the Shoot action and the ranged weapon has the Blast or Torrent weapon rule.`);

rule('ploy', 'Firefight', 'MOMENT OF REPUTE', 1,
  `Use this firefight ploy during the activation of a friendly BLOODED operative that\'s under the GAZE OF THE GODS, before or after it performs an action. Until the end of that operative\'s activation, add 1 to its APL stat.`);

rule('ploy', 'Firefight', 'REWARD EARNED', 1,
  `Use this firefight ploy when an enemy operative is incapacitated by a friendly BLOODED operative within 2" of it that has one of your Blooded tokens. You gain one Blooded token.`);

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

rule('equipment', null, 'CHAOS SIGIL', 0,
  'The Reward Earned firefight ploy costs you 0CP.');

rule('equipment', null, 'SINISTER TROPHIES', 0,
  'Whenever an enemy operative is shooting against, fighting against, or retaliating against a friendly BLOODED operative that has one of your Blooded tokens and is within 2" of it, your opponent cannot re-roll their attack dice results of 1.');

rule('equipment', null, 'SYMBOLS OF BLOODY WORSHIP', 0,
  'Whenever a friendly BLOODED operative ends an action, if it wasn\'t incapacitated but inflicted damage on any enemy operatives during that action, it regains 1 lost wound.');

rule('equipment', null, 'WICKED BLADES', 0,
  'Add 1 to both Dmg stats of each friendly BLOODED operative\'s bayonet, bayonet and shield, and improvised blade for the battle.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('TRAITOR CHIEFTAIN', 'Leader',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '8' },
  [
    { name: 'Bolter',                      atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Autopistol',                  atk: '4', hit: '3+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Bolt pistol',                 atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Laspistol',                   atk: '4', hit: '3+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Plasma pistol – Standard',    atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 8", Piercing 1' },
    { name: 'Plasma pistol – Supercharge', atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 8", Hot, Lethal 5+, Piercing 1' },
    { name: 'Power weapon',                atk: '4', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
    { name: 'Bayonet',                     atk: '3', hit: '3+', dmg: '2/3', wr: '–' },
    { name: 'Chainsword',                  atk: '4', hit: '3+', dmg: '4/5', wr: '–' },
    { name: 'Improvised blade',            atk: '4', hit: '3+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Blooded Icon', description: 'Once per turning point, when a friendly BLOODED operative that has one of your Blooded tokens is incapacitated, if this operative is within 6" of it, you can regain that token.' },
    { name: 'Lead With Strength', description: 'Whenever this operative has one of your Blooded tokens or is wholly within your opponent\'s territory, treat it as if it\'s under the GAZE OF THE GODS.' },
  ],
  'BLOODED, CHAOS, LEADER, CHIEFTAIN'
);

card('TRAITOR BRIMSTONE GRENADIER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Lasgun',       atk: '4', hit: '4+', dmg: '2/3', wr: '–' },
    { name: 'Diabolyk bomb', atk: '4', hit: '3+', dmg: '4/3', wr: 'Range 6", Blast 2, Devastating 2, Limited 1, Heavy (Reposition only), Piercing 1, Saturate' },
    { name: 'Bayonet',      atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Grenadier', description: 'This operative can use frag and krak grenades (see universal equipment). Doing so doesn\'t count towards any Limited uses you have (i.e. if you also select those grenades from equipment for other operatives). Whenever it\'s doing so, improve the Hit stat of that weapon by 1.' },
    { name: 'Explosive Demise', description: 'When this operative is incapacitated, before it\'s removed from the killzone, you can use this rule. If you do, roll two D6, or one D6 if this operative is within control Range of an enemy operative. If any result is a 4+, inflict D3+2 damage on each operative visible to and within 2" of this operative. If this operative hasn\'t used its diabolyk bomb during the battle, inflict D6+2 damage instead.' },
  ],
  'BLOODED, CHAOS, BRIMSTONE GRENADIER'
);

card('TRAITOR BUTCHER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '8' },
  [
    { name: 'Power weapon and cleaver', atk: '4', hit: '3+', dmg: '4/6', wr: 'Ceaseless, Lethal 5+, Blood Offering*' },
  ],
  [
    { name: 'Unholy Sustenance', description: 'Whenever this operative is fighting or retaliating, if it incapacitates the enemy operative in that sequence, it regains D3 lost wounds. This is cumulative with the Symbols of Bloody Worship equipment.' },
    { name: '*Blood Offering', description: 'Whenever this operative is fighting or retaliating with this weapon, the first time you strike with a critical success during that sequence, you gain one Blooded token.' },
  ],
  'BLOODED, CHAOS, BUTCHER'
);

card('TRAITOR COMMSMAN', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Lasgun',  atk: '4', hit: '4+', dmg: '2/3', wr: '–' },
    { name: 'Bayonet', atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'SIGNAL (1AP)', description: 'SUPPORT: Select one other friendly BLOODED operative (excluding OGRYN) visible to and within 6" of this operative. Until the end of that operative\'s next activation, add 1 to its APL stat.\n>This operative cannot perform this action while within control Range of an enemy operative.' },
    { name: 'SACRILEGIOUS ACTUATION (1AP)', description: 'You gain one Blooded token.\nThis operative cannot perform this action while within control Range of an enemy operative, or if it doesn\'t have one of your Blooded tokens.' },
  ],
  'BLOODED, CHAOS, COMMSMAN'
);

card('TRAITOR CORPSEMAN', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Lasgun',      atk: '4', hit: '4+', dmg: '2/3', wr: '–' },
    { name: 'Bayonet',     atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
    { name: 'Stim needle', atk: '3', hit: '5+', dmg: '1/4', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Regular Dosage', description: 'At the end of the Select Operatives step, if this operative is selected for deployment, you can select one other friendly BLOODED operative to gain a STIMM rule for the battle (excluding Rejuvenated).' },
    { name: 'STIMM Rules', description: 'Rejuvenated: The operative regains 2D3 lost wounds.\nEnraged: The operative\'s melee weapons have the Relentless weapon rule.\nFortified: Whenever an attack dice inflicts damage of 3 or more on the operative, roll one D6; on a 5+, subtract 1 from that inflicted damage.' },
    { name: 'STIMMS (1AP)', description: 'Select a BLOODED friendly operative within this operative\'s control Range, then select the STIMM Revitalized rule or another STIMM rule for that operative to have for the battle. You cannot select each STIMM rule more than once per battle for the same operative.\nThis operative cannot perform this action if it is within an enemy operative\'s control Range.' },
  ],
  'BLOODED, CHAOS, MEDIC, CORPSEMAN'
);

card('TRAITOR ENFORCER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '9' },
  [
    { name: 'Bolt pistol', atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Power fist',  atk: '4', hit: '4+', dmg: '5/7', wr: 'Brutal' },
  ],
  [
    { name: 'Gruelling Disciplinarian', description: 'Whenever a friendly BLOODED operative is within 6" of this operative, you can ignore any changes to that operative\'s stats from being injured (including its weapons\' stats). Whenever a friendly BLOODED operative is activated within 6" of this operative, you can ignore any changes to that operative\'s stats from being injured until the end of its activation (including its weapons\' stats).' },
    { name: 'ENFORCE (1AP)', description: 'Select one other friendly BLOODED operative visible to and within 3" of this operative. That operative can immediately perform a 1AP action for free, but it cannot move more than 2" during that action. If the selected friendly operative is a COMMSMAN, it cannot perform the Sacrilegious Actuation or Signal actions.\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'BLOODED, CHAOS, ENFORCER'
);

card('TRAITOR FLENSER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Skinning blades', atk: '4', hit: '3+', dmg: '3/4', wr: 'Ceaseless, Stalk*' },
  ],
  [
    { name: '*Stalk', description: 'Whenever this operative is fighting or retaliating with this weapon, if Light or Heavy terrain is within its control Range, this weapon has the Lethal 5+ weapon rule.' },
    { name: 'Wretched', description: 'This operative can perform the Charge action while it has a Conceal order. If this operative is incapacitated during the Fight action, you can strike with one of your unresolved successes before it\'s removed from the killzone.' },
  ],
  'BLOODED, CHAOS, FLENSER'
);

card('TRAITOR GUNNER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Flamer',                    atk: '4', hit: '2+', dmg: '3/3', wr: 'Range 8", Saturate, Torrent 2' },
    { name: 'Grenade launcher – Frag',   atk: '4', hit: '4+', dmg: '2/4', wr: 'Blast 2' },
    { name: 'Grenade launcher – Krak',   atk: '4', hit: '4+', dmg: '4/5', wr: 'Piercing 1' },
    { name: 'Meltagun',                  atk: '4', hit: '4+', dmg: '6/3', wr: 'Range 6", Devastating 4, Piercing 2' },
    { name: 'Plasma gun – Standard',     atk: '4', hit: '4+', dmg: '4/6', wr: 'Piercing 1' },
    { name: 'Plasma gun – Supercharge',  atk: '4', hit: '4+', dmg: '5/6', wr: 'Hot, Lethal 5+, Piercing 1' },
    { name: 'Bayonet',                   atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [],
  'BLOODED, CHAOS, GUNNER'
);

card('TRAITOR OGRYN', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '16' },
  [
    { name: 'Power maul and mutant claw', atk: '4', hit: '3+', dmg: '5/6', wr: 'Rending, Shock' },
  ],
  [
    { name: 'Avalanche of Muscle', description: 'Whenever this operative ends its move during the Charge action, you can inflict D3 damage on one enemy operative within its control Range.' },
    { name: 'Chem-enhanced', description: 'You can ignore any changes to this operative\'s APL stat and it\'s not affected by enemy operatives\' Shock and Stun weapon rules.' },
    { name: 'Brute', description: 'Whenever your opponent is selecting a valid target, if this operative has a Conceal order, it cannot use Light terrain for cover. Whilst this can allow this operative to be targeted (assuming it\'s visible), it doesn\'t remove its cover save (if any).' },
    { name: 'Slow-witted', description: 'You must spend 1 additional APL for this operative to perform the Pick Up Marker and mission actions (excluding Operate Hatch).' },
  ],
  'BLOODED, CHAOS, OGRYN'
);

card('TRAITOR SHARPSHOOTER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Sharpshooter\'s long-las – Mobile',     atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Sharpshooter\'s long-las – Stationary', atk: '4', hit: '2+', dmg: '3/3', wr: 'Devastating 1, Heavy (Dash only), Silent' },
    { name: 'Bayonet',                               atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Camo Cloak', description: 'Whenever an operative is shooting this operative, if you can retain any cover saves, you can retain one additional cover save. This isn\'t cumulative with improved cover saves from Vantage terrain.' },
    { name: 'A Name Whispered In Blood', description: 'STRATEGIC GAMBIT in the first turning point. Select one enemy operative. Whenever this operative is shooting that enemy operative, treat this operative as if it has one of your Blooded tokens and is under the GAZE OF THE GODS.' },
  ],
  'BLOODED, CHAOS, SHARPSHOOTER'
);

card('TRAITOR THUG', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Heavy club', atk: '4', hit: '3+', dmg: '4/4', wr: 'Brutal' },
  ],
  [
    { name: 'Tough', description: 'Whenever this operative is fighting or retaliating, or an operative is shooting it, Normal Dmg of 3 or more inflicts 1 less damage on it.' },
  ],
  'BLOODED, CHAOS, THUG'
);

card('TRAITOR TRENCH SWEEPER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '9' },
  [
    { name: 'Shotgun', atk: '4', hit: '3+', dmg: '3/3', wr: 'Range 6"' },
    { name: 'Bayonet', atk: '3', hit: '3+', dmg: '2/3', wr: 'Shield*' },
  ],
  [
    { name: '*Shield', description: 'Whenever this operative is fighting or retaliating with this weapon, each of your blocks can be allocated to block two unresolved successes (instead of one).' },
    { name: 'Shielding', description: 'Whenever this operative is activated, you can use this rule. If you do, until the start of this operative\'s next activation:\n• Subtract 2" from its Move stat.\n• Whenever an operative is shooting this operative, you can re-roll any of your defence dice.' },
  ],
  'BLOODED, CHAOS, TRENCH SWEEPER'
);

card('TRAITOR TROOPER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Lasgun',  atk: '4', hit: '4+', dmg: '2/3', wr: '–' },
    { name: 'Bayonet', atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Group Activation', description: 'Whenever this operative is expended, you must then activate one other ready friendly BLOODED TROOPER operative (if able) before your opponent activates. When that other operative is expended, your opponent then activates as normal (in other words, you cannot activate more than two operatives in succession with this rule).' },
  ],
  'BLOODED, CHAOS, TROOPER'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Blooded populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
