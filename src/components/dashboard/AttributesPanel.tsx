import type { Attributes, AttributeKey } from "@/types/character";
import { ATTRIBUTE_LABELS } from "@/data/gameData";
import { cn } from "@/lib/utils";

interface Props {
  baseAttributes: Attributes;
  bonusAttributes: Attributes;
  effectiveAttributes: Attributes;
  debuffs: Attributes;
  editing?: boolean;
  onUpdateBase?: (attr: AttributeKey, delta: number) => void;
  onUpdateBonus?: (attr: AttributeKey, delta: number) => void;
}

export function AttributesPanel({ baseAttributes, bonusAttributes, effectiveAttributes, debuffs, editing, onUpdateBase, onUpdateBonus }: Props) {
  return (
    <div className={cn("border rounded p-3 bg-card space-y-3", editing ? "border-accent" : "border-border")}>
      <h3 className="font-display text-xs font-bold text-muted-foreground uppercase tracking-widest">
        Atributos
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(ATTRIBUTE_LABELS) as AttributeKey[]).map((key) => {
          const base = baseAttributes[key];
          const bonus = bonusAttributes[key];
          const total = base + bonus;
          const effective = effectiveAttributes[key];
          const hasDebuff = debuffs[key] < 0;

          return (
            <div key={key} className={cn("border rounded p-3 bg-background text-center", editing ? "border-accent/50" : "border-border")}>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-mono">
                {ATTRIBUTE_LABELS[key]}
              </div>

              {editing ? (
                <div className="space-y-2">
                  {/* Base */}
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-[9px] text-muted-foreground font-mono w-10 text-right">Base:</span>
                    <button onClick={() => onUpdateBase?.(key, -1)} className="w-5 h-5 border border-accent rounded text-[10px] font-bold text-accent hover:bg-accent hover:text-accent-foreground transition-none">−</button>
                    <span className="font-mono text-sm font-bold text-foreground w-6 text-center">{base >= 0 ? `+${base}` : base}</span>
                    <button onClick={() => onUpdateBase?.(key, 1)} className="w-5 h-5 border border-accent rounded text-[10px] font-bold text-accent hover:bg-accent hover:text-accent-foreground transition-none">+</button>
                  </div>
                  {/* Bonus */}
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-[9px] text-muted-foreground font-mono w-10 text-right">Bônus:</span>
                    <button onClick={() => onUpdateBonus?.(key, -1)} className="w-5 h-5 border border-accent rounded text-[10px] font-bold text-accent hover:bg-accent hover:text-accent-foreground transition-none">−</button>
                    <span className="font-mono text-sm font-bold text-foreground w-6 text-center">{bonus >= 0 ? `+${bonus}` : bonus}</span>
                    <button onClick={() => onUpdateBonus?.(key, 1)} className="w-5 h-5 border border-accent rounded text-[10px] font-bold text-accent hover:bg-accent hover:text-accent-foreground transition-none">+</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  {hasDebuff && (
                    <span className="text-sm text-muted-foreground line-through font-mono">
                      {total >= 0 ? `+${total}` : total}
                    </span>
                  )}
                  <span className={cn(
                    "font-display text-2xl font-bold",
                    hasDebuff ? "text-accent text-glow-warning" : effective > 0 ? "text-primary" : effective < 0 ? "text-destructive" : "text-foreground"
                  )}>
                    {effective >= 0 ? `+${effective}` : effective}
                  </span>
                </div>
              )}

              {!editing && hasDebuff && (
                <div className="text-[9px] text-accent font-mono mt-1">{debuffs[key]}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
