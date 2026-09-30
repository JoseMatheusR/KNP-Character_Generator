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
  /** Perícia de outro arquétipo, escolhida por Saga de um vaqueiro. */
  borrowedSkill?: string | null;
  /** Segunda técnica de Evadir e Observar, escolhida por Marotagem. */
  extraEvadeTechnique?: string | null;
  damageMarkers: string[];
  negativeConditions: string[];
  combatConditions: string[];
  positiveConditions: string[];
  notes?: string;
}

export type AttributeKey = keyof Attributes;
