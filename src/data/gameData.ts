import type { Attributes } from "@/types/character";

export interface ArchetypeData {
  id: string;
  name: string;
  hp: number;
  attributes: Attributes;
  skill: string;
  description: string;
}

export const ARCHETYPES: ArchetypeData[] = [
  {
    id: "neo-cangaceiro",
    name: "O Neo Cangaceiro",
    hp: 5,
    attributes: { criatividade: 0, foco: 1, harmonia: -1, vontade: 1 },
    skill: "Beber, cair e levantar",
    description: "Guerreiro do sertão digital. Sobrevive na brutalidade das ruas com garra e instinto.",
  },
  {
    id: "marginalizado",
    name: "O Marginalizado",
    hp: 4,
    attributes: { criatividade: 1, foco: -1, harmonia: 0, vontade: 1 },
    skill: "Asa Branca",
    description: "Esquecido pelo sistema. Usa a criatividade e a raiva como armas contra a opressão.",
  },
  {
    id: "androide",
    name: "O Androide",
    hp: 6,
    attributes: { criatividade: 1, foco: 1, harmonia: 0, vontade: -1 },
    skill: "Mandacaru",
    description: "Máquina com consciência. Processa o mundo com lógica fria mas busca algo mais.",
  },
  {
    id: "guarda",
    name: "A Guarda",
    hp: 6,
    attributes: { criatividade: 0, foco: 1, harmonia: -1, vontade: 1 },
    skill: "Kryptônia",
    description: "Braço armado da ordem. Protege interesses — nem sempre os do povo.",
  },
  {
    id: "empresario",
    name: "O Empresário",
    hp: 4,
    attributes: { criatividade: 1, foco: -1, harmonia: 1, vontade: 0 },
    skill: "Dezessete e setecentos",
    description: "Manipulador nato. Move as engrenagens do poder com palavras e créditos.",
  },
  {
    id: "aberracao",
    name: "A Aberração",
    hp: 6,
    attributes: { criatividade: 0, foco: 1, harmonia: -1, vontade: 1 },
    skill: "Cristal quebrado",
    description: "Mutação do Patônio. Poder instável e destrutivo correndo nas veias.",
  },
];

export const SPECIFIC_SKILLS: Record<string, string[]> = {
  "neo-cangaceiro": ["São amores", "Buscar cobertura", "Saga de um vaqueiro"],
  "marginalizado": ["Mão leve", "Evasiva", "Marotagem"],
  "androide": ["Corpo de ferro", "Alto processamento", "Invasão de sistemas"],
  "guarda": ["Sabiá", "Insígnia de Autoridade", "Alimentado pela Raiva"],
  "empresario": ["Síndrome de Vereador", "Análise de conversa", "Voz calma"],
  "aberracao": ["Erro", "Potencial aprimorado", "Hormônios à flor da pele"],
};

export const COMBAT_TECHNIQUES = {
  attack: {
    label: "Atacar e Avançar",
    options: ["Ataque na Fraqueza", "Investida", "Golpe Forçado", "Assalto Furioso", "Oportunidade"],
  },
  evade: {
    label: "Evadir e Observar",
    options: ["Esquiva e Torção", "Avaliação Rápida", "Sentir o Ambiente"],
  },
  defend: {
    label: "Defender e Manobrar",
    options: ["Proteger", "Manter-se Firme", "Aguentar o Golpe"],
  },
};

export const DAMAGE_TYPES = ["Impacto", "Sangramento", "Radiação", "Elétrico", "Térmico"];

export interface ConditionEffect {
  label: string;
  effects: Partial<Attributes>;
}

export const NEGATIVE_CONDITIONS: ConditionEffect[] = [
  { label: "Culpa", effects: { harmonia: -2, vontade: -2 } },
  { label: "Desconforto", effects: { foco: -2, criatividade: -2 } },
  { label: "Insegurança", effects: { foco: -2, harmonia: -2 } },
  { label: "Medo", effects: { vontade: -2, criatividade: -2 } },
  { label: "Raiva", effects: { foco: -1, harmonia: -1, vontade: -1 } },
];

export const COMBAT_CONDITIONS = ["Atordoado", "Impedido"];

export const POSITIVE_CONDITIONS = ["Compassivo", "Favorecido", "Inspirado", "Preparado"];

export const ATTRIBUTE_LABELS: Record<string, string> = {
  foco: "Foco",
  vontade: "Vontade",
  harmonia: "Harmonia",
  criatividade: "Criatividade",
};
