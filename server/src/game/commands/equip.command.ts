// server/src/game/commands/equip.command.ts
import { Prisma } from '@prisma/client';
import type { ICommandHandler, CommandHandlerContext } from './command.interface';
import type { Command, GameEvent } from '../gameEngine';

type CharacterWithRelations = Prisma.CharacterGetPayload<{ include: { room: true, inventory: true } }>;

export class EquipCommand implements ICommandHandler {
  public async execute(character: CharacterWithRelations, command: Command, context: CommandHandlerContext): Promise<GameEvent[]> {
    const itemName = command.payload;
    const itemToEquip = character.inventory.find(item => item.name.toLowerCase() === itemName.toLowerCase() && !item.equipped);

    if (!itemToEquip) {
      return [{ target: character.id, type: 'message', payload: { message: "You don't have that in your backpack." } }];
    }

    if (itemToEquip.slot === 'NONE') {
      return [{ target: character.id, type: 'message', payload: { message: "You can't equip that." } }];
    }

    // Check if another item is already in that slot
    const currentlyEquipped = character.inventory.find(item => item.equipped && item.slot === itemToEquip.slot);
    if (currentlyEquipped) {
      return [{ target: character.id, type: 'message', payload: { message: `You already have something equipped in your ${itemToEquip.slot.toLowerCase()} slot.` } }];
    }

    // Equip the item
    await context.prisma.item.update({
      where: { id: itemToEquip.id },
      data: { equipped: true },
    });

    return [await context.createFullGameUpdateEvent(character.id, `You equip the ${itemToEquip.name}.`)];
  }
}
