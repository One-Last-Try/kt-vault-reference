import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Wrecka Krew'").get()?.id;
if (!FACTION_ID) { console.error('Wrecka Krew faction not found'); process.exit(1); }

// Clear existing Wrecka Krew data
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
  'Archetypes: SEEK-DESTROY, SECURITY');

rule('faction_rules', null, 'OPERATIVES', 0,
  `1 WRECKA KREW BOSS NOB operative with one of the following options:
• Rokkit pistol; smash hammer
• Two rokkit pistols; choppa

2 WRECKA KREW BOMB SQUIG operatives
5 WRECKA KREW operatives selected from the following list:
• BREAKA BOY DEMOLISHA
• BREAKA BOY FIGHTER
• BREAKA BOY KRUSHA
• TANKBUSTA GUNNER with one of the following options:
  - \'Eavy rokkit launcha; fists
  - Rokkit launcha; fists
• TANKBUSTA ROKKITEER with one of the following options:
  - Rokkit launcha; pulsa rokkit; fists
  - Rokkit launcha; rokkit rack; fists

Other than BOMB SQUIG, BREAKA BOY FIGHTER and TANKBUSTA GUNNER, your kill team can only include one of each of the operatives listed above.`);

rule('faction_rules', null, 'WRECKA RAMPAGE', 0,
  `Whenever a friendly WRECKA KREW operative is shooting, fighting or retaliating, in the Roll Attack Dice step:
• For each attack dice result of 6 you retain, you gain one Wrecka point.
• You can spend up to 3 of your Wrecka points (unless it\'s a BOMB SQUIG). For each point you spend this way, retain one of your fails as a normal success instead of discarding it.

You cannot have more than 6 Wrecka points at once. You can gain and spend Wrecka points during the same action and can do so in an order of your choice, unless you started the action with 6, in which case you can only spend them.`);

rule('faction_rules', null, 'TANKED UP', 0,
  'The first time a friendly WRECKA KREW operative (excluding BOMB SQUIG) that has an Engage order performs either the Charge, Shoot or Fight action (excluding Guard) during each of its activations/counteractions, add 1 to its APL stat until the start of its next activation.');

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'AMPED UP', 1,
  'Each friendly WRECKA KREW operative that has an Engage order can immediately regain D3+1 lost wounds (roll separately for each).');

rule('ploy', 'Strategy', 'TUFF GITZ', 1,
  'Whenever an operative is shooting a friendly WRECKA KREW operative that has an Engage order, you can re-roll one of your defence dice.');

rule('ploy', 'Strategy', 'DESTRUCTION', 1,
  'Friendly WRECKA KREW operatives\' ranged weapons have the Saturate weapon rule.');

rule('ploy', 'Strategy', 'WAAAGH!', 1,
  'Friendly WRECKA KREW operatives\' melee weapons have the Balanced weapon rule.');

rule('ploy', 'Firefight', 'DEMOLITION JOB', 1,
  'Use this firefight ploy after a friendly WRECKA KREW operative performs the Fight or Shoot action, just before incapacitated operatives are removed (if any). Place one of your Demolition markers within the target\'s control range (if it\'s using a Blast weapon, the primary target). Whenever a friendly WRECKA KREW operative (excluding BOMB SQUIG) is shooting against, fighting against or retaliating against an operative that\'s within 3" of that marker, you can spend a Wrecka point for free (even if you have none). In the Ready step of the next Strategy phase, remove that marker.');

rule('ploy', 'Firefight', 'JUST A SCRATCH', 1,
  'Use this firefight ploy when an attack dice inflicts Normal Dmg on a friendly WRECKA KREW operative (excluding BOMB SQUIG). Ignore that inflicted damage.');

rule('ploy', 'Firefight', 'KABOOM!', 1,
  'Use this firefight ploy when a friendly WRECKA KREW operative performs the Shoot action and a weapon with the Blast weapon rule is selected. Until the end of that action, add 1" to that weapon\'s Blast and it has the Severe weapon rule when shooting the primary target. You cannot use this ploy and the Drill Rokkits rule (see equipment) during the same action. Note that Severe doesn\'t generate a Wrecka point (as it\'s not a 6).');

rule('ploy', 'Firefight', 'PROPPA SCRAP', 1,
  'Use this firefight ploy during a friendly WRECKA KREW BREAKA BOY or WRECKA KREW BOSS NOB operative\'s activation. During that activation, that operative can perform two Fight actions.');

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

// ── EQUIPMENT ────────────────────────────────────────────────────────────────

rule('equipment', null, 'DRILL ROKKITS', 0,
  'Once per turning point, whenever a friendly WRECKA KREW operative is performing the Shoot action and you select a rokkit launcha or \'eavy rokkit launcha, you can use this rule. If you do, until the end of that action, that weapon loses the Blast weapon rule but has the Piercing 1 weapon rule.');

rule('equipment', null, 'EXTRA ARMOUR', 0,
  'Subtract 1" from the Move stat of friendly WRECKA KREW operatives and improve their Save stat by 1. This excludes BOMB SQUIG operatives and isn\'t cumulative with the Protective rule of a Portable Barricade from universal equipment.');

rule('equipment', null, 'ENGINE OIL', 0,
  'Once per turning point, whenever a friendly WRECKA KREW operative (excluding BOMB SQUIG) is activated, you can use this rule. If you do, until the end of that activation, you can ignore any changes to that operative\'s stats from being injured (including its weapons\' stats).');

rule('equipment', null, 'GLYPHS', 0,
  'When this item of equipment is selected, also select the Waaagh! or Destruction strategy ploy. The first time you would use that ploy during the battle, it costs 0CP; whenever you would use it thereafter, it costs 0CP if you have any Wrecka points.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('WRECKA BOSS NOB', 'Leader',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '14' },
  [
    { name: 'Rokkit pistol',             atk: '6', hit: '5+', dmg: '4/5', wr: 'Range 8", Blast 1"' },
    { name: 'Two rokkit pistols – Focused', atk: '6', hit: '4+', dmg: '4/5', wr: 'Range 8", Blast 1", Ceaseless' },
    { name: 'Two rokkit pistols – Salvo',   atk: '6', hit: '5+', dmg: '4/5', wr: 'Range 8", Blast 1", Salvo*' },
    { name: 'Choppa',                    atk: '4', hit: '3+', dmg: '4/5', wr: '–' },
    { name: 'Smash hammer',              atk: '4', hit: '3+', dmg: '5/6', wr: 'Brutal' },
  ],
  [
    { name: 'Wrecka Boss', description: 'Whenever this operative performs a Fight or Shoot action (excluding Guard), you gain 1 Wrecka point.' },
    { name: '*Salvo', description: 'Select up to two different valid targets that aren\'t within control Range of friendly operatives. Shoot with this weapon against both primary targets in an order of your choice, then against all remaining secondary targets in the same manner (roll each sequence separately). Each target (primary and secondary) cannot be shot more than once during the action.' },
  ],
  'WRECKA KREW, ORK, LEADER, BOSS NOB'
);

card('WRECKA BOMB SQUIG', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '5' },
  [
    { name: 'Explosives', atk: '6', hit: '4+', dmg: '4/5', wr: 'Blast 1, Limited 1, Explosive*' },
    { name: 'Bite',       atk: '3', hit: '4+', dmg: '4/5', wr: '–' },
  ],
  [
    { name: '*Explosive', description: 'This operative can perform the Shoot action with this weapon while within control Range of an enemy operative. Do not select a valid target. Instead, this operative is always the primary target and cannot be in cover or obscured.' },
    { name: 'Stoopid', description: 'During the Firefight phase, whenever you determine this operative\'s order, you cannot select Conceal. This operative cannot perform any actions other than Charge, Dash, Fight, Reposition, and Shoot, or use any weapons that aren\'t on its datacard.' },
    { name: 'Boom!', description: 'Whenever this operative is incapacitated during a battle in which it hasn\'t used its explosives, roll one D6, or two D6 if you wish. If any result is a 4+, this operative performs a free Shoot action with its explosives before it\'s removed from the killzone.' },
    { name: 'Expendable', description: 'This operative is ignored for your opponent\'s kill/elimination op (when it\'s incapacitated, and when determining your starting number of operatives). It\'s also ignored for victory conditions and scoring VPs if either require operatives to \'escape\', \'survive\' or be incapacitated by enemy operatives (if it escapes/survives/is incapacitated, determining how many operatives must escape/survive/be incapacitated, etc.).' },
  ],
  'WRECKA KREW, ORK, BOMB SQUIG'
);

card('BREAKA BOY DEMOLISHA', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '12' },
  [
    { name: 'Demolisha – Bash',    atk: '4', hit: '3+', dmg: '4/5', wr: '–' },
    { name: 'Demolisha – Detonate', atk: '4', hit: '3+', dmg: '*',   wr: 'Lethal 5+, Limited 1, Detonate*' },
  ],
  [
    { name: 'Reckless Temperament', description: 'Normal Dmg of 4 or more inflicts 1 less damage on this operative; if this operative has an Engage order, Critical Dmg of 4 or more also inflicts 1 less damage on this operative.' },
    { name: '*Detonate', description: 'The first time this operative would inflict damage on an enemy operative with this weapon profile during the battle, separately inflict D6+6 damage on that operative and each other operative within that enemy operative\'s control Range if it\'s a normal success, or 2D6+6 damage if it\'s a critical success. Then the action ends and you gain 1 Wrecka point, plus 1 for each operative that was incapacitated during that action. Damage from this weapon rule cannot be ignored or reduced.' },
  ],
  'WRECKA KREW, ORK, BREAKA BOY, DEMOLISHA'
);

card('BREAKA BOY KRUSHA', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '12' },
  [
    { name: 'Knucklebustas', atk: '4', hit: '3+', dmg: '5/6', wr: 'Brutal, Shock, Smash*' },
  ],
  [
    { name: '*Smash', description: 'Whenever you strike, you can move the enemy operative in a straight line increment of up to 1". If you do, it must finish the move further away from this operative and in a location it can be placed. Then move this operative in a straight line increment of up to 1", but it must end that move within that enemy operative\'s control Range (if either isn\'t possible, you cannot move them).' },
    { name: 'Armoured Up', description: 'Whenever an enemy operative is shooting this operative, or this operative is fighting or retaliating, your opponent cannot retain attack dice results of less than 6 as critical successes (e.g. as a result of the Lethal, Rending or Severe weapon rules).' },
  ],
  'WRECKA KREW, ORK, BREAKA BOY, KRUSHA'
);

card('TANKBUSTA ROKKITEER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '12' },
  [
    { name: 'Pulsa rokkit',  atk: '6', hit: '5+', dmg: '–',   wr: 'Heavy (Reposition only), Limited 1, Pulsa*' },
    { name: 'Rokkit launcha', atk: '6', hit: '5+', dmg: '4/5', wr: 'Blast 1' },
    { name: 'Rokkit rack',   atk: '6', hit: '5+', dmg: '4/5', wr: 'Blast 2", Heavy (Reposition only), Limited 1, Relentless' },
    { name: 'Fists',         atk: '3', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: '*Pulsa', description: 'Don\'t select a valid target. Instead, place your Pulsa marker visible to this operative, or on Vantage terrain of a terrain feature visible to this operative. That marker gains 1 Pulsa point, then roll attack dice: it gains 1 additional Pulsa point for each success (to a maximum of 3 additional points). Separately inflict D3 damage on each operative wholly within x" of that marker, where x is that marker\'s Pulsa points. Then the action ends.' },
    { name: 'Shokkwave', description: 'Whenever an operative is within x" of your Pulsa marker (see Pulsa above), worsen the Hit stat of its weapons by 1 and subtract 2" from its Move stat. This is cumulative with being injured. X is that marker\'s Pulsa points. In the Ready step of each Strategy phase, subtract 1 from your Pulsa marker\'s points. If a Pulsa marker ever has 0 points, remove it.' },
  ],
  'WRECKA KREW, ORK, TANKBUSTA, ROKKITEER'
);

card('TANKBUSTA GUNNER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '12' },
  [
    { name: 'Rokkit launcha',      atk: '6', hit: '5+', dmg: '4/5', wr: 'Blast 1' },
    { name: '\'Eavy rokkit launcha', atk: '6', hit: '4+', dmg: '4/5', wr: 'Blast 1, Heavy (Dash only)' },
    { name: 'Fists',               atk: '3', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Kompetitive Streak', description: 'Once per Shoot action, if this operative shoots an enemy operative that another friendly operative has already shot during this turning point, you gain 1 Wrecka point. Determine this when you select a valid target, but you can include any secondary targets when doing so (e.g., from the Blast weapon rule).' },
  ],
  'WRECKA KREW, ORK, TANKBUSTA, GUNNER'
);

card('BREAKA BOY FIGHTER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '12' },
  [
    { name: 'Smash hammer', atk: '4', hit: '3+', dmg: '5/6', wr: 'Brutal' },
  ],
  [
    { name: 'BREAK STUFF (1AP)', description: 'Select a terrain feature within this operative\'s control Range. If it\'s equipment terrain, remove it. Otherwise, place one of your Breach markers within this operative\'s control Range as close as possible to that terrain. Whenever an operative is within 1" of that marker, it treats parts of that terrain feature that are no more than 1" thick as Accessible terrain. This operative cannot perform this action while within control Range of an enemy operative, or if a terrain feature isn\'t within its control Range.' },
  ],
  'WRECKA KREW, ORK, BREAKA BOY, FIGHTER'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Wrecka Krew populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
