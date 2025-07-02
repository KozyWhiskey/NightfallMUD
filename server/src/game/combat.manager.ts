// server/src/game/combat.manager.ts
import { PrismaClient, Hostility } from '@prisma/client';
import type { Character, Mob, Item } from '@prisma/client';
import { gameEventEmitter, MobDefeatedPayload } from './game.emitter';
import type { GameEvent } from './gameEngine';
import { AttributeService } from './attribute.service';
import type { CharacterWithRelations } from './commands/command.interface';
import { DeathService } from './services/death.service';
import { allRoomTemplates } from '../data';
import { gameEngine } from '../services/game.service';

interface QueuedAction { actorId: string; actorType: 'CHARACTER' | 'MOB'; action: 'attack'; targetId: string; }
interface CombatInstance {
  roomId: string;
  participantIds: Set<string>;
  actionQueue: QueuedAction[];
  mobTargets: Map<string, string>;
}

export class CombatManager {
  private prisma: PrismaClient;
  private activeCombats: Map<string, CombatInstance> = new Map();
  private broadcastCallback: (events: GameEvent[]) => void;
  private attributeService: AttributeService;
  private deathService: DeathService;

  constructor(
    broadcastCallback: (events: GameEvent[]) => void,
    attributeService: AttributeService,
    deathService: DeathService
  ) {
    this.prisma = new PrismaClient();
    this.broadcastCallback = broadcastCallback;
    this.attributeService = attributeService;
    this.deathService = deathService;
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

  private async resolveAllCombatRounds() {
    if (this.activeCombats.size === 0) return;
    const allEvents: GameEvent[] = [];

    for (const [roomId, combat] of this.activeCombats.entries()) {
      const participantIds = Array.from(combat.participantIds);
      if (participantIds.length === 0) { this.activeCombats.delete(roomId); continue; }

      const charactersInCombat = await this.prisma.character.findMany({ where: { id: { in: participantIds } }, include: { inventory: { include: { baseItem: true, itemAffixes: { include: { affix: true } } } }, room: true } });
      const mobsInCombat = await this.prisma.mob.findMany({ where: { id: { in: participantIds } } });
      
      const participants = new Map<string, CharacterWithRelations | Mob>();
      charactersInCombat.forEach(c => participants.set(c.id, c));
      mobsInCombat.forEach(m => participants.set(m.id, m));
      
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
          const actor = this.attributeService.getEffectiveStats(actorData as CharacterWithRelations | Mob);
          const target = this.attributeService.getEffectiveStats(targetData as CharacterWithRelations | Mob);
          
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
                const payload: MobDefeatedPayload = { mob: targetData, killer: actorData as CharacterWithRelations, roomId };
                gameEventEmitter.emit('mobDefeated', payload);
              }
            } else {
              allEvents.push({ target: 'room', type: 'message', payload: { roomId, message: `${targetData.name} has been defeated!`, exclude: [] }});
              this.deathService.handlePlayerDeath(targetData as CharacterWithRelations);
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
            await this.prisma.character.update({ where: { id: p.id }, data: { hp: p.hp } });
          }
        }
      }
      if (defeatedMobIds.size > 0) { await this.prisma.mob.deleteMany({ where: { id: { in: Array.from(defeatedMobIds) } } }); }
      
      const finalCharacterStates = await this.prisma.character.findMany({ where: { id: { in: Array.from(combat.participantIds) } }, include: { room: true, inventory: { include: { baseItem: true, itemAffixes: { include: { affix: true } } } } } });
      const finalMobsInRoom = await this.prisma.mob.findMany({ where: { roomId } });
      
      for (const char of finalCharacterStates) {
          if (char.hp > 0) {
              const mobsWithTargets = finalMobsInRoom.map(mob => ({...mob, targetId: mobTargets.get(mob.id) || null }));
              const playersInRoom = finalCharacterStates.filter(p => p.id !== char.id);
              const itemsInRoom = await this.prisma.item.findMany({ where: { roomId }, include: { baseItem: true, itemAffixes: { include: { affix: true } } }});
              allEvents.push({
                  target: char.id, type: 'gameUpdate',
                  payload: { 
                    message: ``, 
                    player: char, 
                    room: char.room, 
                    players: playersInRoom.map(p => p.name), 
                    roomItems: itemsInRoom, 
                    inventory: char.inventory, 
                    mobs: mobsWithTargets, 
                    inCombat: true,
                    zoneRooms: Object.values(allRoomTemplates).map(roomTemplate => ({
                      id: roomTemplate.id,
                      name: roomTemplate.name,
                      description: roomTemplate.description,
                      exits: roomTemplate.exits,
                      x: roomTemplate.x,
                      y: roomTemplate.y,
                      z: roomTemplate.z,
                    }))
                  }
              });
          }
      }
      const mobsLeft = finalMobsInRoom.length > 0;
      const charactersLeft = finalCharacterStates.some(c => c.hp > 0);
      if (!mobsLeft || !charactersLeft) {
        this.activeCombats.delete(roomId);
        // Send inCombat: false game update to all characters who were in the room
        const allRoomCharacters = await gameEngine.getCharactersInRoom(roomId);
        for (const char of allRoomCharacters) {
          const gameUpdate = await gameEngine.createFullGameUpdateEvent(char.id, 'Combat has ended.');
          // Force inCombat: false in the payload
          gameUpdate.payload.inCombat = false;
          allEvents.push(gameUpdate);
        }
      }
    }
    if (allEvents.length > 0) {
      this.broadcastCallback(allEvents);
    }
  }
}
