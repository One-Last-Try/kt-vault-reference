import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Legionaries'").get()?.id;
if (!FACTION_ID) { console.error('Legionaries faction not found'); process.exit(1); }

// Clear existing Legionaries data
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
  `1 LEGIONARY operative selected from the following list:
• LEGIONARY CHOSEN operative equipped with one option from each of the following:
  - Plasma pistol or Tainted bolt pistol
  - Daemon blade
• LEGIONARY ASPIRING CHAMPION operative equipped with one option from each of the following:
  - Plasma pistol or Tainted bolt pistol
  - Tainted Chainsword, Power weapon, Power fist or Power maul

5 LEGIONARY operatives selected from the following list:
• LEGIONARY WARRIOR equipped with one of the following options:
  - Boltgun; Fists
  - Bolt pistol; Chainsword
• LEGIONARY GUNNER equipped with one of the following options:
  - Bolt pistol; Flamer; Fists
  - Bolt pistol; Meltagun; Fists
  - Bolt pistol; Plasma gun; Fists
• LEGIONARY HEAVY GUNNER equipped with one of the following options:
  - Bolt pistol; Heavy bolter; Fists
  - Bolt pistol; Missile launcher; Fists
  - Bolt pistol; Reaper chaincannon; Fists
• LEGIONARY ICON BEARER equipped with one of the following options:
  - Boltgun; Fists
  - Bolt pistol; Chainsword
• LEGIONARY ANOINTED
• LEGIONARY BUTCHER
• LEGIONARY BALEFIRE ACOLYTE
• LEGIONARY SHRIVETALON

Other than LEGIONARY WARRIOR operatives, your kill team can only include each operative above once.`);

rule('faction_rules', null, '<MARK OF CHAOS>', 0,
  `When selecting a LEGIONARY operative for the battle, you must choose one of the following keywords for it to have for that battle: KHORNE, NURGLE, SLAANESH, TZEENTCH, UNDIVIDED. Each operative\'s keyword can be different, but a BALEFIRE ACOLYTE operative cannot have the KHORNE keyword.

Friendly LEGIONARY operatives have an additional rule determined by this keyword. In addition, LEGIONARY ploys have additional benefits for operatives with the relevant keyword.

This operative gains one ability from those listed below. The ability it gains depends on its keyword.

KHORNE - WRATHFUL ONSLAUGHT
This operative\'s melee weapons have the Severe weapon rule.

NURGLE - DISGUSTING VIGOUR
Whenever Normal Dmg of 3 or more is inflicted on this operative, roll one D6: on a 5+, subtract 1 from that inflicted damage.

SLAANESH - UNNATURAL AGILITY
Add 1" to this operative\'s Movement Stat.

TZEENTCH - EMPYREAL GUIDANCE
This operative\'s shoot weapons have the Severe weapon rule.

UNDIVIDED - VICIOUS REAVERS
Whenever this operative is shooting against, fighting against or retaliating against an enemy operative within 6" of it, this operative\'s weapons have the Ceaseless weapon rule.`);

rule('faction_rules', null, 'ASTARTES', 0,
  `During each friendly LEGIONARY operative\'s activation, it can perform either two Shoot actions or two Fight actions. If it\'s two Shoot actions, a bolt pistol, boltgun or tainted bolt pistol must be selected for at least one of them.

Each friendly LEGIONARY operative can Counteract regardless of its order.`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'BLOOD FOR THE BLOOD GOD', 1,
  `Whenever a friendly LEGIONARY operative (excluding KHORNE) is fighting, the first time you strike during that sequence, inflict 1 additional damage (to a maximum of 7).

Add 1 to both Dmg stats of friendly LEGIONARY KHORNE operatives\' melee weapons (to a maximum of 7).`);

rule('ploy', 'Strategy', 'QUICKSILVER SPEED', 1,
  `Whenever a friendly LEGIONARY operative that performed an action in which it moved during this turning point is fighting or retaliating, worsen the Hit stat of the enemy operative\'s melee weapons by 1.

Whenever an operative is shooting a friendly LEGIONARY SLAANESH operative more than 6" from it that performed an action in which it moved during this turning point, worsen the Hit stat of the enemy operative\'s weapons by 1.

In all cases for this ploy, this isn\'t cumulative with being injured.`);

rule('ploy', 'Strategy', 'IMPLACABLE', 1,
  `Whenever an operative is shooting a friendly LEGIONARY operative, weapons with the Piercing 1 weapon rule have the Piercing Crits 1 weapon rule instead.

You can ignore any changes to the stats of friendly LEGIONARY NURGLE operatives from being injured.`);

rule('ploy', 'Strategy', 'FICKLE FATES', 1,
  `Whenever a friendly LEGIONARY operative is shooting a ready enemy operative, that friendly operative\'s ranged weapons have the Balanced weapon rule; if the weapon already has that weapon rule (e.g., reaper chaincannon), it has the Relentless weapon rule.

Whenever an operative is shooting a ready friendly LEGIONARY TZEENTCH operative, in the Roll Defence Dice step, if you retain any critical successes, you can retain one of your fails as a normal success instead of discarding it.`);

rule('ploy', 'Firefight', 'UNENDING BLOODSHED', 1,
  `Use this firefight ploy when a friendly LEGIONARY KHORNE operative is incapacitated while fighting or retaliating.

You can strike the enemy operative in that sequence with one of your unresolved successes before it\'s removed from the killzone.`);

rule('ploy', 'Firefight', 'MUTABILITY AND CHANGE', 1,
  `Use this firefight ploy when a friendly LEGIONARY TZEENTCH operative is activated.

Until the end of that operative\'s activation, add 1 to its APL stat, but it cannot perform the same action more than once during that activation. If it\'s a WARRIOR operative, that operative\'s Marks of Chaos keyword cannot be changed during this turning point (see Infernal Pact additional rule).`);

rule('ploy', 'Firefight', 'MALIGNANT AURA', 1,
  `Use this firefight ploy when a friendly LEGIONARY NURGLE operative is performing the Shoot action, when you select a valid target.

Until the end of that action, whenever that operative is shooting an enemy operative within 3" of it (i.e. including secondary targets, if any), its ranged weapons have the Piercing 1 weapon rule.`);

rule('ploy', 'Firefight', 'SICKENING CAPTIVATION', 1,
  `Use this firefight ploy during a friendly LEGIONARY SLAANESH operative\'s activation, before or after it performs an action.

Select one enemy operative visible to and within 4" of that friendly operative. Until the end of that enemy operative\'s next activation, subtract 1 from its APL stat.`);

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

rule('equipment', null, 'WARDED ARMOUR', 0,
  'Strategic Gambit. Select one friendly LEGIONARY operative. Until the Ready step of the next Strategy phase, change that operative\'s Save stat to 2+.');

rule('equipment', null, 'TAINTED ROUNDS', 0,
  'Once per turning point, when a friendly LEGIONARY operative is performing the Shoot action and you select a bolt pistol or boltgun, you can use this rule. If you do, until the end of that action, that weapon has the Rending weapon rule.');

rule('equipment', null, 'CHAOS TALISMANS', 0,
  'Strategic Gambit. Select one Marks of Chaos keyword. Once during each of their activations, when a friendly LEGIONARY operative that has that keyword is shooting, fighting or retaliating, if you roll two or more fails, you can inflict D3 damage on that friendly operative to discard one of them and retain the other as a normal success instead. Note that if it\'s the Shoot action and that damage incapacitates that friendly operative, the action doesn\'t end (continue the sequence with your successful attack dice).');

rule('equipment', null, 'MALEFIC BLADES', 0,
  `Friendly LEGIONARY operatives have the following melee weapon for the battle:

NAME: Malefic Blades | ATK: 5 | HIT: 3+ | DMG: 3/4 | WR: –`);

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('LEGIONARY ASPIRING CHAMPION', 'Leader',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '15' },
  [
    { name: 'Plasma pistol – Standard',    atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 8", Piercing 1' },
    { name: 'Plasma pistol – Supercharge', atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 8", Hot, Lethal 5+, Piercing 1' },
    { name: 'Tainted Bolt Pistol',         atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 8", Rending' },
    { name: 'Power fist',                  atk: '5', hit: '4+', dmg: '5/7', wr: 'Brutal' },
    { name: 'Power maul',                  atk: '5', hit: '3+', dmg: '4/6', wr: 'Shock' },
    { name: 'Power weapon',                atk: '5', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
    { name: 'Tainted chainsword',          atk: '5', hit: '3+', dmg: '4/5', wr: 'Rending' },
  ],
  [
    { name: 'In the Eyes of the Gods', description: 'Once during each of this operative\'s activations, if it incapacitates an enemy operative, add 1 to its APL stat until the end of that activation.' },
  ],
  'LEGIONARY, CHAOS, HERETIC ASTARTES, ASPIRING CHAMPION'
);

card('LEGIONARY CHOSEN', 'Leader',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '15' },
  [
    { name: 'Plasma pistol – Standard',    atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 8", Piercing 1' },
    { name: 'Plasma pistol – Supercharge', atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 8", Hot, Lethal 5+, Piercing 1' },
    { name: 'Tainted Bolt Pistol',         atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 8", Rending' },
    { name: 'Daemon blade',                atk: '5', hit: '3+', dmg: '4/7', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Daemonic Aura', description: 'Whenever an enemy operative performs the Fall Back action while within control Range of this operative, you can use this rule. If you do, roll one D6: on a 3+, that enemy operative cannot perform that action during that activation or counteraction (the AP spent on it is refunded).' },
    { name: 'Soul Gorge', description: 'After this operative fights or retaliates, if it isn\'t incapacitated, but it incapacitated an enemy operative or inflicted Critical Dmg during that sequence, it regains D3+1 lost wounds.' },
  ],
  'LEGIONARY, CHAOS, HERETIC ASTARTES, CHOSEN'
);

card('LEGIONARY GUNNER', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Bolt pistol',               atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Flamer',                    atk: '4', hit: '2+', dmg: '3/3', wr: 'Range 8", Saturate, Torrent 2' },
    { name: 'Meltagun',                  atk: '4', hit: '3+', dmg: '6/3', wr: 'Range 6", Devastating 4, Piercing 2' },
    { name: 'Plasma gun – Standard',     atk: '4', hit: '3+', dmg: '4/6', wr: 'Piercing 1' },
    { name: 'Plasma gun – Supercharge',  atk: '4', hit: '3+', dmg: '5/6', wr: 'Hot, Lethal 5+, Piercing 1' },
    { name: 'Fists',                     atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [],
  'LEGIONARY, CHAOS, HERETIC ASTARTES, GUNNER'
);

card('LEGIONARY HEAVY GUNNER', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Bolt pistol',                        atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Heavy bolter – Focused',             atk: '5', hit: '3+', dmg: '4/5', wr: 'Heavy (Reposition only), Piercing Crits 1' },
    { name: 'Heavy bolter – Sweeping',            atk: '4', hit: '3+', dmg: '4/5', wr: 'Heavy (Reposition only), Piercing Crits 1, Torrent 1' },
    { name: 'Missile launcher – Frag',            atk: '4', hit: '3+', dmg: '3/5', wr: 'Blast 2, Heavy (Reposition only)' },
    { name: 'Missile launcher – Krak',            atk: '4', hit: '3+', dmg: '5/7', wr: 'Heavy (Reposition only), Piercing 1' },
    { name: 'Reaper chaincannon – Focused',       atk: '5', hit: '3+', dmg: '3/4', wr: 'Ceaseless, Heavy (Reposition only), Punishing' },
    { name: 'Reaper chaincannon – Sweeping',      atk: '4', hit: '3+', dmg: '3/4', wr: 'Ceaseless, Heavy (Reposition only), Punishing, Torrent 2' },
    { name: 'Fists',                              atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [],
  'LEGIONARY, CHAOS, HERETIC ASTARTES, HEAVY GUNNER'
);

card('LEGIONARY ANOINTED', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Bolt pistol',    atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Daemonic claw',  atk: '5', hit: '3+', dmg: '4/5', wr: 'Rending' },
  ],
  [
    { name: 'Unleash Daemon', description: 'Once per battle, when this operative is activated, you can use this rule. If you do, until the end of the battle:\n• This operative cannot perform the Pick Up Marker or mission actions (excluding Operate Hatch). If it\'s carrying a marker, it must immediately perform the Place Marker action for 0AP (this takes precedence over all other rules).\n• Normal and Critical Dmg of 4 or more inflicts 1 less damage on this operative. If this operative has the NURGLE keyword, you cannot reduce the damage of an attack dice by more than 1. In other words, you cannot use both rules to reduce Normal Dmg of 4 or more by 2.\n• Its daemonic claw has the Ceaseless and Lethal 5+ weapon rules.' },
  ],
  'LEGIONARY, CHAOS, HERETIC ASTARTES, ANOINTED'
);

card('LEGIONARY BUTCHER', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Bolt pistol',            atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Double-handed chain axe', atk: '5', hit: '4+', dmg: '5/7', wr: 'Brutal' },
  ],
  [
    { name: 'Devastating Onslaught', description: '• Whenever this operative is fighting or retaliating, enemy operatives cannot assist.\n• At the end of each enemy operative\'s activation or counteraction, you can select an enemy operative within 2" of this operative. This operative can perform a free Charge action (you can change its order to Engage to do so), but it cannot move more than 2" and must end that move within control Range of that selected operative.' },
  ],
  'LEGIONARY, CHAOS, HERETIC ASTARTES, BUTCHER'
);

card('LEGIONARY SHRIVETALON', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Bolt pistol',    atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Flensing blades', atk: '5', hit: '3+', dmg: '3/5', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Vicious Reflexes', description: 'Whenever this operative is retaliating, you resolve the first attack dice (i.e. defender instead of attacker).' },
    { name: 'Horrifying Dismemberment', description: 'Whenever this operative incapacitates an enemy operative while fighting or retaliating, select one other enemy operative visible to and within 3" of either this operative or the incapacitated enemy operative. Subtract 1 from that enemy operative\'s APL stat until the end of its next activation.' },
    { name: 'GRISLY MARK (2AP)', description: 'Place your Grisly marker within this operative\'s control Range.\n• Whenever an enemy operative is within 3" of your Grisly marker, your opponent must spend 1 additional AP for that enemy operative to perform the Pick Up Marker and mission actions.\n• Whenever determining control of a marker, treat the total APL stat of enemy operatives that contest it as 1 lower if at least one of those enemy operatives is within 3" of your Grisly marker. Note this isn\'t a change to the APL stat, so any changes are cumulative with this.\nThis operative can only perform this action once per battle, and cannot perform it while within control Range of an enemy operative.' },
  ],
  'LEGIONARY, CHAOS, HERETIC ASTARTES, SHRIVETALON'
);

card('LEGIONARY ICON BEARER', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Bolt pistol',  atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Boltgun',      atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Chainsword',   atk: '5', hit: '3+', dmg: '4/5', wr: '–' },
    { name: 'Fists',        atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Icon Bearer', description: 'Whenever determining control of a marker, treat this operative\'s APL stat as 1 higher. Note this isn\'t a change to its APL stat, so any changes are cumulative with this.' },
    { name: 'Favoured of the Dark Gods', description: 'In the Ready step of each Strategy phase, if this operative controls an objective marker that isn\'t tainted, that objective marker is tainted for the battle and you gain 1CP. Note that if any operative (including enemy operatives) has tainted an objective marker, you cannot taint that objective marker.' },
  ],
  'LEGIONARY, CHAOS, HERETIC ASTARTES, ICON BEARER'
);

card('LEGIONARY BALEFIRE ACOLYTE', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Bolt pistol',  atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Fireblast',    atk: '4', hit: '3+', dmg: '3/4', wr: 'PSYCHIC, Blast 2, 1" Devastating 1, Saturate' },
    { name: 'Life Siphon',  atk: '5', hit: '3+', dmg: '3/3', wr: 'PSYCHIC, Saturate, Life Siphon*' },
    { name: 'Fell dagger',  atk: '5', hit: '3+', dmg: '3/4', wr: 'PSYCHIC, Rending, Life Siphon*' },
  ],
  [
    { name: 'Siphon Life*', description: 'When you select this weapon, you can use this rule. If you do, at the start of the Resolve Attack Dice step, select one friendly LEGIONARY operative visible to and within 6" of this operative. For each attack dice you resolve during that step that inflicts damage, that friendly operative regains 1 lost wound, or D3 lost wounds if it was a critical success. You cannot use this weapon rule more than once per turning point.' },
  ],
  'LEGIONARY, CHAOS, HERETIC ASTARTES, PSYKER, BALEFIRE ACOLYTE'
);

card('LEGIONARY WARRIOR', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Bolt pistol',  atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Boltgun',      atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Chainsword',   atk: '5', hit: '3+', dmg: '4/5', wr: '–' },
    { name: 'Fists',        atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Infernal pact', description: 'Once per battle, when a friendly LEGIONARY WARRIOR operative is activated, you can use this rule. If you do, change that operative\'s Marks of Chaos keyword.' },
  ],
  'LEGIONARY, CHAOS, HERETIC ASTARTES, WARRIOR'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Legionaries populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
