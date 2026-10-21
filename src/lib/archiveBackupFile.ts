import { File, Paths } from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import type { DocumentPickerAsset } from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import type { ArchiveMergeResult } from "@/src/lib/archiveBackup";
import { buildArchive, mergeArchive, parseArchive } from "@/src/lib/archiveBackup";
import { loadAllCharacters, loadAllFolders } from "@/src/storage/characters";
import { CHARS_KEY, FOLDERS_KEY, HOMEBREW_KEY } from "@/src/storage/keys";
import { loadHomebrew } from "@/src/storage/homebrew";
import { saveJson } from "@/src/storage/asyncJson";

async function pickedText(asset: DocumentPickerAsset): Promise<string> {
  if (asset.file) return asset.file.text();
  return new File(asset.uri).text();
}

export async function shareArchiveBackup(): Promise<void> {
  const [characters, folders, homebrew] = await Promise.all([
    loadAllCharacters(),
    loadAllFolders(),
    loadHomebrew(),
  ]);
  if (characters.length === 0 && folders.length === 0 && homebrew.length === 0) {
    throw new Error("Não há fichas, pastas ou homebrew para salvar.");
  }

  const json = JSON.stringify(buildArchive({ characters, folders, homebrew }, new Date().toISOString()));
  if (Platform.OS === "web") {
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "kaos-arquivo.json";
    link.click();
    URL.revokeObjectURL(url);
    return;
  }

  const file = new File(Paths.cache, "kaos-arquivo.json");
  file.create({ overwrite: true });
  file.write(json);
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Este aparelho não consegue compartilhar arquivos.");
  }
  await Sharing.shareAsync(file.uri, {
    mimeType: "application/json",
    UTI: "public.json",
    dialogTitle: "Backup do arquivo",
  });
}

export async function restoreArchiveBackup(userId: string): Promise<ArchiveMergeResult | null> {
  const picked = await DocumentPicker.getDocumentAsync({
    type: ["application/json", "text/json", "text/plain"],
    copyToCacheDirectory: true,
  });
  if (picked.canceled) return null;

  const backup = parseArchive(await pickedText(picked.assets[0]));
  const [characters, folders, homebrew] = await Promise.all([
    loadAllCharacters(),
    loadAllFolders(),
    loadHomebrew(),
  ]);
  const merged = mergeArchive({ characters, folders, homebrew }, backup, userId);
  await Promise.all([
    saveJson(CHARS_KEY, merged.characters),
    saveJson(FOLDERS_KEY, merged.folders),
    saveJson(HOMEBREW_KEY, merged.homebrew),
  ]);
  return merged;
}
