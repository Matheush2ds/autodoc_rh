# Autodoc RH

O Autodoc RH é um sistema interno focado em automatizar a criação de documentos para o setor de Recursos Humanos. Ele foi desenvolvido com uma arquitetura de microsserviços para agilizar a geração de contratos, termos e fichas de admissão, e inclui um painel de controle para a equipe monitorar o uso da ferramenta.

Status: Ativo | Frontend: React + Tailwind | Backend: Flask API | Infra: Docker Native

---

## Principais Funcionalidades (v2.0)

- **Interface Atualizada:** Visual mais limpo e responsivo (tema Navy & Gold), construído com React e Tailwind CSS.
- **Dashboard Administrativo:**
  - **Métricas:** Calcula automaticamente o tempo que a equipe economizou.
  - **Gráficos:** Mostra o volume de documentos gerados por empresa.
  - **Histórico:** Log em tempo real dos últimos arquivos gerados.
- **Geração em Lote:** O sistema consegue processar vários templates `.docx` ao mesmo tempo e faz o download de tudo compactado em um arquivo `.zip`.
- **Fluxos de Contratação:** A plataforma atende a diferentes cenários:
  - CLT (padrão)
  - Motoristas (exige e valida dados de CNH)
  - Jovem Aprendiz
- **Automações:** Preenchimento automático do CNPJ das empresas cadastradas, conversão de valores numéricos de salário para texto por extenso e formatação automática de datas.

---

## Stacks

**Frontend**
- React.js (via Vite)
- Tailwind CSS
- Recharts (para os gráficos)
- Lucide React (ícones)

**Backend**
- Python 3.9 com Flask
- Docxtpl (usa Jinja2 para ler e injetar dados no Word)
- Num2Words (escreve os salários por extenso)
- SQLite (banco de dados leve)

**Infra**
- Docker e Docker Compose (Multi-stage build)

---

## Como rodar o projeto

O sistema foi montado para rodar direto no Docker. Você não precisa ter Node.js ou Python instalados localmente, apenas o Docker Desktop.

1. **Clone o repositório e acesse a pasta:**
```bash
git clone <seu-repositorio>
cd autodoc_rh
```

2. **Organize os templates base:**
Os arquivos do Word (`.docx`) que servirão de molde devem ser colocados nas pastas corretas dentro de `docx_templates/`:
- `docx_templates/regular/` (Ex: Contratos padrão)
- `docx_templates/motorista/` (Ex: Termos de responsabilidade de veículo)
- `docx_templates/menor_aprendiz/` (Ex: Contratos de aprendizagem)

3. **Suba a aplicação:**
No terminal, na raiz do projeto, rode:
```bash
docker-compose up --build
```
*(O primeiro build pode demorar um pouco porque ele vai baixar as dependências do React e do Python).*

4. **Acesse:**
Abra o navegador em: `http://localhost:5000`

---

## Guia de Variáveis para os arquivos .docx

Para que o sistema consiga injetar as informações nos documentos, você deve colocar as tags abaixo nos seus arquivos do Word:

**Dados Pessoais**
- `{{ name_id }}` - Nome Completo
- `{{ cpf_id }}` - CPF Formatado
- `{{ rg_id }}` - RG
- `{{ orgao_id }}` - Órgão Emissor
- `{{ estadocivil_id }}` - Estado Civil
- `{{ nacionalidade_id }}` - Nacionalidade
- `{{ endereco_id }}` - Endereço Completo

**Dados Contratuais e Empresa**
- `{{ cargo_id }}` - Cargo
- `{{ setor_id }}` - Setor
- `{{ salario_id }}` - Salário em números (Ex: R$ 2.500,00)
- `{{ salarioextenso_id }}` - Salário por extenso (Preenchido pelo sistema)
- `{{ empresa_id }}` - Razão Social da empresa
- `{{ cnpj_id }}` - CNPJ da empresa
- `{{ horario_id }}` - Horário de Trabalho
- `{{ date_id }}` - Data de Admissão por extenso
- `{{ datetoday_id }}` - Data atual por extenso

**Campos Específicos**
- `{{ cnh_id }}` - Número da CNH (Motoristas)
- `{{ categoria_id }}` - Categoria da CNH (Motoristas)
- `{{ utiliza_id }}` - Marca um "X" se quiser Vale Transporte
- `{{ nutiliza_id }}` - Marca um "X" se NÃO quiser Vale Transporte

---

## Estrutura de Pastas

```text
autodoc_rh/
├── Dockerfile             # Configuração da imagem
├── docker-compose.yml     # Orquestração
├── app/                   # Backend API
│   ├── app.py             
│   ├── config.py          
│   └── schema.sql         
├── frontend/              # Interface do usuário
│   ├── src/               
│   └── public/            
├── docx_templates/        # Onde você coloca os Word em branco
└── generated_docs/        # Onde os arquivos finalizados caem
```

---

## Licença
Projeto de propriedade exclusiva para uso corporativo interno.
