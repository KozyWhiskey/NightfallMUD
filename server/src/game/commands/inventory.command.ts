// server/src/game/commands/inventory.command.ts
import type { ICommandHandler, CommandHandlerContext, CharacterWithRelations } from './command.interface';
import type { Command, GameEvent } from '../gameEngine';

export class InventoryCommand implements ICommandHandler {
  public async execute(character: CharacterWithRelations, command: Command, context: CommandHandlerContext): Promise<GameEvent[]> {
    const events: GameEvent[] = [];
    const playerInventory = character.inventory;

    let message = "You are carrying:\n";
    if (playerInventory.length === 0) {
      message = "You are not carrying anything.";
    } else {
      message += playerInventory.map(item => `  - ${item.baseItem.name}`).join('\n');
    }

    events.push({ target: character.id, type: 'message', payload: { message }});
    return events;
  }
}