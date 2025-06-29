// server/src/game/item-generator.service.ts
import { PrismaClient, AffixType, BaseItem, Affix, EquipSlot, Prisma, Rarity } from '@prisma/client';


export class ItemGenerationService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public async generateRandomItem(baseItemName: string, itemLevel: number): Promise<Prisma.ItemCreateInput | null> {
    const baseItem = await this.prisma.baseItem.findUnique({ where: { name: baseItemName } });
    if (!baseItem) {
      console.error(`[ItemGenerator] BaseItem '${baseItemName}' not found.`);
      return null;
    }

    const rarity = this._rollForRarity();
    const affixCount = this._getAffixCount(rarity);
    
    const possibleAffixes = await this.prisma.affix.findMany({
      where: { requiredLevel: { lte: itemLevel } },
    });

    const selectedAffixes = this._selectAffixes(possibleAffixes, affixCount);
    
    const itemAffixes: Prisma.ItemAffixCreateNestedManyWithoutItemInput = {
      create: selectedAffixes.map(affix => {
        const affixAttrs = affix.attributes as Record<string, { min: number, max: number }>;
        const value: Prisma.JsonObject = {};
        for (const [stat, range] of Object.entries(affixAttrs)) {
          value[stat] = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        }
        return {
          affix: { connect: { id: affix.id } },
          value: value,
        };
      }),
    };

    const generatedName = this._generateItemName(baseItem, selectedAffixes);
    const description = `A magically enhanced ${baseItem.name}.`;

    return {
      rarity,
      baseItem: {
        connect: { id: baseItem.id }
      },
      itemAffixes: itemAffixes,
    };
  }

  private _rollForRarity(): Rarity {
    const roll = Math.random();
    if (roll <= 0.01) return Rarity.RARE; // Simplified for testing
    if (roll <= 0.15) return Rarity.UNCOMMON;
    return Rarity.COMMON;
  }

  private _getAffixCount(rarity: Rarity): number {
    switch (rarity) {
      case Rarity.UNCOMMON: return Math.floor(Math.random() * 2) + 1; // 1-2
      case Rarity.RARE: return Math.floor(Math.random() * 2) + 2; // 2-3
      case Rarity.LEGENDARY: return Math.floor(Math.random() * 2) + 4; // 4-5
      default: return 0;
    }
  }

  private _selectAffixes(possibleAffixes: Affix[], count: number): Affix[] {
    const prefixes = possibleAffixes.filter(a => a.type === AffixType.PREFIX);
    const suffixes = possibleAffixes.filter(a => a.type === AffixType.SUFFIX);
    const selected: Affix[] = [];

    if (count > 0 && prefixes.length > 0) {
      selected.push(prefixes[Math.floor(Math.random() * prefixes.length)]);
    }
    if (count > 1 && suffixes.length > 0) {
      selected.push(suffixes[Math.floor(Math.random() * suffixes.length)]);
    }
    
    const remainingPossible = possibleAffixes.filter(a => !selected.find(s => s.id === a.id));
    while (selected.length < count && remainingPossible.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingPossible.length);
      selected.push(remainingPossible[randomIndex]);
      remainingPossible.splice(randomIndex, 1);
    }

    return selected;
  }

  private _generateItemName(baseItem: BaseItem, affixes: Affix[]): string {
    const prefix = affixes.find(a => a.type === AffixType.PREFIX);
    const suffix = affixes.find(a => a.type === AffixType.SUFFIX);
    
    let name = baseItem.name;
    if (prefix) name = `${prefix.name} ${name}`;
    if (suffix) name = `${name} ${suffix.name}`;
    
    return name;
  }
}
