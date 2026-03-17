import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Wyrmblade'").get()?.id;
if (!FACTION_ID) { console.error('Wyrmblade faction not found'); process.exit(1); }

// Clear existing Wyrmblade data
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
  `1 WYRMBLADE NEOPHYTE LEADER operative with one of the following options:
• Autogun; Gun butt
• Shotgun; Gun butt

Or one option from each of the following:
• Bolt pistol, master-crafted autopistol or web pistol
• Chainsword, power maul or power pick

13 WYRMBLADE operatives selected from the following list:
• KELERMORPH*
• LOCUS*
• GUNNER with flamer and gun butt
• GUNNER with grenade launcher and gun butt
• GUNNER with webber and gun butt
• HEAVY GUNNER with heavy stubber and gun butt
• HEAVY GUNNER with mining laser and gun butt
• HEAVY GUNNER with seismic cannon and gun butt
• ICON BEARER with one of the following options:
  - Autogun; gun butt
  - Shotgun; gun butt
• SANCTUS SNIPER*
• SANCTUS TALON*
• WARRIOR with one of the following options:
  - Autogun; gun butt
  - Shotgun; gun butt

* These operatives count as two selections each.

Other than WARRIOR operatives, your kill team can only include each operative on this list once. Your kill team can only include up to two GUNNER operatives, up to two HEAVY GUNNER operatives and up to two CULT AGENT operatives.`);

rule('faction_rules', null, 'FAMILIAR TERRITORY', 0,
  `When setting up a WYRMBLADE kill team before the battle, one third of your kill team can be set up in HIDING: place them to one side instead of in the killzone. CULT AGENT operatives cannot be set up in HIDING.

In the Firefight phase, friendly WYRMBLADE operatives set up in HIDING are activated as normal. When you do, you can either expend that operative or have it emerge. If it emerges, set it up in the killzone in a location it can be placed as follows (it\'s no longer set up in HIDING):

• Wholly within 6" of your drop zone.
• More than 6" from enemy operatives.
• With an order of your choice.

The operative is treated as performing the Reposition action (spend the AP accordingly), then continue its activation as normal. If the operative is a WARRIOR, ignore its Group Activation rule. Friendly operatives still in HIDING at the end of the second turning point are incapacitated.`);

rule('faction_rules', null, 'CULT AMBUSH', 0,
  `Whenever a friendly WYRMBLADE operative is shooting or fighting during its activation, if its order was changed from Conceal to Engage at the start of that activation, or it wasn\'t visible to enemy operatives at the start of that activation, that friendly operative\'s weapons have the Ceaseless weapon rule.`);

rule('faction_rules', null, 'CULT AGENT', 0,
  `Whenever an operative is shooting a friendly WYRMBLADE CULT AGENT operative:

• Ignore the Piercing and Saturate weapon rules.
• If you can retain any cover saves, you can retain one additional cover save, or you can retain one cover save as a critical success instead. This isn\'t cumulative with improved cover saves from Vantage terrain.`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'CROSSFIRE', 1,
  'Whenever a friendly WYRMBLADE operative is shooting an operative that another friendly WYRMBLADE operative has already shot during this turning point, that first friendly operative\'s ranged weapons have the Accurate 1 weapon rule.');

rule('ploy', 'Strategy', 'THE DAY IS AT HAND', 1,
  `Whenever a friendly WYRMBLADE operative is activated, if its order is changed from Conceal to Engage, until the end of that activation:
• Its ranged weapons have the Rending weapon rule.
• Add 1 to the Atk stat of its melee weapons (to a maximum of 5).`);

rule('ploy', 'Strategy', 'ONE WITH THE SHADOWS', 1,
  'Whenever an operative is shooting a friendly WYRMBLADE operative that has a Conceal order, if Light terrain is intervening, that friendly operative is obscured (unless the intervening Light terrain is within 1" of either operative).');

rule('ploy', 'Strategy', 'DIVERT AND DISAPPEAR', 1,
  'Up to three friendly WYRMBLADE operatives can immediately perform a free Dash or Charge action in an order of your choice (choose separately for each, and for the latter, it cannot move more than 3"). If a WYRMBLADE CULT AGENT operative is selected for this ploy, it counts as two operatives, and it can perform a free Fall Back action instead (it cannot move more than 3"); if it does, subtract 1 from its APL stat until the end of its next activation.');

rule('ploy', 'Firefight', 'COILED SERPENT', 1,
  'Use this firefight ploy when a friendly WYRMBLADE operative is shooting or fighting, after rolling your attack dice. If that friendly operative\'s order was changed from Conceal to Engage at the start of that activation and this is the first time it\'s performed either the Shoot or Fight action during that activation, you can retain one of your normal successes as a critical success instead. Note this ploy cannot come into effect more than once per activation (you cannot use it during both the Shoot and Fight action in the same activation).');

rule('ploy', 'Firefight', 'A PLAN GENERATIONS IN THE MAKING', 1,
  'Use this firefight ploy when a friendly WYRMBLADE NEOPHYTE operative is incapacitated. It can perform a free mission action before it\'s removed from the killzone.');

rule('ploy', 'Firefight', 'SLINK INTO DARKNESS', 1,
  'Use this firefight ploy at the end of a friendly WYRMBLADE operative\'s activation. If that operative has an Engage order, change it to Conceal. You cannot use this ploy for each friendly operative more than once per battle.');

rule('ploy', 'Firefight', 'UNQUESTIONING LOYALTY', 1,
  'Use this firefight ploy when a friendly WYRMBLADE CULT AGENT or WYRMBLADE LEADER operative is selected as the valid target of a Shoot action or to fight against during the Fight action. Select one other friendly WYRMBLADE NEOPHYTE operative (excluding LEADER) visible to and within 3" of that first friendly operative to become the valid target or to be fought against (as appropriate) instead (even if it wouldn\'t normally be valid for this). If it\'s the Fight action, treat that other operative as being within the fighting operative\'s control range for the duration of that action. if it\'s the Shoot action, that other operative is only in cover or obscured if the original target was.\n\nThis ploy has no effect if it\'s the Shoot action and the ranged weapon has the Blast or Torrent weapon rule.');

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

rule('equipment', null, 'BLASTING CHARGES', 0,
  `Once per turning point, a friendly WYRMBLADE NEOPHYTE operative can use the following ranged weapon:

Blasting Charge: ATK 4, HIT 4+, DMG 3/5, WR: Range 4", Blast 1", Saturate`);

rule('equipment', null, 'SPOTLIGHTS', 0,
  'Whenever a friendly WYRMBLADE operative is shooting, the target cannot be obscured if it\'s visible to and within 6" of a friendly WYRMBLADE NEOPHYTE operative that isn\'t within control range of enemy operatives.');

rule('equipment', null, 'EXPLOSIVE TRAPS', 0,
  'This equipment allows you to select two mines (see universal equipment). You cannot also select that equipment as normal (i.e. to give you three), and friendly WYRMBLADE operatives are ignored for your mines\' effects (i.e. they cannot trigger or take damage from them). This takes precedence over the normal mines rules.');

rule('equipment', null, 'CULT KNIFES', 0,
  `Friendly WYRMBLADE NEOPHYTE operatives have the following melee weapon:

Cult knife: ATK 3, HIT 4+, DMG 3/4`);

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('NEOPHYTE LEADER', 'Leader',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '8' },
  [
    { name: 'Autogun',                    atk: '4', hit: '3+', dmg: '2/3', wr: '–' },
    { name: 'Bolt pistol',                atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Master-crafted autopistol',  atk: '4', hit: '3+', dmg: '2/4', wr: 'Range 8", Lethal 5+' },
    { name: 'Shotgun',                    atk: '4', hit: '2+', dmg: '3/3', wr: 'Range 6"' },
    { name: 'Web pistol',                 atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 6", Severe, Stun' },
    { name: 'Chainsword',                 atk: '4', hit: '3+', dmg: '4/5', wr: '–' },
    { name: 'Gun butt',                   atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
    { name: 'Power maul',                 atk: '4', hit: '3+', dmg: '4/6', wr: 'Shock' },
    { name: 'Power pick',                 atk: '4', hit: '3+', dmg: '4/5', wr: 'Rending' },
  ],
  [
    { name: 'Shadow Vector', description: 'Once per turning point, you can use the Slink Into Darkness or Coiled Serpent firefight ploy for 0CP if the specified friendly WYRMBLADE operative is a NEOPHYTE visible to this operative.' },
  ],
  'WYRMBLADE, TYRANIDS, GENESTEALER CULTS, NEOPHYTE, LEADER'
);

card('KELERMORPH', 'Specialist',
  { APL: '3', MOVE: '6"', SAVE: '4+', WOUNDS: '9' },
  [
    { name: 'Liberator autostubs – Long range',  atk: '4', hit: '4+', dmg: '3/4', wr: 'Piercing Crits 1, Rending' },
    { name: 'Liberator autostubs – Short range', atk: '5', hit: '3+', dmg: '3/4', wr: 'Range 8", Piercing 1, Rending' },
    { name: 'Liberator autostubs – Hypersense',  atk: '5', hit: '3+', dmg: '3/4', wr: 'Range 6", Saturate, Seek Light, Hypersense' },
    { name: 'Kelermorph knife',                  atk: '3', hit: '4+', dmg: '3/4', wr: 'Rending' },
  ],
  [
    { name: 'Expert Gunslinger', description: 'This operative can perform two Shoot actions during its activation.' },
    { name: 'Heroic Inspiration', description: 'Whenever a friendly WYRMBLADE NEOPHYTE operative visible to and within 3" of this operative is shooting, fighting or retaliating, if this operative has incapacitated an enemy operative during this turning point, that friendly operative\'s weapons have the Severe weapon rule.' },
    { name: '*Hypersense', description: 'Whenever this operative is shooting with this weapon profile, enemy operatives cannot be obscured.' },
  ],
  'WYRMBLADE, TYRANIDS, GENESTEALER CULTS, CULT AGENT, KELERMORPH'
);

card('LOCUS', 'Specialist',
  { APL: '3', MOVE: '6"', SAVE: '4+', WOUNDS: '9' },
  [
    { name: 'Barbed tail',  atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 3", Silent' },
    { name: 'Locus blades', atk: '5', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Bladed Stance', description: 'Whenever this operative is fighting or retaliating, you can resolve one of your successes before the normal order. If you do, that success must be used to block.' },
    { name: 'Quicksilver Strike', description: 'Once per turning point, after an enemy operative performs an action in which it moves or is set up, you can interrupt to use this rule. If you do, this operative can immediately perform a free Charge action (you can change its order to do so), but it cannot move more than 3", and it must end that move within control Range of that enemy operative. If this isn\'t possible, the interruption is cancelled and this rule hasn\'t been used.' },
    { name: 'Expert Swordsman', description: 'This operative can perform two Fight actions during its activation. Whenever this operative ends the Fight action, if it\'s no longer within control Range of enemy operatives, it can immediately perform a free Charge action (even if it\'s already performed the Charge action during that activation), but it cannot move more than 3" during that action. Doing so doesn\'t prevent it from performing the Dash action afterwards during that activation.' },
  ],
  'WYRMBLADE, TYRANIDS, GENESTEALER CULTS, CULT AGENT, LOCUS'
);

card('NEOPHYTE GUNNER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Flamer',                    atk: '4', hit: '2+', dmg: '3/3', wr: 'Range 8", Saturate, Torrent 2' },
    { name: 'Grenade launcher – Frag',   atk: '4', hit: '4+', dmg: '2/4', wr: 'Blast 2' },
    { name: 'Grenade launcher – Krak',   atk: '4', hit: '4+', dmg: '4/5', wr: 'Piercing 1' },
    { name: 'Webber',                    atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 12", Severe, Stun' },
    { name: 'Gun butt',                  atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [],
  'WYRMBLADE, TYRANIDS, GENESTEALER CULTS, NEOPHYTE, GUNNER'
);

card('NEOPHYTE HEAVY GUNNER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Heavy stubber – Sweeping', atk: '4', hit: '4+', dmg: '4/5', wr: 'Heavy (Dash only), Torrent 1"' },
    { name: 'Heavy stubber – Focused',  atk: '5', hit: '4+', dmg: '4/5', wr: 'Heavy (Dash only)' },
    { name: 'Mining laser',             atk: '5', hit: '4+', dmg: '5/6', wr: 'Heavy (Dash only), Piercing 1' },
    { name: 'Seismic cannon – Long wave',  atk: '6', hit: '4+', dmg: '2/2', wr: 'Blast 1, Heavy (Dash only), Stun' },
    { name: 'Seismic cannon – Short wave', atk: '4', hit: '3+', dmg: '4/4', wr: 'Range 6", Heavy (Dash only), Piercing Crits 1, Stun' },
    { name: 'Gun butt',                 atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Heavy Weapon Bipod', description: 'Whenever this operative is shooting with a weapon from its datacard, if it hasn\'t moved during the activation, or if it\'s a counteraction, that weapon has the Ceaseless weapon rule; if the weapon already has that weapon rule (i.e. from the Cult Ambush faction rule), it has the Relentless weapon rule. Note this operative isn\'t restricted from moving after shooting.' },
  ],
  'WYRMBLADE, TYRANIDS, GENESTEALER CULTS, NEOPHYTE, HEAVY GUNNER'
);

card('NEOPHYTE ICON BEARER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Autogun',  atk: '4', hit: '4+', dmg: '2/3', wr: '–' },
    { name: 'Shotgun',  atk: '4', hit: '3+', dmg: '3/3', wr: 'Range 6"' },
    { name: 'Gun butt', atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Icon Bearer', description: 'Whenever determining control of a marker, treat this operative\'s APL stat as 1 higher. Note this isn\'t a change to its APL stat, so any changes are cumulative with this.' },
    { name: 'Overthrow the Oppressors', description: 'Once per turning point, when a ready friendly WYRMBLADE NEOPHYTE operative is incapacitated while visible to and within 6" of this operative, you can use this rule. If you do, before that operative is removed from the killzone, it can either perform one free Shoot action (you can change its order to do so), or you can use the A Plan Generations in the Making firefight ploy for 0CP if that incapacitated operative is the specified friendly WYRMBLADE NEOPHYTE operative. It\'s then removed from the killzone as normal.' },
  ],
  'WYRMBLADE, TYRANIDS, GENESTEALER CULTS, NEOPHYTE, ICON BEARER'
);

card('SANCTUS SNIPER', 'Specialist',
  { APL: '3', MOVE: '6"', SAVE: '4+', WOUNDS: '9' },
  [
    { name: 'Sanctus sniper rifle – Stationary', atk: '4', hit: '2+', dmg: '3/3', wr: 'Devastating 3, Heavy (Dash only), Silent' },
    { name: 'Sanctus sniper rifle – Mobile',     atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Fists',                             atk: '4', hit: '3+', dmg: '2/4', wr: '–' },
  ],
  [
    { name: 'TARGET VULNERABILITY (1AP)', description: 'Until the end of this operative\'s activation, the stationary profile of its Sanctus sniper rifle has the Lethal 5+ weapon rule. This operative cannot perform this action while within control Range of an enemy operative.' },
    { name: 'FAMILIAR SOULSIGHT (1AP)', description: 'Select one enemy operative visible to this operative. Until the end of the battle, or until this action is performed again by a friendly operative (whichever comes first), that enemy operative gains one of your Soulsight tokens. Whenever this operative is shooting an enemy operative that has one of your Soulsight tokens, all profiles of this operative\'s Sanctus sniper rifle have the Saturate weapon rule and that enemy operative cannot be obscured. This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'WYRMBLADE, TYRANIDS, GENESTEALER CULTS, CULT AGENT, SANCTUS, SNIPER'
);

card('SANCTUS TALON', 'Specialist',
  { APL: '3', MOVE: '6"', SAVE: '4+', WOUNDS: '9' },
  [
    { name: 'Sanctus bio-dagger', atk: '4', hit: '3+', dmg: '3/6', wr: 'Lethal 4+, Shock' },
  ],
  [
    { name: 'Creeping Shadow', description: 'This operative can perform the Charge action while it has a Conceal order. Whenever this operative performs the Fight action, it can immediately perform a free Dash or Fall Back action afterwards (for the latter, it cannot move more than 3"), even if it\'s performed an action that prevents it from performing those actions.' },
    { name: 'FAMILIAR SOULSIGHT (1AP)', description: 'Select one enemy operative visible to this operative. Until the end of the battle, or until this action is performed again by a friendly operative (whichever comes first), that enemy operative gains one of your Soulsight tokens. Whenever this operative is fighting or retaliating against an enemy operative that has one of your Soulsight tokens, its Sanctus bio-dagger has the Brutal and Balanced weapon rules. This operative cannot perform this action while within control Range of an enemy operative.' },
    { name: 'ASSASSINATE (2AP)', description: 'Select one enemy operative this operative isn\'t visible to. Perform a free Charge action with this operative, but don\'t exceed its Move stat (i.e. don\'t add 2"), and it must end that move within control Range of that enemy operative. Then immediately perform a free Fight action with this operative against that enemy operative. The first time you strike during that action, you can immediately resolve another of your successes as a strike (before your opponent). This operative cannot perform this action while it has an Engage order, or while within control Range of an enemy operative.' },
  ],
  'WYRMBLADE, TYRANIDS, GENESTEALER CULTS, CULT AGENT, SANCTUS, TALON'
);

card('NEOPHYTE WARRIOR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Autogun',  atk: '4', hit: '4+', dmg: '2/3', wr: '–' },
    { name: 'Shotgun',  atk: '4', hit: '3+', dmg: '3/3', wr: 'Range 6"' },
    { name: 'Gun butt', atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Group Activation', description: 'Whenever this operative is expended, you must then activate one other ready friendly WYRMBLADE WARRIOR operative (if able) before your opponent activates. When that other operative is expended, your opponent then activates as normal (in other words, you cannot activate more than two operatives in succession with this rule).' },
  ],
  'WYRMBLADE, TYRANIDS, GENESTEALER CULTS, NEOPHYTE, WARRIOR'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Wyrmblade populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
