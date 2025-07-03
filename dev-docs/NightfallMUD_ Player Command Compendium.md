### NightfallMUD: Player Command Compendium

This document outlines the core set of player commands, their functions, and how they are influenced by character attributes and equipment.

### Movement & Environment

| Command | Aliases | Function | Impact of Attributes & Items |
| :---- | :---- | :---- | :---- |
| **north** | n | Moves the character to the room connected via the north exit. | **\-** |
| **east** | e | Moves the character to the room connected via the east exit. | **\-** |
| **south** | s | Moves the character to the room connected via the south exit. | **\-** |
| **west** | w | Moves the character to the room connected via the west exit. | **\-** |
| **up** | u | Moves the character to the room connected via the up exit. | **\-** |
| **down** | d | Moves the character to the room connected via the down exit. | **\-** |
| **look** | l | Describes the current room, its occupants, items, and exits. | **WIS/INT:** High stats may reveal subtle details. **Items:** A Light source can illuminate dark rooms. Nightvision can negate darkness penalties. |
| **look at** | examine, exa | Provides a detailed description of a target (player, NPC, item). | **INT:** May provide more detailed information on monsters (e.g., estimating their strength). **WIS:** May reveal a player's alignment or emotional state. |
| **get** | take | Picks up an item from the ground and adds it to inventory. | **STR:** May be required to lift exceptionally heavy objects. |
| **drop** | \- | Removes an item from inventory and places it on the ground. | **\-** |
| **open** | \- | Opens a door or container. | **STR:** May be required to force open a stuck door. **DEX:** May be required for a skill check to pick a lock. |
| **close** | \- | Closes a door or container. | **\-** |

### Combat & Skills

| Command | Aliases | Function | Impact of Attributes & Items |
| :---- | :---- | :---- | :---- |
| **attack** | kill, atk | Initiates and continues auto-attacks against a target each combat round. | **STR/DEX:** Governs damage and accuracy. **All Combat Mechanics:** This is the core combat command influenced by nearly every combat-related stat. |
| **cast** | c | Casts a specified spell at a target. | **INT/WIS:** Determines spell power and effectiveness. **RES:** Helps resist interruption. **Items:** Can reduce casting time, lower mana cost, or increase spell power. |
| **flee** | \- | Attempts to leave combat and move to an adjacent room. | **DEX:** A higher Dexterity increases the chance of successfully fleeing. **CON:** May help resist being "winded" and unable to flee. |
| **sneak** | \- | Attempts to enter a "Hidden" state, allowing movement while undetected. | **Stealth Score (DEX, RES, Items):** Directly contested against an observer's Perception Score to determine success. |
| **hide** | \- | Attempts to become hidden in the current room. Does not allow movement. | **Stealth Score:** Provides a significant bonus to the roll but is broken by any action other than looking around. |

### Inventory & Equipment

| Command | Aliases | Function | Impact of Attributes & Items |
| :---- | :---- | :---- | :---- |
| **inventory** | i, inv | Displays a list of all items in the character's possession. | **\-** |
| **equip** | wear, wield | Equips a weapon or piece of armor from inventory. | **Proficiencies:** Character must have the required ArmorProficiency and WeaponProficiency. **STR/DEX/INT:** May have minimum attribute requirements to equip. |
| **remove** | rem | Unequips an item and returns it to inventory. | **\-** |
| **use** | \- | Uses a consumable item, such as a potion or scroll. | **WIS:** May increase the effectiveness of potions. **INT:** May allow for more powerful effects from scrolls. |
| **examine** | \- | Shows the detailed stats and description of an item in your inventory. | **INT:** A high Intelligence may reveal hidden or unidentified properties on magical items. |

### Communication

| Command | Aliases | Function | Impact of Attributes & Items |
| :---- | :---- | :---- | :---- |
| **say** | ' | Speaks a message to everyone in the current room. | **CHA:** High charisma might cause certain NPCs to react differently to what you say. |
| **tell** | t, whisper | Sends a private message to another player. | **\-** |
| **party** | p | Sends a message to the character's current group. | **\-** |
| **shout** | yell | Broadcasts a message to the current room and all adjacent rooms. | **\-** |
| **emote** | em | Performs a custom, non-verbal action. | **\-** |

### Information & Utility

| Command | Aliases | Function | Impact of Attributes & Items |
| :---- | :---- | :---- | :---- |
| **score** | stats | Displays your character's stats, vitals, level, and experience. | **\-** |
| **who** | \- | Lists all players currently online. | **\-** |
| **help** | \- | Provides information on game commands and concepts. | **\-** |
| **time** | \- | Displays the current in-game time and date. | **\-** |
| **quests** | questlog | Shows the player's current quest log and progress. | **\-** |
| **party** | group | Manages party functions (invite, leave, kick, list). | **CHA:** A high Charisma might increase the chance an NPC follower will join your party. |
| **quit** | \- | Safely logs the character out of the game. | **\-** |

