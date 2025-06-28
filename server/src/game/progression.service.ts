// server/src/game/progression.service.ts
import { PrismaClient } from '@prisma/client';
import type { Character } from '@prisma/client';
import { gameEventEmitter, MobDefeatedPayload } from './game.emitter';
import type { GameEvent } from './gameEngine';

export class ProgressionService {
  private prisma: PrismaClient;
  private broadcastCallback: (events: GameEvent[]) => void;

  constructor(prisma: PrismaClient, broadcastCallback: (events: GameEvent[]) => void) {
    this.prisma = prisma;
    this.broadcastCallback = broadcastCallback;
  }

  public listen() {
    gameEventEmitter.on('mobDefeated', this.handleMobDefeated.bind(this));
  }

  private async handleMobDefeated(payload: MobDefeatedPayload) {
    const { mob, killer } = payload;
    const events: GameEvent[] = [];

    const updatedCharacter = await this.prisma.character.update({
      where: { id: killer.id },
      data: {
        experience: { increment: mob.experienceAward },
      },
    });

    events.push({
      target: killer.id,
      type: 'message',
      payload: { message: `You gained ${mob.experienceAward} XP.` },
    });

    const levelUpEvents = await this._handleLevelUpCheck(updatedCharacter);
    events.push(...levelUpEvents);

    if (events.length > 0) {
        this.broadcastCallback(events);
    }
  }

  private async _handleLevelUpCheck(character: Character): Promise<GameEvent[]> {
    const events: GameEvent[] = [];
    let currentCharacterState = character;
    let canLevelUp = currentCharacterState.experience >= currentCharacterState.experienceToNextLevel;

    while (canLevelUp) {
      const leftoverXp = currentCharacterState.experience - currentCharacterState.experienceToNextLevel;
      const newLevel = currentCharacterState.level + 1;
      const newXpToNextLevel = newLevel * 10;
      const newMaxHp = currentCharacterState.maxHp + 5;

      currentCharacterState = await this.prisma.character.update({
        where: { id: character.id },
        data: {
          level: newLevel,
          experience: leftoverXp,
          experienceToNextLevel: newXpToNextLevel,
          unspentStatPoints: { increment: 2 },
          maxHp: newMaxHp,
          hp: newMaxHp,
          mana: currentCharacterState.maxMana,
        },
      });
      
      const levelUpMessage = `***********************************\n* DING! You are now ready for LEVEL ${newLevel}! *\n***********************************\nYour Max HP increases to ${newMaxHp}.\nYou have gained 2 points to assign to your attributes.`;
      events.push({ target: character.id, type: 'message', payload: { message: levelUpMessage }});
      
      canLevelUp = currentCharacterState.experience >= currentCharacterState.experienceToNextLevel;
    }
    return events;
  }
}
