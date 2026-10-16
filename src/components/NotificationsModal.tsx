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
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
            <div className="text-center py-10 text-slate-400 text-xs space-y-2">
              <Bell className="w-8 h-8 mx-auto opacity-30" />
              <p>Nenhuma notificação por enquanto.</p>
            </div>
          ) : (
            notifications.map((item, idx) => (
              <div
                key={item.id || idx}
                className={`p-3.5 rounded-2xl border text-xs transition-colors ${
                  item.lida
                    ? 'bg-slate-50 border-slate-200/70 text-slate-600'
                    : 'bg-blue-50/60 border-blue-200/80 text-blue-950 font-medium'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    {item.titulo}
                  </span>
                  {!item.lida && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                  )}
                </div>
                <p className="text-slate-600 leading-relaxed">{item.mensagem}</p>
              </div>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={onMarkAllRead}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4" />
              Marcar todas como lidas
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-semibold text-slate-700"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
