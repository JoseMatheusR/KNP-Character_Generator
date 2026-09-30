import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import * as homebrewStorage from "@/src/storage/homebrew";
import type { HomebrewSkill } from "@/src/storage/homebrew";

export function useHomebrew() {
  const [items, setItems] = useState<HomebrewSkill[]>([]);

  const refresh = useCallback(async () => {
    setItems(await homebrewStorage.loadHomebrew());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const add = useCallback(
    async (item: Omit<HomebrewSkill, "id">) => {
      const entry = await homebrewStorage.addHomebrew(item);
      await refresh();
      return entry;
    },
    [refresh]
  );

  const update = useCallback(
    async (id: string, data: Partial<Omit<HomebrewSkill, "id">>) => {
      await homebrewStorage.updateHomebrew(id, data);
      await refresh();
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      await homebrewStorage.removeHomebrew(id);
      await refresh();
    },
    [refresh]
  );

  const getSpecificSkills = useCallback(
    (archetypeId?: string) =>
      items.filter(
        (i) =>
          i.type === "specific" &&
          (!archetypeId || !i.archetypeId || i.archetypeId === archetypeId)
      ),
    [items]
  );

  const getCombatTechniques = useCallback(
    (category: "attack" | "evade" | "defend") =>
      items.filter((i) => i.type === `combat-${category}`),
    [items]
  );

  return { items, add, update, remove, refresh, getSpecificSkills, getCombatTechniques };
}
