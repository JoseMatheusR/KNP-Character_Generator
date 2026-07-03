import { useState, useCallback } from "react";
import type { StoredCharacter, CharacterFolder } from "@/types/auth";
import type { Character } from "@/types/character";

const CHARS_KEY = "kaos-characters";
const FOLDERS_KEY = "kaos-folders";

function loadChars(): StoredCharacter[] {
  try { return JSON.parse(localStorage.getItem(CHARS_KEY) || "[]"); } catch { return []; }
}
function saveChars(chars: StoredCharacter[]) {
  localStorage.setItem(CHARS_KEY, JSON.stringify(chars));
}
function loadFolders(): CharacterFolder[] {
  try { return JSON.parse(localStorage.getItem(FOLDERS_KEY) || "[]"); } catch { return []; }
}
function saveFolders(folders: CharacterFolder[]) {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

export function useCharacterStore(userId: string) {
  const [characters, setCharacters] = useState<StoredCharacter[]>(() => loadChars().filter((c) => c.userId === userId));
  const [folders, setFolders] = useState<CharacterFolder[]>(() => loadFolders().filter((f) => f.userId === userId));

  const refresh = useCallback(() => {
    setCharacters(loadChars().filter((c) => c.userId === userId));
    setFolders(loadFolders().filter((f) => f.userId === userId));
  }, [userId]);

  const addCharacter = useCallback((data: Character, folderId: string | null = null): string => {
    const id = crypto.randomUUID();
    const entry: StoredCharacter = { id, userId, folderId, createdAt: new Date().toISOString(), data };
    const all = [...loadChars(), entry];
    saveChars(all);
    setCharacters(all.filter((c) => c.userId === userId));
    return id;
  }, [userId]);

  const updateCharacter = useCallback((id: string, data: Partial<Character>) => {
    const all = loadChars().map((c) => c.id === id ? { ...c, data: { ...c.data, ...data } } : c);
    saveChars(all);
    setCharacters(all.filter((c) => c.userId === userId));
  }, [userId]);

  const deleteCharacter = useCallback((id: string) => {
    const all = loadChars().filter((c) => c.id !== id);
    saveChars(all);
    setCharacters(all.filter((c) => c.userId === userId));
  }, [userId]);

  const moveCharacter = useCallback((charId: string, folderId: string | null) => {
    const all = loadChars().map((c) => c.id === charId ? { ...c, folderId } : c);
    saveChars(all);
    setCharacters(all.filter((c) => c.userId === userId));
  }, [userId]);

  const addFolder = useCallback((name: string) => {
    const folder: CharacterFolder = { id: crypto.randomUUID(), name, userId };
    const all = [...loadFolders(), folder];
    saveFolders(all);
    setFolders(all.filter((f) => f.userId === userId));
  }, [userId]);

  const renameFolder = useCallback((folderId: string, name: string) => {
    const all = loadFolders().map((f) => f.id === folderId ? { ...f, name } : f);
    saveFolders(all);
    setFolders(all.filter((f) => f.userId === userId));
  }, [userId]);

  const deleteFolder = useCallback((folderId: string) => {
    // Move chars in folder to root
    const allChars = loadChars().map((c) => c.folderId === folderId ? { ...c, folderId: null } : c);
    saveChars(allChars);
    const allFolders = loadFolders().filter((f) => f.id !== folderId);
    saveFolders(allFolders);
    setCharacters(allChars.filter((c) => c.userId === userId));
    setFolders(allFolders.filter((f) => f.userId === userId));
  }, [userId]);

  return {
    characters, folders, refresh,
    addCharacter, updateCharacter, deleteCharacter, moveCharacter,
    addFolder, renameFolder, deleteFolder,
  };
}
