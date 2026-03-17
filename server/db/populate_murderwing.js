import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Murderwing'").get()?.id;
if (!FACTION_ID) { console.error('Murderwing faction not found'); process.exit(1); }

// Clear existing Murderwing data
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
  'Archetypes: RECON, SEEK-DESTROY');

rule('faction_rules', null, 'OPERATIVES', 0,
  `1 MURDERWING CHAOS LORD operative with one option from each of the following:
• Bolt pistol or plasma pistol*
• Lightning claw, power fist or power weapon

Or the following option:
• Relic lightning claws

5 MURDERWING operatives selected from the following list:
• CHAMPION with one option from each of the following:
  - Plasma pistol* or bolt pistol
  - Power fist or power weapon
• CURSECLAW
• DEPREDATOR
• HUNTMASTER
• RAPTOR with one of the following options:
  - Bolt pistol; chainsword
  - Plasma pistol*; chainsword
• SHRIEKER
• SKYSEAR with one of the following options:
  - Flamer; bolt pistol; fists
  - Meltagun*; bolt pistol; fists
  - Plasma gun*; bolt pistol; fists
• WARP TALON

Other than RAPTOR operatives, your kill team can only include each operative on this list once.

* You cannot select more than two operatives with these weapons combined.`);

rule('faction_rules', null, 'JUMP PACK', 0,
  `Whenever a friendly MURDERWING operative is performing the Charge, Fall Back or Reposition action during its activation, at the start of any straight-line increment, as long as no part of its base is underneath Vantage terrain, it can do a BOOST for that increment. If it does, don't move it for that increment. Instead, remove it from the killzone and set it back up wholly within x" horizontally of its original location. X is a distance of your choice (rounded up to the nearest inch, as per the Reposition action), but it's added to the total move distance used for that action (in other words, move plus BOOST cannot exceed the action's move allowance).

That operative must be set up in a location it can be placed and cannot be set up with any part of its base underneath Vantage terrain. In addition, unless it's the Charge action, it cannot be set up within control range of an enemy operative. It can continue moving after a BOOST if it has any move distance remaining and the action allows it.

In a killzone that uses the close quarters rules, e.g. Killzone: Tomb World, the x" cannot be measured over or through Wall terrain, and that operative cannot be set up on the other side of an access point – in other words, it cannot BOOST through an open hatchway.

BOOST ACTIONS: Some actions are known as BOOST actions. These are actions performed during other actions when a BOOST is used. Each operative cannot perform more than one BOOST action per activation/counteraction.

Most BOOST actions affect enemy operatives within a friendly MURDERWING operative's BOOST ZONE. This is the horizontal area between a friendly MURDERWING operative's current location and the location from which it used BOOST. A marker the same size as the operative's base can be temporarily placed to help determine this. Enemy operatives with any part of their base underneath Vantage terrain are not within friendly MURDERWING operatives' BOOST ZONEs.`);

rule('faction_rules', null, 'ASTARTES', 0,
  `During each friendly MURDERWING operative's activation, it can perform either two Shoot actions or two Fight actions. If it's two Shoot actions, a bolt pistol must be selected for at least one of them.

Each friendly MURDERWING operative can counteract regardless of its order.`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'PREDATORS ABOVE', 1,
  `Whenever a friendly MURDERWING operative is at least 2" higher than the killzone floor, its weapons have the Balanced weapon rule.

Whenever a friendly MURDERWING operative does a BOOST, its weapons have the Balanced weapon rule until the end of that activation.`);

rule('ploy', 'Strategy', 'CULL THE WEAK', 1,
  `Whenever a friendly MURDERWING operative is shooting or fighting, its weapons have the Punishing weapon rule if any of the following are true for the operative that friendly operative is shooting or fighting against:
• It's at least 2" lower than that friendly operative.
• Its APL stat is less than normal.
• It was wounded at the start of the activation/counteraction.`);

rule('ploy', 'Strategy', 'NIGHTMARE ON HIGH', 1,
  'Whenever an operative is shooting a friendly MURDERWING operative that\'s at least 2" higher than the killzone floor, or that did a BOOST during this turning point, you can re-roll one of your defence dice.');

rule('ploy', 'Strategy', 'INSTIL FEAR', 1,
  'Whenever a friendly MURDERWING operative is fighting, Normal Dmg of 3 or more inflicts 1 less damage on it.');

rule('ploy', 'Firefight', 'MALICIOUS NARCISSISM', 1,
  'Use this firefight ploy when it\'s your turn to activate with a friendly operative, if only one friendly MURDERWING operative is ready. Until the end of the turning point, whenever any ready enemy operatives are in the killzone, you can skip your activations (in other words, you can delay that friendly MURDERWING operative\'s activation). Note that you cannot counteract until that friendly MURDERWING operative is expended.');

rule('ploy', 'Firefight', 'MURDEROUS DESCENT', 1,
  'Use this firefight ploy when an enemy operative ends the Charge, Dash, Fall Back or Reposition action within 3" horizontally and more than 2" lower than a friendly MURDERWING operative (or in close quarters, within 2" and that enemy operative must be in a different room to where it started that action). Interrupt that enemy operative\'s activation/counteraction and immediately perform a free Charge action with that friendly operative. It must end that action within control range of that enemy operative. If this isn\'t possible, the interruption is cancelled and this rule hasn\'t been used.');

rule('ploy', 'Firefight', 'LONG FORGOTTEN HONOUR', 1,
  'Use this firefight ploy when a friendly MURDERWING operative is fighting or retaliating, when you resolve a critical success. Instead of striking or blocking, end that sequence (any remaining attack dice are discarded) and immediately perform a free Fall Back action up to 3" with that operative (then the Fight action ends). That operative can do so even if it\'s performed an action that prevents it from performing the Fall Back action.');

rule('ploy', 'Firefight', 'WINGS OF DARKNESS', 1,
  'Use this firefight ploy when a friendly MURDERWING operative is performing the Fall Back or Reposition action, when it does a BOOST. That operative can be set up an additional 3" away during that BOOST (adding this to the permitted move distance), but it cannot perform the Shoot, Fight or Carving Blow (see DEPREDATOR operative) action until the next turning point. You cannot use this ploy during the first turning point.');

// ── TACOPS ───────────────────────────────────────────────────────────────────

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

// ── EQUIPMENT ────────────────────────────────────────────────────────────────

rule('equipment', null, 'BLADEFINS', 0,
  `Friendly MURDERWING operatives can perform the following unique action:

SLICE FROM ABOVE (1AP): BOOST action. Inflict D3+1 damage on one enemy operative within this operative's BOOST ZONE.

This operative cannot perform this action normally. Instead, it performs this action during the Fall Back or Reposition action after setting up from a BOOST. A DEPREDATOR operative cannot perform this action during the same activation in which it performed the Carving Blow action (or vice versa).`);

rule('equipment', null, 'CLAWED ARMOUR', 0,
  `Friendly MURDERWING operatives can perform the following unique action:

CLAWED CHARGE (0AP): BOOST action. Inflict 1 damage on one enemy operative within this operative's control range, then the Charge action ends..

This operative cannot perform this action normally. Instead, it performs this action during the Charge action after setting up from a BOOST.`);

rule('equipment', null, 'WARP FUEL', 0,
  'Once per turning point, when an enemy operative ends the Fall Back action during its activation, if at least one friendly MURDERWING operative was within its control range at the start of that action, you can use this rule. One of those friendly operatives can immediately perform a free Reposition or Charge action, but cannot use more than 3" of move distance. Note that if the enemy operative doesn\'t perform the Fall Back action during its own activation, this has no effect.');

rule('equipment', null, 'VOX-CASTERS', 0,
  `Once per turning point, one friendly MURDERWING operative can perform the following unique action:

VOX-CRY (1AP): Each enemy operative within 3" of this operative takes a stun test. For an operative to take a stun test, roll one D6: on a 3+, subtract 1 from its APL stat until the end of its next activation.

An operative cannot perform this action while it has a Conceal order.`);

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('MURDERWING CHAOS LORD', 'Leader',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '15' },
  [
    { name: 'Bolt pistol',                     atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Plasma pistol – Standard',        atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 8", Piercing 1' },
    { name: 'Plasma pistol – Supercharge',     atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 8", Hot, Lethal 5+, Piercing 1' },
    { name: 'Lightning claw',                  atk: '5', hit: '3+', dmg: '4/5', wr: 'Lethal 5+, Rending' },
    { name: 'Power fist',                      atk: '4', hit: '3+', dmg: '5/7', wr: 'Brutal, Shock' },
    { name: 'Power weapon',                    atk: '5', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
    { name: 'Relic power claws',               atk: '5', hit: '3+', dmg: '4/6', wr: 'Ceaseless, Lethal 5+, Rending' },
  ],
  [
    { name: 'Path to Damnation', description: 'This operative starts the battle with 1 Damnation point. Once per action, you can attempt to use one Boon of Damnation when it specifies (see right). If you do, roll one D6 and compare the result to the number of Damnation points this operative has; if the result is:\n• Higher: Resolve the rule, then this operative gains 1 Damnation point.\n• Equal: Do not resolve the rule.\n• Less: Inflict damage on this operative equal to its number of Damnation points and do not resolve the rule.\nIf this operative has 6 Damnation points, resolve the rule without rolling. Note that you cannot make an attempt more than once per action, regardless of the D6 result.' },
    { name: 'Boons of Damnation', description: 'Boons of Damnation are as follows (resolved with a D6 roll, see opposite):\n• When an attack dice inflicts damage of 3 or more on this operative, you can ignore an amount of damage equal to this operative\'s Damnation points.\n• When this operative is fighting or retaliating and you strike, you can inflict an amount of additional damage equal to this operative\'s Damnation points.' },
  ],
  'MURDERWING, CHAOS, HERETIC ASTARTES, LEADER, LORD'
);

card('MURDERWING CHAMPION', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Bolt pistol',                     atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Plasma pistol – Standard',        atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 8", Piercing 1' },
    { name: 'Plasma pistol – Supercharge',     atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 8", Hot, Lethal 5+, Piercing 1' },
    { name: 'Power fist',                      atk: '4', hit: '3+', dmg: '5/7', wr: 'Brutal, Shock' },
    { name: 'Power weapon',                    atk: '5', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Chaos Champion', description: 'STRATEGIC GAMBIT. Remove your Challenge token from the enemy operative that has it (if any), then select one enemy operative to gain your Challenge token. Whenever this operative is fighting against or retaliating against an enemy operative that has your Challenge token, in the Select Weapons step, you can select one of the following weapon rules for this operative\'s melee weapons to have until the end of the sequence: Balanced, Brutal, Punishing, Severe, Shock.' },
    { name: 'Path to Glory', description: 'Whenever this operative incapacitates an enemy operative that has your Challenge token, you gain 1CP.' },
  ],
  'MURDERWING, CHAOS, HERETIC ASTARTES, CHAMPION'
);

card('MURDERWING CURSECLAW', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Bolt pistol',   atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Mutated claws', atk: '5', hit: '3+', dmg: '4/5', wr: 'Rending' },
  ],
  [
    { name: 'Frenzied Attack', description: 'If this operative is incapacitated during the Fight action, you can strike the enemy operative in that sequence with one of your unresolved successes before this operative is removed from the killzone.' },
    { name: 'SNATCH (1AP)', description: 'BOOST action. Select one enemy operative within this operative\'s BOOST ZONE. Both players roll one D6 and add their respective operative\'s Wounds stat to their result. If your result is higher, remove that enemy operative from the killzone and set it back up within this operative\'s BOOST ZONE or control Range. It must be set up in a location it can be placed and cannot be set up further away from this operative than where it began. If that enemy operative is set up within this operative\'s control Range, the Fall Back or Reposition action ends (allowing this operative to end that action within control Range of enemy operatives).\n\nThis operative cannot perform this action normally. Instead, it performs this action during the Fall Back or Reposition action after setting up from a BOOST.' },
  ],
  'MURDERWING, CHAOS, HERETIC ASTARTES, CURSECLAW'
);

card('MURDERWING DEPREDATOR', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Bolt pistol',    atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Great chainaxe', atk: '5', hit: '4+', dmg: '5/7', wr: 'Brutal' },
  ],
  [
    { name: 'Horrifying Dismemberment', description: 'Whenever this operative incapacitates an enemy operative while fighting or retaliating, select one other enemy operative visible to and within 3" of either this operative or the incapacitated enemy operative. Subtract 1 from that enemy operative\'s APL stat until the end of its next activation.' },
    { name: 'CARVING BLOW (1AP)', description: 'Inflict 2D3 damage on each other operative visible to and within 2" of this operative in an order of your choice (roll separately for each).\n\nFor the purposes of action restrictions and the Astartes faction rule, this action is treated as a Fight action. This operative cannot perform this action while it has a Conceal order, or during the same activation in which it performed the Slice From Above action (see faction equipment) or vice versa.' },
  ],
  'MURDERWING, CHAOS, HERETIC ASTARTES, DEPREDATOR'
);

card('MURDERWING HUNTMASTER', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Bolt pistol',  atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Power weapon', atk: '5', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Pinned Prey', description: 'Whenever an enemy operative would perform the Fall Back action while within control Range of this operative, if no other enemy operatives are within this operative\'s control Range, you can use this rule. If you do, roll two D6, or one D6 if that enemy operative has a higher Wounds stat than this operative. If any result is a 4+, that enemy operative cannot perform that action during that activation/counteraction (no AP are spent on it).' },
    { name: 'STRIKE FROM ABOVE (1AP)', description: 'BOOST action. Inflict 2D3+1 damage on one enemy operative within this operative\'s BOOST ZONE.\n\nThis operative cannot perform this action normally. Instead, it performs this action during the Fall Back or Reposition action after setting up from a BOOST.' },
  ],
  'MURDERWING, CHAOS, HERETIC ASTARTES, HUNTMASTER'
);

card('MURDERWING RAPTOR', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Bolt pistol',                 atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Plasma pistol – Standard',    atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 8", Piercing 1' },
    { name: 'Plasma pistol – Supercharge', atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 8", Hot, Lethal 5+, Piercing 1' },
    { name: 'Chainsword',                  atk: '5', hit: '3+', dmg: '4/5', wr: '–' },
  ],
  [
    { name: 'Thrill of Flight', description: 'Whenever this operative does a BOOST during its activation:\n• You can remove any changes to its APL stat.\n• You can ignore any changes to its stats from being injured (including its weapons\' stats) until the end of the activation.' },
  ],
  'MURDERWING, CHAOS, HERETIC ASTARTES, RAPTOR'
);

card('MURDERWING SHRIEKER', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Bolt pistol', atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Chainsword',  atk: '5', hit: '3+', dmg: '4/5', wr: '–' },
  ],
  [
    { name: 'Modified Vox-casters', description: 'Whenever an enemy operative is within 3" of this operative, your opponent must spend 1 additional AP for that enemy operative to perform the Pick Up Marker and mission actions.\n\nWhenever determining control of a marker, treat the total APL stat of enemy operatives that contest it as 1 lower if at least one of those enemy operatives is within 3" of this operative. Note this isn\'t a change to the APL stat, so any changes are cumulative with this.' },
    { name: 'STRIKE FROM ABOVE (1AP)', description: 'Select one enemy operative that\'s visible to and within 6" of this operative. Alternatively, select one enemy operative within this operative\'s BOOST ZONE (at which point this becomes a BOOST action).\n\nIf enemy operatives are within control Range of this operative, you cannot select an enemy operative that isn\'t. Inflict D3 damage on the selected operative and subtract 1 from its APL stat until the end of its next activation.\n\nThis operative cannot perform this action while it has a Conceal order. If you\'re selecting an enemy operative within this operative\'s BOOST ZONE, this operative cannot perform this action normally. Instead, it performs this action during the Fall Back or Reposition action after setting up from a BOOST.' },
  ],
  'MURDERWING, CHAOS, HERETIC ASTARTES, SHRIEKER'
);

card('MURDERWING SKYSEAR', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Bolt pistol',             atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Flamer',                  atk: '4', hit: '2+', dmg: '3/3', wr: 'Range 8", Saturate, Torrent 2' },
    { name: 'Meltagun',                atk: '4', hit: '3+', dmg: '6/3', wr: 'Range 6", Devastating 4, Piercing 2' },
    { name: 'Plasma gun – Standard',   atk: '4', hit: '3+', dmg: '4/6', wr: 'Piercing 1' },
    { name: 'Plasma gun – Supercharge', atk: '4', hit: '3+', dmg: '5/6', wr: 'Hot, Lethal 5+, Piercing 1' },
    { name: 'Fists',                   atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [],
  'MURDERWING, CHAOS, HERETIC ASTARTES, SKYSEAR'
);

card('MURDERWING WARP TALON', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Lightning claws', atk: '5', hit: '3+', dmg: '4/5', wr: 'Ceaseless, Lethal 5+, Rending' },
  ],
  [
    { name: 'Slice the Veil', description: 'When setting up this operative before the battle, you can set it up in the warp instead: place it to one side instead of in the killzone. In the first Firefight phase, when this operative is activated, place one of your Warp markers wholly within your territory, then expend this operative.\n\nIn the second Firefight phase, when this operative is activated, set it up with an order of your choice in a location it can be placed either wholly within your drop zone, or wholly within your territory contesting your Warp marker. Continue its activation as normal, but during that activation it cannot perform more than two actions and cannot use more than 4" of move distance. Until the Ready step of the next Strategy phase, this operative is obscured to operatives more than 3" from it.\n\nWhenever this operative is in the warp, it cannot be the ready friendly MURDERWING operative for the Malicious Narcissism firefight ploy.' },
  ],
  'MURDERWING, CHAOS, HERETIC ASTARTES, WARP TALON'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Murderwing populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
