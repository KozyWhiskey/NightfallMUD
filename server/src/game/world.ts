// server/src/game/world.ts
import { EquipSlot, Hostility } from '@prisma/client'; // Import Hostility Enum

// --- UPDATED: MobTemplate now includes hostility ---
export interface MobTemplate {
  name: string;
  description: string;
  hostility: Hostility; // <-- ADDED
  level: number;
  hp: number;
  maxHp: number;
  strength: number;
  defense: number;
  experienceAward: number;
  goldAward: number;
}

export interface ItemTemplate {
  id: string;
  name: string;
  description: string;
  weight: number;
  slot: EquipSlot;
  attributes: Record<string, any>;
}

export interface RoomTemplate {
  id: string;
  name: string;
  description: string;
  exits: { [direction: string]: string };
  items: ItemTemplate[];
  mobTemplates: MobTemplate[];
}

export const world: { [id: string]: RoomTemplate } = {
  'room-1': {
    id: 'room-1',
    name: 'The Town Square',
    description: 'You are standing in the bustling town square...',
    exits: { north: 'room-2', east: 'room-3' },
    items: [
      { id: 'item-1', name: 'rusty sword', description: 'A simple sword...', weight: 5.0, slot: EquipSlot.WEAPON_MAIN, attributes: { "damage": 2 } }
    ],
    mobTemplates: [
      // --- UPDATED: Giant Rat is now explicitly HOSTILE ---
      { 
        name: 'Giant Rat', 
        description: 'A filthy, oversized rodent with sharp teeth.', 
        hostility: Hostility.HOSTILE, // <-- ADDED
        level: 1, 
        hp: 5, 
        maxHp: 5, 
        strength: 1, 
        defense: 0, 
        experienceAward: 2, 
        goldAward: 1 
      },
    ],
  },
  'room-2': {
    id: 'room-2',
    name: 'The North Road',
    description: 'You are on a dusty road...',
    exits: { south: 'room-1' },
    items: [],
    mobTemplates: [],
  },
  'room-3': {
    id: 'room-3',
    name: 'The Armory',
    description: 'You stand inside the town armory...',
    exits: { west: 'room-1' },
    items: [],
    // Add a friendly NPC for demonstration
    mobTemplates: [
        {
            name: 'Barnaby',
            description: 'The friendly town blacksmith. He smiles warmly as you approach.',
            hostility: Hostility.FRIENDLY, // <-- ADDED
            level: 10,
            hp: 100, maxHp: 100,
            strength: 10, defense: 10,
            experienceAward: 0, goldAward: 0
        }
    ],
  },
};
