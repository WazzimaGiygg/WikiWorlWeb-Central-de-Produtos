import { Product } from '../types';

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod_free_01',
    nome: 'Acesso Básico WikiWorldWeb',
    descricao: 'Acesso completo à wiki pública com gerador/configurador do repositório Wiki-alternative (definir Burocrata, Firebase e baixar código modificado).',
    preco: 0,
    tipo: 'gratuito',
    categoria: 'Acesso',
    icone: 'Code',
    ativo: true,
    features: [
      'Configurador do repositório Wiki-alternative (WazzimaGiygg)',
      'Definição de Burocrata por E-mail Google ou UID',
      'Injeção personalizada de configurações Firebase',
      'Download do arquivo index.html pronto para deploy'
    ],
    tempoAcesso: 'Acesso Vitalício',
    destaque: true
  },
  {
    id: 'prod_free_02',
    nome: 'Comunidade WikiWorldWeb',
    descricao: 'Participe da comunidade oficial, comente, compartilhe sugestões e colabore com outros editores.',
    preco: 0,
    tipo: 'gratuito',
    categoria: 'Comunidade',
    icone: 'Users',
    ativo: true,
    features: [
      'Acesso ao fórum e canais de discussão',
      'Criação de tópicos e votação comunitária',
      'Badge de Membro Comunitário verificado',
      'Notificações de atualizações em tempo real'
    ],
    tempoAcesso: 'Acesso Vitalício'
  },
  {
    id: 'prod_free_03',
    nome: 'WikiWorldWeb Mobile & Offline Sync',
    descricao: 'Módulo de sincronização offline para continuar lendo artigos sem conexão com a internet.',
    preco: 0,
    tipo: 'gratuito',
    categoria: 'Acesso',
    icone: 'Smartphone',
    ativo: true,
    features: [
      'Cache inteligente de até 500 páginas',
      'Modo economia de dados',
      'Sincronização em segundo plano'
    ],
    tempoAcesso: 'Acesso Vitalício'
  },
  {
    id: 'prod_paid_01',
    nome: 'WikiWorldWeb Maribondo',
    descricao: 'Acesso Maribondo com conteúdo exclusivo, sem nenhum anúncio, suporte prioritário e recursos antecipados.',
    preco: 29.90,
    tipo: 'pago',
    categoria: 'Assinatura',
    icone: 'Sparkles',
    ativo: true,
    popular: true,
    destaque: true,
    features: [
      'Navegação 100% livre de publicidade',
      'Artigos e dossiês técnicos exclusivos',
      'Exportação em massa (Markdown, EPUB, PDF HD)',
      'Suporte prioritário via WhatsApp / E-mail'
    ],
    tempoAcesso: 'Assinatura Mensal'
  },
  {
    id: 'prod_paid_02',
    nome: 'Pacote de Ferramentas Pro',
    descricao: 'Conjunto de ferramentas avançadas para criadores, pesquisadores e edição colaborativa de conteúdo.',
    preco: 49.90,
    tipo: 'pago',
    categoria: 'Ferramentas',
    icone: 'Wrench',
    ativo: true,
    features: [
      'Editor visual rico com suporte a diagramas Mermaid e LaTeX',
      'Histórico de versões ilimitado com diff visual',
      'Exportação de dados analíticos em CSV/JSON',
      'Validador de referências e links quebrados'
    ],
    tempoAcesso: 'Licença Anual'
  },
  {
    id: 'prod_paid_03',
    nome: 'Consultoria Especializada',
    descricao: 'Sessão individual de 1 hora com um especialista sênior da WikiWorldWeb para estruturação e curadoria.',
    preco: 99.90,
    tipo: 'pago',
    categoria: 'Serviço',
    icone: 'Headphones',
    ativo: true,
    features: [
      '1 hora de mentoria 1-a-1 via Google Meet',
      'Auditoria completa da estrutura de documentação',
      'Plano de ação e boas práticas personalizadas',
      'Relatório de diagnóstico pós-sessão'
    ],
    tempoAcesso: 'Sessão Agendada'
  },
  {
    id: 'prod_paid_04',
    nome: 'Acesso API & Webhooks Developer',
    descricao: 'Integre a base de conhecimento WikiWorldWeb diretamente em suas aplicações via REST API de alta velocidade.',
    preco: 79.90,
    tipo: 'pago',
    categoria: 'Ferramentas',
    icone: 'Code',
    ativo: true,
    features: [
      'Token de API com 100.000 requisições/mês',
      'Webhooks para eventos de publicação em tempo real',
      'SLA de 99.9% com suporte técnico para devs',
      'Documentação Swagger interativa'
    ],
    tempoAcesso: 'Plano Anual'
  }
];
