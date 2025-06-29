// server/src/game/commands/get.command.ts
import type { ICommandHandler, CommandHandlerContext, CharacterWithRelations } from './command.interface';
import type { Command, GameEvent } from '../gameEngine';

export class GetCommand implements ICommandHandler {
  public async execute(character: CharacterWithRelations, command: Command, context: CommandHandlerContext): Promise<GameEvent[]> {
    const events: GameEvent[] = [];
    const itemName = command.payload;
    
    if (!character.room) return [];

    // --- THIS IS THE FIX ---
    const item = await context.prisma.item.findFirst({
      where: {
        roomId: character.room.id,
        baseItem: { name: { equals: itemName, mode: 'insensitive' } }
      },
      include: {
        baseItem: true // Include baseItem for dynamic items
      }
    });

    if (item) {
      await context.prisma.item.update({
        where: { id: item.id },
        data: { roomId: null, characterId: character.id }
      });

      const pickedUpItemName = item.baseItem.name;
      events.push(await context.createFullGameUpdateEvent(character.id, `You take the ${pickedUpItemName}.`));
      events.push({
        target: 'room',
        type: 'message',
        payload: { roomId: character.room.id, message: `${character.name} takes the ${pickedUpItemName}.`, exclude: [character.id] }
      });
    } else {
      events.push({ target: character.id, type: 'message', payload: { message: "You don't see that here." }});
    }

    return events;
  }
}
