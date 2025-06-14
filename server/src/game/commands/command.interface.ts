// server/src/game/commands/command.interface.ts
import { Prisma, Mob } from '@prisma/client';
import type { GameEvent, Command } from '../gameEngine';
import type { CombatManager } from '../combat.manager';

export type CharacterWithRelations = Prisma.CharacterGetPayload<{
  include: { room: true, inventory: true }
}>;

export interface CommandHandlerContext {
  prisma: Prisma.TransactionClient;
  combatManager: CombatManager;
  getCharactersInRoom(roomId: string, excludeCharacterId?: string): Promise<CharacterWithRelations[]>;
  createFullGameUpdateEvent(characterId: string, message: string): Promise<GameEvent>;
}

export interface ICommandHandler {
  execute(character: CharacterWithRelations, command: Command, context: CommandHandlerContext): Promise<GameEvent[]>;
}
