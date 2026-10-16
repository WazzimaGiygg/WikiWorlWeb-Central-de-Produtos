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

interface NavbarProps {
  user: UserProfile | null;
  activeTab: 'catalog' | 'my-products';
  setActiveTab: (tab: 'catalog' | 'my-products') => void;
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
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo Brand */}
          <div
            onClick={() => setActiveTab('catalog')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Globe className="w-5 h-5 text-sky-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  WikiWorldWeb
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Central
                </span>
              </div>
              <p className="text-xs text-slate-400 font-normal">
                Produtos &amp; Serviços Digitais
              </p>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'catalog'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
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
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              Meus Produtos
              {purchasedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs font-bold bg-blue-400 text-slate-900">
                  {purchasedCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Area: User & Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Notifications Bell */}
            {user && (
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Notificações"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Extension Manager Badge/Button (For pedrohenriquecardonaperes@gmail.com and wazzimagiygg@gmail.com) */}
            {isExtensionManager(user?.email) && (
              <button
                onClick={onOpenExtensions}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 transition-all shadow-sm"
                title="Gerenciador de Extensões em Nuvem Firebase"
              >
                <Puzzle className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Extensões Nuvem</span>
              </button>
            )}

            {/* Admin Badge/Button */}
            {user?.isAdmin && (
              <button
                onClick={onOpenAdmin}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-all"
                title="Abrir Painel Administrativo"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Admin
              </button>
            )}

            {/* User status / Login */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 pl-2 sm:border-l sm:border-slate-800">
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
                    <p className="text-sm font-semibold text-white leading-tight truncate max-w-[140px]">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                      {user.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition-all flex items-center gap-1.5"
                  title="Sair da Conta"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-102"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 space-y-2 animate-in fade-in duration-200">
            <button
              onClick={() => {
                setActiveTab('catalog');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                activeTab === 'catalog'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
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
                  : 'text-slate-300 hover:bg-slate-800'
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
            {isExtensionManager(user?.email) && (
              <button
                onClick={() => {
                  onOpenExtensions();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30"
              >
                <Puzzle className="w-4 h-4 text-indigo-400" />
                Painel de Extensões em Nuvem
              </button>
            )}
            {user?.isAdmin && (
              <button
                onClick={() => {
                  onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Painel Administrativo
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
