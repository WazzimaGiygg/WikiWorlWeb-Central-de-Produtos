import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Download,
  ExternalLink,
  X,
  Sparkles,
  Printer,
  ShieldCheck,
  Calendar,
  KeyRound
} from 'lucide-react';
import { Purchase } from '../types';

interface ReceiptModalProps {
  purchase: Purchase | null;
  isOpen: boolean;
  onClose: () => void;
  onViewLibrary: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  purchase,
  isOpen,
  onClose,
  onViewLibrary
}) => {
  if (!isOpen || !purchase) return null;

  const [copiedKey, setCopiedKey] = useState(false);

  const handleCopy = () => {
    if (purchase.activationKey) {
      navigator.clipboard.writeText(purchase.activationKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatPrice = (val: number) => {
    if (val === 0) return 'Gratuito (R$ 0,00)';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-[var(--bg-card)] text-[var(--text-main)] rounded-3xl shadow-2xl border border-[var(--border-subtle)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Graphic Header */}
        <div className="p-6 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 bg-white/15 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center border border-white/20 shadow-xl mb-3">
            <CheckCircle2 className="w-9 h-9 text-emerald-300" />
          </div>

          <h2 className="text-xl font-extrabold tracking-tight">
            {purchase.isFree ? 'Aquisição Concluída!' : 'Pagamento Confirmado!'}
          </h2>
          <p className="text-xs text-emerald-100 mt-1 max-w-sm mx-auto">
            Seu serviço WikiWorldWeb já está ativado e disponível em sua conta.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* License Key Box */}
          <div className="p-4 rounded-2xl bg-slate-950 text-white space-y-2 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-sky-400" />
                Chave de Licença &amp; Ativação
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Ativa
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="font-mono text-sm sm:text-base font-bold text-sky-300 tracking-wide select-all">
                {purchase.activationKey || 'WWW-2026-PRO-9842'}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 transition-colors"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              Guarde esta chave caso necessite autenticar seu plugin ou sessão offline.
            </p>
          </div>

          {/* Receipt Details Breakdown */}
          <div className="bg-[var(--bg-card-subtle)] rounded-2xl p-4 border border-[var(--border-subtle)] space-y-2.5 text-xs text-[var(--text-muted)]">
            <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
              <span className="text-[var(--text-subtle)]">Produto</span>
              <span className="font-bold text-[var(--text-main)]">{purchase.productName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
              <span className="text-[var(--text-subtle)]">Categoria</span>
              <span className="font-semibold text-[var(--text-main)]">{purchase.productCategory}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Titular</span>
              <span className="font-medium text-slate-800">{purchase.userName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">E-mail Vinculado</span>
              <span className="font-medium text-slate-800">{purchase.userEmail}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Método de Pagamento</span>
              <span className="font-semibold uppercase text-slate-800">
                {purchase.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between py-1 pt-1.5 items-center">
              <span className="text-sm font-bold text-slate-900">Total Pago</span>
              <span
                className={`text-base font-extrabold ${
                  purchase.isFree ? 'text-teal-600' : 'text-slate-900'
                }`}
              >
                {formatPrice(purchase.productPrice)}
              </span>
            </div>
          </div>

          {/* Next steps guide */}
          <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Como usar seu novo serviço:
            </p>
            <p className="text-blue-800/90 leading-relaxed text-[11px]">
              O acesso aos artigos e ferramentas foi desbloqueado automaticamente. Você pode
              consultar suas licenças e comprovantes a qualquer momento na aba{' '}
              <strong>"Meus Produtos"</strong>.
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir Comprovante
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onViewLibrary();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Ver em Meus Produtos</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
