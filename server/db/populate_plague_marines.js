import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Plague Marines'").get()?.id;
if (!FACTION_ID) { console.error('Plague Marines faction not found'); process.exit(1); }

// Clear existing Plague Marines data
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
  'Archetypes: SECURITY, SEEK-DESTROY');

rule('faction_rules', null, 'OPERATIVES', 0,
  `1 PLAGUE MARINE CHAMPION operative

5 PLAGUE MARINE operatives selected from the following list:
• BOMBARDIER
• FIGHTER
• HEAVY GUNNER
• ICON BEARER
• MALIGNANT PLAGUECASTER
• WARRIOR

Your kill team can only include each operative on this list once.`);

rule('faction_rules', null, 'POISON', 0,
  `Some weapons in this team\'s rules have the Poison weapon rule.

*Poison: In the Resolve Attack Dice step, if you inflict damage with any successes, the operative this weapon is being used against (excluding friendly PLAGUE MARINE operatives) gains one of your Poison tokens (if it doesn\'t already have one). Whenever an operative that has one of your Poison tokens is activated, inflict 1 damage on it.`);

rule('faction_rules', null, 'DISGUSTINGLY RESILIENT', 0,
  'Whenever an attack dice inflicts damage of 3 or more on a friendly PLAGUE MARINE operative, roll one D6: on a 4+, subtract 1 from that inflicted damage.');

rule('faction_rules', null, 'ASTARTES', 0,
  `During each friendly PLAGUE MARINE operative\'s activation, it can perform either two Shoot actions or two Fight actions. If it\'s two Shoot actions, a bolt pistol, boltgun or PSYCHIC weapon must be selected for at least one of them. You cannot select the same ranged PSYCHIC weapon more than once per activation.

Each friendly PLAGUE MARINE operative can counteract regardless of its order.`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'CONTAGION', 1,
  `Subtract 2" from the Move stat of an enemy operative and worsen the Hit stat of its weapons by 1 (this isn\'t cumulative with being injured) whenever any of the following are true:
• It\'s within control range of friendly PLAGUE MARINE operatives.
• It has one of your Poison tokens and is visible to (or vice versa) and within 3" of friendly PLAGUE MARINE operatives.
• It\'s visible to (or vice versa) and within 3" of a friendly PLAGUE MARINE ICON BEARER operative.`);

rule('ploy', 'Strategy', 'CLOUD OF FLIES', 1,
  'Place one of your Cloud of Flies markers in the killzone. Whenever an operative is shooting a friendly PLAGUE MARINE operative that\'s more than 3" from it, if that friendly operative is wholly within 1" of that marker, that friendly operative is obscured. In the Ready step of the next Strategy phase, remove that marker.');

rule('ploy', 'Strategy', 'LUMBERING DEATH', 1,
  'Whenever a friendly PLAGUE MARINE operative is shooting or fighting during an activation in which it hasn\'t moved more than 3", or whenever it\'s retaliating, its weapons have the Ceaseless weapon rule.');

rule('ploy', 'Strategy', 'NURGLINGS', 1,
  'Select one enemy operative within 3" of a friendly PLAGUE MARINE operative, or one enemy operative that has one of your Poison tokens and is within 7" of a friendly PLAGUE MARINE operative. Until the end of the selected operative\'s next activation, subtract 1 from its APL stat.');

rule('ploy', 'Firefight', 'CURSE OF ROT', 1,
  `Use this firefight ploy when a friendly PLAGUE MARINE operative is fighting against or shooting against an enemy operative within 3" of it (or within 7" of it if that enemy operative has one of your Poison tokens), after your opponent rolls their attack or defence dice. For each result of 3 they roll, inflict 1 damage on that enemy operative, that result is treated as a fail and they cannot re-roll it.`);

rule('ploy', 'Firefight', 'POISONOUS DEMISE', 1,
  'Use this firefight ploy when a friendly PLAGUE MARINE operative is incapacitated, before it\'s removed from the killzone. Each enemy operative visible to and within 3" of that operative gains one of your Poison tokens (if they don\'t already have one); for each of those enemy operatives that already has one of your Poison tokens (including if they gained one during this action), inflict 1 damage on them instead.');

rule('ploy', 'Firefight', 'SICKENING RESILIENCE', 1,
  'Use this firefight ploy when an attack dice inflicts damage on a friendly PLAGUE MARINE operative. Until the end of the activation or counteraction, for the purposes of the Disgustingly Resilient rule for that operative, always subtract 1 from the damage inflicted (to a minimum of 2) — you don\'t need to roll.');

rule('ploy', 'Firefight', 'VIRULENT POISON', 1,
  'Use this firefight ploy during a friendly PLAGUE MARINE operative\'s activation or counteraction, before or after it performs an action. One enemy operative within 3" of, or visible to and within 7" of, that operative gains one of your Poison tokens (if it doesn\'t already have one).');

// ── TACOPS ───────────────────────────────────────────────────────────────────

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

rule('equipment', null, 'POISON VENTS', 0,
  'Whenever an enemy operative that doesn\'t have one of your Poison tokens is activated within 3" of a friendly PLAGUE MARINE operative, roll one D3: on a 3, that operative gains one of your Poison tokens.');

rule('equipment', null, 'PLAGUE ROUNDS', 0,
  'Friendly PLAGUE MARINE operatives\' boltguns and bolt pistols have the Poison and Severe weapon rules.');

rule('equipment', null, 'PLAGUE BELLS', 0,
  'You can ignore any changes to the stats of friendly PLAGUE MARINE operatives from being injured.');

rule('equipment', null, 'PLAGUE GRENADES', 0,
  `Friendly PLAGUE MARINE operatives have the following ranged weapon (you cannot select it for use more than twice during the battle):

Blight grenade — ATK: 4, HIT: 4+, DMG: 2/4, WR: Range 6", Blast 2", Saturate, Severe, Poison*`);

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('PLAGUE MARINE CHAMPION', 'Leader',
  { APL: '3', MOVE: '5"', SAVE: '3+', WOUNDS: '15' },
  [
    { name: 'Plasma pistol – Standard',    atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 8", Piercing 1' },
    { name: 'Plasma pistol – Supercharge', atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 8", Hot, Lethal 5+, Piercing 1' },
    { name: 'Plague sword',                atk: '5', hit: '3+', dmg: '4/5', wr: 'Severe, Toxic*, Poison*' },
  ],
  [
    { name: 'Grandfather\'s Blessing', description: 'Whenever an enemy operative that has one of your Poison tokens loses one or more wounds within 7" of this operative, this operative regains up to an equal number of lost wounds (to a maximum of 3 lost wounds per turning point, and only if this operative isn\'t incapacitated).' },
    { name: '*Toxic', description: 'Whenever this operative is using this weapon against an enemy operative that has one of your Poison tokens, add 1 to both Dmg stats of this weapon.' },
  ],
  'PLAGUE MARINE, CHAOS, HERETIC ASTARTES, LEADER, CHAMPION'
);

card('MALIGNANT PLAGUECASTER', 'Specialist',
  { APL: '3', MOVE: '5"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Entropy',         atk: '4', hit: '3+', dmg: '3/7', wr: 'PSYCHIC, Range 7", Saturate, Severe, Poison*' },
    { name: 'Plague wind',     atk: '6', hit: '3+', dmg: '2/3', wr: 'PSYCHIC, Saturate, Severe, Torrent 1", Poison*' },
    { name: 'Corrupted staff', atk: '4', hit: '3+', dmg: '3/4', wr: 'PSYCHIC, Severe, Shock, Stun, Poison*' },
  ],
  [
    { name: 'POISONOUS MIASMA (1AP)', description: 'PSYCHIC. Select one enemy operative visible to and within 7" of this operative, or one enemy operative that\'s a valid target for this operative. That enemy operative gains one of your Poison tokens (if it doesn\'t already have one). If it already has one, inflict 3 damage on that enemy operative instead.\n\nAn operative cannot perform this action while within control Range of an enemy operative.' },
    { name: 'PUTRESCENT VITALITY (1AP)', description: 'PSYCHIC. Select one friendly operative visible to and within 3" of this operative, then roll 2D6: if the result is 7, the selected operative regains 7 lost wounds; otherwise, the selected operative regains lost wounds equal to the highest D6.\n\nThis operative cannot perform this action while within control Range of an enemy operative, or more than once per turning point.' },
  ],
  'PLAGUE MARINE, CHAOS, HERETIC ASTARTES, PSYKER, MALIGNANT PLAGUECASTER'
);

card('PLAGUE MARINE BOMBARDIER', 'Warrior',
  { APL: '3', MOVE: '5"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Boltgun', atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Fists',   atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Grenadier', description: 'This operative can use blight and krak grenades (see faction and universal equipment). Doing so doesn\'t count towards any Limited uses you have (i.e. if you also select those grenades from equipment for other operatives). Whenever it\'s doing so, improve the Hit stat of that weapon by 1 and blight grenades have the Toxic weapon rule (see below).' },
    { name: '*Toxic', description: 'Whenever this operative is using this weapon against an enemy operative that has one of your Poison tokens, add 1 to both Dmg stats of this weapon.' },
  ],
  'PLAGUE MARINE, CHAOS, HERETIC ASTARTES, BOMBARDIER'
);

card('PLAGUE MARINE FIGHTER', 'Warrior',
  { APL: '3', MOVE: '5"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Flail of Corruption', atk: '5', hit: '3+', dmg: '4/5', wr: 'Brutal, Severe, Shock, Poison*' },
  ],
  [
    { name: 'FLAIL (1AP)', description: 'Inflict D3+2 damage on each other operative that\'s both visible to and within 2" of this operative. Roll separately for each: if it\'s an enemy operative, if the D3 result is a 3, that enemy operative also gains one of your Poison tokens (if it doesn\'t already have one).\n\nFor the purposes of action restrictions and the Astartes faction rule, this action is treated as a Fight action. This operative cannot perform this action while it has a Conceal order.' },
    { name: '*Toxic', description: 'Whenever this operative is using this weapon against an enemy operative that has one of your Poison tokens, add 1 to both Dmg stats of this weapon.' },
  ],
  'PLAGUE MARINE, CHAOS, HERETIC ASTARTES, FIGHTER'
);

card('PLAGUE MARINE HEAVY GUNNER', 'Warrior',
  { APL: '3', MOVE: '5"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Plague spewer', atk: '5', hit: '2+', dmg: '3/3', wr: 'Range 7", Saturate, Severe, Torrent 2", Poison*' },
    { name: 'Fists',         atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: '*Toxic', description: 'Whenever this operative is using this weapon against an enemy operative that has one of your Poison tokens, add 1 to both Dmg stats of this weapon.' },
  ],
  'PLAGUE MARINE, CHAOS, HERETIC ASTARTES, HEAVY GUNNER'
);

card('PLAGUE MARINE ICON BEARER', 'Warrior',
  { APL: '3', MOVE: '5"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Bolt pistol',  atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Plague knife', atk: '5', hit: '3+', dmg: '3/4', wr: 'Severe, Poison*' },
  ],
  [
    { name: 'Icon Bearer', description: 'Whenever determining control of a marker, treat this operative\'s APL stat as 1 higher. Note this isn\'t a change to its APL stat, so any changes are cumulative with this.' },
    { name: 'Icon of Contagion', description: 'Whenever this operative is within your opponent\'s territory, the Contagion strategy ploy costs you 0CP.' },
    { name: '*Toxic', description: 'Whenever this operative is using this weapon against an enemy operative that has one of your Poison tokens, add 1 to both Dmg stats of this weapon.' },
  ],
  'PLAGUE MARINE, CHAOS, HERETIC ASTARTES, ICON BEARER'
);

card('PLAGUE MARINE WARRIOR', 'Warrior',
  { APL: '3', MOVE: '5"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Boltgun',      atk: '4', hit: '3+', dmg: '3/4', wr: 'Toxic*' },
    { name: 'Plague knife', atk: '4', hit: '3+', dmg: '3/4', wr: 'Severe, Poison*' },
  ],
  [
    { name: 'Repulsive Fortitude', description: 'Whenever an operative is shooting this operative, defence dice results of 5+ are critical successes.' },
    { name: '*Toxic', description: 'Whenever this operative is using this weapon against an enemy operative that has one of your Poison tokens, add 1 to both Dmg stats of this weapon.' },
  ],
  'PLAGUE MARINE, CHAOS, HERETIC ASTARTES, WARRIOR'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Plague Marines populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
