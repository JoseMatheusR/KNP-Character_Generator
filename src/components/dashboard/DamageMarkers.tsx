import { DAMAGE_TYPES } from "@/data/gameData";
import { cn } from "@/lib/utils";

interface Props {
  active: string[];
  onToggle: (marker: string) => void;
}

export function DamageMarkers({ active, onToggle }: Props) {
  return (
    <div className="border border-border rounded p-3 bg-card space-y-2">
      <h3 className="font-display text-xs font-bold text-muted-foreground uppercase tracking-widest">
        Tipos de Dano
      </h3>
      <div className="flex flex-wrap gap-2">
        {DAMAGE_TYPES.map((type) => {
          const isActive = active.includes(type);
          return (
            <button
              key={type}
              onClick={() => onToggle(type)}
              className={cn(
                "px-3 py-1 rounded border text-xs font-mono font-bold transition-none",
                isActive
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-background text-muted-foreground hover:border-muted-foreground"
              )}
            >
              {type}
            </button>
          );
        })}
      </div>
    </div>
  );
}
