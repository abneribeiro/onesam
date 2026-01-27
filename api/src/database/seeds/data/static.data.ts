export const areasData = [
  {
    nome: 'Tecnologia da Informação',
    descricao: 'Cursos relacionados com programação, desenvolvimento de software e infraestrutura de TI'
  },
  {
    nome: 'Gestão e Liderança',
    descricao: 'Cursos de gestão de equipas, liderança estratégica e gestão de projetos'
  },
  {
    nome: 'Marketing Digital',
    descricao: 'Cursos de estratégias digitais, SEO, redes sociais e publicidade online'
  },
  {
    nome: 'Design e Criatividade',
    descricao: 'Cursos de design gráfico, UX/UI e ferramentas criativas'
  },
  {
    nome: 'Recursos Humanos',
    descricao: 'Cursos de gestão de talento, recrutamento e desenvolvimento organizacional'
  },
  {
    nome: 'Finanças e Contabilidade',
    descricao: 'Cursos de gestão financeira, contabilidade e análise de investimentos'
  },
  {
    nome: 'Comunicação',
    descricao: 'Cursos de comunicação empresarial, apresentações e oratória'
  },
  {
    nome: 'Vendas e Comercial',
    descricao: 'Cursos de técnicas de venda, negociação e gestão comercial'
  }
];

export const categoriasDataByArea = {
  'Tecnologia da Informação': [
    { nome: 'Desenvolvimento Web', descricao: 'Frontend, Backend e Fullstack' },
    { nome: 'DevOps e Cloud', descricao: 'CI/CD, Docker, Kubernetes, AWS' },
    { nome: 'Data Science', descricao: 'Machine Learning, IA e análise de dados' }
  ],
  'Gestão e Liderança': [
    { nome: 'Liderança Estratégica', descricao: 'Gestão de equipas e tomada de decisão' },
    { nome: 'Gestão de Projetos', descricao: 'Metodologias ágeis e gestão tradicional' },
    { nome: 'Gestão de Mudança', descricao: 'Transformação digital e cultural' }
  ],
  'Marketing Digital': [
    { nome: 'Redes Sociais', descricao: 'Instagram, Facebook, LinkedIn, TikTok' },
    { nome: 'SEO e SEM', descricao: 'Otimização para motores de busca' },
    { nome: 'Publicidade Online', descricao: 'Google Ads, Facebook Ads, programática' }
  ],
  'Design e Criatividade': [
    { nome: 'Design Gráfico', descricao: 'Identidade visual e design print' },
    { nome: 'UX/UI Design', descricao: 'Experiência e interface do utilizador' },
    { nome: 'Ferramentas Criativas', descricao: 'Adobe Creative Suite, Figma, Sketch' }
  ],
  'Recursos Humanos': [
    { nome: 'Recrutamento', descricao: 'Técnicas de seleção e entrevista' },
    { nome: 'Gestão de Talento', descricao: 'Desenvolvimento e retenção' },
    { nome: 'Cultura Organizacional', descricao: 'Engagement e transformação cultural' }
  ],
  'Finanças e Contabilidade': [
    { nome: 'Contabilidade Geral', descricao: 'Princípios contabilísticos fundamentais' },
    { nome: 'Análise Financeira', descricao: 'Indicadores e performance empresarial' },
    { nome: 'Investimentos', descricao: 'Análise de riscos e oportunidades' }
  ],
  'Comunicação': [
    { nome: 'Comunicação Empresarial', descricao: 'Estratégias de comunicação interna e externa' },
    { nome: 'Apresentações', descricao: 'Técnicas de apresentação e storytelling' },
    { nome: 'Oratória', descricao: 'Técnicas de discurso e falar em público' }
  ],
  'Vendas e Comercial': [
    { nome: 'Técnicas de Venda', descricao: 'Metodologias e abordagens comerciais' },
    { nome: 'Negociação', descricao: 'Estratégias de negociação eficaz' },
    { nome: 'Gestão Comercial', descricao: 'Pipeline, CRM e métricas de vendas' }
  ]
};

export function buildCategoriasData(areasInserted: any[]) {
  const categorias: Array<{ areaId: number; nome: string; descricao: string }> = [];

  areasInserted.forEach(area => {
    const areaName = area.nome;
    const areaCategories = categoriasDataByArea[areaName as keyof typeof categoriasDataByArea];

    if (areaCategories) {
      areaCategories.forEach(categoria => {
        categorias.push({
          areaId: area.id,
          nome: categoria.nome,
          descricao: categoria.descricao
        });
      });
    }
  });

  return categorias;
}