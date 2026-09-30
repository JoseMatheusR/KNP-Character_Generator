import { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { AttributeKey, Attributes } from "@/src/domain/character";
import { ATTRIBUTE_LABELS } from "@/src/domain/gameData";
import { attributeRollModifier, rollResultFromTotal } from "@/src/domain/diceRules";
import * as rollStorage from "@/src/storage/rollHistory";
import type { RollEntry } from "@/src/storage/rollHistory";
import { Button } from "@/src/components/ui/Button";
import { Card, SectionHeading } from "@/src/components/ui/Screen";
import { cn } from "@/src/lib/cn";

const ATTRIBUTE_KEYS: AttributeKey[] = ["foco", "vontade", "harmonia", "criatividade"];

function signed(value: number) {
  return value >= 0 ? `+${value}` : String(value);
}

export function DiceRoller({ attributes, conditions }: { attributes: Attributes; conditions: string[] }) {
  const [attribute, setAttribute] = useState<AttributeKey>("foco");
  const [result, setResult] = useState<{ d1: number; d2: number; modifier: number; total: number } | null>(null);
  const [rolling, setRolling] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [entries, setEntries] = useState<RollEntry[]>([]);

  const loadHistory = useCallback(async () => {
    setEntries(await rollStorage.loadRollHistory());
  }, []);

  const modifier = attributeRollModifier(attribute, attributes[attribute], conditions);

  const roll = async () => {
    setRolling(true);
    setTimeout(async () => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const total = d1 + d2 + modifier;
      setResult({ d1, d2, modifier, total });
      await rollStorage.addRoll(d1, d2, { attribute: ATTRIBUTE_LABELS[attribute], modifier });
      await loadHistory();
      setRolling(false);
    }, 400);
  };

  const label = result ? rollResultFromTotal(result.total) : null;

  return (
    <Card className="gap-4">
      <SectionHeading
        title="Rolagem 2d6"
        description="O resultado soma os 2d6 ao atributo efetivo."
        action={
        <Pressable
          className="min-h-[40px] justify-center border border-border bg-muted px-3"
          onPress={async () => {
            if (!showHistory) await loadHistory();
            setShowHistory((s) => !s);
          }}
        >
          <Text className="font-mono text-xs font-bold text-muted-foreground">
            {showHistory ? "Fechar" : "Histórico"}
          </Text>
        </Pressable>
        }
      />

      <View className="flex-row gap-2">
        {ATTRIBUTE_KEYS.map((key) => {
          const selected = attribute === key;
          return (
            <Pressable
              key={key}
              onPress={() => setAttribute(key)}
              className={cn(
                "min-h-[52px] flex-1 items-center justify-center border px-1 py-2",
                selected ? "border-primary bg-primary-soft" : "border-border bg-card-strong"
              )}
            >
              <Text className={cn("font-mono text-[10px] font-bold", selected ? "text-sand" : "text-muted-foreground")}>
                {ATTRIBUTE_LABELS[key].toUpperCase()}
              </Text>
              <Text className="mt-1 font-mono text-sm font-bold text-foreground">{signed(attributes[key])}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={roll}
        disabled={rolling}
        className="min-h-[96px] items-center justify-center border border-primary bg-primary-soft py-4"
      >
        <Text className="font-mono text-xl font-bold text-sand">
          {rolling
            ? "PROCESSANDO..."
            : result
              ? `${result.d1} + ${result.d2} ${signed(result.modifier)} = ${result.total}`
              : `[ 2D6 ${signed(modifier)} ]`}
        </Text>
        {label && (
          <Text
            className={`mt-2 font-mono text-sm font-bold ${
              label === "FALHA" ? "text-destructive" : label === "SUCESSO PARCIAL" ? "text-accent" : "text-sand"
            }`}
          >
            {label}
          </Text>
        )}
      </Pressable>

      {showHistory && (
        <View className="max-h-52 gap-2 border border-border bg-card-strong p-3">
          {entries.length === 0 ? (
            <Text className="py-2 text-center font-mono text-xs text-muted-foreground">Nenhuma rolagem</Text>
          ) : (
            entries.slice(0, 10).map((e) => (
              <Text key={e.id} className="font-mono text-xs text-muted-foreground">
                {e.d1}+{e.d2}
                {e.modifier !== undefined ? ` ${e.modifier >= 0 ? "+" : ""}${e.modifier}` : ""}={e.total}
                {e.attribute ? ` ${e.attribute}` : ""} — {e.result}
              </Text>
            ))
          )}
          <Button
            label="Limpar histórico"
            variant="ghost"
            textClassName="text-destructive"
            onPress={async () => {
              await rollStorage.clearRollHistory();
              await loadHistory();
            }}
          />
        </View>
      )}
    </Card>
  );
}
