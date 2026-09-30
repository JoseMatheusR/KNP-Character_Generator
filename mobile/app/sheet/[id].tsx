import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useCharacter } from "@/src/hooks/useCharacter";
import {
  ARCHETYPES,
  ATTRIBUTE_LABELS,
  COMBAT_TECHNIQUES,
  TECHNIQUE_CATEGORIES,
  DAMAGE_TYPES,
  NEGATIVE_CONDITIONS,
  COMBAT_CONDITIONS,
  POSITIVE_CONDITIONS,
  type ConditionEffect,
  SPECIFIC_SKILLS,
} from "@/src/domain/gameData";
import type { AttributeKey } from "@/src/domain/character";
import {
  borrowedSkillOptions,
  extraEvadeOptions,
  extraTechniqueOptions,
  grantedTechniques,
  needsBorrowedSkill,
  needsExtraEvade,
  needsExtraTechnique,
  normalizeCharacterBuild,
} from "@/src/domain/characterBuild";
import { getBuiltAttributes } from "@/src/domain/characterRules";
import {
  ARCHETYPE_SKILL_DESCRIPTIONS,
  COMBAT_TECHNIQUE_DESCRIPTIONS,
  SPECIFIC_SKILL_DESCRIPTIONS,
} from "@/src/domain/skillDescriptions";
import { DiceRoller } from "@/src/components/sheet/DiceRoller";
import { Input } from "@/src/components/ui/Input";
import { useHomebrew } from "@/src/hooks/useHomebrew";
import { cn } from "@/src/lib/cn";
import { Card, Screen, SectionHeading } from "@/src/components/ui/Screen";

type SheetPage = "mesa" | "tecnicas" | "estado" | "notas";

const PAGES: { id: SheetPage; label: string }[] = [
  { id: "mesa", label: "01_MESA" },
  { id: "tecnicas", label: "02_TÉCNICAS" },
  { id: "estado", label: "03_ESTADO" },
  { id: "notas", label: "04_NOTAS" },
];

const ATTRIBUTE_GRID: AttributeKey[][] = [
  ["foco", "vontade"],
  ["harmonia", "criatividade"],
];

function signed(value: number) {
  return value >= 0 ? `+${value}` : String(value);
}

export default function SheetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const charId = id!;
  const { character, loading, saveCharacter, updateHp, toggleDamageMarker, toggleCondition, getEffectiveAttributes } =
    useCharacter(charId);
  const brew = useHomebrew();
  const [editing, setEditing] = useState(false);
  const [page, setPage] = useState<SheetPage>("mesa");

  if (loading || !character) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#D05E3E" />
      </View>
    );
  }

  const effective = getEffectiveAttributes()!;
  const normal = getBuiltAttributes(character);
  const activeConditions = [
    ...character.negativeConditions,
    ...character.combatConditions,
    ...character.positiveConditions,
  ];
  const archetype = ARCHETYPES.find((a) => a.id === character.archetype);
  const specificOptions = [
    ...(SPECIFIC_SKILLS[character.archetype] || []),
    ...brew.getSpecificSkills(character.archetype).map((s) => s.name),
  ];

  const adjustAttribute = (key: AttributeKey, field: "baseAttributes" | "bonusAttributes", delta: number) => {
    saveCharacter({
      ...character,
      [field]: { ...character[field], [key]: character[field][key] + delta },
    });
  };

  const attrCell = (key: AttributeKey) => {
    const changed = effective[key] !== normal[key];
    return (
      <View key={key} className="flex-1 border border-border bg-card-strong p-3">
        <Text className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {ATTRIBUTE_LABELS[key]}
        </Text>
        <View className="mt-3 flex-row items-end justify-between gap-2">
          <View>
            <Text className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Normal</Text>
            <Text className="font-mono text-xl font-bold text-foreground">{signed(normal[key])}</Text>
          </View>
          <Text className="pb-1 font-mono text-sm text-border">→</Text>
          <View className="items-end">
            <Text className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Condição</Text>
            <Text className={cn("font-mono text-xl font-bold", changed ? "text-sand" : "text-foreground")}>
              {signed(effective[key])}
            </Text>
          </View>
        </View>
        {editing ? (
          <View className="mt-3 gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="font-mono text-[10px] uppercase text-primary">Base {signed(character.baseAttributes[key])}</Text>
              <View className="flex-row gap-1">
                <Pressable className="h-9 w-9 items-center justify-center border border-border bg-muted" onPress={() => adjustAttribute(key, "baseAttributes", -1)}>
                  <Text className="text-lg text-sand">−</Text>
                </Pressable>
                <Pressable className="h-9 w-9 items-center justify-center border border-primary bg-primary-soft" onPress={() => adjustAttribute(key, "baseAttributes", 1)}>
                  <Text className="text-lg text-sand">+</Text>
                </Pressable>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="font-mono text-[10px] uppercase text-accent">Bônus {signed(character.bonusAttributes[key])}</Text>
              <View className="flex-row gap-1">
                <Pressable className="h-9 w-9 items-center justify-center border border-border bg-muted" onPress={() => adjustAttribute(key, "bonusAttributes", -1)}>
                  <Text className="font-mono text-xs text-accent">−</Text>
                </Pressable>
                <Pressable className="h-9 w-9 items-center justify-center border border-border bg-muted" onPress={() => adjustAttribute(key, "bonusAttributes", 1)}>
                  <Text className="font-mono text-xs text-accent">+</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}
      </View>
    );
  };

  const conditionBlock = (
    title: string,
    items: ConditionEffect[],
    type: "negativeConditions" | "combatConditions" | "positiveConditions"
  ) => (
    <View className="gap-2">
      <Text className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</Text>
      <View className="flex-row flex-wrap gap-2">
        {items.map((item) => {
          const on = character[type].includes(item.label);
          return (
            <Pressable
              key={item.label}
              onPress={() => toggleCondition(type, item.label)}
              className={cn(
                "min-h-[40px] justify-center border px-3 py-2",
                on ? "border-primary bg-primary-soft" : "border-border bg-card-strong"
              )}
            >
              <Text className={cn("font-mono text-xs", on ? "text-sand" : "text-foreground")}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {items
        .filter((item) => character[type].includes(item.label))
        .map((item) => (
          <Text key={`${item.label}-efeito`} className="font-mono text-xs leading-5 text-muted-foreground">
            {item.label}: {item.description}
          </Text>
        ))}
    </View>
  );

  return (
    <Screen maxWidth={800} avoidKeyboard>
      {editing ? (
        <View className="border border-accent bg-card px-4 py-3">
          <Text className="font-mono text-xs font-bold text-accent">⚠ MODO_EDIÇÃO // ATIVO</Text>
        </View>
      ) : null}
      <Card>
        <View className="flex-row justify-between items-start">
          {editing ? (
            <Input
              value={character.name}
              onChangeText={(name) => saveCharacter({ ...character, name })}
              className="mr-3 flex-1 font-display text-lg"
            />
          ) : (
            <Text className="flex-1 font-display text-2xl font-bold text-foreground">{character.name}</Text>
          )}
          <Pressable className="min-h-[44px] justify-center border border-primary bg-primary-soft px-3" onPress={() => setEditing(!editing)}>
            <Text className="font-mono text-xs font-bold text-sand">{editing ? "CONCLUIR" : "EDITAR"}</Text>
          </Pressable>
        </View>
        <Text className="mt-2 font-mono text-sm text-muted-foreground">
          {archetype?.name}
          {character.origin ? ` • ${character.origin}` : ""}
        </Text>
      </Card>

      <View className="flex-row border border-border">
        {PAGES.map((item) => {
          const selected = page === item.id;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => setPage(item.id)}
              className={cn("min-h-[44px] flex-1 items-center justify-center", selected ? "bg-primary" : "bg-card")}
            >
              <Text numberOfLines={1} className={cn("font-mono text-[10px] font-bold", selected ? "text-background" : "text-muted-foreground")}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {page === "mesa" ? (
      <View className="gap-4">
      <Card className="flex-row items-center justify-between border-primary">
        <View>
          <Text className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">Pontos de vida</Text>
          <Text className="mt-1 font-mono text-2xl font-bold text-foreground">
            {character.currentHp}<Text className="text-muted-foreground"> / {character.baseHp}</Text>
          </Text>
        </View>
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => updateHp(-1)} className="h-12 w-12 items-center justify-center border border-border bg-muted">
            <Text className="font-mono text-xl text-foreground">−</Text>
          </Pressable>
          <Pressable onPress={() => updateHp(1)} className="h-12 w-12 items-center justify-center border border-primary bg-primary">
            <Text className="font-mono text-xl text-white">+</Text>
          </Pressable>
        </View>
      </Card>

      <Card>
        <SectionHeading
          title="Atributos"
          description={editing ? "Normal é base + bônus. Condição aplica os debuffs." : "Normal à esquerda, valor com condições à direita."}
        />
        <View className="mt-3 gap-2">
          {ATTRIBUTE_GRID.map((row) => (
            <View key={row.join("-")} className="flex-row gap-2">
              {row.map(attrCell)}
            </View>
          ))}
        </View>
      </Card>

      <Pressable onPress={() => setPage("estado")} className="border border-border bg-card px-4 py-3">
        <Text className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Estado ativo</Text>
        <Text className="mt-1 font-mono text-sm text-foreground">
          {activeConditions.length > 0 ? activeConditions.join(" · ") : "Nenhuma condição"}
        </Text>
      </Pressable>

      <DiceRoller attributes={effective} conditions={activeConditions} />
      </View>
      ) : null}

      {page === "tecnicas" ? (
      <View className="gap-4">
      <Card className="gap-3">
        <SectionHeading title="Técnicas" description="As que este agente pode usar, com o texto." />
        {[
          { category: COMBAT_TECHNIQUES.attack.label, name: character.combatTechniques.attack },
          { category: COMBAT_TECHNIQUES.defend.label, name: character.combatTechniques.defend },
          { category: COMBAT_TECHNIQUES.evade.label, name: character.combatTechniques.evade },
          ...(character.extraEvadeTechnique
            ? [{ category: "Evadir e Observar · extra", name: character.extraEvadeTechnique }]
            : []),
          { category: COMBAT_TECHNIQUES.heal.label, name: character.combatTechniques.heal },
          ...(character.extraTechnique?.name
            ? [{ category: `${COMBAT_TECHNIQUES[character.extraTechnique.category].label} · extra`, name: character.extraTechnique.name }]
            : []),
          ...grantedTechniques(character).map((technique) => ({ category: "Concedida", name: technique.name })),
        ].map((item) => {
          const description =
            COMBAT_TECHNIQUE_DESCRIPTIONS[item.name] ??
            brew.items.find((entry) => entry.name === item.name)?.description;
          return (
            <View key={`${item.category}-${item.name}`} className="border border-border bg-card-strong px-4 py-3">
              <Text className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{item.category}</Text>
              <Text className="mt-1 font-mono text-sm font-bold text-foreground">{item.name}</Text>
              {description ? (
                <Text className="mt-2 font-mono text-xs leading-5 text-muted-foreground">{description}</Text>
              ) : null}
            </View>
          );
        })}
      </Card>

      <Card className="gap-3">
        <SectionHeading title="Perícias" />
        {[
          { category: "Arquétipo", name: character.archetypeSkill },
          { category: "Específica", name: character.specificSkill },
          ...(character.borrowedSkill ? [{ category: "Saga", name: character.borrowedSkill }] : []),
        ].map((item) => {
          const description =
            ARCHETYPE_SKILL_DESCRIPTIONS[item.name] ??
            SPECIFIC_SKILL_DESCRIPTIONS[item.name] ??
            brew.items.find((entry) => entry.name === item.name)?.description;
          return (
            <View key={`${item.category}-${item.name}`} className="border border-border bg-card-strong px-4 py-3">
              <Text className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{item.category}</Text>
              <Text className="mt-1 font-mono text-sm font-bold text-foreground">{item.name}</Text>
              {description ? (
                <Text className="mt-2 font-mono text-xs leading-5 text-muted-foreground">{description}</Text>
              ) : null}
            </View>
          );
        })}
      </Card>

      <Card className="gap-3">
        <SectionHeading title="Trocar" description="A escolha muda os textos acima." />
        <Text className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Específica</Text>
        <View className="flex-row flex-wrap gap-2">
          {specificOptions.map((sk) => (
            <Pressable
              key={sk}
              onPress={() => saveCharacter(normalizeCharacterBuild({ ...character, specificSkill: sk }))}
              className={cn(
                "min-h-[40px] justify-center border px-3 py-2",
                character.specificSkill === sk ? "border-accent bg-card-strong" : "border-border"
              )}
            >
              <Text className={cn("font-mono text-xs", character.specificSkill === sk ? "text-accent" : "text-foreground")}>{sk}</Text>
            </Pressable>
          ))}
        </View>
        {needsBorrowedSkill(character.specificSkill) ? (
          <View className="gap-2">
            <Text className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Saga · outro arquétipo
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {borrowedSkillOptions(character.archetype).map((sk) => (
                <Pressable
                  key={sk}
                  onPress={() => saveCharacter(normalizeCharacterBuild({ ...character, borrowedSkill: sk }))}
                  className={cn(
                    "min-h-[40px] justify-center border px-3 py-2",
                    character.borrowedSkill === sk ? "border-accent bg-card-strong" : "border-border"
                  )}
                >
                  <Text className={cn("font-mono text-xs", character.borrowedSkill === sk ? "text-accent" : "text-foreground")}>{sk}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
        <Text className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Curar e Restaurar</Text>
        <View className="flex-row flex-wrap gap-2">
          {COMBAT_TECHNIQUES.heal.options.map((opt) => (
            <Pressable
              key={opt}
              onPress={() => saveCharacter({ ...character, combatTechniques: { ...character.combatTechniques, heal: opt } })}
              className={cn(
                "min-h-[40px] justify-center border px-3 py-2",
                character.combatTechniques.heal === opt ? "border-accent bg-card-strong" : "border-border"
              )}
            >
              <Text className={cn("font-mono text-xs", character.combatTechniques.heal === opt ? "text-accent" : "text-foreground")}>{opt}</Text>
            </Pressable>
          ))}
        </View>
        {needsExtraEvade(character) ? (
          <View className="gap-2">
            <Text className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Marotagem · Evadir extra
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {extraEvadeOptions(character.combatTechniques.evade).map((opt) => (
                <Pressable
                  key={opt}
                  onPress={() => saveCharacter({ ...character, extraEvadeTechnique: opt })}
                  className={cn(
                    "min-h-[40px] justify-center border px-3 py-2",
                    character.extraEvadeTechnique === opt ? "border-accent bg-card-strong" : "border-border"
                  )}
                >
                  <Text className={cn("font-mono text-xs", character.extraEvadeTechnique === opt ? "text-accent" : "text-foreground")}>{opt}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
        {needsExtraTechnique(character) ? (
          <View className="gap-2">
            <Text className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Kryptônia · técnica extra
            </Text>
            {TECHNIQUE_CATEGORIES.map((category) => (
              <View key={category} className="gap-2">
                <Text className="font-mono text-[10px] uppercase text-muted-foreground">{COMBAT_TECHNIQUES[category].label}</Text>
                <View className="flex-row flex-wrap gap-2">
                  {extraTechniqueOptions(category, character.combatTechniques[category]).map((opt) => (
                    <Pressable
                      key={opt}
                      onPress={() => saveCharacter({ ...character, extraTechnique: { category, name: opt } })}
                      className={cn(
                        "min-h-[40px] justify-center border px-3 py-2",
                        character.extraTechnique?.category === category && character.extraTechnique.name === opt
                          ? "border-accent bg-card-strong"
                          : "border-border"
                      )}
                    >
                      <Text
                        className={cn(
                          "font-mono text-xs",
                          character.extraTechnique?.category === category && character.extraTechnique.name === opt
                            ? "text-accent"
                            : "text-foreground"
                        )}
                      >
                        {opt}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </Card>
      </View>
      ) : null}

      {page === "estado" ? (
      <View className="gap-4">
      <Card className="gap-5">
        <SectionHeading title="Condições" description="Toque para ativar ou remover." />
        {conditionBlock("Negativas", NEGATIVE_CONDITIONS, "negativeConditions")}
        {conditionBlock("Combate", COMBAT_CONDITIONS, "combatConditions")}
        {conditionBlock("Positivas", POSITIVE_CONDITIONS, "positiveConditions")}
      </Card>

      <Card className="gap-3">
        <SectionHeading title="Marcadores de dano" />
        <View className="flex-row flex-wrap gap-2">
          {DAMAGE_TYPES.map((d) => {
            const on = character.damageMarkers.includes(d);
            return (
              <Pressable
                key={d}
                onPress={() => toggleDamageMarker(d)}
                className={cn("min-h-[40px] justify-center border px-3 py-2", on ? "border-destructive bg-card-strong" : "border-border")}
              >
                <Text className={cn("font-mono text-xs", on ? "text-destructive" : "text-foreground")}>{d}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>
      </View>
      ) : null}

      {page === "notas" ? (
      <Card>
        <SectionHeading title="Notas" description="Sessão, inventário, contatos." />
        <Input
          multiline
          value={character.notes || ""}
          onChangeText={(notes) => saveCharacter({ ...character, notes })}
          placeholder="Anotações da sessão, inventário, contatos..."
          className="mt-3 min-h-[280px]"
        />
      </Card>
      ) : null}
    </Screen>
  );
}
