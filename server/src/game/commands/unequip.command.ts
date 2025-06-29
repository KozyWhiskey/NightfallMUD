// server/src/game/commands/unequip.command.ts
import type { ICommandHandler, CommandHandlerContext, CharacterWithRelations } from './command.interface';
import type { Command, GameEvent } from '../gameEngine';

export class UnequipCommand implements ICommandHandler {
  public async execute(character: CharacterWithRelations, command: Command, context: CommandHandlerContext): Promise<GameEvent[]> {
    const itemName = command.payload;

    // --- THIS IS THE FIX ---
    // Find the item in the character's inventory by name.
    const itemToUnequip = character.inventory.find(item => 
      item.baseItem.name.toLowerCase() === itemName.toLowerCase() && 
      item.equipped
    );

    if (!itemToUnequip) {
      return [{ target: character.id, type: 'message', payload: { message: "You don't have that equipped." } }];
    }

    await context.prisma.item.update({
      where: { id: itemToUnequip.id },
      data: { equipped: false },
    });

    const unequippedItemName = itemToUnequip.baseItem.name;
    return [await context.createFullGameUpdateEvent(character.id, `You unequip the ${unequippedItemName}.`)];
  }
}
