# 📄 Gerador de Documentos RH/DP - Autodoc_Rh

Bem-vindo(a) ao **Autodoc_Rh**, uma ferramenta de automação para a geração de documentos de Recursos Humanos e Departamento Pessoal. Desenvolvido com Flask, este sistema simplifica o processo de criação de documentos como contratos, declarações e termos, utilizando modelos `docx`.

## ✨ Funcionalidades

- **Geração Automatizada:** Preencha um formulário web e o sistema gera múltiplos documentos com os dados do colaborador.
- **Dashboard Interativo:** Acompanhe o número de documentos gerados hoje e no mês atual.
- **Modelos Customizáveis:** Adicione seus próprios modelos `.docx` com placeholders e a ferramenta se encarrega de preencher as informações.
- **Download em Lote:** Todos os documentos gerados são compactados em um único arquivo `.zip` para facilitar o download.
- **Integração com Rede (Opcional):** Opção para salvar automaticamente os documentos em um diretório de rede.

## 🛠️ Tecnologias Utilizadas

- **Backend:** Python, Flask
- **Automação de Documentos:** `python-docx`
- **Frontend:** HTML, CSS

## ⚙️ Instalação e Uso

Siga estes passos para configurar e executar o projeto em seu ambiente local.

### Pré-requisitos
- Python 3.8 ou superior

## ✍️ Personalização e Placeholders

Para que o sistema funcione corretamente, seus modelos `.docx` devem conter os seguintes placeholders exatos:

- `<name_id>`: Nome Completo
- `<cargo_id>`: Cargo
- `<cpf_id>`: CPF
- `<rg_id>`: RG
- `<orgao_id>`: Órgão Emissor
- `<mes_id>`: Mês de Contratação
- `<empresa_id>`: Empresa
- `<setor_id>`: Setor
- `<salario_id>`: Salário
- `<estadocivil_id>`: Estado Civil
- `<nacionalidade_id>`: Nacionalidade
- `<endereco_id>`: Endereço
- `<cnpj_id>`: CNPJ
- `<horario_id>`: Horário de Trabalho
- `<date_id>`: Data Atual

## 📈 Dashboard

O dashboard na página inicial (`/`) exibe a contagem de documentos gerados. Essa funcionalidade é baseada no arquivo `docs_log.txt`, que registra a data e hora de cada geração bem-sucedida. Não é necessário editar este arquivo manualmente.

## 🤝 Contribuição

Contribuições são bem-vindas! Se você tiver sugestões ou melhorias, sinta-se à vontade para abrir uma _issue_ ou enviar um _pull request_.

1.  Faça um Fork do projeto.
2.  Crie uma nova branch: `git checkout -b feature/sua-feature`
3.  Faça o commit das suas mudanças: `git commit -m 'feat: Adiciona nova funcionalidade'`
4.  Envie para a branch principal: `git push origin feature/sua-feature`
5.  Abra um Pull Request.
