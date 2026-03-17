import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Nemesis Claw'").get()?.id;
if (!FACTION_ID) { console.error('Nemesis Claw faction not found'); process.exit(1); }

// Clear existing Nemesis Claw data
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
  `1 NEMESIS CLAW NIGHT LORD VISIONARY with one of the following options:
• Bolt pistol; Power weapon
• Plasma pistol; Nostraman chainsblade
• Bolt pistol; Power maul
• Bolt pistol; Power fist

5 NEMESIS CLAW operatives selected from the following list:
• FEARMONGER
• SCREECHER
• SKINTHIEF
• VENTRILOKAR
• HEAVY GUNNER with one of the following options:
  - Bolt Pistol; Heavy bólter; Fists
  - Bolt Pistol; Missile launcher; Fists
• GUNNER with one of the following options:
  - Bolt Pistol; Flamer; Fists
  - Bolt Pistol; Meltagun; Fists
  - Bolt Pistol; Plasma gun; Fists
• WARRIOR equipped with one of the following options:
  - Bolt pistol; Chainsword
  - Boltgun; Fists

Other than WARRIOR operatives, your kill team can only include each operative above once.`);

rule('faction_rules', null, 'IN MIDNIGHT CLAD', 0,
  `Whenever an enemy operative is shooting a friendly NEMESIS CLAW operative, that friendly operative is obscured if both of the following are true:
• It\'s more than 8" from enemy operatives it\'s visible to.
• It has Heavy terrain within its control range, or any part of its base is underneath Vantage terrain.`);

rule('faction_rules', null, 'ASTARTES', 0,
  `During each friendly NEMESIS CLAW operative\'s activation, it can perform either two Shoot actions or two Fight actions. If it\'s two Shoot actions, a bolt pistol, boltgun or scoped bolt pistol must be selected for at least one of them.

Each friendly NEMESIS CLAW operative can counteract regardless of its order.`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'WE HAVE COME FOR YOU', 1,
  'Whenever a friendly NEMESIS CLAW operative is activated, if the first action it performs during that activation is the Charge action, when it ends its move during that action, you can inflict D3 damage on one enemy operative within its control range.');

rule('ploy', 'Strategy', 'THE BLACK HUNT', 1,
  'Whenever a friendly NEMESIS CLAW operative is shooting against, fighting against or retaliating against a wounded enemy operative, you can re-roll one of your attack dice.');

rule('ploy', 'Strategy', 'PREYSIGHT', 1,
  'Whenever you\'re selecting a valid target for a friendly NEMESIS CLAW operative, enemy operatives within 6" of it cannot use Light terrain for cover. While this can allow such operatives to be targeted (assuming they\'re visible), it doesn\'t remove their cover save (if any).');

rule('ploy', 'Strategy', 'RETURN TO DARKNESS', 1,
  'One friendly NEMESIS CLAW operative can immediately perform a free Fall Back or Reposition action, but it must end that move with Heavy terrain within its control range, or any part of its base underneath Vantage terrain. In addition, it cannot move more than 4" during that action and it cannot end that move closer to enemy operatives (in a killzone that uses the close quarters rules, e.g. Killzone: Gallowdark, ignore Wall terrain when determining this).');

rule('ploy', 'Firefight', 'VOX SCREAM', 1,
  'Use this firefight ploy when your opponent would activate an enemy operative that\'s visible to a friendly NEMESIS CLAW operative. Roll one D6; if the result is higher than that enemy operative\'s APL stat, your opponent cannot activate it during this activation; if the result is less than or equal to that enemy operative\'s APL stat, this ploy isn\'t used, the CP spent on it is refunded and you cannot use this ploy again during this turning point. If there are no other enemy operatives eligible to be activated, this ploy has no effect.');

rule('ploy', 'Firefight', 'DEATH TO THE FALSE EMPEROR', 1,
  'Use this firefight ploy after rolling your attack dice for a friendly NEMESIS CLAW operative, if it\'s shooting against, fighting against or retaliating against an operative that has the IMPERIUM keyword. That friendly operative\'s weapons have the Ceaseless weapon rule until the end of that sequence; if that enemy operative also has the ADEPTUS ASTARTES keyword, that friendly operative\'s weapons have the Relentless weapon rule until the end of that sequence instead.');

rule('ploy', 'Firefight', 'PROCLIVITY FOR MURDER', 1,
  'Use this firefight ploy after a friendly NEMESIS CLAW operative incapacitates an enemy operative within its control range. That friendly operative can immediately perform a free Charge or Dash action (for the former, it cannot move more than 3"), even if it\'s performed an action that prevents it from performing those actions.');

rule('ploy', 'Firefight', 'DIRTY FIGHTER', 1,
  'Use this firefight ploy when a friendly NEMESIS CLAW operative is retaliating, at the start of the Resolve Attack Dice step. You can resolve one of your successes before the normal order. If you do, you cannot resolve any other successes during that sequence.');

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

rule('equipment', null, 'FLAYED SKIN', 0,
  'Flayed Skin: Whenever an enemy operative is shooting against, fighting against or retaliating against a friendly NEMESIS CLAW operative within 2" of it, your opponent cannot re-roll their attack dice results of 1.');

rule('equipment', null, 'CHAIN SNARE', 0,
  'Whenever an enemy operative would perform the Fall Back action while within control range of a friendly NEMESIS CLAW operative, if no other enemy operatives are within that friendly operative\'s control range, you can use this rule. If you do, roll two D6, or one D6 if that enemy operative has a higher Wounds stat than that friendly operative. If any result is a 4+, that enemy operative cannot perform that action during that activation or counteraction (no AP are spent on it), and you cannot use this rule again during this turning point.');

rule('equipment', null, 'GRISLY TROPHY', 0,
  'Grisly Trophy: Once per battle, when a friendly NEMESIS CLAW operative incapacitates an enemy operative within 2" of it, it gains one of your Grisly Trophy tokens (if it doesn\'t already have one). Whenever a friendly NEMESIS CLAW operative that has one of your Grisly Trophy tokens is visible to and within 2" of an enemy operative, subtract 1 from the Atk stat of that enemy operative\'s weapons.');

rule('equipment', null, 'COMMS JAMMERS', 0,
  'Comms Jammers: Whenever an enemy operative is within 3" of a friendly NEMESIS CLAW operative, that enemy operative\'s APL stat cannot be added to. Note that this doesn\'t affect APL stats that have already been changed.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('NIGHT LORD VISIONARY', 'Leader',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '15' },
  [
    { name: 'Bolt pistol',                     atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Plasma pistol – Standard',        atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 8", Piercing 1' },
    { name: 'Plasma pistol – Supercharge',     atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 8", Hot, Lethal 5+, Piercing 1' },
    { name: 'Power weapon',                    atk: '5', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
    { name: 'Nostraman Chainsblade',           atk: '5', hit: '3+', dmg: '4/5', wr: 'Rending' },
    { name: 'Power fist',                      atk: '5', hit: '4+', dmg: '5/7', wr: 'Brutal' },
    { name: 'Power maul',                      atk: '5', hit: '3+', dmg: '4/6', wr: 'Shock' },
  ],
  [
    { name: 'Prescience: PSYCHIC', description: 'In the Ready step of each Strategy phase, you gain D3 Prescience points. At the end of each turning point, discard your Prescience points. You can spend your Prescience points in the Firefight phase as follows (you cannot use each of the following rules more than once per turning point):\n• Foreboding: PSYCHIC. Whenever it\'s your turn to activate a friendly operative, you can spend 1 of your Prescience points to skip that activation.\n• Portent: PSYCHIC. Whenever an attack dice inflicts Normal Dmg on this operative, you can spend 1 of your Prescience points to ignore that inflicted damage.\nYou cannot gain or spend your Prescience points if this operative is incapacitated.' },
    { name: 'PREMONITION (1APL)', description: 'PSYCHIC. Spend 1 of your Prescience points to gain 1CP. This operative cannot perform this action while within control Range of an enemy operative, or more than once per turning point.' },
  ],
  'NEMESIS CLAW, CHAOS, HERETIC ASTARTES, LEADER, PSYKER, VISIONARY'
);

card('FEARMONGER', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Scoped bolt pistol – Short range', atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Lethal 5+' },
    { name: 'Scoped bolt pistol – Long range',  atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Terrorchem vial',                  atk: '5', hit: '3+', dmg: '2/0', wr: 'Range 6", Blast 2, Devastating 3, Limited 1, Saturate, Terrorchem*' },
    { name: 'Tainted blade',                    atk: '5', hit: '3+', dmg: '3/5', wr: 'Terrorchem*' },
  ],
  [
    { name: '*Terrorchem', description: 'In the Resolve Attack Dice step, if you inflict damage with any critical successes, the operative this weapon is being used against gains one of your Terrorchem tokens (if it doesn\'t already have one).\n\nTerrorchem Poison: Whenever an operative that has one of your Terrorchem tokens is activated, inflict D3 damage on it.' },
    { name: 'POISON OBJECTIVE (1APL)', description: 'Select one objective marker this operative controls to gain one of your Terrorchem tokens. It cannot be an objective marker within control Range of an enemy operative, or one that already has one of your Terrorchem tokens. The first time that objective marker is within control Range of an enemy operative that doesn\'t have one of your Terrorchem tokens, that operative gains that Terrorchem token, then inflict 2D3 damage on it (if it\'s during an action, at the end of that action). This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'NEMESIS CLAW, CHAOS, HERETIC ASTARTES, FEARMONGER'
);

card('SCREECHER', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Lightning claws', atk: '5', hit: '3+', dmg: '4/5', wr: 'Ceaseless, Lethal 5+' },
  ],
  [
    { name: 'Screecher', description: 'Whenever an enemy operative within 3" of this operative is shooting, fighting, or retaliating, your opponent cannot re-roll their attack dice.' },
    { name: 'Appetite for Cruelty', description: 'Whenever this operative is fighting against a wounded enemy operative, this operative\'s lightning claws have the Lethal 4+ weapon rule.' },
  ],
  'NEMESIS CLAW, CHAOS, HERETIC ASTARTES, SCREECHER'
);

card('SKINTHIEF', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Bolt pistol',          atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Nostraman Chaingaive', atk: '5', hit: '3+', dmg: '4/6', wr: 'Rending' },
  ],
  [
    { name: 'Flay Them Alive', description: 'Once per turning point, when this operative incapacitates an enemy operative within its control range, you can select one other enemy operative visible to and within 6" of either this operative or the incapacitated enemy operative. Until the start of the next turning point, that other enemy operative cannot control markers or perform the Pick Up Marker or mission actions.' },
    { name: 'Tyrant of the Skinning Pits', description: 'Whenever this operative is fighting or retaliating, Normal and Critical Dmg of 3 or more inflicts 1 less damage on it.' },
  ],
  'NEMESIS CLAW, CHAOS, HERETIC ASTARTES, SKINTHIEF'
);

card('VENTRILOKAR', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Bolt pistol',  atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Chainsword',   atk: '5', hit: '3+', dmg: '4/5', wr: '–' },
  ],
  [
    { name: 'Icon Bearer', description: 'Whenever determining control of a marker, treat this operative\'s APL stat as 1 higher. Note this isn\'t a change to its APL stat, so any changes are cumulative with this.' },
    { name: 'DISCONCERTING MIMICRY (1APL)', description: 'PSYCHIC. Select one enemy operative within 6" of this operative, then select one of the following for that enemy operative (you can only select each option once per battle):\n• Until the end of its next activation, subtract 1 from its APL stat.\n• Change its order.\n• Perform a free Dash action with it (specify the location for your opponent to move it to).\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'NEMESIS CLAW, CHAOS, HERETIC ASTARTES, PSYKER, VENTRILOKAR'
);

card('HEAVY GUNNER', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Heavy bolter – Focused',   atk: '5', hit: '3+', dmg: '4/5', wr: 'Heavy (Reposition only), Piercing Crits 1' },
    { name: 'Heavy bolter – Sweeping',  atk: '4', hit: '3+', dmg: '4/5', wr: 'Heavy (Reposition only), Piercing Crits 1, Torrent 1' },
    { name: 'Missile launcher – Frag',  atk: '4', hit: '3+', dmg: '3/5', wr: 'Blast 2, Heavy (Reposition only)' },
    { name: 'Missile launcher – Krak',  atk: '4', hit: '3+', dmg: '5/7', wr: 'Heavy (Reposition only), Piercing 1' },
    { name: 'Bolt pistol',              atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Fists',                    atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [],
  'NEMESIS CLAW, CHAOS, HERETIC ASTARTES, HEAVY GUNNER'
);

card('GUNNER', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Bolt pistol',              atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Flamer',                   atk: '4', hit: '2+', dmg: '3/3', wr: 'Range 8", Saturate, Torrent 2' },
    { name: 'Meltagun',                 atk: '4', hit: '3+', dmg: '6/3', wr: 'Range 6", Devastating 4, Piercing 2' },
    { name: 'Plasma gun – Standard',    atk: '4', hit: '3+', dmg: '4/6', wr: 'Piercing 1' },
    { name: 'Plasma gun – Supercharge', atk: '4', hit: '3+', dmg: '5/6', wr: 'Hot, Lethal 5+, Piercing 1' },
    { name: 'Fists',                    atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [],
  'NEMESIS CLAW, CHAOS, HERETIC ASTARTES, GUNNER'
);

card('WARRIOR', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Bolt pistol', atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Boltgun',     atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Chainsword',  atk: '5', hit: '3+', dmg: '4/5', wr: '–' },
    { name: 'Fists',       atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Cruel Tormenter', description: 'Whenever this operative is shooting against, fighting against or retaliating against an injured enemy operative, or an enemy operative that has a Wounds stat of 7 or less, its weapons have the Lethal 5+ weapon rule.' },
  ],
  'NEMESIS CLAW, CHAOS, HERETIC ASTARTES, WARRIOR'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Nemesis Claw populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
