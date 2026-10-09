import React, { useState } from 'react';
import { ChevronDown, HelpCircle, LogOut, Moon, Sun, Tags } from 'lucide-react';
import { cn } from '../lib/ui';

export default function TopBar({ user, theme, onToggleTheme, onOpenTags, onLogout }) {
  const [menu, setMenu] = useState(false);
  const initials = (user?.name || 'RH').trim().substring(0, 2).toUpperCase();

  return (
    <header className="h-16 shrink-0 bg-surface border-b border-line flex items-center justify-between gap-4 px-4 sm:px-6 relative z-30">
      {/* Marca */}
      <div className="flex items-center gap-3 shrink-0 animate-slide-in">
        <div className="group w-9 h-9 rounded-xl bg-navy-950 dark:bg-gold-400 flex items-center justify-center shadow-soft transition-transform duration-[260ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 hover:-rotate-3">
          <img src="/logo_rh.png" alt="" className="w-6 h-6 object-contain" />
        </div>
        <div className="leading-none hidden sm:block">
          <span className="font-display font-black text-[17px] text-ink tracking-tight">Autodoc</span>
          <span className="font-display font-black text-[17px] text-accent tracking-tight ml-1">RH</span>
        </div>
      </div>

      {/* Links + identidade */}
      <div className="flex items-center gap-1 sm:gap-2 animate-fade-up">
        <button
          onClick={onOpenTags}
          className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[13px] font-semibold text-muted hover:text-ink hover:bg-surface-2"
        >
          <Tags className="w-4 h-4" />
          Tags .docx
        </button>

        <a
          href="#"
          onClick={(e) => { e.preventDefault(); onOpenTags(); }}
          className="hidden lg:inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[13px] font-semibold text-muted hover:text-ink hover:bg-surface-2"
        >
          <HelpCircle className="w-4 h-4" />
          Ajuda
        </a>

        <button
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
          className="w-9 h-9 rounded-full border border-line bg-surface flex items-center justify-center text-muted hover:text-ink hover:border-sand-300 dark:hover:border-navy-600 active:scale-95 transition-[color,border-color,transform] duration-[120ms]"
        >
          <span className="relative w-[17px] h-[17px]">
            <Sun className={cn('absolute inset-0 w-[17px] h-[17px] transition-all duration-[260ms]', theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50')} />
            <Moon className={cn('absolute inset-0 w-[17px] h-[17px] transition-all duration-[260ms]', theme === 'dark' ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100')} />
          </span>
        </button>

        <div className="w-px h-6 bg-line mx-1 hidden sm:block" />

        <div className="relative">
          <button
            onClick={() => setMenu((v) => !v)}
            className="flex items-center gap-2.5 h-11 pl-1 pr-2 rounded-full hover:bg-surface-2"
          >
            <div className="w-9 h-9 rounded-full bg-linear-to-br/oklch from-gold-400 to-gold-600 flex items-center justify-center text-navy-950 font-black text-[11px] shrink-0">
              {initials}
            </div>
            <div className="hidden md:block text-left leading-tight">
              <div className="text-[13px] font-bold text-ink">{user?.name || 'Recursos Humanos'}</div>
              <div className="text-[11px] text-muted">
                @{user?.username} · {user?.role === 'admin' ? 'Administrador' : 'Operador'}
              </div>
            </div>
            <ChevronDown className={cn('w-4 h-4 text-muted transition-transform duration-[180ms] hidden md:block', menu && 'rotate-180')} />
          </button>

          {menu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
              <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-56 rounded-[18px] border border-line bg-surface shadow-pop p-1.5 animate-pop-in origin-top-right">
                <div className="px-3 py-2.5 border-b border-line mb-1.5">
                  <div className="text-[13px] font-bold text-ink truncate">{user?.name}</div>
                  <div className="text-[11px] text-muted truncate">@{user?.username}</div>
                </div>
                <button
                  onClick={() => { setMenu(false); onLogout(); }}
                  className="w-full flex items-center gap-2.5 px-3 h-10 rounded-[12px] text-[13px] font-semibold text-muted hover:text-fail hover:bg-fail/8"
                >
                  <LogOut className="w-4 h-4" />
                  Sair do sistema
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
