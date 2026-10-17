import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { Product, Purchase, UserProfile, AppNotification, ExtensionConfig } from './types';
import { DEFAULT_PRODUCTS } from './data/defaultProducts';

export const firebaseConfig = {
  apiKey: "AIzaSyB9GkSqTIZ0kbVsba_WOdQeVAETrF9qna0",
  authDomain: "wzzm-ce3fc.firebaseapp.com",
  projectId: "wzzm-ce3fc",
  storageBucket: "wzzm-ce3fc.appspot.com",
  messagingSenderId: "249427877153",
  appId: "1:249427877153:web:0e4297294794a5aadeb260"
};

// Initialize Firebase safely
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const ADMIN_UIDS = [
  'sZxfMuOBPbXdR8nttVPXIN8QOOl1',
  '6aPqWVh8JVYL5NqEb78iDGPD7dH3'
];

export const EXTENSION_MANAGER_EMAILS = [
  'pedrohenriquecardonaperes@gmail.com',
  'wazzimagiygg@gmail.com'
];

/**
 * Garante uma sessão de autenticação ativa no Firebase para permitir
 * operações no Firestore sob as regras de segurança do projeto.
 */
export async function ensureAuthSession(): Promise<User | null> {
  if (auth.currentUser) return auth.currentUser;
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    console.warn('Conexão de autenticação Firebase:', err);
    return null;
  }
}

/**
 * Verifica se o e-mail possui permissão de Burocrata Master para gerenciar extensões
 */
export function isExtensionManager(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  return EXTENSION_MANAGER_EMAILS.includes(clean);
}

/**
 * Detecta se a aplicação está sendo executada dentro do Google AI Studio
 */
export function isGoogleAiStudio(): boolean {
  if (typeof window === 'undefined') return true;
  const hostname = window.location.hostname;
  const href = window.location.href;
  return (
    hostname.includes('run.app') ||
    hostname.includes('aistudio') ||
    hostname.includes('localhost') ||
    hostname.includes('127.0.0.1') ||
    href.includes('ais-dev') ||
    href.includes('ais-pre') ||
    window.location.search.includes('aistudio=true')
  );
}

/**
 * Extensões Padrão para inicialização no banco de dados Firestore
 */
export const DEFAULT_EXTENSIONS: ExtensionConfig[] = [
  {
    id: 'ext_servicos_disponibilidade',
    nome: 'Controlador de Disponibilidade de Serviços',
    descricao: 'Extensão Primária: Define quais produtos e serviços do catálogo estão habilitados ou desabilitados para visualização e aquisição.',
    ativo: true,
    versao: '1.2.0',
    obrigatoria: true,
    categoria: 'catalogo',
    autor: 'WikiWorldWeb Core',
    sincronizadoEm: new Date().toISOString(),
    servicosDisponiveis: {
      prod_free_01: true,
      prod_free_02: true,
      prod_free_03: true,
      prod_paid_01: true,
      prod_paid_02: true,
      prod_paid_03: true,
      prod_paid_04: true
    },
    modoManutencaoGeral: false
  },
  {
    id: 'ext_seguranca_governance',
    nome: 'Validador de Integridade & Burocratas',
    descricao: 'Verifica assinaturas criptográficas dos administradores, autenticação Firebase e previne adulterações de regras.',
    ativo: true,
    versao: '2.0.4',
    obrigatoria: true,
    categoria: 'seguranca',
    autor: 'Equipe de Segurança',
    sincronizadoEm: new Date().toISOString()
  },
  {
    id: 'ext_wiki_alternative_repo',
    nome: 'Módulo de Injeção Wiki-alternative',
    descricao: 'Integra o repositório WazzimaGiygg/Wiki-alternative com compilação e download dinâmico do código modificado.',
    ativo: true,
    versao: '1.1.8',
    obrigatoria: true,
    categoria: 'integracao',
    autor: 'WazzimaGiygg',
    sincronizadoEm: new Date().toISOString()
  },
  {
    id: 'ext_checkout_pix_gateways',
    nome: 'Gateway de Pagamentos PIX & Cartões',
    descricao: 'Processador de checkout e conciliação em nuvem para serviços e assinaturas WikiWorldWeb.',
    ativo: true,
    versao: '1.4.2',
    obrigatoria: true,
    categoria: 'catalogo',
    autor: 'Finanças WikiWorldWeb',
    sincronizadoEm: new Date().toISOString()
  },
  {
    id: 'ext_auditoria_logs',
    nome: 'Monitor de Auditoria & Logs de Governança',
    descricao: 'Rastreia eventos administrativos, alterações em permissões e acessos à infraestrutura em tempo real.',
    ativo: true,
    versao: '1.0.5',
    obrigatoria: true,
    categoria: 'seguranca',
    autor: 'Governança Wiki',
    sincronizadoEm: new Date().toISOString()
  },
  {
    id: 'ext_cache_pwa_offline',
    nome: 'Sincronizador PWA & Cache Offline',
    descricao: 'Gerencia persistência em IndexedDB e sincronização em segundo plano com Firestore quando online.',
    ativo: true,
    versao: '1.3.1',
    obrigatoria: false,
    categoria: 'sistema',
    autor: 'Sistemas Distribuídos',
    sincronizadoEm: new Date().toISOString()
  }
];

// ============================================================
// SINCRONIZAÇÃO DE USUÁRIOS COM O BANCO DE DADOS FIREBASE
// ============================================================

/**
 * Registra ou sincroniza o perfil do usuário diretamente com o Firestore
 */
export async function syncUserProfile(
  user: User | { uid: string; email?: string | null; displayName?: string | null; photoURL?: string | null; isAdmin?: boolean }
): Promise<UserProfile> {
  const currentAuth = await ensureAuthSession();
  const uid = user.uid;
  const email = (user.email || '').toLowerCase().trim();
  const currentUid = currentAuth?.uid || uid;

  const isUserAdmin = Boolean(
    isExtensionManager(email) ||
    email === 'mafersao1100@gmail.com' ||
    ADMIN_UIDS.includes(uid) ||
    (user as any).isAdmin
  );

  let existingData: Partial<UserProfile> = {};

  try {
    const q = query(
      collection(db, 'articles'),
      where('category', '==', 'user_profile_sync')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docs = snap.docs.map((d) => d.data());
      const match = docs.find((d) => d.email === email || d.uid === uid);
      if (match && match.userProfile) {
        existingData = match.userProfile;
      }
    }
  } catch (err) {
    console.warn('Consulta a perfis em Firestore:', err);
  }

  const userData: UserProfile = {
    uid,
    email: email,
    name: user.displayName || existingData.name || (email ? email.split('@')[0] : 'Usuário WikiWorldWeb'),
    profilePictureUrl: user.photoURL || existingData.profilePictureUrl || '',
    isAdmin: isUserAdmin || Boolean(existingData.isAdmin),
    isBanned: existingData.isBanned || false,
    createdAt: existingData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };

  try {
    await addDoc(collection(db, 'articles'), {
      title: `Perfil WikiWorldWeb - ${userData.name}`,
      category: 'user_profile_sync',
      uid: uid,
      email: email,
      authorId: currentUid,
      userId: currentUid,
      userProfile: userData,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Erro ao salvar perfil em Firestore:', err);
  }

  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, userData, { merge: true });
  } catch {
    // Silently continue if users collection has restricted security rules
  }

  return userData;
}

// ============================================================
// SINCRONIZAÇÃO DE PRODUTOS E SERVIÇOS COM O BANCO DE DADOS FIREBASE
// ============================================================

/**
 * Carrega a lista real de produtos e serviços presentes no banco de dados Firestore
 */
export async function fetchProducts(): Promise<Product[]> {
  const currentAuth = await ensureAuthSession();

  try {
    const q = query(
      collection(db, 'articles'),
      where('category', '==', 'sistema_servicos')
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      // Ordenar pelos documentos mais recentes
      const docs = snap.docs.map((d) => d.data());
      docs.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
      const latest = docs[0];
      if (Array.isArray(latest.products) && latest.products.length > 0) {
        return (latest.products as Product[]).sort((a, b) => a.preco - b.preco);
      }
    }

    // Inicializar no banco se ainda não existir
    const currentUid = currentAuth?.uid || 'sZxfMuOBPbXdR8nttVPXIN8QOOl1';
    await addDoc(collection(db, 'articles'), {
      title: 'WikiWorldWeb - Serviços e Produtos Oficiais',
      category: 'sistema_servicos',
      authorId: currentUid,
      userId: currentUid,
      products: DEFAULT_PRODUCTS,
      updatedAt: new Date().toISOString(),
      updatedBy: 'system'
    });

    return DEFAULT_PRODUCTS;
  } catch (err) {
    console.warn('Aviso ao carregar produtos do Firestore:', err);
    return DEFAULT_PRODUCTS;
  }
}

/**
 * Escuta atualizações de produtos em tempo real via Firestore
 */
export function subscribeToProducts(callback: (products: Product[]) => void) {
  try {
    const q = query(
      collection(db, 'articles'),
      where('category', '==', 'sistema_servicos')
    );
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs.map((d) => d.data());
          docs.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
          const latest = docs[0];
          if (Array.isArray(latest.products)) {
            const list = (latest.products as Product[]).sort((a, b) => a.preco - b.preco);
            callback(list);
            return;
          }
        }
        callback(DEFAULT_PRODUCTS);
      },
      (error) => {
        console.warn('Firestore snapshot error on products:', error);
      }
    );
  } catch (err) {
    console.warn('Não foi possível assinar produtos em tempo real:', err);
    return () => {};
  }
}

/**
 * Cria ou atualiza um produto no banco de dados Firestore
 */
export async function createProductInDb(product: Omit<Product, 'id'>): Promise<string> {
  const currentAuth = await ensureAuthSession();
  const currentUid = currentAuth?.uid || 'sZxfMuOBPbXdR8nttVPXIN8QOOl1';
  const newId = `prod_${Date.now()}`;
  const newProduct: Product = { ...product, id: newId };

  try {
    const currentList = await fetchProducts();
    const updated = [...currentList, newProduct];

    await addDoc(collection(db, 'articles'), {
      title: 'WikiWorldWeb - Serviços e Produtos Oficiais',
      category: 'sistema_servicos',
      authorId: currentUid,
      userId: currentUid,
      products: updated,
      updatedAt: new Date().toISOString()
    });

    return newId;
  } catch (err) {
    console.error('Erro ao adicionar produto no Firestore:', err);
    throw err;
  }
}

// ============================================================
// SINCRONIZAÇÃO DE EXTENSÕES COM O BANCO DE DADOS FIREBASE
// ============================================================

/**
 * Carrega a lista real de extensões salvas no Firestore.
 */
export async function fetchCloudExtensions(): Promise<{
  extensions: ExtensionConfig[];
  syncedWithCloud: boolean;
}> {
  const currentAuth = await ensureAuthSession();

  try {
    const q = query(
      collection(db, 'articles'),
      where('category', '==', 'sistema_extensoes')
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const docs = snap.docs.map((d) => d.data());
      docs.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
      const latest = docs[0];
      if (Array.isArray(latest.extensions) && latest.extensions.length > 0) {
        return {
          extensions: latest.extensions as ExtensionConfig[],
          syncedWithCloud: true
        };
      }
    }

    // Inicializar no banco se não estiver presente
    const currentUid = currentAuth?.uid || 'sZxfMuOBPbXdR8nttVPXIN8QOOl1';
    await addDoc(collection(db, 'articles'), {
      title: 'WikiWorldWeb - Extensões em Nuvem',
      category: 'sistema_extensoes',
      authorId: currentUid,
      userId: currentUid,
      extensions: DEFAULT_EXTENSIONS,
      updatedAt: new Date().toISOString(),
      updatedBy: 'system'
    });

    return {
      extensions: DEFAULT_EXTENSIONS,
      syncedWithCloud: true
    };
  } catch (err) {
    console.warn('Erro ao carregar extensões da nuvem Firestore:', err);
    return {
      extensions: DEFAULT_EXTENSIONS,
      syncedWithCloud: false
    };
  }
}

/**
 * Escuta atualizações de extensões em tempo real via Firestore
 */
export function subscribeToCloudExtensions(
  callback: (exts: ExtensionConfig[], synced: boolean) => void
) {
  try {
    const q = query(
      collection(db, 'articles'),
      where('category', '==', 'sistema_extensoes')
    );
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs.map((d) => d.data());
          docs.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
          const latest = docs[0];
          if (Array.isArray(latest.extensions)) {
            callback(latest.extensions as ExtensionConfig[], true);
            return;
          }
        }
        callback(DEFAULT_EXTENSIONS, true);
      },
      (error) => {
        console.warn('Firestore snapshot error on extensions:', error);
        callback(DEFAULT_EXTENSIONS, false);
      }
    );
  } catch (err) {
    console.warn('Could not subscribe to cloud extensions:', err);
    callback(DEFAULT_EXTENSIONS, false);
    return () => {};
  }
}

/**
 * Atualiza o status de uma extensão no Firebase
 * REQUISITO DE SEGURANÇA: Somente pedrohenriquecardonaperes@gmail.com e wazzimagiygg@gmail.com
 */
export async function updateExtensionInCloud(
  extension: ExtensionConfig,
  authorEmail?: string | null
): Promise<{ success: boolean; error?: string }> {
  if (!isExtensionManager(authorEmail)) {
    return {
      success: false,
      error: 'Acesso negado: Somente pedrohenriquecardonaperes@gmail.com ou wazzimagiygg@gmail.com têm permissão para alterar extensões no Firebase.'
    };
  }

  const currentAuth = await ensureAuthSession();
  const currentUid = currentAuth?.uid || 'sZxfMuOBPbXdR8nttVPXIN8QOOl1';

  try {
    const currentRes = await fetchCloudExtensions();
    const currentList = currentRes.extensions;

    const updatedData: ExtensionConfig = {
      ...extension,
      sincronizadoEm: new Date().toISOString(),
      modificadoPor: authorEmail || 'Burocrata Master'
    };

    const exists = currentList.some((e) => e.id === extension.id);
    const updatedList = exists
      ? currentList.map((e) => (e.id === extension.id ? updatedData : e))
      : [...currentList, updatedData];

    await addDoc(collection(db, 'articles'), {
      title: 'WikiWorldWeb - Extensões em Nuvem',
      category: 'sistema_extensoes',
      authorId: currentUid,
      userId: currentUid,
      extensions: updatedList,
      updatedAt: new Date().toISOString(),
      updatedBy: authorEmail || 'Burocrata Master'
    });

    return { success: true };
  } catch (err: any) {
    console.error('Erro ao salvar extensão no Firestore:', err);
    return { success: false, error: err.message || 'Erro ao comunicar com o Firestore' };
  }
}

// ============================================================
// COMPRAS E LICENÇAS SINCRONIZADAS COM O BANCO DE DADOS
// ============================================================

export function generateLicenseKey(prefix = 'WWW'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segment = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${prefix}-${segment(4)}-${segment(4)}-${segment(4)}`;
}

/**
 * Carrega compras do usuário a partir do Firestore
 */
export async function fetchUserPurchases(userId: string, userEmail?: string): Promise<Purchase[]> {
  await ensureAuthSession();

  try {
    const q = query(
      collection(db, 'articles'),
      where('category', '==', 'compras_registro')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const cleanEmail = (userEmail || '').toLowerCase().trim();
      const purchases: Purchase[] = [];
      snap.docs.forEach((d) => {
        const item = d.data()?.purchase as Purchase | undefined;
        if (item) {
          if (item.userId === userId || (cleanEmail && item.userEmail?.toLowerCase() === cleanEmail)) {
            purchases.push({ ...item, id: d.id });
          }
        }
      });
      if (purchases.length > 0) return purchases;
    }
  } catch (err) {
    console.warn('Consulta a compras em Firestore:', err);
  }

  // Backup em localStorage
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(`wiki_purchases_${userId}`);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return [];
      }
    }
  }
  return [];
}

/**
 * Registra compra no Firestore database
 */
export async function registerPurchase(
  user: UserProfile,
  product: Product,
  paymentMethod: 'gratuito' | 'pix' | 'cartao' | 'boleto'
): Promise<Purchase> {
  const currentAuth = await ensureAuthSession();
  const currentUid = currentAuth?.uid || user.uid;

  const isFree = product.preco === 0 || product.tipo === 'gratuito';
  const licenseKey = generateLicenseKey((product.categoria || 'WWW').substring(0, 3).toUpperCase());

  const purchaseData: Purchase = {
    id: `compra_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: user.uid,
    userEmail: user.email,
    userName: user.name,
    productId: product.id,
    productName: product.nome,
    productPrice: product.preco || 0,
    productCategory: product.categoria || 'Geral',
    isFree: isFree,
    status: isFree || paymentMethod === 'pix' || paymentMethod === 'cartao' ? 'concluido' : 'pendente_pagamento',
    paymentMethod: paymentMethod,
    activationKey: licenseKey,
    createdAt: new Date().toISOString()
  };

  try {
    await addDoc(collection(db, 'articles'), {
      title: `Compra WikiWorldWeb - ${product.nome}`,
      category: 'compras_registro',
      authorId: currentUid,
      userId: currentUid,
      userEmail: user.email,
      purchase: purchaseData,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Backup local de compra devido a Firestore:', err);
  }

  // Backup local de garantia no navegador
  if (typeof window !== 'undefined') {
    const storageKey = `wiki_purchases_${user.uid}`;
    const cur = JSON.parse(localStorage.getItem(storageKey) || '[]');
    cur.push(purchaseData);
    localStorage.setItem(storageKey, JSON.stringify(cur));
  }

  return purchaseData;
}

/**
 * Carrega todas as compras registradas (para o painel de administração)
 */
export async function fetchAllPurchases(): Promise<Purchase[]> {
  await ensureAuthSession();
  try {
    const q = query(
      collection(db, 'articles'),
      where('category', '==', 'compras_registro')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const list: Purchase[] = [];
      snap.docs.forEach((d) => {
        const item = d.data()?.purchase as Purchase | undefined;
        if (item) list.push({ ...item, id: d.id });
      });
      return list;
    }
  } catch (err) {
    console.warn('Erro ao buscar todas as compras:', err);
  }
  return [];
}

/**
 * Notificações do usuário
 */
export async function fetchNotifications(userId: string): Promise<AppNotification[]> {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(`wiki_notifs_${userId}`);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return [];
      }
    }
  }
  return [];
}
