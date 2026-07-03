import { COMBAT_TECHNIQUES } from "@/data/gameData";
import { COMBAT_TECHNIQUE_DESCRIPTIONS } from "@/data/skillDescriptions";
import { useHomebrew } from "@/hooks/useHomebrew";
import { cn } from "@/lib/utils";

interface Props {
  techniques: { attack: string; evade: string; defend: string };
  onSelect: (category: "attack" | "evade" | "defend", technique: string) => void;
}

export function WizardStep5({ techniques, onSelect }: Props) {
  const brew = useHomebrew();

  const getOptions = (cat: "attack" | "evade" | "defend") => {
    const defaults = COMBAT_TECHNIQUES[cat].options.map((o) => ({
      name: o, description: COMBAT_TECHNIQUE_DESCRIPTIONS[o] || "", homebrew: false,
    }));
    const custom = brew.getCombatTechniques(cat).map((h) => ({
      name: h.name, description: h.description, homebrew: true,
    }));
    return [...defaults, ...custom];
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h2 className="font-display text-2xl font-bold text-primary text-glow mb-1">
          {'>'} TÉCNICAS DE COMBATE
        </h2>
        <p className="text-muted-foreground text-xs">Passo 5 de 5 — Escolha 1 técnica por ação</p>
      </div>

      {(["attack", "evade", "defend"] as const).map((cat) => {
        const options = getOptions(cat);
        return (
          <div key={cat} className="space-y-2">
            <h3 className="font-display text-sm font-bold text-accent uppercase tracking-wider">
              {COMBAT_TECHNIQUES[cat].label}
            </h3>
            <div className="space-y-2">
              {options.map((opt) => (
                <button
                  key={opt.name}
                  type="button"
                  onClick={() => onSelect(cat, opt.name)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded border-2 bg-card font-mono text-sm transition-none",
                    techniques[cat] === opt.name
                      ? "border-primary border-glow text-primary"
                      : "border-border hover:border-muted-foreground text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{opt.name}</span>
                    {opt.homebrew && <span className="text-[9px] text-accent font-mono px-1 border border-accent rounded">HOMEBREW</span>}
                  </div>
                  {opt.description && (
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                      {opt.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
