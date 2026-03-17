import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Corsair Voidscarred'").get()?.id;
if (!FACTION_ID) { console.error('Corsair Voidscarred faction not found'); process.exit(1); }

// Clear existing Corsair Voidscarred data
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
  `1 VOIDSCARRED FELARCH operative equipped with one of the following options:
• Shuriken rifle; Shuriken pistol; Power weapon
• Neuro disruptor; Power weapon

8 CORSAIR VOIDSCARRED operatives selected from the following list:
• FATE DEALER
• GUNNER equipped with a shuriken pistol, fists and one of the following options:
  - Blaster*; Shuriken pistol; Fists
  - Shredder; Shuriken pistol; Fists
• HEAVY GUNNER equipped with a shuriken pistol, fists and one of the following options:
  - Shuriken cannon; Shuriken pistol; Fists
  - Wraithcannon*; Shuriken pistol; Fists
• KURNATHI
• KURNITE HUNTER
• SHADE RUNNER
• SOUL WEAVER
• STARSTORM DUELLIST
• WAY SEEKER
• WARRIOR with one of the following options:
  - Shuriken pistol; power weapon
  - Shuriken rifle; fists

Other than WARRIOR operatives, your kill team can only include each operative above once.

*Your kill team cannot include both a Blaster and a Wraithcannon.`);

rule('faction_rules', null, 'AELDARI RAIDERS', 0,
  'Each friendly CORSAIR VOIDSCARRED operative can perform a free Dash action during their activation.');

rule('faction_rules', null, 'RIFLES', 0,
  'Whenever a friendly CORSAIR VOIDSCARRED operative is shooting with a shuriken rifle or ranger long rifle during an activation in which it hasn\'t performed the Charge, Fall Back or Reposition action, that weapon has the Accurate 1 weapon rule. Note that operative isn\'t restricted from performing those actions after shooting.');

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'PLUNDERERS', 1,
  'Up to D3 friendly CORSAIR VOIDSCARRED operatives can immediately perform a free Dash action in an order of your choice. This turning point, each that does so cannot perform the Dash action during their activation. You cannot use this ploy during the first turning point.');

rule('ploy', 'Strategy', 'PIRATICAL PROFITEERS', 1,
  'Whenever a friendly CORSAIR VOIDSCARRED operative is shooting, fighting or retaliating, if it or the enemy operative in that sequence contests an objective marker or one of your mission markers, that friendly operative\'s weapons have the Balanced weapon rule.');

rule('ploy', 'Strategy', 'MOBILE ENGAGEMENT', 1,
  'Whenever an operative is shooting a friendly CORSAIR VOIDSCARRED operative that performed an action in which it moved during this turning point, you can re-roll one of your defence dice.');

rule('ploy', 'Strategy', 'OUTCASTS', 1,
  'Whenever a friendly CORSAIR VOIDSCARRED operative is more than 5" from other friendly operatives, its weapons have the Punishing weapon rule.');

rule('ploy', 'Firefight', 'OPPORTUNISTIC FIGHTERS', 1,
  'Use this firefight ploy when an enemy operative performs the Fall Back action. Before it moves, inflict 2D3 damage on that operative for each friendly CORSAIR VOIDSCARRED operative within its control range.');

rule('ploy', 'Firefight', 'LIGHT FINGERS', 1,
  'Use this firefight ploy during a friendly CORSAIR VOIDSCARRED operative\'s activation. Until the end of that activation, having an enemy operative within its control range doesn\'t prevent that friendly operative from performing the Pick Up Marker or Mission actions.');

rule('ploy', 'Firefight', 'CAPRICIOUS FLIGHT', 1,
  'Use this firefight ploy during a friendly CORSAIR VOIDSCARRED operative\'s activation, before or after it performs an action. During that activation, that operative can perform the Fall Back action for 1 less AP.');

rule('ploy', 'Firefight', 'CONTEMPTUOUS ADVENTURER', 1,
  'Use this firefight ploy when the first friendly CORSAIR VOIDSCARRED operative is activated during the turning point if it\'s more than 5" from other friendly operatives. The first time that operative performs either the Shoot or Fight action during that activation, it has the Relentless weapon rule. Note: this ploy cannot come into effect more than once per activation (you cannot use it during both the Shoot and Fight action in the same activation).');

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

rule('equipment', null, 'DIURNAL MANTLE', 0,
  'Whenever an operative is shooting a friendly CORSAIR VOIDSCARRED operative, if the ranged weapon in that sequence has the Blast or Torrent weapon rule, you can re-roll one of your defense dice. In addition, friendly CORSAIR VOIDSCARRED operatives aren\'t affected by the X" Devastating X weapon rule (i.e. Devastating with a distance) unless they are the target during that sequence.');

rule('equipment', null, 'RUNES OF GUIDANCE', 0,
  'Once per turning point, when a friendly VOIDSCARRED WAY SEEKER or VOIDSCARRED SOUL WEAVER operative is performing a PSYCHIC action (excluding Warp Fold), you can use this rule. If you do, until the end of that action, add 3" to its distance requirement. Note this has no effect on PSYCHIC weapons (e.g., the Devastating distance requirement of lightning strike).');

rule('equipment', null, 'MISTFIELD', 0,
  'Once per turning point, when an operative is shooting a friendly CORSAIR VOIDSCARRED operative more than 3" away, during the Roll Defense Dice step, worsen the x of the Piercing weapon rule by 1 (if any) until the end of that sequence. This may cause Piercing 1 to be ignored.');

rule('equipment', null, 'STAR CHARTS', 0,
  'STRATEGIC GAMBIT: Roll one D3: If the result is higher than the number of the current turning point, you gain 1CP and cannot use this STRATEGIC GAMBIT for the rest of the battle.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('VOIDSCARRED FELARCH', 'Leader',
  { APL: '2', MOVE: '7"', SAVE: '4+', WOUNDS: '9' },
  [
    { name: 'Neuro disruptor', atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 8", Piercing 1, Stun' },
    { name: 'Shuriken pistol', atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Rending' },
    { name: 'Shuriken rifle',  atk: '4', hit: '3+', dmg: '3/4', wr: 'Rending' },
    { name: 'Power weapon',    atk: '4', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Veteran Raider', description: 'This operative can perform a 1AP action for free during their activation as a result of the Aeldari Raiders rule (instead of the Dash action).' },
    { name: 'One Step Ahead', description: 'Once per battle, after an enemy operative performs an action, if this operative is ready, you can use this rule. If you do, roll one D6: if the result is higher than that enemy operative\'s APL stat, you can interrupt and immediately perform either a free Shoot or a free Fight action with this operative, but other enemy operatives cannot be selected as a valid target to fight against during that action (note that secondary targets from the Blast weapon rule can still be targeted). After you perform that action, subtract 1 from this operative\'s APL stat until the end of its next activation.' },
  ],
  'CORSAIR VOIDSCARRED, AELDARI, ANHRATHE, LEADER, FELARCH'
);

card('VOIDSCARRED GUNNER', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Blaster',         atk: '4', hit: '3+', dmg: '4/5', wr: 'Piercing 2' },
    { name: 'Shredder',        atk: '4', hit: '3+', dmg: '4/5', wr: 'Rending, Torrent 2' },
    { name: 'Shuriken pistol', atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Rending' },
    { name: 'Fists',           atk: '3', hit: '3+', dmg: '2/3', wr: '–' },
  ],
  [],
  'CORSAIR VOIDSCARRED, AELDARI, ANHRATHE, GUNNER'
);

card('VOIDSCARRED HEAVY GUNNER', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Shuriken cannon – Focused',   atk: '5', hit: '3+', dmg: '4/5', wr: 'Heavy (Dash only), Rending' },
    { name: 'Shuriken cannon – Sweeping',  atk: '4', hit: '3+', dmg: '4/5', wr: 'Heavy (Dash only), Rending, Torrent 1' },
    { name: 'Shuriken pistol',             atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Rending' },
    { name: 'Wraithcannon',                atk: '4', hit: '3+', dmg: '6/3', wr: 'Devastating 4, Heavy (Dash only), Piercing 2' },
    { name: 'Fists',                       atk: '3', hit: '3+', dmg: '2/3', wr: '–' },
  ],
  [],
  'CORSAIR VOIDSCARRED, AELDARI, ANHRATHE, HEAVY GUNNER'
);

card('VOIDSCARRED STARSTORM DUELLIST', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Fusion pistol',   atk: '4', hit: '3+', dmg: '5/3', wr: 'Range 3", Devastating 3, Piercing 2' },
    { name: 'Shuriken pistol', atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Rending' },
    { name: 'Fists',           atk: '3', hit: '3+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Quick on the Trigger', description: 'This operative can perform the Shoot action while within control Range of an enemy operative. If it does, when selecting a valid target, you can only select an enemy operative within this operative\'s control Range, and can do so even if other friendly operatives are within that enemy operative\'s control Range.' },
    { name: 'PISTOL BARRAGE (1APL)', description: 'Perform two free Shoot actions with this operative (this takes precedence over action restrictions). You must select its fusion pistol for one action and its shuriken pistol for the other (in any order). This operative cannot perform this action while it has a Conceal order.' },
  ],
  'CORSAIR VOIDSCARRED, AELDARI, ANHRATHE, STARSTORM DUELLIST'
);

card('VOIDSCARRED KURNITE HUNTER', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Faolchú',         atk: '4', hit: '3+', dmg: '1/2', wr: 'Rending, Saturate, Seek Light, Silent' },
    { name: 'Shuriken pistol', atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Rending' },
    { name: 'Power weapon',    atk: '4', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Faolchú\'s Bond', description: 'The first time during each turning point that this operative is retaliating, if it\'s ready, in the Resolve Attack Dice step of that sequence, you resolve the first attack dice (i.e. defender instead of attacker).' },
    { name: 'Erudite Hunter', description: 'STRATEGIC GAMBIT. Select one enemy operative within 9" of this operative. Once during this turning point, after that enemy operative performs an action in which it moves, you can interrupt to use this rule. If you do, this operative can immediately perform either a free Reposition action (it cannot end that move further from that enemy operative), or a free Charge action (you can change its order to do so, and it must end that move within control Range of that enemy operative).' },
  ],
  'CORSAIR VOIDSCARRED, AELDARI, ANHRATHE, KURNITE HUNTER'
);

card('VOIDSCARRED SHADE RUNNER', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Shuriken pistol',  atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Rending' },
    { name: 'Throwing blades',  atk: '4', hit: '3+', dmg: '2/4', wr: 'Range 6", Silent' },
    { name: 'Hekatarii blades', atk: '4', hit: '3+', dmg: '3/5', wr: 'Ceaseless, Lethal 5+' },
  ],
  [
    { name: 'Blink Pack', description: 'Whenever this operative performs the Charge, Fall Back or Reposition action, it can warp jump. If it does, don\'t move it. Instead, remove it from the killzone and set it back up wholly within 7" of its original location, measuring the horizontal distance only (in Killzone: Gallowdark, this distance can be measured through walls). It must be set up in a location it can be placed, and unless it\'s the Charge action, it cannot be set up within control Range of an enemy operative.' },
    { name: 'Slicing Attack', description: 'Whenever this operative performs the Reposition action with a warp jump (see Blink Pack), you can use this rule. If you do, after it moves, draw an imaginary line 1mm in diameter and up to 7" long between it and its previous location. Note this doesn\'t have to be a straight line. Inflict 1D3+2 damage on one enemy operative that line crosses. You cannot inflict damage on an enemy operative that was not visible to this operative at the start of that action.' },
  ],
  'CORSAIR VOIDSCARRED, AELDARI, ANHRATHE, FLY, SHADE RUNNER'
);

card('VOIDSCARRED KURNATHI', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Shuriken pistol',    atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Rending' },
    { name: 'Dual power weapons', atk: '4', hit: '3+', dmg: '4/6', wr: 'Ceaseless, Lethal 5+' },
  ],
  [
    { name: 'Blademaster', description: 'This operative can perform the Dash action during an activation in which it performed the Charge action, but can only use any remaining move distance it had from that Charge action (to a maximum of 3").' },
    { name: 'Bladed Stance', description: 'Whenever this operative is fighting or retaliating, you can resolve one of your successes before the normal order. If you do, that success must be used to block.' },
  ],
  'CORSAIR VOIDSCARRED, AELDARI, ANHRATHE, KURNATHI'
);

card('VOIDSCARRED FATE DEALER', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Ranger long rifle – Stationary', atk: '4', hit: '2+', dmg: '3/3', wr: 'Devastating 3, Heavy, Silent' },
    { name: 'Ranger long rifle – Mobile',     atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Shuriken pistol',                atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Rending' },
    { name: 'Fists',                          atk: '3', hit: '3+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Camo Cloak', description: 'Whenever an operative is shooting this operative: Ignore the Saturate weapon rule. If you can retain any cover saves, you can retain one additional cover save, or you can retain one cover save as a critical success instead. This isn\'t cumulative with improved cover saves from Vantage terrain.' },
  ],
  'CORSAIR VOIDSCARRED, AELDARI, ANHRATHE, FATE DEALER'
);

card('VOIDSCARRED WAY SEEKER', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Freezing Grasp',  atk: '4', hit: '3+', dmg: '1/2', wr: 'PSYCHIC, Severe, Silent, Stun' },
    { name: 'Lightning Strike', atk: '4', hit: '3+', dmg: '4/3', wr: 'PSYCHIC, 2" Devastating 2' },
    { name: 'Shuriken pistol', atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Rending' },
    { name: 'Witch staff',     atk: '4', hit: '3+', dmg: '3/5', wr: 'PSYCHIC, Shock' },
  ],
  [
    { name: 'WARP FOLD (1AP)', description: 'PSYCHIC: Select two friendly CORSAIR VOIDSCARRED operatives visible to and within 5" of this operative. Remove them both from the killzone and set them back up in each other\'s previous locations (in other words, swap their positions). If one of them performed the Charge, Fall Back or Reposition action during this turning point and the other is ready, the other cannot perform any of those actions in its activation during this turning point. This operative cannot perform this action while within control Range of an enemy operative.' },
    { name: 'WARDING SHIELD (1AP)', description: 'PSYCHIC: Select one friendly CORSAIR VOIDSCARRED operative visible to and within 6" of this operative. Until the start of this operative\'s next activation, until it\'s incapacitated or until it performs this action again (whichever comes first), the first time an attack dice inflicts normal damage on that friendly operative, ignore that inflicted damage. This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'CORSAIR VOIDSCARRED, AELDARI, ANHRATHE, PSYKER, MEDIC, WAY SEEKER'
);

card('VOIDSCARRED SOUL WEAVER', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Shuriken pistol', atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Rending' },
    { name: 'Power weapon',    atk: '4', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
  ],
  [
    { name: 'SOUL CHANNEL (1AP)', description: 'PSYCHIC: Select one other friendly CORSAIR VOIDSCARRED operative visible to and within 6" of this operative. Until the end of that operative\'s next activation, add 1 to its APL stat. This operative cannot perform this action while within control Range of an enemy operative.' },
    { name: 'SOUL HEAL (1AP)', description: 'PSYCHIC: Select one friendly CORSAIR VOIDSCARRED operative visible to and within 6" of this operative. That operative regains 2D3 lost wounds. This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'CORSAIR VOIDSCARRED, AELDARI, ANHRATHE, PSYKER, SOUL WEAVER'
);

card('VOIDSCARRED WARRIOR', 'Warrior',
  { APL: '2', MOVE: '7"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Shuriken rifle',  atk: '4', hit: '3+', dmg: '3/4', wr: 'Rending' },
    { name: 'Shuriken pistol', atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8", Rending' },
    { name: 'Fists',           atk: '3', hit: '3+', dmg: '2/3', wr: '–' },
    { name: 'Power weapon',    atk: '4', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Prowling Raiders', description: 'You can use the Capricious Flight and Light Fingers firefight ploys for 0CP each if a friendly WARRIOR operative is the specified CORSAIR VOIDSCARRED operative.' },
  ],
  'CORSAIR VOIDSCARRED, AELDARI, ANHRATHE, WARRIOR'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Corsair Voidscarred populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
