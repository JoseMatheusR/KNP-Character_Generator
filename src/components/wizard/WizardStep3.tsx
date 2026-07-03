import type { Attributes, AttributeKey } from "@/types/character";
import { ATTRIBUTE_LABELS } from "@/data/gameData";
import { cn } from "@/lib/utils";

interface Props {
  baseAttributes: Attributes;
  bonusAttributes: Attributes;
  onBonusChange: (attr: Attributes) => void;
}

const MAX_BONUS = 2;

export function WizardStep3({ baseAttributes, bonusAttributes, onBonusChange }: Props) {
  const totalUsed = Object.values(bonusAttributes).reduce((s, v) => s + v, 0);
  const remaining = MAX_BONUS - totalUsed;

  const handleAdd = (key: AttributeKey) => {
    if (remaining <= 0) return;
    onBonusChange({ ...bonusAttributes, [key]: bonusAttributes[key] + 1 });
  };

  const handleRemove = (key: AttributeKey) => {
    if (bonusAttributes[key] <= 0) return;
    onBonusChange({ ...bonusAttributes, [key]: bonusAttributes[key] - 1 });
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div>
        <h2 className="font-display text-2xl font-bold text-primary text-glow mb-1">
          {'>'} DISTRIBUIÇÃO DE ATRIBUTOS
        </h2>
        <p className="text-muted-foreground text-xs">Passo 3 de 5 — Distribua 2 pontos extras</p>
      </div>

      <div className="text-center border border-border rounded p-3 bg-card">
        <span className="text-muted-foreground text-xs font-mono">PONTOS RESTANTES: </span>
        <span className={cn("font-display text-xl font-bold", remaining > 0 ? "text-primary text-glow" : "text-muted-foreground")}>
          {remaining}
        </span>
      </div>

      <div className="space-y-3">
        {(Object.keys(baseAttributes) as AttributeKey[]).map((key) => {
          const base = baseAttributes[key];
          const bonus = bonusAttributes[key];
          const total = base + bonus;

          return (
            <div key={key} className="flex items-center justify-between border border-border rounded p-3 bg-card">
              <div>
                <span className="font-display text-sm font-bold text-foreground">{ATTRIBUTE_LABELS[key]}</span>
                <div className="text-[10px] text-muted-foreground font-mono">
                  Base: {base >= 0 ? `+${base}` : base}
                  {bonus > 0 && <span className="text-primary"> +{bonus}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleRemove(key)}
                  disabled={bonus <= 0}
                  className="w-8 h-8 border border-border rounded bg-secondary text-foreground font-bold disabled:opacity-30 hover:border-primary transition-none"
                >
                  −
                </button>
                <span className={cn("font-display text-xl font-bold w-8 text-center", total > 0 ? "text-primary" : total < 0 ? "text-destructive" : "text-foreground")}>
                  {total > 0 ? `+${total}` : total}
                </span>
                <button
                  type="button"
                  onClick={() => handleAdd(key)}
                  disabled={remaining <= 0}
                  className="w-8 h-8 border border-border rounded bg-secondary text-foreground font-bold disabled:opacity-30 hover:border-primary transition-none"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
