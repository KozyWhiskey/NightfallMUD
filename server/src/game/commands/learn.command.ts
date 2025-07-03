import { ICommandHandler, CommandHandlerContext, CharacterWithRelations } from './command.interface';
import { Command, GameEvent } from '../gameEngine';
import { SpellService } from '../spell.service';
import { PrismaClient } from '@prisma/client';

export class LearnCommand implements ICommandHandler {
  private spellService: SpellService;
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    this.spellService = new SpellService(this.prisma);
  }

  async execute(character: CharacterWithRelations, command: Command, context: CommandHandlerContext): Promise<GameEvent[]> {
    const { spellName } = command.payload || {};

    if (!spellName) {
      return [{ target: character.id, type: 'message', payload: { message: 'Usage: learn <spell_name>' } }];
    }

    try {
      // Get the spell by name
      const spell = await this.spellService.getSpellByName(spellName);
      if (!spell) {
        return [{ target: character.id, type: 'message', payload: { message: `Spell "${spellName}" not found.` } }];
      }

      // Check if character can learn the spell
      const canLearn = await this.spellService.canLearnSpell(character.id, (spell as any).id);
      if (!canLearn) {
        return [{ target: character.id, type: 'message', payload: { message: `You cannot learn "${spellName}". Check level requirements and class restrictions.` } }];
      }

      // Learn the spell
      await this.spellService.learnSpell(character.id, (spell as any).id);
      
      return [{ target: character.id, type: 'message', payload: { message: `You have learned "${spellName}"!` } }];

    } catch (error) {
      console.error('Error learning spell:', error);
      return [{ target: character.id, type: 'message', payload: { message: 'An error occurred while learning the spell.' } }];
    }
  }
} 