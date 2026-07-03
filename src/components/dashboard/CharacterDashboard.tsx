import { useState } from "react";
import { useCharacterStore } from "@/hooks/useCharacterStore";
import { ARCHETYPES } from "@/data/gameData";
import { generateRandomCharacter } from "@/lib/randomCharacter";
import { exportCharacterPdf } from "@/lib/exportCharacterPdf";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { User, CharacterFolder } from "@/types/auth";
import type { StoredCharacter } from "@/types/auth";

interface Props {
  user: User;
  isGuest?: boolean;
  onLogout: () => void;
  onLogin?: () => void;
  onSelectCharacter: (charId: string) => void;
  onNewCharacter: (folderId: string | null) => void;
  onHomebrew?: () => void;
}

export function CharacterDashboard({ user, isGuest, onLogout, onLogin, onSelectCharacter, onNewCharacter, onHomebrew }: Props) {
  const store = useCharacterStore(user.id);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [actionsFor, setActionsFor] = useState<StoredCharacter | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<StoredCharacter | null>(null);
  const [confirmDeleteFolder, setConfirmDeleteFolder] = useState<CharacterFolder | null>(null);

  const rootChars = store.characters.filter((c) => !c.folderId);

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      store.addFolder(newFolderName.trim());
      setNewFolderName("");
      setShowNewFolder(false);
    }
  };

  const handleRenameFolder = (folderId: string) => {
    if (editFolderName.trim()) {
      store.renameFolder(folderId, editFolderName.trim());
      setEditingFolder(null);
    }
  };

  const CharCard = ({ char }: { char: StoredCharacter }) => {
    const archetype = ARCHETYPES.find((a) => a.id === char.data.archetype);
    return (
      <div className="w-full border border-border rounded bg-card hover:border-primary transition-none flex items-stretch overflow-hidden">
        <button
          onClick={() => onSelectCharacter(char.id)}
          className="flex-1 text-left p-3 group min-w-0"
        >
          <div className="font-display text-sm font-bold text-primary group-hover:text-glow leading-tight truncate">
            {char.data.name}
          </div>
          <div className="text-[10px] text-muted-foreground font-mono truncate">
            {archetype?.name} • HP {char.data.currentHp}/{char.data.baseHp}
          </div>
        </button>
        <button
          onClick={() => setActionsFor(char)}
          className="px-4 border-l border-border text-muted-foreground hover:text-primary hover:bg-secondary transition-none flex items-center justify-center min-w-[44px]"
          aria-label="Ações"
        >
          <span className="text-lg leading-none">⋯</span>
        </button>
      </div>
    );
  };

  const FolderSection = ({ folder }: { folder: CharacterFolder }) => {
    const folderChars = store.characters.filter((c) => c.folderId === folder.id);
    const isExpanded = expandedFolders.has(folder.id);

    return (
      <div className="border border-border rounded bg-card">
        <div className="flex items-center justify-between p-2">
          <button
            onClick={() => toggleFolder(folder.id)}
            className="flex items-center gap-2 text-sm font-display font-bold text-foreground"
          >
            <span className="text-primary text-xs">{isExpanded ? "▼" : "▶"}</span>
            {editingFolder === folder.id ? (
              <Input
                value={editFolderName}
                onChange={(e) => setEditFolderName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleRenameFolder(folder.id); if (e.key === "Escape") setEditingFolder(null); }}
                onBlur={() => handleRenameFolder(folder.id)}
                onClick={(e) => e.stopPropagation()}
                className="h-6 text-xs bg-background border-border font-mono w-32"
                autoFocus
              />
            ) : (
              <span>{folder.name}</span>
            )}
            <span className="text-[10px] text-muted-foreground font-mono">({folderChars.length})</span>
          </button>
          <div className="flex gap-1 items-center">
            <button
              onClick={() => onNewCharacter(folder.id)}
              className="text-xs text-primary hover:underline font-mono px-2 py-1 min-h-[32px]"
            >
              + Novo
            </button>
            <button
              onClick={() => { setEditingFolder(folder.id); setEditFolderName(folder.name); }}
              className="text-sm text-muted-foreground hover:text-foreground font-mono px-2 py-1 min-h-[32px] min-w-[32px]"
              aria-label="Renomear pasta"
            >
              ✎
            </button>
            <button
              onClick={() => setConfirmDeleteFolder(folder)}
              className="text-sm text-destructive hover:text-destructive/80 font-mono px-2 py-1 min-h-[32px] min-w-[32px]"
              aria-label="Apagar pasta"
            >
              ✕
            </button>
          </div>
        </div>
        {isExpanded && (
          <div className="px-2 pb-2 space-y-2 border-t border-border pt-2">
            {folderChars.length === 0 ? (
              <p className="text-[10px] text-muted-foreground font-mono text-center py-2">Pasta vazia</p>
            ) : (
              folderChars.map((c) => <CharCard key={c.id} char={c} />)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background scanline">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-primary text-glow">KAOS</h1>
            <p className="text-[10px] text-muted-foreground font-mono">
              Terminal de {user.displayName}
              {isGuest && <span className="text-accent"> • OFFLINE</span>}
            </p>
          </div>
          {isGuest ? (
            <button
              onClick={onLogin}
              className="text-xs text-primary hover:underline font-mono"
            >
              ENTRAR
            </button>
          ) : (
            <button
              onClick={onLogout}
              className="text-xs text-destructive hover:underline font-mono"
            >
              DESCONECTAR
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => onNewCharacter(null)} className="font-mono text-xs">
            + NOVO PERSONAGEM
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const charId = store.addCharacter(generateRandomCharacter(), null);
              onSelectCharacter(charId);
            }}
            className="font-mono text-xs border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            title="Gera uma ficha completa instantânea"
          >
            🎲 ALEATÓRIO
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "application/json,.json";
              input.onchange = async () => {
                const file = input.files?.[0];
                if (!file) return;
                try {
                  const text = await file.text();
                  const data = JSON.parse(text);
                  if (!data || typeof data !== "object" || !data.name || !data.archetype || !data.baseAttributes) {
                    toast.error("Arquivo JSON inválido");
                    return;
                  }
                  const charId = store.addCharacter(data, null);
                  toast.success(`"${data.name}" importado`);
                  onSelectCharacter(charId);
                } catch {
                  toast.error("Não foi possível ler o arquivo");
                }
              };
              input.click();
            }}
            className="font-mono text-xs"
          >
            📥 IMPORTAR JSON
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowNewFolder(!showNewFolder)}
            className="font-mono text-xs"
          >
            + NOVA PASTA
          </Button>
          {onHomebrew && (
            <Button
              variant="outline"
              onClick={onHomebrew}
              className="font-mono text-xs border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              ⚙ HOMEBREW
            </Button>
          )}
        </div>

        {showNewFolder && (
          <div className="flex gap-2">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
              placeholder="Nome da pasta..."
              className="bg-card border-border font-mono text-sm flex-1"
              autoFocus
            />
            <Button onClick={handleCreateFolder} className="font-mono text-xs">OK</Button>
            <Button variant="outline" onClick={() => setShowNewFolder(false)} className="font-mono text-xs">✕</Button>
          </div>
        )}

        {/* Folders */}
        {store.folders.map((f) => (
          <FolderSection key={f.id} folder={f} />
        ))}

        {/* Root characters */}
        {rootChars.length > 0 && (
          <div className="space-y-2">
            {store.folders.length > 0 && (
              <h3 className="font-display text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Sem Pasta
              </h3>
            )}
            {rootChars.map((c) => <CharCard key={c.id} char={c} />)}
          </div>
        )}

        {/* Empty state */}
        {store.characters.length === 0 && store.folders.length === 0 && (
          <div className="border border-dashed border-border rounded p-8 text-center">
            <p className="text-muted-foreground font-mono text-sm">Nenhum personagem criado.</p>
            <p className="text-muted-foreground font-mono text-xs mt-1">Clique em "+ NOVO PERSONAGEM" para começar.</p>
          </div>
        )}
      </div>

      {/* Mobile-friendly actions sheet for characters */}
      <Sheet open={!!actionsFor} onOpenChange={(o) => !o && setActionsFor(null)}>
        <SheetContent side="bottom" className="bg-card border-border">
          <SheetHeader>
            <SheetTitle className="font-display text-primary text-left">
              {actionsFor?.data.name}
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-2 mt-4 pb-4">
            <button
              onClick={() => {
                if (actionsFor) onSelectCharacter(actionsFor.id);
                setActionsFor(null);
              }}
              className="w-full text-left p-4 rounded border border-border bg-background hover:border-primary font-mono text-sm text-foreground"
            >
              📂 Abrir ficha
            </button>

            <button
              onClick={() => {
                if (actionsFor) {
                  exportCharacterPdf(actionsFor.data);
                  toast.success("PDF gerado");
                }
                setActionsFor(null);
              }}
              className="w-full text-left p-4 rounded border border-border bg-background hover:border-primary font-mono text-sm text-foreground"
            >
              📄 Baixar como PDF
            </button>

            <button
              onClick={() => {
                if (actionsFor) {
                  const copy = {
                    ...actionsFor.data,
                    name: `${actionsFor.data.name} (cópia)`,
                  };
                  store.addCharacter(copy, actionsFor.folderId);
                  toast.success("Personagem duplicado");
                }
                setActionsFor(null);
              }}
              className="w-full text-left p-4 rounded border border-border bg-background hover:border-primary font-mono text-sm text-foreground"
            >
              📋 Duplicar
            </button>

            <button
              onClick={() => {
                if (actionsFor) {
                  const blob = new Blob([JSON.stringify(actionsFor.data, null, 2)], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${actionsFor.data.name.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success("JSON exportado");
                }
                setActionsFor(null);
              }}
              className="w-full text-left p-4 rounded border border-border bg-background hover:border-primary font-mono text-sm text-foreground"
            >
              📤 Exportar JSON
            </button>

            <button
              onClick={() => {
                if (actionsFor) {
                  store.updateCharacter(actionsFor.id, {
                    currentHp: actionsFor.data.baseHp,
                    negativeConditions: [],
                    combatConditions: [],
                    positiveConditions: [],
                    damageMarkers: [],
                  });
                  toast.success("Personagem descansado");
                }
                setActionsFor(null);
              }}
              className="w-full text-left p-4 rounded border border-accent/40 bg-background hover:bg-accent/10 font-mono text-sm text-accent"
            >
              🔄 Resetar HP & condições
            </button>

            {store.folders.length > 0 && (
              <div className="p-4 rounded border border-border bg-background">
                <label className="text-[10px] text-muted-foreground font-mono uppercase block mb-2">
                  Mover para pasta
                </label>
                <select
                  value={actionsFor?.folderId || ""}
                  onChange={(e) => {
                    if (actionsFor) {
                      store.moveCharacter(actionsFor.id, e.target.value || null);
                      setActionsFor(null);
                    }
                  }}
                  className="w-full bg-card border border-border rounded px-3 py-2 text-sm text-foreground font-mono"
                >
                  <option value="">— Sem pasta —</option>
                  {store.folders.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => {
                setConfirmDelete(actionsFor);
                setActionsFor(null);
              }}
              className="w-full text-left p-4 rounded border border-destructive/40 bg-background hover:bg-destructive/10 font-mono text-sm text-destructive"
            >
              ✕ Apagar personagem
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirm delete character */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-primary">
              Apagar personagem?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-sm">
              <span className="text-foreground font-bold">{confirmDelete?.data.name}</span> será removido permanentemente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-mono">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDelete) store.deleteCharacter(confirmDelete.id);
                setConfirmDelete(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-mono"
            >
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm delete folder */}
      <AlertDialog open={!!confirmDeleteFolder} onOpenChange={(o) => !o && setConfirmDeleteFolder(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-primary">
              Apagar pasta?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-sm">
              <span className="text-foreground font-bold">{confirmDeleteFolder?.name}</span> será removida. Os personagens dentro dela serão movidos para a raiz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-mono">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDeleteFolder) store.deleteFolder(confirmDeleteFolder.id);
                setConfirmDeleteFolder(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-mono"
            >
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
