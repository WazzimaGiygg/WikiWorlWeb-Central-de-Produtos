import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Theme, useTheme } from '../theme';

interface ThemeSelectorProps {
  variant?: 'toggle' | 'segmented';
  className?: string;
  showLabel?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  variant = 'toggle',
  className = '',
  showLabel = false
}) => {
  const { theme, isDark, toggleTheme, setTheme } = useTheme();

  if (variant === 'segmented') {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] ${className}`}
        role="group"
        aria-label="Seletor de tema claro ou escuro"
      >
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            !isDark
              ? 'bg-[var(--bg-card)] text-amber-600 shadow-sm border border-[var(--border-subtle)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]/50'
          }`}
          title="Ativar tema claro"
          aria-pressed={!isDark}
        >
          <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Claro</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isDark
              ? 'bg-[var(--bg-card)] text-sky-400 shadow-sm border border-[var(--border-subtle)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]/50'
          }`}
          title="Ativar tema escuro"
          aria-pressed={isDark}
        >
          <Moon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>Escuro</span>
        </button>
      </div>
    );
  }

  // Compact toggle button with animation and tooltip
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative group p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] text-[var(--text-main)] shadow-sm transition-all duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${className}`}
      title={isDark ? 'Tema Escuro ativo • Clique para alternar para Claro' : 'Tema Claro ativo • Clique para alternar para Escuro'}
      aria-label={`Alternar tema. Tema atual: ${isDark ? 'escuro' : 'claro'}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Moon className="w-4 h-4 text-sky-400 transition-transform duration-300 group-hover:-rotate-12" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 transition-transform duration-300 group-hover:rotate-45" />
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-semibold select-none hidden sm:inline text-[var(--text-main)]">
          {isDark ? 'Escuro' : 'Claro'}
        </span>
      )}
    </button>
  );
};
