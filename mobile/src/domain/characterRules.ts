import type { Attributes, AttributeKey, Character } from "./character";
import { harmoniaFromSkills, vontadeFromSkills } from "./characterBuild";
import { NEGATIVE_CONDITIONS, POSITIVE_CONDITIONS, type ConditionEffect } from "./gameData";

function addEffects(total: Attributes, conditions: ConditionEffect[], active: string[]) {
  for (const condition of conditions) {
    if (!condition.effects || !active.includes(condition.label)) continue;
    for (const [key, value] of Object.entries(condition.effects)) {
      total[key as AttributeKey] += value ?? 0;
    }
  }
}

export function getDebuffs(character: Character): Attributes {
  const debuffs: Attributes = { foco: 0, vontade: 0, harmonia: 0, criatividade: 0 };
  addEffects(debuffs, NEGATIVE_CONDITIONS, character.negativeConditions);
  addEffects(debuffs, POSITIVE_CONDITIONS, character.positiveConditions);
  return debuffs;
}

export function getBuiltAttributes(character: Character): Attributes {
  return {
    foco: character.baseAttributes.foco + character.bonusAttributes.foco,
    vontade: character.baseAttributes.vontade + character.bonusAttributes.vontade + vontadeFromSkills(character),
    harmonia: character.baseAttributes.harmonia + character.bonusAttributes.harmonia + harmoniaFromSkills(character),
    criatividade: character.baseAttributes.criatividade + character.bonusAttributes.criatividade,
  };
}

export function getEffectiveAttributes(character: Character): Attributes {
  const built = getBuiltAttributes(character);
  const debuffs = getDebuffs(character);
  return {
    foco: built.foco + debuffs.foco,
    vontade: built.vontade + debuffs.vontade,
    harmonia: built.harmonia + debuffs.harmonia,
    criatividade: built.criatividade + debuffs.criatividade,
  };
}

export function isValidBonusDistribution(bonus: Attributes): boolean {
  return Object.values(bonus).reduce((s, v) => s + v, 0) === 2;
}

const CONDITION_LISTS = ["negativeConditions", "combatConditions", "positiveConditions"] as const;

/** A condição nova substitui as opostas que o personagem já carrega. */
const REPLACED_BY: Record<string, string[]> = {
  Raiva: ["Medo"],
  Resoluto: ["Insegurança", "Desconforto"],
  Compassivo: ["Raiva", "Paranoico"],
};

export function conditionsReplacedBy(condition: string): string[] {
  return REPLACED_BY[condition] ?? [];
}

export function toggleSheetCondition(
  character: Character,
  type: (typeof CONDITION_LISTS)[number],
  condition: string
): Character {
  if (character[type].includes(condition)) {
    return { ...character, [type]: character[type].filter((item) => item !== condition) };
  }

  const dropped = new Set(REPLACED_BY[condition] ?? []);
  const next: Character = { ...character };
  for (const list of CONDITION_LISTS) {
    next[list] = character[list].filter((item) => !dropped.has(item));
  }
  next[type] = [...next[type], condition];
  return next;
}
