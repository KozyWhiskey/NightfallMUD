// server/src/data/items/index.ts
import { EquipSlot } from '@prisma/client';
import type { ItemTemplate } from './types';

export const allItemTemplates: ItemTemplate[] = [
  { id: 101, name: 'rusty sword', description: 'A simple sword, pitted with rust. It feels heavier than it looks.', weight: 5.0, slot: EquipSlot.WEAPON_MAIN, attributes: { "damage": 2 } },
  { id: 102, name: 'gloomfang pelt', description: 'The rough, dark pelt of a gloomfang.', weight: 1.0, slot: EquipSlot.NONE, attributes: {} },
  { id: 103, name: 'gloomfang tooth', description: 'A sharp, wicked-looking tooth.', weight: 0.2, slot: EquipSlot.NONE, attributes: {} },
  { id: 201, name: 'leather vest', description: 'A sturdy vest made of boiled leather.', weight: 8.0, slot: EquipSlot.CHEST, attributes: { "armor": 3 } },
  { id: 202, name: 'iron dagger', description: 'A simple but effective iron dagger.', weight: 1.5, slot: EquipSlot.WEAPON_MAIN, attributes: { "damage": 3 } },
];
