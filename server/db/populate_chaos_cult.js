import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Chaos Cult'").get()?.id;
if (!FACTION_ID) { console.error('Chaos Cult faction not found'); process.exit(1); }

// Clear existing Chaos Cult data
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
  `1 CULT DEMAGOGUE operative.

2 BLESSED BLADE operatives.

9 CHAOS DEVOTEE operatives.

1 ICONARCH operative.

1 MINDWITCH operative.`);

rule('faction_rules', null, 'MUTATION', 0,
  `During the battle, friendly CHAOS CULT operatives can MUTATE as follows:

• As a STRATEGIC GAMBIT, you can MUTATE a number of friendly CHAOS CULT operatives based on the turning point as follows: TP1 = 2, TP2 = 2, TP3 = 3, TP4+ = 4.
• Whenever a friendly DEVOTEE operative incapacitates an enemy operative within its control range, it can MUTATE.
• Each operative cannot MUTATE more than once per turning point.

Whenever a friendly operative MUTATES, select one of the following:
• If it's a DEVOTEE operative, turn it into a MUTANT operative.
• If it's a MUTANT operative, turn it into a TORMENT operative (max twice per turning point).
• It can regain D3+1 lost wounds.

You cannot have more than five MUTANT operatives and three TORMENT operatives at once. Whenever a friendly operative turns into a new operative:

• Swap the miniatures, ensuring the centre of the new miniature's base is as close as possible to where the centre of the old miniature's base was. This can put it within control range of enemy operatives, and if the old miniature was, the new miniature must be if possible.
• The new operative type loses a number of wounds equal to the lost wounds of its preceding operative type.
• It's still the same operative for any rules it's already been selected for. The operative is simply a new operative type and will use that new type's miniature and datacard rules.`);

rule('faction_rules', 'Accursed Gift', 'DEFORMED WINGS', 0,
  'Whenever this operative is climbing up, you can treat the vertical distance as 2" (regardless of how far the operative actually moves vertically). Whenever this operative is dropping, ignore the vertical distance.');

rule('faction_rules', 'Accursed Gift', 'FLEET', 0,
  'Add 1" to this operative\'s Move stat.');

rule('faction_rules', 'Accursed Gift', 'CHITINOUS', 0,
  'Improve this operative\'s Save stat by 1.');

rule('faction_rules', 'Accursed Gift', 'HORNED', 0,
  'Whenever this operative ends its move during the Charge action, you can inflict 1 damage on one enemy operative within its control range, or D3 damage instead if this operative is a TORMENT.');

rule('faction_rules', 'Accursed Gift', 'SINEWED', 0,
  'You can ignore any changes to the Hit stat of this operative\'s melee weapons from being injured. This operative\'s melee weapons have the Brutal weapon rule.');

rule('faction_rules', 'Accursed Gift', 'BARBED', 0,
  `Whenever this operative is fighting or retaliating:

• Enemy operatives cannot assist.
• The first time you strike during that sequence, also inflict 1 damage on each other enemy operative within this operative's control range, or D3 damage instead if this operative is a TORMENT.`);

rule('faction_rules', null, 'ACCURSED GIFTS', 0,
  `ACCURSED GIFTS are rules that friendly CHAOS CULT operatives gain when they turn into another operative type (see Mutation faction rule). The first time a friendly DEVOTEE operative turns into a MUTANT operative during the battle, select your primary ACCURSED GIFT. The first time a friendly MUTANT operative turns into a TORMENT operative during the battle, select your secondary ACCURSED GIFT.

All friendly MUTANT operatives have your primary ACCURSED GIFT, and all friendly TORMENT operatives have your primary and secondary ACCURSED GIFTS. You cannot select the same ACCURSED GIFT more than once per battle.`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'EXALTATION IN PAIN', 1,
  'You can ignore any changes to the Hit stat of friendly CHAOS CULT operatives\' weapons from being injured (including their weapons\' stats). Whenever an operative is shooting a friendly CHAOS CULT operative that\'s wounded, you can re-roll one of your defence dice.');

rule('ploy', 'Strategy', 'FERVENT ONSLAUGHT', 1,
  'Friendly CHAOS CULT operatives\' melee weapons have the Accurate 1 weapon rule, or the Accurate 2 weapon rule if that friendly operative is a MUTANT or TORMENT operative.');

rule('ploy', 'Strategy', 'CREATURES OF NIGHTMARE', 1,
  'Whenever determining control of a marker, treat the total APL stat of enemy operatives that contest it as 1 lower if at least one of those enemy operatives is within 2" of any friendly CHAOS CULT MUTANT or CHAOS CULT TORMENT operatives. Note this isn\'t a change to the APL stat, so any changes are cumulative with this.');

rule('ploy', 'Strategy', 'SICKENING AURA', 1,
  'Whenever an enemy operative is within 2" of any friendly CHAOS CULT MUTANT or CHAOS CULT TORMENT operatives, worsen the Hit stat of that enemy operative\'s weapons by 1. This isn\'t cumulative with being injured.');

rule('ploy', 'Firefight', 'FAITHFUL FOLLOWER', 1,
  'Use this firefight ploy when a friendly CHAOS CULT DARK COMMUNE operative is selected as the valid target of a Shoot action or to fight against during the Fight action. Select one other friendly CHAOS CULT operative (excluding DARK COMMUNE) visible to and within 3" of that DARK COMMUNE operative to become the valid target or to be fought against (as appropriate) instead (even if it wouldn\'t normally be valid for this). If it\'s the Fight action, treat that other operative as being within the fighting operative\'s control range for the duration of that action. If it\'s the Shoot action, that other operative is only in cover or obscured if the original target was. This ploy has no effect if it\'s the Shoot action and the ranged weapon has the Blast or Torrent weapon rule.');

rule('ploy', 'Firefight', 'FRENZIED DEMISE', 1,
  'Use this firefight ploy when a friendly CHAOS CULT MUTANT or CHAOS CULT TORMENT operative is incapacitated, before it\'s removed from the killzone. Inflict D3 damage (or D6 damage instead if that friendly operative is a TORMENT) on one enemy operative visible to and within 2" of that friendly operative.');

rule('ploy', 'Firefight', 'UNLEASH THE DAEMON', 1,
  'Use this firefight ploy during a friendly CHAOS CULT MUTANT or CHAOS CULT TORMENT operative\'s activation. During that activation, that operative can perform two Fight actions, and one of them can be free.');

rule('ploy', 'Firefight', 'ABHORRENT MUTATION', 1,
  'Use this firefight ploy when a friendly CHAOS CULT operative (excluding DARK COMMUNE) is activated. Select an ACCURSED GIFT for that operative to gain. This is in addition to any ACCURSED GIFTS it already has. Each friendly operative can only be selected for this ploy once per battle, and if that operative turns into a different one (see Mutation faction rule), it still has that ACCURSED GIFT.');

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

rule('equipment', null, 'BALEFUL SCRIPT', 0,
  'Once per battle STRATEGIC GAMBIT. Change one of your ACCURSED GIFTS. Note that if it\'s an ACCURSED GIFT an operative has from the Abhorrent Mutation firefight ploy, only that operative benefits from this.');

rule('equipment', null, 'COVERT GUISE', 0,
  'After revealing this equipment option, roll one D3. As a STRATEGIC GAMBITE in the first turning point, a number of friendly CHAOS CULT DEVOTEE operatives equal to the result that are wholly within your drop zone can immediately perform a free Reposition action, but must end that move wholly within 3" of your drop zone.');

rule('equipment', null, 'UNHOLY TALISMAN', 0,
  'Once per turning point, when an operative is shooting a friendly CHAOS CULT operative, in the Roll Defence Dice step, you can retain one of your normal successes as a critical success instead.');

rule('equipment', null, 'VILE BLESSING', 0,
  'Once per battle, when an attack dice inflicts Normal Dmg on a friendly CHAOS CULT operative (excluding DEVOTEE), you can ignore that inflicted damage. If that friendly operative is a MUTANT or TORMENT operative, you cannot roll for the Unnatural Regeneration rule for that attack dice then decide to use this rule on the same dice - you must use one or the other.');

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('CULT DEMAGOGUE', 'Leader',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '8' },
  [
    { name: 'Pistol',                      atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Diabolical stave – Ranged',   atk: '4', hit: '4+', dmg: '3/6', wr: 'Range 2", Stun' },
    { name: 'Diabolical stave – Melee',    atk: '4', hit: '4+', dmg: '3/6', wr: 'Stun, Shock' },
  ],
  [
    { name: 'INCITE SLAUGHTER (1AP)', description: 'SUPPORT. One other friendly CHAOS CULT operative visible to and within 9" of this operative can immediately perform a free Fight action. This operative cannot perform this action while within control Range of an enemy operative.' },
    { name: 'INCITE URGENCY (1AP)', description: 'SUPPORT. One other friendly CHAOS CULT operative visible to and within 9" of this operative can immediately perform a free Charge or Dash action (for the former, it cannot move more than 3"). This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'CHAOS CULT, CHAOS, LEADER, DARK COMMUNE, CULT DEMAGOGUE'
);

card('BLESSED BLADE', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '8' },
  [
    { name: 'Commune blade', atk: '4', hit: '4+', dmg: '4/6', wr: 'Lethal 5+' },
  ],
  [
    { name: 'Cut Them Down', description: 'Each time an enemy operative starts a Fall Back action while within Engagement Range of this operative, you can use this ability. If you do so, that enemy operative suffers 1D3+1 damage on that operative before it moves. If that enemy operative is within control Range of two of these operatives, inflict 2D3 + 2 damage instead.' },
    { name: 'Attuned In Purpose', description: 'Each time this operative is activated, you can also activate another ready friendly BLESSED BLADE operative within 6" of it at the same time. Complete their actions in any order.' },
  ],
  'CHAOS CULT, CHAOS, DARK COMMUNE, BLESSED BLADE'
);

card('ICONARCH', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '8' },
  [
    { name: 'Burning censer',   atk: '4', hit: '2+', dmg: '4/4', wr: 'Range 5", Saturate, Torrent 2' },
    { name: 'Pistol',           atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Crude melee weapon', atk: '3', hit: '4+', dmg: '2/3', wr: '-' },
  ],
  [
    { name: 'Icon Bearer', description: 'Whenever determining control of a marker, treat this operative\'s APL stat as 1 higher. Note this isn\'t a change to its APL stat, so any changes are cumulative with this.' },
    { name: 'RUINOUS ICON (1APL)', description: 'Select one of the following effects to last until the start of this operative\'s next activation, until it\'s incapacitated or until it performs this action again (whichever comes first):\n• Invigoration: PSYCHIC. Whenever a friendly CHAOS CULT operative is within 4" of this operative, Normal and Critical Dmg of 4 or more inflicts 1 less damage on that operative.\n• Deterioration: PSYCHIC. Whenever an enemy operative is within 4" of this operative, Normal and Critical Dmg inflicts 1 more damage on that operative.\nThis operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'CHAOS CULT, CHAOS, DARK COMMUNE, PSYKER, ICONARCH'
);

card('MINDWITCH', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '8' },
  [
    { name: 'Infernal Gaze', atk: '5', hit: '3+', dmg: '0/0', wr: 'PSYCHIC, Range 6", Devastating 2, Lethal 3+' },
    { name: 'Fists',         atk: '3', hit: '5+', dmg: '1/2', wr: '-' },
  ],
  [
    { name: 'HEINOUS DELUGE (1APL)', description: 'PSYCHIC: Select one enemy operative that\'s a valid target for this operative. Until the end of that operative\'s next activation, subtract 1 from its APL stat. This operative cannot perform this action while within control Range of an enemy operative.' },
    { name: 'MALEFIC VORTEX (1APL)', description: 'PSYCHIC: Remove your Malefic Vortex marker from the killzone (if any). Then place your Malefic Vortex marker visible to this operative, or on Vantage terrain of a terrain feature that\'s visible to this operative. Inflict 1 damage on each enemy operative within 2" of that marker. In addition, in the Ready step of each Strategy phase, inflict 1 damage on each enemy operative within 2" of that marker. This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'CHAOS CULT, CHAOS, DARK COMMUNE, PSYKER, MINDWITCH'
);

card('CHAOS DEVOTEE', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Pistol',             atk: '4', hit: '4+', dmg: '2/3', wr: 'Range 8"' },
    { name: 'Crude melee weapon', atk: '4', hit: '4+', dmg: '2/3', wr: '-' },
  ],
  [
    { name: 'Group Activation', description: 'Whenever this operative is expended, you must then activate one other ready friendly CHAOS CULT DEVOTEE operative (if able) before your opponent activates. When that other operative is expended, your opponent then activates as normal (in other words, you cannot activate more than two operatives in succession with this rule).' },
  ],
  'CHAOS CULT, CHAOS, DEVOTEE'
);

card('CHAOS MUTANT', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '7' },
  [
    { name: 'Blasphemous appendages', atk: '4', hit: '4+', dmg: '3/4', wr: 'Ceaseless, Rending' },
  ],
  [
    { name: 'Accursed Mutant', description: 'This operative cannot perform unique actions. You must spend 1 additional AP for this operative to perform the Pick Up Marker and mission actions (excluding Operate Hatch).' },
    { name: 'Unnatural Regeneration', description: 'Whenever an attack dice inflicts damage of 3 or more on this operative, roll one D6: on a 5+, subtract 1 from that inflicted damage.' },
  ],
  'CHAOS CULT, CHAOS, CHAOS MUTANT'
);

card('CHAOS TORMENT', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '5+', WOUNDS: '13' },
  [
    { name: 'Hideous mutations', atk: '5', hit: '4+', dmg: '4/5', wr: 'Ceaseless, Rending' },
  ],
  [
    { name: 'Accursed Torment', description: 'This operative cannot use any weapons that aren\'t on its datacard, or perform the Pick Up Marker, unique or mission actions (excluding Operate Hatch).' },
    { name: 'Brute', description: 'Whenever your opponent is selecting a valid target, if this operative has a Conceal order, it cannot use Light terrain for cover. While this can allow this operative to be targeted (assuming it\'s visible), it doesn\'t remove its cover save (if any).' },
    { name: 'Unnatural Regeneration', description: 'Whenever an attack dice inflicts damage of 3 or more on this operative, roll one D6: on a 5+, subtract 1 from that inflicted damage.' },
  ],
  'CHAOS CULT, CHAOS, CHAOS TORMENT'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Chaos Cult populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
