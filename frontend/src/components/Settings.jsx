import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Building2, 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2, 
  ShieldCheck, 
  UserPlus, 
  Lock, 
  Briefcase,
  Layers,
  Sparkles
} from 'lucide-react';

export default function Settings({ currentUser }) {
  const [activeTab, setActiveTab] = useState('companies'); // 'companies' | 'users'

  // Estados de Empresas
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [searchCompany, setSearchCompany] = useState('');
  const [companyModal, setCompanyModal] = useState({ isOpen: false, isEdit: false, id: null, name: '', cnpj: '' });

  // Estados de Usuários
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchUser, setSearchUser] = useState('');
  const [userModal, setUserModal] = useState({ isOpen: false, name: '', username: '', password: '', confirmPassword: '', role: 'admin' });

  // Feedback geral
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Carrega empresas
  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const res = await axios.get('/api/companies');
      setCompanies(res.data || []);
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Falha ao carregar lista de empresas.');
    } finally {
      setLoadingCompanies(false);
    }
  };

  // Carrega usuários
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await axios.get('/api/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Falha ao carregar lista de usuários.');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchUsers();
  }, []);

  // --- Funções de Empresa ---

  const maskCNPJ = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
  };

  const handleOpenNewCompany = () => {
    setCompanyModal({ isOpen: true, isEdit: false, id: null, name: '', cnpj: '' });
  };

  const handleOpenEditCompany = (comp) => {
    setCompanyModal({ isOpen: true, isEdit: true, id: comp.id, name: comp.name, cnpj: comp.cnpj });
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    if (!companyModal.name.trim() || !companyModal.cnpj.trim()) {
      showFeedback('error', 'Nome e CNPJ são obrigatórios.');
      return;
    }

    setActionLoading(true);
    try {
      if (companyModal.isEdit) {
        await axios.put(`/api/companies/${companyModal.id}`, {
          name: companyModal.name.trim(),
          cnpj: companyModal.cnpj.trim()
        });
        showFeedback('success', 'Empresa atualizada com sucesso!');
      } else {
        await axios.post('/api/companies', {
          name: companyModal.name.trim(),
          cnpj: companyModal.cnpj.trim()
        });
        showFeedback('success', 'Empresa cadastrada com sucesso!');
      }
      setCompanyModal({ isOpen: false, isEdit: false, id: null, name: '', cnpj: '' });
      fetchCompanies();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Erro ao salvar empresa.';
      showFeedback('error', msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCompany = async (comp) => {
    if (!window.confirm(`Tem certeza que deseja remover a empresa "${comp.name}"?`)) return;

    setActionLoading(true);
    try {
      await axios.delete(`/api/companies/${comp.id}`);
      showFeedback('success', 'Empresa removida com sucesso!');
      fetchCompanies();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Erro ao excluir empresa.';
      showFeedback('error', msg);
    } finally {
      setActionLoading(false);
    }
  };

  // --- Funções de Usuário ---

  const handleOpenNewUser = () => {
    setUserModal({ isOpen: true, name: '', username: '', password: '', confirmPassword: '', role: 'admin' });
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!userModal.name.trim() || !userModal.username.trim() || !userModal.password) {
      showFeedback('error', 'Preencha todos os campos obrigatórios.');
      return;
    }

    if (userModal.password !== userModal.confirmPassword) {
      showFeedback('error', 'As senhas informadas não coincidem.');
      return;
    }

    if (userModal.password.length < 4) {
      showFeedback('error', 'A senha deve conter no mínimo 4 caracteres.');
      return;
    }

    setActionLoading(true);
    try {
      await axios.post('/api/users', {
        name: userModal.name.trim(),
        username: userModal.username.trim().toLowerCase(),
        password: userModal.password,
        role: userModal.role
      });
      showFeedback('success', 'Novo usuário criado com sucesso!');
      setUserModal({ isOpen: false, name: '', username: '', password: '', confirmPassword: '', role: 'admin' });
      fetchUsers();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Erro ao cadastrar usuário.';
      showFeedback('error', msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (u) => {
    if (currentUser && currentUser.id === u.id) {
      showFeedback('error', 'Você não pode excluir sua própria conta enquanto estiver logado.');
      return;
    }

    if (!window.confirm(`Tem certeza que deseja excluir o usuário "${u.username}" (${u.name})?`)) return;

    setActionLoading(true);
    try {
      await axios.delete(`/api/users/${u.id}`);
      showFeedback('success', 'Usuário excluído com sucesso!');
      fetchUsers();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Erro ao excluir usuário.';
      showFeedback('error', msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtros
  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchCompany.toLowerCase()) || 
    c.cnpj.includes(searchCompany)
  );

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchUser.toLowerCase()) || 
    u.username.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Banner de Topo com Título */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-500">Configurações Gerais</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-navy-900 dark:text-white tracking-tight">
            Gestão do Sistema
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Adicione e edite empresas com CNPJ automático ou gerencie os usuários que têm acesso ao portal.
          </p>
        </div>

        {/* Feedback flutuante */}
        {feedback && (
          <div className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg animate-fade-in ${
            feedback.type === 'success' 
              ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
              : 'bg-red-500 text-white shadow-red-500/20'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.message}</span>
          </div>
        )}
      </div>

      {/* Navegação por Abas (Empresas vs Usuários) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-3">
        <button
          onClick={() => setActiveTab('companies')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-200 ${
            activeTab === 'companies'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200/80 dark:border-navy-800'
          }`}
        >
          <Building2 size={17} />
          <span>Empresas Cadastradas</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full ${
            activeTab === 'companies' ? 'bg-black/20 text-white' : 'bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400'
          }`}>
            {companies.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-200 ${
            activeTab === 'users'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200/80 dark:border-navy-800'
          }`}
        >
          <Users size={17} />
          <span>Usuários do Portal</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full ${
            activeTab === 'users' ? 'bg-black/20 text-white' : 'bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400'
          }`}>
            {users.length}
          </span>
        </button>
      </div>

      {/* ================= ABA EMPRESAS ================= */}
      {activeTab === 'companies' && (
        <div className="space-y-6">
          
          {/* Barra de Ações: Busca + Botão Adicionar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchCompany}
                onChange={(e) => setSearchCompany(e.target.value)}
                placeholder="Pesquisar por razão social ou CNPJ..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 text-sm text-navy-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500/60 shadow-sm transition-colors"
              />
            </div>

            <button
              onClick={handleOpenNewCompany}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-md shadow-orange-500/25 flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all shrink-0"
            >
              <Plus size={18} />
              <span>Adicionar Empresa</span>
            </button>
          </div>

          {/* Tabela de Empresas */}
          <div className="bg-white dark:bg-navy-900 rounded-3xl shadow-[0_4px_25px_-4px_rgba(15,23,42,0.06)] border border-slate-200/80 dark:border-navy-800/80 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50/80 dark:bg-navy-950/60 text-[11px] uppercase font-bold text-slate-400 dark:text-slate-400 tracking-wider border-b border-slate-100 dark:border-navy-800">
                  <tr>
                    <th className="p-4 pl-6 whitespace-nowrap">Razão Social / Empresa</th>
                    <th className="p-4 whitespace-nowrap">CNPJ</th>
                    <th className="p-4 whitespace-nowrap">Cadastrada Em</th>
                    <th className="p-4 text-right pr-6 whitespace-nowrap">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800/70">
                  {loadingCompanies ? (
                    <tr>
                      <td colSpan="4" className="p-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 size={24} className="animate-spin text-orange-500" />
                          <span className="text-xs">Carregando empresas...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredCompanies.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-12 text-center text-slate-400 text-xs">
                        Nenhuma empresa encontrada para o filtro.
                      </td>
                    </tr>
                  ) : (
                    filteredCompanies.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-navy-800/40 transition-colors group">
                        <td className="p-4 pl-6 font-bold text-navy-900 dark:text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs shrink-0 border border-orange-200/60 dark:border-orange-900/40">
                              <Building2 size={16} />
                            </div>
                            <span className="truncate max-w-md">{c.name}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {c.cnpj}
                        </td>
                        <td className="p-4 text-xs text-slate-400 whitespace-nowrap">
                          {c.created_at || 'Sistema Base'}
                        </td>
                        <td className="p-4 pr-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditCompany(c)}
                              className="p-2 rounded-xl text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors"
                              title="Editar Empresa"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteCompany(c)}
                              className="p-2 rounded-xl text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                              title="Excluir Empresa"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= ABA USUÁRIOS ================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          
          {/* Barra de Ações: Busca + Botão Criar Usuário */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Pesquisar por nome ou login de usuário..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 text-sm text-navy-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500/60 shadow-sm transition-colors"
              />
            </div>

            <button
              onClick={handleOpenNewUser}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-md shadow-orange-500/25 flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all shrink-0"
            >
              <UserPlus size={18} />
              <span>Criar Novo Usuário</span>
            </button>
          </div>

          {/* Tabela de Usuários */}
          <div className="bg-white dark:bg-navy-900 rounded-3xl shadow-[0_4px_25px_-4px_rgba(15,23,42,0.06)] border border-slate-200/80 dark:border-navy-800/80 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50/80 dark:bg-navy-950/60 text-[11px] uppercase font-bold text-slate-400 dark:text-slate-400 tracking-wider border-b border-slate-100 dark:border-navy-800">
                  <tr>
                    <th className="p-4 pl-6 whitespace-nowrap">Colaborador / Nome</th>
                    <th className="p-4 whitespace-nowrap">Usuário de Login</th>
                    <th className="p-4 whitespace-nowrap">Nível de Acesso</th>
                    <th className="p-4 whitespace-nowrap">Criado Em</th>
                    <th className="p-4 text-right pr-6 whitespace-nowrap">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800/70">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan="5" className="p-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 size={24} className="animate-spin text-orange-500" />
                          <span className="text-xs">Carregando usuários...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-12 text-center text-slate-400 text-xs">
                        Nenhum usuário localizado.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isMe = currentUser && currentUser.id === u.id;
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-navy-800/40 transition-colors group">
                          <td className="p-4 pl-6 font-bold text-navy-900 dark:text-white">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-200/60 dark:border-blue-900/40">
                                {u.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span>{u.name}</span>
                                {isMe && (
                                  <span className="ml-2 text-[10px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-950/50 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-900/40">
                                    Você
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                            @{u.username}
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-navy-800 text-navy-900 dark:text-slate-200 border border-slate-200/60 dark:border-navy-700">
                              <ShieldCheck size={13} className="text-orange-500" />
                              {u.role === 'admin' ? 'Administrador' : 'Operador RH'}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-slate-400 whitespace-nowrap">
                            {u.created_at}
                          </td>
                          <td className="p-4 pr-6 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteUser(u)}
                              disabled={isMe || users.length <= 1}
                              className="p-2 rounded-xl text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent"
                              title={isMe ? "Você não pode se excluir" : "Excluir Usuário"}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL DE EMPRESA ================= */}
      {companyModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-navy-800 w-full max-w-lg overflow-hidden animate-scale-up">
            
            <div className="p-6 bg-navy-950 text-white flex items-center justify-between border-b border-navy-800/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-2xl">
                  <Building2 size={20} className="text-orange-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">
                    {companyModal.isEdit ? 'Editar Empresa' : 'Adicionar Nova Empresa'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    O CNPJ será inserido automaticamente nos contratos gerados.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setCompanyModal(prev => ({ ...prev, isOpen: false }))}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Razão Social / Nome da Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={companyModal.name}
                  onChange={(e) => setCompanyModal(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
                  placeholder="EX: LAGOA HOTELARIA E TURISMO LTDA"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-sm text-navy-900 dark:text-white uppercase focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  CNPJ Formatado *
                </label>
                <input
                  type="text"
                  required
                  maxLength={18}
                  value={companyModal.cnpj}
                  onChange={(e) => setCompanyModal(prev => ({ ...prev, cnpj: maskCNPJ(e.target.value) }))}
                  placeholder="00.000.000/0000-00"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-sm font-mono text-navy-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setCompanyModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                  <span>{companyModal.isEdit ? 'Salvar Alterações' : 'Cadastrar Empresa'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ================= MODAL DE CRIAR USUÁRIO ================= */}
      {userModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-navy-800 w-full max-w-lg overflow-hidden animate-scale-up">
            
            <div className="p-6 bg-navy-950 text-white flex items-center justify-between border-b border-navy-800/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-2xl">
                  <UserPlus size={20} className="text-orange-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Criar Novo Usuário</h3>
                  <p className="text-xs text-slate-400">Defina os dados de login e acesso ao portal.</p>
                </div>
              </div>
              <button 
                onClick={() => setUserModal(prev => ({ ...prev, isOpen: false }))}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={userModal.name}
                  onChange={(e) => setUserModal(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Mariana Silva"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-sm text-navy-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Usuário de Login *
                </label>
                <input
                  type="text"
                  required
                  value={userModal.username}
                  onChange={(e) => setUserModal(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/\s+/g, '') }))}
                  placeholder="Ex: mariana.silva"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-sm font-mono text-navy-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Senha de Acesso *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={userModal.password}
                    onChange={(e) => setUserModal(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Mín. 4 caracteres"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-sm text-navy-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Confirmar Senha *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={userModal.confirmPassword}
                    onChange={(e) => setUserModal(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Repita a senha"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-sm text-navy-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Nível de Acesso
                </label>
                <select
                  value={userModal.role}
                  onChange={(e) => setUserModal(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-sm text-navy-900 dark:text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="admin">Administrador (Acesso Completo + Configurações)</option>
                  <option value="operador">Operador RH (Geração de Contratos + Métricas)</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setUserModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                  <span>Cadastrar Usuário</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
