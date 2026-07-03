import { ARCHETYPES, type ArchetypeData } from "@/data/gameData";
import { ATTRIBUTE_LABELS } from "@/data/gameData";
import { cn } from "@/lib/utils";

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

export function WizardStep2({ selected, onSelect }: Props) {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="font-display text-2xl font-bold text-primary text-glow mb-1">
          {'>'} ESCOLHA DO ARQUÉTIPO
        </h2>
        <p className="text-muted-foreground text-xs">Passo 2 de 5 — Selecione sua essência</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ARCHETYPES.map((a) => (
          <ArchetypeCard key={a.id} data={a} isSelected={selected === a.id} onSelect={() => onSelect(a.id)} />
        ))}
      </div>
    </div>
  );
}

function ArchetypeCard({ data, isSelected, onSelect }: { data: ArchetypeData; isSelected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "text-left p-4 rounded border-2 bg-card transition-none",
        isSelected
          ? "border-primary border-glow"
          : "border-border hover:border-muted-foreground"
      )}
    >
      <h3 className={cn("font-display font-bold text-sm mb-1", isSelected ? "text-primary" : "text-foreground")}>
        {data.name}
      </h3>
      <p className="text-muted-foreground text-[10px] mb-3 leading-relaxed">{data.description}</p>

      <div className="space-y-1 text-[10px] font-mono">
        <div className="flex justify-between">
          <span className="text-muted-foreground">HP</span>
          <span className="text-primary font-bold">{data.hp}</span>
        </div>
        {(Object.keys(data.attributes) as Array<keyof typeof data.attributes>).map((key) => (
          <div key={key} className="flex justify-between">
            <span className="text-muted-foreground">{ATTRIBUTE_LABELS[key]}</span>
            <span className={cn(
              "font-bold",
              data.attributes[key] > 0 ? "text-primary" : data.attributes[key] < 0 ? "text-destructive" : "text-foreground"
            )}>
              {data.attributes[key] > 0 ? `+${data.attributes[key]}` : data.attributes[key]}
            </span>
          </div>
        ))}
        <div className="pt-1 border-t border-border mt-2">
          <span className="text-muted-foreground">Hab: </span>
          <span className="text-accent">{data.skill}</span>
        </div>
      </div>
    </button>
  );
}
