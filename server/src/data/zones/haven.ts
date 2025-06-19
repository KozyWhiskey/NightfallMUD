// server/src/data/zones/haven.ts
import { Hostility } from '@prisma/client';
import type { RoomTemplate } from '../types';

export const havenRooms: { [id: string]: RoomTemplate } = {
  'town-square': {
    id: 'town-square', name: 'Haven Town Square',
    description: 'The center of the small outpost of Haven. Cobblestone paths lead in all directions. A large, dry fountain sits in the middle, a testament to better times.',
    exits: { north: 'the-forge', east: 'the-inn', south: 'south-gate', west: 'the-armory' },
    x: 0, y: 0, z: 0,
    items: [], mobTemplates: [],
  },
  'the-forge': {
    id: 'the-forge', name: "Barnaby's Forge",
    description: 'The air is thick with the smell of coal and hot metal. An anvil rings rhythmically in the corner where a large man is hard at work.',
    exits: { south: 'town-square' },
    x: 0, y: 1, z: 0,
    items: [],
    mobTemplates: [
      { name: 'Barnaby', description: 'The town blacksmith. He gives you a soot-stained grin.', hostility: Hostility.FRIENDLY, keywords: ['barnaby', 'blacksmith'], canDropGold: false, level: 10, hp: 100, maxHp: 100, strength: 10, defense: 10, experienceAward: 0 }
    ],
  },
  'the-armory': {
    id: 'the-armory', name: 'The Armory',
    description: 'Racks of basic weapons and armor line the walls, available for new adventurers. A notice board is posted near the entrance.',
    exits: { east: 'town-square' },
    x: -1, y: 0, z: 0,
    items: [201, 202], // leather vest, iron dagger
    mobTemplates: [],
  },
  'the-inn': {
    id: 'the-inn', name: 'The Weary Wanderer Inn',
    description: 'The common room of the inn is filled with the low murmur of conversation. A bar stretches along the far wall, and a staircase leads up.',
    exits: { west: 'town-square', up: 'inn-room', east: 'arcane-sanctum' },
    x: 1, y: 0, z: 0,
    items: [],
    mobTemplates: [
      { name: 'Barkeep', description: 'A cheerful looking fellow polishing a mug.', hostility: Hostility.FRIENDLY, keywords: ['barkeep', 'bartender'], canDropGold: true, level: 5, hp: 50, maxHp: 50, strength: 5, defense: 5, experienceAward: 0 }
    ],
  },
  'inn-room': {
    id: 'inn-room', name: 'Inn Guest Room',
    description: 'A simple, clean room with a bed and a small table. It feels safe here. You can rest and recover your strength.',
    exits: { down: 'the-inn' },
    x: 1, y: 0, z: 1,
    items: [], mobTemplates: [],
  },
  'arcane-sanctum': {
      id: 'arcane-sanctum', name: 'Arcane Sanctum',
      description: 'This quiet study is filled with bookshelves and smells of old parchment. A wise-looking scholar sits at a desk, ready to impart knowledge.',
      exits: { west: 'the-inn' },
      x: 2, y: 0, z: 0,
      items: [],
      mobTemplates: [
        { name: 'Elara', description: 'A serene scholar with eyes that seem to hold ancient secrets.', hostility: Hostility.FRIENDLY, keywords: ['elara', 'scholar'], canDropGold: false, level: 15, hp: 100, maxHp: 100, strength: 5, defense: 5, experienceAward: 0 }
      ],
  },
  'south-gate': {
    id: 'south-gate', name: 'South Gate',
    description: 'You stand at the southern gate of Haven. The town square is to the north, and a dusty path leads south towards a crude arena.',
    exits: { north: 'town-square', south: 'the-arena' },
    x: 0, y: -1, z: 0,
    items: [], mobTemplates: [],
  },
  'the-arena': {
    id: 'the-arena', name: 'Training Arena',
    description: 'This dusty, open-air arena is where new adventurers test their might against captive beasts. The path back to town is north.',
    exits: { north: 'south-gate', south: 'cave-entrance' },
    x: 0, y: -2, z: 0,
    items: [],
    mobTemplates: [
      { name: 'Gloomfang Pup', description: 'A young, but aggressive, canine beast...', hostility: Hostility.HOSTILE, keywords: ['gloomfang', 'pup', 'gloomfang pup'], canDropGold: false, level: 2, hp: 15, maxHp: 15, strength: 4, defense: 1, experienceAward: 5 },
    ],
  },
  'cave-entrance': {
      id: 'cave-entrance', name: 'A Dark Cave Entrance',
      description: 'The road ends at the mouth of a dark cave. A chilling wind whispers from within, promising danger and treasure.',
      exits: { north: 'the-arena' },
      x: 0, y: -3, z: 0,
      items: [], mobTemplates: [],
  }
};
