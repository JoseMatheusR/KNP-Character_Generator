import { ARCHETYPES, COMBAT_TECHNIQUES, SPECIFIC_SKILLS } from "@/data/gameData";
import { ARCHETYPE_SKILL_DESCRIPTIONS, SPECIFIC_SKILL_DESCRIPTIONS, COMBAT_TECHNIQUE_DESCRIPTIONS } from "@/data/skillDescriptions";
import { useHomebrew } from "@/hooks/useHomebrew";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  archetypeId: string;
  archetypeSkill: string;
  specificSkill: string;
  combatTechniques: { attack: string; evade: string; defend: string };
  editing?: boolean;
  onChangeSpecificSkill?: (skill: string) => void;
  onChangeCombatTechnique?: (cat: "attack" | "evade" | "defend", tech: string) => void;
}

function ExpandableSkill({ name, description, isHomebrew, accentClass = "text-primary" }: { name: string; description?: string; isHomebrew?: boolean; accentClass?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => description && setOpen(!open)}
        className={cn(
          "text-sm font-mono font-bold text-left w-full flex items-center gap-1",
          accentClass,
          description && "cursor-pointer hover:underline"
        )}
      >
        {name}
        {isHomebrew && <span className="text-[9px] text-accent font-mono px-1 border border-accent rounded ml-1">HB</span>}
        {description && (
          <span className="text-[10px] text-muted-foreground ml-1">{open ? "▲" : "▼"}</span>
        )}
      </button>
      {open && description && (
        <p className="text-[11px] text-muted-foreground font-mono mt-1 leading-relaxed border-l-2 border-border pl-2">
          {description}
        </p>
      )}
    </div>
  );
}

export function SkillsPanel({ archetypeId, archetypeSkill, specificSkill, combatTechniques, editing, onChangeSpecificSkill, onChangeCombatTechnique }: Props) {
  const archetype = ARCHETYPES.find((a) => a.id === archetypeId);
  const brew = useHomebrew();
  const defaultSpecific = SPECIFIC_SKILLS[archetypeId] || [];

  const [selectingSpecific, setSelectingSpecific] = useState(false);
  const [selectingCombat, setSelectingCombat] = useState<"attack" | "evade" | "defend" | null>(null);

  const getSpecificDesc = (name: string) => {
    if (SPECIFIC_SKILL_DESCRIPTIONS[name]) return SPECIFIC_SKILL_DESCRIPTIONS[name];
    const found = brew.items.find((i) => i.name === name && i.type === "specific");
    return found?.description;
  };

  const getCombatDesc = (name: string) => {
    if (COMBAT_TECHNIQUE_DESCRIPTIONS[name]) return COMBAT_TECHNIQUE_DESCRIPTIONS[name];
    const found = brew.items.find((i) => i.name === name && i.type.startsWith("combat-"));
    return found?.description;
  };

  const isSpecificHomebrew = (name: string) => !defaultSpecific.includes(name);
  const isCombatHomebrew = (name: string, cat: string) => !COMBAT_TECHNIQUES[cat as keyof typeof COMBAT_TECHNIQUES]?.options.includes(name);

  const allSpecific = [
    ...defaultSpecific,
    ...brew.getSpecificSkills(archetypeId).map((h) => h.name),
  ];

  const getCombatOptions = (cat: "attack" | "evade" | "defend") => [
    ...COMBAT_TECHNIQUES[cat].options,
    ...brew.getCombatTechniques(cat).map((h) => h.name),
  ];

  return (
    <div className="space-y-3">
      <div className="border border-border rounded p-3 bg-card">
        <h3 className="font-display text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
          Habilidade do Arquétipo
        </h3>
        <ExpandableSkill name={archetypeSkill} description={ARCHETYPE_SKILL_DESCRIPTIONS[archetypeSkill]} />
        {archetype && (
          <div className="text-[10px] text-muted-foreground mt-1 font-mono">{archetype.name}</div>
        )}
      </div>

      {/* Specific Skill */}
      <div className={cn("border rounded p-3 bg-card", editing ? "border-accent" : "border-border")}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Habilidade Específica
          </h3>
          {editing && (
            <button
              onClick={() => setSelectingSpecific(!selectingSpecific)}
              className="text-[10px] text-accent hover:text-accent/80 font-mono"
            >
              {selectingSpecific ? "✕ FECHAR" : "⇄ TROCAR"}
            </button>
          )}
        </div>

        {selectingSpecific && editing ? (
          <div className="space-y-2">
            {allSpecific.map((skill) => {
              const desc = getSpecificDesc(skill);
              const hb = isSpecificHomebrew(skill);
              return (
                <button
                  key={skill}
                  onClick={() => { onChangeSpecificSkill?.(skill); setSelectingSpecific(false); }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded border-2 font-mono text-xs transition-none",
                    specificSkill === skill
                      ? "border-primary border-glow text-primary"
                      : "border-border hover:border-muted-foreground text-foreground"
                  )}
                >
                  <div className="flex items-center gap-1">
                    <span className="font-bold">{skill}</span>
                    {hb && <span className="text-[9px] text-accent px-1 border border-accent rounded">HB</span>}
                  </div>
                  {desc && <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{desc}</p>}
                </button>
              );
            })}
          </div>
        ) : (
          <ExpandableSkill
            name={specificSkill}
            description={getSpecificDesc(specificSkill)}
            isHomebrew={isSpecificHomebrew(specificSkill)}
          />
        )}
      </div>

      {/* Combat Techniques */}
      <div className={cn("border rounded p-3 bg-card space-y-2", editing ? "border-accent" : "border-border")}>
        <h3 className="font-display text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
          Técnicas de Combate
        </h3>
        {(["attack", "evade", "defend"] as const).map((cat) => (
          <div key={cat}>
            <div className="flex items-center justify-between">
              <div className="text-[10px] text-accent uppercase font-mono">{COMBAT_TECHNIQUES[cat].label}</div>
              {editing && (
                <button
                  onClick={() => setSelectingCombat(selectingCombat === cat ? null : cat)}
                  className="text-[9px] text-accent hover:text-accent/80 font-mono"
                >
                  {selectingCombat === cat ? "✕" : "⇄"}
                </button>
              )}
            </div>

            {selectingCombat === cat && editing ? (
              <div className="space-y-1 mt-1">
                {getCombatOptions(cat).map((opt) => {
                  const desc = getCombatDesc(opt);
                  const hb = isCombatHomebrew(opt, cat);
                  return (
                    <button
                      key={opt}
                      onClick={() => { onChangeCombatTechnique?.(cat, opt); setSelectingCombat(null); }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded border-2 font-mono text-xs transition-none",
                        combatTechniques[cat] === opt
                          ? "border-primary border-glow text-primary"
                          : "border-border hover:border-muted-foreground text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-1">
                        <span className="font-bold">{opt}</span>
                        {hb && <span className="text-[9px] text-accent px-1 border border-accent rounded">HB</span>}
                      </div>
                      {desc && <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{desc}</p>}
                    </button>
                  );
                })}
              </div>
            ) : (
              <ExpandableSkill
                name={combatTechniques[cat]}
                description={getCombatDesc(combatTechniques[cat])}
                isHomebrew={isCombatHomebrew(combatTechniques[cat], cat)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
