import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, Users, Briefcase, Clock, Zap, Award, Truck, GraduationCap, Building2 } from 'lucide-react';

// Card Principal (Topo)
const MainStatCard = ({ title, value, icon: Icon, color, bg, subtext }) => (
  <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100/60 relative overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
    <div className={`absolute -right-4 -top-4 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:scale-110 ${color}`}>
        <Icon className="w-32 h-32" />
    </div>
    <div className="relative z-10">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${bg} ${color} shadow-sm`}>
            <Icon className="w-6 h-6" />
        </div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-navy-900 tracking-tight">{value}</h3>
        {subtext && <p className="text-xs font-medium text-slate-400 mt-2">{subtext}</p>}
    </div>
  </div>
);

// Card de Tipo (Amigável)
const TypeCard = ({ label, count, icon: Icon, gradient, percentage }) => (
  <div className={`p-6 rounded-2xl shadow-soft text-white relative overflow-hidden ${gradient} hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group`}>
    <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12 group-hover:opacity-20 transition-opacity">
        <Icon className="w-32 h-32" />
    </div>
    <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl shadow-inner">
                <Icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg text-white backdrop-blur-md shadow-sm">{percentage}%</span>
        </div>
        <h4 className="text-3xl font-bold mb-1 tracking-tight">{count}</h4>
        <p className="text-sm font-medium opacity-90">{label}</p>
    </div>
  </div>
);

// Componente Visual de Lista de Empresas (Substitui o gráfico feio)
const CompanyListItem = ({ name, count, total, index }) => {
    const percentage = Math.round((count / total) * 100);
    // Cores para os avatares das empresas
    const colors = ['bg-blue-100 text-blue-600', 'bg-amber-100 text-amber-600', 'bg-emerald-100 text-emerald-600', 'bg-purple-100 text-purple-600', 'bg-rose-100 text-rose-600'];
    const colorClass = colors[index % colors.length];

    return (
        <div className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 p-2 rounded-lg transition-colors">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${colorClass}`}>
                {name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1.5">
                    <h5 className="text-sm font-semibold text-navy-900 truncate pr-2" title={name}>{name}</h5>
                    <span className="text-xs font-bold text-slate-500">{count} docs</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                        className="bg-navy-900 h-2 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/dashboard-data')
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[80vh]">
        <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-slate-400">Carregando métricas...</p>
    </div>
  );

  const total = data.stats.total || 1;
  const regularCount = data.charts.types.regular || 0;
  const motoristaCount = data.charts.types.motorista || 0;
  const aprendizCount = data.charts.types.aprendiz || 0;

  // Cálculo de Tempo
  const minutesSaved = total * 14;
  const hours = Math.floor(minutesSaved / 60);
  const mins = minutesSaved % 60;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-navy-900 tracking-tight">Painel de Controle</h1>
            <p className="text-slate-500">Acompanhe a produtividade e geração de contratos.</p>
        </div>
        <div className="bg-white px-5 py-2.5 rounded-xl border border-slate-200/60 shadow-sm text-sm text-slate-600 font-medium flex items-center gap-2">
            <Clock size={16} className="text-gold-500" />
            {new Date().toLocaleDateString('pt-BR', { dateStyle: 'long' })}
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MainStatCard title="Gerados Hoje" value={data.stats.today} icon={FileText} color="text-blue-600" bg="bg-blue-50" subtext="Documentos hoje" />
        <MainStatCard title="Mês Atual" value={data.stats.month} icon={Briefcase} color="text-indigo-600" bg="bg-indigo-50" subtext="Volume mensal" />
        <MainStatCard title="Total Histórico" value={data.stats.total} icon={Award} color="text-gold-600" bg="bg-gold-50" subtext="Desde o início" />
        
        {/* Card Especial de Tempo (Visual Premium) */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-lg shadow-emerald-500/20 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-20">
                <Zap className="w-24 h-24" />
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 text-emerald-100 font-bold text-xs uppercase tracking-wider">
                    <Clock size={14} /> Economia de Tempo
                </div>
                <h3 className="text-4xl font-bold mb-1 tracking-tight">
                    {hours}<span className="text-xl opacity-80">h</span> {mins}<span className="text-xl opacity-80">m</span>
                </h3>
                <p className="text-emerald-100 text-sm font-medium opacity-90">poupados da equipe</p>
                <div className="mt-4 pt-4 border-t border-white/10 text-[10px] text-emerald-50 opacity-70">
                    *Média de 14min por contrato manual.
                </div>
            </div>
        </div>
      </div>

      {/* Tipos de Contrato */}
      <div>
        <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-navy-900 rounded-full"></div>
            Categorias
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TypeCard label="Funcionário Regular" count={regularCount} icon={Users} percentage={Math.round((regularCount / total) * 100)} gradient="bg-gradient-to-br from-blue-500 to-blue-700" />
            <TypeCard label="Motoristas" count={motoristaCount} icon={Truck} percentage={Math.round((motoristaCount / total) * 100)} gradient="bg-gradient-to-br from-amber-500 to-orange-600" />
            <TypeCard label="Menor Aprendiz" count={aprendizCount} icon={GraduationCap} percentage={Math.round((aprendizCount / total) * 100)} gradient="bg-gradient-to-br from-purple-500 to-violet-700" />
        </div>
      </div>

      {/* Área de Gráficos e Listas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Gráfico de Área (Suavizado) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-card border border-slate-100/60">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-navy-900">Atividade Recente</h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">7 Dias</span>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.charts.daily.labels.map((l, i) => ({ name: l, docs: data.charts.daily.data[i] }))}>
                    <defs>
                        <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d97706" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)'}}
                        cursor={{stroke: '#d97706', strokeWidth: 1, strokeDasharray: '4 4'}}
                    />
                    <Area type="monotone" dataKey="docs" stroke="#d97706" strokeWidth={3} fillOpacity={1} fill="url(#colorDocs)" />
                </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lista de Empresas (Design Premium) */}
        <div className="bg-white p-8 rounded-3xl shadow-card border border-slate-100/60 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
             <div className="p-2 bg-navy-50 text-navy-900 rounded-lg">
                <Building2 size={20} />
             </div>
             <div>
                 <h2 className="text-lg font-bold text-navy-900 leading-tight">Top Empresas</h2>
                 <p className="text-xs text-slate-400">Maior volume de emissão</p>
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {data.charts.companies.slice(0, 5).map((company, index) => (
                <CompanyListItem 
                    key={index}
                    name={company.company_name}
                    count={company.count}
                    total={total}
                    index={index}
                />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}