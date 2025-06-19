// server/src/game/gameEngine.ts
import { PrismaClient } from '@prisma/client';
import type { Character } from '@prisma/client';
import { ICommandHandler, CommandHandlerContext } from './commands/command.interface';
import { CombatManager } from './combat.manager';

// --- Import all command handlers ---
import { LookCommand } from './commands/look.command';
import { MoveCommand } from './commands/move.command';
import { SayCommand } from './commands/say.command';
import { InventoryCommand } from './commands/inventory.command';
import { GetCommand } from './commands/get.command';
import { DropCommand } from './commands/drop.command';
import { ExamineCommand } from './commands/examine.command';
import { AttackCommand } from './commands/attack.command';
import { AssignStatsCommand } from './commands/assignStats.command';
import { EquipCommand } from './commands/equip.command';
import { UnequipCommand } from './commands/unequip.command';

export interface Command { action: string; payload?: any; }
export interface GameEvent { target: string; type: 'gameUpdate' | 'message'; payload: any; }

export class GameEngine {
  private prisma = new PrismaClient();
  private commandRegistry: Map<string, ICommandHandler> = new Map();
  public combatManager: CombatManager;

  constructor(broadcastCallback: (events: GameEvent[]) => void) {
    this.combatManager = new CombatManager(
      broadcastCallback,
      this._handleLevelUpCheck.bind(this)
    );
    this.registerCommands();
  }

  private registerCommands() {
    this.commandRegistry.set('look', new LookCommand());
    this.commandRegistry.set('move', new MoveCommand());
    this.commandRegistry.set('say', new SayCommand());
    this.commandRegistry.set('inventory', new InventoryCommand());
    this.commandRegistry.set('i', new InventoryCommand());
    this.commandRegistry.set('get', new GetCommand());
    this.commandRegistry.set('drop', new DropCommand());
    this.commandRegistry.set('examine', new ExamineCommand());
    this.commandRegistry.set('attack', new AttackCommand());
    this.commandRegistry.set('assignStats', new AssignStatsCommand());
    this.commandRegistry.set('equip', new EquipCommand());
    this.commandRegistry.set('unequip', new UnequipCommand());
  }

  async processCommand(characterId: string, command: Command): Promise<GameEvent[]> {
    const handler = this.commandRegistry.get(command.action.toLowerCase());

    if (handler) {
      // THIS IS THE CORRECTED QUERY that fetches nested item data
      const character = await this.prisma.character.findUnique({
        where: { id: characterId },
        include: { 
          room: true, 
          inventory: {
            include: {
              template: true
            }
          } 
        },
      });
      if (!character) return [];

      const context: CommandHandlerContext = {
        prisma: this.prisma,
        combatManager: this.combatManager,
        getCharactersInRoom: this.getCharactersInRoom.bind(this),
        createFullGameUpdateEvent: this.createFullGameUpdateEvent.bind(this),
      };

      return handler.execute(character, command, context);
    }

    return [{ target: characterId, type: 'message', payload: { message: 'Unknown command.' } }];
  }
  
  public async createFullGameUpdateEvent(characterId: string, message: string): Promise<GameEvent> {
    const character = await this.prisma.character.findUnique({ 
        where: { id: characterId }, 
        include: { room: true, inventory: { include: { template: true } } } 
    });
    if (!character || !character.room) throw new Error(`Could not create game update for character ${characterId}.`);
    
    const playersInRoom = await this.getCharactersInRoom(character.currentRoomId, characterId);
    const itemsInRoom = await this.prisma.item.findMany({ where: { roomId: character.currentRoomId }, include: { template: true } });
    const mobsInRoom = await this.prisma.mob.findMany({ where: { roomId: character.currentRoomId }});
    const allRoomsInZone = await this.prisma.room.findMany({ where: { z: character.room.z }}); // For now, a "zone" is one z-level


    return {
      target: characterId, type: 'gameUpdate',
      payload: { 
        message, 
        player: character, 
        room: character.room, 
        players: playersInRoom.map(p => p.name), 
        roomItems: itemsInRoom, 
        inventory: character.inventory, 
        mobs: mobsInRoom,
        zoneRooms: allRoomsInZone,
        inCombat: this.combatManager.isCharacterInCombat(characterId) 
      },    };
  }

  public async getCharactersInRoom(roomId: string, excludeCharacterId?: string) {
    return this.prisma.character.findMany({
      where: { currentRoomId: roomId, id: { not: excludeCharacterId } },
      include: { room: true, inventory: { include: { template: true } } },
    });
  }

  public async handleCharacterConnect(characterId: string): Promise<GameEvent[]> {
    let character = await this.prisma.character.findUnique({ 
        where: { id: characterId }, 
        include: { room: true, inventory: { include: { template: true } } } 
    });
    if (!character) throw new Error(`Character ${characterId} not found.`);
    if (!character.room) {
      character = await this.prisma.character.update({ 
          where: { id: characterId }, 
          data: { currentRoomId: 'room-1' }, 
          include: { room: true, inventory: { include: { template: true } } } 
      });
      if (!character.room) throw new Error(`CRITICAL: Starting room not found.`);
    }
    const mobsInRoom = await this.prisma.mob.findMany({ where: { roomId: character.currentRoomId }});
    await this.combatManager.checkForAggression(character, mobsInRoom);
    
    const event = await this.createFullGameUpdateEvent(characterId, `Welcome back, ${character.name}!`);
    const arrivalAnnouncement: GameEvent = { target: 'room', type: 'message', payload: { message: `${character.name} has connected.`, roomId: character.room.id, exclude: [characterId] } };
    return [arrivalAnnouncement, event];
  }

  public async handleCharacterDisconnect(characterId: string): Promise<GameEvent | null> {
    const character = await this.prisma.character.findUnique({ where: { id: characterId } });
    if (!character) return null;
    this.combatManager.removeCharacterFromCombat(character.id);
    return { target: 'room', type: 'message', payload: { message: `${character.name} has disconnected.`, roomId: character.currentRoomId, exclude: [] } };
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
