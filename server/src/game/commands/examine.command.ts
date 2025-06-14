// server/src/game/commands/examine.command.ts
import { Prisma } from '@prisma/client';
import type { ICommandHandler, CommandHandlerContext } from './command.interface';
import type { Command, GameEvent } from '../gameEngine';

// --- Define the specific type for a fully loaded character ---
type CharacterWithRelations = Prisma.CharacterGetPayload<{
  include: { room: true, inventory: true }
}>;

export class ExamineCommand implements ICommandHandler {
  // Use the new, more specific type for the 'character' parameter
  public async execute(character: CharacterWithRelations, command: Command, context: CommandHandlerContext): Promise<GameEvent[]> {
    const itemName = command.payload;
    if (!itemName) {
      return [{ target: character.id, type: 'message', payload: { message: "Examine what?" } }];
    }
    if (!character.room) return [];

    const item = await context.prisma.item.findFirst({
      where: {
        name: { equals: itemName, mode: 'insensitive' },
        OR: [
          { characterId: character.id },
          { roomId: character.room.id }
        ]
      }
    });

    if (item) {
      return [{ target: character.id, type: 'message', payload: { message: item.description } }];
    } else {
      return [{ target: character.id, type: 'message', payload: { message: "You don't see that here." } }];
    }
  }
}
