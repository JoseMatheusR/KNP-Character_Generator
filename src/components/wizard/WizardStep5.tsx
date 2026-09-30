import { COMBAT_TECHNIQUES, TECHNIQUE_CATEGORIES } from "@/data/gameData";
import type { ExtraTechnique, TechniqueCategory } from "@/types/character";
import { extraTechniqueOptions, needsExtraTechnique } from "@/lib/characterBuild";
import { COMBAT_TECHNIQUE_DESCRIPTIONS } from "@/data/skillDescriptions";
import { useHomebrew } from "@/hooks/useHomebrew";
import { cn } from "@/lib/utils";

interface Props {
  techniques: { attack: string; evade: string; defend: string; heal: string };
  onSelect: (category: TechniqueCategory, technique: string) => void;
  archetypeSkill: string;
  specificSkill: string;
  borrowedSkill: string | null;
  extraTechnique: ExtraTechnique | null;
  onExtraTechnique: (technique: ExtraTechnique) => void;
}

export function WizardStep5({
  techniques,
  onSelect,
  archetypeSkill,
  specificSkill,
  borrowedSkill,
  extraTechnique,
  onExtraTechnique,
}: Props) {
  const brew = useHomebrew();

  const getOptions = (cat: TechniqueCategory) => {
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
        <p className="text-muted-foreground text-xs">Passo 5 de 5 — Escolha 1 técnica para cada uma das 4 ações</p>
      </div>

      {TECHNIQUE_CATEGORIES.map((cat) => {
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
      {needsExtraTechnique({ archetypeSkill, specificSkill, borrowedSkill }) ? (
        <div className="space-y-2">
          <h3 className="font-display text-sm font-bold text-accent uppercase tracking-wider">
            Kryptônia · técnica extra
          </h3>
          <p className="text-[11px] text-muted-foreground">Escolha mais uma técnica de qualquer tipo, diferente da principal.</p>
          {TECHNIQUE_CATEGORIES.map((category) => (
            <div key={category} className="space-y-2">
              <div className="text-[10px] font-mono uppercase text-muted-foreground">{COMBAT_TECHNIQUES[category].label}</div>
              {extraTechniqueOptions(category, techniques[category]).map((opt) => (
                <button
                  key={`${category}-${opt}`}
                  type="button"
                  onClick={() => onExtraTechnique({ category, name: opt })}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded border-2 bg-card font-mono text-sm transition-none",
                    extraTechnique?.category === category && extraTechnique.name === opt
                      ? "border-primary border-glow text-primary"
                      : "border-border hover:border-muted-foreground text-foreground"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
