import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  PanResponder,
  Platform,
  type GestureResponderHandlers,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useCharacterStore } from "@/src/hooks/useCharacterStore";
import { GUEST_USER_ID } from "@/src/domain/constants";
import { ARCHETYPES } from "@/src/domain/gameData";
import { generateRandomCharacter } from "@/src/domain/randomCharacter";
import { exportCharacterPdf } from "@/src/lib/exportCharacterPdf";
import { restoreArchiveBackup, shareArchiveBackup } from "@/src/lib/archiveBackupFile";
import type { Character } from "@/src/domain/character";
import type { CharacterFolder, StoredCharacter } from "@/src/domain/auth";
import { CharacterQrModal } from "@/src/components/sheet/CharacterQrModal";
import { CharacterQrScanner } from "@/src/components/sheet/CharacterQrScanner";
import { addMissingHomebrew } from "@/src/storage/homebrew";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Card, Screen, SectionHeading } from "@/src/components/ui/Screen";

function FolderChevron({ expanded }: { expanded: boolean }) {
  const [turn] = useState(() => new Animated.Value(expanded ? 1 : 0));

  useEffect(() => {
    Animated.timing(turn, {
      toValue: expanded ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [expanded, turn]);

  return (
    <Animated.View style={{ transform: [{ rotate: turn.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "90deg"] }) }] }}>
      <Text className="text-sm text-sand">›</Text>
    </Animated.View>
  );
}

function FolderBody({ expanded, children }: { expanded: boolean; children: ReactNode }) {
  const [progress] = useState(() => new Animated.Value(expanded ? 1 : 0));
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: expanded ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [expanded, progress]);

  return (
    <Animated.View
      style={{
        height: progress.interpolate({ inputRange: [0, 1], outputRange: [0, contentHeight] }),
        opacity: progress.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, 0, 1] }),
        overflow: "hidden",
        pointerEvents: expanded ? "auto" : "none",
      }}
    >
      <View
        className="absolute left-0 right-0 gap-2 border-t border-border pt-3"
        onLayout={(event) => {
          const height = Math.ceil(event.nativeEvent.layout.height);
          if (height <= 0) return;
          setContentHeight((current) => (Math.abs(height - current) < 2 ? current : height));
        }}
      >
        {children}
      </View>
    </Animated.View>
  );
}

export default function DashboardScreen() {
  const store = useCharacterStore(GUEST_USER_ID);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [actionsFor, setActionsFor] = useState<StoredCharacter | null>(null);
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [pickingFolder, setPickingFolder] = useState(false);
  const [qrCharacter, setQrCharacter] = useState<Character | null>(null);
  const [scanning, setScanning] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [toolHandlers, setToolHandlers] = useState<GestureResponderHandlers | null>(null);
  const [toolsReveal] = useState(() => new Animated.Value(0));
  const toolsDrag = useRef({ value: 0, grant: 0, max: 0, dragging: false });
  const insets = useSafeAreaInsets();
  const [translateY] = useState(() => new Animated.Value(520));

  const closeActions = useCallback(() => {
    Animated.timing(translateY, {
      toValue: 520,
      duration: 180,
      useNativeDriver: false,
    }).start(() => {
      setActionsFor(null);
      setPickingFolder(false);
    });
  }, [translateY]);

  const dragResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          translateY.stopAnimation();
        },
        onPanResponderMove: (_, gesture) => {
          translateY.setValue(Math.max(0, gesture.dy));
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy > 16) {
            closeActions();
            return;
          }
          Animated.spring(translateY, { toValue: 0, useNativeDriver: false, bounciness: 0 }).start();
        },
      }),
    [closeActions, translateY]
  );

  useEffect(() => {
    const drag = toolsDrag.current;
    const id = toolsReveal.addListener(({ value }) => {
      drag.value = value;
    });
    setToolHandlers(
      PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        toolsReveal.stopAnimation();
        drag.dragging = true;
        drag.grant = drag.value;
      },
      onPanResponderMove: (_, gesture) => {
        const next = Math.min(drag.max, Math.max(0, drag.grant + gesture.dy));
        drag.value = next;
        toolsReveal.setValue(next);
      },
      onPanResponderRelease: (_, gesture) => {
        drag.dragging = false;
        const current = Math.min(drag.max, Math.max(0, drag.grant + gesture.dy));
        const tapped = Math.abs(gesture.dy) < 6 && Math.abs(gesture.dx) < 6;
        const open = tapped
          ? drag.grant < drag.max / 2
          : gesture.vy > 0.6
            ? true
            : gesture.vy < -0.6
              ? false
              : current > drag.max * 0.5;
        const destination = open ? drag.max : 0;
        setToolsOpen(open);
        Animated.timing(toolsReveal, {
          toValue: destination,
          duration: 160,
          useNativeDriver: false,
        }).start();
      },
      onPanResponderTerminate: () => {
        drag.dragging = false;
      },
    }).panHandlers
    );
    return () => toolsReveal.removeListener(id);
  }, [toolsReveal]);

  useEffect(() => {
    if (!actionsFor) return;
    translateY.setValue(520);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 240,
      useNativeDriver: false,
    }).start();
  }, [actionsFor, translateY]);

  const rootChars = store.characters.filter((c) => !c.folderId);

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const CharCard = ({ char }: { char: StoredCharacter }) => {
    const archetype = ARCHETYPES.find((a) => a.id === char.data.archetype);
    return (
      <View className="flex-row overflow-hidden border border-border bg-card-strong">
        <View className="w-1 bg-primary" />
        <Pressable
          className="min-h-[76px] flex-1 justify-center px-4 py-3"
          onPress={() => router.push(`/sheet/${char.id}`)}
        >
          <Text className="font-display text-base font-bold text-foreground" numberOfLines={1}>
            {char.data.name}
          </Text>
          <Text className="mt-1 font-mono text-xs text-muted-foreground" numberOfLines={1}>
            {archetype?.name ?? "Arquétipo desconhecido"}
          </Text>
        </Pressable>
        <View className="items-end justify-center gap-1 px-2">
          <View className="border border-primary bg-primary-soft px-3 py-1">
            <Text className="font-mono text-xs font-bold text-sand">
              HP {char.data.currentHp}/{char.data.baseHp}
            </Text>
          </View>
          <Pressable
            accessibilityLabel={`Ações de ${char.data.name}`}
            className="min-h-[36px] min-w-[44px] items-center justify-center"
            onPress={() => {
              setPickingFolder(false);
              setActionsFor(char);
            }}
          >
            <Text className="text-xl leading-5 text-muted-foreground">•••</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const EmptyFolder = () => (
    <View className="items-center border border-dashed border-border px-4 py-5">
      <Text className="font-mono text-xs text-muted-foreground">Esta pasta está vazia.</Text>
    </View>
  );

  const renderFolder = (folder: CharacterFolder) => {
    const folderChars = store.characters.filter((c) => c.folderId === folder.id);
    const isExpanded = expandedFolders.has(folder.id);
    return (
      <Card key={folder.id} className="gap-3 p-3">
        <View className="flex-row items-center gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: isExpanded }}
            onPress={() => toggleFolder(folder.id)}
            className="min-h-[48px] flex-1 flex-row items-center gap-3 px-1"
          >
            <View className="h-9 w-9 items-center justify-center border border-primary bg-primary-soft">
              <FolderChevron expanded={isExpanded} />
            </View>
            {editingFolder === folder.id ? (
              <Input
                value={editFolderName}
                onChangeText={setEditFolderName}
                autoFocus
                onSubmitEditing={() => {
                  if (editFolderName.trim()) store.renameFolder(folder.id, editFolderName.trim());
                  setEditingFolder(null);
                }}
                className="h-11 min-h-[44px] flex-1 py-1"
              />
            ) : (
              <View className="flex-1">
                <Text className="font-display text-sm font-bold text-foreground" numberOfLines={1}>
                  {folder.name}
                </Text>
                <Text className="mt-1 font-mono text-xs text-muted-foreground">
                  {folderChars.length} {folderChars.length === 1 ? "personagem" : "personagens"}
                </Text>
              </View>
            )}
          </Pressable>
          <Pressable
            accessibilityLabel={`Criar personagem em ${folder.name}`}
            className="min-h-[44px] justify-center border border-primary bg-primary-soft px-3"
            onPress={() => router.push({ pathname: "/create", params: { folderId: folder.id } })}
          >
            <Text className="font-mono text-xs font-bold text-sand">+ NOVO</Text>
          </Pressable>
        </View>
        <FolderBody expanded={isExpanded}>
          {folderChars.length === 0 ? <EmptyFolder /> : folderChars.map((c) => <CharCard key={c.id} char={c} />)}
        </FolderBody>
      </Card>
    );
  };

  if (store.loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#D05E3E" />
      </View>
    );
  }

  return (
    <Screen>
      <View className="gap-1 py-2">
        <Text className="font-display text-2xl font-bold text-foreground">{"> ARQUIVO_DE_AGENTES"}</Text>
        <Text className="font-mono text-sm leading-5 text-muted-foreground">
          Consulte, registre e organize identidades operacionais.
        </Text>
        <View className="mt-2 self-start border border-border bg-card px-3 py-1">
          <Text className="font-mono text-xs text-success">● REDE_LOCAL // DADOS_NO_DISPOSITIVO</Text>
        </View>
      </View>

      <View className="flex-row gap-2">
        <Button className="flex-1" label="+ Novo personagem" onPress={() => router.push("/create")} />
        <Button
          className="flex-1 border-accent"
          textClassName="text-accent"
          label="⚄ Aleatório"
          variant="outline"
          onPress={async () => {
            const id = await store.addCharacter(generateRandomCharacter(), null);
            router.push(`/sheet/${id}`);
          }}
        />
      </View>
      <View className="flex-row gap-2">
        <Button className="flex-1" label="+ Nova pasta" variant="outline" onPress={() => setShowNewFolder(true)} />
        <Button
          className="flex-1"
          label="Importar QR"
          variant="outline"
          onPress={() => {
            if (Platform.OS === "web") {
              Alert.alert(
                "Importar no celular",
                "A leitura do QR funciona no app do Android ou iOS. No navegador, mostre o QR de uma ficha para o outro celular escanear."
              );
              return;
            }
            setScanning(true);
          }}
        />
      </View>
      <Animated.View style={{ height: toolsReveal, overflow: "hidden", pointerEvents: toolsOpen ? "auto" : "none" }}>
        <View
          className="absolute left-0 right-0 gap-2 pb-2"
          onLayout={(event) => {
            const height = Math.ceil(event.nativeEvent.layout.height);
            const drag = toolsDrag.current;
            if (height <= 0 || Math.abs(height - drag.max) < 2 || drag.dragging) return;
            drag.max = height;
            if (drag.value > 0) {
              drag.value = height;
              toolsReveal.setValue(height);
            }
          }}
        >
          <Button label="Homebrew" variant="outline" onPress={() => router.push("/homebrew")} />
          <View className="flex-row gap-2">
            <Button
              className="flex-1"
              label="Backup"
              variant="outline"
              onPress={async () => {
                try {
                  await shareArchiveBackup();
                } catch (error) {
                  const message = error instanceof Error ? error.message : "Tente de novo.";
                  Alert.alert("Não foi possível salvar o backup", message);
                }
              }}
            />
            <Button
              className="flex-1"
              label="Restaurar"
              variant="outline"
              onPress={async () => {
                try {
                  const restored = await restoreArchiveBackup(GUEST_USER_ID);
                  if (!restored) return;
                  await store.refresh();
                  const total = restored.addedCharacters + restored.addedFolders + restored.addedHomebrew;
                  Alert.alert(
                    total === 0 ? "Nada novo" : "Backup restaurado",
                    total === 0
                      ? "Essas fichas já estão neste aparelho."
                      : `${restored.addedCharacters} fichas, ${restored.addedFolders} pastas e ${restored.addedHomebrew} homebrews acrescentados. O que já existia permanece.`
                  );
                } catch (error) {
                  const message = error instanceof Error ? error.message : "Tente de novo.";
                  Alert.alert("Não foi possível restaurar", message);
                }
              }}
            />
          </View>
        </View>
      </Animated.View>
      <View
        {...toolHandlers}
        accessibilityRole="button"
        accessibilityState={{ expanded: toolsOpen }}
        className="items-center py-2"
        style={Platform.OS === "web" ? { touchAction: "none" } : undefined}
      >
        <View className="mb-1 h-1 w-10 bg-primary" />
        <Text className="font-mono text-xs text-muted-foreground">
          {toolsOpen ? "Puxe para cima para fechar" : "Puxe para ferramentas"}
        </Text>
      </View>

      {showNewFolder && (
        <Card className="gap-3">
          <SectionHeading title="Nova pasta" description="Use pastas para separar campanhas ou grupos." />
          <Input
            placeholder="Nome da pasta"
            value={newFolderName}
            onChangeText={setNewFolderName}
            autoFocus
            returnKeyType="done"
          />
          <View className="flex-row gap-2">
            <Button className="flex-1" label="Cancelar" variant="ghost" onPress={() => setShowNewFolder(false)} />
            <Button
              className="flex-1"
              label="Criar pasta"
              disabled={!newFolderName.trim()}
              onPress={async () => {
                if (newFolderName.trim()) {
                  await store.addFolder(newFolderName.trim());
                  setNewFolderName("");
                  setShowNewFolder(false);
                }
              }}
            />
          </View>
        </Card>
      )}

      {store.folders.length > 0 ? (
        <View className="gap-3">
          <SectionHeading title="Pastas" />
          {store.folders.map((folder) => renderFolder(folder))}
        </View>
      ) : null}

      {rootChars.length > 0 && (
        <View className="gap-3">
          <SectionHeading title={store.folders.length > 0 ? "Sem pasta" : "Personagens"} />
          {rootChars.map((c) => <CharCard key={c.id} char={c} />)}
        </View>
      )}

      {store.characters.length === 0 && store.folders.length === 0 && (
        <Card className="items-center border-dashed px-6 py-10">
          <View className="mb-4 h-14 w-14 items-center justify-center border border-primary bg-primary-soft">
            <Text className="text-2xl text-primary">△</Text>
          </View>
          <Text className="text-center font-display text-base font-bold text-foreground">ARQUIVO SEM REGISTROS</Text>
          <Text className="mt-2 text-center font-mono text-sm leading-5 text-muted-foreground">
            Crie uma ficha passo a passo ou gere um personagem aleatório para começar rápido.
          </Text>
        </Card>
      )}

      <Modal visible={!!actionsFor} transparent animationType="none" statusBarTranslucent onRequestClose={closeActions}>
        <View style={{ flex: 1 }}>
          <Pressable style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(0,0,0,0.7)" }} onPress={closeActions} />
          <Animated.View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "#15130F",
              borderTopWidth: 1,
              borderTopColor: "#7D6C58",
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: Math.max(insets.bottom, 12),
              transform: [{ translateY }],
            }}
          >
            <View
              {...dragResponder.panHandlers}
              className="pb-4"
              style={Platform.OS === "web" ? { touchAction: "none" } : undefined}
            >
              <View className="mb-5 h-1 w-10 self-center bg-primary" />
              <Text className="mb-1 font-display text-xl font-bold text-foreground">{actionsFor?.data.name}</Text>
              <Text className="font-mono text-xs text-muted-foreground">
                {pickingFolder ? "Escolha a pasta" : "Puxe para baixo para fechar"}
              </Text>
            </View>
            <View className="gap-2">
            {pickingFolder ? (
              <>
                <Button label="Voltar" variant="ghost" onPress={() => setPickingFolder(false)} />
                {actionsFor?.folderId ? (
                  <Button
                    label="Sem pasta"
                    variant="outline"
                    onPress={async () => {
                      if (actionsFor) await store.moveCharacter(actionsFor.id, null);
                      closeActions();
                    }}
                  />
                ) : null}
                {store.folders.filter((folder) => folder.id !== actionsFor?.folderId).map((folder) => (
                  <Button
                    key={folder.id}
                    label={folder.name}
                    variant="outline"
                    onPress={async () => {
                      if (!actionsFor) return;
                      await store.moveCharacter(actionsFor.id, folder.id);
                      setExpandedFolders((prev) => new Set(prev).add(folder.id));
                      closeActions();
                    }}
                  />
                ))}
                {store.folders.length === 0 ? (
                  <Text className="py-2 text-center font-mono text-xs text-muted-foreground">
                    Nenhuma pasta criada ainda.
                  </Text>
                ) : null}
              </>
            ) : null}
            {!pickingFolder ? (
            <>
            <Button label="Abrir ficha" onPress={() => { router.push(`/sheet/${actionsFor!.id}`); closeActions(); }} />
            <Button
              label="Compartilhar QR"
              variant="outline"
              onPress={() => {
                if (!actionsFor) return;
                setQrCharacter(actionsFor.data);
                closeActions();
              }}
            />
            <Button
              label="Exportar PDF"
              variant="outline"
              onPress={async () => {
                if (!actionsFor) return;
                const character = actionsFor.data;
                closeActions();
                try {
                  await exportCharacterPdf(character);
                } catch (error) {
                  const message = error instanceof Error ? error.message : "Tente de novo.";
                  Alert.alert("Não foi possível exportar", message);
                }
              }}
            />
            <Button label="Mover para pasta" variant="outline" onPress={() => setPickingFolder(true)} />
            <Button
              label="Duplicar"
              variant="outline"
              onPress={async () => {
                if (actionsFor) {
                  await store.addCharacter(
                    { ...actionsFor.data, name: `${actionsFor.data.name} (cópia)` },
                    actionsFor.folderId
                  );
                }
                closeActions();
              }}
            />
            <Button
              label="Resetar HP e condições"
              variant="outline"
              onPress={async () => {
                if (actionsFor) {
                  await store.updateCharacter(actionsFor.id, {
                    currentHp: actionsFor.data.baseHp,
                    negativeConditions: [],
                    combatConditions: [],
                    positiveConditions: [],
                    damageMarkers: [],
                  });
                }
                closeActions();
              }}
            />
            <Button
              label="Apagar"
              variant="destructive"
              onPress={() => {
                const c = actionsFor;
                closeActions();
                Alert.alert("Apagar personagem?", c?.data.name, [
                  { text: "Cancelar", style: "cancel" },
                  { text: "Apagar", style: "destructive", onPress: () => c && store.deleteCharacter(c.id) },
                ]);
              }}
            />
            </>
            ) : null}
            </View>
          </Animated.View>
        </View>
      </Modal>
      <CharacterQrModal character={qrCharacter} onClose={() => setQrCharacter(null)} />
      <CharacterQrScanner
        visible={scanning}
        onClose={() => setScanning(false)}
        onImport={async ({ character, homebrew }) => {
          setScanning(false);
          const addedHomebrew = await addMissingHomebrew(homebrew);
          await store.addCharacter(character, null);
          Alert.alert(
            "Ficha importada",
            addedHomebrew > 0 ? `${character.name}\n${addedHomebrew} homebrew incluído.` : character.name
          );
        }}
      />
    </Screen>
  );
}
