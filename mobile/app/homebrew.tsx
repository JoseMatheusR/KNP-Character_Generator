import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useHomebrew } from "@/src/hooks/useHomebrew";
import type { HomebrewSkill } from "@/src/storage/homebrew";
import { ARCHETYPES } from "@/src/domain/gameData";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Card, Screen, SectionHeading } from "@/src/components/ui/Screen";
import { cn } from "@/src/lib/cn";

const TYPES: { value: HomebrewSkill["type"]; label: string }[] = [
  { value: "specific", label: "Perícia específica" },
  { value: "combat-attack", label: "Atacar" },
  { value: "combat-evade", label: "Evadir" },
  { value: "combat-defend", label: "Defender" },
];

export default function HomebrewScreen() {
  const brew = useHomebrew();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<HomebrewSkill["type"]>("specific");
  const [archetypeId, setArchetypeId] = useState<string | undefined>();

  const handleAdd = async () => {
    if (!name.trim()) return;
    await brew.add({
      name: name.trim(),
      description: description.trim(),
      type,
      archetypeId: type === "specific" ? archetypeId : undefined,
    });
    setName("");
    setDescription("");
    setArchetypeId(undefined);
  };

  return (
    <Screen avoidKeyboard>
      <View className="gap-1 py-2">
        <Text className="font-display text-2xl font-bold text-foreground">{"> EDITAR_PROTOCOLOS"}</Text>
        <Text className="font-mono text-sm leading-5 text-muted-foreground">
          Crie perícias e técnicas próprias. Elas aparecerão na criação e na ficha dos personagens.
        </Text>
      </View>

      <Card className="gap-4">
        <SectionHeading title="Nova habilidade" description="Preencha um nome e escolha onde ela será usada." />
        <Input placeholder="Nome da habilidade" value={name} onChangeText={setName} />
        <Input
          placeholder="Descrição"
          value={description}
          onChangeText={setDescription}
          multiline
          className="min-h-[96px]"
        />
        <Text className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Tipo</Text>
        <View className="flex-row flex-wrap gap-2">
          {TYPES.map((t) => (
            <Pressable
              key={t.value}
              onPress={() => setType(t.value)}
              className={cn(
                "min-h-[44px] justify-center border px-3 py-2",
                type === t.value ? "border-primary bg-primary-soft" : "border-border bg-card-strong"
              )}
            >
              <Text className={cn("font-mono text-xs", type === t.value ? "text-sand" : "text-foreground")}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>
        {type === "specific" && (
          <View className="gap-2">
            <Text className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Arquétipo (opcional)
            </Text>
            <View className="flex-row flex-wrap gap-2">
              <Pressable
                onPress={() => setArchetypeId(undefined)}
                className={cn("min-h-[40px] justify-center border px-3", !archetypeId ? "border-primary bg-primary-soft" : "border-border")}
              >
                <Text className="font-mono text-xs text-foreground">Todos</Text>
              </Pressable>
              {ARCHETYPES.map((a) => (
                <Pressable
                  key={a.id}
                  onPress={() => setArchetypeId(a.id)}
                  className={cn("min-h-[40px] justify-center border px-3", archetypeId === a.id ? "border-primary bg-primary-soft" : "border-border")}
                >
                  <Text className="font-mono text-xs text-foreground">{a.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
        <Button label="Adicionar habilidade" disabled={!name.trim()} onPress={handleAdd} />
      </Card>

      {brew.items.length > 0 ? <SectionHeading title={`Criadas (${brew.items.length})`} /> : null}
      {brew.items.map((item) => (
        <Card key={item.id} className="gap-2">
          <Text className="font-display text-base font-bold text-foreground">{item.name}</Text>
          <Text className="font-mono text-xs uppercase tracking-wider text-primary">{item.type}</Text>
          {item.description ? (
            <Text className="font-mono text-sm leading-5 text-muted-foreground">{item.description}</Text>
          ) : null}
          <Button
            label="Remover"
            variant="ghost"
            textClassName="text-destructive"
            className="mt-2"
            onPress={() =>
              Alert.alert("Remover?", item.name, [
                { text: "Cancelar", style: "cancel" },
                { text: "Remover", style: "destructive", onPress: () => brew.remove(item.id) },
              ])
            }
          />
        </Card>
      ))}
      {brew.items.length === 0 ? (
        <Card className="items-center border-dashed py-8">
          <Text className="font-mono text-sm text-muted-foreground">Nenhuma habilidade customizada ainda.</Text>
        </Card>
      ) : null}
    </Screen>
  );
}
