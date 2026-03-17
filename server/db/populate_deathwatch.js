import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Deathwatch'").get()?.id;
if (!FACTION_ID) { console.error('Deathwatch faction not found'); process.exit(1); }

// Clear existing Deathwatch data
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
  `5 DEATHWATCH operatives selected from the following list:
• WATCH SERGEANT
• AEGIS
• BLADEMASTER
• BOMBARD
• BREACHER
• DEMOLISHER
• DISRUPTOR
• GUNNER
• HEADTAKER
• HORDE-SLAYER
• MARKSMAN

Your kill team can only include each operative on this list once, and can only include up to one GRAVIS operative.`);

rule('faction_rules', null, 'VETERAN ASTARTES', 0,
  `During each friendly DEATHWATCH operative's activation, it can perform either two Shoot actions or two Fight actions. If it's two Shoot actions and an auxiliary grenade launcher, frag cannon, heavy plasma incinerator, infernus heavy bolter, plasma pistol or stalker bolt rifle is selected for both, or if a melta bomb is selected for either, 1 additional AP must be spent for the second action.

Each friendly DEATHWATCH operative can counteract regardless of its order. Whenever it does, it can perform an additional 1AP action for free during that counteraction, but both actions must be different and you cannot perform a Fight and Shoot action during the same counteraction.`);

rule('faction_rules', null, 'SPECIAL ISSUE AMMUNITION', 0,
  `Once per turning point, when a friendly DEATHWATCH operative is performing the Shoot action, in the Select Weapon step, you can use this rule. If you do, select one of the following weapon rules for that operative's ranged weapons to have until the end of the action. This rule cannot be used with explosive grenades (see universal equipment) or melta bombs.

• Blast 1" (you cannot select this if the weapon profile being used has the Torrent weapon rule)
• Devastating 1
• Lethal 5+
• Piercing Crits 1
• Rending
• Saturate
• Severe`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'THE SHIELD THAT SLAYS', 1,
  'Whenever a friendly DEATHWATCH operative is wholly within your opponent\'s territory, Normal and Critical Damage of 4+ inflicts 1 less damage on it.');

rule('ploy', 'Strategy', 'AND THEY SHALL KNOW NO FEAR', 1,
  'You can ignore any changes to the stats of friendly DEATHWATCH operatives from being injured (including their weapons\' stats).');

rule('ploy', 'Strategy', 'MISSION TACTICS', 1,
  'Select Conceal or Engage. Whenever a friendly DEATHWATCH operative is shooting or fighting against an enemy operative that has that order, that friendly operative\'s weapons have the Balanced weapon rule.');

rule('ploy', 'Strategy', 'THE LONG VIGIL', 1,
  'Whenever an operative is shooting a friendly DEATHWATCH operative that\'s wholly within your territory, you can re-roll one of your defence dice.');

rule('ploy', 'Firefight', 'SUFFER NOT THE ALIEN', 1,
  'Use this firefight ploy after rolling your attack dice for a friendly DEATHWATCH operative, if it\'s shooting against or fighting against an operative that doesn\'t have the CHAOS or IMPERIUM keyword. You can re-roll any of your attack dice.');

rule('ploy', 'Firefight', 'AUSPICATOR TRACKING', 1,
  'Use this firefight ploy when a friendly DEATHWATCH operative is counteracting, before it performs any actions. You can change its order.');

rule('ploy', 'Firefight', 'ADVANCED AUSPEX SCAN', 1,
  'Use this firefight ploy when a friendly DEATHWATCH operative performs the Shoot action. Until the end of the activation/counteraction, its ranged weapons have the Saturate weapon rule and enemy operatives cannot be obscured.');

rule('ploy', 'Firefight', 'TRANSHUMAN PHYSIOLOGY', 1,
  'Use this firefight ploy when an operative is shooting a friendly DEATHWATCH operative, in the Roll Defence Dice step. You can retain one of your normal successes as a critical success instead.');

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

rule('equipment', null, 'AMMUNITION RESERVE', 0,
  'Once per battle, you can use the Special Issue Ammunition faction rule for up to two Shoot actions during one turning point, but you must select different weapon rules for both uses. This takes precedence over the normal Special Issue Ammunition rules.');

rule('equipment', null, 'SANCTUS-V BIOSCRYER CUFFS', 0,
  `Once during each friendly DEATHWATCH operative's activation, before or after it performs an action, if it's not within control range of enemy operatives you can use this rule. If you do, select one of the following:
• That friendly operative regains D3 lost wounds.
• Remove any changes to that friendly operative's APL stat.
• Remove one of the following tokens that friendly operative has (before that token's activation effects are resolved, if relevant): Neutron Fragment, Poison, Terrochem.`);

rule('equipment', null, 'DIGITAL WEAPONS', 0,
  'Once per turning point, when a friendly DEATHWATCH operative performs the Fight action, at the start of the Roll Attack Dice step you can use this rule. If you do, inflict 1 damage on the enemy operative in that sequence.');

rule('equipment', null, 'SCRUTAVORE SERVO-THRALL', 0,
  `Once per turning point, during a friendly DEATHWATCH operative's activation, you can use this rule. If you do, during that activation, that operative can perform a mission action for 1 less AP.

Having an enemy operative within its control range doesn't prevent that friendly operative from performing that mission action. However, after it does so, you and your opponent roll off; if your opponent wins, you cannot use this equipment for the rest of the battle.`);

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('DEATHWATCH SERGEANT', 'Leader',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '15' },
  [
    { name: 'Plasma pistol – Standard',    atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 8", Piercing 1' },
    { name: 'Plasma pistol – Supercharge', atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 8", Hot, Lethal 5+, Piercing 1' },
    { name: 'Power weapon',                atk: '5', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Adaptable Armoury', description: 'You can select one additional equipment option.' },
    { name: 'Strategic Command', description: 'You can do each of the following once per battle if this operative is in the killzone:\n• Use a DEATHWATCH strategy ploy for 0CP.\n• Use a DEATHWATCH firefight ploy for 0CP.' },
  ],
  'DEATHWATCH, IMPERIUM, ADEPTUS ASTARTES, LEADER, SERGEANT'
);

card('AEGIS VETERAN', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '2+', WOUNDS: '15' },
  [
    { name: 'Boltpistol',                  atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Power maul & storm shield',   atk: '5', hit: '3+', dmg: '4/6', wr: 'Shock, Shield*' },
  ],
  [
    { name: 'Shield*', description: 'Whenever this operative is fighting or retaliating with this weapon, each of your blocks can be allocated to block two unresolved successes (instead of one).' },
    { name: 'Storm Shield', description: 'Whenever an operative is shooting this operative, worsen the x of the Piercing weapon rule by 1 (if any). Note that Piercing 1 would therefore be ignored.' },
  ],
  'DEATHWATCH, IMPERIUM, ADEPTUS ASTARTES, AEGIS'
);

card('VETERAN BLADEMASTER', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '15' },
  [
    { name: 'Special issue bolt pistol',      atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Piercing 1' },
    { name: 'Xenophase blade – Duel',         atk: '5', hit: '3+', dmg: '4/6', wr: 'Brutal, Lethal 5+' },
    { name: 'Xenophase blade – Phase sweep',  atk: '4', hit: '3+', dmg: '4/6', wr: 'Brutal, Lethal 5+, Sweep phase*' },
  ],
  [
    { name: 'Adaptive Swordsmanship', description: 'You can ignore any changes to the Hit stat of this operative\'s xenophase blade. Whenever this operative is fighting or retaliating, you can resolve one of your successes before the normal order. If you do, that success must be used to block.' },
    { name: 'Sweep phase*', description: 'Whenever this operative performs the Fight action with this weapon profile, if it isn\'t incapacitated it can immediately perform a free Fight action afterwards; you must select this same profile, and it can only fight against each enemy operative within its control Range once per activation or counteraction using this profile. This takes precedence over action restrictions, and you can continue to perform free Fight actions until this operative is incapacitated or has fought every enemy operative within its control Range.' },
  ],
  'DEATHWATCH, IMPERIUM, ADEPTUS ASTARTES, BLADEMASTER'
);

card('BOMBARD VETERAN', 'Warrior',
  { APL: '3', MOVE: '5"', SAVE: '3+', WOUNDS: '18' },
  [
    { name: 'Frag cannon – Shrapnel', atk: '5', hit: '3+', dmg: '4/5', wr: 'Torrent 2' },
    { name: 'Frag cannon – Shell',    atk: '4', hit: '3+', dmg: '5/7', wr: 'Piercing 1' },
    { name: 'Bolt pistol',            atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Fists',                  atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [],
  'DEATHWATCH, IMPERIUM, ADEPTUS ASTARTES, GRAVIS, BOMBARD'
);

card('BREACHER VETERAN', 'Warrior',
  { APL: '3', MOVE: '5"', SAVE: '3+', WOUNDS: '18' },
  [
    { name: 'Melta bomb',                       atk: '4', hit: '3+', dmg: '5/3', wr: 'Range 3", Devastating 3, Limited 1, Piercing 2, Heavy (Reposition only)' },
    { name: 'Auxuliary grenade launcher – Frag', atk: '4', hit: '3+', dmg: '2/4', wr: 'Blast 2' },
    { name: 'Auxuliary grenade launcher – Krak', atk: '4', hit: '3+', dmg: '4/5', wr: 'Piercing 1' },
    { name: 'Hellstorm bolt rifle',              atk: '4', hit: '3+', dmg: '4/5', wr: 'Torrent 1' },
    { name: 'Fists',                             atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [],
  'DEATHWATCH, IMPERIUM, ADEPTUS ASTARTES, GRAVIS, BREACHER'
);

card('HORDE-SLAYER VETERAN', 'Warrior',
  { APL: '3', MOVE: '5"', SAVE: '3+', WOUNDS: '18' },
  [
    { name: 'Infernus heavy bolter – Flame',    atk: '5', hit: '2+', dmg: '3/3', wr: 'Range 8", Torrent 2, Saturate' },
    { name: 'Infernus heavy bolter – Sweeping', atk: '4', hit: '3+', dmg: '4/5', wr: 'Piercing Crits 1, Torrent 1' },
    { name: 'Infernus heavy bolter – Focused',  atk: '5', hit: '3+', dmg: '4/5', wr: 'Piercing Crits 1' },
    { name: 'Bolt pistol',                      atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Fists',                            atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [],
  'DEATHWATCH, IMPERIUM, ADEPTUS ASTARTES, GRAVIS, HORD-SLAYER'
);

card('DEMOLISHER VETERAN', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '15' },
  [
    { name: 'Bolt Pistol',          atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Heavy thunder hammer', atk: '5', hit: '4+', dmg: '6/7', wr: 'Stun, Shock' },
  ],
  [
    { name: 'Brutal Assault', description: 'Whenever this operative is fighting, its Heavy thunder hammer has the Brutal weapon rule. Whenever this operative performs the Charge action, its Heavy thunder hammer has the Ceaseless weapon rule until the end of the activation/counteraction.' },
    { name: 'Aggressive Force', description: 'Whenever this operative is fighting or retaliating, Normal and Critical Dmg of 3 or more inflicts 1 less damage on it. This isn\'t cumulative with the Shield that Slays strategy ploy.' },
  ],
  'DEATHWATCH, IMPERIUM, ADEPTUS ASTARTES, DEMOLISHER'
);

card('DISRUPTOR VETERAN', 'Warrior',
  { APL: '3', MOVE: '7"', SAVE: '3+', WOUNDS: '13' },
  [
    { name: 'Marksman bolt carbine', atk: '4', hit: '3+', dmg: '3/4', wr: 'Lethal 5+' },
    { name: 'Fists',                 atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Advanced Omni-Scrambler', description: 'STRATEGIC GAMBIT. Select one enemy operative visible to or within 6" of this operative, then roll one D6. In the following Firefight phase, that enemy operative cannot be activated or perform actions until one of the following is true:\n• Your opponent has activated a number of enemy operatives equal to the D6 result.\n• It\'s the last enemy operative to be activated.' },
    { name: 'Auspex Triangulation', description: 'The Advanced Auspex Scan firefight ploy costs you 0CP when both of the following are true:\n• This operative isn\'t within control Range of enemy operatives.\n• The target of that Shoot action (primary target, if relevant) is visible to this operative.\nNote that it doesn\'t have to be this operative performing the Shoot action, and that any subsequent Shoot actions during that activation/counteraction must meet these same requirements (or that ploy has no effect on those subsequent Shoot actions).' },
  ],
  'DEATHWATCH, IMPERIUM, ADEPTUS ASTARTES, DISRUPTOR'
);

card('GUNNER VETERAN', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '15' },
  [
    { name: 'Heavy plasma incinerator – Standard',    atk: '5', hit: '3+', dmg: '4/6', wr: 'Piercing 1' },
    { name: 'Heavy plasma incinerator – Supercharge', atk: '5', hit: '3+', dmg: '5/6', wr: 'Hot, Lethal 5+, Piercing 1' },
    { name: 'Bolt pistol',                            atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Fists',                                  atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [],
  'DEATHWATCH, IMPERIUM, ADEPTUS ASTARTES, GUNNER'
);

card('HEADTAKER VETERAN', 'Warrior',
  { APL: '3', MOVE: '7"', SAVE: '3+', WOUNDS: '13' },
  [
    { name: 'Special issue bolt pistol', atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Piercing 1' },
    { name: 'Combat blades',             atk: '5', hit: '3+', dmg: '4/5', wr: '–' },
  ],
  [
    { name: 'Grav-chute and Grapnel Launcher', description: 'Whenever this operative is climbing, treat the vertical distance as 2" (regardless of how far the operative actually moves vertically). Whenever this operative is dropping, ignore the vertical distance.' },
    { name: 'Clandestine Headtaker', description: 'This operative can perform the Charge action while it has a Conceal order. Whenever this operative is fighting an operative it wasn\'t visible to at the start of the activation/counteraction, the first time you strike during that sequence, you can immediately resolve another of your successes as a strike (before your opponent).' },
  ],
  'DEATHWATCH, IMPERIUM, ADEPTUS ASTARTES, HEADTAKER'
);

card('MARKSMAN VETERAN', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '15' },
  [
    { name: 'Stalker bolt rifle – Heavy',  atk: '4', hit: '2+', dmg: '3/5', wr: 'Piercing Crits 1, Lethal 5+, Heavy (Dash only)' },
    { name: 'Stalker bolt rifle – Mobile', atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Fists',                       atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Vigilant Marksman', description: 'This operative can perform the Guard action (see close quarters rules, pg 58) in any killzone.\n\nWhen using the close quarters rules, once per turning point, after this operative performs a free Shoot action while on guard, it can immediately perform a free Guard action. However, if it does, it cannot counteract (nor Guard twice if it\'s counteracted).' },
  ],
  'DEATHWATCH, IMPERIUM, ADEPTUS ASTARTES, MARKSMAN'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Deathwatch populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
