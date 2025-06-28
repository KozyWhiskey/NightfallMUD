// server/src/game/loot.service.ts
import { PrismaClient, Mob } from '@prisma/client';
import { gameEventEmitter, MobDefeatedPayload } from './game.emitter';
import { ItemGenerationService } from './item-generator.service';
import type { GameEvent } from './gameEngine';

interface LootDrop {
  itemTemplateId?: number;
  generatesRandom?: boolean;
  baseItemType?: string;
  itemLevel?: number;
  quantity: string;
  weight: number;
}
interface LootGroup {
  groupName: string;
  dropChance: number;
  guaranteed: boolean;
  maxDrops: number;
  items: LootDrop[];
}
type LootTable = LootGroup[];

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
  private itemGenerator: ItemGenerationService;
  private broadcastCallback: (events: GameEvent[]) => void;

  constructor(prisma: PrismaClient, broadcastCallback: (events: GameEvent[]) => void) {
    this.prisma = prisma;
    this.itemGenerator = new ItemGenerationService(this.prisma);
    this.broadcastCallback = broadcastCallback;
  }

  public listen() {
    gameEventEmitter.on('mobDefeated', this.handleMobDefeated.bind(this));
  }

  private async handleMobDefeated(payload: MobDefeatedPayload) {
    const { mob, killer, roomId } = payload;
    const events: GameEvent[] = [];

    const itemsWereDropped = await this.generateAndPlaceLoot(mob, roomId);
    if (itemsWereDropped) {
      events.push({ target: 'room', type: 'message', payload: { roomId, message: `The ${mob.name} drops some loot!`, exclude: [] }});
    }

    const goldDropped = this.calculateGoldDrop(mob);
    if (goldDropped > 0) {
      await this.prisma.character.update({
        where: { id: killer.id },
        data: { gold: { increment: goldDropped } },
      });
      events.push({ target: killer.id, type: 'message', payload: { message: `You find ${goldDropped} gold.` }});
    }

    if (events.length > 0) {
      this.broadcastCallback(events);
    }
  }

  private async generateAndPlaceLoot(mob: Mob, roomId: string): Promise<boolean> {
    const lootTable = mob.lootTable as unknown as LootTable;
    if (!Array.isArray(lootTable) || lootTable.length === 0) return false;

    let lootDropped = false;
    for (const group of lootTable) {
      const roll = Math.random();
      if (group.guaranteed || roll <= group.dropChance) {
        for (let i = 0; i < group.maxDrops; i++) {
          const totalWeight = group.items.reduce((sum: number, item: LootDrop) => sum + item.weight, 0);
          if (totalWeight === 0) continue;
          let itemRoll = Math.floor(Math.random() * totalWeight);
          for (const itemToDrop of group.items) {
            itemRoll -= itemToDrop.weight;
            if (itemRoll < 0) {
              const quantity = rollDice(itemToDrop.quantity);
              for (let j = 0; j < quantity; j++) {
                if (itemToDrop.generatesRandom && itemToDrop.baseItemType && itemToDrop.itemLevel) {
                  const generatedItemData = await this.itemGenerator.generateRandomItem(itemToDrop.baseItemType, itemToDrop.itemLevel);
                  if (generatedItemData) {
                    const newItemTemplate = await this.prisma.itemTemplate.create({ data: generatedItemData });
                    await this.prisma.item.create({ data: { itemTemplateId: newItemTemplate.id, roomId: roomId } });
                    lootDropped = true;
                  }
                } else if (itemToDrop.itemTemplateId) {
                  await this.prisma.item.create({ data: { itemTemplateId: itemToDrop.itemTemplateId, roomId: roomId } });
                  lootDropped = true;
                }
              }
              break;
            }
          }
        }
      }
    }
    return lootDropped;
  }

  private calculateGoldDrop(mob: Mob): number {
    if (!mob.canDropGold) return 0;
    let minGold = 0, maxGold = 0;
    if (mob.level >= 1 && mob.level <= 3) { [minGold, maxGold] = [1, 5]; }
    else if (mob.level >= 4 && mob.level <= 6) { [minGold, maxGold] = [4, 12]; }
    else if (mob.level >= 7 && mob.level <= 10) { [minGold, maxGold] = [10, 25]; }
    if (maxGold === 0) return 0;
    return Math.floor(Math.random() * (maxGold - minGold + 1)) + minGold;
  }
}
