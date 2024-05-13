# Open Banking Trafegos - Automação

### Descrição

Esta aplicação é responsável pela automação de testes funcionais dos Trafegos do Fluxo Open Banking, onde simulamos as validações de respostas das API’s Open Banking “com estrutura de mensagens padronizadas” e preparamos as requisições para lidar com as situações do dia a dia do cliente. Quanto as gerações dos CNAB’s procuramos garantir a estrutura gerada e entregues as instituições bancarias. 

### Fluxograma

<p align="center">
   <img src="/documentation/images/fluxograma-tecnico.jpg" width="100%" alt="Fluxograma" />
</p>

### Testes Automatizados para:

Obs: As etapas marcada com check, logo abaixo, são entregas já realizadas pela automação.

Produto: Cobrança
- [X] 001 - Banco do Brasil - Layout 240 - Tipo API: API X CNAB (Test's Services API's)
- [X] 001 - Banco do Brasil - Layout 240 - Tipo API: API X CNAB / CNAB X API (Fluxo completo Remessa/Retorno)
- [X] 033 - Banco Santander - Layout 240 - Tipo API: API X CNAB (Test's Services API's)
- [X] 033 - Banco Santander - Layout 240 - Tipo API: API X CNAB / CNAB X API (Fluxo completo Remessa/Retorno)

### Execução de testes utilizando cy:run

<p align="left">
  <img src="/documentation/images/run-automacao.jpg" width="100%" alt="Automação - Example Start Services" />
  <img src="/documentation/images/run-automacao2.jpg" width="100%" alt="Automação - Example Results Test Fluxo" />
</p>

### 🛠 Tecnologias

As seguintes ferramentas foram usadas na construção do projeto:

- [Cypress](https://www.cypress.io/)

### 🛠 Dependências para Deploy Local

- Nodejs v18.16.\*
- Npm v9.6.\*
- Para ver todas as dependencias necessárias: <a href="https://on.cypress.io/required-dependencies" target="_blank">Documentação de Dependências</a>

### 🎲 Rodando aplicação

```bash
# Clone este repositório
$ git clone https://gitlab.com/empresa/cypress-api-validate.git

# Acesse a pasta do projeto no terminal/cmd
$ cd cypress-api-validate.git

# Instale as dependências
$ npm install

# Execute a aplicação em modo de desenvolvimento
$ npm run cy:run or cy:open

### 🎲 Gerando relatórios

Os relatórios só poderão ser gerados com o cy:run

```bash
# Rode a aplicação com o seguinte comando
$ npm run cy:run

# Este comando irá juntar todos os JSONs dos resultados dos testes em um único arquivo
$ npm run cy:merge

# Este comando irá gerar um HTML dentro da pasta cypress/output.html contendo o relatório
$ npm run cy:generate

```

### 🎲 Limpando relatórios

```bash
# Rode este comando para limpar as pastas de armazenamento dos relatórios
$ npm run cleanup-evidencias

```
