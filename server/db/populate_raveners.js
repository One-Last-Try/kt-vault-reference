import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Raveners'").get()?.id;
if (!FACTION_ID) { console.error('Raveners faction not found'); process.exit(1); }

// Clear existing Raveners data
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
  'Archetypes: INFILTRATION, SEEK-DESTROY');

rule('faction_rules', null, 'OPERATIVES', 0,
  `1 RAVENER PRIME operative
4 RAVENER operatives selected from the following list:
• FELLTALON
• TREMORSCYTHE
• VENOMSPITTER
• WARRIOR
• WRECKER

Other than WARRIOR operatives, your kill team can only include each operative above once.`);

rule('faction_rules', null, 'BURROW', 0,
  `When setting up a RAVENER kill team before the battle, your first two operatives must be set up as normal. Each other friendly RAVENER operative thereafter can be set up underground: place it to one side instead of in the killzone.

In the Firefight phase, friendly RAVENER operatives set up underground are activated and can counteract as normal. Whenever a friendly RAVENER operative is underground, it cannot perform any actions other than Burrow. At the end of the battle, each friendly RAVENER operative that\'s underground is incapacitated.

Friendly RAVENER operatives can perform the following unique action:

BURROW — 1AP

If this operative is underground, set it up on your TUNNEL in a location it can be placed (it\'s no longer underground, and it can be set up within control range of enemy operatives). Until the end of the activation/counteraction, subtract 2" from its Move stat.

Alternatively, instead of resolving the above effect, if this operative is in the killzone and on your TUNNEL, remove it from the killzone: it\'s now underground.

An operative cannot perform this action while carrying a marker.`);

rule('faction_rules', null, 'TUNNEL', 0,
  `At the end of the Set Up Operatives step, place your Tunnel marker numbered "0" on the killzone floor, wholly within your drop zone and touching your killzone edge.

As a STRATEGIC GAMBIT in the first four turning points, you can place your next numbered Tunnel marker on the killzone floor wholly within 5" of your preceding Tunnel marker. This means that, as the battle progresses, you can have a series of sequentially numbered Tunnel markers (0, 1, 2, 3 and 4). Once you have placed five Tunnel markers, don\'t place any more (i.e. if your battle lasts more than four turning points).

In a killzone that uses the close quarters rules (e.g. Killzone: Tomb World), your TUNNEL and the distance between your Tunnel markers can be measured through Wall terrain.

Your Tunnel markers and the area between your sequentially numbered markers (i.e. between 0 and 1, and 1 and 2, etc.) create your TUNNEL.

In a killzone that uses the hazardous areas rules (e.g. Killzone: Bheta Decima), for the purposes of the Restricted Movement rule, parts of a Tunnel marker that are touching a hazardous area are treated as a hazardous area.`);

rule('faction_rules', null, 'PREDATORY INSTINCTS', 0,
  `During each friendly RAVENER operative\'s activation, it can perform two Fight actions.

Each friendly RAVENER operative can counteract regardless of its order.

• You can change its order first, or change its order instead of performing an action (for the latter, still treat it as having counteracted this turning point).
• During that counteraction, if it doesn\'t perform a mission action it can perform a free Burrow action.`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'DEATH FROM BELOW', 1,
  `Whenever a friendly RAVENER operative is fighting:
• If it\'s performed the Burrow action during that activation/counteraction, its melee weapons have the Balanced weapon rule.
• If it\'s on your TUNNEL, its melee weapons have the Ceaseless weapon rule.`);

rule('ploy', 'Strategy', 'WHIPCORD EMERGENCE', 1,
  `Whenever an operative is shooting a friendly RAVENER operative:
• If that friendly operative has performed the Burrow action during that turning point, you can re-roll one of your defence dice.
• If that friendly operative is on your TUNNEL, you can re-roll any of your defence dice.`);

rule('ploy', 'Strategy', 'WRITHE OUT OF SIGHT', 1,
  `Select one friendly RAVENER operative in the killzone. That friendly operative can immediately perform a free Burrow action.
• If it\'s within 2" of your TUNNEL, it can immediately perform a free Fall Back or Reposition action before it does so.`);

rule('ploy', 'Strategy', 'TUNNEL LURKERS', 1,
  'Whenever a friendly RAVENER operative is on your TUNNEL it\'s in cover, unless it\'s within 2" of the active operative. Treat this as cover provided by Light terrain (therefore it\'s affected by rules that prevent this, e.g. Seek Light and Vantage terrain).');

rule('ploy', 'Firefight', 'SLITHERING EVASION', 1,
  `Use this firefight ploy during a friendly RAVENER operative\'s activation or counteraction, before or after it performs an action. During that activation/counteraction, that operative can:
• Perform the Fall Back action for 1 less AP.
• Perform the Charge action while within control range of an enemy operative, and can leave that operative\'s control range to do so (but then normal requirements for that move apply).`);

rule('ploy', 'Firefight', 'SUBTERRANEAN HORROR', 1,
  'Use this firefight ploy when an enemy operative is performing the Fight action and selects a friendly RAVENER operative on your TUNNEL to fight against. In the Resolve Attack Dice step of that sequence, you resolve the first attack dice (i.e. defender instead of attacker).');

rule('ploy', 'Firefight', 'BURROWING STRIKE', 1,
  'Use this firefight ploy when a friendly RAVENER operative performs the Burrow action. Before that operative is removed from the killzone, or after setting it up on your TUNNEL, inflict D3+1 damage on each enemy operative within its control range. You cannot use this ploy in the Strategy phase, or during a FELLTALON operative\'s activation or counteraction if it performs the Toxic Lunge action (and vice versa).');

rule('ploy', 'Firefight', 'FRENZY OF DEATH', 1,
  'Use this firefight ploy when a friendly RAVENER operative is incapacitated. Before that operative is removed from the killzone, inflict D3 damage to each enemy operative in its control range. If that operative is a VENOMSPITTER and has the effects of its Distended Sacs action, inflict 2D3 damage instead.');

// ── TACOPS ───────────────────────────────────────────────────────────────────

rule('tac_op', 'INFILTRATION', 'TRACK ENEMY', 0,
  `Archetype: INFILTRATION

REVEAL: The first time you score VP from this op.

ADDITIONAL RULES: An enemy operative is being tracked if it\'s a valid target for a friendly operative within 6" of it. That friendly operative must have a Conceal order, cannot be a valid target for the enemy operative it\'s attempting to track, and cannot be within control range of enemy operatives.

VICTORY POINTS: At the end of each turning point after the first:
• If one enemy operative is being tracked, you score 1VP, or 2VP instead if it\'s the fourth turning point.
• If two or more enemy operatives are being tracked, you score 2VP.

You cannot score more than 2VP from this op per turning point.`);

rule('tac_op', 'INFILTRATION', 'PLANT DEVICES', 0,
  `Archetype: INFILTRATION

REVEAL: The first time a friendly operative performs the Plant Device action.

MISSION ACTION – PLANT DEVICE (1 APL): One objective marker the active operative controls gains one of your Device tokens.

An operative cannot perform this action during the first turning point, while within control range of an enemy operative, or if that objective marker already has one of your Device tokens.

VICTORY POINTS: At the end of each turning point after the first:
• If your opponent\'s objective marker has one of your Device tokens, you score 1VP.
• For each other objective marker enemy operatives contest that has one of your Device tokens, you score 1VP.

You cannot score more than 2VP from this op per turning point.`);

rule('tac_op', 'INFILTRATION', 'STEAL INTELLIGENCE', 0,
  `Archetype: INFILTRATION

REVEAL: The first time an enemy operative is incapacitated.

ADDITIONAL RULES: Whenever an enemy operative is incapacitated, before it\'s removed from the killzone, place one of your Intelligence mission markers within its control range.

Friendly operatives can perform the Pick Up Marker action on your Intelligence mission markers, and for the purposes of that action\'s conditions, ignore the first Intelligence mission marker the active operative is carrying. In other words, each friendly operative can carry up to two Intelligence mission markers, or one and one other marker.

VICTORY POINTS: At the end of each turning point after the first, if any friendly operatives are carrying any of your Intelligence mission markers, you score 1VP.

At the end of the battle, for each of your Intelligence mission markers friendly operatives are carrying, you score 1VP.`);

rule('tac_op', 'SEEK-DESTROY', 'SWEEP & CLEAR', 0,
  `Archetype: SEEK-DESTROY

REVEAL: The first time an enemy operative is incapacitated while contesting an objective marker, or the first time a friendly operative performs the Clear action (whichever comes first).

ADDITIONAL RULES: When an enemy operative that contests an objective marker is incapacitated, that objective marker gains one of your Swept tokens (if it doesn\'t already have one) until the Ready step of the next Strategy phase.

MISSION ACTION – CLEAR (1 APL): An objective marker the active operative controls is cleared for the turning point. An operative cannot perform this action during the first turning point, or while within control range of an enemy operative.

VICTORY POINTS: At the end of each turning point after the first, if friendly operatives control any objective markers that have one of your Swept tokens, you score 1VP. If this is true and any of those objective markers are also cleared, you score 2VP instead. You cannot score more than 2VP from this op per turning point.`);

rule('tac_op', 'SEEK-DESTROY', 'DOMINATE', 0,
  `Archetype: SEEK-DESTROY

REVEAL: The first time an enemy operative is incapacitated by a friendly operative.

ADDITIONAL RULES: Each time a friendly operative incapacitates an enemy operative, that friendly operative gains one of your Dominate tokens.

VICTORY POINTS: At the end of the third and fourth turning point, you can remove Dominate tokens from friendly operatives that aren\'t incapacitated. For each you remove, you score 1VP. You cannot score more than 3VP from this op per turning point.`);

rule('tac_op', 'SEEK-DESTROY', 'ROUT', 0,
  `Archetype: SEEK-DESTROY

REVEAL: The first time you score VP from this op.

VICTORY POINTS: Whenever a friendly operative incapacitates an enemy operative, if that friendly operative is within 6" of your opponent\'s drop zone, you score 1VP; if this is true and that enemy operative had a Wounds stat of 12 or more, you score 2VP instead. You cannot score more than 2VP from this op per turning point.`);

// ── EQUIPMENT ────────────────────────────────────────────────────────────────

rule('equipment', null, 'CHROMATOSPORE CAMOUFLAGE', 0,
  'Whenever an operative is shooting a friendly RAVENER operative, if you can retain any cover saves, you can retain one additional cover save. This isn\'t cumulative with improved cover saves from Vantage terrain.');

rule('equipment', null, 'METAMORPHIC FLESH', 0,
  'Whenever a friendly RAVENER operative is activated, it regains D3 lost wounds.');

rule('equipment', null, 'ACID BLOOD', 0,
  'Whenever a friendly RAVENER operative is fighting or retaliating, whenever an attack dice inflicts damage on it, roll one D6: on a 5+, inflict 1 damage on the enemy operative in that sequence.');

rule('equipment', null, 'HEIGHTENED SENSES', 0,
  'Once per battle, when rolling off to decide initiative, if a friendly RAVENER operative is underground and an enemy operative is within 5" of your TUNNEL, you can re-roll your dice.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('RAVENER PRIME', 'Leader',
  { APL: '3', MOVE: '7"', SAVE: '5+', WOUNDS: '21' },
  [
    { name: 'Tail blade',                      atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 3", Rending, Silent' },
    { name: 'Scything talons and rending claws', atk: '5', hit: '3+', dmg: '4/5', wr: 'Rending' },
  ],
  [
    { name: 'Neuropredatory Crest', description: 'Whenever determining control of a marker, treat the total APL stat of enemy operatives that contest it as 1 lower if at least one of those enemy operatives is within 3" of this operative. Note this isn\'t a change to the APL stat, so any changes are cumulative with this. Whenever an enemy operative is within 3" of this operative:\n• Your opponent must spend 1 additional AP for that enemy operative to perform the Pick Up Marker and mission actions.\n• Your opponent cannot re-roll their attack or defence dice for that operative.' },
    { name: 'Synaptic Link', description: 'STRATEGIC GAMBIT if this operative isn\'t incapacitated. Roll one D6 and compare the result to the number of the current turning point; if the result is:\n• Twice as high or higher, you gain 1CP.\n• Less, inflict damage on this operative equal to the result.\n• Any other result, nothing happens.' },
  ],
  'RAVENER, GREAT DEVOURER, TYRANID, LEADER, PRIME'
);

card('RAVENER FELLTALON', 'Warrior',
  { APL: '3', MOVE: '7"', SAVE: '5+', WOUNDS: '20' },
  [
    { name: 'Pincer tail',  atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 3", Silent' },
    { name: 'Toxic glands', atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 6", Silent, Poison*' },
    { name: 'Toxic scythes', atk: '5', hit: '3+', dmg: '4/5', wr: 'Shock, Lethal 5+, Poison*' },
  ],
  [
    { name: '*Poison', description: 'In the Resolve Attack Dice step, if you inflict damage with any critical successes, the operative this weapon is being used against gains one of your Poison tokens (if it doesn\'t already have one). Whenever an operative that has one of your Poison tokens is activated, inflict D3 damage on it.' },
    { name: 'TOXIC LUNGE (1AP)', description: 'Select one enemy operative within 2" of this operative. Alternatively, if this operative is underground, select one enemy operative on your TUNNEL. Inflict D3+2 damage on that enemy operative and it gains one of your Poison tokens (if it doesn\'t already have one).\n\nThis operative can perform this action while underground (this takes precedence over the normal Burrow rules).' },
  ],
  'RAVENER, GREAT DEVOURER, TYRANID, FELLTALON'
);

card('RAVENER TREMORSCYTHE', 'Warrior',
  { APL: '3', MOVE: '7"', SAVE: '5+', WOUNDS: '20' },
  [
    { name: 'Pincer tail',               atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 3", Silent' },
    { name: 'Scything talons and rending', atk: '5', hit: '3+', dmg: '4/5', wr: 'Rending' },
  ],
  [
    { name: 'Subterranean Ambush', description: 'Once per turning point in the Firefight phase, after an enemy operative performs an action in which it moves more than 2" and ends within 2" of your TUNNEL, if this operative is underground and is either ready or hasn\'t counteracted during this turning point, you can interrupt to use this rule. If you do, activate or counteract with this operative (as appropriate), but during its activation/counteraction it must fight against or shoot against that enemy operative, and cannot do so against any other enemy operatives until it does (if this isn\'t possible, this operative\'s activation/counteraction is cancelled and this rule hasn\'t been used). After completing this operative\'s activation/counteraction, continue that enemy operative\'s activation/counteraction (if possible and relevant).' },
    { name: 'Hypersensory Hunter', description: 'This operative can perform the Charge action while it has a Conceal order if it performed the Burrow action during the same activation/counteraction.' },
  ],
  'RAVENER, GREAT DEVOURER, TYRANID, TREMORSCYTHE'
);

card('RAVENER VENOMSPITTER', 'Warrior',
  { APL: '3', MOVE: '7"', SAVE: '5+', WOUNDS: '20' },
  [
    { name: 'Pincer tail',         atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 3", Silent' },
    { name: 'Venom bolt – Blast',   atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 8", Blast 2", Poison*' },
    { name: 'Venom bolt – Focused', atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 8", Piercing 1, Poison*' },
    { name: 'Scything talons',      atk: '5', hit: '3+', dmg: '4/5', wr: '-' },
  ],
  [
    { name: '*Poison', description: 'In the Resolve Attack Dice step, if you inflict damage with any critical successes, the operative this weapon is being used against gains one of your Poison tokens (if it doesn\'t already have one). Whenever an operative that has one of your Poison tokens is activated, inflict D3 damage on it.' },
    { name: 'DISTEND DORSAL SAC (1AP)', description: 'Until this operative has shot with its venom bolt or until it performs the Burrow action (whichever comes first), all profiles of its venom bolt have the Lethal 5+ weapon rule, have 1 added to their Atk stat and the Range 8" weapon rule is removed.' },
  ],
  'RAVENER, GREAT DEVOURER, TYRANID, VENOMSPITTER'
);

card('RAVENER WRECKER', 'Warrior',
  { APL: '3', MOVE: '7"', SAVE: '4+', WOUNDS: '20' },
  [
    { name: 'Bone mace',                        atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 3", Piercing 1, Silent' },
    { name: 'Scything talons and crushing claws', atk: '5', hit: '3+', dmg: '4/5', wr: 'Crush*' },
  ],
  [
    { name: 'Reinforced Carapace', description: 'Normal and Critical Dmg of 4 or more inflicts 1 less damage on this operative.' },
    { name: '*Crush', description: 'Whenever you strike, you and your opponent roll-off, adding 1 to your result if the operative this weapon is being used against has a Wounds stat of 9 or less. If you win, inflict additional damage on that operative equal to the difference between the dice results (to a maximum of 3 additional damage).' },
  ],
  'RAVENER, GREAT DEVOURER, TYRANID, WRECKER'
);

card('RAVENER WARRIOR', 'Warrior',
  { APL: '3', MOVE: '7"', SAVE: '5+', WOUNDS: '20' },
  [
    { name: 'Pincer tail',   atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 3", Silent' },
    { name: 'Scything talons', atk: '5', hit: '3+', dmg: '4/5', wr: '-' },
  ],
  [
    { name: 'Instinctive Behaviour', description: 'Whenever this operative is shooting against, fighting against or retaliating against a wounded enemy operative, or an enemy operative that performed the Fall Back action during this turning point, this operative\'s weapons have the Lethal 5+ weapon rule.' },
  ],
  'RAVENER, GREAT DEVOURER, TYRANID, WARRIOR'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Raveners populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
