// server/src/game/gameEngine.ts

import { PrismaClient } from '@prisma/client';
import type { Character, Room, Item } from '@prisma/client';

export interface Command { action: string; payload?: any; }
export interface GameEvent { target: string; type: 'gameUpdate' | 'message'; payload: any; }

export class GameEngine {
  private prisma = new PrismaClient();
  private startingRoomId = 'room-1';

  // --- Main Public Methods ---

  async handleCharacterConnect(characterId: string): Promise<GameEvent[]> {
    // This function will now use our new helper
    const event = await this._createFullGameUpdateEvent(characterId, `Welcome back!`);
    
    const arrivalAnnouncement: GameEvent = {
      target: 'room',
      type: 'message',
      payload: { message: `${event.payload.player.username} has connected.`, roomId: event.payload.room.id, exclude: [characterId] },
    };

    return [arrivalAnnouncement, event];
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

 // Replace the existing processCommand function in gameEngine.ts with this one.

  async processCommand(characterId: string, command: Command): Promise<GameEvent[]> {
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
      include: { room: true, inventory: true },
    });
    if (!character || !character.room) return [];

    let events: GameEvent[] = [];
    const currentRoom = character.room;

    switch (command.action) {
      // ... your existing cases like look, move, say, etc. ...
      
      // --- NEW: ATTACK COMMAND ---
      case 'attack': {
        const targetName = command.payload;
        if (!targetName) {
          events.push({ target: characterId, type: 'message', payload: { message: "Attack what?" } });
          break;
        }

        // Find the first mob in the room that matches the target name
        const targetMob = await this.prisma.mob.findFirst({
          where: { name: { equals: targetName, mode: 'insensitive' }, roomId: currentRoom.id }
        });

        if (!targetMob) {
          events.push({ target: characterId, type: 'message', payload: { message: "You don't see that here." } });
          break;
        }

        // --- COMBAT LOGIC ---

        // 1. Player attacks Mob
        const playerDamage = Math.max(1, character.strength - targetMob.defense);
        const mobNewHp = targetMob.hp - playerDamage;
        
        // Announce player's attack
        const playerAttackMessage = `You attack the ${targetMob.name} for ${playerDamage} damage!`;
        events.push({ target: characterId, type: 'message', payload: { message: playerAttackMessage }});
        events.push({ target: 'room', type: 'message', payload: { roomId: currentRoom.id, message: `${character.name} attacks the ${targetMob.name}.`, exclude: [characterId] }});

        // 2. Check if Mob is defeated
        if (mobNewHp <= 0) {
          // Announce victory
          events.push({ target: 'room', type: 'message', payload: { roomId: currentRoom.id, message: `The ${targetMob.name} has been defeated!`, exclude: [] }});
          
          // Delete the mob from the database
          await this.prisma.mob.delete({ where: { id: targetMob.id }});

          // Grant rewards to the player
          await this.prisma.character.update({
            where: { id: characterId },
            data: {
              experience: { increment: targetMob.experienceAward },
              gold: { increment: targetMob.goldAward },
            }
          });

          // Send a final, full game state update to the player
          events.push(await this._createFullGameUpdateEvent(characterId, `You gained ${targetMob.experienceAward} XP and ${targetMob.goldAward} gold.`));
          break; // End combat
        }

        // 3. If Mob survived, it attacks back
        const mobDamage = Math.max(1, targetMob.strength - character.defense);
        const characterNewHp = character.hp - mobDamage;

        // Announce mob's attack
        const mobAttackMessage = `The ${targetMob.name} attacks you for ${mobDamage} damage!`;
        events.push({ target: characterId, type: 'message', payload: { message: mobAttackMessage }});
        events.push({ target: 'room', type: 'message', payload: { roomId: currentRoom.id, message: `The ${targetMob.name} attacks ${character.name}.`, exclude: [characterId] }});

        // 4. Check if Player is defeated
        if (characterNewHp <= 0) {
          // For now, just send a message. In a real game, this would handle death, respawning, etc.
          events.push({ target: 'room', type: 'message', payload: { roomId: currentRoom.id, message: `${character.name} has been defeated!`, exclude: [] }});
          // Reset player's HP for now
          await this.prisma.character.update({ where: { id: characterId }, data: { hp: character.maxHp }});
          // TODO: Add real death logic (e.g., move to a "spirit realm" room, lose XP, etc.)
        }

        // 5. If both survived, update both their HP in the database
        await this.prisma.mob.update({ where: { id: targetMob.id }, data: { hp: mobNewHp }});
        await this.prisma.character.update({ where: { id: characterId }, data: { hp: characterNewHp }});

        // Send a final game state update to the player
        events.push(await this._createFullGameUpdateEvent(characterId, 'The battle continues...'));
        break;
      }


      default:
        events.push({ target: characterId, type: 'message', payload: { message: 'Unknown command.' } });
        break;
    }
    return events;
  }
  
  // --- Private Helper Methods ---

  // NEW HELPER FUNCTION to gather all state for a player
  private async _createFullGameUpdateEvent(characterId: string, message: string): Promise<GameEvent> {
      const character = await this.prisma.character.findUnique({
        where: { id: characterId },
        include: { room: true, inventory: true },
      });

      if (!character || !character.room) {
        throw new Error(`Could not create game update for character ${characterId}.`);
      }

      const playersInRoom = await this.getCharactersInRoom(character.currentRoomId, characterId);
      const itemsInRoom = await this.prisma.item.findMany({ where: { roomId: character.currentRoomId }});
      // --- NEW: Query for mobs in the room ---
      const mobsInRoom = await this.prisma.mob.findMany({ where: { roomId: character.currentRoomId }});

      return {
        target: characterId,
        type: 'gameUpdate',
        payload: {
          message: message,
          player: character,
          room: character.room,
          players: playersInRoom.map(p => p.name),
          roomItems: itemsInRoom,
          inventory: character.inventory,
          mobs: mobsInRoom, // <-- ADDED: Include the mobs in the payload
        },
      };
    }

  public async getCharactersInRoom(roomId: string, excludeCharacterId?: string): Promise<Character[]> {
    return this.prisma.character.findMany({
      where: { currentRoomId: roomId, id: { not: excludeCharacterId } },
    });
  }
}