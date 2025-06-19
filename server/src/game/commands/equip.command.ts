// server/src/game/commands/equip.command.ts
import type { ICommandHandler, CommandHandlerContext, CharacterWithRelations } from './command.interface';
import type { Command, GameEvent } from '../gameEngine';

export class EquipCommand implements ICommandHandler {
  public async execute(character: CharacterWithRelations, command: Command, context: CommandHandlerContext): Promise<GameEvent[]> {
    const itemName = command.payload;

    // --- THIS IS THE FIX ---
    // We now find the item in the character's inventory by looking at the template's name.
    const itemToEquip = character.inventory.find(item => item.template.name.toLowerCase() === itemName.toLowerCase() && !item.equipped);

    if (!itemToEquip) {
      return [{ target: character.id, type: 'message', payload: { message: "You don't have that in your backpack." } }];
    }

    // Access the slot from the item's template.
    if (itemToEquip.template.slot === 'NONE') {
      return [{ target: character.id, type: 'message', payload: { message: "You can't equip that." } }];
    }

    // Check if another item is already in that slot.
    const currentlyEquipped = character.inventory.find(item => item.equipped && item.template.slot === itemToEquip.template.slot);
    if (currentlyEquipped) {
      return [{ target: character.id, type: 'message', payload: { message: `You already have a ${currentlyEquipped.template.name} equipped in that slot.` } }];
    }

    // Equip the item.
    await context.prisma.item.update({
      where: { id: itemToEquip.id },
      data: { equipped: true },
    });

    // Access the name from the template for the confirmation message.
    return [await context.createFullGameUpdateEvent(character.id, `You equip the ${itemToEquip.template.name}.`)];
  }
}
