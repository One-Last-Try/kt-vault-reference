import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Farstalker Kinband'").get()?.id;
if (!FACTION_ID) { console.error('Farstalker Kinband faction not found'); process.exit(1); }

// Clear existing Farstalker Kinband data
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
  `1 FARSTALKER KINBAND KILL-BROKER operative with one of the following options:
• Kroot rifle; ritual blade
• Pulse weapon; ritual blade

11 FARSTALKER KINBAND operatives selected from the following list:
• BOW-HUNTER
• COLD-BLOOD
• CUT-SKIN
• HOUND
• LONG-SIGHT
• PISTOLIER
• STALKER
• TRACKER
• HEAVY GUNNER with one of the following options:
  - Dvorgite skinner; blade
  - Londaxi tribelast; blade
• WARRIOR with one of the following options:
  - Kroot rifle; blade
  - Kroot scattergun; blade

Other than HOUND and WARRIOR operatives, your kill team can only include each operative on this list once. Your kill team can only include up to two HOUND operatives.`);

rule('faction_rules', null, 'FARSTALKER', 0,
  `In the Ready step of each Strategy phase, you can change the order of up to three friendly FARSTALKER KINBAND operatives that are not within control range of enemy operatives.

Whenever it\'s your turn to counteract, you can change the order of one friendly FARSTALKER KINBAND operative that\'s not within control range of enemy operatives instead. This still counts as you counteracting (so activation alternates back to your opponent afterwards), but doesn\'t count as that friendly operative\'s counteraction for this turning point.`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'PREY', 1,
  `Whenever a friendly FARSTALKER KINBAND operative is shooting during an activation in which it hasn\'t performed the Charge, Fall Back, or Reposition action, its ranged weapons have the Balanced and Severe weapon rules; if the weapon already has the Balanced weapon rule, it has the Ceaseless and Severe weapon rules instead. Note that operative isn\'t restricted from performing those actions after shooting.`);

rule('ploy', 'Strategy', 'CUT-THROATS', 1,
  `Add 1 to the Atk stat of friendly FARSTALKER KINBAND operatives\' melee weapons (to a maximum of 5).`);

rule('ploy', 'Strategy', 'ROGUE', 1,
  `Whenever an operative is shooting a friendly FARSTALKER KINBAND operative:
• Ignore the Saturate weapon rule.
• If you can retain any cover saves, you can retain one additional cover save, or you can retain one cover save as a critical success instead. This isn\'t cumulative with improved cover saves from Vantage terrain.`);

rule('ploy', 'Strategy', 'BOUND', 1,
  `During each friendly FARSTALKER KINBAND operative\'s activation, you can ignore the first vertical distance of 2" they move during one climb up.`);

rule('ploy', 'Firefight', 'SAVAGE AMBUSH', 1,
  `Use this firefight ploy during the Fight action when a ready friendly FARSTALKER KINBAND operative that has Light or Heavy terrain within its control range is selected to fight against. In the Resolve Attack Dice step of that sequence, you resolve the first attack dice (i.e. defender instead of attacker).`);

rule('ploy', 'Firefight', 'SLIP AWAY', 1,
  `Use this firefight ploy during a friendly FARSTALKER KINBAND operative\'s activation, before or after it performs an action. During that activation, that operative can perform the Fall Back action for 1 less AP.`);

rule('ploy', 'Firefight', 'POACH', 1,
  `Use this firefight ploy during a friendly FARSTALKER KINBAND operative\'s activation. Until the end of that activation, that operative doesn\'t have to control a marker to perform the Pick Up Marker or mission actions that usually require this (taking precedence over that action\'s conditions – it only needs to contest the marker).`);

rule('ploy', 'Firefight', 'VENGANCE FOR THE KINBAND', 1,
  `Use this firefight ploy when a friendly FARSTALKER KINBAND operative is incapacitated by an enemy operative. Until the end of the battle, whenever another friendly FARSTALKER KINBAND operative is shooting against, fighting against or retaliating against that enemy operative, that other friendly operative\'s weapons have the Relentless weapon rule. You cannot use this ploy again during the battle until that enemy operative is incapacitated.`);

// ── TACOPS ───────────────────────────────────────────────────────────────────

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

rule('tac_op', 'INFILTRATION', 'TRACK ENEMY', 0,
  `Archetype: INFILTRATION

REVEAL: The first time you score VP from this op.

ADDITIONAL RULES: An enemy operative is being tracked if it's a valid target for a friendly operative within 6" of it. That friendly operative must have a Conceal order, cannot be a valid target for the enemy operative it's attempting to track, and cannot be within control range of enemy operatives.

VICTORY POINTS: At the end of each turning point after the first:
• If one enemy operative is being tracked, you score 1VP, or 2VP instead if it's the fourth turning point.
• If two or more enemy operatives are being tracked, you score 2VP.

You cannot score more than 2VP from this op per turning point.`);

rule('tac_op', 'INFILTRATION', 'PLANT DEVICES', 0,
  `Archetype: INFILTRATION

REVEAL: The first time a friendly operative performs the Plant Device action.

MISSION ACTION – PLANT DEVICE (1 APL): One objective marker the active operative controls gains one of your Device tokens.

An operative cannot perform this action during the first turning point, while within control range of an enemy operative, or if that objective marker already has one of your Device tokens.

VICTORY POINTS: At the end of each turning point after the first:
• If your opponent's objective marker has one of your Device tokens, you score 1VP.
• For each other objective marker enemy operatives contest that has one of your Device tokens, you score 1VP.

You cannot score more than 2VP from this op per turning point.`);

rule('tac_op', 'INFILTRATION', 'STEAL INTELLIGENCE', 0,
  `Archetype: INFILTRATION

REVEAL: The first time an enemy operative is incapacitated.

ADDITIONAL RULES: Whenever an enemy operative is incapacitated, before it's removed from the killzone, place one of your Intelligence mission markers within its control range.

Friendly operatives can perform the Pick Up Marker action on your Intelligence mission markers, and for the purposes of that action's conditions, ignore the first Intelligence mission marker the active operative is carrying. In other words, each friendly operative can carry up to two Intelligence mission markers, or one and one other marker.

VICTORY POINTS: At the end of each turning point after the first, if any friendly operatives are carrying any of your Intelligence mission markers, you score 1VP.

At the end of the battle, for each of your Intelligence mission markers friendly operatives are carrying, you score 1VP.`);

// ── EQUIPMENT ────────────────────────────────────────────────────────────────

rule('equipment', null, 'PIERCING SHOT', 0,
  'Once per turning point, when a friendly FARSTALKER KINBAND operative is performing the Shoot action and you select a Kroot rifle, Kroot scattergun or dual Kroot pistols (focused), you can use this rule. If you do, until the end of that action, that weapon has the Piercing 1 weapon rule. You cannot use the Piercing Shot and Toxin Shot rule during the same action.');

rule('equipment', null, 'TOXIN SHOT', 0,
  'Once per turning point, when a friendly FARSTALKER KINBAND operative is performing the Shoot action and you select a Kroot rifle, Kroot scattergun or dual Kroot pistols (focused), you can use this rule. If you do, until the end of that action, that weapon has the Lethal 5+ and Stun weapon rules. You cannot use the Piercing Shot and Toxin Shot rule during the same action.');

rule('equipment', null, 'MEAT', 0,
  'Once per turning point, when a friendly FARSTALKER KINBAND operative (excluding HOUND) is activated, if it\'s not within control range of enemy operatives, you can use this rule. If you do, that friendly operative regains D3+1 lost wounds.');

rule('equipment', null, 'TROPHY', 0,
  'Once per battle, during a friendly FARSTALKER KINBAND operative\'s activation (excluding HOUND), before or after it performs an action, if it\'s not within control range of enemy operatives, you can use this rule. If you do, add 1 to that friendly operative\'s APL stat until the end of its activation.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('KROOT KILL-BROKER', 'Leader',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '9' },
  [
    { name: 'Kroot rifle',  atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Pulse weapon', atk: '4', hit: '4+', dmg: '4/5', wr: '–' },
    { name: 'Blade',        atk: '4', hit: '3+', dmg: '4/5', wr: '–' },
  ],
  [
    { name: 'Victory Shriek', description: 'Whenever your mark is incapacitated, you can select one friendly FARSTALKER KINBAND operative within 6" of this operative. Until the end of the battle, that operative\'s weapons have the Balanced weapon rule. Each friendly operative can only be selected for this rule once per battle.' },
    { name: 'Call The Kill: STRATEGIC GAMBIT (if this operative is in the killzone)', description: 'Select one enemy operative to be your mark for the turning point. Whenever a friendly FARSTALKER KINBAND operative is shooting against, fighting against or retaliating against your mark, that friendly operative\'s weapons have the Balanced weapon rule. Whenever your mark is incapacitated, you can select a new enemy operative to be your mark for the turning point (and can continue to do so during this turning point).' },
  ],
  'FARSTALKER KINBAND, T\'AU EMPIRE, LEADER, KROOT, KILL-BROKER'
);

card('KROOT BOW-HUNTER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '8' },
  [
    { name: 'Accelerator bow – Fused arrow',   atk: '4', hit: '3+', dmg: '4/5', wr: 'Piercing 1' },
    { name: 'Accelerator bow – Glide arrow',   atk: '4', hit: '3+', dmg: '3/4', wr: 'Silent' },
    { name: 'Accelerator bow – Voltaic arrow', atk: '4', hit: '3+', dmg: '3/5', wr: 'Blast 1' },
    { name: 'Blade',                           atk: '3', hit: '3+', dmg: '3/5', wr: '–' },
  ],
  [
    { name: 'ENERGISE (1AP)', description: 'Until the end of the turning point or until this operative has shot with its accelerator bow (whichever comes first), all profiles of its accelerator bow have the Lethal 5+ weapon rule.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'FARSTALKER KINBAND, T\'AU EMPIRE, KROOT, BOW-HUNTER'
);

card('KROOT COLD-BLOOD', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '9' },
  [
    { name: 'Kroot rifle', atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Blade',       atk: '3', hit: '3+', dmg: '3/5', wr: '–' },
  ],
  [
    { name: 'Hardy', description: 'Whenever an attack dice would inflict Critical Dmg on this operative, you can choose for that attack dice to inflict Normal Dmg instead.' },
    { name: 'Cold-blooded', description: 'Whenever this operative is shooting against, fighting against or retaliating against a wounded enemy operative, this operative\'s weapons have the Lethal 5+ weapon rule; if that enemy operative is also injured, this operative\'s weapons also have the Rending weapon rule.' },
  ],
  'FARSTALKER KINBAND, KROOT, COLD-BLOOD'
);

card('KROOT CUT-SKIN', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '8' },
  [
    { name: 'Cut-skin\'s blades', atk: '4', hit: '3+', dmg: '3/5', wr: 'Ceaseless, Lethal 5+' },
  ],
  [
    { name: 'Vicious Duellist', description: 'Whenever this operative is fighting or retaliating, for each attack dice your opponent discards as a fail, inflict 1 damage on the enemy operative in that sequence.' },
    { name: 'Savage Assault', description: 'The first time this operative performs the Fight action during each of its activations, if neither it nor the enemy operative in that sequence is incapacitated, this operative can immediately perform a free Fight action afterwards, but it can only fight against that enemy operative (and only if it\'s still valid to fight against). This takes precedence over action restrictions.' },
  ],
  'FARSTALKER KINBAND, T\'AU EMPIRE, KROOT, CUT-SKIN'
);

card('KROOT HEAVY GUNNER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '8' },
  [
    { name: 'Dvorgite skinner',   atk: '5', hit: '2+', dmg: '3/3', wr: 'Range 6", Heavy (Reposition only), Piercing 2, Torrent 2"' },
    { name: 'Londaxi tribelast',  atk: '5', hit: '4+', dmg: '4/5', wr: 'Heavy (Reposition only), Piercing 1, Rending' },
    { name: 'Blade',              atk: '3', hit: '3+', dmg: '3/5', wr: '–' },
  ],
  [],
  'FARSTALKER KINBAND, T\'AU EMPIRE, KROOT, HEAVY GUNNER'
);

card('KROOT HOUND', 'Warrior',
  { APL: '2', MOVE: '8"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Ripping fangs', atk: '4', hit: '3+', dmg: '3/4', wr: 'Rending' },
  ],
  [
    { name: 'Beast', description: 'This operative cannot perform any actions other than Charge, Dash, Fall Back, Fight, Gather, Guard, Reposition, Pick Up Marker and Place Marker. It cannot use any weapons that aren\'t on its datacard.' },
    { name: 'Bad-tempered', description: 'Whenever an enemy operative performs the Fight action, if this operative is a valid operative to fight against, you can force them to select this operative to fight against instead. Whenever an enemy operative ends the Charge action within control Range of another friendly FARSTALKER KINBAND operative within 3" of this operative, if this operative isn\'t within control Range of enemy operatives, this operative can immediately perform a free Charge action (you can change its order to Engage to do so), but must end that move within control Range of that enemy operative.' },
    { name: 'GATHER (1AP)', description: 'Perform a free Dash or Reposition action with this operative. During that move, you can perform a free Pick Up Marker or Place Marker action with this operative (you can determine control during that action to do so), and any remaining move distance it had from the Dash or Reposition action can be used after it does so.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'FARSTALKER KINBAND, T\'AU EMPIRE, KROOT, HOUND'
);

card('KROOT LONG-SIGHT', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '8' },
  [
    { name: 'Kroot hunting rifle – Concealed',  atk: '4', hit: '2+', dmg: '3/3', wr: 'Devastating 3, Heavy, Silent, Concealed Position*' },
    { name: 'Kroot hunting rifle – Mobile',     atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Kroot hunting rifle – Stationary', atk: '4', hit: '2+', dmg: '3/3', wr: 'Devastating 3, Heavy' },
    { name: 'Blade',                            atk: '3', hit: '3+', dmg: '3/5', wr: '–' },
  ],
  [
    { name: 'Concealed Position*', description: 'This operative can only use this weapon the first time it\'s performing the Shoot action during the battle.' },
    { name: 'LONG-SIGHT (1AP)', description: 'Until the start of this operative\'s next activation:\n• The concealed and stationary profiles of its Kroot hunting rifle have the Lethal 5+ weapon rule.\n• Whenever it\'s shooting with its Kroot hunting rifle, enemy operatives cannot be obscured.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'FARSTALKER KINBAND, T\'AU EMPIRE, KROOT, LONG-SIGHT'
);

card('KROOT PISTOLIER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '8' },
  [
    { name: 'Dual Kroot pistols – Focused', atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 8", Ceaseless, Lethal 5+' },
    { name: 'Dual Kroot pistols – Salvo',   atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 8", Salvo*' },
    { name: 'Blade',                        atk: '3', hit: '3+', dmg: '3/5', wr: '–' },
  ],
  [
    { name: 'Quick Draw', description: 'Once per turning point, when an enemy operative is performing the Shoot action and this operative is selected as the valid target (or if it will be a secondary target from the Blast weapon rule), if this operative is ready, you can interrupt that action to use this rule. If you do, this operative can immediately perform a free Shoot action with its dual Kroot pistols (focused) against that enemy operative (you can change its order to Engage to do so), but that enemy operative must be a valid target.' },
    { name: 'Salvo*', description: 'Select up to two different valid targets that aren\'t within control Range of friendly operatives. Shoot with this weapon against both of them in an order of your choice (roll each sequence separately).' },
  ],
  'FARSTALKER KINBAND, T\'AU EMPIRE, KROOT, PISTOLIER'
);

card('KROOT STALKER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '8' },
  [
    { name: 'Kroot scattergun', atk: '4', hit: '3+', dmg: '3/3', wr: 'Range 6"' },
    { name: 'Stalker\'s blade', atk: '4', hit: '3+', dmg: '3/5', wr: 'Balanced, Rending' },
  ],
  [
    { name: 'Stalker', description: 'This operative can perform a Charge action if it has a Conceal order.' },
    { name: 'STEALTH ATTACK (2AP)', description: 'Perform a free Charge action with this operative, but don\'t exceed its Move stat (i.e. don\'t add 2"). Then immediately perform a free Fight action with this operative. The first time you strike during that action, you can immediately resolve another of your successes as a strike (before your opponent).\n\nThis operative cannot perform this action while it has an Engage order, while within control Range of an enemy operative, or if it isn\'t within 1" of Light or Heavy terrain.' },
  ],
  'FARSTALKER KINBAND, T\'AU EMPIRE, KROOT, STALKER'
);

card('KROOT TRACKER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '8' },
  [
    { name: 'Kroot rifle', atk: '4', hit: '4+', dmg: '3/4', wr: '–' },
    { name: 'Blade',       atk: '3', hit: '3+', dmg: '3/5', wr: '–' },
  ],
  [
    { name: 'MARKED FOR THE HUNT (1AP)', description: 'Remove your Pech\'ra marker from the killzone (if any). Then place your Pech\'ra marker visible to this operative, or on Vantage terrain of a terrain feature that\'s visible to this operative. Whenever a friendly FARSTALKER KINBAND operative is shooting an enemy operative that has that marker within its control range, that friendly operative\'s ranged weapons have the Seek Light weapon rule.\n\nAt the start of this operative\'s next activation or if it\'s removed from the killzone (whichever comes first), remove your Pech\'ra marker from the killzone.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
    { name: 'FROM THE EYE ABOVE (1AP)', description: 'SUPPORT. Select one other friendly FARSTALKER KINBAND operative visible to and within 6" of this operative. Until the end of that operative\'s next activation, add 1 to its APL stat.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'FARSTALKER KINBAND, T\'AU EMPIRE, KROOT, TRACKER'
);

card('KROOT WARRIOR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '8' },
  [
    { name: 'Kroot rifle',      atk: '4', hit: '4+', dmg: '3/4', wr: '–' },
    { name: 'Kroot scattergun', atk: '4', hit: '3+', dmg: '3/3', wr: 'Range 6"' },
    { name: 'Blade',            atk: '3', hit: '3+', dmg: '3/5', wr: '–' },
  ],
  [
    { name: 'Ready for Anything', description: 'Once per turning point, during a friendly WARRIOR operative\'s activation, you can use the Meat, Piercing Shot or Toxin Shot rule (see faction equipment) for that operative. Doing so doesn\'t count for its once per turning point limit.' },
  ],
  'FARSTALKER KINBAND, T\'AU EMPIRE, KROOT, WARRIOR'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Farstalker Kinband populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
