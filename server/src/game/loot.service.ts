// server/src/game/loot.service.ts
import { PrismaClient, Mob } from '@prisma/client';

// Define the shape of the loot table data based on your design document
interface LootItem {
  itemTemplateId: number;
  quantity: string; // e.g., "1", "1d4", "2d6+1"
  weight: number;
}
interface LootGroup {
  groupName: string;
  dropChance: number;
  guaranteed: boolean;
  maxDrops: number;
  items: LootItem[];
}
type LootTable = LootGroup[];

export interface GeneratedLoot {
  itemTemplateId: number;
  quantity: number;
}

// A helper function to parse dice notation like "1d4" or "2d6+1"
function rollDice(diceNotation: string): number {
  const match = diceNotation.match(/(\d+)d(\d+)(?:\+(\d+))?/);
  if (!match) return parseInt(diceNotation, 10) || 1;

  const numDice = parseInt(match[1], 10);
  const numSides = parseInt(match[2], 10);
  const modifier = parseInt(match[3] || '0', 10);

  let total = 0;
  for (let i = 0; i < numDice; i++) {
    total += Math.floor(Math.random() * numSides) + 1;
  }
  return total + modifier;
}

export class LootService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public async generateLootForMob(mob: Mob): Promise<GeneratedLoot[]> {
    const finalLoot: GeneratedLoot[] = [];
    // Safely cast the JSON field from the database
    const lootTable = mob.lootTable as unknown as LootTable;

    if (!Array.isArray(lootTable) || lootTable.length === 0) {
      return [];
    }

    // Iterate through each loot group in the table
    for (const group of lootTable) {
      const roll = Math.random();

      // Check if this group should drop items
      if (group.guaranteed || roll <= group.dropChance) {
        
        for (let i = 0; i < group.maxDrops; i++) {
          const totalWeight = group.items.reduce((sum, item) => sum + item.weight, 0);
          if (totalWeight === 0) continue; // Skip if group has no weighted items

          let itemRoll = Math.floor(Math.random() * totalWeight);

          // Find the item that drops based on the weighted roll
          for (const item of group.items) {
            itemRoll -= item.weight;
            if (itemRoll < 0) {
              const quantity = rollDice(item.quantity);
              finalLoot.push({ itemTemplateId: item.itemTemplateId, quantity });
              break; // Stop after finding an item for this drop
            }
          }
        }
      }
    }

    return finalLoot;
  }

  // A function to calculate gold based on your scaling table
  public calculateGoldDrop(mob: Mob): number {
    if (!mob.canDropGold) return 0;
    
    // Simplified version of the Gold Scaling Domain Table
    let minGold = 0;
    let maxGold = 0;

    if (mob.level >= 1 && mob.level <= 3) { [minGold, maxGold] = [1, 5]; }
    else if (mob.level >= 4 && mob.level <= 6) { [minGold, maxGold] = [4, 12]; }
    else if (mob.level >= 7 && mob.level <= 10) { [minGold, maxGold] = [10, 25]; }
    // ... add more tiers as needed

    if (maxGold === 0) return 0;

    // Return a random amount within the determined range
    return Math.floor(Math.random() * (maxGold - minGold + 1)) + minGold;
  }

  // This function creates the actual item instances in the room
  public async placeLootInRoom(roomId: string, generatedLoot: GeneratedLoot[]) {
    if (generatedLoot.length === 0) return;

    const itemsToCreate = [];
    for (const loot of generatedLoot) {
      for (let i = 0; i < loot.quantity; i++) {
        itemsToCreate.push({
          itemTemplateId: loot.itemTemplateId,
          roomId: roomId,
        });
      }
    }

    if (itemsToCreate.length > 0) {
        await this.prisma.item.createMany({ data: itemsToCreate });
    }
  }
}
