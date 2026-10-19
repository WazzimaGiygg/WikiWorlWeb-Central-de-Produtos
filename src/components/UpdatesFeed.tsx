import React, { useRef, useState, useEffect } from 'react';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
  ShieldCheck,
  Zap,
  Info,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import { AppNotification } from '../types';
import { SYSTEM_UPDATES } from '../data/defaultNotifications';

interface UpdatesFeedProps {
  notifications: AppNotification[];
  onOpenNotifications?: () => void;
  onNotificationClick?: (notification: AppNotification) => void;
  className?: string;
}

export const UpdatesFeed: React.FC<UpdatesFeedProps> = ({
  notifications,
  onOpenNotifications,
  onNotificationClick,
  className = ''
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Combina notificações do usuário logado com as atualizações do sistema
  const allItems: AppNotification[] = React.useMemo(() => {
    const userNotifs = notifications || [];
    // Evita duplicar se já existirem
    const existingIds = new Set(userNotifs.map((n) => n.id));
    const combined = [...userNotifs];
    SYSTEM_UPDATES.forEach((sys) => {
      if (!existingIds.has(sys.id)) {
        combined.push(sys);
      }
    });
    return combined;
  }, [notifications]);

  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

      // Calcular índice aproximado
      const cardWidth = 320;
      const index = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.max(0, Math.min(index, allItems.length - 1)));
    }
  };

  useEffect(() => {
    updateScrollButtons();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', updateScrollButtons, { passive: true });
      window.addEventListener('resize', updateScrollButtons);
      return () => {
        el.removeEventListener('scroll', updateScrollButtons);
        window.removeEventListener('resize', updateScrollButtons);
      };
    }
  }, [allItems.length]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const getNotificationIcon = (item: AppNotification) => {
    const title = item.titulo.toLowerCase();
    if (title.includes('download') || title.includes('.zip') || title.includes('código')) {
      return <Download className="w-4 h-4 text-sky-500" />;
    }
    if (title.includes('tema') || title.includes('escuro') || title.includes('visual')) {
      return <Sparkles className="w-4 h-4 text-amber-500" />;
    }
    if (title.includes('segurança') || title.includes('burocrata') || title.includes('governança')) {
      return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
    }
    if (title.includes('maribondo') || title.includes('compra') || title.includes('pagamento')) {
      return <Zap className="w-4 h-4 text-indigo-500" />;
    }
    return <Bell className="w-4 h-4 text-blue-500" />;
  };

  const formatRelativeTime = (timestamp?: any) => {
    if (!timestamp) return 'Recente';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Recente';
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return 'Agora';
      if (diffHours < 24) return `Há ${diffHours}h`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Ontem';
      return `Há ${diffDays}d`;
    } catch {
      return 'Recente';
    }
  };

  const getBadgeStyle = (tipo?: string) => {
    switch (tipo) {
      case 'produto':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'pagamento':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
      case 'sistema':
      default:
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    }
  };

  const unreadCount = allItems.filter((i) => !i.lida).length;

  return (
    <section className={`space-y-4 ${className}`} aria-label="Feed de Atualizações">
      {/* Feed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Atualizações em Tempo Real
            </span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-blue-500 text-white">
                {unreadCount} nova{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-[var(--text-main)] flex items-center gap-2">
            Feed de Atualizações &amp; Avisos
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Acompanhe comunicados, novos recursos de código e status da plataforma WikiWorldWeb.
          </p>
        </div>

        {/* Carousel Controls & Open Modal */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onOpenNotifications && (
            <button
              type="button"
              onClick={onOpenNotifications}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline px-2 py-1.5 rounded-lg hover:bg-blue-500/10 transition-colors flex items-center gap-1"
            >
              <span>Ver Central</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="flex items-center gap-1 pl-1 border-l border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="p-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] text-[var(--text-main)] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs"
              aria-label="Atualização anterior"
              title="Rolar para esquerda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="p-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] text-[var(--text-main)] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs"
              aria-label="Próxima atualização"
              title="Rolar para direita"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x snap-mandatory focus:outline-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        role="region"
        aria-label="Carrossel de atualizações"
        tabIndex={0}
      >
        {allItems.map((item, idx) => {
          const isUnread = !item.lida;

          return (
            <article
              key={item.id || idx}
              onClick={() => {
                if (onNotificationClick) {
                  onNotificationClick(item);
                } else if (onOpenNotifications) {
                  onOpenNotifications();
                }
              }}
              className={`group shrink-0 w-[290px] sm:w-[320px] snap-start bg-[var(--bg-card)] rounded-2xl border p-4 shadow-[var(--shadow-card)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden select-none ${
                isUnread
                  ? 'border-blue-500/40 ring-1 ring-blue-500/20'
                  : 'border-[var(--border-subtle)] hover:border-blue-400/50'
              }`}
            >
              {/* Subtle top indicator glow for unread */}
              {isUnread && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400" />
              )}

              {/* Card Header: Icon, Tag & Timestamp */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {getNotificationIcon(item)}
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getBadgeStyle(
                        item.tipo
                      )}`}
                    >
                      {item.tipo || 'Sistema'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-subtle)]">
                    <span>{formatRelativeTime(item.timestamp)}</span>
                    {isUnread && (
                      <span
                        className="w-2 h-2 rounded-full bg-blue-500 shrink-0"
                        title="Não lida"
                      />
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-sm text-[var(--text-main)] group-hover:text-blue-500 transition-colors leading-snug line-clamp-1">
                  {item.titulo}
                </h3>

                {/* Message */}
                <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed mt-1.5">
                  {item.mensagem}
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px]">
                <span className="text-[var(--text-subtle)] font-medium">WikiWorldWeb</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  <span>Detalhes</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </article>
          );
        })}
      </div>

      {/* Pagination dots for quick visual feedback */}
      {allItems.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {allItems.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (scrollRef.current) {
                  scrollRef.current.scrollTo({
                    left: i * 320,
                    behavior: 'smooth'
                  });
                }
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'w-6 bg-blue-600 dark:bg-blue-400'
                  : 'w-1.5 bg-[var(--border-strong)] hover:bg-[var(--text-subtle)]'
              }`}
              aria-label={`Ir para atualização ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
