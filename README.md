# Scout - Agregador de Vagas de TI

O **Scout** é um agregador e rastreador de vagas de desenvolvimento de software em tempo real. Ele coleta, normaliza e classifica oportunidades vindas de diversas fontes (Gupy, Sólides, Remotar, Jooble), eliminando duplicatas e apresentando tudo através de uma interface web dinâmica e moderna.

## Tecnologias e Estrutura do Monorepo

```text
scout-monorepo/
├── apps/
│   ├── backend/          # API REST e Scrapers (NestJS + Prisma + SQLite)
│   └── frontend/         # Interface do Usuário (Next.js + Tailwind CSS)
```

- **Backend**: NestJS (TypeScript), Prisma ORM com SQLite (para desenvolvimento local) e suporte a PostgreSQL para produção.
- **Frontend**: Next.js (App Router), React, Tailwind CSS e TypeScript.

---

## Configuração e Instalação

### Pré-requisitos
Certifique-se de ter o **pnpm** instalado globalmente:
```bash
npm install -g pnpm
```

### 1. Instalar as Dependências
Execute no diretório raiz:
```bash
pnpm install
```

### 2. Configurar o Banco de Dados e Variáveis de Ambiente
Crie um arquivo `.env` dentro de `apps/backend/` caso não exista:
```env
DATABASE_URL="file:./dev.db"
SECRET_KEY="sua_chave_secreta"
JOOBLE_API_KEY="sua_chave_do_jooble_opcional"
CRON_SECRET="token_de_seguranca_da_coleta"
PORT=3001
```

Rode as migrações do Prisma para criar o banco de dados SQLite local:
```bash
cd apps/backend
pnpm prisma migrate dev --name init
```

---

## Execução em Desenvolvimento

Para rodar ambos os projetos em paralelo, utilize os scripts definidos no workspace a partir do diretório raiz:

```bash
# Rodar o backend (porta 3001 por padrão)
pnpm dev:backend

# Rodar o frontend (porta 3000 por padrão)
pnpm dev:frontend
```

---

## Endpoints do Backend

- `GET /api/jobs`: Lista vagas com paginação e filtros (busca, empresa, tecnologias, localização, modalidade, nível, período).
- `GET /api/jobs/:id`: Obtém os detalhes de uma vaga específica.
- `POST /api/jobs`: Cadastra manualmente uma vaga.
- `POST /api/collect`: Executa a coleta incremental autenticada (requer header `Authorization: Bearer <CRON_SECRET>`).
