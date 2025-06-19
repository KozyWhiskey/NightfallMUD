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
    // We now query by looking through the related template for its name.
    const item = await context.prisma.item.findFirst({
      where: {
        // Look for an item whose template's name matches...
        template: {
          name: { equals: itemName, mode: 'insensitive' }
        },
        // ...and is either in the character's inventory OR in their current room.
        OR: [
          { characterId: character.id },
          { roomId: character.room.id }
        ]
      },
      include: {
        template: true // Ensure the template data is included in the result
      }
    });

    if (item) {
      // We now access the description via item.template.description
      return [{ target: character.id, type: 'message', payload: { message: item.template.description } }];
    } else {
      return [{ target: character.id, type: 'message', payload: { message: "You don't see that here." } }];
    }
  }
}
