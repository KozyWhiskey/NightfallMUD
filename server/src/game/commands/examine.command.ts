// server/src/game/commands/examine.command.ts
import type { ICommandHandler, CommandHandlerContext, CharacterWithRelations } from './command.interface';
import type { Command, GameEvent } from '../gameEngine';

export class ExamineCommand implements ICommandHandler {
  public async execute(character: CharacterWithRelations, command: Command, context: CommandHandlerContext): Promise<GameEvent[]> {
    const itemName = command.payload;
    if (!itemName) {
      return [{ target: character.id, type: 'message', payload: { message: "Examine what?" } }];
    }
    if (!character.room) return [];

    // --- THIS IS THE FIX ---
    const item = await context.prisma.item.findFirst({
      where: {
        baseItem: { name: { equals: itemName, mode: 'insensitive' } },
        AND: [
          { OR: [{ characterId: character.id }, { roomId: character.room.id }] }
        ]
      },
      include: {
        baseItem: true // Include baseItem for dynamic items
      }
    });

    if (item) {
      const name = item.baseItem.name;
      const description = item.baseItem.description;
      if (name && description) {
        return [{ target: character.id, type: 'message', payload: { message: description } }];
      }
      return [{ target: character.id, type: 'message', payload: { message: "You don't see that here." } }];
    } else {
      return [{ target: character.id, type: 'message', payload: { message: "You don't see that here." } }];
    }
  }
}
