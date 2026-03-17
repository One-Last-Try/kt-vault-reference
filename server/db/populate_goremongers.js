import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Goremongers'").get()?.id;
if (!FACTION_ID) { console.error('Goremongers faction not found'); process.exit(1); }

// Clear existing Goremongers data
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
  `1 GOREMONGER BLOOD HERALD operative
7 GOREMONGER operatives selected from the following list:
• ASPIRANT
• BLOODTAKER
• IMPALER
• INCITER
• SKULLCLAIMER
• STALKER

Other than ASPIRANT operatives, your kill team can only include each operative above once.`);

rule('faction_rules', null, 'RUNES OF KHORNE', 0,
  'Each friendly GOREMONGER operative cannot lose more than 8 wounds per Shoot action.');

rule('faction_rules', null, 'GORE TANKS', 0,
  `Each friendly GOREMONGER operative has a GORE TANK that has three levels: full, half, and empty. They start the battle at half. Whenever a GORE TANK increases, it goes up one level; whenever it decreases, it goes down one level. A GORE TANK cannot increase when it\'s already full, or decrease when it\'s already empty (see diagram below).

Whenever a friendly GOREMONGER operative incapacitates an operative within its control range, or visible to and within 2" of it, you can increase its GORE TANK.

Whenever a friendly GOREMONGER operative uses a SANGUAVITAE rule (see right), you must decrease its GORE TANK.`);

rule('faction_rules', null, 'SANGUAVITAE', 0,
  `You can spend friendly operatives\' SANGUAVITAE rules on the effects below when the "When" condition is met. You cannot use the same SANGUAVITAE rule more than once per activation or counteraction, and you cannot use more than two SANGUAVITAE rules per activation or counteraction. You cannot use Mania and Fury during the same activation.

REJUVENATE
When: During a friendly GOREMONGER operative\'s activation or counteraction, before or after it performs an action.
Effect: That operative regains D3+1 lost wounds.

MANIA
When: During a friendly GOREMONGER operative\'s activation, before or after it performs an action.
Effect: Until the start of that operative\'s next activation, add 1 to its APL stat.

FURY
When: During a friendly GOREMONGER operative\'s activation, before or after it performs an action.
Effect: That operative can perform two Fight actions during that activation, and the second one is free.

RAKE
When: When a friendly GOREMONGER operative performs the Charge action during its activation.
Effect: When that operative finishes moving during that action, you can inflict D3 damage on one enemy operative within its control range.

SURGE
When: When a friendly GOREMONGER operative performs the Charge or Reposition action.
Effect: Until the end of that action, add 1" to that operative\'s Move stat.

RAGE
When: When a friendly GOREMONGER operative performs the Fight action.
Effect: Until the end of that action, add 1 to the Atk stat of that operative\'s melee weapons.`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'ENHANCED VIOLENCE', 1,
  `Whenever a friendly GOREMONGER operative\'s GORE TANK is:
• Half, its melee weapons have the Balanced weapon rule.
• Full, its melee weapons have the Relentless weapon rule.`);

rule('ploy', 'Strategy', 'AUGMENTED ENDURANCE', 1,
  `Whenever an operative is shooting a friendly GOREMONGER operative, if that friendly operative\'s GORE TANK is:
• Half, you can re-roll one of your defence dice.
• Full, you can re-roll any of your defence dice.`);

rule('ploy', 'Strategy', 'GORY TENACITY', 1,
  'Whenever a friendly GOREMONGER operative is fighting or retaliating, the first time your opponent strikes it during that sequence, halve the damage inflicted (rounding up and to a minimum of 2).');

rule('ploy', 'Strategy', 'HUNT FOR BLOOD', 1,
  'Select one friendly GOREMONGER operative. If it has a Conceal order, change it to Engage. Then it can immediately perform a free Charge action, but cannot move more than 3" during that action.');

rule('ploy', 'Firefight', 'UNBRIDLED AGGRESSION', 1,
  'Use this firefight ploy when a friendly GOREMONGER operative is fighting during an activation in which it\'s performed the Charge action, at the end of the Roll Attack Dice step. Until the end of that sequence, that operative\'s melee weapons have the Severe weapon rule.');

rule('ploy', 'Firefight', 'GORETHIRST', 1,
  'Use this firefight ploy when you would counteract. You can do so with one friendly GOREMONGER operative that has a Conceal order, but you must change its order to Engage and it can only perform the Charge, Fight, or Shoot action during that counteraction.');

rule('ploy', 'Firefight', 'DESTRUCTIVE DEMISE', 1,
  `Use this firefight ploy when a friendly GOREMONGER operative is incapacitated. Inflict damage determined by that friendly operative\'s GORE TANK on one enemy operative within that friendly operative\'s control range. Inflict:
• D3 if empty.
• D3+1 if half.
• D3+2 if full.`);

rule('ploy', 'Firefight', 'LACERATE FLESH', 1,
  'Use this firefight ploy when a friendly GOREMONGER operative with an empty GORE TANK is activated or counteracts. Increase that operative\'s GORE TANK. At the end of that activation or counteraction, decrease its GORE TANK (you cannot use this decrease to use a SANGUAVITAE rule); if you cannot decrease its GORE TANK, inflict D3 damage on it.');

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

rule('equipment', null, 'GORY TOTEM', 0,
  'Before the battle, you can set up one of your Gory Totem markers wholly within your territory and more than 2" from other markers (excluding your Bloody Cadaver marker). Whenever an enemy operative within 3" of your Gory Totem marker is shooting, fighting or retaliating, your opponent cannot re-roll their attack dice.');

rule('equipment', null, 'BLOODY CADAVER', 0,
  'Before the battle, you can set up one of your Bloody Cadaver markers wholly within your territory and more than 2" from other markers (excluding your Gory Totem marker). Friendly GOREMONGER operatives can perform the Pick Up Marker action on that marker. In the Ready step of each Strategy phase, you can increase the GORE TANK of one friendly GOREMONGER operative that controls that marker, unless that friendly operative is within control range of an enemy operative.');

rule('equipment', null, 'CHAOS SIGIL', 0,
  'Once per turning point, when an operative is shooting a friendly GOREMONGER operative, at the start of the Roll Defence Dice step, you can use this rule. If you do, worsen the x of the Piercing weapon rule by 1 (if any) until the end of that sequence. Note that Piercing 1 would therefore be ignored.');

rule('equipment', null, 'WRIST CHAINS', 0,
  'Once per turning point, when a friendly GOREMONGER operative performs the Shoot action and you\'re selecting a ranged weapon, you can use this rule. If you do, until the end of that action, the following melee weapons are treated as ranged weapons with the Range 2" weapon rule: chainblade, chain glaive, great chainaxe (ignore its Brutal weapon rule), pickripper s.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('BLOOD HERALD', 'Leader',
  { APL: '2', MOVE: '7"', SAVE: '5+', WOUNDS: '11' },
  [
    { name: 'Icon of Khorne', atk: '4', hit: '2+', dmg: '4/4', wr: 'Range 8", Saturate' },
    { name: 'Chainblade',     atk: '4', hit: '3+', dmg: '4/5', wr: 'Rending' },
  ],
  [
    { name: 'Khorne\'s Favour', description: 'Once during each of this operative\'s activations, before or after it performs an action, if its GORE TANK is empty, you can increase its GORE TANK.' },
    { name: 'Impending Apotheosis', description: 'Once per battle, when an attack dice inflicts Normal damage on this operative, you can ignore that inflicted damage.' },
  ],
  'GOREMONGER, CHAOS, LEADER, BLOOD HERALD'
);

card('ASPIRANT', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '5+', WOUNDS: '10' },
  [
    { name: 'Autopistol',   atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Chainglaive',  atk: '4', hit: '3+', dmg: '4/5', wr: 'Rending' },
  ],
  [
    { name: 'Obsessive Bloodlust', description: 'Once during each of this operative\'s activations, when this operative ends the Fight action, if it\'s no longer within control Range of enemy operatives, you can use this rule. If you do, it can immediately perform a free Charge action (even if it\'s already performed the Charge action during that activation), but cannot move more than 2" during that action. Doing so doesn\'t prevent it from performing the Charge, Dash or Reposition action afterwards during that activation.' },
  ],
  'GOREMONGER, CHAOS, ASPIRANT'
);

card('BLOOD TAKER', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '5+', WOUNDS: '10' },
  [
    { name: 'Autopistol',    atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Ritual Blade',  atk: '4', hit: '3+', dmg: '3/5', wr: 'Ritual*' },
  ],
  [
    { name: 'Ritual', description: 'Whenever this operative is using this weapon, the first time you inflict damage on an operative within its control Range during that sequence, you can increase this operative\'s GORE TANK. Note this is cumulative with the normal rules for increasing its GORE TANK (i.e. if it incapacitates an operative within its control Range).' },
    { name: 'TRANSFUSION RITUAL (1AP)', description: 'Decrease this operative\'s GORE TANK. Instead of using a SANGUAVITAE rule, you can increase the GORE TANK of one other friendly GOREMONGER operative within 8" of this operative. This operative cannot perform this action while within control Range of an enemy operative, or if its GORE TANK is empty.' },
  ],
  'GOREMONGER, CHAOS, BLOODTAKER'
);

card('IMPALER', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '5+', WOUNDS: '10' },
  [
    { name: 'Autopistol',              atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Fleshkewer (ranged)',     atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 8", Stun, Drag*, Prey*' },
    { name: 'Fleshkewer (melee)',      atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Drag', description: 'Whenever this operative is shooting with this weapon, at the start of the Resolve Attack Dice step (before inflicting damage), you can move the target up to x". X is your total number of successful unblocked attack dice, multiplied by 2. The target must be moved to a location where it can be placed as close as possible to this operative, determined by the x" you choose to use. The move must be done in one or more straight-line increments, and increments are always rounded up to the nearest inch. Whenever the target is dropping during that move, ignore the vertical distance.' },
    { name: 'Prey', description: 'Whenever this operative is shooting with this weapon, in the Resolve Attack Dice step, after resolving the Drag weapon rule (if you choose to), you can discard any of your successful unblocked attack dice. In other words, you can choose not to inflict damage with any number of them.' },
  ],
  'GOREMONGER, CHAOS, IMPALER'
);

card('SKULLCLAIMER', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '5+', WOUNDS: '10' },
  [
    { name: 'Autopistol',      atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Great Chainaxe',  atk: '4', hit: '3+', dmg: '5/6', wr: 'Brutal' },
  ],
  [
    { name: 'Brutish', description: 'Whenever an attack dice would inflict Critical Dmg on this operative, you can choose for that attack dice to inflict Normal Dmg instead.' },
    { name: 'Claim Skull', description: 'Once per turning point, if this operative incapacitates an enemy operative with its great chainaxe, you gain 1CP.' },
  ],
  'GOREMONGER, CHAOS, SKULLCLAIMER'
);

card('STALKER', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '5+', WOUNDS: '10' },
  [
    { name: 'Autopistol',   atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Pickripper s', atk: '4', hit: '3+', dmg: '4/5', wr: 'Rending' },
  ],
  [
    { name: 'Climbing Picks', description: 'Whenever this operative is climbing, treat the vertical distance as 2" (regardless of how far the operative actually moves vertically).' },
    { name: 'Rooftop Stalker', description: 'Whenever this operative is fighting during an activation in which it dropped from Vantage terrain at least 2" higher than the killzone floor, or whenever this operative is fighting against an enemy operative that\'s on Vantage terrain at least 2" higher than the killzone floor, this operative\'s melee weapons have the Relentless weapon rule.' },
  ],
  'GOREMONGER, CHAOS, STALKER'
);

card('INCITER', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '5+', WOUNDS: '10' },
  [
    { name: 'Dual autopistols (focused)',     atk: '4', hit: '3+', dmg: '2/2', wr: 'Range 8", Ceaseless, Devastating 1, Rending' },
    { name: 'Dual autopistols (point-blank)', atk: '4', hit: '3+', dmg: '3/4', wr: 'Ceaseless, Rending' },
  ],
  [
    { name: 'Incite the Hunt', description: 'Whenever this operative incapacitates an enemy operative from more than 2" away, before that enemy operative is removed from the killzone, you can increase the GORE TANK of one friendly GOREMONGER operative within 8" of that enemy operative. Whenever this operative inflicts damage on an enemy operative with either profile of its dual autopistols but doesn\'t incapacitate it, that enemy operative gains a Bleeding token (if it doesn\'t already have one). During a friendly GOREMONGER operative\'s activation or counteraction, before or after it performs an action, if it\'s within 8" of an enemy operative that has a Bleeding token, you can remove that token and increase that friendly operative\'s GORE TANK.' },
    { name: 'DASH AND SPRAY (1AP)', description: 'Perform a free Dash action and free Shoot action with this operative in any order. You can only select dual autopistols (focused) for that Shoot action. This operative cannot perform this action while it has a Conceal order, or while within control Range of an enemy operative.' },
  ],
  'GOREMONGER, CHAOS, INCITER'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Goremongers populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
