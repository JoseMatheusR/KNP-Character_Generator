import { useState, useCallback } from "react";

export interface HomebrewSkill {
  id: string;
  name: string;
  description: string;
  type: "specific" | "combat-attack" | "combat-evade" | "combat-defend";
  archetypeId?: string; // only for specific skills
}

const HOMEBREW_KEY = "kaos-homebrew";

function load(): HomebrewSkill[] {
  try { return JSON.parse(localStorage.getItem(HOMEBREW_KEY) || "[]"); } catch { return []; }
}
function save(items: HomebrewSkill[]) {
  localStorage.setItem(HOMEBREW_KEY, JSON.stringify(items));
}

export function useHomebrew() {
  const [items, setItems] = useState<HomebrewSkill[]>(load);

  const refresh = useCallback(() => setItems(load()), []);

  const add = useCallback((item: Omit<HomebrewSkill, "id">) => {
    const entry: HomebrewSkill = { ...item, id: crypto.randomUUID() };
    const all = [...load(), entry];
    save(all);
    setItems(all);
    return entry;
  }, []);

  const update = useCallback((id: string, data: Partial<Omit<HomebrewSkill, "id">>) => {
    const all = load().map((i) => i.id === id ? { ...i, ...data } : i);
    save(all);
    setItems(all);
  }, []);

  const remove = useCallback((id: string) => {
    const all = load().filter((i) => i.id !== id);
    save(all);
    setItems(all);
  }, []);

  const getSpecificSkills = useCallback((archetypeId?: string) => {
    return items.filter((i) => i.type === "specific" && (!archetypeId || !i.archetypeId || i.archetypeId === archetypeId));
  }, [items]);

  const getCombatTechniques = useCallback((category: "attack" | "evade" | "defend") => {
    return items.filter((i) => i.type === `combat-${category}`);
  }, [items]);

  return { items, add, update, remove, refresh, getSpecificSkills, getCombatTechniques };
}
