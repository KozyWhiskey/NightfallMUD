// server/src/game/world.ts
import type { Item } from './item'; // Use a type-only import

export interface Room {
  id: string;
  name: string;
  description: string;
  exits: { [direction: string]: string };
  items: Item[]; // <-- ADDED
}

export const world: { [id: string]: Room } = {
  'room-1': {
    id: 'room-1',
    name: 'The Town Square',
    description: 'You are standing in the bustling town square. Cobblestone paths lead away in all directions. In the center, a large fountain gurgles peacefully.',
    exits: {
      north: 'room-2',
      east: 'room-3',
    },
    // --- ADDED ---
    items: [
      { id: 'item-1', name: 'rusty sword', description: 'A simple sword, pitted with rust.' }
    ],
  },
  'room-2': {
    id: 'room-2',
    name: 'The North Road',
    description: 'You are on a dusty road leading north out of town. The town square is to the south. A dense forest looms to the north.',
    exits: {
      south: 'room-1',
    },
    items: [], // <-- ADDED
  },
  'room-3': {
    id: 'room-3',
    name: 'The Armory',
    description: 'You stand inside the town armory. Racks of swords and shields line the walls. The exit is to the west.',
    exits: {
      west: 'room-1',
    },
    items: [], // <-- ADDED
  },
};