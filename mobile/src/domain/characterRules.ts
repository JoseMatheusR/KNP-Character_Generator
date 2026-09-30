import type { Attributes, AttributeKey, Character } from "./character";
import { harmoniaFromSkills } from "./characterBuild";
import { NEGATIVE_CONDITIONS } from "./gameData";

export function getDebuffs(character: Character): Attributes {
  const debuffs: Attributes = { foco: 0, vontade: 0, harmonia: 0, criatividade: 0 };
  for (const cond of NEGATIVE_CONDITIONS) {
    if (character.negativeConditions.includes(cond.label)) {
      for (const [key, val] of Object.entries(cond.effects)) {
        debuffs[key as AttributeKey] += val!;
      }
    }
  }
  return debuffs;
}

export function getBuiltAttributes(character: Character): Attributes {
  return {
    foco: character.baseAttributes.foco + character.bonusAttributes.foco,
    vontade: character.baseAttributes.vontade + character.bonusAttributes.vontade,
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
