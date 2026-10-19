import { Product } from '../types';

/**
 * Contagens simuladas de aquisições / vendas para produtos oficiais.
 * Permite destacar produtos com alta aderência no ecossistema WikiWorldWeb.
 */
export const BASELINE_SALES_COUNTS: Record<string, number> = {
  prod_free_01: 3950, // Acesso Básico WikiWorldWeb (Líder geral de ativações)
  prod_paid_01: 1842, // WikiWorldWeb Maribondo (Líder em planos pagos)
  prod_free_02: 2410, // Comunidade WikiWorldWeb
  prod_paid_02: 1180, // Pacote de Ferramentas Pro
  prod_free_03: 980,  // WikiWorldWeb Mobile & Offline Sync
  prod_paid_04: 720,  // Acesso API Developer
  prod_paid_03: 340   // Consultoria Especializada
};

const STORAGE_KEY = 'wikiworldweb_sales_counts';

/**
 * Obtém contagens salvas localmente para persistir incrementos dinâmicos em tempo real
 */
function getStoredDeltas(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Incrementa a contagem de aquisições quando uma compra ou ativação é concluída
 */
export function recordProductSale(productId: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const deltas = getStoredDeltas();
    deltas[productId] = (deltas[productId] || 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deltas));
    // Dispara evento customizado para reatividade imediata na UI
    window.dispatchEvent(new CustomEvent('wiki_sale_recorded', { detail: { productId } }));
    return deltas[productId];
  } catch {
    return 0;
  }
}

/**
 * Retorna o número de aquisições simuladas para qualquer produto
 */
export function getProductSalesCount(product: Product): number {
  if (product.salesCount && product.salesCount > 0) {
    return product.salesCount;
  }
  const baseline = BASELINE_SALES_COUNTS[product.id];
  const deltas = getStoredDeltas();
  const added = deltas[product.id] || 0;

  if (baseline !== undefined) {
    return baseline + added;
  }

  // Fallback determinístico para novos produtos adicionados pelo Admin
  let seed = 0;
  for (let i = 0; i < product.id.length; i++) {
    seed = (seed * 31 + product.id.charCodeAt(i)) % 10000;
  }
  const fallback = 150 + (seed % 1200);
  return fallback + added;
}

/**
 * Formata contagem de vendas para exibição (ex.: 3.9k+, 1.8k+, 340)
 */
export function formatSalesCount(count: number): string {
  if (count >= 1000) {
    const k = (count / 1000).toFixed(1).replace('.0', '');
    return `${k}k+`;
  }
  return count.toLocaleString('pt-BR');
}

export interface SalesBadgeInfo {
  isTopSeller: boolean;
  rank: number;
  salesCount: number;
  formattedCount: string;
  badgeLabel: string;
  isCategoryLeader: boolean;
}

/**
 * Determina dinamicamente se o produto qualifica para o selo "Mais Vendidos"
 * baseado na ordenação relativa do catálogo e contagem de aquisições.
 */
export function getProductSalesBadge(product: Product, allProducts: Product[]): SalesBadgeInfo {
  const currentSales = getProductSalesCount(product);

  // Ordena todos os produtos por vendas decrescentes
  const sorted = [...allProducts].sort((a, b) => getProductSalesCount(b) - getProductSalesCount(a));
  const overallIndex = sorted.findIndex((p) => p.id === product.id);
  const rank = overallIndex !== -1 ? overallIndex + 1 : 999;

  // Verifica se é o mais vendido dentro da sua categoria
  const categoryProducts = allProducts
    .filter((p) => p.categoria === product.categoria)
    .sort((a, b) => getProductSalesCount(b) - getProductSalesCount(a));
  const isCategoryLeader = categoryProducts.length > 0 && categoryProducts[0].id === product.id;

  // Critério dinâmico para selo 'Mais Vendidos':
  // 1. Está no Top 3 geral do catálogo OU
  // 2. É o líder de aquisições da sua categoria com mais de 500 aquisições OU
  // 3. Possui mais de 1.000 aquisições simuladas OU
  // 4. Tem flag explícita popular: true
  const isTopSeller = rank <= 3 || (isCategoryLeader && currentSales >= 500) || currentSales >= 1000 || !!product.popular;

  let badgeLabel = 'Mais Vendido';
  if (rank === 1) {
    badgeLabel = '🔥 #1 Mais Vendido';
  } else if (rank === 2) {
    badgeLabel = '🔥 #2 Mais Vendido';
  } else if (rank === 3) {
    badgeLabel = '🔥 #3 Mais Vendido';
  } else if (isCategoryLeader) {
    badgeLabel = `🔥 Top ${product.categoria || 'Vendas'}`;
  } else {
    badgeLabel = '🔥 Mais Vendido';
  }

  return {
    isTopSeller,
    rank,
    salesCount: currentSales,
    formattedCount: formatSalesCount(currentSales),
    badgeLabel,
    isCategoryLeader
  };
}
