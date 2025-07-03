import { PrismaClient, Spell, SpellEffect, StatusEffect, CharacterSpell } from '@prisma/client';

export interface SpellWithEffects extends Spell {
  effects: (SpellEffect & {
    statusEffect?: StatusEffect | null;
  })[];
}

export interface CharacterSpellWithSpell extends CharacterSpell {
  spell: SpellWithEffects;
}

export class SpellService {
  constructor(private prisma: PrismaClient) {}

  async getSpellByName(name: string): Promise<SpellWithEffects | null> {
    return this.prisma.spell.findUnique({
      where: { name },
      include: {
        effects: {
          include: {
            statusEffect: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
  }

  async getSpellById(id: number): Promise<SpellWithEffects | null> {
    return this.prisma.spell.findUnique({
      where: { id },
      include: {
        effects: {
          include: {
            statusEffect: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
  }

  async getCharacterSpells(characterId: string): Promise<CharacterSpellWithSpell[]> {
    return this.prisma.characterSpell.findMany({
      where: { characterId },
      include: {
        spell: {
          include: {
            effects: {
              include: {
                statusEffect: true
              },
              orderBy: {
                order: 'asc'
              }
            }
          }
        }
      }
    });
  }

  async learnSpell(characterId: string, spellId: number): Promise<CharacterSpell> {
    return this.prisma.characterSpell.create({
      data: { characterId, spellId }
    });
  }

  async canLearnSpell(characterId: string, spellId: number): Promise<boolean> {
    const character = await this.prisma.character.findUnique({
      where: { id: characterId }
    });

    const spell = await this.prisma.spell.findUnique({
      where: { id: spellId }
    });

    if (!character || !spell) {
      return false;
    }

    // Check if character already knows the spell
    const existingSpell = await this.prisma.characterSpell.findUnique({
      where: {
        characterId_spellId: {
          characterId,
          spellId
        }
      }
    });

    if (existingSpell) {
      return false;
    }

    // Check level requirement
    if (character.level < spell.requiredLevel) {
      return false;
    }

    // Check class requirement for class spells
    if (spell.spellType === 'CLASS' && spell.requiredClass && character.class !== spell.requiredClass) {
      return false;
    }

    return true;
  }

  async getAvailableSpellsForCharacter(characterId: string): Promise<SpellWithEffects[]> {
    const character = await this.prisma.character.findUnique({
      where: { id: characterId }
    });

    if (!character) {
      return [];
    }

    // Get all spells that the character can learn
    const availableSpells = await this.prisma.spell.findMany({
      where: {
        requiredLevel: {
          lte: character.level
        },
        OR: [
          { spellType: 'UNIVERSAL' },
          { 
            spellType: 'CLASS',
            requiredClass: character.class
          }
        ]
      },
      include: {
        effects: {
          include: {
            statusEffect: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    // Filter out spells the character already knows
    const knownSpellIds = await this.prisma.characterSpell.findMany({
      where: { characterId },
      select: { spellId: true }
    });

    const knownSpellIdSet = new Set(knownSpellIds.map(cs => cs.spellId));
    return availableSpells.filter(spell => !knownSpellIdSet.has(spell.id));
  }

  async isSpellOnCooldown(characterId: string, spellId: number): Promise<boolean> {
    const characterSpell = await this.prisma.characterSpell.findUnique({
      where: {
        characterId_spellId: {
          characterId,
          spellId
        }
      }
    });

    if (!characterSpell || !characterSpell.cooldownUntil) {
      return false;
    }

    return characterSpell.cooldownUntil > new Date();
  }

  async setSpellCooldown(characterId: string, spellId: number, cooldownRounds: number): Promise<void> {
    // Convert rounds to milliseconds (assuming 3 seconds per round)
    const cooldownMs = cooldownRounds * 3000;
    const cooldownUntil = new Date(Date.now() + cooldownMs);

    await this.prisma.characterSpell.update({
      where: {
        characterId_spellId: {
          characterId,
          spellId
        }
      },
      data: {
        cooldownUntil
      }
    });
  }

  async hasEnoughMana(characterId: string, spellId: number): Promise<boolean> {
    const [character, spell] = await Promise.all([
      this.prisma.character.findUnique({
        where: { id: characterId }
      }),
      this.prisma.spell.findUnique({
        where: { id: spellId }
      })
    ]);

    if (!character || !spell) {
      return false;
    }

    return character.mana >= spell.manaCost;
  }

  async consumeMana(characterId: string, spellId: number): Promise<void> {
    const spell = await this.prisma.spell.findUnique({
      where: { id: spellId }
    });

    if (!spell) {
      throw new Error('Spell not found');
    }

    await this.prisma.character.update({
      where: { id: characterId },
      data: {
        mana: {
          decrement: spell.manaCost
        }
      }
    });
  }
} 