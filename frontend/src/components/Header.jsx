import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  ChevronRight, 
  LayoutDashboard, 
  FileText, 
  Truck, 
  GraduationCap, 
  HelpCircle, 
  X, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck,
  Sun,
  Moon,
  Settings,
  LogOut
} from 'lucide-react';

export default function Header({ activeTab, currentType, onToggleMobile, theme, onToggleTheme, currentUser, onLogout }) {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [copiedTag, setCopiedTag] = useState(null);

  const getPageInfo = () => {
    if (activeTab === 'dashboard') {
      return {
        category: 'Painel Geral',
        title: 'Dashboard de Produtividade',
        badge: 'Tempo Real',
        icon: LayoutDashboard,
        color: 'text-navy-900 dark:text-gold-400',
        bg: 'bg-navy-50 dark:bg-navy-900'
      };
    }
    if (activeTab === 'settings') {
      return {
        category: 'Configurações',
        title: 'Gestão de Empresas & Acessos',
        badge: 'Administração',
        icon: Settings,
        color: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-50 dark:bg-orange-950/50'
      };
    }
    if (currentType === 'motorista') {
      return {
        category: 'Geração de Contratos',
        title: 'Contrato Motorista',
        badge: 'CNH Obrigatória',
        icon: Truck,
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950/50'
      };
    }
    if (currentType === 'aprendiz') {
      return {
        category: 'Geração de Contratos',
        title: 'Menor Aprendiz',
        badge: 'Lei Aprendizagem',
        icon: GraduationCap,
        color: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-50 dark:bg-purple-950/50'
      };
    }
    return {
      category: 'Geração de Contratos',
      title: 'Funcionário Regular',
      badge: 'CLT Padrão',
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/50'
    };
  };

  const pageInfo = getPageInfo();
  const Icon = pageInfo.icon;

  const docxTags = [
    { tag: '{{ name_id }}', desc: 'Nome Completo do Funcionário' },
    { tag: '{{ cpf_id }}', desc: 'CPF formatado' },
    { tag: '{{ rg_id }}', desc: 'Número do RG' },
    { tag: '{{ orgao_id }}', desc: 'Órgão Emissor do RG' },
    { tag: '{{ estadocivil_id }}', desc: 'Estado Civil' },
    { tag: '{{ nacionalidade_id }}', desc: 'Nacionalidade' },
    { tag: '{{ endereco_id }}', desc: 'Endereço Completo' },
    { tag: '{{ cargo_id }}', desc: 'Cargo / Função' },
    { tag: '{{ setor_id }}', desc: 'Setor de Alocação' },
    { tag: '{{ salario_id }}', desc: 'Salário numérico (ex: R$ 2.500,00)' },
    { tag: '{{ salarioextenso_id }}', desc: 'Salário por extenso automático' },
    { tag: '{{ empresa_id }}', desc: 'Razão Social da Empresa' },
    { tag: '{{ cnpj_id }}', desc: 'CNPJ da Empresa' },
    { tag: '{{ horario_id }}', desc: 'Jornada e Horário de Trabalho' },
    { tag: '{{ date_id }}', desc: 'Data de Admissão por extenso' },
    { tag: '{{ datetoday_id }}', desc: 'Data de hoje por extenso' },
    { tag: '{{ cnh_id }}', desc: 'Número da CNH (Motoristas)' },
    { tag: '{{ categoria_id }}', desc: 'Categoria da CNH (Motoristas)' },
    { tag: '{{ utiliza_id }}', desc: '"X" se optou por Vale Transporte' },
    { tag: '{{ nutiliza_id }}', desc: '"X" se NÃO optou por Vale Transporte' },
  ];

  const handleCopy = (tag) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 2000);
  };

  return (
    <>
      {/* HEADER ENCOSTADO NO SIDEBAR: w-full h-20 px-4 md:px-8 sem margens externas */}
      <header className="sticky top-0 z-30 w-full h-20 bg-white/95 dark:bg-navy-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-navy-800/80 shadow-sm transition-colors duration-300 flex items-center px-4 sm:px-6 md:px-8 shrink-0">
        <div className="w-full flex items-center justify-between gap-3 md:gap-4">
          
          {/* LADO ESQUERDO: Botão Mobile + Breadcrumb */}
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            {/* Botão Mobile Hamburger */}
            <button
              onClick={onToggleMobile}
              className="md:hidden p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-900 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-200 transition-colors shrink-0"
              title="Abrir Menu Lateral"
              aria-label="Abrir Menu Lateral"
            >
              <Menu size={20} />
            </button>

            {/* Ícone da Seção */}
            <div className={`p-2.5 rounded-xl ${pageInfo.bg} ${pageInfo.color} shadow-sm shrink-0 hidden sm:flex items-center justify-center border border-black/5 dark:border-white/5`}>
              <Icon size={20} />
            </div>

            {/* Breadcrumb e Título */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-400 font-medium">
                <span className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Autodoc RH</span>
                <ChevronRight size={12} className="text-slate-300 dark:text-navy-700" />
                <span className="text-slate-500 dark:text-slate-300 truncate">{pageInfo.category}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <h2 className="text-base sm:text-lg font-bold text-navy-900 dark:text-white tracking-tight truncate">
                  {pageInfo.title}
                </h2>
                <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-navy-800">
                  {pageInfo.badge}
                </span>
              </div>
            </div>
          </div>

          {/* LADO DIREITO: Tema (Dark/Light) + Tags + Perfil RH */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            {/* Botão de Alternar Modo Claro / Escuro */}
            <button
              onClick={onToggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-900 dark:hover:bg-navy-800 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-gold-400 transition-all duration-200 shadow-sm relative group"
              title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? (
                <Sun size={18} className="transition-transform group-hover:rotate-45" />
              ) : (
                <Moon size={18} className="transition-transform group-hover:-rotate-12 text-navy-800" />
              )}
            </button>

            {/* Botão Guia de Tags .docx */}
            <button
              onClick={() => setShowHelpModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-gold-50 hover:text-gold-700 hover:border-gold-300 dark:bg-navy-900 dark:hover:bg-navy-800 dark:text-slate-200 dark:hover:text-gold-400 border border-slate-200 dark:border-navy-800 text-xs font-semibold text-slate-700 transition-all duration-200 shadow-sm"
              title="Guia de Tags Word (.docx)"
            >
              <HelpCircle size={15} className="text-gold-500" />
              <span className="hidden sm:inline">Tags .docx</span>
            </button>

            {/* Divisor vertical */}
            <div className="h-6 w-px bg-slate-200 dark:bg-navy-800 hidden sm:block"></div>

            {/* Perfil RH e Botão de Logout */}
            <div className="flex items-center gap-2 pl-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 border border-orange-400/40 flex items-center justify-center text-white font-black text-xs shadow-sm shrink-0">
                {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : 'RH'}
              </div>
              <div className="hidden md:block text-left leading-tight">
                <div className="text-xs font-bold text-navy-900 dark:text-white flex items-center gap-1">
                  {currentUser?.name || 'Recursos Humanos'}
                  <ShieldCheck size={12} className="text-blue-500" />
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">
                  {currentUser ? `@${currentUser.username} • ${currentUser.role === 'admin' ? 'Administrador' : 'Operador'}` : 'Equipe de Admissão'}
                </div>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="ml-1 p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  title="Sair do Sistema"
                  aria-label="Sair do Sistema"
                >
                  <LogOut size={17} />
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* MODAL DE AJUDA COM TAGS DOCX */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-navy-800 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            
            {/* Header do Modal */}
            <div className="p-6 bg-navy-950 text-white flex items-center justify-between shrink-0 border-b border-navy-800/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-2xl">
                  <Sparkles size={20} className="text-gold-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Guia de Tags para Templates Word</h3>
                  <p className="text-xs text-slate-400">Clique em qualquer tag para copiar e colar no seu documento .docx</p>
                </div>
              </div>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Lista de Tags */}
            <div className="p-6 overflow-y-auto space-y-2.5 flex-1 custom-scrollbar">
              {docxTags.map((item, index) => (
                <div 
                  key={index}
                  onClick={() => handleCopy(item.tag)}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 dark:border-navy-800 hover:border-gold-300 dark:hover:border-gold-500/50 hover:bg-gold-50/40 dark:hover:bg-navy-800/60 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <code className="text-xs font-mono font-bold text-navy-900 dark:text-gold-400 bg-slate-100 dark:bg-navy-950 group-hover:bg-gold-100/60 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-navy-800 transition-colors shrink-0">
                      {item.tag}
                    </code>
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate">
                      {item.desc}
                    </span>
                  </div>
                  <div className="shrink-0 text-slate-400 group-hover:text-gold-600 dark:group-hover:text-gold-400 ml-2">
                    {copiedTag === item.tag ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                        <Check size={14} /> Copiado!
                      </span>
                    ) : (
                      <Copy size={15} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Rodapé do Modal */}
            <div className="p-4 bg-slate-50 dark:bg-navy-950 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Templates em <code>docx_templates/</code></span>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="px-5 py-2.5 bg-navy-900 hover:bg-navy-800 text-white rounded-xl font-semibold transition-colors"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
