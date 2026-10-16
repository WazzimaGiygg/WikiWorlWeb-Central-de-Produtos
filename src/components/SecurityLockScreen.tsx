import React from 'react';
import { ShieldAlert, RefreshCw, Lock, CloudOff, Sparkles, LogIn } from 'lucide-react';
import { EXTENSION_MANAGER_EMAILS } from '../firebase';

interface SecurityLockScreenProps {
  onRetrySync: () => void;
  onOpenLogin: () => void;
  isRetrying: boolean;
}

export const SecurityLockScreen: React.FC<SecurityLockScreenProps> = ({
  onRetrySync,
  onOpenLogin,
  isRetrying
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400 shadow-xl">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Trava de Segurança Ativa
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Site Bloqueado por Segurança
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            As extensões obrigatórias de segurança não puderam ser sincronizadas com os dados em
            nuvem do <strong>Firebase</strong>.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-left text-xs text-slate-300 space-y-2">
          <div className="flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Para manter a segurança e a integridade da WikiWorldWeb, este site só pode ser aberto
              quando todas as extensões estiverem ativas e sincronizadas com a nuvem, <strong>a não
              ser se estiver sendo manipulado no Google AI Studio</strong>.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-700 text-[10px] text-slate-400">
            <span className="font-semibold block text-slate-300">Administradores Autorizados:</span>
            <ul className="list-disc list-inside mt-0.5 space-y-0.5 font-mono text-sky-400">
              {EXTENSION_MANAGER_EMAILS.map((email) => (
                <li key={email}>{email}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            onClick={onRetrySync}
            disabled={isRetrying}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Sincronizando com Firebase...' : 'Tentar Reconectar à Nuvem'}</span>
          </button>

          <button
            onClick={onOpenLogin}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center gap-2 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>Fazer Login como Administrador</span>
          </button>
        </div>
      </div>
    </div>
  );
};
