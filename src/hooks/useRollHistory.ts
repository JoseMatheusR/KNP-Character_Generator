import { useCallback, useEffect, useState } from "react";

const KEY = "kaos-roll-history";
const MAX_ENTRIES = 50;

export interface RollEntry {
  id: string;
  timestamp: number;
  d1: number;
  d2: number;
  total: number;
  result: "FALHA" | "SUCESSO PARCIAL" | "SUCESSO COMPLETO";
}

function load(): RollEntry[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

function save(entries: RollEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event("kaos-rolls-changed"));
}

export function useRollHistory() {
  const [entries, setEntries] = useState<RollEntry[]>(() => load());

  useEffect(() => {
    const onChange = () => setEntries(load());
    window.addEventListener("kaos-rolls-changed", onChange);
    return () => window.removeEventListener("kaos-rolls-changed", onChange);
  }, []);

  const addRoll = useCallback((d1: number, d2: number) => {
    const total = d1 + d2;
    const result: RollEntry["result"] =
      total <= 6 ? "FALHA" : total <= 9 ? "SUCESSO PARCIAL" : "SUCESSO COMPLETO";
    const entry: RollEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      d1, d2, total, result,
    };
    const next = [entry, ...load()].slice(0, MAX_ENTRIES);
    save(next);
    setEntries(next);
  }, []);

  const clear = useCallback(() => {
    save([]);
    setEntries([]);
  }, []);

  return { entries, addRoll, clear };
}
