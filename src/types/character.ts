export interface Attributes {
  foco: number;
  vontade: number;
  harmonia: number;
  criatividade: number;
}

export interface Character {
  name: string;
  origin: string;
  avatar: string | null;
  archetype: string;
  baseHp: number;
  currentHp: number;
  baseAttributes: Attributes;
  bonusAttributes: Attributes;
  archetypeSkill: string;
  specificSkill: string;
  combatTechniques: {
    attack: string;
    evade: string;
    defend: string;
  };
  damageMarkers: string[];
  negativeConditions: string[];
  combatConditions: string[];
  positiveConditions: string[];
  notes?: string;
}

export type AttributeKey = keyof Attributes;
