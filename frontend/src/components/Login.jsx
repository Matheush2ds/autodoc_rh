import React, { useState } from 'react';
import axios from 'axios';
import { User, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Por favor, informe seu usuário e senha.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/auth/login', {
        username: username.trim(),
        password
      });

      if (response.data && response.data.user) {
        onLoginSuccess(response.data.user);
      } else {
        setError('Resposta inesperada do servidor.');
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Não foi possível conectar ao servidor. Verifique sua conexão.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-[#070b14] via-[#0d1629] to-[#090f1f] text-slate-100 relative overflow-hidden">
      
      {/* Elementos Decorativos de Fundo (Glows sutis) */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        
        {/* Card Principal do Formulário */}
        <div className="bg-white/[0.04] backdrop-blur-xl rounded-3xl p-7 sm:p-9 border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] relative overflow-hidden">
          
          {/* Barra de brilho superior */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600"></div>

          {/* Cabeçalho da Logo & Boas-vindas */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center bg-white p-2.5 rounded-2xl shadow-[0_4px_20px_rgba(249,115,22,0.3)] border border-white/30 mb-4 hover:scale-105 transition-transform duration-300">
              <img src="/logo_rh.png" alt="Autodoc RH Logo" className="h-10 w-10 object-contain" />
            </div>

            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-300">Autodoc</span>
              <span className="font-display font-black text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500">RH</span>
            </div>

            <p className="text-xs text-slate-400 font-medium">Acesso Restrito • Gestão & Admissão</p>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5 animate-fade-in">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Campo de Usuário */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Usuário / Login
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: admin"
                  autoFocus
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/[0.06] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500/60 focus:bg-white/[0.09] transition-all"
                />
              </div>
            </div>

            {/* Campo de Senha */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-2xl bg-white/[0.06] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500/60 focus:bg-white/[0.09] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Botão de Entrar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm shadow-[0_4px_20px_rgba(249,115,22,0.35)] hover:shadow-[0_6px_25px_rgba(249,115,22,0.45)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Rodapé institucional */}
        <p className="text-center text-[11px] text-slate-500 mt-5">
          Autodoc RH v2.0 • Propriedade Corporativa Interna
        </p>

      </div>
    </div>
  );
}
