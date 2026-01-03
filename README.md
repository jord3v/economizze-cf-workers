# Economizze

O **Economizze** é uma aplicação de gestão financeira pessoal e desafios de poupança, construída para ser leve e rápida, executada inteiramente na **Edge** utilizando **Cloudflare Workers** e **Hono**.

A aplicação permite aos utilizadores gerir as suas finanças, acompanhar gastos e receitas, e participar em desafios de poupança interativos (como o desafio das 52 semanas ou depósitos aleatórios), tudo através de uma interface moderna e responsiva renderizada no servidor (SSR).

## 🚀 Funcionalidades

* **Autenticação Segura**: Registo e Login de utilizadores com proteção por JWT e passwords encriptadas (SHA-256).
* **Dashboard Financeiro**: Visão geral de entradas, gastos do mês, e total economizado com gráficos interativos (ApexCharts).
* **Desafios de Poupança**:
    * 📅 **52 Semanas**: Poupança progressiva semanal.
    * 🎲 **Depósitos Aleatórios**: Bingo de valores para guardar.
    * 🍔 **Economia VR**: Controlo de sobras de Vale Refeição.
    * Exportação de calendário de pagamentos (.ics).
    * Geração de códigos PIX (Copia e Cola) para facilitar os depósitos na tua própria conta.
* **Gestão de Despesas**:
    * Registo de compras (Crédito, Débito, PIX, Dinheiro).
    * Suporte a compras parceladas (criação automática das parcelas futuras).
    * Categorização de despesas.
* **Gestão de Entradas**: Registo de fontes de rendimento (Salário, Freelance, etc.).
* **Relatórios**: Filtros por data e gráficos de distribuição de gastos por categoria.
* **Perfil**: Gestão de dados pessoais e Chave PIX padrão.

## 🛠️ Tecnologias Utilizadas

* **[Cloudflare Workers](https://workers.cloudflare.com/)**: Plataforma Serverless na Edge.
* **[Hono](https://hono.dev/)**: Framework web ultrarrápido para a Edge.
* **[Cloudflare D1](https://developers.cloudflare.com/d1/)**: Base de dados SQL serverless (SQLite).
* **Frontend**:
    * HTML renderizado no servidor (SSR com `hono/html`).
    * **[Tabler](https://tabler.io/)**: Framework UI baseado em Bootstrap.
    * **ApexCharts**: Visualização de dados.
    * **FullCalendar**: Visualização de agenda de pagamentos.

## 📋 Pré-requisitos

* [Node.js](https://nodejs.org/) (versão 18 ou superior)
* [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) instalado globalmente ou no projeto.
* Uma conta na Cloudflare.

## ⚙️ Instalação e Configuração

1.  **Clonar o repositório**

    ```bash
    git clone https://github.com/teu-usuario/economizze-cf-workers.git
    cd economizze-cf-workers
    ```

2.  **Instalar dependências**

    ```bash
    npm install
    ```

3.  **Configurar a Base de Dados (D1)**

    Cria uma base de dados D1 na tua conta Cloudflare:
    ```bash
    npx wrangler d1 create economizze-db
    ```
    
    Copia o `database_id` fornecido e atualiza o teu ficheiro `wrangler.toml` (cria-o se não existir) com a seguinte configuração:

    ```toml
    name = "economizze"
    main = "src/index.ts"
    compatibility_date = "2024-01-01"

    [[d1_databases]]
    binding = "DB" # O nome deve ser exatamente este, conforme src/types.ts
    database_name = "economizze-db"
    database_id = "<O_TEU_DATABASE_ID>"
    ```

4.  **Criar as Tabelas**

    Executa o script SQL localmente ou remotamente para criar a estrutura da base de dados:

    *Para desenvolvimento local:*
    ```bash
    npx wrangler d1 execute economizze-db --local --file=./schema.sql
    ```

    *Para produção:*
    ```bash
    npx wrangler d1 execute economizze-db --remote --file=./schema.sql
    ```

5.  **Configurar Segredos**

    O projeto utiliza uma chave secreta para assinar os tokens JWT.
    
    *Para desenvolvimento local:*
    Cria um ficheiro `.dev.vars` na raiz do projeto:
    ```env
    JWT_SECRET="o-teu-segredo-super-seguro"
    ```

    *Para produção:*
    ```bash
    npx wrangler secret put JWT_SECRET
    ```

## 🚀 Executar Localmente

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:8787`.

## ☁️ Deploy (Produção)

Para publicar a tua aplicação na rede da Cloudflare:

```bash
npm run deploy
```

## 📂 Estrutura do Projeto

* **`src/index.ts`**: Ponto de entrada da aplicação e definição de rotas principais.
* **`src/routes/`**: Controladores para cada secção (auth, dashboard, finance, challenges, profile).
* **`src/views/`**: Componentes de UI e Layouts HTML (SSR).
* **`src/middleware/`**: Middleware de autenticação (`auth.ts`).
* **`src/lib/`**: Utilitários gerais.
* **`schema.sql`**: Estrutura da base de dados.

## 📄 Licença

Este projeto está licenciado sob a licença ISC.

---

**Desenvolvido com ❤️ utilizando Cloudflare Workers.**
