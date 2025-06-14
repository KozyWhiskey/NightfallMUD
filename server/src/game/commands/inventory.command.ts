// server/src/game/commands/inventory.command.ts
import { Prisma } from '@prisma/client';
import type { ICommandHandler, CommandHandlerContext } from './command.interface';
import type { Command, GameEvent } from '../gameEngine';

// --- Define the specific type for a fully loaded character ---
type CharacterWithRelations = Prisma.CharacterGetPayload<{
  include: { room: true, inventory: true }
}>;

export class InventoryCommand implements ICommandHandler {
  // Use the new, more specific type for the 'character' parameter
  public async execute(character: CharacterWithRelations, command: Command, context: CommandHandlerContext): Promise<GameEvent[]> {
    const events: GameEvent[] = [];
    const playerInventory = character.inventory; // The 'inventory' property is now guaranteed to exist

    let message = "You are carrying:\n";
    if (playerInventory.length === 0) {
      message = "You are not carrying anything.";
    } else {
      message += playerInventory.map(item => `  - ${item.name}`).join('\n');
    }

    events.push({ target: character.id, type: 'message', payload: { message }});
    return events;
  }
}
