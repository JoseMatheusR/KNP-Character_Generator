import { Asset } from "expo-asset";
import { EncodingType, File, Paths } from "expo-file-system";
import * as FileSystemLegacy from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { ARCHETYPES } from "@/src/domain/gameData";
import type { Character } from "@/src/domain/character";
import { grantedTechniques } from "@/src/domain/characterBuild";
import { getBuiltAttributes } from "@/src/domain/characterRules";
import {
  ARCHETYPE_SKILL_DESCRIPTIONS,
  COMBAT_TECHNIQUE_DESCRIPTIONS,
  SPECIFIC_SKILL_DESCRIPTIONS,
} from "@/src/domain/skillDescriptions";
import { loadHomebrew, type HomebrewSkill } from "@/src/storage/homebrew";

const SHEET_PAGES = [
  require("../../assets/images/character-sheet/page-1.png"),
  require("../../assets/images/character-sheet/page-2.png"),
  require("../../assets/images/character-sheet/page-3.png"),
] as const;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function descriptionFor(name: string, builtIn: Record<string, string>, homebrew: HomebrewSkill[]): string {
  return builtIn[name] ?? homebrew.find((item) => item.name === name)?.description ?? "";
}

function describedItem(name: string, description: string): string {
  return `<div class="described-item"><strong>${escapeHtml(name)}</strong>${
    description ? `<span>${escapeHtml(description)}</span>` : ""
  }</div>`;
}

async function sheetPageSources(): Promise<string[]> {
  return Promise.all(
    SHEET_PAGES.map(async (module) => {
      const asset = Asset.fromModule(module);
      if (Platform.OS === "web") return asset.uri;
      await asset.downloadAsync();
      const uri = asset.localUri ?? asset.uri;
      const base64 = await FileSystemLegacy.readAsStringAsync(uri, {
        encoding: FileSystemLegacy.EncodingType.Base64,
      });
      return `data:image/png;base64,${base64}`;
    })
  );
}

export function buildCharacterHtml(
  character: Character,
  pageSources: readonly string[],
  homebrew: HomebrewSkill[] = []
): string {
  const archetype = ARCHETYPES.find((a) => a.id === character.archetype);
  const attributes = getBuiltAttributes(character);
  const value = (key: keyof typeof attributes) => {
    const total = attributes[key];
    return `${total >= 0 ? "+" : ""}${total}`;
  };
  const archetypeSkill = describedItem(
    character.archetypeSkill,
    descriptionFor(character.archetypeSkill, ARCHETYPE_SKILL_DESCRIPTIONS, homebrew)
  );
  const specificSkills = [character.specificSkill, character.borrowedSkill]
    .filter((name): name is string => !!name)
    .map((name) => describedItem(name, descriptionFor(name, SPECIFIC_SKILL_DESCRIPTIONS, homebrew)))
    .join("");
  const techniqueDescription = (name: string) =>
    descriptionFor(name, COMBAT_TECHNIQUE_DESCRIPTIONS, homebrew);
  const granted = grantedTechniques(character);
  const techniques = {
    attack: [character.combatTechniques.attack, ...granted.filter((item) => item.category === "attack").map((item) => item.name)],
    defend: [character.combatTechniques.defend, ...granted.filter((item) => item.category === "defend").map((item) => item.name)],
    evade: [
      character.combatTechniques.evade,
      character.extraEvadeTechnique,
      ...granted.filter((item) => item.category === "evade").map((item) => item.name),
    ].filter((name): name is string => !!name),
  };
  const techniqueBox = (names: string[], className: string) => `
    <div class="technique-name ${className}-name">${names.map(escapeHtml).join(" + ")}</div>
    <div class="technique-description ${className}-description">
      ${names
        .map((name) => describedItem(name, techniqueDescription(name)))
        .join("")}
    </div>`;
  const notes = [
    character.origin ? `<strong>Origem:</strong> ${escapeHtml(character.origin)}` : "",
    character.damageMarkers.length
      ? `<strong>Danos:</strong> ${escapeHtml(character.damageMarkers.join(", "))}`
      : "",
    character.notes ? escapeHtml(character.notes).replace(/\n/g, "<br/>") : "",
  ]
    .filter(Boolean)
    .join("<br/>");
  const identity = `
    <div class="identity name">${escapeHtml(character.name || "Sem Nome")}</div>
    <div class="identity archetype">${escapeHtml(archetype?.name || character.archetype)}</div>`;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<style>
  @page { size: A4 portrait; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; color: #111; font-family: Helvetica, Arial, sans-serif; }
  .page { position: relative; width: 210mm; height: 297mm; overflow: hidden; break-after: page; page-break-after: always; }
  .page:last-child { break-after: auto; page-break-after: auto; }
  .background { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; }
  .identity { position: absolute; width: 32%; font-size: 16pt; line-height: 1.15; z-index: 1; }
  .name { left: 50.5%; top: 8.25%; }
  .archetype { left: 62%; top: 14.0%; width: 29%; }
  .page-1 .name { top: 10%; }
  .page-1 .archetype { top: 15.7%; }
  .attribute { position: absolute; top: 24.15%; width: 8%; transform: translateX(-50%); text-align: center; font-size: 20pt; font-weight: 700; z-index: 1; }
  .hp { position: absolute; top: 23.55%; width: 13%; text-align: center; font-size: 18pt; font-weight: 700; z-index: 1; }
  .skill { position: absolute; top: 37.4%; width: 35.8%; height: 27.1%; overflow: hidden; padding: 2mm; font-size: 11pt; line-height: 1.28; z-index: 1; }
  .archetype-skill { left: 10%; }
  .specific-skill { left: 53.3%; }
  .described-item { margin-bottom: 2.2mm; }
  .described-item strong { display: block; font-size: 1.08em; }
  .described-item span { display: block; margin-top: 0.7mm; }
  .notes { position: absolute; left: 10%; top: 75.7%; width: 80%; height: 16.7%; overflow: hidden; padding: 2mm; font-size: 12pt; line-height: 1.3; z-index: 1; }
  .technique-name { position: absolute; left: 48.4%; width: 39.2%; height: 3.2%; overflow: hidden; padding: 0.4mm 2mm; font-size: 12pt; font-weight: 700; white-space: nowrap; z-index: 1; }
  .technique-description { position: absolute; left: 11.1%; width: 77.5%; height: 12.2%; overflow: hidden; padding: 2mm; font-size: 10.5pt; line-height: 1.25; z-index: 1; }
  .attack-name { top: 24.05%; } .attack-description { top: 27.0%; }
  .defend-name { top: 42.35%; } .defend-description { top: 45.3%; }
  .evade-name { top: 60.65%; } .evade-description { top: 63.6%; }
  .condition-notes { left: 8.8%; top: 77.5%; width: 44.5%; height: 15.2%; font-size: 11pt; }
</style></head><body>
  <section class="page page-1">
    <img class="background" src="${pageSources[0]}" />
    ${identity}
    <div class="attribute" style="left:13.1%">${value("foco")}</div>
    <div class="attribute" style="left:23.4%">${value("harmonia")}</div>
    <div class="attribute" style="left:33.5%">${value("criatividade")}</div>
    <div class="attribute" style="left:43.6%">${value("vontade")}</div>
    <div class="hp" style="left:54%">${character.currentHp}</div>
    <div class="hp" style="left:73%">${character.baseHp}</div>
    <div class="skill archetype-skill">${archetypeSkill}</div>
    <div class="skill specific-skill">${specificSkills}</div>
    <div class="notes">${notes}</div>
  </section>
  <section class="page">
    <img class="background" src="${pageSources[1]}" />
    ${identity}
    ${techniqueBox(techniques.attack, "attack")}
    ${techniqueBox(techniques.defend, "defend")}
    ${techniqueBox(techniques.evade, "evade")}
  </section>
  <section class="page">
    <img class="background" src="${pageSources[2]}" />
    ${identity}
    <div class="notes condition-notes">${notes}</div>
  </section>
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
  const [pageSources, homebrew] = await Promise.all([sheetPageSources(), loadHomebrew()]);
  const html = buildCharacterHtml(character, pageSources, homebrew);
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
