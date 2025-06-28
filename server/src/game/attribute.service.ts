// server/src/game/attribute.service.ts
import type { Item, Mob } from '@prisma/client';
import type { CharacterWithRelations } from './commands/command.interface';

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
      participant.inventory.forEach((item: Item & { template: any }) => {
        if (item.equipped && item.template && typeof item.template.attributes === 'object' && item.template.attributes !== null) {
          const attributes = item.template.attributes as Record<string, number>;
          
          // Apply bonuses from gear
          baseStats.strength += attributes.damage || 0; // The 'damage' attribute on items adds to strength
          baseStats.defense += attributes.armor || 0;  // The 'armor' attribute on items adds to defense
        }
      });
    }

    return baseStats;
  }
}
