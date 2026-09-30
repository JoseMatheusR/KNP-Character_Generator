import type { Character } from "@/src/domain/character";
import type { CharacterFolder, StoredCharacter } from "@/src/domain/auth";
import { decodeCharacterQr, encodeCharacterQr } from "@/src/lib/characterQr";
import type { HomebrewSkill } from "@/src/storage/homebrew";

export interface ArchiveBackup {
  version: 1;
  exportedAt: string;
  folders: Pick<CharacterFolder, "id" | "name">[];
  characters: (Pick<StoredCharacter, "id" | "folderId" | "createdAt"> & { data: Character })[];
  homebrew: HomebrewSkill[];
}

export interface ArchiveSnapshot {
  folders: CharacterFolder[];
  characters: StoredCharacter[];
  homebrew: HomebrewSkill[];
}

export interface ArchiveMergeResult {
  folders: CharacterFolder[];
  characters: StoredCharacter[];
  homebrew: HomebrewSkill[];
  addedFolders: number;
  addedCharacters: number;
  addedHomebrew: number;
}

export function buildArchive(snapshot: ArchiveSnapshot, exportedAt: string): ArchiveBackup {
  return {
    version: 1,
    exportedAt,
    folders: snapshot.folders.map(({ id, name }) => ({ id, name })),
    characters: snapshot.characters.map(({ id, folderId, createdAt, data }) => ({
      id,
      folderId,
      createdAt,
      data: { ...data, avatar: null },
    })),
    homebrew: snapshot.homebrew,
  };
}

export function parseArchive(raw: string): ArchiveBackup {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Este arquivo não é um backup do Kaos.");
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Este arquivo não é um backup do Kaos.");
  }
  const data = parsed as Record<string, unknown>;
  if (data.version !== 1 || !Array.isArray(data.folders) || !Array.isArray(data.characters) || !Array.isArray(data.homebrew)) {
    throw new Error("Este arquivo não é um backup do Kaos.");
  }

  const folders = data.folders.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const folder = item as Record<string, unknown>;
    if (typeof folder.id !== "string" || typeof folder.name !== "string" || !folder.name.trim()) return [];
    return [{ id: folder.id, name: folder.name }];
  });
  const characters = data.characters.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const character = item as Record<string, unknown>;
    if (typeof character.id !== "string" || !character.data || typeof character.data !== "object") return [];
    let decoded;
    try {
      decoded = decodeCharacterQr(encodeCharacterQr(character.data as Character));
    } catch {
      throw new Error("O backup está incompleto.");
    }
    return [
      {
        id: character.id,
        folderId: typeof character.folderId === "string" ? character.folderId : null,
        createdAt: typeof character.createdAt === "string" ? character.createdAt : new Date(0).toISOString(),
        data: decoded.character,
      },
    ];
  });
  const homebrew = data.homebrew.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const skill = item as Record<string, unknown>;
    if (
      typeof skill.id !== "string" ||
      typeof skill.name !== "string" ||
      typeof skill.description !== "string" ||
      (skill.type !== "specific" &&
        skill.type !== "combat-attack" &&
        skill.type !== "combat-evade" &&
        skill.type !== "combat-defend" &&
        skill.type !== "combat-heal")
    ) {
      return [];
    }
    return [
      {
        id: skill.id,
        name: skill.name,
        description: skill.description,
        type: skill.type as HomebrewSkill["type"],
        ...(typeof skill.archetypeId === "string" && skill.archetypeId ? { archetypeId: skill.archetypeId } : {}),
      },
    ];
  });

  if (folders.length !== data.folders.length || characters.length !== data.characters.length || homebrew.length !== data.homebrew.length) {
    throw new Error("O backup está incompleto.");
  }
  return { version: 1, exportedAt: typeof data.exportedAt === "string" ? data.exportedAt : "", folders, characters, homebrew };
}

export function mergeArchive(current: ArchiveSnapshot, incoming: ArchiveBackup, userId: string): ArchiveMergeResult {
  const folderIds = new Set(current.folders.map((folder) => folder.id));
  const characterIds = new Set(current.characters.map((character) => character.id));
  const folders = incoming.folders.filter((folder) => !folderIds.has(folder.id));
  const knownFolders = new Set([...folderIds, ...folders.map((folder) => folder.id)]);
  const characters = incoming.characters.filter(
    (character) => !characterIds.has(character.id) && (character.folderId === null || knownFolders.has(character.folderId))
  );
  const homebrew = incoming.homebrew.filter(
    (item) =>
      !current.homebrew.some(
        (currentItem) =>
          currentItem.id === item.id ||
          (currentItem.name === item.name &&
            currentItem.type === item.type &&
            (currentItem.archetypeId ?? "") === (item.archetypeId ?? ""))
      )
  );

  return {
    folders: [...current.folders, ...folders.map((folder) => ({ ...folder, userId }))],
    characters: [
      ...current.characters,
      ...characters.map((character) => ({ ...character, userId })),
    ],
    homebrew: [...current.homebrew, ...homebrew],
    addedFolders: folders.length,
    addedCharacters: characters.length,
    addedHomebrew: homebrew.length,
  };
}
