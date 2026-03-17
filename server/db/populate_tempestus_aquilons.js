import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Tempestus Aquilons'").get()?.id;
if (!FACTION_ID) { console.error('Tempestus Aquilons faction not found'); process.exit(1); }

// Clear existing Tempestus Aquilons data
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
  'Archetypes: RECON, SEEK-DESTROY');

rule('faction_rules', null, 'OPERATIVES', 0,
  `1 TEMPESTUS AQUILON TEMPESTOR operative with one of the following options:
• Hot-shot laspistol; power weapon
• Relic bolt pistol; chainsword
• Hot-shot lascarbine; fists

1 SERVO-SENTRY with one of the following options:
• Flamer
• Grenade launcher
• Hot-shot volley gun

9 TEMPESTUS AQUILON operatives selected from the following list:
• GRENADIER
• GUNFIGHTER
• GUNNER with melta carbine and fists
• GUNNER with plasma carbine and fists
• MARKSMAN
• PRECURSOR
• TROOPER

Other than TROOPER operatives, your kill team can only include each operative above once.`);

rule('faction_rules', null, 'DROP INSERTION', 0,
  `When setting up a TEMPESTUS AQUILON kill team before the battle, the first third of your kill team must be set up as normal. Each third thereafter can be set up above: place them to one side instead of in the killzone. For each third that\'s set up above, you must set up the whole third in this way (not some of them), then place one of your Drop markers wholly within your drop zone.

As a STRATEGIC GAMBIT in the first and second turning point, you can move your Drop markers up to 4", measuring the horizontal distance only. In close quarters, this can be measured and moved through walls.

During the Firefight phase, friendly TEMPESTUS AQUILON operatives set up above are activated as normal. When you do, you can either expend or land that operative. If it lands, set it up in the killzone in a location it can be placed as follows (it\'s no longer set up above):

• Within 3" of one of your Drop markers, measuring the horizontal distance only, or wholly within your drop zone.
• Not within control range of an enemy operative (unless you\'re setting up a PRECURSOR operative, which can be set up within control range of an enemy operative).
• With no part of its base underneath Vantage terrain.
• With an order of your choice.

The operative is treated as performing the Reposition action (spend the AP accordingly), then continue its activation as normal. It\'s obscured until the end of the next activation or the end of the turning point (whichever comes first).

Less than half of your operatives can be set up above by the end of the first turning point. In other words, by the end of the first turning point, more than half of your operatives must have been set up in the killzone during the battle.

When readying your operatives during the second and third turning points, remove one of your Drop markers. This means operatives still set up above are incapacitated at the end of the second turning point.`);

rule('faction_rules', null, 'GRAV-CHUTE', 0,
  'When a friendly TEMPESTUS AQUILON operative is dropping, ignore the vertical distance.');

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'SUDDEN OFFENSIVE', 1,
  'Count the number of friendly TEMPESTUS AQUILON operatives that aren\'t incapacitated, then halve the result (rounding up) to give you x. Until the end of their activation, friendly TEMPESTUS AQUILON operatives\' weapons have the Balanced weapon rule if they are the first friendly operatives activated this turning point equal to x. For example, if you have five operatives, the first three friendly operatives activated will benefit.');

rule('ploy', 'Strategy', 'MAINTAIN MOMENTUM', 1,
  'Whenever a friendly TEMPESTUS AQUILON operative is shooting or fighting against a ready enemy operative, its weapons have the Severe weapon rule.');

rule('ploy', 'Strategy', 'EYE ABOVE', 1,
  'Select one enemy operative. That operative and all other enemy operatives within 3" of it gain one of your Detected tokens until the end of the turning point. Whenever an enemy operative with a Detected token is shooting a friendly TEMPESTUS AQUILON operative, you can re-roll one of your defence dice. If it is fighting or retaliating against a friendly TEMPESTUS AQUILON operative, one of your blocks can be allocated to block two unresolved successes (instead of one).');

rule('ploy', 'Strategy', 'DROP AND SECURE', 1,
  'Select one marker. Until the Ready step of the next turning point, when determining control of that marker, treat the total APL stat of friendly TEMPESTUS AQUILON operatives that contest it as 1 higher, as long as at least one friendly TEMPESTUS AQUILON operative actually contests it. Whenever a friendly TEMPESTUS AQUILON operative is within 3" of that marker, add 1 to the Atk stat of its melee weapons (to a maximum of 4).');

rule('ploy', 'Firefight', 'HOT DROP', 1,
  'Use this firefight ploy after rolling attack dice for a friendly TEMPESTUS AQUILON operative that\'s wholly within your opponent\'s territory, or either landed or dropped from Vantage terrain at least 2" higher than the killzone floor during this activation. If the target is within 6" of it, you can re-roll any of your attack dice.');

rule('ploy', 'Firefight', 'ADJUST COORDINATES', 1,
  'Use this firefight ploy when a friendly TEMPESTUS AQUILON operative lands. You can set it up within 5" of one of your Drop markers (measuring horizontal distance only), taking precedence over the normal distance requirement. It cannot perform the Dash, Fight or Shoot actions during this turning point.');

rule('ploy', 'Firefight', 'TEMPESTUS EXEMPLARS', 1,
  'Use this firefight ploy during a friendly TEMPESTUS AQUILON operative\'s activation (excluding SERVO-SENTRY and any operative with an APL stat greater than 2). During that activation it can perform the Pick Up Marker, Place Marker, or a mission action for 1 less AP.');

rule('ploy', 'Firefight', 'PROGENA', 1,
  'Use this firefight ploy when a friendly TEMPESTUS AQUILON operative (excluding SERVO-SENTRY) is activated. It regains 2D3 lost wounds, and during that activation you can ignore any changes to its APL stat.');

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

rule('equipment', null, 'TEMPESTUS DAGGER', 0,
  `Friendly TEMPESTUS AQUILON operatives (excluding SERVO-SENTRY) have the following melee weapon:

Tempestus Dagger: ATK 3, HIT 4+, DMG 3/4`);

rule('equipment', null, 'COMBAT STIMM', 0,
  'You can ignore any changes to the Move stat of friendly TEMPESTUS AQUILON operatives from being injured.');

rule('equipment', null, 'DROP AUGURY', 0,
  'Once during the battle, when a friendly TEMPESTUS AQUILON operative that\'s set up above is activated, you can move one of your Drop markers again. It cannot be moved closer to your opponent\'s drop zone.');

rule('equipment', null, 'REMOTE OVERSEER', 0,
  'Once during the battle, when rolling-off to decide initiative, you can re-roll your D6.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('AQUILON TEMPESTOR', 'Leader',
  { APL: '3', MOVE: '6"', SAVE: '4+', WOUNDS: '9' },
  [
    { name: 'Hot-shot lascarbine', atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Hot-shot laspistol',  atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Relic bolt pistol',   atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 8", Lethal 5+' },
    { name: 'Chainsword',          atk: '4', hit: '3+', dmg: '4/5', wr: '–' },
    { name: 'Fists',               atk: '3', hit: '3+', dmg: '2/3', wr: '–' },
    { name: 'Power Weapon',        atk: '4', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Tempestus Veteran', description: 'Once per battle, you can either use a firefight ploy for 0CP if this is the specified TEMPESTUS AQUILON operative, or the Command Re-roll firefight ploy for 0CP if this is the operative the attack or defence dice was rolled for.' },
    { name: 'COMMAND (1APL)', description: 'SUPPORT. Select one other friendly TEMPESTUS AQUILON operative (excluding SERVO-SENTRY) visible to and within 6" of this operative. Until the end of that operative\'s next activation, add 1 to its APL stat. This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'TEMPESTUS AQUILONS, IMPERIUM, LEADER, TEMPESTOR'
);

card('AQUILON GRENADIER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Melta Bomb',         atk: '4', hit: '3+', dmg: '5/3', wr: 'Range 3", Devastating 3, Limited 1, Piercing 2, Heavy (Reposition only)' },
    { name: 'Hot-shot laspistol', atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Fists',              atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Grenadier', description: 'This operative can use frag, krak, smoke and Stun grenades (see universal equipment). Doing so doesn\'t count towards any Limited uses you have (i.e. if you also select those grenades from equipment for other operatives). Whenever this operative is using a frag or krak grenade, improve the Hit stat of that weapon by 1.' },
  ],
  'TEMPESTUS AQUILONS, IMPERIUM, GRENADIER'
);

card('AQUILON GUNFIGHTER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Hot-shot laspistols – Focused',      atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Ceaseless, Rending' },
    { name: 'Hot-shot laspistols – Salvo',         atk: '4', hit: '4+', dmg: '3/4', wr: 'Range 8", Salvo*' },
    { name: 'Hot-shot laspistols (point-blank)',   atk: '4', hit: '3+', dmg: '3/4', wr: 'Ceaseless' },
  ],
  [
    { name: 'Salvo', description: 'Select up to two different valid targets that aren\'t within control Range of friendly operatives. Shoot with this weapon against both of them in an order of your choice (roll each sequence separately).' },
    { name: 'Gunfight', description: 'Whenever an enemy operative within 8" of this operative shoots this operative, keep track of each attack dice that\'s discarded as a fail. After the action, before incapacitated operatives are removed (including this one, if relevant), this operative can perform a free Shoot action (change its order to Engage to do so), but it can only target that enemy operative with its Hot-shot laspistols (focused), and you only roll a number of attack dice equal to the opponent\'s discarded attack dice plus one (to a maximum of four).' },
  ],
  'TEMPESTUS AQUILONS, IMPERIUM, GUNFIGHTER'
);

card('AQUILON GUNNER (Melta Carbine)', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Melta Carbine', atk: '4', hit: '3+', dmg: '6/3', wr: 'Range 6", Devastating 4, Piercing 2' },
    { name: 'Fists',         atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [],
  'TEMPESTUS AQUILONS, IMPERIUM, GUNNER'
);

card('AQUILON GUNNER (Plasma Carbine)', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Plasma Carbine – Standard',    atk: '4', hit: '3+', dmg: '4/6', wr: 'Piercing 1' },
    { name: 'Plasma Carbine – Supercharge', atk: '4', hit: '3+', dmg: '5/6', wr: 'Hot, Lethal 5+, Piercing 1' },
    { name: 'Fists',                        atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [],
  'TEMPESTUS AQUILONS, IMPERIUM, GUNNER'
);

card('AQUILON MARKSMAN', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Hot-Shot Long-las – Stationary', atk: '4', hit: '2+', dmg: '3/3', wr: 'Devastating 3, Heavy' },
    { name: 'Hot-Shot Long-las – Mobile',     atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Hot-Shot Long-las – Concealed',  atk: '4', hit: '2+', dmg: '3/3', wr: 'Devastating 3, Heavy, Silent, Concealed Position*' },
    { name: 'Fists',                          atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Sniper\'s Vantage', description: 'Whenever this operative is on Vantage terrain and is shooting an operative that has an Engage order and is at least 2" lower than it, all profiles of its Hot-shot long-las have the Severe weapon rule.' },
    { name: 'Concealed Position', description: 'This operative can only use this weapon the first time it\'s performing the Shoot action during the battle.' },
  ],
  'TEMPESTUS AQUILONS, IMPERIUM, MARKSMAN'
);

card('AQUILON PRECURSOR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Hot-shot laspistol', atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Tempestus Dagger',   atk: '4', hit: '3+', dmg: '3/4', wr: 'Ceaseless, Lethal 5+' },
  ],
  [
    { name: 'Vicious Knife Fighter', description: 'Whenever this operative is fighting, after resolving your first attack dice, you can immediately resolve another (before your opponent).' },
    { name: 'Dynamic', description: 'Whenever this operative performs the Fight or Shoot action, it can immediately perform a free Dash action afterwards. It can do so even if it performed the Charge action during this activation, but can only use the remaining distance it had from that Charge action (to a maximum of 3").' },
  ],
  'TEMPESTUS AQUILONS, IMPERIUM, PRECURSOR'
);

card('AQUILON SERVO-SENTRY', 'Warrior',
  { APL: '2', MOVE: '4"', SAVE: '3+', WOUNDS: '10' },
  [
    { name: 'Grenade Launcher – Frag', atk: '4', hit: '4+', dmg: '2/4', wr: 'Blast 2' },
    { name: 'Grenade Launcher – Krak', atk: '4', hit: '4+', dmg: '4/5', wr: 'Piercing 1' },
    { name: 'Hot-Shot Volley Gun – Focused',   atk: '5', hit: '4+', dmg: '3/4', wr: 'Piercing Crits 1' },
    { name: 'Hot-Shot Volley Gun – Sweeping',  atk: '4', hit: '4+', dmg: '3/4', wr: 'Piercing Crits 1, Torrent 1' },
    { name: 'Flamer',                          atk: '4', hit: '2+', dmg: '3/3', wr: 'Range 8", Torrent 2, Saturate' },
  ],
  [
    { name: 'Machine', description: 'This operative cannot perform any actions other than Dash, Fall Back, Reposition, and Shoot. It cannot retaliate, assist in a fight or use any weapons that aren\'t on its datacard.' },
    { name: 'Turret', description: 'This operative can perform two Shoot actions during its activation.' },
  ],
  'TEMPESTUS AQUILONS, IMPERIUM, SERVO-SENTRY'
);

card('AQUILON TROOPER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Hot-shot lascarbine', atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Fists',               atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Rapid Insertion', description: 'STRATEGIC GAMBIT in the first Strategy phase. Each friendly TEMPESTUS AQUILON TROOPER operative wholly within your drop zone can immediately perform a free Reposition action, but must finish that action wholly within 3" of your drop zone.' },
    { name: 'Swift Landing', description: 'When this operative lands, you can set it up within 4" of one of your Drop markers (measuring horizontal distance only), taking precedence over the normal distance requirement.' },
  ],
  'TEMPESTUS AQUILONS, IMPERIUM, TROOPER'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Tempestus Aquilons populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
