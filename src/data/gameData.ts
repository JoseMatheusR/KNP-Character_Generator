import type { Attributes, AttributeKey } from "@/types/character";

export const ATTRIBUTE_LIMIT = 3;

export function canSpendAttributePoint(base: Attributes, bonus: Attributes, key: AttributeKey): boolean {
  const spent = Object.values(bonus).reduce((sum, value) => sum + value, 0);
  return spent < 2 && bonus[key] < 2 && base[key] + bonus[key] < ATTRIBUTE_LIMIT;
}

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
    hp: 4,
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
    hp: 3,
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
  {
    id: "fiel",
    name: "O Fiel",
    hp: 3,
    attributes: { criatividade: -1, foco: -1, harmonia: 0, vontade: 2 },
    skill: "Olha pro Céu",
    description: "Devoto que enfrenta o kaos com a fé. A crença sustenta, e também cega.",
  },
  {
    id: "artesao",
    name: "O Artesão",
    hp: 4,
    attributes: { criatividade: 2, foco: 0, harmonia: 0, vontade: -1 },
    skill: "Olhar do Artesão",
    description: "Enxerga solução onde os outros só veem kaos. Criar o novo tem um preço.",
  },
  {
    id: "artista",
    name: "O Artista",
    hp: 3,
    attributes: { criatividade: 2, foco: -2, harmonia: 1, vontade: 0 },
    skill: "Performance Impactante",
    description: "Expressa o mundo pela arte, pela dor e pelo kaos.",
  },
  {
    id: "capanga",
    name: "O Capanga",
    hp: 4,
    attributes: { criatividade: 0, foco: -1, harmonia: 1, vontade: 1 },
    skill: "Cavaleiros do Forró",
    description: "Força e obediência o mantêm vivo. Seguir ordens cobra quem ele é.",
  },
];

export const SPECIFIC_SKILLS: Record<string, string[]> = {
  "neo-cangaceiro": ["São amores", "Buscar cobertura", "Saga de um vaqueiro"],
  "marginalizado": ["Mão leve", "Evasiva", "Marotagem"],
  "androide": ["Corpo de ferro", "Alto processamento", "Invasão de sistemas"],
  "guarda": ["Sabiá", "Insígnia de Autoridade", "Alimentado pela Raiva"],
  "empresario": ["Síndrome de Vereador", "Análise de conversa", "Perfil Calmo"],
  "aberracao": ["Erro", "Potencial aprimorado", "Hormônios à flor da pele"],
  fiel: ["Reza Braba", "Ladainha de todas as máquinas", "Vontade Irreverente"],
  artesao: ["Ferramenta Improvisada", "Ferramenta Auxiliar", "Obra-Prima"],
  artista: ["Pichação Subversiva", "Criatividade Focada", "Olhar do Esteta"],
  capanga: ["Feira de Mangaio", "Lá Vai o Traque", "Pariceiro"],
};

export const TECHNIQUE_CATEGORIES = ["attack", "defend", "evade", "heal"] as const;
export type TechniqueCategory = (typeof TECHNIQUE_CATEGORIES)[number];

export const COMBAT_TECHNIQUES: Record<TechniqueCategory, { label: string; options: string[] }> = {
  attack: {
    label: "Atacar e Avançar",
    options: ["Ataque na Fraqueza", "Investida", "Golpe Forçado", "Assalto Furioso", "Oportunidade"],
  },
  defend: {
    label: "Defender e Manobrar",
    options: ["Aguentar o Golpe", "Manter-se Firme", "Proteger", "Esquiva e Ação"],
  },
  evade: {
    label: "Evadir e Observar",
    options: ["Avaliação Rápida", "Sentir o Ambiente"],
  },
  heal: {
    label: "Curar e Restaurar",
    options: ["Sincronizar Pulso", "Estímulo de Sobrevivência", "Transfusão de Circuito"],
  },
};

export const DAMAGE_TYPES = ["Impacto", "Sangramento", "Radiação", "Elétrico", "Térmico"];

export interface ConditionEffect {
  label: string;
  description: string;
  effects?: Partial<Attributes>;
}

export const NEGATIVE_CONDITIONS: ConditionEffect[] = [
  { label: "Culpa", description: "-2 em Harmonia e Vontade.", effects: { harmonia: -2, vontade: -2 } },
  { label: "Desconforto", description: "-2 em Foco e Criatividade.", effects: { foco: -2, criatividade: -2 } },
  { label: "Insegurança", description: "-2 em Foco e Harmonia.", effects: { foco: -2, harmonia: -2 } },
  { label: "Medo", description: "-2 em Vontade e Criatividade.", effects: { vontade: -2, criatividade: -2 } },
  { label: "Raiva", description: "-1 em Foco, Harmonia e Vontade.", effects: { foco: -1, harmonia: -1, vontade: -1 } },
  { label: "Entorpecido", description: "-2 em Foco e Vontade.", effects: { foco: -2, vontade: -2 } },
  { label: "Paranoico", description: "-2 em Harmonia e Criatividade.", effects: { harmonia: -2, criatividade: -2 } },
  {
    label: "Obcecado",
    description: "-2 em todos os testes de ação que não estejam diretamente ligados ao objeto da sua obsessão.",
  },
  { label: "Apático", description: "-2 em Vontade e Criatividade.", effects: { vontade: -2, criatividade: -2 } },
  {
    label: "Desesperado",
    description: "-1 em todos os atributos.",
    effects: { foco: -1, vontade: -1, harmonia: -1, criatividade: -1 },
  },
];

export const COMBAT_CONDITIONS: ConditionEffect[] = [
  { label: "Atordoado", description: "Não pode usar, na rodada, técnicas de Atacar e Avançar." },
  { label: "Impedido", description: "Não pode usar, na rodada, técnicas de Evadir e Observar ou Defender e Manobrar." },
  { label: "Queimando", description: "Não pode usar, na rodada, técnicas de Evadir e Observar." },
  { label: "Sangrando", description: "Não pode usar, na rodada, técnicas de Evadir e Observar." },
  { label: "Ofuscado", description: "Não pode usar, na rodada, técnicas de Atacar e Avançar ou Evadir e Observar." },
  { label: "Cego", description: "Não pode usar, na rodada, técnicas de Atacar e Avançar ou Evadir e Observar." },
  { label: "Desequilibrado", description: "Não pode usar, na rodada, técnicas de Defender e Manobrar." },
  {
    label: "Ensurdecido",
    description: "Não pode usar, na rodada, técnicas de Evadir e Observar.",
  },
];

export const POSITIVE_CONDITIONS: ConditionEffect[] = [
  {
    label: "Compassivo",
    description: "Consegue realizar mais uma técnica de Evadir e Observar, se tiver no mínimo um sucesso parcial.",
  },
  { label: "Favorecido", description: "+2 no próximo teste de ação." },
  {
    label: "Inspirado",
    description: "Consegue realizar mais uma técnica de Atacar e Avançar, se tiver no mínimo um sucesso parcial.",
  },
  {
    label: "Preparado",
    description: "Consegue realizar mais uma técnica de Defender e Manobrar, se tiver no mínimo um sucesso parcial.",
  },
  { label: "Resoluto", description: "+2 no próximo teste de Vontade ou Harmonia." },
  {
    label: "Focado",
    description: "+1 em Foco até que a concentração se esvaia.",
    effects: { foco: 1 },
  },
  {
    label: "Intocável",
    description: "+2 em qualquer teste de Defender e Manobrar ou Evadir e Observar na próxima rodada.",
  },
  {
    label: "Implacável",
    description: "O próximo Atacar e Avançar que acertar causa dano adicional ou impõe uma Condição de Combate ao alvo.",
  },
];

export const ATTRIBUTE_LABELS: Record<string, string> = {
  foco: "Foco",
  vontade: "Vontade",
  harmonia: "Harmonia",
  criatividade: "Criatividade",
};
