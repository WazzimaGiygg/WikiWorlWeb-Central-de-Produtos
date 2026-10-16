import React, { useState } from 'react';
import {
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
  ShoppingBag,
  Search,
  PlusCircle,
  FileCode,
  ExternalLink,
  ShieldAlert,
  Server,
  Activity,
  UserCheck
} from 'lucide-react';
import { ExtensionConfig, Product, UserProfile } from '../types';
import {
  isExtensionManager,
  updateExtensionInCloud,
  EXTENSION_MANAGER_EMAILS
} from '../firebase';

interface ExtensionsPageViewProps {
  extensions: ExtensionConfig[];
  products: Product[];
  currentUser: UserProfile | null;
  syncedWithCloud: boolean;
  onExtensionUpdated: (updatedList: ExtensionConfig[]) => void;
  onRetrySync: () => void;
  isRetryingSync: boolean;
  onExploreCatalog: () => void;
}

export const ExtensionsPageView: React.FC<ExtensionsPageViewProps> = ({
  extensions,
  products,
  currentUser,
  syncedWithCloud,
  onExtensionUpdated,
  onRetrySync,
  isRetryingSync,
  onExploreCatalog
}) => {
  const isAuthorized = isExtensionManager(currentUser?.email);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  // New extension form modal state
  const [newExtModalOpen, setNewExtModalOpen] = useState(false);
  const [newExtName, setNewExtName] = useState('');
  const [newExtDesc, setNewExtDesc] = useState('');
  const [newExtCategory, setNewExtCategory] = useState<'catalogo' | 'seguranca' | 'integracao' | 'sistema'>('integracao');
  const [newExtVersion, setNewExtVersion] = useState('1.0.0');

  const primaryExtension = extensions.find((e) => e.id === 'ext_servicos_disponibilidade');

  const handleToggleExtension = async (extId: string) => {
    if (!isAuthorized) {
      setFeedbackMsg({
        text: `Acesso negado: Somente ${EXTENSION_MANAGER_EMAILS.join(' ou ')} podem alterar extensões no Firebase.`,
        type: 'error'
      });
      return;
    }

    const current = extensions.find((e) => e.id === extId);
    if (!current) return;

    const updated: ExtensionConfig = {
      ...current,
      ativo: !current.ativo,
      sincronizadoEm: new Date().toISOString(),
      modificadoPor: currentUser?.email || 'Burocrata Master'
    };

    setSavingId(extId);
    setFeedbackMsg(null);

    const res = await updateExtensionInCloud(updated, currentUser?.email);
    setSavingId(null);

    if (res.success) {
      const newList = extensions.map((e) => (e.id === extId ? updated : e));
      onExtensionUpdated(newList);
      setFeedbackMsg({
        text: `Extensão "${updated.nome}" ${updated.ativo ? 'habilitada' : 'desabilitada'} no Firebase com sucesso!`,
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
      sincronizadoEm: new Date().toISOString(),
      modificadoPor: currentUser?.email || 'Burocrata Master'
    };

    setSavingId('primary_services_' + productId);
    setFeedbackMsg(null);

    const res = await updateExtensionInCloud(updatedExt, currentUser?.email);
    setSavingId(null);

    if (res.success) {
      const newList = extensions.map((e) =>
        e.id === primaryExtension.id ? updatedExt : e
      );
      onExtensionUpdated(newList);
      setFeedbackMsg({
        text: `Disponibilidade do serviço no catálogo atualizada no Firebase!`,
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
      sincronizadoEm: new Date().toISOString(),
      modificadoPor: currentUser?.email || 'Burocrata Master'
    };

    setSavingId('maintenance_mode');
    const res = await updateExtensionInCloud(updatedExt, currentUser?.email);
    setSavingId(null);

    if (res.success) {
      const newList = extensions.map((e) =>
        e.id === primaryExtension.id ? updatedExt : e
      );
      onExtensionUpdated(newList);
      setFeedbackMsg({
        text: `Modo Manutenção Geral ${updatedExt.modoManutencaoGeral ? 'ativado' : 'desativado'} com sucesso!`,
        type: 'success'
      });
    }
  };

  const handleCreateCustomExtension = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) return;

    const generatedId = `ext_${newExtName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;
    const newExt: ExtensionConfig = {
      id: generatedId,
      nome: newExtName,
      descricao: newExtDesc,
      versao: newExtVersion,
      categoria: newExtCategory,
      ativo: true,
      obrigatoria: false,
      autor: currentUser?.name || 'Administrador',
      sincronizadoEm: new Date().toISOString(),
      modificadoPor: currentUser?.email || 'Burocrata'
    };

    setSavingId('new_ext');
    const res = await updateExtensionInCloud(newExt, currentUser?.email);
    setSavingId(null);

    if (res.success) {
      const newList = [...extensions, newExt];
      onExtensionUpdated(newList);
      setNewExtName('');
      setNewExtDesc('');
      setNewExtModalOpen(false);
      setFeedbackMsg({
        text: `Nova extensão "${newExt.nome}" criada e publicada no Firebase!`,
        type: 'success'
      });
    } else {
      setFeedbackMsg({
        text: res.error || 'Erro ao publicar extensão.',
        type: 'error'
      });
    }
  };

  const activeExtensionsCount = extensions.filter((e) => e.ativo).length;
  const filteredExtensions = extensions.filter((ext) => {
    if (selectedCategory !== 'todas' && ext.categoria !== selectedCategory) {
      return false;
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = ext.nome.toLowerCase().includes(term);
      const matchDesc = ext.descricao.toLowerCase().includes(term);
      const matchAuthor = ext.autor?.toLowerCase().includes(term);
      if (!matchName && !matchDesc && !matchAuthor) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Hero / Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-10 shadow-2xl border border-slate-800 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
            <Puzzle className="w-3.5 h-3.5 text-indigo-400" />
            Central de Extensões em Nuvem WikiWorldWeb
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Página de{' '}
            <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">
              Extensões &amp; Governança
            </span>
          </h1>

          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Monitore, habilite e configure os módulos de segurança e controladores de serviços do
            sistema. Todas as regras são sincronizadas diretamente com o banco de dados Firebase Firestore.
          </p>

          {/* Quick Metrics */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-xl">
              <Activity className="w-4 h-4 text-emerald-400" />
              {activeExtensionsCount} de {extensions.length} extensões ativas
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-xl">
              <Server className="w-4 h-4 text-sky-400" />
              {syncedWithCloud ? 'Nuvem Firebase Conectada' : 'Modo Offline / Local'}
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-xl font-mono text-[11px] text-amber-300">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Burocratas: pedrohenriquecardonaperes / wazzimagiygg
            </span>
          </div>
        </div>
      </div>

      {/* Permission Notification Banner */}
      <div
        className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          isAuthorized
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            : 'bg-amber-50/80 border-amber-200 text-amber-950'
        }`}
      >
        <div className="flex items-start gap-2.5">
          {isAuthorized ? (
            <UserCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-bold">
              {isAuthorized
                ? `Permissão Master Concedida (${currentUser?.email})`
                : 'Modo de Auditoria e Leitura Pública'}
            </p>
            <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed">
              {isAuthorized
                ? 'Você possui autorização para ativar, desativar e definir a disponibilidade de cada serviço no Firebase.'
                : `Apenas os logins com os e-mails ${EXTENSION_MANAGER_EMAILS.join(' e ')} podem alterar o estado das extensões.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onRetrySync}
            disabled={isRetryingSync}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetryingSync ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isRetryingSync ? 'Sincronizando...' : 'Atualizar Nuvem'}</span>
          </button>

          {isAuthorized && (
            <button
              onClick={() => setNewExtModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Nova Extensão</span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : 'bg-rose-100 text-rose-900 border border-rose-300'
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          {[
            { id: 'todas', label: 'Todas as Extensões' },
            { id: 'catalogo', label: 'Catálogo & Serviços' },
            { id: 'seguranca', label: 'Segurança & Burocratas' },
            { id: 'integracao', label: 'Integração Wiki' },
            { id: 'sistema', label: 'Sistema & Cache' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar extensões..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* EXTENSÃO EM DESTAQUE: 1ª EXTENSÃO (CONTROLADOR DE DISPONIBILIDADE DE SERVIÇOS) */}
      {primaryExtension && (selectedCategory === 'todas' || selectedCategory === 'catalogo') && (
        <section className="bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-white rounded-3xl border-2 border-blue-200/90 p-6 space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-blue-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
                1ª
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                    {primaryExtension.nome}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    Extensão Mestra • v{primaryExtension.versao}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                  {primaryExtension.descricao}
                </p>
              </div>
            </div>

            {/* Master Extension Switch */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                disabled={!isAuthorized || savingId === primaryExtension.id}
                onClick={() => handleToggleExtension(primaryExtension.id)}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                  primaryExtension.ativo
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {primaryExtension.ativo ? (
                  <>
                    <ToggleRight className="w-4 h-4 text-emerald-200" />
                    <span>Extensão Habilitada</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-4 h-4" />
                    <span>Extensão Desabilitada</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sub-painel: Controle individual de serviços */}
          <div className="bg-white rounded-2xl border border-blue-200/80 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-blue-600" />
                  Disponibilidade dos Serviços no Catálogo WikiWorldWeb
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Ligue ou desligue qualquer produto para os usuários finais. As alterações têm efeito imediato.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!isAuthorized}
                  onClick={handleToggleMaintenanceMode}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    primaryExtension.modoManutencaoGeral
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  } disabled:opacity-50`}
                >
                  {primaryExtension.modoManutencaoGeral
                    ? '⚠️ Modo Manutenção Geral Ativo'
                    : 'Catálogo em Operação Normal'}
                </button>
              </div>
            </div>

            {/* Product Switch Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {products.map((prod) => {
                const isEnabled =
                  primaryExtension.servicosDisponiveis?.[prod.id] !== false &&
                  !primaryExtension.modoManutencaoGeral;

                return (
                  <div
                    key={prod.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                      isEnabled
                        ? 'bg-slate-50/80 border-slate-200 text-slate-900 shadow-sm'
                        : 'bg-rose-50/50 border-rose-200 text-slate-500 opacity-75'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                          {prod.categoria}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isEnabled
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isEnabled ? '● Ativo' : '○ Desativado'}
                        </span>
                      </div>
                      <h5 className="font-bold text-xs truncate text-slate-900">{prod.nome}</h5>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{prod.descricao}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-800">
                        {prod.preco === 0 ? 'Gratuito' : `R$ ${prod.preco.toFixed(2)}`}
                      </span>

                      <button
                        type="button"
                        disabled={!isAuthorized || savingId === 'primary_services_' + prod.id}
                        onClick={() => handleToggleProductAvailability(prod.id)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                          isEnabled
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-rose-600 hover:bg-rose-500 text-white'
                        } disabled:opacity-50`}
                      >
                        {isEnabled ? 'Habilitado' : 'Desabilitado'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* DEMAIS EXTENSÕES GRID */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            Módulos de Integridade, Governança e Segurança ({filteredExtensions.length})
          </h3>
          <span className="text-xs text-slate-500">
            Sincronização em tempo real via Firestore: <code>wiki_extensoes</code>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredExtensions
            .filter((e) => e.id !== 'ext_servicos_disponibilidade')
            .map((ext) => (
              <div
                key={ext.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                  ext.ativo
                    ? 'bg-white border-slate-200/90 shadow-sm hover:shadow-md'
                    : 'bg-slate-50/70 border-slate-200 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                      {ext.categoria || 'Geral'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {ext.obrigatoria && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          Obrigatória
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-400">v{ext.versao}</span>
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900">{ext.nome}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ext.descricao}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-[10px] text-slate-400">
                    <span className="block font-medium">Autor: {ext.autor || 'WikiWorldWeb'}</span>
                    <span>Sync: {ext.sincronizadoEm ? new Date(ext.sincronizadoEm).toLocaleTimeString() : 'Nuvem'}</span>
                  </div>

                  <button
                    type="button"
                    disabled={!isAuthorized || savingId === ext.id}
                    onClick={() => handleToggleExtension(ext.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                      ext.ativo
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                        : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {ext.ativo ? (
                      <>
                        <ToggleRight className="w-4 h-4 text-emerald-200" /> Ativa
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4" /> Desativada
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* MODAL PARA CADASTRAR NOVA EXTENSÃO (RESTRITO AOS 2 BUROCRATAS) */}
      {newExtModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-600" />
                Cadastrar Nova Extensão no Firebase
              </h3>
              <button
                onClick={() => setNewExtModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomExtension} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nome da Extensão</label>
                <input
                  type="text"
                  required
                  value={newExtName}
                  onChange={(e) => setNewExtName(e.target.value)}
                  placeholder="Ex: Validador de Webhooks Externos"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Descrição</label>
                <textarea
                  required
                  rows={2}
                  value={newExtDesc}
                  onChange={(e) => setNewExtDesc(e.target.value)}
                  placeholder="O que esta extensão faz e quais regras ela aplica..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Categoria</label>
                  <select
                    value={newExtCategory}
                    onChange={(e) => setNewExtCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                  >
                    <option value="integracao">Integração Wiki</option>
                    <option value="seguranca">Segurança &amp; Governança</option>
                    <option value="catalogo">Catálogo &amp; Finanças</option>
                    <option value="sistema">Sistema &amp; Cache</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Versão Semântica</label>
                  <input
                    type="text"
                    value={newExtVersion}
                    onChange={(e) => setNewExtVersion(e.target.value)}
                    placeholder="1.0.0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewExtModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingId === 'new_ext'}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/20"
                >
                  {savingId === 'new_ext' ? 'Salvando...' : 'Publicar no Firebase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
