<div align="center">
  <img src="./apps/frontend/public/logos/logo_white.svg" alt="Scout Logo" width="240" />

# Scout — Agregador e Rastreador Inteligente de Vagas de Tecnologia

</div>

## 📌 Sumário

- [🚀 Deploy em Produção (Render)](#deploy)
- [🛠️ Stack Tecnológica](#stack)
- [🏛️ Arquitetura do Sistema e Monorepo](#arquitetura)
- [🚀 Módulos e Detalhes Técnicos](#modulos)
- [🔐 Segurança e Persistência](#seguranca)
- [🏁 Inicialização Local](#inicializacao)
- [📑 Documentação de Rotas](#documentacao)

---

O **Scout** é um agregador e rastreador de vagas de desenvolvimento de software em tempo real. Projetado sobre uma arquitetura de monorepo moderna, o sistema conecta coletores de múltiplas fontes públicas e de APIs corporativas (GitHub, Remotive, Gupy, Sólides, Remotar, Jooble), aplicando classificadores inteligentes de nível técnico e motores automáticos de extração de metadados relevantes diretamente das descrições das vagas.

O portal centraliza, limpa e apresenta todas as oportunidades em uma interface web dinâmica de alto desempenho, otimizando sua rotina de candidatura e pesquisa.

---

## <a id="deploy"></a>🚀 Deploy em Produção (Render)

O Scout está publicado e pronto para uso no ambiente de produção do Render nos seguintes links:
- **Frontend Portal**: [https://scout.guibus.dev](https://scout.guibus.dev)
- **Backend API**: [https://scoutapi.guibus.dev](https://scoutapi.guibus.dev)
- **Documentação Interativa (Scalar)**: [https://scoutapi.guibus.dev/docs](https://scoutapi.guibus.dev/docs)

> [!IMPORTANT]
> **Nota sobre Instâncias Gratuitas (Cold Start):** Como a aplicação está hospedada no plano gratuito (Free tier) do Render, as instâncias sofrem congelamento automático (spin-down) após 15 minutos de inatividade. Ao acessar a aplicação depois de um período inativa, pode haver um atraso de carregamento de cerca de 50 segundos para a máquina iniciar (Cold Start). Isso é um comportamento padrão do plano gratuito do Render.

---

## <a id="stack"></a>🛠️ Stack Tecnológica (Tecnologias Utilizadas)

<div align="center">
  <img alt="TypeScript" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Typescript.svg" title="TypeScript">
  <img alt="NodeJS" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/NodeJS.svg" title="Node.js">
  <img alt="Next.js" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/NextJS.svg" title="Next.js">
  <img alt="React" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/React.svg" title="React">
  <img alt="TailwindCSS" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/TailwindCSS.svg" title="TailwindCSS">
  <img alt="React Query" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/React%20Query.svg" title="React Query / TanStack Query">
  <img alt="Zustand" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Zustand.svg" title="Zustand">
  <img alt="Phosphor Icons" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Phosphor%20Icons.svg" title="Phosphor Icons">
  <img alt="nuqs" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/nuqs.svg" title="nuqs (Query States)">
  <img alt="Bloom UI" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/bloom.svg" title="Bloom UI">

  <img alt="NestJS" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/NestJS.svg" title="NestJS">
  <img alt="Prisma" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/PrismaORM.svg" title="Prisma ORM">
  <img alt="PostgreSQL" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/PostgreSQL.svg" title="PostgreSQL">
  <img alt="Docker" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Docker.svg" title="Docker">
  <img alt="JWT" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/JWT.svg" title="JSON Web Tokens (JWT)">
  <img alt="Axios" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Axios.svg" title="Axios">

  <img alt="pnpm" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/pnpm.svg" title="pnpm">
  <img alt="GIT" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/GIT.svg" title="Git">
  <img alt="Github" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Github.svg" title="GitHub">

  <img alt="ESLint" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/ESLint.svg" title="ESLint">
  <img alt="Prettier" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Prettier.svg" title="Prettier">
</div>

---

## <a id="arquitetura"></a>🏛️ Arquitetura do Sistema e Monorepo

O Scout é estruturado em um monorepo moderno que promove isolamento de responsabilidades entre cliente e servidor, usando indexadores de dados locais com SQLite e motores inteligentes de varredura:

```mermaid
graph TB
    %% Nodes definition
    User([Usuário / Candidato])

    subgraph FrontendApp ["Web App (Next.js - apps/frontend)"]
        Dashboard["Painel Principal (Filtros & Grid)"]
        Sidebar["Sidebar de Controle (Filtros / Recência)"]
        NuqsState["nuqs (Sincronização URL)"]
        ReactQuery["TanStack Query (Cache / Mutações)"]
    end

    subgraph BackendAPI ["API Server (NestJS - apps/backend)"]
        JobController["Job Controller (CRUD / Estados)"]
        CollectController["Collect Controller (Sincronização)"]
        JobService["Job Service (Filtros Avançados / Prisma)"]
        CollectService["Collect Service (Orquestrador Scrapers)"]
        Classifier["Job Classifier (Classificação Técnica)"]
        Extractor["Job Extractor (Regex Meta Extractor)"]
        PrismaORM["Prisma Client"]
    end

    subgraph Collectors ["Provedores de Vagas (Scrapers)"]
        GithubCollector["Github Collector (react-brasil)"]
        RemotiveCollector["Remotive Collector (Worldwide/BR)"]
        GenericScrapers["Outros Scrapers (Gupy/Solides/etc)"]
    end

    subgraph Database ["Camada de Dados"]
        PostgreSQL[(PostgreSQL)]
    end

    %% Relations
    User -->|Navegação e Filtros| Dashboard
    Dashboard -->|Filtros Laterais| Sidebar
    Sidebar -->|URL State| NuqsState
    Dashboard -->|Requests / Cache| ReactQuery

    ReactQuery -->|"API Endpoints"| JobController
    ReactQuery -->|"Trigger Sincronia"| CollectController

    JobController --> JobService
    CollectController --> CollectService

    CollectService --> GithubCollector
    CollectService --> RemotiveCollector
    CollectService --> GenericScrapers

    GithubCollector & RemotiveCollector & GenericScrapers -->|"Retorna Vacancy Raw"| CollectService
    CollectService -->|"Enriquece com Classifier/Extractor"| Classifier & Extractor
    CollectService --> PrismaORM

    JobService --> PrismaORM
    PrismaORM -->|Query / Transações| PostgreSQL
```

---

## <a id="modulos"></a>🚀 Módulos e Detalhes Técnicos

### 1. Extrator Inteligente de Metadados (`job-extractor.ts`)
- **Varredura Proximidade Regex**: Analisa a descrição da vaga em tempo real buscando informações críticas.
- **Categorização de Contratos**: Identifica se o modelo de contratação é **CLT**, **PJ**, **CLT/PJ** ou não especificado.
- **Separador Salários vs Benefícios**: Utiliza um algoritmo contextual que analisa os caracteres vizinhos do símbolo de moeda. Ele categoriza valores baixos como **VR** ou **VA** e valores adequados como **Salário**, separando e formatando tudo de forma organizada.
- **Candidatura Direta**: Localiza e-mails corporativos e formulários de candidatura ocultos no texto da vaga, transformando-os em botões de ação rápida.

### 2. Triagem e Motor de Tecnologia (Foco 200+ Stacks)
- **Extração Baseada em Dicionário**: Filtra as vagas e popula o banco de dados baseando-se em uma base rigorosa contendo mais de 200 tecnologias mapeadas (Front-end, Back-end, DevOps, Bancos de Dados, Testes e IA).
- **Classificador de Nível**: Identifica se a vaga se destina a desenvolvedores **Júnior**, **Pleno**, **Sênior** ou se não possui senioridade indicada.
- **Busca Semântica Local**: Motor de busca expansível por sinônimos estruturados para associar consultas amplas (ex: "mobile") a stacks específicas (ex: "react native", "flutter", "ios").

### 3. Integração Oficial com o Lume & Match Score
- **Upload do Currículo Lume**: O usuário pode importar o arquivo `.json` gerado pelo criador de currículos Lume diretamente pelo cabeçalho do portal.
- **Cálculo de Compatibilidade**: Algoritmo local e gratuito rodando em tempo real comparando as tecnologias exigidas na vaga com as habilidades do currículo do usuário, localização de residência (cidade/estado) e cargos anteriores para exibir uma porcentagem de compatibilidade (Match Score).
- **Persistência em Banco**: O currículo importado é armazenado em formato estruturado (`resumeJson`) no banco de dados para evitar re-uploads.
- **Filtro Avançado com Slider**: Filtre a lista de oportunidades por uma nota de corte de compatibilidade mínima usando o componente de Slider interativo do Bloom UI.

### 4. Deduplicação Inteligente (Fuzzy Matching)
- **Algoritmo de Jaccard por Palavras**: Quando novas vagas são coletadas, o backend analisa a proximidade dos termos do título das vagas pertencentes à mesma empresa.
- **Isolamento de Senioridade**: Garante que oportunidades de níveis técnicos diferentes (ex: *Júnior* vs *Sênior*) não sejam mescladas, mesmo que pertençam à mesma empresa.
- **Fusão de Links e Fontes**: Se a vaga for classificada como duplicada, o Scout consolida os dados unindo as diferentes fontes de coleta e links de candidatura no mesmo card.

### 5. Notificações Internas In-App
- **Alertas de Filtros Salvos**: O Scout monitora as 3 combinações de filtros que o usuário salvou em sua conta.
- **Disparo de Alertas**: Sempre que novos coletores rodam e importam vagas que se enquadram em algum filtro ativo do usuário, o sistema gera uma notificação interna.
- **Visualização em Tempo Real**: Menu dropdown com contagem de notificações não lidas no cabeçalho, com atalhos de navegação direta para a vaga notificada.

### 6. Exportação de Dados e Usabilidade
- **Histórico de Buscas Recentes**: Salva localmente via `localStorage` os últimos 5 termos pesquisados pelo usuário, exibindo badges práticos na barra lateral para pesquisas de um clique.
- **Exportação Client-Side**: Botão dropdown rápido para exportar instantaneamente as vagas atualmente listadas nos formatos **CSV** (otimizado para leitura com suporte UTF-8 no Microsoft Excel) ou **JSON**.

---

## <a id="seguranca"></a>🔐 Segurança e Persistência

- **Autenticação Segura**: Implementação nativa de JWT com controle de expiração em rotas do painel administrativo.
- **Paginação e URL Dinâmica**: Mapeamento completo dos filtros na barra lateral de busca através do `nuqs` (Query State), permitindo compartilhar ou recarregar links do navegador com filtros pré-selecionados exatamente no mesmo estado.
- **Toasts Informativos**: Toasts dinâmicos integrados com títulos descritivos configurados em todas as ações do usuário (salvar/des-salvar vaga ou marcar/desmarcar candidatura).

---

## <a id="inicializacao"></a>🏁 Inicialização Local (Getting Started)

### 1. Pré-requisitos
- Node.js (v20 ou superior)
- Gerenciador de pacotes **pnpm** (`npm i -g pnpm`)
- **Docker & Docker Compose** (para rodar o banco de dados PostgreSQL localmente)

### 2. Variáveis de Ambiente

Crie um arquivo `.env` em `apps/backend/` contendo:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/scout_dev"
SECRET_KEY="sua_chave_secreta"
CRON_SECRET="token_de_seguranca_da_coleta"
PORT=3001
```

### 3. Inicialização e Migrações do Banco

Execute a partir da raiz do monorepo:

```bash
# Iniciar o banco de dados PostgreSQL via Docker
docker compose up -d

# Instalar dependências
pnpm install

# Rodar migrações do banco
cd apps/backend
pnpm prisma db push

# Voltar para a raiz e iniciar servidores em paralelo
cd ../..
pnpm dev:backend
pnpm dev:frontend
```

O Frontend estará rodando em [http://localhost:3000](http://localhost:3000) e a API do Backend em [http://localhost:3001](http://localhost:3001).

---

## <a id="documentacao"></a>📑 Documentação de Rotas (API REST)

- `GET /api/jobs`: Lista vagas paginadas com filtros (`busca`, `company`, `technology`, `location`, `modality`, `level`, `period`, `source`, `contractType`).
- `GET /api/jobs/:id`: Obtém detalhes de uma vaga específica.
- `POST /api/jobs`: Cadastro manual de vaga.
- `POST /api/collect`: Executa a rotina incremental de coleta.
- `POST /api/jobs/:id/state`: Altera estados de favoritos ou candidatura do usuário.

