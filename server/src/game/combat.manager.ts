// server/src/game/combat.manager.ts
import { PrismaClient, Hostility } from '@prisma/client';
import type { Character, Mob, Item } from '@prisma/client';
import type { GameEvent } from './gameEngine';

interface QueuedAction { actorId: string; actorType: 'CHARACTER' | 'MOB'; action: 'attack'; targetId: string; }
interface CombatInstance { roomId: string; participantIds: Set<string>; actionQueue: QueuedAction[]; }

type EffectiveStats = {
  name: string;
  hp: number;
  strength: number;
  defense: number;
};

export class CombatManager {
  private prisma: PrismaClient;
  private activeCombats: Map<string, CombatInstance> = new Map();
  private broadcastCallback: (events: GameEvent[]) => void;
  private levelUpChecker: (character: Character) => Promise<GameEvent[]>;

  constructor(
    broadcastCallback: (events: GameEvent[]) => void,
    levelUpChecker: (character: Character) => Promise<GameEvent[]>
  ) {
    this.prisma = new PrismaClient();
    this.broadcastCallback = broadcastCallback;
    this.levelUpChecker = levelUpChecker;
    this.startCombatLoop();
  }

  private startCombatLoop() {
    setInterval(() => { this.resolveAllCombatRounds(); }, 3000);
  }

  // --- NEWLY RE-ADDED METHOD ---
  public async checkForAggression(character: Character, mobsInRoom: Mob[]) {
    const hostileMobs = mobsInRoom.filter(mob => mob.hostility === Hostility.HOSTILE);
    if (hostileMobs.length === 0) return;

    let combat = this.activeCombats.get(character.currentRoomId);
    if (!combat) {
      combat = { roomId: character.currentRoomId, participantIds: new Set(), actionQueue: [] };
      this.activeCombats.set(character.currentRoomId, combat);
    }

    combat.participantIds.add(character.id);
    
    const events: GameEvent[] = [];
    hostileMobs.forEach(mob => {
      combat!.participantIds.add(mob.id);
      // Immediately queue an attack from the mob against the character
      combat!.actionQueue.push({ actorId: mob.id, actorType: 'MOB', action: 'attack', targetId: character.id });
      events.push({ target: 'room', type: 'message', payload: { roomId: character.currentRoomId, message: `The ${mob.name} becomes aggressive!`, exclude: [] }});
    });

    if (events.length > 0) {
      this.broadcastCallback(events);
    }
  }

  public queueAction(actor: Character, action: 'attack', targetId: string, target: Mob) {
    let combat = this.activeCombats.get(actor.currentRoomId);
    if (!combat) {
      combat = { roomId: actor.currentRoomId, participantIds: new Set(), actionQueue: [] };
      this.activeCombats.set(actor.currentRoomId, combat);
    }

    combat.participantIds.add(actor.id);
    combat.participantIds.add(target.id);
    
    combat.actionQueue.push({ actorId: actor.id, actorType: 'CHARACTER', action, targetId });
  }

  public removeCharacterFromCombat(characterId: string) {
    for (const combat of this.activeCombats.values()) {
      if (combat.participantIds.has(characterId)) {
        combat.participantIds.delete(characterId);
      }
    }
  }

  private _getEffectiveStats(participant: Character & { inventory: Item[] } | Mob): EffectiveStats {
    let effectiveStats: EffectiveStats = {
      name: participant.name,
      hp: participant.hp,
      strength: participant.strength,
      defense: participant.defense,
    };

    if ('inventory' in participant && Array.isArray(participant.inventory)) {
      participant.inventory.forEach(item => {
        if (item.equipped && typeof item.attributes === 'object' && item.attributes !== null) {
          const attributes = item.attributes as Record<string, number>;
          effectiveStats.strength += attributes.damage || 0;
          effectiveStats.defense += attributes.armor || 0;
        }
      });
    }

    return effectiveStats;
  }

  private async resolveAllCombatRounds() {
    if (this.activeCombats.size === 0) return;

    const allEvents: GameEvent[] = [];

    for (const [roomId, combat] of this.activeCombats.entries()) {
      const participantIds = Array.from(combat.participantIds);
      if (participantIds.length === 0) {
        this.activeCombats.delete(roomId);
        continue;
      }

      const charactersInCombat = await this.prisma.character.findMany({ where: { id: { in: participantIds } }, include: { inventory: true } });
      const mobsInCombat = await this.prisma.mob.findMany({ where: { id: { in: participantIds } } });
      const participants = new Map<string, (Character & { inventory: Item[] }) | Mob>(
        [...charactersInCombat, ...mobsInCombat].map(p => [p.id, { ...p }])
      );
      
      const { actionQueue } = combat;

      mobsInCombat.forEach(mob => {
        if (mob.hp > 0) {
          const livingCharacters = charactersInCombat.filter(c => c.hp > 0);
          if (livingCharacters.length > 0) {
            const alreadyActed = actionQueue.some(action => action.actorId === mob.id);
            if (!alreadyActed) {
              const randomTarget = livingCharacters[Math.floor(Math.random() * livingCharacters.length)];
              actionQueue.push({ actorId: mob.id, actorType: 'MOB', action: 'attack', targetId: randomTarget.id });
            }
          }
        }
      });
      
      const defeatedMobIds = new Set<string>();

      for (const queuedAction of actionQueue) {
        const actorData = participants.get(queuedAction.actorId);
        const targetData = participants.get(queuedAction.targetId);

        if (actorData && targetData && targetData.hp > 0 && actorData.hp > 0) {
          const actor = this._getEffectiveStats(actorData);
          const target = this._getEffectiveStats(targetData);
          
          const damage = Math.max(1, actor.strength - target.defense);
          targetData.hp -= damage;
          allEvents.push({ target: 'room', type: 'message', payload: { roomId, message: `${actor.name} hits ${target.name} for ${damage} damage!`, exclude: [] }});

          if (targetData.hp <= 0) {
            targetData.hp = 0;
            if ('experienceAward' in targetData) {
              defeatedMobIds.add(targetData.id);
              combat.participantIds.delete(targetData.id);
              allEvents.push({ target: 'room', type: 'message', payload: { roomId, message: `The ${targetData.name} has been defeated!`, exclude: [] }});
              
              if ('experienceToNextLevel' in actorData) {
                const xpMessage = `You gained ${targetData.experienceAward} XP and ${targetData.goldAward} gold.`;
                allEvents.push({ target: actorData.id, type: 'message', payload: { message: xpMessage }});
                actorData.experience += targetData.experienceAward;
                actorData.gold += targetData.goldAward;
              }
            } else {
              allEvents.push({ target: 'room', type: 'message', payload: { roomId, message: `${targetData.name} has been defeated!`, exclude: [] }});
              targetData.hp = targetData.maxHp;
            }
          }
        }
      }
      combat.actionQueue = [];

      for (const id of combat.participantIds) {
        const p = participants.get(id);
        if (p) {
          if ('experienceAward' in p) {
            if (!defeatedMobIds.has(p.id)) {
              await this.prisma.mob.update({ where: { id: p.id }, data: { hp: p.hp } });
            }
          } else {
            await this.prisma.character.update({ where: { id: p.id }, data: { hp: p.hp, experience: p.experience, gold: p.gold } });
          }
        }
      }

      if (defeatedMobIds.size > 0) {
        await this.prisma.mob.deleteMany({ where: { id: { in: Array.from(defeatedMobIds) } } });
      }

      const survivingCharacters = Array.from(participants.values()).filter(p => !('experienceAward' in p) && p.hp > 0) as Character[];
      for (const char of survivingCharacters) {
        const charWithXp = participants.get(char.id) as Character;
        const levelUpEvents = await this.levelUpChecker(charWithXp);
        allEvents.push(...levelUpEvents);
      }
      
      const finalCharacterStates = await this.prisma.character.findMany({ where: { id: { in: participantIds } }, include: { room: true, inventory: true } });
      for (const char of finalCharacterStates) {
          if (char.hp > 0) {
              const playersInRoom = finalCharacterStates.filter(p => p.id !== char.id);
              const itemsInRoom = await this.prisma.item.findMany({ where: { roomId } });
              const mobsInRoom = await this.prisma.mob.findMany({ where: { roomId } });

              allEvents.push({
                  target: char.id, type: 'gameUpdate',
                  payload: { message: ``, player: char, room: char.room, players: playersInRoom.map(p => p.name), roomItems: itemsInRoom, inventory: char.inventory, mobs: mobsInRoom }
              });
          }
      }

      const mobsLeft = (await this.prisma.mob.count({ where: { roomId } })) > 0;
      const charactersLeft = finalCharacterStates.some(c => c.hp > 0);

      if (!mobsLeft || !charactersLeft) {
        this.activeCombats.delete(roomId);
        console.log(`[Combat Manager] Combat ended in room ${roomId}.`);
      }
    }

    if (allEvents.length > 0) {
      this.broadcastCallback(allEvents);
    }
  }
}
