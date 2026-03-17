import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Wolf Scouts'").get()?.id;
if (!FACTION_ID) { console.error('Wolf Scouts faction not found'); process.exit(1); }

// Clear existing Wolf Scouts data
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
  'Archetypes: SEEK-DESTROY, RECON');

rule('faction_rules', null, 'OPERATIVES', 0,
  `1 WOLF SCOUT FENRISIAN WOLF

5 WOLF SCOUT operatives selected from the following list:
• PACK LEADER
• FANGBEARER
• TRAPMASTER
• HUNTER
• GUNNER
• FROSTEYE
• RUNE PRIEST SKJALD

Other than HUNTER operatives, your kill team can only include each operative on this list once.`);

rule('faction_rules', null, 'HUNTING ASTARTES', 0,
  `During each friendly WOLF SCOUT operative's activation, it can perform either two Shoot actions or two Fight actions. If that's two Shoot actions:
• 1 additional AP must be spent for the second action if both actions are using a plasma gun or plasma pistol.
• You cannot select two PSYCHIC ranged weapons.

Each friendly WOLF SCOUT operative can counteract regardless of its order. Whenever it does so within your STORM, you can change its order first, or change its order instead of performing action (for the latter, still treat it as having counteracted this turning point).`);

rule('faction_rules', null, 'ELEMENTAL STORM', 0,
  `STRATEGIC GAMBIT. Remove your Storm marker from the killzone (if any), then place it in the killzone. Whenever an operative is within 6" horizontally of your Storm marker, it's within your STORM.

Each friendly WOLF SCOUT operative can perform the Charge action while it has a Conceal order if it starts and/or ends that action within your STORM.`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'CLOAKED BY THE STORM', 1,
  'Whenever an operative is shooting a friendly WOLF SCOUT operative that\'s within your STORM, you can re-roll one of your defence dice.');

rule('ploy', 'Strategy', 'TEMPESTUOUS WRATH', 1,
  'Whenever a friendly WOLF SCOUT operative is fighting or retailiating, if it\'s within your STORM or was within your STORM at the start of the activation, its melee weapons have the Balanced weapon rule.');

rule('ploy', 'Strategy', 'STORM\'S BITE', 1,
  'Whenever a friendly WOLF SCOUT operative is fighting against an enemy operative that\'s within your STORM, subtract 1 from the Atk stat of that enemy operative\'s melee weapons (to a minimum of 3).');

rule('ploy', 'Strategy', 'SAVAGE FIGHTERS', 1,
  'Whenever a friendly WOLF SCOUT operative finishes fighting or retailiating, if it wasn\'t incapacitated, you can inflict D3+1 damage on the enemy operative in that sequence.');

rule('ploy', 'Firefight', 'ACUTE SENSES', 1,
  'Use this firefight ploy when a friendly WOLF SCOUT operative performs the Shoot action and you\'re selecting a valid target. Until the end of that action, that friendly operative\'s ranged weapons have the Range 6" and Seek Light weapon rules and enemy operatives cannot be obscured.');

rule('ploy', 'Firefight', 'COUNTERATTACK', 1,
  'Use this firefight ploy at the end of the enemy operative\'s activation, or after an enemy operative performs the Fight action. One friendly WOLF SCOUT operative can immediately perform a free Fight action, but you cannot select any other enemy operatives to fight against during that action.');

rule('ploy', 'Firefight', 'TOUCHED BY LOKYAR', 1,
  'Use this firefight ploy after rolling your attack dice for a friendly WOLF SCOUT operative (excluding FENRISIAN WOLF), if it\'s fighting more than 5" away from other friendly operatives. You can re-roll any of your attack dice.');

rule('ploy', 'Firefight', 'TRANSHUMAN PHYSIOLOGY', 1,
  'Use this firefight ploy when an operative is shooting a friendly WOLF SCOUT operative (excluding FENRISIAN WOLF), in the Roll Defence Dice step. You can retain one of your normal successes as a critical success instead.');

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

rule('equipment', null, 'FROST WEAPONS', 0,
  'Friendly WOLF SCOUT operatives\' combat blades have the Lethal 5+ weapon rule, and one friendly WOLF SCOUT PACK LEADER operative\'s power weapon has the Lethal 4+ weapon rule (if any).');

rule('equipment', null, 'RUNIC CHARMS', 0,
  'Once per turning point, when an operative is shooting a friendly WOLF SCOUT operative (excluding FENRISIAN WOLF), at the start of the Roll Defence Dice step, you can use this rule. If you do, worsen the x of the Piercing weapon rule by 1 (if any) until the end of that sequence. Note that Piercing 1 would therefore be ignored.');

rule('equipment', null, 'WOLFTEETH NECKLACES', 0,
  'Once per turning point, when a friendly WOLF SCOUT operative (excluding FENRISIAN WOLF) is shooting, fighting or retailiating, if you roll two or more fails, you can discard one of them to retain another as a normal success instead.');

rule('equipment', null, 'TALISMANIC TROPHIES', 0,
  'Whenever a friendly WOLF SCOUT operative (excluding FENRISIAN WOLF) is fighting or retailiating, in the Resolve Attack Dice step, you can subtract 1 from the damage inflicted on it from one success.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('WOLF SCOUT PACK LEADER', 'Leader',
  { APL: '3', MOVE: '7"', SAVE: '3+', WOUNDS: '14' },
  [
    { name: 'Plasma pistol – Standard',    atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 8", Piercing 1' },
    { name: 'Plasma pistol – Supercharge', atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 8", Hot, Lethal 5+, Piercing 1' },
    { name: 'Power weapon',                atk: '5', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Lupine Guile', description: 'Once per battle, after rolling off to decide initiative, if this operative is in the killzone, you can re-roll your dice.' },
    { name: 'Grizzled Veteran', description: 'First time this operative would be incapacitated during the battle, it\'s not incapacitated, has 1 wound remaining and cannot be incapacitated for the remainder of the action. All remaining attack dice are discarded (including yours if this operative is fighting or retailiating). You cannot use the Counterattack firefight ploy or inflict damage as a result of the Savage Fighters strategy ploy at the end of that action.' },
  ],
  'WOLF SCOUT, IMPERIUM, ADEPTUS ASTARTES, SPACE WOLVES, PACK LEADER'
);

card('WOLF SCOUT WOLF PRIEST SKJALD', 'Leader',
  { APL: '3', MOVE: '7"', SAVE: '3+', WOUNDS: '13' },
  [
    { name: 'Bolt pistol',              atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Jaws of the World Wolf',   atk: '5', hit: '3+', dmg: '3/5', wr: 'PSYCHIC, Blast 2", Severe' },
    { name: 'Thunderclap',              atk: '5', hit: '2+', dmg: '2/2', wr: 'PSYCHIC, Range 6", Saturate, Seek Light, Stun, Torrent 2"' },
    { name: 'Runic stave',              atk: '5', hit: '3+', dmg: '4/6', wr: 'PSYCHIC, Shock' },
  ],
  [
    { name: 'Cast The Runes', description: 'After selecting this operative, before the battle, roll three D6 and put them to one side. For each result of 1-4, you can use the Command Re-roll firefight ploy for 0CP once during the turning point that matches the result. For each result of 5-6, you gain 1CP. For example, if you roll 2, 2 and 5, you gain 1CP and twice during the second turning point you can use Command Re-roll for 0CP.' },
    { name: 'CALL THE STORM (1AP)', description: 'PSYCHIC. Remove your STORM marker from the killzone (if any), then place it in the killzone.\n\nAlternatively, instead of resolving the above effect, select one friendly WOLF SCOUT operative. Until the start of this operative\'s next activation, until it\'s incapacitated or until it performs this action again (whichever comes first), whenever that friendly operative is within your STORM and more than 3" from the active operative, it\'s obscured.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'WOLF SCOUT, IMPERIUM, ADEPTUS ASTARTES, SPACE WOLVES, PSYKER, RUNE PRIEST SKJALD'
);

card('WOLF SCOUT FANGBEARER', 'Warrior',
  { APL: '3', MOVE: '7"', SAVE: '3+', WOUNDS: '13' },
  [
    { name: 'Absolvor bolt pistol', atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 9", Piercing Crits 1' },
    { name: 'Combat blade',         atk: '5', hit: '3+', dmg: '4/5', wr: '–' },
  ],
  [
    { name: 'Spiritual Chirurgy', description: 'You can ignore any changes to the stats of friendly WOLF SCOUT operatives (excluding FENRISIAN WOLF) from being injured (including their weapons\' stats). Friendly WOLF SCOUT operatives (excluding FENRISIAN WOLF) are not affected by enemy operatives\' Shock and Stun weapon rules and you can ignore any changes to their APL stat. Note that friendly operatives have these rules if you select this operative for the battle (even if it\'s incapacitated later).' },
    { name: 'HEALING BALMS (1AP)', description: 'Select one friendly WOLF SCOUT operative within this operative\'s control Range to regain up to D3+3 lost wounds.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'WOLF SCOUT, IMPERIUM, ADEPTUS ASTARTES, SPACE WOLVES, FANGBEARER'
);

card('WOLF SCOUT TRAPMASTER', 'Warrior',
  { APL: '3', MOVE: '7"', SAVE: '3+', WOUNDS: '13' },
  [
    { name: 'Plasma pistol – Standard',    atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 8", Piercing 1' },
    { name: 'Plasma pistol – Supercharge', atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 8", Hot, Lethal 5+, Piercing 1' },
    { name: 'Combat blade',                atk: '5', hit: '3+', dmg: '4/5', wr: '–' },
  ],
  [
    { name: 'Haywire Mine', description: 'This operative is carrying your Haywire Mine marker. It can perform the Pick Up Marker action on that marker, but that marker cannot be placed within other operative\'s control Range (if this operative is incapacitated while carrying the marker, and that marker cannot be placed, it is removed with the operative).' },
    { name: 'Proximity Mine', description: 'First time your Haywire Mine marker is within another operative\'s control Range, remove that marker, subtract 1 from that operative\'s APL stat until the end of its next activation, and inflict 2D3+3 damage on it (D3+6 if that marker is within 6" horizontally from your Storm marker); if it isn\'t incapacitated, end its action (if any), even if that action\'s effect aren\'t fulfilled. If it cannot be placed, move it the minimum amount to do so. Note that this operative is ignored for these effects (i.e. it cannot set it off or take damage from that marker).' },
  ],
  'WOLF SCOUT, IMPERIUM, ADEPTUS ASTARTES, SPACE WOLVES, TRAPMASTER'
);

card('WOLF SCOUT HUNTER', 'Warrior',
  { APL: '3', MOVE: '7"', SAVE: '3+', WOUNDS: '13' },
  [
    { name: 'Plasma pistol – Standard',    atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 8", Piercing 1' },
    { name: 'Plasma pistol – Supercharge', atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 8", Hot, Lethal 5+, Piercing 1' },
    { name: 'Combat blade',                atk: '5', hit: '3+', dmg: '4/5', wr: '–' },
  ],
  [
    { name: 'Fierce Temperament', description: 'Whenever this operative is in your STORM, its weapons have the Severe weapon rule.' },
  ],
  'WOLF SCOUT, IMPERIUM, ADEPTUS ASTARTES, SPACE WOLVES, HUNTER'
);

card('WOLF SCOUT GUNNER', 'Warrior',
  { APL: '3', MOVE: '7"', SAVE: '3+', WOUNDS: '13' },
  [
    { name: 'Plasma gun – Standard',    atk: '4', hit: '3+', dmg: '4/6', wr: 'Piercing 1' },
    { name: 'Plasma gun – Supercharge', atk: '4', hit: '3+', dmg: '5/6', wr: 'Hot, Lethal 5+, Piercing 1' },
    { name: 'Combat blade',             atk: '4', hit: '3+', dmg: '4/5', wr: '–' },
  ],
  [
    { name: 'Tempest\'s Fury', description: 'Whenever this operative is in your STORM:\n• All profiles of its plasma gun have the Punishing weapon rule.\n• Its plasma gun (supercharge) doesn\'t have the Hot weapon rule.' },
  ],
  'WOLF SCOUT, IMPERIUM, ADEPTUS ASTARTES, SPACE WOLVES, GUNNER'
);

card('WOLF SCOUT FROSTEYE', 'Warrior',
  { APL: '3', MOVE: '7"', SAVE: '3+', WOUNDS: '13' },
  [
    { name: 'Instigator bolt carbine – Stationary', atk: '4', hit: '2+', dmg: '3/4', wr: 'Heavy (Dash only), Piercing Crits 1, Silent' },
    { name: 'Instigator bolt carbine – Mobile',     atk: '4', hit: '3+', dmg: '3/4', wr: 'Piercing Crits 1, Silent' },
    { name: 'Combat blade',                         atk: '4', hit: '3+', dmg: '4/5', wr: '–' },
  ],
  [
    { name: 'Storm-Veiled Execution', description: 'Whenever this operative is in your STORM:\n• It can perform the Guard action regardless of the killzone (see close quarters rules, Kill Team Core Book).\n• It can perform the Guard action while it has a Conceal order, but if it does, it cannot perform more than one Shoot action for the rest of the turning point (i.e it cannot Shoot both during the interruption and during counteract).' },
    { name: 'HUNTER\'S SENSES (1AP)', description: 'Select one of the following rules for all profiles of this operative\'s instigator bolt carbine to have until the start of its next activation:\n• Severe.\n• Saturate, and whenever this operative is shooting with that weapon, enemy operatives are not obscured.\n\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'WOLF SCOUT, IMPERIUM, ADEPTUS ASTARTES, SPACE WOLVES, FROSTEYE'
);

card('WOLF SCOUT FENRISIAN WOLF', 'Warrior',
  { APL: '2', MOVE: '8"', SAVE: '5+', WOUNDS: '9' },
  [
    { name: 'Fangs', atk: '5', hit: '3+', dmg: '4/5', wr: 'Rending' },
  ],
  [
    { name: 'Instinctive Predator', description: 'This operative cannot perform any actions other than Charge, Dash, Fall Back, Fight, Guard and Reposition. It cannot use any weapons that aren\'t on its datacard. This operative can perform the Charge action while it has a Conceal order.' },
    { name: 'Pounce', description: 'Once per battle STRATEGIC GAMBIT. If this operative\'s APL stat is 2 or more, this operative can perform a free Charge, Fall Back or Reposition action. If it does, until the end of its next activation, subtract 1 from its APL stat and it cannot perform any of the aforementioned actions.' },
  ],
  'WOLF SCOUT, IMPERIUM, ADEPTUS ASTARTES, SPACE WOLVES, FENRISIAN WOLF'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Wolf Scouts populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
