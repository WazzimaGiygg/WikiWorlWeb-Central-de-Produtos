import React, { useState } from 'react';
import {
  Globe,
  Bell,
  LogOut,
  LogIn,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Menu,
  X,
  PackageCheck,
  Sliders,
  Puzzle
} from 'lucide-react';
import { UserProfile, AppNotification } from '../types';
import { isExtensionManager } from '../firebase';
import { ThemeSelector } from './ThemeSelector';

interface NavbarProps {
  user: UserProfile | null;
  activeTab: 'catalog' | 'my-products' | 'extensions';
  setActiveTab: (tab: 'catalog' | 'my-products' | 'extensions') => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenNotifications: () => void;
  onOpenAdmin: () => void;
  onOpenExtensions: () => void;
  notifications: AppNotification[];
  purchasedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenLogin,
  onLogout,
  onOpenNotifications,
  onOpenAdmin,
  onOpenExtensions,
  notifications,
  purchasedCount
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.lida).length;

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-nav)] backdrop-blur-md border-b border-[var(--border-nav)] text-[var(--text-main)] shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo Brand */}
          <div
            onClick={() => setActiveTab('catalog')}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl p-1 bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-950 border border-slate-700/60 shadow-lg shadow-black/20 group-hover:scale-105 group-hover:border-blue-500/50 transition-all flex items-center justify-center overflow-hidden">
              <img
                src="/logo.png"
                alt="WikiWorldWeb Logo"
                className="w-full h-full object-contain filter drop-shadow-sm group-hover:brightness-110 transition-all"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logo.svg';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[var(--text-main)] group-hover:text-blue-600 transition-colors">
                  WikiWorldWeb
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30">
                  Central
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] font-normal">
                Produtos &amp; Serviços Digitais
              </p>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-[var(--bg-card-subtle)] p-1 rounded-xl border border-[var(--border-subtle)]">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'catalog'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Catálogo de Produtos
            </button>
            <button
              onClick={() => setActiveTab('my-products')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all relative ${
                activeTab === 'my-products'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]'
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              Meus Produtos
              {purchasedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs font-bold bg-blue-500 text-white">
                  {purchasedCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('extensions')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'extensions'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]'
              }`}
            >
              <Puzzle className="w-4 h-4 text-indigo-500 dark:text-indigo-300" />
              Extensões
            </button>
          </nav>

          {/* Right Area: Theme, User & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Selector (Claro/Escuro) */}
            <ThemeSelector variant="toggle" />

            {/* Notifications Bell */}
            {user && (
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] transition-colors"
                title="Notificações"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Extension Manager Badge/Button (For pedrohenriquecardonaperes@gmail.com and wazzimagiygg@gmail.com) */}
            {isExtensionManager(user?.email) && (
              <button
                onClick={onOpenExtensions}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/25 transition-all shadow-sm"
                title="Gerenciador de Extensões em Nuvem Firebase"
              >
                <Puzzle className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span className="hidden sm:inline">Extensões Nuvem</span>
              </button>
            )}

            {/* Admin Badge/Button */}
            {user?.isAdmin && (
              <button
                onClick={onOpenAdmin}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-all"
                title="Abrir Painel Administrativo"
              >
                <ShieldCheck className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                Admin
              </button>
            )}

            {/* User status / Login */}
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 pl-2 sm:border-l border-[var(--border-subtle)]">
                  <div className="w-9 h-9 rounded-full ring-2 ring-blue-500/40 overflow-hidden bg-gradient-to-tr from-indigo-500 to-blue-400 flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-inner">
                    {user.profilePictureUrl ? (
                      <img
                        src={user.profilePictureUrl}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-semibold text-[var(--text-main)] leading-tight truncate max-w-[140px]">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-[var(--text-subtle)] truncate max-w-[140px]">
                      {user.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] transition-all flex items-center gap-1.5"
                  title="Sair da Conta"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-102"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[var(--border-subtle)] space-y-2 animate-in fade-in duration-200">
            {/* Mobile Theme Selector */}
            <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-main)]">
                Tema de Visualização
              </span>
              <ThemeSelector variant="segmented" />
            </div>

            <button
              onClick={() => {
                setActiveTab('catalog');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                activeTab === 'catalog'
                  ? 'bg-blue-600 text-white'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-card-subtle)] hover:text-[var(--text-main)]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Catálogo de Produtos
            </button>
            <button
              onClick={() => {
                setActiveTab('my-products');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold ${
                activeTab === 'my-products'
                  ? 'bg-blue-600 text-white'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-card-subtle)] hover:text-[var(--text-main)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <PackageCheck className="w-4 h-4" />
                Meus Produtos
              </div>
              {purchasedCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500 text-white">
                  {purchasedCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('extensions');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                activeTab === 'extensions'
                  ? 'bg-indigo-600 text-white'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-card-subtle)] hover:text-[var(--text-main)]'
              }`}
            >
              <Puzzle className="w-4 h-4 text-indigo-400" />
              Extensões &amp; Nuvem
            </button>
            {isExtensionManager(user?.email) && (
              <button
                onClick={() => {
                  onOpenExtensions();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-indigo-500 dark:text-indigo-300 bg-indigo-500/15 border border-indigo-500/30"
              >
                <Puzzle className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                Painel de Extensões em Nuvem
              </button>
            )}
            {user?.isAdmin && (
              <button
                onClick={() => {
                  onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-amber-600 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20"
              >
                <ShieldCheck className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                Painel Administrativo
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
