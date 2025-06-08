// server/src/game/player.ts
import type { Item } from './item'; // Use a type-only import

export class Player {
  public id: string;
  public currentRoomId: string;
  public inventory: Item[]; // <-- ADDED

  constructor(id: string, startingRoomId: string) {
    this.id = id;
    this.currentRoomId = startingRoomId;
    this.inventory = []; // <-- ADDED: Start with an empty inventory
  }
}