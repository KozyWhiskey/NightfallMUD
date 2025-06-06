// server/src/game/gameEngine.ts

import { world, Room } from './world';
import { Player } from './player';

// This interface defines the structure for a command from the client
export interface Command {
  action: string;
  payload?: any;
}

// This interface defines the structure for a response to the client
export interface GameResponse {
  message: string;
  room: Room;
}

export class GameEngine {
  private players: Map<string, Player> = new Map();
  private startingRoomId = 'room-1';

  // Add a new player to the game
  addPlayer(playerId: string): GameResponse {
    const player = new Player(playerId, this.startingRoomId);
    this.players.set(playerId, player);
    const startingRoom = world[this.startingRoomId];
    return {
      message: `Welcome to the game! You have entered ${startingRoom.name}.`,
      room: startingRoom,
    };
  }

  // Remove a player from the game
  removePlayer(playerId: string) {
    this.players.delete(playerId);
    console.log(`Player ${playerId} removed.`);
  }

  // Process a command from a player
  processCommand(playerId: string, command: Command): GameResponse {
    const player = this.players.get(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    const currentRoom = world[player.currentRoomId];
    let message = '';

    switch (command.action) {
      case 'look':
        message = 'You look around.';
        break;

      case 'move':
        const direction = command.payload;
        const nextRoomId = currentRoom.exits[direction];
        if (nextRoomId) {
          player.currentRoomId = nextRoomId;
          const newRoom = world[nextRoomId];
          message = `You move ${direction}. You are now in ${newRoom.name}.`;
        } else {
          message = "You can't go that way.";
        }
        break;

      default:
        message = 'Unknown command.';
        break;
    }

    // Return the updated game state
    return {
      message: message,
      room: world[player.currentRoomId],
    };
  }
}