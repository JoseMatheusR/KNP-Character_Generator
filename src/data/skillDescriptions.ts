export const ARCHETYPE_SKILL_DESCRIPTIONS: Record<string, string> = {
  "Beber, cair e levantar": "Na primeira vez que chegar a 0 de vida, você não fica caído. Ao invés disso, levanta-se com 1 de vida e pode fazer uma ação extra de Atacar e Avançar fora do seu turno; em seguida, marca uma condição negativa (à sua escolha) e a rodada segue.",
  "Asa Branca": "Concede a técnica Esconder e prevenir (Evadir e Observar). O personagem marca a condição de Medo e sofre 1 de dano para não ser alvo de inimigos até a próxima rodada (ficando Favorecido). Se Atacar e Avançar na rodada seguinte, causa Atordoamento e o dobro de dano.",
  "Mandacaru": "Não é afetado por calor, fome, sede ou radiação. Ganha 1 de resistência a dano de sangramento e imunidade a dano elétrico. Porém, sofre +1 de dano térmico após receber 2 danos elétricos (durando até o fim da cena).",
  "Kryptônia": "Devido ao treinamento árduo, ganha +1 em testes nas Ações de Combate (Atacar e avançar e Defender e manobrar).",
  "Dezessete e setecentos": "Permite rolar novamente um dado de teste se o atributo base usado for 0 ou menor. Ao usar esta habilidade, é necessário marcar uma condição negativa à sua escolha.",
  "Cristal quebrado": "Os músculos evoluídos concedem resistência (-1) a danos radioativos. Contudo, devido ao julgamento social, o personagem sofre -1 em testes que envolvem o atributo Harmonia (Negociar, Persuadir, Mediar e Convencer).",
};

export const SPECIFIC_SKILL_DESCRIPTIONS: Record<string, string> = {
  "São amores": "Permite fazer um teste de Negociar e Persuadir usando Foco (em vez de Harmonia) para arrancar informações de alguém recém-conhecido. Um sucesso completo permite fazer duas perguntas objetivas; um sucesso parcial permite uma pergunta.",
  "Buscar cobertura": "Libera a técnica Buscar Cobertura para a ação Defender e Manobrar. O primeiro ataque contra você atinge sua cobertura, danificando-a ou destruindo-a, mas deixando você ileso.",
  "Saga de um vaqueiro": "Permite escolher uma habilidade específica de qualquer outro arquétipo (exceto Aberração), desde que faça sentido para a história do personagem.",
  "Mão leve": "Dá um bônus de +1 na ação de Pilhar e saquear para roubar itens, permitindo usar Criatividade em vez de Foco no teste.",
  "Evasiva": "Ao realizar Infiltrar e Esconder, o jogador pode marcar a condição de Insegurança para passar automaticamente no teste. A condição acaba ao deixar de estar escondido.",
  "Marotagem": "Permite escolher uma técnica adicional da lista de Evadir e Observar.",
  "Corpo de ferro": "Aumenta a capacidade física do personagem, tornando mais fáceis atividades como carregar itens e mover peso.",
  "Alto processamento": "Melhora a capacidade de Evadir e observar. Além disso, ações de Hackear e Negar Acesso obtêm sucesso parcial com resultados de 6 a 8, e sucesso pleno a partir de 9.",
  "Invasão de sistemas": "Garante um bônus de +1 ao realizar a ação de Hackear e Negar Acesso para invadir sistemas e desativar segurança.",
  "Sabiá": "Confere um bônus de +1 ao utilizar a ação de Escapar (fugindo ou se defendendo com um veículo), podendo usar o atributo Vontade para o teste.",
  "Insígnia de Autoridade": "Permite rolar Vontade para dar ordens a NPCs baseadas na sua autoridade. Com sucesso pleno, eles obedecem; no sucesso parcial (7-9), obedecem de forma medíocre, pedem algo em troca ou consultam superiores; em falha, ignoram a ordem e você recebe -1 contra eles.",
  "Alimentado pela Raiva": "Ao marcar a condição de Raiva, o personagem pode usar uma técnica adicional ao Atacar e avançar (mesmo falhando no teste). Enquanto estiver com Raiva, recebe +1 para Intimidar.",
  "Síndrome de Vereador": "Concede +1 permanente em Harmonia e aumenta o limite máximo desse atributo de 3 para 4.",
  "Análise de conversa": "Dá um bônus de +1 em ações sociais de Negociar e Persuadir e Intimidar, Mediar e Convencer.",
  "Voz calma": "Concede um bônus de +2 no teste de Guiar e confortar. O sucesso sempre removerá mais de uma condição do alvo confortado.",
  "Erro": "Permite utilizar o atributo Vontade (em vez de Harmonia) nos testes relacionados a ações sociais de Harmonia.",
  "Potencial aprimorado": "A resistência a dano radioativo sobe para +2, e o personagem adquire resistência de +1 contra todos os outros tipos de dano.",
  "Hormônios à flor da pele": "O personagem pode entrar em um \"modo caótico\", que inflige +1 de dano por ataque e permite usar a técnica Golpe Forçado como uma ação extra, uma vez por combate.",
};

export const COMBAT_TECHNIQUE_DESCRIPTIONS: Record<string, string> = {
  "Ataque na Fraqueza": "Marque 1 de dano em si mesmo para atingir o inimigo; ele sofre dano igual à quantidade de condições negativas que possuir.",
  "Investida": "Marque 1 de dano em si mesmo para se aproximar e infligir uma condição ou 2 de dano no inimigo. Você fica Favorecido para o próximo confronto.",
  "Golpe Forçado": "Marque 1 de dano em si mesmo para infligir 2 de dano ou uma condição no alvo, e o empurre para uma nova posição (a menos que o inimigo marque 2 de dano).",
  "Assalto Furioso": "Adquira a condição de Culpa para infligir no inimigo uma quantidade de condições igual à sua Vontade.",
  "Oportunidade": "Marque 1 de dano em si para infligir a condição Impedido em um inimigo normal; ou infligir Atordoado em um inimigo já Impedido; ou infligir 4 de dano em um inimigo que já esteja Atordoado.",
  "Esquiva e Torção": "Marque 1 de dano em si mesmo para remover uma de suas condições e tornar-se Favorecido.",
  "Avaliação Rápida": "Faça uma pergunta ao Mestre sobre a situação, torne-se Preparado e pode falar seu plano para um aliado ficar Preparado também.",
  "Sentir o Ambiente": "Procure vantagens. Na próxima vez que Atacar e avançar ou Defender e Manobrar, você pode usar as técnicas Investida ou Proteger sem precisar marcar pontos de dano em si mesmo.",
  "Proteger": "Marque 1 de dano em si mesmo para interceptar um ataque direcionado a um aliado. Se nenhum ataque for feito contra ele na rodada, ambos se tornam Inspirados.",
  "Manter-se Firme": "Torne-se Preparado e bloqueie automaticamente a aplicação de todos os estados negativos que tentarem infligir a você nesta rodada.",
  "Aguentar o Golpe": "Para cada ataque que causar dano ou condição a você nesta rodada, ganhe o direito de escolher uma técnica adicional no seu próximo turno.",
};
