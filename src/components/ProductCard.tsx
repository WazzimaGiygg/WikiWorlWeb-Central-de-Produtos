import React from 'react';
import {
  BookOpen,
  Users,
  Smartphone,
  Sparkles,
  Wrench,
  Headphones,
  Code,
  Package,
  CheckCircle2,
  Check,
  ArrowRight,
  ShieldAlert,
  Clock,
  Tag,
  Code2,
  Download,
  Lock,
  Github,
  ExternalLink,
  Flame,
  TrendingUp
} from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { Product } from '../types';
import { getProductSalesBadge } from '../utils/salesData';

export const productCardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 280,
      damping: 24,
      mass: 0.8
    }
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 12,
    transition: {
      duration: 0.18,
      ease: 'easeOut'
    }
  }
};

interface ProductCardProps {
  product: Product;
  isOwned: boolean;
  onSelect: (product: Product) => void;
  onViewLicense?: (product: Product) => void;
  onConfigureWiki?: (product: Product) => void;
  isDisabledByExtension?: boolean;
  index?: number;
  allProducts?: Product[];
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isOwned,
  onSelect,
  onViewLicense,
  onConfigureWiki,
  isDisabledByExtension,
  index,
  allProducts = []
}) => {
  const isFree = product.preco === 0 || product.tipo === 'gratuito';

  // Lógica dinâmica para selo "Mais Vendidos" e contagem de aquisições
  const salesBadge = React.useMemo(() => {
    return getProductSalesBadge(product, allProducts.length > 0 ? allProducts : [product]);
  }, [product, allProducts]);

  // Dynamic Lucide icon mapping
  const renderIcon = (iconName: string) => {
    const props = { className: 'w-7 h-7 text-white' };
    switch (iconName?.toLowerCase()) {
      case 'bookopen':
      case 'menu_book':
        return <BookOpen {...props} />;
      case 'users':
      case 'groups':
        return <Users {...props} />;
      case 'smartphone':
        return <Smartphone {...props} />;
      case 'sparkles':
      case 'workspace_premium':
        return <Sparkles {...props} />;
      case 'wrench':
      case 'build':
        return <Wrench {...props} />;
      case 'headphones':
      case 'support_agent':
        return <Headphones {...props} />;
      case 'code':
        return <Code {...props} />;
      default:
        return <Package {...props} />;
    }
  };

  const formatPrice = (val: number) => {
    if (val === 0) return 'Gratuito';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  return (
    <motion.div
      layout
      variants={productCardVariants}
      whileHover={{
        y: -6,
        transition: { duration: 0.22, ease: 'easeOut' }
      }}
      className={`group relative bg-[var(--bg-card)] rounded-2xl border transition-colors flex flex-col justify-between overflow-hidden shadow-[var(--shadow-card)] ${
        isOwned
          ? 'border-emerald-500/30 ring-1 ring-emerald-500/20'
          : product.popular
          ? 'border-blue-400/50 shadow-blue-500/10 hover:shadow-2xl hover:border-blue-400'
          : 'border-[var(--border-subtle)] hover:shadow-xl hover:border-blue-500/40'
      }`}
    >
      {/* Top Banner & Badges */}
      <div>
        <div
          className={`h-36 sm:h-40 p-5 flex flex-col justify-between relative overflow-hidden ${
            isOwned
              ? 'bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900'
              : product.popular
              ? 'bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-950'
              : isFree
              ? 'bg-gradient-to-br from-teal-600 via-cyan-700 to-slate-900'
              : 'bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-900'
          }`}
        >
          {/* Subtle Decorative Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Top Badges */}
          <div className="relative z-10 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/30 backdrop-blur-md text-white border border-white/10">
              <Tag className="w-3 h-3 text-sky-300" />
              {product.categoria || 'Geral'}
            </span>

            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {/* Dynamic Mais Vendidos badge */}
              {salesBadge.isTopSeller && !isOwned && !isDisabledByExtension && (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/25 ring-1 ring-white/30 tracking-tight animate-in fade-in select-none"
                  title={`${salesBadge.salesCount.toLocaleString('pt-BR')} aquisições confirmadas`}
                >
                  <Flame className="w-3.5 h-3.5 text-yellow-200 fill-yellow-200 animate-pulse" />
                  <span>{salesBadge.badgeLabel}</span>
                  <span className="text-[10px] font-bold bg-black/25 px-1.5 py-0.2 rounded-full border border-white/20">
                    {salesBadge.formattedCount}
                  </span>
                </span>
              )}

              {isDisabledByExtension ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-md">
                  <Lock className="w-3 h-3" /> Desabilitado
                </span>
              ) : isOwned ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-400 text-emerald-950 shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Adquirido
                </span>
              ) : isFree ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-teal-400/90 text-teal-950">
                  100% Free
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/90 text-white">
                  Maribondo
                </span>
              )}
            </div>
          </div>

          {/* Product Icon & Title Preview */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              {renderIcon(product.icone)}
            </div>
            {product.tempoAcesso && (
              <span className="text-[11px] font-medium text-white/80 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {product.tempoAcesso}
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          <h3 className="font-bold text-lg text-[var(--text-main)] group-hover:text-blue-500 transition-colors leading-snug">
            {product.nome}
          </h3>
          <p className="mt-2 text-sm text-[var(--text-muted)] line-clamp-2 leading-relaxed">
            {product.descricao}
          </p>

          {/* Dynamic Acquisition Counter / Social Proof */}
          <div className="mt-3.5 flex items-center justify-between text-xs bg-[var(--bg-card-subtle)] px-3 py-2 rounded-xl border border-[var(--border-subtle)]">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span className="text-[var(--text-muted)] text-[11px] sm:text-xs">
                <strong className="text-[var(--text-main)] font-extrabold">{salesBadge.salesCount.toLocaleString('pt-BR')}</strong> aquisições
              </span>
            </div>
            {salesBadge.isTopSeller ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
                Alta Demanda
              </span>
            ) : (
              <span className="text-[10px] text-[var(--text-subtle)]">Disponível</span>
            )}
          </div>

          {/* Feature List */}
          {product.features && product.features.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">
                O que está incluso:
              </span>
              <ul className="space-y-1.5">
                {product.features.slice(0, 3).map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Footer / CTA Area */}
      <div className="p-6 pt-0 bg-[var(--bg-card)]">
        <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between mb-4">
          <div>
            <span className="text-[11px] font-medium text-[var(--text-subtle)] block">
              {isFree ? 'Custo de Adesão' : 'Investimento'}
            </span>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-2xl font-extrabold tracking-tight ${
                  isFree ? 'text-teal-500' : 'text-[var(--text-main)]'
                }`}
              >
                {formatPrice(product.preco)}
              </span>
              {!isFree && (
                <span className="text-xs text-[var(--text-subtle)] font-normal">
                  {product.categoria === 'Assinatura' ? '/mês' : 'único'}
                </span>
              )}
            </div>
          </div>
          {isFree && (
            <span className="text-xs font-semibold px-2 py-1 bg-teal-500/15 text-teal-600 dark:text-teal-400 rounded-lg">
              Sem mensalidade
            </span>
          )}
        </div>

        {/* Action Button */}
        {isDisabledByExtension ? (
          <button
            disabled
            className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-[var(--bg-card-subtle)] text-[var(--text-subtle)] border border-[var(--border-subtle)] cursor-not-allowed flex items-center justify-center gap-2 shadow-none"
          >
            <Lock className="w-3.5 h-3.5 text-[var(--text-subtle)]" />
            <span>Serviço Desabilitado por Extensão</span>
          </button>
        ) : product.id === 'prod_free_01' ? (
          <div className="space-y-2">
            <button
              onClick={() => (onConfigureWiki ? onConfigureWiki(product) : onSelect(product))}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 group/btn"
            >
              <Code2 className="w-4 h-4 text-sky-300 group-hover/btn:scale-110 transition-transform" />
              <span>Configurar &amp; Baixar Wiki</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>

            {/* Direct Project Download from Repository */}
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <a
                href="https://github.com/WazzimaGiygg/Wiki-alternative/archive/refs/heads/main.zip"
                download="Wiki-alternative-main.zip"
                target="_blank"
                rel="noopener noreferrer"
                title="Baixar arquivo ZIP completo do repositório GitHub"
                className="py-2 px-2 rounded-xl font-bold text-[11px] bg-[var(--bg-card-subtle)] hover:bg-blue-600/10 hover:text-blue-500 text-[var(--text-main)] border border-[var(--border-subtle)] hover:border-blue-500/40 transition-all flex items-center justify-center gap-1.5 shadow-sm text-center"
              >
                <Download className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="truncate">Baixar Projeto (.ZIP)</span>
              </a>

              <a
                href="https://github.com/WazzimaGiygg/Wiki-alternative"
                target="_blank"
                rel="noopener noreferrer"
                title="Acessar repositório WazzimaGiygg/Wiki-alternative no GitHub"
                className="py-2 px-2 rounded-xl font-bold text-[11px] bg-[var(--bg-card-subtle)] hover:bg-slate-200 dark:hover:bg-slate-700 text-[var(--text-main)] border border-[var(--border-subtle)] transition-colors flex items-center justify-center gap-1 text-center"
              >
                <Github className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">GitHub Repo</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60 shrink-0" />
              </a>
            </div>

            {isOwned && (
              <button
                onClick={() => onViewLicense && onViewLicense(product)}
                className="w-full py-1.5 px-3 rounded-lg font-semibold text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Licença Ativa • Ver Detalhes</span>
              </button>
            )}
          </div>
        ) : isOwned ? (
          <button
            onClick={() => onViewLicense && onViewLicense(product)}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Ver Licença e Detalhes</span>
          </button>
        ) : isFree ? (
          <button
            onClick={() => onSelect(product)}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-md shadow-teal-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 group/btn"
          >
            <span>Obter Gratuitamente</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        ) : (
          <button
            onClick={() => onSelect(product)}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 group/btn"
          >
            <span>Adquirir Serviço</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </motion.div>
  );
};
