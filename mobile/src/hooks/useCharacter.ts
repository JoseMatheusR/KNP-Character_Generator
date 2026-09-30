import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import type { Character } from "@/src/domain/character";
import { normalizeCharacterBuild } from "@/src/domain/characterBuild";
import { getDebuffs, getEffectiveAttributes, toggleSheetCondition } from "@/src/domain/characterRules";
import * as charStorage from "@/src/storage/characters";

export function useCharacter(charId: string) {
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const stored = await charStorage.getCharacterById(charId);
    setCharacter(stored ? normalizeCharacterBuild(stored.data) : null);
    setLoading(false);
  }, [charId]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const saveCharacter = useCallback(
    async (data: Character) => {
      const next = normalizeCharacterBuild(data);
      setCharacter(next);
      await charStorage.updateCharacterData(charId, next);
    },
    [charId]
  );

  const updateHp = useCallback(
    async (delta: number) => {
      if (!character) return;
      const newHp = Math.max(0, Math.min(character.baseHp, character.currentHp + delta));
      await saveCharacter({ ...character, currentHp: newHp });
    },
    [character, saveCharacter]
  );

  const toggleDamageMarker = useCallback(
    async (marker: string) => {
      if (!character) return;
      const markers = character.damageMarkers.includes(marker)
        ? character.damageMarkers.filter((m) => m !== marker)
        : [...character.damageMarkers, marker];
      await saveCharacter({ ...character, damageMarkers: markers });
    },
    [character, saveCharacter]
  );

  const toggleCondition = useCallback(
    async (
      type: "negativeConditions" | "combatConditions" | "positiveConditions",
      condition: string
    ) => {
      if (!character) return;
      await saveCharacter(toggleSheetCondition(character, type, condition));
    },
    [character, saveCharacter]
  );

  return {
    character,
    loading,
    reload,
    saveCharacter,
    updateHp,
    toggleDamageMarker,
    toggleCondition,
    getEffectiveAttributes: () => (character ? getEffectiveAttributes(character) : null),
    getDebuffs: () => (character ? getDebuffs(character) : null),
  };
}
