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
  /** Perícia de outro arquétipo, escolhida por Saga de um vaqueiro. */
  borrowedSkill?: string | null;
  /** Segunda técnica de Evadir e Observar, escolhida por Marotagem. */
  extraEvadeTechnique?: string | null;
  /** Técnica extra de qualquer tipo, escolhida por Kryptônia. */
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
