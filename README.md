# 📄 Autodoc RH - Enterprise Edition

**Autodoc RH** é uma plataforma corporativa de automação de documentos para Recursos Humanos. O sistema utiliza uma arquitetura moderna de microsserviços para gerar contratos, termos e fichas de admissão instantaneamente, com um painel de controle executivo para monitoramento de produtividade.

![Status](https://img.shields.io/badge/Status-Active-emerald)
![Docker](https://img.shields.io/badge/Docker-Native-blue)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Tailwind-cyan)
![Python](https://img.shields.io/badge/Backend-Flask%20API-yellow)

---

## ✨ Funcionalidades Premium (v2.0)

- **🖥️ Interface Enterprise:** Design responsivo e sofisticado (Tema Navy & Gold), desenvolvido com **React** e **Tailwind CSS**.
- **📊 Dashboard Executivo:**
  - **Métricas de Produtividade:** Cálculo automático de tempo economizado pela equipe.
  - **Visualização de Dados:** Gráficos interativos e listas visuais de volume por empresa.
  - **Histórico:** Acompanhamento em tempo real dos últimos documentos gerados.
- **⚡ Geração Instantânea:** Processamento de múltiplos modelos `.docx` simultâneos, entregues em formato `.zip`.
- **🏢 Múltiplos Fluxos:** Suporte nativo para:
  - Funcionário Regular (CLT)
  - Motoristas (Com validação de CNH)
  - Menor Aprendiz
- **🤖 Automação Inteligente:** Preenchimento automático de CNPJ, conversão de valores monetários para extenso e formatação de datas.

---

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **React.js (Vite):** Performance e modularidade.
- **Tailwind CSS:** Estilização moderna e responsiva.
- **Recharts:** Gráficos de dados profissionais.
- **Lucide React:** Ícones vetoriais leves.

### **Backend**
- **Python 3.9 + Flask:** API RESTful robusta.
- **Docxtpl (Jinja2):** Motor de renderização de templates Word.
- **Num2Words:** Escrita automática de salários por extenso.
- **SQLite:** Persistência leve e rápida.

### **Infraestrutura**
- **Docker & Docker Compose:** Ambiente isolado e reprodutível (Build Multi-stage).

---

## ⚙️ Instalação e Execução

O projeto é "Docker Native". Você não precisa instalar Node.js ou Python na sua máquina, apenas o Docker.

### Pré-requisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado.

### Passo a Passo

1. **Clone o repositório e entre na pasta:**
   ```bash
   git clone <seu-repositorio>
   cd autodoc_rh
Organize seus Templates:Coloque seus arquivos .docx nas pastas correspondentes dentro de docx_templates/:docx_templates/regular/ (Ex: Contratos padrão)docx_templates/motorista/ (Ex: Termos de responsabilidade de veículo)docx_templates/menor_aprendiz/ (Ex: Contratos de aprendizagem)Inicie o Sistema:No terminal (dentro da pasta do projeto), execute:Bashdocker-compose up --build
(Aguarde alguns minutos na primeira execução para o build do React).Acesse:Abra seu navegador em: http://localhost:5000📝 Guia de Variáveis para Templates (.docx)Para que o sistema preencha seus documentos automaticamente, utilize as tags abaixo no seu arquivo Word:👤 Dados PessoaisPlaceholderDescrição{{ name_id }}Nome Completo do Funcionário{{ cpf_id }}CPF Formatado{{ rg_id }}RG{{ orgao_id }}Órgão Emissor{{ estadocivil_id }}Estado Civil{{ nacionalidade_id }}Nacionalidade{{ endereco_id }}Endereço Completo💼 Dados Contratuais & EmpresaPlaceholderDescrição{{ cargo_id }}Cargo{{ setor_id }}Setor{{ salario_id }}Salário Numérico (Ex: R$ 2.500,00){{ salarioextenso_id }}Salário por Extenso (Gerado Automático){{ empresa_id }}Razão Social da Empresa Selecionada{{ cnpj_id }}CNPJ da Empresa (Automático){{ horario_id }}Horário de Trabalho{{ date_id }}Data de Admissão por Extenso{{ datetoday_id }}Data de Hoje por Extenso🚗 Específicos & CondicionaisPlaceholderDescrição{{ cnh_id }}Número da CNH (Apenas Motorista){{ categoria_id }}Categoria da CNH (Apenas Motorista){{ utiliza_id }}Marca um "X" se optou por Vale Transporte{{ nutiliza_id }}Marca um "X" se NÃO optou por Vale Transporte📂 Estrutura do ProjetoPlaintextautodoc_rh/
├── Dockerfile           # Configuração de Build
├── docker-compose.yml   # Orquestração de Containers
├── app/                 # Backend (Python)
│   ├── app.py           # Lógica da API
│   ├── config.py        # Configurações do Sistema
│   └── schema.sql       # Banco de Dados
├── frontend/            # Frontend (React)
│   ├── src/             # Código Fonte da Interface
│   └── public/          # Assets (Logo, Favicon)
├── docx_templates/      # Pasta de Templates (Word)
└── generated_docs/      # Saída dos Arquivos Gerados
🔒 LicençaPropriedade exclusiva para uso interno corporativo.