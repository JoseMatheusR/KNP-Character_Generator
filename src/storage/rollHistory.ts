import { randomId } from "@/src/lib/randomId";
import { ROLL_HISTORY_KEY } from "./keys";
import { loadJson, saveJson } from "./asyncJson";
import { rollResultFromTotal, type RollResult } from "@/src/domain/diceRules";

const MAX_ENTRIES = 50;

export interface RollEntry {
  id: string;
  timestamp: number;
  d1: number;
  d2: number;
  total: number;
  result: RollResult;
  attribute?: string;
  modifier?: number;
}

export async function loadRollHistory(): Promise<RollEntry[]> {
  return loadJson<RollEntry[]>(ROLL_HISTORY_KEY, []);
}

export async function addRoll(
  d1: number,
  d2: number,
  details?: { attribute?: string; modifier?: number }
): Promise<RollEntry> {
  const modifier = details?.modifier ?? 0;
  const total = d1 + d2 + modifier;
  const entry: RollEntry = {
    id: randomId(),
    timestamp: Date.now(),
    d1,
    d2,
    modifier,
    attribute: details?.attribute,
    total,
    result: rollResultFromTotal(total),
  };
  const all = [entry, ...(await loadRollHistory())].slice(0, MAX_ENTRIES);
  await saveJson(ROLL_HISTORY_KEY, all);
  return entry;
}

export async function clearRollHistory(): Promise<void> {
  await saveJson(ROLL_HISTORY_KEY, []);
}
