import React, { useState } from 'react';
import {
  PackageCheck,
  KeyRound,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Search,
  CheckCircle2,
  FileText,
  Code2,
  Download,
  Github
} from 'lucide-react';
import { Purchase, Product } from '../types';

interface MyProductsViewProps {
  purchases: Purchase[];
  allProducts: Product[];
  onExploreCatalog: () => void;
  onOpenReceipt: (purchase: Purchase) => void;
  onConfigureWiki?: (product: Product) => void;
}

export const MyProductsView: React.FC<MyProductsViewProps> = ({
  purchases,
  allProducts,
  onExploreCatalog,
  onOpenReceipt,
  onConfigureWiki
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const filteredPurchases = purchases.filter(
    (p) =>
      p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.productCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.activationKey && p.activationKey.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalSpent = purchases.reduce((sum, item) => sum + (item.productPrice || 0), 0);
  const freeItemsCount = purchases.filter((item) => item.isFree).length;
  const premiumItemsCount = purchases.filter((item) => !item.isFree).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
              Serviços Ativos
            </span>
            <p className="text-2xl font-extrabold text-[var(--text-main)]">{purchases.length}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
              Acessos Gratuitos
            </span>
            <p className="text-2xl font-extrabold text-teal-600 dark:text-teal-400">{freeItemsCount}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
              Licenças Pro &amp; Maribondo
            </span>
            <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{premiumItemsCount}</p>
          </div>
        </div>
      </div>

      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-main)]">
            Seus Produtos &amp; Licenças WikiWorldWeb
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Gerencie suas credenciais de ativação e acesse os recursos liberados.
          </p>
        </div>

        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-[var(--text-subtle)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar em meus produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-main)] placeholder-[var(--text-subtle)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Product List */}
      {purchases.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-subtle)] shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-card-subtle)] flex items-center justify-center mx-auto text-[var(--text-subtle)]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-[var(--text-main)]">
              Você ainda não possui produtos adquiridos
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Explore o catálogo WikiWorldWeb para adquirir acessos gratuitos ou assinar recursos
              Maribondo.
            </p>
          </div>
          <button
            onClick={onExploreCatalog}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            Explorar Catálogo de Produtos
          </button>
        </div>
      ) : filteredPurchases.length === 0 ? (
        <div className="text-center py-12 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] text-[var(--text-muted)] text-xs">
          Nenhum produto encontrado com o termo "{searchTerm}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPurchases.map((purchase) => {
            const prod = allProducts.find((p) => p.id === purchase.productId);
            const key = purchase.activationKey || 'WWW-ACTIVE-KEY-2026';

            return (
              <div
                key={purchase.id || purchase.productId}
                className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[var(--bg-card-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                      {purchase.productCategory || 'Geral'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Ativo
                    </span>
                  </div>

                  <h4 className="font-bold text-[var(--text-main)] text-base">{purchase.productName}</h4>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1">
                    {prod?.descricao || 'Serviço oficial integrado WikiWorldWeb.'}
                  </p>
                </div>

                {/* License Key Box */}
                <div className="p-3 rounded-xl bg-slate-900 text-white space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <KeyRound className="w-3 h-3 text-sky-400" /> Chave de Ativação
                    </span>
                    <span>Status: Vinculada</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-sky-300 tracking-wider truncate">
                      {key}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(key)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 transition-colors shrink-0"
                    >
                      {copiedKey === key ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedKey === key ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenReceipt(purchase)}
                      className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Comprovante
                    </button>

                    {purchase.productId === 'prod_free_01' && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {onConfigureWiki && (
                          <button
                            onClick={() => {
                              const prod = allProducts.find((p) => p.id === 'prod_free_01');
                              if (prod) onConfigureWiki(prod);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors shadow-sm"
                          >
                            <Code2 className="w-3 h-3 text-sky-200" />
                            <span>Configurar Wiki</span>
                          </button>
                        )}

                        <a
                          href="https://github.com/WazzimaGiygg/Wiki-alternative/archive/refs/heads/main.zip"
                          download="Wiki-alternative-main.zip"
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Baixar repositório completo .ZIP do GitHub"
                          className="px-2.5 py-1 rounded-lg bg-[var(--bg-card-subtle)] hover:bg-[var(--border-subtle)] text-[var(--text-main)] text-[11px] font-bold flex items-center gap-1 border border-[var(--border-subtle)] transition-colors shadow-xs"
                        >
                          <Download className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          <span>Baixar Projeto (.ZIP)</span>
                        </a>
                      </div>
                    )}
                  </div>

                  <a
                    href="https://wzzm-ce3fc.firebaseapp.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <span>Abrir na Wiki</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
