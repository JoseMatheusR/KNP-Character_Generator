import jsPDF from "jspdf";
import { ARCHETYPES, ATTRIBUTE_LABELS, COMBAT_TECHNIQUES } from "@/data/gameData";
import type { Character } from "@/types/character";

export function exportCharacterPdf(character: Character) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  const archetype = ARCHETYPES.find((a) => a.id === character.archetype);

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(120, 40, 200);
  doc.text(character.name || "Sem Nome", margin, y);
  y += 24;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(archetype?.name || character.archetype, margin, y);
  y += 14;
  if (character.origin) {
    doc.setFontSize(10);
    doc.text(`Origem: ${character.origin}`, margin, y);
    y += 14;
  }

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageW - margin, y);
  y += 18;

  // HP
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(0, 0, 0);
  doc.text("HP", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(`${character.currentHp} / ${character.baseHp}`, margin + 30, y);
  y += 22;

  // Attributes
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Atributos", margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  Object.entries(ATTRIBUTE_LABELS).forEach(([key, label]) => {
    const base = character.baseAttributes[key as keyof typeof character.baseAttributes];
    const bonus = character.bonusAttributes[key as keyof typeof character.bonusAttributes];
    const total = base + bonus;
    const sign = total >= 0 ? "+" : "";
    doc.text(`${label}: ${sign}${total}  (base ${base >= 0 ? "+" : ""}${base}, bônus +${bonus})`, margin + 10, y);
    y += 14;
  });
  y += 8;

  // Skills
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Habilidades", margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Arquétipo: ${character.archetypeSkill}`, margin + 10, y);
  y += 14;
  doc.text(`Específica: ${character.specificSkill}`, margin + 10, y);
  y += 22;

  // Combat techniques
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Técnicas de Combate", margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`${COMBAT_TECHNIQUES.attack.label}: ${character.combatTechniques.attack}`, margin + 10, y);
  y += 14;
  doc.text(`${COMBAT_TECHNIQUES.evade.label}: ${character.combatTechniques.evade}`, margin + 10, y);
  y += 14;
  doc.text(`${COMBAT_TECHNIQUES.defend.label}: ${character.combatTechniques.defend}`, margin + 10, y);
  y += 22;

  // Conditions
  const renderList = (title: string, items: string[]) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(title, margin, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    if (items.length === 0) {
      doc.setTextColor(150, 150, 150);
      doc.text("— nenhum —", margin + 10, y);
      doc.setTextColor(0, 0, 0);
    } else {
      doc.text(items.join(", "), margin + 10, y, { maxWidth: pageW - margin * 2 - 10 });
    }
    y += 18;
  };

  renderList("Condições Negativas", character.negativeConditions);
  renderList("Condições de Combate", character.combatConditions);
  renderList("Condições Positivas", character.positiveConditions);
  renderList("Marcadores de Dano", character.damageMarkers);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Kaos em Nova Patos — Ficha gerada em ${new Date().toLocaleDateString("pt-BR")}`,
    margin,
    doc.internal.pageSize.getHeight() - 20
  );

  const safeName = (character.name || "personagem").replace(/[^a-z0-9]+/gi, "_").toLowerCase();
  doc.save(`ficha_${safeName}.pdf`);
}
