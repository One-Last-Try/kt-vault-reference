import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Ratlings'").get()?.id;
if (!FACTION_ID) { console.error('Ratlings faction not found'); process.exit(1); }

// Clear existing Ratlings data
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
  'Archetypes: INFILTRATION, SECURITY');

rule('faction_rules', null, 'OPERATIVES', 0,
  `1 RATLING FIXER operative with one of the following options:
• Battle rifle; fists
• Sniper rifle; fists

10 RATLING operatives selected from the following list:
• BATTLEMUTT
• BOMBER
• BULLGRYN* with one option from each of the following:
  - Grenadier gauntlet or power maul
  - Brute shield or slabshield
• OGRYN*
• BIG SHOT
• HARDBIT
• RAIDER
• SNEAK
• SNIPER
• SPOTTER
• STASHMASTER
• VOX-THIEF

* You cannot select more than three of these operatives combined. Up to three times, instead of selecting one of these operatives, you can select one RATLING ploy to cost you 0CP for the battle.

Other than BULLGRYN, OGRYN and SNIPER operatives, your kill team can only include each operative above once.

Some RATLING rules refer to a "rifle". This is a ranged weapon that includes "rifle" in its name, e.g., all profiles of a sniper rifle, tankstopper rifle, etc.`);

rule('faction_rules', null, 'SCARPER', 0,
  `After each enemy operative's activation, before the next operative is activated, you can perform a free Dash action with one friendly RATLING operative (excluding BULLGRYN, OGRYN and SNEAK), but it cannot finish that move within 3" of an enemy operative unless it\'s not visible to every enemy operative when it finishes that move.

Each friendly operative can only do this once per turning point, and cannot do so after the final activation of the turning point.`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'SNIPER POSITIONS', 1,
  'Whenever a friendly RATLING operative is more than 6" from enemy operatives and within 1" of Heavy terrain, the stationary profile of its rifle (if any) has the Silent weapon rule.');

rule('ploy', 'Strategy', 'CRACK SHOTS', 1,
  'Whenever a friendly RATLING operative is shooting an enemy operative more than 6" from it, if that friendly operative hasn\'t performed the Charge, Fall Back, or Reposition action during the activation, or it\'s a counteraction, its rifle (if any) has the Balanced weapon rule.');

rule('ploy', 'Strategy', 'SHIFTY', 1,
  'Whenever a friendly RATLING operative (excluding OGRYN or BULLGRYN) has a Conceal order and is in cover, it cannot be selected as a valid target, taking precedence over all other rules (e.g. Seek, Vantage terrain) except being within 2".');

rule('ploy', 'Strategy', 'FRONTLINE ASSAULT', 1,
  'Whenever a friendly RATLING BULLGRYN or friendly RATLING OGRYN operative is shooting within, fighting within, or retaliating within your opponent\'s territory or within 3" of an objective marker, its weapons have the Balanced weapon rule.');

rule('ploy', 'Firefight', 'SURVIVAL INSTINCTS', 1,
  'Use this firefight ploy when an enemy operative is shooting or fighting a friendly RATLING operative (excluding OGRYN or BULLGRYN) and you are allocating a dice to block. If it\'s a normal success, it can block one unresolved critical success; if it\'s a critical success, it can block two unresolved successes (normal or critical).');

rule('ploy', 'Firefight', 'SHARPSHOT', 1,
  'Use this firefight ploy when a friendly RATLING operative is performing the Shoot action with a rifle and you are selecting a valid target. Having other friendly RATLING operatives within an enemy operative\'s control range doesn\'t prevent that enemy operative from being selected.');

rule('ploy', 'Firefight', 'LARCENOUS', 1,
  'Use this firefight ploy during a friendly RATLING operative\'s activation (excluding OGRYN or BULLGRYN). Until the end of that activation, that operative doesn\'t have to control a marker to perform the Pick Up Marker or mission actions that usually require this (taking precedence over that action\'s conditions — it only needs to contest the marker), and having an enemy operative within control range of it doesn\'t prevent it from doing so.');

rule('ploy', 'Firefight', 'SHOOT AND HIDE', 1,
  'Use this firefight ploy after a friendly RATLING operative that has an Engage order performs the Shoot action with a rifle. If it\'s more than 3" from enemy operatives, or not visible to any enemy operative, you can change its order to Conceal.');

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

rule('equipment', null, 'PURLOINED RATIONS', 0,
  'Once per turning point, whenever a friendly RATLING operative is shooting with a rifle and you\'ve rolled your attack dice, you can use this rule if you haven\'t used the Lucky Round equipment during this activation. If you do, improve the Hit stat of its rifle by 1 until the end of that sequence.');

rule('equipment', null, 'LUCKY ROUND', 0,
  'Once per turning point, whenever a friendly RATLING operative is shooting with a rifle and you\'ve rolled your attack dice, you can use this rule if you haven\'t used the Purloined Rations equipment during this activation. If you do, that weapon has the Severe weapon rule for that sequence.');

rule('equipment', null, 'STOLEN GOODS', 0,
  `At the end of the Select Operatives step, roll one D3. If the result is:
1. You lose 1CP.
2. You gain 1CP.
3. Your opponent loses 1CP.`);

rule('equipment', null, 'IMPROVISED ARMOUR', 0,
  'Whenever an operative is shooting a friendly BULLGRYN RATLING operative or a friendly OGRYN RATLING operative, their defense dice results of 5+ are critical successes.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('RATLING FIXER', 'Leader',
  { APL: '2', MOVE: '5"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Battle rifle',              atk: '4', hit: '2+', dmg: '3/4', wr: '–' },
    { name: 'Sniper rifle – Mobile',     atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Sniper rifle – Stationary', atk: '4', hit: '2+', dmg: '3/3', wr: 'Devastating 3, Heavy' },
    { name: 'Fists',                     atk: '3', hit: '5+', dmg: '1/2', wr: '–' },
  ],
  [
    { name: 'Munitorum Contacts', description: 'You can select one additional equipment option.' },
    { name: 'Target Designation: STRATEGIC GAMBIT', description: 'Select one enemy operative visible to this operative. Until the end of the turning point, whenever a friendly RATLING operative is shooting that enemy operative with a rifle, that weapon has the Lethal 5+ weapon rule.' },
  ],
  'RATLING, IMPERIUM, ASTRA MILITARUM, LEADER, FIXER'
);

card('BATTLEMUT', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '4' },
  [
    { name: 'Bite', atk: '4', hit: '3+', dmg: '2/4', wr: '–' },
  ],
  [
    { name: 'Early Warning', description: 'Once per turning point, after an enemy operative performs an action in which it moves or is set up, you can interrupt to use this rule. If you do, each friendly RATLING operative (excluding OGRYN and BULLGRYN) within 6" of this operative and within 2" of that enemy operative can perform a free Dash action or a free Fall Back action, but it cannot move more than 3". In either case, each one cannot finish that move within 2" of an enemy operative unless it\'s not visible to every enemy operative when it finishes that move (if this isn\'t possible for an operative, it cannot move).' },
    { name: 'Beast', description: 'This operative cannot perform any actions other than Charge, Dash, Fall Back, Fight, and Reposition. It cannot use any weapons that aren\'t on its datacard.' },
  ],
  'RATLING, IMPERIUM, ASTRA MILITARUM, BATTLEMUT'
);

card('BULLGRYN', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '16' },
  [
    { name: 'Grenadier gauntlet', atk: '4', hit: '4+', dmg: '3/5', wr: 'Blast 2' },
    { name: 'Power maul',         atk: '4', hit: '3+', dmg: '4/6', wr: 'Shock' },
    { name: 'Brute shield',       atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Slabshield',         atk: '4', hit: '4+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Shield', description: 'If this operative has a slabshield, it has a 3+ Save stat; if it has a brute shield, whenever it\'s fighting or retaliating, each of your blocks can be allocated to block two unresolved successes (instead of one).' },
    { name: 'Brute', description: 'Whenever your opponent is selecting a valid target, if this operative has a Conceal order, it cannot use Light terrain for cover. Whilst this can allow this operative to be targeted (assuming it\'s visible), it doesn\'t remove its cover save (if any).' },
    { name: 'Slow-witted', description: 'You must spend 1 additional AP for this operative to perform the Pick Up Marker and mission actions (excluding Operate Hatch).' },
  ],
  'RATLING, IMPERIUM, ASTRA MILITARUM, BULLGRYN'
);

card('OGRYN', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '16' },
  [
    { name: 'Ripper gun', atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 8", Punishing' },
    { name: 'Bayonet',    atk: '4', hit: '3+', dmg: '4/5', wr: '–' },
  ],
  [
    { name: 'Bayonet Charge', description: 'Whenever this operative finishes moving during the Charge action, you can inflict D3+1 damage on one enemy operative within its control range.' },
    { name: 'Brute', description: 'Whenever your opponent is selecting a valid target, if this operative has a Conceal order, it cannot use Light terrain for cover. Whilst this can allow this operative to be targeted (assuming it\'s visible), it doesn\'t remove its cover save (if any).' },
    { name: 'Slow-witted', description: 'You must spend 1 additional AP for this operative to perform the Pick Up Marker and mission actions (excluding Operate Hatch).' },
  ],
  'RATLING, IMPERIUM, ASTRA MILITARUM, OGRYN'
);

card('RATLING BIG SHOT', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '5+', WOUNDS: '6' },
  [
    { name: 'Tankstopper rifle – Mobile',     atk: '4', hit: '3+', dmg: '4/4', wr: 'Devastating 1, Heavy (Dash only), Piercing 1' },
    { name: 'Tankstopper rifle – Stationary', atk: '4', hit: '2+', dmg: '4/2', wr: 'Devastating 4, Heavy, Piercing 1, Severe' },
    { name: 'Fists',                          atk: '3', hit: '5+', dmg: '1/2', wr: '–' },
  ],
  [],
  'RATLING, IMPERIUM, ASTRA MILITARUM, BIG SHOT'
);

card('RATLING BOMBER', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '4+', WOUNDS: '6' },
  [
    { name: 'Explosive arsenal',     atk: '5', hit: '3+', dmg: '4/5', wr: 'Range 3", Blast 1", Heavy (Reposition only), Limited 1, Piercing 1, Saturate' },
    { name: 'Sniper rifle – Mobile',     atk: '4', hit: '4+', dmg: '3/4', wr: '–' },
    { name: 'Sniper rifle – Stationary', atk: '4', hit: '3+', dmg: '3/3', wr: 'Devastating 3, Heavy' },
    { name: 'Fists',                     atk: '3', hit: '5+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Tripwire', description: 'When setting up equipment before the battle, you can set up to two of your Tripwire markers up wholly within your territory and more than 2" from other markers, access points and Accessible terrain. The first time that marker is within an enemy operative\'s control range, end that operative\'s action (if any), remove that marker and subtract 1 from that operative\'s APL stat until the end of its next activation.' },
    { name: 'Mine', description: 'Mines you select from universal equipment inflict 2D3+3 damage instead, and friendly RATLING operatives (excluding OGRYN and BULLGRYN) are ignored for its effects (i.e., they can\'t trigger it or take damage from it). This takes precedence over the normal rules for mines.' },
  ],
  'RATLING, IMPERIUM, ASTRA MILITARUM, BOMBER'
);

card('RATLING HARDBIT', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '5+', WOUNDS: '6' },
  [
    { name: 'Battle rifle',  atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Combat knife',  atk: '3', hit: '3+', dmg: '3/5', wr: 'Balanced' },
  ],
  [
    { name: 'Hunter', description: 'This operative can perform the Charge action while it has a Conceal order. If it does so during its activation, until the end of that activation, add 1 to the Atk stat of its combat knife and that melee weapon has the Brutal weapon rule.' },
    { name: 'Lie in Wait', description: 'Whenever this operative is retaliating while Light or Heavy terrain is within its control range, you resolve the first attack dice (i.e. defender instead of attacker).' },
  ],
  'RATLING, IMPERIUM, ASTRA MILITARUM, HARDBIT'
);

card('RATLING RAIDER', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '5+', WOUNDS: '6' },
  [
    { name: 'Suppressed sniper rifle – Mobile',     atk: '4', hit: '4+', dmg: '3/4', wr: 'Silent' },
    { name: 'Suppressed sniper rifle – Stationary', atk: '4', hit: '3+', dmg: '3/3', wr: 'Devastating 2, Heavy, Silent' },
    { name: 'Dagger',                               atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Grappling Hook', description: 'Whenever this operative is climbing terrain up, you can treat the vertical distance as 2" (regardless of how far the operative actually moves vertically).' },
    { name: 'SLINGSHOT (1AP)', description: 'Select a point on a terrain feature that\'s visible to, and within 6" of this operative. Remove this operative from the killzone and set it back up wholly within 6" horizontally of that point, not within control range of an enemy operative, and with that point visible to it.\n\nThis action is treated as a Reposition action. This operative cannot perform this action while within control range of an enemy operative, or during an activation in which it performed the Charge, Fall Back or Shoot action (or vice versa).' },
  ],
  'RATLING, IMPERIUM, ASTRA MILITARUM, RAIDER'
);

card('RATLING SNEAK', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '5+', WOUNDS: '6' },
  [
    { name: 'Suppressed sniper rifle – Mobile',     atk: '4', hit: '4+', dmg: '3/4', wr: 'Silent' },
    { name: 'Suppressed sniper rifle – Stationary', atk: '4', hit: '3+', dmg: '3/3', wr: 'Devastating 2, Heavy, Silent' },
    { name: 'Fists',                                atk: '3', hit: '5+', dmg: '1/2', wr: '–' },
  ],
  [
    { name: 'Evade', description: 'Once per turning point, after an enemy operative performs an action, you can interrupt and perform a free Dash action with this operative. Note this operative cannot use the Scarper faction rule (it has this rule instead).' },
    { name: 'OPTICS (1AP)', description: 'Until the start of this operative\'s next activation, whenever it\'s shooting, enemy operatives cannot be obscured and the stationary profile of this operative\'s suppressed sniper rifle has the Lethal 5+ weapon rule.\n\nThis operative cannot perform this action while within control range of an enemy operative.' },
  ],
  'RATLING, IMPERIUM, ASTRA MILITARUM, SNEAK'
);

card('RATLING SPOTTER', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '5+', WOUNDS: '6' },
  [
    { name: 'Sniper rifle – Mobile',     atk: '4', hit: '4+', dmg: '3/4', wr: '–' },
    { name: 'Sniper rifle – Stationary', atk: '4', hit: '3+', dmg: '3/3', wr: 'Devastating 3, Heavy' },
    { name: 'Fists',                     atk: '3', hit: '5+', dmg: '1/2', wr: '–' },
  ],
  [
    { name: 'SPOT (1AP)', description: 'SUPPORT. Select one enemy operative visible to this operative. Once during this turning point, when a friendly RATLING operative within 3" of this operative is shooting that enemy operative, you can use this effect. If you do:\n• That friendly operative\'s ranged weapons have the Seek Light weapon rule.\n• That enemy operative is not obscured.\n\nThis operative cannot perform this action while within control range of an enemy operative.' },
  ],
  'RATLING, IMPERIUM, ASTRA MILITARUM, SPOTTER'
);

card('RATLING STASHMASTER', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '5+', WOUNDS: '6' },
  [
    { name: 'Sniper rifle – Mobile',     atk: '4', hit: '4+', dmg: '3/4', wr: '–' },
    { name: 'Sniper rifle – Stationary', atk: '4', hit: '3+', dmg: '3/3', wr: 'Devastating 3, Heavy' },
    { name: 'Fists',                     atk: '3', hit: '5+', dmg: '1/2', wr: '–' },
  ],
  [
    { name: 'Light-fingered', description: 'Once during each of this operative\'s activations, it can perform the Place Marker, Pick Up Marker or a mission action for 1 less AP.' },
    { name: 'Well Stocked', description: 'If you select an Ammo Cache from universal equipment, you can set up an additional Ammo Cache marker.' },
  ],
  'RATLING, IMPERIUM, ASTRA MILITARUM, STASHMASTER'
);

card('RATLING VOX-THIEF', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '5+', WOUNDS: '6' },
  [
    { name: 'Sniper rifle – Mobile',     atk: '4', hit: '4+', dmg: '3/4', wr: '–' },
    { name: 'Sniper rifle – Stationary', atk: '4', hit: '3+', dmg: '3/3', wr: 'Devastating 3, Heavy' },
    { name: 'Fists',                     atk: '3', hit: '5+', dmg: '1/2', wr: '–' },
  ],
  [
    { name: 'INTERCEPT COMMUNICATIONS (1AP)', description: 'SUPPORT. Select one other friendly RATLING operative visible to and within 6" of this operative. Until the end of its next activation, add 1 to that operative\'s APL stat.\n\nThis operative cannot perform this action while within control range of an enemy operative.' },
  ],
  'RATLING, IMPERIUM, ASTRA MILITARUM, VOX-THIEF'
);

card('RATLING SNIPER', 'Specialist',
  { APL: '2', MOVE: '5"', SAVE: '5+', WOUNDS: '6' },
  [
    { name: 'Sniper rifle – Mobile',     atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Sniper rifle – Stationary', atk: '4', hit: '2+', dmg: '3/3', wr: 'Devastating 3, Heavy' },
    { name: 'Fists',                     atk: '3', hit: '5+', dmg: '1/2', wr: '–' },
  ],
  [],
  'RATLING, IMPERIUM, ASTRA MILITARUM, SNIPER'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Ratlings populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
