import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { COMPANIES as FALLBACK_COMPANIES } from '../constants';
import { Save, Loader2, CheckCircle2, User, Building2, Wallet, Car, Sparkles, FileCheck, ArrowRight, MapPin, Search, AlertCircle } from 'lucide-react';

export default function DocumentForm({ type }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [companies, setCompanies] = useState(FALLBACK_COMPANIES);
  const [formData, setFormData] = useState({
    employee_type: type, empresa: '', cnpj: '', utiliza: 'sim', endereco: ''
  });

  const [addressData, setAddressData] = useState({
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: ''
  });
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepMessage, setCepMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    axios.get('/api/companies')
      .then(res => {
        if (res.data && res.data.length > 0) {
          setCompanies(res.data);
        }
      })
      .catch(err => console.error('Usando lista fallback de empresas:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'empresa') {
      const company = companies.find(c => c.name === value);
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

  const buildAddressString = (addr) => {
    const parts = [];
    if (addr.logradouro) {
      let street = addr.logradouro;
      if (addr.numero) street += `, nº ${addr.numero}`;
      if (addr.complemento) street += ` - ${addr.complemento}`;
      parts.push(street);
    } else if (addr.numero) {
      parts.push(`nº ${addr.numero}`);
    }
    if (addr.bairro) parts.push(addr.bairro);
    if (addr.cidade || addr.uf) {
      const cityUf = [addr.cidade, addr.uf].filter(Boolean).join(' - ');
      parts.push(cityUf);
    }
    if (addr.cep) parts.push(`CEP: ${addr.cep}`);
    return parts.join(', ');
  };

  const handleAddressFieldChange = (field, value) => {
    const updated = { ...addressData, [field]: value };
    setAddressData(updated);
    const complete = buildAddressString(updated);
    setFormData(prev => ({ ...prev, endereco: complete }));
  };

  const fetchViaCep = async (rawCep, currentAddr) => {
    setLoadingCep(true);
    setCepMessage({ text: 'Buscando CEP no ViaCEP...', type: 'info' });
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${rawCep}/json/`);
      const data = response.data;
      if (data.erro) {
        setCepMessage({ text: 'CEP não encontrado. Preencha o endereço manualmente.', type: 'warning' });
      } else {
        const next = {
          ...currentAddr,
          logradouro: data.logradouro || currentAddr.logradouro,
          bairro: data.bairro || currentAddr.bairro,
          cidade: data.localidade || currentAddr.cidade,
          uf: data.uf || currentAddr.uf,
          complemento: currentAddr.complemento || data.complemento || ''
        };
        setAddressData(next);
        const complete = buildAddressString(next);
        setFormData(prev => ({ ...prev, endereco: complete }));
        setCepMessage({ text: `${data.localidade || ''} - ${data.uf || ''} localizado com sucesso!`, type: 'success' });
      }
    } catch (err) {
      console.error('Erro ao consultar ViaCEP:', err);
      setCepMessage({ text: 'Não foi possível consultar o ViaCEP automaticamente. Preencha manualmente.', type: 'warning' });
    } finally {
      setLoadingCep(false);
    }
  };

  const handleCepChange = (e) => {
    let digits = e.target.value.replace(/\D/g, '').slice(0, 8);
    let masked = digits;
    if (digits.length > 5) {
      masked = `${digits.slice(0, 5)}-${digits.slice(5)}`;
    }
    const updated = { ...addressData, cep: masked };
    setAddressData(updated);
    const complete = buildAddressString(updated);
    setFormData(prev => ({ ...prev, endereco: complete }));
    setCepMessage({ text: '', type: '' });

    if (digits.length === 8) {
      fetchViaCep(digits, updated);
    }
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
        setTimeout(() => setSuccess(false), 6000);
    } catch (error) {
        alert("Erro no processamento. Verifique se os dados obrigatórios estão preenchidos.");
    } finally {
        setLoading(false);
    }
  };

  const config = {
    regular: { 
      title: "Contrato Regular", 
      desc: "Admissão padrão CLT com kit completo de formulários", 
      color: "text-blue-600 dark:text-blue-400", 
      bg: "bg-blue-50 dark:bg-blue-950/60",
      border: "border-blue-200 dark:border-blue-800/60"
    },
    motorista: { 
      title: "Contrato Motorista", 
      desc: "Admissão técnica com validação de CNH e Termo de Veículo", 
      color: "text-amber-600 dark:text-amber-400", 
      bg: "bg-amber-50 dark:bg-amber-950/60",
      border: "border-amber-200 dark:border-amber-800/60"
    },
    aprendiz: { 
      title: "Menor Aprendiz", 
      desc: "Contrato especial de aprendizagem e termo educacional", 
      color: "text-purple-600 dark:text-purple-400", 
      bg: "bg-purple-50 dark:bg-purple-950/60",
      border: "border-purple-200 dark:border-purple-800/60"
    }
  };

  const theme = config[type] || config.regular;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      {/* Banner de Topo do Formulário (Card Premium) */}
      <div className="bg-gradient-to-r from-white via-white to-slate-50 dark:from-navy-900 dark:via-navy-900 dark:to-navy-950 p-6 md:p-8 rounded-3xl shadow-[0_4px_25px_-4px_rgba(15,23,42,0.06)] border border-slate-200/80 dark:border-navy-800/80 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl ${theme.bg} ${theme.border} border flex items-center justify-center shadow-sm shrink-0`}>
            <Building2 className={`w-7 h-7 ${theme.color}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${theme.bg} ${theme.color}`}>
                Novo Documento
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-navy-900 dark:text-white tracking-tight">{theme.title}</h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">{theme.desc}</p>
          </div>
        </div>

        {success && (
          <div className="animate-fade-in bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 px-5 py-3 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 shadow-sm">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-xs">Download Concluído!</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400">O arquivo ZIP foi gerado com sucesso.</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Formulário Principal em Card Elegante */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-navy-900 rounded-3xl shadow-[0_4px_30px_-4px_rgba(15,23,42,0.08)] border border-slate-200/80 dark:border-navy-800/80 overflow-hidden">
        
        {/* Seção 1: Dados Pessoais */}
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-navy-800">
          <div className="flex items-center gap-2.5 mb-6 pb-2 border-b border-slate-100/70 dark:border-navy-800/70">
            <div className="p-2 bg-navy-50 dark:bg-navy-800 text-navy-900 dark:text-gold-400 rounded-xl">
              <User className="w-4 h-4 text-gold-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-navy-900 dark:text-white uppercase tracking-wider">
                Dados do Colaborador
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-400">Informações pessoais e de identificação civil</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <Input col="md:col-span-6" label="Nome Completo" name="name" onChange={handleChange} required placeholder="Ex: Maria da Silva Santos" />
            <Input col="md:col-span-3" label="CPF" name="cpf" onChange={handleChange} placeholder="000.000.000-00" />
            <Input col="md:col-span-3" label="RG" name="rg" onChange={handleChange} placeholder="0.000.000" />
            
            <Input col="md:col-span-4" label="Nacionalidade" name="nacionalidade" onChange={handleChange} defaultValue="Brasileiro(a)" />
            <Input col="md:col-span-4" label="Estado Civil" name="estadocivil" onChange={handleChange} placeholder="Solteiro(a), Casado(a)..." />
            <Input col="md:col-span-4" label="Órgão Emissor" name="orgao" onChange={handleChange} placeholder="Ex: SSP/GO" />
            
            {/* Bloco de Endereço via CEP */}
            <div className="md:col-span-12 pt-4 border-t border-slate-100 dark:border-navy-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gold-500" />
                  <span className="text-xs font-bold text-navy-900 dark:text-white uppercase tracking-wider">
                    Endereço Residencial (Consulta Automática por CEP)
                  </span>
                </div>
                {loadingCep && (
                  <span className="text-xs text-gold-600 dark:text-gold-400 flex items-center gap-1.5 font-medium">
                    <Loader2 size={13} className="animate-spin" /> Consultando ViaCEP...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Campo CEP com busca */}
                <div className="md:col-span-3">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-0.5 tracking-wide block mb-1.5">
                    CEP
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      name="cep"
                      value={addressData.cep}
                      onChange={handleCepChange}
                      placeholder="00000-000"
                      maxLength={9}
                      className="w-full p-3.5 pl-10 border border-slate-200 dark:border-navy-800 rounded-xl bg-white dark:bg-navy-900 text-navy-900 dark:text-white font-semibold placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 outline-none transition-all duration-200 text-sm"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      {loadingCep ? <Loader2 size={16} className="animate-spin text-gold-500" /> : <Search size={16} />}
                    </div>
                  </div>
                </div>

                {/* Logradouro */}
                <div className="md:col-span-6">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-0.5 tracking-wide block mb-1.5">
                    Logradouro / Rua
                  </label>
                  <input 
                    type="text"
                    name="logradouro"
                    value={addressData.logradouro}
                    onChange={(e) => handleAddressFieldChange('logradouro', e.target.value)}
                    placeholder="Ex: Av. Brasil, Rua das Flores"
                    className="w-full p-3.5 border border-slate-200 dark:border-navy-800 rounded-xl bg-white dark:bg-navy-900 text-navy-900 dark:text-white font-semibold placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 outline-none transition-all duration-200 text-sm"
                  />
                </div>

                {/* Número */}
                <div className="md:col-span-3">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-0.5 tracking-wide block mb-1.5">
                    Número
                  </label>
                  <input 
                    type="text"
                    name="numero"
                    value={addressData.numero}
                    onChange={(e) => handleAddressFieldChange('numero', e.target.value)}
                    placeholder="Ex: 123 ou S/N"
                    className="w-full p-3.5 border border-slate-200 dark:border-navy-800 rounded-xl bg-white dark:bg-navy-900 text-navy-900 dark:text-white font-semibold placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 outline-none transition-all duration-200 text-sm"
                  />
                </div>

                {/* Complemento */}
                <div className="md:col-span-4">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-0.5 tracking-wide block mb-1.5">
                    Complemento
                  </label>
                  <input 
                    type="text"
                    name="complemento"
                    value={addressData.complemento}
                    onChange={(e) => handleAddressFieldChange('complemento', e.target.value)}
                    placeholder="Ex: Apto 102, Bloco B, Qd. 10"
                    className="w-full p-3.5 border border-slate-200 dark:border-navy-800 rounded-xl bg-white dark:bg-navy-900 text-navy-900 dark:text-white font-semibold placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 outline-none transition-all duration-200 text-sm"
                  />
                </div>

                {/* Bairro */}
                <div className="md:col-span-4">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-0.5 tracking-wide block mb-1.5">
                    Bairro
                  </label>
                  <input 
                    type="text"
                    name="bairro"
                    value={addressData.bairro}
                    onChange={(e) => handleAddressFieldChange('bairro', e.target.value)}
                    placeholder="Ex: Setor Sul, Centro"
                    className="w-full p-3.5 border border-slate-200 dark:border-navy-800 rounded-xl bg-white dark:bg-navy-900 text-navy-900 dark:text-white font-semibold placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 outline-none transition-all duration-200 text-sm"
                  />
                </div>

                {/* Cidade */}
                <div className="md:col-span-3">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-0.5 tracking-wide block mb-1.5">
                    Cidade
                  </label>
                  <input 
                    type="text"
                    name="cidade"
                    value={addressData.cidade}
                    onChange={(e) => handleAddressFieldChange('cidade', e.target.value)}
                    placeholder="Ex: Caldas Novas"
                    className="w-full p-3.5 border border-slate-200 dark:border-navy-800 rounded-xl bg-white dark:bg-navy-900 text-navy-900 dark:text-white font-semibold placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 outline-none transition-all duration-200 text-sm"
                  />
                </div>

                {/* UF */}
                <div className="md:col-span-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-0.5 tracking-wide block mb-1.5">
                    UF
                  </label>
                  <input 
                    type="text"
                    name="uf"
                    value={addressData.uf}
                    onChange={(e) => handleAddressFieldChange('uf', e.target.value.toUpperCase().slice(0, 2))}
                    placeholder="GO"
                    maxLength={2}
                    className="w-full p-3.5 text-center uppercase border border-slate-200 dark:border-navy-800 rounded-xl bg-white dark:bg-navy-900 text-navy-900 dark:text-white font-semibold placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 outline-none transition-all duration-200 text-sm"
                  />
                </div>

                {/* Feedback da busca */}
                {cepMessage.text && (
                  <div className={`md:col-span-12 text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 font-medium ${
                    cepMessage.type === 'success' 
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60' 
                      : cepMessage.type === 'warning'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                      : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60'
                  }`}>
                    {cepMessage.type === 'warning' && <AlertCircle size={15} className="shrink-0" />}
                    {cepMessage.type === 'success' && <CheckCircle2 size={15} className="shrink-0" />}
                    <span>{cepMessage.text}</span>
                  </div>
                )}

                {/* Endereço Completo formatado para os Contratos */}
                <div className="md:col-span-12">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-0.5 tracking-wide block mb-1.5">
                    Endereço Completo (Tag docx: <code className="text-gold-600 dark:text-gold-400 font-mono font-bold">{"{{ endereco_id }}"}</code>)
                  </label>
                  <input 
                    type="text"
                    name="endereco"
                    value={formData.endereco || ''}
                    onChange={handleChange}
                    placeholder="Rua, Número, Bairro, Cidade - UF, CEP"
                    className="w-full p-3.5 border border-slate-200 dark:border-navy-800 rounded-xl bg-slate-50/80 dark:bg-navy-950/60 text-navy-900 dark:text-white font-medium text-xs focus:border-gold-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção 2: Dados Contratuais */}
        <div className="p-6 md:p-8 bg-gradient-to-b from-slate-50/50 to-slate-50/20 dark:from-navy-950/40 dark:to-navy-950/20">
          <div className="flex items-center gap-2.5 mb-6 pb-2 border-b border-slate-200/60 dark:border-navy-800/60">
            <div className="p-2 bg-navy-50 dark:bg-navy-800 text-navy-900 dark:text-gold-400 rounded-xl">
              <Wallet className="w-4 h-4 text-gold-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-navy-900 dark:text-white uppercase tracking-wider">
                Dados Contratuais & Vínculo
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-400">Definição salarial, empresa contratante e benefícios</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-6 space-y-5">
              <Input label="Cargo Pretendido" name="cargo" onChange={handleChange} placeholder="Ex: Assistente Administrativo" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Salário Base" name="salario" value={formData.salario || ''} onChange={handlePriceMask} placeholder="R$ 0,00" />
                <Input label="Data de Admissão" name="data_contratacao" type="date" onChange={handleChange} required />
              </div>
              <Input label="Horário de Trabalho" name="horario" onChange={handleChange} placeholder="Ex: 08:00 às 18:00 (1h de intervalo)" />
            </div>

            {/* Card Interno de Empresa Contratante */}
            <div className="md:col-span-6 bg-white dark:bg-navy-950 p-6 rounded-2xl border border-slate-200/90 dark:border-navy-800 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Empresa Contratante</label>
                <select 
                  name="empresa" 
                  onChange={handleChange} 
                  className="w-full p-3.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl focus:ring-4 focus:ring-gold-500/15 focus:border-gold-500 outline-none transition-all text-sm font-semibold text-navy-900 dark:text-white" 
                  required
                >
                  <option value="">Selecione a empresa...</option>
                  {companies.map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <Input label="CNPJ Vinculado (Automático)" name="cnpj" value={formData.cnpj} readOnly bg="bg-slate-100/80 dark:bg-navy-900/80 text-slate-500 dark:text-slate-400 cursor-not-allowed font-mono" />
              
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Setor de Atuação</label>
                <input 
                  name="setor" 
                  onChange={handleChange} 
                  placeholder="Ex: Operações / Recepção"
                  className="w-full p-3 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-navy-900 dark:text-white rounded-xl focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 outline-none text-sm font-medium" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Utilizará sistema da empresa?</label>
                <div className="grid grid-cols-2 gap-3">
                  {['sim', 'nao'].map(opt => (
                    <label 
                      key={opt} 
                      className={`cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all font-semibold text-xs ${formData.utiliza === opt ? 'bg-navy-900 dark:bg-gold-500 text-white dark:text-navy-950 border-navy-900 dark:border-gold-500 shadow-md ring-2 ring-gold-400/40' : 'bg-slate-50 dark:bg-navy-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 border-slate-200 dark:border-navy-800'}`}
                    >
                      <input type="radio" name="utiliza" value={opt} checked={formData.utiliza === opt} onChange={handleChange} className="hidden" />
                      <span>{opt === 'nao' ? 'Não' : 'Sim'}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Condicional Motorista (Card de Habilitação) */}
        {type === 'motorista' && (
          <div className="p-6 md:p-8 border-t border-slate-100 dark:border-navy-800 bg-amber-50/40 dark:bg-amber-950/20">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 rounded-xl">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                  Habilitação & CNH Obrigatória
                </h3>
                <p className="text-xs text-amber-700/80 dark:text-amber-400/80">Dados requeridos para validação de motorista profissional</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Número de Registro da CNH" name="cnh" onChange={handleChange} placeholder="00000000000" />
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Categoria da CNH</label>
                <select 
                  name="categoria" 
                  onChange={handleChange} 
                  className="w-full p-3.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm font-semibold text-navy-900 dark:text-white"
                >
                  <option value="">Selecione a categoria...</option>
                  {['A','B','AB','C','D','E','AD','AE'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Footer do Card com Botão de Ação */}
        <div className="p-6 md:p-8 bg-slate-50 dark:bg-navy-950 border-t border-slate-100 dark:border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-400 font-medium text-center sm:text-left">
            <FileCheck size={16} className="text-emerald-500 shrink-0" />
            <span>Os arquivos preenchidos serão compactados em um arquivo <strong>.ZIP</strong> para download.</span>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 dark:from-navy-800 dark:via-navy-700 dark:to-navy-800 hover:from-gold-500 hover:to-gold-600 dark:hover:from-gold-500 dark:hover:to-gold-600 text-white rounded-2xl font-bold text-base shadow-lg hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed justify-center"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5 text-gold-400" />}
            <span>{loading ? 'Processando Documentos...' : 'Gerar Kit de Documentos'}</span>
            {!loading && <ArrowRight size={18} className="text-white/70" />}
          </button>
        </div>

      </form>
    </div>
  );
}

const Input = ({ label, col = "", bg = "bg-white dark:bg-navy-900", ...props }) => (
  <div className={`flex flex-col gap-1.5 ${col}`}>
    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-0.5 tracking-wide">{label}</label>
    <input 
      className={`w-full p-3.5 border border-slate-200 dark:border-navy-800 rounded-xl ${bg} text-navy-900 dark:text-white font-semibold placeholder:text-slate-300 dark:placeholder:text-slate-600 placeholder:font-normal focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 outline-none transition-all duration-200 text-sm`} 
      {...props} 
    />
  </div>
);