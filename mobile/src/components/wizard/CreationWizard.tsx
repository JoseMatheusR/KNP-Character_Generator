import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ARCHETYPES, SPECIFIC_SKILLS, COMBAT_TECHNIQUES, TECHNIQUE_CATEGORIES, canSpendAttributePoint } from "@/src/domain/gameData";
import { COMBAT_TECHNIQUE_DESCRIPTIONS, SPECIFIC_SKILL_DESCRIPTIONS } from "@/src/domain/skillDescriptions";
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
import { isValidBonusDistribution } from "@/src/domain/characterRules";
import type { Attributes, Character, AttributeKey, ExtraTechnique, TechniqueCategory } from "@/src/domain/character";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { PatternBand } from "@/src/components/ui/Screen";
import { useHomebrew } from "@/src/hooks/useHomebrew";
import { cn } from "@/src/lib/cn";

const emptyAttrs: Attributes = { foco: 0, vontade: 0, harmonia: 0, criatividade: 0 };

interface Props {
  onComplete: (character: Character) => void;
  onCancel: () => void;
}

export function CreationWizard({ onComplete, onCancel }: Props) {
  const insets = useSafeAreaInsets();
  const brew = useHomebrew();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("");
  const [archetypeId, setArchetypeId] = useState("");
  const [bonusAttributes, setBonusAttributes] = useState<Attributes>({ ...emptyAttrs });
  const [specificSkill, setSpecificSkill] = useState("");
  const [borrowedSkill, setBorrowedSkill] = useState<string | null>(null);
  const [extraEvadeTechnique, setExtraEvadeTechnique] = useState<string | null>(null);
  const [extraTechnique, setExtraTechnique] = useState<ExtraTechnique | null>(null);
  const [techniques, setTechniques] = useState({ attack: "", evade: "", defend: "", heal: "" });

  const archetype = ARCHETYPES.find((a) => a.id === archetypeId);
  const spentPoints = Object.values(bonusAttributes).reduce((sum, value) => sum + value, 0);

  const canNext = (): boolean => {
    switch (step) {
      case 1:
        return name.trim().length > 0;
      case 2:
        return !!archetypeId;
      case 3:
        return isValidBonusDistribution(bonusAttributes);
      case 4:
        return !!specificSkill && (!needsBorrowedSkill(specificSkill) || !!borrowedSkill);
      case 5: {
        const build = { archetypeSkill: archetype?.skill ?? "", specificSkill, borrowedSkill };
        return (
          !!techniques.attack &&
          !!techniques.evade &&
          !!techniques.defend &&
          !!techniques.heal &&
          (!needsExtraEvade(build) || (!!extraEvadeTechnique && extraEvadeTechnique !== techniques.evade)) &&
          (!needsExtraTechnique(build) ||
            (!!extraTechnique?.name && extraTechnique.name !== techniques[extraTechnique.category]))
        );
      }
      default:
        return false;
    }
  };

  const handleFinish = () => {
    if (!archetype) return;
    const char: Character = {
      name,
      origin,
      avatar: null,
      archetype: archetypeId,
      baseHp: archetype.hp,
      currentHp: archetype.hp,
      baseAttributes: { ...archetype.attributes },
      bonusAttributes: { ...bonusAttributes },
      archetypeSkill: archetype.skill,
      specificSkill,
      borrowedSkill,
      extraEvadeTechnique,
      extraTechnique,
      combatTechniques: { ...techniques },
      damageMarkers: [],
      negativeConditions: [],
      combatConditions: [],
      positiveConditions: [],
    };
    onComplete(normalizeCharacterBuild(char));
  };

  const adjustBonus = (key: AttributeKey, delta: number) => {
    setBonusAttributes((prev) => {
      if (!archetype) return prev;
      if (delta > 0 && !canSpendAttributePoint(archetype.attributes, prev, key)) return prev;
      const next = { ...prev, [key]: prev[key] + delta };
      if (next[key] < 0) return prev;
      return next;
    });
  };

  const specificOptions = [
    ...(SPECIFIC_SKILLS[archetypeId] || []),
    ...brew.getSpecificSkills(archetypeId).map((s) => s.name),
  ];

  const renderTechniques = (cat: TechniqueCategory) => {
    const cfg = COMBAT_TECHNIQUES[cat];
    const homebrew = brew.getCombatTechniques(cat);
    const options = [...cfg.options, ...homebrew.map((s) => s.name)];
    return (
      <View className="gap-2 mb-4">
        <Text className="font-display text-sm font-bold text-foreground">{cfg.label}</Text>
        {options.map((opt) => {
          const description = COMBAT_TECHNIQUE_DESCRIPTIONS[opt] ?? homebrew.find((s) => s.name === opt)?.description;
          return (
            <Pressable
              key={opt}
              onPress={() => {
                setTechniques((t) => ({ ...t, [cat]: opt }));
                if (cat === "evade") {
                  setExtraEvadeTechnique((current) => (current === opt ? null : current));
                }
                setExtraTechnique((current) => (current?.category === cat && current.name === opt ? null : current));
              }}
              className={cn(
                "min-h-[56px] border px-4 py-3",
                techniques[cat] === opt ? "border-primary bg-primary-soft" : "border-border bg-card"
              )}
            >
              <View className="flex-row items-center justify-between">
                <Text className="flex-1 font-mono text-sm leading-5 text-foreground">{opt}</Text>
                <Text className={cn("ml-3 text-lg", techniques[cat] === opt ? "text-sand" : "text-border")}>●</Text>
              </View>
              {description ? (
                <Text className="mt-2 font-mono text-xs leading-5 text-muted-foreground">{description}</Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={96}
    >
      <View className="border-b border-border bg-card">
        <PatternBand />
        <View className="px-4 pb-4 pt-3">
        <View className="w-full max-w-[720px] self-center gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-mono text-xs font-bold text-primary">[ ETAPA_{String(step).padStart(2, "0")} / 05 ]</Text>
            <Text className="font-mono text-xs text-terminal">SYS {Math.round((step / 5) * 100)}%</Text>
          </View>
          <View className="h-2 overflow-hidden border border-border bg-muted">
            <View className="h-full bg-primary" style={{ width: `${(step / 5) * 100}%` }} />
          </View>
        </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[720px] self-center gap-5 p-4 pb-8">
        {step === 1 && (
          <View className="gap-4">
            <View className="mb-2 gap-1">
              <Text className="font-display text-2xl font-bold text-foreground">{"> IDENTIFICAR_AGENTE"}</Text>
              <Text className="font-mono text-sm leading-5 text-muted-foreground">
                Comece com um nome. A origem ajuda a contar de onde ele veio.
              </Text>
            </View>
            <Input placeholder="Nome do personagem" value={name} onChangeText={setName} />
            <Input placeholder="Origem e conceito" value={origin} onChangeText={setOrigin} />
          </View>
        )}

        {step === 2 && (
          <View className="gap-3">
            <View className="mb-1 gap-1">
              <Text className="font-display text-2xl font-bold text-foreground">{"> SELECIONAR_ARQUÉTIPO"}</Text>
              <Text className="font-mono text-sm leading-5 text-muted-foreground">
                Ele define seus atributos iniciais, HP e habilidade principal.
              </Text>
            </View>
            {ARCHETYPES.map((a) => (
              <Pressable
                key={a.id}
                onPress={() => {
                  setArchetypeId(a.id);
                  setBonusAttributes({ ...emptyAttrs });
                  setSpecificSkill("");
                  setBorrowedSkill(null);
                  setExtraEvadeTechnique(null);
                  setExtraTechnique(null);
                }}
                className={cn(
                  "border p-4",
                  archetypeId === a.id ? "border-primary bg-primary-soft" : "border-border bg-card"
                )}
              >
                <View className="flex-row items-center justify-between gap-3">
                  <Text className="flex-1 font-display text-base font-bold text-foreground">
                    {archetypeId === a.id ? "■ " : "□ "}{a.name}
                  </Text>
                  <Text className="border border-border bg-muted px-3 py-1 font-mono text-xs text-accent">HP_{a.hp}</Text>
                </View>
                <Text className="mt-2 font-mono text-sm leading-5 text-muted-foreground">{a.description}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {step === 3 && archetype && (
          <View className="gap-3">
            <View className="mb-1 gap-1">
              <Text className="font-display text-2xl font-bold text-foreground">{"> DISTRIBUIR_BÔNUS"}</Text>
              <Text className="font-mono text-sm leading-5 text-muted-foreground">
                Use exatamente 2 pontos. O atributo final não passa de +3, e nenhum ponto sobe mais que +2.
              </Text>
            </View>
            <View className="flex-row items-center gap-2 border border-border bg-card px-3 py-3">
              <Text className="font-mono text-xs font-bold text-muted-foreground">PONTOS</Text>
              {[0, 1].map((slot) => (
                <View
                  key={slot}
                  className={cn("h-3 w-8", slot < spentPoints ? "bg-primary" : "border border-border bg-muted")}
                />
              ))}
              <Text className="ml-auto font-mono text-xs text-sand">
                {spentPoints}/2
              </Text>
            </View>
            {(Object.keys(emptyAttrs) as AttributeKey[]).map((key) => (
              <View
                key={key}
                className={cn(
                  "min-h-[72px] flex-row items-center justify-between border p-3",
                  bonusAttributes[key] > 0 ? "border-primary bg-primary-soft" : "border-border bg-card"
                )}
              >
                <View>
                  <Text className="font-mono text-sm font-bold capitalize text-foreground">{key}</Text>
                  <Text className="mt-1 font-mono text-xs text-muted-foreground">
                    Base {archetype.attributes[key] >= 0 ? "+" : ""}{archetype.attributes[key]}
                  </Text>
                  <View className="mt-2 flex-row gap-1">
                    {[0, 1].map((slot) => (
                      <View
                        key={slot}
                        className={cn("h-2 w-4", slot < bonusAttributes[key] ? "bg-sand" : "bg-border")}
                      />
                    ))}
                  </View>
                </View>
                <View className="flex-row items-center gap-2">
                  <Pressable className="h-11 w-11 items-center justify-center border border-border bg-muted" onPress={() => adjustBonus(key, -1)}>
                    <Text className="text-xl text-foreground">−</Text>
                  </Pressable>
                  <Text className="w-10 text-center font-mono text-lg font-bold text-primary">
                    {archetype.attributes[key] + bonusAttributes[key] >= 0 ? "+" : ""}
                    {archetype.attributes[key] + bonusAttributes[key]}
                  </Text>
                  <Pressable className="h-11 w-11 items-center justify-center border border-primary bg-primary-soft" onPress={() => adjustBonus(key, 1)}>
                    <Text className="text-xl text-sand">+</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {step === 4 && (
          <View className="gap-3">
            <View className="mb-1 gap-1">
              <Text className="font-display text-2xl font-bold text-foreground">{"> CARREGAR_PERÍCIA"}</Text>
              <Text className="font-mono text-sm leading-5 text-muted-foreground">
                Selecione a especialidade que mais combina com seu agente.
              </Text>
            </View>
            {specificOptions.map((sk) => {
              const description =
                SPECIFIC_SKILL_DESCRIPTIONS[sk] ??
                brew.getSpecificSkills(archetypeId).find((item) => item.name === sk)?.description;
              return (
                <Pressable
                  key={sk}
                  onPress={() => {
                    setSpecificSkill(sk);
                    if (!needsBorrowedSkill(sk)) setBorrowedSkill(null);
                    if (sk !== "Marotagem" && borrowedSkill !== "Marotagem") setExtraEvadeTechnique(null);
                  }}
                  className={cn(
                    "min-h-[56px] border px-4 py-3",
                    specificSkill === sk ? "border-primary bg-primary-soft" : "border-border bg-card"
                  )}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="flex-1 font-mono text-sm text-foreground">{sk}</Text>
                    <Text className={cn("ml-3 text-lg", specificSkill === sk ? "text-sand" : "text-border")}>●</Text>
                  </View>
                  {description ? (
                    <Text className="mt-2 font-mono text-xs leading-5 text-muted-foreground">{description}</Text>
                  ) : null}
                </Pressable>
              );
            })}
            {needsBorrowedSkill(specificSkill) ? (
              <View className="mt-2 gap-2">
                <Text className="font-display text-sm font-bold text-foreground">Perícia de outro arquétipo</Text>
                <Text className="font-mono text-xs leading-5 text-muted-foreground">
                  Saga de um vaqueiro pede uma perícia específica de outro arquétipo, exceto A Aberração.
                </Text>
                {borrowedSkillOptions(archetypeId).map((sk) => {
                  const description = SPECIFIC_SKILL_DESCRIPTIONS[sk];
                  return (
                    <Pressable
                      key={sk}
                      onPress={() => {
                        setBorrowedSkill(sk);
                        if (sk !== "Marotagem" && specificSkill !== "Marotagem") setExtraEvadeTechnique(null);
                      }}
                      className={cn(
                        "border px-4 py-3",
                        borrowedSkill === sk ? "border-primary bg-primary-soft" : "border-border bg-card"
                      )}
                    >
                      <Text className="font-mono text-sm text-foreground">{borrowedSkill === sk ? "■ " : "□ "}{sk}</Text>
                      {description ? (
                        <Text className="mt-2 font-mono text-xs leading-5 text-muted-foreground">{description}</Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>
        )}

        {step === 5 && (
          <View>
            <View className="mb-5 gap-1">
              <Text className="font-display text-2xl font-bold text-foreground">{"> PROTOCOLOS_COMBATE"}</Text>
              <Text className="font-mono text-sm leading-5 text-muted-foreground">
                Escolha uma técnica para cada tipo de ação.
              </Text>
            </View>
            {grantedTechniques({
              archetypeSkill: archetype?.skill ?? "",
              specificSkill,
              borrowedSkill,
            }).map((technique) => (
              <View key={technique.name} className="mb-4 border border-accent bg-card px-4 py-3">
                <Text className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent">
                  Concedida · {COMBAT_TECHNIQUES[technique.category].label}
                </Text>
                <Text className="mt-1 font-mono text-sm text-foreground">{technique.name}</Text>
                <Text className="mt-2 font-mono text-xs leading-5 text-muted-foreground">
                  {COMBAT_TECHNIQUE_DESCRIPTIONS[technique.name]}
                </Text>
              </View>
            ))}
            {renderTechniques("attack")}
            {renderTechniques("evade")}
            {needsExtraEvade({ archetypeSkill: archetype?.skill ?? "", specificSkill, borrowedSkill }) ? (
              <View className="mb-4 gap-2">
                <Text className="font-display text-sm font-bold text-foreground">Marotagem · técnica extra</Text>
                <Text className="font-mono text-xs leading-5 text-muted-foreground">
                  Escolha mais uma técnica de Evadir e Observar, diferente da principal.
                </Text>
                {extraEvadeOptions(techniques.evade).map((opt) => (
                  <Pressable
                    key={opt}
                    onPress={() => setExtraEvadeTechnique(opt)}
                    className={cn(
                      "border px-4 py-3",
                      extraEvadeTechnique === opt ? "border-primary bg-primary-soft" : "border-border bg-card"
                    )}
                  >
                    <Text className="font-mono text-sm text-foreground">{extraEvadeTechnique === opt ? "■ " : "□ "}{opt}</Text>
                    <Text className="mt-2 font-mono text-xs leading-5 text-muted-foreground">
                      {COMBAT_TECHNIQUE_DESCRIPTIONS[opt]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
            {renderTechniques("defend")}
            {renderTechniques("heal")}
            {needsExtraTechnique({ archetypeSkill: archetype?.skill ?? "", specificSkill, borrowedSkill }) ? (
              <View className="mb-4 gap-2">
                <Text className="font-display text-sm font-bold text-foreground">Kryptônia · técnica extra</Text>
                <Text className="font-mono text-xs leading-5 text-muted-foreground">
                  Escolha mais uma técnica de qualquer tipo, diferente da que você já escolheu nessa ação.
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {TECHNIQUE_CATEGORIES.map((category) => (
                    <Pressable
                      key={category}
                      onPress={() => setExtraTechnique({ category, name: "" })}
                      className={cn(
                        "border px-3 py-2",
                        extraTechnique?.category === category ? "border-primary bg-primary-soft" : "border-border bg-card"
                      )}
                    >
                      <Text className="font-mono text-xs text-foreground">{COMBAT_TECHNIQUES[category].label}</Text>
                    </Pressable>
                  ))}
                </View>
                {extraTechnique
                  ? extraTechniqueOptions(extraTechnique.category, techniques[extraTechnique.category]).map((opt) => (
                      <Pressable
                        key={opt}
                        onPress={() => setExtraTechnique({ category: extraTechnique.category, name: opt })}
                        className={cn(
                          "border px-4 py-3",
                          extraTechnique.name === opt ? "border-primary bg-primary-soft" : "border-border bg-card"
                        )}
                      >
                        <Text className="font-mono text-sm text-foreground">{extraTechnique.name === opt ? "■ " : "□ "}{opt}</Text>
                        <Text className="mt-2 font-mono text-xs leading-5 text-muted-foreground">
                          {COMBAT_TECHNIQUE_DESCRIPTIONS[opt]}
                        </Text>
                      </Pressable>
                    ))
                  : null}
              </View>
            ) : null}
          </View>
        )}
        </View>
      </ScrollView>

      <View
        className="border-t border-border bg-card px-4 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <View className="w-full max-w-[720px] self-center flex-row items-center gap-3">
        <Button
          label={step === 1 ? "Cancelar" : "Voltar"}
          variant="ghost"
          onPress={() => (step === 1 ? onCancel() : setStep((s) => s - 1))}
          className="flex-1"
        />
        {step < 5 ? (
          <Button
            label="Continuar"
            disabled={!canNext()}
            onPress={() => setStep((s) => s + 1)}
            className="flex-1"
          />
        ) : (
          <Button label="Criar agente" disabled={!canNext()} onPress={handleFinish} className="flex-1" />
        )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
