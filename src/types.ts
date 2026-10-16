export interface Product {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  tipo: 'gratuito' | 'pago';
  categoria: string;
  icone: string;
  ativo: boolean;
  features?: string[];
  destaque?: boolean;
  popular?: boolean;
  tempoAcesso?: string; // e.g. "Vitalício", "1 Ano", "Mensal"
}

export interface Purchase {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  productId: string;
  productName: string;
  productPrice: number;
  productCategory: string;
  isFree: boolean;
  status: 'concluido' | 'pendente_pagamento' | 'aprovado' | 'cancelado';
  paymentMethod: 'gratuito' | 'pix' | 'cartao' | 'boleto' | 'a_definir';
  activationKey?: string;
  timestamp?: any;
  createdAt?: any;
}

export interface AppNotification {
  id?: string;
  userId: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  timestamp?: any;
  tipo?: 'produto' | 'sistema' | 'pagamento';
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  profilePictureUrl?: string;
  isAdmin?: boolean;
  isBanned?: boolean;
  createdAt?: any;
  updatedAt?: any;
  lastLoginAt?: any;
}

export interface ExtensionConfig {
  id: string;
  nome: string;
  descricao: string;
  ativo: boolean;
  versao: string;
  obrigatoria: boolean;
  sincronizadoEm?: string;
  // Para a primeira extensão: controlador de quais serviços estão disponíveis
  servicosDisponiveis?: Record<string, boolean>;
  modoManutencaoGeral?: boolean;
}

