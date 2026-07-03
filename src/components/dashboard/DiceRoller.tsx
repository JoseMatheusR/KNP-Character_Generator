import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRollHistory } from "@/hooks/useRollHistory";

export function DiceRoller() {
  const [result, setResult] = useState<{ d1: number; d2: number; total: number } | null>(null);
  const [rolling, setRolling] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { entries, addRoll, clear } = useRollHistory();

  const roll = () => {
    setRolling(true);
    setTimeout(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      setResult({ d1, d2, total: d1 + d2 });
      setRolling(false);
      addRoll(d1, d2);
    }, 400);
  };

  const getResultLabel = (total: number) => {
    if (total <= 6) return { text: "FALHA", className: "text-destructive" };
    if (total <= 9) return { text: "SUCESSO PARCIAL", className: "text-accent text-glow-warning" };
    return { text: "SUCESSO COMPLETO", className: "text-primary text-glow" };
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="border border-border rounded p-3 bg-card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Simulador 2d6
        </h3>
        <button
          onClick={() => setShowHistory((s) => !s)}
          className="text-[10px] font-mono text-muted-foreground hover:text-primary"
        >
          {showHistory ? "✕ FECHAR" : `📜 HISTÓRICO (${entries.length})`}
        </button>
      </div>

      <button
        onClick={roll}
        disabled={rolling}
        className="w-full py-2 border-2 border-primary rounded font-display text-sm font-bold text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-50 transition-none"
      >
        {rolling ? "..." : "ROLAR DADOS"}
      </button>

      <AnimatePresence mode="wait">
        {result && !rolling && (
          <motion.div
            key={result.total + Math.random()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-1"
          >
            <div className="flex justify-center gap-3">
              <span className="font-display text-2xl font-bold text-foreground border border-border rounded w-10 h-10 flex items-center justify-center">
                {result.d1}
              </span>
              <span className="font-display text-2xl font-bold text-foreground border border-border rounded w-10 h-10 flex items-center justify-center">
                {result.d2}
              </span>
            </div>
            <div className="text-lg font-display font-bold text-foreground">= {result.total}</div>
            <div className={cn("text-xs font-display font-bold uppercase", getResultLabel(result.total).className)}>
              {getResultLabel(result.total).text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showHistory && (
        <div className="border-t border-border pt-2 space-y-1">
          {entries.length === 0 ? (
            <p className="text-[10px] text-muted-foreground font-mono text-center py-2">
              Nenhuma rolagem ainda
            </p>
          ) : (
            <>
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                {entries.map((e) => {
                  const label = getResultLabel(e.total);
                  return (
                    <div
                      key={e.id}
                      className="flex items-center justify-between text-[10px] font-mono border-b border-border/50 py-1 last:border-0"
                    >
                      <span className="text-muted-foreground">{formatTime(e.timestamp)}</span>
                      <span className="text-foreground">
                        {e.d1}+{e.d2}={e.total}
                      </span>
                      <span className={cn("font-bold uppercase text-[9px]", label.className)}>
                        {label.text}
                      </span>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={clear}
                className="w-full text-[10px] font-mono text-destructive hover:underline pt-1"
              >
                LIMPAR HISTÓRICO
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
