import type { Attributes, Character, ExtraTechnique, TechniqueCategory } from "@/src/domain/character";
import { normalizeCharacterBuild } from "@/src/domain/characterBuild";
import type { HomebrewSkill } from "@/src/storage/homebrew";

const PREFIX = "knp:1:";

export interface SharedHomebrew {
  name: string;
  description: string;
  type: HomebrewSkill["type"];
  archetypeId?: string;
}

export interface DecodedCharacterQr {
  character: Character;
  homebrew: SharedHomebrew[];
}

function isAttributes(value: unknown): value is Attributes {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (["foco", "vontade", "harmonia", "criatividade"] as const).every(
    (key) => typeof record[key] === "number" && Number.isFinite(record[key])
  );
}

function stringList(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) return null;
  return value;
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

export function homebrewForCharacter(character: Character, items: HomebrewSkill[]): SharedHomebrew[] {
  const names = new Set(
    [
      character.specificSkill,
      character.borrowedSkill,
      character.combatTechniques.attack,
      character.combatTechniques.evade,
      character.combatTechniques.defend,
      character.combatTechniques.heal,
      character.extraEvadeTechnique,
      character.extraTechnique?.name,
    ].filter((name): name is string => !!name)
  );
  return items
    .filter((item) => names.has(item.name))
    .map(({ name, description, type, archetypeId }) => ({
      name,
      description,
      type,
      ...(archetypeId ? { archetypeId } : {}),
    }));
}

export function encodeCharacterQr(character: Character, homebrew: HomebrewSkill[] = []): string {
  const sheet = { ...character, avatar: null };
  const shared = homebrewForCharacter(character, homebrew);
  const payload = shared.length > 0 ? { character: sheet, homebrew: shared } : sheet;
  return `${PREFIX}${JSON.stringify(payload)}`;
}

function sharedHomebrew(value: unknown): SharedHomebrew[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const type = record.type;
    if (
      typeof record.name !== "string" ||
      !record.name ||
      typeof record.description !== "string" ||
      (type !== "specific" &&
        type !== "combat-attack" &&
        type !== "combat-evade" &&
        type !== "combat-defend" &&
        type !== "combat-heal")
    ) {
      return [];
    }
    return [
      {
        name: record.name,
        description: record.description,
        type,
        ...(typeof record.archetypeId === "string" && record.archetypeId ? { archetypeId: record.archetypeId } : {}),
      },
    ];
  });
}

export function decodeCharacterQr(raw: string): DecodedCharacterQr {
  const text = raw.trim();
  if (!text.startsWith(PREFIX)) {
    throw new Error("Este QR não é uma ficha do Kaos.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text.slice(PREFIX.length));
  } catch {
    throw new Error("Este QR não é uma ficha do Kaos.");
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Este QR não é uma ficha do Kaos.");
  }

  const envelope = parsed as Record<string, unknown>;
  const data =
    envelope.character && typeof envelope.character === "object"
      ? (envelope.character as Record<string, unknown>)
      : envelope;
  const techniques = data.combatTechniques as Record<string, unknown> | undefined;
  const damageMarkers = stringList(data.damageMarkers);
  const negativeConditions = stringList(data.negativeConditions);
  const combatConditions = stringList(data.combatConditions);
  const positiveConditions = stringList(data.positiveConditions);
  if (
    typeof data.name !== "string" ||
    !data.name.trim() ||
    typeof data.origin !== "string" ||
    typeof data.archetype !== "string" ||
    !data.archetype ||
    typeof data.baseHp !== "number" ||
    typeof data.currentHp !== "number" ||
    !isAttributes(data.baseAttributes) ||
    !isAttributes(data.bonusAttributes) ||
    typeof data.archetypeSkill !== "string" ||
    typeof data.specificSkill !== "string" ||
    !techniques ||
    typeof techniques.attack !== "string" ||
    typeof techniques.evade !== "string" ||
    typeof techniques.defend !== "string" ||
    (techniques.heal !== undefined && typeof techniques.heal !== "string") ||
    !damageMarkers ||
    !negativeConditions ||
    !combatConditions ||
    !positiveConditions
  ) {
    throw new Error("A ficha neste QR está incompleta.");
  }

  const extra = data.extraTechnique;
  const extraTechnique: ExtraTechnique | null =
    extra &&
    typeof extra === "object" &&
    typeof (extra as ExtraTechnique).name === "string" &&
    typeof (extra as ExtraTechnique).category === "string"
      ? {
          category: (extra as ExtraTechnique).category as TechniqueCategory,
          name: (extra as ExtraTechnique).name,
        }
      : null;

  return {
    character: normalizeCharacterBuild({
      name: data.name,
      origin: data.origin,
      avatar: null,
      archetype: data.archetype,
      baseHp: data.baseHp,
      currentHp: data.currentHp,
      baseAttributes: data.baseAttributes,
      bonusAttributes: data.bonusAttributes,
      archetypeSkill: data.archetypeSkill,
      specificSkill: data.specificSkill,
      combatTechniques: {
        attack: techniques.attack,
        evade: techniques.evade,
        defend: techniques.defend,
        heal: typeof techniques.heal === "string" ? techniques.heal : "",
      },
      borrowedSkill: optionalString(data.borrowedSkill),
      extraEvadeTechnique: optionalString(data.extraEvadeTechnique),
      extraTechnique,
      damageMarkers,
      negativeConditions,
      combatConditions,
      positiveConditions,
      notes: typeof data.notes === "string" ? data.notes : undefined,
    }),
    homebrew: envelope.character ? sharedHomebrew(envelope.homebrew) : [],
  };
}
