// client/src/types.ts
export interface Player {
    id: string;
    username: string;
    level: number;
    experience: number;
    gold: number;
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    hp: number;
    maxHp: number;
    mana: number;
    maxMana: number;
}

export interface Item {
    id: string;
    name: string;
    description: string;
}
