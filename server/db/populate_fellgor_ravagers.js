import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Fellgor Ravagers'").get()?.id;
if (!FACTION_ID) { console.error('Fellgor Ravagers faction not found'); process.exit(1); }

// Clear existing Fellgor Ravagers data
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
  `1 IRONHORN FELLGOR RAVAGER operative with one of the following options:
• Corrupted pistol; Corrupted chainsword
• Plasma pistol; Bludgeon

9 FELLGOR RAVAGER operatives selected from the following list:
• DEATHKNELL
• FLUXBRAY
• GNARLSCAR
• GOREHORN
• HERD-GOAD
• MANGLER
• SHAMAN
• TOXHORN
• VANDAL
• WARRIOR with one of the following options:
  - Autopistol; Bludgeon
  - Autopistol; Cleaver

Other than WARRIOR operatives, your kill team can only include each operative above once.`);

rule('faction_rules', null, 'FRENZY', 0,
  `Each time a friendly FELLGOR RAVAGER operative without a Frenzy token would be incapacitated, it gains a Frenzy token instead. If it was fighting in combat, all remaining attack dice (including your opponent\'s) are discarded. If it has a Conceal order, change it to Engage.

While a friendly FELLGOR RAVAGER operative has a Frenzy token:

• It\'s only incapacitated as specified below.
• It cannot have a Conceal order.
• It\'s injured.
• It cannot perform mission actions, unique (excluding Sweeping Blow, see VANDAL) or the Pick Up action (excluding Operate Hatch).
• For the purpose of determining control of markers and areas of the killzone, treat its APL stat as 1. This takes precedence over any stat changes

A friendly FELLGOR RAVAGER operative with a Frenzy token is incapacitated when one of the following conditions is met:

• Its activation or counteraction ends.
• An enemy operative strikes it with a critical hit in combat.
• An enemy operative strikes it a second time with a normal hit in combat. Note that this can be strikes from two different combats.
• The battle ends.
• Critical damage is inflicted on it in a subsequent shooting attack (i.e. not the same shooting attack in which it gained a Frenzy token).

Your opponent treats a FELLGOR RAVAGER operative as being incapacitated (instead of when it would be incapacitated normally) when it gains one of your Frenzy tokens for the purposes of scoring VPs (e.g. kill op) and faction rules that require it to be incapacitated (e.g. HAND OF THE ARCHON Power From Pain, CHAOS CULT Mutation, etc.).`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'VIOLENT TEMPERAMENT', 1,
  'Whenever a friendly FELLGOR RAVAGER operative is fighting or retaliating, after rolling your attack dice, you can use this rule. If you do, you must re-roll all of your attack dice (you cannot only re-roll some).');

rule('ploy', 'Strategy', 'AMBUSH', 1,
  'Whenever a friendly FELLGOR RAVAGER operative is activated, if its order is changed from Conceal to Engage, it\'s ambushing for that activation. Whenever a friendly FELLGOR RAVAGER operative that\'s ambushing is fighting, you can retain one of your normal successes as a critical success instead. Note that an operative that has one of your Frenzy tokens cannot ambush.');

rule('ploy', 'Strategy', 'PELTING FIREPOWER', 1,
  'Whenever a friendly FELLGOR RAVAGER operative is shooting an enemy operative that\'s been shot by another friendly FELLGOR RAVAGER operative during this turning point, that first friendly operative\'s ranged weapons have the Ceaseless weapon rule; if the enemy operative has been shot by more than one other friendly FELLGOR RAVAGER operative during this turning point, that first friendly operative\'s ranged weapons have the Relentless weapon rule instead.');

rule('ploy', 'Strategy', 'RECKLESS DETERMINATION', 1,
  'Whenever an enemy operative is shooting an expended friendly FELLGOR RAVAGER operative, if you cannot retain any cover saves, you can retain one of your defence dice as a normal success without rolling it.');

rule('ploy', 'Firefight', 'RUTHLESS RAMPAGE', 1,
  'Use this firefight ploy after a friendly FELLGOR RAVAGER operative performs the Fight action, if it\'s no longer within control range of enemy operatives. That friendly operative can immediately perform a free Charge action (even if it\'s already performed the Charge action during that activation), but cannot move more than 3" during that action.');

rule('ploy', 'Firefight', 'WILD RAGE', 1,
  'Use this firefight ploy when a friendly FELLGOR RAVAGER operative is activated. Until the end of that operative\'s activation, add 1" to its Move stat.');

rule('ploy', 'Firefight', 'ANIMALISTIC FURY', 1,
  'Use this firefight ploy when a friendly FELLGOR RAVAGER operative is fighting or retaliating and you strike with a critical success. Inflict 1 additional damage with that strike.');

rule('ploy', 'Firefight', 'BLOODSENSE', 1,
  'Use this firefight ploy during a friendly FELLGOR RAVAGER operative\'s activation, when it incapacitates an enemy operative within its control range. Select one other ready friendly FELLGOR RAVAGER operative that\'s visible to and within 3" of the incapacitated enemy operative. When that first friendly operative is expended, you can activate that other friendly operative before your opponent activates.');

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

rule('equipment', null, 'BRASS ADORNMENTS', 0,
  'Once per battle, you can use the Animalistic Fury and Wild Rage firefight ploys for 0CP each.');

rule('equipment', null, 'CHAOS SIGIL', 0,
  'Once per turning point, when an operative is shooting a friendly FELLGOR RAVAGER operative, at the start of the Roll Defence Dice step, you can use this rule. If you do, worsen the x of the Piercing weapon rule by 1 (if any) until the end of that sequence. Note that Piercing 1 would therefore be ignored.');

rule('equipment', null, 'GORE MARKS', 0,
  'Once per turning point, when a friendly FELLGOR RAVAGER operative is fighting or retaliating, you can use this rule. If you do, inflict 1 damage on that friendly operative and re-roll one of your attack dice. If the result is a fail, inflict 1 additional damage on that friendly operative.');

rule('equipment', null, 'WAR PAINT', 0,
  'You can ignore any changes to the Move stat of friendly FELLGOR RAVAGER operatives from being injured.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('FELLGOR IRONHORN', 'Leader',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '11' },
  [
    { name: 'Corrupted pistol',          atk: '4', hit: '4+', dmg: '3/5', wr: 'Range 8", Rending' },
    { name: 'Plasma pistol – Standard',  atk: '4', hit: '4+', dmg: '3/5', wr: 'Range 8", Piercing 1' },
    { name: 'Plasma pistol – Supercharge', atk: '4', hit: '4+', dmg: '4/5', wr: 'Range 8", Hot, Lethal 5+, Piercing 1' },
    { name: 'Bludgeon',                  atk: '4', hit: '3+', dmg: '4/4', wr: 'Brutal' },
    { name: 'Corrupted chainsword',      atk: '4', hit: '3+', dmg: '4/5', wr: 'Rending' },
  ],
  [
    { name: 'Call the Attack', description: 'STRATEGIC GAMBIT if this operative doesn\'t have one of your Frenzy tokens. Select one friendly FELLGOR RAVAGER operative visible to and within 6" of this operative. That selected operative, and each other friendly FELLGOR RAVAGER operative visible to and within 2" of it, can immediately perform a free Dash action in an order of your choice.' },
  ],
  'FELLGOR RAVAGERS, CHAOS, IRONHORN'
);

card('FELLGOR DEATHKNELL', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '10' },
  [
    { name: 'Autopistol', atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Bludgeon',   atk: '4', hit: '3+', dmg: '4/4', wr: 'Brutal' },
  ],
  [
    { name: 'Icon Bearer', description: 'This operative isn\'t affected by the marker control bullet point of the Frenzy faction rule. Whenever determining control of a marker, treat this operative\'s APL stat as 1 higher. Note this isn\'t a change to its APL stat, so any changes are cumulative with this.' },
    { name: 'War Gong', description: 'Whenever an attack dice would inflict Critical Dmg on a friendly FELLGOR RAVAGER operative within 3" of this operative, if this operative doesn\'t have one of your Frenzy tokens, you can choose for that attack dice to inflict Normal Dmg instead.' },
    { name: 'GONG KNELL (1AP)', description: 'Until the start of this operative\'s next activation or until this operative is incapacitated (whichever comes first), whenever an operative is shooting this operative, improve this operative\'s Save stat by 1 and ignore the Piercing weapon rule.' },
  ],
  'FELLGOR RAVAGERS, CHAOS, DEATHKNELL'
);

card('FELLGOR FLUXBRAY', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '10' },
  [
    { name: 'Triple cleavers', atk: '4', hit: '3+', dmg: '4/5', wr: 'Ceaseless' },
  ],
  [
    { name: 'Blade Whirl', description: 'Whenever this operative is fighting or retaliating, if it doesn\'t have one of your Frenzy tokens, you can resolve one of your successes before the normal order. If you do, that success must be used to block.' },
    { name: 'CLEAVER FLURRY (2AP)', description: 'Perform a free Reposition action with this operative. During that action, it can move an additional 2", and can move within control Range of enemy operatives (it cannot begin or end the move there). Inflict D3+1 damage on each enemy operative it moved within control Range of (roll separately for each after it\'s moved, in the order it moved within control Range of them). This operative cannot perform this action while it has a Conceal order.' },
  ],
  'FELLGOR RAVAGERS, CHAOS, FLUXBRAY'
);

card('FELLGOR GNARLSCAR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '10' },
  [
    { name: 'Autopistol',  atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Bionic fist', atk: '4', hit: '3+', dmg: '4/5', wr: 'Brutal' },
  ],
  [
    { name: 'Sagacious', description: 'At the end of this operative\'s activation, you can change its order.' },
    { name: 'UNCOMPROMISING ATTACK (1AP)', description: 'Perform a free Fight action with this operative, then a free Shoot action with this operative (or vice versa). This operative can perform that Shoot action while within Engagement Range of an enemy operative, but if it does, it can and must target an enemy operative within its Engagement Range (even if other friendly operatives are within that enemy operative\'s Engagement Range). Only a pistol can be selected for this Shoot action.' },
  ],
  'FELLGOR RAVAGERS, CHAOS, GNARLSCAR'
);

card('FELLGOR GOREHORN', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '10' },
  [
    { name: 'Autopistol',   atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Skullcleaver', atk: '4', hit: '3+', dmg: '4/5', wr: 'Lethal 5+, Headtaker*' },
  ],
  [
    { name: 'Champion', description: 'This operative can perform two Fight actions during its activation.' },
    { name: '*Headtaker', description: 'Whenever this operative incapacitates an operative with this weapon, roll one D3.\n• This operative regains a number of lost wounds equal to the result (unless it has one of your Frenzy tokens).\n• Until the end of the battle, add the result to the Critical Damage stat of this operative\'s skullcleaver (to a maximum of 8).' },
  ],
  'FELLGOR RAVAGERS, CHAOS, GOREHORN'
);

card('FELLGOR HERD-GOAD', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '10' },
  [
    { name: 'Autopistol',             atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Crackthorn whip (ranged)', atk: '4', hit: '2+', dmg: '2/3', wr: 'Range 3", Lethal 4+, Stun' },
    { name: 'Crackthorn whip (melee)', atk: '4', hit: '3+', dmg: '2/3', wr: 'Lethal 4+, Shock' },
  ],
  [
    { name: 'Whip Control', description: 'While an enemy operative is Visible to and within 3" of this operative, and this operative is not within Engagement Range of any other enemy operatives:\n• Subtract 1 from the Attacks characteristic of that enemy operative\'s melee weapons (to a minimum of 1).\n• Your opponent must spend 1 additional action point for that enemy operative to perform the Fall Back action.' },
    { name: 'INCITE FURY (1AP)', description: 'SUPPORT. Select one other friendly FELLGOR RAVAGER operative (excluding a SHAMAN or IRONHORN) Visible to and within 3" of this operative. Until the end of that operative\'s next activation, add 1 to its APL. This operative cannot perform this action while within Engagement Range of an enemy operative.' },
  ],
  'FELLGOR RAVAGERS, CHAOS, HERD-GOAD'
);

card('FELLGOR MANGLER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '10' },
  [
    { name: 'Vicious claws', atk: '4', hit: '3+', dmg: '4/6', wr: 'Ceaseless, Tactual Hunter*' },
  ],
  [
    { name: '*Tactual Hunter', description: 'Whenever this operative is fighting with this weapon against an expended operative, the first time you strike with a critical success during that sequence, you can immediately resolve another of your successes as a strike (before your opponent).' },
    { name: 'Berserker', description: 'This operative cannot make shooting attacks. Each time this operative would perform a mission action (excluding the Operate Hatch action) or the Pick Up action, you must subtract one additional action point to do so.' },
    { name: 'Savage', description: 'The first time this operative performs the Fight action during each of its activations, if it isn\'t incapacitated, it can immediately perform a free Fight action afterwards (you don\'t have to select the same enemy operative to fight against). This takes precedence over action restrictions, and you cannot use the Ruthless Rampage firefight ploy between those two Fight actions.' },
  ],
  'FELLGOR RAVAGERS, CHAOS, MANGLER'
);

card('FELLGOR SHAMAN', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '10' },
  [
    { name: 'Autopistol',  atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Tech-curse',  atk: '4', hit: '3+', dmg: '1/3', wr: 'PSYCHIC, Rending, Saturate, Seek light' },
    { name: 'Braystave',   atk: '4', hit: '3+', dmg: '3/5', wr: 'Shock' },
  ],
  [
    { name: 'MANTLE OF DARKNESS (1AP)', description: 'PSYCHIC. Until the start of this operative\'s next activation or until it\'s incapacitated (whichever comes first), whenever a friendly FELLGOR RAVAGER operative is within 3" of this operative, has a Conceal order and is in cover, that friendly operative cannot be selected as a valid target, taking precedence over all other rules (e.g. Vantage terrain), except being within 2". This operative cannot perform this action while within control Range of an enemy operative.' },
    { name: 'APOPLECTIC REJUVENATION (1AP)', description: 'Select one friendly FELLGOR RAVAGER operative that doesn\'t have one of your Frenzy tokens and is visible to and within 6" of this operative. That friendly operative regains 2D3 lost wounds; if that operative has incapacitated an enemy operative while fighting or retaliating during the battle, it regains 6 lost wounds instead. This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'FELLGOR RAVAGERS, CHAOS, SHAMAN'
);

card('FELLGOR TOXHORN', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '10' },
  [
    { name: 'Autopistol', atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Cleaver',    atk: '4', hit: '3+', dmg: '4/5', wr: '–' },
  ],
  [
    { name: 'Toxic Gifts', description: 'You can ignore any changes to this operative\'s APL characteristic, and it is not affected by the Stun weapon rule. Each time an attack dice inflicts 3 or more normal damage to this operative, roll 1D6: on a 5+, subtract 1 from that damage inflicted.' },
    { name: 'Pox Bomb', description: 'This operative can use Stun grenades (see universal equipment). Doing so does not count against your Limited use of them (i.e., if you also select them as equipment for other operatives). Each time an enemy operative makes a Stun check as a result of this operative performing a Stun Grenade action, if the result is 3+, it also inflicts damage to that enemy operative equal to half of the result of the D6 (rounding up).' },
  ],
  'FELLGOR RAVAGERS, CHAOS, TOXHORN'
);

card('FELLGOR VANDAL', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '10' },
  [
    { name: 'Mancrusher', atk: '4', hit: '4+', dmg: '5/5', wr: 'Brutal, Vicious Blows*' },
  ],
  [
    { name: '*Vicious Blows', description: 'Whenever this operative is fighting, this weapon has the Ceaseless weapon rule.' },
    { name: 'SWEEPING BLOW (1AP)', description: 'Inflict D3+1 damage on each other operative visible to and within 2" of this operative. This operative cannot perform this action while it has a Conceal order.' },
  ],
  'FELLGOR RAVAGERS, CHAOS, VANDAL'
);

card('FELLGOR WARRIOR', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '10' },
  [
    { name: 'Autopistol', atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Bludgeon',   atk: '4', hit: '3+', dmg: '4/4', wr: 'Brutal' },
    { name: 'Cleaver',    atk: '4', hit: '3+', dmg: '4/5', wr: '–' },
  ],
  [
    { name: 'Warrior Frenzy', description: 'Whenever this operative has one of your Frenzy tokens, it cannot be injured. This takes precedence over the normal Frenzy rules.' },
  ],
  'FELLGOR RAVAGERS, CHAOS, WARRIOR'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Fellgor Ravagers populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
