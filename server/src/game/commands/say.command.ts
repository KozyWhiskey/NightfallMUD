// server/src/game/commands/say.command.ts
import { Prisma } from '@prisma/client';
import type { ICommandHandler, CommandHandlerContext } from './command.interface';
import type { Command, GameEvent } from '../gameEngine';

// --- Define the specific type for a fully loaded character ---
type CharacterWithRelations = Prisma.CharacterGetPayload<{
  include: { room: true, inventory: true }
}>;

export class SayCommand implements ICommandHandler {
  // Use the new, more specific type for the 'character' parameter
  public async execute(character: CharacterWithRelations, command: Command, context: CommandHandlerContext): Promise<GameEvent[]> {
    const events: GameEvent[] = [];
    const message = command.payload;

    if (!character.room) return []; // Safety check

    if (message) {
      // 1. Create the event for the player who spoke
      events.push({
        target: character.id,
        type: 'message',
        payload: { message: `You say, '${message}'` }
      });

      // 2. Create the event to broadcast to everyone else in the room
      events.push({
        target: 'room',
        type: 'message',
        payload: {
          roomId: character.currentRoomId,
          message: `${character.name} says, '${message}'`,
          exclude: [character.id]
        }
      });
    } else {
      // Handle case where player just types "say"
      events.push({ target: character.id, type: 'message', payload: { message: 'Say what?' } });
    }

    return events;
  }
}
