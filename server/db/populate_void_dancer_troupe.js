import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Void-Dancer Troupe'").get()?.id;
if (!FACTION_ID) { console.error('Void-Dancer Troupe faction not found'); process.exit(1); }

// Clear existing Void-Dancer Troupe data
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
  'Archetypes: INFILTRATION, RECON');

rule('faction_rules', null, 'OPERATIVES', 0,
  `1 VOID-DANCER TROUPE LEAD PLAYER operative with one option from each of the following:
• Fusion pistol, neuro disruptor or shuriken pistol
• Blade, caress, embrace, kiss or power weapon

7 VOID-DANCER TROUPE operatives selected from the following list:
• DEATH JESTER
• PLAYER with one option from each of the following:
  - Fusion pistol, neuro disruptor or shuriken pistol
  - Blade, caress, embrace or kiss
• SHADOWSEER with hallucinogen grenade and one of the following options:
  - Neuro disruptor; miststave
  - Shuriken pistol; miststave

Other than PLAYER operatives, your kill team can only include each operative on this list once. Your kill team can only include up to one fusion pistol and up to one neuro disruptor.`);

rule('faction_rules', null, 'SAEDATH', 0,
  `As a STRATEGIC GAMBIT in the first turning point, you must select an ALLEGORY for your kill team for the battle, and one friendly VOID-DANCER TROUPE operative to have the PIVOTAL ROLE for the battle.

Whenever a friendly operative has the PIVOTAL ROLE, it has the ACCOLADE rule of your ALLEGORY for the battle.

As a STRATEGIC GAMBIT in each subsequent turning point, you can select one friendly VOID-DANCER TROUPE operative to gain the ACCOLADE rule of your ALLEGORY for the battle.

Once per turning point, when a friendly operative that has the PIVOTAL ROLE completes the performance of your ALLEGORY, you can select a friendly VOID-DANCER TROUPE operative to gain the ACCOLADE rule of your ALLEGORY for the battle.

EPIC
Performance: The operative incapacitates an enemy operative while fighting or retaliating.
Accolade: Whenever this operative is fighting, its melee weapons have the Balanced weapon rule.

MELODRAMA
Performance: The operative incapacitates an enemy operative while shooting.
Accolade: The operative\'s ranged weapons have the Balanced weapon rule.`);

rule('faction_rules', null, 'HARLEQUIN\'S PANOPLY', 0,
  `Whenever an operative is shooting a friendly VOID-DANCER TROUPE operative, and no attack dice are retained as critical successes, worsen the x of the Piercing weapon rule by 1 (if any). Note that Piercing 1 would therefore be ignored.

Whenever a friendly VOID-DANCER TROUPE operative is climbing up, you can treat the vertical distance as 2" (regardless of how far the operative actually moves vertically).

Friendly VOID-DANCER TROUPE operatives can move within control range of enemy operatives (they must still start and end the move following all requirements for that move).`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'DARTING SALVO', 1,
  'Whenever a friendly VOID-DANCER TROUPE operative performs the Reposition action during its activation, it can perform the Shoot action afterwards (it must do so in a location it can be placed), and any remaining move distance it had from that Reposition action can be used after it does so.');

rule('ploy', 'Strategy', 'RISING CRESCENDO', 1,
  'Friendly VOID-DANCER TROUPE operatives can perform the Dash action during the same activation in which they performed the Charge action, but not vice versa (i.e., not Dash then Charge).');

rule('ploy', 'Strategy', 'PRISMATIC BLUR', 1,
  'Whenever an operative is shooting a friendly VOID-DANCER TROUPE operative that performed an action in which it moved during this turning point, you can re-roll one of your defence dice.');

rule('ploy', 'Strategy', 'CEGORACH\'S JEST', 1,
  'Whenever a friendly VOID-DANCER TROUPE operative is fighting or retaliating and your opponent strikes with a normal success, you can roll one D6: if the result is less than the Hit stat of your opponent\'s selected weapon, that strike is a block instead (ignore the Brutal weapon rule, if relevant) and you cannot use this rule for the rest of the sequence.');

rule('ploy', 'Firefight', 'MURDEROUS ENTRANCE', 1,
  'Use this firefight ploy when a friendly VOID-DANCER TROUPE operative is fighting during an activation in which it performed the Charge action. After you strike, you can immediately resolve another of your normal successes as a strike (before your opponent), or a critical success if there are none.');

rule('ploy', 'Firefight', 'THE CURTAIN FALLS', 1,
  'Use this firefight ploy when a friendly VOID-DANCER TROUPE operative is fighting, after you strike with a critical success if the enemy operative isn\'t incapacitated. End that sequence (any remaining attack dice are discarded) and immediately perform a free Fall Back action up to 3" with that operative (then the Fight action ends). That operative can do so even if it has performed an action that prevents it from performing the Fall Back action.');

rule('ploy', 'Firefight', 'ELUSIVE TARGET', 1,
  'Use this firefight ploy during a friendly VOID-DANCER TROUPE operative\'s activation. Until the start of its next activation, if that operative has a Conceal order and is in cover, it cannot be selected as a valid target, ignoring all other rules (e.g., Seek, Vantage terrain) except being within 2".');

rule('ploy', 'Firefight', 'DOMINO FIELD', 1,
  'Use this firefight ploy when an operative is shooting a friendly VOID-DANCER TROUPE operative, during the Resolve Defence Dice step. You can allocate one of your rolled successful dice to block all of your opponent\'s attack dice with matching results (e.g., one of your successful defence dice results of 5 can be used to block all successful attack dice results of 5).');

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

rule('equipment', null, 'WRAITHBONE TALISMAN', 0,
  'Once per turning point, when a friendly VOID-DANCER TROUPE operative is shooting, fighting or retaliating, if you roll two or more fails, you can discard one of them to retain another as a normal success instead.');

rule('equipment', null, 'SHRIEKER TOXIN ROUNDS', 0,
  'Once per turning point, when a friendly VOID-DANCER TROUPE operative is performing the Shoot action and you select a shuriken pistol or shrieker cannon (focused), you can use this rule. If you do, until the end of that action, that weapon has the Devastating 1 weapon rule.');

rule('equipment', null, 'DEATH MASK', 0,
  'Keep a Tragedy tally. Whenever a friendly VOID-DANCER TROUPE operative that has an ACCOLADE rule is incapacitated, add 1 to your Tragedy tally. When your Tragedy tally reaches 3, you gain 1CP and stop that tally.');

rule('equipment', null, 'UNDERSTUDY\'S MASK', 0,
  'Once per battle, when you activate a friendly VOID-DANCER TROUPE operative, if the friendly operative that has the PIVOTAL ROLE has been incapacitated, you can use this rule. If you do, that activated operative has the PIVOTAL ROLE for the battle.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('LEAD PLAYER', 'Leader',
  { APL: '3', MOVE: '7"', SAVE: '4+', WOUNDS: '9' },
  [
    { name: 'Fusion pistol',   atk: '4', hit: '3+', dmg: '5/3', wr: 'Range 3", Devastating 3, Piercing 2' },
    { name: 'Neuro disruptor', atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 8", Piercing 1, Stun' },
    { name: 'Shuriken pistol', atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Rending' },
    { name: 'Blade',           atk: '5', hit: '3+', dmg: '4/6', wr: '–' },
    { name: 'Caress',          atk: '5', hit: '3+', dmg: '4/5', wr: 'Rending' },
    { name: 'Embrace',         atk: '5', hit: '3+', dmg: '4/5', wr: 'Brutal' },
    { name: 'Kiss',            atk: '5', hit: '3+', dmg: '3/7', wr: '–' },
    { name: 'Power weapon',    atk: '5', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Lead the Performance', description: 'Once per battle STRATEGIC GAMBIT. If this operative is in the killzone, change the ALLEGORY you selected for your kill team. Note that the ACCOLADE rule friendly operatives have will also change.' },
  ],
  'VOID DANCER TROUPE, AELDARI, HARLEQUINS, LEADER, LEAD PLAYER'
);

card('DEATH JESTER', 'Specialist',
  { APL: '3', MOVE: '7"', SAVE: '4+', WOUNDS: '9' },
  [
    { name: 'Shrieker cannon – Focused',  atk: '5', hit: '3+', dmg: '4/5', wr: 'Rending, Heavy (Reposition only), Humbling Cruelty' },
    { name: 'Shrieker cannon – Sweeping', atk: '4', hit: '3+', dmg: '4/5', wr: 'Rending, Heavy (Dash only), Torrent 2, Humbling Cruelty' },
    { name: 'Shrieker blade',             atk: '4', hit: '3+', dmg: '3/4', wr: 'Rending' },
  ],
  [
    { name: 'Humbling Cruelty', description: 'If the target of this weapon isn\'t incapacitated but any of your attack dice inflict damage, the target gains one of your Humbling Cruelty tokens (if it doesn\'t already have one). Whenever an enemy operative has one of your Humbling Cruelty tokens, worsen the Hit stat of its weapons by 1 and subtract 2" from its Move stat. This isn\'t cumulative with being injured. At the end of that enemy operative\'s next activation, remove its Humbling Cruelty token.' },
  ],
  'VOID DANCER TROUPE, AELDARI, HARLEQUINS, DEATH JESTER'
);

card('PLAYER', 'Warrior',
  { APL: '3', MOVE: '7"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Fusion pistol',   atk: '4', hit: '3+', dmg: '5/3', wr: 'Range 3", Devastating 3, Piercing 2' },
    { name: 'Neuro disruptor', atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 8", Piercing 1, Stun' },
    { name: 'Shuriken pistol', atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Rending' },
    { name: 'Blade',           atk: '5', hit: '3+', dmg: '4/6', wr: '–' },
    { name: 'Caress',          atk: '5', hit: '3+', dmg: '4/5', wr: 'Rending' },
    { name: 'Embrace',         atk: '5', hit: '3+', dmg: '4/5', wr: 'Brutal' },
    { name: 'Kiss',            atk: '5', hit: '3+', dmg: '3/7', wr: '–' },
  ],
  [
    { name: 'Luck of the Laughing God', description: 'Once per turning point, you can use this rule. If you do, you can use a firefight ploy for 0CP if this is the specified VOID-DANCER TROUPE operative (including Command Re-roll if the attack or defence dice was rolled for this operative). You cannot select the same firefight ploy for this rule more than once per battle.' },
  ],
  'VOID DANCER TROUPE, AELDARI, HARLEQUINS, PLAYER'
);

card('SHADOWSEER', 'Specialist',
  { APL: '3', MOVE: '7"', SAVE: '4+', WOUNDS: '9' },
  [
    { name: 'Hallucinogen grenade', atk: '4', hit: '3+', dmg: '1/1', wr: 'Range 6", Blast 2", Lethal 5+, Seek Light, Silent, Stun' },
    { name: 'Neuro disruptor',      atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 8", Piercing 1, Stun' },
    { name: 'Shuriken pistol',      atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Rending' },
    { name: 'Miststave',            atk: '4', hit: '3+', dmg: '4/4', wr: 'Shock' },
  ],
  [
    { name: 'FOG OF DREAMS (1APL)', description: 'PSYCHIC. Select one ready enemy operative visible to this operative and roll one D6. Until the end of the turning point, that enemy operative cannot be activated or perform actions until it\'s the last enemy operative to be activated, or until your opponent has activated a number of enemy operatives after this action equal to the result of the D6 (whichever comes first). This operative cannot perform this action while within control Range of an enemy operative.' },
    { name: 'MIRROR OF MINDS (1APL)', description: 'PSYCHIC. Select one enemy operative that\'s a valid target for and within 8" of this operative. Both players roll five D6. Pair your dice with your opponent\'s dice based on matching results. For each matching pair, inflict D3 damage on that enemy operative (to a maximum of 8). For example, if you rolled 6, 5, 4, 2, and your opponent rolled 6, 5, 4, 4, 3, you would inflict 3D3 damage on that enemy operative. This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'VOID DANCER TROUPE, AELDARI, HARLEQUINS, PSYKER, SHADOWSEER'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Void-Dancer Troupe populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
