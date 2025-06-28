// client/src/types.ts

// This file contains all the shared type definitions for our frontend components.

// --- FIXED: Reverted to standard enums for maximum stability and compatibility ---
export enum Hostility {
  FRIENDLY = 'FRIENDLY',
  NEUTRAL = 'NEUTRAL',
  HOSTILE = 'HOSTILE',
}

export enum EquipSlot {
  NONE = 'NONE',
  HEAD = 'HEAD',
  CHEST = 'CHEST',
  LEGS = 'LEGS',
  FEET = 'FEET',
  HANDS = 'HANDS',
  WEAPON_MAIN = 'WEAPON_MAIN',
  WEAPON_OFF = 'WEAPON_OFF',
  RING = 'RING',
  AMULET = 'AMULET',
}

// Defines the shape of an item instance
export interface Item {
  id: string;
  equipped: boolean;
  itemTemplateId: number;
  template: {
    name: string;
    description: string;
    weight: number;
    slot: EquipSlot;
    attributes: Record<string, number>;
  }
}

// Defines the shape of the player's character data
export interface Player {
  id: string;
  username: string; 
  name: string; 
  level: number;
  experience: number;
  experienceToNextLevel: number;
  unspentStatPoints: number;
  gold: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  resolve: number;
  defense: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
}

// Defines the shape of a mob's data
export interface Mob {
  id: string;
  name: string;
  description: string;
  level: number;
  hp: number;
  maxHp: number;
  hostility: Hostility;
  targetId: string | null;
}

// Defines the shape of a room's data
export interface Room {
  id: string;
  name: string;
  description: string;
  exits: { [direction: string]: string };
  x: number;
  y: number;
  z: number;
}

// --- Types for the Loot System ---
export interface LootItem {
  itemTemplateId: number;
  quantity: string;
  weight: number;
}

export interface LootGroup {
  groupName: string;
  dropChance: number;
  guaranteed: boolean;
  maxDrops: number;
  items: LootItem[];
}

export type LootTable = LootGroup[];

export interface GeneratedLoot {
  itemTemplateId: number;
  quantity: number;
}
