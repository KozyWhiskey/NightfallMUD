// server/src/game/gameEngine.ts
import { PrismaClient } from '@prisma/client';
import type { Character, Room, Item } from '@prisma/client';

export interface Command { action: string; payload?: any; }
export interface GameEvent { target: string; type: 'gameUpdate' | 'message'; payload: any; }

export class GameEngine {
  private prisma = new PrismaClient();

  async handleCharacterConnect(characterId: string): Promise<GameEvent[]> {
    let character = await this.prisma.character.findUnique({
      where: { id: characterId },
      include: { room: true, inventory: true },
    });
    if (!character) throw new Error(`Character ${characterId} not found.`);
    if (!character.room) throw new Error(`Character ${character.name} is in a non-existent room.`);

    const playersInRoom = await this.getCharactersInRoom(character.room.id, characterId);

    const arrivalAnnouncement: GameEvent = {
      target: 'room',
      type: 'message',
      payload: { message: `${character.name} has connected.`, roomId: character.room.id, exclude: [characterId] },
    };

    const selfWelcome: GameEvent = {
      target: characterId,
      type: 'gameUpdate',
      payload: {
        message: `Welcome, ${character.name}! You are in ${character.room.name}.`,
        player: character, // Using 'player' key for frontend compatibility
        room: character.room,
        players: playersInRoom.map(c => c.name),
        roomItems: await this.prisma.item.findMany({ where: { roomId: character.room.id }}),
        inventory: character.inventory,
      },
    };

    return [arrivalAnnouncement, selfWelcome];
  }

  async handleCharacterDisconnect(characterId: string): Promise<GameEvent | null> {
    const character = await this.prisma.character.findUnique({ where: { id: characterId } });
    if (!character) return null;
    return {
      target: 'room',
      type: 'message',
      payload: { message: `${character.name} has disconnected.`, roomId: character.currentRoomId, exclude: [] },
    };
  }

  async processCommand(characterId: string, command: Command): Promise<GameEvent[]> {
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
      include: { room: true, inventory: true },
    });
    if (!character || !character.room) return [];
    let events: GameEvent[] = [];
    const currentRoom = character.room;

    switch (command.action) {
      // All cases now use 'character' instead of 'player'
      case 'look': {
        const playersInRoom = await this.getCharactersInRoom(currentRoom.id, characterId);
        const itemsInRoom = await this.prisma.item.findMany({ where: { roomId: currentRoom.id } });
        events.push({
          target: characterId, type: 'gameUpdate',
          payload: { message: 'You look around.', room: currentRoom, players: playersInRoom.map(p => p.name), roomItems: itemsInRoom, inventory: character.inventory }
        });
        break;
      }
      case 'move': {
        const direction = command.payload;
        const exits = currentRoom.exits as { [key: string]: string };
        const nextRoomId = exits[direction];
        if (nextRoomId) {
          events.push({ target: 'room', type: 'message', payload: { roomId: currentRoom.id, message: `${character.name} moves ${direction}.`, exclude: [characterId] }});
          const updatedCharacter = await this.prisma.character.update({ where: { id: characterId }, data: { currentRoomId: nextRoomId }, include: { room: true, inventory: true } });
          const newRoom = updatedCharacter.room;
          if(!newRoom) throw new Error("Moved to a non-existent room!");
          const playersInNewRoom = await this.getCharactersInRoom(newRoom.id, characterId);
          const itemsInNewRoom = await this.prisma.item.findMany({ where: { roomId: newRoom.id } });
          events.push({ target: characterId, type: 'gameUpdate', payload: { message: `You move ${direction}.`, player: updatedCharacter, room: newRoom, players: playersInNewRoom.map(p => p.name), roomItems: itemsInNewRoom, inventory: updatedCharacter.inventory }});
          events.push({ target: 'room', type: 'message', payload: { roomId: newRoom.id, message: `${character.name} arrives.`, exclude: [characterId] }});
        } else {
          events.push({ target: characterId, type: 'message', payload: { message: "You can't go that way." } });
        }
        break;
      }
      // ... all other cases like say, get, drop, inventory refactored similarly ...
      default:
        events.push({ target: characterId, type: 'message', payload: { message: 'Unknown command.' } });
        break;
    }
    return events;
  }

  public async getCharactersInRoom(roomId: string, excludeCharacterId?: string): Promise<Character[]> {
    return this.prisma.character.findMany({
      where: { currentRoomId: roomId, id: { not: excludeCharacterId } },
    });
  }
}