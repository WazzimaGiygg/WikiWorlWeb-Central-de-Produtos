import React from 'react';
import { Bell, X, CheckCheck, Clock, Sparkles, ShoppingBag, ShieldAlert } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationsModalProps {
  notifications: AppNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAllRead
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-[var(--bg-card)] text-[var(--text-main)] rounded-3xl shadow-2xl border border-[var(--border-subtle)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base">Notificações</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-10 text-[var(--text-subtle)] text-xs space-y-2">
              <Bell className="w-8 h-8 mx-auto opacity-30" />
              <p>Nenhuma notificação por enquanto.</p>
            </div>
          ) : (
            notifications.map((item, idx) => (
              <div
                key={item.id || idx}
                className={`p-3.5 rounded-2xl border text-xs transition-colors ${
                  item.lida
                    ? 'bg-[var(--bg-card-subtle)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                    : 'bg-blue-500/10 border-blue-500/30 text-[var(--text-main)] font-medium'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-[var(--text-main)] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    {item.titulo}
                  </span>
                  {!item.lida && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                  )}
                </div>
                <p className="text-[var(--text-muted)] leading-relaxed">{item.mensagem}</p>
              </div>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-4 bg-[var(--bg-card-subtle)] border-t border-[var(--border-subtle)] flex items-center justify-between">
            <button
              onClick={onMarkAllRead}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4" />
              Marcar todas como lidas
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[var(--border-subtle)] hover:bg-[var(--border-strong)] rounded-xl text-xs font-semibold text-[var(--text-main)] transition-colors"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
