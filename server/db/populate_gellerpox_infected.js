import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Gellerpox Infected'").get()?.id;
if (!FACTION_ID) { console.error('Gellerpox Infected faction not found'); process.exit(1); }

// Clear existing Gellerpox Infected data
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
  'Archetypes: SEEK-DESTROY, SECURITY');

rule('faction_rules', null, 'OPERATIVES', 0,
  `Every GELLERPOX INFECTED operative in the following list:

• 1 GELLERPOX INFECTED VULGRAR THRICE-CURSED
• 1 GELLERPOX INFECTED BLOATSPAWN
• 1 GELLERPOX INFECTED FLESHSCREAMER
• 1 GELLERPOX INFECTED LUMBERGHAST
• 4 GELLERPOX INFECTED GLITCHLING
• 1 GELLERPOX INFECTED MUTANT with frag grenade and heavy axe
• 2 GELLERPOX INFECTED MUTANT with frag grenade and improvised weapon

If you selected the Mutoid Vermin faction equipment:

Specified number of GELLERPOX INFECTED operatives selected from the following list:

• CURSEMITE
• EYE STINGER SWARM
• SLUDGE-GRUB`);

rule('faction_rules', null, 'TECHNO-CURSE', 0,
  `At the end of the Select Operatives step, select one TECHNO-CURSE for friendly GELLERPOX INFECTED operatives to gain for the battle. Whenever an enemy operative is within your selected TECHNO-CURSE's infection range, that enemy operative is affected by the symptom of the selected TECHNO-CURSE. Each TECHNO-CURSE, its infection range and its symptom is listed below:

BARRELWARP
Infection range: Within 2" of a friendly GELLERPOX INFECTED operative (excluding MUTOID VERMIN), or within 3" of a friendly GELLERPOX INFECTED GLITCHLING operative.
Symptom: Subtract 1 from the Atk stat of that enemy operative's ranged weapons.

SCREAMING RUSTSPIKES
Infection range: Within control range of a friendly GELLERPOX INFECTED operative (excluding MUTOID VERMIN).
Symptom: Whenever that enemy operative is fighting or retaliating against a friendly GELLERPOX INFECTED operative, if your opponent discards any attack dice as a fail, inflict 1 damage on that enemy operative.

VIRAL VOX-STATIC
Infection range: Within 3" of a friendly GELLERPOX INFECTED operative (excluding MUTOID VERMIN), or within 4" of a friendly GELLERPOX INFECTED GLITCHLING operative.
Symptom: That enemy operative's APL stat cannot be added to (remove all positive APL stat changes it has).`);

rule('faction_rules', null, 'REVOLTINGLY RESILIENT', 0,
  'Whenever an attack dice inflicts damage of 3 or more on a friendly GELLERPOX INFECTED NIGHTMARE HULK or GELLERPOX INFECTED MUTANT operative, roll one D6: on a 4+, subtract 1 from that inflicted damage.');

rule('faction_rules', null, 'MUTOID VERMIN', 0,
  `MUTOID VERMIN operatives cannot perform any actions other than Charge, Dash, Fall Back, Fight, Reposition, and Shoot, and cannot use any weapons that aren't on their datacard. They can perform the Fall Back action for 1 less AP.

MUTOID VERMIN operatives cannot contest markers or areas of the killzone, and are ignored for your opponent's kill/elimination op (when they're incapacitated, and when determining your starting number of operatives). They're also ignored for victory conditions and scoring VPs if either require operatives to "escape," "survive," or be incapacitated (if they escape/survive/be incapacitated by enemy operatives, determining how many operatives must escape/survive/be incapacitated, etc.).

Operatives can move through MUTOID VERMIN operatives, and enemy operatives can move within their control range. Having only MUTOID VERMIN operatives within their control range doesn't prevent enemy operatives from performing the Charge, Dash, and Reposition actions, and enemy operatives can leave MUTOID VERMIN operatives' control range when performing the Charge action.`);

rule('faction_rules', null, 'NIGHTMARE HULKS', 0,
  `Whenever your opponent is selecting a valid target, friendly GELLERPOX INFECTED NIGHTMARE HULK operatives cannot use Light terrain for cover. While this can allow such operatives to be targeted (assuming they're visible), it doesn't remove their cover save (if any).

NIGHTMARE HULK Friendly GELLERPOX INFECTED operatives cannot perform unique actions. You must spend 1 additional AP for friendly GELLERPOX INFECTED NIGHTMARE HULK operatives (excluding VULGRAR THRICE-CURSED) to perform the Pick Up Marker and mission actions (excluding Operate Hatch).`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'PLAGUERIDDEN DETERMINATION', 1,
  'Whenever an operative is shooting a friendly GELLERPOX INFECTED operative (excluding MUTOID VERMIN) that has an Engage order, you can re-roll one of your defence dice.');

rule('ploy', 'Strategy', 'BLESSINGS OF INFECTION', 1,
  `Whenever a friendly GELLERPOX INFECTED operative is fighting or retaliating, you can do one of the following:
• If you roll three or more fails, you can discard one of them to retain another as a normal success instead.
• If you roll three or more successes, you can discard one of your fails to retain one of your normal successes as a critical success instead.`);

rule('ploy', 'Strategy', 'DRAWN TO THE HUM', 1,
  'Select one objective marker. Whenever a friendly GELLERPOX INFECTED operative performs the Reposition or Charge action during its activation, you can use this rule. If you do, add 1" to its Move stat until the end of that activation, but it must end that move within 2" of that objective marker.');

rule('ploy', 'Strategy', 'RUST EMANATIONS', 1,
  'Whenever a friendly GELLERPOX INFECTED NIGHTMARE HULK operative is fighting, your opponent cannot retain results of 3 as successes.');

rule('ploy', 'Firefight', 'REVOLTING TECHNOLOGY', 1,
  'Use this firefight ploy when an enemy operative is shooting a friendly GELLERPOX INFECTED operative. That operative\'s ranged weapons have the Hot weapon rule until the end of that sequence; if the weapon already has that weapon rule, when your opponent rolls one D6 for that weapon rule, you can add or subtract 1 from the result. Note that for the latter you can see the result of your opponent\'s roll for the Hot weapon rule before deciding to use this ploy.');

rule('ploy', 'Firefight', 'BARGE', 1,
  `Use this firefight ploy during a friendly GELLERPOX INFECTED NIGHTMARE HULK operative's activation or counteraction, before or after it performs an action. During that activation/counteraction:
• It can move through enemy operatives and within control range of them.
• It can perform the Charge and Reposition actions while within control range of an enemy operative, and can leave that operative's control range to do so (but then normal requirements for that move apply).`);

rule('ploy', 'Firefight', 'PUTRESCENT DEMISE', 1,
  'Use this firefight ploy when a friendly GELLERPOX INFECTED operative (excluding MUTOID VERMIN) is incapacitated, before it\'s removed from the killzone. Inflict 1 damage (or D3 damage instead if that friendly operative is a NIGHTMARE HULK) on each enemy operative visible to and within 2" of that friendly operative.');

rule('ploy', 'Firefight', 'FRIGHTENING ONSLAUGHT', 1,
  'Use this firefight ploy after a friendly GELLERPOX INFECTED NIGHTMARE HULK operative performs the Fight action, if it isn\'t incapacitated. It can immediately perform a free Fight action.');

// ── TACOPS ───────────────────────────────────────────────────────────────────

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

rule('equipment', null, 'MUTOID VERMIN', 0,
  'After revealing this equipment option, add two four GELLERPOX INFECTED MUTOID VERMIN operatives to your kill team for the battle.');

rule('equipment', null, 'POLLUTED STOCKPILE', 0,
  'After revealing this equipment option, roll 2D6: on a 7+, remove one of your opponent\'s selected equipment options; otherwise, that player removes one of their own selected equipment options. They cannot select that equipment again during the game sequence (e.g. in the Scouting step of Approved Ops). You cannot select this equipment option after the Select Operatives step.');

rule('equipment', null, 'MUTATED SYMPTOMS', 0,
  'Once per battle, when you activate a friendly GELLERPOX INFECTED operative, you can select one additional TECHNO-CURSE for that operative to gain until the end of the turning point (it must be different from your existing TECHNO-CURSE). Note that if a rule refers to an enemy operative being affected by your selected TECHNO-CURSE rule (e.g. VULGRAR THRICE-CURSED operative\'s Spread the Glorious Gifts rule), it is affected by your additional TECHNO-CURSE rule too.');

rule('equipment', null, 'PLAGUE BELLOWS', 0,
  'Whenever an operative is shooting a friendly GELLERPOX INFECTED NIGHTMARE HULK operative that\'s more than 6" from it, you can retain one of your defence dice results of 3 as a normal success instead of discarding it.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('VULGRAR THRICE-CURSED', 'Leader',
  { APL: '2', MOVE: '5"', SAVE: '5+', WOUNDS: '21' },
  [
    { name: 'Pyregut – Deluge',   atk: '5', hit: '2+', dmg: '3/3', wr: 'Range 6", Torrent 2, Saturate' },
    { name: 'Pyregut – Standard', atk: '5', hit: '2+', dmg: '3/3', wr: 'Range 4", Saturate, Seek Light, Torrent 0' },
    { name: 'Fleshmelded weapons', atk: '5', hit: '3+', dmg: '4/5', wr: 'Engineered*' },
  ],
  [
    { name: 'Spread the Glorious Gifts', description: 'Once per battle STRATEGIC GAMBIT. Select one objective marker this operative controls to gain one of your Techno-curse tokens. It cannot be an objective marker within control Range of an enemy operative. Whenever that objective marker is within control Range of an enemy operative, that operative is affected by your selected TECHNO-CURSE rule and an additional rule determined by your TECHNO-CURSE, as shown below. You cannot use this STRATEGIC GAMBIT while this operative is within control Range of an enemy operative.\n• Barrelwarp: No additional effect.\n• Screaming Rustspikes: This TECHNO-CURSE inflicts 2 damage on that enemy operative (instead of 1).\n• Viral Vox-static: Whenever that enemy operative is activated, subtract 1 from its APL stat until the end of its activation.' },
    { name: '*Engineered', description: 'At the end of the Select Operatives step, if this operative is selected for deployment, select up to two of the following improvements or weapon rules for this weapon to have for the battle: Add 1 to the Normal Dmg stat, add 1 to the Critical Dmg stat, Balanced, Brutal, Lethal 5+, Rending.' },
  ],
  'GELLERPOX INFECTED, CHAOS, NIGHTMARE HULK, LEADER, VULGRAR THRICE-CURSED'
);

card('BLOATSPAWN', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '5+', WOUNDS: '20' },
  [
    { name: 'Mutant tentacles',                  atk: '5', hit: '4+', dmg: '3/4', wr: 'Range 3", Torrent 1' },
    { name: 'Mutant claw & tentacles – Grasp and slash', atk: '6', hit: '4+', dmg: '3/4', wr: '–' },
    { name: 'Mutant claw & tentacles – Writhing swipe',  atk: '4', hit: '4+', dmg: '3/4', wr: 'Swipe*' },
  ],
  [
    { name: 'Tentacled Grasp', description: 'Whenever an enemy operative would perform the Fall Back action while within control Range of this operative, you can use this rule. If you do, roll one D6, adding 1 to the result if that enemy operative has a Wounds stat of 8 or less: on a 4+, that enemy operative cannot perform that action during that activation/counteraction (the AP spent on it isn\'t refunded).' },
    { name: '*Swipe', description: 'Whenever this operative performs the Fight action and you select this weapon profile, if it isn\'t incapacitated, it can immediately perform a free Fight action afterwards, but you must select this weapon profile and it can only fight against each enemy operative within its control Range once per activation or counteraction using this weapon profile. This takes precedence over action restrictions, and you can continue to perform free Fight actions until this operative is incapacitated or has fought against every enemy operative within its control Range.' },
  ],
  'GELLERPOX INFECTED, CHAOS, NIGHTMARE HULK, BLOATSPAWN'
);

card('FLESHSCREAMER', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '5+', WOUNDS: '20' },
  [
    { name: 'Mutant fist & cleaver – Bash and slash', atk: '5', hit: '4+', dmg: '5/6', wr: '–' },
    { name: 'Mutant fist & cleaver – Lopping blow',   atk: '1', hit: '3+', dmg: '8/9', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Horrifying Shrieking', description: 'Whenever an enemy operative is within 3" of this operative, your opponent must spend 1 additional AP for that enemy operative to perform the Pick Up Marker and mission actions.' },
    { name: 'Horrifying Shrieking (control)', description: 'Whenever determining control of a marker, treat the total APL stat of enemy operatives that contest it as 1 lower if at least one of those enemy operatives is within 3" of this operative. Note this isn\'t a change to the APL stat, so any changes are cumulative with this.' },
  ],
  'GELLERPOX INFECTED, CHAOS, NIGHTMARE HULK, FLESHSCREAMER'
);

card('LUMBERGHAST', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '5+', WOUNDS: '20' },
  [
    { name: 'Mutant claw', atk: '4', hit: '4+', dmg: '6/7', wr: 'Brutal' },
  ],
  [
    { name: 'Spiked Charger', description: 'Whenever this operative finishes moving during the Charge action, you can inflict D3 damage on each enemy operative within its control Range (roll separately for each).' },
  ],
  'GELLERPOX INFECTED, CHAOS, NIGHTMARE HULK, LUMBERGHAST'
);

card('MUTANT', 'Warrior',
  { APL: '2', MOVE: '5"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Frag grenade',      atk: '4', hit: '4+', dmg: '2/4', wr: 'Range 6", Blast 2, Limited 1, Saturate' },
    { name: 'Heavy axe',         atk: '3', hit: '4+', dmg: '4/5', wr: 'Brutal' },
    { name: 'Improvised weapon', atk: '4', hit: '4+', dmg: '3/4', wr: 'Ceaseless' },
  ],
  [
    { name: 'Group Activation', description: 'Whenever this operative is expended, you must then activate one other ready friendly GELLERPOX INFECTED MUTANT operative (if able) before your opponent activates. When that other operative is expended, your opponent then activates as normal (in other words, you cannot activate more than two operatives in succession with this rule).' },
    { name: 'Gellercaust Masks', description: 'Whenever an attack dice would inflict Critical Dmg on this operative, you can choose for that attack dice to inflict Normal Dmg instead.' },
  ],
  'GELLERPOX INFECTED, CHAOS, MUTANT'
);

card('GLITCHLING', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '6+', WOUNDS: '3' },
  [
    { name: 'Diseased effluence', atk: '4', hit: '4+', dmg: '2/2', wr: 'Range 6"' },
    { name: 'Diseased nippers',   atk: '3', hit: '4+', dmg: '1/2', wr: '–' },
  ],
  [
    { name: 'Daemonic', description: 'Whenever an operative is shooting this operative, ignore the Piercing weapon rule.' },
    { name: 'Small', description: 'This operative cannot use any weapons that aren\'t on its datacard, or perform unique actions. Whenever this operative has a Conceal order and is in cover, it cannot be selected as a valid target, taking precedence over all other rules (e.g. Seek, Vantage terrain) except being within 2".' },
    { name: 'Group Activation', description: 'Whenever this operative is expended, you must then activate one other ready friendly GELLERPOX INFECTED GLITCHLING operative (if able) before your opponent activates. When that other operative is expended, your opponent then activates as normal (in other words, you cannot activate more than two operatives in succession with this rule).' },
  ],
  'GELLERPOX INFECTED, CHAOS, GLITCHLING'
);

card('CURSEMITE', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '6+', WOUNDS: '2' },
  [
    { name: 'Bloodsucking proboscis', atk: '2', hit: '4+', dmg: '2/3', wr: 'Rending, Feast*' },
  ],
  [
    { name: '*Feast', description: 'Whenever this operative is using this weapon against a wounded operative, add 1 to the Atk stat of this weapon and it has the Lethal 5+ weapon rule.' },
    { name: 'Group Activation', description: 'Whenever this operative is expended, you must then activate one other ready friendly GELLERPOX INFECTED MUTOID VERMIN operative (if able) before your opponent activates. When that other operative is expended, your opponent then activates as normal (in other words, you cannot activate more than two operatives in succession with this rule).' },
  ],
  'GELLERPOX INFECTED, CHAOS, MUTOID VERMIN, CURSEMITE'
);

card('EYESTINGER SWARM', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '6+', WOUNDS: '2' },
  [
    { name: 'Swarm', atk: '5', hit: '6+', dmg: '0/0', wr: 'Range 6", Stun' },
    { name: 'Sting',  atk: '5', hit: '5+', dmg: '1/2', wr: 'Shock' },
  ],
  [
    { name: 'Group Activation', description: 'Whenever this operative is expended, you must then activate one other ready friendly GELLERPOX INFECTED MUTOID VERMIN operative (if able) before your opponent activates. When that other operative is expended, your opponent then activates as normal (in other words, you cannot activate more than two operatives in succession with this rule).' },
  ],
  'GELLERPOX INFECTED, CHAOS, MUTOID VERMIN, EYESTINGER SWARM'
);

card('SLUDGE-GRUB', 'Warrior',
  { APL: '2', MOVE: '4"', SAVE: '6+', WOUNDS: '2' },
  [
    { name: 'Acid spit',  atk: '4', hit: '4+', dmg: '2/2', wr: 'Range 6", Devastating 1, Piercing 1' },
    { name: 'Fanged maw', atk: '2', hit: '4+', dmg: '1/3', wr: '–' },
  ],
  [
    { name: 'Group Activation', description: 'Whenever this operative is expended, you must then activate one other ready friendly GELLERPOX INFECTED MUTOID VERMIN operative (if able) before your opponent activates. When that other operative is expended, your opponent then activates as normal (in other words, you cannot activate more than two operatives in succession with this rule).' },
    { name: 'Caustic Demise', description: 'When this operative is incapacitated, roll one D6 separately for each enemy operative visible to and within 2" of it: on a 4+, inflict 1 damage on that operative.' },
  ],
  'GELLERPOX INFECTED, CHAOS, MUTOID VERMIN, SLUDGE-GRUB'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Gellerpox Infected populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
