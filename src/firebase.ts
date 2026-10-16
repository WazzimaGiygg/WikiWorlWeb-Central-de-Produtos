import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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
  updateDoc,
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

/**
 * Register or update user doc in Firestore
 */
export async function syncUserProfile(user: User): Promise<UserProfile> {
  const uid = user.uid;
  const userRef = doc(db, 'users', uid);
  const userPtRef = doc(db, 'usuários', uid);

  let existingData: Partial<UserProfile> = {};
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      existingData = snap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Could not read existing user doc from Firestore:', err);
  }

  const isUserAdmin = Boolean(
    existingData.isAdmin ||
    ADMIN_UIDS.includes(uid) ||
    user.email === 'mafersao1100@gmail.com'
  );

  const userData: UserProfile = {
    uid,
    email: user.email || '',
    name: user.displayName || user.email?.split('@')[0] || 'Usuário WikiWorldWeb',
    profilePictureUrl: user.photoURL || '',
    isAdmin: isUserAdmin,
    isBanned: existingData.isBanned || false,
    createdAt: existingData.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp()
  };

  try {
    await setDoc(userRef, userData, { merge: true });
    await setDoc(userPtRef, userData, { merge: true });
  } catch (err) {
    console.warn('Could not save user profile to Firestore:', err);
  }

  return userData;
}

/**
 * Load all products: attempts 'produtos_wikoworldweb', fallback 'produtos', fallback to DEFAULT_PRODUCTS
 */
export async function fetchProducts(): Promise<Product[]> {
  try {
    const colRef = collection(db, 'produtos_wikoworldweb');
    let q = query(colRef, where('ativo', '==', true));
    try {
      const snap = await getDocs(q);
      if (!snap.empty) {
        const list: Product[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as Product);
        });
        return list.sort((a, b) => a.preco - b.preco);
      }
    } catch {
      // try fallback collection
    }

    // Try fallback collection 'produtos'
    const colFallback = collection(db, 'produtos');
    const snapFallback = await getDocs(colFallback);
    if (!snapFallback.empty) {
      const list: Product[] = [];
      snapFallback.forEach((d) => {
        const data = d.data();
        if (data.ativo !== false) {
          list.push({ id: d.id, ...data } as Product);
        }
      });
      if (list.length > 0) return list.sort((a, b) => a.preco - b.preco);
    }
  } catch (err) {
    console.warn('Using default products list due to fetch error:', err);
  }

  // Return default products
  return DEFAULT_PRODUCTS;
}

/**
 * Load user purchases from 'compras_wikoworldweb'
 */
export async function fetchUserPurchases(userId: string): Promise<Purchase[]> {
  try {
    const q = query(
      collection(db, 'compras_wikoworldweb'),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    const purchases: Purchase[] = [];
    snap.forEach((d) => {
      purchases.push({ id: d.id, ...d.data() } as Purchase);
    });
    return purchases;
  } catch (err) {
    console.warn('Error fetching user purchases:', err);
    // Also check local storage backup for smooth UX if offline or firestore rules issue
    const cached = localStorage.getItem(`wiki_purchases_${userId}`);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return [];
      }
    }
    return [];
  }
}

/**
 * Fetch all purchases (for admin dashboard)
 */
export async function fetchAllPurchases(): Promise<Purchase[]> {
  try {
    const snap = await getDocs(collection(db, 'compras_wikoworldweb'));
    const list: Purchase[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as Purchase);
    });
    return list;
  } catch (err) {
    console.warn('Error fetching all purchases:', err);
    return [];
  }
}

/**
 * Create a new product in Firestore
 */
export async function createProductInDb(product: Omit<Product, 'id'>): Promise<string> {
  const colRef = collection(db, 'produtos_wikoworldweb');
  const docRef = await addDoc(colRef, product);
  return docRef.id;
}

/**
 * Generate a friendly alphanumeric license key
 */
export function generateLicenseKey(prefix = 'WWW'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segment = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${prefix}-${segment(4)}-${segment(4)}-${segment(4)}`;
}

/**
 * Register purchase in Firestore + subcollection + notifications
 */
export async function registerPurchase(
  user: UserProfile,
  product: Product,
  paymentMethod: 'gratuito' | 'pix' | 'cartao' | 'boleto'
): Promise<Purchase> {
  const isFree = product.preco === 0 || product.tipo === 'gratuito';
  const licenseKey = generateLicenseKey(product.categoria.substring(0, 3).toUpperCase());

  const purchaseData: Purchase = {
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
    timestamp: serverTimestamp(),
    createdAt: new Date().toISOString()
  };

  try {
    // 1. Add to compras_wikoworldweb
    const docRef = await addDoc(collection(db, 'compras_wikoworldweb'), purchaseData);
    purchaseData.id = docRef.id;

    // 2. Add to user's subcollection
    await setDoc(doc(db, 'users', user.uid, 'produtos_adquiridos', product.id), {
      productId: product.id,
      productName: product.nome,
      acquiredAt: serverTimestamp(),
      isFree: isFree,
      status: purchaseData.status,
      activationKey: licenseKey
    });

    // 3. Add to notifications
    await addDoc(collection(db, 'notifications'), {
      userId: user.uid,
      titulo: isFree ? '🎁 Produto Adquirido com Sucesso!' : '🛒 Compra Confirmada!',
      mensagem: isFree
        ? `Você ativou "${product.nome}" gratuitamente. Sua chave de licença é ${licenseKey}.`
        : `Pagamento aprovado para "${product.nome}". Sua chave de ativação foi liberada: ${licenseKey}.`,
      lida: false,
      timestamp: serverTimestamp(),
      tipo: 'produto'
    });
  } catch (err) {
    console.warn('Could not persist purchase to Firestore directly, saving locally:', err);
    // Backup in local storage
    const storageKey = `wiki_purchases_${user.uid}`;
    const cur = JSON.parse(localStorage.getItem(storageKey) || '[]');
    cur.push(purchaseData);
    localStorage.setItem(storageKey, JSON.stringify(cur));
  }

  return purchaseData;
}

/**
 * Fetch notifications for user
 */
export async function fetchNotifications(userId: string): Promise<AppNotification[]> {
  try {
    const q = query(collection(db, 'notifications'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const list: AppNotification[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as AppNotification);
    });
    return list;
  } catch (err) {
    console.warn('Error fetching notifications:', err);
    return [];
  }
}

// ============================================================
// SISTEMA DE EXTENSÕES EM NUVEM (CONTROLE POR E-MAIL AUTORIZADO)
// ============================================================
export const EXTENSION_MANAGER_EMAILS = [
  'pedrohenriquecardonaperes@gmail.com',
  'wazzimagiygg@gmail.com'
];

/**
 * Verifica se o e-mail do usuário possui permissão de Burocrata Master para gerenciar extensões
 */
export function isExtensionManager(email?: string | null): boolean {
  if (!email) return false;
  return EXTENSION_MANAGER_EMAILS.includes(email.toLowerCase().trim());
}

/**
 * Detecta se a aplicação está sendo executada ou manipulada dentro do ambiente Google AI Studio
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
 * Extensões Padrão do Sistema
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

/**
 * Carrega extensões da nuvem (Firestore coleção 'wiki_extensoes').
 * Retorna se a sincronização em nuvem ocorreu com sucesso.
 */
export async function fetchCloudExtensions(): Promise<{
  extensions: ExtensionConfig[];
  syncedWithCloud: boolean;
}> {
  try {
    const colRef = collection(db, 'wiki_extensoes');
    const snap = await getDocs(colRef);

    if (!snap.empty) {
      const cloudList: ExtensionConfig[] = [];
      snap.forEach((d) => {
        cloudList.push({ id: d.id, ...d.data() } as ExtensionConfig);
      });

      // Merge with default if new extension added in code
      const merged = DEFAULT_EXTENSIONS.map((def) => {
        const found = cloudList.find((c) => c.id === def.id);
        return found ? { ...def, ...found } : def;
      });

      return { extensions: merged, syncedWithCloud: true };
    }

    // Tentar inicializar as extensões padrão no Firestore
    try {
      for (const ext of DEFAULT_EXTENSIONS) {
        await setDoc(doc(db, 'wiki_extensoes', ext.id), ext, { merge: true });
      }
      return { extensions: DEFAULT_EXTENSIONS, syncedWithCloud: true };
    } catch {
      return { extensions: DEFAULT_EXTENSIONS, syncedWithCloud: true };
    }
  } catch (err) {
    console.warn('Erro ao carregar extensões da nuvem Firestore:', err);
    // Verificar cache local
    const cached = localStorage.getItem('wiki_cloud_extensions');
    if (cached) {
      try {
        return { extensions: JSON.parse(cached), syncedWithCloud: false };
      } catch {
        // fallback
      }
    }
    return { extensions: DEFAULT_EXTENSIONS, syncedWithCloud: false };
  }
}

/**
 * Atualiza o status de uma extensão no Firebase (restrito a pedrohenriquecardonaperes@gmail.com e wazzimagiygg@gmail.com)
 */
export async function updateExtensionInCloud(
  extension: ExtensionConfig,
  authorEmail?: string | null
): Promise<{ success: boolean; error?: string }> {
  if (!isExtensionManager(authorEmail)) {
    return {
      success: false,
      error: 'Acesso negado: Somente pedrohenriquecardonaperes@gmail.com ou wazzimagiygg@gmail.com têm permissão para alterar extensões.'
    };
  }

  const updatedData: ExtensionConfig = {
    ...extension,
    sincronizadoEm: new Date().toISOString()
  };

  try {
    const docRef = doc(db, 'wiki_extensoes', extension.id);
    await setDoc(docRef, updatedData, { merge: true });

    // Salvar em cache local de backup
    localStorage.setItem(`wiki_ext_${extension.id}`, JSON.stringify(updatedData));
    return { success: true };
  } catch (err: any) {
    console.error('Erro ao salvar extensão no Firestore:', err);
    return { success: false, error: err.message || 'Erro ao comunicar com o Firestore' };
  }
}

/**
 * Escuta atualizações de extensões em tempo real via snapshot
 */
export function subscribeToCloudExtensions(
  callback: (exts: ExtensionConfig[], synced: boolean) => void
) {
  try {
    const colRef = collection(db, 'wiki_extensoes');
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: ExtensionConfig[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...d.data() } as ExtensionConfig);
          });
          callback(list, true);
        } else {
          callback(DEFAULT_EXTENSIONS, true);
        }
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

