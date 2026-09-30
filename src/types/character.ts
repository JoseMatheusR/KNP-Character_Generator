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
    heal: string;
  };
  borrowedSkill?: string | null;
  extraEvadeTechnique?: string | null;
  extraTechnique?: ExtraTechnique | null;
  damageMarkers: string[];
  negativeConditions: string[];
  combatConditions: string[];
  positiveConditions: string[];
  notes?: string;
}

export type AttributeKey = keyof Attributes;

export type TechniqueCategory = "attack" | "defend" | "evade" | "heal";

export interface ExtraTechnique {
  category: TechniqueCategory;
  name: string;
}
