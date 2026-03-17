import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Elucidian Starstriders'").get()?.id;
if (!FACTION_ID) { console.error('Elucidian Starstriders faction not found'); process.exit(1); }

// Clear existing Elucidian Starstriders data
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
  `Every ELUCIAN STARSTRIDER operative in the following list:
• 1 ELUCIA VHANE
• 1 CANID
• 1 DEATH CULT EXECUTIONER
• 1 LECTRO-MAESTER
• 1 REJUVENAT ADEPT
• 1 VOIDMASTER
• 3 VOIDSMAN with lasgun and gun butt
• 1 VOIDSMAN with rotor cannon and gun butt`);

rule('faction_rules', null, 'WARRANT OF TRADE', 0,
  `Up to four times per battle, you can use a WARRANT OF TRADE rule (below). Each one specifies when it can be used, and you cannot use the same WARRANT OF TRADE rule more than once per battle.`);

rule('faction_rules', 'Warrant of Trade', 'CONSIDERATION', 0,
  'In the Select Operatives step, after revealing your equipment options, select one additional equipment option. It cannot be an option you have previously selected.');

rule('faction_rules', 'Warrant of Trade', 'COORDINATE', 0,
  'At the end of the Select Operatives step, you gain 1 additional CP.');

rule('faction_rules', 'Warrant of Trade', 'COERCE', 0,
  `Your opponent must set up all of their operatives before you set up any. Additionally, select one of the following options:
• Your opponent must set up all of their equipment before you set up any.
• You can set up all of your equipment before your opponent sets up any.`);

rule('faction_rules', 'Warrant of Trade', 'EXPLORE', 0,
  'STRATEGIC GAMBIT in the first turning point. Perform a free Reposition action with D3 friendly ELUCIAN STARSTRIDER operatives that are wholly within your drop zone. Each that does so must end that move wholly within 4" of your drop zone.');

rule('faction_rules', 'Warrant of Trade', 'BRIBE', 0,
  'It\'s your turn to activate an operative. You can skip that activation.');

rule('faction_rules', 'Warrant of Trade', 'SEIZE', 0,
  'In the Strategy phase, after rolling off to decide initiative, you can re-roll your dice.');

rule('faction_rules', 'Warrant of Trade', 'ADAPTABLE TERMS (APPROVED OPS ONLY)', 0,
  'At the end of the second turning point, select a new tactical op or a new primary op. If you select a new tactical op, any points scored from the previous tac op are discarded.');

rule('faction_rules', null, 'PRIVATEER SUPPORT ASSET', 0,
  `Once per firefight phase, when a friendly ELUCIDIAN STARSTRIDER NAVIS or ELUCIDIAN STARSTRIDER ELUCIA VHANE operative performs the Shoot action, you can select one of the following PRIVATEER SUPPORT ASSET ranged weapons for it to use. You cannot use each PRIVATEER SUPPORT ASSET more than once per battle.

Whenever a friendly ELUCIDIAN STARSTRIDER operative is using a PRIVATEER SUPPORT ASSET, determine cover saves differently. Instead, the target has a cover save if any part of its base is underneath Vantage terrain. Note that while this can affect the target's cover save, you must still select a valid target as normal. In other words, the shot is guided by an operative in the killzone, but it comes from above.`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'LETHAL PROXIMITY', 1,
  'Whenever a friendly ELUCIDIAN STARSTRIDER operative is shooting an operative within 6" of it, that friendly operative\'s ranged weapons (excluding PRIVATEER SUPPORT ASSET weapons) have the Balanced weapon rule.');

rule('ploy', 'Strategy', 'STAKE CLAIM', 1,
  'Place your Claim marker in the killzone. Whenever a friendly ELUCIDIAN STARSTRIDER operative is shooting against, fighting against or retaliating against an enemy operative that\'s within 3" of that marker, in the Roll Attack Dice step, you can retain one of your fails as a normal success instead of discarding it, or retain one of your normal successes as a critical success instead. In the Ready step of the next Strategy phase, remove that marker.');

rule('ploy', 'Strategy', 'UNDAUNTED EXPLORERS', 1,
  'The first time an attack dice inflicts damage on each friendly ELUCIDIAN STARSTRIDER operative during the turning point in the Resolve Attack Dice step, you can halve that inflicted damage (rounding up, to a minimum of 2).');

rule('ploy', 'Strategy', 'QUICK MARCH', 1,
  'Whenever a friendly ELUCIDIAN STARSTRIDER operative performs the Reposition action during its activation, you can use this rule. If you do, add 1" to its Move stat until the end of that activation, but it must end that move closer to your opponent\'s drop zone and cannot use a PRIVATEER SUPPORT ASSET during that activation.');

rule('ploy', 'Firefight', 'COMBINED ARMS', 1,
  'Use this firefight ploy after rolling your attack dice for a friendly ELUCIDIAN STARSTRIDER operative, if it\'s shooting an enemy operative that\'s been shot by another friendly ELUCIDIAN STARSTRIDER operative during this turning point. You can re-roll any of your attack dice. You cannot use this ploy while shooting with a PRIVATEER SUPPORT ASSET.');

rule('ploy', 'Firefight', 'SURVIVALIST', 1,
  'Use this firefight ploy when a friendly ELUCIDIAN STARSTRIDER operative is activated. That friendly operative regains up to D3+2 lost wounds and during that activation you can ignore any changes to its APL stat.');

rule('ploy', 'Firefight', 'GREAT ENDURANCE', 1,
  'Use this firefight ploy during a friendly ELUCIDIAN STARSTRIDER NAVIS operative\'s activation. Until the end of the activation, add 1 to its APL stat.');

rule('ploy', 'Firefight', 'WELL-DRILLED', 1,
  'Use this firefight ploy when a friendly ELUCIDIAN STARSTRIDER NAVIS operative is activated. Select one other ready friendly ELUCIDIAN STARSTRIDER NAVIS operative visible to and within 3" of that operative. When that first friendly operative is expended, you can activate that other friendly operative before your opponent activates. When that other operative is expended, your opponent then activates as normal.');

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

rule('equipment', null, 'ARMOURED UNDERSUIT', 0,
  'Whenever an operative is shooting a friendly ELUCIDIAN STARSTRIDER operative that has a 5+ Save stat (excluding CANID), you can retain one of your defence dice results of 4 as a normal success.');

rule('equipment', null, 'HOT-SHOT CAPACITOR PACKS', 0,
  'Up to twice per turning point, whenever a friendly ELUCIDIAN STARSTRIDER operative is performing the Shoot action and you select a laspistol or lasgun, you can use this rule. If you do, until the end of the turning point, add 1 to both Dmg stats of that weapon and it has the Hot and Piercing Crits 1 weapon rules.');

rule('equipment', null, 'IMPROVED COORDINATES UPLINK', 0,
  'Whenever a friendly ELUCIDIAN STARSTRIDER operative is using a PRIVATEER SUPPORT ASSET, if the target is within 6" of a friendly ELUCIDIAN STARSTRIDER NAVIS operative, the target cannot be obscured and that weapon has the Saturate weapon rule.');

rule('equipment', null, 'RAPID GUNNERY', 0,
  'Once per battle, when selecting a PRIVATEER SUPPORT ASSET, you can select one that\'s already been used during the battle. This takes precedence over the normal PRIVATEER SUPPORT ASSET rules.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('ELUCIA VHANE', 'Leader',
  { APL: '3', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Heirloom relic pistol', atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 8", Piercing Crits 1, Seek Light' },
    { name: 'Monomolecular cane-rapier', atk: '4', hit: '3+', dmg: '3/6', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Disruption Field', description: 'Whenever an operative is shooting this operative, ignore the Piercing weapon rule.' },
    { name: 'Digital Lasers', description: 'Whenever this operative performs the Fight action, at the start of the Roll Attack Dice step, you can use this rule. If you do, inflict 1 damage on the enemy operative in that sequence.' },
    { name: 'Merciless', description: 'Whenever this operative is shooting against, fighting against or retaliating against an enemy operative that was already wounded when the action started, this operative\'s weapons have the Balanced weapon rule; if the weapon already has that weapon rule, it has the Ceaseless weapon rule instead of Balanced.' },
    { name: 'Reputation to Maintain', description: 'The first time this operative incapacitates an enemy operative during the battle, you can either gain 1 additional CP or use an additional WARRANT OF TRADE rule (up to five uses per battle, instead of four). Note that you still cannot use the same WARRANT OF TRADE rule more than once per battle.' },
  ],
  'ELUCIDIAN STARSTRIDER, IMPERIUM, LEADER, ELUCIA VHANE'
);

card('CANID', 'Warrior',
  { APL: '2', MOVE: '8"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Vicious bite', atk: '4', hit: '3+', dmg: '3/4', wr: 'Rending' },
  ],
  [
    { name: 'Canid', description: 'This operative cannot perform any actions other than Charge, Dash, Fall Back, Fight, Gather, Guard, Reposition, Pick Up Marker and Place Marker. It cannot use any weapons that aren\'t on its datacard.' },
    { name: 'Loyal Companion', description: 'Whenever an enemy operative performs the Fight action, if this operative is a valid operative to fight against, you can force them to select this operative to fight against instead. Whenever an enemy operative ends the Charge action within control Range of another friendly ELUCIDIAN STARSTRIDER operative within 3" of this operative, if this operative isn\'t within control Range of enemy operatives, this operative can immediately perform a free Charge action, but must end that move within control Range of that enemy operative.' },
    { name: 'GATHER (1AP)', description: 'Perform a free Dash or Reposition action with this operative. During that move, you can perform a free Pick Up Marker or Place Marker action with this operative (you can determine control during that action to do so), and any remaining move distance it had from the Dash or Reposition action can be used after it does so.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'ELUCIDIAN STARSTRIDER, IMPERIUM, CANID'
);

card('DEATH CULT EXECUTIONER', 'Warrior',
  { APL: '3', MOVE: '6"', SAVE: '5+', WOUNDS: '8' },
  [
    { name: 'Dartmask', atk: '4', hit: '3+', dmg: '1/1', wr: 'Range 6", Lethal 5+, Silent, Stun' },
    { name: 'Power weapon', atk: '5', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Rapid Reflexes', description: 'Whenever an operative is shooting this operative, ignore the Piercing weapon rule.' },
    { name: 'Bladed Stance', description: 'Whenever this operative is fighting or retaliating, you can resolve one of your successes before the normal order. If you do, that success must be used to block.' },
    { name: 'Zealot', description: 'If this operative is incapacitated during the Fight action, you can strike the enemy operative in that sequence with one of your unresolved successes before this operative is removed from the killzone.' },
    { name: 'TRAINED ASSASSIN (1AP)', description: 'Change this operative\'s order.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'ELUCIDIAN STARSTRIDER, IMPERIUM, DEATH CULT EXECUTIONER'
);

card('LECTRO-MAESTER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Voltaic pistol', atk: '4', hit: '3+', dmg: '4/4', wr: 'Range 8", 1" Devastating 1, Rending' },
    { name: 'Gun butt', atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Voltagheist Array', description: 'Whenever an operative is shooting a friendly ELUCIDIAN STARSTRIDER operative that\'s within 4" of this operative, you can re-roll one of your defence dice.' },
    { name: 'Missionary of the Martian Creed', description: 'Once during each of this operative\'s activations, it can perform the Pick Up Marker, Place Marker or a mission action for 1 less AP.' },
    { name: 'CALIBRATE VOLTAGEGEIST (0AP)', description: 'Select one of the following effects to last until the start of this operative\'s next activation, until it\'s incapacitated or until it performs this action again (whichever comes first):\n• Charge: This operative\'s voltaic pistol has the Lethal 4+ weapon rule.\n• Field: Whenever an enemy operative ends the Charge, Dash, Fall Back or Reposition action visible to and within 4" of this operative, inflict D6 damage on that enemy operative.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'ELUCIDIAN STARSTRIDER, IMPERIUM, LECTRO-MAESTER'
);

card('REJUVENAT ADEPT', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Laspistol', atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Scalpel claw', atk: '3', hit: '4+', dmg: '3/4', wr: 'Rending' },
  ],
  [
    { name: 'Normaliser Helm', description: 'Whenever a friendly ELUCIDIAN STARSTRIDER operative is within 6" of this operative, you can ignore any changes to that operative\'s stats from being injured (including its weapons\' stats).' },
    { name: 'Medic!', description: 'The first time during each turning point that another friendly ELUCIDIAN STARSTRIDER operative would be incapacitated while visible to and within 3" of this operative, you can use this rule, providing neither this nor that operative is within control Range of an enemy operative. If you do, that friendly operative isn\'t incapacitated and has 3 wounds remaining and cannot be incapacitated for the remainder of the action. After that action, that friendly operative can immediately perform a free Dash action, but must end that move within this operative\'s control Range. If this rule was used during that friendly operative\'s activation, that activation ends. You cannot use this rule if this operative is incapacitated, or if it\'s a Shoot action and this operative would be a primary or secondary target.' },
    { name: 'HEALING SERUM (1AP)', description: 'Select one friendly ELUCIAN STARSTRIDER operative within this operative\'s control Range to regain up to D3+3 lost wounds. It cannot be an operative that the Medic! rule was used on during this turning point.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'ELUCIDIAN STARSTRIDER, IMPERIUM, MEDIC, REJUVENAT ADEPT'
);

card('VOIDMASTER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '8' },
  [
    { name: 'Artificer shotgun – Short range', atk: '4', hit: '3+', dmg: '4/4', wr: 'Range 6"' },
    { name: 'Artificer shotgun – Long range',  atk: '4', hit: '5+', dmg: '2/2', wr: '–' },
    { name: 'Laspistol', atk: '4', hit: '3+', dmg: '2/4', wr: 'Range 8", Lethal 5+' },
    { name: 'Gun butt', atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Disciplinarian: SUPPORT', description: 'Whenever another friendly NAVIS operative is within 3" of this operative, that friendly operative\'s ranged weapons (excluding PRIVATEER SUPPORT ASSET weapons) have the Balanced weapon rule; if the weapon already has that weapon rule, it has the Ceaseless weapon rule instead of Balanced.' },
    { name: 'Hardy', description: 'Once per battle, when an attack dice inflicts Normal Dmg on this operative, you can ignore that inflicted damage.' },
    { name: 'UNCOMPROMISING FIRE (1AP)', description: 'Perform two free Shoot actions with this operative (this takes precedence over action restrictions). You must select its relic laspistol for one action and its artificer shotgun (close Range) for the other (in any order).\n\nThis operative cannot perform this action while it has a Conceal order, or during an activation in which it performed the Shoot action (or vice versa).' },
  ],
  'ELUCIDIAN STARSTRIDER, IMPERIUM, NAVIS, VOIDMASTER'
);

card('VOIDSMAN', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Lasgun', atk: '4', hit: '4+', dmg: '2/3', wr: '–' },
    { name: 'Gun butt', atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Crewmen', description: 'Once per turning point, if you haven\'t used a PRIVATEER SUPPORT ASSET during this turning point, you can counteract with one friendly VOIDSMAN operative that has a Conceal order, but you cannot perform any actions other than Shoot, and you must use a PRIVATEER SUPPORT ASSET to do so.' },
  ],
  'ELUCIDIAN STARSTRIDER, IMPERIUM, NAVIS, VOIDSMAN'
);

card('VOIDSMAN (ROTOR CANNON)', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Rotor cannon – Sweeping', atk: '4', hit: '4+', dmg: '4/5', wr: 'Heavy (Dash only), Rending, Torrent 1' },
    { name: 'Rotor cannon – Focused',  atk: '5', hit: '4+', dmg: '4/5', wr: 'Heavy (Dash only), Rending' },
    { name: 'Gun butt', atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Crewmen', description: 'Once per turning point, if you haven\'t used a PRIVATEER SUPPORT ASSET during this turning point, you can counteract with one friendly VOIDSMAN operative that has a Conceal order, but you cannot perform any actions other than Shoot, and you must use a PRIVATEER SUPPORT ASSET to do so.' },
  ],
  'ELUCIDIAN STARSTRIDER, IMPERIUM, NAVIS, VOIDSMAN'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Elucidian Starstriders populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
