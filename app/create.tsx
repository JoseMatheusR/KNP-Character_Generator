import { useLocalSearchParams, router } from "expo-router";
import { CreationWizard } from "@/src/components/wizard/CreationWizard";
import { GUEST_USER_ID } from "@/src/domain/constants";
import * as charStorage from "@/src/storage/characters";
import type { Character } from "@/src/domain/character";

export default function CreateScreen() {
  const { folderId } = useLocalSearchParams<{ folderId?: string }>();
  const resolvedFolder = folderId && folderId !== "undefined" ? folderId : null;

  const handleComplete = async (char: Character) => {
    const id = await charStorage.addCharacter(GUEST_USER_ID, char, resolvedFolder);
    router.replace(`/sheet/${id}`);
  };

  return (
    <CreationWizard onComplete={handleComplete} onCancel={() => router.back()} />
  );
}
