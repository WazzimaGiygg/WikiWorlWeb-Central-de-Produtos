import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  QrCode,
  CreditCard,
  FileText,
  Copy,
  Check,
  Sparkles,
  Lock,
  ArrowRight,
  AlertCircle,
  Code2,
  Github,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, Purchase, UserProfile } from '../types';
import { registerPurchase } from '../firebase';

interface CheckoutModalProps {
  product: Product | null;
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (purchase: Purchase) => void;
  onConfigureWiki?: (product: Product) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  product,
  user,
  isOpen,
  onClose,
  onSuccess,
  onConfigureWiki
}) => {
  if (!isOpen || !product) return null;

  const isFree = product.preco === 0 || product.tipo === 'gratuito';
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao' | 'boleto'>(
    isFree ? 'pix' : 'pix'
  );
  const [loading, setLoading] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  // Form states for credit card
  const [cardHolder, setCardHolder] = useState(user.name || '');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('11/29');
  const [cardCvv, setCardCvv] = useState('382');
  const [installments, setInstallments] = useState('1');

  const pixCode = `00020126580014br.gov.bcb.pix0136wikiworldweb-payment-${product.id}-${Date.now()}520400005303986540${product.preco.toFixed(2)}5802BR5921WikiWorldWeb Servicos6009Sao Paulo62070503***6304E8A2`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // Simulate brief network authentication
      await new Promise((resolve) => setTimeout(resolve, 800));

      const selectedMethod = isFree ? 'gratuito' : paymentMethod;
      const purchase = await registerPurchase(user, product, selectedMethod);

      // Trigger celebratory confetti burst!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      onSuccess(purchase);
    } catch (err) {
      console.error('Error during purchase:', err);
    } finally {
      setLoading(false);
    }
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
      <div className="relative w-full max-w-2xl bg-[var(--bg-card)] text-[var(--text-main)] rounded-3xl shadow-2xl border border-[var(--border-subtle)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {isFree ? 'Confirmar Ativação Gratuita' : 'Finalizar Aquisição'}
              </h2>
              <p className="text-xs text-slate-300">
                {product.nome} • {product.categoria}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Product Snapshot */}
          <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/30">
                {product.categoria}
              </span>
              <h4 className="font-bold text-[var(--text-main)] text-base">{product.nome}</h4>
              <p className="text-xs text-[var(--text-muted)] line-clamp-1">{product.descricao}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs text-[var(--text-subtle)] block font-medium">Total</span>
              <span
                className={`text-xl font-extrabold ${
                  isFree ? 'text-teal-600 dark:text-teal-400' : 'text-[var(--text-main)]'
                }`}
              >
                {formatPrice(product.preco)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector (Only for paid items) */}
          {!isFree ? (
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Selecione o Método de Pagamento
              </label>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'pix'
                      ? 'border-teal-500 bg-teal-50/70 text-teal-900 shadow-sm ring-1 ring-teal-500'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <QrCode
                    className={`w-6 h-6 ${
                      paymentMethod === 'pix' ? 'text-teal-600' : 'text-slate-400'
                    }`}
                  />
                  <span className="text-xs font-bold">PIX Instantâneo</span>
                  <span className="text-[10px] text-teal-700 bg-teal-100/80 px-2 py-0.2 rounded-full font-semibold">
                    Aprovação Imediata
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cartao')}
                  className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'cartao'
                      ? 'border-blue-500 bg-blue-50/70 text-blue-900 shadow-sm ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <CreditCard
                    className={`w-6 h-6 ${
                      paymentMethod === 'cartao' ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  <span className="text-xs font-bold">Cartão de Crédito</span>
                  <span className="text-[10px] text-slate-500">Até 12x</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('boleto')}
                  className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'boleto'
                      ? 'border-indigo-500 bg-indigo-50/70 text-indigo-900 shadow-sm ring-1 ring-indigo-500'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <FileText
                    className={`w-6 h-6 ${
                      paymentMethod === 'boleto' ? 'text-indigo-600' : 'text-slate-400'
                    }`}
                  />
                  <span className="text-xs font-bold">Boleto Bancário</span>
                  <span className="text-[10px] text-slate-500">Compensação em 24h</span>
                </button>
              </div>

              {/* PIX Panel */}
              {paymentMethod === 'pix' && (
                <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-200/80 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    {/* Simulated visual QR Code */}
                    <div className="w-32 h-32 bg-white rounded-xl p-2 border border-slate-200 shadow-sm shrink-0 flex flex-col items-center justify-center relative group">
                      <div className="w-full h-full bg-slate-900 rounded-lg p-1.5 flex flex-col items-center justify-between text-white text-[9px] font-mono select-none">
                        <div className="w-full flex justify-between">
                          <span className="w-5 h-5 bg-teal-400 rounded-sm"></span>
                          <span className="w-5 h-5 bg-teal-400 rounded-sm"></span>
                        </div>
                        <div className="w-6 h-6 rounded-md bg-white text-slate-900 font-bold flex items-center justify-center text-xs">
                          WWW
                        </div>
                        <div className="w-full flex justify-between">
                          <span className="w-5 h-5 bg-teal-400 rounded-sm"></span>
                          <span className="text-[8px] text-teal-300">PIX</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-center sm:text-left flex-1">
                      <h5 className="font-bold text-slate-900 text-sm">
                        Pague com PIX para liberação instantânea
                      </h5>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Abra o app do seu banco, escolha a opção <strong>PIX Copia e Cola</strong> e
                        cole o código abaixo:
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={pixCode}
                          className="bg-white border border-slate-300 text-slate-600 font-mono text-xs rounded-xl px-3 py-2 flex-1 truncate select-all"
                        />
                        <button
                          type="button"
                          onClick={handleCopyPix}
                          className="px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                        >
                          {copiedPix ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copiedPix ? 'Copiado!' : 'Copiar'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Credit Card Panel */}
              {paymentMethod === 'cartao' && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Nome Impresso no Cartão
                      </label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="NOME COMO NO CARTAO"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Número do Cartão
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Validade (MM/AA)
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Código de Segurança (CVV)
                      </label>
                      <input
                        type="text"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Parcelamento
                      </label>
                      <select
                        value={installments}
                        onChange={(e) => setInstallments(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="1">1x de {formatPrice(product.preco)} sem juros</option>
                        <option value="2">2x de {formatPrice(product.preco / 2)} sem juros</option>
                        <option value="3">3x de {formatPrice(product.preco / 3)} sem juros</option>
                        <option value="6">6x de {formatPrice(product.preco / 6)} sem juros</option>
                        <option value="12">12x de {formatPrice(product.preco / 12)} sem juros</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Boleto Panel */}
              {paymentMethod === 'boleto' && (
                <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-900 leading-relaxed">
                      <p className="font-bold">Aviso sobre pagamento via Boleto</p>
                      <p className="mt-1">
                        A liberação da licença WikiWorldWeb ocorre após a compensação bancária (1
                        a 2 dias úteis). Para liberação imediata, recomendamos o uso de PIX.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Free item confirmation details */
            <div className="space-y-3">
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">
                      Adesão Gratuita WikiWorldWeb
                    </h5>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Este item não possui custo nem cobrança periódica. Ao clicar em confirmar, a
                      chave de acesso pessoal será gerada e vinculada à sua conta{' '}
                      <strong className="text-slate-800">{user.email}</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {product.id === 'prod_free_01' && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <Code2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-blue-950">
                        Repositório Wiki-alternative (WazzimaGiygg)
                      </p>
                      <p className="text-blue-800 text-[11px] mt-0.5">
                        Defina o Burocrata, credenciais Firebase ou baixe diretamente o código completo do projeto.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                    {onConfigureWiki && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onConfigureWiki(product);
                        }}
                        className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Configurar</span>
                      </button>
                    )}

                    <a
                      href="https://github.com/WazzimaGiygg/Wiki-alternative/archive/refs/heads/main.zip"
                      download="Wiki-alternative-main.zip"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      <span>Baixar ZIP</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Confirmation Info */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              Ambiente Seguro com Criptografia SSL
            </span>
            <span>Conta: {user.email}</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className={`px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all flex items-center gap-2 ${
              isFree
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-teal-500/25'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processando...</span>
              </>
            ) : isFree ? (
              <>
                <span>Confirmar e Ativar Gratuitamente</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : paymentMethod === 'pix' ? (
              <>
                <span>Confirmar Pagamento PIX Instantâneo</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : paymentMethod === 'cartao' ? (
              <>
                <span>Pagar {formatPrice(product.preco)} com Cartão</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Gerar Boleto Bancário</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
