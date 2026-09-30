import { describe, it, expect } from "vitest";
import { borrowedSkillOptions, grantedTechniques, harmoniaFromSkills, needsExtraEvade } from "@/src/domain/characterBuild";
import { isValidBonusDistribution, getEffectiveAttributes } from "@/src/domain/characterRules";
import { rollResultFromTotal } from "@/src/domain/diceRules";
import type { Character } from "@/src/domain/character";

const baseChar: Character = {
  name: "Test",
  origin: "",
  avatar: null,
  archetype: "neo-cangaceiro",
  baseHp: 5,
  currentHp: 5,
  baseAttributes: { foco: 1, vontade: 1, harmonia: -1, criatividade: 0 },
  bonusAttributes: { foco: 1, vontade: 1, harmonia: 0, criatividade: 0 },
  archetypeSkill: "skill",
  specificSkill: "spec",
  combatTechniques: { attack: "a", evade: "e", defend: "d" },
  damageMarkers: [],
  negativeConditions: ["Medo"],
  combatConditions: [],
  positiveConditions: [],
};

describe("characterRules", () => {
  it("validates bonus distribution sums to 2", () => {
    expect(isValidBonusDistribution({ foco: 1, vontade: 1, harmonia: 0, criatividade: 0 })).toBe(true);
    expect(isValidBonusDistribution({ foco: 2, vontade: 0, harmonia: 0, criatividade: 0 })).toBe(true);
    expect(isValidBonusDistribution({ foco: 1, vontade: 0, harmonia: 0, criatividade: 0 })).toBe(false);
  });

  it("applies negative condition debuffs to effective attributes", () => {
    const eff = getEffectiveAttributes(baseChar);
    expect(eff.vontade).toBe(0);
    expect(eff.criatividade).toBe(-2);
  });

  it("adds permanent harmonia from Síndrome de Vereador", () => {
    const vereador = { ...baseChar, specificSkill: "Síndrome de Vereador" };
    expect(harmoniaFromSkills(vereador)).toBe(1);
    expect(getEffectiveAttributes(vereador).harmonia).toBe(baseChar.baseAttributes.harmonia + 1);
  });

  it("grants techniques and an extra evade choice for build skills", () => {
    const marginalizado = {
      ...baseChar,
      archetypeSkill: "Asa Branca",
      specificSkill: "Marotagem",
      combatTechniques: { attack: "Investida", evade: "Sentir o Ambiente", defend: "Proteger" },
    };
    expect(needsExtraEvade(marginalizado)).toBe(true);
    expect(grantedTechniques(marginalizado).map((item) => item.name)).toEqual(["Esconder e prevenir"]);
    expect(grantedTechniques({ ...baseChar, specificSkill: "Buscar cobertura" }).map((item) => item.name)).toEqual([
      "Buscar Cobertura",
    ]);
  });

  it("keeps Saga choices outside A Aberração and the current archetype", () => {
    const options = borrowedSkillOptions("neo-cangaceiro");
    expect(options).toContain("Marotagem");
    expect(options).not.toContain("São amores");
    expect(options).not.toContain("Erro");
  });
});

describe("diceRules", () => {
  it("maps 2d6 totals to result bands", () => {
    expect(rollResultFromTotal(6)).toBe("FALHA");
    expect(rollResultFromTotal(7)).toBe("SUCESSO PARCIAL");
    expect(rollResultFromTotal(10)).toBe("SUCESSO COMPLETO");
  });
});
