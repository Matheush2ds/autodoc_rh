import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import {
  ArrowUpRight, Building2, Clock, Download, FileText, GraduationCap, Layers, Truck,
} from 'lucide-react';

import Toolbar from './Toolbar';
import {
  Button, Card, CardHead, CATEGORIES, Chip, Delta, EmptyState, ErrorState,
  HeroTexture, Skeleton, cn, useCountUp,
} from '../lib/ui';

/* ============================================================
   KPI — o primeiro da linha é o hero preenchido (referência 01)
   ============================================================ */

function Kpi({ label, value, foot, delta, hero, i }) {
  const shown = useCountUp(value);
  return (
    <div
      style={{ '--i': i }}
      className={cn(
        'group relative overflow-hidden rounded-[20px] border p-5 flex flex-col justify-between min-h-[148px]',
        'transition-[transform,box-shadow,border-color] duration-[180ms] ease-[cubic-bezier(0.2,0,0,1)]',
        'hover:-translate-y-[3px] hover:shadow-lift animate-fade-up stagger',
        hero
          ? 'bg-navy-950 border-navy-950 text-white dark:bg-gold-400 dark:border-gold-400 dark:text-navy-950'
          : 'bg-surface border-line text-ink shadow-soft hover:border-sand-300 dark:hover:border-navy-600'
      )}
    >
      {hero && (
        <>
          <HeroTexture id="kpi-hero" />
          <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/10 blur-2xl dark:bg-navy-950/10" />
        </>
      )}

      <div className="relative flex items-start justify-between gap-2">
        <span className={cn('text-[11px] font-bold uppercase tracking-[0.08em]', hero ? 'opacity-70' : 'text-muted')}>
          {label}
        </span>
        <span
          className={cn(
            'w-8 h-8 rounded-full border flex items-center justify-center shrink-0',
            'transition-transform duration-[180ms] group-hover:rotate-45',
            hero ? 'border-white/25 dark:border-navy-950/25' : 'border-line text-muted'
          )}
        >
          <ArrowUpRight className="w-4 h-4" />
        </span>
      </div>

      <div className="relative">
        <div className="font-display text-[38px] leading-none font-black tnum">{shown}</div>
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {delta !== null && delta !== undefined && <Delta value={delta} suffix="" />}
          <span className={cn('text-[11px] font-medium', hero ? 'opacity-65' : 'text-muted')}>{foot}</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Medidor em arco — composição das categorias
   ============================================================ */

function ArcGauge({ segments, total }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const r = 78;
  const cx = 100;
  const cy = 96;
  const L = Math.PI * r;
  const shownTotal = useCountUp(total);

  let acc = 0;
  const arcs = segments.map((s) => {
    const frac = total > 0 ? s.value / total : 0;
    const len = frac * L;
    const arc = { ...s, len, offset: acc };
    acc += len;
    return arc;
  });

  return (
    <div className="relative">
      <svg viewBox="0 0 200 116" className="w-full max-w-[260px] mx-auto overflow-visible">
        <defs>
          <pattern id="gaugeHatch" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--app-line)" strokeWidth="3" />
          </pattern>
        </defs>

        {/* Trilha hachurada — o "pendente" da referência 01 */}
        <path
          d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`}
          fill="none"
          stroke="url(#gaugeHatch)"
          strokeWidth="20"
          strokeLinecap="round"
        />

        {arcs.map((a) => (
          <path
            key={a.key}
            d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`}
            fill="none"
            stroke={a.color}
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={`${mounted ? a.len : 0} ${L * 2}`}
            strokeDashoffset={-a.offset}
            style={{ transition: 'stroke-dasharray 900ms cubic-bezier(0.05,0.7,0.1,1)' }}
          />
        ))}
      </svg>

      <div className="absolute inset-x-0 bottom-1 text-center">
        <div className="font-display text-[34px] leading-none font-black text-ink tnum">{shownTotal}</div>
        <div className="text-[11px] font-semibold text-muted mt-1">kits emitidos</div>
      </div>
    </div>
  );
}

/* ============================================================
   Dashboard
   ============================================================ */

export default function Dashboard({ onNavigate, onOpenMobileNav }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(new Date());

  const load = () => {
    setLoading(true);
    setError(null);
    axios
      .get('/api/dashboard-data')
      .then(({ data }) => {
        setData(data);
        setUpdatedAt(new Date());
      })
      .catch(() => setError('Os indicadores do painel não puderam ser carregados agora.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const derived = useMemo(() => {
    if (!data) return null;
    const daily = data.charts?.daily || { labels: [], data: [] };
    const series = daily.labels.map((label, idx) => ({ label, docs: daily.data[idx] || 0 }));

    // Delta real: hoje contra ontem, a partir da própria série de 7 dias.
    const todayCount = series.at(-1)?.docs ?? 0;
    const yesterdayCount = series.at(-2)?.docs ?? 0;
    const deltaToday = todayCount - yesterdayCount;

    const types = data.charts?.types || {};
    const total = data.stats?.total || 0;
    const minutes = total * 14;

    return {
      series,
      deltaToday,
      segments: [
        { key: 'regular', label: CATEGORIES.regular.label, value: types.regular || 0, color: CATEGORIES.regular.color, icon: FileText },
        { key: 'motorista', label: CATEGORIES.motorista.label, value: types.motorista || 0, color: CATEGORIES.motorista.color, icon: Truck },
        { key: 'aprendiz', label: CATEGORIES.aprendiz.label, value: types.aprendiz || 0, color: CATEGORIES.aprendiz.color, icon: GraduationCap },
      ],
      hours: Math.floor(minutes / 60),
      mins: minutes % 60,
      companies: data.charts?.companies || [],
      history: data.history || [],
      total,
    };
  }, [data]);

  const toolbar = (
    <Toolbar
      title="Dashboard"
      updatedAt={updatedAt}
      onRefresh={load}
      onOpenMobileNav={onOpenMobileNav}
      actions={
        <Button icon={FileText} onClick={() => onNavigate('form:regular')}>
          Novo kit
        </Button>
      }
    />
  );

  if (loading) {
    return (
      <>
        {toolbar}
        <div className="p-4 sm:p-6 space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[148px] rounded-[20px]" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <Skeleton className="h-[320px] rounded-[20px] lg:col-span-7" />
            <Skeleton className="h-[320px] rounded-[20px] lg:col-span-5" />
          </div>
          <Skeleton className="h-[280px] rounded-[20px]" />
        </div>
      </>
    );
  }

  if (error || !derived) {
    return (
      <>
        {toolbar}
        <ErrorState message={error} onRetry={load} />
      </>
    );
  }

  const { series, deltaToday, segments, hours, mins, companies, history, total } = derived;
  const maxCompany = Math.max(1, ...companies.map((c) => c.count));

  return (
    <>
      {toolbar}

      <div className="p-4 sm:p-6 space-y-5 pb-12">
        {/* ---------- KPIs ---------- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi
            i={0}
            hero
            label="Gerados hoje"
            value={data.stats.today}
            delta={deltaToday}
            foot="em relação a ontem"
          />
          <Kpi i={1} label="Mês atual" value={data.stats.month} foot={`${data.stats.week} nos últimos 7 dias`} />
          <Kpi i={2} label="Total histórico" value={data.stats.total} foot={`${companies.length} empresas atendidas`} />
          <Kpi i={3} label="Horas poupadas" value={hours} foot={`e mais ${mins} min de digitação`} />
        </div>

        {/* ---------- Gráfico + medidor ---------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <Card i={4} className="lg:col-span-7 flex flex-col">
            <CardHead
              title="Emissões por dia"
              sub="Volume de kits nos últimos 7 dias"
              action={<Chip tone="neutral">7 dias</Chip>}
            />
            <div className="flex-1 px-2 pb-4 min-h-[260px]">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={series} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} barCategoryGap="28%">
                  <defs>
                    <pattern id="barHatch" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="6" stroke="var(--app-line)" strokeWidth="3" />
                    </pattern>
                  </defs>
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--app-muted)', fontSize: 11, fontWeight: 700 }}
                    dy={8}
                  />
                  <Tooltip
                    cursor={false}
                    content={({ active, payload, label }) =>
                      active && payload?.length ? (
                        <div className="rounded-full bg-navy-950 px-3 py-1.5 text-[11px] font-bold text-white shadow-lift">
                          {label} · {payload[0].value} {payload[0].value === 1 ? 'kit' : 'kits'}
                        </div>
                      ) : null
                    }
                  />
                  {/* background = trilha hachurada dos dias sem emissão */}
                  <Bar
                    dataKey="docs"
                    radius={999}
                    background={{ fill: 'url(#barHatch)', radius: 999 }}
                    isAnimationActive
                    animationDuration={700}
                  >
                    {series.map((entry, idx) => (
                      <Cell
                        key={idx}
                        /* hoje ganha destaque com a cor de tinta do tema — navy
                           fixo desaparecia contra o card no modo escuro */
                        fill={idx === series.length - 1 ? 'var(--app-ink)' : 'var(--color-gold-400)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card i={5} className="lg:col-span-5 flex flex-col">
            <CardHead title="Categorias de contratação" sub="Composição de todos os kits emitidos" />
            <div className="px-5">
              <ArcGauge segments={segments} total={total} />
            </div>
            <div className="px-5 pb-5 pt-4 space-y-2.5">
              {segments.map((s) => {
                const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
                const Icon = s.icon;
                return (
                  <div key={s.key} className="flex items-center gap-3">
                    <span
                      className="w-7 h-7 rounded-[9px] flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `color-mix(in oklab, ${s.color} 14%, transparent)`, color: s.color }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[12px] font-bold text-ink truncate">{s.label}</span>
                        <span className="text-[11px] font-bold text-muted tnum shrink-0">{s.value} · {pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-[width] duration-[900ms] ease-[cubic-bezier(0.05,0.7,0.1,1)]"
                          style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: s.color }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* ---------- Empresas + card-âncora ---------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <Card i={6} className="lg:col-span-7 flex flex-col">
            <CardHead
              title="Top empresas"
              sub="Maiores volumes de emissão"
              action={<Chip tone="neutral">{companies.length}</Chip>}
            />
            <div className="px-3 pb-4 flex-1">
              {companies.length === 0 ? (
                <EmptyState icon={Building2} title="Nenhum kit emitido ainda" description="Assim que o primeiro documento for gerado, o ranking aparece aqui." />
              ) : (
                companies.slice(0, 5).map((c, idx) => {
                  const pct = Math.round((c.count / maxCompany) * 100);
                  return (
                    <div
                      key={c.company_name}
                      style={{ '--i': idx }}
                      className="flex items-center gap-3 px-2 py-2.5 rounded-[14px] hover:bg-surface-2 transition-colors duration-[120ms] animate-fade-up stagger"
                    >
                      <span className="relative shrink-0">
                        <span className="w-9 h-9 rounded-[12px] bg-navy-950 dark:bg-navy-800 text-white flex items-center justify-center text-[11px] font-black">
                          {c.company_name.substring(0, 2).toUpperCase()}
                        </span>
                        <span className="absolute -top-1.5 -left-1.5 w-[18px] h-[18px] rounded-full bg-gold-400 text-navy-950 text-[9px] font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[12px] font-bold text-ink truncate" title={c.company_name}>
                            {c.company_name}
                          </span>
                          <Chip tone="neutral" className="shrink-0 tnum">{c.count}</Chip>
                        </div>
                        <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gold-400 transition-[width] duration-[900ms] ease-[cubic-bezier(0.05,0.7,0.1,1)]"
                            style={{ width: `${Math.max(pct, 3)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* Card escuro — âncora visual da composição */}
          <div
            style={{ '--i': 7 }}
            className="lg:col-span-5 relative overflow-hidden rounded-[20px] bg-navy-950 text-white p-6 flex flex-col justify-between min-h-[260px] animate-fade-up stagger"
          >
            <div className="mesh absolute inset-0 opacity-60">
              <div
                className="absolute -top-1/3 -right-1/4 w-[80%] aspect-square rounded-full blur-3xl animate-drift-a"
                style={{ background: 'radial-gradient(circle, var(--mesh-a) 0%, transparent 70%)' }}
              />
              <div
                className="absolute -bottom-1/3 -left-1/4 w-[80%] aspect-square rounded-full blur-3xl animate-drift-c"
                style={{ background: 'radial-gradient(circle, var(--mesh-c) 0%, transparent 70%)' }}
              />
            </div>
            <div className="grain absolute inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none" />

            <div className="relative flex items-start justify-between">
              <div className="w-10 h-10 rounded-[14px] bg-white/12 border border-white/15 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <Chip tone="onDark">100% automático</Chip>
            </div>

            <div className="relative">
              <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/60">
                Economia de tempo
              </div>
              <div className="font-display font-black text-[46px] leading-none mt-1.5 tnum">
                {hours}
                <span className="text-[22px] opacity-70">h</span>{' '}
                {mins}
                <span className="text-[22px] opacity-70">min</span>
              </div>
              <p className="text-[12px] text-white/55 mt-3 leading-snug">
                Base: ~14 min de digitação manual por kit, sobre {total} {total === 1 ? 'kit emitido' : 'kits emitidos'}.
              </p>
            </div>
          </div>
        </div>

        {/* ---------- Histórico ---------- */}
        <Card i={8} className="overflow-hidden">
          <CardHead
            title="Últimas gerações"
            sub="Documentos processados recentemente"
            action={
              <Button variant="outline" size="sm" onClick={() => onNavigate('history')}>
                Ver tudo
              </Button>
            }
          />
          <HistoryTable rows={history.slice(0, 8)} />
        </Card>
      </div>
    </>
  );
}

/* ============================================================
   Tabela de histórico — reutilizada na página Histórico
   ============================================================ */

export function HistoryTable({ rows }) {
  if (!rows || rows.length === 0) {
    return (
      <EmptyState
        icon={Layers}
        title="Nenhum kit gerado ainda"
        description="Os documentos que você emitir aparecem aqui, com link para baixar de novo."
      />
    );
  }

  return (
    <div className="overflow-x-auto scroll-slim">
      <table className="w-full text-left">
        <thead>
          <tr className="border-y border-line bg-surface-2">
            <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.08em] text-muted whitespace-nowrap">Data</th>
            <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.08em] text-muted whitespace-nowrap">Colaborador</th>
            <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.08em] text-muted whitespace-nowrap">Empresa</th>
            <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.08em] text-muted whitespace-nowrap">Categoria</th>
            <th className="px-5 py-3 text-right text-[10px] font-extrabold uppercase tracking-[0.08em] text-muted whitespace-nowrap">Kit</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((doc, idx) => {
            const cat = CATEGORIES[doc.employee_type] || CATEGORIES.regular;
            return (
              <tr
                key={doc.id}
                style={{ '--i': Math.min(idx, 9) }}
                className="border-b border-line last:border-0 transition-[background-color,transform] duration-[120ms] hover:bg-surface-2 hover:translate-x-0.5 animate-fade-up stagger"
              >
                <td className="px-5 py-3.5 text-[12px] font-semibold text-muted whitespace-nowrap tnum">{doc.gen_date}</td>
                <td className="px-5 py-3.5 text-[13px] font-bold text-ink whitespace-nowrap">{doc.employee_name}</td>
                <td className="px-5 py-3.5">
                  <span className="text-[12px] text-muted truncate block max-w-[240px]" title={doc.company_name}>
                    {doc.company_name}
                  </span>
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <Chip tone={cat.tone} dot>{cat.short}</Chip>
                </td>
                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                  <a
                    href={`/download_zip/${doc.zip_filename}`}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-line bg-surface text-[11px] font-bold text-ink hover:border-accent hover:text-accent active:scale-95 transition-[color,border-color,transform] duration-[120ms]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Baixar
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
