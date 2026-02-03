import React, { useState } from 'react';
import axios from 'axios';
import { COMPANIES } from '../constants';
import { Save, Loader2, CheckCircle2, User, Building2, Wallet, Car } from 'lucide-react';

export default function DocumentForm({ type }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    employee_type: type, empresa: '', cnpj: '', utiliza: 'sim'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'empresa') {
      const company = COMPANIES.find(c => c.name === value);
      setFormData(prev => ({ ...prev, [name]: value, cnpj: company ? company.cnpj : '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePriceMask = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = (Number(value) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    setFormData(prev => ({ ...prev, salario: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setSuccess(false);
    try {
        const body = new FormData();
        Object.keys(formData).forEach(key => body.append(key, formData[key]));
        body.set('employee_type', type);
        const response = await axios.post('/api/generate', body, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Kit_Admissao_${formData.name || 'Funcionario'}.zip`);
        document.body.appendChild(link);
        link.click(); link.remove();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
        alert("Erro no processamento. Verifique os dados.");
    } finally {
        setLoading(false);
    }
  };

  const config = {
    regular: { title: "Contrato Regular", desc: "Admissão padrão CLT", color: "text-blue-600", bg: "bg-blue-50" },
    motorista: { title: "Contrato Motorista", desc: "Admissão com CNH obrigatória", color: "text-amber-600", bg: "bg-amber-50" },
    aprendiz: { title: "Menor Aprendiz", desc: "Contrato de aprendizagem", color: "text-purple-600", bg: "bg-purple-50" }
  };

  const theme = config[type] || config.regular;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      {/* Header do Form */}
      <div className="flex items-center justify-between mb-8">
        <div>
            <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${theme.bg}`}>
                    <Building2 className={`w-6 h-6 ${theme.color}`} />
                </div>
                <h1 className="text-3xl font-bold text-navy-900 tracking-tight">{theme.title}</h1>
            </div>
            <p className="text-slate-500 ml-11">{theme.desc}</p>
        </div>
        {success && (
            <div className="animate-bounce-in bg-emerald-50 text-emerald-700 px-6 py-3 rounded-xl border border-emerald-100 flex items-center gap-3 shadow-sm">
                <CheckCircle2 className="w-5 h-5 fill-emerald-500 text-white" />
                <span className="font-semibold">Arquivos gerados com sucesso!</span>
            </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-card border border-slate-100 overflow-hidden">
        
        {/* Seção 1: Pessoal */}
        <div className="p-8 border-b border-slate-100">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">
                <User className="w-4 h-4 text-gold-500" /> Dados do Colaborador
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <Input col="md:col-span-6" label="Nome Completo" name="name" onChange={handleChange} required placeholder="Ex: João da Silva" />
                <Input col="md:col-span-3" label="CPF" name="cpf" onChange={handleChange} placeholder="000.000.000-00" />
                <Input col="md:col-span-3" label="RG" name="rg" onChange={handleChange} />
                
                <Input col="md:col-span-4" label="Nacionalidade" name="nacionalidade" onChange={handleChange} defaultValue="Brasileiro(a)" />
                <Input col="md:col-span-4" label="Estado Civil" name="estadocivil" onChange={handleChange} />
                <Input col="md:col-span-4" label="Órgão Emissor" name="orgao" onChange={handleChange} />
                
                <Input col="md:col-span-12" label="Endereço Completo" name="endereco" onChange={handleChange} placeholder="Rua, Número, Bairro, Cidade - UF" />
            </div>
        </div>

        {/* Seção 2: Contratual */}
        <div className="p-8 bg-slate-50/50">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">
                <Wallet className="w-4 h-4 text-gold-500" /> Dados Contratuais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-6 space-y-6">
                    <Input label="Cargo" name="cargo" onChange={handleChange} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Salário" name="salario" value={formData.salario || ''} onChange={handlePriceMask} placeholder="R$ 0,00" />
                        <Input label="Data Admissão" name="data_contratacao" type="date" onChange={handleChange} required />
                    </div>
                    <Input label="Horário de Trabalho" name="horario" onChange={handleChange} placeholder="08:00 às 18:00 (1h almoço)" />
                </div>

                <div className="md:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Empresa Contratante</label>
                        <select name="empresa" onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all text-sm font-medium text-navy-900" required>
                            <option value="">Selecione a empresa...</option>
                            {COMPANIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                    <Input label="CNPJ Vinculado" name="cnpj" value={formData.cnpj} readOnly bg="bg-slate-100 text-slate-500 cursor-not-allowed" />
                    
                    <div className="mt-4">
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Setor</label>
                         <input name="setor" onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl focus:border-gold-500 outline-none" />
                    </div>
                    <div className="mt-4">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Transporte da empresa?</label>
                        <div className="flex gap-4">
                            {['sim', 'nao'].map(opt => (
                                <label key={opt} className={`flex-1 cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${formData.utiliza === opt ? 'bg-navy-900 text-white border-navy-900' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                                    <input type="radio" name="utiliza" value={opt} checked={formData.utiliza === opt} onChange={handleChange} className="hidden" />
                                    <span className="capitalize font-medium">{opt === 'nao' ? 'Não' : 'Sim'}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Condicional Motorista */}
        {type === 'motorista' && (
             <div className="p-8 border-t border-slate-100 bg-amber-50/30">
                <h3 className="flex items-center gap-2 text-sm font-bold text-amber-900 uppercase tracking-wider mb-6">
                    <Car className="w-4 h-4 text-amber-600" /> Habilitação Profissional
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Número da CNH" name="cnh" onChange={handleChange} />
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Categoria</label>
                        <select name="categoria" onChange={handleChange} className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all">
                            <option value="">Selecione...</option>
                            {['A','B','AB','C','D','E','AD','AE'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>
             </div>
        )}

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button 
                type="submit" 
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-navy-900 to-navy-800 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-navy-900/20 active:scale-[0.99] transition-all flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed min-w-[250px] justify-center"
            >
                {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <Save className="w-6 h-6" />}
                {loading ? 'Processando...' : 'Gerar Documentação'}
            </button>
        </div>
      </form>
    </div>
  );
}

const Input = ({ label, col = "", bg = "bg-white", ...props }) => (
    <div className={`flex flex-col gap-2 ${col}`}>
        <label className="text-xs font-bold text-slate-500 uppercase ml-1">{label}</label>
        <input 
            className={`w-full p-3 border border-slate-200 rounded-xl ${bg} text-navy-900 font-medium placeholder:text-slate-300 focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 outline-none transition-all duration-200`} 
            {...props} 
        />
    </div>
);