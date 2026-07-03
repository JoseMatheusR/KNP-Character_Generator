import { ARCHETYPES, SPECIFIC_SKILLS, COMBAT_TECHNIQUES } from "@/data/gameData";
import type { Character, AttributeKey } from "@/types/character";

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

function randomBonus(): Record<AttributeKey, number> {
  // Distribute 2 bonus points across 4 attributes (each 0, 1 or 2)
  const keys: AttributeKey[] = ["foco", "vontade", "harmonia", "criatividade"];
  const bonus: Record<AttributeKey, number> = { foco: 0, vontade: 0, harmonia: 0, criatividade: 0 };
  let points = 2;
  while (points > 0) {
    const k = pick(keys);
    if (bonus[k] < 2) {
      bonus[k]++;
      points--;
    }
  }
  return bonus;
}

export function generateRandomCharacter(): Character {
  const archetype = pick(ARCHETYPES);
  const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
  const origin = pick(ORIGINS);
  const specificSkill = pick(SPECIFIC_SKILLS[archetype.id] || [""]);

  return {
    name,
    origin,
    avatar: null,
    archetype: archetype.id,
    baseHp: archetype.hp,
    currentHp: archetype.hp,
    baseAttributes: { ...archetype.attributes },
    bonusAttributes: randomBonus(),
    archetypeSkill: archetype.skill,
    specificSkill,
    combatTechniques: {
      attack: pick(COMBAT_TECHNIQUES.attack.options),
      evade: pick(COMBAT_TECHNIQUES.evade.options),
      defend: pick(COMBAT_TECHNIQUES.defend.options),
    },
    damageMarkers: [],
    negativeConditions: [],
    combatConditions: [],
    positiveConditions: [],
  };
}
