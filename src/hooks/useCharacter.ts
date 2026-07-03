import { useState, useCallback } from "react";
import type { Character, Attributes, AttributeKey } from "@/types/character";
import { NEGATIVE_CONDITIONS } from "@/data/gameData";

const CHARS_KEY = "kaos-characters";

function loadAll() {
  try { return JSON.parse(localStorage.getItem(CHARS_KEY) || "[]"); } catch { return []; }
}

export function useCharacter(charId?: string | null) {
  const [character, setCharacter] = useState<Character | null>(() => {
    if (!charId) return null;
    try {
      const all = loadAll();
      const found = all.find((c: any) => c.id === charId);
      return found ? found.data : null;
    } catch { return null; }
  });

  // Sync changes back to store
  const persistCharacter = useCallback((data: Character) => {
    if (!charId) return;
    const all = loadAll();
    const updated = all.map((c: any) => c.id === charId ? { ...c, data } : c);
    localStorage.setItem(CHARS_KEY, JSON.stringify(updated));
  }, [charId]);

  const updateAndPersist = useCallback((updater: (prev: Character | null) => Character | null) => {
    setCharacter((prev) => {
      const next = updater(prev);
      if (next && charId) {
        const all = loadAll();
        const updated = all.map((c: any) => c.id === charId ? { ...c, data: next } : c);
        localStorage.setItem(CHARS_KEY, JSON.stringify(updated));
      }
      return next;
    });
  }, [charId]);

  const saveCharacter = useCallback((c: Character) => {
    setCharacter(c);
    persistCharacter(c);
  }, [persistCharacter]);

  const resetCharacter = useCallback(() => {
    setCharacter(null);
  }, []);

  const updateHp = useCallback((delta: number) => {
    updateAndPersist((prev) => {
      if (!prev) return prev;
      const newHp = Math.max(0, Math.min(prev.baseHp, prev.currentHp + delta));
      return { ...prev, currentHp: newHp };
    });
  }, [updateAndPersist]);

  const toggleDamageMarker = useCallback((marker: string) => {
    updateAndPersist((prev) => {
      if (!prev) return prev;
      const markers = prev.damageMarkers.includes(marker)
        ? prev.damageMarkers.filter((m) => m !== marker)
        : [...prev.damageMarkers, marker];
      return { ...prev, damageMarkers: markers };
    });
  }, [updateAndPersist]);

  const toggleCondition = useCallback(
    (type: "negativeConditions" | "combatConditions" | "positiveConditions", condition: string) => {
      updateAndPersist((prev) => {
        if (!prev) return prev;
        const list = prev[type].includes(condition)
          ? prev[type].filter((c) => c !== condition)
          : [...prev[type], condition];
        return { ...prev, [type]: list };
      });
    },
    [updateAndPersist]
  );

  const getEffectiveAttributes = useCallback((): Attributes | null => {
    if (!character) return null;
    const base: Attributes = {
      foco: character.baseAttributes.foco + character.bonusAttributes.foco,
      vontade: character.baseAttributes.vontade + character.bonusAttributes.vontade,
      harmonia: character.baseAttributes.harmonia + character.bonusAttributes.harmonia,
      criatividade: character.baseAttributes.criatividade + character.bonusAttributes.criatividade,
    };

    const debuffs: Attributes = { foco: 0, vontade: 0, harmonia: 0, criatividade: 0 };
    for (const cond of NEGATIVE_CONDITIONS) {
      if (character.negativeConditions.includes(cond.label)) {
        for (const [key, val] of Object.entries(cond.effects)) {
          debuffs[key as AttributeKey] += val!;
        }
      }
    }

    return {
      foco: base.foco + debuffs.foco,
      vontade: base.vontade + debuffs.vontade,
      harmonia: base.harmonia + debuffs.harmonia,
      criatividade: base.criatividade + debuffs.criatividade,
    };
  }, [character]);

  const getDebuffs = useCallback((): Attributes => {
    const debuffs: Attributes = { foco: 0, vontade: 0, harmonia: 0, criatividade: 0 };
    if (!character) return debuffs;
    for (const cond of NEGATIVE_CONDITIONS) {
      if (character.negativeConditions.includes(cond.label)) {
        for (const [key, val] of Object.entries(cond.effects)) {
          debuffs[key as AttributeKey] += val!;
        }
      }
    }
    return debuffs;
  }, [character]);

  return {
    character,
    saveCharacter,
    resetCharacter,
    updateHp,
    toggleDamageMarker,
    toggleCondition,
    getEffectiveAttributes,
    getDebuffs,
  };
}
