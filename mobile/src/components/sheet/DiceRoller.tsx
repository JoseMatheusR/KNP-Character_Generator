import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, Text, View } from "react-native";
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

const RESULT_COLOR: Record<string, string> = {
  FALHA: "#E05A47",
  "SUCESSO PARCIAL": "#D7A63B",
  "SUCESSO COMPLETO": "#9FBA72",
};

const PIP_CELLS: Record<number, boolean[]> = {
  1: [false, false, false, false, true, false, false, false, false],
  2: [true, false, false, false, false, false, false, false, true],
  3: [true, false, false, false, true, false, false, false, true],
  4: [true, false, true, false, false, false, true, false, true],
  5: [true, false, true, false, true, false, true, false, true],
  6: [true, false, true, true, false, true, true, false, true],
};

function DieFace({ value, tumbling }: { value: number; tumbling: boolean }) {
  const tilt = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!tumbling) {
      tilt.setValue(0);
      return;
    }
    Animated.sequence([
      Animated.timing(tilt, { toValue: 1, duration: 90, useNativeDriver: true }),
      Animated.timing(tilt, { toValue: 0, duration: 90, useNativeDriver: true }),
    ]).start();
  }, [tilt, tumbling, value]);

  const rotate = tilt.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "14deg"] });
  const pips = PIP_CELLS[value] ?? PIP_CELLS[1];
  const size = 72;
  const pad = 10;
  const cell = (size - pad * 2) / 3;
  const pip = 12;

  return (
    <Animated.View
      style={{
        transform: [{ rotate }],
        width: size,
        height: size,
        borderWidth: 1,
        borderColor: "#E0BE83",
        backgroundColor: "#201B14",
      }}
    >
      {pips.map((filled, index) => {
        if (!filled) return null;
        const column = index % 3;
        const row = Math.floor(index / 3);
        return (
          <View
            key={index}
            style={{
              position: "absolute",
              width: pip,
              height: pip,
              left: pad + column * cell + (cell - pip) / 2,
              top: pad + row * cell + (cell - pip) / 2,
              backgroundColor: "#E0BE83",
            }}
          />
        );
      })}
    </Animated.View>
  );
}

export function DiceRoller({ attributes, conditions }: { attributes: Attributes; conditions: string[] }) {
  const [attribute, setAttribute] = useState<AttributeKey>("foco");
  const [result, setResult] = useState<{ d1: number; d2: number; modifier: number; total: number } | null>(null);
  const [faces, setFaces] = useState<[number, number]>([6, 6]);
  const [rolling, setRolling] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [entries, setEntries] = useState<RollEntry[]>([]);
  const resultOpacity = useRef(new Animated.Value(0)).current;

  const loadHistory = useCallback(async () => {
    setEntries(await rollStorage.loadRollHistory());
  }, []);

  const modifier = attributeRollModifier(attribute, attributes[attribute], conditions);

  const roll = async () => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2 + modifier;
    setFaces([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]);
    setRolling(true);
    let ticks = 0;
    const timer = setInterval(() => {
      ticks += 1;
      if (ticks < 6) {
        setFaces([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]);
        return;
      }
      clearInterval(timer);
      setFaces([d1, d2]);
      setResult({ d1, d2, modifier, total });
      resultOpacity.setValue(0);
      Animated.timing(resultOpacity, { toValue: 1, duration: 220, useNativeDriver: true }).start();
      setRolling(false);
      void rollStorage.addRoll(d1, d2, { attribute: ATTRIBUTE_LABELS[attribute], modifier }).then(loadHistory);
    }, 220);
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
        className="min-h-[120px] items-center justify-center border border-primary bg-primary-soft py-4"
      >
        <View className="flex-row items-center gap-3">
          <DieFace value={faces[0]} tumbling={rolling} />
          <DieFace value={faces[1]} tumbling={rolling} />
        </View>
        {result && !rolling ? (
          <Text className="mt-3 font-mono text-sm text-foreground">
            {`${signed(result.modifier)} · total ${result.total}`}
          </Text>
        ) : null}
        {label && !rolling ? (
          <Animated.Text
            style={{
              opacity: resultOpacity,
              marginTop: 4,
              fontFamily: "SpaceMono",
              fontSize: 14,
              fontWeight: "700",
              color: RESULT_COLOR[label],
            }}
          >
            {label}
          </Animated.Text>
        ) : null}
      </Pressable>

      {showHistory && (
        <View className="overflow-hidden border border-border bg-card-strong">
          {entries.length === 0 ? (
            <Text className="px-3 py-4 text-center font-mono text-xs text-muted-foreground">Nenhuma rolagem</Text>
          ) : (
            <ScrollView style={{ maxHeight: 160 }} contentContainerStyle={{ gap: 8, padding: 12 }}>
              {entries.slice(0, 10).map((e) => (
                <Text key={e.id} className="font-mono text-xs leading-5" style={{ color: RESULT_COLOR[e.result] ?? "#B5A68F" }}>
                  {e.d1}+{e.d2}
                  {e.modifier !== undefined ? ` ${e.modifier >= 0 ? "+" : ""}${e.modifier}` : ""}={e.total}
                  {e.attribute ? ` ${e.attribute}` : ""} — {e.result}
                </Text>
              ))}
            </ScrollView>
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
