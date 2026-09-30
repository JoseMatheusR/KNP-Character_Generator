import { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { rollResultFromTotal } from "@/src/domain/diceRules";
import * as rollStorage from "@/src/storage/rollHistory";
import type { RollEntry } from "@/src/storage/rollHistory";
import { Button } from "@/src/components/ui/Button";
import { Card, SectionHeading } from "@/src/components/ui/Screen";

export function DiceRoller() {
  const [result, setResult] = useState<{ d1: number; d2: number; total: number } | null>(null);
  const [rolling, setRolling] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [entries, setEntries] = useState<RollEntry[]>([]);

  const loadHistory = useCallback(async () => {
    setEntries(await rollStorage.loadRollHistory());
  }, []);

  const roll = async () => {
    setRolling(true);
    setTimeout(async () => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      setResult({ d1, d2, total: d1 + d2 });
      await rollStorage.addRoll(d1, d2);
      await loadHistory();
      setRolling(false);
    }, 400);
  };

  const label = result ? rollResultFromTotal(result.total) : null;

  return (
    <Card className="gap-4">
      <SectionHeading
        title="Rolagem 2d6"
        description="Role os dados e consulte seus resultados recentes."
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

      <Pressable
        onPress={roll}
        disabled={rolling}
        className="min-h-[96px] items-center justify-center border border-primary bg-primary-soft py-4"
      >
        <Text className="font-mono text-xl font-bold text-sand">
          {rolling ? "PROCESSANDO..." : result ? `${result.d1} + ${result.d2} = ${result.total}` : "[ EXECUTAR_2D6 ]"}
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
                {e.d1}+{e.d2}={e.total} — {e.result}
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
