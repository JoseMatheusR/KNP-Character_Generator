import { randomId } from "@/src/lib/randomId";
import { HOMEBREW_KEY } from "./keys";
import { loadJson, saveJson } from "./asyncJson";

export interface HomebrewSkill {
  id: string;
  name: string;
  description: string;
  type: "specific" | "combat-attack" | "combat-evade" | "combat-defend";
  archetypeId?: string;
}

export async function loadHomebrew(): Promise<HomebrewSkill[]> {
  return loadJson<HomebrewSkill[]>(HOMEBREW_KEY, []);
}

export async function addHomebrew(item: Omit<HomebrewSkill, "id">): Promise<HomebrewSkill> {
  const entry: HomebrewSkill = { ...item, id: randomId() };
  const all = [...(await loadHomebrew()), entry];
  await saveJson(HOMEBREW_KEY, all);
  return entry;
}

export async function updateHomebrew(id: string, data: Partial<Omit<HomebrewSkill, "id">>): Promise<void> {
  const all = (await loadHomebrew()).map((i) => (i.id === id ? { ...i, ...data } : i));
  await saveJson(HOMEBREW_KEY, all);
}

export async function removeHomebrew(id: string): Promise<void> {
  const all = (await loadHomebrew()).filter((i) => i.id !== id);
  await saveJson(HOMEBREW_KEY, all);
}
