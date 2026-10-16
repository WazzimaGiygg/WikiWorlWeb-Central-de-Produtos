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
  Lock
} from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isOwned: boolean;
  onSelect: (product: Product) => void;
  onViewLicense?: (product: Product) => void;
  onConfigureWiki?: (product: Product) => void;
  isDisabledByExtension?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isOwned,
  onSelect,
  onViewLicense,
  onConfigureWiki,
  isDisabledByExtension
}) => {
  const isFree = product.preco === 0 || product.tipo === 'gratuito';

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
    <div
      className={`group relative bg-white rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
        isOwned
          ? 'border-emerald-200 shadow-sm ring-1 ring-emerald-500/20'
          : product.popular
          ? 'border-blue-300 shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:border-blue-400 hover:-translate-y-1'
          : 'border-slate-200/90 shadow-sm hover:shadow-xl hover:border-slate-300 hover:-translate-y-1'
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

            <div className="flex items-center gap-1.5">
              {product.popular && !isOwned && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-400 text-amber-950 shadow-md">
                  ★ Mais Popular
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
          <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
            {product.nome}
          </h3>
          <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {product.descricao}
          </p>

          {/* Feature List */}
          {product.features && product.features.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                O que está incluso:
              </span>
              <ul className="space-y-1.5">
                {product.features.slice(0, 3).map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
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
      <div className="p-6 pt-0 bg-white">
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mb-4">
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">
              {isFree ? 'Custo de Adesão' : 'Investimento'}
            </span>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-2xl font-extrabold tracking-tight ${
                  isFree ? 'text-teal-600' : 'text-slate-900'
                }`}
              >
                {formatPrice(product.preco)}
              </span>
              {!isFree && (
                <span className="text-xs text-slate-400 font-normal">
                  {product.categoria === 'Assinatura' ? '/mês' : 'único'}
                </span>
              )}
            </div>
          </div>
          {isFree && (
            <span className="text-xs font-semibold px-2 py-1 bg-teal-50 text-teal-700 rounded-lg">
              Sem mensalidade
            </span>
          )}
        </div>

        {/* Action Button */}
        {isDisabledByExtension ? (
          <button
            disabled
            className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed flex items-center justify-center gap-2 shadow-none"
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
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
    </div>
  );
};
