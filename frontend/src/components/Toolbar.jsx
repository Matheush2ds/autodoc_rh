import React, { useState } from 'react';
import { CalendarDays, Menu, RefreshCw } from 'lucide-react';
import { cn } from '../lib/ui';

const LONG_DATE = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

/**
 * Faixa de ferramentas da referência 02: no lugar do título gigante,
 * nome da tela compacto + chip de contexto à esquerda, chips de ação
 * e botão primário à direita.
 */
export default function Toolbar({ title, updatedAt, onRefresh, actions, onOpenMobileNav }) {
  const [spin, setSpin] = useState(false);

  const refresh = () => {
    setSpin(true);
    setTimeout(() => setSpin(false), 800);
    onRefresh?.();
  };

  return (
    <div className="sticky top-0 z-20 bg-glass backdrop-blur-md border-b border-line">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 animate-slide-down">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileNav}
            aria-label="Abrir menu"
            className="md:hidden w-9 h-9 rounded-full border border-line bg-surface flex items-center justify-center text-muted shrink-0"
          >
            <Menu className="w-4 h-4" />
          </button>

          <h1 className="text-[19px] font-bold text-ink tracking-tight truncate">{title}</h1>

          {updatedAt !== undefined && (
            <div className="hidden lg:flex items-center gap-1.5 shrink-0">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 h-8 text-[11px] font-semibold text-muted">
                <CalendarDays className="w-3.5 h-3.5 text-accent" />
                Atualizado em {LONG_DATE.format(updatedAt || new Date())}
              </span>
              {onRefresh && (
                <button
                  onClick={refresh}
                  aria-label="Recarregar"
                  className="w-8 h-8 rounded-full border border-line bg-surface flex items-center justify-center text-muted hover:text-ink hover:border-sand-300 dark:hover:border-navy-600 active:scale-95 transition-[color,border-color,transform] duration-[120ms]"
                >
                  <RefreshCw className={cn('w-3.5 h-3.5', spin && 'animate-spin-slow')} />
                </button>
              )}
            </div>
          )}
        </div>

        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
