// server/src/game/commands/command.interface.ts
import { Prisma } from '@prisma/client';
import type { GameEvent, Command } from '../gameEngine';
import type { CombatManager } from '../combat.manager';

// --- UPDATED: This type is now more specific ---
// It tells TypeScript to include the full ItemTemplate for each item in the inventory.
export type CharacterWithRelations = Prisma.CharacterGetPayload<{
  include: { 
    room: true, 
    inventory: {
      include: {
        template: true
      }
    } 
  }
}>;

// The context object passed to every command handler
export interface CommandHandlerContext {
  prisma: Prisma.TransactionClient;
  combatManager: CombatManager;
  getCharactersInRoom(roomId: string, excludeCharacterId?: string): Promise<CharacterWithRelations[]>;
  createFullGameUpdateEvent(characterId: string, message: string): Promise<GameEvent>;
}

export interface ICommandHandler {
  execute(character: CharacterWithRelations, command: Command, context: CommandHandlerContext): Promise<GameEvent[]>;
}
