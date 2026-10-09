import React, { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AlertCircle, Check, Loader2, RefreshCw, X } from 'lucide-react';

export const cn = (...parts) => twMerge(clsx(parts));

/* ============================================================
   Superfícies
   ============================================================ */

export const CARD = 'bg-surface border border-line rounded-[20px] shadow-soft';

export const ROW_HOVER =
  'transition-[background-color,transform] duration-[120ms] hover:bg-surface-2 hover:translate-x-0.5';

export function Card({ className, children, i, ...props }) {
  return (
    <div
      style={i !== undefined ? { '--i': i } : undefined}
      className={cn(CARD, i !== undefined && 'animate-fade-up stagger', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHead({ title, sub, action, className }) {
  return (
    <div className={cn('flex items-start justify-between gap-3 px-5 pt-5 pb-4', className)}>
      <div className="min-w-0">
        <h2 className="text-[17px] font-bold text-ink leading-tight truncate">{title}</h2>
        {sub && <p className="text-xs text-muted mt-0.5 truncate">{sub}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ============================================================
   Chips e pílulas — a unidade atômica da interface
   ============================================================ */

export function Chip({ children, tone = 'neutral', dot, className, as: As = 'span', ...props }) {
  const tones = {
    neutral: 'bg-surface-2 text-muted border-line',
    ink: 'tint-ink text-ink border-line',
    gold: 'bg-gold-100 text-gold-700 border-gold-200 dark:bg-gold-400/10 dark:text-gold-300 dark:border-gold-400/25',
    ok: 'bg-ok/10 text-ok border-ok/25',
    warn: 'bg-warn/12 text-warn border-warn/30',
    fail: 'bg-fail/10 text-fail border-fail/25',
    regular: 'bg-cat-regular/10 text-cat-regular border-cat-regular/25',
    motorista: 'bg-cat-motorista/12 text-cat-motorista border-cat-motorista/30',
    aprendiz: 'bg-cat-aprendiz/10 text-cat-aprendiz border-cat-aprendiz/25',
    onDark: 'bg-white/12 text-white border-white/20',
  };
  return (
    <As
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold whitespace-nowrap',
        tones[tone] || tones.neutral,
        className
      )}
      {...props}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />}
      {children}
    </As>
  );
}

export function Delta({ value, suffix = '%' }) {
  if (value === null || value === undefined) return null;
  const up = value >= 0;
  return (
    <Chip tone={up ? 'ok' : 'fail'} className="px-2 py-0.5">
      <svg viewBox="0 0 12 12" className={cn('w-2.5 h-2.5', !up && 'rotate-180')} aria-hidden>
        <path d="M6 2.5 L10 8 L2 8 Z" fill="currentColor" />
      </svg>
      {up ? '+' : ''}{value}{suffix}
    </Chip>
  );
}

/* ============================================================
   Botões
   ============================================================ */

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading,
  className,
  children,
  ...props
}) {
  const variants = {
    primary:
      'relative overflow-hidden bg-navy-950 text-white border-navy-950 hover:bg-navy-900 ' +
      'dark:bg-gold-400 dark:text-navy-950 dark:border-gold-400 dark:hover:bg-gold-300 shadow-soft ' +
      // varredura de brilho atravessando o botão no hover
      'before:pointer-events-none before:absolute before:inset-0 before:-translate-x-full ' +
      'before:bg-linear-to-r/oklch before:from-transparent before:via-white/20 before:to-transparent ' +
      'before:transition-transform before:duration-[700ms] before:ease-[cubic-bezier(0.2,0,0,1)] ' +
      'hover:before:translate-x-full',
    outline: 'bg-surface text-ink border-line hover:bg-surface-2 hover:border-sand-300 dark:hover:border-navy-600',
    ghost: 'bg-transparent text-muted border-transparent hover:bg-surface-2 hover:text-ink',
    danger: 'bg-fail text-white border-fail hover:brightness-110',
  };
  const sizes = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 text-[13px] gap-2',
    lg: 'h-12 px-6 text-sm gap-2.5',
  };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full border font-bold',
        'transition-[background-color,border-color,color,transform,box-shadow] duration-[120ms] ease-[cubic-bezier(0.2,0,0,1)]',
        'active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin-slow" /> : Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}

export function IconButton({ icon: Icon, label, className, size = 36, ...props }) {
  return (
    <button
      title={label}
      aria-label={label}
      style={{ width: size, height: size }}
      className={cn(
        'inline-flex items-center justify-center rounded-full border border-line bg-surface text-muted',
        'hover:text-ink hover:border-sand-300 dark:hover:border-navy-600 hover:-translate-y-px',
        'transition-[background-color,border-color,color,transform] duration-[120ms] active:scale-95',
        className
      )}
      {...props}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

/* ============================================================
   Campos de formulário
   ============================================================ */

const FIELD_BASE =
  'w-full rounded-[14px] border border-line bg-surface px-3.5 py-2.5 text-sm font-medium text-ink ' +
  'placeholder:text-sand-400 placeholder:font-normal dark:placeholder:text-navy-500 ' +
  'outline-none transition-[border-color,box-shadow,background-color] duration-[180ms] ' +
  'focus:border-accent focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--app-accent)_16%,transparent)]';

export function Field({ label, hint, className, col, highlight, ...props }) {
  return (
    <div className={cn('flex flex-col gap-1.5', col)}>
      {label && (
        <label className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-muted ml-0.5">
          {label}
        </label>
      )}
      <input
        className={cn(
          FIELD_BASE,
          highlight && 'border-ok shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-ok)_16%,transparent)]',
          className
        )}
        {...props}
      />
      {hint && <span className="text-[11px] text-muted ml-0.5">{hint}</span>}
    </div>
  );
}

export function SelectField({ label, children, className, col, ...props }) {
  return (
    <div className={cn('flex flex-col gap-1.5', col)}>
      {label && (
        <label className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-muted ml-0.5">
          {label}
        </label>
      )}
      <select className={cn(FIELD_BASE, 'cursor-pointer', className)} {...props}>
        {children}
      </select>
    </div>
  );
}

export function Segmented({ options, value, onChange, name }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'h-10 rounded-[14px] border text-xs font-bold transition-all duration-[180ms] active:scale-[0.98]',
              active
                ? 'bg-navy-950 text-white border-navy-950 dark:bg-gold-400 dark:text-navy-950 dark:border-gold-400'
                : 'bg-surface text-muted border-line hover:text-ink hover:border-sand-300'
            )}
          >
            {opt.label}
          </button>
        );
      })}
      <input type="hidden" name={name} value={value} />
    </div>
  );
}

/* ============================================================
   Estados: carregando, vazio, erro
   ============================================================ */

export function Skeleton({ className }) {
  return <div className={cn('skeleton', className)} />;
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 animate-fade-in">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-line flex items-center justify-center text-muted mb-4">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-[15px] font-bold text-ink">{title}</h3>
      {description && <p className="text-[13px] text-muted mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  const [spin, setSpin] = useState(false);
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-fail/10 border border-fail/25 text-fail flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-[15px] font-bold text-ink">Não consegui falar com o servidor</h3>
      <p className="text-[13px] text-muted mt-1 max-w-md">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          className="mt-5"
          onClick={() => {
            setSpin(true);
            setTimeout(() => setSpin(false), 700);
            onRetry();
          }}
        >
          <RefreshCw className={cn('w-4 h-4', spin && 'animate-spin-slow')} />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

/* ============================================================
   Modal
   ============================================================ */

export function Modal({ open, onClose, title, subtitle, icon: Icon, children, footer, wide }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm animate-fade-in"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-full bg-surface rounded-[24px] border border-line shadow-pop overflow-hidden animate-pop-in flex flex-col max-h-[88vh]',
          wide ? 'max-w-2xl' : 'max-w-lg'
        )}
      >
        <div className="flex items-start justify-between gap-3 px-6 py-5 bg-navy-950 text-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-gold-400 shrink-0">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-bold text-[17px] leading-tight">{title}</h3>
              {subtitle && <p className="text-xs text-white/55 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto scroll-slim flex-1">{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-line bg-surface-2 flex items-center justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, highlight, confirmLabel = 'Excluir', loading }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      icon={AlertCircle}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="danger" loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
        </>
      }
    >
      <div className="px-6 py-6">
        <p className="text-sm text-muted leading-relaxed">
          {message}
          {highlight && <strong className="block mt-2 text-ink font-bold">{highlight}</strong>}
        </p>
      </div>
    </Modal>
  );
}

/* ============================================================
   Toast
   ============================================================ */

export function Toast({ feedback }) {
  if (!feedback) return null;
  const ok = feedback.type === 'success';
  return (
    <div className="fixed bottom-6 right-6 z-[60] animate-slide-down">
      <div
        className={cn(
          'flex items-center gap-2.5 rounded-full px-5 py-3 text-[13px] font-bold text-white shadow-pop',
          ok ? 'bg-ok' : 'bg-fail'
        )}
      >
        {ok ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
        {feedback.message}
      </div>
    </div>
  );
}

export function useFeedback(timeout = 4000) {
  const [feedback, setFeedback] = useState(null);
  const timer = useRef();
  const show = (type, message) => {
    clearTimeout(timer.current);
    setFeedback({ type, message });
    timer.current = setTimeout(() => setFeedback(null), timeout);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  return [feedback, show];
}

/* ============================================================
   Contagem animada dos KPIs
   ============================================================ */

export function useCountUp(value, duration = 700) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reduce || target === 0) {
      setDisplay(target);
      return;
    }

    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return display;
}

/* Padrão SVG de hachura, reutilizado nos gráficos */
export function HatchDefs({ id = 'hatch', color = 'currentColor', opacity = 0.28 }) {
  return (
    <defs>
      <pattern id={id} width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill="transparent" />
        <line x1="0" y1="0" x2="0" y2="6" stroke={color} strokeWidth="2.5" opacity={opacity} />
      </pattern>
    </defs>
  );
}

export const CATEGORIES = {
  regular: { label: 'Funcionário Regular', short: 'Regular', tone: 'regular', color: 'var(--color-cat-regular)' },
  motorista: { label: 'Motorista', short: 'Motorista', tone: 'motorista', color: 'var(--color-cat-motorista)' },
  aprendiz: { label: 'Menor Aprendiz', short: 'Aprendiz', tone: 'aprendiz', color: 'var(--color-cat-aprendiz)' },
};

/* ============================================================
   Confirmação estilo banco
   A bola entra na cor do sistema com o check verde desenhando-se;
   depois a tinta verde preenche a bola e o check vira branco.
   ============================================================ */

export function SuccessCheck({ size = 112, label = 'Concluído' }) {
  const [phase, setPhase] = useState(0); // 0 bola · 1 check desenhado · 2 pintada de verde

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setPhase(2);
      return;
    }
    const a = setTimeout(() => setPhase(1), 200);
    const b = setTimeout(() => setPhase(2), 900);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);

  const green = phase >= 2;

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label={label}
      className="animate-drop-in overflow-visible"
    >
      {/* pulso que sai da bola no instante em que ela fica verde */}
      {green && (
        <circle
          cx="60" cy="60" r="47"
          fill="none"
          stroke="var(--color-ok)"
          strokeWidth="2.5"
          className="animate-pulse-ring"
          style={{ transformOrigin: '60px 60px' }}
        />
      )}

      {/* bola na cor do sistema */}
      <circle
        cx="60" cy="60" r="47"
        fill="color-mix(in oklab, var(--app-accent) 20%, var(--app-surface))"
        stroke="color-mix(in oklab, var(--app-accent) 45%, transparent)"
        strokeWidth="2"
      />

      {/* a tinta verde preenchendo */}
      <circle
        cx="60" cy="60" r="48"
        fill="var(--color-ok)"
        style={{
          transformOrigin: '60px 60px',
          transform: green ? 'scale(1)' : 'scale(0)',
          transition: 'transform 560ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />

      {/* o check: verde sobre a bola, branco depois que ela fica verde */}
      <path
        d="M38 61 L53 76 L83 45"
        fill="none"
        stroke={green ? '#fff' : 'var(--color-ok)'}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 66,
          strokeDashoffset: phase >= 1 ? 0 : 66,
          transition:
            'stroke-dashoffset 520ms cubic-bezier(0.05, 0.7, 0.1, 1), stroke 260ms ease-out 180ms',
        }}
      />
    </svg>
  );
}

/* ============================================================
   Textura do card hero — anéis e pontinhos bem discretos.
   Usa currentColor, então acompanha o texto do card em cada tema.
   ============================================================ */

export function HeroTexture({ id = 'hero' }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 w-full h-full"
      aria-hidden
      preserveAspectRatio="none"
    >
      <defs>
        <pattern id={`${id}-dots`} width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1.2" cy="1.2" r="1.2" fill="currentColor" />
        </pattern>
        <radialGradient id={`${id}-fade`} cx="100%" cy="100%" r="105%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={`${id}-mask`}>
          <rect width="100%" height="100%" fill={`url(#${id}-fade)`} />
        </mask>
      </defs>

      {/* malha de pontos, esmaecendo a partir do canto */}
      <rect
        width="100%" height="100%"
        fill={`url(#${id}-dots)`}
        mask={`url(#${id}-mask)`}
        opacity="0.085"
      />

      {/* anéis concêntricos saindo do canto inferior direito */}
      <g fill="none" stroke="currentColor" opacity="0.07" mask={`url(#${id}-mask)`}>
        {[46, 84, 122, 160, 198, 236].map((r) => (
          <circle key={r} cx="100%" cy="100%" r={r} />
        ))}
      </g>
    </svg>
  );
}
