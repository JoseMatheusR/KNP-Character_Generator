import { describe, it, expect } from "vitest";
import { borrowedSkillOptions, grantedTechniques, harmoniaFromSkills, needsExtraEvade, needsExtraTechnique, vontadeFromSkills } from "@/src/domain/characterBuild";
import { canSpendAttributePoint } from "@/src/domain/gameData";
import { isValidBonusDistribution, getEffectiveAttributes } from "@/src/domain/characterRules";
import { attributeRollModifier, rollResultFromTotal } from "@/src/domain/diceRules";
import { buildArchive, mergeArchive, parseArchive } from "@/src/lib/archiveBackup";
import { decodeCharacterQr, encodeCharacterQr } from "@/src/lib/characterQr";
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
  combatTechniques: { attack: "a", evade: "e", defend: "d", heal: "Sincronizar Pulso" },
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

  it("applies the full sheet conditions that change attributes", () => {
    const desperate = {
      ...baseChar,
      negativeConditions: ["Desesperado", "Entorpecido"],
      positiveConditions: ["Focado"],
    };
    const eff = getEffectiveAttributes(desperate);
    expect(eff.foco).toBe(baseChar.baseAttributes.foco + baseChar.bonusAttributes.foco - 1 - 2 + 1);
    expect(eff.vontade).toBe(baseChar.baseAttributes.vontade + baseChar.bonusAttributes.vontade - 1 - 2);
    expect(eff.harmonia).toBe(baseChar.baseAttributes.harmonia - 1);
    expect(eff.criatividade).toBe(-1);
  });

  it("adds permanent harmonia from Síndrome de Vereador", () => {
    const vereador = { ...baseChar, specificSkill: "Síndrome de Vereador" };
    expect(harmoniaFromSkills(vereador)).toBe(1);
    expect(getEffectiveAttributes(vereador).harmonia).toBe(baseChar.baseAttributes.harmonia + 1);
  });

  it("lets Reza Braba raise Vontade past the creation cap", () => {
    const fiel = { ...baseChar, specificSkill: "Reza Braba" };
    expect(vontadeFromSkills(fiel)).toBe(1);
    expect(getEffectiveAttributes(fiel).vontade).toBe(baseChar.baseAttributes.vontade + baseChar.bonusAttributes.vontade + 1 - 2);
  });

  it("keeps a creation bonus inside the attribute limit of 3", () => {
    const artista = { foco: -2, vontade: 0, harmonia: 1, criatividade: 2 };
    expect(canSpendAttributePoint(artista, { foco: 0, vontade: 0, harmonia: 0, criatividade: 0 }, "criatividade")).toBe(true);
    expect(canSpendAttributePoint(artista, { foco: 0, vontade: 0, harmonia: 0, criatividade: 1 }, "criatividade")).toBe(false);
    expect(canSpendAttributePoint(artista, { foco: 0, vontade: 0, harmonia: 0, criatividade: 0 }, "foco")).toBe(true);
  });

  it("grants techniques and an extra evade choice for build skills", () => {
    const marginalizado = {
      ...baseChar,
      archetypeSkill: "Asa Branca",
      specificSkill: "Marotagem",
      combatTechniques: { attack: "Investida", evade: "Sentir o Ambiente", defend: "Proteger", heal: "Sincronizar Pulso" },
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

  it("asks A Guarda for one extra technique of any type", () => {
    expect(needsExtraTechnique({ ...baseChar, archetypeSkill: "Kryptônia" })).toBe(true);
    expect(needsExtraTechnique(baseChar)).toBe(false);
  });
});

describe("characterQr", () => {
  it("round-trips a character and drops the avatar", () => {
    const encoded = encodeCharacterQr({ ...baseChar, avatar: "data:image/png;base64,abc", notes: "linha\n2" });
    const decoded = decodeCharacterQr(`  ${encoded}\n`);
    expect(decoded.character.name).toBe(baseChar.name);
    expect(decoded.character.avatar).toBeNull();
    expect(decoded.character.notes).toBe("linha\n2");
    expect(decoded.character.negativeConditions).toEqual(["Medo"]);
    expect(decoded.homebrew).toEqual([]);
  });

  it("carries the homebrew descriptions used by the character", () => {
    const homebrew = [
      {
        id: "1",
        name: "spec",
        description: "Perícia da casa",
        type: "specific" as const,
        archetypeId: "neo-cangaceiro",
      },
      { id: "2", name: "Outra", description: "Não entra", type: "specific" as const },
    ];
    const decoded = decodeCharacterQr(encodeCharacterQr(baseChar, homebrew));
    expect(decoded.homebrew).toEqual([
      { name: "spec", description: "Perícia da casa", type: "specific", archetypeId: "neo-cangaceiro" },
    ]);
  });

  it("rejects codes that are not a Kaos sheet", () => {
    expect(() => decodeCharacterQr("https://example.com")).toThrow(/não é uma ficha/);
    expect(() => decodeCharacterQr("knp:1:{")).toThrow(/não é uma ficha/);
  });
});

describe("archiveBackup", () => {
  const snapshot = {
    folders: [{ id: "pasta", name: "Mesa", userId: "guest-local" }],
    characters: [
      {
        id: "ficha",
        userId: "guest-local",
        folderId: "pasta",
        createdAt: "2026-01-01T00:00:00.000Z",
        data: baseChar,
      },
    ],
    homebrew: [{ id: "hb", name: "Golpe da casa", description: "Dano extra", type: "combat-attack" as const }],
  };

  it("restores missing records and skips ones already on the device", () => {
    const backup = parseArchive(JSON.stringify(buildArchive(snapshot, "2026-09-30T00:00:00.000Z")));
    const merged = mergeArchive({ folders: [], characters: [], homebrew: [] }, backup, "guest-local");
    expect(merged.addedCharacters).toBe(1);
    expect(merged.addedFolders).toBe(1);
    expect(merged.addedHomebrew).toBe(1);
    expect(merged.characters[0].data.avatar).toBeNull();

    const again = mergeArchive(merged, backup, "guest-local");
    expect(again.addedCharacters).toBe(0);
    expect(again.addedFolders).toBe(0);
    expect(again.addedHomebrew).toBe(0);
  });
});

describe("diceRules", () => {
  it("adds the attribute and the next-roll conditions", () => {
    expect(attributeRollModifier("foco", 2, [])).toBe(2);
    expect(attributeRollModifier("foco", 2, ["Favorecido"])).toBe(4);
    expect(attributeRollModifier("vontade", 1, ["Resoluto"])).toBe(3);
    expect(attributeRollModifier("criatividade", 1, ["Resoluto"])).toBe(1);
  });

  it("maps 2d6 totals to result bands", () => {
    expect(rollResultFromTotal(6)).toBe("FALHA");
    expect(rollResultFromTotal(7)).toBe("SUCESSO PARCIAL");
    expect(rollResultFromTotal(10)).toBe("SUCESSO COMPLETO");
  });
});
