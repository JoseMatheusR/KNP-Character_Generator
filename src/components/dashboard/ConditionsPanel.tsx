import { Checkbox } from "@/components/ui/checkbox";
import { NEGATIVE_CONDITIONS, COMBAT_CONDITIONS, POSITIVE_CONDITIONS } from "@/data/gameData";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  negativeConditions: string[];
  combatConditions: string[];
  positiveConditions: string[];
  onToggle: (type: "negativeConditions" | "combatConditions" | "positiveConditions", condition: string) => void;
}

export function ConditionsPanel({ negativeConditions, combatConditions, positiveConditions, onToggle }: Props) {
  const [flashCondition, setFlashCondition] = useState<string | null>(null);

  const handleNegativeToggle = (label: string) => {
    const isActivating = !negativeConditions.includes(label);
    onToggle("negativeConditions", label);
    if (isActivating) {
      setFlashCondition(label);
      setTimeout(() => setFlashCondition(null), 600);
    }
  };

  return (
    <div className="space-y-4 relative">
      {/* Flash overlay */}
      <AnimatePresence>
        {flashCondition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none flash-warning"
          >
            <span className="font-display text-3xl font-bold text-accent text-glow-warning glitch-text uppercase">
              {flashCondition}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Negative */}
      <div className="border border-border rounded p-3 bg-card space-y-2">
        <h3 className="font-display text-xs font-bold text-accent uppercase tracking-widest">
          Condições Negativas
        </h3>
        {NEGATIVE_CONDITIONS.map((c) => {
          const active = negativeConditions.includes(c.label);
          const effectsText = Object.entries(c.effects)
            .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)} ${v}`)
            .join(", ");
          return (
            <label key={c.label} className="flex items-center gap-3 py-1 cursor-pointer">
              <Checkbox checked={active} onCheckedChange={() => handleNegativeToggle(c.label)} />
              <div>
                <span className={cn("text-sm font-mono", active ? "text-accent font-bold" : "text-foreground")}>{c.label}</span>
                <span className="text-[9px] text-muted-foreground ml-2 font-mono">({effectsText})</span>
              </div>
            </label>
          );
        })}
      </div>

      {/* Combat */}
      <div className="border border-border rounded p-3 bg-card space-y-2">
        <h3 className="font-display text-xs font-bold text-destructive uppercase tracking-widest">
          Condições de Combate
        </h3>
        {COMBAT_CONDITIONS.map((c) => {
          const active = combatConditions.includes(c);
          return (
            <label key={c} className="flex items-center gap-3 py-1 cursor-pointer">
              <Checkbox checked={active} onCheckedChange={() => onToggle("combatConditions", c)} />
              <span className={cn("text-sm font-mono", active ? "text-destructive font-bold" : "text-foreground")}>{c}</span>
            </label>
          );
        })}
      </div>

      {/* Positive */}
      <div className="border border-border rounded p-3 bg-card space-y-2">
        <h3 className="font-display text-xs font-bold text-primary uppercase tracking-widest">
          Condições Positivas
        </h3>
        {POSITIVE_CONDITIONS.map((c) => {
          const active = positiveConditions.includes(c);
          return (
            <label key={c} className="flex items-center gap-3 py-1 cursor-pointer">
              <Checkbox checked={active} onCheckedChange={() => onToggle("positiveConditions", c)} />
              <span className={cn("text-sm font-mono", active ? "text-primary font-bold" : "text-foreground")}>{c}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
