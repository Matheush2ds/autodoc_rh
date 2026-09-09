import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  FileText, 
  Users, 
  Briefcase, 
  Clock, 
  Zap, 
  Award, 
  Truck, 
  GraduationCap, 
  Building2, 
  Download, 
  Sparkles, 
  ArrowUpRight, 
  TrendingUp, 
  Calendar,
  Layers,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

// Card Principal de Estatísticas com suporte a Tema Claro e Escuro
const MainStatCard = ({ title, value, icon: Icon, color, bg, subtext, trend, accentGradient = 'from-gold-400 to-gold-600' }) => (
  <div className="bg-gradient-to-b from-white via-white to-slate-50/70 dark:from-navy-900 dark:via-navy-900 dark:to-navy-950/90 p-4 sm:p-6 rounded-2xl shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] border border-slate-200/80 dark:border-navy-800/80 hover:border-slate-300 dark:hover:border-navy-700 hover:shadow-[0_20px_35px_-10px_rgba(15,23,42,0.12)] hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between">
    {/* Barra de brilho superior no hover */}
    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accentGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
    
    {/* Marca d'água de fundo */}
    <div className={`absolute -right-5 -bottom-5 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.08] dark:group-hover:opacity-[0.12] transition-all duration-500 transform group-hover:scale-125 group-hover:-rotate-6 pointer-events-none ${color}`}>
      <Icon className="w-28 sm:w-36 h-28 sm:h-36" />
    </div>

    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center ${bg} ${color} shadow-sm border border-black/5 dark:border-white/10 group-hover:scale-110 group-hover:shadow-md transition-all duration-300`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        {trend && (
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 group-hover:bg-gold-50 dark:group-hover:bg-navy-700 group-hover:text-gold-700 dark:group-hover:text-gold-400 transition-colors">
            {trend}
          </span>
        )}
      </div>

      <p className="text-[11px] sm:text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy-900 dark:text-white tracking-tight">{value}</h3>
      </div>
    </div>

    {subtext && (
      <div className="relative z-10 mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100/90 dark:border-navy-800/80 flex items-center justify-between text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
        <span className="truncate pr-1">{subtext}</span>
        <ArrowUpRight size={14} className="text-slate-400 dark:text-slate-500 group-hover:text-navy-900 dark:group-hover:text-gold-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
      </div>
    )}
  </div>
);

// Card Especial de Economia de Tempo
const TimeSavedCard = ({ hours, mins }) => (
  <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white rounded-2xl p-4 sm:p-6 relative overflow-hidden shadow-[0_10px_30px_-5px_rgba(16,185,129,0.35)] border border-emerald-400/30 group hover:shadow-[0_20px_40px_-5px_rgba(16,185,129,0.45)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
    {/* Efeito Glow */}
    <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
    <div className="absolute top-0 right-0 p-4 opacity-15 group-hover:opacity-25 transition-opacity pointer-events-none">
      <Zap className="w-20 sm:w-28 h-20 sm:h-28 transform group-hover:rotate-12 transition-transform duration-500" />
    </div>

    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="p-2 sm:p-2.5 bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/20 shadow-inner">
          <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-white/20 backdrop-blur-md text-emerald-50 border border-white/20">
          <Sparkles size={11} className="text-emerald-200" /> <span className="hidden sm:inline">Alta Eficiência</span><span className="sm:hidden">100%</span>
        </span>
      </div>

      <p className="text-[11px] sm:text-xs font-bold text-emerald-100/90 uppercase tracking-wider mb-1">Economia de Tempo</p>
      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-0.5 sm:mb-1 tracking-tight text-white flex items-baseline gap-1">
        {hours}<span className="text-base sm:text-xl font-bold opacity-85">h</span> {mins}<span className="text-base sm:text-xl font-bold opacity-85">m</span>
      </h3>
      <p className="text-emerald-100 text-[10px] sm:text-xs font-medium opacity-90 line-clamp-1 sm:line-clamp-none">poupados em todos os contratos</p>
    </div>

    <div className="relative z-10 mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-white/15 flex items-center justify-between text-[10px] sm:text-[11px] text-emerald-100/80 font-medium">
      <span className="hidden sm:inline">*Base: ~14 min no conjunto de todos os contratos</span>
      <span className="sm:hidden">~14 min/kit completo</span>
      <span className="text-emerald-200 font-semibold flex items-center gap-1">
        100% Auto
      </span>
    </div>
  </div>
);

// Card de Categorias de Contrato com suporte otimizado para 3 colunas no mobile
const TypeCard = ({ label, count, icon: Icon, gradient, percentage, shadowColor, sublabel }) => (
  <div className={`p-2.5 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl text-white relative overflow-hidden ${gradient} ${shadowColor} hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 group border border-white/20 flex flex-col justify-between`}>
    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none"></div>

    <div className="absolute -right-4 -bottom-4 sm:-right-6 sm:-bottom-6 opacity-10 rotate-12 group-hover:opacity-20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 pointer-events-none">
      <Icon className="w-16 h-16 sm:w-36 sm:h-36" />
    </div>

    <div className="relative z-10">
      <div className="flex items-center justify-between mb-2 sm:mb-5 gap-1">
        <div className="p-1.5 sm:p-3 bg-white/20 backdrop-blur-md rounded-lg sm:rounded-2xl shadow-inner border border-white/25 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-3.5 h-3.5 sm:w-6 sm:h-6 text-white" />
        </div>
        <span className="text-[10px] sm:text-xs font-black bg-white/25 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-white backdrop-blur-md shadow-sm border border-white/30 whitespace-nowrap">
          {percentage}%
        </span>
      </div>

      <h4 className="text-base sm:text-3xl lg:text-4xl font-black mb-0.5 sm:mb-1 tracking-tight text-white flex items-baseline gap-1">
        {count} <span className="text-[10px] sm:text-sm font-medium opacity-80">docs</span>
      </h4>
      <p className="text-[11px] sm:text-base font-bold text-white tracking-tight line-clamp-1 sm:line-clamp-none leading-tight">{label}</p>
      {sublabel && <p className="hidden md:block text-xs text-white/80 mt-0.5">{sublabel}</p>}
    </div>

    <div className="relative z-10 mt-2 sm:mt-5 pt-2 sm:pt-4 border-t border-white/15">
      <div className="hidden sm:flex justify-between items-center text-[11px] text-white/80 font-medium mb-1.5">
        <span>Participação</span>
        <span className="font-bold">{percentage}%</span>
      </div>
      <div className="w-full bg-black/20 rounded-full h-1.5 sm:h-2.5 overflow-hidden p-0.5 backdrop-blur-sm border border-white/10">
        <div 
          className="bg-white h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
          style={{ width: `${Math.max(percentage, 4)}%` }}
        ></div>
      </div>
    </div>
  </div>
);

// Componente Visual da Lista de Empresas
const CompanyListItem = ({ name, count, total, index }) => {
  const percentage = Math.round((count / total) * 100);
  const themes = [
    { bg: 'bg-blue-600 text-white', bar: 'from-blue-600 to-indigo-600', rank: 'bg-amber-400 text-amber-950 font-black' },
    { bg: 'bg-amber-600 text-white', bar: 'from-amber-500 to-orange-500', rank: 'bg-slate-300 text-slate-800 font-bold' },
    { bg: 'bg-emerald-600 text-white', bar: 'from-emerald-500 to-teal-500', rank: 'bg-amber-700 text-amber-100 font-bold' },
    { bg: 'bg-purple-600 text-white', bar: 'from-purple-500 to-violet-600', rank: 'bg-slate-100 dark:bg-navy-700 text-slate-600 dark:text-slate-200 font-bold' },
    { bg: 'bg-rose-600 text-white', bar: 'from-rose-500 to-pink-500', rank: 'bg-slate-100 dark:bg-navy-700 text-slate-600 dark:text-slate-200 font-bold' },
  ];
  const colorTheme = themes[index % themes.length];

  return (
    <div className="flex items-center gap-4 py-3.5 px-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-navy-800/50 border border-transparent hover:border-slate-100 dark:hover:border-navy-800 transition-all duration-200 group">
      <div className="relative shrink-0">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm ${colorTheme.bg} group-hover:scale-105 transition-transform`}>
          {name.substring(0, 2).toUpperCase()}
        </div>
        <span className={`absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full ${colorTheme.rank} text-[10px] flex items-center justify-center shadow-sm`}>
          {index + 1}º
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1.5">
          <h5 className="text-sm font-bold text-navy-900 dark:text-slate-100 truncate pr-2 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors" title={name}>
            {name}
          </h5>
          <span className="text-xs font-extrabold text-navy-900 dark:text-slate-200 bg-slate-100 dark:bg-navy-800 group-hover:bg-gold-50 dark:group-hover:bg-navy-700 group-hover:text-gold-700 dark:group-hover:text-gold-400 px-2.5 py-0.5 rounded-full transition-colors shrink-0">
            {count} {count === 1 ? 'doc' : 'docs'}
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-navy-950 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full rounded-full bg-gradient-to-r ${colorTheme.bar} transition-all duration-1000 ease-out shadow-sm`}
            style={{ width: `${Math.max(percentage, 5)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    axios.get('/api/dashboard-data')
      .then(res => setData(res.data))
      .catch(err => {
        console.error(err);
        setError('Não foi possível conectar ao servidor para obter os indicadores do painel.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <div className="w-14 h-14 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Carregando indicadores do painel...</p>
    </div>
  );

  if (error || !data) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center mb-4 border border-red-200 dark:border-red-900/50">
        <AlertCircle size={32} />
      </div>
      <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-2">Falha na Comunicação</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">{error || 'Os indicadores do painel não estão disponíveis.'}</p>
      <button 
        onClick={fetchData}
        className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
      >
        <RefreshCw size={16} />
        Tentar Novamente
      </button>
    </div>
  );

  const totalKits = data?.stats?.total || 0;
  const total = totalKits || 1;
  const regularCount = data?.charts?.types?.regular || 0;
  const motoristaCount = data?.charts?.types?.motorista || 0;
  const aprendizCount = data?.charts?.types?.aprendiz || 0;

  // Cálculo de Tempo Economizado: 14 minutos economizados no preenchimento de todos os contratos de cada kit admissional
  const minutesSaved = totalKits * 14;
  const hours = Math.floor(minutesSaved / 60);
  const mins = minutesSaved % 60;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Título de Seção com Contexto e Data */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-gold-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">Visão Executiva</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-navy-900 dark:text-white tracking-tight">Painel de Métricas & Produtividade</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Monitoramento em tempo real do processamento de contratos e kits admissionais.</p>
        </div>
        <div className="bg-white dark:bg-navy-900 px-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.04)] text-xs text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-2 self-start md:self-auto">
          <Calendar size={15} className="text-gold-500" />
          {new Date().toLocaleDateString('pt-BR', { dateStyle: 'long' })}
        </div>
      </div>

      {/* Grid Principal dos Cards de Métricas (2 cols no mobile, 4 cols desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <MainStatCard 
          title="Gerados Hoje" 
          value={data.stats.today} 
          icon={FileText} 
          color="text-blue-600 dark:text-blue-400" 
          bg="bg-blue-50 dark:bg-blue-950/60" 
          subtext="Documentos emitidos hoje"
          trend="Hoje"
          accentGradient="from-blue-400 to-indigo-600"
        />
        <MainStatCard 
          title="Mês Atual" 
          value={data.stats.month} 
          icon={Briefcase} 
          color="text-indigo-600 dark:text-indigo-400" 
          bg="bg-indigo-50 dark:bg-indigo-950/60" 
          subtext="Volume acumulado no mês"
          trend="Mensal"
          accentGradient="from-indigo-400 to-purple-600"
        />
        <MainStatCard 
          title="Total Histórico" 
          value={data.stats.total} 
          icon={Award} 
          color="text-gold-600 dark:text-gold-400" 
          bg="bg-gold-50 dark:bg-gold-950/60" 
          subtext="Total de kits gerados"
          trend="Geral"
          accentGradient="from-gold-400 to-amber-600"
        />
        <TimeSavedCard hours={hours} mins={mins} />
      </div>

      {/* Seção de Categorias de Contrato */}
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-5 sm:h-6 bg-navy-900 dark:bg-gold-500 rounded-full"></div>
            <h2 className="text-base sm:text-lg font-bold text-navy-900 dark:text-white tracking-tight">Categorias de Contratação</h2>
          </div>
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-navy-900 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-transparent dark:border-navy-800">
            {total} kits gerados
          </span>
        </div>

        {/* 3 cards lado a lado no mobile e no desktop */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
          <TypeCard 
            label="Funcionário Regular" 
            sublabel="Contratações padrão CLT"
            count={regularCount} 
            icon={Users} 
            percentage={Math.round((regularCount / total) * 100)} 
            gradient="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800" 
            shadowColor="shadow-[0_10px_25px_-5px_rgba(37,99,235,0.3)]"
          />
          <TypeCard 
            label="Motoristas" 
            sublabel="Com CNH e Termo Veicular"
            count={motoristaCount} 
            icon={Truck} 
            percentage={Math.round((motoristaCount / total) * 100)} 
            gradient="bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700" 
            shadowColor="shadow-[0_10px_25px_-5px_rgba(217,119,6,0.3)]"
          />
          <TypeCard 
            label="Menor Aprendiz" 
            sublabel="Lei da Aprendizagem"
            count={aprendizCount} 
            icon={GraduationCap} 
            percentage={Math.round((aprendizCount / total) * 100)} 
            gradient="bg-gradient-to-br from-purple-600 via-violet-600 to-purple-900" 
            shadowColor="shadow-[0_10px_25px_-5px_rgba(147,51,234,0.3)]"
          />
        </div>
      </div>

      {/* Área de Gráficos e Ranking de Empresas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Gráfico de Atividade Recente (Card Premium) */}
        <div className="lg:col-span-2 bg-gradient-to-b from-white to-slate-50/50 dark:from-navy-900 dark:to-navy-950/80 p-6 md:p-8 rounded-3xl shadow-[0_4px_25px_-4px_rgba(15,23,42,0.06)] border border-slate-200/80 dark:border-navy-800/80">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gold-50 dark:bg-gold-950/50 text-gold-600 dark:text-gold-400 rounded-xl border border-gold-200/60 dark:border-gold-800/40 shadow-sm">
                <TrendingUp size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-navy-900 dark:text-white leading-tight">Atividade Recente</h2>
                <p className="text-xs text-slate-400">Volume de documentos emitidos nos últimos 7 dias</p>
              </div>
            </div>
            <span className="text-xs font-bold text-navy-900 dark:text-slate-200 bg-slate-100 dark:bg-navy-800 px-3.5 py-1.5 rounded-full border border-slate-200/70 dark:border-navy-700">
              Últimos 7 Dias
            </span>
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.charts.daily.labels.map((l, i) => ({ name: l, docs: data.charts.daily.data[i] }))}>
                <defs>
                  <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '16px', 
                    border: '1px solid rgba(51, 65, 85, 0.6)', 
                    boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.25)',
                    fontWeight: 600,
                    backgroundColor: '#0f172a',
                    color: '#ffffff'
                  }}
                  formatter={(value) => [`${value} kits gerados`, 'Volume']}
                  cursor={{stroke: '#d97706', strokeWidth: 1.5, strokeDasharray: '4 4'}}
                />
                <Area type="monotone" dataKey="docs" stroke="#d97706" strokeWidth={3.5} fillOpacity={1} fill="url(#colorDocs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card de Top Empresas */}
        <div className="bg-gradient-to-b from-white to-slate-50/50 dark:from-navy-900 dark:to-navy-950/80 p-6 md:p-8 rounded-3xl shadow-[0_4px_25px_-4px_rgba(15,23,42,0.06)] border border-slate-200/80 dark:border-navy-800/80 flex flex-col">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-navy-800">
            <div className="p-2.5 bg-navy-50 dark:bg-navy-800 text-navy-900 dark:text-gold-400 rounded-xl border border-navy-100 dark:border-navy-700 shadow-sm">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy-900 dark:text-white leading-tight">Top Empresas</h2>
              <p className="text-xs text-slate-400">Maiores volumes de emissão</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {data.charts.companies.slice(0, 5).map((company, index) => (
              <CompanyListItem 
                key={index}
                name={company.company_name}
                count={company.count}
                total={total}
                index={index}
              />
            ))}
            {data.charts.companies.length === 0 && (
              <div className="py-12 text-center text-xs text-slate-400 font-medium">
                Nenhum dado por empresa ainda.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabela de Histórico Recente (Card com Acabamento Premium) */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl shadow-[0_4px_25px_-4px_rgba(15,23,42,0.06)] border border-slate-200/80 dark:border-navy-800/80 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between bg-gradient-to-r from-slate-50 via-slate-50/80 to-slate-100/40 dark:from-navy-950 dark:via-navy-900 dark:to-navy-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-navy-900 dark:bg-navy-800 text-gold-400 rounded-xl shadow-sm border border-navy-800 dark:border-navy-700">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy-900 dark:text-white">Histórico de Gerações</h2>
              <p className="text-xs text-slate-400">Últimos documentos processados pelo sistema</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-navy-800 px-3 py-1 rounded-xl border border-slate-200/80 dark:border-navy-700 shadow-sm">
            {data.history.length} registros
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50/80 dark:bg-navy-950/60 text-[11px] uppercase font-bold text-slate-400 dark:text-slate-400 tracking-wider border-b border-slate-100 dark:border-navy-800">
              <tr>
                <th className="p-5 pl-8 whitespace-nowrap">Data / Hora</th>
                <th className="p-5 whitespace-nowrap">Colaborador</th>
                <th className="p-5 whitespace-nowrap">Empresa</th>
                <th className="p-5 whitespace-nowrap">Categoria</th>
                <th className="p-5 text-right pr-8 whitespace-nowrap">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800/70">
              {data.history.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/90 dark:hover:bg-navy-800/40 transition-colors group">
                  <td className="p-5 pl-8 font-semibold text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
                    {doc.gen_date}
                  </td>
                  <td className="p-5 font-bold text-navy-900 dark:text-white whitespace-nowrap">
                    {doc.employee_name}
                  </td>
                  <td className="p-5">
                    <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium bg-slate-100 dark:bg-navy-950 text-slate-800 dark:text-slate-300 border border-slate-200/60 dark:border-navy-800 max-w-xs truncate" title={doc.company_name}>
                      {doc.company_name}
                    </span>
                  </td>
                  <td className="p-5 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize
                      ${doc.employee_type === 'regular' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-900/50' : 
                        doc.employee_type === 'motorista' ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-900/50' : 
                        'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/70 dark:border-purple-900/50'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        doc.employee_type === 'regular' ? 'bg-blue-500' : 
                        doc.employee_type === 'motorista' ? 'bg-amber-500' : 'bg-purple-500'
                      }`}></span>
                      {doc.employee_type}
                    </span>
                  </td>
                  <td className="p-5 text-right pr-8 whitespace-nowrap">
                    <a 
                      href={`/download_zip/${doc.zip_filename}`} 
                      className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-navy-900 dark:bg-navy-800 hover:bg-gradient-to-r hover:from-gold-500 hover:to-gold-600 hover:shadow-glow active:scale-95 transition-all duration-200 gap-2 shadow-sm"
                    >
                      <Download size={14} /> Baixar Kit
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.history.length === 0 && (
            <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-sm font-medium">
              Nenhum documento gerado recentemente.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}