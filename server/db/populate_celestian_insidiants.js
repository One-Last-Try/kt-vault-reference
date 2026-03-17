import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Celestian Insidiants'").get()?.id;
if (!FACTION_ID) { console.error('Celestian Insidiants faction not found'); process.exit(1); }

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
  `1 CELESTIAN INSIDIANT SUPERIOR operative with one of the following options:
• Relic condemnor stakethrower; relic bolt pistol; null mace
• Inferno pistol; null mace

8 CELESTIAN INSIDIANT operatives selected from the following list:
• ABJUROR
• CENSOR
• CREMATOR
• DENUNCIA
• MORTISANCTUS
• RELIQUARIUS
• WARRIOR

Other than CREMATOR and WARRIOR operatives, your kill team can only include each operative above once. Your kill team can only include up to two CREMATOR operatives.`);

rule('faction_rules', null, 'MARTYRDOM', 0,
  `Whenever an INSPIRING friendly CELESTIAN INSIDIANT operative is incapacitated, before it's removed from the killzone, select one other friendly CELESTIAN INSIDIANT operative that operative is visible to or within 6" of.

Then, that selected operative gains one BENEDICTION (incapacitated operatives cannot be selected for a BENEDICTION).`);

rule('faction_rules', null, 'BENEDICTIONS', 0,
  `Ardour: Until the end of the battle, add 1 to that operative's APL stat. You cannot select this BENEDICTION for a SUPERIOR operative.

Wrath: Until the end of the battle, weapons on that operative's datacard have the Ceaseless weapon rule.

Restoration: That operative regains up to D3+2 lost wounds.

Exigence: That operative can immediately perform a free Charge or Dash action (for the former, it cannot move more than 3"), but must end that move closer to that incapacitated INSPIRING operative.`);

rule('faction_rules', null, 'WEAPONS OF THE WITCH HUNTERS', 0,
  `PSYCHIC ranged weapons cannot inflict damage on friendly CELESTIAN INSIDIANT operatives. For the effects of PSYCHIC actions, friendly CELESTIAN INSIDIANT operatives cannot be selected and are never treated as being within those actions' required distances. Whenever an operative is within 3" of a friendly CELESTIAN INSIDIANT operative:

• That operative cannot perform PSYCHIC actions or use PSYCHIC additional rules.
• That operative cannot use PSYCHIC ranged weapons.
• PSYCHIC melee weapons have no weapon rules and cannot have Dmg stats higher than 3/4.

Some weapons in this team's rules have the Anti-PSYKER weapon rule below.

*Anti-PSYKER: Whenever this weapon is being used against an operative that has the PSYKER keyword, it has the Lethal 5+ weapon rule.`);

rule('faction_rules', null, 'INSPIRATION', 0,
  `Whenever a friendly CELESTIAN INSIDIANT operative:
• Incapacitates an enemy operative that has a Wounds stat of 6 or more, that friendly operative becomes INSPIRING.
• Performs the Charge action, before it moves, it becomes INSPIRING.

Whenever a friendly CELESTIAN INSIDIANT operative is INSPIRING, weapons on its datacard have the Severe weapon rule.`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'SUSPECT & ELIMINATE', 1,
  `Select one enemy operative or marker. If you select an enemy operative, that operative and each other enemy operative visible to and within 2" of it gains one of your Suspicion tokens until the end of the turning point. If you selected a marker, each enemy operative contesting that marker gains one of your Suspicion tokens until the end of the turning point.

Whenever a friendly CELESTIAN INSIDIANT operative is shooting against or fighting against an operative that has one of your Suspicion tokens, that friendly operative's weapons have the Punishing weapon rule.`);

rule('ploy', 'Strategy', 'WRATHFUL DETERMINATION', 1,
  'Whenever an operative is shooting a friendly CELESTIAN INSIDIANT operative that has an Engage order, you can re-roll one of your defence dice.');

rule('ploy', 'Strategy', 'SUFFERING & SACRIFICE', 1,
  'Whenever a wounded friendly CELESTIAN INSIDIANT operative is shooting against, fighting against or retaliating against an enemy operative, its weapons have the Balanced weapon rule.');

rule('ploy', 'Strategy', 'HOLY RESILIENCE', 1,
  'Whenever an INSPIRING friendly CELESTIAN INSIDIANT operative is fighting or retaliating, Normal and Critical Dmg of 4 or more inflicts 1 less damage on that friendly operative.');

rule('ploy', 'Firefight', 'GLORY TO THE MARTYRS', 1,
  'Use this firefight ploy when a friendly CELESTIAN INSIDIANT operative is incapacitated while fighting or retaliating. You can strike the enemy operative in that sequence with one of your unresolved successes before it\'s removed from the killzone. If that enemy operative is incapacitated as a result, that friendly operative becomes INSPIRING before it\'s removed from the killzone and you can resolve the Martyrdom faction rule.');

rule('ploy', 'Firefight', 'FAITH & FURY', 1,
  'Use this firefight ploy when a friendly CELESTIAN INSIDIANT operative is fighting and you strike the enemy operative in that sequence with a critical success. After resolving that strike, also inflict D3 damage on each other enemy operative visible to and within 2" of that friendly operative in an order of your choice (roll separately for each). Note that the friendly operative would become INSPIRING if any enemy operatives with a Wounds stat of 6 or more are incapacitated as a result of this damage.');

rule('ploy', 'Firefight', 'UNSHAKEABLE PURSUIT', 1,
  `Use this firefight ploy during a friendly CELESTIAN INSIDIANT operative's activation, before or after it performs an action. Until the end of that operative's activation, you can ignore any changes to its Move stat. If that operative is INSPIRING, add 1" to its Move stat until the end of that activation. If that operative becomes INSPIRING by performing the Charge action, you can use this ploy before it moves to gain the additional movement (this takes precedence over stats not changing during an action).`);

rule('ploy', 'Firefight', 'FERVENT HATE', 1,
  `Use this firefight ploy after rolling your attack dice for a friendly CELESTIAN INSIDIANT operative, if it's shooting against, fighting against or retaliating against an enemy operative that doesn't have the IMPERIUM keyword. That friendly operative's weapons have the Ceaseless weapon rule until the end of that sequence; if that enemy operative also has the CHAOS and/or PSYKER keyword, that friendly operative's weapons have the Relentless weapon rule until the end of that sequence instead.`);

// ── TAC OPS ───────────────────────────────────────────────────────────────────

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

rule('equipment', null, 'PSYK-OUT GRENADES', 0,
  `This equipment allows you to select two utility grenades from the utility grenades equipment (see universal equipment) and they must all be stun grenades. If you also select that equipment as normal, you cannot select any stun grenades (i.e. to give you more than two). Whenever an operative takes a stun test as a result of a friendly CELESTIAN INSIDIANT operative performing the Stun Grenade action, if the result is a 3+, also inflict damage on that first operative equal to the dice result halved (rounding up). If that first operative has the PSYKER keyword, inflict damage on it equal to the dice result instead.`);

rule('equipment', null, 'VOCIFERA MORTIS', 0,
  `Once per battle, when an INSPIRING friendly CELESTIAN INSIDIANT operative is incapacitated, you can use this rule. If you do, for the Martyrdom faction rule, the other friendly CELESTIAN INSIDIANT operative you select can be one that isn't visible to or within 6" of that operative.`);

rule('equipment', null, 'SAINTLY RELICS', 0,
  `Whenever an attack dice would inflict damage on a friendly CELESTIAN INSIDIANT operative, you can use this rule. If you do, roll one D6, or two D6 if that operative is INSPIRING: if any result is a 6, ignore the damage inflicted from that attack dice. You cannot ignore more than one attack dice per action and two attack dice per battle this way.`);

rule('equipment', null, 'AUTO-FLAGELLATOR', 0,
  `Whenever a friendly CELESTIAN INSIDIANT operative is activated, you can use this rule. If you do, roll one D6 and inflict damage on that operative equal to half the result (rounding up); on a 4+, that operative also becomes INSPIRING. You cannot make more than one friendly operative INSPIRING using this rule per turning point.`);

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('INSIDIANT SUPERIOR', 'Leader',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '10' },
  [
    { name: 'Inferno pistol',                  atk: '4', hit: '3+', dmg: '4/2', wr: 'Range 3", Devastating 3, Piercing 2' },
    { name: 'Relic bolt pistol',               atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 8", Lethal 5+' },
    { name: 'Relic condemnor stakethrower',    atk: '4', hit: '3+', dmg: '2/2', wr: 'Devastating 2, Lethal 5+, Piercing Crits 1, Silent, Anti-PSYKER*' },
    { name: 'Null mace',                       atk: '4', hit: '3+', dmg: '4/4', wr: 'Shock, Anti-PSYKER*' },
  ],
  [
    { name: 'Holy Example', description: 'Once per turning point, if this operative is INSPIRING, you can use a firefight ploy for 0CP if this is the specified CELESTIAN INSIDIANT operative (including Command Re-roll if the attack or defence dice was rolled for this operative).' },
    { name: 'SPIRITUAL MENTOR (1AP)', description: 'Support. Select one friendly CELESTIAN INSIDIANT operative visible to and within 6" of this operative. That operative becomes INSPIRING. This operative cannot perform this action while within control Range of an enemy operative, or more than once per turning point.' },
  ],
  'CELESTIAN INSIDIANT, IMPERIUM, ADEPTA SORORITAS, LEADER, SUPERIOR'
);

card('INSIDIANT ABJUROR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '2+', WOUNDS: '11' },
  [
    { name: 'Blessed sword & praesidium protectiva (profile 1)', atk: '4', hit: '3+', dmg: '4/6', wr: 'Shield*' },
    { name: 'Blessed sword & praesidium protectiva (profile 2)', atk: '4', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
  ],
  [
    { name: '*Shield', description: 'Whenever this operative is fighting or retaliating with this weapon profile, each of your blocks can be allocated to block two unresolved successes (instead of one).' },
    { name: 'Holy Defender', description: 'Once per turning point, when a friendly CELESTIAN INSIDIANT operative visible to and within 2" of this operative is selected as the valid target of a Shoot action or to fight against during the Fight action, you can use this rule. If you do, this operative becomes the valid target or is fought against (as appropriate) instead (even if it wouldn\'t normally be valid for this). If it\'s the Fight action, treat this operative as being within the fighting operative\'s control Range for the duration of that action. If it\'s the Shoot action, this operative is only in cover or obscured if the original target was. This rule has no effect if it\'s the Shoot action and the ranged weapon has the Blast or Torrent weapon rule.' },
  ],
  'CELESTIAN INSIDIANT, IMPERIUM, ADEPTA SORORITAS, ABJUROR'
);

card('INSIDIANT CENSOR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '3+', WOUNDS: '9' },
  [
    { name: 'Virge of admonition', atk: '4', hit: '4+', dmg: '5/5', wr: 'Brutal, Shock, Anti-PSYKER*' },
  ],
  [
    { name: 'Virge of Admonition Icon Bearer', description: 'Whenever determining control of a marker, treat this operative\'s APL stat as 1 higher. Note this isn\'t a change to its APL stat, so any changes are cumulative with this.' },
    { name: 'Null Field', description: 'This operative starts the battle with a null Range of 1". Whenever an enemy operative is within null Range of this operative, subtract 2" from the Move stat of that enemy operative and worsen the Hit stat of its weapons by 1 (this isn\'t cumulative with being injured).' },
    { name: 'NULLIFYING RITUAL (1AP)', description: 'Add 1 to this operative\'s null Range (to a maximum of 5"). Nullification tokens in the marker/token guide are numbered, so use the numbered token equal to this operative\'s null Range. This operative cannot perform this action while within control Range of an enemy operative, or more than once per turning point.' },
  ],
  'CELESTIAN INSIDIANT, IMPERIUM, ADEPTA SORORITAS, CENSOR'
);

card('INSIDIANT CREMATOR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '3+', WOUNDS: '9' },
  [
    { name: 'Hand flamer – Standard', atk: '4', hit: '2+', dmg: '3/3', wr: 'Range 6", Saturate, Torrent 1"' },
    { name: 'Hand flamer – Deluge',   atk: '4', hit: '2+', dmg: '3/3', wr: 'Range 4", Saturate, Seek Light, Torrent 0"*' },
    { name: 'Null mace',              atk: '4', hit: '3+', dmg: '4/4', wr: 'Shock, Anti-PSYKER*' },
  ],
  [
    { name: 'Inspirational Pyre', description: 'Once per turning point, when this operative inflicts damage on an enemy operative with either profile of its hand flamer but doesn\'t incapacitate it, you can use this rule. If you do, you can select one friendly CELESTIAN INSIDIANT operative within 6" of this operative to become INSPIRING.' },
    { name: '*Torrent 0"', description: 'Torrent 0" means you cannot select secondary targets, but this weapon still has the Torrent weapon rule for all other rules purposes, e.g. the Condensed Stronghold rule.' },
  ],
  'CELESTIAN INSIDIANT, IMPERIUM, ADEPTA SORORITAS, CREMATOR'
);

card('INSIDIANT DENUNCIA', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '3+', WOUNDS: '9' },
  [
    { name: 'Voice of condemnation', atk: '5', hit: '3+', dmg: '1/1', wr: 'Range 6", Seek, Stun' },
    { name: 'Staff of declamation',  atk: '4', hit: '3+', dmg: '3/3', wr: 'Shock' },
  ],
  [
    { name: 'Accusing Exorcist', description: 'Whenever this operative is INSPIRING, the Suspect & Eliminate strategy ploy costs you 0CP if the enemy operative or marker you select is visible to or within 6" of this operative.' },
    { name: 'SPEAK OF HER DEEDS (1AP)', description: 'Support. Select an INSPIRING friendly CELESTIAN INSIDIANT operative visible to and within 6" of this operative. That operative is no longer INSPIRING. Then, select another friendly CELESTIAN INSIDIANT operative visible to and within 6" of this operative. Resolve one BENEDICTION from the Martyrdom faction rule on that operative (excluding Exigence). This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'CELESTIAN INSIDIANT, IMPERIUM, ADEPTA SORORITAS, DENUNCIA'
);

card('INSIDIANT MORTISANCTUS', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '3+', WOUNDS: '9' },
  [
    { name: 'Blessed broadsword', atk: '4', hit: '3+', dmg: '4/6', wr: 'Lethal 5+, Brutal' },
  ],
  [
    { name: 'Zealous Ultimatum', description: 'Once per battle STRATEGIC GAMBIT. Select one enemy operative within 8" of this operative and issue an ultimatum to it. Your opponent must accept or decline that ultimatum (if it\'s a non-player operative, roll one D6: on a 4+, the ultimatum is accepted, otherwise it\'s declined). If the ultimatum is accepted, whenever this operative is fighting against or retaliating against that enemy operative, add 1 to the Atk stat of this operative\'s blessed broadsword. The first time this operative incapacitates that enemy operative while fighting or retaliating during the battle, add 1 to the Atk stat of this operative\'s blessed broadsword until the end of the battle. In either case, this is to a maximum of 5. If the ultimatum is declined, whenever that enemy operative is fighting against or retaliating against a friendly CELESTIAN INSIDIANT operative, subtract 1 from the Atk stat of that enemy operative\'s weapons.' },
    { name: 'Bladed Stance', description: 'Whenever this operative is fighting or retaliating, you can resolve one of your successes before the normal order. If you do, that success must be used to block.' },
  ],
  'CELESTIAN INSIDIANT, IMPERIUM, ADEPTA SORORITAS, MORTISANCTUS'
);

card('INSIDIANT RELIQUARIUS', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '3+', WOUNDS: '9' },
  [
    { name: 'Bolt pistol',              atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Condemnor stakethrower',   atk: '4', hit: '3+', dmg: '2/2', wr: 'Devastating 1, Piercing Crits 1, Silent, Anti-PSYKER*' },
    { name: 'Gun butt',                 atk: '3', hit: '3+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Simulacrum Nullificatus Icon Bearer', description: 'Whenever determining control of a marker, treat the total APL stat of enemy operatives that contest it as 1 lower if at least one of those enemy operatives is within 3" of this operative. Note this isn\'t a change to the APL stat, so any changes are cumulative with this.' },
    { name: 'Devotion', description: 'At the end of each of this operative\'s activations, if it\'s INSPIRING and it controls an objective marker or one of your mission markers, one friendly CELESTIAN INSIDIANT operative this operative is visible to and within 6" of becomes INSPIRING.' },
  ],
  'CELESTIAN INSIDIANT, IMPERIUM, ADEPTA SORORITAS, RELIQUARIUS'
);

card('INSIDIANT WARRIOR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '3+', WOUNDS: '9' },
  [
    { name: 'Bolt pistol',            atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Condemnor stakethrower', atk: '4', hit: '3+', dmg: '2/2', wr: 'Devastating 1, Piercing Crits 1, Silent, Anti-PSYKER*' },
    { name: 'Null mace',              atk: '4', hit: '3+', dmg: '4/4', wr: 'Shock, Anti-PSYKER*' },
  ],
  [
    { name: 'Inspired Strikes', description: 'Whenever this operative is INSPIRING, add 1 to the Critical Dmg stat of weapons on its datacard.' },
  ],
  'CELESTIAN INSIDIANTS, IMPERIUM, ADEPTA SORORITAS, WARRIOR'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Celestian Insidiants populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
