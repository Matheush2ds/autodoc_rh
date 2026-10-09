import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  AlertCircle, ArrowLeft, ArrowRight, Building2, Car, Check, CheckCircle2, Download,
  FileText, GraduationCap, Loader2, MapPin, Search, Sparkles, Truck, User, Wallet,
} from 'lucide-react';

import Toolbar from './Toolbar';
import { COMPANIES as FALLBACK_COMPANIES } from '../constants';
import { salarioPorExtenso } from '../lib/extenso';
import {
  Button, CARD, Card, Chip, Field, SelectField, Segmented, SuccessCheck, cn,
} from '../lib/ui';

const TYPE_META = {
  regular: { title: 'Funcionário regular', sub: 'Admissão padrão CLT', icon: FileText, tone: 'regular', color: 'var(--color-cat-regular)' },
  motorista: { title: 'Motorista', sub: 'Admissão com CNH e termo veicular', icon: Truck, tone: 'motorista', color: 'var(--color-cat-motorista)' },
  aprendiz: { title: 'Menor aprendiz', sub: 'Contrato pela Lei da Aprendizagem', icon: GraduationCap, tone: 'aprendiz', color: 'var(--color-cat-aprendiz)' },
};

const STEPS = [
  { id: 0, label: 'Colaborador', icon: User },
  { id: 1, label: 'Contrato', icon: Wallet },
  { id: 2, label: 'Revisão', icon: Check },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function DocumentForm({ type, onOpenMobileNav, onOpenTags }) {
  const meta = TYPE_META[type] || TYPE_META.regular;
  const Icon = meta.icon;

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState('next');
  const [companies, setCompanies] = useState(FALLBACK_COMPANIES);
  const [status, setStatus] = useState('idle'); // idle | generating | done
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState(false);

  const [form, setForm] = useState({
    name: '', cpf: '', rg: '', orgao: '', nacionalidade: 'Brasileiro(a)', estadocivil: '',
    cargo: '', salario: '', data_contratacao: '', horario: '', empresa: '', cnpj: '',
    setor: '', utiliza: 'sim', cnh: '', categoria: '', endereco: '',
  });

  const [address, setAddress] = useState({
    cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '',
  });
  const [cep, setCep] = useState({ loading: false, message: '', tone: '' });
  const [glow, setGlow] = useState({});
  const [cnpjGlow, setCnpjGlow] = useState(false);

  useEffect(() => {
    axios
      .get('/api/companies')
      .then(({ data }) => data?.length && setCompanies(data))
      .catch(() => { /* mantém a lista local de fallback */ });
  }, []);

  /* ---------------- Endereço ---------------- */

  const addressString = (a) => {
    const parts = [];
    if (a.logradouro) {
      let s = a.logradouro;
      if (a.numero) s += `, nº ${a.numero}`;
      if (a.complemento) s += ` - ${a.complemento}`;
      parts.push(s);
    } else if (a.numero) parts.push(`nº ${a.numero}`);
    if (a.bairro) parts.push(a.bairro);
    if (a.cidade || a.uf) parts.push([a.cidade, a.uf].filter(Boolean).join(' - '));
    if (a.cep) parts.push(`CEP: ${a.cep}`);
    return parts.join(', ');
  };

  const setAddressField = (key, value) => {
    setAddress((prev) => {
      const next = { ...prev, [key]: value };
      setForm((f) => ({ ...f, endereco: addressString(next) }));
      return next;
    });
  };

  // Preenchimento em cascata: um campo de cada vez, com realce.
  const cascadeFill = async (entries) => {
    for (const [key, value] of entries) {
      if (!value) continue;
      setAddressField(key, value);
      setGlow((g) => ({ ...g, [key]: true }));
      await sleep(95);
    }
    await sleep(900);
    setGlow({});
  };

  const handleCep = async (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    const masked = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    setAddressField('cep', masked);
    setCep({ loading: false, message: '', tone: '' });

    if (digits.length !== 8) return;

    setCep({ loading: true, message: 'Consultando o ViaCEP...', tone: 'info' });
    try {
      const { data } = await axios.get(`https://viacep.com.br/ws/${digits}/json/`);
      if (data.erro) {
        setCep({ loading: false, message: 'CEP não encontrado. Preencha o endereço à mão.', tone: 'warn' });
        return;
      }
      setCep({ loading: false, message: `${data.localidade} - ${data.uf} encontrado.`, tone: 'ok' });
      await cascadeFill([
        ['logradouro', data.logradouro],
        ['bairro', data.bairro],
        ['cidade', data.localidade],
        ['uf', data.uf],
      ]);
    } catch {
      setCep({ loading: false, message: 'Não consegui consultar o ViaCEP. Preencha à mão.', tone: 'warn' });
    }
  };

  /* ---------------- Campos ---------------- */

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleCompany = (value) => {
    const company = companies.find((c) => c.name === value);
    setForm((f) => ({ ...f, empresa: value, cnpj: company?.cnpj || '' }));
    if (company?.cnpj) {
      setCnpjGlow(true);
      setTimeout(() => setCnpjGlow(false), 1100);
    }
  };

  const handleSalario = (raw) => {
    const digits = raw.replace(/\D/g, '');
    const value = (Number(digits) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    set('salario', digits ? value : '');
  };

  const extenso = useMemo(() => salarioPorExtenso(form.salario), [form.salario]);

  /* ---------------- Navegação entre passos ---------------- */

  const problems = useMemo(() => {
    const p = {};
    if (!form.name.trim()) p.name = { step: 0, label: 'Nome completo do colaborador' };
    if (!form.empresa) p.empresa = { step: 1, label: 'Empresa contratante' };
    if (!form.data_contratacao) p.data_contratacao = { step: 1, label: 'Data de admissão' };
    return p;
  }, [form]);

  const stepProblems = (s) => Object.values(problems).filter((p) => p.step === s);

  const go = (next) => {
    setDirection(next > step ? 'next' : 'prev');
    setStep(next);
    setTouched(false);
    document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const advance = () => {
    if (stepProblems(step).length > 0) {
      setTouched(true);
      return;
    }
    go(Math.min(step + 1, 2));
  };

  /* ---------------- Geração ---------------- */

  const generate = async () => {
    if (Object.keys(problems).length > 0) {
      setTouched(true);
      go(Object.values(problems)[0].step);
      return;
    }

    setStatus('generating');
    setError(null);

    try {
      const body = new FormData();
      Object.entries(form).forEach(([k, v]) => body.append(k, v ?? ''));
      body.set('employee_type', type);

      const response = await axios.post('/api/generate', body, { responseType: 'blob' });

      const filename = `Kit_Admissao_${form.name.trim().replace(/\s+/g, '_')}.zip`;
      const url = URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      setResult({ filename, url });
      setStatus('done');
    } catch (err) {
      let message = 'Não foi possível gerar os documentos.';
      // a resposta de erro vem como blob porque pedimos responseType blob
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          message = JSON.parse(text).error || message;
        } catch { /* mantém a mensagem padrão */ }
      }
      setError(message);
      setStatus('idle');
    }
  };

  useEffect(() => () => result?.url && URL.revokeObjectURL(result.url), [result]);

  /* ---------------- Tela de sucesso ---------------- */

  if (status === 'done' && result) {
    return (
      <>
        <Toolbar title={meta.title} onOpenMobileNav={onOpenMobileNav} />
        <div className="p-4 sm:p-6 pb-12 max-w-3xl mx-auto">
          <Card className="p-8 text-center animate-pop-in">
            <div className="flex justify-center mb-5">
              <SuccessCheck label="Kit gerado com sucesso" />
            </div>
            <h2 className="font-display text-[26px] font-black text-ink animate-fade-up stagger" style={{ '--i': 4 }}>
              Kit gerado
            </h2>
            <p className="text-[13px] text-muted mt-2 max-w-md mx-auto animate-fade-up stagger" style={{ '--i': 5 }}>
              Os documentos de <strong className="text-ink">{form.name}</strong> foram preenchidos e
              baixados como um único arquivo .zip.
            </p>
            <code className="inline-block mt-4 rounded-full border border-line bg-surface-2 px-4 py-2 font-mono text-[12px] font-semibold text-muted animate-fade-up stagger" style={{ '--i': 6 }}>
              {result.filename}
            </code>
            <div className="flex items-center justify-center gap-2 mt-7 animate-fade-up stagger" style={{ '--i': 7 }}>
              <Button
                variant="outline"
                icon={Download}
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = result.url;
                  link.download = result.filename;
                  link.click();
                }}
              >
                Baixar de novo
              </Button>
              <Button
                icon={Sparkles}
                onClick={() => {
                  setResult(null);
                  setStatus('idle');
                  setStep(0);
                  setForm((f) => ({
                    ...f, name: '', cpf: '', rg: '', orgao: '', estadocivil: '',
                    cargo: '', salario: '', data_contratacao: '', horario: '', endereco: '',
                    cnh: '', categoria: '',
                  }));
                  setAddress({ cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' });
                  setCep({ loading: false, message: '', tone: '' });
                }}
              >
                Novo colaborador
              </Button>
            </div>
          </Card>
        </div>
      </>
    );
  }

  /* ---------------- Wizard ---------------- */

  const anim = direction === 'next' ? 'animate-step-next' : 'animate-step-prev';

  return (
    <>
      <Toolbar
        title={meta.title}
        onOpenMobileNav={onOpenMobileNav}
        actions={<Chip tone={meta.tone} dot>{meta.sub}</Chip>}
      />

      <div className="p-4 sm:p-6 pb-12 max-w-4xl mx-auto space-y-4">
        {/* ---------- Indicador de progresso ---------- */}
        <div className={cn(CARD, 'p-4 sm:p-5')}>
          <div className="flex items-center gap-2 sm:gap-4">
            {STEPS.map((s, idx) => {
              const StepIcon = s.icon;
              const done = idx < step;
              const active = idx === step;
              return (
                <React.Fragment key={s.id}>
                  <button
                    onClick={() => idx < step && go(idx)}
                    disabled={idx > step}
                    className={cn(
                      'flex items-center gap-2.5 min-w-0 rounded-full transition-opacity duration-[180ms]',
                      idx > step && 'opacity-45 cursor-default',
                      idx < step && 'hover:opacity-70'
                    )}
                  >
                    <span
                      className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2',
                        'transition-[background-color,border-color,color,transform] duration-[260ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                        done && 'bg-ok border-ok text-white',
                        active && 'bg-navy-950 border-navy-950 text-white dark:bg-gold-400 dark:border-gold-400 dark:text-navy-950 scale-110',
                        !done && !active && 'bg-surface border-line text-muted'
                      )}
                    >
                      {done ? <Check className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                    </span>
                    <span className={cn('text-[13px] font-bold truncate hidden sm:block', active ? 'text-ink' : 'text-muted')}>
                      {s.label}
                    </span>
                  </button>

                  {idx < STEPS.length - 1 && (
                    <div className="flex-1 h-[3px] rounded-full bg-surface-2 overflow-hidden min-w-[12px]">
                      <div
                        className="h-full rounded-full bg-ok transition-[width] duration-[420ms] ease-[cubic-bezier(0.05,0.7,0.1,1)]"
                        style={{ width: idx < step ? '100%' : '0%' }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-[16px] border border-fail/25 bg-fail/8 px-4 py-3 text-[13px] text-fail animate-slide-down">
            <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
            <span>{error}</span>
          </div>
        )}

        {/* ---------- Passo 1: Colaborador ---------- */}
        {step === 0 && (
          <div key="s0" className={cn(CARD, 'p-5 sm:p-7 space-y-6', anim)}>
            <SectionHead icon={User} title="Dados do colaborador" sub="Identificação civil de quem está sendo admitido" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <Field
                col="md:col-span-6"
                label="Nome completo *"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Ex: Maria da Silva Santos"
                className={cn(touched && problems.name && 'border-fail')}
              />
              <Field col="md:col-span-3" label="CPF" value={form.cpf} onChange={(e) => set('cpf', e.target.value)} placeholder="000.000.000-00" />
              <Field col="md:col-span-3" label="RG" value={form.rg} onChange={(e) => set('rg', e.target.value)} placeholder="0.000.000" />

              <Field col="md:col-span-4" label="Órgão emissor" value={form.orgao} onChange={(e) => set('orgao', e.target.value)} placeholder="Ex: SSP/GO" />
              <Field col="md:col-span-4" label="Nacionalidade" value={form.nacionalidade} onChange={(e) => set('nacionalidade', e.target.value)} />
              <Field col="md:col-span-4" label="Estado civil" value={form.estadocivil} onChange={(e) => set('estadocivil', e.target.value)} placeholder="Solteiro(a), Casado(a)..." />
            </div>

            {/* Endereço com CEP */}
            <div className="pt-5 border-t border-line">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent" />
                  <span className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-ink">
                    Endereço residencial
                  </span>
                </div>
                {cep.loading && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-accent">
                    <Loader2 className="w-3.5 h-3.5 animate-spin-slow" /> Consultando...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-3 flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-muted ml-0.5">CEP</label>
                  <div className="relative">
                    <input
                      value={address.cep}
                      onChange={(e) => handleCep(e.target.value)}
                      placeholder="00000-000"
                      maxLength={9}
                      className="w-full rounded-[14px] border border-line bg-surface pl-9 pr-3.5 py-2.5 text-sm font-semibold text-ink placeholder:text-sand-400 placeholder:font-normal dark:placeholder:text-navy-500 outline-none transition-[border-color,box-shadow] duration-[180ms] focus:border-accent focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--app-accent)_16%,transparent)]"
                    />
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                      {cep.loading ? <Loader2 className="w-4 h-4 animate-spin-slow text-accent" /> : <Search className="w-4 h-4" />}
                    </span>
                  </div>
                </div>

                <Field col="md:col-span-6" label="Logradouro" value={address.logradouro} onChange={(e) => setAddressField('logradouro', e.target.value)} placeholder="Av. Brasil, Rua das Flores..." highlight={glow.logradouro} />
                <Field col="md:col-span-3" label="Número" value={address.numero} onChange={(e) => setAddressField('numero', e.target.value)} placeholder="123 ou S/N" />

                <Field col="md:col-span-4" label="Complemento" value={address.complemento} onChange={(e) => setAddressField('complemento', e.target.value)} placeholder="Apto 102, Qd. 10" />
                <Field col="md:col-span-4" label="Bairro" value={address.bairro} onChange={(e) => setAddressField('bairro', e.target.value)} placeholder="Setor Sul, Centro" highlight={glow.bairro} />
                <Field col="md:col-span-3" label="Cidade" value={address.cidade} onChange={(e) => setAddressField('cidade', e.target.value)} placeholder="São Paulo" highlight={glow.cidade} />
                <Field col="md:col-span-1" label="UF" value={address.uf} onChange={(e) => setAddressField('uf', e.target.value.toUpperCase().slice(0, 2))} placeholder="SP" maxLength={2} className="text-center uppercase" highlight={glow.uf} />

                {cep.message && (
                  <div
                    className={cn(
                      'md:col-span-12 flex items-center gap-2 rounded-[12px] border px-3.5 py-2 text-[12px] font-medium animate-slide-down',
                      cep.tone === 'ok' && 'border-ok/25 bg-ok/8 text-ok',
                      cep.tone === 'warn' && 'border-warn/30 bg-warn/10 text-warn',
                      cep.tone === 'info' && 'border-line bg-surface-2 text-muted'
                    )}
                  >
                    {cep.tone === 'ok' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                    {cep.tone === 'warn' && <AlertCircle className="w-4 h-4 shrink-0" />}
                    {cep.message}
                  </div>
                )}

                <Field
                  col="md:col-span-12"
                  label="Endereço completo (vai para a tag endereco_id)"
                  value={form.endereco}
                  onChange={(e) => set('endereco', e.target.value)}
                  placeholder="Rua, número, bairro, cidade - UF, CEP"
                  className="bg-surface-2 text-[12px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ---------- Passo 2: Contrato ---------- */}
        {step === 1 && (
          <div key="s1" className={cn('space-y-4', anim)}>
            <div className={cn(CARD, 'p-5 sm:p-7 space-y-6')}>
              <SectionHead icon={Wallet} title="Dados contratuais" sub="Cargo, remuneração e jornada" />

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <Field col="md:col-span-6" label="Cargo" value={form.cargo} onChange={(e) => set('cargo', e.target.value)} placeholder="Ex: Assistente Administrativo" />
                <Field col="md:col-span-6" label="Setor" value={form.setor} onChange={(e) => set('setor', e.target.value)} placeholder="Ex: Operações / Recepção" />

                <div className="md:col-span-6">
                  <Field
                    label="Salário base"
                    value={form.salario}
                    onChange={(e) => handleSalario(e.target.value)}
                    placeholder="R$ 0,00"
                    inputMode="numeric"
                  />
                  {/* Prévia por extenso em tempo real */}
                  <div
                    className={cn(
                      'overflow-hidden transition-[max-height,opacity] duration-[260ms] ease-[cubic-bezier(0.05,0.7,0.1,1)]',
                      extenso ? 'max-h-16 opacity-100 mt-2' : 'max-h-0 opacity-0'
                    )}
                  >
                    <p className="text-[11px] text-muted leading-snug first-letter:uppercase">
                      {extenso}
                    </p>
                  </div>
                </div>

                <Field
                  col="md:col-span-6"
                  label="Data de admissão *"
                  type="date"
                  value={form.data_contratacao}
                  onChange={(e) => set('data_contratacao', e.target.value)}
                  className={cn(touched && problems.data_contratacao && 'border-fail')}
                />

                <Field col="md:col-span-12" label="Horário de trabalho" value={form.horario} onChange={(e) => set('horario', e.target.value)} placeholder="Ex: 08:00 às 18:00, com 1h de intervalo" />
              </div>
            </div>

            <div className={cn(CARD, 'p-5 sm:p-7 space-y-6')}>
              <SectionHead icon={Building2} title="Vínculo e benefícios" sub="Empresa contratante e vale-transporte" />

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <SelectField
                  col="md:col-span-7"
                  label="Empresa contratante *"
                  value={form.empresa}
                  onChange={(e) => handleCompany(e.target.value)}
                  className={cn(touched && problems.empresa && 'border-fail')}
                >
                  <option value="">Selecione a empresa...</option>
                  {companies.map((c) => (
                    <option key={c.id || c.name} value={c.name}>{c.name}</option>
                  ))}
                </SelectField>

                <Field
                  col="md:col-span-5"
                  label="CNPJ (automático)"
                  value={form.cnpj}
                  readOnly
                  placeholder="Selecione a empresa"
                  className="font-mono bg-surface-2 text-muted cursor-not-allowed"
                  highlight={cnpjGlow}
                />

                <div className="md:col-span-6 flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-muted ml-0.5">
                    Transporte da empresa
                  </label>
                  <Segmented
                    value={form.utiliza}
                    onChange={(v) => set('utiliza', v)}
                    options={[{ value: 'sim', label: 'Vai utilizar' }, { value: 'nao', label: 'Não utiliza' }]}
                  />
                </div>
              </div>
            </div>

            {/* Bloco condicional do motorista — entra expandindo */}
            {type === 'motorista' && (
              <div className={cn(CARD, 'p-5 sm:p-7 space-y-6 border-cat-motorista/30 animate-fade-up')}>
                <SectionHead icon={Car} title="Habilitação" sub="Obrigatório para motoristas profissionais" tone="motorista" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Número de registro da CNH" value={form.cnh} onChange={(e) => set('cnh', e.target.value)} placeholder="00000000000" />
                  <SelectField label="Categoria" value={form.categoria} onChange={(e) => set('categoria', e.target.value)}>
                    <option value="">Selecione...</option>
                    {['A', 'B', 'AB', 'C', 'D', 'E', 'AD', 'AE'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </SelectField>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------- Passo 3: Revisão ---------- */}
        {step === 2 && (
          <div key="s2" className={cn('space-y-4', anim)}>
            {Object.keys(problems).length > 0 && (
              <div className={cn(CARD, 'p-5 border-fail/30')}>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-fail" />
                  <span className="text-[13px] font-bold text-ink">Faltam campos obrigatórios</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.values(problems).map((p) => (
                    <button
                      key={p.label}
                      onClick={() => go(p.step)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-fail/25 bg-fail/8 px-3 py-1.5 text-[11px] font-bold text-fail hover:bg-fail/12"
                    >
                      {p.label}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={cn(CARD, 'overflow-hidden')}>
              <div className="flex items-center gap-3 px-5 sm:px-7 py-5 border-b border-line">
                <span
                  className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `color-mix(in oklab, ${meta.color} 14%, transparent)`, color: meta.color }}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-[17px] font-bold text-ink truncate">{form.name || 'Colaborador sem nome'}</h2>
                  <p className="text-[12px] text-muted truncate">
                    {[form.cargo, form.empresa].filter(Boolean).join(' · ') || 'Cargo e empresa a definir'}
                  </p>
                </div>
              </div>

              <dl className="divide-y divide-line">
                <Row label="CPF / RG" value={[form.cpf, form.rg].filter(Boolean).join(' · ')} />
                <Row label="Órgão emissor" value={form.orgao} />
                <Row label="Nacionalidade / estado civil" value={[form.nacionalidade, form.estadocivil].filter(Boolean).join(' · ')} />
                <Row label="Endereço" value={form.endereco} />
                <Row label="Setor" value={form.setor} />
                <Row label="Salário" value={form.salario && `${form.salario} — ${extenso}`} />
                <Row label="Admissão" value={form.data_contratacao && new Date(`${form.data_contratacao}T12:00:00`).toLocaleDateString('pt-BR', { dateStyle: 'long' })} />
                <Row label="Horário" value={form.horario} />
                <Row label="CNPJ" value={form.cnpj} mono />
                <Row label="Transporte da empresa" value={form.utiliza === 'sim' ? 'Vai utilizar' : 'Não utiliza'} />
                {type === 'motorista' && (
                  <Row label="CNH" value={[form.cnh, form.categoria && `categoria ${form.categoria}`].filter(Boolean).join(' · ')} />
                )}
              </dl>
            </div>

            <div className={cn(CARD, 'p-5 sm:p-7')}>
              {status === 'generating' ? (
                <div className="text-center py-4">
                  <div className="flex items-center justify-center gap-2.5 mb-4">
                    <Loader2 className="w-5 h-5 text-accent animate-spin-slow" />
                    <span className="text-[14px] font-bold text-ink">Preenchendo os templates...</span>
                  </div>
                  <div className="h-1.5 max-w-sm mx-auto rounded-full bg-surface-2 overflow-hidden">
                    <div className="skeleton h-full w-full" />
                  </div>
                  <p className="text-[12px] text-muted mt-4">
                    O servidor está injetando os dados em cada arquivo .docx e compactando o kit.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-[12px] text-muted text-center sm:text-left max-w-sm">
                    Todos os templates da categoria <strong className="text-ink">{meta.title.toLowerCase()}</strong> serão
                    preenchidos e entregues num único arquivo .zip.{' '}
                    <button onClick={onOpenTags} className="text-accent font-semibold hover:underline">
                      Ver as tags usadas
                    </button>
                  </p>
                  <Button size="lg" icon={Sparkles} onClick={generate} className="w-full sm:w-auto shrink-0">
                    Gerar kit de documentos
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------- Navegação ---------- */}
        {status !== 'generating' && (
          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" icon={ArrowLeft} onClick={() => go(step - 1)} disabled={step === 0}>
              Voltar
            </Button>

            {step < 2 ? (
              <Button onClick={advance}>
                Continuar
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <span className="text-[11px] text-muted">
                Passo {step + 1} de {STEPS.length}
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );
}

/* ---------------- Auxiliares ---------------- */

function SectionHead({ icon: Icon, title, sub, tone }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          'w-9 h-9 rounded-[12px] flex items-center justify-center shrink-0',
          tone === 'motorista' ? 'bg-cat-motorista/12 text-cat-motorista' : 'tint-accent text-accent'
        )}
      >
        <Icon className="w-4 h-4" />
      </span>
      <div>
        <h3 className="text-[13px] font-extrabold uppercase tracking-[0.06em] text-ink">{title}</h3>
        <p className="text-[12px] text-muted">{sub}</p>
      </div>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-baseline gap-4 px-5 sm:px-7 py-3">
      <dt className="text-[11px] font-bold uppercase tracking-[0.06em] text-muted w-44 shrink-0">{label}</dt>
      <dd className={cn('text-[13px] font-semibold text-ink min-w-0 break-words', mono && 'font-mono text-[12px]', !value && 'text-muted font-normal italic')}>
        {value || 'não informado'}
      </dd>
    </div>
  );
}
