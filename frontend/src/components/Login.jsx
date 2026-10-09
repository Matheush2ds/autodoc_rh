import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { AlertCircle, ArrowRight, Check, Eye, EyeOff, FileText, GraduationCap, Loader2, Lock, Truck, User } from 'lucide-react';
import { cn } from '../lib/ui';

const REMEMBER_KEY = 'autodoc_remember';

export default function Login({ onLoginSuccess }) {
  const remembered = (() => {
    try {
      return JSON.parse(localStorage.getItem(REMEMBER_KEY) || 'null');
    } catch {
      return null;
    }
  })();

  const [username, setUsername] = useState(remembered?.username || '');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(Boolean(remembered));
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | success
  const [error, setError] = useState(null);
  const [shake, setShake] = useState(0);
  const passwordRef = useRef(null);

  // Se o usuário já veio preenchido, o foco vai direto para a senha.
  useEffect(() => {
    if (remembered?.username) passwordRef.current?.focus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Informe seu usuário e senha para continuar.');
      setShake((n) => n + 1);
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      const { data } = await axios.post('/api/auth/login', {
        username: username.trim(),
        password,
        remember,
      });

      if (!data?.user) throw new Error('Resposta inesperada do servidor.');

      // "Manter-me conectado" guarda o usuário — nunca a senha.
      // A senha, quem salva é o gerenciador do próprio navegador,
      // graças aos atributos autocomplete abaixo.
      if (remember) {
        localStorage.setItem(REMEMBER_KEY, JSON.stringify({ username: username.trim() }));
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      setStatus('success');
      setTimeout(() => onLoginSuccess(data.user), 520);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        'Não foi possível conectar ao servidor. Verifique sua conexão e tente de novo.';
      setError(msg);
      setStatus('idle');
      setShake((n) => n + 1);
    }
  };

  const busy = status !== 'idle';

  return (
    <div className="min-h-screen w-full bg-bg flex flex-col lg:flex-row">
      {/* ============ PAINEL VIVO ============ */}
      <div className="mesh relative lg:w-[55%] h-44 sm:h-56 lg:h-auto overflow-hidden shrink-0">
        {/* Blobs que derivam devagar, trocando de matiz continuamente */}
        <div
          className="absolute -top-1/4 -left-1/5 w-[70%] aspect-square rounded-full blur-3xl animate-drift-a opacity-80"
          style={{ background: 'radial-gradient(circle, var(--mesh-a) 0%, transparent 68%)' }}
        />
        <div
          className="absolute top-1/4 -right-1/6 w-[75%] aspect-square rounded-full blur-3xl animate-drift-b opacity-70"
          style={{ background: 'radial-gradient(circle, var(--mesh-b) 0%, transparent 66%)' }}
        />
        <div
          className="absolute -bottom-1/4 left-1/5 w-[80%] aspect-square rounded-full blur-3xl animate-drift-c opacity-60"
          style={{ background: 'radial-gradient(circle, var(--mesh-c) 0%, transparent 70%)' }}
        />
        {/* Grão: mata o banding das transições de cor */}
        <div className="grain absolute inset-0 opacity-[0.14] mix-blend-overlay pointer-events-none" />

        <div className="relative h-full flex flex-col justify-between p-7 sm:p-10 lg:p-14 text-white">
          <div className="flex items-center gap-3 animate-fade-up" style={{ '--i': 0 }}>
            <div className="w-11 h-11 rounded-2xl bg-white/95 flex items-center justify-center shadow-lift shrink-0">
              <img src="/logo_rh.png" alt="" className="w-7 h-7 object-contain" />
            </div>
            <div className="leading-none">
              <div className="text-[10px] font-extrabold uppercase tracking-[0.26em] text-white/70">
                Autodoc
              </div>
              <div className="font-display font-black text-2xl tracking-wide mt-1">RH</div>
            </div>
          </div>

          <div className="hidden lg:block max-w-md">
            <h1 className="font-display text-[2.6rem] leading-[1.1] font-black animate-fade-up stagger" style={{ '--i': 2 }}>
              Kits admissionais completos em menos de um minuto.
            </h1>
            <p className="mt-4 text-white/65 text-[15px] leading-relaxed animate-fade-up stagger" style={{ '--i': 3 }}>
              O sistema preenche contratos, termos e fichas a partir de um formulário
              e devolve tudo pronto para assinatura.
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-6 animate-fade-up stagger" style={{ '--i': 4 }}>
            {[
              { icon: FileText, label: 'CLT padrão' },
              { icon: Truck, label: 'Motoristas' },
              { icon: GraduationCap, label: 'Menor aprendiz' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-white/70">
                <Icon className="w-4 h-4" />
                <span className="text-xs font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============ FORMULÁRIO ============ */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[380px]">
          <div className="mb-8 animate-fade-up" style={{ '--i': 1 }}>
            <h2 className="font-display text-[28px] font-black text-ink tracking-tight">
              Bem-vindo de volta
            </h2>
            <p className="text-[13px] text-muted mt-1.5">
              Entre para gerar e acompanhar os documentos de admissão.
            </p>
          </div>

          {error && (
            <div
              key={shake}
              className="mb-5 flex items-start gap-2.5 rounded-[14px] border border-fail/25 bg-fail/8 px-4 py-3 text-[13px] text-fail animate-shake"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* form real + autocomplete: é isto que faz o navegador
              oferecer "salvar senha" e preencher nas próximas vezes */}
          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            <div className="float-field animate-fade-up stagger" style={{ '--i': 2 }}>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder=" "
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={busy}
                className="peer w-full h-[58px] rounded-[14px] border border-line bg-surface pl-11 pr-4 pt-5 pb-1.5 text-sm font-semibold text-ink outline-none transition-[border-color,box-shadow] duration-[180ms] focus:border-accent focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--app-accent)_16%,transparent)]"
              />
              <User className="field-icon pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted" />
              <label htmlFor="username">Usuário</label>
            </div>

            <div className="float-field animate-fade-up stagger" style={{ '--i': 3 }}>
              <input
                id="password"
                name="password"
                ref={passwordRef}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
                className="peer w-full h-[58px] rounded-[14px] border border-line bg-surface pl-11 pr-12 pt-5 pb-1.5 text-sm font-semibold text-ink outline-none transition-[border-color,box-shadow] duration-[180ms] focus:border-accent focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--app-accent)_16%,transparent)]"
              />
              <Lock className="field-icon pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted" />
              <label htmlFor="password">Senha</label>
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface-2"
              >
                <span className="relative w-[18px] h-[18px]">
                  <Eye
                    className={cn(
                      'absolute inset-0 w-[18px] h-[18px] transition-all duration-[180ms]',
                      showPassword ? 'opacity-0 scale-75 rotate-12' : 'opacity-100 scale-100 rotate-0'
                    )}
                  />
                  <EyeOff
                    className={cn(
                      'absolute inset-0 w-[18px] h-[18px] transition-all duration-[180ms]',
                      showPassword ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-12'
                    )}
                  />
                </span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 animate-fade-up stagger" style={{ '--i': 4 }}>
              <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="sr-only peer"
                />
                <span
                  className={cn(
                    'w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center shrink-0',
                    'transition-[background-color,border-color,transform] duration-[180ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                    'peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2',
                    remember
                      ? 'bg-accent border-accent scale-110'
                      : 'bg-surface border-sand-300 dark:border-navy-600 group-hover:border-accent'
                  )}
                >
                  <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none">
                    <path
                      d="M3 8.5 L6.5 12 L13 4.5"
                      stroke="white"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        strokeDasharray: 18,
                        strokeDashoffset: remember ? 0 : 18,
                        transition: 'stroke-dashoffset 260ms cubic-bezier(0.05,0.7,0.1,1) 60ms',
                      }}
                    />
                  </svg>
                </span>
                <span className="text-[13px] font-semibold text-muted group-hover:text-ink">
                  Manter-me conectado
                </span>
              </label>
            </div>

            {/* Botão que se transforma: rótulo → spinner → check */}
            <button
              type="submit"
              disabled={busy}
              className={cn(
                'relative w-full h-[52px] mt-2 rounded-[14px] overflow-hidden font-bold text-sm text-white',
                'transition-[transform,filter] duration-[180ms] active:scale-[0.99] disabled:cursor-wait',
                'animate-fade-up stagger',
                status === 'success' ? 'bg-ok' : 'bg-navy-950 dark:bg-navy-800'
              )}
              style={{ '--i': 5 }}
            >
              {status !== 'success' && (
                <span
                  className="absolute inset-0 bg-linear-to-r/oklch from-navy-950 via-gold-600 to-gold-400 opacity-0 hover:opacity-100 transition-opacity duration-[420ms]"
                  aria-hidden
                />
              )}
              <span className="relative flex items-center justify-center gap-2">
                <span
                  className={cn(
                    'flex items-center gap-2 transition-all duration-[180ms]',
                    status === 'idle' ? 'opacity-100 scale-100' : 'opacity-0 scale-90 absolute'
                  )}
                >
                  Entrar no sistema
                  <ArrowRight className="w-[18px] h-[18px]" />
                </span>
                <Loader2
                  className={cn(
                    'w-5 h-5 animate-spin-slow transition-all duration-[180ms]',
                    status === 'loading' ? 'opacity-100 scale-100' : 'opacity-0 scale-90 absolute'
                  )}
                />
                <Check
                  className={cn(
                    'w-5 h-5 transition-all duration-[260ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                    status === 'success' ? 'opacity-100 scale-100' : 'opacity-0 scale-50 absolute'
                  )}
                />
              </span>
            </button>
          </form>

          <p className="text-center text-[11px] text-muted mt-8 animate-fade-up stagger" style={{ '--i': 6 }}>
            Autodoc RH · Gerador de Documentos Admissionais · Open Source
          </p>
        </div>
      </div>
    </div>
  );
}
