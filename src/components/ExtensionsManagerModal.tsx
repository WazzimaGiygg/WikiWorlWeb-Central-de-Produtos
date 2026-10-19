import React, { useState } from 'react';
import {
  X,
  Puzzle,
  ShieldCheck,
  Check,
  AlertTriangle,
  Lock,
  CloudCheck,
  CloudOff,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Info,
  Layers,
  ShoppingBag
} from 'lucide-react';
import { ExtensionConfig, Product, UserProfile } from '../types';
import {
  isExtensionManager,
  updateExtensionInCloud,
  EXTENSION_MANAGER_EMAILS
} from '../firebase';

interface ExtensionsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  extensions: ExtensionConfig[];
  products: Product[];
  currentUser: UserProfile | null;
  syncedWithCloud: boolean;
  onExtensionUpdated: (updatedList: ExtensionConfig[]) => void;
}

export const ExtensionsManagerModal: React.FC<ExtensionsManagerModalProps> = ({
  isOpen,
  onClose,
  extensions,
  products,
  currentUser,
  syncedWithCloud,
  onExtensionUpdated
}) => {
  if (!isOpen) return null;

  const isAuthorized = isExtensionManager(currentUser?.email);
  const [localExtensions, setLocalExtensions] = useState<ExtensionConfig[]>(extensions);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  const primaryExtension = localExtensions.find((e) => e.id === 'ext_servicos_disponibilidade');

  const handleToggleExtension = async (extId: string) => {
    if (!isAuthorized) {
      setFeedbackMsg({
        text: `Acesso negado: Somente ${EXTENSION_MANAGER_EMAILS.join(' ou ')} podem alterar extensões.`,
        type: 'error'
      });
      return;
    }

    const current = localExtensions.find((e) => e.id === extId);
    if (!current) return;

    const updated: ExtensionConfig = {
      ...current,
      ativo: !current.ativo,
      sincronizadoEm: new Date().toISOString()
    };

    setSavingId(extId);
    setFeedbackMsg(null);

    const res = await updateExtensionInCloud(updated, currentUser?.email);
    setSavingId(null);

    if (res.success) {
      const newList = localExtensions.map((e) => (e.id === extId ? updated : e));
      setLocalExtensions(newList);
      onExtensionUpdated(newList);
      setFeedbackMsg({
        text: `Extensão "${updated.nome}" ${updated.ativo ? 'habilitada' : 'desabilitada'} no Firebase!`,
        type: 'success'
      });
    } else {
      setFeedbackMsg({
        text: res.error || 'Erro ao sincronizar com o Firebase.',
        type: 'error'
      });
    }
  };

  const handleToggleProductAvailability = async (productId: string) => {
    if (!isAuthorized) {
      setFeedbackMsg({
        text: `Acesso negado: Somente ${EXTENSION_MANAGER_EMAILS.join(' ou ')} podem alterar disponibilidade de serviços.`,
        type: 'error'
      });
      return;
    }

    if (!primaryExtension) return;

    const currentServices = primaryExtension.servicosDisponiveis || {};
    const currentlyEnabled = currentServices[productId] !== false; // default true

    const updatedServices = {
      ...currentServices,
      [productId]: !currentlyEnabled
    };

    const updatedExt: ExtensionConfig = {
      ...primaryExtension,
      servicosDisponiveis: updatedServices,
      sincronizadoEm: new Date().toISOString()
    };

    setSavingId('primary_services');
    setFeedbackMsg(null);

    const res = await updateExtensionInCloud(updatedExt, currentUser?.email);
    setSavingId(null);

    if (res.success) {
      const newList = localExtensions.map((e) =>
        e.id === primaryExtension.id ? updatedExt : e
      );
      setLocalExtensions(newList);
      onExtensionUpdated(newList);
      setFeedbackMsg({
        text: `Disponibilidade do serviço atualizada com sucesso no Firebase!`,
        type: 'success'
      });
    } else {
      setFeedbackMsg({
        text: res.error || 'Erro ao salvar no Firebase.',
        type: 'error'
      });
    }
  };

  const handleToggleMaintenanceMode = async () => {
    if (!isAuthorized || !primaryExtension) return;

    const updatedExt: ExtensionConfig = {
      ...primaryExtension,
      modoManutencaoGeral: !primaryExtension.modoManutencaoGeral,
      sincronizadoEm: new Date().toISOString()
    };

    setSavingId('maintenance_mode');
    const res = await updateExtensionInCloud(updatedExt, currentUser?.email);
    setSavingId(null);

    if (res.success) {
      const newList = localExtensions.map((e) =>
        e.id === primaryExtension.id ? updatedExt : e
      );
      setLocalExtensions(newList);
      onExtensionUpdated(newList);
      setFeedbackMsg({
        text: `Modo Manutenção Geral ${updatedExt.modoManutencaoGeral ? 'ativado' : 'desativado'}!`,
        type: 'success'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-3xl bg-[var(--bg-card)] text-[var(--text-main)] rounded-3xl shadow-2xl border border-[var(--border-subtle)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-md">
              <Puzzle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">Painel de Extensões em Nuvem</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                  Firebase Cloud
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gerenciamento restrito via Firebase para controle de serviços e integridade
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

        {/* Sync & Auth Status Bar */}
        <div className="px-6 py-3 bg-[var(--bg-card-subtle)] border-b border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2">
            {syncedWithCloud ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                <CloudCheck className="w-4 h-4 text-emerald-500" />
                Extensões Sincronizadas com Nuvem Firestore
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                <CloudOff className="w-4 h-4 text-amber-500" />
                Aguardando Sincronização em Nuvem
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px]">Permissão de Edição:</span>
            {isAuthorized ? (
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Burocrata Autorizado ({currentUser?.email})
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[11px] flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-rose-600" />
                Apenas Leitura
              </span>
            )}
          </div>
        </div>

        {/* Feedback message */}
        {feedbackMsg && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Informative notice on authorization */}
        {!isAuthorized && (
          <div className="mx-6 mt-4 p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-amber-950">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              Controle Restrito de Extensões
            </p>
            <p className="text-[11px] leading-relaxed text-amber-800">
              Conforme as diretrizes de segurança, apenas os logins com os e-mails{' '}
              <strong>pedrohenriquecardonaperes@gmail.com</strong> e{' '}
              <strong>wazzimagiygg@gmail.com</strong> podem ativar, desativar ou alterar o status das
              extensões e serviços.
            </p>
          </div>
        )}

        {/* Body / List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* SECÇÃO 1: EXTENSÃO PRIMÁRIA - CONTROLADOR DE DISPONIBILIDADE DE SERVIÇOS */}
          {primaryExtension && (
            <div className="p-5 rounded-2xl border-2 border-blue-200 bg-blue-50/40 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    1ª
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">
                        {primaryExtension.nome}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                        v{primaryExtension.versao}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {primaryExtension.descricao}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={!isAuthorized || savingId === primaryExtension.id}
                    onClick={() => handleToggleExtension(primaryExtension.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                      primaryExtension.ativo
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                        : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {primaryExtension.ativo ? (
                      <>
                        <ToggleRight className="w-4 h-4" /> Extensão Ativa
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4" /> Desativada
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Sub-painel: Controle Individual de Serviços do Catálogo */}
              <div className="p-4 bg-white rounded-xl border border-blue-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-blue-600" />
                      Disponibilidade Individual dos Serviços (Catálogo WikiWorldWeb)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Defina quais serviços estão liberados para visualização e compra.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={!isAuthorized}
                    onClick={handleToggleMaintenanceMode}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                      primaryExtension.modoManutencaoGeral
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                    } disabled:opacity-50`}
                  >
                    {primaryExtension.modoManutencaoGeral
                      ? '⚠️ Catálogo em Manutenção'
                      : 'Modo Normal'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {products.map((prod) => {
                    const isEnabled =
                      primaryExtension.servicosDisponiveis?.[prod.id] !== false &&
                      !primaryExtension.modoManutencaoGeral;

                    return (
                      <div
                        key={prod.id}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all ${
                          isEnabled
                            ? 'bg-slate-50 border-slate-200 text-slate-800'
                            : 'bg-rose-50/60 border-rose-200 text-slate-500 opacity-80'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="font-bold truncate">{prod.nome}</p>
                          <span className="text-[10px] text-slate-500">
                            {prod.categoria} • {prod.preco === 0 ? 'Gratuito' : `R$ ${prod.preco.toFixed(2)}`}
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={!isAuthorized || savingId === 'primary_services'}
                          onClick={() => handleToggleProductAvailability(prod.id)}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] shrink-0 transition-colors ${
                            isEnabled
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-rose-600 hover:bg-rose-500 text-white'
                          } disabled:opacity-50`}
                        >
                          {isEnabled ? 'Habilitado' : 'Desabilitado'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* DEMAIS EXTENSÕES DO SISTEMA */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Outras Extensões de Governança &amp; Segurança
            </h4>

            {localExtensions
              .filter((e) => e.id !== 'ext_servicos_disponibilidade')
              .map((ext) => (
                <div
                  key={ext.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    ext.ativo
                      ? 'bg-white border-slate-200 shadow-sm'
                      : 'bg-slate-50 border-slate-200 opacity-70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        ext.ativo ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      <Puzzle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{ext.nome}</span>
                        <span className="text-[10px] text-slate-400 font-mono">v{ext.versao}</span>
                        {ext.obrigatoria && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 uppercase">
                            Obrigatória
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{ext.descricao}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!isAuthorized || savingId === ext.id}
                    onClick={() => handleToggleExtension(ext.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 ${
                      ext.ativo
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                        : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {ext.ativo ? (
                      <>
                        <ToggleRight className="w-4 h-4" /> Ativa
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4" /> Desativada
                      </>
                    )}
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            Operações registradas com log de integridade no Firebase
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl font-bold text-slate-800 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
