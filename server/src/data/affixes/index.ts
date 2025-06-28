// server/src/data/affixes/index.ts
import { AffixType } from '@prisma/client';

export const allAffixes = [
  // Prefixes
  { id: 1, name: 'Vicious', type: AffixType.PREFIX, requiredLevel: 1, attributes: { "damage": { "min": 1, "max": 2 } } },
  { id: 2, name: 'Bashing', type: AffixType.PREFIX, requiredLevel: 3, attributes: { "strength": { "min": 1, "max": 2 } } },
  { id: 3, name: 'Piercing', type: AffixType.PREFIX, requiredLevel: 5, attributes: { "accuracy": { "min": 3, "max": 5 } } },
  
  // Suffixes
  { id: 101, name: 'of Resilience', type: AffixType.SUFFIX, requiredLevel: 1, attributes: { "constitution": { "min": 1, "max": 2 } } },
  { id: 102, name: 'of Evasion', type: AffixType.SUFFIX, requiredLevel: 3, attributes: { "dexterity": { "min": 1, "max": 2 } } },
  { id: 103, name: 'of Guarding', type: AffixType.SUFFIX, requiredLevel: 8, attributes: { "armor": { "min": 2, "max": 4 } } },
];
