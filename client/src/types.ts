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

export enum Rarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  LEGENDARY = 'LEGENDARY',
}

export enum AffixType {
  PREFIX = 'PREFIX',
  SUFFIX = 'SUFFIX',
}

export interface Affix {
  id: number;
  name: string;
  type: AffixType;
  requiredLevel: number;
  attributes: Record<string, any>;
}

export interface ItemAffix {
  id: number;
  affix: Affix;
  value: Record<string, number>;
}

// Defines the shape of an item instance
export interface Item {
  id: string;
  name: string;
  description: string;
  equipped: boolean;
  rarity: Rarity;
  baseItem: {
    id: number;
    name: string;
    description: string;
    slot: EquipSlot;
    baseWeight: number;
    baseDamage: number | null;
    baseArmor: number | null;
    baseMagicResist: number | null;
  };
  itemAffixes: ItemAffix[];
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


