import type { Character, ExtraTechnique, TechniqueCategory } from "@/types/character";
import { ARCHETYPES, COMBAT_TECHNIQUES, SPECIFIC_SKILLS, TECHNIQUE_CATEGORIES } from "@/data/gameData";

export const SAGA_SKILL = "Saga de um vaqueiro";
export const MAROTAGEM_SKILL = "Marotagem";
export const COVER_SKILL = "Buscar cobertura";
export const ASA_BRANCA_SKILL = "Asa Branca";
export const VEREADOR_SKILL = "Síndrome de Vereador";
export const REZA_SKILL = "Reza Braba";
export const KRYPTONIA_SKILL = "Kryptônia";
const LEGACY_CALM_SKILL = "Voz calma";
const CALM_SKILL = "Perfil Calmo";

export interface GrantedTechnique {
  name: string;
  category: TechniqueCategory;
}

const GRANTED_BY_SKILL: Record<string, GrantedTechnique> = {
  [ASA_BRANCA_SKILL]: { name: "Esconder e prevenir", category: "evade" },
  [COVER_SKILL]: { name: "Buscar Cobertura", category: "defend" },
};

function renamedSkill(name: string | null | undefined): string | null {
  if (!name) return null;
  return name === LEGACY_CALM_SKILL ? CALM_SKILL : name;
}

export function skillNames(character: Pick<Character, "archetypeSkill" | "specificSkill" | "borrowedSkill">): string[] {
  return [character.archetypeSkill, renamedSkill(character.specificSkill), renamedSkill(character.borrowedSkill)].filter(
    (name): name is string => !!name
  );
}

export function borrowedSkillOptions(archetypeId: string): string[] {
  return ARCHETYPES.filter((archetype) => archetype.id !== archetypeId && archetype.id !== "aberracao").flatMap(
    (archetype) => SPECIFIC_SKILLS[archetype.id] ?? []
  );
}

export function needsBorrowedSkill(specificSkill: string): boolean {
  return specificSkill === SAGA_SKILL;
}

export function needsExtraEvade(character: Pick<Character, "archetypeSkill" | "specificSkill" | "borrowedSkill">): boolean {
  return skillNames(character).includes(MAROTAGEM_SKILL);
}

export function extraEvadeOptions(primaryEvade: string): string[] {
  return COMBAT_TECHNIQUES.evade.options.filter((option) => option !== primaryEvade);
}

export function needsExtraTechnique(
  character: Pick<Character, "archetypeSkill" | "specificSkill" | "borrowedSkill">
): boolean {
  return skillNames(character).includes(KRYPTONIA_SKILL);
}

export function extraTechniqueOptions(category: TechniqueCategory, primaryName: string): string[] {
  return COMBAT_TECHNIQUES[category].options.filter((option) => option !== primaryName);
}

export function isValidExtraTechnique(
  techniques: Character["combatTechniques"],
  extra: ExtraTechnique | null | undefined
): extra is ExtraTechnique {
  if (!extra || !TECHNIQUE_CATEGORIES.includes(extra.category)) return false;
  return extraTechniqueOptions(extra.category, techniques[extra.category] ?? "").includes(extra.name);
}

export function grantedTechniques(
  character: Pick<Character, "archetypeSkill" | "specificSkill" | "borrowedSkill">
): GrantedTechnique[] {
  const granted: GrantedTechnique[] = [];
  for (const name of skillNames(character)) {
    const technique = GRANTED_BY_SKILL[name];
    if (technique && !granted.some((item) => item.name === technique.name)) granted.push(technique);
  }
  return granted;
}

export function harmoniaFromSkills(
  character: Pick<Character, "archetypeSkill" | "specificSkill" | "borrowedSkill">
): number {
  return skillNames(character).includes(VEREADOR_SKILL) ? 1 : 0;
}

export function vontadeFromSkills(
  character: Pick<Character, "archetypeSkill" | "specificSkill" | "borrowedSkill">
): number {
  return skillNames(character).includes(REZA_SKILL) ? 1 : 0;
}

export function normalizeCharacterBuild(character: Character): Character {
  const specificSkill = renamedSkill(character.specificSkill) ?? character.specificSkill;
  const borrowedSkill = needsBorrowedSkill(specificSkill) ? renamedSkill(character.borrowedSkill) : null;
  const combatTechniques = {
    attack: character.combatTechniques?.attack ?? "",
    evade: character.combatTechniques?.evade ?? "",
    defend: character.combatTechniques?.defend ?? "",
    heal: character.combatTechniques?.heal ?? "",
  };
  const draft = { ...character, specificSkill, borrowedSkill, combatTechniques };
  const extraEvadeTechnique =
    needsExtraEvade(draft) &&
    draft.extraEvadeTechnique &&
    draft.extraEvadeTechnique !== draft.combatTechniques.evade
      ? draft.extraEvadeTechnique
      : null;
  const extraTechnique = needsExtraTechnique(draft) && isValidExtraTechnique(combatTechniques, draft.extraTechnique)
    ? draft.extraTechnique
    : null;
  return { ...draft, extraEvadeTechnique, extraTechnique };
}
