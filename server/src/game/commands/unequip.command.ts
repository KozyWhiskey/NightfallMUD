// server/src/game/commands/unequip.command.ts
import { Prisma } from '@prisma/client';
import type { ICommandHandler, CommandHandlerContext } from './command.interface';
import type { Command, GameEvent } from '../gameEngine';

type CharacterWithRelations = Prisma.CharacterGetPayload<{ include: { room: true, inventory: true } }>;

export class UnequipCommand implements ICommandHandler {
  public async execute(character: CharacterWithRelations, command: Command, context: CommandHandlerContext): Promise<GameEvent[]> {
    const itemName = command.payload;
    const itemToUnequip = character.inventory.find(item => item.name.toLowerCase() === itemName.toLowerCase() && item.equipped);

    if (!itemToUnequip) {
      return [{ target: character.id, type: 'message', payload: { message: "You don't have that equipped." } }];
    }

    // Unequip the item
    await context.prisma.item.update({
      where: { id: itemToUnequip.id },
      data: { equipped: false },
    });

    return [await context.createFullGameUpdateEvent(character.id, `You unequip the ${itemToUnequip.name}.`)];
  }
}
