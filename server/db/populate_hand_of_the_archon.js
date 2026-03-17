import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Hand of the Archon'").get()?.id;
if (!FACTION_ID) { console.error('Hand of the Archon faction not found'); process.exit(1); }

// Clear existing Hand of the Archon data
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
  'Archetypes: SEEK-DESTROY, RECON');

rule('faction_rules', null, 'OPERATIVES', 0,
  `1 HAND OF THE ARCHON ARCHSYBARITE operative with one of the following options:
• Blast pistol; venom blade
• Splinter pistol; venom blade
• Splinter pistol; agoniser
• Splinter pistol; power weapon
• Splinter rifle; array of blades

8 HAND OF THE ARCHON operatives selected from the following list:
• AGENT
• CRIMSON DUELLIST
• DISCIPLE OF YAELINDRA
• ELIXICANT
• FLAYER
• GUNNER with one of the following options:
  - Blaster; array of blades
  - Shredder; array of blades
• HEAVY GUNNER with one of the following options:
  - Dark lance; array of blades
  - Splinter cannon; array of blades
• SKYSPLINTER ASSASSIN

Other than AGENT operatives, your kill team can only include each operative on this list once. Your kill team can only include up to two darklight weapons (blast pistol, blaster and dark lance are darklight weapons).`);

rule('faction_rules', null, 'POWER FROM PAIN', 0,
  `After a friendly HAND OF THE ARCHON operative performs an action, it gains one of your Pain tokens if:

• An enemy operative was injured during that action, but was not incapacitated.
• An enemy operative was incapacitated during that action. If that enemy operative had a Wounds stat of 12 or more, that friendly operative gains two of your Pain tokens instead.

You can spend friendly operatives\' Pain tokens on the invigorations below when the "When" condition is met. You cannot use more than one invigoration per activation or counteraction, except Stimulated Senses, which can be used once per activation or counteraction in addition to another invigoration.

DARK ANIMUS
When: During the operative\'s activation, before or after it performs an action.
Effect: Until the start of the operative\'s next activation, add 1 to its APL stat.

ACCELERATED REJUVENATION
When: During the operative\'s activation or counteraction, before or after it performs an action.
Effect: The operative regains D3+1 lost wounds.

VITALISED SURGE
When: After the operative incapacitates an enemy operative and that enemy operative is removed from the killzone.
Effect: The operative can immediately perform a free Dash action, even if it\'s performed an action that prevents it from performing the Dash action.

STIMULATED SENSES
When: After rolling your attack or defence dice for the operative.
Effect: You can re-roll any of your dice results of one result (e.g. results of 2)`);

rule('faction_rules', null, 'RIFLES', 0,
  'Whenever a friendly HAND OF THE ARCHON operative is shooting with a splinter rifle during an activation in which it hasn\'t performed the Charge, Fall Back or Reposition action, that weapon has the Accurate 1 weapon rule. Note that operative isn\'t restricted from performing those actions after shooting.');

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'BLADE ARTISTS', 1,
  'Friendly HAND OF THE ARCHON operatives\' melee weapons have the Rending weapon rule.');

rule('ploy', 'Strategy', 'FROM DARKNESS, DEATH', 1,
  'Whenever a friendly HAND OF THE ARCHON operative is activated, before you determine its order, you can select one enemy operative that friendly operative isn\'t a valid target for. Until the end of that activation, the first time that friendly operative is shooting against or fighting against that enemy operative, you can retain one of your normal successes as a critical success instead.');

rule('ploy', 'Strategy', 'MERCILESS SADISTS', 1,
  'Whenever a friendly HAND OF THE ARCHON operative is shooting against or fighting against a wounded enemy operative, that friendly operative\'s weapons have the Balanced weapon rule.');

rule('ploy', 'Strategy', 'DENIZENS OF NIGHT', 1,
  'Whenever an enemy operative is shooting a friendly HAND OF THE ARCHON operative that\'s more than 2" from enemy operatives, if Heavy or Light terrain is intervening, or any part of that friendly operative\'s base is underneath Vantage terrain, you can re-roll one of your defence dice.');

rule('ploy', 'Firefight', 'CRUEL DECEPTION', 1,
  'Use this firefight ploy during a friendly HAND OF THE ARCHON operative\'s activation, before or after it performs an action. During that activation, that operative can perform the Fall Back action for 1 less AP.');

rule('ploy', 'Firefight', 'DEVIOUS SCHEME', 1,
  'Use this firefight ploy after an opponent uses a firefight ploy (excluding one that costs 0CP). The next time they would use that ploy, they must spend 1 additional CP to do so (at which point this effect ends). You cannot use this ploy again during the battle until its effect has ended.');

rule('ploy', 'Firefight', 'HEINOUS ARROGANCE', 1,
  'Use this firefight ploy when it\'s your turn to activate a friendly operative. You can skip that activation.');

rule('ploy', 'Firefight', 'PREY ON THE WOUNDED', 1,
  'Use this firefight ploy after rolling your attack dice for a friendly HAND OF THE ARCHON operative, if it\'s shooting against or fighting against a wounded enemy operative. You can re-roll any of your attack dice.');

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

rule('equipment', null, 'CHAIN SNARE', 0,
  'Whenever an enemy operative would perform the Fall Back action while within control range of a friendly HAND OF THE ARCHON operative, if no other enemy operatives are within that friendly operative\'s control range, you can use this rule. If you do, roll two D6, or one D6 if that enemy operative has a higher Wounds stat than that friendly operative. If any result is a 4+, that enemy operative cannot perform that action during that activation or counteraction (no AP are spent on it), and you cannot use this rule again during this turning point.');

rule('equipment', null, 'WICKED BLADE', 0,
  'Add 1 to the Atk stat of friendly HAND OF THE ARCHON operatives\' array of blades.');

rule('equipment', null, 'TOXIN COATING', 0,
  'Up to twice per turning point, whenever a friendly HAND OF THE ARCHON operative is fighting or retaliating and you\'re selecting a melee weapon, you can use this rule. If you do, until the end of that sequence, that operative\'s melee weapon has the Lethal 5+ weapon rule.');

rule('equipment', null, 'REFINED POISON', 0,
  'Up to twice per turning point, whenever a friendly HAND OF THE ARCHON operative is performing the Shoot action and you select a shardcarbine, splinter cannon, splinter pistol, splinter rifle or stinger pistol, you can use this rule. If you do, until the end of that action, add 1 to the Normal Dmg stat of that weapon.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('KABALITE ARCHSYBARITE', 'Leader',
  { APL: '2', MOVE: '7"', SAVE: '4+', WOUNDS: '9' },
  [
    { name: 'Blast pistol',   atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Piercing 2' },
    { name: 'Splinter pistol', atk: '4', hit: '3+', dmg: '2/4', wr: 'Range 8", Lethal 5+' },
    { name: 'Splinter rifle',  atk: '4', hit: '3+', dmg: '2/4', wr: 'Lethal 5+' },
    { name: 'Agoniser',        atk: '4', hit: '3+', dmg: '3/5', wr: 'Brutal, Lethal 5+, Shock' },
    { name: 'Array of blades', atk: '3', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Power weapon',    atk: '4', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
    { name: 'Venom blade',     atk: '4', hit: '3+', dmg: '4/5', wr: 'Lethal 4+' },
  ],
  [
    { name: 'Cunning', description: 'In the Gambit step of each Strategy phase, if this operative is in the killzone and if you pass at the first opportunity, you gain 1CP. Ignore each STRATEGIC GAMBIT from the mission pack (if any) when determining this.' },
    { name: 'Torturous Vision', description: 'Once during each of this operative\'s activations, if it doesn\'t have any of your Pain tokens when it performs either the Fight or Shoot action, it can gain one of your Pain tokens when you select a valid target or an enemy operative to fight against.' },
  ],
  'AELDARI, DRUKHARI, LEADER, ARCHSYBARITE'
);

card('KABALITE AGENT', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Splinter rifle',  atk: '4', hit: '3+', dmg: '2/4', wr: 'Lethal 5+' },
    { name: 'Array of blades', atk: '3', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Sadistic Competition', description: 'Once per turning point, when a friendly HAND OF THE ARCHON operative gains one of your Pain tokens, one friendly HAND OF THE ARCHON AGENT operative that doesn\'t have one of your Pain tokens can also gain one.' },
  ],
  'HAND OF THE ARCHON, AELDARI, DRUKHARI, AGENT'
);

card('KABALITE CRIMSON DUELLIST', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Splinter pistol', atk: '4', hit: '3+', dmg: '2/4', wr: 'Range 8", Lethal 5+' },
    { name: 'Razorflails',     atk: '4', hit: '2+', dmg: '4/5', wr: 'Brutal, Tangle*' },
  ],
  [
    { name: 'Brutal Display', description: 'Once per turning point, when this operative incapacitates an enemy operative within its control range, you can select one other enemy operative visible to and within 6" of either this operative or the incapacitated enemy operative. Until the start of the next turning point, that other enemy operative cannot control markers or perform the Pick Up Marker or mission actions.' },
    { name: 'Crimson Duellist', description: 'This operative can perform two Fight actions during its activation.' },
    { name: '*Tangle', description: 'Whenever this operative is fighting or retaliating with this weapon, each of your blocks can be allocated to block two unresolved successes (instead of one).' },
  ],
  'HAND OF THE ARCHON, AELDARI, DRUKHARI, CRIMSON DUELLIST'
);

card('KABALITE DISCIPLE OF YAELINDRA', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Stinger pistol',  atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 8", Lethal 5+, Stinger*' },
    { name: 'Array of blades', atk: '3', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: '*Stinger', description: 'Whenever an enemy operative is incapacitated by this weapon, before it\'s removed from the killzone, inflict D3 damage on each other operative visible to and within 2" of it. Each operative subsequently incapacitated as a result of this weapon rule will cause this to happen again.' },
    { name: 'TORMENT GRENADE (1AP)', description: 'Select one enemy operative visible to and within 6" of this operative. That operative and each other operative within 1" of it takes a poison test.\n\nFor an operative to take a poison test, roll one D6, adding 1 to the result if that operative has a Save stat of 4+ or worse: on a 3+, inflict D3 damage on that operative and it gains one of your Poison tokens (if it doesn\'t already have one). Whenever an operative that has one of your Poison tokens is activated, inflict D3 damage on it.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'HAND OF THE ARCHON, AELDARI, DRUKHARI, DISCIPLE OF YAELINDRA'
);

card('KABALITE ELIXICANT', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Splinter rifle',   atk: '4', hit: '3+', dmg: '2/4', wr: 'Lethal 5+' },
    { name: 'Stimm-needler',    atk: '4', hit: '3+', dmg: '0/0', wr: 'Range 3", Lethal 3+, Stun' },
    { name: 'Array of blades',  atk: '3', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Combat Drugs', description: 'At the end of the Select Operatives step, if this operative is selected for deployment, select one of the following COMBAT DRUG rules for friendly HAND OF THE ARCHON operatives to have for the battle:\n• Painbringer: Whenever an attack dice inflicts damage of 3 or more on this operative, roll one D6: on a 6, subtract 1 from that inflicted damage.\n• Adrenalight: STRATEGIC GAMBIT. In the Ready step of each Strategy phase, you can select one friendly operative that has this COMBAT DRUG to gain one of your Pain tokens.\n• Hypex: You can ignore any changes to this operative\'s Move stat from being injured.' },
    { name: 'ADMINISTER DRUG (1AP)', description: 'Select one friendly HAND OF THE ARCHON operative visible to and within 3" of this operative, then select one of the following for that friendly operative:\n• It regains 2D3 lost wounds.\n• Select a different COMBAT DRUG rule for it to have for the battle (this replaces its previous one).\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'HAND OF THE ARCHON, AELDARI, DRUKHARI, ELIXICANT'
);

card('KABALITE FLAYER', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Pain sculptors', atk: '4', hit: '3+', dmg: '4/5', wr: 'Ceaseless, Flay*' },
  ],
  [
    { name: 'Insensible to Pain', description: 'Normal and Critical Dmg of 3 or more inflicts 1 less damage on this operative.' },
    { name: '*Flay', description: 'Whenever this operative is using this weapon, the first time you strike with a critical success during that sequence, you can select one friendly HAND OF THE ARCHON operative within 6" of it to gain one of your Pain tokens.' },
  ],
  'HAND OF THE ARCHON, AELDARI, DRUKHARI, FLAYER'
);

card('KABALITE GUNNER', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Blaster',        atk: '4', hit: '3+', dmg: '4/5', wr: 'Piercing 2' },
    { name: 'Shredder',       atk: '4', hit: '3+', dmg: '4/5', wr: 'Rending, Torrent 2' },
    { name: 'Array of blades', atk: '3', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [],
  'HAND OF THE ARCHON, AELDARI, DRUKHARI, GUNNER'
);

card('KABALITE HEAVY GUNNER', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Dark lance',                  atk: '4', hit: '3+', dmg: '6/7', wr: 'Heavy (Dash only), Piercing 2' },
    { name: 'Splinter cannon – Focused',   atk: '5', hit: '3+', dmg: '3/5', wr: 'Heavy (Dash only), Lethal 5+' },
    { name: 'Splinter cannon – Sweeping',  atk: '4', hit: '3+', dmg: '3/5', wr: 'Heavy (Dash only), Lethal 5+, Torrent 1"' },
    { name: 'Array of blades',             atk: '3', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [],
  'HAND OF THE ARCHON, AELDARI, DRUKHARI, HEAVY GUNNER'
);

card('KABALITE SKYSPLINTER ASSASSIN', 'Specialist',
  { APL: '2', MOVE: '7"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Razorwing',       atk: '4', hit: '4+', dmg: '1/2', wr: 'Saturate, Seek, Silent' },
    { name: 'Shardcarbine',    atk: '4', hit: '2+', dmg: '2/2', wr: 'Devastating 2, Lethal 5+' },
    { name: 'Array of blades', atk: '3', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Omen', description: 'In the Select Operatives step, when you\'re selecting equipment, you can select one enemy operative or one other friendly HAND OF THE ARCHON operative (reveal your selection when you reveal equipment). Whenever attack or defence dice are rolled for that operative:\n• If it\'s an enemy operative, your opponent must re-roll their dice results of 6.\n• If it\'s a friendly operative, you can re-roll any of your dice results of 1.' },
    { name: 'Merciless Hunter', description: 'If this operative doesn\'t perform the Mark unique action (see below) during its activation, it can perform two Shoot actions during its activation, but a razorwing must be selected for one (and only one) of those actions.' },
    { name: 'MARK (1AP)', description: 'Select one enemy operative visible to this operative. Until the end of the turning point, whenever this operative is shooting that enemy operative you can use this effect. If you do:\n• This operative\'s ranged weapons have the Seek Light weapon rule.\n• That enemy operative cannot be obscured.\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'HAND OF THE ARCHON, AELDARI, DRUKHARI, SKYSPLINTER ASSASSIN'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Hand of the Archon populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
