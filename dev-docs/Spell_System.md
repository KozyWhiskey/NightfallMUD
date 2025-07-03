### NightfallMUD: Spell System & Casting Guide

This document provides a developer-focused guide for implementing the spellcasting system, including its data structure, casting mechanics, and integration with the round-based combat loop.

#### 1\. Spell System Architecture

The spell system is data-driven. Every spell in the game is an object defined in a master spell database. This allows for easy creation, balancing, and modification of spells without code changes.

**Core Spell Object Structure:**

{  
  "spellId": "integer",          // Unique identifier  
  "name": "string",              // e.g., "Glimmering Bolt"  
  "description": "string",       // Flavor text and mechanical summary  
  "spellType": "string",         // "Class" or "Universal"  
  "requiredClass": "string",     // "Aether Weaver", null for Universal  
  "requiredLevel": "integer",    // Level needed to learn/use  
  "manaCost": "integer",  
  "targetType": "string",        // "Self", "TargetEnemy", "TargetAlly", "AreaOfEffect"  
  "castingTime": "integer",      // In combat rounds (0, 1, 2, etc.)  
  "cooldown": "integer",         // In combat rounds  
  "effects": \[  
    // Array of effect objects that this spell applies  
  \]  
}

**Effect Object Structure (within a Spell):**

{  
  "effectType": "string",        // e.g., "DirectDamage", "Heal", "ApplyStatusEffect"  
  "damageType": "string",        // "Physical", "Fire", "Frost", "Gloom", "Holy"  
  "baseValue": "integer",        // Base damage or healing  
  "scalingFactor": "float",      // e.g., 1.5. Scales with INT or WIS.  
  "statusEffectId": "integer",   // ID of the status effect to apply (if any)  
  "duration": "integer"          // Duration of the status effect in rounds  
}

#### 2\. Spell Casting & The Combat Round

The castingTime property is crucial for integrating spells into the 3-second combat round.

* **Instant Cast (castingTime: 0\)**  
  * **Function:** The spell is cast and resolves within the *same* combat round.  
  * **Use Case:** Reactive abilities, minor buffs, or quick, low-damage attacks.  
  * **Example:** A quick Shield Bash that has a chance to stun.  
* **Standard Cast (castingTime: 1\)**  
  * **Function:** This is the most common casting time.  
    * **Round 1:** Player uses their action to begin\_cast. Their state becomes "casting" for this round. They are vulnerable to interruption.  
    * **Round 2:** At the end of this round, the spell's effects are resolved.  
  * **Use Case:** Standard damage spells, primary healing spells.  
  * **Example:** An Aether Weaver's Fireball.  
* **Concentration/Channeled (castingTime: \-1)**  
  * **Function:** The spell has an ongoing effect that the caster must maintain.  
    * **Round 1:** Player uses their action to begin\_channel. The spell's first effect pulse occurs at the end of this round.  
    * **Subsequent Rounds:** The caster's action is automatically consumed to continue\_channel. The effect pulses again at the end of each round.  
    * The channel is broken if the caster takes another action or is hit by a powerful interrupting attack.  
  * **Use Case:** A continuous healing beam, a blizzard that damages an area every round.

**Spell Interruption:** If a character in a "casting" or "channeling" state takes damage, they must make a Resolve check. (d100 \+ Resolve) \>= (Damage Taken \+ 20). If they fail, the spell fizzles, the Mana is lost, and the action for the round is wasted.

#### 3\. Spell Acquisition

* **Class Spells:** These are automatically added to a character's "spellbook" when they reach the requiredLevel. This represents innate training and progression.  
* **Universal Spells:** These are learned by consuming specific items found in the world.  
  * **Scrolls:** A one-time use item that allows any character to cast the spell written on it, regardless of class. use scroll of minor light.  
  * **Tomes:** A rare, consumable book that, when read, permanently teaches the character a Universal spell, provided they meet the attribute requirements (e.g., Requires 12 INT).

#### 4\. Example Starting Spells

This illustrates how the system works for each class.

| Class | Spell Name | Type | Casting Time | Mana Cost | Effect |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Aether Weaver** | **Glimmering Bolt** | Class | 1 Round | 10 | Deals direct Frost damage to a single enemy. |
| **Dawnkeeper** | **Mend Wounds** | Class | 1 Round | 12 | A standard, direct healing spell for a single ally. |
| **Vanguard** | **Shield Bash** | Class | 0 Rounds | 8 | Deals minor physical damage and has a 25% chance to apply a Stunned status effect for 1 round. |
| **Shadowblade** | **Venomous Strike** | Class | 0 Rounds | 15 | An instant attack that deals minor physical damage and applies a Poison (Damage Over Time) status effect for 3 rounds. |
| **Technomancer** | **Short Circuit** | Class | 1 Round | 10 | Deals minor Shock damage and has a chance to apply a Mana Drain debuff to a magic-using enemy. |
| **Gloom Warden** | **Ensnaring Vines** | Class | 1 Round | 12 | Deals no damage but applies a Snared status effect, preventing an enemy from fleeing for 3 rounds. |

