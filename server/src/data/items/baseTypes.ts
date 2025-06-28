// server/src/data/items/baseTypes.ts
import { EquipSlot } from '@prisma/client';

// This defines the fundamental types of items that can be randomly generated.
export const baseItemTypes = [
  { id: 1, name: 'Dagger', slot: EquipSlot.WEAPON_MAIN },
  { id: 2, name: 'Sword', slot: EquipSlot.WEAPON_MAIN },
  { id: 3, name: 'Cloth Helm', slot: EquipSlot.HEAD },
  { id: 4, name: 'Leather Cap', slot: EquipSlot.HEAD },
];
