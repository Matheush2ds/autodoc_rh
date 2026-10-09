# Templates de Documentos (.docx)

Esta pasta armazena os modelos Word (`.docx`) utilizados para geração automática dos kits admissionais.

## Estrutura de Pastas

- `regular/`: Modelos para funcionários CLT padrão (contratos, acordos salariais, termos de imagem, uniforme, etc.).
- `motorista/`: Modelos específicos para motoristas (termos de responsabilidade de veículo/transporte, crachá, etc.).
- `menor_aprendiz/`: Modelos específicos para o programa Jovem/Menor Aprendiz.

## Como funciona

Ao preencher o formulário no sistema, todos os arquivos `.docx` presentes na pasta correspondente ao tipo de admissão selecionado serão lidos pelo motor Jinja2 (`docxtpl`). As tags delimitadas por `{{ ... }}` serão substituídas pelas informações informadas no formulário e os documentos serão compactados em um arquivo `.zip` pronto para download.

Consulte o `README.md` na raiz do projeto ou o modal de **Tags .docx** no sistema para conferir a lista completa de variáveis disponíveis.
