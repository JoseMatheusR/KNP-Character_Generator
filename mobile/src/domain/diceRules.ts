export type RollResult = "FALHA" | "SUCESSO PARCIAL" | "SUCESSO COMPLETO";

export function rollResultFromTotal(total: number): RollResult {
  if (total <= 6) return "FALHA";
  if (total <= 9) return "SUCESSO PARCIAL";
  return "SUCESSO COMPLETO";
}
