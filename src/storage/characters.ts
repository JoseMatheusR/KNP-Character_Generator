import type { Character } from "@/src/domain/character";
import type { CharacterFolder, StoredCharacter } from "@/src/domain/auth";
import { randomId } from "@/src/lib/randomId";
import { CHARS_KEY, FOLDERS_KEY } from "./keys";
import { loadJson, saveJson } from "./asyncJson";

export async function loadAllCharacters(): Promise<StoredCharacter[]> {
  return loadJson<StoredCharacter[]>(CHARS_KEY, []);
}

export async function loadCharactersForUser(userId: string): Promise<StoredCharacter[]> {
  const all = await loadAllCharacters();
  return all.filter((c) => c.userId === userId);
}

export async function loadAllFolders(): Promise<CharacterFolder[]> {
  return loadJson<CharacterFolder[]>(FOLDERS_KEY, []);
}

export async function loadFoldersForUser(userId: string): Promise<CharacterFolder[]> {
  const all = await loadAllFolders();
  return all.filter((f) => f.userId === userId);
}

export async function getCharacterById(charId: string): Promise<StoredCharacter | null> {
  const all = await loadAllCharacters();
  return all.find((c) => c.id === charId) ?? null;
}

export async function addCharacter(
  userId: string,
  data: Character,
  folderId: string | null = null
): Promise<string> {
  const id = randomId();
  const entry: StoredCharacter = {
    id,
    userId,
    folderId,
    createdAt: new Date().toISOString(),
    data,
  };
  const all = [...(await loadAllCharacters()), entry];
  await saveJson(CHARS_KEY, all);
  return id;
}

export async function updateCharacterData(charId: string, data: Character): Promise<void> {
  const all = await loadAllCharacters();
  const updated = all.map((c) => (c.id === charId ? { ...c, data } : c));
  await saveJson(CHARS_KEY, updated);
}

export async function patchCharacterData(charId: string, patch: Partial<Character>): Promise<void> {
  const all = await loadAllCharacters();
  const updated = all.map((c) =>
    c.id === charId ? { ...c, data: { ...c.data, ...patch } } : c
  );
  await saveJson(CHARS_KEY, updated);
}

export async function deleteCharacter(charId: string): Promise<void> {
  const all = (await loadAllCharacters()).filter((c) => c.id !== charId);
  await saveJson(CHARS_KEY, all);
}

export async function moveCharacter(charId: string, folderId: string | null): Promise<void> {
  const all = await loadAllCharacters();
  const updated = all.map((c) => (c.id === charId ? { ...c, folderId } : c));
  await saveJson(CHARS_KEY, updated);
}

export async function addFolder(userId: string, name: string): Promise<CharacterFolder> {
  const folder: CharacterFolder = { id: randomId(), name, userId };
  const all = [...(await loadAllFolders()), folder];
  await saveJson(FOLDERS_KEY, all);
  return folder;
}

export async function renameFolder(folderId: string, name: string): Promise<void> {
  const all = await loadAllFolders();
  const updated = all.map((f) => (f.id === folderId ? { ...f, name } : f));
  await saveJson(FOLDERS_KEY, updated);
}

export async function deleteFolder(folderId: string): Promise<void> {
  const allChars = (await loadAllCharacters()).map((c) =>
    c.folderId === folderId ? { ...c, folderId: null } : c
  );
  await saveJson(CHARS_KEY, allChars);
  const allFolders = (await loadAllFolders()).filter((f) => f.id !== folderId);
  await saveJson(FOLDERS_KEY, allFolders);
}
