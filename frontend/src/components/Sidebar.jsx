import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Truck, 
  GraduationCap, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Sun,
  Moon,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Settings
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  currentType, 
  onNavigate, 
  isMobileOpen: propMobileOpen, 
  setIsMobileOpen: propSetMobileOpen,
  theme,
  onToggleTheme,
  currentUser,
  onLogout
}) {
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isMobileOpen = propMobileOpen !== undefined ? propMobileOpen : internalMobileOpen;
  const setIsMobileOpen = propSetMobileOpen || setInternalMobileOpen;

  const navItems = [
    { 
      category: "Visão Geral", 
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, type: null }
      ]
    },
    { 
      category: "Contratos Admissionais", 
      items: [
        { id: 'form', label: 'Funcionário Regular', icon: FileText, type: 'regular' },
        { id: 'form', label: 'Motoristas', icon: Truck, type: 'motorista' },
        { id: 'form', label: 'Menor Aprendiz', icon: GraduationCap, type: 'aprendiz' },
      ]
    },
    {
      category: "Sistema & Gestão",
      items: [
        { id: 'settings', label: 'Configurações', icon: Settings, type: null }
      ]
    }
  ];

  const handleItemClick = (id, type) => {
    onNavigate(id, type);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Sidebar Container */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 md:z-40 text-white flex flex-col
        transition-all duration-300 ease-in-out shrink-0 overflow-hidden
        ${isMobileOpen 
          ? 'translate-x-0 w-[84vw] max-w-[320px] rounded-r-[28px] md:rounded-none shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border-r border-white/15 dark:border-slate-700/60 bg-gradient-to-b from-[#0d1527] via-[#111c34] to-[#090e1a]' 
          : '-translate-x-full md:translate-x-0 bg-navy-950 dark:bg-[#141e36] border-r border-navy-800/60 dark:border-slate-700/40'
        }
        ${isCollapsed ? 'md:w-20' : 'md:w-72'}
      `}>
        
        {/* Glow sutil no topo do menu mobile */}
        <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-orange-500/10 via-transparent to-transparent pointer-events-none"></div>

        {/* LOGO AREA - Altura h-20 alinhada perfeitamente com o Header */}
        <div className={`h-20 flex items-center justify-between ${isCollapsed ? 'justify-center px-0' : 'px-5 sm:px-6'} border-b border-white/10 dark:border-slate-700/50 bg-white/[0.02] dark:bg-black/20 shrink-0 transition-all duration-300 relative z-10`}>
          <div className="flex items-center gap-3">
             {/* Logo Icon com acabamento vítreo */}
             <div className="bg-white p-1.5 rounded-2xl shadow-[0_4px_16px_rgba(249,115,22,0.2)] shrink-0 transition-all duration-300 hover:scale-105 border border-white/30">
                <img src="/logo_rh.png" alt="Logo" className="h-8 w-8 object-contain" />
             </div>
             
             {/* Texto da Logo com gradiente e tipografia moderna */}
             <div className={`flex flex-col justify-center transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-300 leading-none">
                    Autodoc
                  </span>
                </div>
                <span className="font-display font-black text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 leading-none drop-shadow-[0_2px_8px_rgba(249,115,22,0.4)] mt-1">
                  RH
                </span>
             </div>
          </div>

          {/* Botão Fechar estilizado para o Drawer Mobile */}
          {isMobileOpen && (
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-white/10 shadow-sm"
              aria-label="Fechar menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Card Exclusivo do Menu Mobile: Status do Sistema & RH */}
        <div className="md:hidden px-4 pt-4 pb-2 relative z-10">
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-inner flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-xs shadow-md shrink-0">
                {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : 'RH'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {currentUser?.name || 'Portal Admissional'}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)] shrink-0"></span>
                  <span className="truncate">@{currentUser?.username || 'admin'} • {currentUser?.role === 'admin' ? 'Admin' : 'Operador'}</span>
                </div>
              </div>
            </div>
            <ShieldCheck size={16} className="text-orange-400 opacity-80 shrink-0 ml-2" />
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar overflow-x-hidden relative z-10">
          {navItems.map((section, idx) => (
            <div key={idx}>
              {!isCollapsed && (
                <div className="flex items-center gap-2 px-3 mb-2">
                  <span className="w-1 h-1 rounded-full bg-orange-400"></span>
                  <h3 className="text-[10px] font-extrabold text-slate-400/90 uppercase tracking-widest">
                    {section.category}
                  </h3>
                </div>
              )}
              <div className="space-y-1.5">
                {section.items.map((item, itemIdx) => {
                  const isActive = activeTab === item.id && (item.type === null || currentType === item.type);
                  return (
                    <button
                      key={itemIdx}
                      onClick={() => handleItemClick(item.id, item.type)}
                      title={isCollapsed ? item.label : ""}
                      className={`
                        group w-full flex items-center relative rounded-2xl font-medium min-h-[46px]
                        transition-all duration-300 ease-out transform
                        ${isCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5 text-sm'}
                        ${isActive 
                          ? 'bg-gradient-to-r from-orange-500/25 via-amber-500/15 to-transparent text-white border border-orange-500/40 shadow-[0_4px_16px_rgba(249,115,22,0.15)] font-bold' 
                          : 'text-slate-300 hover:text-white hover:bg-white/[0.08] hover:translate-x-1 hover:shadow-sm'
                        }
                      `}
                    >
                      {/* Lado Esquerdo: Ícone + Título */}
                      <div className="flex items-center min-w-0">
                        {/* Ícone com gradiente */}
                        <div className={`p-2 rounded-xl transition-all duration-300 ease-out shrink-0 ${
                          isActive 
                            ? 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-md' 
                            : 'text-slate-400 group-hover:text-orange-400 group-hover:scale-105 group-hover:bg-white/10'
                        }`}>
                          <item.icon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300" />
                        </div>
                        
                        {!isCollapsed && (
                          <span className="ml-3 truncate tracking-tight">
                            {item.label}
                          </span>
                        )}
                      </div>

                      {/* Lado Direito: Badge e Indicador Ativo */}
                      {!isCollapsed && (
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {item.badge && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                              isActive 
                                ? 'bg-orange-500/30 text-orange-300 border border-orange-500/40' 
                                : 'bg-white/10 text-slate-400 group-hover:text-slate-200'
                            }`}>
                              {item.badge}
                            </span>
                          )}

                          {/* Bolinha Indicadora Ativa com Glow Laranja */}
                          {isActive && (
                            <span className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.9)] animate-pulse"></span>
                          )}
                        </div>
                      )}

                      {/* Indicador sutil de borda esquerda no ativo */}
                      {isActive && (
                        <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-orange-400 to-amber-500"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer para Mobile: Alternador de Tema + Info do App */}
        <div className="md:hidden p-4 border-t border-white/10 bg-white/[0.02] space-y-3 relative z-10">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-all"
            >
              <div className="flex items-center gap-2">
                {theme === 'dark' ? (
                  <Sun size={16} className="text-amber-400" />
                ) : (
                  <Moon size={16} className="text-blue-300" />
                )}
                <span>{theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 bg-white/10 px-2 py-0.5 rounded-md">
                {theme === 'dark' ? 'Escuro' : 'Claro'}
              </span>
            </button>
          )}

          <div className="flex items-center justify-between text-[10px] text-slate-400/80 px-1 pt-1">
            <span>Autodoc RH • Corporativo</span>
          </div>
        </div>

        {/* Footer para Desktop: Recolher Sidebar */}
        <div className={`hidden md:flex p-4 border-t border-navy-800/60 dark:border-slate-700/50 bg-navy-900/30 dark:bg-[#192440]/40 items-center ${isCollapsed ? 'justify-center' : 'justify-end'} relative z-10`}>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2.5 rounded-xl text-slate-400 hover:text-orange-400 hover:bg-white/10 dark:hover:bg-white/10 hover:scale-110 active:scale-95 transition-all duration-300"
            title={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </aside>

      {/* Overlay Mobile com animação suave e desfoque */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)} 
          className="fixed inset-0 z-40 bg-slate-950/75 dark:bg-black/85 backdrop-blur-md md:hidden animate-fade-in transition-opacity duration-300" 
        />
      )}
    </>
  );
}