// server/src/data/types.ts
import { EquipSlot, Hostility } from '@prisma/client';



export interface MobTemplate {
  name: string;
  description: string;
  hostility: Hostility;
  keywords: string[];
  canDropGold: boolean;
  level: number;
  hp: number;
  maxHp: number;
  strength: number;
  defense: number;
  experienceAward: number;
  lootTable: any; // Using 'any' as it's complex JSON
}

// The main Room interface now uses the templates
export interface RoomTemplate {
  id: string;
  name: string;
  description: string;
  exits: { [direction: string]: string };
  x: number;
  y: number;
  z: number;
  items: number[]; // Every room must have an items array (even if empty)
  mobTemplates: MobTemplate[];
}
