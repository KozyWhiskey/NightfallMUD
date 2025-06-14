// server/src/game/commands/look.command.ts
import { Prisma } from '@prisma/client';
import type { ICommandHandler, CommandHandlerContext } from './command.interface';
import type { Command, GameEvent } from '../gameEngine';

// --- Define the specific type for a fully loaded character ---
type CharacterWithRelations = Prisma.CharacterGetPayload<{
  include: { room: true, inventory: true }
}>;

export class LookCommand implements ICommandHandler {
  // Use the new, more specific type for the 'character' parameter
  public async execute(character: CharacterWithRelations, command: Command, context: CommandHandlerContext): Promise<GameEvent[]> {
    // The 'room' property is now guaranteed to exist
    if (!character.room) return [];

    const playersInRoom = await context.getCharactersInRoom(character.room.id, character.id);
    const itemsInRoom = await context.prisma.item.findMany({ where: { roomId: character.room.id } });
    const mobsInRoom = await context.prisma.mob.findMany({ where: { roomId: character.room.id } });

    // The 'inventory' property is also now guaranteed to exist
    const event: GameEvent = {
      target: character.id,
      type: 'gameUpdate',
      payload: {
        message: 'You look around.',
        player: character,
        room: character.room,
        players: playersInRoom.map(p => p.name),
        roomItems: itemsInRoom,
        inventory: character.inventory,
        mobs: mobsInRoom,
      }
    };

    return [event];
  }
}
