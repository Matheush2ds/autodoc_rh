import React, { useState } from 'react';
import { LayoutDashboard, FileText, Truck, GraduationCap, Menu, X, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';

export default function Sidebar({ activeTab, currentType, onNavigate }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // Estado para Desktop

  const navItems = [
    { category: "Geral", items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, type: null }
    ]},
    { category: "Contratos", items: [
        { id: 'form', label: 'Funcionário Regular', icon: FileText, type: 'regular' },
        { id: 'form', label: 'Motoristas', icon: Truck, type: 'motorista' },
        { id: 'form', label: 'Menor Aprendiz', icon: GraduationCap, type: 'aprendiz' },
    ]}
  ];

  const handleItemClick = (id, type) => {
    onNavigate(id, type);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Botão Mobile (Só aparece em telas pequenas) */}
      <button 
        onClick={() => setIsMobileOpen(!isMobileOpen)} 
        className="md:hidden fixed top-4 right-4 z-50 p-2.5 bg-navy-900 text-white rounded-xl shadow-lg hover:bg-navy-800 transition-colors"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Container */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 bg-navy-950 text-white flex flex-col border-r border-navy-800/50
        transition-all duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'md:w-20' : 'md:w-72'}
      `}>
        
        {/* LOGO AREA */}
        <div className={`h-20 flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-6'} border-b border-navy-800/50 bg-navy-900/30 shrink-0 transition-all overflow-hidden`}>
          <div className="flex items-center gap-3">
             <div className="bg-white p-1.5 rounded-lg shadow-glow shrink-0 transition-transform duration-300">
                <img src="/logo_rh.png" alt="Logo" className="h-8 w-8 object-contain" />
             </div>
             
             {/* Texto da Logo (some se recolhido) */}
             <div className={`transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>
                <h1 className="font-bold text-lg tracking-tight text-white leading-none whitespace-nowrap">Autodoc RH</h1>
                <p className="text-[10px] uppercase tracking-wider text-gold-500 font-bold mt-1 whitespace-nowrap">Enterprise</p>
             </div>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto py-6 space-y-8 custom-scrollbar overflow-x-hidden">
          {navItems.map((section, idx) => (
            <div key={idx} className="px-3">
              {!isCollapsed && (
                <h3 className="px-3 text-[10px] font-bold text-navy-600 uppercase tracking-widest mb-2 transition-opacity duration-300">
                    {section.category}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item, itemIdx) => {
                  const isActive = activeTab === item.id && (item.type === null || currentType === item.type);
                  return (
                    <button
                      key={itemIdx}
                      onClick={() => handleItemClick(item.id, item.type)}
                      title={isCollapsed ? item.label : ""}
                      className={`
                        group w-full flex items-center relative rounded-xl transition-all duration-200 font-medium
                        ${isCollapsed ? 'justify-center p-3' : 'justify-start px-4 py-3 text-sm'}
                        ${isActive 
                          ? 'bg-gradient-to-r from-navy-800 to-navy-900 text-gold-400 border border-navy-700/50 shadow-inner' 
                          : 'text-slate-400 hover:text-white hover:bg-navy-900/50'
                        }
                      `}
                    >
                      <item.icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-gold-500' : 'text-slate-500 group-hover:text-slate-300'}`} />
                      
                      {!isCollapsed && (
                          <span className="ml-3 whitespace-nowrap transition-opacity duration-300">
                              {item.label}
                          </span>
                      )}

                      {/* Bolinha Indicadora (só aparece se ativo) */}
                      {isActive && (
                          <div className={`absolute ${isCollapsed ? 'top-2 right-2' : 'right-3'} w-1.5 h-1.5 rounded-full bg-gold-500 shadow-glow`}></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer: Botão de Recolher (Apenas Desktop) */}
        <div className="hidden md:flex p-4 border-t border-navy-800/50 bg-navy-900/30 justify-end">
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
            >
                {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
        </div>
      </aside>

      {/* Overlay Mobile */}
      {isMobileOpen && (
        <div onClick={() => setIsMobileOpen(false)} className="fixed inset-0 z-30 bg-navy-950/80 backdrop-blur-sm md:hidden" />
      )}
    </>
  );
}