// server/src/game/commands/equip.command.ts
import type { ICommandHandler, CommandHandlerContext, CharacterWithRelations } from './command.interface';
import type { Command, GameEvent } from '../gameEngine';

export class EquipCommand implements ICommandHandler {
  public async execute(character: CharacterWithRelations, command: Command, context: CommandHandlerContext): Promise<GameEvent[]> {
    const itemName = command.payload;

    // --- THIS IS THE FIX ---
    // Find the item in the character's inventory by name.
    const itemToEquip = character.inventory.find(item => 
      item.baseItem.name.toLowerCase() === itemName.toLowerCase() && 
      !item.equipped
    );

    if (!itemToEquip) {
      return [{ target: character.id, type: 'message', payload: { message: "You don't have that in your backpack." } }];
    }

    const itemSlot = itemToEquip.baseItem.slot;

    if (itemSlot === 'NONE') {
      return [{ target: character.id, type: 'message', payload: { message: "You can't equip that." } }];
    }

    const currentlyEquipped = character.inventory.find(item => item.equipped && item.baseItem.slot === itemSlot);
    if (currentlyEquipped) {
      return [{ target: character.id, type: 'message', payload: { message: `You already have a ${currentlyEquipped.baseItem.name} equipped in that slot.` } }];
    }

    await context.prisma.item.update({
      where: { id: itemToEquip.id },
      data: { equipped: true },
    });

    const equippedItemName = itemToEquip.baseItem.name;
    return [await context.createFullGameUpdateEvent(character.id, `You equip the ${equippedItemName}.`)];
  }
}
