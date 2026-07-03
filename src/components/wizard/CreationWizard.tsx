import { useState, useCallback } from "react";
import { WizardStep1 } from "./WizardStep1";
import { WizardStep2 } from "./WizardStep2";
import { WizardStep3 } from "./WizardStep3";
import { WizardStep4 } from "./WizardStep4";
import { WizardStep5 } from "./WizardStep5";
import { ARCHETYPES } from "@/data/gameData";
import type { Character, Attributes } from "@/types/character";
import { Button } from "@/components/ui/button";

interface Props {
  onComplete: (character: Character) => void;
}

const emptyAttrs: Attributes = { foco: 0, vontade: 0, harmonia: 0, criatividade: 0 };

export function CreationWizard({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("");
  const [archetypeId, setArchetypeId] = useState("");
  const [bonusAttributes, setBonusAttributes] = useState<Attributes>({ ...emptyAttrs });
  const [specificSkill, setSpecificSkill] = useState("");
  const [techniques, setTechniques] = useState({ attack: "", evade: "", defend: "" });

  const archetype = ARCHETYPES.find((a) => a.id === archetypeId);

  const canNext = (): boolean => {
    switch (step) {
      case 1: return name.trim().length > 0;
      case 2: return !!archetypeId;
      case 3: return Object.values(bonusAttributes).reduce((s, v) => s + v, 0) === 2;
      case 4: return !!specificSkill;
      case 5: return !!techniques.attack && !!techniques.evade && !!techniques.defend;
      default: return false;
    }
  };

  const handleArchetypeChange = (id: string) => {
    setArchetypeId(id);
    setBonusAttributes({ ...emptyAttrs });
    setSpecificSkill("");
  };

  const [glitching, setGlitching] = useState(false);

  const handleFinish = useCallback(() => {
    if (!archetype) return;
    setGlitching(true);
    setTimeout(() => {
      const char: Character = {
        name,
        origin,
        avatar: null,
        archetype: archetypeId,
        baseHp: archetype.hp,
        currentHp: archetype.hp,
        baseAttributes: { ...archetype.attributes },
        bonusAttributes: { ...bonusAttributes },
        archetypeSkill: archetype.skill,
        specificSkill,
        combatTechniques: { ...techniques },
        damageMarkers: [],
        negativeConditions: [],
        combatConditions: [],
        positiveConditions: [],
      };
      onComplete(char);
    }, 800);
  }, [archetype, name, origin, archetypeId, bonusAttributes, specificSkill, techniques, onComplete]);

  const handleTechniqueSelect = (cat: "attack" | "evade" | "defend", tech: string) => {
    setTechniques((prev) => ({ ...prev, [cat]: tech }));
  };

  return (
    <div className={`min-h-screen flex flex-col bg-background scanline ${glitching ? 'animate-screen-glitch' : ''}`}>
      {/* Progress bar */}
      <div className="h-1 bg-secondary">
        <div
          className="h-full bg-primary transition-none"
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full">
          {step === 1 && (
            <WizardStep1
              name={name} origin={origin}
              onNameChange={setName} onOriginChange={setOrigin}
            />
          )}
          {step === 2 && (
            <WizardStep2 selected={archetypeId} onSelect={handleArchetypeChange} />
          )}
          {step === 3 && archetype && (
            <WizardStep3
              baseAttributes={archetype.attributes}
              bonusAttributes={bonusAttributes}
              onBonusChange={setBonusAttributes}
            />
          )}
          {step === 4 && (
            <WizardStep4 archetypeId={archetypeId} selected={specificSkill} onSelect={setSpecificSkill} />
          )}
          {step === 5 && (
            <WizardStep5 techniques={techniques} onSelect={handleTechniqueSelect} />
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-border p-4 flex justify-between items-center max-w-3xl mx-auto w-full">
        <Button
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 1}
          className="font-mono text-xs"
        >
          ← VOLTAR
        </Button>

        <span className="text-muted-foreground text-xs font-mono">{step}/5</span>

        {step < 5 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
            className="font-mono text-xs"
          >
            AVANÇAR →
          </Button>
        ) : (
          <Button
            onClick={handleFinish}
            disabled={!canNext() || glitching}
            className="font-mono text-xs bg-accent text-accent-foreground hover:bg-accent/80 border-glow-warning"
          >
            ⚡ INICIALIZAR AGENTE
          </Button>
        )}
      </div>
    </div>
  );
}
