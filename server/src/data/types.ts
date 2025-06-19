// server/src/data/types.ts
import { EquipSlot, Hostility } from '@prisma/client';

export interface ItemTemplate {
  id: number;
  name: string;
  description: string;
  weight: number;
  slot: EquipSlot;
  attributes: Record<string, any>;
}

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
}

export interface RoomTemplate {
  id: string;
  name: string;
  description: string;
  exits: { [direction: string]: string };
  x: number;
  y: number;
  z: number;
  items: number[];
  mobTemplates: MobTemplate[];
}
