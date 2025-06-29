import { AffixType } from '@prisma/client';

export const allAffixes = [
  {
    id: 1,
    name: 'of Strength',
    type: AffixType.SUFFIX,
    requiredLevel: 1,
    attributes: { strength: 5 },
  },
  {
    id: 2,
    name: 'of Dexterity',
    type: AffixType.SUFFIX,
    requiredLevel: 1,
    attributes: { dexterity: 5 },
  },
  {
    id: 3,
    name: 'of Constitution',
    type: AffixType.SUFFIX,
    requiredLevel: 1,
    attributes: { constitution: 5 },
  },
  {
    id: 4,
    name: 'of Intelligence',
    type: AffixType.SUFFIX,
    requiredLevel: 1,
    attributes: { intelligence: 5 },
  },
  {
    id: 5,
    name: 'of Wisdom',
    type: AffixType.SUFFIX,
    requiredLevel: 1,
    attributes: { wisdom: 5 },
  },
  {
    id: 6,
    name: 'of Charisma',
    type: AffixType.SUFFIX,
    requiredLevel: 1,
    attributes: { charisma: 5 },
  },
  {
    id: 7,
    name: 'of Resolve',
    type: AffixType.SUFFIX,
    requiredLevel: 1,
    attributes: { resolve: 5 },
  },
  {
    id: 8,
    name: 'Hardening',
    type: AffixType.PREFIX,
    requiredLevel: 1,
    attributes: { defense: 3 },
  },
  {
    id: 9,
    name: 'Sharp',
    type: AffixType.PREFIX,
    requiredLevel: 1,
    attributes: { damage: 2 },
  },
  {
    id: 10,
    name: 'Mystic',
    type: AffixType.PREFIX,
    requiredLevel: 1,
    attributes: { magicResist: 2 },
  },
];
