import { cn } from "@/lib/utils";

interface Props {
  current: number;
  max: number;
  onUpdate: (delta: number) => void;
  editing?: boolean;
  onUpdateMax?: (delta: number) => void;
}

export function HpCounter({ current, max, onUpdate, editing, onUpdateMax }: Props) {
  const pct = max > 0 ? (current / max) * 100 : 0;

  return (
    <div className={cn("border rounded p-3 bg-card space-y-2", editing ? "border-accent" : "border-border")}>
      <h3 className="font-display text-xs font-bold text-muted-foreground uppercase tracking-widest">
        Pontos de Vida
      </h3>

      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => onUpdate(-1)}
          className="w-10 h-10 border-2 border-destructive rounded font-display text-lg font-bold text-destructive hover:bg-destructive hover:text-destructive-foreground transition-none"
        >
          −
        </button>

        <div className="text-center flex-1">
          <span className={cn(
            "font-display text-3xl font-bold",
            pct > 50 ? "text-primary text-glow" : pct > 25 ? "text-accent text-glow-warning" : "text-destructive"
          )}>
            {current}
          </span>
          <span className="text-muted-foreground font-mono text-sm"> / {max}</span>
        </div>

        <button
          onClick={() => onUpdate(1)}
          className="w-10 h-10 border-2 border-primary rounded font-display text-lg font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-none"
        >
          +
        </button>
      </div>

      <div className="h-2 bg-secondary rounded overflow-hidden">
        <div
          className={cn(
            "h-full transition-none rounded",
            pct > 50 ? "bg-primary" : pct > 25 ? "bg-accent" : "bg-destructive"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Edit max HP */}
      {editing && onUpdateMax && (
        <div className="flex items-center justify-center gap-3 pt-1 border-t border-border mt-2">
          <span className="text-[10px] text-muted-foreground font-mono uppercase">HP Máx:</span>
          <button
            onClick={() => onUpdateMax(-1)}
            className="w-6 h-6 border border-accent rounded text-xs font-bold text-accent hover:bg-accent hover:text-accent-foreground transition-none"
          >
            −
          </button>
          <span className="font-mono text-sm font-bold text-accent">{max}</span>
          <button
            onClick={() => onUpdateMax(1)}
            className="w-6 h-6 border border-accent rounded text-xs font-bold text-accent hover:bg-accent hover:text-accent-foreground transition-none"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
