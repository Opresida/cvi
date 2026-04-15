// ============================================
// CVI - CONTEÚDO DO SITE
// Copy profissional - Tom: acolhedor, esperançoso, empoderador
// ============================================

export const siteContent = {
  meta: {
    title: "CVI Amazonas | Centro de Vida Independente",
    description:
      "Há mais de 20 anos promovendo autonomia, independência e qualidade de vida para pessoas com deficiência no Amazonas. Atendimento 100% gratuito.",
    keywords:
      "reabilitação, pessoa com deficiência, PcD, Amazonas, Manaus, saúde, inclusão, acessibilidade, CVI",
  },

  nav: {
    brand: "CVI Amazonas",
    links: [
      { label: "Início", href: "#inicio" },
      { label: "Sobre", href: "#sobre" },
      { label: "Impacto", href: "#impacto" },
      { label: "Serviços", href: "#servicos" },
      { label: "Equipe", href: "#equipe" },
      { label: "Depoimentos", href: "#depoimentos" },
      { label: "Contato", href: "#contato" },
    ],
    cta: { label: "Doe Agora", href: "#doar" },
  },

  hero: {
    tagline: "Centro de Vida Independente do Amazonas",
    headline: "Cada pessoa merece\nviver com autonomia.",
    subheadline:
      "Há mais de 20 anos, transformamos vidas através da reabilitação biopsicossocial. Oferecemos atendimento especializado e 100% gratuito a pessoas com deficiência, seus familiares e toda a comunidade.",
    cta_primary: { label: "Conheça Nosso Trabalho", href: "#sobre" },
    cta_secondary: { label: "Faça Uma Doação", href: "#doar" },
  },

  timeline: [
    { year: "2004", title: "Fundação", text: "Nasce o Centro de Vida Independente do Amazonas, com a missão de transformar a reabilitação em conquista de autonomia." },
    { year: "2010", title: "Expansão regional", text: "CVI amplia atendimento para o interior do estado, chegando a comunidades ribeirinhas." },
    { year: "2018", title: "Equipe multidisciplinar", text: "Estrutura-se equipe com mais de 70 profissionais, integrando reabilitação, assistência social e defesa de direitos." },
    { year: "2021", title: "Termo de Cooperação SUS", text: "Celebração do Termo 001/2021 com a SES/AM, garantindo atendimento 100% gratuito via Fundo Nacional de Saúde." },
    { year: "2024", title: "Renovação do convênio", text: "Novo Termo de Cooperação 001/2024 amplia escopo de ações e alcance territorial." },
    { year: "Hoje", title: "Referência estadual", text: "Mais de 990 mil atendimentos realizados em 50+ municípios do Amazonas." },
  ],

  about: {
    section_label: "Quem Somos",
    headline: "Duas décadas dedicadas a transformar vidas",
    paragraphs: [
      "O Centro de Vida Independente do Amazonas nasceu de uma convicção: toda pessoa, independentemente de sua condição física ou intelectual, tem o direito de conduzir a própria vida com dignidade, autonomia e liberdade.",
      "Desde nossa fundação, trabalhamos com uma abordagem biopsicossocial — cuidando não apenas do corpo, mas do bem-estar emocional, social e comunitário de cada pessoa que nos procura.",
      "Somos financiados integralmente pelo Sistema Único de Saúde (SUS) através do Fundo Nacional de Saúde, garantindo que cada atendimento seja 100% gratuito. Porque acreditamos que saúde e reabilitação são direitos, não privilégios.",
    ],
    mission: {
      title: "Missão",
      text: "Promover a qualidade de vida e a inclusão social de pessoas com deficiência através de reabilitação integral, fortalecendo sua autonomia e garantindo seus direitos fundamentais.",
    },
    vision: {
      title: "Visão",
      text: "Ser referência nacional em reabilitação biopsicossocial, reconhecido pela excelência no atendimento e pelo impacto transformador na vida das comunidades amazônicas.",
    },
    values: [
      {
        title: "Autonomia",
        text: "Respeitamos e fortalecemos a capacidade de cada pessoa tomar suas próprias decisões.",
        icon: "heart-handshake",
      },
      {
        title: "Inclusão",
        text: "Trabalhamos para que todos tenham acesso igualitário a oportunidades e direitos.",
        icon: "users",
      },
      {
        title: "Excelência",
        text: "Buscamos continuamente o mais alto padrão de qualidade em cada atendimento.",
        icon: "award",
      },
      {
        title: "Humanização",
        text: "Cada pessoa é única — nosso atendimento reflete essa individualidade.",
        icon: "sparkles",
      },
    ],
  },

  impact: {
    section_label: "Nosso Impacto",
    headline: "Números que contam histórias",
    subheadline:
      "Cada número representa uma vida transformada, uma família fortalecida, uma comunidade mais inclusiva.",
    stats: [
      {
        value: 990000,
        suffix: "+",
        label: "Atendimentos realizados",
        description: "Consultas, terapias e acompanhamentos especializados",
      },
      {
        value: 193796,
        suffix: "+",
        label: "Famílias atendidas",
        description: "Famílias que encontraram apoio e orientação no CVI",
      },
      {
        value: 90,
        suffix: "+",
        label: "Profissionais qualificados",
        description: "Equipe multidisciplinar dedicada e especializada",
      },
      {
        value: 50,
        suffix: "+",
        label: "Municípios alcançados",
        description: "Presença em todo o estado do Amazonas",
      },
      {
        value: 1250,
        suffix: "+",
        label: "Tipos de avaliação",
        description: "Recursos de diagnóstico e acompanhamento disponíveis",
      },
      {
        value: 20,
        suffix: "+",
        label: "Anos de atuação",
        description: "Duas décadas de compromisso com a vida independente",
      },
    ],
  },

  services: {
    section_label: "O Que Fazemos",
    headline: "Serviços que transformam realidades",
    subheadline:
      "Nossa abordagem multidisciplinar garante cuidado integral — do diagnóstico à plena inserção social.",
    items: [
      {
        title: "Reabilitação Integral",
        description:
          "Atendimento especializado em fisioterapia, fonoaudiologia, terapia ocupacional, psicologia e serviço social. Cada plano é personalizado para as necessidades únicas de cada pessoa.",
        icon: "activity",
        highlights: [
          "Fisioterapia e reabilitação física",
          "Fonoaudiologia e comunicação",
          "Terapia ocupacional",
          "Acompanhamento psicológico",
          "Serviço social integrado",
        ],
      },
      {
        title: "Defesa de Direitos",
        description:
          "Orientação jurídica, assessoria e acompanhamento para garantir que os direitos das pessoas com deficiência sejam respeitados em todas as esferas — saúde, educação, trabalho e acessibilidade.",
        icon: "shield-check",
        highlights: [
          "Orientação jurídica especializada",
          "Acompanhamento de políticas públicas",
          "Advocacy e representação",
          "Inclusão no mercado de trabalho",
          "Acessibilidade urbana e social",
        ],
      },
      {
        title: "Apoio à Família",
        description:
          "A reabilitação não acontece isoladamente. Oferecemos suporte, orientação e capacitação para familiares, fortalecendo a rede de apoio que envolve cada pessoa atendida.",
        icon: "heart",
        highlights: [
          "Grupos de apoio familiar",
          "Orientação e capacitação",
          "Suporte psicossocial",
          "Mediação com a comunidade",
          "Fortalecimento de vínculos",
        ],
      },
      {
        title: "Prevenção e Educação",
        description:
          "Ações educativas e preventivas contra deficiências causadas por acidentes de trânsito, violência urbana, doméstica e outras causas evitáveis. Informação salva vidas.",
        icon: "book-open",
        highlights: [
          "Campanhas de prevenção",
          "Educação em saúde",
          "Combate à violência",
          "Conscientização comunitária",
          "Capacitação de agentes de saúde",
        ],
      },
    ],
  },

  pillars: {
    section_label: "Nossos Pilares",
    headline: "Cinco compromissos que guiam cada ação",
    items: [
      {
        number: "01",
        title: "Assistência Especializada",
        text: "Garantir atendimento qualificado à comunidade e cuidado especializado a pessoas com deficiência, abrangendo saúde física, psicossocial e desenvolvimento profissional.",
      },
      {
        number: "02",
        title: "Apoio e Orientação",
        text: "Oferecer suporte contínuo à comunidade, pessoas com deficiência e familiares, fundamentado nos princípios do SUS e do SUAS.",
      },
      {
        number: "03",
        title: "Acesso à Saúde",
        text: "Ampliar e qualificar o acesso aos cuidados de saúde para pessoas com deficiência através de redes organizadas de atenção.",
      },
      {
        number: "04",
        title: "Ações Preventivas",
        text: "Promover ações de prevenção contra deficiências causadas por acidentes, violência e outras causas evitáveis.",
      },
      {
        number: "05",
        title: "Capacitação Permanente",
        text: "Investir na formação contínua da equipe para garantir o máximo desenvolvimento e bem-estar de cada pessoa atendida.",
      },
    ],
  },

  team: {
    section_label: "Nossa Equipe",
    headline: "Profissionais que fazem a diferença",
    subheadline:
      "Uma equipe multidisciplinar com mais de 90 profissionais qualificados, unidos pelo compromisso de transformar vidas através da excelência no atendimento.",
    specialties: [
      "Fisioterapeutas",
      "Fonoaudiólogos",
      "Terapeutas Ocupacionais",
      "Psicólogos",
      "Assistentes Sociais",
      "Médicos",
      "Educadores Físicos",
      "Nutricionistas",
      "Pedagogos",
      "Enfermeiros",
    ],
  },

  testimonials: {
    section_label: "Histórias de Vida",
    headline: "Vidas transformadas, histórias reais",
    subheadline:
      "Cada depoimento representa uma jornada de superação, esperança e conquista de autonomia.",
    items: [
      {
        quote:
          "O CVI me devolveu a confiança de que eu podia voltar a viver plenamente. Não é só reabilitação — é renascimento.",
        author: "Maria S.",
        role: "Paciente há 3 anos",
      },
      {
        quote:
          "Quando meu filho recebeu o diagnóstico, o CVI foi nosso porto seguro. A equipe não cuida só do paciente, cuida de toda a família.",
        author: "Carlos A.",
        role: "Pai de paciente",
      },
      {
        quote:
          "Trabalhar no CVI é ver milagres acontecerem todo dia. Cada pessoa que reconquista sua independência é uma vitória de toda a equipe.",
        author: "Dra. Ana Paula",
        role: "Fisioterapeuta do CVI",
      },
    ],
  },

  donate: {
    section_label: "Como Ajudar",
    headline: "Sua contribuição transforma vidas",
    subheadline:
      "Embora nosso atendimento seja financiado pelo SUS, doações nos permitem expandir projetos, adquirir equipamentos e alcançar mais pessoas em todo o Amazonas.",
    cta: { label: "Quero Contribuir", href: "#" },
    options: [
      {
        title: "Doação Financeira",
        description:
          "Contribua via Pix, transferência bancária ou cartão de crédito para financiar novos projetos e equipamentos.",
        icon: "banknote",
      },
      {
        title: "Voluntariado",
        description:
          "Doe seu tempo e talento. Profissionais de diversas áreas podem contribuir com nosso trabalho.",
        icon: "hand-helping",
      },
      {
        title: "Parcerias",
        description:
          "Empresas e instituições podem estabelecer parcerias para ampliar o impacto de nossas ações.",
        icon: "handshake",
      },
    ],
    pix: {
      label: "Chave Pix (CNPJ)",
      value: "07.555.086/0001-68",
    },
    impact_breakdown: [
      { amount: "R$ 50", result: "1 sessão de fisioterapia para uma criança em reabilitação" },
      { amount: "R$ 150", result: "Uma semana de acompanhamento psicológico familiar" },
      { amount: "R$ 500", result: "Kit completo de avaliação multidisciplinar" },
      { amount: "R$ 1.000", result: "Um mês de programa integral para uma família" },
    ],
  },

  contact: {
    section_label: "Contato",
    headline: "Fale Conosco",
    subheadline:
      "Estamos prontos para atender você. Entre em contato e saiba como o CVI pode ajudar.",
    info: {
      address: "Manaus, Amazonas - Brasil",
      phone: "(92) 0000-0000",
      email: "contato@cviam.com.br",
      website: "www.cviam.com.br",
    },
    whatsapp: {
      number: "5592000000000",
      message: "Olá! Gostaria de saber mais sobre os atendimentos do CVI Amazonas.",
      label: "Fale conosco no WhatsApp",
    },
    hours: {
      label: "Horário de Atendimento",
      schedule: "Segunda a Sexta, das 7h às 17h",
    },
  },

  footer: {
    brand: "CVI Amazonas",
    tagline:
      "Centro de Vida Independente do Amazonas — Investindo em pessoas desde 2004.",
    cnpj: "CNPJ: 07.555.086/0001-68",
    funding:
      "Os serviços ofertados gratuitamente pelo CVI-AM, CNPJ: 07.555.086/0001-68, são mantidos com Resurso Público da União, com repasse pelo Fundo Nacional de Saude ao Fundo Estadual de Saúde, formalizado entre a SES/AM e o CVI-AM por intermédio do instrumento de Termo de Fomento 001/2021 e 001/2024 – SES/AM-CVI-AM",
    copyright: `© ${new Date().getFullYear()} CVI - Centro de Vida Independente do Amazonas. Todos os direitos reservados.`,
    social: [
      { platform: "facebook", url: "#" },
      { platform: "instagram", url: "#" },
      { platform: "youtube", url: "#" },
    ],
  },
} as const;
