// server/src/game/commands/drop.command.ts
import type { ICommandHandler, CommandHandlerContext, CharacterWithRelations } from './command.interface';
import type { Command, GameEvent } from '../gameEngine';

export class DropCommand implements ICommandHandler {
  public async execute(character: CharacterWithRelations, command: Command, context: CommandHandlerContext): Promise<GameEvent[]> {
    const events: GameEvent[] = [];
    const itemName = command.payload;

    if (!character.room) return [];

    // --- THIS IS THE FIX ---
    const item = character.inventory.find(invItem => 
      invItem.baseItem.name.toLowerCase() === itemName.toLowerCase()
    );
    
    if (item) {
      await context.prisma.item.update({
        where: { id: item.id },
        data: { characterId: null, roomId: character.room.id }
      });

      const droppedItemName = item.baseItem.name;
      events.push(await context.createFullGameUpdateEvent(character.id, `You drop the ${droppedItemName}.`));
      events.push({
        target: 'room',
        type: 'message',
        payload: { roomId: character.room.id, message: `${character.name} drops a ${droppedItemName}.`, exclude: [character.id] }
      });
    } else {
      events.push({ target: character.id, type: 'message', payload: { message: "You aren't carrying that." }});
    }

    return events;
  }
}
