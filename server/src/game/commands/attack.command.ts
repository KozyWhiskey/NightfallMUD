// server/src/game/commands/attack.command.ts
import { Prisma } from '@prisma/client';
import type { ICommandHandler, CommandHandlerContext, CharacterWithRelations } from './command.interface';
import type { Command, GameEvent } from '../gameEngine';

export class AttackCommand implements ICommandHandler {

  public async execute(character: CharacterWithRelations, command: Command, context: CommandHandlerContext): Promise<GameEvent[]> {
    const targetName = command.payload;
    if (!targetName) {
      return [{ target: character.id, type: 'message', payload: { message: "Attack what?" } }];
    }
    if (!character.room) return [];

    const targetMob = await context.prisma.mob.findFirst({
      where: { name: { equals: targetName, mode: 'insensitive' }, roomId: character.room.id }
    });

    if (!targetMob) {
      return [{ target: character.id, type: 'message', payload: { message: "You don't see that here." } }];
    }

    // --- THIS IS THE FIX ---
    // We now pass the full targetMob object as the required fourth argument.
    context.combatManager.queueAction(character, 'attack', targetMob.id, targetMob);

    // Return immediate feedback to the player. The results will arrive in the next tick.
    return [{ target: character.id, type: 'message', payload: { message: `You ready your attack on the ${targetMob.name}...` } }];
  }
}
