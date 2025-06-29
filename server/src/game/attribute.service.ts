// server/src/game/attribute.service.ts
import type { Mob } from '@prisma/client';
import { Prisma } from '@prisma/client';
import type { CharacterWithRelations } from './commands/command.interface';

type ItemWithAffixes = Prisma.ItemGetPayload<{
  include: { itemAffixes: { include: { affix: true } }, baseItem: true }
}>;

// This type defines the final, calculated stats for any combatant.
export interface EffectiveStats {
  name: string;
  hp: number;
  strength: number;
  defense: number;
  // We can add more stats here later (e.g., dexterity, resolve)
}

export class AttributeService {
  public getEffectiveStats(participant: CharacterWithRelations | Mob): EffectiveStats {
    // Start with the base stats of the character or mob.
    const baseStats: EffectiveStats = {
      name: participant.name,
      hp: participant.hp,
      strength: participant.strength,
      defense: participant.defense,
    };

    // If it's a character, add stats from their equipped items.
    if ('inventory' in participant && Array.isArray(participant.inventory)) {
      participant.inventory.forEach((item) => {
        // Add base stats from the item itself
        if (item.baseItem.baseDamage) baseStats.strength += item.baseItem.baseDamage;
        if (item.baseItem.baseArmor) baseStats.defense += item.baseItem.baseArmor;
        if (item.baseItem.baseMagicResist) baseStats.defense += item.baseItem.baseMagicResist; // Assuming magic resist adds to defense for simplicity

        // Apply bonuses from affixes
        if (item.equipped) {
          item.itemAffixes.forEach(itemAffix => {
            const affixAttributes = itemAffix.value as Record<string, number>;
            for (const [stat, value] of Object.entries(affixAttributes)) {
              if (stat === 'strength') baseStats.strength += value;
              if (stat === 'defense') baseStats.defense += value;
              // Add other stats as needed
            }
          });
        }
      });
    }

    return baseStats;
  }
}
