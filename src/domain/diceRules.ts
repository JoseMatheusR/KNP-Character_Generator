import type { AttributeKey } from "./character";

export type RollResult = "FALHA" | "SUCESSO PARCIAL" | "SUCESSO COMPLETO";

export function attributeRollModifier(
  attribute: AttributeKey,
  attributeValue: number,
  conditions: string[]
): number {
  let modifier = attributeValue;
  if (conditions.includes("Favorecido")) modifier += 2;
  if (conditions.includes("Resoluto") && (attribute === "vontade" || attribute === "harmonia")) modifier += 2;
  return modifier;
}

export function rollResultFromTotal(total: number): RollResult {
  if (total <= 6) return "FALHA";
  if (total <= 9) return "SUCESSO PARCIAL";
  return "SUCESSO COMPLETO";
}
