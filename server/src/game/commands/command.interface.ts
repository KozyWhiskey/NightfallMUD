// server/src/game/commands/command.interface.ts
import { Prisma } from '@prisma/client';
import type { GameEvent, Command } from '../gameEngine';
import type { CombatManager } from '../combat.manager';
import type { AttributeService } from '../attribute.service'; // <-- Import the new service

// This is the definitive type for a "fully loaded" character, including all relations.
export type CharacterWithRelations = Prisma.CharacterGetPayload<{
  include: 
    { room: true; 
      inventory: { 
        include: { 
          baseItem: true, 
          itemAffixes: { include: { affix: true } }
        } 
      } 
    } 
}>;

// The context object passed to every command handler
export interface CommandHandlerContext {
  prisma: Prisma.TransactionClient;
  combatManager: CombatManager;
  attributeService: AttributeService; // <-- ADD the missing property
  getCharactersInRoom(roomId: string, excludeCharacterId?: string): Promise<CharacterWithRelations[]>;
  createFullGameUpdateEvent(characterId: string, message: string): Promise<GameEvent>;
}

export interface ICommandHandler {
  execute(character: CharacterWithRelations, command: Command, context: CommandHandlerContext): Promise<GameEvent[]>;
}
