import { useState } from "react";
import { useCharacter } from "@/hooks/useCharacter";
import { useHomebrew } from "@/hooks/useHomebrew";
import { ARCHETYPES, SPECIFIC_SKILLS, COMBAT_TECHNIQUES } from "@/data/gameData";
import { SPECIFIC_SKILL_DESCRIPTIONS, COMBAT_TECHNIQUE_DESCRIPTIONS } from "@/data/skillDescriptions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Character } from "@/types/character";

interface Props {
  charId: string;
  onBack: () => void;
}

export function CharacterEditor({ charId, onBack }: Props) {
  const { character, saveCharacter } = useCharacter(charId);
  const brew = useHomebrew();

  const [draft, setDraft] = useState<Character | null>(character ? { ...character } : null);

  if (!draft) return null;

  const archetype = ARCHETYPES.find((a) => a.id === draft.archetype);

  // Combine default + homebrew specific skills
  const defaultSpecific = SPECIFIC_SKILLS[draft.archetype] || [];
  const homebrewSpecific = brew.getSpecificSkills(draft.archetype).map((h) => h.name);
  const allSpecific = [...defaultSpecific, ...homebrewSpecific];

  // Combine default + homebrew combat techniques
  const getCombatOptions = (cat: "attack" | "evade" | "defend") => {
    const defaults = COMBAT_TECHNIQUES[cat].options;
    const custom = brew.getCombatTechniques(cat).map((h) => h.name);
    return [...defaults, ...custom];
  };

  // Get description from either defaults or homebrew
  const getSpecificDesc = (name: string) => {
    if (SPECIFIC_SKILL_DESCRIPTIONS[name]) return SPECIFIC_SKILL_DESCRIPTIONS[name];
    const found = brew.items.find((i) => i.name === name && i.type === "specific");
    return found?.description || "";
  };

  const getCombatDesc = (name: string) => {
    if (COMBAT_TECHNIQUE_DESCRIPTIONS[name]) return COMBAT_TECHNIQUE_DESCRIPTIONS[name];
    const found = brew.items.find((i) => i.name === name && i.type.startsWith("combat-"));
    return found?.description || "";
  };

  const handleSave = () => {
    saveCharacter(draft);
    onBack();
  };

  const update = <K extends keyof Character>(key: K, value: Character[K]) => {
    setDraft((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  const updateTechnique = (cat: "attack" | "evade" | "defend", value: string) => {
    setDraft((prev) => prev ? { ...prev, combatTechniques: { ...prev.combatTechniques, [cat]: value } } : prev);
  };

  return (
    <div className="min-h-screen bg-background scanline">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-primary text-glow">EDITAR FICHA</h1>
            <p className="text-[10px] text-muted-foreground font-mono">{archetype?.name}</p>
          </div>
          <button onClick={onBack} className="text-xs text-muted-foreground hover:text-primary font-mono">← CANCELAR</button>
        </div>

        {/* Name & Origin */}
        <div className="border border-border rounded p-4 bg-card space-y-3">
          <h3 className="font-display text-xs font-bold text-muted-foreground uppercase tracking-widest">Identidade</h3>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground font-mono uppercase">Nome</label>
            <Input
              value={draft.name}
              onChange={(e) => update("name", e.target.value)}
              className="bg-background border-border font-mono text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground font-mono uppercase">Origem</label>
            <Textarea
              value={draft.origin}
              onChange={(e) => update("origin", e.target.value)}
              className="bg-background border-border font-mono text-sm min-h-[60px]"
            />
          </div>
        </div>

        {/* Specific Skill */}
        <div className="border border-border rounded p-4 bg-card space-y-3">
          <h3 className="font-display text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Habilidade Específica
          </h3>
          <div className="space-y-2">
            {allSpecific.map((skill) => {
              const desc = getSpecificDesc(skill);
              const isHomebrew = !defaultSpecific.includes(skill);
              return (
                <button
                  key={skill}
                  onClick={() => update("specificSkill", skill)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded border-2 bg-card font-mono text-sm transition-none",
                    draft.specificSkill === skill
                      ? "border-primary border-glow text-primary"
                      : "border-border hover:border-muted-foreground text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{skill}</span>
                    {isHomebrew && <span className="text-[9px] text-accent font-mono px-1 border border-accent rounded">HOMEBREW</span>}
                  </div>
                  {desc && <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{desc}</p>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Combat Techniques */}
        <div className="border border-border rounded p-4 bg-card space-y-4">
          <h3 className="font-display text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Técnicas de Combate
          </h3>

          {(["attack", "evade", "defend"] as const).map((cat) => {
            const options = getCombatOptions(cat);
            const defaultOpts = COMBAT_TECHNIQUES[cat].options;
            return (
              <div key={cat} className="space-y-2">
                <h4 className="font-display text-xs font-bold text-accent uppercase tracking-wider">
                  {COMBAT_TECHNIQUES[cat].label}
                </h4>
                {options.map((opt) => {
                  const desc = getCombatDesc(opt);
                  const isHomebrew = !defaultOpts.includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => updateTechnique(cat, opt)}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded border-2 bg-card font-mono text-sm transition-none",
                        draft.combatTechniques[cat] === opt
                          ? "border-primary border-glow text-primary"
                          : "border-border hover:border-muted-foreground text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{opt}</span>
                        {isHomebrew && <span className="text-[9px] text-accent font-mono px-1 border border-accent rounded">HOMEBREW</span>}
                      </div>
                      {desc && <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{desc}</p>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Save */}
        <div className="flex gap-2 pb-8">
          <Button onClick={handleSave} className="font-mono text-xs bg-accent text-accent-foreground hover:bg-accent/80">
            ✓ SALVAR ALTERAÇÕES
          </Button>
          <Button variant="outline" onClick={onBack} className="font-mono text-xs">CANCELAR</Button>
        </div>
      </div>
    </div>
  );
}
