import { useState } from "react";
import { useHomebrew, type HomebrewSkill } from "@/hooks/useHomebrew";
import { ARCHETYPES } from "@/data/gameData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Props {
  onBack: () => void;
}

type SkillType = HomebrewSkill["type"];

const TYPE_LABELS: Record<SkillType, string> = {
  "specific": "Habilidade Específica",
  "combat-attack": "Técnica: Atacar e Avançar",
  "combat-evade": "Técnica: Evadir e Observar",
  "combat-defend": "Técnica: Defender e Manobrar",
};

export function HomebrewManager({ onBack }: Props) {
  const brew = useHomebrew();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<SkillType>("specific");
  const [archetypeId, setArchetypeId] = useState("");

  const resetForm = () => {
    setName("");
    setDescription("");
    setType("specific");
    setArchetypeId("");
    setCreating(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editingId) {
      brew.update(editingId, { name: name.trim(), description: description.trim(), type, archetypeId: type === "specific" ? archetypeId || undefined : undefined });
    } else {
      brew.add({ name: name.trim(), description: description.trim(), type, archetypeId: type === "specific" ? archetypeId || undefined : undefined });
    }
    resetForm();
  };

  const startEdit = (item: HomebrewSkill) => {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description);
    setType(item.type);
    setArchetypeId(item.archetypeId || "");
    setCreating(true);
  };

  const grouped = {
    specific: brew.items.filter((i) => i.type === "specific"),
    "combat-attack": brew.items.filter((i) => i.type === "combat-attack"),
    "combat-evade": brew.items.filter((i) => i.type === "combat-evade"),
    "combat-defend": brew.items.filter((i) => i.type === "combat-defend"),
  };

  return (
    <div className="min-h-screen bg-background scanline">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-primary text-glow">HOMEBREW</h1>
            <p className="text-[10px] text-muted-foreground font-mono">Crie habilidades e técnicas customizadas</p>
          </div>
          <button onClick={onBack} className="text-xs text-muted-foreground hover:text-primary font-mono">← VOLTAR</button>
        </div>

        {!creating ? (
          <Button onClick={() => setCreating(true)} className="font-mono text-xs">+ CRIAR NOVO</Button>
        ) : (
          <div className="border border-border rounded p-4 bg-card space-y-3">
            <h3 className="font-display text-sm font-bold text-accent uppercase tracking-wider">
              {editingId ? "Editar" : "Nova Criação"}
            </h3>

            <div className="space-y-2">
              <label className="text-[10px] text-muted-foreground font-mono uppercase">Tipo</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(TYPE_LABELS) as [SkillType, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setType(key)}
                    className={cn(
                      "text-left px-3 py-2 rounded border text-xs font-mono transition-none",
                      type === key ? "border-primary text-primary border-glow" : "border-border text-muted-foreground hover:border-muted-foreground"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {type === "specific" && (
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground font-mono uppercase">Arquétipo (opcional)</label>
                <select
                  value={archetypeId}
                  onChange={(e) => setArchetypeId(e.target.value)}
                  className="w-full text-sm bg-background border border-border rounded px-3 py-2 text-foreground font-mono"
                >
                  <option value="">Qualquer arquétipo</option>
                  {ARCHETYPES.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-mono uppercase">Nome</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome da habilidade/técnica..."
                className="bg-background border-border font-mono text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-mono uppercase">Descrição</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o efeito mecânico..."
                className="bg-background border-border font-mono text-sm min-h-[80px]"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!name.trim()} className="font-mono text-xs">
                {editingId ? "SALVAR" : "CRIAR"}
              </Button>
              <Button variant="outline" onClick={resetForm} className="font-mono text-xs">CANCELAR</Button>
            </div>
          </div>
        )}

        {/* List */}
        {(Object.entries(grouped) as [SkillType, HomebrewSkill[]][]).map(([key, items]) =>
          items.length > 0 ? (
            <div key={key} className="space-y-2">
              <h3 className="font-display text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {TYPE_LABELS[key]}
              </h3>
              {items.map((item) => (
                <div key={item.id} className="border border-border rounded p-3 bg-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-mono text-sm font-bold text-primary">{item.name}</div>
                      {item.archetypeId && (
                        <div className="text-[10px] text-accent font-mono">
                          {ARCHETYPES.find((a) => a.id === item.archetypeId)?.name}
                        </div>
                      )}
                      {item.description && (
                        <p className="text-[11px] text-muted-foreground font-mono mt-1 leading-relaxed">{item.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1 ml-2 shrink-0">
                      <button onClick={() => startEdit(item)} className="text-[10px] text-muted-foreground hover:text-foreground font-mono">✎</button>
                      <button onClick={() => brew.remove(item.id)} className="text-[10px] text-destructive hover:text-destructive/80 font-mono">✕</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null
        )}

        {brew.items.length === 0 && !creating && (
          <div className="border border-dashed border-border rounded p-8 text-center">
            <p className="text-muted-foreground font-mono text-sm">Nenhuma criação homebrew.</p>
            <p className="text-muted-foreground font-mono text-xs mt-1">Crie técnicas e habilidades customizadas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
