// server/src/game/world.ts
import type { Item } from './item';

// This is not a database model, but a template for creating mobs.
export interface MobTemplate {
  name: string;
  description: string;
  level: number;
  hp: number;
  maxHp: number;
  strength: number;
  defense: number;
  experienceAward: number;
  goldAward: number;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  exits: { [direction: string]: string };
  items: Item[];
  mobTemplates: MobTemplate[]; // <-- ADDED
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
    items: [
      { id: 'item-1', name: 'rusty sword', description: 'A simple sword, pitted with rust.' }
    ],
    // --- ADDED MOBS ---
    mobTemplates: [
      { name: 'Giant Rat', description: 'A filthy, oversized rodent with sharp teeth.', level: 1, hp: 5, maxHp: 5, strength: 1, defense: 0, experienceAward: 2, goldAward: 1 },
      { name: 'Giant Rat', description: 'A filthy, oversized rodent with sharp teeth.', level: 1, hp: 5, maxHp: 5, strength: 1, defense: 0, experienceAward: 2, goldAward: 1 },
    ],
  },
  'room-2': {
    id: 'room-2',
    name: 'The North Road',
    description: 'You are on a dusty road leading north out of town. The town square is to the south. A dense forest looms to the north.',
    exits: {
      south: 'room-1',
    },
    items: [],
    mobTemplates: [], // <-- ADDED
  },
  'room-3': {
    id: 'room-3',
    name: 'The Armory',
    description: 'You stand inside the town armory. Racks of swords and shields line the walls. The exit is to the west.',
    exits: {
      west: 'room-1',
    },
    items: [],
    mobTemplates: [], // <-- ADDED
  },
};