import { EncodingType, File, Paths } from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { ARCHETYPES, ATTRIBUTE_LABELS, COMBAT_TECHNIQUES } from "@/src/domain/gameData";
import type { Character } from "@/src/domain/character";
import { grantedTechniques } from "@/src/domain/characterBuild";
import { getEffectiveAttributes } from "@/src/domain/characterRules";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildCharacterHtml(character: Character): string {
  const archetype = ARCHETYPES.find((a) => a.id === character.archetype);
  const effective = getEffectiveAttributes(character);

  const attrRows = Object.entries(ATTRIBUTE_LABELS)
    .map(([key, label]) => {
      const k = key as keyof typeof effective;
      const total = effective[k];
      const sign = total >= 0 ? "+" : "";
      return `<tr><td>${escapeHtml(label)}</td><td>${sign}${total}</td></tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<style>
  body { font-family: Helvetica, sans-serif; padding: 32px; color: #111; }
  h1 { color: #7722cc; margin: 0 0 4px; }
  .sub { color: #666; font-size: 12px; }
  h2 { font-size: 14px; margin-top: 20px; border-bottom: 1px solid #ddd; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  td { padding: 4px 0; }
  .footer { margin-top: 32px; font-size: 9px; color: #999; }
</style></head><body>
  <h1>${escapeHtml(character.name || "Sem Nome")}</h1>
  <p class="sub">${escapeHtml(archetype?.name || character.archetype)}${character.origin ? ` · Origem: ${escapeHtml(character.origin)}` : ""}</p>
  <h2>HP</h2>
  <p>${character.currentHp} / ${character.baseHp}</p>
  <h2>Atributos (efetivos)</h2>
  <table>${attrRows}</table>
  <h2>Habilidades</h2>
  <p>Arquétipo: ${escapeHtml(character.archetypeSkill)}</p>
  <p>Específica: ${escapeHtml(character.specificSkill)}</p>
  ${character.borrowedSkill ? `<p>Saga: ${escapeHtml(character.borrowedSkill)}</p>` : ""}
  <h2>Técnicas de Combate</h2>
  <p>${escapeHtml(COMBAT_TECHNIQUES.attack.label)}: ${escapeHtml(character.combatTechniques.attack)}</p>
  <p>${escapeHtml(COMBAT_TECHNIQUES.evade.label)}: ${escapeHtml(character.combatTechniques.evade)}</p>
  ${character.extraEvadeTechnique ? `<p>Evadir extra: ${escapeHtml(character.extraEvadeTechnique)}</p>` : ""}
  <p>${escapeHtml(COMBAT_TECHNIQUES.defend.label)}: ${escapeHtml(character.combatTechniques.defend)}</p>
  ${grantedTechniques(character).map((technique) => `<p>Concedida: ${escapeHtml(technique.name)}</p>`).join("")}
  <h2>Condições</h2>
  <p>Negativas: ${escapeHtml(character.negativeConditions.join(", ") || "—")}</p>
  <p>Combate: ${escapeHtml(character.combatConditions.join(", ") || "—")}</p>
  <p>Positivas: ${escapeHtml(character.positiveConditions.join(", ") || "—")}</p>
  <p>Dano: ${escapeHtml(character.damageMarkers.join(", ") || "—")}</p>
  ${character.notes ? `<h2>Notas</h2><p>${escapeHtml(character.notes)}</p>` : ""}
  <p class="footer">Kaos em Nova Patos — ${new Date().toLocaleDateString("pt-BR")}</p>
</body></html>`;
}

function pdfFileName(character: Character): string {
  const slug = (character.name || "ficha")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `${slug || "ficha"}.pdf`;
}

export async function exportCharacterPdf(character: Character): Promise<void> {
  const html = buildCharacterHtml(character);
  if (Platform.OS === "web") {
    await Print.printAsync({ html });
    return;
  }

  const { base64 } = await Print.printToFileAsync({ html, base64: true });
  if (!base64) {
    throw new Error("O PDF saiu vazio.");
  }

  const file = new File(Paths.cache, pdfFileName(character));
  file.create({ overwrite: true });
  file.write(base64, { encoding: EncodingType.Base64 });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("Este aparelho não consegue compartilhar arquivos.");
  }

  await Sharing.shareAsync(file.uri, {
    mimeType: "application/pdf",
    UTI: "com.adobe.pdf",
    dialogTitle: "Exportar ficha",
  });
}
