// server/src/game/class.data.ts
import { Class } from '@prisma/client';

// This interface defines the shape of our class starting data
interface ClassData {
  class: Class;
  description: string;
  stats: {
    // Progression
    level: number;
    experience: number;
    experienceToNextLevel: number;
    unspentStatPoints: number;
    gold: number;
    // Core Attributes
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    resolve: number;
    // Vitals
    hp: number;
    maxHp: number;
    mana: number;
    maxMana: number;
    defense: number;
  };
}

// A map to hold the starting data for each class, indexed by the Class enum
export const startingClassData: Record<Class, ClassData> = {
  VANGUARD: {
    class: Class.VANGUARD,
    description: "The quintessential tank. The Vanguard is built to absorb damage, hold enemy attention, and survive punishing blows through sheer resilience.",
    stats: {
      level: 1, experience: 0, experienceToNextLevel: 10, unspentStatPoints: 0, gold: 10,
      strength: 13, dexterity: 8, constitution: 13, intelligence: 6, wisdom: 8, charisma: 8, resolve: 12,
      hp: 115, maxHp: 115, mana: 38, maxMana: 38, defense: 3,
    }
  },
  SHADOWBLADE: {
    class: Class.SHADOWBLADE,
    description: "A high-risk, high-reward melee damage dealer who prioritizes agility and opportunism over raw defense.",
    stats: {
      level: 1, experience: 0, experienceToNextLevel: 10, unspentStatPoints: 0, gold: 10,
      strength: 11, dexterity: 13, constitution: 9, intelligence: 8, wisdom: 6, charisma: 13, resolve: 10,
      hp: 95, maxHp: 95, mana: 44, maxMana: 44, defense: 1,
    }
  },
  AETHER_WEAVER: {
    class: Class.AETHER_WEAVER,
    description: "The archetypal 'glass cannon' caster. The Aether Weaver wields immense magical power but is physically and mentally fragile, requiring protection.",
    stats: {
      level: 1, experience: 0, experienceToNextLevel: 10, unspentStatPoints: 0, gold: 10,
      strength: 6, dexterity: 8, constitution: 11, intelligence: 14, wisdom: 8, charisma: 8, resolve: 13,
      hp: 105, maxHp: 105, mana: 62, maxMana: 62, defense: 0,
    }
  },
  DAWNKEEPER: {
    class: Class.DAWNKEEPER,
    description: "The primary healing and support class. The Dawnkeeper is durable and possesses strong magical abilities focused on restoration and protection.",
    stats: {
      level: 1, experience: 0, experienceToNextLevel: 10, unspentStatPoints: 0, gold: 10,
      strength: 8, dexterity: 6, constitution: 13, intelligence: 8, wisdom: 14, charisma: 11, resolve: 10,
      hp: 115, maxHp: 115, mana: 62, maxMana: 62, defense: 2,
    }
  },
  TECHNOMANCER: {
    class: Class.TECHNOMANCER,
    description: "A versatile and resourceful skirmisher who uses knowledge of lost technology to control the battlefield.",
    stats: {
      level: 1, experience: 0, experienceToNextLevel: 10, unspentStatPoints: 0, gold: 10,
      strength: 8, dexterity: 13, constitution: 9, intelligence: 13, wisdom: 11, charisma: 6, resolve: 10,
      hp: 95, maxHp: 95, mana: 59, maxMana: 59, defense: 1,
    }
  },
  GLOOM_WARDEN: {
    class: Class.GLOOM_WARDEN,
    description: "A durable hybrid combatant who blends melee prowess with primal nature magic, drawing power from the twisted world itself.",
    stats: {
      level: 1, experience: 0, experienceToNextLevel: 10, unspentStatPoints: 0, gold: 10,
      strength: 11, dexterity: 8, constitution: 13, intelligence: 6, wisdom: 13, charisma: 8, resolve: 11,
      hp: 115, maxHp: 115, mana: 59, maxMana: 59, defense: 2,
    }
  }
};
