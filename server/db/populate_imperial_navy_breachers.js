import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Imperial Navy Breachers'").get()?.id;
if (!FACTION_ID) { console.error('Imperial Navy Breachers faction not found'); process.exit(1); }

// Clear existing Imperial Navy Breachers data
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
  `1 IMPERIAL NAVY BREACHER SERGEANT-AT-ARMS operative with the following:
• Navis shotgun and Navis hatchet
• Or one option from each of the following:
  - Bolt pistol or heirloom autopistol
  - Chainsword or power weapon

10 IMPERIAL NAVY BREACHER operatives selected from the following list:
• ARMSMAN
• AXEJACK
• C.A.T. UNIT*
• ENDURANT
• GHEISTSKULL*
• GRENADIER
• GUNNER with Navis las-volley and gun butt
• GUNNER with meltagun and gun butt
• GUNNER with plasma gun and gun butt
• HATCHCUTTER
• SURVEYOR
• VOID-JAMMER

Other than ARMSMAN and GUNNER operatives, your kill team can only include each operative on this list once. Your kill team can only include up to two GUNNER operatives.

Your kill team can only include a GHEISTSKULL operative if it also includes a VOID-JAMMER operative, and it can only include a C.A.T. UNIT operative if it also includes a SURVEYOR operative.

*These operatives count as half a selection each, meaning you can select both of them and it\'s treated as one selection in total.`);

rule('faction_rules', null, 'BREACH AND CLEAR', 0,
  `Once per Turning Point, when a ready friendly IMPERIAL NAVY BREACHER operative is activated, you can use this rule. If you do, select one other ready friendly IMPERIAL NAVY BREACHER operative visible to and within 3" of that operative. When that first friendly operative is expended, you can activate that other friendly operative before your opponent activates. When that other operative is expended, your opponent then activates as normal.`);

rule('faction_rules', null, 'VOID ARMOUR', 0,
  `Whenever an operative is shooting a friendly IMPERIAL NAVY BREACHER operative, if the ranged weapon in that sequence has the Blast or Torrent weapon rule (excluding weapons that have a sweeping profile), you can re-roll one of your defence dice, or up to two of your defence dice if that friendly operative is a GRENADIER.

Friendly IMPERIAL NAVY BREACHER operatives aren\'t affected by the x" Devastating x weapon rule (i.e. Devastating with a distance) unless they are the target during that sequence.`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'ATTACK ORDER', 1,
  `Place your Attack Order marker in the killzone. Whenever a friendly IMPERIAL NAVY BREACHER operative within 3" of that marker is shooting, fighting or retaliating, its weapons have the Ceaseless weapon rule. In the Ready step of the next Strategy phase, remove that marker. You cannot use this ploy and the Defence Order strategy ploy in the same Strategy phase.`);

rule('ploy', 'Strategy', 'BRACE FOR COUNTERATTACK', 1,
  `Whenever an operative is shooting against, fighting against or retaliating against a friendly IMPERIAL NAVY BREACHER operative that\'s in your territory or that hasn\'t performed the Charge, Fall Back or Reposition action during this turning point, Normal and Critical Dmg of 3 or more inflicts 1 less damage on that friendly operative.`);

rule('ploy', 'Strategy', 'CLOSE ASSAULT', 1,
  `Whenever a friendly IMPERIAL NAVY BREACHER operative is fighting or shooting an operative within 3" of it:
• Add 1 to both Dmg stats of all profiles of its Navis shotguns or Navis heavy shotguns (if any).
• If you roll two or more fails, you can discard one of them to retain another as a normal success instead.`);

rule('ploy', 'Strategy', 'DEFENCE ORDER', 1,
  `Place your Defence Order marker in the killzone. Whenever an operative is shooting a friendly IMPERIAL NAVY BREACHER operative that\'s within 3" of that marker, you can re-roll any of your defence dice results of one result (e.g. results of 2). In the Ready step of the next Strategy phase, remove that marker. You cannot use this ploy and the Attack Order strategy ploy in the same Strategy phase.`);

rule('ploy', 'Firefight', 'BLITZ', 1,
  `Use this firefight ploy when a friendly IMPERIAL NAVY BREACHER operative performs the Shoot or Fight action, and you select an enemy operative within 6" of it as a valid target or to fight against. If it\'s the first friendly operative to perform either of those actions during this turning point, its weapons have the Accurate 1 weapon rule for that action. If it\'s the first friendly operative to be activated during this turning point, its weapons also have the Severe weapon rule for that action.`);

rule('ploy', 'Firefight', 'DECK HAND', 1,
  `Use this firefight ploy during a friendly IMPERIAL NAVY BREACHER operative\'s activation, before or after it performs an action. That operative can move through one Accessible terrain feature without it counting as an additional 1" and/or perform a free Operate Hatch action during its activation, and can do so during the Charge or Fall Back action. You cannot use this ploy if the access point has been welded shut (see HATCHCUTTER operative) unless it\'s a friendly HATCHCUTTER operative\'s activation.`);

rule('ploy', 'Firefight', 'LOCK IT DOWN', 1,
  `Use this firefight ploy when a friendly IMPERIAL NAVY BREACHER operative is activated. Select one objective marker. Until the end of the battle or until you use this ploy again (whichever comes first), when determining control of that objective marker, treat that friendly operative\'s APL stat as 1 higher. Note this isn\'t a change to the APL stat, so any changes are cumulative with this.`);

rule('ploy', 'Firefight', 'OVERWHELM TARGET', 1,
  `Use this firefight ploy when you activate either friendly IMPERIAL NAVY BREACHER operative while using the Breach and Clear faction rule. Until the end of that operative\'s activation, add 1 to its APL stat.`);

// ── TACOPS ───────────────────────────────────────────────────────────────────

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

rule('equipment', null, 'REBREATHERS', 0,
  'You can ignore any changes to the APL stats of friendly IMPERIAL NAVY BREACHER operatives, and they aren\'t affected by enemy operatives\' Shock weapon rule.');

rule('equipment', null, 'SLUGS', 0,
  'Up to three times per turning point, whenever a friendly IMPERIAL NAVY BREACHER operative is performing the Shoot action and you select a navis shotgun (long range), you can use this rule. If you do, until the end of that action, improve the Hit stat of that weapon by 1 and add 1 to both of its Dmg stats.');

rule('equipment', null, 'COMBAT STIMMS', 0,
  'You can ignore any changes to the Move stat of friendly IMPERIAL NAVY BREACHER operatives from being injured.');

rule('equipment', null, 'SYSTEM OVERRIDE DEVICE', 0,
  'Once per turning point, one friendly IMPERIAL NAVY BREACHER operative can perform the Operate Hatch action for 1 less AP.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('NAVIS SERGEANT-AT-ARMS', 'Leader',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '9' },
  [
    { name: 'Bolt pistol',                  atk: '4', hit: '4+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Heirloom autopistol',          atk: '4', hit: '3+', dmg: '2/4', wr: 'Range 8", Lethal 5+' },
    { name: 'Navis shotgun – Short range',  atk: '4', hit: '3+', dmg: '3/3', wr: 'Range 6"' },
    { name: 'Navis shotgun – Long range',   atk: '4', hit: '5+', dmg: '1/2', wr: '–' },
    { name: 'Chainsword',                   atk: '4', hit: '3+', dmg: '4/5', wr: '–' },
    { name: 'Navis hatchet',                atk: '3', hit: '4+', dmg: '3/4', wr: '–' },
    { name: 'Power weapon',                 atk: '4', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Command Breach', description: 'Whenever you would use the Attack Order or Defence Order strategy ploy, if this operative is in the killzone, it costs you 0CP. Once during each of this operative\'s activations, before or after it performs an action, if your Attack Order or Defence Order marker is in the killzone (see relevant strategy ploy), you can either:\n• Remove that marker and place it again.\n• Change the selected ploy to the other (e.g. your Attack Order becomes a Defence Order).\nYou cannot do both, and you don\'t need to spend any CP to change the ploy.' },
  ],
  'IMPERIAL NAVY BREACHERS, IMPERIUM, LEADER, SERGEANT-AT-ARMS'
);

card('NAVIS ARMSMAN', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Navis shotgun – Short range', atk: '4', hit: '3+', dmg: '3/3', wr: 'Range 6"' },
    { name: 'Navis shotgun – Long range',  atk: '4', hit: '5+', dmg: '1/2', wr: '–' },
    { name: 'Navis hatchet',               atk: '3', hit: '4+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Group Activation', description: 'Whenever this operative is expended, you must then activate one other ready friendly IMPERIAL NAVY BREACHER ARMSMAN operative (if able) before your opponent activates. When that other operative is expended, your opponent then activates as normal (in other words, you cannot activate more than two operatives in succession with this rule). Ignore this rule when you are using the Breach and Clear faction rule.' },
  ],
  'IMPERIAL NAVY BREACHERS, IMPERIUM, ARMSMAN'
);

card('NAVIS AXEJACK', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Autopistol',    atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Power weapon',  atk: '4', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Emboldened', description: 'Whenever an attack dice inflicts damage of 3 or more on this operative during a turning point in which it performed the Charge action, roll one D6: on a 5+, subtract 1 from that inflicted damage.' },
  ],
  'IMPERIAL NAVY BREACHERS, IMPERIUM, AXEJACK'
);

card('NAVIS C.A.T. UNIT', 'Warrior',
  { APL: '2', MOVE: '8"', SAVE: '5+', WOUNDS: '5' },
  [],
  [
    { name: 'Machine', description: 'This operative cannot be activated or perform actions if it\'s within control Range of an enemy operative, or if a friendly IMPERIAL NAVY BREACHER SURVEYOR operative has been incapacitated. The turning point can end even if this operative is still ready.\n\nThis operative cannot perform any actions other than Charge, Dash, Fall Back, Reposition and Spot.\n\nIt cannot retaliate, assist in a fight, climb or jump.\n\nWhenever determining control of a marker, treat this operative\'s APL stat as 1 lower. Note this isn\'t a change to its APL stat, so any changes are cumulative with this.\n\n\'Whenever this operative has a Conceal order and is in cover, it cannot be selected as a valid target, taking precedence over all other rules (e.g. Seek, Vantage terrain) except being within 2".\n\nWhenever determining what\'s visible to this operative, draw the line from any part of the miniature.' },
    { name: 'Expendable', description: 'This operative is ignored for your opponent\'s kill/elimination op (when it\'s incapacitated, and when determining your starting number of operatives). It\'s also ignored for victory conditions and scoring VPs if either require operatives to \'escape\', \'survive\' or be incapacitated by enemy operatives (if it escapes/survives/is incapacitated, determining how many operatives must escape/survive/be incapacitated, etc.).' },
    { name: 'SPOT (1AP)', description: 'Select one enemy operative visible to this operative. Until the end of the turning point, until that enemy operative is no longer visible to this operative or until this operative performs this action again (whichever comes first), whenever a friendly IMPERIAL NAVY BREACHER operative is shooting that enemy operative, you can use this effect. If you do:\n• That friendly operative\'s ranged weapons have the Seek Light weapon rule.\n• That enemy operative cannot be obscured.\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'IMPERIAL NAVY BREACHERS, IMPERIUM, C.A.T. UNIT'
);

card('NAVIS ENDURANT', 'Warrior',
  { APL: '2', MOVE: '4"', SAVE: '2+', WOUNDS: '11' },
  [
    { name: 'Navis heavy shotgun – Short range', atk: '4', hit: '3+', dmg: '3/3', wr: 'Range 6", Relentless' },
    { name: 'Navis heavy shotgun – Long range',  atk: '4', hit: '5+', dmg: '1/2', wr: 'Relentless' },
    { name: 'Shield bash',                       atk: '3', hit: '4+', dmg: '1/2', wr: 'Brutal, Shield*' },
  ],
  [
    { name: 'Breachwall', description: 'Whenever your opponent is selecting a valid target, they cannot select another friendly IMPERIAL NAVY BREACHER operative whose base is touching this operative\'s if this operative has an Engage order and is intervening. This rule has no effect if more than one other friendly operative\'s base is touching this operative\'s.' },
    { name: '*Shield', description: 'Whenever this operative is fighting or retaliating with this weapon, each of your blocks can be allocated to block two unresolved successes (instead of one).' },
    { name: 'Disengage', description: 'This operative can perform the Fall Back action for 1 less AP.' },
  ],
  'IMPERIAL NAVY BREACHERS, IMPERIUM, ENDURANT'
);

card('NAVIS GHEISTSKULL', 'Warrior',
  { APL: '2', MOVE: '8"', SAVE: '5+', WOUNDS: '5' },
  [],
  [
    { name: 'Machine', description: 'This operative cannot perform any actions other than Boost, Charge, Dash, Fall Back and Reposition.\n\nIt cannot retaliate or assist in a fight.\n\nWhenever determining control of a marker, treat this operative\'s APL stat as 1 lower. Note this isn\'t a change to its APL stat, so any changes are cumulative with this.\n\n\'Whenever this operative has a Conceal order and is in cover, it cannot be selected as a valid target, taking precedence over all other rules (e.g. Seek, Vantage terrain) except being within 2".' },
    { name: 'Expendable', description: 'This operative is ignored for your opponent\'s kill/elimination op (when it\'s incapacitated, and when determining your starting number of operatives). It\'s also ignored for victory conditions and scoring VPs if either require operatives to \'escape\', \'survive\' or be incapacitated by enemy operatives (if it escapes/survives/is incapacitated, determining how many operatives must scape/survive/be incapacitated, etc.).' },
    { name: 'BOOST (1AP)', description: 'Until the end of the activation, add 6" to this operative\'s Move stat. This operative can only perform this action once per battle, and cannot perform it during the first turning point.' },
  ],
  'IMPERIAL NAVY BREACHERS, IMPERIUM, GHEISTSKULL'
);

card('NAVIS GRENADIER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Demolition charge',           atk: '4', hit: '3+', dmg: '4/6', wr: 'Range 3", Blast 2", Heavy (Reposition only), Limited 1, Piercing 1, Saturate' },
    { name: 'Navis shotgun – Short range', atk: '4', hit: '3+', dmg: '3/3', wr: 'Range 6"' },
    { name: 'Navis shotgun – Long range',  atk: '4', hit: '5+', dmg: '1/2', wr: '–' },
    { name: 'Navis hatchet',               atk: '3', hit: '4+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Grenadier', description: 'This operative can use frag, krak and Stun grenades (see universal equipment). Doing so doesn\'t count towards any Limited uses you have (i.e. if you also select those grenades from equipment for other operatives). Whenever this operative is using a frag or krak grenade, improve the Hit stat of that weapon by 1.' },
  ],
  'IMPERIAL NAVY BREACHERS, IMPERIUM, GRENADIER'
);

card('NAVIS GUNNER (Las-volley)', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '9' },
  [
    { name: 'Navis las-volley (focused) – Focused',   atk: '5', hit: '4+', dmg: '4/5', wr: 'Heavy (Dash only), Rending' },
    { name: 'Navis las-volley (focused) – Sweeping',  atk: '4', hit: '4+', dmg: '4/5', wr: 'Heavy (Dash only), Rending, Torrent 1' },
    { name: 'Gun butt',                               atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [],
  'IMPERIAL NAVY BREACHERS, IMPERIUM, GUNNER'
);

card('NAVIS GUNNER (Meltagun)', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '9' },
  [
    { name: 'Meltagun',  atk: '4', hit: '4+', dmg: '6/3', wr: 'Range 6", Devastating 4, Piercing 2' },
    { name: 'Gun butt',  atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [],
  'IMPERIAL NAVY BREACHERS, IMPERIUM, GUNNER'
);

card('NAVIS GUNNER (Plasma gun)', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '9' },
  [
    { name: 'Plasma gun – Standard',    atk: '4', hit: '4+', dmg: '4/6', wr: 'Piercing 1' },
    { name: 'Plasma gun – Supercharge', atk: '4', hit: '4+', dmg: '5/6', wr: 'Hot, Lethal 5+, Piercing 1' },
    { name: 'Gun butt',                 atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [],
  'IMPERIAL NAVY BREACHERS, IMPERIUM, GUNNER'
);

card('NAVIS HATCHCUTTER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Autopistol', atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Chainfist',  atk: '4', hit: '4+', dmg: '5/6', wr: 'Brutal, Rending' },
  ],
  [
    { name: 'WELD SHUT (1AP)', description: 'Select a closed hatchway (e.g. Killzone: Gallowdark) within this operative\'s control Range. 1 additional AP must be spent for other operatives to perform the Operate Hatch action to open that hatchway. This effect ends when that hatchway is opened. Note this operative isn\'t affected by this effect.\n\nThis operative cannot perform this action while within control Range of an enemy operative, or if it isn\'t within 1" of a closed hatchway.' },
    { name: 'BREACH POINT (1AP)', description: 'Place one of your Breach markers within this operative\'s control Range as close as possible to a terrain feature within control Range of it. Whenever an operative is within 1" of that marker, it treats parts of that terrain feature that are no more than 1" thick as Accessible terrain.\n\nThis operative cannot perform this action while within control Range of an enemy operative, or if a terrain feature isn\'t within its control Range.' },
  ],
  'IMPERIAL NAVY BREACHERS, IMPERIUM, HATCHCUTTER'
);

card('NAVIS SURVEYOR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Navis shotgun – Short range', atk: '4', hit: '3+', dmg: '3/3', wr: 'Range 6"' },
    { name: 'Navis shotgun – Long range',  atk: '4', hit: '5+', dmg: '1/2', wr: '–' },
    { name: 'Navis hatchet',               atk: '3', hit: '4+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'WAYFIND (1AP)', description: 'SUPPORT. Select one other friendly IMPERIAL NAVY BREACHER operative (excluding C.A.T. UNIT or GHEISTSKULL) visible to and within 6" of this operative, or visible to and within 6" of a friendly IMPERIAL NAVY BREACHER C.A.T. UNIT operative. Until the end of that operative\'s next activation, add 1 to its APL stat. For the purposes of the Comms Device universal equipment, the operative the distance is being determined from must control that marker.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
    { name: 'REMOTE CONTROL (1AP)', description: 'Select one friendly IMPERIAL NAVY BREACHER C.A.T. UNIT operative. That operative can immediately perform one free action, but it cannot move more than 3" during that action.\n\nThis operative cannot perform this action while within control Range of an enemy operative, or if a friendly IMPERIAL NAVY BREACHER C.A.T. UNIT operative isn\'t in the killzone.' },
  ],
  'IMPERIAL NAVY BREACHERS, IMPERIUM, SURVEYOR'
);

card('NAVIS VOID-JAMMER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Gheistskull detonator',       atk: '4', hit: '3+', dmg: '3/4', wr: 'Blast 1", Lethal 4+, Limited 1, Silent, Stun, Detonate*' },
    { name: 'Navis shotgun – Short range', atk: '4', hit: '3+', dmg: '3/3', wr: 'Range 6"' },
    { name: 'Navis shotgun – Long range',  atk: '4', hit: '5+', dmg: '1/2', wr: '–' },
    { name: 'Navis hatchet',               atk: '3', hit: '4+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: '*Detonate', description: 'Don\'t select a valid target. Instead, a friendly IMPERIAL NAVY BREACHER GHEISTSKULL operative is always the primary target and cannot be in cover or obscured. If that operative isn\'t in the killzone, you cannot select this weapon.' },
    { name: 'INTERFERENCE PULSE (1AP)', description: 'Select one enemy operative visible to and within 8" of a friendly GHEISTSKULL operative. Roll one D6, adding 1 to the result if that enemy operative is a valid target for that friendly GHEISTSKULL operative: on a 3+, subtract 1 from that enemy operative\'s APL stat until the end of its next activation.\n\nThis operative cannot perform this action while within control Range of an enemy operative, or if a friendly GHEISTSKULL operative isn\'t in the killzone.' },
  ],
  'IMPERIAL NAVY BREACHERS, IMPERIUM, VOID-JAMMER'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Imperial Navy Breachers populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
