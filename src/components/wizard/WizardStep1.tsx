import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  name: string;
  origin: string;
  onNameChange: (v: string) => void;
  onOriginChange: (v: string) => void;
}

export function WizardStep1({ name, origin, onNameChange, onOriginChange }: Props) {
  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h2 className="font-display text-2xl font-bold text-primary text-glow mb-1">
          {'>'} IDENTIDADE E ORIGEM
        </h2>
        <p className="text-muted-foreground text-xs">Passo 1 de 5 — Quem é você neste mundo destruído?</p>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground text-xs uppercase tracking-widest">Nome do Personagem</Label>
        <Input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Ex: Severino-X, Lampião 2.0..."
          className="bg-card border-border font-mono text-foreground placeholder:text-muted-foreground focus:border-primary"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-foreground text-xs uppercase tracking-widest">Ideia de Origem / História</Label>
        <Textarea
          value={origin}
          onChange={(e) => onOriginChange(e.target.value)}
          placeholder="De onde você vem? O que te trouxe até Nova Patos?"
          rows={5}
          className="bg-card border-border font-mono text-foreground placeholder:text-muted-foreground focus:border-primary resize-none"
        />
      </div>
    </div>
  );
}
