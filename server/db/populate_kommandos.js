import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Kommandos'").get()?.id;
if (!FACTION_ID) { console.error('Kommandos faction not found'); process.exit(1); }

// Clear existing Kommandos data
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
  `1 KOMMANDO NOB operative with one of the following options:
• Slugga; Big choppa
• Slugga; Power klaw

9 KOMMANDO operatives selected from the following list:
• KOMMANDO BOY
• KOMMANDO GROT*
• KOMMANDO SLASHA BOY
• KOMMANDO BREACHA BOY
• KOMMANDO SNIPA BOY
• KOMMANDO DAKKA BOY
• KOMMANDO COMMS BOY
• KOMMANDO BURNA BOY
• KOMMANDO ROKKIT BOY
• BOMB SQUIG*

Other than BOY operatives, your kill team can only include each operative on this list once.

*These operatives count as half a selection each, meaning you can select both of them and it\'s treated as one selection in total.`);

rule('faction_rules', null, 'THROAT SLITTAS', 0,
  'This operative can perform a Charge action while it has a Conceal order. This ability cannot be applied to BOMB SQUIG operative.');

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'DAKKA! DAKKA! DAKKA!', 1,
  'Friendly KOMMANDO operatives\' ranged weapons have the Punishing weapon rule.');

rule('ploy', 'Strategy', 'SKULK ABOUT', 1,
  'Whenever an enemy operative is shooting a friendly KOMMANDO operative that has a Conceal order, you can retain one of your defence dice as a normal success without rolling it (in addition to a cover save, if any).');

rule('ploy', 'Strategy', 'SSSSHHHH!', 1,
  'Each friendly KOMMANDO operative that\'s not a valid target for enemy operatives, or has a Conceal order and is more than 6" from enemy operatives, can immediately perform a free Dash action. You cannot use this ploy during the first turning point.');

rule('ploy', 'Strategy', 'WAAAGH!', 1,
  'Friendly KOMMANDO operatives\' melee weapons have the Balanced weapon rule.');

rule('ploy', 'Firefight', 'JUST A SCRATCH', 1,
  'Use this firefight ploy when an attack dice inflicts Normal Dmg on a friendly KOMMANDO operative (excluding BOMB SQUIG and GROT). Ignore that inflicted damage.');

rule('ploy', 'Firefight', 'KRUMP \'EM!', 1,
  'Use this firefight ploy at the end of the Firefight phase. Select one friendly KOMMANDO operative. It can immediately perform a free Fight action.');

rule('ploy', 'Firefight', 'SHAKE IT OFF', 1,
  'Use this firefight ploy when a friendly KOMMANDO operative is activated, or when its APL stat is changed. Until the start of the next turning point, you can ignore any changes to its APL stat.');

rule('ploy', 'Firefight', 'KUNNIN\' BUT BRUTAL', 1,
  'Use this firefight ploy when a friendly KOMMANDO operative that has a Conceal order is fighting during an activation in which it performed the Charge action, you\'re resolving the first attack dice, and it\'s a strike with a normal success. Treat that normal success as a critical success instead.');

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

rule('equipment', null, 'CHOPPA', 0,
  `Friendly KOMMANDO operatives (excluding BOMB SQUIG and GROT) have the following melee weapon. Note that some operatives already have this weapon but with better stats; in that instance, use the better version.

NAME: Choppa | ATK: 3 | HIT: 3+ | DMG: 4/5`);

rule('equipment', null, 'HARPOON', 0,
  `Once per turning point, a friendly KOMMANDO operative (excluding BOMB SQUIG and GROT) can use the following ranged weapon.

NAME: Harpoon | ATK: 4 | HIT: 4+ | DMG: 4/5 | WR: Range 8", Lethal 5+, Stun`);

rule('equipment', null, 'DYNAMITE', 0,
  `Once per battle, a friendly KOMMANDO operative (excluding BOMB SQUIG and GROT) can use the following ranged weapon.

NAME: Dynamite | ATK: 5 | HIT: 4+ | DMG: 4/5 | WR: Range 4", Blast 1", Heavy (Reposition only), Saturate`);

rule('equipment', null, 'COLLAPSIBLE STOCKS', 0,
  `Remove Range weapon rule of the following ranged weapons that friendly KOMMANDO operatives have:
• Shokka pistol
• Slugga`);

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('KOMMANDO BOSS NOB', 'Leader',
  { APL: '3', MOVE: '6"', SAVE: '5+', WOUNDS: '14' },
  [
    { name: 'Slugga',      atk: '4', hit: '4+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Big choppa', atk: '5', hit: '3+', dmg: '5/6', wr: '–' },
    { name: 'Power klaw', atk: '4', hit: '3+', dmg: '5/7', wr: 'Brutal, Shock' },
  ],
  [
    { name: 'Krumpin\' Time', description: 'This operative can perform two Fight actions during its activation.' },
    { name: 'GET IT DUN! (1APL)', description: 'SUPPORT. Select one other friendly KOMMANDO operative (excluding BOMB SQUIG) visible to and within 6" of this operative. Until the end of that operative\'s next activation, add 1 to its APL stat. This operative cannot perform this action while within control Range of an enemy operative, or while counteracting.' },
  ],
  'KOMMANDO, ORK, CLAN, LEADER, NOBLE'
);

card('KOMMANDO SLASHA BOY', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '10' },
  [
    { name: 'Throwing knives', atk: '4', hit: '3+', dmg: '2/5', wr: 'Range 6", Silent' },
    { name: 'Twin choppas',   atk: '4', hit: '3+', dmg: '4/5', wr: 'Ceaseless, Lethal 5+' },
  ],
  [
    { name: 'Dat All You Got?', description: 'After this operative fights or retaliates, if it wasn\'t incapacitated, you can inflict D3 damage on the enemy operative in that sequence.' },
  ],
  'KOMMANDO, ORK, CLAN, SLASHA BOY'
);

card('KOMMANDO BREACHA BOY', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '10' },
  [
    { name: 'Slugga',      atk: '4', hit: '4+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Breacha ram', atk: '4', hit: '4+', dmg: '5/5', wr: 'Brutal, Severe, Shock' },
  ],
  [
    { name: 'BREACH (1APL)', description: 'Place one of your Breach markers within this operative\'s control Range as close as possible to a terrain feature within control Range of it. Whenever an operative is within 1" of that marker, it treats parts of that terrain feature that are no more than 1" thick as Accessible terrain. This operative can perform this action during the Charge or Reposition action, and it can do so for 1 less AP during those actions. Any remaining move distance can be used after it does so. This operative cannot perform this action while within control Range of an enemy operative, or if a terrain feature isn\'t within its control Range.' },
  ],
  'KOMMANDO, ORK, CLAN, BREACHA BOY'
);

card('KOMMANDO SNIPA BOY', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '10' },
  [
    { name: 'Scoped big shoota – Concealed',  atk: '5', hit: '3+', dmg: '3/3', wr: 'Devastating 2, Heavy, Silent, Concealed Position*' },
    { name: 'Scoped big shoota – Stationary', atk: '5', hit: '3+', dmg: '3/3', wr: 'Devastating 2, Heavy' },
    { name: 'Scoped big shoota – Sweeping',   atk: '5', hit: '3+', dmg: '3/4', wr: 'Heavy (Dash only), Torrent 1"' },
    { name: 'Fists',                          atk: '3', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Concealed Position*', description: 'This operative can only use this weapon the first time it\'s performing the Shoot action during the battle.' },
  ],
  'KOMMANDO, ORK, CLAN, SNIPA BOY'
);

card('KOMMANDO DAKKA BOY', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '10' },
  [
    { name: 'Dakka Shoota – Short range', atk: '5', hit: '4+', dmg: '3/4', wr: 'Range 9", Ceaseless' },
    { name: 'Dakka Shoota – Long range',  atk: '5', hit: '4+', dmg: '3/4', wr: '–' },
    { name: 'Fists',                      atk: '3', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'DAKKA DASH (1APL)', description: 'Perform a free Dash action and a free Shoot action with this operative in any order. You can only select a dakka shoota for that Shoot action. This operative cannot perform this action while it has a Conceal order, or while within control Range of an enemy operative.' },
  ],
  'KOMMANDO, ORK, CLAN, DAKKA BOY'
);

card('KOMMANDO COMMS BOY', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '10' },
  [
    { name: 'Shokka pistol', atk: '6', hit: '4+', dmg: '1/0', wr: 'Range 8", Devastating 2, Severe, Stun' },
    { name: 'Fists',         atk: '3', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'I Got a Plan, Ladz', description: 'Once during each of this operative\'s activations, it can perform the Pick Up Marker, Place Marker, or a mission action for 1 less AP.' },
    { name: 'LISTEN IN (1APL)', description: 'SUPPORT. Select one other friendly KOMMANDO operative (excluding BOMB SQUIG) visible to and within 6" of this operative. Until the end of that operative\'s next activation, add 1 to its APL stat. This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'KOMMANDO, ORK, CLAN, COMMS BOY'
);

card('KOMMANDO BURNA BOY', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '10' },
  [
    { name: 'Burna – Standard', atk: '4', hit: '2+', dmg: '3/3', wr: 'Range 8", Saturate, Torrent 2' },
    { name: 'Burna – Deluge',   atk: '4', hit: '2+', dmg: '3/3', wr: 'Range 4", Saturate, Seek Light, Torrent 0"' },
    { name: 'Fists',            atk: '3', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [],
  'KOMMANDO, ORK, CLAN, BURNA BOY'
);

card('KOMMANDO ROKKIT BOY', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '10' },
  [
    { name: 'Rokkit launcha – Aimed',  atk: '6', hit: '4+', dmg: '4/5', wr: 'Blast 1, Ceaseless, Heavy (Dash only)' },
    { name: 'Rokkit launcha – Mobile', atk: '6', hit: '4+', dmg: '4/5', wr: 'Blast 1' },
    { name: 'Fists',                   atk: '3', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [],
  'KOMMANDO, ORK, CLAN, ROKKIT BOY'
);

card('KOMMANDO BOY', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '10' },
  [
    { name: 'Slugga', atk: '4', hit: '4+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Choppa', atk: '4', hit: '3+', dmg: '4/5', wr: '–' },
  ],
  [
    { name: 'Taktical Wot-notz', description: 'You can do each of the following once per turning point:\n• One friendly KOMMANDO BOY operative can perform the Smoke Grenade action.\n• One friendly KOMMANDO BOY operative can perform the Stun Grenade action.\nThe rules for these actions are found in universal equipment. Performing these actions using this rule doesn\'t count towards their action limits (i.e., if you also select those grenades from equipment).' },
  ],
  'KOMMANDO, ORK, CLAN, KOMMANDO BOY'
);

card('KOMMANDO GROT', 'Specialist',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '5' },
  [
    { name: 'Grot choppa', atk: '3', hit: '5+', dmg: '1/4', wr: '–' },
  ],
  [
    { name: 'Sneaky Zogger', description: 'This operative cannot have an Engage order. Whenever this operative is in cover, it cannot be selected as a valid target, taking precedence over all other rules (e.g. Seek, Vantage terrain) except being within 2".' },
    { name: 'GRAPPLING HOOK (1APL)', description: 'Select a visible point on a terrain feature for this operative. Remove this operative from the killzone and set it back up within 1" horizontally of that point in a location it can be placed, not within control Range of enemy operatives, and with that point visible to it. This operative cannot perform the Operate Hatch action during this action. This action is treated as a Reposition action. This operative cannot perform this action while within control Range of an enemy operative, or during an activation in which it performed the Charge or Fall Back action (or vice versa).' },
  ],
  'KOMMANDO, ORK, CLAN, GROT'
);

card('KOMMANDO BOMB SQUIG', 'Specialist',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '5' },
  [
    { name: 'Dynamite',    atk: '6', hit: '4+', dmg: '4/5', wr: 'Blast 1, Limited 1, Explosive*' },
    { name: 'Vicious bite', atk: '3', hit: '4+', dmg: '4/5', wr: '–' },
  ],
  [
    { name: 'Explosive*', description: 'This operative can perform the Shoot action with this weapon while within control Range of an enemy operative. Don\'t select a valid target. Instead, this operative is always the primary target and cannot be in cover or obscured.' },
    { name: 'Boom!', description: 'If this operative is incapacitated during a battle in which it hasn\'t used its explosives, roll one D6, or two D6 if you wish. If any result is a 4+, this operative performs a free Shoot action with its explosives before it\'s removed from the killzone.' },
    { name: 'Stoopid', description: 'In the Firefight phase, whenever you determine this operative\'s order, you cannot select Conceal. This operative cannot perform any actions other than Charge, Dash, Fight, Reposition, and Shoot. It cannot use any weapons that aren\'t on its datacard.' },
    { name: 'Expendable', description: 'This operative is ignored for your opponent\'s kill/elimination op (when it\'s incapacitated, and when determining your starting number of operatives). It\'s also ignored for victory conditions and scoring VPs if either require operatives to \'escape\', \'survive\' or be incapacitated by enemy operatives (if it escapes/survives/is incapacitated, determining how many operatives must escape/survive/be incapacitated, etc.).' },
  ],
  'KOMMANDO, ORK, CLAN, BOMB SQUIG'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Kommandos populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
