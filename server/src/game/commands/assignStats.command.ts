// server/src/game/commands/assignStats.command.ts
import type { ICommandHandler, CommandHandlerContext, CharacterWithRelations } from './command.interface';
import type { Command, GameEvent } from '../gameEngine';




export class AssignStatsCommand implements ICommandHandler {
  // Use the new, more specific type for the 'character' parameter
  public async execute(character: CharacterWithRelations, command: Command, context: CommandHandlerContext): Promise<GameEvent[]> {
    const events: GameEvent[] = [];
    const pointsToAssign = command.payload;

    if (typeof pointsToAssign !== 'object' || pointsToAssign === null) {
      events.push({ target: character.id, type: 'message', payload: { message: "Invalid stat assignment format." } });
      return events;
    }

    const totalPointsSpent = Object.values(pointsToAssign).reduce(
      (sum: number, val: unknown) => sum + (typeof val === 'number' ? val : 0),
      0
    );

    if (totalPointsSpent <= 0) {
      events.push({ target: character.id, type: 'message', payload: { message: "No points assigned." } });
      return events;
    }
    if (character.unspentStatPoints < totalPointsSpent) {
      events.push({ target: character.id, type: 'message', payload: { message: "You don't have enough stat points." } });
      return events;
    }

    const statsUpdateData: { [key: string]: { increment: number } } = {};
    for (const stat in pointsToAssign) {
      if (['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].includes(stat)) {
        statsUpdateData[stat] = { increment: pointsToAssign[stat] };
      }
    }

    await context.prisma.character.update({
      where: { id: character.id },
      data: {
        ...statsUpdateData,
        unspentStatPoints: { decrement: totalPointsSpent },
      },
    });

    events.push(await context.createFullGameUpdateEvent(character.id, 'You have grown stronger!'));
    return events;
  }
}
