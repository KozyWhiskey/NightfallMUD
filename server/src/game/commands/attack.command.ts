// server/src/game/commands/attack.command.ts
import { Prisma } from '@prisma/client';
import type { ICommandHandler, CommandHandlerContext, CharacterWithRelations } from './command.interface';
import type { Command, GameEvent } from '../gameEngine';

export class AttackCommand implements ICommandHandler {

  public async execute(character: CharacterWithRelations, command: Command, context: CommandHandlerContext): Promise<GameEvent[]> {
    const targetKeyword = command.payload.toLowerCase();
    if (!targetKeyword) {
      return [{ target: character.id, type: 'message', payload: { message: "Attack what?" } }];
    }
    if (!character.room) return [];

    console.log(`[DEBUG] Attack command initiated.`);
    console.log(`[DEBUG] Character '${character.name}' in room '${character.room.id}' is searching for keyword: '${targetKeyword}'`);

    // --- ENHANCED DEBUGGING ---
    // 1. Get all mobs that are currently in the same room as the character.
    const mobsInRoom = await context.prisma.mob.findMany({
      where: { roomId: character.room.id }
    });

    // 2. Log the entire array of mobs we found to inspect their data structure.
    console.log(`[DEBUG] Mobs found in room:`, JSON.stringify(mobsInRoom, null, 2));

    // 3. Find the first mob whose keywords array includes the user's target.
    const targetMob = mobsInRoom.find(mob => {
      const match = mob.keywords.some(keyword => {
        const isMatch = keyword.toLowerCase() === targetKeyword;
        // 4. Log each individual keyword comparison to see exactly what is being checked.
        console.log(`[DEBUG] Comparing: (DB) '${keyword.toLowerCase()}' === (Input) '${targetKeyword}' -> ${isMatch}`);
        return isMatch;
      });
      return match;
    });

    console.log(`[DEBUG] After searching mobs in room, found target:`, targetMob ? targetMob.name : null);


    if (!targetMob) {
      return [{ target: character.id, type: 'message', payload: { message: "You don't see that here." } }];
    }

    if (targetMob.hostility === 'FRIENDLY') {
      return [{ target: character.id, type: 'message', payload: { message: `You can't attack the friendly ${targetMob.name}.` } }];
    }

    context.combatManager.queueAction(character, 'attack', targetMob.id, targetMob);

    return [{ target: character.id, type: 'message', payload: { message: `You ready your attack on the ${targetMob.name}...` } }];
  }
}
