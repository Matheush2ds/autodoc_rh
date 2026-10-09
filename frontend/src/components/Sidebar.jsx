import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Building2, FileText, GraduationCap, LayoutDashboard, Layers, Search, Tags, Truck, Users, X,
} from 'lucide-react';
import { cn } from '../lib/ui';

export const NAV_GROUPS = [
  [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'form:regular', label: 'Funcionário Regular', icon: FileText },
    { id: 'form:motorista', label: 'Motorista', icon: Truck },
    { id: 'form:aprendiz', label: 'Menor Aprendiz', icon: GraduationCap },
  ],
  [
    { id: 'history', label: 'Histórico de Kits', icon: Layers },
    { id: 'companies', label: 'Empresas', icon: Building2 },
    { id: 'users', label: 'Usuários', icon: Users },
  ],
];

export default function Sidebar({
  route,
  onNavigate,
  query,
  onQuery,
  searchPlaceholder,
  onOpenTags,
  mobileOpen,
  onCloseMobile,
}) {
  const navRef = useRef(null);
  const itemRefs = useRef({});
  const [bar, setBar] = useState(null);
  const [ready, setReady] = useState(false);

  // A barra do item ativo desliza entre os itens em vez de sumir e reaparecer.
  useLayoutEffect(() => {
    const el = itemRefs.current[route];
    const nav = navRef.current;
    if (!el || !nav) {
      setBar(null);
      return;
    }
    const top = el.offsetTop + (el.offsetHeight - 20) / 2;
    setBar({ top, height: 20 });
  }, [route]);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  const searchRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm md:hidden animate-fade-in"
        />
      )}

      <aside
        className={cn(
          'w-[248px] shrink-0 bg-surface border-r border-line flex flex-col',
          'fixed md:static inset-y-0 left-0 z-50 md:z-auto',
          'transition-transform duration-[260ms] ease-[cubic-bezier(0.2,0,0,1)]',
          mobileOpen ? 'translate-x-0 shadow-pop' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Busca dentro da sidebar — como na referência 02 */}
        <div className="p-3 border-b border-line shrink-0 animate-fade-up">
          <div className="relative group/search">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted transition-[color,transform] duration-[180ms] group-focus-within/search:text-accent group-focus-within/search:scale-110" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder={searchPlaceholder || 'Buscar...'}
              className="w-full h-10 rounded-[12px] border border-line bg-surface-2 pl-9 pr-14 text-[13px] font-medium text-ink placeholder:text-muted placeholder:font-normal outline-none transition-[border-color,box-shadow] duration-[180ms] focus:border-accent focus:bg-surface focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--app-accent)_14%,transparent)]"
            />
            {query ? (
              <button
                onClick={() => onQuery('')}
                aria-label="Limpar busca"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md border border-line bg-surface px-1.5 py-0.5 text-[10px] font-bold text-muted">
                ⌘K
              </kbd>
            )}
          </div>
        </div>

        {/* Navegação */}
        <nav ref={navRef} className="relative flex-1 overflow-y-auto scroll-slim p-3 min-h-0">
          {/* Barra deslizante do item ativo */}
          {bar && (
            <span
              aria-hidden
              className={cn(
                'absolute left-0 w-[3px] rounded-r-full bg-accent',
                ready && 'transition-[top,height] duration-[260ms] ease-[cubic-bezier(0.2,0,0,1)]'
              )}
              style={{ top: bar.top, height: bar.height }}
            />
          )}

          {NAV_GROUPS.map((group, gi) => {
            // índice corrido entre os grupos, para o stagger não reiniciar
            const offset = NAV_GROUPS.slice(0, gi).reduce((n, g) => n + g.length, 0);
            return (
              <div key={gi} className={cn(gi > 0 && 'mt-3 pt-3 border-t border-line')}>
                {group.map((item, idx) => {
                  const active = route === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      ref={(el) => (itemRefs.current[item.id] = el)}
                      onClick={() => { onNavigate(item.id); onCloseMobile?.(); }}
                      style={{ '--i': offset + idx }}
                      className={cn(
                        'group/nav w-full h-11 px-3 rounded-[12px] flex items-center gap-3 text-[13px] mb-0.5',
                        'transition-[background-color,color] duration-[120ms]',
                        'animate-slide-in stagger-fast',
                        active
                          ? 'tint-accent text-ink font-bold'
                          : 'text-muted font-semibold hover:bg-surface-2 hover:text-ink'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-[18px] h-[18px] shrink-0',
                          'transition-[transform,color] duration-[180ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                          active
                            ? 'text-accent scale-110'
                            : 'group-hover/nav:translate-x-0.5 group-hover/nav:scale-105'
                        )}
                      />
                      <span
                        className={cn(
                          'truncate transition-transform duration-[180ms]',
                          !active && 'group-hover/nav:translate-x-0.5'
                        )}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Card do rodapé — o slot promocional da 02, com função real */}
        <div className="p-3 shrink-0 animate-fade-up stagger" style={{ '--i': 5 }}>
          <div className="group/card relative overflow-hidden rounded-[18px] bg-linear-to-br/oklch from-navy-900 to-navy-950 p-4 text-white transition-shadow duration-[260ms] hover:shadow-lift">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gold-400/15 blur-2xl transition-transform duration-[700ms] ease-[cubic-bezier(0.05,0.7,0.1,1)] group-hover/card:scale-150" />
            <div className="relative">
              <div className="w-8 h-8 rounded-[10px] bg-white/10 flex items-center justify-center mb-3 transition-transform duration-[260ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/card:scale-110 group-hover/card:-rotate-6">
                <Tags className="w-4 h-4 text-gold-400" />
              </div>
              <div className="text-[13px] font-bold leading-tight">Guia de tags .docx</div>
              <p className="text-[11px] text-white/55 mt-1 leading-snug">
                As variáveis que o sistema injeta nos seus templates Word.
              </p>
              <button
                onClick={onOpenTags}
                className="mt-3 w-full h-8 rounded-full bg-white text-navy-950 text-[11px] font-bold hover:bg-gold-200 active:scale-[0.98] transition-[background-color,transform] duration-[120ms]"
              >
                Ver tags
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
