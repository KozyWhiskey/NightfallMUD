// server/src/game/combat.manager.ts
import { PrismaClient, Hostility } from '@prisma/client';
import type { Character, Mob, Item } from '@prisma/client';
import type { GameEvent } from './gameEngine';
import { LootService } from './loot.service';

interface QueuedAction { actorId: string; actorType: 'CHARACTER' | 'MOB'; action: 'attack'; targetId: string; }
interface CombatInstance {
  roomId: string;
  participantIds: Set<string>;
  actionQueue: QueuedAction[];
  mobTargets: Map<string, string>; // Maps mobId to characterId
}

type EffectiveStats = {
  name: string;
  hp: number;
  strength: number;
  defense: number;
};

// A more specific Character type that includes the inventory relation
type CharacterWithInventory = Character & {
  inventory: (Item & {
    template: {
      attributes: any;
    }
  })[]
};

export class CombatManager {
  private prisma: PrismaClient;
  private lootService: LootService;
  private activeCombats: Map<string, CombatInstance> = new Map();
  private broadcastCallback: (events: GameEvent[]) => void;
  private levelUpChecker: (character: Character) => Promise<GameEvent[]>;

  constructor(
    broadcastCallback: (events: GameEvent[]) => void,
    levelUpChecker: (character: Character) => Promise<GameEvent[]>
  ) {
    this.prisma = new PrismaClient();
    this.lootService = new LootService(this.prisma);
    this.broadcastCallback = broadcastCallback;
    this.levelUpChecker = levelUpChecker;
    this.startCombatLoop();
  }

  private startCombatLoop() {
    setInterval(() => { this.resolveAllCombatRounds(); }, 3000);
  }

  public async checkForAggression(character: Character, mobsInRoom: Mob[]) {
    const hostileMobs = mobsInRoom.filter(mob => mob.hostility === Hostility.HOSTILE && mob.hp > 0);
    if (hostileMobs.length === 0) return;

    let combat = this.activeCombats.get(character.currentRoomId);
    if (!combat) {
      combat = { roomId: character.currentRoomId, participantIds: new Set(), actionQueue: [], mobTargets: new Map() };
      this.activeCombats.set(character.currentRoomId, combat);
    }

    combat.participantIds.add(character.id);
    const events: GameEvent[] = [];
    hostileMobs.forEach(mob => {
      combat!.participantIds.add(mob.id);
      combat!.mobTargets.set(mob.id, character.id);
      events.push({ target: 'room', type: 'message', payload: { roomId: character.currentRoomId, message: `The ${mob.name} becomes aggressive!`, exclude: [] }});
    });
    if (events.length > 0) {
      this.broadcastCallback(events);
    }
  }

  public queueAction(actor: Character, action: 'attack', targetId: string, target: Mob) {
    let combat = this.activeCombats.get(actor.currentRoomId);
    if (!combat) {
      combat = { roomId: actor.currentRoomId, participantIds: new Set(), actionQueue: [], mobTargets: new Map() };
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

  public isCharacterInCombat(characterId: string): boolean {
    for (const combat of this.activeCombats.values()) {
      if (combat.participantIds.has(characterId)) {
        return true;
      }
    }
    return false;
  }

  private _getEffectiveStats(participant: CharacterWithInventory | Mob): EffectiveStats {
    let effectiveStats: EffectiveStats = { name: participant.name, hp: participant.hp, strength: participant.strength, defense: participant.defense, };
    if ('inventory' in participant && Array.isArray(participant.inventory)) {
      participant.inventory.forEach(item => {
        if (item.equipped && item.template && typeof item.template.attributes === 'object' && item.template.attributes !== null) {
          const attributes = item.template.attributes as Record<string, number>;
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
      if (participantIds.length === 0) { this.activeCombats.delete(roomId); continue; }

      const charactersInCombat = await this.prisma.character.findMany({ 
        where: { id: { in: participantIds } }, 
        include: { inventory: { include: { template: true } } }
      });
      const mobsInCombat = await this.prisma.mob.findMany({ where: { id: { in: participantIds } } });
      const participants = new Map<string, CharacterWithInventory | Mob>([...charactersInCombat, ...mobsInCombat].map(p => [p.id, { ...p }]));
      
      const { actionQueue, mobTargets } = combat;

      mobsInCombat.forEach(mob => {
        if (mob.hp > 0) {
          const livingCharacters = charactersInCombat.filter(c => c.hp > 0);
          if (livingCharacters.length > 0) {
            const currentTargetId = mobTargets.get(mob.id);
            const currentTarget = participants.get(currentTargetId || '');
            if (!currentTarget || currentTarget.hp <= 0) {
              const newTarget = livingCharacters[Math.floor(Math.random() * livingCharacters.length)];
              mobTargets.set(mob.id, newTarget.id);
              actionQueue.push({ actorId: mob.id, actorType: 'MOB', action: 'attack', targetId: newTarget.id });
            } else {
              actionQueue.push({ actorId: mob.id, actorType: 'MOB', action: 'attack', targetId: currentTargetId! });
            }
          }
        }
      });
      
      const defeatedMobIds = new Set<string>();

      for (const queuedAction of actionQueue) {
        const actorData = participants.get(queuedAction.actorId);
        const targetData = participants.get(queuedAction.targetId);
        if (actorData && targetData && targetData.hp > 0 && actorData.hp > 0) {
          const actor = this._getEffectiveStats(actorData as CharacterWithInventory | Mob);
          const target = this._getEffectiveStats(targetData as CharacterWithInventory | Mob);
          
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
                const loot = await this.lootService.generateLootForMob(targetData);
                await this.lootService.placeLootInRoom(roomId, loot);
                if (loot.length > 0) {
                  allEvents.push({ target: 'room', type: 'message', payload: { roomId, message: `The ${targetData.name} drops some loot!`, exclude: [] }});
                }
                const goldDropped = this.lootService.calculateGoldDrop(targetData);
                let rewardsMessage = `You gained ${targetData.experienceAward} XP`;
                if (goldDropped > 0) {
                    rewardsMessage += ` and ${goldDropped} gold`;
                }
                rewardsMessage += `.`;
                allEvents.push({ target: actorData.id, type: 'message', payload: { message: rewardsMessage }});
                actorData.experience += targetData.experienceAward;
                actorData.gold += goldDropped;
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
            if (!defeatedMobIds.has(p.id)) { await this.prisma.mob.update({ where: { id: p.id }, data: { hp: p.hp } }); }
          } else {
            await this.prisma.character.update({ where: { id: p.id }, data: { hp: p.hp, experience: p.experience, gold: p.gold } });
          }
        }
      }
      if (defeatedMobIds.size > 0) { await this.prisma.mob.deleteMany({ where: { id: { in: Array.from(defeatedMobIds) } } }); }
      
      const survivingCharacters = Array.from(participants.values()).filter(p => !('experienceAward' in p) && p.hp > 0) as CharacterWithInventory[];
      for (const char of survivingCharacters) {
        const charWithXp = participants.get(char.id) as CharacterWithInventory;
        if(charWithXp){
          const levelUpEvents = await this.levelUpChecker(charWithXp);
          allEvents.push(...levelUpEvents);
        }
      }
      
      const finalCharacterStates = await this.prisma.character.findMany({ where: { id: { in: Array.from(combat.participantIds) } }, include: { room: true, inventory: { include: { template: true } } } });
      const finalMobsInRoom = await this.prisma.mob.findMany({ where: { roomId } });
      
      for (const char of finalCharacterStates) {
          if (char.hp > 0) {
              const mobsWithTargets = finalMobsInRoom.map(mob => ({...mob, targetId: mobTargets.get(mob.id) || null }));
              const playersInRoom = finalCharacterStates.filter(p => p.id !== char.id);
              const itemsInRoom = await this.prisma.item.findMany({ where: { roomId }, include: { template: true }});
              allEvents.push({
                  target: char.id, type: 'gameUpdate',
                  payload: { message: ``, player: char, room: char.room, players: playersInRoom.map(p => p.name), roomItems: itemsInRoom, inventory: char.inventory, mobs: mobsWithTargets, inCombat: true }
              });
          }
      }
      const mobsLeft = finalMobsInRoom.length > 0;
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
