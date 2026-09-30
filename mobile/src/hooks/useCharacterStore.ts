import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import type { Character } from "@/src/domain/character";
import type { CharacterFolder, StoredCharacter } from "@/src/domain/auth";
import * as charStorage from "@/src/storage/characters";

export function useCharacterStore(userId: string) {
  const [characters, setCharacters] = useState<StoredCharacter[]>([]);
  const [folders, setFolders] = useState<CharacterFolder[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [chars, flds] = await Promise.all([
      charStorage.loadCharactersForUser(userId),
      charStorage.loadFoldersForUser(userId),
    ]);
    setCharacters(chars);
    setFolders(flds);
    setLoading(false);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const addCharacter = useCallback(
    async (data: Character, folderId: string | null = null) => {
      const id = await charStorage.addCharacter(userId, data, folderId);
      await refresh();
      return id;
    },
    [userId, refresh]
  );

  const updateCharacter = useCallback(
    async (id: string, patch: Partial<Character>) => {
      await charStorage.patchCharacterData(id, patch);
      await refresh();
    },
    [refresh]
  );

  const deleteCharacter = useCallback(
    async (id: string) => {
      await charStorage.deleteCharacter(id);
      await refresh();
    },
    [refresh]
  );

  const moveCharacter = useCallback(
    async (charId: string, folderId: string | null) => {
      await charStorage.moveCharacter(charId, folderId);
      await refresh();
    },
    [refresh]
  );

  const addFolder = useCallback(
    async (name: string) => {
      await charStorage.addFolder(userId, name);
      await refresh();
    },
    [userId, refresh]
  );

  const renameFolder = useCallback(
    async (folderId: string, name: string) => {
      await charStorage.renameFolder(folderId, name);
      await refresh();
    },
    [refresh]
  );

  const deleteFolder = useCallback(
    async (folderId: string) => {
      await charStorage.deleteFolder(folderId);
      await refresh();
    },
    [refresh]
  );

  return {
    characters,
    folders,
    loading,
    refresh,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    moveCharacter,
    addFolder,
    renameFolder,
    deleteFolder,
  };
}
