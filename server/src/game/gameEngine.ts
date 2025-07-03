// server/src/game/gameEngine.ts
import { PrismaClient } from '@prisma/client';
import type { Character } from '@prisma/client';
import { ICommandHandler, CommandHandlerContext } from './commands/command.interface';
import { CombatManager } from './combat.manager';
import { LootService } from './loot.service';
import { ProgressionService } from './progression.service';
import { AttributeService } from './attribute.service';
import { DeathService } from './services/death.service';
import { gameEventEmitter } from './game.emitter';
import { allRoomTemplates } from '../data';

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
import { CastCommand } from './commands/cast.command';
import { LearnCommand } from './commands/learn.command';
import { SpellsCommand } from './commands/spells.command';

export interface Command { action: string; payload?: any; }
export interface GameEvent { target: string; type: 'gameUpdate' | 'message'; payload: any; }

export class GameEngine {
  private prisma = new PrismaClient();
  private commandRegistry: Map<string, ICommandHandler> = new Map();
  public combatManager: CombatManager;
  private lootService: LootService;
  private progressionService: ProgressionService;
  private attributeService: AttributeService;
  private deathService: DeathService;

  constructor(broadcastCallback: (events: GameEvent[]) => void) {
    this.attributeService = new AttributeService();
    this.deathService = new DeathService(this.prisma, broadcastCallback);
    this.combatManager = new CombatManager(broadcastCallback, this.attributeService, this.deathService);
    
    this.lootService = new LootService(this.prisma, broadcastCallback);
    this.progressionService = new ProgressionService(this.prisma, broadcastCallback);
    this.lootService.listen();
    this.progressionService.listen();

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
    this.commandRegistry.set('cast', new CastCommand());
    this.commandRegistry.set('learn', new LearnCommand());
    this.commandRegistry.set('spells', new SpellsCommand());
  }

  async processCommand(characterId: string, command: Command): Promise<GameEvent[]> {
    const handler = this.commandRegistry.get(command.action.toLowerCase());

    if (handler) {
      const character = await this.prisma.character.findUnique({
        where: { id: characterId },
        include: { 
          room: true, 
          inventory: {
            include: {
              baseItem: true,
              itemAffixes: { include: { affix: true } }
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
        attributeService: this.attributeService,
      };

      return handler.execute(character, command, context);
    }

    return [{ target: characterId, type: 'message', payload: { message: 'Unknown command.' } }];
  }
  
  public async createFullGameUpdateEvent(characterId: string, message: string): Promise<GameEvent> {
    const character = await this.prisma.character.findUnique({ 
        where: { id: characterId }, 
        include: { room: true, inventory: { include: { baseItem: true, itemAffixes: { include: { affix: true } } } } } 
    });
    if (!character || !character.room) throw new Error(`Could not create game update for character ${characterId}.`);
    
    const playersInRoom = await this.getCharactersInRoom(character.currentRoomId, characterId);
    const itemsInRoom = await this.prisma.item.findMany({ 
        where: { roomId: character.currentRoomId }, 
        include: { baseItem: true, itemAffixes: { include: { affix: true } } } 
    });
    const mobsInRoom = await this.prisma.mob.findMany({ where: { roomId: character.currentRoomId }});

    // Convert room templates to the format expected by the client
    const zoneRooms = Object.values(allRoomTemplates).map(roomTemplate => ({
      id: roomTemplate.id,
      name: roomTemplate.name,
      description: roomTemplate.description,
      exits: roomTemplate.exits,
      x: roomTemplate.x,
      y: roomTemplate.y,
      z: roomTemplate.z,
    }));

    return {
      target: characterId, type: 'gameUpdate',
      payload: { message, player: character, room: character.room, players: playersInRoom.map(p => p.name), roomItems: itemsInRoom, inventory: character.inventory, mobs: mobsInRoom, inCombat: this.combatManager.isCharacterInCombat(characterId), zoneRooms },
    };
  }

  public async getCharactersInRoom(roomId: string, excludeCharacterId?: string) {
    return this.prisma.character.findMany({
      where: { currentRoomId: roomId, id: { not: excludeCharacterId } },
      include: { room: true, inventory: { include: { baseItem: true, itemAffixes: { include: { affix: true } } } } },
    });
  }

  public async handleCharacterConnect(characterId: string): Promise<GameEvent[]> {
    let character = await this.prisma.character.findUnique({ 
        where: { id: characterId }, 
        include: { room: true, inventory: { include: { baseItem: true, itemAffixes: { include: { affix: true } } } } } 
    });
    if (!character) throw new Error(`Character ${characterId} not found.`);
    if (!character.room) {
      character = await this.prisma.character.update({ 
          where: { id: characterId }, 
          data: { currentRoomId: 'town-square' },
          include: { room: true, inventory: { include: { baseItem: true, itemAffixes: { include: { affix: true } } } } } 
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
}
