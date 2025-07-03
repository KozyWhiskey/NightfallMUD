import { ICommandHandler, CommandHandlerContext, CharacterWithRelations } from './command.interface';
import { Command, GameEvent } from '../gameEngine';
import { SpellService } from '../spell.service';
import { PrismaClient } from '@prisma/client';

export class SpellsCommand implements ICommandHandler {
  private spellService: SpellService;
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    this.spellService = new SpellService(this.prisma);
  }

  async execute(character: CharacterWithRelations, command: Command, context: CommandHandlerContext): Promise<GameEvent[]> {
    const { type = 'spellbook' } = command.payload || {};

    try {
      if (type === 'available') {
        // Show available spells
        const availableSpells = await this.spellService.getAvailableSpellsForCharacter(character.id);
        
        if (availableSpells.length === 0) {
          return [{ target: character.id, type: 'message', payload: { message: 'No spells available to learn.' } }];
        }

        let message = 'Available spells to learn:\n';
        availableSpells.forEach(spell => {
          message += `- ${(spell as any).name} (Level ${(spell as any).requiredLevel}, ${(spell as any).manaCost} mana)\n`;
        });

        return [{ target: character.id, type: 'message', payload: { message } }];

      } else {
        // Show spellbook (default)
        const characterSpells = await this.spellService.getCharacterSpells(character.id);
        
        if (characterSpells.length === 0) {
          return [{ target: character.id, type: 'message', payload: { message: 'Your spellbook is empty.' } }];
        }

        let message = 'Your spellbook:\n';
        characterSpells.forEach(cs => {
          const spell = (cs.spell as any);
          const cooldownStatus = (cs as any).cooldownUntil && new Date((cs as any).cooldownUntil) > new Date() ? 
            ' (On cooldown)' : '';
          message += `- ${spell.name} (${spell.manaCost} mana, ${spell.cooldown} round cooldown)${cooldownStatus}\n`;
        });

        return [{ target: character.id, type: 'message', payload: { message } }];
      }

    } catch (error) {
      console.error('Error showing spells:', error);
      return [{ target: character.id, type: 'message', payload: { message: 'An error occurred while retrieving spells.' } }];
    }
  }
} 