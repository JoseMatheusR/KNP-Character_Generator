import { SPECIFIC_SKILLS } from "@/data/gameData";
import { SPECIFIC_SKILL_DESCRIPTIONS } from "@/data/skillDescriptions";
import { borrowedSkillOptions, needsBorrowedSkill } from "@/lib/characterBuild";
import { useHomebrew } from "@/hooks/useHomebrew";
import { cn } from "@/lib/utils";

interface Props {
  archetypeId: string;
  selected: string;
  borrowedSkill: string | null;
  onSelect: (skill: string) => void;
  onBorrow: (skill: string) => void;
}

export function WizardStep4({ archetypeId, selected, borrowedSkill, onSelect, onBorrow }: Props) {
  const defaultSkills = SPECIFIC_SKILLS[archetypeId] || [];
  const brew = useHomebrew();
  const homebrewSkills = brew.getSpecificSkills(archetypeId);
  const allSkills = [
    ...defaultSkills.map((s) => ({ name: s, description: SPECIFIC_SKILL_DESCRIPTIONS[s] || "", homebrew: false })),
    ...homebrewSkills.map((h) => ({ name: h.name, description: h.description, homebrew: true })),
  ];

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h2 className="font-display text-2xl font-bold text-primary text-glow mb-1">
          {'>'} HABILIDADE ESPECÍFICA
        </h2>
        <p className="text-muted-foreground text-xs">Passo 4 de 5 — Escolha 1 habilidade</p>
      </div>

      <div className="space-y-3">
        {allSkills.map((skill) => (
          <button
            key={skill.name}
            type="button"
            onClick={() => onSelect(skill.name)}
            className={cn(
              "w-full text-left px-4 py-3 rounded border-2 bg-card font-mono text-sm transition-none",
              selected === skill.name
                ? "border-primary border-glow text-primary"
                : "border-border hover:border-muted-foreground text-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="font-bold">{skill.name}</span>
              {skill.homebrew && <span className="text-[9px] text-accent font-mono px-1 border border-accent rounded">HOMEBREW</span>}
            </div>
            {skill.description && (
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                {skill.description}
              </p>
            )}
          </button>
        ))}
      </div>
      {needsBorrowedSkill(selected) ? (
        <div className="space-y-3">
          <h3 className="font-display text-sm font-bold text-accent uppercase tracking-wider">Saga de um vaqueiro</h3>
          <p className="text-[11px] text-muted-foreground">Escolha uma habilidade específica de outro arquétipo, exceto A Aberração.</p>
          {borrowedSkillOptions(archetypeId).map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => onBorrow(skill)}
              className={cn(
                "w-full text-left px-4 py-3 rounded border-2 bg-card font-mono text-sm transition-none",
                borrowedSkill === skill
                  ? "border-primary border-glow text-primary"
                  : "border-border hover:border-muted-foreground text-foreground"
              )}
            >
              <span className="font-bold">{skill}</span>
              {SPECIFIC_SKILL_DESCRIPTIONS[skill] ? (
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{SPECIFIC_SKILL_DESCRIPTIONS[skill]}</p>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
