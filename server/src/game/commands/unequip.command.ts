// server/src/game/commands/unequip.command.ts
import type { ICommandHandler, CommandHandlerContext, CharacterWithRelations } from './command.interface';
import type { Command, GameEvent } from '../gameEngine';

export class UnequipCommand implements ICommandHandler {
  public async execute(character: CharacterWithRelations, command: Command, context: CommandHandlerContext): Promise<GameEvent[]> {
    const itemName = command.payload;

    // --- THIS IS THE FIX ---
    // We now find the item in the character's inventory by looking at the template's name.
    const itemToUnequip = character.inventory.find(item => item.template.name.toLowerCase() === itemName.toLowerCase() && item.equipped);

    if (!itemToUnequip) {
      return [{ target: character.id, type: 'message', payload: { message: "You don't have that equipped." } }];
    }

    // Unequip the item.
    await context.prisma.item.update({
      where: { id: itemToUnequip.id },
      data: { equipped: false },
    });

    // Access the name from the template for the confirmation message.
    return [await context.createFullGameUpdateEvent(character.id, `You unequip the ${itemToUnequip.template.name}.`)];
  }
}
