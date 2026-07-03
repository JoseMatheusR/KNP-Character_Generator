import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCharacterStore } from "@/hooks/useCharacterStore";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { CharacterDashboard } from "@/components/dashboard/CharacterDashboard";
import { CreationWizard } from "@/components/wizard/CreationWizard";
import { CharacterSheet } from "@/components/dashboard/CharacterSheet";
import { HomebrewManager } from "@/components/dashboard/HomebrewManager";
import type { Character } from "@/types/character";
import type { User } from "@/types/auth";

type View =
  | { type: "dashboard" }
  | { type: "auth" }
  | { type: "create"; folderId: string | null }
  | { type: "sheet"; charId: string }
  | { type: "homebrew" };

const GUEST_USER: User = {
  id: "guest-local",
  email: "",
  displayName: "Convidado",
};

const Index = () => {
  const { user, login, register, logout } = useAuth();
  const [view, setView] = useState<View>({ type: "dashboard" });

  // Auth screen is now opt-in — only shown when user explicitly requests it
  if (view.type === "auth" && !user) {
    return (
      <AuthScreen
        onLogin={(email, password) => {
          const err = login(email, password);
          if (!err) setView({ type: "dashboard" });
          return err;
        }}
        onRegister={(email, password, displayName) => {
          const err = register(email, password, displayName);
          if (!err) setView({ type: "dashboard" });
          return err;
        }}
        onCancel={() => setView({ type: "dashboard" })}
      />
    );
  }

  const activeUser = user ?? GUEST_USER;

  if (view.type === "create") {
    return (
      <CreateCharacterFlow
        userId={activeUser.id}
        folderId={view.folderId}
        onDone={(charId) => setView({ type: "sheet", charId })}
        onCancel={() => setView({ type: "dashboard" })}
      />
    );
  }

  if (view.type === "sheet") {
    return (
      <CharacterSheet
        charId={view.charId}
        onBack={() => setView({ type: "dashboard" })}
      />
    );
  }

  if (view.type === "homebrew") {
    return <HomebrewManager onBack={() => setView({ type: "dashboard" })} />;
  }

  return (
    <CharacterDashboard
      user={activeUser}
      isGuest={!user}
      onLogout={logout}
      onLogin={() => setView({ type: "auth" })}
      onSelectCharacter={(charId) => setView({ type: "sheet", charId })}
      onNewCharacter={(folderId) => setView({ type: "create", folderId })}
      onHomebrew={() => setView({ type: "homebrew" })}
    />
  );
};

function CreateCharacterFlow({ userId, folderId, onDone, onCancel }: {
  userId: string;
  folderId: string | null;
  onDone: (charId: string) => void;
  onCancel: () => void;
}) {
  const store = useCharacterStore(userId);

  const handleComplete = (char: Character) => {
    const charId = store.addCharacter(char, folderId);
    onDone(charId);
  };

  return <CreationWizard onComplete={handleComplete} />;
}

export default Index;
