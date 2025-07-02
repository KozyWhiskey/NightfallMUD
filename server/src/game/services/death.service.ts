import { PrismaClient } from '@prisma/client';
import type { Character } from '@prisma/client';
import type { GameEvent } from '../gameEngine';

export class DeathService {
  private prisma: PrismaClient;
  private broadcastCallback: (events: GameEvent[]) => void;

  constructor(prisma: PrismaClient, broadcastCallback: (events: GameEvent[]) => void) {
    this.prisma = prisma;
    this.broadcastCallback = broadcastCallback;
  }

  public async handlePlayerDeath(player: Character): Promise<void> {
    const events: GameEvent[] = [];

    const experienceLoss = this.calculateExperienceLoss(player);

    const updatedCharacter = await this.prisma.character.update({
      where: { id: player.id },
      data: {
        experience: { decrement: experienceLoss },
        hp: player.maxHp,
        currentRoomId: 'town-square',
      },
    });

    events.push({
      target: player.id,
      type: 'message',
      payload: { message: `You have died and lost ${experienceLoss} XP.` },
    });

    events.push({
        target: player.id,
        type: 'message',
        payload: { message: 'You have been resurrected in the town square.' },
    });

    if (events.length > 0) {
        this.broadcastCallback(events);
    }
  }

  private calculateExperienceLoss(player: Character): number {
    return Math.floor(player.experienceToNextLevel * 0.1);
  }
}
