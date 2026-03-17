import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Scout Squad'").get()?.id;
if (!FACTION_ID) { console.error('Scout Squad faction not found'); process.exit(1); }

// Clear existing Scout Squad data
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
  'Archetypes: INFILTRATION, RECON');

rule('faction_rules', null, 'OPERATIVES', 0,
  `1 SCOUT SERGEANT operative with one of the following options:
• Astartes Shotgun; Fists
• Bolter; Fists
• Bolt pistol; Chainsword

8 SCOUT SQUAD operatives selected from the following list:
• SCOUT HEAVY GUNNER with Fists, a Bolt pistol and a Heavy bolter
• SCOUT HEAVY GUNNER with Fists, a Bolt pistol and a Missile launcher
• SCOUT HUNTER
• SCOUT SNIPER
• SCOUT TRACKER
• SCOUT WARRIOR with one of the following options:
  - Astartes Shotgun; Fists
  - Boltgun; Fists
  - Bolt pistol; Combat blade

Other than WARRIOR operatives, your kill team can include each operative on this list once.`);

rule('faction_rules', null, 'FORWARD SCOUTING', 0,
  `At the end of the Set Up Operatives step, you can select and resolve up to six Forward Scouting options. Each option has a number in brackets, which is the maximum number of times you can select and resolve it for the battle. For example, your six selections could be Reposition x2, Trip Alarm, Booby Trap, Tactical Manoeuvre and Diversion. If both players have this ability, alternate resolving, starting with the Defender.

REDEPLOY [1]
Change the set up of one third of your operatives (rounding up).

REPOSITION [2]
Perform a free Reposition action with one friendly operative that\'s wholly within your drop zone. It must end that move wholly within 3" of your drop zone.

TRIP ALARM [2]
Place one of your Trip Alarm markers more than 6" from your opponent\'s drop zone. During the first and second turning point, whenever a friendly SCOUT SQUAD operative is shooting an enemy operative that\'s within 2" of that marker, its ranged weapons have the Seek weapon rule. In the Ready step of the third Strategy phase, remove that marker.

BOOBY TRAP [1]
Place one of your Booby Trap markers more than 6" from your opponent\'s drop zone and more than 2" from other markers, access points and accesible terrain. The first time your Booby Trap marker is within an enemy operative\'s control range, remove that marker and inflict 2D3 damage on that operative; if it isn\'t incapacitated, end its action (if any), even if that action\'s effects aren\'t fulfilled. If it cannot be placed, move it the minimum amount to do so.

DIVERSION [1]
Once per battle STRATEGIC GAMBIT. Select one enemy operative within 6" of a killzone edge. Until the end of that operative\'s next activation, subtract 1 from its APL stat.

DEVISE PLAN [1]
You gain 1CP.

DESIGNATE TARGET [1]
Select one enemy operative to gain one of your Target tokens. Whenever a friendly SCOUT SQUAD operative is shooting against, fighting against or retaliating against an enemy operative that has one of your Target tokens, you can re-roll one of your attack dice.

SPY [1]
Approved Ops only. Your opponent must reveal their selected tac op.

TACTICAL MANOEUVRE [1]
Twice per battle STRATEGIC GAMBIT. Select one friendly operative. Until the end of that operative\'s next activation, add 1 to its APL stat.`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'GUERRILLA ENGAGEMENT', 1,
  'Whenever an enemy operative is shooting a friendly SCOUT SQUAD operative, if that friendly operative is in cover and more than 6" from enemy operatives it\'s visible to, you can re-roll one of your defence dice.');

rule('ploy', 'Strategy', 'AMBUSH', 1,
  `Whenever a friendly SCOUT SQUAD operative is shooting or fighting during its activation, if its order was changed from Conceal to Engage at the start of that activation, or it wasn\'t visible to enemy operatives at the start of that activation:
• Its weapons have the Balanced weapon rule.
• If the target is expended, its weapons have the Ceaseless weapon rule instead.`);

rule('ploy', 'Strategy', 'ADAPTABLE TRAINING', 1,
  'You can change the order of up to D3 friendly SCOUT SQUAD operatives that are more than 4" from enemy operatives.');

rule('ploy', 'Strategy', 'STEALTH RELOCATION', 1,
  'Up to D3 friendly SCOUT SQUAD operatives that have a Conceal order and are more than 4" from enemy operatives can immediately perform a free Dash action. You cannot use this Strategic Ploy in the first turning point.');

rule('ploy', 'Firefight', 'ASTARTES TRAINING', 1,
  `Use this firefight ploy during a friendly SCOUT SQUAD operative\'s activation. Until the end of that activation, that operative can do one of the following:
• Perform two Fight actions.
• Perform two Shoot actions if an Astartes shotgun, bolt pistol or boltgun is selected for at least one of them.
• Perform two Shoot actions with a heavy bolter, missile launcher or sniper rifle, but 1 additional AP must be spent for the second action.`);

rule('ploy', 'Firefight', 'RAW PHYSIOLOGY', 1,
  'Use this firefight ploy during a friendly SCOUT SQUAD operative\'s activation. Until the start of its next activation, add 1" to its Move stat and you can ignore any changes to that operative\'s stats from being injured (including its weapons\' stats).');

rule('ploy', 'Firefight', 'EMBOLDENED ASPIRANT', 1,
  'Use this firefight ploy when a friendly SCOUT SQUAD operative performs the Fight or Shoot action, after any re-rolls. If it\'s the first friendly operative to perform either of those actions during this turning point, or if the enemy operative in that action (primary target, if relevant) has a higher Wounds stat than that friendly SCOUT SQUAD operative, you can retain one of your normal successes as a critical success instead.');

rule('ploy', 'Firefight', 'COVERT POSITION', 1,
  'Use this firefight ploy during a friendly SCOUT SQUAD operative\'s activation. Until the start of its next activation, while that operative has a Conceal order and is in cover, it cannot be selected as a valid target, taking precedence over all other rules (e.g., Seek, Vantage terrain) except being within 2".');

// ── TACOPS ───────────────────────────────────────────────────────────────────

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

// ── EQUIPMENT ────────────────────────────────────────────────────────────────

rule('equipment', null, 'CAMO CLOAK', 0,
  'Whenever an operative is shooting a friendly SCOUT SQUAD operative (excluding SNIPER), if you can retain any cover saves, you can retain one additional cover save. This isn\'t cumulative with improved cover saves from Vantage terrain.');

rule('equipment', null, 'TARGETING OCULARS', 0,
  'Up to twice per turning point, when a friendly SCOUT SQUAD operative is performing the Shoot action and you\'re selecting a valid target, you can use this rule. If you do, until the end of that action, its ranged weapons have the Lethal 5+ and Saturate weapon rules.');

rule('equipment', null, 'COMBAT BLADE', 0,
  `Friendly SCOUT SQUAD operatives have the following melee weapon. Note that some operatives already have this weapon but with better stats; in that instance, use the better version.

Combat knife: ATK 3, HIT 3+, DMG 4/5`);

rule('equipment', null, 'HEAVY WEAPON BIPOD', 0,
  'Whenever a friendly SCOUT SQUAD HEAVY GUNNER operative is shooting with a heavy bolter or missile launcher, if it hasn\'t moved during the activation, or if it\'s a counteraction, that weapon has the Ceaseless weapon rule; if the weapon already has that weapon rule, it has the Relentless weapon rule. Note that operative isn\'t restricted from moving after shooting.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('SCOUT SERGEANT', 'Leader',
  { APL: '3', MOVE: '6"', SAVE: '4+', WOUNDS: '11' },
  [
    { name: 'Boltgun',          atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Astartes shotgun', atk: '4', hit: '2+', dmg: '4/4', wr: 'Range 6"' },
    { name: 'Bolt pistol',      atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Chainsword',       atk: '5', hit: '3+', dmg: '4/5', wr: '–' },
    { name: 'Fists',            atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Guidance and Experience', description: 'Once during each of this operative\'s activations, you can select one other friendly SCOUT SQUAD operative visible to it. Until the end of that operative\'s next activation, add 1 to its APL stat.' },
    { name: 'Astartes', description: 'During this operative\'s activation, it can perform either two Shoot actions or two Fight actions. If it\'s two Shoot actions, an Astartes shotgun, bolt pistol or boltgun must be selected for at least one of them. This operative can counteract regardless of its order.' },
  ],
  'SCOUT SQUAD, IMPERIUM, ADEPTUS ASTARTES, LEADER, SERGEANT'
);

card('SCOUT HEAVY GUNNER (Heavy bolter)', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '10' },
  [
    { name: 'Heavy bolter – Focused',  atk: '5', hit: '3+', dmg: '4/5', wr: 'Heavy (Dash only), Piercing Crits 1' },
    { name: 'Heavy bolter – Sweeping', atk: '4', hit: '3+', dmg: '4/5', wr: 'Heavy (Dash only), Piercing Crits 1, Torrent 1' },
    { name: 'Bolt pistol',             atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Fists',                   atk: '3', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [],
  'SCOUT SQUAD, IMPERIUM, ADEPTUS ASTARTES, HEAVY GUNNER'
);

card('SCOUT HEAVY GUNNER (Missile launcher)', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '10' },
  [
    { name: 'Missile launcher – Frag', atk: '4', hit: '3+', dmg: '3/5', wr: 'Blast 2, Heavy (Dash only)' },
    { name: 'Missile launcher – Krak', atk: '4', hit: '3+', dmg: '5/7', wr: 'Heavy (Dash only), Piercing 1' },
    { name: 'Bolt pistol',             atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Fists',                   atk: '3', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [],
  'SCOUT SQUAD, IMPERIUM, ADEPTUS ASTARTES, HEAVY GUNNER'
);

card('SCOUT HUNTER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '10' },
  [
    { name: 'Bolt pistol',  atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Combat blade', atk: '4', hit: '3+', dmg: '4/5', wr: '–' },
  ],
  [
    { name: 'Grapnel Launcher', description: 'Whenever this operative is climbing up, you can treat the vertical distance as 2" (regardless of how far the operative actually moves vertically).' },
    { name: 'Grapnel Assault', description: 'Whenever this operative performs the Charge action during its activation, if it climbs, drops, jumps or its base moves underneath Vantage terrain during that action, its melee weapons have the Lethal 3+ weapon rule until the end of that activation.' },
  ],
  'SCOUT SQUAD, IMPERIUM, ADEPTUS ASTARTES, HUNTER'
);

card('SCOUT SNIPER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '10' },
  [
    { name: 'Bolt pistol',              atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Sniper rifle – Mobile',    atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Sniper rifle – Stationary', atk: '4', hit: '2+', dmg: '3/3', wr: 'Devastating 3, Heavy (Dash only), Silent' },
    { name: 'Fists',                    atk: '3', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Camo Cloak', description: 'Whenever an operative is shooting this operative:\n• Ignore the Saturate weapon rule.\n• If you can retain any cover saves, you can retain one additional cover save, or you can retain one cover save as a critical success instead. This isn\'t cumulative with improved cover saves from Vantage terrain.' },
    { name: 'OPTICS (1AP)', description: 'Until the start of this operative\'s next activation, whenever it\'s shooting, enemy operatives cannot be obscured. This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'SCOUT SQUAD, IMPERIUM, ADEPTUS ASTARTES, SNIPER'
);

card('SCOUT TRACKER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '10' },
  [
    { name: 'Boltgun', atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Fists',   atk: '3', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'TRACK ENEMY (1AP)', description: 'Select one expended enemy operative within 8" of this operative. Until the end of the Turning Point, whenever a friendly SCOUT SQUAD operative is shooting that enemy operative, its ranged weapons have the Seek Light weapon rule. This operative cannot perform this action while within control Range of an enemy operative.' },
    { name: 'AUSPEX SCAN (1AP)', description: 'Until the start of this operative\'s next activation or until it\'s incapacitated (whichever comes first), whenever a friendly SCOUT SQUAD operative is shooting an enemy operative within 8" of this operative, that enemy operative cannot be obscured; if that friendly operative is a SNIPER that\'s currently benefitting from the effects of its Optics action, its ranged weapons also have the Seek Light weapon rule. This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'SCOUT SQUAD, IMPERIUM, ADEPTUS ASTARTES, TRACKER'
);

card('SCOUT WARRIOR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '10' },
  [
    { name: 'Boltgun',          atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Astartes shotgun', atk: '4', hit: '2+', dmg: '4/4', wr: 'Range 6"' },
    { name: 'Bolt pistol',      atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Combat blade',     atk: '4', hit: '3+', dmg: '4/5', wr: '–' },
    { name: 'Fists',            atk: '3', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Adaptive Equipment', description: 'You can do each of the following once per Turning Point:\n• One friendly SCOUT SQUAD WARRIOR operative can perform the Smoke Grenade action.\n• One friendly SCOUT SQUAD WARRIOR operative can perform the Stun Grenade action.\nThe rules for these actions are found in universal equipment. Performing these actions using this rule doesn\'t count towards their action limits (i.e., if you also select those grenades from equipment).' },
  ],
  'SCOUT SQUAD, IMPERIUM, ADEPTUS ASTARTES, WARRIOR'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Scout Squad populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
