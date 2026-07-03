import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Props {
  notes: string;
  editing: boolean;
  onChange: (value: string) => void;
}

export function NotesPanel({ notes, editing, onChange }: Props) {
  return (
    <div className={cn("border rounded p-3 bg-card", editing ? "border-accent" : "border-border")}>
      <h3 className="font-display text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
        📝 Anotações
      </h3>
      {editing ? (
        <Textarea
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Inventário, contatos, dívidas, segredos do PJ..."
          className="bg-background border-border font-mono text-xs min-h-[120px] resize-y"
        />
      ) : notes ? (
        <p className="font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed">
          {notes}
        </p>
      ) : (
        <p className="font-mono text-[10px] text-muted-foreground italic">
          Nenhuma anotação. Clique em EDITAR pra adicionar.
        </p>
      )}
    </div>
  );
}
