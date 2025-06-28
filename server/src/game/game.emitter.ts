// server/src/game/game.emitter.ts
import { EventEmitter } from 'events';
import type { Character, Mob } from '@prisma/client';

// This interface defines the "data packet" that gets sent with a 'mobDefeated' event.
// Any service listening for this event will receive this payload.
export interface MobDefeatedPayload {
  mob: Mob;
  killer: Character;
  roomId: string;
}

// We create a custom, typed EventEmitter to make our code safer and easier to use.
// This tells TypeScript exactly which events exist and what data they carry.
class GameEventEmitter extends EventEmitter {
  // Overload the 'emit' method for our specific event
  emit(event: 'mobDefeated', payload: MobDefeatedPayload): boolean;
  
  // This is the generic implementation that calls the parent class's method
  emit(event: string | symbol, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }

  // Overload the 'on' (listen) method for our specific event
  on(event: 'mobDefeated', listener: (payload: MobDefeatedPayload) => void): this;

  // This is the generic implementation
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }
}

// Create and export a single, global instance of our event emitter.
// All services will import and use this same instance.
export const gameEventEmitter = new GameEventEmitter();
