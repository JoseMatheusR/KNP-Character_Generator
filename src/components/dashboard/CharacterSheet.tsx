import { useCharacter } from "@/hooks/useCharacter";
import { HpCounter } from "./HpCounter";
import { DiceRoller } from "./DiceRoller";
import { AttributesPanel } from "./AttributesPanel";
import { ConditionsPanel } from "./ConditionsPanel";
import { DamageMarkers } from "./DamageMarkers";
import { SkillsPanel } from "./SkillsPanel";
import { NotesPanel } from "./NotesPanel";
import { ARCHETYPES } from "@/data/gameData";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { Character, Attributes, AttributeKey } from "@/types/character";

interface Props {
  charId: string;
  onBack: () => void;
}

type MobileTab = "hp" | "attributes" | "skills";

export function CharacterSheet({ charId, onBack }: Props) {
  const { character, updateHp, toggleDamageMarker, toggleCondition, getEffectiveAttributes, getDebuffs, saveCharacter } = useCharacter(charId);
  const [mobileTab, setMobileTab] = useState<MobileTab>("hp");
  const [editing, setEditing] = useState(false);

  if (!character) return null;

  const effective = getEffectiveAttributes()!;
  const debuffs = getDebuffs();
  const archetype = ARCHETYPES.find((a) => a.id === character.archetype);

  const updateField = <K extends keyof Character>(key: K, value: Character[K]) => {
    saveCharacter({ ...character, [key]: value });
  };

  const updateBaseAttr = (attr: AttributeKey, delta: number) => {
    const newAttrs = { ...character.baseAttributes, [attr]: character.baseAttributes[attr] + delta };
    saveCharacter({ ...character, baseAttributes: newAttrs });
  };

  const updateBonusAttr = (attr: AttributeKey, delta: number) => {
    const newAttrs = { ...character.bonusAttributes, [attr]: character.bonusAttributes[attr] + delta };
    saveCharacter({ ...character, bonusAttributes: newAttrs });
  };

  const updateMaxHp = (delta: number) => {
    const newMax = Math.max(1, character.baseHp + delta);
    const newCurrent = Math.min(character.currentHp, newMax);
    saveCharacter({ ...character, baseHp: newMax, currentHp: newCurrent });
  };

  const updateSpecificSkill = (skill: string) => {
    saveCharacter({ ...character, specificSkill: skill });
  };

  const updateCombatTechnique = (cat: "attack" | "evade" | "defend", tech: string) => {
    saveCharacter({ ...character, combatTechniques: { ...character.combatTechniques, [cat]: tech } });
  };

  const leftColumn = (
    <div className="space-y-3">
      {/* Identity */}
      <div className={cn("border rounded p-3 bg-card", editing ? "border-accent" : "border-border")}>
        <div className="flex items-center justify-between mb-1">
          {editing ? (
            <Input
              value={character.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="font-display text-lg font-bold text-primary h-8 bg-background border-border"
            />
          ) : (
            <h1 className="font-display text-lg font-bold text-primary text-glow leading-tight">{character.name}</h1>
          )}
          <div className="flex gap-2 ml-2 shrink-0">
            <button
              onClick={() => setEditing(!editing)}
              className={cn(
                "text-[10px] font-mono",
                editing ? "text-accent hover:text-accent/80" : "text-muted-foreground hover:text-accent"
              )}
            >
              {editing ? "✓ PRONTO" : "✎ EDITAR"}
            </button>
            <button onClick={onBack} className="text-[10px] text-muted-foreground hover:text-primary font-mono">
              ← VOLTAR
            </button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground font-mono">{archetype?.name}</p>
        {editing && (
          <div className="mt-2">
            <label className="text-[9px] text-muted-foreground font-mono uppercase">Origem</label>
            <Input
              value={character.origin}
              onChange={(e) => updateField("origin", e.target.value)}
              className="font-mono text-xs h-7 bg-background border-border mt-1"
            />
          </div>
        )}
      </div>

      <HpCounter
        current={character.currentHp}
        max={character.baseHp}
        onUpdate={updateHp}
        editing={editing}
        onUpdateMax={updateMaxHp}
      />
      <DiceRoller />
      <NotesPanel
        notes={character.notes || ""}
        editing={editing}
        onChange={(v) => updateField("notes", v)}
      />
    </div>
  );

  const centerColumn = (
    <div className="space-y-3">
      <AttributesPanel
        baseAttributes={character.baseAttributes}
        bonusAttributes={character.bonusAttributes}
        effectiveAttributes={effective}
        debuffs={debuffs}
        editing={editing}
        onUpdateBase={updateBaseAttr}
        onUpdateBonus={updateBonusAttr}
      />
      <ConditionsPanel
        negativeConditions={character.negativeConditions}
        combatConditions={character.combatConditions}
        positiveConditions={character.positiveConditions}
        onToggle={toggleCondition}
      />
      <DamageMarkers active={character.damageMarkers} onToggle={toggleDamageMarker} />
    </div>
  );

  const rightColumn = (
    <SkillsPanel
      archetypeId={character.archetype}
      archetypeSkill={character.archetypeSkill}
      specificSkill={character.specificSkill}
      combatTechniques={character.combatTechniques}
      editing={editing}
      onChangeSpecificSkill={updateSpecificSkill}
      onChangeCombatTechnique={updateCombatTechnique}
    />
  );

  return (
    <div className="min-h-screen bg-background scanline">
      {/* Edit mode banner */}
      {editing && (
        <div className="bg-accent/10 border-b border-accent px-4 py-2 text-center">
          <span className="text-[11px] font-mono text-accent">⚡ MODO DE EDIÇÃO — clique nos valores para alterar</span>
        </div>
      )}

      {/* Desktop layout */}
      <div className="hidden lg:grid lg:grid-cols-[280px_1fr_280px] gap-4 p-4 max-w-7xl mx-auto">
        <div className="sticky top-4 self-start">{leftColumn}</div>
        <div className="overflow-y-auto">{centerColumn}</div>
        <div className="sticky top-4 self-start">{rightColumn}</div>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden pb-16">
        <div className="p-4">
          {mobileTab === "hp" && leftColumn}
          {mobileTab === "attributes" && centerColumn}
          {mobileTab === "skills" && rightColumn}
        </div>

        {/* Tab bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex z-40">
          {([
            { key: "hp" as MobileTab, label: "HP & Dados" },
            { key: "attributes" as MobileTab, label: "Atributos" },
            { key: "skills" as MobileTab, label: "Habilidades" },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setMobileTab(tab.key)}
              className={cn(
                "flex-1 py-3 text-[10px] font-display font-bold uppercase tracking-wider transition-none",
                mobileTab === tab.key
                  ? "text-primary border-t-2 border-primary"
                  : "text-muted-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
