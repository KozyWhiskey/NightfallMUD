// server/src/game/commands/drop.command.ts
import { Prisma } from '@prisma/client';
import type { ICommandHandler, CommandHandlerContext } from './command.interface';
import type { Command, GameEvent } from '../gameEngine';

// --- Define the specific type for a fully loaded character ---
type CharacterWithRelations = Prisma.CharacterGetPayload<{
  include: { room: true, inventory: true }
}>;

export class DropCommand implements ICommandHandler {
  // Use the new, more specific type for the 'character' parameter
  public async execute(character: CharacterWithRelations, command: Command, context: CommandHandlerContext): Promise<GameEvent[]> {
    const events: GameEvent[] = [];
    const itemName = command.payload;

    if (!character.room) return [];

    // The 'inventory' property is now guaranteed to exist on the character object
    const item = character.inventory.find(invItem => invItem.name.toLowerCase() === itemName.toLowerCase());
    
    if (item) {
      await context.prisma.item.update({
        where: { id: item.id },
        data: { characterId: null, roomId: character.room.id }
      });

      events.push(await context.createFullGameUpdateEvent(character.id, `You drop the ${item.name}.`));
      events.push({
        target: 'room',
        type: 'message',
        payload: { roomId: character.room.id, message: `${character.name} drops a ${item.name}.`, exclude: [character.id] }
      });
    } else {
      events.push({ target: character.id, type: 'message', payload: { message: "You aren't carrying that." }});
    }

    return events;
  }
}
