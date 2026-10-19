import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  X,
  PlusCircle,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Tag,
  DollarSign
} from 'lucide-react';
import { Product, Purchase } from '../types';
import { createProductInDb, fetchAllPurchases } from '../firebase';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  onProductCreated
}) => {
  if (!isOpen) return null;

  const [tab, setTab] = useState<'create' | 'orders'>('create');
  const [allOrders, setAllOrders] = useState<Purchase[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Form states
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('0');
  const [categoria, setCategoria] = useState('Ferramentas');
  const [icone, setIcone] = useState('Sparkles');
  const [tempoAcesso, setTempoAcesso] = useState('Acesso Vitalício');
  const [featuresStr, setFeaturesStr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (tab === 'orders') {
      loadOrders();
    }
  }, [tab]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    const data = await fetchAllPurchases();
    setAllOrders(data);
    setLoadingOrders(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');

    try {
      const priceNum = parseFloat(preco.replace(',', '.')) || 0;
      const features = featuresStr
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const newProd: Omit<Product, 'id'> = {
        nome,
        descricao,
        preco: priceNum,
        tipo: priceNum === 0 ? 'gratuito' : 'pago',
        categoria,
        icone,
        tempoAcesso,
        ativo: true,
        features: features.length > 0 ? features : ['Acesso liberado WikiWorldWeb']
      };

      await createProductInDb(newProd);
      setSuccessMsg('✅ Produto criado e publicado com sucesso no Firestore!');
      setNome('');
      setDescricao('');
      setPreco('0');
      setFeaturesStr('');
      onProductCreated();
    } catch (err) {
      console.error('Error creating product:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-[var(--bg-card)] text-[var(--text-main)] rounded-3xl shadow-2xl border border-[var(--border-subtle)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center text-amber-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Painel de Administração</h2>
              <p className="text-xs text-amber-100">WikiWorldWeb • Gerenciador de Produtos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[var(--border-subtle)] bg-[var(--bg-card-subtle)] px-6 pt-3 gap-2">
          <button
            onClick={() => setTab('create')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              tab === 'create'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Cadastrar Novo Produto
          </button>
          <button
            onClick={() => setTab('orders')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              tab === 'orders'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Receipt className="w-4 h-4" />
            Todas as Transações
          </button>
        </div>

        {/* Tab 1: Create Product */}
        {tab === 'create' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {successMsg && (
              <div className="p-3 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl border border-emerald-500/30 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-[var(--text-main)] block mb-1">
                Nome do Produto / Serviço
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Módulo de Tradução Automática"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-main)] placeholder-[var(--text-subtle)] text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-main)] block mb-1">
                Descrição Completa
              </label>
              <textarea
                required
                rows={3}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Explique o que este produto oferece..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-main)] placeholder-[var(--text-subtle)] text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text-main)] block mb-1">
                  Preço em Reais (R$)
                </label>
                <input
                  type="text"
                  required
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  placeholder="0 para Gratuito ou 39.90"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-main)] placeholder-[var(--text-subtle)] text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-main)] block mb-1">
                  Categoria
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-main)] text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Acesso">Acesso</option>
                  <option value="Comunidade">Comunidade</option>
                  <option value="Assinatura">Assinatura</option>
                  <option value="Ferramentas">Ferramentas</option>
                  <option value="Serviço">Serviço</option>
                  <option value="Developer">Developer / API</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Ícone Representativo
                </label>
                <select
                  value={icone}
                  onChange={(e) => setIcone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Sparkles">Sparkles (Estrela / Pro)</option>
                  <option value="BookOpen">BookOpen (Livro / Artigo)</option>
                  <option value="Users">Users (Comunidade)</option>
                  <option value="Wrench">Wrench (Ferramenta)</option>
                  <option value="Smartphone">Smartphone (Mobile)</option>
                  <option value="Headphones">Headphones (Consultoria)</option>
                  <option value="Code">Code (API)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Duração / Tempo de Acesso
                </label>
                <input
                  type="text"
                  value={tempoAcesso}
                  onChange={(e) => setTempoAcesso(e.target.value)}
                  placeholder="Ex: Acesso Vitalício, Assinatura Mensal"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Vantagens Inclusas (uma por linha)
              </label>
              <textarea
                rows={3}
                value={featuresStr}
                onChange={(e) => setFeaturesStr(e.target.value)}
                placeholder="Item 1: Recurso avançado&#10;Item 2: Sem anúncios&#10;Item 3: Suporte 24/7"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
              >
                {submitting ? 'Salvando...' : 'Publicar no Catálogo'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: All Orders */}
        {tab === 'orders' && (
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-3">
            {loadingOrders ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Carregando transações do banco...
              </div>
            ) : allOrders.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Nenhuma transação registrada ainda no Firestore.
              </div>
            ) : (
              <div className="space-y-2">
                {allOrders.map((ord, idx) => (
                  <div
                    key={ord.id || idx}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{ord.productName}</p>
                      <p className="text-[11px] text-slate-500">
                        {ord.userEmail} ({ord.userName})
                      </p>
                      {ord.activationKey && (
                        <span className="font-mono text-[10px] text-blue-600">
                          {ord.activationKey}
                        </span>
                      )}
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <span className="font-bold text-slate-900">
                        {ord.isFree ? 'Gratuito' : `R$ ${ord.productPrice?.toFixed(2)}`}
                      </span>
                      <span className="block text-[10px] font-semibold text-emerald-600">
                        {ord.status} ({ord.paymentMethod})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
