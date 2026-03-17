import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Hierotek Circle'").get()?.id;
if (!FACTION_ID) { console.error('Hierotek Circle faction not found'); process.exit(1); }

// Clear existing Hierotek Circle data
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
  'Archetypes: SECURITY, RECON');

rule('faction_rules', null, 'OPERATIVES', 0,
  `1 HIEROTEK CIRCLE operative selected from the following list:
• CHRONOMANCER operative with one of the following options:
  - Aeonstave
  - Entropic lance
• PSYCHOMANCER
• TECHNOMANCER

1 PLASMACYTE ACCELERATOR operative

1 PLASMACYTE REANIMATOR operative

5 HIEROTEK CIRCLE operatives selected from the following list:
• APPRENTEK
• DEATHMARK
• DESPOTEK with one of the following options:
  - Gauss blaster; bayonet
  - Tesla carbine; bayonet
• GUARDIAN with one of the following options:
  - Gauss blaster; bayonet
  - Tesla carbine; bayonet

Other than DEATHMARK and GUARDIAN operatives, your kill team can only include each operative above once.`);

rule('faction_rules', null, 'LIVING METAL', 0,
  'In the Ready step of each Strategy phase, after resolving all other rules in this step (e.g. Reanimation Protocols faction rule), each friendly HIEROTEK CIRCLE operative regains D3+1 lost wounds (roll separately for each).');

rule('faction_rules', null, 'REANIMATION PROTOCOLS', 0,
  `The first time each friendly HIEROTEK CIRCLE operative is incapacitated, before it\'s removed from the killzone, place one of your Reanimation markers within its control range. Then remove it as incapacitated, also removing any tokens and rules effects it had (e.g. CHRONOMANCER operative\'s Chronometron action, Poison tokens, APL stat changes, being implanted, etc.).

In the Ready step of each Strategy phase, select one of your Reanimation markers and roll one D6: on a 1-2, leave that Reanimation marker in the killzone and repeat this process with a different one of your Reanimation markers (if any); on a 3+, an operative is REANIMATED.

You can only select each of your Reanimation markers once per turning point, and once you roll a 3+, you don\'t select any more for that turning point. Whenever an operative is REANIMATED:

• Set up the operative that Reanimation marker was placed for (it\'s no longer incapacitated). It must be placed within 3" of that Reanimation marker and not within control range of enemy operatives (if you cannot do so, treat the roll as 1-2 instead).
• It has 1 wounds remaining.
• It has an order of your choice and is ready.
• Remove that Reanimation marker.

For the purposes of the kill op, your opponent treats your starting number of HIEROTEK CIRCLE operatives as 5 (in other words, their kill grade goes up whenever a friendly HIEROTEK CIRCLE operative is incapacitated, to a maximum kill grade of 5 and goes down whenever a friendly HIEROTEK CIRCLE operative is REANIMATED). REANIMATED operatives don\'t retroactively change any other VPs your opponent has scored, e.g. from tac ops.`);

rule('faction_rules', null, 'MAGNIFY', 0,
  `Some HIEROTEK CIRCLE APPRENTEK and HIEROTEK CIRCLE CRYPTEK weapons in this team\'s rules have the Magnify weapon rule below.

*Magnify: Whenever this operative is performing the Shoot action with this weapon, if the target is visible to this operative, and another friendly HIEROTEK CIRCLE APPRENTEK or HIEROTEK CIRCLE CRYPTEK operative, that has an Engage order and isn\'t within control range of enemy operatives is visible to this operative, you can use this rule. If you do, treat that operative as the active operative for the purposes of determining a valid target, that Shoot action\'s conditions, cover and obscured. If you do, this weapon has the Ceaseless weapon rule until the end of that action.`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'RELENTLESS ONSLAUGHT', 1,
  'Whenever a friendly HIEROTEK CIRCLE operative is shooting an operative within 8" of it, that friendly operative\'s ranged weapons have the Balanced weapon rule. Note that when you\'re using the Magnify weapon rule, this operative must still be within 8" of the target to use this rule (not the other friendly operative from which you\'re determining a valid target).');

rule('ploy', 'Strategy', 'UNDYING ANDROIDS', 1,
  'Whenever an operative is shooting a friendly HIEROTEK CIRCLE operative, if you cannot retain any cover saves, you can retain one of your defence dice as a normal success without rolling it.');

rule('ploy', 'Strategy', 'METHODICAL ELIMINATION', 1,
  'Friendly HIEROTEK CIRCLE operatives\' melee weapons have the Accurate 1 weapon rule. Whenever a friendly HIEROTEK CIRCLE operative is fighting during an activation in which it hasn\'t moved more than its Move stat, or whenever it\'s retaliating, its melee weapons have the Accurate 2 weapon rule instead.');

rule('ploy', 'Strategy', 'COMMAND UNDERLINGS', 1,
  `Select one of the following:
• SUPPORT. Each other friendly HIEROTEK CIRCLE operative visible and within 6" of a friendly CRYPTEK operative can immediately perform a free Dash action in an order of your choice.
• SUPPORT. Each other friendly HIEROTEK CIRCLE operative (excluding CRYPTEK) visible to and within 3" of a friendly APPRENTEK operative can immediately perform a free Dash action in an order of your choice.`);

rule('ploy', 'Firefight', 'CORTICAL CONTROL', 1,
  'Use this firefight ploy when a friendly APPRENTEK HIEROTEK CIRCLE or CRYPTEK HIEROTEK CIRCLE operative performs a SUPPORT unique action. Until the end of that action, for the purposes of selecting another friendly operative, ignore the distance requirement (only visibility is a requirement).');

rule('ploy', 'Firefight', 'REANIMATED FUNCTION', 1,
  'Use this firefight ploy when determining control of a marker. Select one of your Reanimation markers. Until the start of the next turning point, whenever determining control of a marker, treat that Reanimation marker as a friendly HIEROTEK CIRCLE operative that has an APL stat of 1. For the purposes of the Martyrs tac op (Approved Ops 2025), this ploy has no effect.');

rule('ploy', 'Firefight', 'LIVING LIGHTNING', 1,
  'Use this firefight ploy when a friendly IMMORTAL HIEROTEK CIRCLE operative is performing the Shoot action and you select a tesla carbine. Until the end of that action, that weapon doesn\'t have the 2" from its Devastating weapon rule but has the Blast 2" weapon rule.');

rule('ploy', 'Firefight', 'DIMENSIONAL AMBUSH', 1,
  'Use this firefight ploy during a friendly DEATHMARK HIEROTEK CIRCLE operative\'s activation, if it has a Conceal order. During that activation, that operative can perform the Guard action (see close quarters rules, Kill Team Core Book) in any killzone and while it has a Conceal order, but when you interrupt for the free Fight or Shoot action during the interruption, you must change its order to Engage.');

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

rule('equipment', null, 'MAGNIFICATION CONDUITS', 0,
  'Once per turning point, when a friendly APPRENTEK HIEROTEK CIRCLE or CRYPTEK HIEROTEK CIRCLE operative is performing the Shoot action, you can use this rule. If you do, select one other friendly HIEROTEK CIRCLE operative (excluding PLASMACYTE) that has an Engage order and is visible to that friendly operative. Until the end of that action, that other friendly operative can be treated as the active operative for the Magnify weapon rule.');

rule('equipment', null, 'TESSERACT CUBE', 0,
  'In the Ready step of each Strategy phase, when you gain CP, if a friendly CRYPTEK operative isn\'t incapacitated, isn\'t within control range of enemy operatives and hasn\'t been REANIMATED this turning point, you can use this rule. If you do, roll one D6: on a 1, you cannot use this rule for the rest of the battle; on a 4+, you gain 1CP. Once you have gained 2CP from this rule, you cannot use it for the rest of the battle.');

rule('equipment', null, 'TESLA WEAVE', 0,
  'Once per turning point, when an enemy operative ends the Charge action with friendly HIEROTEK CIRCLE operatives within its control range, you can use this rule. If you do, inflict D3+1 damage on that enemy operative.');

rule('equipment', null, 'PHASE SHIFTER', 0,
  'Once per turning point, when an operative is shooting a friendly CRYPTEK operative, at the start of the Roll Defence Dice step, you can use this rule. If you do, worsen the x of the Piercing weapon rule by 1 (if any) until the end of that sequence. Note that Piercing 1 would therefore be ignored.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('CHRONOMANCER', 'Leader',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Aeonstave (ranged)',   atk: '5', hit: '3+', dmg: '3/3', wr: 'Blast 2", Lethal 5+, Stun, Magnify*' },
    { name: 'Entropic lance (ranged)', atk: '4', hit: '3+', dmg: '5/3', wr: 'Devastating 3, Piercing 1, Magnify*' },
    { name: 'Aeonstave (melee)',    atk: '4', hit: '4+', dmg: '3/4', wr: 'Lethal 5+, Shock' },
    { name: 'Entropic lance (melee)', atk: '4', hit: '4+', dmg: '3/6', wr: '–' },
  ],
  [
    { name: 'INTERSTITIAL COMMAND (1AP)', description: 'SUPPORT. Select one other friendly HIEROTEK CIRCLE operative (excluding APPRENTEK and CRYPTEK) visible to and within 6" of this operative, or within 6" of a friendly DESPOTEK operative that\'s visible to this operative. That selected operative can immediately perform a 1AP action for free; it cannot move more than or be removed and set up more than 2" during that action, perform an action it\'s already performed during this turning point, or perform that action again during this turning point.\n\nThis operative cannot perform this action while within control Range of an enemy operative, or while counteracting.' },
    { name: 'TIMESPLINTER (1AP)', description: 'SUPPORT. Select one other expended friendly HIEROTEK CIRCLE operative visible to and within 5" of this operative. Remove it from the killzone and set it back up visible to and within 5" of this operative, measuring the horizontal distance only, in a location it can be placed. Note that a Comms Device from universal equipment only affects the first distance of this rule.\n\nThis operative cannot perform this action while within control Range of an enemy operative, during the first turning point, or if a friendly operative has already performed this action during this turning point.' },
    { name: 'COUNTERTEMPORAL NANOMINE (1AP)', description: 'Place your Countertemporal Nanomine marker visible to this operative, or on Vantage terrain of a terrain feature that\'s visible to this operative. Whenever an enemy operative is within 4" of your Countertemporal Nanomine marker, subtract 2" from its Move stat. When this operative is next activated, is incapacitated or this action is performed again by a friendly operative (whichever comes first), remove that marker.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
    { name: 'CHRONOMETRON (1AP)', description: 'SUPPORT. Select one friendly HIEROTEK CIRCLE operative visible to and within 6" of this operative. Until the start of this operative\'s next activation, until this operative is incapacitated or until this action is performed again by a friendly operative (whichever comes first), subtract 1 from the Atk stat of an operative\'s weapons whenever it\'s shooting against that selected operative.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'HIEROTEK CIRCLE, NECRON, LEADER, CRYPTEK, CHRONOMANCER'
);

card('PSYCHOMANCER', 'Leader',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Abyssal lance (ranged)', atk: '5', hit: '3+', dmg: '2/2', wr: 'Blast 2", 2" Devastating 1, Piercing 2, Magnify*' },
    { name: 'Abyssal lance (melee)', atk: '4', hit: '4+', dmg: '4/4', wr: 'Devastating 1' },
  ],
  [
    { name: 'INTERSTITIAL COMMAND (1AP)', description: 'SUPPORT. Select one other friendly HIEROTEK CIRCLE operative (excluding APPRENTEK and CRYPTEK) visible to and within 6" of this operative, or within 6" of a friendly DESPOTEK operative that\'s visible to this operative. That selected operative can immediately perform a 1AP action for free; it cannot move more than or be removed and set up more than 2" during that action, perform an action it\'s already performed during this turning point, or perform that action again during this turning point.\n\nThis operative cannot perform this action while within control Range of an enemy operative, or while counteracting.' },
    { name: 'HARBINGER OF DESPAIR (1AP)', description: 'Place your Despair marker visible to this operative, or on Vantage terrain of a terrain feature that\'s visible to this operative. When this operative is next activated, is incapacitated or this action is performed again by a friendly operative (whichever comes first), remove that marker.\n\nWhenever an enemy operative is within 2" of your Despair marker, your opponent must spend 1 additional AP for that enemy operative to perform the Pick Up Marker and mission actions. When determining control of a marker, treat the total APL stat of enemy operatives that contest it as 1 lower if at least one of those enemy operatives is within 2" of your Despair marker. Note this isn\'t a change to the APL stat, so any changes are cumulative with this.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
    { name: 'NIGHTMARE SHROUD (1AP)', description: 'Until the start of this operative\'s next activation, until it\'s incapacitated or until this action is performed again by a friendly operative (whichever comes first), whenever an enemy operative within 4" of this operative is shooting, fighting or retaliating, your opponent cannot re-roll their attack dice and cannot retain attack dice results of less than 6 as critical successes (e.g. as a result of the Lethal, Rending or Severe weapon rules).\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
    { name: 'VISION OF MADNESS (1AP)', description: 'Select one enemy operative visible to this operative. Until the start of this operative\'s next activation, until it\'s incapacitated or until this action is performed again by a friendly operative (whichever comes first), that selected operative gains one of your Madness tokens.\n\nWhenever your opponent would activate an enemy operative that has one of your Madness tokens, you can roll one D6: if the result is equal to or higher than that enemy operative\'s APL, they cannot activate it during this activation. If that operative is successfully activated, or there are no other enemy operatives eligible to be activated, remove its Madness token.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'HIEROTEK CIRCLE, NECRON, LEADER, CRYPTEK, PSYCHOMANCER'
);

card('TECHNOMANCER', 'Leader',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Staff of light (ranged)', atk: '6', hit: '3+', dmg: '3/4', wr: 'Rending, Magnify*' },
    { name: 'Staff of light (melee)', atk: '4', hit: '4+', dmg: '3/5', wr: 'Rending' },
  ],
  [
    { name: 'INTERSTITIAL COMMAND (1AP)', description: 'SUPPORT. Select one other friendly HIEROTEK CIRCLE operative (excluding APPRENTEK and CRYPTEK) visible to and within 6" of this operative, or within 6" of a friendly DESPOTEK operative that\'s visible to this operative. That selected operative can immediately perform a 1AP action for free; it cannot move more than or be removed and set up more than 2" during that action, perform an action it\'s already performed during this turning point, or perform that action again during this turning point.\n\nThis operative cannot perform this action while within control Range of an enemy operative, or while counteracting.' },
    { name: 'CANOPTEK REPAIR (1AP)', description: 'SUPPORT. Select one friendly HIEROTEK CIRCLE operative visible to and within 6" of this operative to regain up to 2D3 lost wounds.\n\nThis operative cannot perform this action while within control Range of an enemy operative, or if a friendly operative has already performed this action during this turning point.' },
    { name: 'AUGMENT WEAPON (1AP)', description: 'SUPPORT. Select one friendly HIEROTEK CIRCLE operative visible to and within 6" of this operative. Until the start of this operative\'s next activation, until it\'s incapacitated or until this action is performed again by a friendly operative (whichever comes first), select two of the following weapon rules for one weapon from that selected operative\'s datacard to have: Lethal 5+, Rending, Saturate, Severe.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
    { name: 'REINFORCE METAL (1AP)', description: 'SUPPORT. Select one friendly HIEROTEK CIRCLE operative visible to and within 6" of this operative. Until the start of this operative\'s next activation, until it\'s incapacitated or until this action is performed again by a friendly operative (whichever comes first), whenever an attack dice inflicts damage of 3 or more on that operative, subtract 1 from that inflicted damage.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'HIEROTEK CIRCLE, NECRON, MEDIC, LEADER, CRYPTEK, TECHNOMANCER'
);

card('PLASMACYTE ACCELERATOR', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '5+', WOUNDS: '5' },
  [
    { name: 'Spark', atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 4", Piercing 1' },
    { name: 'Claws', atk: '3', hit: '5+', dmg: '1/2', wr: '–' },
  ],
  [
    { name: 'Scuttler', description: '• Whenever this operative has a Conceal order and is in cover, it cannot be selected as a valid target, taking precedence over all other rules (e.g., Seek, Vantage terrain) except within 2".\n• This operative can perform the Fall Back action for 1 less AP.\n• This operative cannot use any weapons that aren\'t on its datacard, or perform unique actions other than Accelerate.' },
    { name: 'ACCELERATE (1AP)', description: 'SUPPORT. Select one friendly DEATHMARK or IMMORTAL operative visible to and within 6" of this operative. Until the end of that operative\'s next activation, add 1 to its APL stat.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'HIEROTEK CIRCLE, NECRON, PLASMACYTE, ACCELERATOR'
);

card('PLASMACYTE REANIMATOR', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '5+', WOUNDS: '5' },
  [
    { name: 'Spark', atk: '4', hit: '4+', dmg: '3/4', wr: 'Range 6", Lethal 5+' },
    { name: 'Claws', atk: '3', hit: '5+', dmg: '1/2', wr: '–' },
  ],
  [
    { name: 'Scuttler', description: '• Whenever this operative has a Conceal order and is in cover, it cannot be selected as a valid target, taking precedence over all other rules (e.g., Seek, Vantage terrain) except within 2".\n• This operative can perform the Fall Back action for 1 less AP.\n• This operative cannot use any weapons that aren\'t on its datacard, or perform unique actions other than Reanimate.' },
    { name: 'REANIMATE (1/2AP)', description: 'Select one of your Reanimation markers visible to and within 6" of this operative. Roll one D6: on a 3+, a friendly operative is REANIMATED; if you spent 1 additional AP, a friendly operative is automatically REANIMATED (you don\'t need to roll one D6). An operative that\'s REANIMATED from this unique action is set up expended if it was already expended during this turning point.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'HIEROTEK CIRCLE, NECRON, MEDIC, PLASMACYTE, REANIMATOR'
);

card('APPRENTEK', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '3+', WOUNDS: '11' },
  [
    { name: 'Arcane conduit (ranged)', atk: '4', hit: '3+', dmg: '4/5', wr: 'Piercing 1, Magnify*' },
    { name: 'Arcane conduit (melee)', atk: '3', hit: '4+', dmg: '3/5', wr: '–' },
  ],
  [
    { name: 'Apprentek Assistance', description: 'This operative has the same unique actions as your CRYPTEK operative selected for the battle, but can only perform one CRYPTEK unique action per turning point.' },
  ],
  'HIEROTEK CIRCLE, NECRON, APPRENTEK'
);

card('DEATHMARK', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '3+', WOUNDS: '10' },
  [
    { name: 'Synaptic disintegrator', atk: '4', hit: '2+', dmg: '4/3', wr: 'Devastating 2, Heavy (Dash only), Piercing 1, Severe' },
    { name: 'Fists',                  atk: '3', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Deathmarked', description: 'Whenever this operative ends the Shoot action, the target gains one of your Deathmarked tokens if it wasn\'t incapacitated (the primary target, if relevant). Whenever a friendly HIEROTEK CIRCLE DEATHMARK operative is shooting an enemy operative that has one of your Deathmarked tokens, that friendly operative\'s ranged weapons have the Seek weapon rule.' },
    { name: 'MULTI-DIMENSIONAL VISION (1AP)', description: 'Until the start of this operative\'s next activation, whenever it\'s shooting, enemy operatives cannot be obscured.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'HIEROTEK CIRCLE, NECRON, DEATHMARK'
);

card('IMMORTAL DESPOTEK', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '3+', WOUNDS: '11' },
  [
    { name: 'Gauss blaster',  atk: '4', hit: '3+', dmg: '4/5', wr: 'Piercing 1' },
    { name: 'Tesla carbine',  atk: '5', hit: '3+', dmg: '3/3', wr: '2" Devastating 1' },
    { name: 'Bayonet',        atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Steadfast', description: 'Whenever determining control of a marker, you can treat this operative\'s APL stat as 3. If you do, this takes precedence over all other rules, meaning any changes to its APL stat are ignored for this.' },
    { name: 'INTERSTITIAL COMMAND (1AP)', description: 'SUPPORT. Select one other friendly HIEROTEK CIRCLE operative (excluding APPRENTEK and CRYPTEK) visible to and within 6" of this operative. That selected operative can immediately perform a 1AP action for free (excluding Accelerate); it cannot move more than or be removed and set up more than 2" during that action, perform an action it\'s already performed during this turning point, or perform that action again during this turning point.\n\nThis operative cannot perform this action while within control Range of an enemy operative, or while counteracting.' },
  ],
  'HIEROTEK CIRCLE, NECRON, IMMORTAL, DESPOTEK'
);

card('IMMORTAL GUARDIAN', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '3+', WOUNDS: '10' },
  [
    { name: 'Gauss blaster', atk: '4', hit: '3+', dmg: '4/5', wr: 'Piercing 1' },
    { name: 'Tesla carbine', atk: '5', hit: '3+', dmg: '3/3', wr: '2" Devastating 1' },
    { name: 'Bayonet',       atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
  ],
  [
    { name: 'Steadfast', description: 'Whenever determining control of a marker, you can treat this operative\'s APL stat as 3. If you do, this takes precedence over all other rules, meaning any changes to its APL stat are ignored for this.' },
  ],
  'HIEROTEK CIRCLE, NECRON, IMMORTAL, GUARDIAN'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Hierotek Circle populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
