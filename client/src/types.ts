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

export interface Item {
  id: string;
  name: string;
  description: string;
  weight: number;
  slot: EquipSlot;
  equipped: boolean;
  attributes: Record<string, any>;
}

export interface Player {
  id: string;
  username: string;
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

export interface Mob {
  id: string;
  name: string;
  description: string;
  hp: number;
  maxHp: number;
  hostility: Hostility; // <-- ADDED
}