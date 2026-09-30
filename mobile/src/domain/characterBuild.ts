import type { Character } from "./character";
import { ARCHETYPES, COMBAT_TECHNIQUES, SPECIFIC_SKILLS } from "./gameData";

export const SAGA_SKILL = "Saga de um vaqueiro";
export const MAROTAGEM_SKILL = "Marotagem";
export const COVER_SKILL = "Buscar cobertura";
export const ASA_BRANCA_SKILL = "Asa Branca";
export const VEREADOR_SKILL = "Síndrome de Vereador";

export interface GrantedTechnique {
  name: string;
  category: "attack" | "evade" | "defend";
}

const GRANTED_BY_SKILL: Record<string, GrantedTechnique> = {
  [ASA_BRANCA_SKILL]: { name: "Esconder e prevenir", category: "evade" },
  [COVER_SKILL]: { name: "Buscar Cobertura", category: "defend" },
};

export function skillNames(character: Pick<Character, "archetypeSkill" | "specificSkill" | "borrowedSkill">): string[] {
  return [character.archetypeSkill, character.specificSkill, character.borrowedSkill].filter(
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

export function normalizeCharacterBuild(character: Character): Character {
  const borrowedSkill = needsBorrowedSkill(character.specificSkill) ? character.borrowedSkill || null : null;
  const draft = { ...character, borrowedSkill };
  const extraEvadeTechnique =
    needsExtraEvade(draft) &&
    draft.extraEvadeTechnique &&
    draft.extraEvadeTechnique !== draft.combatTechniques.evade
      ? draft.extraEvadeTechnique
      : null;
  return { ...draft, extraEvadeTechnique };
}
