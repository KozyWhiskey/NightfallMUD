// server/src/data/items/static.ts
import { EquipSlot } from '@prisma/client';
import type { ItemTemplate } from '../types';

// This is now the master list for all pre-designed, static items in the game.
export const allStaticItemTemplates: ItemTemplate[] = [
  { id: 201, name: 'leather vest', description: 'A sturdy vest made of boiled leather.', weight: 8.0, slot: EquipSlot.CHEST, attributes: { "armor": 3 } },
  { id: 202, name: 'iron dagger', description: 'A simple but effective iron dagger.', weight: 1.5, slot: EquipSlot.WEAPON_MAIN, attributes: { "damage": 3 } },
  // We can add more static items here in the future, like the "Ragged Leather Cap" from your doc
  // { id: 310, name: 'ragged leather cap', ... }
];
