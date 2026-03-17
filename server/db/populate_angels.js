import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Angels of Death'").get()?.id;
if (!FACTION_ID) { console.error('Angels of Death faction not found'); process.exit(1); }

// Clear existing Angels of Death data
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
  `1 ANGEL OF DEATH operative selected from the following list:
• ASSAULT INTERCESSOR SERGEANT with one option from each of the following:
  - Hand flamer or heavy bolt pistol
  - Chainsword, power fist, power weapon or thunder hammer
  Or the following option:
  - Plasma pistol; chainsword
• INTERCESSOR SERGEANT with one option from each of the following:
  - Auto bolt rifle, bolt rifle or stalker bolt rifle
  - Chainsword, fists, power fist, power weapon or thunder hammer
• SPACE MARINE CAPTAIN

5 ANGEL OF DEATH operatives selected from the following list:
• ASSAULT INTERCESSOR GRENADIER
• ASSAULT INTERCESSOR WARRIOR
• ELIMINATOR SNIPER *
• HEAVY INTERCESSOR GUNNER *
• INTERCESSOR GUNNER with auxiliary grenade launcher and one of the following options:
  - Auto bolt rifle; fists
  - Bolt rifle; fists
  - Stalker bolt rifle; fists
• INTERCESSOR WARRIOR with one of the following options:
  - Auto bolt rifle; fists
  - Bolt rifle; fists
  - Stalker bolt rifle; fists

Other than WARRIOR operatives, your kill team can only include each operative above once.
* You cannot select more than one of these operatives combined.`);

rule('faction_rules', null, 'CHAPTER TACTICS', 0,
  `When selecting your kill team, select a primary and secondary CHAPTER TACTIC for friendly ANGEL OF DEATH operatives to gain for the battle. Multiple instances of the same CHAPTER TACTIC are not cumulative.

Designer's Note: If you're playing a series of games, i.e. a campaign or tournament, you must select the same primary and secondary CHAPTER TACTIC for every battle (you can still change the secondary with the Adaptive Tactics strategy ploy).`);

rule('faction_rules', 'Chapter Tactic', 'AGGRESSIVE', 0,
  "This operative's melee weapons have the Rending weapon rule.");

rule('faction_rules', 'Chapter Tactic', 'DUELLER', 0,
  "Whenever this operative is fighting or retaliating, each of your normal successes can block one unresolved critical success (unless the enemy operative's weapon has the Brutal weapon rule).");

rule('faction_rules', 'Chapter Tactic', 'RESOLUTE', 0,
  "You can ignore any changes to this operative's APL stat and it isn't affected by enemy operatives' Shock weapon rule.");

rule('faction_rules', 'Chapter Tactic', 'STEALTHY', 0,
  'Whenever an operative is shooting this operative, if you retain any cover saves, you can retain one additional cover save or retain one cover save as a critical success instead. This isn\'t cumulative with improved cover saves from Vantage terrain.');

rule('faction_rules', 'Chapter Tactic', 'MOBILE', 0,
  'This operative can perform the Fall Back action for 1 less AP. It can also perform the Charge action while within control range of an enemy operative and leave its control range.');

rule('faction_rules', 'Chapter Tactic', 'HARDY', 0,
  'Whenever an operative is shooting this operative, defence dice results of 5+ are critical successes. Whenever this operative is retaliating, the first time an attack dice inflicts Normal Dmg of 3 or more on this operative during that sequence, that dice inflicts 1 less damage on it.');

rule('faction_rules', 'Chapter Tactic', 'SHARPSHOOTER', 0,
  "Whenever this operative is shooting during an activation in which it hasn't performed Charge, Fall Back or Reposition, its bolt weapons gain the Accurate 1 and Severe weapon rules.");

rule('faction_rules', 'Chapter Tactic', 'SIEGE SPECIALIST', 0,
  "This operative's ranged weapons have the Saturate weapon rule. Whenever this operative is fighting or retaliating, enemy operatives cannot assist.");

rule('faction_rules', null, 'ASTARTES', 0,
  `During each friendly ANGEL OF DEATH operative's activation, it can perform either two Shoot actions or two Fight actions. If it's two Shoot actions, a bolt weapon must be selected for at least one of them, and if it's a bolt sniper rifle or heavy bolter, 1 additional AP must be spent for the second action if both actions are using that weapon.

Each friendly ANGEL OF DEATH operative can counteract regardless of its order.`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'COMBAT DOCTRINE', 1,
  `Select one COMBAT DOCTRINE from the following:
• Devastator Doctrine: Shooting an operative more than 6" from it.
• Tactical Doctrine: Shooting an operative within 6" of it.
• Assault Doctrine: Fighting or retaliating.

Whenever a friendly ANGEL OF DEATH operative is x, its weapons have the Balanced weapon rule -X, where X is the COMBAT DOCTRINE you selected.`);

rule('ploy', 'Strategy', 'AND THEY SHALL KNOW NO FEAR', 1,
  'You can ignore any changes to the stats of friendly ANGEL OF DEATH operatives from being injured (including their weapons\' stats).');

rule('ploy', 'Strategy', 'ADAPTIVE TACTICS', 1,
  'Change your secondary CHAPTER TACTIC. This ploy only lasts until the end of the turning point, at which point your original secondary CHAPTER TACTIC returns.');

rule('ploy', 'Strategy', 'INDOMITUS', 1,
  'Whenever an operative is shooting a friendly ANGEL OF DEATH operative, if you roll two or more fails, you can discard one of them to retain another as a normal success instead.');

rule('ploy', 'Firefight', 'ADJUST DOCTRINE', 1,
  "Use this firefight ploy during a friendly ANGEL OF DEATH operative's activation, before or after it performs an action. If you've used the Combat Doctrine strategy ploy during this turning point, change the COMBAT DOCTRINE you selected.");

rule('ploy', 'Firefight', 'TRANSHUMAN PHYSIOLOGY', 1,
  'Use this firefight ploy when an operative is shooting a friendly ANGEL OF DEATH operative, in the Roll Defence Dice step. You can retain one of your normal successes as a critical success instead.');

rule('ploy', 'Firefight', 'SHOCK ASSAULT', 1,
  `Use this firefight ploy when a friendly ANGEL OF DEATH operative is performing the Fight action during an activation in which it performed the Charge action, at the start of the Resolve Attack Dice step. Until the end of that action:
• Its melee weapon has the Shock weapon rule.
• The first time you strike during that sequence, inflict 1 additional damage (to a maximum of 7).`);

rule('ploy', 'Firefight', 'WRATH OF VENGEANCE', 1,
  'Use this firefight ploy when a friendly ANGEL OF DEATH operative is counteracting. It can perform an additional 1AP action for free during that counteraction, but both actions must be different.');

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

rule('equipment', null, 'PURITY SEALS', 0,
  'Once per turning point, when a friendly ANGEL OF DEATH operative is shooting, fighting or retaliating, if you roll two or more fails, you can discard one of them to retain another as a normal success instead.');

rule('equipment', null, 'TILTING SHIELDS', 0,
  "Once per turning point, when a friendly ANGEL OF DEATH operative is fighting or retaliating, after your opponent rolls their attack dice, you can use this rule. If you do, your opponent cannot retain attack dice results of less than 6 as critical successes during that sequence (e.g., as a result of the Lethal, Rending, or Severe weapon rules).");

rule('equipment', null, 'CHAPTER RELIQUARIES', 0,
  'You can use the Wrath of Vengeance firefight ploy for 0CP if the specified friendly operative has an Engage order.');

rule('equipment', null, 'AUSPEX', 0,
  "Once per turning point, when a friendly ANGEL OF DEATH operative performs the Shoot action and you're selecting a valid target, you can use this rule. If you do, until the end of the activation/counteraction, enemy operatives within 8\" of that friendly operative cannot be obscured.");

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('SPACE MARINE CAPTAIN', 'Leader',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '15' },
  [
    { name: 'Plasma pistol – Standard',    atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 8", Piercing 1' },
    { name: 'Plasma pistol – Supercharge', atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 8", Hot, Lethal 5+, Piercing 1' },
    { name: 'Power fist',                  atk: '5', hit: '3+', dmg: '5/7', wr: 'Brutal' },
  ],
  [
    { name: 'Heroic leader', description: 'Once per turning point, you can do one of the following: Use a firefight ploy for 0CP if this is the specified ANGEL OF DEATH operative (excluding Command Re-roll). Use the Combat Doctrine strategy ploy when you activate a friendly ANGEL OF DEATH operative if this operative is in the killzone and isn\'t within control Range of enemy operatives (pay its CP cost as normal). Use the Adjust Doctrine firefight ploy for 0CP if this operative is in the killzone and not within control Range of enemy operatives.' },
    { name: 'Iron halo', description: 'Once per battle, when an attack dice inflicts Normal Dmg on this operative, you can ignore that inflicted damage.' },
  ],
  'ANGELS OF DEATH, IMPERIUM, ADEPTUS ASTARTES, LEADER, SPACE MARINE CAPTAIN'
);

card('ASSAULT INTERCESSOR SERGEANT', 'Leader',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '15' },
  [
    { name: 'Hand flamer',                 atk: '4', hit: '2+', dmg: '3/3', wr: 'Range 6", Torrent 1, Saturate' },
    { name: 'Heavy bolt pistol',           atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Piercing Crits 1' },
    { name: 'Plasma pistol – Standard',    atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 8", Piercing 1' },
    { name: 'Plasma pistol – Supercharge', atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 8", Hot, Lethal 5+, Piercing 1' },
    { name: 'Chainsword',                  atk: '5', hit: '3+', dmg: '4/5', wr: '–' },
    { name: 'Power fist',                  atk: '5', hit: '4+', dmg: '5/7', wr: 'Brutal' },
    { name: 'Power weapon',                atk: '5', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
    { name: 'Thunder hammer',              atk: '5', hit: '4+', dmg: '5/6', wr: 'Stun, Shock' },
  ],
  [
    { name: 'Doctrine Warfare', description: 'You can do each of the following once per battle: Whenever you would use the Combat Doctrine strategy ploy and then select Assault, if this operative is in the killzone, it costs you 0CP. Whenever you would use the Combat Doctrine strategy ploy and then select Tactical, if this operative is in the killzone, it costs you 0CP.' },
    { name: 'Chapter Veteran', description: "At the end of the Select Operatives step, if this operative is selected for deployment, select one additional CHAPTER TACTIC for it to have for the battle. Unlike primary and secondary CHAPTER TACTICS, you don't have to select the same one for each battle in a campaign or tournament." },
  ],
  'ANGELS OF DEATH, IMPERIUM, ADEPTUS ASTARTES, LEADER, ASSAULT INTERCESSOR, SERGEANT'
);

card('INTERCESSOR SERGEANT', 'Leader',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '15' },
  [
    { name: 'Auto bolt rifle',              atk: '4', hit: '3+', dmg: '3/4', wr: 'Torrent 1' },
    { name: 'Bolt rifle',                   atk: '4', hit: '3+', dmg: '3/4', wr: 'Piercing Crits 1' },
    { name: 'Stalker bolt rifle – Mobile',  atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Stalker bolt rifle – Heavy',   atk: '4', hit: '3+', dmg: '3/5', wr: 'Piercing Crits 1, Lethal 5+, Heavy (Dash only)' },
    { name: 'Chainsword',                   atk: '4', hit: '3+', dmg: '4/5', wr: '–' },
    { name: 'Fists',                        atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Power fist',                   atk: '4', hit: '4+', dmg: '5/7', wr: 'Brutal' },
    { name: 'Power weapon',                 atk: '4', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
    { name: 'Thunder hammer',               atk: '4', hit: '4+', dmg: '5/6', wr: 'Stun, Shock' },
  ],
  [
    { name: 'Doctrine Warfare', description: 'You can do each of the following once per battle: Whenever you would use the Combat Doctrine strategy ploy and then select Devastator, if this operative is in the killzone, it costs you 0CP. Whenever you would use the Combat Doctrine strategy ploy and then select Tactical, if this operative is in the killzone, it costs you 0CP.' },
    { name: 'Chapter Veteran', description: "At the end of the Select Operatives step, if this operative is selected for deployment, select one additional CHAPTER TACTIC for it to have for the battle. Unlike primary and secondary CHAPTER TACTICS, you don't have to select the same one for each battle in a campaign or tournament." },
  ],
  'ANGELS OF DEATH, IMPERIUM, ADEPTUS ASTARTES, LEADER, INTERCESSOR, SERGEANT'
);

card('ASSAULT INTERCESSOR WARRIOR', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Heavy bolt pistol', atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Piercing Crits 1' },
    { name: 'Chainsword',        atk: '5', hit: '3+', dmg: '4/5', wr: '–' },
  ],
  [],
  'ANGELS OF DEATH, IMPERIUM, ADEPTUS ASTARTES, ASSAULT INTERCESSOR, WARRIOR'
);

card('ASSAULT INTERCESSOR GRENADIER', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Heavy bolt pistol', atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Piercing Crits 1' },
    { name: 'Chainsword',        atk: '5', hit: '3+', dmg: '4/5', wr: '–' },
  ],
  [
    { name: 'Grenadier', description: "This operative can use frag and krak grenades (see universal equipment). Doing so doesn't count towards any Limited uses you have (i.e. if you also select those grenades from equipment for other operatives). Whenever it's doing so, improve the Hit stat of that weapon by 1." },
  ],
  'ANGELS OF DEATH, IMPERIUM, ADEPTUS ASTARTES, ASSAULT INTERCESSOR, GRENADIER'
);

card('INTERCESSOR WARRIOR', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Auto bolt rifle',             atk: '4', hit: '3+', dmg: '3/4', wr: 'Torrent 1' },
    { name: 'Bolt rifle',                  atk: '4', hit: '3+', dmg: '3/4', wr: 'Piercing Crits 1' },
    { name: 'Stalker bolt rifle – Mobile', atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Stalker bolt rifle – Heavy',  atk: '4', hit: '3+', dmg: '3/5', wr: 'Piercing Crits 1, Lethal 5+, Heavy (Dash only)' },
    { name: 'Fists',                       atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [],
  'ANGELS OF DEATH, IMPERIUM, ADEPTUS ASTARTES, INTERCESSOR, WARRIOR'
);

card('INTERCESSOR GUNNER', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Auto bolt rifle',                   atk: '4', hit: '3+', dmg: '3/4', wr: 'Torrent 1' },
    { name: 'Auxiliary grenade launcher – Frag',  atk: '4', hit: '3+', dmg: '2/4', wr: 'Blast 2' },
    { name: 'Auxiliary grenade launcher – Krak',  atk: '4', hit: '3+', dmg: '4/5', wr: 'Piercing 1' },
    { name: 'Bolt rifle',                         atk: '4', hit: '3+', dmg: '3/4', wr: 'Piercing Crits 1' },
    { name: 'Stalker bolt rifle – Mobile',        atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Stalker bolt rifle – Heavy',         atk: '4', hit: '3+', dmg: '3/5', wr: 'Piercing Crits 1, Lethal 5+, Heavy (Dash only)' },
    { name: 'Fists',                              atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [],
  'ANGELS OF DEATH, IMPERIUM, ADEPTUS ASTARTES, INTERCESSOR, GUNNER'
);

card('ELIMINATOR SNIPER', 'Specialist',
  { APL: '3', MOVE: '7"', SAVE: '3+', WOUNDS: '12' },
  [
    { name: 'Bolt pistol',                     atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Bolt sniper rifle – Executioner', atk: '4', hit: '2+', dmg: '3/4', wr: 'Heavy (Dash only), Saturate, Seek Light, Silent' },
    { name: 'Bolt sniper rifle – Hyperfrag',   atk: '4', hit: '2+', dmg: '2/4', wr: 'Blast 1, Heavy (Dash only), Silent' },
    { name: 'Bolt sniper rifle – Mortis',      atk: '4', hit: '2+', dmg: '3/3', wr: 'Devastating 3, Heavy (Dash only), Piercing 1, Silent' },
    { name: 'Fists',                           atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Camo Cloak', description: 'Whenever an operative is shooting this operative, ignore the Saturate weapon rule. This operative has the CHAPTER TACTIC Stealthy. If you selected that CHAPTER TACTIC, you can do both of its options (i.e. retain two cover saves – one normal and one critical success).' },
    { name: 'OPTICS (1AP)', description: 'Until the start of this operative\'s next activation, whenever it\'s shooting, enemy operatives cannot be obscured. This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'ANGELS OF DEATH, IMPERIUM, ADEPTUS ASTARTES, ELIMINATOR, SNIPER'
);

card('HEAVY INTERCESSOR GUNNER', 'Specialist',
  { APL: '3', MOVE: '5"', SAVE: '3+', WOUNDS: '18' },
  [
    { name: 'Heavy bolter – Sweeping', atk: '4', hit: '3+', dmg: '4/5', wr: 'Piercing Crits 1, Torrent 1' },
    { name: 'Heavy bolter – Focused',  atk: '5', hit: '3+', dmg: '4/5', wr: 'Piercing Crits 1' },
    { name: 'Bolt pistol',             atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Fists',                   atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [],
  'ANGELS OF DEATH, IMPERIUM, ADEPTUS ASTARTES, HEAVY INTERCESSOR, GUNNER'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Angels of Death populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
