// server/src/game/commands/get.command.ts
import { Prisma } from '@prisma/client'; // Import the main 'Prisma' namespace
import type { ICommandHandler, CommandHandlerContext } from './command.interface';
import type { Command, GameEvent } from '../gameEngine';

// --- NEW: Define a more specific type for a fully loaded character ---
type CharacterWithRelations = Prisma.CharacterGetPayload<{
  include: { room: true, inventory: true }
}>;

export class GetCommand implements ICommandHandler {
  // Use the new, more specific type for the 'character' parameter
  public async execute(character: CharacterWithRelations, command: Command, context: CommandHandlerContext): Promise<GameEvent[]> {
    const events: GameEvent[] = [];
    const itemName = command.payload;
    
    // The 'room' property is now guaranteed to exist
    if (!character.room) return [];

    const item = await context.prisma.item.findFirst({
      where: { name: { equals: itemName, mode: 'insensitive' }, roomId: character.room.id }
    });

    if (item) {
      await context.prisma.item.update({
        where: { id: item.id },
        data: { roomId: null, characterId: character.id }
      });

      events.push(await context.createFullGameUpdateEvent(character.id, `You take the ${item.name}.`));
      events.push({
        target: 'room',
        type: 'message',
        payload: { roomId: character.room.id, message: `${character.name} takes the ${item.name}.`, exclude: [character.id] }
      });
    } else {
      events.push({ target: character.id, type: 'message', payload: { message: "You don't see that here." }});
    }

    return events;
  }
}
