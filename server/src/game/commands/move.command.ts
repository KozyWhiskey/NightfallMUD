// server/src/game/commands/move.command.ts
import { Prisma } from '@prisma/client';
import type { ICommandHandler, CommandHandlerContext, CharacterWithRelations } from './command.interface';
import type { Command, GameEvent } from '../gameEngine';

export class MoveCommand implements ICommandHandler {
  public async execute(character: CharacterWithRelations, command: Command, context: CommandHandlerContext): Promise<GameEvent[]> {
    const events: GameEvent[] = [];
    const direction = command.payload;
    const currentRoom = character.room;

    if (!currentRoom) return [];

    const exits = currentRoom.exits as { [key: string]: string };
    const nextRoomId = exits[direction];

    if (nextRoomId) {
      // Announce departure to the old room
      events.push({
        target: 'room',
        type: 'message',
        payload: { roomId: currentRoom.id, message: `${character.name} moves ${direction}.`, exclude: [character.id] }
      });

      // Update the character's location in the database
      const updatedCharacter = await context.prisma.character.update({
        where: { id: character.id },
        data: { currentRoomId: nextRoomId },
      });

      // --- NEW: Check for aggression in the new room ---
      const mobsInNewRoom = await context.prisma.mob.findMany({ where: { roomId: nextRoomId } });
      await context.combatManager.checkForAggression(updatedCharacter, mobsInNewRoom);
      
      // Create the main update event for the player
      const playerUpdateEvent = await context.createFullGameUpdateEvent(character.id, `You move ${direction}.`);
      events.push(playerUpdateEvent);
      
      // Announce arrival to the new room
      events.push({
        target: 'room',
        type: 'message',
        payload: { roomId: nextRoomId, message: `${character.name} arrives.`, exclude: [character.id] }
      });
    } else {
      events.push({ target: character.id, type: 'message', payload: { message: "You can't go that way." } });
    }

    return events;
  }
}
