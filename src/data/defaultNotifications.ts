import { AppNotification } from '../types';

export const SYSTEM_UPDATES: AppNotification[] = [
  {
    id: 'update_zip_download',
    userId: 'global',
    titulo: 'Download do Projeto .ZIP Liberado',
    mensagem: 'Adicionada opção de download do código completo do repositório Wiki-alternative (.ZIP) com deploy simplificado.',
    lida: false,
    timestamp: new Date().toISOString(),
    tipo: 'sistema'
  },
  {
    id: 'update_theme_selector',
    userId: 'global',
    titulo: 'Modo Escuro & Seletor de Tema',
    mensagem: 'Novo seletor de tema claro/escuro persistente com suporte a preferências de sistema e variáveis Tailwind.',
    lida: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    tipo: 'sistema'
  },
  {
    id: 'update_firebase_sync',
    userId: 'global',
    titulo: 'Sincronização Nuvem Firestore 2.4',
    mensagem: 'Módulos de catálogo e governança de extensões integrados ao banco de dados oficial em tempo real.',
    lida: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    tipo: 'sistema'
  },
  {
    id: 'update_maribondo_licenses',
    userId: 'global',
    titulo: 'Ativação Instantânea com Licenças',
    mensagem: 'Receba comprovante digital com hash de chave de ativação para todos os serviços e planos Maribondo.',
    lida: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    tipo: 'produto'
  },
  {
    id: 'update_governance_rules',
    userId: 'global',
    titulo: 'Controle de Burocratas & Extensões',
    mensagem: 'Políticas de segurança ativas para contas com autorização de governança e controle de disponibilidade.',
    lida: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    tipo: 'sistema'
  }
];
