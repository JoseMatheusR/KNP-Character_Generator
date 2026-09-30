export const ARCHETYPE_SKILL_DESCRIPTIONS: Record<string, string> = {
  "Beber, cair e levantar":
    "Na primeira vez que chegar a 0 de vida, você não fica caído: levanta-se com 1 de vida, faz uma ação extra de Atacar e Avançar fora do seu turno, marca uma condição à escolha e a rodada segue.",
  "Asa Branca":
    "Você é naturalmente mais ardiloso e ágil e recebe a técnica Esconder e prevenir para a ação de Evadir e Observar.",
  Mandacaru:
    "Não é afetado por calor, fome, sede e radiação no sertão. Garante 1 de resistência a dano de sangramento e imunidade total a dano elétrico.",
  Kryptônia:
    "Recebe +1 nas ações de combate Atacar e Avançar e Defender e Manobrar. Além disso, escolhe mais 1 técnica de qualquer tipo.",
  "Dezessete e setecentos":
    "Sempre que um teste usar um atributo base de 0 ou menor, pode rolar novamente 1 dado marcando uma condição negativa.",
  "Cristal quebrado":
    "Músculos hipertrofiados garantem resistência (-1) a danos radioativos, mas o preconceito aplica -1 em testes de Harmonia.",
  "Olha pro Céu":
    "Uma vez por rodada, pode trocar uma condição marcada por outra do mesmo tipo, respeitando os limites de condições.",
  "Olhar do Artesão":
    "Identifica componentes e falhas em dispositivos e implantes cibernéticos. Recebe vantagem para Explorar e Investigar esses itens e +1 ao usá-los.",
  "Performance Impactante":
    "Uma vez por cena, faz um teste de Criatividade para mudar o rumo ou o humor da cena: apoio da multidão, abalar um inimigo ou conceder Inspirado.",
  "Cavaleiros do Forró":
    "Recebe +1 em qualquer rolagem quando está próximo aos membros da sua gangue ou aos aliados escolhidos.",
};

export const SPECIFIC_SKILL_DESCRIPTIONS: Record<string, string> = {
  "São amores":
    "Pode fazer um teste de Negociar e Persuadir usando Foco, em vez de Harmonia, para arrancar informações de uma pessoa não agressiva. Sucesso completo: 2 perguntas. Parcial: 1 pergunta.",
  "Buscar cobertura": "Libera a técnica Buscar Cobertura para a ação de Defender e Manobrar.",
  "Saga de um vaqueiro":
    "Permite escolher uma habilidade específica de outro arquétipo, exceto A Aberração.",
  "Mão leve":
    "Recebe +1 ao usar Pilhar e Saquear para roubar itens, e pode usar Criatividade no lugar de Foco.",
  Evasiva:
    "Ao usar Infiltrar e Esconder, marque Insegurança para passar automaticamente no teste.",
  Marotagem: "Permite escolher mais uma técnica de Evadir e Observar.",
  "Corpo de ferro":
    "Recebe +1 em testes para levantar peso, quebrar, carregar e segurar objetos pesados.",
  "Alto processamento":
    "Em testes de Evadir e Observar, um sucesso parcial conta como sucesso completo.",
  "Invasão de sistemas": "Ganha +2 ao realizar Hackear e Negar Acesso.",
  Sabiá: "Recebe +1 ao usar Escapar, e pode utilizar Vontade no teste.",
  "Insígnia de Autoridade":
    "Ao dar uma ordem autoritária a um NPC com base na insígnia, role Intimidar com +1. Sucesso completo: obedecem totalmente. Parcial: obedecem com ressalva ou atraso. Falha: ignoram e você fica Desconfortável.",
  "Alimentado pela Raiva":
    "Marque Raiva para usar uma técnica adicional ao Atacar e Avançar. Enquanto estiver com Raiva, recebe +1 em Intimidar.",
  "Síndrome de Vereador":
    "Recebe +1 em Harmonia, e o limite máximo desse atributo sobe para 4.",
  "Análise de conversa":
    "Ganha +1 em Negociar e Persuadir, Intimidar e Mediar e Convencer.",
  "Perfil Calmo": "Uma vez por cena, pode negar uma condição negativa mental.",
  "Voz calma": "Uma vez por cena, pode negar uma condição negativa mental.",
  Erro: "Pode utilizar Vontade nos testes de ações de Harmonia.",
  "Potencial aprimorado":
    "A resistência a dano radioativo sobe para +2, e você recebe resistência +1 a todos os outros tipos de dano.",
  "Hormônios à flor da pele":
    "Marque Raiva para dobrar o dano das técnicas de Atacar e Avançar e usar Golpe Forçado como ação extra uma vez por combate.",
  "Reza Braba":
    "Aumenta 1 ponto em Vontade, podendo ultrapassar o limite de 3, e recebe +1 em testes de Resistir ao justificar pela crença.",
  "Ladainha de todas as máquinas":
    "Uma vez por cena, ao Guiar e Confortar através da fé, um sucesso completo remove uma condição negativa ou de combate de um aliado, cura 1 PV e o deixa Favorecido.",
  "Vontade Irreverente": "Pode utilizar Vontade em ações que envolvem Foco.",
  "Ferramenta Improvisada":
    "Pode improvisar um equipamento, arma ou utensílio, com um teste de Criatividade, oferecendo vantagem temporária.",
  "Ferramenta Auxiliar":
    "Em cena calma, dedica um momento para criar uma ferramenta que concede auxílio a si ou a um aliado: +1 na ação, uma ação de combate extra ou remover uma condição.",
  "Obra-Prima":
    "Possui uma criação perfeita. Uma vez por cena e próximo a ela, pode anular uma vez cada as condições de Medo, Insegurança e Culpa.",
  "Pichação Subversiva":
    "Em momentos de calma, deixa mensagens codificadas com um teste de Criatividade para alterar elementos narrativos em auxílio do grupo.",
  "Criatividade Focada":
    "Em testes de Foco, soma Criatividade no lugar do atributo original da ação.",
  "Olhar do Esteta":
    "Ao entrar em um local importante, pergunta ao mestre o que está fora do lugar e ganha Favorecido no primeiro teste de investigação.",
  "Feira de Mangaio":
    "Uma vez por cena, rola 2d6 para puxar um equipamento útil. Sucesso completo: +2 na ação e remove Insegurança. Parcial: +1.",
  "Lá Vai o Traque":
    "Ataque caótico com explosivos, teste de Criatividade +1. Causa 1 de dano ou uma condição: Desconforto, Atordoado, Queimando, Ofuscado ou Ensurdecido.",
  Pariceiro:
    "Vínculo com um companheiro. Ambos recebem +1 em ações quando próximos e imunidade a Inseguro, mas compartilham condições negativas e sofrem juntos.",
};

export const COMBAT_TECHNIQUE_DESCRIPTIONS: Record<string, string> = {
  "Ataque na Fraqueza":
    "Golpeia um ponto fraco. Sucesso completo: o inimigo sofre dano igual ao número de condições que possui. Parcial: marque 1 de dano em si para infligir o mesmo efeito. Falha: sofra 1 de dano.",
  Investida:
    "Avança e engaja um inimigo distante. Sucesso completo: fecha a distância, causa 1 de dano ou uma condição negativa à escolha do inimigo e você fica Favorecido para o próximo turno.",
  "Golpe Forçado":
    "Golpe massivo. Sucesso completo: inflige 2 de dano ou uma condição de combate, e o alvo fica Desequilibrado. Parcial: sofra 1 de dano em si para causar o efeito.",
  "Assalto Furioso":
    "Golpe devastador. Sucesso completo ou parcial: inflija dano igual à sua Vontade. Se Vontade for negativa, não causa dano. No parcial ou na falha, você fica Desequilibrado.",
  Oportunidade:
    "Aproveita uma vulnerabilidade. Sucesso completo: inflige Impedido em um inimigo, Atordoado em um alvo Impedido, ou 4 de dano em um alvo Atordoado.",
  "Esquiva e Ação":
    "Movimento rápido de esquiva. Sucesso completo: evita 1 de dano, remove uma condição de combate e fica Favorecido. Parcial: remove uma condição e fica Favorecido.",
  "Esquiva e Torção":
    "Técnica antiga. Marque 1 de dano em si mesmo para remover uma de suas condições e tornar-se Favorecido.",
  "Avaliação Rápida":
    "Compreenda a situação. Faça uma pergunta sobre o cenário, ganhe uma condição positiva ao agir na resposta e pode deixar um aliado Preparado.",
  "Sentir o Ambiente":
    "Remodela o ambiente. No próximo turno, pode usar Investida ou Proteger sem marcar dano ou condição em caso de falha ou parcial.",
  Proteger:
    "Intercepte um ataque contra um aliado e tome o dano ou a condição no lugar dele. Se nenhum ataque for feito, ambos ficam Inspirados e Favorecidos.",
  "Manter-se Firme":
    "Adquire Intocado e bloqueia automaticamente todas as condições de combate infligidas até a sua próxima rodada.",
  "Aguentar o Golpe":
    "Se você foi alvo de um ataque que causou dano na rodada anterior, executa uma técnica adicional de Atacar e Avançar na próxima rodada.",
  "Esconder e prevenir":
    "Agir furtivamente. Sucesso completo: fica impossibilitado de ser alvo de inimigos até o próximo turno, Favorecido e Intocável.",
  "Buscar Cobertura":
    "Mova-se para cobertura. O primeiro ataque contra você acerta a cobertura: ileso no sucesso completo, de raspão no parcial.",
  "Sincronizar Pulso":
    "Ajusta o ritmo vital de um aliado. Sucesso completo: o aliado recupera 1 PV e remove 1 condição de combate. Parcial: recupera 1 PV, mas você fica Impedido.",
  "Estímulo de Sobrevivência":
    "Discurso ou dose estimulante. Sucesso completo: o aliado recupera 1 PV e fica Inspirado. Parcial: o aliado fica Inspirado.",
  "Transfusão de Circuito":
    "Canaliza energia em cibernéticos. Sucesso completo: o aliado recupera 2 PV e fica Favorecido. Parcial: recupera 1 PV com superaquecimento. Falha: danos permanentes no aliado, e Culpa e Insegurança em você.",
};
