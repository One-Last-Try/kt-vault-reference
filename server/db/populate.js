/**
 * populate.js — Seeds rules from the 5 Kill Team BattleKit PDFs
 * Source: C:\Users\serka\OneDrive\Desktop\Kill Team\
 * Run: node server/db/populate.js
 */
import db from './schema.js';

const ins = db.prepare(
  'INSERT INTO rules (category, title, content, version) VALUES (?, ?, ?, ?)'
);
const VERSION = 'KT3 BattleKit';

function add(category, title, content) {
  const exists = db.prepare('SELECT id FROM rules WHERE title = ? AND category = ?').get(title, category);
  if (!exists) ins.run(category, title, content.trim(), VERSION);
}

// ════════════════════════════════════════════════════════════════════════════
// PRINCIPLES
// ════════════════════════════════════════════════════════════════════════════

add('Core Rules', 'Strategy Phase',
`The strategy phase happens at the start of each turning point and is resolved in this order: 1. Initiative → 2. Ready → 3. Gambit.

INITIATIVE: The player with initiative activates first in the turning point and decides the order of resolution for rules that would happen at the same time. In the first turning point, who has initiative is determined by the game sequence of your mission pack. In subsequent turning points, players roll off and the winner decides who has initiative. If the roll-off is a tie, the player who didn't have initiative in the previous turning point decides who has initiative.

READY: Each player gains 1 Command point (CP). In each turning point after the first, the player who doesn't have initiative gains 2CP instead. Players keep CP until spent. Each player readies all friendly operatives.

GAMBIT: Starting with the player who has initiative, each player alternates either using a STRATEGIC GAMBIT or passing. Repeat this process until both players have passed in succession. Strategy ploys are the most common STRATEGIC GAMBIT, but any rule labelled STRATEGIC GAMBIT can be used. You cannot use each STRATEGIC GAMBIT more than once per turning point.`);

add('Core Rules', 'Firefight Phase',
`The player who has initiative activates a ready friendly operative. Once that activation ends, their opponent activates one of their ready friendly operatives. The players repeat this process, alternating activations until all of one player's operatives are expended, at which point they can counteract between their opponent's remaining activations. Once all operatives are expended, the Firefight phase ends.

DETERMINE ORDER: Select the operative's order (Engage or Conceal). It keeps this order until it's next activated. Engage: The operative can perform actions as normal and can counteract. Conceal: The operative cannot perform Shoot or Charge actions, and it cannot counteract. However, while in cover it isn't a valid target.

PERFORM ACTIONS: The operative performs actions. Each action costs Action points (AP), and you cannot spend more AP during an operative's activation than its Action point limit (APL). An operative cannot perform the same action more than once during its activation — this is called action restrictions. The minimum AP cost of any action is always 0AP.

EXPENDED: When you finish your operative's activation, that operative is expended. While expended, an operative is not ready.`);

add('Core Rules', 'Counteract',
`When you would activate a ready friendly operative, if all your operatives are expended but your opponent still has ready operatives, you can select an expended friendly operative with an Engage order to perform a free 1AP action. Each operative can only counteract once per turning point, and cannot move more than 2" while counteracting. Counteracting is optional; you can choose not to. In either case, activation alternates back to your opponent afterwards.

Counteracting isn't an activation, it's instead of activating. This difference is important; for instance, it means action restrictions won't apply.`);

add('Core Rules', 'Datacards',
`Datacards contain specific rules for each operative, including key stats.

1. AGENT TYPE
2. OPERATIVE STATS: APL (Action point limit) — The total cost of actions an operative can perform during its activation, and a stat used to determine control of markers. The total can never be more than -1 or +1 from its normal APL. Move — The operative's move distance, used when performing the Reposition, Fall Back and Charge actions. An operative's Move stat can never be changed to less than 4". Save — The result required for successful defence dice whenever another operative is shooting the operative. Wounds — The operative's starting number of wounds, which is reduced as damage is inflicted upon it.
3. WEAPON STATS: Weapon type (ranged or melee). Atk — The number of attack dice to roll. Hit — The result required for successful attack dice. Dmg — The damage each attack dice inflicts; the first value is its Normal Dmg stat (normal success), the second value is its Critical Dmg stat (critical success).
4. ADDITIONAL RULES: Additional rules the operative has, and unique actions that can be performed by the operative.
5. KEYWORDS: Used to identify the operative for rules. Shown in KEYWORD BOLD font. Keywords in orange with a skull symbol are faction keywords.
6. BASES: Base size in mm.`);

add('Core Rules', 'Control Range',
`Many rules relate to control range such as moving, fighting and using cover. Something is within an operative's control range if it's visible to and within 1" of that operative. Control range between operatives is mutual, therefore operatives are within each other's control range if one of them is visible to and within 1" of the other.`);

add('Core Rules', 'Cover',
`Cover is determined from one operative to another, usually when one of them is shooting. An operative is in cover if there's intervening terrain within its control range. However, it cannot be in cover within 2" of the other operative. An operative in cover with a Conceal order is not a valid target. An operative in cover with an Engage order is a valid target, but has a cover save (see Shoot action).`);

add('Core Rules', 'Damage',
`When damage is inflicted on an operative, reduce their wounds by that amount. An operative's starting number of wounds is determined by its Wounds stat. If an operative's wounds are reduced to 0 or less, it's incapacitated, then removed from the killzone.

While an operative has fewer than its starting wounds remaining, it's wounded. While it has fewer than half its starting wounds remaining, it's also injured. Subtract 2" from the Move stat of injured operatives and worsen the Hit stat of their weapons by 1.

'Incapacitated' and 'removed from the killzone' are separate. Some rules take effect when an operative is incapacitated, but before it's removed.`);

add('Core Rules', 'Dice (D6, D3)',
`Use 6-sided dice to determine the outcome of various rules. This will often require x+, where x is the lowest possible result, e.g., 3+. Sometimes a result within a range will be required, e.g., 1–3. Some rare rules require you to roll a D3: roll one D6 and halve the result (rounding up). Some require xD6 or xD3. Roll x number of dice and add the results together. Some require D6+x or D3+x. Roll that dice and add x to the result.

Some rules allow you to re-roll a dice roll. You can never re-roll a dice roll more than once, and you cannot select the original result, even if the new result is worse. If it's an attack or defence dice, you re-roll before it's retained or discarded. If multiple players can re-roll dice at the same time, they alternate either re-rolling a dice or passing until they both pass in succession, starting with the player with initiative.`);

add('Core Rules', 'Distances',
`Various rules have a distance requirement in inches. When measuring to and from something, do so from the closest part of it. For an operative, do so from its base, ignoring all parts of its miniature. When measuring to and from an area of the killzone, measure the horizontal distance only.

If a rule requires something to be 'within' a distance, the requirement is fulfilled if any part of it is that distance or less. If a rule requires something to be 'wholly within' a distance, the requirement is fulfilled if every part of it is that distance or less. An operative is always within and wholly within distance requirements of itself and a marker it's carrying.`);

add('Core Rules', 'Equipment',
`Equipment are additional rules you can select before the battle, as specified in your game sequence. Universal equipment can be selected for any kill team whereas faction equipment is specific. Each player cannot select each equipment option more than once per game.`);

add('Core Rules', 'Intervening',
`Rules such as cover and obscured require you to determine if something is intervening, e.g., terrain. Most of the time this is easily determined — if it's between the operative and the intended target, it's intervening. Sometimes this will be unclear, so we use targeting lines.

To use targeting lines, the operative's player draws imaginary straight lines 1mm in diameter from any point of its base to every facing part of the intended target's base. Anything at least one of these lines cross is intervening. Anything all of these lines cross is wholly intervening.`);

add('Core Rules', 'Keywords',
`Keywords are an identification method for certain rules. You will most commonly use keywords with operatives — some rules will only affect operatives with the relevant keywords. Some rare rules also have keywords, e.g., SUPPORT or STRATEGIC GAMBIT. These keywords mean nothing on their own, but other rules interact with them. Keywords are shown in KEYWORD BOLD font. Those in orange with a skull symbol are faction keywords used to identify all operatives/rules from that kill team.`);

add('Core Rules', 'Markers',
`Markers are placed in precise locations and impact the game and operatives around them. Objective markers are 40mm in diameter. All other markers are 20mm in diameter. Operatives contest markers within their control range. Friendly operatives control a marker if the total APL of those contesting it is greater than that of enemy operatives, but control cannot change during an action. While an operative is carrying a marker (see Pick Up Marker), it contests and controls that marker, and is the only operative that can.`);

add('Core Rules', 'Obscured',
`Obscured is determined from one operative to another, usually when one of them is shooting. An operative is obscured if there's intervening Heavy terrain that's more than 1" from both operatives. However, it cannot be obscured by intervening Heavy terrain that's within 1" of either operative.

When an operative is shooting, if the target operative is obscured: the attacker must discard one success of their choice instead of retaining it; and all the attacker's critical successes are retained as normal successes and cannot be changed to critical successes (this takes precedence over all other rules).`);

add('Core Rules', 'Operatives',
`Operatives are the Citadel miniatures used in the game. Your operatives are friendly operatives, and your opponent's operatives are enemy operatives.`);

add('Core Rules', 'Orders',
`Engage: The operative can perform actions as normal and can counteract.
Conceal: The operative cannot perform Shoot and Charge actions, and it cannot counteract. However, it's not a valid target while it's in cover.

Operatives are given a Conceal order when they are set up before the battle. You can change an operative's order whenever it's activated. Order tokens have two sides: the lighter side shows an operative as ready; the darker side shows an operative as expended.`);

add('Core Rules', 'Ploys',
`Players can spend CP on ploys to gain rules bonuses at the opportune moment. Unless otherwise specified, all ploys cost 1CP. There are two types of ploys:
• Every strategy ploy is a STRATEGIC GAMBIT (used in the Gambit step of the Strategy phase). Some apply rules that are resolved "immediately"; otherwise, they apply rules that last until the end of the turning point.
• Firefight ploys are used in the Firefight phase and apply rules as the ploy specifies.

All players have access to the Command Re-roll firefight ploy and the ploys in their kill team's rules. Other than Command Re-roll, each player cannot use each ploy more than once per turning point.`);

add('Core Rules', 'Command Re-Roll',
`FIREFIGHT PLOY — 1CP. Use this firefight ploy after rolling your attack or defence dice. You can re-roll one of those dice.`);

add('Core Rules', 'Precedence',
`Some rare rules will conflict with each other, so it must be established which takes precedence. In order of priority, a rule takes precedence if:
1. It specifically says so.
2. The online designer's commentary says so.
3. It's not found in the core book (i.e., other rules take precedence over core book rules).
4. It says "cannot".
5. The active operative's controlling player decides.
6. The player with initiative decides.`);

add('Core Rules', 'Roll-Off',
`If a rule requires a roll-off, both players roll one D6 and whoever has the highest wins the roll-off. If there's a tie, roll-off again.`);

add('Core Rules', 'Tokens',
`Tokens are used to help you keep track of rules effects. They are often placed next to the relevant operative, but can be moved to make space for other operatives and markers as necessary. They are removed when the tracked rules effect ends.`);

add('Core Rules', 'Valid Target',
`Some rules require you to select a valid target for an operative. This is most common when an operative is shooting, but some rare rules require it too. If the intended target has an Engage order, it's a valid target if it's visible to the operative. If the intended target has a Conceal order, it's a valid target if it's visible to the operative and not in cover.`);

add('Core Rules', 'Visible',
`For something to be visible, the operative must be able to see it. To check visibility, look from behind the operative and determine if you can draw an unobstructed straight line 1mm in diameter from its head to any part of what it's trying to see. Ignore operatives' bases when determining this. An operative is always visible to itself.`);

add('Core Rules', 'Killzone Floor',
`The killzone floor is the lowest level of the killzone (i.e., the game board). Anything that's on a marker that's on the killzone floor is also on the killzone floor.`);

// ════════════════════════════════════════════════════════════════════════════
// ACTIONS
// ════════════════════════════════════════════════════════════════════════════

add('Actions', 'Action Types',
`Actions have effects and conditions. Conditions are things that must be fulfilled for the operative to perform that action, whilst effects are what happens when an operative is performing that action, including any requirements when doing so. There are four different types of actions: universal, unique, mission and free.

Universal actions are the most common actions you will use and can be performed by all operatives unless specified otherwise.
Unique actions are rarer actions in your kill team's rules. Only specified operatives can perform them.
Mission actions are specific to the mission or killzone you are playing.
Free actions can only be performed when another rule specifies, and the following rules apply: the conditions of the action must be met; it does not cost the operative any additional AP; the operative would still count as performing the action for all other rules purposes.`);

add('Actions', 'Reposition',
`COST: 1AP

Move the active operative up to its Move stat to a location it can be placed. This must be done in one or more straight-line increments, and increments are always rounded up to the nearest inch.

It cannot move within control range of an enemy operative, unless one or more other friendly operatives are already within control range of that enemy operative, in which case it can move within control range of that enemy operative but cannot finish the move there.

An operative cannot perform this action while within control range of an enemy operative, or during the same activation in which it performed the Fall Back or Charge action.`);

add('Actions', 'Dash',
`COST: 1AP

The same as the Reposition action, except don't use the active operative's Move stat — it can move up to 3" instead. In addition, it cannot climb during this move, but it can drop and jump.

An operative cannot perform this action while within control range of an enemy operative, or during the same activation in which it performed the Charge action.`);

add('Actions', 'Fall Back',
`COST: 2AP

The same as the Reposition action, except the active operative can move within control range of an enemy operative, but cannot finish the move there.

An operative cannot perform this action unless an enemy operative is within its control range. It cannot perform this action during the same activation in which it performed the Reposition or Charge action.

If an operative is activated within the control range of an enemy operative, the Fall Back action is a way to withdraw. It costs 2AP, so most operatives will not be able to perform more actions in that activation.`);

add('Actions', 'Charge',
`COST: 1AP

The same as the Reposition action, except the active operative can move an additional 2".

It can move, and must finish the move, within control range of an enemy operative. If it moves within control range of an enemy operative that no other friendly operatives are within control range of, it cannot leave that operative's control range.

An operative cannot perform this action while it has a Conceal order, if it's already within control range of an enemy operative, or during the same activation in which it performed the Reposition, Dash or Fall Back action.`);

add('Actions', 'Pick Up Marker',
`COST: 1AP

Remove a marker the active operative controls that the Pick Up Marker action can be performed upon. That operative is now carrying, contesting and controlling that marker.

An operative cannot perform this action while within control range of an enemy operative, or while it's already carrying a marker.`);

add('Actions', 'Place Marker',
`COST: 1AP

Place a marker the active operative is carrying within its control range.

If an operative carrying a marker is incapacitated, it must perform this action before being removed from the killzone, but does so for 0AP. This takes precedence over all rules that prevent it from doing so.

An operative cannot perform this action during the same activation in which it already performed the Pick Up Marker action (unless incapacitated).`);

add('Actions', 'Shoot',
`COST: 1AP

Shoot with the active operative by following the sequence below. The active operative's player is the attacker. The selected enemy operative's player is the defender.

An operative cannot perform this action while it has a Conceal order, or while within control range of an enemy operative.

1. SELECT WEAPON: The attacker selects one ranged weapon to use and collects their attack dice — a number of D6 equal to the weapon's Atk stat.

2. SELECT VALID TARGET: The attacker selects an enemy operative that's a valid target and has no friendly operatives within its control range. If the intended target has an Engage order, it's a valid target if it's visible to the active operative. If the intended target has a Conceal order, it's a valid target if it's visible to the active operative and not in cover. An operative cannot be in cover from and obscured by the same terrain feature; if it would be, the defender must select one of them for that sequence.

3. ROLL ATTACK DICE: The attacker rolls their attack dice. Each result that equals or beats the weapon's Hit stat is a success and is retained. Each result that doesn't is a fail and is discarded. Each result of 6 is always a critical success. Each other success is a normal success. Each result of 1 is always a fail. If the target operative is obscured: the attacker must discard one success of their choice instead of retaining it; and all the attacker's critical successes are retained as normal successes and cannot be changed to critical successes.

4. ROLL DEFENCE DICE: The defender collects three defence dice. If the target operative is in cover, they can retain one normal success without rolling it — this is known as a cover save. They roll the remainder. Each result that equals or beats the target's Save stat is a success. Each result of 6 is always a critical success. Each result of 1 is always a fail.

5. RESOLVE DEFENCE DICE: The defender allocates all their successful defence dice to block successful attack dice. A normal success can block a normal success. Two normal successes can block a critical success. A critical success can block a normal success or a critical success.

6. RESOLVE ATTACK DICE: All successful unblocked attack dice inflict damage on the target operative. A normal success inflicts damage equal to the weapon's Normal Dmg stat. A critical success inflicts damage equal to the weapon's Critical Dmg stat. Any operatives that were incapacitated are removed after the active operative has finished the action.`);

add('Actions', 'Fight',
`COST: 1AP

Fight with the active operative by following the sequence below. The active operative's player is the attacker. The selected enemy operative's player is the defender.

An operative cannot perform this action unless an enemy operative is within its control range.

1. SELECT ENEMY OPERATIVE: The attacker selects an enemy operative within the active operative's control range to fight against. That enemy operative will retaliate in this action.

2. SELECT WEAPONS: Both players select one melee weapon to use and collect their attack dice — a number of D6 equal to the weapon's Atk stat. While a friendly operative is assisted by other friendly operatives, improve the Hit stat of its melee weapons by 1 for each doing so. For a friendly operative to assist them, it must be within control range of the enemy operative in that fight and not within control range of another enemy operative.

3. ROLL ATTACK DICE: Both players roll their attack dice simultaneously. Each result that equals or beats their selected weapon's Hit stat is a success and is retained. Each result of 6 is always a critical success. Each other success is a normal success. Each result of 1 is always a fail.

4. RESOLVE ATTACK DICE: Starting with the attacker, the players alternate resolving one of their successful unblocked attack dice. The players repeat this process until one player has resolved all their dice (in which case their opponent resolves all their remaining dice), or one operative in that fight is incapacitated. When a player resolves a dice, they must strike or block with it.
   If they strike, inflict damage on the enemy operative, then discard that dice. A normal success inflicts damage equal to the weapon's Normal Dmg stat. A critical success inflicts damage equal to the weapon's Critical Dmg stat.
   If they block, they can allocate that dice to block one of their opponent's unresolved successes. A normal success can block a normal success. A critical success can block a normal success or a critical success.`);

add('Actions', 'Counteract Action',
`COST: 0AP (free)

When you would activate a ready friendly operative, if all your operatives are expended but your opponent still has ready operatives, you can select an expended friendly operative with an Engage order to perform a 1AP action for free (Excluding Guard). Each operative can only counteract once per turning point, and cannot move more than 2", or must be set up wholly within 2" if it's removed and set up again, while counteracting.`);

// ════════════════════════════════════════════════════════════════════════════
// WEAPONS
// ════════════════════════════════════════════════════════════════════════════

add('Weapons', 'Weapon Rules (General)',
`Weapon rules apply whenever a friendly operative uses a weapon that has them. Common weapon rules can be found below, and you may find rare weapon rules in your kill team's rules. Weapons gain no benefit from having the same weapon rule more than once, unless the weapon rule has an x, in which case select which x to use. If a friendly operative is using a weapon that has multiple weapon rules that would take effect at the same time, you can choose the order they take effect.`);

add('Weapons', 'Accurate X',
`You can retain up to x attack dice as normal successes without rolling them. If a weapon has more than one instance of Accurate x, you can treat it as one instance of Accurate 2 instead.`);

add('Weapons', 'Balanced',
`You can re-roll one of your attack dice.`);

add('Weapons', 'Blast X',
`The target you select is the primary target. After shooting the primary target, shoot with this weapon against each secondary target in an order of your choice (roll each sequence separately). Secondary targets are other operatives visible to and within x of the primary target, e.g., Blast 2" (they are all valid targets, regardless of a Conceal order). Secondary targets are in cover and obscured if the primary target was.`);

add('Weapons', 'Brutal',
`Your opponent can only block with critical successes.`);

add('Weapons', 'Ceaseless',
`You can re-roll any of your attack dice results of one result (e.g., results of 2).`);

add('Weapons', 'Devastating X',
`Each retained critical success immediately inflicts x damage on the operative this weapon is being used against, e.g., Devastating 3. If the rule starts with a distance (e.g., 1" Devastating x), inflict x damage on that operative and each other operative visible to and within that distance of it. Note that success isn't discarded after doing so — it can still be resolved later in the sequence.`);

add('Weapons', 'Heavy',
`An operative cannot use this weapon in an activation or counteraction in which it moved, and it cannot move in an activation or counteraction in which it used this weapon. If the rule is Heavy (x only), where x is a move action, only that move is allowed, e.g., Heavy (Dash only). This weapon rule has no effect on preventing the Guard action.`);

add('Weapons', 'Hot',
`After an operative uses this weapon, roll one D6. If the result is less than the weapon's Hit stat, inflict damage on that operative equal to the result multiplied by two. If it's used multiple times in one action (e.g., Blast), still only roll one D6.`);

add('Weapons', 'Lethal X+',
`Your successes equal to or greater than x are critical successes, e.g., Lethal 5+.`);

add('Weapons', 'Limited X',
`After an operative uses this weapon a number of times in the battle equal to x, they no longer have it. If it's used multiple times in one action (e.g., Blast), treat this as one use.`);

add('Weapons', 'Piercing X',
`The defender collects x less defence dice, e.g., Piercing 1. If the rule is Piercing Crits x, this only comes into effect if you retain any critical successes.`);

add('Weapons', 'Punishing',
`If you retain any critical successes, you can retain one of your fails as a normal success instead of discarding it.`);

add('Weapons', 'Range X',
`Only operatives within x of the active operative can be valid targets, e.g., Range 9".`);

add('Weapons', 'Relentless',
`You can re-roll any of your attack dice.`);

add('Weapons', 'Rending',
`If you retain any critical successes, you can retain one of your normal successes as a critical success instead.`);

add('Weapons', 'Saturate',
`The defender cannot retain cover saves.`);

add('Weapons', 'Seek',
`When selecting a valid target, operatives cannot use terrain for cover. If the rule is Seek Light, operatives cannot use Light terrain for cover. Whilst this can allow such operatives to be targeted (assuming they're visible), it doesn't remove their cover save (if any).`);

add('Weapons', 'Severe',
`If you don't retain any critical successes, you can change one of your normal successes to a critical success. The Devastating and Piercing Crits weapon rules still take effect, but Punishing and Rending don't.`);

add('Weapons', 'Shock',
`The first time you strike with a critical success in each sequence, also discard one of your opponent's unresolved normal successes (or a critical success if there are none).`);

add('Weapons', 'Silent',
`An operative can perform the Shoot action with this weapon while it has a Conceal order.`);

add('Weapons', 'Stun',
`If you retain any critical successes, subtract 1 from the APL stat of the operative this weapon is being used against until the end of its next activation.`);

add('Weapons', 'Torrent X',
`Select a valid target as normal as the primary target, then select any number of other valid targets within x of the first valid target as secondary targets, e.g., Torrent 2". Shoot with this weapon against all of them in an order of your choice (roll each sequence separately).`);

// ════════════════════════════════════════════════════════════════════════════
// TERRAIN
// ════════════════════════════════════════════════════════════════════════════

add('Terrain', 'Terrain and Movement',
`Operatives cannot move through terrain — they must move around, climb over or drop/jump off it. Agents must end a move in a location where they can be placed; they cannot end mid-climb, jump, or drop. If that is not possible, they cannot begin the move.`);

add('Terrain', 'Climbing',
`An operative must be within 1" horizontally and 3" vertically of terrain that's visible to them to climb it. Each climb is treated as a minimum of 2" vertically (e.g. a 1" distance is treated as 2").`);

add('Terrain', 'Dropping',
`Operatives drop down when they move off terrain or after they've jumped. Ignore 2" of vertical distance that they drop during each action. This means a vertical drop of 2" or less is ignored. If they drop multiple times during an action, only 2" total is ignored, not 2" from each drop.`);

add('Terrain', 'Jumping',
`Operatives can jump from Vantage terrain higher than 2" from the killzone floor when they move off it. You can move them up to 4" horizontally from the edge when they jump, done like any other move except in one straight-line increment. The operative must then drop or climb from there.

When jumping from Vantage terrain, if there is a terrain part such as a rampart at the edge you would jump from, you must climb it first then jump from the highest point it must climb over. When jumping to a terrain feature, you can ignore its height difference of 1" or less, including its rampart (if any).`);

add('Terrain', 'Heavy Terrain',
`Larger terrain is Heavy. It can obscure operatives.`);

add('Terrain', 'Light Terrain',
`Smaller terrain is Light. It doesn't have any additional rules, but other rules interact with it differently (e.g., Vantage terrain).`);

add('Terrain', 'Blocking Terrain',
`Blocking terrain is usually attributed to gaps between or underneath a terrain feature. Visibility cannot be drawn through such gaps, and for the purposes of cover and obscured, the gaps are intervening like the terrain around it.`);

add('Terrain', 'Vantage Terrain',
`Vantage terrain is the upper levels of the killzone — areas operatives can be placed upon above the game board. If terrain is not Vantage terrain, then operatives can move over it, but they cannot finish a move or be set up on it. Vantage terrain is also Light terrain.

Firstly, whenever an operative on Vantage terrain is shooting an operative that has an Engage order, its ranged weapon has the Accurate 1 weapon rule if the target operative is at least 2" lower than it, or Accurate 2 if the target operative is at least 4" lower than it.

Secondly, whenever you are selecting a valid target for an operative on Vantage terrain, operatives at least 2" lower than that operative with a Conceal order cannot use Light terrain for cover. The defender can retain it as a critical success instead, or retain one additional cover save.

Thirdly, for the purposes of obscured, ignore Heavy terrain connected to Vantage terrain the active operative or the intended target is on.`);

add('Terrain', 'Accessible Terrain',
`Operatives can move through Accessible terrain (this takes precedence over Bases, and Terrain and Movement), but it counts as an additional 1" to do so. Only the centre of an operative's base needs to move through Accessible terrain, so base sizes are irrelevant.`);

add('Terrain', 'Insignificant Terrain',
`Insignificant terrain is usually very small. For the purposes of climbing and dropping, ignore it. An operative can move over and across Insignificant terrain without going up and down.`);

add('Terrain', 'Exposed Terrain',
`Exposed terrain is usually very small, or terrain with large gaps that operatives shouldn't be able to take cover behind.`);

add('Terrain', 'Ceiling Terrain',
`Operatives with a round base of 50mm or less, or an oval base of 60x35mm, can move underneath Ceiling terrain regardless of the operative's height. The operative must still finish the action in a location it can be placed.`);

add('Terrain', 'Wall Terrain',
`Operatives cannot move over or through Wall terrain (this takes precedence over all other rules). Visibility cannot be determined over or through Wall terrain. Other than to areas of the killzone (centre of the killzone, drop zones, etc.), distances cannot be measured over or through Wall terrain; they must be measured around it using the shortest possible route. For the purposes of cover and obscured, only the corners and ends of Wall terrain can intervene, unless the active operative has passed it.`);

add('Terrain', 'Hatchway',
`A hatchway has two statuses: closed and open. It has two parts — an access point and a hatch — and their terrain types depend upon the hatchway's status. Operatives can perform the Operate Hatch mission action to change its status. Hatchways begin the battle closed.

CLOSED: Its hatch must be fully shut. The access point and hatch are Heavy and Wall terrain.

OPEN: Its hatch must be fully open. Its access point is Accessible, Insignificant and Exposed terrain. Its hatch is Heavy and Wall terrain, and the gap directly underneath it is Blocking terrain.

As an open hatchway's access point is Exposed terrain, the walls either side of it must be used for cover and obscuring instead of the access point.`);

add('Terrain', 'Operate Hatch',
`COST: 1APL (Mission Action)

Open or close a hatchway that's access point is within the operative's control range. An operative can perform this action during a Dash or Reposition action, and any remaining move distance can be used after it does so. An operative cannot perform this action while within control range of an enemy operative, or if that hatchway is open and its access point is within an enemy operative's control range.`);

add('Terrain', 'Breach Point',
`A breach point has two statuses: closed and open. It has two parts — an access point and a breach wall — and their terrain types depend upon the breach point's status. Breach points begin the battle closed. To open a breach point, operatives can perform the Breach mission action (at which point it cannot be closed again).

CLOSED: Its breach wall must be within its access point. The access point and breach wall are Heavy and Wall terrain.
OPEN: Its breach wall must be removed from the killzone. Its access point is Accessible and Insignificant terrain. Its access point is also Exposed terrain. This means the walls either side of it must be used for cover and obscuring instead.`);

add('Terrain', 'Breach',
`COST: 2APL (Mission Action)

Open a closed breach point that's access point is within the operative's control range. An operative that has the word(s) "breach marker", "grenadier" or "mine" on its datacard, or has a weapon with the Piercing 2 or Piercing Crits 2 weapon rule (excluding weapons that have the Blast or Torrent weapon rule) can perform this action for 1 less AP (to a minimum of 1AP), but it cannot do so during an activation/counteraction in which it performed the Charge or Shoot action (or vice versa).

Roll one D6 separately for each operative that's on the other side of the access point and has that access point within its control range: on a 4+, subtract 1 from that operative's APL stat until the end of its next activation and inflict damage on it equal to the dice result halved (rounding up).

An operative cannot perform this action while within control range of an operative, or if that breach point is open.`);

add('Terrain', 'Guard',
`COST: 1APL

The operative goes on guard until any of the following are true: it performs any action, moves or is set up; an enemy operative ends an action within its control range and you don't interrupt that activation; its order is changed; it's the start of the next turning point.

This action is treated as a Shoot action. An operative cannot perform this action while it has a Conceal order, or while it's within control range of an enemy operative.

ON GUARD: Once during each enemy operative's activation, after that enemy operative performs an action, you can interrupt that activation and select one friendly operative on guard to perform the Fight or Shoot action for free. That friendly operative can even perform the Shoot action while within control range of an enemy operative (point-blank shot): target the enemy operative within your operative's control range (even if it wouldn't normally be a valid target); worsen the Hit stat of your operative's weapons by 1; until the end of the interrupted enemy operative's activation, your operative cannot retaliate.`);

add('Terrain', 'Hatchway Fight',
`COST: 1APL

Fight with the active operative. In the Select Enemy Operative step, instead select an enemy operative within 2" of, and on the other side of, an open hatchway's access point the active operative is touching. For the duration of that action, those operatives are treated as being within each other's control range.

This action is treated as a Fight action. An operative cannot perform this action while within control range of an enemy operative, or if its base isn't touching an open hatchway's access point.`);

add('Terrain', 'Teleport Pad',
`A teleport pad is Exposed, Insignificant and Vantage. Only one operative can be on it at once, and while an operative is on it, that operative cannot touch the killzone floor.

From the start of the second turning point, whenever a friendly operative on a teleport pad performs the Charge, Fall Back or Reposition action, you can teleport it. If you do, don't move it. Instead, remove it from the killzone and set it back up on the other teleport pad. It must still fulfil all other requirements of that action. If another operative is on the other teleport pad when an operative teleports, swap them around.

Equipment terrain features cannot be set up within 2" of a teleport pad. Whenever an operative's base is touching a teleport pad, if another operative is on that teleport pad, those operatives are treated as being within each other's control range.`);

add('Terrain', 'Condensed Environment',
`Killzone rule. Weapons with the Blast, Torrent and/or x" Devastating (i.e. Devastating with a distance requirement) weapon rule also have the Lethal 5+ weapon rule.`);

add('Terrain', 'Garrisoned Stronghold',
`Killzone: Volkus rule. When an operative wholly within a stronghold terrain feature is retaliating against an operative that isn't, the defender resolves first (this takes precedence over the normal fight resolution order).`);

add('Terrain', 'Door Fight',
`COST: 1APL

Fight with the active operative. In the Select Enemy Operative step, select an enemy operative within 2" of, and on the other side of, a door the active operative is touching. For the duration of that action, those operatives are treated as being within each other's control range.

This action is treated as a Fight action. An operative cannot perform this action while within control range of an enemy operative, or if its base isn't touching a door.`);

// ════════════════════════════════════════════════════════════════════════════
// EQUIPMENT
// ════════════════════════════════════════════════════════════════════════════

add('Equipment', 'Universal Equipment',
`The following equipment options are available to all kill teams, alongside their faction equipment. You cannot select each option more than once per battle.`);

add('Equipment', 'Ammo Cache',
`1x AMMO CACHE. Before the battle, you can set up one of your Ammo Cache markers wholly within your territory. Friendly operatives can perform the following mission action during the battle.

AMMO RESUPPLY — 0AP: One of your Ammo Cache markers the active operative controls is used this turning point. Until the start of the next turning point, whenever this operative is shooting with a weapon from its datacard, you can re-roll one of your attack dice. An operative cannot perform this action while within control range of an enemy operative, if that marker isn't yours, or if that marker has been used this turning point.`);

add('Equipment', 'Comms Device',
`1x COMMS DEVICE. Before the battle, you can set up one of your Comms Device markers wholly within your territory. While a friendly operative controls this marker, add 3" to the distance requirements of its SUPPORT rules that refer to friendly operatives (e.g., "select a friendly operative within 6" would be "within 9" instead"). Note you cannot benefit from your opponent's Comms Device markers.`);

add('Equipment', 'Mines',
`1x MINES. Before the battle, you can set up one of your Mines markers wholly within your territory and more than 2" from other markers, access points and accessible terrain. The first time that marker is within an operative's control range, remove that marker and inflict D3+3 damage on that operative.`);

add('Equipment', 'Razor Wire',
`1x RAZOR WIRE. Razor wire is Exposed and Obstructing terrain. Before the battle, you can set it up wholly within your territory, on the killzone floor and more than 2" from all other equipment terrain features, access points and accessible terrain.

Obstructing: Whenever an operative would cross over this terrain feature within 1" of it, treat the distance as an additional 1".`);

add('Equipment', 'Light Barricades',
`2x LIGHT BARRICADES. Light barricades are Light terrain, except the feet, which are Insignificant and Exposed. Before the battle, you can set up any number of them wholly within your territory, on the killzone floor and more than 2" from other equipment terrain features, access points and accessible terrain.`);

add('Equipment', 'Heavy Barricade',
`1x HEAVY BARRICADE. A heavy barricade is Heavy terrain. Before the battle, you can set it up wholly within 4" of your drop zone, on the killzone floor and more than 2" from other equipment terrain features, access points and accessible terrain.`);

add('Equipment', 'Ladders',
`2x LADDERS. Ladders are Insignificant and Exposed terrain. Before the battle, you can set up any number of them as follows: wholly within your territory; upright against terrain that has a height of at least 2"; more than 2" from other equipment terrain features; more than 1" from doors and access points.

Once per action, whenever an operative is climbing this terrain feature, treat the vertical distance as 1" if the ladder is within that operative's control range during that entire climb.`);

add('Equipment', 'Portable Barricade',
`1x PORTABLE BARRICADE. A portable barricade is Light, Protective and Portable terrain except the feet which are Insignificant and Exposed. Before the battle, you can set it up wholly within your territory, on the killzone floor and more than 2" from all other equipment terrain features, access points and accessible terrain.

Protective: While an operative is in Cover behind this terrain feature, improve its Save stat by 1 (to a maximum of 2+).

Portable: This terrain feature only provides cover while an operative is connected to it and if the shield is intervening (ignore its feet). Operatives connected to the inside of it can perform the following unique action during the battle.

MOVE WITH BARRICADE — 1AP: The same as the Reposition action, except the active operative can move no more than its Move stat minus 2" and cannot climb, drop, jump or use any kill team's rules that remove it and set it back up again. Before this operative moves, remove the portable barricade it is connected to. After the operative moves, set up the portable barricade so that it is once again in position. This action is treated as a Reposition action. An operative cannot perform the Move with Barricade action in the same turning point in which it performed the Fall Back or Charge actions.`);

add('Equipment', 'Utility Grenades',
`UTILITY GRENADES. When you select this equipment, select two utility grenades (2 smoke, 2 stun, or 1 smoke and 1 stun). Each selection is a unique action your operatives can perform, but your kill team can only use that weapon a total number of times during the battle equal to your selection.

SMOKE GRENADE — 1AP: Place one of your smoke grenade markers within 6" of this operative. It must be visible to this operative or set on vantage terrain or a terrain feature visible to this operative. The marker creates a 1" horizontally and vertically unlimited smoke area from it (but not below it). While an operative is wholly within a smoke area, it is considered obscured to operatives more than 2" away from it and vice versa. Additionally, when an operative shoots at an enemy operative that is wholly within a smoke area, weapons with the Piercing 2 or Piercing Crits 2 weapon rule have the Piercing 1 or Piercing Crits 1 weapon rule instead, unless they're within 2" of each other. In the Ready Step of the next Strategy Phase, roll a D3. Remove that smoke grenade marker once a number of activations equal to the result is completed, or at the end of the turning point (whichever occurs first). An operative cannot perform this action while within the control range of an enemy operative.

STUN GRENADE — 1AP: Select an enemy operative within 6" of this operative and visible to it. That operative and each other operative within 1" of it makes a stun check. To make a stun check, roll a D6: if the result is 3+, subtract 1 from its APL stat until the end of its next activation. An operative cannot perform this action while within control range of an enemy operative.`);

add('Equipment', 'Explosive Grenades',
`EXPLOSIVE GRENADES. When you select this equipment, select two explosive grenades (2 frag, 2 krak, or 1 frag and 1 krak). Each selection is a unique weapon your operatives can use, but your kill team can only use that weapon a total number of times during the battle equal to your selection.

FRAG GRENADE: A: 4, BS: 4+, D: 2/4. Weapon rules: Range 6", Blast 2", Saturate.

KRAK GRENADE: A: 4, BS: 4+, D: 4/5. Weapon rules: Range 6", Piercing 1, Saturate.`);

add('Equipment', 'Breaching Charge',
`BREACHING CHARGE. Once per battle, when a friendly operative performs the Breach action, you can use this rule. If you do, that operative can perform that action for 1 less AP (to a minimum of 1AP) as though it had the word 'breach marker' on its datacard.`);

// ── Summary ─────────────────────────────────────────────────────────────────
const counts = db.prepare(
  'SELECT category, COUNT(*) as n FROM rules GROUP BY category ORDER BY category'
).all();

console.log('\n✓ KT Vault rules populated from BattleKit PDFs\n');
counts.forEach(r => console.log(`  ${r.category.padEnd(14)}: ${r.n} rules`));
const total = counts.reduce((s, r) => s + r.n, 0);
console.log(`  ${'TOTAL'.padEnd(14)}: ${total} rules\n`);
