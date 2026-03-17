import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Sanctifiers'").get()?.id;
if (!FACTION_ID) { console.error('Sanctifiers faction not found'); process.exit(1); }

// Clear existing Sanctifiers data
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
  `1 SANCTIFIER CONFESSOR operative
1 SANCTIFIER CHERUB operative
9 SANCTIFIER operatives selected from the following list:
• CONFLAGRATOR
• DEATH CULT ASSASSIN
• DRILL ABBOT
• MIRACULIST
• MISSIONARY with one of the following options:
  - Ministorum flamer; brazier of holy fire*
  - Ministorum flamer; gun butt; holy relic
• MISSIONARY with one of the following options:
  - Meltagun; chainsword; holy relic
  - Plasma gun; chainsword; brazier of holy fire*
• PERSECUTOR
• PREACHER
• RELIQUANT
• SALVATIONIST

Other than PREACHER operatives, your kill team can only include each operative above once. Your kill team can only include up to four PREACHER operatives.

* You cannot select an option that includes a brazier of holy fire more than once per battle.`);

rule('faction_rules', null, 'MINISTORUM SERMON', 0,
  `STRATEGIC GAMBIT. Select one friendly SANCTIFIER operative. If a friendly CONFESSOR operative hasn't been incapacitated, you must select it. Until you use this STRATEGIC GAMBIT again during the battle, that operative has the ORATOR keyword.

Whenever a friendly SANCTIFIER operative is within 3" of a friendly ORATOR operative (or 6" if the ORATOR is a CONFESSOR), that friendly SANCTIFIER operative is benefitting from the SERMON.

Whenever a friendly SANCTIFIER operative is activated within 3" of a friendly ORATOR operative (or 6" if the ORATOR is a CONFESSOR), that friendly SANCTIFIER operative is benefitting from the SERMON until the end of that activation (i.e. even if it then moves more than the distance requirement from the ORATOR operative).

Whenever a friendly SANCTIFIER operative is benefitting from the SERMON, Normal and Critical Dmg of 4 or more inflicts 1 less damage on it.`);

rule('faction_rules', null, 'BLAZE', 0,
  `Some weapons in this team\'s rules have the Blaze weapon rule below.

Blaze: If you inflict damage with critical successes, the operative this weapon is being used against gains one of your Blaze tokens (if it doesn\'t already have one). Whenever an operative that has one of your Blaze tokens is activated, inflict D3 damage on it. Then that operative\'s controlling player selects one of the following:
• Roll one D6: on a 3+, remove that token.
• Subtract 1 from the operative\'s APL stat until the end of that activation to remove that token.`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'THE EMPEROR PROTECTS', 1,
  'Whenever an operative is shooting a friendly SANCTIFIER operative that\'s benefitting from the SERMON, you can re-roll any of your defence dice results of one result (e.g. results of 2).');

rule('ploy', 'Strategy', 'ZEALOUS PERSECUTION', 1,
  'Whenever a friendly SANCTIFIER operative is fighting during an activation in which it\'s performed the Charge action, its melee weapons have the Lethal 5+ weapon rule.');

rule('ploy', 'Strategy', 'ROSARIUS', 1,
  'Use this firefight ploy when an attack dice inflicts Normal Dmg on a friendly SANCTIFIER operative. Ignore that inflicted damage.');

rule('ploy', 'Strategy', 'REDEEMED TROUGHT FIRE', 1,
  'Use this firefight ploy when a friendly SANCTIFIER operative that has a weapon with the Blaze weapon rule is incapacitated. Each enemy operative visible to and within 2" of it gains one of your Blaze tokens (if it doesn\'t already have one).');

rule('ploy', 'Firefight', 'FERVENT BRAWL', 1,
  'Whenever a friendly SANCTIFIER operative that\'s benefitting from the SERMON is fighting or retaliating, its melee weapons have the Ceaseless weapon rule.');

rule('ploy', 'Firefight', 'RALLY THE FLOCK', 1,
  'Each friendly SANCTIFIER operative (excluding ORATOR) that\'s benefitting from the SERMON can immediately perform a free Dash or Fall Back action (for the latter, it cannot move more than 3"). Each that does so must end that move closer and visible to (or vice versa) a friendly ORATOR operative. You cannot use this ploy during the first turning point.');

rule('ploy', 'Firefight', 'ARDENT ERADICATION', 1,
  'Use this firefight ploy after rolling your attack dice for a friendly SANCTIFIER operative, if it\'s shooting against or fighting against an enemy operative that\'s within 3" of a friendly ORATOR operative (or 6" if the ORATOR is a CONFESSOR). You can re-roll any of your attack dice.');

rule('ploy', 'Firefight', 'UNWAVERING DEVOTION', 1,
  `Use this firefight ploy when a friendly SANCTIFIER ORATOR or SANCTIFIER MIRACULIST operative is selected as the valid target of a Shoot action or to fight against during the Fight action. Select one friendly SANCTIFIER operative (excluding CONFESSOR, MIRACULIST and ORATOR) visible to and within 3" of that first friendly operative to become the valid target or to be fought against (as appropriate) instead (even if it wouldn\'t normally be valid for this). If it\'s the Fight action, treat that other operative as being within the fighting operative\'s control range for the duration of that action.

This ploy has no effect if it\'s the Shoot action and the ranged weapon has the Blast or Torrent weapon rule.`);

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

rule('equipment', null, 'SANCTIFICATION ORBS', 0,
  `Once per turning point, one friendly SANCTIFIER operative (excluding CHERUB, DEATH CULT ASSASSIN and MIRACULIST) can perform the following unique action:

SANCTIFICATION ORB (1AP)
• Select one enemy operative visible to and within 6" of this operative. That operative and each other enemy operative within 1" of it takes a doused test. For an operative to take a doused test, roll one D6: on a 3+, it gains one of your Doused tokens.
• Whenever a friendly SANCTIFIER operative is shooting against an operative that has one of your Doused tokens with a weapon that has the Blaze weapon rule, that weapon also has the Seek weapon rule.
• After a friendly SANCTIFIER operative uses a weapon that has the Blaze weapon rule against an enemy operative that has one of your Doused tokens, remove that token (even if the Seek weapon rule wasn\'t used).
• This operative cannot perform this action while within control range of an enemy operative.`);

rule('equipment', null, 'PURITY SEAL', 0,
  'Once per turning point, when a friendly SANCTIFIER operative is shooting or fighting, if you roll two or more fails, you can discard one of them to retain another as a normal success instead.');

rule('equipment', null, 'ECCLESIARCHY TEXTS', 0,
  `In the Ready step of each Strategy phase, roll 3D6: if the result is less than the remaining wounds of a friendly ORATOR operative, you gain 1CP. Note that this is done before the Gambit step, so if there isn\'t a valid ORATOR operative, you cannot use this rule during that turning point (e.g. during the first turning point).`);

rule('equipment', null, 'IMPERIAL CULT SYMBOL', 0,
  'Once per turning point, when an operative is shooting a friendly SANCTIFIER operative that\'s benefitting from the SERMON, when you collect your defence dice, you can use this rule. If you do, change one of the attacker\'s retained critical successes to a normal success (any weapon rules they\'ve already resolved aren\'t affected, e.g. Piercing Crits).');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('CONFESSOR', 'Leader',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '10' },
  [
    { name: 'Mace of Censure', atk: '4', hit: '3+', dmg: '5/5', wr: 'Brutal, Shock' },
  ],
  [
    { name: 'Lead the Procession', description: 'In each turning point after the first, whenever this operative is an ORATOR and performs the Charge, Fall Back or Reposition action during its activation, you can use this rule before it moves. If you do, determine each other friendly SANCTIFIER operative that\'s benefitting from the SERMON and is visible to this operative (or vice versa). After this operative ends that action, each of those friendly SANCTIFIER operatives can immediately perform a free Charge, Fall Back or Reposition action in an order of your choice, but each cannot move more than 3" and must end that move in a location where they are still benefitting from the SERMON. If this operative is incapacitated before this rule is fully resolved, e.g. from the Guard action\'s interruption (see close quarters rules, Kill Team Core Book), don\'t remove it from the killzone until this rule has been resolved.' },
    { name: 'Commanding Declamation', description: 'Whenever an enemy operative would perform an action during an activation or counteraction while visible to and within 6" of this operative, you can use this rule. If you do, roll one D6: if the result is higher than that enemy operative\'s APL stat:\n• It cannot perform that action during that activation or counteraction (the AP spent on it isn\'t refunded). If it\'s a counteraction, that counteraction ends.\n• You cannot use this rule again during the battle.' },
  ],
  'SANCTIFIER, IMPERIUM, ADEPTUS MINISTORUM, LEADER, CONFESSOR'
);

card('CHERUB', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '5+', WOUNDS: '5' },
  [
    { name: 'Incentiviser', atk: '3', hit: '5+', dmg: '1/3', wr: 'Shock' },
  ],
  [
    { name: 'Cherub', description: '• Whenever determining control of an objective marker, treat this operative\'s APL stat as 1 lower.\n• Whenever this operative has a Conceal order and is in cover, it cannot be selected as a valid target, taking precedence over all other rules (e.g. Vantage terrain).\n• This operative cannot use any weapons that aren\'t on its datacard, or perform unique actions other than Incentivise.' },
    { name: 'Fly', description: 'Whenever this operative performs the Charge, Fall Back or Reposition action, it can fly. If it does, don\'t move it. Instead, remove it from the killzone and set it back up wholly within a distance equal to its Move stat of its original location, measuring the horizontal distance only (in a killzone that uses the close quarters rules, e.g. Killzone: Gallowdark, this distance cannot be measured over or through Wall terrain). Note that it gains no additional distance when performing the Charge action. It must be set up in a location it can be placed, and unless it\'s the Charge action, it cannot be set up within control Range of an enemy operative.' },
    { name: 'INCENTIVISE (1AP)', description: 'SUPPORT. Select one other friendly SANCTIFIER operative (excluding CONFESSOR, DEATH CULT ASSASSIN, MIRACULIST and ORATOR) visible to and within 2" of this operative. Until the end of that operative\'s next activation, add 1 to its APL stat.\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'SANCTIFIER, IMPERIUM, ADEPTUS MINISTORUM, CHERUB'
);

card('CONFLAGRATOR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Twin hand flamers – Focused',     atk: '4', hit: '2+', dmg: '3/3', wr: 'Range 6", Saturate, Torrent 2", Blaze*' },
    { name: 'Twin hand flamers – Twin torrent', atk: '4', hit: '2+', dmg: '3/3', wr: 'Range 6", Saturate, Torrent 0", Twin Torrent *, Blaze*' },
    { name: 'Gun Butts',                        atk: '4', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Twin Torrent', description: 'Select up to two valid targets. Shoot with this weapon against both of them in an order of your choice (roll each sequence separately). Torrent 0" means you cannot select secondary targets, but this weapon still has the Torrent weapon rule for all other rules purposes, e.g. the Condensed Stronghold rule (see Killzone: Volkus, Kill Team Core Book).' },
    { name: 'Sanctification Rack', description: 'This operative can perform the Sanctification Orb action. Doing so in this manner doesn\'t count towards the once per turning point limit (i.e. if you also select that equipment for other operatives).' },
  ],
  'SANCTIFIER, IMPERIUM, ADEPTUS MINISTORUM, CONFLAGRATOR'
);

card('DEATH CULT ASSASSIN', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '5+', WOUNDS: '8' },
  [
    { name: 'Throwing knives', atk: '4', hit: '3+', dmg: '2/5', wr: 'Range 6", Silent' },
    { name: 'Ritual Blades',   atk: '4', hit: '2+', dmg: '4/6', wr: '–' },
  ],
  [
    { name: 'Bladed Stance', description: 'Whenever this operative is fighting or retaliating, you can resolve one of your successes before the normal order. If you do, that success must be used to block.' },
    { name: 'TRAINED ASSASSIN (1AP)', description: 'Change this operative\'s order.\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'SANCTIFIER, IMPERIUM, ADEPTUS MINISTORUM, DEATH CULT ASSASSIN'
);

card('DRILL ABBOT', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Great Hammer', atk: '4', hit: '4+', dmg: '4/4', wr: 'Brutal, Shock' },
  ],
  [
    { name: 'Schola Progenium Disciplinarian', description: 'Whenever a friendly SANCTIFIER operative is within 6" of this operative, you can ignore any changes to that operative\'s stats from being injured (including its weapons\' stats).' },
    { name: 'Null Skull', description: 'Whenever an enemy operative is within 4" of this operative, that enemy operative\'s APL stat cannot be added to (remove all positive APL stat changes it has). If an enemy operative that\'s more than 4" from this operative has a positive APL stat change and your opponent spends its final AP to move that operative within 4" of this operative, this can cause your opponent to have spent more AP than its APL stat — this is permitted in this situation.' },
  ],
  'SANCTIFIER, IMPERIUM, ADEPTUS MINISTORUM, DRILL ABBOT'
);

card('MIRACULIST', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '7' },
  [
    { name: 'Holy light',    atk: '4', hit: '2+', dmg: '4/3', wr: 'Range 8", Devastating 3, Limited 1, Piercing 1, Saturate, Blaze*' },
    { name: 'Wreathe in fire', atk: '4', hit: '2+', dmg: '4/4', wr: 'Blast 1, Limited 1, Wreathed*, Blaze*' },
    { name: 'Burning hands', atk: '1', hit: '2+', dmg: '7/8', wr: 'Brutal, Limited 1, Blaze*' },
    { name: 'Fists',         atk: '2', hit: '5+', dmg: '1/2', wr: '–' },
  ],
  [
    { name: 'Wreathed', description: 'This operative can perform the Shoot action with this weapon while within control Range of an enemy operative. Don\'t select a valid target. Instead, this operative is always the primary target, but only shoots against secondary targets, and they cannot be in cover or obscured (in other words, determine Blast from this operative, but this operative isn\'t affected).' },
    { name: 'Miracle', description: 'The first time this operative would be incapacitated during the battle, it\'s not incapacitated, has 1 wound remaining, and cannot be incapacitated for the remainder of the action. All remaining attack dice are discarded (including yours if this operative is fighting or retaliating), then this operative can immediately perform a free Dash or Fall Back action (for the latter, it cannot move more than 3"), even if it\'s performed an action that prevents it from performing the Dash or Fall Back action.' },
  ],
  'SANCTIFIER, IMPERIUM, ADEPTUS MINISTORUM, MIRACULIST'
);

card('MISSIONARY', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '8' },
  [
    { name: 'Brazier of holy fire (ranged)', atk: '4', hit: '2+', dmg: '4/4', wr: 'Range 4", Saturate, Torrent 1", Blaze*' },
    { name: 'Meltagun',                      atk: '4', hit: '4+', dmg: '6/3', wr: 'Range 6", Devastating 4, Piercing 2' },
    { name: 'Ministorum flamer',             atk: '4', hit: '2+', dmg: '4/4', wr: 'Range 8", Saturate, Torrent 2", Blaze*' },
    { name: 'Plasma gun – Standard',         atk: '4', hit: '4+', dmg: '4/6', wr: 'Piercing 1' },
    { name: 'Plasma gun – Supercharge',      atk: '4', hit: '4+', dmg: '5/6', wr: 'Hot, Lethal 5+, Piercing 1' },
    { name: 'Brazier of holy fire (melee)',  atk: '4', hit: '4+', dmg: '4/4', wr: 'Shock, Blaze*' },
    { name: 'Chainsword',                    atk: '4', hit: '4+', dmg: '4/5', wr: '–' },
    { name: 'Gun butt',                      atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Holy Relic', description: 'If this operative has a holy relic, it\'s always benefitting from the SERMON.' },
    { name: 'Spread the Word of the God-Emperor', description: 'Whenever this operative is more than 6" from other friendly operatives, its weapons have the Severe weapon rule.' },
  ],
  'SANCTIFIER, IMPERIUM, ADEPTUS MINISTORUM, MISSIONARY'
);

card('PERSECUTOR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Hand Flamer', atk: '4', hit: '3+', dmg: '3/3', wr: 'Range 6", Saturate, Torrent 1", Blaze*' },
    { name: 'Eviscerator',  atk: '4', hit: '4+', dmg: '5/6', wr: 'Brutal' },
  ],
  [
    { name: 'Merciless Castigation', description: 'The first time this operative performs the Fight action during each of its activations, if neither it nor the enemy operative in that sequence is incapacitated, this operative can immediately perform a free Fight action afterwards, but it can only fight against that enemy operative (and only if it\'s still valid to fight against). This takes precedence over action restrictions.' },
    { name: 'Fanatical Retribution', description: 'If this operative is incapacitated during the Fight action, you can strike with one of your unresolved successes before it\'s removed from the killzone.' },
  ],
  'SANCTIFIER, IMPERIUM, ADEPTUS MINISTORUM, PERSECUTOR'
);

card('RELIQUANT', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Hand Flamer', atk: '4', hit: '2+', dmg: '3/3', wr: 'Range 6", Saturate, Torrent 1", Blaze*' },
    { name: 'Gun Butt',    atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Cult Icon', description: 'Whenever determining control of a marker within 4" of this operative, treat the total APL stat of friendly SANCTIFIER operatives that contest it as 1 higher if at least one friendly SANCTIFIER operative contests that marker. Note this isn\'t a change to the APL stat, so any changes are cumulative with this.' },
    { name: 'Imperial Cult Devotion', description: 'Once per turning point, when a ready friendly SANCTIFIER operative is incapacitated while visible to and within 6" of this operative, you can use this rule. If you do, before that operative is removed from the killzone, it can perform one free action (excluding Fight), and you can change its order to do so. It\'s then incapacitated as normal.' },
  ],
  'SANCTIFIER, IMPERIUM, ADEPTUS MINISTORUM, RELIQUANT'
);

card('SALVATIONIST', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Soulstave', atk: '3', hit: '5+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Conversion Field', description: 'Whenever an operative more than 6" from this operative is shooting a friendly SANCTIFIER operative within 6" of this operative, improve that friendly operative\'s Save stat by 1.' },
    { name: 'MEDIKIT (1AP)', description: 'Select one friendly SANCTIFIER operative within this operative\'s control Range to regain 2D3 lost wounds.\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'SANCTIFIER, IMPERIUM, ADEPTUS MINISTORUM, MEDIC, SALVATIONIST'
);

card('PREACHER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Hand Flamer', atk: '4', hit: '2+', dmg: '3/3', wr: 'Range 6", Saturate, Torrent 1", Blaze*' },
    { name: 'Chainsword',  atk: '4', hit: '4+', dmg: '4/5', wr: '–' },
  ],
  [
    { name: 'Defend the Faith', description: 'Whenever this operative controls an objective marker, it\'s benefitting from the SERMON.' },
  ],
  'SANCTIFIER, IMPERIUM, ADEPTUS MINISTORUM, PREACHER'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Sanctifiers populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
