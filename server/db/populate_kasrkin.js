import db from './schema.js';

const FACTION_ID = db.prepare("SELECT id FROM factions WHERE name = 'Kasrkin'").get()?.id;
if (!FACTION_ID) { console.error('Kasrkin faction not found'); process.exit(1); }

// Clear existing Kasrkin data
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
  `1 KASRKIN SERGEANT operative with one of the following options:
• Bolt pistol; power weapon
• Hot-shot lasgun; gun butt
• Hot-shot laspistol; power weapon
• Plasma pistol; chainsword

9 KASRKIN operatives selected from the following list:
• COMBAT MEDIC
• DEMO-TROOPER
• GUNNER with flamer and gun butt*
• GUNNER with grenade launcher and gun butt*
• GUNNER with hot-shot volley gun and gun butt*
• GUNNER with meltagun and gun butt*
• GUNNER with plasma gun and gun butt*
• RECON-TROOPER
• SHARPSHOOTER*
• TROOPER
• VOX-TROOPER

Other than TROOPER operatives, your kill team can only include each operative on this list once.
* You cannot select more than four of these operatives combined.`);

rule('faction_rules', null, 'SKILL AT ARMS', 0,
  `STRATEGIC GAMBIT. Select a SKILL AT ARMS for friendly KASRKIN operatives to have until the Ready step of the next Strategy phase.

LIGHT 'EM UP
Friendly KASRKIN operatives' ranged weapons have the Severe weapon rule.

STRIKE FAST
Whenever a friendly KASRKIN operative is performing the Reposition action, add 1" to its Move stat.

ICE IN YOUR VEINS
Whenever a friendly KASRKIN operative is fighting or retaliating, or an operative is shooting it, the first time an attack dice inflicts Normal Dmg of 3 or more on this operative during that sequence, that dice inflicts 1 less damage on it.

FOR CADIA!
Add 1 to the Atk stat of friendly KASRKIN operatives' melee weapons (to a maximum of 4). Whenever a friendly KASRKIN operative is fighting, the first time you strike during that sequence, inflict 1 additional damage.`);

rule('faction_rules', null, 'RAPID FIRE', 0,
  `Each friendly KASRKIN operative that doesn't perform an action in which it moves during its activation can perform two Shoot actions (excluding Guard) during that activation, but a bolt pistol, hot-shot lasgun or hot-shot laspistol must be selected for both of those actions.`);

rule('faction_rules', null, 'HOT-SHOT WEAPON NOTE', 0,
  `Some KASRKIN rules refer to a "hot-shot weapon". This is a ranged weapon that includes "hot-shot" in its name, e.g. hot-shot lasgun, all profiles of a hot-shot marksman rifle, etc.`);

// ── PLOYS ────────────────────────────────────────────────────────────────────

rule('ploy', 'Strategy', 'ELIMINATION PATTERN', 1,
  'Whenever a friendly KASRKIN operative is shooting with a hot-shot weapon against an operative that cannot retain any cover saves or is being scanned (see RECON-TROOPER), that weapon has the Piercing Crits 1 weapon rule, or Piercing 1 instead if it\'s a hot-shot volley gun.');

rule('ploy', 'Strategy', 'ENGAGE FROM COVER', 1,
  'Whenever an operative is shooting a friendly KASRKIN operative that\'s in cover, you can re-roll one of your defence dice.');

rule('ploy', 'Strategy', 'CLEARANCE SWEEP', 1,
  'Place your Clearance Sweep marker in the killzone. Whenever a friendly KASRKIN operative within 5" horizontally of that marker is shooting an operative also within 5" horizontally of that marker, that friendly operative\'s weapons have the Ceaseless weapon rule. In the Ready step of the next Strategy phase, remove that marker.');

rule('ploy', 'Strategy', 'RELOCATE', 1,
  'Select one friendly KASRKIN operative that\'s more than 3" from every enemy operative. That operative, and each other friendly KASRKIN operative that\'s both within 3" of that operative and more than 3" from enemy operatives, can immediately perform a free Dash action in an order of your choice. You cannot use this ploy during the first turning point.');

rule('ploy', 'Firefight', 'SEIZE THE INITIATIVE', 1,
  'Use this firefight ploy at the start of the Firefight phase. One friendly KASRKIN operative can immediately perform a 1AP action for free, but it cannot move during that action. You cannot use this ploy if you\'re the player with initiative.');

rule('ploy', 'Firefight', 'COVER RETREAT', 1,
  'Use this firefight ploy when a friendly KASRKIN operative performs the Fall Back action while visible to and within 6" of another ready friendly KASRKIN operative that\'s not within control range of enemy operatives. After that friendly operative has finished moving, but before that Fall Back action ends, that other friendly operative can immediately perform a free Shoot action (you can change its order to Engage to do so).');

rule('ploy', 'Firefight', 'NEUTRALISE TARGET', 1,
  'Use this firefight ploy when a friendly KASRKIN operative if it\'s shooting an operative that either cannot retain any cover saves or is being scanned (see RECON-TROOPER). You can re-roll any of your attack dice.');

rule('ploy', 'Firefight', 'GIVE NO GROUND', 1,
  'Use this firefight ploy during a friendly KASRKIN operative\'s activation, or at the end of the Firefight phase. Select one of your mission markers or an objective marker. Until the end of that activation or until the start of the next turning point respectively, if the total APL of friendly KASRKIN operatives that contest that marker is 2, and the total APL of enemy operatives that contest it is the same, friendly KASRKIN operatives control that marker.');

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

rule('equipment', null, 'FOREGRIP', 0,
  'Whenever a friendly KASRKIN operative is shooting an operative within 3" of it, ranged weapons on its datacard (excluding weapons that include \'pistol\' in their name, e.g. hot-shot laspistol, all profiles of a plasma pistol, etc.) have the Accurate 1 weapon rule.');

rule('equipment', null, 'LONG-RANGE SCOPE', 0,
  'Whenever a friendly KASRKIN operative is shooting an operative more than 6" from it, that friendly operative\'s hot-shot weapons (excluding hot-shot laspistol) have the Saturate weapon rule.');

rule('equipment', null, 'RELICS OF CADIA', 0,
  'Once per turning point, when a friendly KASRKIN operative is shooting, fighting or retaliating, if you roll two or more fails, you can discard one of them to retain another as a normal success instead.');

rule('equipment', null, 'COMBAT DAGGERS', 0,
  `Friendly KASRKIN operatives have the following melee weapon:

Combat Daggers — ATK: 3, HIT: 4+, DMG: 3/4`);

// ── OPERATIVES (DATACARDS) ───────────────────────────────────────────────────

card('KASRKIN SERGEANT', 'Leader',
  { APL: '3', MOVE: '6"', SAVE: '4+', WOUNDS: '9' },
  [
    { name: 'Bolt pistol',                    atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Plasma pistol – Standard',       atk: '4', hit: '3+', dmg: '3/5', wr: 'Range 8", Piercing 1' },
    { name: 'Plasma pistol – Supercharge',    atk: '4', hit: '3+', dmg: '4/5', wr: 'Range 8", Hot, Lethal 5+, Piercing 1' },
    { name: 'Hot-shot laspistol',             atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Hot-shot lasgun',                atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Power weapon',                   atk: '4', hit: '3+', dmg: '4/6', wr: 'Lethal 5+' },
    { name: 'Chainsword',                     atk: '4', hit: '3+', dmg: '4/5', wr: '–' },
    { name: 'Gun butt',                       atk: '3', hit: '3+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Veteran Leadership', description: 'Whenever this operative is in the killzone and you use the SKILL AT ARMS STRATEGIC GAMBIT, you can select one additional SKILL AT ARMS.' },
    { name: 'TACTICAL COMMAND (0AP)', description: 'Select one friendly KASRKIN operative, then select one SKILL AT ARMS for that operative to have (instead of any it currently has) until the Ready step of the next Strategy phase. This can be in addition to any SKILL AT ARMS it already has, but they cannot be the same. Alternatively, instead of resolving the above effect, if your Clearance Sweep marker is in the killzone, you can remove it and place it again. This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'KASRKIN, IMPERIUM, ASTRA MILITARUM, LEADER, SERGEANT'
);

card('KASRKIN COMBAT MEDIC', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Hot-shot lasgun', atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Gun butt',        atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Medic!', description: 'The first time per turning point that a friendly KASRKIN operative would incapacitated while visible to and within 3" of this operative, you can use this rule, providing neither this nor that operative is within control Range of an enemy operative. If you do, that friendly operative isn\'t incapacitated and has 1 wound remaining and cannot be incapacitated for the remainder of the action. After that action, that friendly operative can then immediately perform a free Dash action, but must end that move within this operative\'s control Range. Subtract 1 from this and that operative\'s APL stats until the end of their next activations respectively, and if this rule was used during that friendly operative\'s activation, that activation ends. You cannot use this rule if this operative is incapacitated, or if it\'s a Shoot action and this operative would be a primary or secondary target.' },
    { name: 'MEDIKIT (0AP)', description: 'Select one friendly KASRKIN operative within this operative\'s control Range to regain 2D3 lost wounds. It cannot be an operative that the Medic! rule was used on during this turning point. This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'KASRKIN, IMPERIUM, ASTRA MILITARUM, MEDIC, COMBAT MEDIC'
);

card('KASRKIN DEMO-TROOPER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Hot-shot laspistol', atk: '4', hit: '3+', dmg: '3/4', wr: 'Range 8"' },
    { name: 'Gun butt',           atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Melta Mine', description: 'This operative is carrying your Melta Mine marker. It can perform the Pick Up Marker action on that marker, and whenever it performs the Place Marker action on that marker, it can immediately perform a free Dash action. That marker cannot be placed within an enemy operative\'s control Range (if this operative is incapacitated while carrying that marker and that marker cannot be placed, it\'s removed with this operative).' },
    { name: 'Proximity Mine', description: 'The first time your Melta Mine marker is within another operative\'s control Range, remove that marker and inflict 2D6+3 damage on that operative; if it isn\'t incapacitated, end its action (if any), even if that action\'s effects aren\'t fulfilled. If it cannot be placed, move it the minimum amount to do so. Note that this operative is ignored for these effects (i.e. it cannot set it off or take damage from that marker).' },
    { name: 'Blast Padding', description: 'Whenever an operative is shooting this operative with a weapon that has the Blast or Torrent weapon rule (excluding weapons that have a sweeping profile), you can re-roll one of your defence dice. In addition, this operative isn\'t affected by the x" Devastating x weapon rule (i.e. Devastating with a distance) unless they are the target during that sequence.' },
  ],
  'KASRKIN, IMPERIUM, ASTRA MILITARUM, DEMO-TROOPER'
);

card('KASRKIN GUNNER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Hot-shot volley gun – Focused',   atk: '5', hit: '3+', dmg: '3/4', wr: 'Piercing Crits 1' },
    { name: 'Hot-shot volley gun – Sweeping',  atk: '4', hit: '3+', dmg: '3/4', wr: 'Piercing Crits 1, Torrent 1' },
    { name: 'Grenade launcher – Frag',         atk: '4', hit: '3+', dmg: '2/4', wr: 'Blast 2' },
    { name: 'Grenade launcher – Krak',         atk: '4', hit: '3+', dmg: '4/5', wr: 'Piercing 1' },
    { name: 'Flamer',                          atk: '4', hit: '2+', dmg: '3/3', wr: 'Range 8", Torrent 2, Saturate' },
    { name: 'Meltagun',                        atk: '4', hit: '3+', dmg: '6/3', wr: 'Range 6", Devastating 4, Piercing 2' },
    { name: 'Plasma gun – Standard',           atk: '4', hit: '3+', dmg: '4/6', wr: 'Piercing 1' },
    { name: 'Plasma gun – Supercharge',        atk: '4', hit: '3+', dmg: '5/6', wr: 'Hot, Lethal 5+, Piercing 1' },
    { name: 'Gun butt',                        atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [],
  'KASRKIN, IMPERIUM, ASTRA MILITARUM, GUNNER'
);

card('KASRKIN RECON-TROOPER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Hot-shot lasgun', atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Gun butt',        atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Reconnoitre Killzone', description: 'The Relocate strategy ploy costs you 0CP if this operative is the selected friendly KASRKIN operative.' },
    { name: 'AUSPEX SCAN (1AP)', description: 'Until the start of this operative\'s next activation or until it\'s incapacitated (whichever comes first), whenever an enemy operative is within 8" of this operative, that enemy operative is being scanned. Whenever a friendly KASRKIN operative is shooting an enemy operative that\'s being scanned, that enemy operative cannot be obscured. This operative cannot perform this action while within control Range of an enemy operative.' },
  ],
  'KASRKIN, IMPERIUM, ASTRA MILITARUM, RECON-TROOPER'
);

card('KASRKIN SHARPSHOOTER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Hot-shot marksman rifle – Concealed', atk: '4', hit: '2+', dmg: '3/3', wr: 'Devastating 3, Heavy, Silent, Concealed Position*' },
    { name: 'Hot-shot marksman rifle – Mobile',    atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Hot-shot marksman rifle – Stationary',atk: '4', hit: '2+', dmg: '3/3', wr: 'Devastating 3, Heavy' },
    { name: 'Gun butt',                            atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Camo Cloak', description: 'Whenever an operative is shooting this operative: Ignore the Saturate weapon rule. If you can retain any cover saves, you can retain one additional cover save, or you can retain one cover save as a critical success instead. This isn\'t cumulative with improved cover saves from Vantage terrain.' },
    { name: 'Concealed Position*', description: 'This operative can only use this weapon the first time it\'s performing the Shoot action during the battle.' },
  ],
  'KASRKIN, IMPERIUM, ASTRA MILITARUM, SHARPSHOOTER'
);

card('KASRKIN TROOPER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Hot-shot lasgun', atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Gun butt',        atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'Adaptive Equipment', description: 'You can do each of the following once per turning point: One friendly KASRKIN TROOPER operative can perform the Smoke Grenade action. One friendly KASRKIN TROOPER operative can perform the Stun Grenade action. The rules for these actions are found in universal equipment. Performing these actions using this rule doesn\'t count towards their action limits (i.e. if you also select those grenades from equipment).' },
  ],
  'KASRKIN, IMPERIUM, ASTRA MILITARUM, TROOPER'
);

card('KASRKIN VOX-TROOPER', 'Warrior',
  { APL: '2', MOVE: '6"', SAVE: '4+', WOUNDS: '8' },
  [
    { name: 'Hot-shot lasgun', atk: '4', hit: '3+', dmg: '3/4', wr: '–' },
    { name: 'Gun butt',        atk: '3', hit: '4+', dmg: '2/3', wr: '–' },
  ],
  [
    { name: 'BATTLE COMMS (1AP)', description: 'Select one other friendly KASRKIN operative. Until the end of that operative\'s next activation, add 1 to its APL stat (to a maximum of 3 after all APL stat changes have been totalled). This operative can perform this action twice during its activation, but cannot perform this action while within control Range of an enemy operative.' },
  ],
  'KASRKIN, IMPERIUM, ASTRA MILITARUM, VOX-TROOPER'
);

// ── Summary ──────────────────────────────────────────────────────────────────
const rCounts = db.prepare("SELECT type, COUNT(*) as n FROM team_rules WHERE faction_id = ? GROUP BY type ORDER BY type").all(FACTION_ID);
const dCount  = db.prepare("SELECT COUNT(*) as n FROM datacards WHERE faction_id = ?").get(FACTION_ID);
console.log('\n✓ Kasrkin populated\n');
rCounts.forEach(r => console.log(`  ${r.type.padEnd(16)}: ${r.n}`));
console.log(`  ${'operatives'.padEnd(16)}: ${dCount.n}`);
