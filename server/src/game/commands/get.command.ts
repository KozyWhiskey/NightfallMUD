// server/src/game/commands/get.command.ts
import type { ICommandHandler, CommandHandlerContext, CharacterWithRelations } from './command.interface';
import type { Command, GameEvent } from '../gameEngine';

export class GetCommand implements ICommandHandler {
  public async execute(character: CharacterWithRelations, command: Command, context: CommandHandlerContext): Promise<GameEvent[]> {
    const events: GameEvent[] = [];
    const itemName = command.payload;
    
    if (!character.room) return [];

    // --- THIS IS THE FIX ---
    // We now query based on the related template's name.
    const item = await context.prisma.item.findFirst({
      where: {
        roomId: character.room.id,
        template: {
          name: { equals: itemName, mode: 'insensitive' }
        }
      },
      include: {
        template: true // Ensure the template data is included in the result
      }
    });

    if (item) {
      await context.prisma.item.update({
        where: { id: item.id },
        data: { roomId: null, characterId: character.id }
      });

      // We now access the name via item.template.name
      events.push(await context.createFullGameUpdateEvent(character.id, `You take the ${item.template.name}.`));
      events.push({
        target: 'room',
        type: 'message',
        payload: { roomId: character.room.id, message: `${character.name} takes the ${item.template.name}.`, exclude: [character.id] }
      });
    } else {
      events.push({ target: character.id, type: 'message', payload: { message: "You don't see that here." }});
    }

    return events;
  }
}
