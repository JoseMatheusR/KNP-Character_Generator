import { ARCHETYPES, SPECIFIC_SKILLS, COMBAT_TECHNIQUES, canSpendAttributePoint } from "./gameData";
import type { Character, AttributeKey, Attributes } from "./character";
import {
  borrowedSkillOptions,
  extraEvadeOptions,
  extraTechniqueOptions,
  needsBorrowedSkill,
  needsExtraEvade,
  needsExtraTechnique,
} from "./characterBuild";

const FIRST_NAMES = [
  "Zé", "Mariana", "Lampião", "Iracema", "Severino", "Dandara", "Cícero", "Jurema",
  "Antão", "Bento", "Quitéria", "Raul", "Inês", "Tertuliano", "Lia", "Caio",
  "Nyx-7", "K4os", "Vex", "Rua", "Solar", "Echo", "Mira", "Drax",
];

const LAST_NAMES = [
  "do Sertão", "da Caatinga", "Patos", "Neon", "de Ferro", "Kryptônio", "Mandacaru",
  "Asa-Branca", "Cangaço", "Vermelho", "Silva-9", "Cruz", "Fênix", "Patônio", "Glitch",
];

const ORIGINS = [
  "Refugiado das Zonas Áridas",
  "Ex-soldado da Guarda Corporativa",
  "Filho do Cangaço Digital",
  "Hacker das Periferias",
  "Sobrevivente do colapso de 2210",
  "Mensageiro dos becos de Nova Patos",
  "Engenheiro renegado da BioCorp",
  "Cantador errante das ruínas",
  "Caçador de recompensas autônomo",
  "Escapou do Centro de Reabilitação",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBonus(base: Attributes): Record<AttributeKey, number> {
  const keys: AttributeKey[] = ["foco", "vontade", "harmonia", "criatividade"];
  const bonus: Record<AttributeKey, number> = { foco: 0, vontade: 0, harmonia: 0, criatividade: 0 };
  let points = 2;
  let guard = 0;
  while (points > 0 && guard < 40) {
    guard += 1;
    const key = pick(keys);
    if (!canSpendAttributePoint(base, bonus, key)) continue;
    bonus[key] += 1;
    points -= 1;
  }
  return bonus;
}

export function generateRandomCharacter(): Character {
  const archetype = pick(ARCHETYPES);
  const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
  const origin = pick(ORIGINS);
  const specificSkill = pick(SPECIFIC_SKILLS[archetype.id] || [""]);
  const combatTechniques = {
    attack: pick(COMBAT_TECHNIQUES.attack.options),
    evade: pick(COMBAT_TECHNIQUES.evade.options),
    defend: pick(COMBAT_TECHNIQUES.defend.options),
    heal: pick(COMBAT_TECHNIQUES.heal.options),
  };
  const borrowedSkill = needsBorrowedSkill(specificSkill) ? pick(borrowedSkillOptions(archetype.id)) : null;
  const draft = {
    archetypeSkill: archetype.skill,
    specificSkill,
    borrowedSkill,
    combatTechniques,
  };

  return {
    name,
    origin,
    avatar: null,
    archetype: archetype.id,
    baseHp: archetype.hp,
    currentHp: archetype.hp,
    baseAttributes: { ...archetype.attributes },
    bonusAttributes: randomBonus(archetype.attributes),
    archetypeSkill: archetype.skill,
    specificSkill,
    borrowedSkill,
    extraEvadeTechnique: needsExtraEvade(draft) ? pick(extraEvadeOptions(combatTechniques.evade)) : null,
    extraTechnique: needsExtraTechnique(draft)
      ? (() => {
          const category = pick(["attack", "defend", "evade", "heal"] as const);
          return { category, name: pick(extraTechniqueOptions(category, combatTechniques[category])) };
        })()
      : null,
    combatTechniques,
    damageMarkers: [],
    negativeConditions: [],
    combatConditions: [],
    positiveConditions: [],
  };
}
