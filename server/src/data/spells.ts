import { SpellType, TargetType, DamageType, EffectType, Class } from '@prisma/client';

export interface SpellData {
  name: string;
  description: string;
  spellType: SpellType;
  requiredClass?: Class;
  requiredLevel: number;
  manaCost: number;
  targetType: TargetType;
  castingTime: number;
  cooldown: number;
  effects: SpellEffectData[];
}

export interface SpellEffectData {
  effectType: EffectType;
  damageType?: DamageType;
  baseValue: number;
  scalingFactor: number;
  statusEffectName?: string; // Reference by name
  duration?: number;
  order: number;
}

export interface StatusEffectData {
  name: string;
  description: string;
  effectType: EffectType;
  damageType?: DamageType;
  baseValue: number;
  scalingFactor: number;
  duration: number;
  maxStacks: number;
}

// Status effects that can be applied by spells
export const allStatusEffects: StatusEffectData[] = [
  {
    name: "Poisoned",
    description: "Takes damage over time from poison.",
    effectType: "DEBUFF",
    damageType: "PHYSICAL",
    baseValue: 5,
    scalingFactor: 0.5,
    duration: 3,
    maxStacks: 1
  },
  {
    name: "Stunned",
    description: "Unable to take actions for the duration.",
    effectType: "DEBUFF",
    baseValue: 0,
    scalingFactor: 0,
    duration: 1,
    maxStacks: 1
  },
  {
    name: "Snared",
    description: "Unable to move or flee for the duration.",
    effectType: "DEBUFF",
    baseValue: 0,
    scalingFactor: 0,
    duration: 3,
    maxStacks: 1
  },
  {
    name: "Mana Drain",
    description: "Reduces mana regeneration and current mana.",
    effectType: "DEBUFF",
    baseValue: 10,
    scalingFactor: 0.5,
    duration: 2,
    maxStacks: 1
  }
];

// All spells in the game
export const allSpells: SpellData[] = [
  // Aether Weaver starting spell
  {
    name: "Glimmering Bolt",
    description: "A quick bolt of frost energy that deals damage to a single enemy.",
    spellType: "CLASS",
    requiredClass: "AETHER_WEAVER",
    requiredLevel: 1,
    manaCost: 10,
    targetType: "TARGET_ENEMY",
    castingTime: 1,
    cooldown: 0,
    effects: [
      {
        effectType: "DIRECT_DAMAGE",
        damageType: "FROST",
        baseValue: 15,
        scalingFactor: 1.5,
        order: 1
      }
    ]
  },
  
  // Dawnkeeper starting spell
  {
    name: "Mend Wounds",
    description: "A standard, direct healing spell for a single ally.",
    spellType: "CLASS",
    requiredClass: "DAWNKEEPER",
    requiredLevel: 1,
    manaCost: 12,
    targetType: "TARGET_ALLY",
    castingTime: 1,
    cooldown: 0,
    effects: [
      {
        effectType: "HEAL",
        baseValue: 20,
        scalingFactor: 1.2,
        order: 1
      }
    ]
  },
  
  // Vanguard starting spell
  {
    name: "Shield Bash",
    description: "Deals minor physical damage and has a chance to stun the target.",
    spellType: "CLASS",
    requiredClass: "VANGUARD",
    requiredLevel: 1,
    manaCost: 8,
    targetType: "TARGET_ENEMY",
    castingTime: 0,
    cooldown: 2,
    effects: [
      {
        effectType: "DIRECT_DAMAGE",
        damageType: "PHYSICAL",
        baseValue: 8,
        scalingFactor: 1.0,
        order: 1
      },
      {
        effectType: "APPLY_STATUS_EFFECT",
        statusEffectName: "Stunned",
        baseValue: 25, // 25% chance
        scalingFactor: 0,
        duration: 1,
        order: 2
      }
    ]
  },
  
  // Shadowblade starting spell
  {
    name: "Venomous Strike",
    description: "An instant attack that deals minor physical damage and applies poison.",
    spellType: "CLASS",
    requiredClass: "SHADOWBLADE",
    requiredLevel: 1,
    manaCost: 15,
    targetType: "TARGET_ENEMY",
    castingTime: 0,
    cooldown: 3,
    effects: [
      {
        effectType: "DIRECT_DAMAGE",
        damageType: "PHYSICAL",
        baseValue: 6,
        scalingFactor: 0.8,
        order: 1
      },
      {
        effectType: "APPLY_STATUS_EFFECT",
        statusEffectName: "Poisoned",
        baseValue: 100, // 100% chance
        scalingFactor: 0,
        duration: 3,
        order: 2
      }
    ]
  },
  
  // Technomancer starting spell
  {
    name: "Short Circuit",
    description: "Deals minor shock damage and has a chance to apply mana drain.",
    spellType: "CLASS",
    requiredClass: "TECHNOMANCER",
    requiredLevel: 1,
    manaCost: 10,
    targetType: "TARGET_ENEMY",
    castingTime: 1,
    cooldown: 2,
    effects: [
      {
        effectType: "DIRECT_DAMAGE",
        damageType: "SHOCK",
        baseValue: 12,
        scalingFactor: 1.3,
        order: 1
      },
      {
        effectType: "APPLY_STATUS_EFFECT",
        statusEffectName: "Mana Drain",
        baseValue: 30, // 30% chance
        scalingFactor: 0,
        duration: 2,
        order: 2
      }
    ]
  },
  
  // Gloom Warden starting spell
  {
    name: "Ensnaring Vines",
    description: "Deals no damage but applies a snare effect to prevent fleeing.",
    spellType: "CLASS",
    requiredClass: "GLOOM_WARDEN",
    requiredLevel: 1,
    manaCost: 12,
    targetType: "TARGET_ENEMY",
    castingTime: 1,
    cooldown: 3,
    effects: [
      {
        effectType: "APPLY_STATUS_EFFECT",
        statusEffectName: "Snared",
        baseValue: 100, // 100% chance
        scalingFactor: 0,
        duration: 3,
        order: 1
      }
    ]
  }
]; 