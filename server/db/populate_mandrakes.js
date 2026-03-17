import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Mandrakes'").get()?.id;
if (!FACTION_ID) { console.error('Mandrakes faction not found'); process.exit(1); }

// Clear existing Mandrakes data
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
  'Archetypes: RECON, INFILTRATION');

rule('faction_rules', null, 'OPERATIVES', 0,
  `1 MANDRAKE NIGHTFIEND

8 MANDRAKE operatives selected from the following list:
• ABYSSAL
• CHOOSER OF THE FLESH
• DIRGEMAW
• SHADEWEAVER
• WARRIOR

Except operatives WARRIOR, your kill team can only include each operative above once.`);

rule('faction_rules', null, 'WITHIN SHADOW', 0,
  `An operative is WITHIN SHADOW if any of the following are true:
• It\'s within 1" of Heavy terrain that\'s not lower than it.
• Any part of its base is underneath Vantage terrain.
• A Shadow Portal marker is within its control range (see SHADEWEAVER operative).`);

rule('faction_rules', null, 'SHADOW PASSAGE', 0,
  `Once per turning point, one friendly MANDRAKE operative WITHIN SHADOW can use a SHADOW PASSAGE when it performs the Reposition action. If it does, don\'t move it. Instead, remove it from the killzone and set it back up WITHIN SHADOW in a location it can be placed. When you set it back up, it cannot:
• Be within control range of an enemy operative.
• Be a valid target for an enemy operative.
• Perform the Shoot or Fight action until the start of the next turning point.`);

rule('faction_rules', null, 'UMBRAL ENTITIES', 0,
  `Whenever an operative is shooting a friendly MANDRAKE operative, ignore the Piercing weapon rule. Whenever a friendly MANDRAKE operative is WITHIN SHADOW, improve its Save stat by 1.`);

rule('faction_rules', null, 'SOULSTRIKE', 0,
  `Some weapons in this team\'s rules have the Soulstrike weapon rule below:

*Soulstrike: Successful defence dice are determined differently. Each result that\'s equal to or less than the target\'s APL stat is a success and is retained. Each result that\'s higher than the target\'s APL stat is a fail and is discarded. Each result of 1 is always a critical success. Each other success is a normal success. Each result of 6 is always a fail.

Designer\'s Note: Many of this kill team\'s rules refer to an enemy operative\'s APL stat. This would be the APL stat at the time the rule takes effect (i.e., including changes).`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'CREEPING HORROR', 1,
  'After each enemy operative\'s activation, before the next operative is activated, you can perform a free Dash action with one friendly MANDRAKE operative that has a Conceal order if it starts and ends that action WITHIN SHADOW. You cannot use this ploy during the first turning point, and each friendly operative can only be selected for this ploy once per turning point.');

rule('ploy', 'Strategy', 'GLOAMING SHROUD', 1,
  'Whenever an operative is shooting a friendly MANDRAKE operative WITHIN SHADOW, you can retain one of your defence dice as a normal success without rolling it (in addition to a cover save, if any).');

rule('ploy', 'Strategy', 'BLADE IN THE DARK', 1,
  'Each friendly MANDRAKE operative can perform the Charge action while it has a Conceal order if it starts or ends that action WITHIN SHADOW.');

rule('ploy', 'Strategy', 'INESCAPABLE NIGHTMARE', 1,
  'Whenever a friendly MANDRAKE operative is shooting, fighting or retaliating, if it\'s WITHIN SHADOW, you can re-roll one of your attack dice.');

rule('ploy', 'Firefight', 'SLITHER OUT OF SIGHT', 1,
  'Use this firefight ploy at the end of any operative\'s activation. Select one friendly MANDRAKE operative that has an Engage order and is WITHIN SHADOW. Change that operative\'s order to Conceal.');

rule('ploy', 'Firefight', 'SOUL FEAST', 1,
  'Use this firefight ploy when a friendly MANDRAKE operative is shooting against, fighting against, or retaliating against an enemy operative within 6" of it, at the end of the Resolve Attack Dice step. That friendly operative regains a number of lost wounds equal to that enemy operative\'s APL stat, multiplied by the number of your attack dice that inflicted damage during that sequence. Excess attack dice are ignored (i.e. if the enemy operative is incapacitated before remaining attack dice are resolved).');

rule('ploy', 'Firefight', 'NOWHERE TO HIDE', 1,
  'Use this firefight ploy during a friendly MANDRAKE operative\'s activation, when it performs an action in which it moves. Until the end of that activation, that operative can move through parts of terrain features as if they were not there, it cannot move more than its Move stat if it\'s the Charge action and must end those moves in a location it can be placed.');

rule('ploy', 'Firefight', 'SHADOW\'S BITE', 1,
  'Use this firefight ploy when an enemy operative performs the Fight action in an activation in which it\'s performed the Charge action, and selects a friendly MANDRAKE operative WITHIN SHADOW to fight against. In the Resolve Attack Dice step of that sequence, you resolve the first attack dice (i.e. defender instead of attacker).');

// ── TACOPS ───────────────────────────────────────────────────────────────────

rule('tac_op', 'RECON', 'FLANK', 0,
  `Archetype: RECON

REVEAL: As a STRATEGIC GAMBIT.

ADDITIONAL RULES: Divide the killzone into two flanks (left and right) by drawing an imaginary line that\'s just like the centreline, except it runs from the centre of each player\'s killzone edge. An operative contests a flank while both wholly within it and wholly within their opponent\'s territory. Friendly operatives control a flank if the total APL stat of those contesting it is greater than that of enemy operatives.

VICTORY POINTS: After you reveal this op, at the end of each turning point after the first, for each flank friendly operatives control, you score 1VP. In the fourth turning point, if friendly operatives also controlled that flank at the end of the third turning point (excluding the first), you score 2VP instead. You cannot score more than 2VP from this op per turning point.`);

rule('tac_op', 'RECON', 'RETRIEVAL', 0,
  `Archetype: RECON

REVEAL: The first time you score VP from this op.

MISSION ACTION – RETRIEVE (1 APL): If the active operative controls an objective marker that hasn\'t been searched by friendly operatives, that operative is now carrying one of your Retrieval mission markers and that objective marker has been searched by friendly operatives. Friendly operatives can perform the Pick Up Marker action on your Retrieval mission markers.

An operative cannot perform this action during the first turning point, or while within control range of an enemy operative, or if it\'s already carrying a marker.

VICTORY POINTS: The first time each objective marker is searched by friendly operatives, you score 1VP. At the end of the battle, for each of your Retrieval mission markers friendly operatives are carrying, you score 1VP.`);

rule('tac_op', 'RECON', 'SCOUT ENEMY MOVEMENT', 0,
  `Archetype: RECON

REVEAL: The first time a friendly operative performs the Scout action.

MISSION ACTION – SCOUT (1 APL): Select one ready enemy operative visible to and more than 6" from the active operative. That enemy operative is now monitored until the Ready step of the next Strategy phase.

An operative cannot perform this action while it has an Engage order, during the first turning point, or while within control range of an enemy operative.

VICTORY POINTS: At the end of each turning point after the first, for each monitored enemy operative that\'s visible to friendly operatives, you score 1VP. Note that it doesn\'t have to be a friendly operative that performed the Scout action. You cannot score more than 2VP from this op per turning point.`);

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

// ── EQUIPMENT ────────────────────────────────────────────────────────────────

rule('equipment', null, 'SHADOW GLYPH', 0,
  'Once per turning point, when a friendly MANDRAKE operative is activated WITHIN SHADOW, you can use this rule. If you do, until the start of its next activation, while that operative has a Conceal order and is in cover, it cannot be selected as a valid target, taking precedence over all other rules (e.g. Seek, Vantage terrain) except being within 2".');

rule('equipment', null, 'SOUL GEM', 0,
  'Once per turning point, when a friendly MANDRAKE operative is performing the Shoot action and you select a baleblast, you can use this rule. If you do, until the end of that action, that weapon has the Blast 1" weapon rule.');

rule('equipment', null, 'BONE DARTS', 0,
  `Once per turning point, a friendly MANDRAKE operative can use the following ranged weapon:

NAME: Bone Darts | A: 4 | BS: 3+ | D: 2/4
SPECIAL RULES: Range 6", Rending, Silent`);

rule('equipment', null, 'CHAIN SNARE', 0,
  'Whenever an enemy operative would perform the Fall Back action while within control range of a friendly MANDRAKE operative, if no other enemy operatives are within that friendly operative\'s control range, you can use this rule. If you do, roll two D6, or one D6 if that enemy operative has a higher Wounds stat than that friendly operative. If any result is a 4+, that enemy operative cannot perform that action during that activation/counteraction (no AP are spent on it), and you cannot use this rule again during this turning point.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('MANDRAKE NIGHTFIEND', 'Leader',
  { APL: '2', MOVE: '7"', SAVE: '5+', WOUNDS: '9' },
  [
    { name: 'Baleblast',  atk: '4', hit: '3+', dmg: '3/4', wr: 'Soulstrike' },
    { name: 'Huskblade',  atk: '5', hit: '3+', dmg: '4/6', wr: 'Lethal 5+, Shock' },
  ],
  [
    { name: 'Harrowing Whispers', description: 'Whenever your opponent would activate an enemy operative within 6" of this operative, you can roll one D6 (you cannot do so if you already interrupted that operative\'s activation with this rule or the DIRGEMAW operative\'s Haunting Focus additional rule during this turning point): if the result is higher than that enemy operative\'s APL stat, they cannot activate it during this activation. If there are no other enemy operatives eligible to be activated, this rule has no effect.' },
    { name: 'Oubliex', description: 'Whenever this operative is readied, or if this operative incapacitates an enemy operative with its huskblade, its oubliex becomes active. Whenever its oubliex is active and an attack dice would inflict damage on this operative, you can roll one D6: on a 5+, ignore the damage inflicted from that attack dice and its oubliex is no longer active.' },
  ],
  'MANDRAKE, AELDARI, DRUKHARI, LEADER, NIGHTFIEND'
);

card('MANDRAKE ABYSSAL', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '5+', WOUNDS: '8' },
  [
    { name: 'Balesurge – Blast', atk: '5', hit: '3+', dmg: '3/4', wr: 'Blast 2, Soulstrike*' },
    { name: 'Balesurge – Burn',  atk: '5', hit: '3+', dmg: '3/4', wr: 'Lethal 5+, Soulstrike*' },
    { name: 'Glimmersteel Blade', atk: '4', hit: '3+', dmg: '4/5', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Balefire', description: 'Whenever a friendly MANDRAKE operative is shooting an enemy operative that has one of your Balefire tokens, add 1 to both Dmg stats of that friendly operative\'s ranged weapons and they have the Saturate weapon rule. Whenever an operative is shooting a friendly MANDRAKE operative that has one of your Balefire tokens, subtract 1 from both Dmg stats of that operative\'s ranged weapons (to a minimum of 1).' },
    { name: 'WREATHE IN BALEFIRE (1AP)', description: 'Select one operative visible to this operative that doesn\'t have one of your Balefire tokens. Until the start of this operative\'s next activation, until it\'s incapacitated or until it performs this action again (whichever comes first), that selected operative gains one of your Balefire tokens. This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'MANDRAKE, AELDARI, DRUKHARI, ABYSSAL'
);

card('MANDRAKE CHOOSER OF THE FLESH', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '5+', WOUNDS: '8' },
  [
    { name: 'Baleblast',  atk: '4', hit: '3+', dmg: '3/4', wr: 'Soulstrike' },
    { name: 'Baleblade',  atk: '4', hit: '3+', dmg: '5/6', wr: 'Brutal, Lethal 5+' },
  ],
  [
    { name: 'Soul Harvest', description: 'Whenever an enemy operative is incapacitated as a result of this operative\'s Part Collector rule or baleblade, you gain 1 Soul Harvest point, or two if that enemy operative had an APL stat of 3 or more. Whenever a friendly MANDRAKE operative is activated, you can spend 1 of your Soul Harvest points to either add 1 to its APL stat until the end of the battle, or have it regain 2D3 lost wounds. Note you can spend your Soul Harvest points even if this operative is incapacitated.' },
    { name: 'Part Collector', description: 'Whenever an enemy operative performs the Fall Back action while within control Range of this operative, you can use this rule. If you do, inflict 2D3 damage on that enemy operative before it moves.' },
  ],
  'MANDRAKE, AELDARI, DRUKHARI, CHOOSER OF THE FLESH'
);

card('MANDRAKE DIRGEMAW', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '5+', WOUNDS: '8' },
  [
    { name: 'Baleblast',         atk: '4', hit: '3+', dmg: '3/4', wr: 'Soulstrike' },
    { name: 'Horrifying Scream', atk: '5', hit: '2+', dmg: '2/2', wr: 'Range 6", Devastating 2, Seek Light, Stun, Soulstrike' },
    { name: 'Glimmersteel Blade', atk: '4', hit: '3+', dmg: '4/5', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Haunting Focus', description: 'STRATEGIC GAMBIT Select one enemy operative. Until the Ready step of the next Strategy phase, it gains your Haunting Focus token. The next time your opponent would activate an enemy operative that has your Haunting Focus token, if this operative is ready, activate this operative first (you cannot do so if you also rolled to prevent that operative\'s activation with the NIGHTFIEND operative\'s Harrowing Whispers additional rule during this turning point). If you do, during that activation, this operative must fight against or shoot against that enemy operative, and cannot do so against any other enemy operatives until it does (if this isn\'t possible, this operative\'s activation is cancelled). After completing this operative\'s activation, your opponent activates that enemy operative (if possible), or activates a different enemy operative if they can\'t.' },
    { name: 'PAREIDOLIC PROJECTION (1AP)', description: 'Select one enemy operative that\'s a valid target for this operative or is WITHIN SHADOW. Until the start of this operative\'s next activation, until it\'s incapacitated or until it performs this action again (whichever comes first), worsen the Hit stat of that enemy operative\'s weapons by 1 and subtract 2" from its Move stat (these aren\'t cumulative with being injured). This operative cannot perform this action while within control Range of an enemy operative, unless the only enemy operative it\'s within control Range of is selected for this action.' },
  ],
  'MANDRAKE, AELDARI, DRUKHARI, DIRGEMAW'
);

card('MANDRAKE SHADEWEAVER', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '5+', WOUNDS: '8' },
  [
    { name: 'Baleblast',         atk: '4', hit: '3+', dmg: '3/4', wr: 'Soulstrike' },
    { name: 'Glimmersteel Blade', atk: '4', hit: '3+', dmg: '4/5', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Shadow Portal', description: 'Whenever this operative performs the Reposition action using a SHADOW PASSAGE, you can use this rule. If you do, remove your Shadow Portal markers from the killzone (if any), then place one of your Shadow Portal markers within this operative\'s control range before it\'s removed and one within its control range after it\'s set up. Each friendly MANDRAKE operative can use a SHADOW PASSAGE each turning point (taking precedence over one operative once per turning point) if one of your Shadow Portal markers is within that operative\'s control range when it\'s removed, and the other is within its control range after it\'s set up. Note that friendly operatives can do so even if this operative has been incapacitated, and doing so doesn\'t prevent one operative from using a SHADOW PASSAGE in the normal manner.' },
    { name: 'WEAVE DARKNESS (1AP)', description: 'Remove your Weave Darkness marker from the killzone (if any). Then place your Weave Darkness marker visible to this operative, or on Vantage terrain of a terrain feature visible to this operative. That marker creates an area of smoke with the same size and effects of a smoke grenade, except you don\'t remove it during the following turning point. If this operative is incapacitated, remove your Weave Darkness marker from the killzone. This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'MANDRAKE, AELDARI, DRUKHARI, SHADEWEAVER'
);

card('MANDRAKE WARRIOR', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '5+', WOUNDS: '8' },
  [
    { name: 'Baleblast',         atk: '4', hit: '3+', dmg: '3/4', wr: 'Soulstrike' },
    { name: 'Glimmersteel Blade', atk: '4', hit: '3+', dmg: '4/5', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Shadow Warrior', description: 'Whenever this operative is WITHIN SHADOW, add 1 to the Critical Dmg stat of its glimmersteel blade.' },
  ],
  'MANDRAKE, AELDARI, DRUKHARI, WARRIOR'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Mandrakes populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
